// motion-tokens.jsx
// Gnu.In-Shell motion language — neutral tokens + per-platform mappings.
// Atomic-age tone : léger overshoot, courbes chaudes, durées maîtrisées.
// Mapping : neutral → CSS / QML (Quickshell) / Qt C++ / Flutter.

// ── DURATIONS (ms) ───────────────────────────────────────────────────
const MDUR = {
  instant: 60,   // press flicker, particle birth
  flash:   100,  // press depress, accent strobe
  fast:    140,  // hover row→row, magnetic snap
  base:    200,  // entrance baseline (user-tuned)
  smooth:  280,  // mask reveal (full)
  slow:    360,  // hero entrance, mega panel
  unfurl:  420,  // sub-cascade with stagger
  pulse:   1400, // ambient listening
  idle:    3200, // slow breathing
};

// ── EASING TABLE ─────────────────────────────────────────────────────
// Each curve carries bezier coordinates (canonical) + names for each engine.
const MEASE = {
  standard:  { bz: [0.20, 0.70, 0.20, 1.00], qt: 'OutCubic',    flutter: 'Curves.easeOutCubic',    label: 'standard' },
  decel:     { bz: [0.16, 1.00, 0.30, 1.00], qt: 'OutExpo',     flutter: 'Curves.easeOutExpo',     label: 'décel · entrée' },
  accel:     { bz: [0.70, 0.00, 0.84, 0.00], qt: 'InExpo',      flutter: 'Curves.easeInExpo',      label: 'accel · sortie' },
  snap:      { bz: [0.40, 0.00, 0.20, 1.00], qt: 'InOutCubic',  flutter: 'Curves.easeInOutCubic',  label: 'snap · commit' },
  gentle:    { bz: [0.32, 0.72, 0.32, 1.00], qt: 'OutQuad',     flutter: 'Curves.easeOutQuad',     label: 'doux · hover' },
  overshoot: { bz: [0.34, 1.36, 0.64, 1.00], qt: 'OutBack',     flutter: 'Curves.easeOutBack',     label: 'overshoot · atomic' },
  elastic:   { bz: [0.50, 1.55, 0.40, 1.00], qt: 'OutElastic',  flutter: 'Curves.elasticOut',      label: 'élastique · bloom' },
  linear:    { bz: [0.00, 0.00, 1.00, 1.00], qt: 'Linear',      flutter: 'Curves.linear',          label: 'linéaire · pulse' },
};

// ── DISTANCE / DELTA (px) ────────────────────────────────────────────
const MDIST = {
  lift:     4,   // small Y lift on entrance
  slide:    8,   // horizontal slide for sub-cascade
  row:      12,  // per-row cascade offset
  mag:      3,   // magnetic pull toward cursor
  bloom:    52,  // radial deploy for bubble tree
  bounce:   6,   // edge-bounce displacement
  press:    0.96,// press scale ratio
};

// ── PERFORMANCE TIERS ────────────────────────────────────────────────
// Used to flag each atom/molecule for engine planning.
const MPERF = {
  light:  { label: 'LIGHT',  gpu: 0.05, cost: 'transform + opacity only' },
  medium: { label: 'MED',    gpu: 0.25, cost: 'clip-path / blur / filter' },
  heavy:  { label: 'HEAVY',  gpu: 0.55, cost: 'backdrop-filter / shader / multiple compositing layers' },
};

// ── REDUCED-MOTION POLICY ────────────────────────────────────────────
// For every atom we declare a reduced-motion fallback: usually opacity-only,
// duration halved, no overshoot, no blur.
const MRM = {
  duration:    (ms) => Math.max(60, Math.round(ms * 0.55)),
  preferEase:  'gentle',
  dropEffects: ['blur', 'origami', 'liquid', 'particle', 'dither-shift', 'overshoot'],
};

// ── AUDIO CUE PLACEHOLDERS ───────────────────────────────────────────
// Each cue points at a sample-name slot ; the shell is expected to provide
// the actual asset. Volume target -22 LUFS, duration ≤ 180ms.
const MAUDIO = {
  open:    { id: 'cue.menu.open',    vol: -22, dur: 120, character: 'soft cassette click' },
  close:   { id: 'cue.menu.close',   vol: -24, dur: 100, character: 'short retract' },
  hover:   { id: 'cue.menu.hover',   vol: -32, dur:  40, character: 'low blip' },
  commit:  { id: 'cue.menu.commit',  vol: -18, dur: 140, character: 'mechanical clack' },
  subOpen: { id: 'cue.menu.sub',     vol: -26, dur: 110, character: 'paper unfold' },
  error:   { id: 'cue.menu.error',   vol: -20, dur: 180, character: 'damped thud' },
  idle:    null,
};

// ── BEZIER UTILITIES ─────────────────────────────────────────────────
// Cubic-bezier evaluator: returns y given t in [0,1] via Newton-Raphson on x.
function bezierY(p1x, p1y, p2x, p2y, t) {
  // Find s such that bezier-X(s) = t, then return bezier-Y(s).
  const sampleX = (s) => 3 * (1 - s) ** 2 * s * p1x + 3 * (1 - s) * s ** 2 * p2x + s ** 3;
  const sampleY = (s) => 3 * (1 - s) ** 2 * s * p1y + 3 * (1 - s) * s ** 2 * p2y + s ** 3;
  let s = t;
  for (let i = 0; i < 8; i++) {
    const x = sampleX(s) - t;
    const dx = 3 * (1 - s) ** 2 * p1x + 6 * (1 - s) * s * (p2x - p1x) + 3 * s ** 2 * (1 - p2x);
    if (Math.abs(dx) < 1e-6) break;
    s -= x / dx;
    s = Math.max(0, Math.min(1, s));
  }
  return sampleY(s);
}

// Easing lookup → function t∈[0,1] → 0..1
function mEase(name) {
  const e = MEASE[name] || MEASE.standard;
  const [a, b, c, d] = e.bz;
  return (t) => bezierY(a, b, c, d, Math.max(0, Math.min(1, t)));
}

// interp helper
function lerp(a, b, t) { return a + (b - a) * t; }

// Phase helper: given start (ms), end (ms), current time (ms) → 0..1 clamped
function phase(start, end, now) {
  if (now <= start) return 0;
  if (now >= end) return 1;
  return (now - start) / (end - start);
}

// ── PER-PLATFORM SNIPPETS ────────────────────────────────────────────
// Build code strings from a high-level spec. Spec shape :
//   { prop: 'opacity' | 'translateY' | 'scale' | 'clip-radius' | ...
//     from, to, dur (ms), ease (key in MEASE), delay (ms), target? }

function snipCSS(s) {
  const e = MEASE[s.ease] || MEASE.standard;
  const bz = `cubic-bezier(${e.bz.join(', ')})`;
  const delay = s.delay ? ` ${s.delay}ms` : '';
  // Use CSS @keyframes for from-to clarity.
  const propMap = {
    opacity:    { kf: (v) => `opacity:${v}` },
    translateY: { kf: (v) => `transform:translateY(${v}px)` },
    translateX: { kf: (v) => `transform:translateX(${v}px)` },
    scale:      { kf: (v) => `transform:scale(${v})` },
    blur:       { kf: (v) => `filter:blur(${v}px)` },
  };
  const pm = propMap[s.prop] || { kf: (v) => `${s.prop}:${v}` };
  const name = `${s.prop}-${s.from}-${s.to}`.replace(/[^a-z0-9]/gi, '_');
  return `@keyframes ${name} {
  from { ${pm.kf(s.from)}; }
  to   { ${pm.kf(s.to)};   }
}
.menu-entry {
  animation: ${name} ${s.dur}ms ${bz}${delay} both;
}`;
}

function snipQML(s) {
  const e = MEASE[s.ease] || MEASE.standard;
  const propMap = {
    opacity:    'opacity',
    translateY: 'y',
    translateX: 'x',
    scale:      'scale',
    blur:       'layer.effect.radius',
  };
  const target = propMap[s.prop] || s.prop;
  const delay = s.delay ? `
        PauseAnimation { duration: ${s.delay} }` : '';
  return `// Quickshell / QML
PropertyAnimation {
    target: menuRoot
    property: "${target}"
    from: ${s.from}
    to:   ${s.to}
    duration: ${s.dur}
    easing.type: Easing.${e.qt}${delay}
}
// or declaratively, for a state change :
Behavior on ${target} {
    NumberAnimation {
        duration: ${s.dur}
        easing.type: Easing.${e.qt}
    }
}`;
}

function snipQt(s) {
  const e = MEASE[s.ease] || MEASE.standard;
  const propMap = {
    opacity:    'windowOpacity',
    translateY: 'pos',
    scale:      'geometry',
    blur:       'graphicsEffect',
  };
  const prop = propMap[s.prop] || s.prop;
  return `// Qt C++ / QWidget
auto* a = new QPropertyAnimation(menu, "${prop}");
a->setDuration(${s.dur});
a->setEasingCurve(QEasingCurve::${e.qt});
a->setStartValue(${s.from});
a->setEndValue(${s.to});${s.delay ? `
QTimer::singleShot(${s.delay}, [=]{ a->start(); });` : `
a->start(QAbstractAnimation::DeleteWhenStopped);`}`;
}

function snipFlutter(s) {
  const e = MEASE[s.ease] || MEASE.standard;
  const delay = s.delay ? `
  await Future.delayed(const Duration(milliseconds: ${s.delay}));` : '';
  return `// Flutter
final controller = AnimationController(
  vsync: this,
  duration: const Duration(milliseconds: ${s.dur}),
);
final tween = Tween<double>(begin: ${s.from}, end: ${s.to}).animate(
  CurvedAnimation(parent: controller, curve: ${e.flutter}),
);${delay}
controller.forward();
// In build():
// return AnimatedBuilder(animation: tween, builder: (_, __) =>
//   Transform.${s.prop === 'scale' ? 'scale' : 'translate'}(...) );`;
}

function snipNeutral(s) {
  const e = MEASE[s.ease] || MEASE.standard;
  return `# Gnu.In · token spec
prop:     ${s.prop}
from:     ${s.from}
to:       ${s.to}
duration: ${s.dur}ms        # MDUR.${invKey(MDUR, s.dur) || '—'}
easing:   ${s.ease}         # cubic-bezier(${e.bz.join(', ')})
delay:    ${s.delay || 0}ms
# Behavior:
#   on activation, ${s.prop} interpolates from→to over duration, eased.
#   For reverse (close), swap from/to and switch ease → 'accel'.`;
}

function invKey(obj, value) {
  for (const k of Object.keys(obj)) if (obj[k] === value) return k;
  return null;
}

// Aggregate snippet bundle for one transition.
function snipAll(s) {
  return {
    neutral: snipNeutral(s),
    css:     snipCSS(s),
    qml:     snipQML(s),
    qt:      snipQt(s),
    flutter: snipFlutter(s),
  };
}

Object.assign(window, {
  MDUR, MEASE, MDIST, MPERF, MRM, MAUDIO,
  mEase, lerp, phase, bezierY,
  snipCSS, snipQML, snipQt, snipFlutter, snipNeutral, snipAll,
});
