/* global React, Sym */
// ============================================================================
// gnosis/gnomon.jsx — Gnomon, the causal-memory timeline (4th console view).
// Every memory captured through a menu lands here, threaded on a spine that
// records WHAT TRIGGERED it (↳ from: …) — causal, not just chronological.
// buildMemoryMenu() is the Session/Memory menu family: right-click a card to
// link it to a project/competitor, export it, or delete it (plan/apply).
// ============================================================================

const GN_KINDS = {
  capture: { label: "capture", glyph: "screenshot_region", node: "var(--m3-primary)" },
  card:    { label: "card",    glyph: "contact_page",      node: "var(--gnu-info)" },
  summary: { label: "summary", glyph: "summarize",         node: "var(--col-on-layer1)" },
  event:   { label: "event",   glyph: "bookmark_added",    node: "var(--state-ok)" },
  voice:   { label: "voice",   glyph: "graphic_eq",        node: "var(--m3-primary)" },
};
const GN_TAG_GLYPH = { project: "deployed_code", competitor: "query_stats", screenshot: "image", transcript: "subject" };

const GNOMON_SEED = [
  { id: "m-s1", kind: "summary", title: "Session summary · 60 min", app: "Hyprland", cause: "audit · timeline", tags: [{ type: "transcript" }], ts: "09:42:11" },
  { id: "m-s2", kind: "card", title: "Acme · competitor card", app: "Firefox", cause: "extract · pricing", tags: [{ type: "competitor", label: "Acme" }, { type: "project", label: "gnu.in-os" }], ts: "09:38:50" },
  { id: "m-s3", kind: "capture", title: "build.log · clang link error", app: "Code", cause: "vision scan · Code", tags: [{ type: "screenshot" }, { type: "transcript" }], ts: "09:31:04" },
  { id: "m-s4", kind: "event", title: "focus mode enabled", app: "Spotify", cause: "voice · mute others", tags: [], ts: "09:20:33" },
];

// ---- GnomonTimeline --------------------------------------------------------
function GnomonTimeline({ memories, filter, setFilter, onCardMenu }) {
  const filters = ["all", "capture", "card", "summary", "event"];
  const shown = filter === "all" ? memories : memories.filter((m) => m.kind === filter);
  const store = (memories.length * 0.18 + 0.4).toFixed(1);
  return (
    <div className="gnomon">
      <div className="gnomon__head">
        <span className="gnomon__title">GNOMON</span>
        <span className="gnomon__count"><b>{memories.length}</b> memories</span>
        <span className="gnomon__store"><Sym size={11}>database</Sym>{store} MB · local</span>
      </div>

      <div className="gnomon__filters">
        {filters.map((f) => (
          <button key={f} type="button" className={`gn-filter${filter === f ? " is-on" : ""}`} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      <div className="gnomon__list">
        {shown.length === 0 ? (
          <div className="gnomon__empty">no {filter === "all" ? "" : filter + " "}memories yet · right-click a window → capture</div>
        ) : (
          shown.map((m) => {
            const k = GN_KINDS[m.kind] || GN_KINDS.capture;
            return (
              <div
                key={m.id}
                className="gnomon-card"
                style={{ "--node": k.node }}
                onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); onCardMenu(m.id, e); }}
                title="right-click · memory actions"
              >
                <div className="gn-card__rail"><div className="gn-card__node"><Sym size={13} fill={1}>{k.glyph}</Sym></div></div>
                <div className="gn-card__body">
                  <div className="gn-card__top"><span className="gn-card__kind">{k.label}</span><span className="gn-card__ts num">{m.ts}</span></div>
                  <div className="gn-card__title">{m.title}</div>
                  <div className="gn-card__cause"><span className="arr">↳</span> from <b>{m.cause}</b></div>
                  {m.tags && m.tags.length > 0 && (
                    <div className="gn-tags">
                      {m.tags.map((tg, i) => {
                        const cls = tg.type === "project" ? " gn-tag--project" : tg.type === "competitor" ? " gn-tag--competitor" : "";
                        return (
                          <span key={i} className={`gn-tag${cls}`}>
                            <span className="glyph"><Sym size={11}>{GN_TAG_GLYPH[tg.type] || "label"}</Sym></span>
                            {tg.label || tg.type}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ---- Session/Memory menu family (GnuContextMenu spec) ----------------------
function buildMemoryMenu(mem) {
  const k = GN_KINDS[mem.kind] || GN_KINDS.capture;
  const hasProj = (mem.tags || []).some((t) => t.type === "project");
  const hasComp = (mem.tags || []).some((t) => t.type === "competitor");
  return {
    glyph: k.glyph,
    eyebrow: `memory · ${k.label}`,
    title: mem.title,
    sub: `↳ ${mem.cause}`,
    meta: [],
    sections: [
      { label: "lier", items: [
        { id: "mem.link_project", glyph: "deployed_code", label: hasProj ? "linked · gnu.in-os" : "link to project", risk: "local", disabled: hasProj, reason: "already linked" },
        { id: "mem.link_competitor", glyph: "query_stats", label: hasComp ? "linked · competitor" : "link to competitor", risk: "local", disabled: hasComp, reason: "already linked" },
      ] },
      { label: "exporter", items: [
        { id: "mem.export", glyph: "ios_share", label: "export memory", risk: "observe" },
        { id: "mem.transcript", glyph: "subject", label: "save transcript only", risk: "observe" },
      ] },
      { items: [
        { id: "mem.delete", glyph: "delete", label: "delete memory", risk: "system", confirm: true, confirmNote: "removes local memory" },
      ] },
    ],
    footer: { note: "retention · project", noteOk: true },
  };
}

Object.assign(window, { GN_KINDS, GNOMON_SEED, GnomonTimeline, buildMemoryMenu });
