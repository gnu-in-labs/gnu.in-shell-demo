/* global React, GnosisMascot, Fade, ScalePop, IdleBreathe, Pulse, Collapse, Sym, Spinner, SystemChip, FeedLine, ToastCard, StatusDot, SentinelPill, SentinelReactor, SENTINEL_TIERS, VRAM_TOTAL, tierVram, vramState, AgentBus, AGENTS_SEED, GRANT_DEFS, GnuContextMenu, buildWindowMenu, buildOrbMenu, buildResourceMenu, GnomonTimeline, buildMemoryMenu, GNOMON_SEED, GN_KINDS, MDUR */
// ============================================================================
// gnosis/hud.jsx — the Gnosis Sentinel HUD.
// A floating adaptive membrane: telemetry bar + a tabbed console
// (TIMELINE · SENTINEL · AGENTS). The Sentinel grades analysis power across
// five rungs; cloud agents reach it over the gnu6 bus and can drive escalation.
// CHROME is fully dynamic (M3 role tokens). IDENTITY (the cube + its state
// ornaments) is constant brand orange. Motion runs on the canonical MDUR/MEASE
// tokens. Right-click = a gnosis "contract" menu.
// ============================================================================
const { useState, useEffect, useRef, useCallback } = React;

const STATE_COLOR = {
  idle: "var(--col-subtext)",
  listening: "var(--m3-primary)",
  transmit: "var(--m3-primary)",
  veille: "var(--col-subtext)",
};
const STATE_LABEL = { idle: "IDLE", listening: "LISTENING", transmit: "TRANSMIT", veille: "VEILLE" };

// ---- ambient content pools -------------------------------------------------
const APPS = [
  { app: "Kitty", role: "terminal", box: [1124, 742] },
  { app: "Firefox", role: "browser", box: [1680, 988] },
  { app: "Code", role: "editor", box: [1440, 900] },
  { app: "Spotify", role: "media", box: [428, 96] },
  { app: "Hyprland", role: "compositor", box: [2560, 1440] },
];
const VOICE_LINES = [
  "open the gnosis logs from this morning",
  "why did the build fail at 09:14",
  "mute spotify, focus mode on",
  "summarise what i did the last hour",
  "switch to the firefox window",
  "what's eating my cpu right now",
];
const AGENT_LINES = [
  "Commande reçue. reading ~/.cache/gnosis/build.log",
  "context loaded · 3 events matched",
  "build broke at clang step — exit 1. want the diff?",
  "timeline ready · 142 events indexed",
  "focus mode on · spotify muted",
];
const FOCUS_LINES = [
  "cursor idle 4.2s", "selection · 312 chars", "scroll ↓ 2400px",
  "window resize", "clipboard · 1 item", "keypress burst · 84 wpm",
];
const TOASTS = [
  { tone: "info", title: "Timeline rebuilt", body: "142 events · last 60 min · 3 apps", label: "AUDIT" },
  { tone: "success", title: "gnosis-engine synced", body: "local model warm · 4.2 tok/ms", label: "STABLE" },
  { tone: "warn", title: "CPU pressure 78%", body: "3 heavy procs: clang · node · chrome", label: "STRESS" },
  { tone: "danger", title: "build.log · 2 errors", body: "clang exit 1 at link step", label: "BREACH" },
];
// agent calls onto the gnu6 bus — fn is HTML (accent-spanned verbs)
const BUS_FNS = [
  { agent: "claude", fn: `screen.<span class="accent">scan</span>(firefox)` },
  { agent: "claude", fn: `timeline.<span class="accent">read</span>(60m)` },
  { agent: "claude", fn: `files.<span class="accent">read</span>(~/.cache/gnosis/build.log)` },
  { agent: "studio", fn: `screen.<span class="accent">frame</span>(active)` },
  { agent: "claude", fn: `voice.<span class="accent">transcribe</span>(stream)` },
];

let _uid = 0;
const uid = () => `e${++_uid}`;
let _cid = 0;
const cuid = () => `c${++_cid}`;
const clock = () =>
  [new Date().getHours(), new Date().getMinutes(), new Date().getSeconds()]
    .map((n) => String(n).padStart(2, "0")).join(":");
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const TIER_NAMES = SENTINEL_TIERS.map((t) => t.name);

const ribbonColor = (e) =>
  e.type === "toast"
    ? { info: "var(--m3-primary)", success: "var(--state-ok)", warn: "var(--state-warn)", danger: "var(--state-alert)" }[e.tone] || "var(--m3-primary)"
    : e.kind === "voice" ? "var(--m3-primary)"
    : e.kind === "sys" ? "var(--col-on-layer1)"
    : "var(--col-subtext)";

// ---- Waveform --------------------------------------------------------------
function Waveform() {
  return (
    <div className="waveform" aria-hidden="true">
      {Array.from({ length: 28 }).map((_, i) => (
        <span key={i} className="waveform__bar" style={{ animationDelay: `${(i % 7) * 90}ms` }} />
      ))}
    </div>
  );
}

// ---- TimelineRibbon --------------------------------------------------------
function TimelineRibbon({ events }) {
  const ticks = events.slice(-52);
  return (
    <div className="ribbon" title="session timeline · recent events">
      {ticks.map((e) => (
        <span key={e.id} className={`ribbon__tick${e.type === "toast" ? " is-toast" : ""}`} style={{ background: ribbonColor(e) }} />
      ))}
      <span className="ribbon__now" />
    </div>
  );
}

// ---- TimelineView ----------------------------------------------------------
function TimelineView({ feed, feedRef, recording, dense }) {
  return (
    <div className="timeline-view">
      <TimelineRibbon events={feed} />
      {recording && (<div className="feed__wave"><Waveform /><span className="feed__wave-label">listening…</span></div>)}
      <div className="feed__scroll" ref={feedRef}>
        {feed.map((e) => (e.type === "toast" ? <ToastCard key={e.id} entry={e} /> : <FeedLine key={e.id} entry={e} dense={dense} />))}
      </div>
    </div>
  );
}

// ---- ConsoleTab ------------------------------------------------------------
function ConsoleTab({ id, label, active, badge, onClick }) {
  return (
    <button type="button" className={`console-tab${active ? " is-active" : ""}`} onClick={onClick} aria-pressed={active}>
      <span className="console-tab__dot" />
      <span>{label}</span>
      {badge != null && Number(badge) > 0 && <span className="console-tab__badge num">{badge}</span>}
    </button>
  );
}

// ---- ContractMenu → moved to gnosis/ctxmenu.jsx (GnuContextMenu primitive) --

function GnosisHUD({ t, setTweak }) {
  const [closed, setClosed] = useState(false);
  const [agentState, setAgentState] = useState(t.agentState);
  const [feedOpen, setFeedOpen] = useState(false);
  const [tab, setTab] = useState("timeline");
  const [scanning, setScanning] = useState(false);
  const [recording, setRecording] = useState(false);
  const [muted, setMuted] = useState(false);
  const [unseen, setUnseen] = useState(0);
  const [unseenCalls, setUnseenCalls] = useState(0);
  const [focus, setFocus] = useState(APPS[0]);
  const [cursor, setCursor] = useState({ x: 1284, y: 612, v: 0 });
  const [menu, setMenu] = useState(null); // { kind, x, y, memId? }
  const [profile, setProfile] = useState("profile.competitor");
  const [vision, setVision] = useState("manual");
  const [memories, setMemories] = useState(GNOMON_SEED);
  const [gnFilter, setGnFilter] = useState("all");
  const [unseenMem, setUnseenMem] = useState(0);

  // ---- sentinel + agents state ----
  const tierFromTweak = Math.max(0, TIER_NAMES.indexOf(t.tier));
  const [tierIdx, setTierIdx] = useState(tierFromTweak < 0 ? 2 : tierFromTweak);
  const [ramping, setRamping] = useState(false);
  const [agents, setAgents] = useState(AGENTS_SEED);
  const [calls, setCalls] = useState([
    { id: cuid(), ts: clock(), agent: "claude", fn: `bus.<span class="accent">attach</span>(gnu6)`, deny: false },
  ]);

  const [feed, setFeed] = useState([
    { id: uid(), type: "toast", tone: "success", title: "gnosis-engine online", body: "sentinel watching · L2 analyst warm", label: "STABLE", ts: clock() },
    { id: uid(), type: "line", kind: "sys", ts: clock(), text: "session attached · pid 4412" },
  ]);

  const feedRef = useRef(null);
  const busRef = useRef(null);
  const memUidRef = useRef(0);
  const timers = useRef([]);
  const stateResetRef = useRef(null);
  const rampRef = useRef(null);
  const restingRef = useRef(t.agentState);
  const tierRef = useRef(tierIdx);
  const tabRef = useRef(tab);
  const openRef = useRef(feedOpen);
  tabRef.current = tab; openRef.current = feedOpen;

  useEffect(() => { setAgentState(t.agentState); restingRef.current = t.agentState; }, [t.agentState]);

  const tracking = recording || scanning || agentState === "listening" || agentState === "transmit";
  const dense = t.density === "compact";
  const auto = !!t.autoEscalate;
  const showAgents = t.agentBus !== false;

  // ---- feed plumbing -------------------------------------------------------
  const pushEntry = useCallback((entry, { open = false } = {}) => {
    const e = { id: uid(), ts: clock(), ...entry };
    setFeed((f) => [...f.slice(-48), e]);
    if (open) { setFeedOpen(true); setTab("timeline"); }
    else if (!openRef.current || tabRef.current !== "timeline") setUnseen((u) => Math.min(99, u + 1));
    return e.id;
  }, []);

  const pushCall = useCallback((agent, fn, { deny = false } = {}) => {
    setCalls((cs) => [...cs.slice(-40), { id: cuid(), ts: clock(), agent, fn, deny }]);
    if (!openRef.current || tabRef.current !== "agents") setUnseenCalls((u) => Math.min(99, u + 1));
  }, []);

  // ---- gnomon: write a causal memory ----
  const pushMemory = useCallback((mem) => {
    const e = { id: `m${++memUidRef.current}`, ts: clock(), tags: [], ...mem };
    setMemories((ms) => [e, ...ms].slice(0, 40));
    if (!openRef.current || tabRef.current !== "gnomon") setUnseenMem((u) => Math.min(99, u + 1));
  }, []);

  useEffect(() => { const el = feedRef.current; if (el && feedOpen && tab === "timeline") el.scrollTop = el.scrollHeight; }, [feed, feedOpen, tab, recording]);
  useEffect(() => { const el = busRef.current; if (el && feedOpen && tab === "agents") el.scrollTop = el.scrollHeight; }, [calls, feedOpen, tab]);

  const flashState = useCallback((s, ms = 2200) => {
    if (stateResetRef.current) clearTimeout(stateResetRef.current);
    setAgentState(s);
    stateResetRef.current = setTimeout(() => setAgentState(restingRef.current), ms);
  }, []);

  // ---- sentinel: graduate analysis power ----------------------------------
  const setTier = useCallback((next, { agent = null } = {}) => {
    next = Math.max(0, Math.min(SENTINEL_TIERS.length - 1, next));
    const prev = tierRef.current;
    if (next === prev) return;
    tierRef.current = next;
    setTierIdx(next);
    setRamping(true);
    if (rampRef.current) clearTimeout(rampRef.current);
    rampRef.current = setTimeout(() => setRamping(false), MDUR.pulse);
    const to = SENTINEL_TIERS[next];
    const up = next > prev;
    pushEntry({ type: "line", kind: "sys", text: `sentinel ${up ? "▲ escalate" : "▼ settle"} → ${to.code} ${to.name} · ${to.model}` });
    if (next === 0) { restingRef.current = "veille"; setAgentState("veille"); }
    else if (prev === 0) { restingRef.current = "idle"; setAgentState("idle"); }
    if (agent) pushCall(agent, `sentinel.<span class="accent">escalate</span>(${to.code})`);
  }, [pushEntry, pushCall]);

  // user picked a rung in the reactor → pin (auto off) + ramp
  const onPickTier = useCallback((i) => {
    if (auto) setTweak("autoEscalate", false);
    setTweak("tier", SENTINEL_TIERS[i].name);
    setTier(i);
  }, [auto, setTier, setTweak]);

  // keep local tier in sync when the pinned-tier tweak changes
  useEffect(() => {
    const idx = TIER_NAMES.indexOf(t.tier);
    if (idx >= 0 && idx !== tierRef.current) setTier(idx);
  }, [t.tier]); // eslint-disable-line

  const toggleGrant = useCallback((agentId, key) => {
    setAgents((as) => as.map((a) => (a.id === agentId ? { ...a, grants: { ...a.grants, [key]: a.grants[key] ? 0 : 1 } } : a)));
  }, []);

  // ---- actions -------------------------------------------------------------
  const openSentinel = useCallback(() => {
    setFeedOpen(true); setTab("sentinel");
  }, []);

  const onScan = useCallback(() => {
    if (scanning) return;
    setScanning(true);
    flashState("transmit", 2600);
    if (auto && tierRef.current < 2) setTier(2);
    pushEntry({ type: "line", kind: "focus", text: `vision scan → ${focus.app} viewport` }, { open: true });
    const a = setTimeout(() => {
      pushEntry({ type: "toast", tone: "info", title: "Frame parsed", body: `${focus.app} · ${focus.box[0]}×${focus.box[1]} · 6 regions · 2 actionable`, label: "VISION" }, { open: true });
      setScanning(false);
    }, 2400);
    timers.current.push(a);
  }, [scanning, focus, flashState, pushEntry, auto, setTier]);

  const startRec = useCallback(() => {
    if (recording || muted) return;
    setRecording(true); setFeedOpen(true); setTab("timeline");
    flashState("listening", 600000);
  }, [recording, muted, flashState]);

  const stopRec = useCallback(() => {
    if (!recording) return;
    setRecording(false);
    pushEntry({ type: "line", kind: "voice", speaker: "you", text: pick(VOICE_LINES) }, { open: true });
    const a = setTimeout(() => {
      flashState("transmit", 2400);
      pushEntry({ type: "line", kind: "voice", speaker: "sys.ter", text: pick(AGENT_LINES) }, { open: true });
    }, 520);
    timers.current.push(a);
  }, [recording, flashState, pushEntry]);

  const onAudit = useCallback(() => {
    flashState("transmit", 2600);
    pushEntry({ type: "line", kind: "sys", text: "audit · summarising 60 min of session" }, { open: true });
    const a = setTimeout(() => {
      pushEntry({ type: "toast", tone: "info", title: "Timeline rebuilt", body: "142 events · 3 apps · 1 stall at 09:14", label: "AUDIT" }, { open: true });
      pushMemory({ kind: "summary", title: "Session summary · 60 min", app: focus.app, cause: "audit · timeline", tags: [{ type: "transcript" }] });
    }, 900);
    timers.current.push(a);
  }, [flashState, pushEntry, pushMemory, focus]);

  const onLog = useCallback(() => {
    setFeedOpen((o) => {
      const next = !o;
      if (next) { if (tabRef.current === "timeline") setUnseen(0); else if (tabRef.current === "agents") setUnseenCalls(0); else if (tabRef.current === "gnomon") setUnseenMem(0); }
      return next;
    });
  }, []);

  const selectTab = useCallback((id) => {
    setTab(id);
    if (id === "timeline") setUnseen(0);
    else if (id === "agents") setUnseenCalls(0);
    else if (id === "gnomon") setUnseenMem(0);
  }, []);

  // ---- contextual-menu actions (GnuContextMenu) ---------------------------
  const onAction = useCallback((id, item, memId) => {
    if (id.startsWith("profile.")) {
      setProfile(id);
      const lvl = { "profile.dev": 3, "profile.competitor": 2, "profile.gaming": 1, "profile.full_burn": 3 }[id] ?? 2;
      setTier(lvl);
      if (id === "profile.gaming") pushEntry({ type: "line", kind: "sys", text: "game guard armed · heavy actions paused" }, { open: true });
      else pushEntry({ type: "line", kind: "sys", text: `profile → ${item?.label || id}` });
      return;
    }
    switch (id) {
      case "win.summarize": onAudit(); break;
      case "win.capture":
        pushEntry({ type: "toast", tone: "success", title: "Captured to Gnomon", body: `${focus.app} · screenshot + transcript`, label: "MEMORY" }, { open: true });
        pushMemory({ kind: "capture", title: `${focus.app} · window capture`, app: focus.app, cause: `capture · ${focus.app}`, tags: [{ type: "screenshot" }, { type: "transcript" }] });
        break;
      case "win.ctx.card":
        pushEntry({ type: "line", kind: "sys", text: "competitor card created" }, { open: true });
        pushMemory({ kind: "card", title: `${focus.app} · competitor card`, app: focus.app, cause: "extract · pricing", tags: [{ type: "competitor", label: focus.app === "Firefox" ? "Acme" : "entity" }] });
        break;
      case "win.ctx.diff":
        pushEntry({ type: "line", kind: "sys", text: "diff captured" }, { open: true });
        pushMemory({ kind: "capture", title: `${focus.app} · diff capture`, app: focus.app, cause: "capture · diff", tags: [{ type: "transcript" }] });
        break;
      case "win.feedback": flashState("transmit", 2000); pushEntry({ type: "line", kind: "voice", speaker: "sys.ter", text: "feedback ready · 2 notes on this window" }, { open: true }); break;
      case "res.eco": setTier(1); break;
      case "res.full_burn": setTier(3); pushEntry({ type: "line", kind: "sys", text: "full burn · 30 min · full VRAM reserved" }, { open: true }); break;
      case "res.unload_all": case "orb.unload": setTier(0); pushEntry({ type: "line", kind: "sys", text: "models unloaded · VRAM freed" }, { open: true }); break;
      case "res.gameguard": pushEntry({ type: "line", kind: "sys", text: `game guard · ${focus.app} added` }, { open: true }); break;
      case "orb.ptt": pushEntry({ type: "line", kind: "sys", text: "push-to-talk armed" }, { open: true }); break;
      case "orb.vision": onScan(); break;
      case "orb.cockpit": openSentinel(); break;
      case "privacy.mic": setMuted((m) => { const n = !m; pushEntry({ type: "line", kind: "sys", text: n ? "mic off · session muted" : "mic live" }); return n; }); break;
      case "privacy.vision": setVision((v) => (v === "manual" ? "auto" : v === "auto" ? "off" : "manual")); break;
      // ---- Gnomon · Session/Memory menu ----
      case "mem.link_project": setMemories((ms) => ms.map((m) => (m.id === memId ? { ...m, tags: [...(m.tags || []), { type: "project", label: "gnu.in-os" }] } : m))); pushEntry({ type: "line", kind: "sys", text: "memory linked → project gnu.in-os" }); break;
      case "mem.link_competitor": setMemories((ms) => ms.map((m) => (m.id === memId ? { ...m, tags: [...(m.tags || []), { type: "competitor", label: "Acme" }] } : m))); pushEntry({ type: "line", kind: "sys", text: "memory linked → competitor Acme" }); break;
      case "mem.export": pushEntry({ type: "line", kind: "sys", text: "memory exported · ~/gnomon/export.json" }, { open: true }); break;
      case "mem.transcript": pushEntry({ type: "line", kind: "sys", text: "transcript saved" }); break;
      case "mem.delete": setMemories((ms) => ms.filter((m) => m.id !== memId)); pushEntry({ type: "line", kind: "sys", text: "memory deleted" }); break;
      default:
        if (id.startsWith("suggest.")) { flashState("transmit", 2000); pushEntry({ type: "line", kind: "voice", speaker: "sys.ter", text: "gnosis ▸ " + String(item?.label || "").replace(/<[^>]+>/g, "") }, { open: true }); }
        else if (id.startsWith("res.model.")) pushEntry({ type: "line", kind: "sys", text: `unloaded ${item?.label || "model"}` }, { open: true });
        else pushEntry({ type: "line", kind: "sys", text: `› ${item?.label || id}` }, { open: true });
    }
  }, [onAudit, onScan, openSentinel, flashState, pushEntry, pushMemory, setTier, focus]);

  // ---- live demo loop: cursor drift ---------------------------------------
  useEffect(() => {
    if (!t.demoLoop && agentState === "veille") return;
    const id = setInterval(() => {
      setCursor((c) => {
        const dx = Math.round((Math.random() - 0.5) * 90), dy = Math.round((Math.random() - 0.5) * 60);
        return { x: Math.max(0, Math.min(2559, c.x + dx)), y: Math.max(0, Math.min(1439, c.y + dy)), v: Math.round(Math.hypot(dx, dy) * 5) };
      });
    }, 600);
    return () => clearInterval(id);
  }, [t.demoLoop, agentState]);

  // ---- live demo loop: session events + auto-escalation -------------------
  useEffect(() => {
    if (!t.demoLoop) return;
    let alive = true;
    const schedule = () => {
      const id = setTimeout(() => {
        if (!alive) return;
        const roll = Math.random();
        if (roll < 0.4) { const next = pick(APPS); setFocus(next); pushEntry({ type: "line", kind: "focus", text: `focus → ${next.app}` }); }
        else if (roll < 0.68) pushEntry({ type: "line", kind: "focus", text: pick(FOCUS_LINES) });
        else if (roll < 0.82 && !muted) {
          pushEntry({ type: "line", kind: "voice", speaker: "you", text: pick(VOICE_LINES) });
          const r = setTimeout(() => pushEntry({ type: "line", kind: "voice", speaker: "sys.ter", text: pick(AGENT_LINES) }), 900);
          timers.current.push(r);
        } else {
          const tt = pick(TOASTS);
          pushEntry({ type: "toast", ...tt, ts: clock() }, { open: tt.tone === "danger" });
          if (auto) { if (tt.tone === "danger") setTier(3); else if (tt.tone === "warn") setTier(Math.max(tierRef.current, 2)); }
        }
        schedule();
      }, 3200 + Math.random() * 3600);
      timers.current.push(id);
    };
    schedule();
    return () => { alive = false; };
  }, [t.demoLoop, muted, pushEntry, auto, setTier]);

  // ---- live demo loop: cloud agent bus traffic ----------------------------
  useEffect(() => {
    if (!t.demoLoop || !showAgents) return;
    let alive = true;
    const schedule = () => {
      const id = setTimeout(() => {
        if (!alive) return;
        const roll = Math.random();
        if (roll < 0.22) {
          // agent requests escalation → drives the reactor for real
          if (auto && tierRef.current < 3) setTier(tierRef.current + 1, { agent: "claude" });
          else pushCall("claude", `sentinel.<span class="accent">hold</span>(${SENTINEL_TIERS[tierRef.current].code})`);
        } else if (roll < 0.34) {
          // a denied capability — studio has no shell grant
          const denied = agents.find((a) => a.id === "studio" && !a.grants.shell);
          if (denied) pushCall("studio", `shell.<span class="accent">exec</span> · denied`, { deny: true });
          else pushCall(pick(BUS_FNS).agent, pick(BUS_FNS).fn);
        } else {
          const c = pick(BUS_FNS);
          pushCall(c.agent, c.fn);
        }
        schedule();
      }, 2600 + Math.random() * 3200);
      timers.current.push(id);
    };
    schedule();
    return () => { alive = false; };
  }, [t.demoLoop, showAgents, auto, pushCall, setTier, agents]);

  // ---- occasional settle-down when auto + calm ----------------------------
  useEffect(() => {
    if (!t.demoLoop || !auto) return;
    const id = setInterval(() => {
      if (!recording && !scanning && tierRef.current > 1) setTier(tierRef.current - 1);
    }, 14000);
    return () => clearInterval(id);
  }, [t.demoLoop, auto, recording, scanning, setTier]);

  useEffect(() => () => { timers.current.forEach(clearTimeout); if (stateResetRef.current) clearTimeout(stateResetRef.current); if (rampRef.current) clearTimeout(rampRef.current); }, []);

  // ---- membrane geometry ---------------------------------------------------
  const effRadius = Math.round(t.radius + t.smooth * 12);
  const membraneStyle = { "--membrane-radius": `${effRadius}px`, "--membrane-smooth": t.smooth, maxWidth: 720 };
  const panelH = tab === "agents" || tab === "gnomon" ? 322 : tab === "sentinel" ? 280 : 236;
  const gstate = scanning ? "seeing" : agentState === "transmit" ? "thinking" : agentState === "listening" ? "listening" : agentState === "veille" ? "dormant" : "armed";

  if (closed) {
    return (
      <div className="restore-dock">
        <ScalePop origin="bottom right">
          <button type="button" className="restore-chip" onClick={() => setClosed(false)} title="Relaunch Gnosis">
            <GnosisMascot size={26} state="idle" />
            <span className="restore-chip__label">gnosis</span>
            <span className="restore-chip__prompt">&gt;_</span>
          </button>
        </ScalePop>
      </div>
    );
  }

  return (
    <>
      <ScalePop origin="top center">
        <div
          className={`membrane density-${t.density}${tracking ? " is-tracking" : ""}`}
          style={membraneStyle}
          data-screen-label="Gnosis Sentinel HUD"
          onContextMenu={(e) => { e.preventDefault(); setMenu({ kind: "window", x: e.clientX, y: e.clientY }); }}
        >
          <div className="membrane__accent" style={{ opacity: tracking ? 0.85 : 0.22 }} />

          {/* ============ BAR ============ */}
          <div className="bar">
            <div className="bar__mascot" onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setMenu({ kind: "orb", x: e.clientX, y: e.clientY }); }}>
              <IdleBreathe active={agentState === "listening" || scanning}>
                <GnosisMascot size={28} state={agentState} />
              </IdleBreathe>
              <StatusDot color={STATE_COLOR[agentState]} size={8} pulsing={tracking} />
            </div>

            <div className="bar__focus">
              <div className="focus-tag">
                <span className="focus-tag__id">{focus.app}</span>
                <span className="focus-tag__state" style={{ color: STATE_COLOR[agentState] }}>{STATE_LABEL[agentState]}</span>
                {muted && <span className="focus-tag__muted"><Sym size={12} fill={1}>mic_off</Sym></span>}
              </div>
              <div className="focus-telem">
                <span><b>cur</b> {cursor.x},{cursor.y}</span>
                <span className="sep">·</span>
                <span>{focus.box[0]}×{focus.box[1]}</span>
              </div>
            </div>

            <span onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setMenu({ kind: "resource", x: e.clientX, y: e.clientY }); }} style={{ display: "inline-flex" }}>
              <SentinelPill tierIdx={tierIdx} open={feedOpen && tab === "sentinel"} ramping={ramping} onClick={openSentinel} />
            </span>

            <div className="bar__chips">
              <SystemChip glyph="center_focus_strong" label="SCAN" active={scanning} busy={scanning} onClick={onScan} title="Vision scan of active window" />
              <SystemChip glyph="mic" label="VOICE" active={recording} recDot={recording} onPointerDown={startRec} onPointerUp={stopRec} onPointerLeave={() => recording && stopRec()} title="Push-to-talk · hold" />
              <SystemChip glyph="summarize" label="AUDIT" onClick={onAudit} title="Summarise session logs" />
              <SystemChip glyph="format_list_bulleted" label="LOG" active={feedOpen} badge={unseen + unseenMem + (showAgents ? unseenCalls : 0)} onClick={onLog} title="Toggle console" />
            </div>

            <button type="button" className="bar__close" onClick={() => setClosed(true)} title="Dismiss" aria-label="Dismiss">
              <Sym size={18}>close</Sym>
            </button>
          </div>

          {/* ============ CONSOLE PANEL ============ */}
          <Collapse open={feedOpen} maxHeight={panelH}>
            <div className="feed is-console">
              <div className="console-head">
                <div className="console-tabs">
                  <ConsoleTab id="timeline" label="TIMELINE" active={tab === "timeline"} badge={unseen} onClick={() => selectTab("timeline")} />
                  <ConsoleTab id="sentinel" label="SENTINEL" active={tab === "sentinel"} onClick={() => selectTab("sentinel")} />
                  {showAgents && <ConsoleTab id="agents" label="AGENTS" active={tab === "agents"} badge={unseenCalls} onClick={() => selectTab("agents")} />}
                  <ConsoleTab id="gnomon" label="GNOMON" active={tab === "gnomon"} badge={unseenMem} onClick={() => selectTab("gnomon")} />
                </div>
                {recording
                  ? (<span className="feed__rec"><StatusDot color="var(--state-alert)" size={7} pulsing />REC</span>)
                  : (<span className="feed__meta">gnosis-engine</span>)}
              </div>

              <div className="console-body" key={tab}>
                {tab === "timeline" && <TimelineView feed={feed} feedRef={feedRef} recording={recording} dense={dense} />}
                {tab === "sentinel" && <SentinelReactor tierIdx={tierIdx} setTierIdx={onPickTier} auto={auto} setAuto={(v) => setTweak("autoEscalate", v)} ramping={ramping} dense={dense} />}
                {tab === "agents" && showAgents && <AgentBus agents={agents} calls={calls} onToggleGrant={toggleGrant} busRef={busRef} />}
                {tab === "gnomon" && <GnomonTimeline memories={memories} filter={gnFilter} setFilter={setGnFilter} onCardMenu={(id, e) => setMenu({ kind: "memory", memId: id, x: e.clientX, y: e.clientY })} />}
              </div>
            </div>
          </Collapse>
        </div>
      </ScalePop>

      {menu && (() => {
        if (menu.kind === "memory") {
          const mem = memories.find((m) => m.id === menu.memId);
          if (!mem) return null;
          return <GnuContextMenu menu={{ x: menu.x, y: menu.y, spec: buildMemoryMenu(mem) }} onAction={(id, it) => onAction(id, it, menu.memId)} onClose={() => setMenu(null)} />;
        }
        const tierObj = SENTINEL_TIERS[tierIdx];
        const used = tierVram(tierObj);
        const ctx = { focus, tier: tierObj, used, vstate: vramState(used), muted, vision, gstate, profile };
        const spec = menu.kind === "orb" ? buildOrbMenu(ctx) : menu.kind === "resource" ? buildResourceMenu(ctx) : buildWindowMenu(ctx);
        return <GnuContextMenu menu={{ x: menu.x, y: menu.y, spec }} onAction={onAction} onClose={() => setMenu(null)} />;
      })()}
    </>
  );
}

window.GnosisHUD = GnosisHUD;
