// motion-atoms.jsx
// Quinze primitives ("atomes") d'animation pour Gnu.In-Shell.
// Chaque atome :
//   • un composant <Demo*> piloté par useMotionTime() (boucle + scrubber)
//   • un panneau spec rendu via SpecPanel + tokens + snippets multi-moteurs
//   • un helper renderAtomCard() qui produit l'<AssetCard> complet.

// ── Helpers de démo ──────────────────────────────────────────────────

// Sample menu rectangle for atoms that act on a "menu".
function SampleMenu({ theme, w = 220, h = 132, label = 'SAMPLE', rows = 4, style }) {
  const tx = theme || gnuTheme({ dark: false, brand: 'medium' });
  return (
    <div style={{
      width: w, height: h, background: tx.surface, color: tx.text,
      borderRadius: 12, border: `.5px solid ${tx.border}`, boxShadow: tx.shadow,
      padding: 10, position: 'relative', overflow: 'hidden',
      fontFamily: 'ui-sans-serif, system-ui, sans-serif',
      ...style,
    }}>
      <div style={{ fontSize: 8, fontFamily: 'ui-monospace, monospace', fontWeight: 700, color: tx.accent, letterSpacing: '0.12em' }}>{label}</div>
      <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, height: 16 }}>
            <span style={{ width: 10, height: 10, background: tx.accent, opacity: 0.6, borderRadius: 2 }} />
            <span style={{ flex: 1, height: 5, background: tx.border, borderRadius: 2 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function StageBg({ theme }) {
  const tx = theme;
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: tx.mode === 'dark'
          ? 'radial-gradient(120% 80% at 30% 30%, #1A1F26 0%, #0B0D10 70%)'
          : 'radial-gradient(120% 80% at 30% 30%, #FBF7EE 0%, #E5DFD2 80%)',
      }} />
    </div>
  );
}

// SVG cursor at logical x, y
function MiniCursor({ x, y, theme }) {
  return (
    <svg style={{ position: 'absolute', left: x - 2, top: y - 2, pointerEvents: 'none', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,.4))', zIndex: 9 }} width="18" height="22" viewBox="0 0 18 22">
      <path d="M2 1 L2 17 L6.5 13 L9 18 L12 16.5 L9.5 11.5 L15 11 Z" fill={theme.mode === 'dark' ? '#fff' : '#000'} stroke={theme.mode === 'dark' ? '#000' : '#fff'} strokeWidth="1" strokeLinejoin="round"/>
    </svg>
  );
}

// ════════════════════════════════════════════════════════════════════
// A.01 — FADE
// ════════════════════════════════════════════════════════════════════
function DemoFade({ theme }) {
  const { p } = useSubTimeline(0, MDUR.base);
  const v = mEase('standard')(p);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <StageBg theme={theme} />
      <div style={{ position: 'absolute', left: 250, top: 110, opacity: v }}>
        <SampleMenu theme={theme} label="FADE" />
      </div>
      <div style={{ position: 'absolute', left: 250, top: 260, fontFamily: 'ui-monospace, monospace', fontSize: 11, color: theme.textDim }}>
        opacity 0 → 1 · {MDUR.base}ms
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// A.02 — SCALE
// ════════════════════════════════════════════════════════════════════
function DemoScale({ theme }) {
  const { p } = useSubTimeline(0, MDUR.base);
  const v = mEase('overshoot')(p);
  const s = lerp(0.86, 1, v);
  const o = lerp(0, 1, mEase('standard')(p));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <StageBg theme={theme} />
      <div style={{ position: 'absolute', left: 250, top: 110, opacity: o, transform: `scale(${s})`, transformOrigin: '0 0' }}>
        <SampleMenu theme={theme} label="SCALE" />
      </div>
      <div style={{ position: 'absolute', left: 250, top: 260, fontFamily: 'ui-monospace, monospace', fontSize: 11, color: theme.textDim }}>
        scale 0.86 → 1.00 (overshoot ↑3%) · {MDUR.base}ms
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// A.03 — TRANSLATE (Y-lift)
// ════════════════════════════════════════════════════════════════════
function DemoTranslate({ theme }) {
  const { p } = useSubTimeline(0, MDUR.base);
  const ey = mEase('decel')(p);
  const eo = mEase('standard')(p);
  const y = lerp(MDIST.lift + 4, 0, ey);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <StageBg theme={theme} />
      <div style={{ position: 'absolute', left: 250, top: 110, opacity: eo, transform: `translateY(${y}px)` }}>
        <SampleMenu theme={theme} label="LIFT" />
      </div>
      <div style={{ position: 'absolute', left: 250, top: 260, fontFamily: 'ui-monospace, monospace', fontSize: 11, color: theme.textDim }}>
        translateY +{MDIST.lift + 4}px → 0 · ease=decel · {MDUR.base}ms
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// A.04 — MASK REVEAL (clip-path circle from cursor origin)
// ════════════════════════════════════════════════════════════════════
function DemoMaskReveal({ theme }) {
  const { p } = useSubTimeline(0, MDUR.smooth);
  const v = mEase('decel')(p);
  const r = `${v * 160}%`;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <StageBg theme={theme} />
      <div style={{
        position: 'absolute', left: 250, top: 110,
        clipPath: `circle(${r} at 16px 16px)`, WebkitClipPath: `circle(${r} at 16px 16px)`,
        transform: `scale(${0.97 + v * 0.03})`, transformOrigin: '16px 16px',
        opacity: 0.4 + v * 0.6,
      }}>
        <SampleMenu theme={theme} label="MASK" />
      </div>
      <MiniCursor x={258} y={118} theme={theme} />
      <div style={{ position: 'absolute', left: 250, top: 260, fontFamily: 'ui-monospace, monospace', fontSize: 11, color: theme.textDim }}>
        clip-path circle 0 → 160% at cursor · scale 0.97 → 1.00
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// A.05 — BLUR
// ════════════════════════════════════════════════════════════════════
function DemoBlur({ theme }) {
  const { p } = useSubTimeline(0, MDUR.base);
  const v = mEase('decel')(p);
  const blur = lerp(8, 0, v);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <StageBg theme={theme} />
      <div style={{ position: 'absolute', left: 250, top: 110, opacity: lerp(0.4, 1, v), filter: `blur(${blur}px)` }}>
        <SampleMenu theme={theme} label="BLUR" />
      </div>
      <div style={{ position: 'absolute', left: 250, top: 260, fontFamily: 'ui-monospace, monospace', fontSize: 11, color: theme.textDim }}>
        filter:blur 8px → 0 · GPU-bound
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// A.06 — DITHER SHIFT (motif animé qui s'éclaircit)
// ════════════════════════════════════════════════════════════════════
function DemoDitherShift({ theme }) {
  const { t } = useMotionTime();
  const { p } = useSubTimeline(0, MDUR.smooth);
  const op = lerp(0.45, 0.08, mEase('decel')(p));
  const shift = (t / 1000) * 8;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <StageBg theme={theme} />
      <div style={{ position: 'absolute', left: 250, top: 110, width: 220, height: 132, borderRadius: 12, overflow: 'hidden', background: theme.surface, border: `.5px solid ${theme.border}`, boxShadow: theme.shadow }}>
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: op }}>
          <defs>
            <pattern id="d-atom" x={shift} y={shift} width="6" height="6" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r=".9" fill={theme.accent} />
              <circle cx="4" cy="4" r=".6" fill={theme.accent} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#d-atom)" />
        </svg>
        <div style={{ position: 'absolute', left: 12, top: 12, fontSize: 9, fontFamily: 'ui-monospace, monospace', color: theme.accent, fontWeight: 700, letterSpacing: '0.1em' }}>DITHER</div>
        <div style={{ position: 'absolute', left: 12, bottom: 12, right: 12, fontSize: 10, color: theme.textDim }}>opacity {op.toFixed(2)} · drift +{shift.toFixed(1)}px</div>
      </div>
      <div style={{ position: 'absolute', left: 250, top: 260, fontFamily: 'ui-monospace, monospace', fontSize: 11, color: theme.textDim }}>
        pattern 0.45 → 0.08 + drift linéaire infini
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// A.07 — ORIGAMI FOLD (perspective rotateX)
// ════════════════════════════════════════════════════════════════════
function DemoOrigami({ theme }) {
  const { p } = useSubTimeline(0, MDUR.smooth);
  const v = mEase('overshoot')(p);
  const rx = lerp(-72, 0, v);
  const o = lerp(0, 1, mEase('standard')(p));
  return (
    <div style={{ position: 'absolute', inset: 0, perspective: 900, perspectiveOrigin: '50% 0%' }}>
      <StageBg theme={theme} />
      <div style={{ position: 'absolute', left: 250, top: 110, transform: `rotateX(${rx}deg)`, transformOrigin: 'top center', opacity: o, transformStyle: 'preserve-3d' }}>
        <SampleMenu theme={theme} label="ORIGAMI" />
      </div>
      <div style={{ position: 'absolute', left: 250, top: 260, fontFamily: 'ui-monospace, monospace', fontSize: 11, color: theme.textDim }}>
        rotateX −72° → 0 · perspective 900 · ease=overshoot
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// A.08 — REFRACTION / GLASS WARP
// ════════════════════════════════════════════════════════════════════
function DemoRefraction({ theme }) {
  const { p } = useSubTimeline(0, MDUR.smooth);
  const v = mEase('decel')(p);
  const blur = lerp(2, 18, v);
  const lensR = lerp(28, 100, v);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <StageBg theme={theme} />
      {/* sample content behind the lens */}
      <div style={{ position: 'absolute', left: 220, top: 100, width: 280, height: 160, borderRadius: 8, background: `repeating-linear-gradient(45deg, ${theme.accent}33 0 8px, transparent 8px 16px)`, opacity: 0.7 }} />
      {/* refraction lens */}
      <div style={{
        position: 'absolute', left: 360 - lensR, top: 180 - lensR, width: lensR * 2, height: lensR * 2,
        borderRadius: '50%', background: theme.mode === 'dark' ? 'rgba(17,20,24,.55)' : 'rgba(255,255,255,.55)',
        backdropFilter: `blur(${blur}px) saturate(${1 + v * 0.6})`,
        WebkitBackdropFilter: `blur(${blur}px) saturate(${1 + v * 0.6})`,
        border: `.5px solid ${theme.border}`, boxShadow: theme.shadow,
      }} />
      <div style={{ position: 'absolute', left: 250, top: 290, fontFamily: 'ui-monospace, monospace', fontSize: 11, color: theme.textDim }}>
        backdrop-filter blur 2 → 18 · lens Ø {Math.round(lensR * 2)}px
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// A.09 — PARTICLE BURST
// ════════════════════════════════════════════════════════════════════
function DemoParticle({ theme }) {
  const { p } = useSubTimeline(0, MDUR.smooth + 100);
  const N = 9;
  const parts = React.useMemo(() => Array.from({ length: N }, (_, i) => {
    const a = (i / N) * Math.PI * 2 + 0.3;
    return { a, d: 30 + (i % 3) * 6, r: 1.2 + (i % 2) * 0.6 };
  }), []);
  const cx = 360, cy = 180;
  const ev = mEase('decel')(p);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <StageBg theme={theme} />
      <div style={{
        position: 'absolute', left: cx - 18, top: cy - 18, width: 36, height: 36,
        borderRadius: 18, background: theme.accent, opacity: 1 - p,
        transform: `scale(${1 + p * 0.4})`, boxShadow: `0 0 0 ${p * 16}px ${theme.accent}22`,
      }} />
      <svg style={{ position: 'absolute', left: 0, top: 0, width: 720, height: 360, overflow: 'visible', pointerEvents: 'none' }}>
        {parts.map((pt, i) => {
          const x = cx + Math.cos(pt.a) * pt.d * ev;
          const y = cy + Math.sin(pt.a) * pt.d * ev;
          return <circle key={i} cx={x} cy={y} r={pt.r * (1 - p * 0.6)} fill={theme.accent} opacity={1 - p} />;
        })}
      </svg>
      <div style={{ position: 'absolute', left: 250, top: 290, fontFamily: 'ui-monospace, monospace', fontSize: 11, color: theme.textDim }}>
        9 particules · radius 30→40px · ease=decel · {MDUR.smooth + 100}ms
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// A.10 — PULSE / BREATHE
// ════════════════════════════════════════════════════════════════════
function DemoPulse({ theme }) {
  const { t } = useMotionTime();
  const cycle = (t % MDUR.pulse) / MDUR.pulse;
  // breath: 0..1..0 over the period.
  const breath = 0.5 - 0.5 * Math.cos(cycle * Math.PI * 2);
  const ringR = lerp(28, 56, breath);
  const ringOp = lerp(0.4, 0.05, breath);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <StageBg theme={theme} />
      <div style={{ position: 'absolute', left: 360 - 28, top: 180 - 28, width: 56, height: 56, borderRadius: 28, background: theme.accent, opacity: 0.9, boxSizing: 'border-box' }} />
      <div style={{
        position: 'absolute', left: 360 - ringR, top: 180 - ringR,
        width: ringR * 2, height: ringR * 2, borderRadius: ringR,
        border: `2px solid ${theme.accent}`, opacity: ringOp,
        boxSizing: 'border-box',
      }} />
      <div style={{ position: 'absolute', left: 250, top: 290, fontFamily: 'ui-monospace, monospace', fontSize: 11, color: theme.textDim }}>
        rayon 28 → 56 · cosine · period {MDUR.pulse}ms
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// A.11 — TYPE-ON
// ════════════════════════════════════════════════════════════════════
function DemoTypeOn({ theme }) {
  const text = '>_ context loaded · ready';
  const { p } = useSubTimeline(0, MDUR.unfurl);
  const n = Math.floor(p * text.length);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <StageBg theme={theme} />
      <div style={{ position: 'absolute', left: 200, top: 150, width: 320, padding: 14, borderRadius: 8, background: theme.surface, border: `.5px solid ${theme.border}`, boxShadow: theme.shadow, fontFamily: 'ui-monospace, "JetBrains Mono", monospace', fontSize: 14, color: theme.text }}>
        {text.slice(0, n)}<span style={{ background: theme.accent, color: theme.accent, opacity: (n < text.length || (Date.now() % 600 > 300)) ? 1 : 0 }}>_</span>
      </div>
      <div style={{ position: 'absolute', left: 250, top: 250, fontFamily: 'ui-monospace, monospace', fontSize: 11, color: theme.textDim }}>
        {text.length} chars over {MDUR.unfurl}ms · linear
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// A.12 — MAGNETIC SNAP (rows pulled toward cursor)
// ════════════════════════════════════════════════════════════════════
function DemoMagnetic({ theme }) {
  const { t } = useMotionTime();
  // Animate cursor up/down across rows
  const cursorY = 100 + (1 + Math.sin(t / 700)) * 80;
  const rows = [70, 110, 150, 190, 230];
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <StageBg theme={theme} />
      <div style={{ position: 'absolute', left: 250, top: 60, width: 220, padding: 8, borderRadius: 12, background: theme.surface, border: `.5px solid ${theme.border}`, boxShadow: theme.shadow }}>
        {rows.map((rowY, i) => {
          const dy = cursorY - rowY;
          const dist = Math.abs(dy);
          const pull = Math.max(0, 1 - dist / 70);
          const x = -Math.sign(dy) * 0 + pull * MDIST.mag;
          const hover = dist < 12;
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 8, height: 28, padding: '0 10px',
              borderRadius: 6, background: hover ? theme.accent : 'transparent',
              color: hover ? '#fff' : theme.text,
              transform: `translateX(${x.toFixed(2)}px)`,
              transition: 'background .08s linear',
            }}>
              <span style={{ width: 10, height: 10, background: hover ? '#fff' : theme.accent, opacity: 0.7, borderRadius: 2 }} />
              <span style={{ fontSize: 11 }}>row {i + 1}</span>
            </div>
          );
        })}
      </div>
      <MiniCursor x={420} y={cursorY + 14} theme={theme} />
      <div style={{ position: 'absolute', left: 250, top: 300, fontFamily: 'ui-monospace, monospace', fontSize: 11, color: theme.textDim }}>
        attraction max ±{MDIST.mag}px · falloff 70px
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// A.13 — LIQUID MORPH (border-radius corners morph)
// ════════════════════════════════════════════════════════════════════
function DemoLiquid({ theme }) {
  const { t } = useMotionTime();
  const cycle = (t % MDUR.unfurl) / MDUR.unfurl;
  const phase = 0.5 - 0.5 * Math.cos(cycle * Math.PI * 2);
  const r1 = lerp(12, 80, phase);
  const r2 = lerp(80, 12, phase);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <StageBg theme={theme} />
      <div style={{
        position: 'absolute', left: 280, top: 110, width: 160, height: 160,
        background: theme.accent,
        borderRadius: `${r1}% ${r2}% ${r1}% ${r2}% / ${r2}% ${r1}% ${r2}% ${r1}%`,
        boxShadow: '0 8px 28px rgba(255,106,0,.4)',
      }} />
      <div style={{ position: 'absolute', left: 250, top: 290, fontFamily: 'ui-monospace, monospace', fontSize: 11, color: theme.textDim }}>
        border-radius asymmetric · cycle {MDUR.unfurl}ms · cosine
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// A.14 — SPRING PHYSICS (damped oscillator)
// ════════════════════════════════════════════════════════════════════
function DemoSpring({ theme }) {
  const { p } = useSubTimeline(0, MDUR.unfurl + 100);
  // Use elastic-out for the visual
  const v = mEase('elastic')(p);
  const x = lerp(120, 0, v); // travels from +120px to 0
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <StageBg theme={theme} />
      <div style={{ position: 'absolute', left: 200 + x, top: 130 }}>
        <SampleMenu theme={theme} label="SPRING" w={200} h={108} rows={3} />
      </div>
      {/* path trail */}
      <svg style={{ position: 'absolute', left: 0, top: 0, width: 720, height: 360, pointerEvents: 'none' }}>
        <line x1={320} y1={180} x2={320 + x} y2={180} stroke={theme.accent} strokeWidth="1.5" strokeDasharray="2 3" opacity="0.4" />
        <circle cx={320} cy={180} r="3" fill={theme.accent} opacity="0.5" />
      </svg>
      <div style={{ position: 'absolute', left: 250, top: 290, fontFamily: 'ui-monospace, monospace', fontSize: 11, color: theme.textDim }}>
        elastic-out · stiffness ≈ 220 · damping ≈ 18
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// A.15 — STAGGER (rows arriving in sequence)
// ════════════════════════════════════════════════════════════════════
function DemoStagger({ theme }) {
  const { t } = useMotionTime();
  const ROWS = 6;
  const PER = 32; // ms delay between rows
  const DUR = MDUR.base;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <StageBg theme={theme} />
      <div style={{ position: 'absolute', left: 250, top: 80, width: 220, padding: 10, borderRadius: 12, background: theme.surface, border: `.5px solid ${theme.border}`, boxShadow: theme.shadow }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {Array.from({ length: ROWS }).map((_, i) => {
            const start = i * PER;
            const p = Math.max(0, Math.min(1, (t - start) / DUR));
            const v = mEase('decel')(p);
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 8, height: 22, padding: '0 8px',
                opacity: v, transform: `translateY(${lerp(8, 0, v)}px)`,
                background: 'transparent', borderRadius: 4,
              }}>
                <span style={{ width: 10, height: 10, background: theme.accent, opacity: 0.6, borderRadius: 2 }} />
                <span style={{ flex: 1, height: 5, background: theme.border, borderRadius: 2 }} />
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ position: 'absolute', left: 250, top: 280, fontFamily: 'ui-monospace, monospace', fontSize: 11, color: theme.textDim }}>
        {ROWS} rows · stagger {PER}ms · row dur {DUR}ms · total {ROWS * PER + DUR}ms
      </div>
    </div>
  );
}

// ── Atom registry ────────────────────────────────────────────────────
// Each entry holds the data needed to render its AssetCard.
const ATOMS = [
  { id: 'A.01', title: 'Fade', sub: 'Opacité 0 → 1. La base.', demo: DemoFade,
    dur: MDUR.base, ease: 'standard', delta: '0 → 1', perf: 'light',
    audio: 'open', why: 'Présence simple. Toujours combiné à un autre atome — jamais seul (sauf reduced-motion).',
    spec: { prop: 'opacity', from: 0, to: 1, dur: MDUR.base, ease: 'standard' }, rm: 'dur ½ · ease gentle' },
  { id: 'A.02', title: 'Scale', sub: 'Échelle 0.86 → 1.00. Légère prise de corps.', demo: DemoScale,
    dur: MDUR.base, ease: 'overshoot', delta: '0.86 → 1.00', perf: 'light',
    audio: 'open', why: 'L\'overshoot atomic-age est ici. Pic 1.03 avant retour 1.00.',
    spec: { prop: 'scale', from: 0.86, to: 1, dur: MDUR.base, ease: 'overshoot' }, rm: 'ease standard · pas d\'overshoot' },
  { id: 'A.03', title: 'Translate · Y-lift', sub: 'Y +8 → 0. Soulèvement vertical.', demo: DemoTranslate,
    dur: MDUR.base, ease: 'decel', delta: '+8px → 0', perf: 'light',
    audio: 'open', why: 'Direction du mouvement = origine du menu. Toujours vers le curseur.',
    spec: { prop: 'translateY', from: 8, to: 0, dur: MDUR.base, ease: 'decel' }, rm: 'delta réduit à +4 · dur ½' },
  { id: 'A.04', title: 'Mask reveal', sub: 'clip-path circle depuis le curseur · signature Gnu.In', demo: DemoMaskReveal,
    dur: MDUR.smooth, ease: 'decel', delta: '0% → 160%', perf: 'medium',
    audio: 'open', why: 'L\'origine du clip est le curseur — le menu naît exactement où le clic a eu lieu.',
    spec: { prop: 'clip-radius', from: 0, to: 160, dur: MDUR.smooth, ease: 'decel' }, rm: 'remplacé par fade simple' },
  { id: 'A.05', title: 'Blur', sub: 'filter:blur 8 → 0. Mise au point.', demo: DemoBlur,
    dur: MDUR.base, ease: 'decel', delta: '8px → 0', perf: 'heavy',
    audio: null, why: 'GPU-bound — éviter sur Wayland sans compositor blur natif.',
    spec: { prop: 'blur', from: 8, to: 0, dur: MDUR.base, ease: 'decel' }, rm: 'désactivé — fade pur' },
  { id: 'A.06', title: 'Dither shift', sub: 'motif halftone qui s\'éclaircit + dérive', demo: DemoDitherShift,
    dur: MDUR.smooth, ease: 'decel', delta: 'opacity 0.45 → 0.08 + drift 8px/s', perf: 'light',
    audio: null, why: 'Couche d\'identité atomic-age — toujours présente derrière le contenu, ne sort jamais au premier plan.',
    spec: { prop: 'pattern-opacity', from: 0.45, to: 0.08, dur: MDUR.smooth, ease: 'decel' }, rm: 'statique · pas de drift' },
  { id: 'A.07', title: 'Origami fold', sub: 'rotateX −72° → 0. Pliage 3D autour du haut.', demo: DemoOrigami,
    dur: MDUR.smooth, ease: 'overshoot', delta: '−72° → 0°', perf: 'medium',
    audio: 'subOpen', why: 'Évoque l\'ouverture d\'une fiche papier — réservé aux sous-menus et aux moments solennels.',
    spec: { prop: 'rotateX', from: -72, to: 0, dur: MDUR.smooth, ease: 'overshoot' }, rm: 'plat — translateY seul' },
  { id: 'A.08', title: 'Refraction · glass warp', sub: 'backdrop-filter qui grandit + saturation', demo: DemoRefraction,
    dur: MDUR.smooth, ease: 'decel', delta: 'blur 2 → 18px', perf: 'heavy',
    audio: null, why: 'Suggère que le fond se déforme sous le menu. À fournir un fallback opaque.',
    spec: { prop: 'backdrop-blur', from: 2, to: 18, dur: MDUR.smooth, ease: 'decel' }, rm: 'surface opaque uniforme' },
  { id: 'A.09', title: 'Particle burst', sub: 'gerbe radiale au moment du commit', demo: DemoParticle,
    dur: MDUR.smooth + 100, ease: 'decel', delta: '9 particules · radius 40px', perf: 'medium',
    audio: 'commit', why: 'Récompense visuelle du commit. Jamais à l\'entrée — uniquement à la validation.',
    spec: { prop: 'particles', from: 0, to: 40, dur: MDUR.smooth, ease: 'decel' }, rm: 'flash de luminosité unique · sans particule' },
  { id: 'A.10', title: 'Pulse · breathe', sub: 'respiration ambiante de l\'état listening', demo: DemoPulse,
    dur: MDUR.pulse, ease: 'linear', delta: 'cosine 28 → 56px', perf: 'light',
    audio: null, why: 'Cadence 1400ms = identité Sys.ter. Toujours sur le glyphe assistant — jamais sur le contenu.',
    spec: { prop: 'ring-radius', from: 28, to: 56, dur: MDUR.pulse, ease: 'linear' }, rm: 'désactivé · ring statique' },
  { id: 'A.11', title: 'Type-on', sub: 'texte qui s\'écrit — pour le glyphe prompt', demo: DemoTypeOn,
    dur: MDUR.unfurl, ease: 'linear', delta: '25 chars', perf: 'light',
    audio: null, why: 'Réservé aux blocs CLI / au mascot speech bubble. Le contenu menu standard reste statique.',
    spec: { prop: 'chars', from: 0, to: 25, dur: MDUR.unfurl, ease: 'linear' }, rm: 'affichage immédiat' },
  { id: 'A.12', title: 'Magnetic snap', sub: 'rangées attirées vers le pointeur', demo: DemoMagnetic,
    dur: MDUR.fast, ease: 'gentle', delta: '±3px · falloff 70px', perf: 'light',
    audio: 'hover', why: 'Subtil. Fonctionne uniquement à la souris. Donne au menu une vie tactile sans bouger les hit-targets.',
    spec: { prop: 'translateX', from: 0, to: 3, dur: MDUR.fast, ease: 'gentle' }, rm: 'désactivé' },
  { id: 'A.13', title: 'Liquid morph', sub: 'border-radius asymétrique qui se déforme', demo: DemoLiquid,
    dur: MDUR.unfurl, ease: 'linear', delta: '12% ↔ 80% · 4 axes', perf: 'light',
    audio: null, why: 'À réserver à des éléments décoratifs (badges, halos). Trop fort sur un menu — réduit la lisibilité.',
    spec: { prop: 'border-radius', from: '12% 80%', to: '80% 12%', dur: MDUR.unfurl, ease: 'linear' }, rm: 'forme statique' },
  { id: 'A.14', title: 'Spring physics', sub: 'oscillation amortie — overshoot fort', demo: DemoSpring,
    dur: MDUR.unfurl + 100, ease: 'elastic', delta: 'stiffness 220 · damping 18', perf: 'light',
    audio: 'open', why: 'Réservé au bubble-tree (A4.7 ★) et aux entrées radiales. Pas pour les listes classiques.',
    spec: { prop: 'translateX', from: 120, to: 0, dur: MDUR.unfurl + 100, ease: 'elastic' }, rm: 'ease decel · pas de spring' },
  { id: 'A.15', title: 'Stagger', sub: 'séquençage des rangées en cascade', demo: DemoStagger,
    dur: 6 * 32 + MDUR.base, ease: 'decel', delta: 'rows × 32ms', perf: 'light',
    audio: 'open', why: 'Brise l\'arrivée monolithique. Stagger 32ms = imperceptible individuellement, lisible globalement.',
    spec: { prop: 'translateY', from: 8, to: 0, dur: MDUR.base, ease: 'decel', delay: 'i × 32' }, rm: 'tout arrive simultanément' },
];

Object.assign(window, {
  ATOMS, SampleMenu, StageBg, MiniCursor,
});
