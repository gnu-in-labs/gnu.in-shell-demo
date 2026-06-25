/* global React, GnosisMascot, IdleBreathe, ScalePop, Collapse, Sym, Spinner, SystemChip, FeedLine, ToastCard, StatusDot, FirefoxWindow, KittyWindow, CodeWindow, Perimeter, LassoLayer, RegionMark, PointMark, AnnoBox, Callout, GhostCursor, WatcherChip, IntentComposer, PlanCard, MDUR */
// ============================================================================
// gnosis/live-session.jsx — the GNOSIS LIVE session engine.
// The interaction inversion: no query box. You GO LIVE (the agent visibly
// attaches to the screen), then you point at reality — drag scopes a region,
// click points at a thing, hold SPACE talks over it. The engine composes
// {scope + point + speech} into an intent, guesses the verb, and either you
// release it (enter / let the countdown run) or steer it (click a verb).
// Risky work routes through a PLAN CONTRACT: explicit cursor grant, visible
// ghost cursor, revoke on esc / mouse movement / grant expiry.
// ============================================================================
const { useState, useEffect, useRef, useCallback } = React;

const LV_STATE_COLOR = {
  idle: "var(--col-subtext)",
  listening: "var(--m3-primary)",
  transmit: "var(--m3-primary)",
  veille: "var(--col-subtext)",
};
const LV_STATE_LABEL = { idle: "ARMED", listening: "LISTENING", transmit: "TRANSMIT", veille: "VEILLE" };

const VERBS = {
  extract: { id: "extract", glyph: "table_chart", label: "EXTRACT" },
  explain: { id: "explain", glyph: "psychology", label: "EXPLAIN" },
  watch: { id: "watch", glyph: "visibility", label: "WATCH" },
  fix: { id: "fix", glyph: "build", label: "FIX" },
};

const FIX_STEPS = [
  { id: "s1", label: "read ~/.cache/gnosis/build.log", risk: "safe", needsCursor: false },
  { id: "s2", label: "patch flags.cmake · +1 −1", risk: "system", needsCursor: true },
  { id: "s3", label: "rerun ninja -C build", risk: "local", needsCursor: true },
];

const CALLOUTS = {
  "term-error": {
    title: "link failure · 09:14",
    lines: [
      "ld can't find SSL_CTX_new — the engine never links libssl.",
      "cause ▸ acme v0.4.2 moved TLS to OpenSSL · flags.cmake:18 still links crypto only.",
      "timeline · first failed run 09:14 · 4 retries since.",
    ],
    actions: [
      { id: "fix", label: "fix it", glyph: "build", primary: true },
      { id: "dismiss", label: "dismiss" },
    ],
  },
  pricing: {
    title: "acme.dev · pricing",
    lines: [
      "three plans · 19 / 49 / 149 monthly.",
      "pro quota doubled to 250k req/day since your may capture.",
      "scale adds SSO + SLA 99.95 · enterprise gate removed.",
    ],
    actions: [
      { id: "extract", label: "capture grid", glyph: "table_chart", primary: true },
      { id: "watch", label: "watch", glyph: "visibility" },
    ],
  },
  screen: {
    title: "this screen",
    lines: [
      "firefox on acme pricing · kitty holding a failed build.",
      "the two are related — the failure traces to acme's v0.4.2 TLS change.",
    ],
    actions: [{ id: "dismiss", label: "dismiss" }],
  },
};

let _lvuid = 0;
const lvuid = () => `lv${++_lvuid}`;
const lvclock = () =>
  [new Date().getHours(), new Date().getMinutes(), new Date().getSeconds()]
    .map((n) => String(n).padStart(2, "0")).join(":");
const fmtT = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
const rectOf = (sel) => {
  const el = document.querySelector(sel);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: r.left, y: r.top, w: r.width, h: r.height };
};
const intersect = (a, b) => {
  const x = Math.max(a.x, b.x), y = Math.max(a.y, b.y);
  const x2 = Math.min(a.x + a.w, b.x + b.w), y2 = Math.min(a.y + a.h, b.y + b.h);
  return Math.max(0, x2 - x) * Math.max(0, y2 - y);
};

// describe a lassoed rect: which window, which dominant labeled thing
function describeRegion(r) {
  let winId = null, winTitle = null, best = 0;
  document.querySelectorAll("[data-win]").forEach((w) => {
    const b = w.getBoundingClientRect();
    const a = intersect(r, { x: b.left, y: b.top, w: b.width, h: b.height });
    if (a > best) { best = a; winId = w.getAttribute("data-win"); winTitle = w.getAttribute("data-win-title"); }
  });
  let label = winTitle ? winTitle.split("·")[0].trim().toLowerCase() : "desktop";
  let bestT = 0;
  document.querySelectorAll("[data-gx]").forEach((el) => {
    const b = el.getBoundingClientRect();
    const tr = { x: b.left, y: b.top, w: b.width, h: b.height };
    const a = intersect(r, tr);
    if (a > bestT && a > 0.5 * tr.w * tr.h) { bestT = a; label = `${winId || "desktop"} › ${el.getAttribute("data-gx-label")}`; }
  });
  return { ...r, winId, winTitle, label };
}

function pickVoice(ctx) {
  if (ctx.point && ctx.point.id === "term-error") return { text: "why did the build fail — fix it", verb: "fix" };
  if (ctx.point && ctx.point.id.startsWith("price")) return { text: "watch this price for changes", verb: "watch" };
  if (ctx.region && ctx.region.winId === "kitty") return { text: "what went wrong here", verb: "explain" };
  if (ctx.region) return { text: "grab this for the competitor file", verb: "extract" };
  if (ctx.point) return { text: "explain what i'm pointing at", verb: "explain" };
  return { text: "summarise this screen", verb: "explain" };
}

function verbsFor(ctx) {
  if (ctx.point && ctx.point.id === "term-error") return [VERBS.fix, VERBS.explain, VERBS.watch];
  if (ctx.point && ctx.point.id.startsWith("price")) return [VERBS.watch, VERBS.extract, VERBS.explain];
  if (ctx.region && ctx.region.winId === "kitty") return [VERBS.explain, VERBS.fix, VERBS.watch];
  if (ctx.region || ctx.point) return [VERBS.extract, VERBS.explain, VERBS.watch];
  return [VERBS.explain, VERBS.watch];
}

// ============================================================================
function GnosisLive({ t, setTweak }) {
  const [live, setLive] = useState(false);
  const [engaging, setEngaging] = useState(false);
  const [agentState, setAgentState] = useState("veille");
  const [elapsed, setElapsed] = useState(0);
  const [railOpen, setRailOpen] = useState(true);
  const [unseen, setUnseen] = useState(0);
  const [feed, setFeed] = useState([
    { id: lvuid(), type: "toast", tone: "success", title: "gnosis-engine online", body: "sentinel warm · screen NOT shared", label: "STABLE", ts: lvclock() },
  ]);
  const [memCount, setMemCount] = useState(0);
  const [intents, setIntents] = useState(0);
  const [ctx, setCtx] = useState({ region: null, point: null, voice: null });
  const [listening, setListening] = useState(false);
  const [guess, setGuess] = useState(null);
  const [guessSrc, setGuessSrc] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [job, setJob] = useState(null);
  const [annos, setAnnos] = useState([]);
  const [callout, setCallout] = useState(null);
  const [plan, setPlan] = useState(null);
  const [ghost, setGhost] = useState({ x: 0, y: 0, on: false, press: false });
  const [watchers, setWatchers] = useState([]);
  const [termExtra, setTermExtra] = useState([]);
  const [codeWin, setCodeWin] = useState({ open: false, applied: false });
  const [proPrice, setProPrice] = useState(49);

  const timers = useRef([]);
  const cdRef = useRef(null);
  const grantRef = useRef(null);
  const ctxRef = useRef(ctx); ctxRef.current = ctx;
  const planRef = useRef(plan); planRef.current = plan;
  const railRef = useRef(railOpen); railRef.current = railOpen;
  const liveRef = useRef(live); liveRef.current = live;
  const guessRef = useRef(guess); guessRef.current = guess;
  const feedEl = useRef(null);
  const moveAcc = useRef(0);
  const lastPt = useRef(null);

  const at = useCallback((ms, fn) => { const id = setTimeout(fn, ms); timers.current.push(id); return id; }, []);
  const clearTimers = useCallback(() => { timers.current.forEach(clearTimeout); timers.current = []; }, []);

  // ---- transcript ----
  const narr = useCallback((kind, text, speaker) => {
    setFeed((f) => [...f.slice(-60), { id: lvuid(), type: "line", kind, ts: lvclock(), text, speaker }]);
    if (!railRef.current) setUnseen((u) => Math.min(99, u + 1));
  }, []);
  const toast = useCallback((tone, title, body, label) => {
    setFeed((f) => [...f.slice(-60), { id: lvuid(), type: "toast", tone, ts: lvclock(), title, body, label }]);
    if (!railRef.current) setUnseen((u) => Math.min(99, u + 1));
  }, []);

  useEffect(() => { const el = feedEl.current; if (el && railOpen) el.scrollTop = el.scrollHeight; }, [feed, railOpen]);
  useEffect(() => { if (!live) return; const id = setInterval(() => setElapsed((s) => s + 1), 1000); return () => clearInterval(id); }, [live]);

  // ---- guess plumbing ----
  const clearGuess = useCallback(() => {
    setGuess(null); setGuessSrc(null); setCountdown(null);
    if (cdRef.current) { clearInterval(cdRef.current); cdRef.current = null; }
  }, []);

  const startCountdown = useCallback(() => {
    if (cdRef.current) clearInterval(cdRef.current);
    const t0 = performance.now();
    setCountdown(0);
    cdRef.current = setInterval(() => {
      const p = (performance.now() - t0) / 2200;
      if (p >= 1) { clearInterval(cdRef.current); cdRef.current = null; runRef.current(guessRef.current); }
      else setCountdown(p);
    }, 50);
  }, []);

  // agent suggests a verb a beat after you scope something silently
  useEffect(() => {
    if (!live || ctx.voice || (!ctx.region && !ctx.point) || guess) return;
    const id = setTimeout(() => { setGuess(verbsFor(ctxRef.current)[0].id); setGuessSrc("suggested"); }, 1100);
    return () => clearTimeout(id);
  }, [ctx.region, ctx.point, ctx.voice, live]); // eslint-disable-line

  const clearCtx = useCallback((kind) => {
    clearGuess();
    if (!kind) setCtx({ region: null, point: null, voice: null });
    else setCtx((c) => ({ ...c, [kind]: null }));
  }, [clearGuess]);

  // ---- deixis handlers ----
  const onRegion = useCallback((r) => {
    const d = describeRegion(r);
    clearGuess();
    setCtx((c) => ({ ...c, region: d, point: null }));
    narr("focus", `scope → ${d.label} · ${Math.round(d.w)}×${Math.round(d.h)}`);
  }, [narr, clearGuess]);

  const onPoint = useCallback((p) => {
    clearGuess();
    setCtx((c) => ({ ...c, point: p, region: null }));
    narr("focus", `point → ${p.winId || "desktop"} › ${p.label}`);
  }, [narr, clearGuess]);

  // ---- voice (hold space / hold VOICE chip) ----
  const startVoice = useCallback(() => {
    if (!liveRef.current || listening) return;
    setListening(true); setAgentState("listening");
  }, [listening]);

  const endVoice = useCallback(() => {
    if (!liveRef.current) return;
    setListening(false); setAgentState("idle");
    const pv = pickVoice(ctxRef.current);
    setCtx((c) => ({ ...c, voice: pv.text }));
    narr("voice", pv.text, "you");
    setGuess(pv.verb); setGuessSrc("voice");
    if (t.autoGuess) startCountdown();
  }, [narr, startCountdown, t.autoGuess]);

  // ============================ SCENARIOS ============================
  const runExtract = useCallback(() => {
    const c = ctxRef.current;
    const region = c.region || (() => { const r = rectOf('[data-gx="pricing-grid"]'); return r && { ...r, winId: "firefox", label: "firefox › pricing grid" }; })();
    if (!region) return;
    setIntents((n) => n + 1);
    setJob({ label: "EXTRACT", sub: "vision ▸ scanning region" });
    setAgentState("transmit");
    narr("sys", `vision ▸ scan ${Math.round(region.w)}×${Math.round(region.h)} · ${region.label}`);
    at(500, () => {
      const boxes = [];
      document.querySelectorAll('[data-gx^="plan-"]').forEach((el, i) => {
        const b = el.getBoundingClientRect();
        const tr = { x: b.left, y: b.top, w: b.width, h: b.height };
        if (intersect(region, tr) > 0.4 * tr.w * tr.h || !c.region) boxes.push({ id: lvuid(), rect: tr, label: el.getAttribute("data-gx-label"), delay: i * 180 });
      });
      setAnnos(boxes);
    });
    at(1500, () => narr("sys", "grid detected · 3 plans × 6 attrs · 18 cells"));
    at(2400, () => {
      setJob({ label: "EXTRACT", sub: "writing to gnomon" });
      toast("success", "Pricing grid captured", "18 cells → gnomon · linked profile.competitor", "MEMORY");
      setMemCount((m) => m + 1);
    });
    at(3100, () => { setJob(null); setAgentState("idle"); clearCtx(); setAnnos((a) => a.map((x) => ({ ...x, done: true }))); });
    at(4400, () => setAnnos([]));
  }, [at, narr, toast, clearCtx]);

  const runExplain = useCallback(() => {
    const c = ctxRef.current;
    let key = "screen", rect = rectOf('[data-win="firefox"]'), label = "this screen";
    if (c.point) {
      rect = c.point.rect; label = c.point.label;
      key = c.point.id === "term-error" ? "term-error" : c.point.winId === "firefox" ? "pricing" : "screen";
    } else if (c.region) {
      rect = c.region; label = c.region.label;
      key = c.region.winId === "kitty" ? "term-error" : c.region.winId === "firefox" ? "pricing" : "screen";
    }
    setIntents((n) => n + 1);
    setJob({ label: "EXPLAIN", sub: `reading ${label}` });
    setAgentState("transmit");
    narr("sys", `explain ▸ ${label}`);
    at(1200, () => {
      setCallout({ ...CALLOUTS[key], rect });
      setJob(null); setAgentState("idle"); clearCtx();
      narr("voice", CALLOUTS[key].lines[0], "sys.ter");
    });
  }, [at, narr, clearCtx]);

  const runWatch = useCallback(() => {
    const c = ctxRef.current;
    const rect = c.region || (c.point && c.point.rect) || rectOf('[data-gx="price-pro"]');
    if (!rect) return;
    const label = (c.region && c.region.label) || (c.point && c.point.label) || "price · Pro";
    setIntents((n) => n + 1);
    setWatchers((w) => [...w, { id: lvuid(), x: rect.x + rect.w - 14, y: rect.y - 13, label: `watching · ${label}`, firedLabel: "Δ $49 → $59", fired: false }]);
    narr("sys", `watcher pinned · ${label} · diff every 30s`);
    clearCtx();
    at(9000, () => {
      setWatchers((w) => w.map((x) => ({ ...x, fired: true })));
      setProPrice(59);
      toast("warn", "Watch · change detected", "plan Pro · $49 → $59 · screenshot diffed → gnomon", "WATCH");
      setMemCount((m) => m + 1);
    });
  }, [at, narr, toast, clearCtx]);

  const runFix = useCallback(() => {
    setIntents((n) => n + 1);
    setJob({ label: "FIX", sub: "diagnosing link failure" });
    setAgentState("transmit");
    narr("sys", "diagnose ▸ tracing ld error through build.log");
    at(1100, () => narr("sys", "cause · flags.cmake:18 links crypto, not ssl"));
    at(1700, () => {
      setJob(null); setAgentState("idle"); clearCtx();
      setPlan({ title: "repair build · gnosis-engine", steps: FIX_STEPS.map((s) => ({ ...s, status: "wait" })), status: "proposed", grantLeft: t.grantSec });
      narr("sys", "plan ready · 3 steps · 2 need your cursor");
    });
  }, [at, narr, clearCtx, t.grantSec]);

  const run = useCallback((verb) => {
    if (!verb) return;
    clearGuess();
    setCallout(null);
    if (verb === "extract") runExtract();
    else if (verb === "explain") runExplain();
    else if (verb === "watch") runWatch();
    else if (verb === "fix") runFix();
  }, [clearGuess, runExtract, runExplain, runWatch, runFix]);
  const runRef = useRef(run); runRef.current = run;

  // ============================ PLAN EXECUTION ============================
  const setStep = useCallback((i, status) => {
    setPlan((p) => p && { ...p, steps: p.steps.map((s, j) => (j === i ? { ...s, status } : s)) });
  }, []);
  const ghostTo = useCallback((x, y) => setGhost((g) => ({ ...g, x, y, on: true })), []);
  const ghostPress = useCallback((on) => setGhost((g) => ({ ...g, press: on })), []);

  const finishPlan = useCallback(() => {
    if (grantRef.current) { clearInterval(grantRef.current); grantRef.current = null; }
    setPlan((p) => p && { ...p, status: "done" });
    setGhost((g) => ({ ...g, on: false, press: false }));
    toast("success", "Build repaired", "flags.cmake +1 −1 · relink ok · 2.41s", "STABLE");
    setMemCount((m) => m + 1);
    narr("sys", "cursor returned · grant closed early");
    setAgentState("idle");
    at(4000, () => setPlan((p) => (p && p.status === "done" ? null : p)));
  }, [toast, narr, at]);

  const runStep = useCallback((i, done) => {
    setStep(i, "run");
    if (i === 0) {
      narr("sys", "read build.log · 212 lines · first error L208");
      at(1300, () => { setStep(0, "done"); done(); });
    } else if (i === 1) {
      setCodeWin({ open: true, applied: false });
      at(700, () => { const r = rectOf('[data-gx="diff-line"]'); if (r) ghostTo(r.x + r.w * 0.55, r.y + r.h * 0.5); });
      at(1500, () => ghostPress(true));
      at(1750, () => {
        ghostPress(false);
        setCodeWin({ open: true, applied: true });
        narr("sys", "patch · flags.cmake:18 +ssl · saved");
        setStep(1, "done");
      });
      at(2100, done);
    } else {
      at(200, () => { const r = rectOf('[data-win="kitty"] .term__caret'); if (r) ghostTo(r.x + 8, r.y + 4); });
      at(900, () => ghostPress(true));
      at(1100, () => { ghostPress(false); setTermExtra((l) => [...l, { t: "$ ninja -C build", k: "cmd", fresh: true }]); });
      at(1700, () => setTermExtra((l) => [...l, { t: "[1/2] clang++ -O2 -c src/bus.cc", k: "ok", fresh: true }]));
      at(2300, () => setTermExtra((l) => [...l, { t: "[2/2] LINK gnosis-engine", k: "ok", fresh: true }]));
      at(2900, () => {
        setTermExtra((l) => [...l, { t: "build green · 2.41s", k: "good", fresh: true }]);
        setStep(2, "done");
      });
      at(3200, done);
    }
  }, [at, narr, setStep, ghostTo, ghostPress]);

  const chainFrom = useCallback((i) => {
    const p = planRef.current;
    if (!p || i >= p.steps.length) { finishPlan(); return; }
    runStep(i, () => chainFrom(i + 1));
  }, [runStep, finishPlan]);

  const grant = useCallback(() => {
    setPlan((p) => p && { ...p, status: "running", grantLeft: t.grantSec });
    narr("sys", `grant open · cursor → sys.ter · ${t.grantSec}s window`);
    setAgentState("transmit");
    moveAcc.current = 0; lastPt.current = null;
    setGhost({ x: window.innerWidth / 2, y: window.innerHeight - 150, on: true, press: false });
    if (grantRef.current) clearInterval(grantRef.current);
    grantRef.current = setInterval(() => {
      setPlan((p) => {
        if (!p || p.status !== "running") return p;
        const left = p.grantLeft - 0.2;
        if (left <= 0) { interruptRef.current("grant expired"); return { ...p, grantLeft: 0 }; }
        return { ...p, grantLeft: left };
      });
    }, 200);
    at(400, () => chainFrom(0));
  }, [t.grantSec, narr, at, chainFrom]);

  const interrupt = useCallback((reason) => {
    const p = planRef.current;
    if (!p || p.status !== "running") return;
    clearTimers();
    if (grantRef.current) { clearInterval(grantRef.current); grantRef.current = null; }
    setGhost((g) => ({ ...g, on: false, press: false }));
    setPlan((pp) => pp && {
      ...pp, status: "paused",
      steps: pp.steps.map((s) => (s.status === "run" ? { ...s, status: "paused" } : s)),
    });
    narr("sys", `interrupt · ${reason} · cursor returned`);
    setAgentState("idle");
  }, [clearTimers, narr]);
  const interruptRef = useRef(interrupt); interruptRef.current = interrupt;

  const resume = useCallback(() => {
    const p = planRef.current;
    if (!p) return;
    const idx = p.steps.findIndex((s) => s.status === "paused");
    setPlan((pp) => pp && { ...pp, status: "running", steps: pp.steps.map((s) => (s.status === "paused" ? { ...s, status: "wait" } : s)) });
    narr("sys", `grant re-opened · resuming step ${idx + 1}`);
    setAgentState("transmit");
    moveAcc.current = 0; lastPt.current = null;
    setGhost((g) => ({ ...g, on: true }));
    if (grantRef.current) clearInterval(grantRef.current);
    grantRef.current = setInterval(() => {
      setPlan((pp) => {
        if (!pp || pp.status !== "running") return pp;
        const left = pp.grantLeft - 0.2;
        if (left <= 0) { interruptRef.current("grant expired"); return { ...pp, grantLeft: 0 }; }
        return { ...pp, grantLeft: left };
      });
    }, 200);
    at(300, () => chainFrom(Math.max(0, idx)));
  }, [narr, at, chainFrom]);

  const park = useCallback(() => {
    setPlan(null);
    narr("sys", "plan parked → gnomon · resume from memory anytime");
    setMemCount((m) => m + 1);
  }, [narr]);

  // ---- revoke by mouse movement while the agent drives ----
  useEffect(() => {
    const onMove = (e) => {
      const p = planRef.current;
      if (!p || p.status !== "running") { lastPt.current = null; moveAcc.current = 0; return; }
      if (lastPt.current) moveAcc.current += Math.hypot(e.clientX - lastPt.current.x, e.clientY - lastPt.current.y);
      lastPt.current = { x: e.clientX, y: e.clientY };
      if (moveAcc.current > 200) interruptRef.current("you moved");
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  // ---- keyboard: space = PTT · enter = run guess · esc = revoke/clear ----
  useEffect(() => {
    const down = (e) => {
      if (e.code === "Space" && !e.repeat && liveRef.current && (!planRef.current || planRef.current.status !== "running")) {
        e.preventDefault(); startVoice();
      } else if (e.key === "Enter" && guessRef.current) {
        e.preventDefault(); runRef.current(guessRef.current);
      } else if (e.key === "Escape") {
        const p = planRef.current;
        if (p && p.status === "running") interruptRef.current("esc");
        else { setCallout(null); clearCtx(); }
      }
    };
    const up = (e) => { if (e.code === "Space" && liveRef.current) { e.preventDefault(); endVoice(); } };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, [startVoice, endVoice, clearCtx]);

  // ---- session lifecycle ----
  const goLive = useCallback(() => {
    setEngaging(true);
    setAgentState("idle");
    narr("sys", "screen attach requested · perimeter lock");
    at(750, () => {
      setEngaging(false); setLive(true); setElapsed(0);
      narr("sys", "session live · 2560×1440 @ 12fps · everything stays local");
      narr("focus", "drag scopes · click points · hold space talks");
    });
  }, [at, narr]);

  const endLive = useCallback(() => {
    clearTimers();
    if (grantRef.current) { clearInterval(grantRef.current); grantRef.current = null; }
    clearGuess();
    toast("info", "Session closed", `${fmtT(elapsed)} · ${intents} intents · ${memCount} memories → gnomon`, "AUDIT");
    setLive(false); setAgentState("veille");
    setCtx({ region: null, point: null, voice: null });
    setListening(false); setJob(null); setAnnos([]); setCallout(null); setPlan(null);
    setGhost({ x: 0, y: 0, on: false, press: false });
    setWatchers([]);
  }, [clearTimers, clearGuess, toast, elapsed, intents, memCount]);

  useEffect(() => () => { clearTimers(); if (grantRef.current) clearInterval(grantRef.current); if (cdRef.current) clearInterval(cdRef.current); }, [clearTimers]);

  const onCalloutAction = useCallback((id) => {
    setCallout(null);
    if (id === "fix") runFix();
    else if (id === "extract") runExtract();
    else if (id === "watch") runWatch();
  }, [runFix, runExtract, runWatch]);

  const toggleRail = useCallback(() => { setRailOpen((o) => { if (!o) setUnseen(0); return !o; }); }, []);

  // ---- render ----
  const driving = plan && plan.status === "running";
  const dense = t.density === "compact";
  const effRadius = Math.round(t.radius);
  const tracking = listening || agentState === "transmit" || !!job;

  return (
    <>
      {/* ============ DESKTOP (the content the agent looks at) ============ */}
      <div className="desk" aria-hidden={false}>
        <FirefoxWindow proPrice={proPrice} />
        <KittyWindow extra={termExtra} busy={!!driving} />
        <CodeWindow open={codeWin.open} applied={codeWin.applied} />
      </div>

      {/* ============ DEIXIS LAYER ============ */}
      {live && <Perimeter mode={driving ? "driving" : "live"} />}
      <LassoLayer active={live && !driving} onRegion={onRegion} onPoint={onPoint} onBackground={() => { setCallout(null); }} />
      {live && <RegionMark rect={ctx.region} label={ctx.region ? ctx.region.label : ""} onClear={() => clearCtx("region")} />}
      {live && <PointMark point={ctx.point} onClear={() => clearCtx("point")} />}
      {annos.map((a) => (<AnnoBox a={a} key={a.id} />))}
      {watchers.map((w) => (<WatcherChip w={w} key={w.id} />))}
      <Callout co={callout} onAction={onCalloutAction} onClose={() => setCallout(null)} />
      <GhostCursor ghost={ghost} />

      {/* ============ BAR ============ */}
      <div className="live-bar-slot">
        <ScalePop origin="top center">
          <div className={`membrane density-${t.density}${tracking ? " is-tracking" : ""}`} style={{ "--membrane-radius": `${effRadius}px`, maxWidth: 620 }} data-screen-label="Gnosis Live bar">
            <div className="membrane__accent" style={{ opacity: tracking ? 0.85 : 0.22 }} />
            <div className="bar">
              <div className="bar__mascot">
                <IdleBreathe active={listening || !!driving}>
                  <GnosisMascot size={28} state={agentState} />
                </IdleBreathe>
                <StatusDot color={LV_STATE_COLOR[agentState]} size={8} pulsing={tracking} />
              </div>
              <div className="bar__focus">
                <div className="focus-tag">
                  <span className="focus-tag__id">{live ? "LIVE session" : "Gnosis"}</span>
                  <span className="focus-tag__state" style={{ color: live ? "var(--state-alert)" : LV_STATE_COLOR[agentState] }}>
                    {live ? "● REC" : LV_STATE_LABEL[agentState]}
                  </span>
                </div>
                <div className="focus-telem">
                  {live ? (
                    <>
                      <span className="num">{fmtT(elapsed)}</span>
                      <span className="sep">·</span>
                      <span>screen shared · local only</span>
                    </>
                  ) : (
                    <span>agent can't see your screen</span>
                  )}
                </div>
              </div>
              <div className="bar__chips">
                {!live && <SystemChip glyph="screen_share" label="GO LIVE" active={engaging} busy={engaging} onClick={goLive} title="Share screen with the local agent" />}
                {live && <SystemChip glyph="mic" label="VOICE" active={listening} recDot={listening} onPointerDown={startVoice} onPointerUp={endVoice} onPointerLeave={() => listening && endVoice()} title="Hold to talk (or hold space)" />}
                <SystemChip glyph="format_list_bulleted" label="RAIL" active={railOpen} badge={unseen} onClick={toggleRail} title="Session transcript" />
                {live && <SystemChip glyph="stop_circle" label="END" onClick={endLive} title="End session" />}
              </div>
            </div>
          </div>
        </ScalePop>
        {t.hints && (
          <div className={`hintstrip${live ? " is-live" : ""}`}>
            {live
              ? <span><b>drag</b> scope a region · <b>click</b> point at a thing · <b>hold space</b> talk · <b>esc</b> revoke</span>
              : <span>go live — the agent attaches to your screen and you point instead of typing</span>}
          </div>
        )}
      </div>

      {/* ============ TRANSCRIPT RAIL ============ */}
      <div className={`rail${railOpen ? " is-open" : ""}`} data-screen-label="Session transcript rail">
        <div className="rail__head">
          <span className="rail__title">SESSION ▸ TRANSCRIPT</span>
          {live ? (<span className="rail__rec"><StatusDot color="var(--state-alert)" size={6} pulsing />REC</span>) : (<span className="rail__meta">gnosis-engine</span>)}
        </div>
        <div className="rail__scroll" ref={feedEl}>
          {feed.map((e) => (e.type === "toast" ? <ToastCard key={e.id} entry={e} /> : <FeedLine key={e.id} entry={e} dense={dense} />))}
        </div>
        <div className="rail__foot">
          <span><Sym size={12} fill={1}>history</Sym> gnomon <b className="num">{memCount}</b></span>
          <span className="sep">·</span>
          <span>intents <b className="num">{intents}</b></span>
        </div>
      </div>

      {/* ============ INTENT COMPOSER + PLAN ============ */}
      <div className="composer-slot">
        <PlanCard plan={plan} grantSec={t.grantSec} onGrant={grant} onDeny={park} onInterrupt={() => interrupt("manual")} onResume={resume} onPark={park} />
        {!plan && (
          <IntentComposer
            ctx={ctx} listening={listening} verbs={verbsFor(ctx)}
            guess={guess} guessSrc={guessSrc} countdown={countdown} job={job}
            onVerb={(v) => run(v)} onClear={clearCtx}
          />
        )}
      </div>
    </>
  );
}

window.GnosisLive = GnosisLive;
