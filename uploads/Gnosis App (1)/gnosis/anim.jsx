/* global React */
// ============================================================================
// gnosis/anim.jsx — reusable micro-animation wrappers for the Gnosis HUD.
// Each abstracts one motion primitive from the GNU.IN motion grammar.
// Keyframes live in the host <style>; these components own the choreography.
// ============================================================================
const { useEffect, useState, useRef } = React;

// ---- Fade -----------------------------------------------------------------
// Opacity 0 -> 1 (or back), standard ease. Pass `show` to drive it.
function Fade({ show = true, duration = 360, delay = 0, children, style = {}, className = "" }) {
  return (
    <div
      className={className}
      style={{
        opacity: show ? 1 : 0,
        transition: `opacity ${duration}ms var(--ease-standard) ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ---- ScalePop -------------------------------------------------------------
// Entrance: scale 0.15 -> 1.0 + fade, emphatic ease with soft overshoot.
// Mirrors the mascot's LIFT -> REVEAL -> SETTLE choreography.
function ScalePop({ children, duration = 500, origin = "top center", style = {} }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setOn(true), 60);
    return () => clearTimeout(id);
  }, []);
  return (
    <div
      style={{
        transform: on ? "scale(1)" : "scale(0.15)",
        opacity: on ? 1 : 0,
        transformOrigin: origin,
        // M3-Expressive spatial spring — the overshoot is intentional (TASTE §2)
        transition: `transform ${duration}ms var(--ease-expressive), opacity ${Math.round(
          duration * 0.5
        )}ms var(--ease-expressive-effects)`,
        willChange: "transform, opacity",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ---- IdleBreathe ----------------------------------------------------------
// Wraps the mascot in a pulsing concentric ring that activates while the
// agent is listening / scanning. Cadence is the brand --dur-pulse (1400ms).
// Ring is IDENTITY orange (constant), not the dynamic chrome accent.
function IdleBreathe({ active = false, color = "var(--brand-accent)", children }) {
  return (
    <div className="idle-breathe">
      {active && (
        <>
          <span className="breathe-ring" style={{ borderColor: color }} />
          <span className="breathe-ring breathe-ring--2" style={{ borderColor: color }} />
        </>
      )}
      <div className="idle-breathe__core">{children}</div>
    </div>
  );
}

// ---- Pulse ----------------------------------------------------------------
// Soft glow heartbeat for an active control. `active` gates the loop.
function Pulse({ active = false, color = "var(--m3-primary)", radius = "var(--r-pill)", children, style = {} }) {
  return (
    <div
      className={`pulse-wrap${active ? " is-pulsing" : ""}`}
      style={{ "--pulse-color": color, "--pulse-radius": radius, ...style }}
    >
      {children}
    </div>
  );
}

// ---- Spinner --------------------------------------------------------------
// Tiny monoline arc spinner for the SCAN (vision) trigger.
function Spinner({ size = 13, color = "currentColor", stroke = 2 }) {
  return (
    <svg className="gx-spin" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" stroke={color} strokeOpacity="0.25" strokeWidth={stroke} />
      <path
        d="M12 3 a9 9 0 0 1 9 9"
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
      />
    </svg>
  );
}

// ---- RecDot ---------------------------------------------------------------
// Pulsing red recording badge overlay for push-to-talk VOICE.
function RecDot() {
  return <span className="rec-dot" aria-label="recording" />;
}

// ---- Collapse -------------------------------------------------------------
// Height-morphing container: animates max-height with a bezier spline so the
// membrane appears to stretch downward as the feed panel opens.
function Collapse({ open, maxHeight = 240, duration = 500, children }) {
  const ref = useRef(null);
  return (
    <div
      ref={ref}
      className="gx-collapse"
      style={{
        maxHeight: open ? maxHeight : 0,
        opacity: open ? 1 : 0,
        transition: `max-height ${duration}ms var(--ease-expressive), opacity ${Math.round(
          duration * 0.6
        )}ms var(--ease-expressive-effects)`,
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
}

Object.assign(window, { Fade, ScalePop, IdleBreathe, Pulse, Spinner, RecDot, Collapse });
