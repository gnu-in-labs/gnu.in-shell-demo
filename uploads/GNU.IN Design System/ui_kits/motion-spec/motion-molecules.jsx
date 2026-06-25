// motion-molecules.jsx
// Combinaisons nommées d'atomes. Chaque molécule = un moment d'animation
// précis (open, hover, commit, sub-open, …) avec sa propre fiche.

// ── M.01 — REVEAL-FROM-CURSOR (entrée) ───────────────────────────────
// Atomes : A.04 mask + A.02 scale (overshoot) + A.01 fade.
function DemoMReveal({ theme }) {
  const { p } = useSubTimeline(0, MDUR.smooth);
  const eMask = mEase('decel')(p);
  const eScale = mEase('overshoot')(p);
  const eFade = mEase('standard')(p);
  const r = `${eMask * 160}%`;
  const s = lerp(0.92, 1, eScale);
  const o = lerp(0, 1, eFade);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <StageBg theme={theme} />
      <div style={{
        position: 'absolute', left: 250, top: 110,
        clipPath: `circle(${r} at 12px 12px)`, WebkitClipPath: `circle(${r} at 12px 12px)`,
        transform: `scale(${s})`, transformOrigin: '12px 12px', opacity: o
      }}>
        <SampleMenu theme={theme} label="OPEN" rows={5} h={148} />
      </div>
      <MiniCursor x={258} y={118} theme={theme} />
      <div style={{ position: 'absolute', left: 250, top: 280, fontFamily: 'ui-monospace, monospace', fontSize: 11, color: theme.textDim }}>
        A.04 mask · A.02 scale(over) · A.01 fade · {MDUR.smooth}ms
      </div>
    </div>);

}

// ── M.02 — DISMISS-TO-CURSOR (sortie) ────────────────────────────────
function DemoMDismiss({ theme }) {
  const { p } = useSubTimeline(0, MDUR.base);
  const ek = mEase('accel')(p);
  const ef = mEase('accel')(p);
  const r = `${(1 - ek) * 160}%`;
  const s = lerp(1, 0.94, ek);
  const o = lerp(1, 0, ef);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <StageBg theme={theme} />
      <div style={{
        position: 'absolute', left: 250, top: 110,
        clipPath: `circle(${r} at 12px 12px)`, WebkitClipPath: `circle(${r} at 12px 12px)`,
        transform: `scale(${s})`, transformOrigin: '12px 12px', opacity: o
      }}>
        <SampleMenu theme={theme} label="CLOSE" rows={5} h={148} />
      </div>
      <MiniCursor x={258} y={118} theme={theme} />
      <div style={{ position: 'absolute', left: 250, top: 280, fontFamily: 'ui-monospace, monospace', fontSize: 11, color: theme.textDim }}>
        A.04 mask⁻¹ · A.02 scale⁻¹ · A.01 fade⁻¹ · {MDUR.base}ms · ease=accel
      </div>
    </div>);

}

// ── M.03 — ROW-HOVER (focus survol) ──────────────────────────────────
function DemoMHover({ theme }) {
  const { t } = useMotionTime();
  // Cycle through rows every 600ms
  const idx = Math.floor(t / 600 % 5);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <StageBg theme={theme} />
      <div style={{ position: 'absolute', left: 220, top: 80, width: 280, padding: 8, borderRadius: 12, background: theme.surface, border: `.5px solid ${theme.border}`, boxShadow: theme.shadow }}>
        {Array.from({ length: 5 }).map((_, i) => {
          const hov = i === idx;
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10, height: 30, padding: '0 12px',
              borderRadius: 6, position: 'relative',
              background: hov ? theme.hover : 'transparent',
              color: hov ? theme.text : theme.text,
              transform: `translateX(${hov ? MDIST.mag : 0}px)`,
              transition: 'background 80ms linear, transform 140ms cubic-bezier(0.32,0.72,0.32,1)'
            }}>
              {hov &&
              <div style={{ position: 'absolute', left: 0, top: '22%', bottom: '22%', width: 2, background: theme.accent, borderRadius: 2 }} />
              }
              <span style={{ width: 12, height: 12, background: theme.accent, opacity: hov ? 1 : 0.5, borderRadius: 2 }} />
              <span style={{ fontSize: 12, fontWeight: 450 }}>row {i + 1}</span>
              <span style={{ marginLeft: 'auto', fontSize: 10, color: theme.textDim, fontFamily: 'ui-monospace, monospace' }}>⌘{i + 1}</span>
            </div>);

        })}
      </div>
      <MiniCursor x={336} y={92 + idx * 30 + 16} theme={theme} />
      <div style={{ position: 'absolute', left: 220, top: 260, fontFamily: 'ui-monospace, monospace', fontSize: 11, color: theme.textDim }}>
        bg .08 linear · A.12 magnetic ±3px · tick 2px · cycle 600ms
      </div>
    </div>);

}

// ── M.04 — COMMIT-FLASH (press / activation) ────────────────────────
function DemoMCommit({ theme }) {
  const { t } = useMotionTime();
  // 3-phase storyboard : pre(0..200ms) idle, press(200..280), particle(280..600)
  const pressP = Math.max(0, Math.min(1, (t - 200) / 80));
  const releaseP = Math.max(0, Math.min(1, (t - 280) / 120));
  const partP = Math.max(0, Math.min(1, (t - 280) / 380));
  const s = lerp(1, 0.96, mEase('snap')(pressP)) * lerp(0.96, 1, mEase('overshoot')(releaseP));
  const N = 7;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <StageBg theme={theme} />
      <div style={{ position: 'absolute', left: 250, top: 130, transform: `scale(${s})`, transformOrigin: '120px 22px' }}>
        <div style={{
          width: 240, height: 44, borderRadius: 8, background: theme.accent, color: '#fff',
          display: 'flex', alignItems: 'center', padding: '0 16px', gap: 10,
          fontFamily: 'ui-sans-serif, system-ui, sans-serif', fontSize: 13, fontWeight: 600, position: 'relative'
        }}>
          <span style={{ width: 14, height: 14, background: '#fff', opacity: 0.9, borderRadius: 3 }} />
          <span>Open terminal here</span>
          <span style={{ marginLeft: 'auto', fontSize: 11, fontFamily: 'ui-monospace, monospace', opacity: 0.7 }}>⌘T</span>
        </div>
      </div>
      {/* Particle burst on release */}
      <svg style={{ position: 'absolute', left: 0, top: 0, width: 720, height: 360, overflow: 'visible', pointerEvents: 'none' }}>
        {Array.from({ length: N }).map((_, i) => {
          const a = i / N * Math.PI * 2 + 0.4;
          const d = 24 + i % 3 * 4;
          const ev = mEase('decel')(partP);
          const x = 370 + Math.cos(a) * d * ev;
          const y = 152 + Math.sin(a) * d * ev;
          return <circle key={i} cx={x} cy={y} r={1.4 * (1 - partP * 0.6)} fill={theme.accent} opacity={1 - partP} />;
        })}
      </svg>
      <div style={{ position: 'absolute', left: 250, top: 230, fontFamily: 'ui-monospace, monospace', fontSize: 11, color: theme.textDim }}>
        press scale 1 → .96 (80ms) → 1 over .96 (120ms, overshoot) · A.09 particles
      </div>
    </div>);

}

// ── M.05 — SUB-CASCADE (sub-open latéral) ───────────────────────────
function DemoMSubCascade({ theme }) {
  const { p: pParent } = useSubTimeline(0, MDUR.fast);
  const { p: pChild } = useSubTimeline(MDUR.fast, MDUR.fast + MDUR.smooth);
  // Parent shifts left slightly, child slides from left of its target +stagger
  const parentX = lerp(0, -2, mEase('gentle')(pParent));
  const childMask = mEase('decel')(pChild);
  const childO = mEase('standard')(pChild);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <StageBg theme={theme} />
      <div style={{ position: 'absolute', left: 180, top: 80, transform: `translateX(${parentX}px)` }}>
        <SampleMenu theme={theme} label="ROOT" rows={4} w={180} h={120} />
      </div>
      {/* connector */}
      <svg style={{ position: 'absolute', left: 360, top: 100, width: 24, height: 12 }}>
        <path d="M0 6 H 24" stroke={theme.accent} strokeWidth="1" strokeDasharray="2 2" opacity={pChild} />
      </svg>
      <div style={{
        position: 'absolute', left: 384, top: 84,
        clipPath: `circle(${childMask * 140}% at 0 12px)`,
        WebkitClipPath: `circle(${childMask * 140}% at 0 12px)`,
        opacity: childO
      }}>
        <SampleMenu theme={theme} label="SUB" rows={4} w={170} h={120} />
      </div>
      <div style={{ position: 'absolute', left: 180, top: 240, fontFamily: 'ui-monospace, monospace', fontSize: 11, color: theme.textDim }}>
        parent translateX −2px (140ms) · child mask + fade (280ms) · stagger 32ms
      </div>
    </div>);

}

// ── M.06 — SUB-COLLAPSE (sub-close) ─────────────────────────────────
function DemoMSubCollapse({ theme }) {
  const { p } = useSubTimeline(0, MDUR.fast);
  const ek = mEase('accel')(p);
  const o = 1 - ek;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <StageBg theme={theme} />
      <div style={{ position: 'absolute', left: 180, top: 80 }}>
        <SampleMenu theme={theme} label="ROOT" rows={4} w={180} h={120} />
      </div>
      <div style={{
        position: 'absolute', left: 384, top: 84,
        clipPath: `circle(${(1 - ek) * 140}% at 0 12px)`,
        WebkitClipPath: `circle(${(1 - ek) * 140}% at 0 12px)`,
        opacity: o, transform: `translateX(${-ek * 4}px)`
      }}>
        <SampleMenu theme={theme} label="SUB" rows={4} w={170} h={120} />
      </div>
      <div style={{ position: 'absolute', left: 180, top: 240, fontFamily: 'ui-monospace, monospace', fontSize: 11, color: theme.textDim }}>
        child mask⁻¹ + fade · translateX −4px · {MDUR.fast}ms ease=accel
      </div>
    </div>);

}

// ── M.07 — DRILL-REPLACE (in-place) ─────────────────────────────────
function DemoMDrill({ theme }) {
  const { p } = useSubTimeline(0, MDUR.smooth);
  const eOut = mEase('accel')(Math.min(1, p * 2)); // first half: out
  const eIn = mEase('decel')(Math.max(0, (p - 0.4) / 0.6)); // second half: in
  const xOut = lerp(0, -16, eOut);
  const oOut = lerp(1, 0, eOut);
  const xIn = lerp(16, 0, eIn);
  const oIn = lerp(0, 1, eIn);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <StageBg theme={theme} />
      <div style={{ position: 'absolute', left: 260, top: 100, width: 220, height: 140, borderRadius: 12, background: theme.surface, border: `.5px solid ${theme.border}`, boxShadow: theme.shadow, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, padding: 10, transform: `translateX(${xOut}px)`, opacity: oOut }}>
          <div style={{ fontSize: 9, fontFamily: 'ui-monospace, monospace', color: theme.accent, fontWeight: 700, letterSpacing: '0.12em' }}>‹ ROOT</div>
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {Array.from({ length: 4 }).map((_, i) =>
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, height: 16 }}>
                <span style={{ width: 10, height: 10, background: theme.accent, opacity: 0.6, borderRadius: 2 }} />
                <span style={{ flex: 1, height: 5, background: theme.border, borderRadius: 2 }} />
              </div>
            )}
          </div>
        </div>
        <div style={{ position: 'absolute', inset: 0, padding: 10, transform: `translateX(${xIn}px)`, opacity: oIn }}>
          <div style={{ fontSize: 9, fontFamily: 'ui-monospace, monospace', color: theme.accent, fontWeight: 700, letterSpacing: '0.12em' }}>SUB ›</div>
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {Array.from({ length: 4 }).map((_, i) =>
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, height: 16 }}>
                <span style={{ width: 10, height: 10, background: theme.green, opacity: 0.7, borderRadius: 2 }} />
                <span style={{ flex: 1, height: 5, background: theme.border, borderRadius: 2 }} />
              </div>
            )}
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 220, top: 260, fontFamily: 'ui-monospace, monospace', fontSize: 11, color: theme.textDim }}>
        ROOT translateX −16px + fade (accel) · SUB slides in +16 → 0 with 40% overlap · {MDUR.smooth}ms
      </div>
    </div>);

}

// ── M.08 — RE-TARGET (menu suit le curseur) ─────────────────────────
function DemoMRetarget({ theme }) {
  const { t } = useMotionTime();
  // Cursor moves from (160, 110) to (480, 220) over 400-1000ms. Menu follows
  // on a spring with ~80ms lag.
  const dur = 600;
  const p = Math.max(0, Math.min(1, (t - 250) / dur));
  const eC = mEase('decel')(p);
  const eM = mEase('decel')(Math.max(0, Math.min(1, (t - 330) / dur))); // menu lags 80ms
  const cx = lerp(160, 480, eC),cy = lerp(110, 220, eC);
  const mx = lerp(160, 480, eM),my = lerp(110, 220, eM);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <StageBg theme={theme} />
      <div style={{ position: 'absolute', left: mx, top: my }}>
        <SampleMenu theme={theme} label="RETARGET" rows={3} w={160} h={100} />
      </div>
      <svg style={{ position: 'absolute', left: 0, top: 0, width: 720, height: 360, pointerEvents: 'none' }}>
        <line x1={mx} y1={my} x2={cx} y2={cy} stroke={theme.accent} strokeWidth="1" strokeDasharray="2 3" opacity="0.5" />
      </svg>
      <MiniCursor x={cx} y={cy} theme={theme} />
      <div style={{ position: 'absolute', left: 220, top: 290, fontFamily: 'ui-monospace, monospace', fontSize: 11, color: theme.textDim }}>
        cursor → new anchor · menu spring-follows with 80ms lag · {dur}ms
      </div>
    </div>);

}

// ── M.09 — EDGE-BOUNCE ──────────────────────────────────────────────
function DemoMEdge({ theme }) {
  const { p } = useSubTimeline(0, MDUR.unfurl);
  const eR = mEase('elastic')(p);
  // Approach a wall, bounce 6px, settle.
  const x = (() => {
    if (p < 0.55) return lerp(40, 120, p / 0.55); // approach
    return lerp(120, 114, mEase('elastic')((p - 0.55) / 0.45)); // bounce
  })();
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <StageBg theme={theme} />
      {/* screen edge wall */}
      <div style={{ position: 'absolute', right: 220, top: 60, bottom: 60, width: 4, background: `repeating-linear-gradient(0deg, ${theme.accent} 0 8px, transparent 8px 14px)`, opacity: 0.5 }} />
      <div style={{ position: 'absolute', right: 220 + x, top: 130 }}>
        <SampleMenu theme={theme} label="EDGE" rows={4} w={180} h={120} style={{ marginRight: 8 }} />
      </div>
      <div style={{ position: 'absolute', left: 220, top: 280, fontFamily: 'ui-monospace, monospace', fontSize: 11, color: theme.textDim }}>
        approach 80ms · spring-bounce −{MDIST.bounce}px (elastic) · {MDUR.unfurl}ms
      </div>
    </div>);

}

// ── M.10 — IDLE-BREATHE ─────────────────────────────────────────────
function DemoMIdle({ theme }) {
  const { t } = useMotionTime();
  const cycle = t % MDUR.pulse / MDUR.pulse;
  const breath = 0.5 - 0.5 * Math.cos(cycle * Math.PI * 2);
  const dither = lerp(0.05, 0.12, breath);
  // REC red — pulled from the brand "breach / alert" range. Distinct from
  // signal orange so the listening state reads as "écoute/REC", not as
  // a generic accent. (See palette · status pips · breach red.)
  const REC = '#E63A1F';
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <StageBg theme={theme} />
      <div style={{ position: 'absolute', left: 230, top: 90, width: 260, padding: 12, borderRadius: 12, background: theme.surface, border: `.5px solid ${theme.border}`, boxShadow: theme.shadow, position: 'relative', overflow: 'hidden' }}>
        <DitherBg color={theme.accent} opacity={dither} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
          <div style={{ position: 'relative', width: 28, height: 28 }}>
            <div style={{ position: 'absolute', inset: 0, background: REC, borderRadius: '50%' }} />
            <div style={{
              position: 'absolute',
              left: 14 - (16 + 8 * breath), top: 14 - (16 + 8 * breath),
              width: (16 + 8 * breath) * 2, height: (16 + 8 * breath) * 2,
              borderRadius: '50%', border: `2px solid ${REC}`,
              opacity: lerp(0.45, 0.05, breath),
              boxSizing: 'border-box'
            }} />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: theme.text, display: 'flex', alignItems: 'center', gap: 6 }}>
              Listening
              <span style={{ fontSize: 8, fontFamily: 'ui-monospace, monospace', fontWeight: 700, color: REC, letterSpacing: '0.16em', padding: '1px 5px', border: `.5px solid ${REC}`, borderRadius: 2 }}>REC</span>
            </div>
            <div style={{ fontSize: 10, color: theme.textDim, fontFamily: 'ui-monospace, monospace' }}>{MDUR.pulse}ms · cosine</div>
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 230, top: 220, fontFamily: 'ui-monospace, monospace', fontSize: 11, color: theme.textDim }}>
        A.10 pulse · A.06 dither drift · idle ambient · seulement quand le menu reste ouvert sans interaction
      </div>
    </div>);

}

// ── M.11 — ERROR-SHAKE ──────────────────────────────────────────────
function DemoMError({ theme }) {
  const { p } = useSubTimeline(0, MDUR.unfurl);
  // damped sinusoid
  const dampedT = p * 4 * Math.PI;
  const damp = Math.exp(-p * 4);
  const x = Math.sin(dampedT) * damp * 8;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <StageBg theme={theme} />
      <div style={{ position: 'absolute', left: 250, top: 130, transform: `translateX(${x}px)` }}>
        <div style={{
          width: 240, height: 44, borderRadius: 8, background: '#FF5040', color: '#fff',
          display: 'flex', alignItems: 'center', padding: '0 16px', gap: 10,
          fontFamily: 'ui-sans-serif, system-ui, sans-serif', fontSize: 13, fontWeight: 600
        }}>
          <span style={{ width: 14, height: 14, background: '#fff', opacity: 0.9, borderRadius: 3 }} />
          <span>Action refusée</span>
          <span style={{ marginLeft: 'auto', fontSize: 10, fontFamily: 'ui-monospace, monospace', opacity: 0.8 }}>permission_denied</span>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 250, top: 200, fontFamily: 'ui-monospace, monospace', fontSize: 11, color: theme.textDim }}>
        damped sin · amplitude 8px · decay 4 · {MDUR.unfurl}ms
      </div>
    </div>);

}

// ── M.12 — BUBBLE-BLOOM (signature — pour A4.7 bubble tree) ─────────
function DemoMBubble({ theme }) {
  const { t } = useMotionTime();
  const N = 6;
  const cx = 360,cy = 180,R = 88;
  const bubbles = Array.from({ length: N }, (_, i) => {
    const start = i * 36;
    const p = Math.max(0, Math.min(1, (t - start) / MDUR.smooth));
    const v = mEase('elastic')(p);
    const a = i / N * Math.PI * 2 - Math.PI / 2;
    return { a, v, p, i };
  });
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <StageBg theme={theme} />
      {/* central node */}
      <div style={{
        position: 'absolute', left: cx - 22, top: cy - 22, width: 44, height: 44, borderRadius: 22,
        background: theme.surface, border: `1px solid ${theme.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,.15)', boxSizing: 'border-box'
      }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: theme.accent, fontFamily: 'ui-monospace, monospace' }}>{'>_'}</span>
      </div>
      {/* connectors */}
      <svg style={{ position: 'absolute', left: 0, top: 0, width: 720, height: 360, pointerEvents: 'none' }}>
        {bubbles.map((b, i) =>
        <line key={i} x1={cx + Math.cos(b.a) * 22} y1={cy + Math.sin(b.a) * 22}
        x2={cx + Math.cos(b.a) * (R * b.v)} y2={cy + Math.sin(b.a) * (R * b.v)}
        stroke={theme.accent} strokeWidth="1" opacity={b.p * 0.5} strokeLinecap="round" />
        )}
      </svg>
      {bubbles.map((b, i) => {
        const x = cx + Math.cos(b.a) * (R * b.v);
        const y = cy + Math.sin(b.a) * (R * b.v);
        return (
          <div key={i} style={{
            position: 'absolute', left: x - 18, top: y - 18, width: 36, height: 36, borderRadius: 18,
            background: theme.surface, border: `.5px solid ${theme.accent}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 3px 9px rgba(0,0,0,.15)',
            transform: `scale(${b.v})`, opacity: b.p,
            boxSizing: 'border-box'
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: theme.text }}>{i + 1}</span>
          </div>);

      })}
      <div style={{ position: 'absolute', left: 250, top: 290, fontFamily: 'ui-monospace, monospace', fontSize: 11, color: theme.textDim }}>
        6 bubbles · stagger 36ms · radius 0 → 88px · ease=elastic (★ A4.7)
      </div>
    </div>);

}

// ── Molecule registry ────────────────────────────────────────────────
const MOLECULES = [
{ id: 'M.01', title: 'reveal-from-cursor', sub: 'Entrée canonique — le menu naît au pointeur.',
  demo: DemoMReveal, moment: 'open',
  atoms: ['A.04 mask', 'A.02 scale (over)', 'A.01 fade'],
  dur: MDUR.smooth, ease: 'decel + overshoot', perf: 'medium', audio: 'open',
  why: 'L\'origine est toujours la position exacte du clic. Le menu ne « tombe » pas du ciel — il vient du geste.',
  spec: { prop: 'mask+scale+opacity', from: '0%/0.92/0', to: '160%/1.00/1', dur: MDUR.smooth, ease: 'decel' },
  rm: 'fade simple, dur ½ — pas de mask, pas de scale.' },

{ id: 'M.02', title: 'dismiss-to-cursor', sub: 'Sortie symétrique. Plus rapide.',
  demo: DemoMDismiss, moment: 'close',
  atoms: ['A.04 mask⁻¹', 'A.02 scale⁻¹', 'A.01 fade⁻¹'],
  dur: MDUR.base, ease: 'accel', perf: 'medium', audio: 'close',
  why: 'La sortie va plus vite que l\'entrée (200ms vs 280ms). Règle Gnu.In : on entre dans le menu, on en sort sans cérémonie.',
  spec: { prop: 'mask+scale+opacity', from: '160%/1/1', to: '0%/0.94/0', dur: MDUR.base, ease: 'accel' },
  rm: 'fade-out, dur ½.' },

{ id: 'M.03', title: 'row-hover-slide', sub: 'Survol d\'une rangée — magnétique discret.',
  demo: DemoMHover, moment: 'hover',
  atoms: ['A.12 magnetic ±3px', 'tick orange 2px', 'bg fill 80ms'],
  dur: MDUR.fast, ease: 'gentle', perf: 'light', audio: 'hover',
  why: 'Le tick orange à gauche est la signature gnu.in — pas un highlight de fond plein. Hit-target ne bouge pas.',
  spec: { prop: 'translateX+bg', from: '0/transparent', to: '3px/hover', dur: MDUR.fast, ease: 'gentle' },
  rm: 'fond uniquement · pas de translate.' },

{ id: 'M.04', title: 'commit-flash', sub: 'Validation — press depress + particules.',
  demo: DemoMCommit, moment: 'press',
  atoms: ['A.02 scale 0.96 (snap)', 'A.02 scale overshoot back', 'A.09 particle burst'],
  dur: 80 + 120 + 380, ease: 'snap + overshoot + decel', perf: 'medium', audio: 'commit',
  why: 'Trois temps mécaniques : 80ms d\'enfoncement (snap), 120ms de relâche overshoot, 380ms de gerbe. C\'est la seule fois où les particules sont autorisées.',
  spec: { prop: 'scale + particles', from: '1', to: '.96 → 1', dur: 80 + 120, ease: 'snap' },
  rm: 'flash de luminosité 1 frame, sans particule.' },

{ id: 'M.05', title: 'sub-cascade', sub: 'Sous-menu latéral — parent rétro-éclairé.',
  demo: DemoMSubCascade, moment: 'sub-open',
  atoms: ['parent translateX −2px', 'child A.04 mask + A.01 fade', 'A.15 stagger 32ms'],
  dur: MDUR.fast + MDUR.smooth, ease: 'gentle + decel', perf: 'medium', audio: 'subOpen',
  why: 'Le parent recule légèrement pour céder la priorité visuelle. Le sub naît du bord gauche — toujours du côté qui a ouvert.',
  spec: { prop: 'translateX(parent)+mask(child)', from: '0/0%', to: '-2px/140%', dur: MDUR.smooth, ease: 'decel' },
  rm: 'apparition immédiate, opacity uniquement.' },

{ id: 'M.06', title: 'sub-collapse', sub: 'Fermeture inverse de M.05.',
  demo: DemoMSubCollapse, moment: 'sub-close',
  atoms: ['child A.04 mask⁻¹', 'translateX −4px', 'parent revient à 0'],
  dur: MDUR.fast, ease: 'accel', perf: 'medium', audio: 'close',
  why: 'Le sub se rétracte vers son origine ; le parent revient au repos quand il a fini.',
  spec: { prop: 'mask+translateX', from: '140%/0', to: '0%/-4px', dur: MDUR.fast, ease: 'accel' },
  rm: 'fade out simple.' },

{ id: 'M.07', title: 'drill-replace', sub: 'Remplacement en place — pour touch / petits écrans.',
  demo: DemoMDrill, moment: 'drill-in',
  atoms: ['out: translateX −16 + fade (accel)', 'in: translateX +16 → 0 (decel)', 'overlap 40%'],
  dur: MDUR.smooth, ease: 'accel + decel', perf: 'light', audio: 'subOpen',
  why: 'Le sub remplace le parent dans le même container — pas de cascade latérale. Économe en pixels, parfait pour le tactile.',
  spec: { prop: 'translateX', from: '0 / +16', to: '-16 / 0', dur: MDUR.smooth, ease: 'decel' },
  rm: 'fond se contente d\'un crossfade.' },

{ id: 'M.08', title: 'retarget-slide', sub: 'Le menu suit le curseur sur déplacement (re-aim).',
  demo: DemoMRetarget, moment: 'retarget',
  atoms: ['translateX/Y spring · lag 80ms', 'preserve clip-origin'],
  dur: 600, ease: 'decel', perf: 'light', audio: null,
  why: 'Cas rare : utilisateur fait long-press puis drag. Le menu rejoint la nouvelle position avec un léger retard — sans se fermer.',
  spec: { prop: 'translate', from: '(x0,y0)', to: '(x1,y1)', dur: 600, ease: 'decel' },
  rm: 'téléporté instantanément.' },

{ id: 'M.09', title: 'edge-bounce', sub: 'Menu qui frôle un bord — petit rebond.',
  demo: DemoMEdge, moment: 'edge-bounce',
  atoms: ['A.14 spring elastic', 'bounce −6px', 'audio: subtle bump'],
  dur: MDUR.unfurl, ease: 'elastic', perf: 'light', audio: null,
  why: 'Quand le menu doit se repositionner pour rester à l\'écran, le rebond signale visuellement la collision.',
  spec: { prop: 'translateX', from: '0 → +overflow', to: 'final position', dur: MDUR.unfurl, ease: 'elastic' },
  rm: 'translation directe sans rebond.' },

{ id: 'M.10', title: 'idle-breathe', sub: 'Ambient — le menu reste ouvert mais inutilisé.',
  demo: DemoMIdle, moment: 'idle',
  atoms: ['A.10 pulse sur mascot', 'A.06 dither drift sous-jacent'],
  dur: MDUR.pulse, ease: 'linear', perf: 'light', audio: null,
  why: 'Signale que le shell « écoute » sans presser. Seulement sur le glyphe assistant — pas sur le contenu utile.',
  spec: { prop: 'mascot-ring + bg-dither', from: 'low', to: 'high → low', dur: MDUR.pulse, ease: 'linear' },
  rm: 'totalement désactivé.' },

{ id: 'M.11', title: 'error-shake', sub: 'Refus — oscillation amortie.',
  demo: DemoMError, moment: 'error',
  atoms: ['damped sine 4Hz', 'amplitude 8px', 'colour swap → red'],
  dur: MDUR.unfurl, ease: 'linear (manuel)', perf: 'light', audio: 'error',
  why: 'Sin(t)·e⁻ᵏᵗ ; jamais utilisé sauf en refus d\'action. Doit être rare — sinon il s\'use.',
  spec: { prop: 'translateX', from: 'sin·decay', to: '0', dur: MDUR.unfurl, ease: 'linear' },
  rm: 'flash de bordure rouge unique.' },

{ id: 'M.12', title: 'bubble-bloom ★', sub: 'Signature A4.7 — déploiement radial spring.',
  demo: DemoMBubble, moment: 'open · signature',
  atoms: ['A.14 spring elastic', 'A.15 stagger 36ms', 'radial deploy 88px'],
  dur: 6 * 36 + MDUR.smooth, ease: 'elastic', perf: 'medium', audio: 'open',
  why: 'Réservé au bubble tree (A4.7 ★). Chaque bulle pop indépendamment, reliée au noyau par un fil.',
  spec: { prop: 'translate + scale', from: '(0,0) / 0', to: 'polar(88, θ_i) / 1', dur: MDUR.smooth, ease: 'elastic' },
  rm: 'fade + bbox apparition sans spring.' }];


Object.assign(window, { MOLECULES });