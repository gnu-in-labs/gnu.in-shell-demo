/* global React, Sym, Spinner, SENTINEL_TIERS, VRAM_TOTAL, tierVram, vramState, MDUR */
// ============================================================================
// gnosis/ctxmenu.jsx — GnuContextMenu, the contextual-menu PRIMITIVE.
// One component renders every GnosisApp menu family from a declarative spec:
//   context header · deterministic sections · deferred "Gnosis suggère…" ·
//   privacy / resource footer.
// The menu opens INSTANTLY with known actions; the suggestion section fills in
// after ~600ms (Thinking → skeleton, never a giant spinner). Risky actions go
// through an inline plan / apply confirm — the menu never mutates directly.
// Builders below produce the Window / Orb / Resource specs from live ctx.
// ============================================================================
const { useState, useEffect, useRef, useLayoutEffect, useMemo, useCallback } = React;

// ---- GnuContextMenu --------------------------------------------------------
function GnuContextMenu({ menu, onAction, onClose }) {
  const { x, y, spec } = menu;
  const ref = useRef(null);
  const [pos, setPos] = useState({ left: x, top: y, origin: "top left" });
  const [confirmId, setConfirmId] = useState(null);
  const [suggest, setSuggest] = useState(spec.suggestSeed && spec.suggestSeed.length ? "thinking" : null);

  // dismiss on outside click / Esc (a focus-grab analog)
  useEffect(() => {
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("pointerdown", onDown, true);
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("pointerdown", onDown, true); window.removeEventListener("keydown", onKey); };
  }, [onClose]);

  // clamp into viewport + set transform-origin toward the cursor
  useLayoutEffect(() => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const m = 12;
    let left = x, top = y, ox = "left", oy = "top";
    if (x + r.width > window.innerWidth - m) { left = Math.max(m, x - r.width); ox = "right"; }
    if (y + r.height > window.innerHeight - m) { top = Math.max(m, y - r.height); oy = "bottom"; }
    setPos({ left, top, origin: `${oy} ${ox}` });
  }, [x, y]);

  // deferred suggestions — the engine never blocks the open
  useEffect(() => {
    if (suggest !== "thinking") return;
    const id = setTimeout(() => setSuggest("ready"), 560 + Math.random() * 260);
    return () => clearTimeout(id);
  }, [suggest]);

  const activate = useCallback((item) => {
    if (!item || item.disabled) return;
    if (item.confirm && confirmId !== item.id) { setConfirmId(item.id); return; }
    onAction(item.id, item); onClose();
  }, [confirmId, onAction, onClose]);

  // flat keyboard list (enabled items + ready suggestions)
  const flat = useMemo(() => {
    const list = [];
    (spec.sections || []).forEach((s) => (s.items || []).forEach((it) => !it.disabled && list.push(it)));
    if (suggest === "ready") (spec.suggestSeed || []).forEach((it) => list.push(it));
    return list;
  }, [spec, suggest]);
  const [cursor, setCursor] = useState(-1);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowDown") { e.preventDefault(); setCursor((c) => Math.min(flat.length - 1, c + 1)); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setCursor((c) => Math.max(0, c - 1)); }
      else if (e.key === "Enter" && cursor >= 0) { e.preventDefault(); activate(flat[cursor]); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flat, cursor, activate]);

  const renderItem = (it) => {
    if (confirmId === it.id) {
      return (
        <div className="cm-confirm" key={it.id}>
          <span className="cm-confirm__txt"><b>plan ready</b> · {it.confirmNote || "apply this action?"}</span>
          <button type="button" className="cm-confirm__btn cancel" onClick={() => setConfirmId(null)}>cancel</button>
          <button type="button" className="cm-confirm__btn apply" onClick={() => { onAction(it.id, { ...it, applied: true }); onClose(); }}>apply</button>
        </div>
      );
    }
    const ci = flat.indexOf(it);
    return (
      <button
        type="button"
        key={it.id}
        className={`cm-item${it.disabled ? " is-disabled" : ""}${it.active ? " is-active" : ""}${ci >= 0 && ci === cursor ? " is-cursor" : ""}`}
        onClick={() => activate(it)}
        onMouseEnter={() => ci >= 0 && setCursor(ci)}
        title={it.disabled ? it.reason : undefined}
      >
        <span className="cm-item__glyph"><Sym size={17} fill={it.active ? 1 : 0}>{it.glyph}</Sym></span>
        <span className="cm-item__label">{it.label}</span>
        {it.risk === "local" && <span className="cm-risk cm-risk--local">local</span>}
        {it.risk === "system" && <span className="cm-risk cm-risk--system">system</span>}
        {it.hint && <span className="cm-item__hint num">{it.hint}</span>}
      </button>
    );
  };

  const f = spec.footer || {};
  return (
    <div className="ctxmenu" ref={ref} role="menu" style={{ left: pos.left, top: pos.top, "--cm-origin": pos.origin }}>
      {/* header */}
      <div className="cm-head">
        <div className="cm-head__eyebrow"><span className="glyph"><Sym size={12} fill={1}>{spec.glyph}</Sym></span>{spec.eyebrow}</div>
        <div className="cm-head__title">{spec.title}</div>
        {spec.sub && <div className="cm-head__sub">{spec.sub}</div>}
        {spec.meta && spec.meta.length > 0 && (
          <div className="cm-head__meta">
            {spec.meta.map((m, i) =>
              m.type === "vram" ? (
                <span key={i} className={`cm-chip cm-chip--vram${m.state && m.state !== "ok" ? " " + m.state : ""}`}>
                  <Sym size={11}>memory</Sym>{m.text}
                </span>
              ) : (
                <span key={i} className={`cm-chip${m.cloud ? " is-cloud" : ""}`}><span className="dot" />{m.text}</span>
              )
            )}
          </div>
        )}
      </div>

      {/* deterministic sections */}
      {(spec.sections || []).map((s, si) => (
        <div key={si}>
          {si > 0 && <div className="cm-sep" />}
          {s.label && <div className="cm-sect">{s.label}</div>}
          {(s.items || []).map(renderItem)}
        </div>
      ))}

      {/* deferred Gnosis suggestions */}
      {suggest && (
        <div className="cm-suggest">
          <div className="cm-sep" />
          <div className={`cm-suggest__head${suggest === "thinking" ? " is-thinking" : ""}`}>
            {suggest === "thinking" ? <Spinner size={11} stroke={2} /> : <span className="glyph"><Sym size={12} fill={1}>auto_awesome</Sym></span>}
            gnosis suggère
          </div>
          {suggest === "thinking"
            ? [0, 1].map((i) => (
                <div className="cm-skel" key={i}><span className="cm-skel__glyph" /><span className="cm-skel__bar" /></div>
              ))
            : (spec.suggestSeed || []).map((it) => {
                const ci = flat.indexOf(it);
                return (
                  <button type="button" key={it.id} className={`cm-item${ci >= 0 && ci === cursor ? " is-cursor" : ""}`} onClick={() => activate(it)} onMouseEnter={() => ci >= 0 && setCursor(ci)}>
                    <span className="cm-item__glyph"><Sym size={16}>{it.glyph || "bolt"}</Sym></span>
                    <span className="cm-item__sug" dangerouslySetInnerHTML={{ __html: it.label }} />
                  </button>
                );
              })}
        </div>
      )}

      {/* privacy / resource footer */}
      {(f.lamps || f.note) && (
        <div className="cm-foot">
          {(f.lamps || []).map((l) => (
            <span key={l.id} className={`cm-lamp ${l.state}`} onClick={() => onAction(l.id, l)} title={l.txt}>
              <span className="cm-lamp__led" style={{ background: "currentColor" }} />
              <span className="cm-lamp__txt">{l.txt}</span>
            </span>
          ))}
          <span className="cm-foot__spacer" />
          {f.note && <span className={`cm-foot__note${f.noteOk ? " ok" : ""}`}>{f.note}</span>}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SPEC BUILDERS — turn live ctx into a menu spec
// ctx = { focus, tier, used, vstate, muted, vision, gstate, profile }
// ============================================================================
const G_STATE_LABEL = { dormant: "dormant", armed: "armed", listening: "listening", seeing: "seeing", thinking: "thinking" };

const modeChip = (tier) => ({ type: "mode", text: `${tier.code} ${tier.name}`, cloud: !!tier.cloud });
const vramChip = (used, state) => ({ type: "vram", text: `${used.toFixed(1)}/${VRAM_TOTAL.toFixed(0)} GB`, state });
const privacyLamps = (muted, vision) => [
  { id: "privacy.mic", state: muted ? "safe" : "live", txt: muted ? "mic off" : "mic live" },
  { id: "privacy.vision", state: vision === "auto" ? "live" : vision === "off" ? "off" : "safe", txt: `vision ${vision}` },
];

// per-app contextual actions + suggestions
const ROLE_KIT = {
  browser: {
    ctxLabel: "competitor page",
    items: [
      { id: "win.ctx.extract", glyph: "frame_inspect", label: "extract claims · pricing", risk: "observe" },
      { id: "win.ctx.compare", glyph: "difference", label: "compare with active note", risk: "observe" },
      { id: "win.ctx.card", glyph: "contact_page", label: "create competitor card", risk: "local", confirm: true, confirmNote: "writes a Gnomon card" },
    ],
    suggest: [
      { id: "suggest.b1", glyph: "summarize", label: "summarise: <em>pricing table + 3 claims</em>" },
      { id: "suggest.b2", glyph: "difference", label: "diff vs note · <em>2 deltas</em>" },
    ],
  },
  editor: {
    ctxLabel: "build.log · clang",
    items: [
      { id: "win.ctx.explain", glyph: "psychology", label: "explain selection", risk: "observe" },
      { id: "win.ctx.why", glyph: "bug_report", label: "why did the build fail", risk: "observe" },
      { id: "win.ctx.diff", glyph: "save", label: "capture diff to Gnomon", risk: "local", confirm: true, confirmNote: "saves diff + transcript" },
    ],
    suggest: [
      { id: "suggest.e1", glyph: "bug_report", label: "build broke at <em>clang link step</em>" },
      { id: "suggest.e2", glyph: "psychology", label: "selection · <em>O(n²) loop, suggest fix</em>" },
    ],
  },
  terminal: {
    ctxLabel: "session · zsh",
    items: [
      { id: "win.ctx.explain", glyph: "terminal", label: "explain last command", risk: "observe" },
      { id: "win.ctx.session", glyph: "history", label: "summarise session", risk: "observe" },
      { id: "win.ctx.output", glyph: "content_copy", label: "capture output", risk: "local" },
    ],
    suggest: [
      { id: "suggest.t1", glyph: "terminal", label: "last cmd exited <em>1 · clang</em>" },
      { id: "suggest.t2", glyph: "history", label: "<em>142 events</em> in 60 min" },
    ],
  },
  media: { ctxLabel: "now playing", items: [{ id: "win.ctx.focus", glyph: "center_focus_weak", label: "focus mode · mute others", risk: "observe" }], suggest: [{ id: "suggest.m1", glyph: "graphic_eq", label: "now playing · <em>enter focus mode?</em>" }] },
  compositor: { ctxLabel: "5 windows · 3 apps", items: [{ id: "win.ctx.overview", glyph: "grid_view", label: "workspace overview", risk: "observe" }], suggest: [{ id: "suggest.c1", glyph: "grid_view", label: "<em>3 apps active</em> · 1 idle 12m" }] },
};

function buildWindowMenu(ctx) {
  const { focus, tier, used, vstate, muted, vision } = ctx;
  const kit = ROLE_KIT[focus.role] || ROLE_KIT.terminal;
  return {
    glyph: "web_asset",
    eyebrow: `${focus.role} · window`,
    title: `${focus.app} · ${kit.ctxLabel}`,
    sub: `${focus.box[0]}×${focus.box[1]} · workspace 2`,
    meta: [modeChip(tier), vramChip(used, vstate)],
    sections: [
      { label: "actions rapides", items: [
        { id: "win.summarize", glyph: "summarize", label: "summarise this window", risk: "observe" },
        { id: "win.capture", glyph: "screenshot_region", label: "capture to Gnomon", risk: "local", confirm: true, confirmNote: "saves screenshot + transcript" },
        { id: "win.feedback", glyph: "reviews", label: "ask for feedback", risk: "observe" },
      ] },
      { label: "contextuel", items: kit.items },
      { label: "ressources", items: [
        { id: "res.eco", glyph: "eco", label: "drop to Eco · L1", risk: "observe" },
        { id: "res.full_burn", glyph: "local_fire_department", label: "Full Burn · 30 min", risk: "system", confirm: true, confirmNote: "reserves full VRAM for 30 min" },
      ] },
    ],
    suggestSeed: kit.suggest,
    footer: { lamps: privacyLamps(muted, vision), note: "local-only" },
  };
}

const PROFILES = [
  { id: "profile.dev", glyph: "code", label: "Dev", lvl: 3 },
  { id: "profile.competitor", glyph: "query_stats", label: "Competitor Review", lvl: 2 },
  { id: "profile.gaming", glyph: "sports_esports", label: "Gaming Guard", lvl: 1 },
  { id: "profile.full_burn", glyph: "local_fire_department", label: "Full Burn", lvl: 3 },
];

function buildOrbMenu(ctx) {
  const { tier, used, vstate, muted, vision, gstate, profile } = ctx;
  return {
    glyph: "smart_toy",
    eyebrow: "gnosis · orb",
    title: `sys.ter · ${G_STATE_LABEL[gstate] || "armed"}`,
    sub: tier.model,
    meta: [modeChip(tier), vramChip(used, vstate)],
    sections: [
      { label: "état", items: [
        { id: "orb.ptt", glyph: "mic", label: "push-to-talk", risk: "observe", disabled: muted, reason: "mic is off (privacy)" },
        { id: "orb.vision", glyph: "center_focus_strong", label: "vision scan · active window", risk: "observe" },
      ] },
      { label: "profil", items: PROFILES.map((p) => ({ ...p, risk: p.id === "profile.full_burn" ? "system" : "observe", confirm: p.id === "profile.full_burn", confirmNote: "sustained max power", active: profile === p.id })) },
      { items: [
        { id: "orb.unload", glyph: "power_settings_new", label: "unload all models", risk: "system", confirm: true, confirmNote: "frees all VRAM → L0" },
        { id: "orb.cockpit", glyph: "dashboard", label: "open cockpit", risk: "observe" },
      ] },
    ],
    suggestSeed: [{ id: "suggest.o1", glyph: "auto_awesome", label: `${gstate === "thinking" ? "draft ready · <em>review?</em>" : "idle 4m · <em>drop to Eco?</em>"}` }],
    footer: { lamps: privacyLamps(muted, vision), note: "local-only" },
  };
}

function buildResourceMenu(ctx) {
  const { tier, used, vstate, muted, vision } = ctx;
  const models = [];
  tier.model.split(" · ").forEach((m, i) => models.push({ id: `res.model.${i}`, glyph: "check_circle", label: m, hint: "llm", risk: "local" }));
  if (tier.lvl >= 2 && !tier.cloud) models.push({ id: "res.model.vis", glyph: "check_circle", label: "Moondream2", hint: "vision", risk: "local" });
  if (tier.lvl >= 1) models.push({ id: "res.model.tts", glyph: "check_circle", label: "Kokoro-82M", hint: "tts", risk: "local" });
  const pressure = used > 5.6;
  return {
    glyph: "memory",
    eyebrow: "resource · governor",
    title: `${tier.name} · ${used.toFixed(1)}/${VRAM_TOTAL.toFixed(0)} GB`,
    sub: `latency ${tier.lat} · ${tier.cloud ? "cloud offload" : "local"}`,
    meta: [modeChip(tier), vramChip(used, vstate)],
    sections: [
      { label: "modèles chargés", items: models },
      { label: "actions", items: [
        { id: "res.eco", glyph: "eco", label: "switch Eco · L1", risk: "observe" },
        { id: "res.full_burn", glyph: "local_fire_department", label: "Full Burn · 30 min", risk: "system", confirm: true, confirmNote: "reserves full VRAM" },
        { id: "res.unload_all", glyph: "power_settings_new", label: "unload all", risk: "system", confirm: true, confirmNote: "frees all VRAM → L0" },
        { id: "res.gameguard", glyph: "sports_esports", label: "add active app to Game Guard", risk: "local" },
      ] },
    ],
    suggestSeed: pressure ? [{ id: "suggest.r1", glyph: "trending_down", label: "drop to <em>L2 · save 3.0 GB</em>" }] : [{ id: "suggest.r2", glyph: "check_circle", label: "headroom <em>ok · no action</em>" }],
    footer: { lamps: privacyLamps(muted, vision), note: pressure ? "VRAM pressure" : "freed 3.1 GB · Steam fullscreen", noteOk: !pressure },
  };
}

Object.assign(window, { GnuContextMenu, buildWindowMenu, buildOrbMenu, buildResourceMenu });
