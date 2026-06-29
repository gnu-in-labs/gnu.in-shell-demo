/* global React */
// ============================================================================
// gnosis/motion.jsx — the canonical Gnu.In Motion Spec tokens, lifted verbatim
// from motion-tokens.jsx (the shipped spec), exposed for JS-driven choreography
// (VRAM count-up, tier-ramp timing). The CSS side lives in sentinel.css; this is
// the SAME source of truth so spec and runtime cannot diverge (Motion Spec §7).
// ============================================================================

// ---- MDUR (ms) ----
const MDUR = { instant: 60, flash: 100, fast: 140, base: 200, smooth: 280, slow: 360, unfurl: 420, pulse: 1400, idle: 3200 };

// ---- MEASE — bezier control points (canonical) ----
const MEASE = {
  standard:  [0.20, 0.70, 0.20, 1.00],
  decel:     [0.16, 1.00, 0.30, 1.00],
  accel:     [0.70, 0.00, 0.84, 0.00],
  snap:      [0.40, 0.00, 0.20, 1.00],
  gentle:    [0.32, 0.72, 0.32, 1.00],
  overshoot: [0.34, 1.36, 0.64, 1.00],
  elastic:   [0.50, 1.55, 0.40, 1.00],
};

// cubic-bezier evaluator (Newton-Raphson on x) — from motion-tokens.jsx
function bezierY(p1x, p1y, p2x, p2y, t) {
  const sampleX = (s) => 3 * (1 - s) ** 2 * s * p1x + 3 * (1 - s) * s ** 2 * p2x + s ** 3;
  const sampleY = (s) => 3 * (1 - s) ** 2 * s * p1y + 3 * (1 - s) * s ** 2 * p2y + s ** 3;
  let s = t;
  for (let i = 0; i < 8; i++) {
    const x = sampleX(s) - t;
    const dx = 3 * (1 - s) ** 2 * p1x + 6 * (1 - s) * s * (p2x - p1x) + 3 * s ** 2 * (1 - p2x);
    if (Math.abs(dx) < 1e-6) break;
    s -= x / dx; s = Math.max(0, Math.min(1, s));
  }
  return sampleY(s);
}
const mEase = (name) => { const e = MEASE[name] || MEASE.standard; return (t) => bezierY(e[0], e[1], e[2], e[3], Math.max(0, Math.min(1, t))); };

// ---- useTween — animate a number toward `target` on a named curve ----
// Drives the VRAM budget readout so the figure RAMPS with the same elastic
// curve the bar fill uses, instead of snapping.
function useTween(target, { dur = MDUR.slow, ease = "elastic" } = {}) {
  const { useState, useRef, useEffect } = React;
  const [val, setVal] = useState(target);
  const fromRef = useRef(target);
  const rafRef = useRef(0);
  useEffect(() => {
    const from = fromRef.current;
    if (from === target) return;
    const fn = mEase(ease);
    const t0 = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - t0) / dur);
      const v = from + (target - from) * fn(p);
      setVal(v);
      if (p < 1) rafRef.current = requestAnimationFrame(step);
      else { fromRef.current = target; setVal(target); }
    };
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, dur, ease]);
  return val;
}

Object.assign(window, { MDUR, MEASE, mEase, bezierY, useTween });
