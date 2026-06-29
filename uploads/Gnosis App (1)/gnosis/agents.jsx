/* global React, Sym, StatusDot */
// ============================================================================
// gnosis/agents.jsx — the Agent Bus. Cloud agents reach the sentinel over the
// gnu6 socket and drive the system in real time: each holds capability grants
// (screen / voice / shell / files) and emits calls onto a live command stream —
// including sentinel.escalate(), which ramps the reactor. This is the bridge
// the brief asks for: cloud ⇄ local, one loop.
// Origin tag + avatar use --gnu-info (a role token, never identity orange).
// ============================================================================

const GRANT_DEFS = [
  { key: "screen", glyph: "monitor", label: "screen capture" },
  { key: "voice",  glyph: "mic",     label: "voice / mic" },
  { key: "shell",  glyph: "terminal", label: "shell exec" },
  { key: "files",  glyph: "folder_open", label: "file read" },
];

const AGENTS_SEED = [
  {
    id: "claude", name: "claude · sonnet", origin: "gnu6", glyph: "cognition",
    act: "reading session timeline", idle: false,
    grants: { screen: 1, voice: 1, shell: 0, files: 1 },
  },
  {
    id: "studio", name: "gnu6 · studio", origin: "gnu6", glyph: "deployed_code",
    act: "watching · idle", idle: true,
    grants: { screen: 1, voice: 0, shell: 0, files: 0 },
  },
];

// ---- AgentBus --------------------------------------------------------------
function AgentBus({ agents, calls, onToggleGrant, busRef }) {
  const live = agents.length;
  return (
    <div className="bus">
      <div className="bus__head">
        <span className="bus__title">AGENT BUS</span>
        <span className="bus__socket"><span className="pip" />gnu6 · socket</span>
        <span className="bus__count"><b>{live}</b> connected</span>
      </div>

      <div className="bus__agents">
        {agents.map((a) => (
          <div className="agent" key={a.id}>
            <span className="agent__avatar"><Sym size={17} fill={1}>{a.glyph}</Sym></span>
            <span className="agent__main">
              <span className="agent__id">
                <span className="agent__name">{a.name}</span>
                <span className="agent__origin">{a.origin}</span>
              </span>
              <span className={`agent__act${a.idle ? " is-idle" : ""}`}>
                <span className="glyph"><Sym size={12} fill={1}>{a.idle ? "pause" : "graphic_eq"}</Sym></span>
                {a.act}
              </span>
            </span>
            <span className="grants">
              {GRANT_DEFS.map((g) => {
                const on = !!a.grants[g.key];
                return (
                  <button
                    key={g.key}
                    type="button"
                    className={`grant${on ? " is-granted" : ""}`}
                    title={`${g.label} · ${on ? "granted" : "denied"}`}
                    aria-pressed={on}
                    onClick={() => onToggleGrant(a.id, g.key)}
                  >
                    <Sym size={14} fill={on ? 1 : 0}>{g.glyph}</Sym>
                  </button>
                );
              })}
            </span>
          </div>
        ))}
      </div>

      <div className="bus__stream" ref={busRef}>
        {calls.map((c) => (
          <div className={`bus-call${c.deny ? " bus-call--deny" : ""}`} key={c.id}>
            <span className="bus-call__ts num">{c.ts}</span>
            <span className="bus-call__agent">{c.agent}</span>
            <span className="bus-call__arrow">▸</span>
            <span className="bus-call__fn" dangerouslySetInnerHTML={{ __html: c.fn }} />
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { GRANT_DEFS, AGENTS_SEED, AgentBus });
