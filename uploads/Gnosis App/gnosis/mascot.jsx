/* global React */
// ============================================================================
// gnosis/mascot.jsx — the Sys.ter cube terminal mascot for the Gnosis HUD.
// Isometric orange cube + anthracite terminal face + >_ prompt + green beret.
// State grammar: idle | listening | transmit | veille.
// Built to read cleanly at 28px; ornaments animate around the cube, never on it.
// The cube + its state ornaments are the IDENTITY layer: always brand orange,
// held CONSTANT while the chrome accent shifts around it (TASTE §0/§1).
// ============================================================================

function GnosisMascot({ size = 28, state = "idle", accent = "var(--brand-accent)" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 256 256"
      role="img"
      aria-label={`sys.ter ${state}`}
      style={{ display: "block", overflow: "visible" }}
    >
      {/* ---- veille drift: whole cube eases down a touch when asleep ---- */}
      <g className={`mascot-cube mascot-cube--${state}`}>
        {/* beret (sits on the back-top edge) */}
        <g className="mascot-beret">
          <ellipse cx="118" cy="44" rx="62" ry="20" fill="var(--gnu-beret)" />
          <ellipse cx="116" cy="39" rx="50" ry="13" fill="#6F9162" />
          <circle cx="160" cy="34" r="5.5" fill="var(--gnu-beret-700)" />
        </g>

        {/* antenna */}
        <line x1="196" y1="70" x2="208" y2="30" stroke="var(--gnu-stone)" strokeWidth="6" strokeLinecap="round" />
        <circle className="mascot-antenna-tip" cx="209" cy="27" r="7" fill="var(--gnu-line)" />

        {/* cube — top + left (orange), face (anthracite) */}
        <polygon points="66,70 128,36 190,70 128,104" fill={accent} />
        <polygon points="60,82 122,117 122,185 60,150" fill={accent} />
        <polygon points="60,82 70,76 70,144 60,150" fill="var(--gnu-orange-700)" opacity="0.6" />
        <polygon points="134,117 196,82 196,150 134,185" fill="var(--gnu-anthracite)" />

        {/* prompt glyph */}
        <g
          className="mascot-prompt"
          fill="none"
          stroke="var(--gnu-shell)"
          strokeWidth="11"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="150,118 166,134 150,150" />
          <line x1="168" y1="158" x2="186" y2="158" />
        </g>
      </g>

      {/* ---- LISTENING: concentric antenna arcs ---- */}
      {state === "listening" && (
        <g fill="none" stroke={accent} strokeWidth="6" strokeLinecap="round">
          <path className="mascot-arc mascot-arc--1" d="M222 8 q22 22 0 44" />
          <path className="mascot-arc mascot-arc--2" d="M238 -4 q34 34 0 68" />
        </g>
      )}

      {/* ---- TRANSMIT: orange ping expanding from the face ---- */}
      {state === "transmit" && (
        <>
          <circle className="mascot-ping mascot-ping--1" cx="128" cy="134" r="40" fill="none" stroke={accent} strokeWidth="4" />
          <circle className="mascot-ping mascot-ping--2" cx="128" cy="134" r="40" fill="none" stroke={accent} strokeWidth="3" />
        </>
      )}

      {/* ---- VEILLE: Zz drifting up ---- */}
      {state === "veille" && (
        <g fill="var(--gnu-shell)" fontFamily="IBM Plex Mono, monospace" fontWeight="700">
          <text className="mascot-z mascot-z--1" x="196" y="60" fontSize="26">Z</text>
          <text className="mascot-z mascot-z--2" x="180" y="78" fontSize="18">z</text>
        </g>
      )}
    </svg>
  );
}

window.GnosisMascot = GnosisMascot;
