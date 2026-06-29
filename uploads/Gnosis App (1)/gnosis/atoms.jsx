/* global React */
// ============================================================================
// gnosis/atoms.jsx — Gnosis HUD building blocks (chrome layer).
// Sym (Material Symbols Rounded — the family the real ii shell ships),
// SystemChip, FeedLine, ToastCard, StatusDot.
// Chrome is dynamic: colors come from M3 role tokens, never hardcoded orange.
// Severity tones (ok/warn/alert) are fixed semantic tokens, not the accent.
// ============================================================================

// ---- Sym ------------------------------------------------------------------
// Material Symbols Rounded glyph. wght 450 / opsz 20 to match Appearance.qml.
// FILL 0 at rest, FILL 1 when active — the shell's exact icon grammar.
function Sym({ children, size = 18, fill = 0, weight = 450, style = {}, className = "" }) {
  return (
    <span
      className={`msr ${className}`}
      aria-hidden="true"
      style={{
        fontSize: size,
        fontVariationSettings: `"FILL" ${fill}, "wght" ${weight}, "GRAD" 0, "opsz" 20`,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

// ---- StatusDot ------------------------------------------------------------
function StatusDot({ color, size = 8, pulsing = false }) {
  return (
    <span
      className={`status-dot${pulsing ? " is-pulsing" : ""}`}
      style={{ width: size, height: size, background: color, "--dot-color": color }}
    />
  );
}

// ---- SystemChip -----------------------------------------------------------
// Dense pill button. Active = filled with the dynamic M3 primary + spring
// pulse. Supports busy (spinner), numeric badge, recording-dot overlay.
function SystemChip({
  glyph,
  label,
  active = false,
  busy = false,
  badge = null,
  recDot = false,
  onClick,
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  title,
}) {
  return (
    <Pulse active={active} color="var(--m3-primary)">
      <button
        type="button"
        className={`sys-chip${active ? " is-active" : ""}`}
        onClick={onClick}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerLeave}
        title={title || label}
        aria-pressed={active}
      >
        <span className="sys-chip__icon">
          {busy ? <Spinner size={14} stroke={2.2} /> : <Sym size={17} fill={active ? 1 : 0}>{glyph}</Sym>}
        </span>
        <span className="sys-chip__label">{label}</span>
        {badge != null && Number(badge) > 0 && <span className="sys-chip__badge num">{badge}</span>}
        {recDot && <RecDot />}
      </button>
    </Pulse>
  );
}

// ---- FeedLine -------------------------------------------------------------
// Terse, dense monospaced event line. kind: 'voice' | 'focus' | 'sys'.
// The mono voice belongs to the identity/terminal layer — calm, lowercase.
function FeedLine({ entry, dense }) {
  const { kind, ts, text, speaker } = entry;
  const prefix =
    kind === "voice" ? (
      <span className="feed-glyph feed-glyph--mic">
        <Sym size={dense ? 12 : 13} fill={1}>graphic_eq</Sym>
      </span>
    ) : kind === "sys" ? (
      <span className="feed-glyph feed-glyph--sys">▸</span>
    ) : (
      <span className="feed-glyph feed-glyph--dot">·</span>
    );
  return (
    <div className={`feed-line feed-line--${kind}`}>
      <span className="feed-line__ts num">{ts}</span>
      {prefix}
      {speaker && <span className="feed-line__speaker">{speaker}</span>}
      <span className="feed-line__text">{text}</span>
    </div>
  );
}

// ---- ToastCard ------------------------------------------------------------
// Padded sensation / audit block. tone: 'info' | 'success' | 'danger' | 'warn'.
// info = the DYNAMIC chrome accent; success/warn/danger = FIXED semantic tokens
// (a red breach should look the same under every wallpaper scheme).
const TONE_COLOR = {
  info: "var(--m3-primary)",
  success: "var(--state-ok)",
  danger: "var(--state-alert)",
  warn: "var(--state-warn)",
};
const TONE_LABEL = {
  info: "AUDIT",
  success: "STABLE",
  danger: "BREACH",
  warn: "STRESS",
};

function ToastCard({ entry }) {
  const { tone = "info", ts, title, body, label } = entry;
  const color = TONE_COLOR[tone] || TONE_COLOR.info;
  return (
    <div className={`toast-card toast-card--${tone}`} style={{ "--tone": color }}>
      <div className="toast-card__head">
        <StatusDot color={color} size={7} />
        <span className="toast-card__label">{label || TONE_LABEL[tone]}</span>
        <span className="toast-card__ts num">{ts}</span>
      </div>
      {title && <div className="toast-card__title">{title}</div>}
      {body && <div className="toast-card__body">{body}</div>}
    </div>
  );
}

Object.assign(window, { Sym, StatusDot, SystemChip, FeedLine, ToastCard, TONE_COLOR });
