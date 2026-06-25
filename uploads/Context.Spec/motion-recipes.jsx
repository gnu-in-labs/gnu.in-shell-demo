// motion-recipes.jsx
// Recettes clé-en-main : orchestrations complètes par archétype.
// Chaque recette est un storyboard temporel (phases) ; le scrubber laisse
// l'utilisateur voyager dans la séquence.

// ── Helper : calcul de phase ─────────────────────────────────────────
function phaseP(t, from, to) {
  if (t < from) return 0;
  if (t > to) return 1;
  return (t - from) / (to - from);
}

// ── R.01 — Empty space / list ────────────────────────────────────────
function DemoR01({ theme }) {
  const { t } = useMotionTime();
  // Phases : 0-280 open · 280-700 hover row 2 · 700-1100 hover row 4
  //          1100-1280 commit · 1280-1700 hold · 1700-1900 close
  const pOpen   = phaseP(t, 0, 280);
  const pClose  = phaseP(t, 1700, 1900);
  const hov     = t < 280 ? -1 : t < 700 ? 1 : t < 1080 ? 3 : t < 1280 ? 3 : -1;
  const pPress  = phaseP(t, 1080, 1180);
  const pRel    = phaseP(t, 1180, 1280);
  const pPart   = phaseP(t, 1180, 1500);

  const eMask  = mEase('decel')(pOpen);
  const eFade  = mEase('standard')(pOpen);
  const eScale = mEase('overshoot')(pOpen);
  const cMask  = mEase('accel')(pClose);
  const cFade  = mEase('accel')(pClose);

  const maskR  = (eMask * 160) * (1 - cMask);
  const scale  = lerp(0.94, 1, eScale) * lerp(1, 0.96, cMask);
  const opac   = lerp(0, 1, eFade) * lerp(1, 0, cFade);

  const items = ['Add widget…', 'Layout preset', 'Change wallpaper', 'Open terminal', 'Shell settings'];
  const cursorY = t < 700 ? 132 : t < 1100 ? 198 : 198;

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <StageBg theme={theme} />
      {/* topbar sliver */}
      <div style={{ position: 'absolute', top: 12, left: 12, right: 12, height: 20, borderRadius: 10, background: theme.mode === 'dark' ? 'rgba(17,20,24,.7)' : 'rgba(247,243,237,.85)', border: `.5px solid ${theme.border}`, display: 'flex', alignItems: 'center', padding: '0 10px', gap: 8, fontSize: 9, color: theme.textDim, fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>
        <SysterGlyph size={11} />
        <span style={{ fontWeight: 600, color: theme.text }}>Gnu.In</span>
        <span style={{ opacity: 0.5 }}>·</span>
        <span>desktop slot 0</span>
        <span style={{ marginLeft: 'auto' }}>14:32</span>
      </div>

      {/* Menu */}
      <div style={{
        position: 'absolute', left: 220, top: 110,
        clipPath: `circle(${maskR}% at 12px 12px)`,
        WebkitClipPath: `circle(${maskR}% at 12px 12px)`,
        transform: `scale(${scale})`, transformOrigin: '12px 12px', opacity: opac,
        width: 250,
      }}>
        <div style={{
          background: theme.surface, borderRadius: 12, border: `.5px solid ${theme.border}`,
          boxShadow: theme.shadow, padding: 6, position: 'relative', overflow: 'hidden',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        }}>
          <DitherBg color={theme.accent} opacity={theme.mode === 'dark' ? 0.05 : 0.04} />
          <div style={{ padding: '6px 10px 4px', fontSize: 9, color: theme.accent, letterSpacing: '0.12em', fontWeight: 700, fontFamily: 'ui-monospace, monospace' }}>EMPTY SPACE / 01</div>
          {items.map((label, i) => {
            const rowDelay = i * 28;
            const rowP = Math.max(0, Math.min(1, (t - rowDelay) / MDUR.base));
            const rowV = mEase('decel')(rowP) * (1 - cFade);
            const rowY = lerp(8, 0, rowV);
            const isHov = i === hov;
            const isCommit = isHov && i === 3 && t >= 1080 && t < 1500;
            const pressScale = isCommit ? lerp(1, 0.96, mEase('snap')(pPress)) * lerp(0.96, 1, mEase('overshoot')(pRel)) : 1;
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10, height: 28, padding: '0 12px',
                borderRadius: 6, position: 'relative', opacity: rowV, transform: `translateY(${rowY}px) scale(${pressScale})`,
                background: isHov ? theme.hover : 'transparent', color: theme.text,
                fontSize: 12,
              }}>
                {isHov && <div style={{ position: 'absolute', left: 0, top: '22%', bottom: '22%', width: 2, background: theme.accent, borderRadius: 2 }} />}
                <span style={{ width: 12, height: 12, background: theme.accent, opacity: isHov ? 1 : 0.55, borderRadius: 2 }} />
                <span>{label}</span>
                <span style={{ marginLeft: 'auto', fontSize: 10, color: theme.textDim, fontFamily: 'ui-monospace, monospace' }}>⌘{i + 1}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* particle burst on commit */}
      <svg style={{ position: 'absolute', left: 0, top: 0, width: 720, height: 360, overflow: 'visible', pointerEvents: 'none' }}>
        {pPart > 0 && pPart < 1 && Array.from({ length: 7 }).map((_, i) => {
          const a = (i / 7) * Math.PI * 2 + 0.3;
          const d = 24 + (i % 3) * 5;
          const ev = mEase('decel')(pPart);
          return <circle key={i} cx={350 + Math.cos(a) * d * ev} cy={198 + Math.sin(a) * d * ev} r={1.3 * (1 - pPart * 0.6)} fill={theme.accent} opacity={1 - pPart} />;
        })}
      </svg>

      {/* cursor */}
      <MiniCursor x={232} y={cursorY} theme={theme} />

      {/* phase label */}
      <div style={{ position: 'absolute', left: 220, bottom: 20, fontSize: 9, color: theme.textDim, fontFamily: 'ui-monospace, monospace', letterSpacing: '0.06em' }}>
        {t < 280 ? '◖ OPEN' : t < 700 ? '◐ HOVER row 2' : t < 1080 ? '◐ HOVER row 4' : t < 1280 ? '◕ COMMIT' : t < 1700 ? '◉ HOLD' : '◗ CLOSE'}
      </div>
    </div>
  );
}

// ── R.02 — Widget with preview header ───────────────────────────────
function DemoR02({ theme }) {
  const { t } = useMotionTime();
  const pOpen  = phaseP(t, 0, 280);
  const pClose = phaseP(t, 1700, 1900);
  const hov    = t < 280 ? -1 : t < 700 ? 0 : t < 1100 ? 2 : t < 1280 ? 4 : -1;
  const pPress = phaseP(t, 1080, 1180);
  const pRel   = phaseP(t, 1180, 1280);
  const pPart  = phaseP(t, 1180, 1500);
  const eFade  = mEase('decel')(pOpen) * (1 - mEase('accel')(pClose));
  const eMask  = mEase('decel')(pOpen) * (1 - mEase('accel')(pClose));
  const items = [
    { label: 'Configure…',     mono: '⏎' },
    { label: 'Shape',          mono: 'S' },
    { label: 'Background',     mono: 'B' },
    { label: 'Pin everywhere', mono: 'P' },
    { label: 'Remove',         mono: '⌫', danger: true },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <StageBg theme={theme} />
      {/* Widget on desktop */}
      <div style={{ position: 'absolute', left: 60, top: 50, width: 130, height: 84, borderRadius: 8, background: theme.surface, border: `1.5px solid ${theme.accent}`, boxShadow: `0 0 0 3px ${theme.accent}33, 0 8px 24px rgba(0,0,0,.18)`, padding: 8, color: theme.text, fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>
        <div style={{ fontSize: 8, color: theme.textDim, letterSpacing: '0.1em', fontWeight: 600 }}>SYSTEM</div>
        <div style={{ display: 'flex', gap: 3, marginTop: 4, height: 16, alignItems: 'flex-end' }}>
          {[0.4, 0.7, 0.3, 0.9, 0.5, 0.6, 0.8].map((v, i) => (
            <div key={i} style={{ flex: 1, height: `${v * 100}%`, background: theme.accent, opacity: 0.4 + v * 0.6, borderRadius: 1 }} />
          ))}
        </div>
        <div style={{ fontSize: 10, marginTop: 6, fontWeight: 500 }}>CPU 34%</div>
      </div>

      {/* Menu w/ preview header */}
      <div style={{
        position: 'absolute', left: 220, top: 90,
        clipPath: `circle(${eMask * 160}% at 14px 14px)`,
        WebkitClipPath: `circle(${eMask * 160}% at 14px 14px)`,
        opacity: eFade, width: 250,
      }}>
        <div style={{ background: theme.surface, borderRadius: 12, border: `.5px solid ${theme.border}`, boxShadow: theme.shadow, overflow: 'hidden', position: 'relative', fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>
          <GrainBg opacity={theme.mode === 'dark' ? 0.06 : 0.04} />
          {/* header */}
          <div style={{
            padding: 12, borderBottom: `.5px solid ${theme.border}`, position: 'relative',
            background: 'rgba(255,106,0,.05)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: 6, background: theme.bg, border: `.5px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 4, height: 12, background: theme.accent, opacity: 0.4, borderRadius: 1 }} />
                <div style={{ width: 4, height: 10, background: theme.accent, marginLeft: 2, opacity: 0.8, borderRadius: 1 }} />
                <div style={{ width: 4, height: 14, background: theme.accent, marginLeft: 2, opacity: 0.6, borderRadius: 1 }} />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600 }}>System Stats</div>
                <div style={{ fontSize: 9, color: theme.textDim }}>130 × 84 · ws 2</div>
              </div>
            </div>
          </div>
          {/* rows */}
          <div style={{ padding: 6 }}>
            {items.map((it, i) => {
              const rowP = Math.max(0, Math.min(1, (t - i * 28) / MDUR.base));
              const rowV = mEase('decel')(rowP) * (1 - mEase('accel')(pClose));
              const isH = i === hov;
              const isCommit = isH && i === 4 && t >= 1080 && t < 1500;
              const ps = isCommit ? lerp(1, 0.96, mEase('snap')(pPress)) * lerp(0.96, 1, mEase('overshoot')(pRel)) : 1;
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10, height: 26, padding: '0 10px',
                  borderRadius: 5, opacity: rowV, transform: `translateY(${lerp(6, 0, rowV)}px) scale(${ps})`,
                  background: isH ? (it.danger ? 'rgba(255,80,60,.12)' : theme.hover) : 'transparent',
                  color: it.danger ? '#FF5040' : theme.text, fontSize: 11.5, position: 'relative',
                }}>
                  {isH && !it.danger && <div style={{ position: 'absolute', left: 0, top: '24%', bottom: '24%', width: 2, background: theme.accent, borderRadius: 2 }} />}
                  <span style={{ width: 10, height: 10, background: it.danger ? '#FF5040' : theme.accent, opacity: isH ? 1 : 0.55, borderRadius: 2 }} />
                  <span>{it.label}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 10, color: theme.textDim, fontFamily: 'ui-monospace, monospace' }}>{it.mono}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <svg style={{ position: 'absolute', left: 0, top: 0, width: 720, height: 360, overflow: 'visible', pointerEvents: 'none' }}>
        {pPart > 0 && pPart < 1 && Array.from({ length: 7 }).map((_, i) => {
          const a = (i / 7) * Math.PI * 2 + 0.3;
          const d = 22 + (i % 3) * 5;
          const ev = mEase('decel')(pPart);
          return <circle key={i} cx={345} cy={234 + Math.sin(a) * d * ev} r={1.3 * (1 - pPart * 0.6)} fill="#FF5040" opacity={1 - pPart} />;
        })}
      </svg>

      <MiniCursor x={t < 280 ? 232 : t < 700 ? 252 : t < 1100 ? 252 : 252} y={t < 280 ? 100 : t < 700 ? 188 : t < 1100 ? 240 : 264} theme={theme} />
      <div style={{ position: 'absolute', left: 220, bottom: 14, fontSize: 9, color: theme.textDim, fontFamily: 'ui-monospace, monospace', letterSpacing: '0.06em' }}>
        {t < 280 ? '◖ OPEN' : t < 1080 ? '◐ HOVER' : t < 1280 ? '◕ COMMIT (danger)' : t < 1700 ? '◉ HOLD' : '◗ CLOSE'}
      </div>
    </div>
  );
}

// ── R.03 — Window title-bar (slide-down + sub-cascade) ──────────────
function DemoR03({ theme }) {
  const { t } = useMotionTime();
  // Window with title-bar at top-left of stage. Menu drops from title-bar.
  // Then sub-menu (tile grid) opens to the right at hover on row "Tile".
  const pOpen   = phaseP(t, 0, 280);
  const pSub    = phaseP(t, 700, 1000);
  const pSubH   = phaseP(t, 1000, 1500);
  const pClose  = phaseP(t, 2000, 2200);
  const eMask   = mEase('decel')(pOpen) * (1 - mEase('accel')(pClose));
  const eFade   = mEase('decel')(pOpen) * (1 - mEase('accel')(pClose));
  const eSubM   = mEase('decel')(pSub);
  const eSubO   = mEase('standard')(pSub);
  const ty      = lerp(-6, 0, eFade);
  const parentX = lerp(0, -2, mEase('gentle')(pSub));
  const rows = ['Tile', 'Float', 'Fullscreen', 'Send to…', 'Pin', 'Window info', 'Close'];
  const hov  = t < 280 ? -1 : t < 700 ? 0 : 0; // row 0 = Tile
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <StageBg theme={theme} />
      {/* Window */}
      <div style={{ position: 'absolute', left: 30, top: 60, width: 380, height: 220, borderRadius: 8, background: theme.mode === 'dark' ? '#1B1F24' : '#FFFFFF', border: `1.5px solid ${theme.accent}`, boxShadow: `0 0 0 3px ${theme.accent}26, 0 12px 32px rgba(0,0,0,.25)`, overflow: 'hidden' }}>
        <div style={{ height: 22, background: theme.mode === 'dark' ? '#15181C' : '#F2EEE6', borderBottom: `.5px solid ${theme.border}`, display: 'flex', alignItems: 'center', padding: '0 8px', gap: 6, fontSize: 10, color: theme.textDim, fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>
          <span style={{ width: 7, height: 7, borderRadius: 4, background: '#FF5F57' }} />
          <span style={{ width: 7, height: 7, borderRadius: 4, background: '#FFBD2E' }} />
          <span style={{ width: 7, height: 7, borderRadius: 4, background: '#28C940' }} />
          <span style={{ marginLeft: 8, fontWeight: 500, color: theme.text }}>Files — ~/projects</span>
        </div>
        {/* highlight on title-bar showing the right-click target */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 22, border: `1.5px dashed ${theme.accent}`, borderRadius: '8px 8px 0 0', pointerEvents: 'none', boxSizing: 'border-box' }} />
        <div style={{ padding: 12 }}>
          <div style={{ width: '60%', height: 5, background: theme.border, borderRadius: 3, marginBottom: 5 }} />
          <div style={{ width: '90%', height: 5, background: theme.border, borderRadius: 3, marginBottom: 5 }} />
          <div style={{ width: '40%', height: 5, background: theme.border, borderRadius: 3 }} />
        </div>
      </div>

      {/* Drop-down menu from title-bar */}
      <div style={{
        position: 'absolute', left: 64, top: 88 + ty,
        clipPath: `circle(${eMask * 160}% at 8px 0px)`,
        WebkitClipPath: `circle(${eMask * 160}% at 8px 0px)`,
        opacity: eFade, width: 210, transform: `translateX(${parentX}px)`,
      }}>
        <div style={{ background: theme.surface, borderRadius: 10, border: `.5px solid ${theme.border}`, boxShadow: theme.shadow, padding: 6, fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>
          <div style={{ padding: '5px 10px 3px', fontSize: 9, color: theme.accent, letterSpacing: '0.12em', fontWeight: 700, fontFamily: 'ui-monospace, monospace' }}>TITLE-BAR ▸</div>
          {rows.map((r, i) => {
            const isH = i === hov;
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 8, height: 24, padding: '0 10px',
                borderRadius: 5, background: isH ? theme.hover : 'transparent',
                color: r === 'Close' ? '#FF5040' : theme.text, fontSize: 11.5, position: 'relative',
              }}>
                {isH && r !== 'Close' && <div style={{ position: 'absolute', left: 0, top: '24%', bottom: '24%', width: 2, background: theme.accent, borderRadius: 2 }} />}
                <span style={{ width: 10, height: 10, background: r === 'Close' ? '#FF5040' : theme.accent, opacity: isH ? 1 : 0.55, borderRadius: 2 }} />
                <span>{r}</span>
                {(r === 'Tile' || r === 'Send to…') && <span style={{ marginLeft: 'auto', opacity: 0.6 }}>▸</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Sub-menu : tile grid picker */}
      <div style={{
        position: 'absolute', left: 290, top: 92,
        clipPath: `circle(${eSubM * 140}% at 0 12px)`,
        WebkitClipPath: `circle(${eSubM * 140}% at 0 12px)`,
        opacity: eSubO, width: 180,
      }}>
        <div style={{ background: theme.surface, borderRadius: 10, border: `.5px solid ${theme.border}`, boxShadow: theme.shadow, padding: 8, fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>
          <div style={{ fontSize: 9, color: theme.accent, letterSpacing: '0.12em', fontWeight: 700, fontFamily: 'ui-monospace, monospace', padding: '0 2px 6px' }}>TILE TO</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 5 }}>
            {[
              { area: { x: 0, y: 0, w: 50, h: 100 }, label: 'L ½' },
              { area: { x: 50, y: 0, w: 50, h: 100 }, label: 'R ½' },
              { area: { x: 0, y: 0, w: 100, h: 50 }, label: 'Top' },
              { area: { x: 0, y: 0, w: 50, h: 50 }, label: 'TL' },
              { area: { x: 50, y: 0, w: 50, h: 50 }, label: 'TR' },
              { area: { x: 0, y: 50, w: 100, h: 50 }, label: 'Bot' },
            ].map((tile, i) => {
              const isH = i === 0 && pSubH > 0.3;
              return (
                <div key={i} style={{
                  position: 'relative', height: 34, borderRadius: 4,
                  background: isH ? 'rgba(255,106,0,.1)' : theme.kbdBg,
                  border: `.5px solid ${isH ? theme.accent : theme.border}`,
                }}>
                  <div style={{ position: 'absolute', left: `${tile.area.x}%`, top: `${tile.area.y}%`, width: `${tile.area.w}%`, height: `${tile.area.h}%`, background: isH ? theme.accent : theme.textDim, opacity: isH ? 0.9 : 0.4, borderRadius: 1 }} />
                  <span style={{ position: 'absolute', bottom: 2, left: 4, fontSize: 8, fontWeight: 700, color: isH ? theme.accent : theme.textFaint, letterSpacing: '0.05em' }}>{tile.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <MiniCursor x={t < 700 ? 82 : t < 1000 ? 180 : 320} y={t < 700 ? 102 : t < 1000 ? 102 : 110} theme={theme} />
      <div style={{ position: 'absolute', left: 30, bottom: 14, fontSize: 9, color: theme.textDim, fontFamily: 'ui-monospace, monospace', letterSpacing: '0.06em' }}>
        {t < 280 ? '◖ OPEN drop-down' : t < 700 ? '◐ HOVER Tile' : t < 1000 ? '◑ SUB-OPEN tile grid' : t < 1500 ? '◒ HOVER tile L½' : t < 2000 ? '◉ HOLD' : '◗ CLOSE'}
      </div>
    </div>
  );
}

// ── R.04 — Bubble tree ★ signature ──────────────────────────────────
function DemoR04({ theme }) {
  const { t } = useMotionTime();
  const cx = 360, cy = 200, R = 110;
  const N = 6;
  const labels = ['Theme', 'Shape', 'Motion', 'Shader', 'Layout', 'Reset'];
  // Phase : 0-100 cursor arrive · 100-400 core · 400-1100 bloom (stagger 60ms)
  //         1100-1500 hover on bubble 0 · 1500-1800 commit · 1800-2200 sub-bloom (3 sub-bubbles)
  //         2200-2700 hold · 2700-2900 close
  const pCore  = phaseP(t, 100, 400);
  const pClose = phaseP(t, 2700, 2900);
  const closeV = mEase('accel')(pClose);
  const coreV  = mEase('elastic')(pCore) * (1 - closeV);

  const hovIdx = t > 1100 && t < 1800 ? 0 : -1;
  const pPress = phaseP(t, 1600, 1700);
  const pRel   = phaseP(t, 1700, 1800);

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <StageBg theme={theme} />
      {/* connectors */}
      <svg style={{ position: 'absolute', left: 0, top: 0, width: 720, height: 360, pointerEvents: 'none' }}>
        {Array.from({ length: N }).map((_, i) => {
          const start = 400 + i * 60;
          const p = Math.max(0, Math.min(1, (t - start) / MDUR.smooth));
          const v = mEase('elastic')(p) * (1 - closeV);
          const a = (i / N) * Math.PI * 2 - Math.PI / 2;
          const ex = cx + Math.cos(a) * R * v;
          const ey = cy + Math.sin(a) * R * v;
          const cP1x = cx + Math.cos(a) * 30;
          const cP1y = cy + Math.sin(a) * 30;
          return <path key={i} d={`M ${cx + Math.cos(a) * 28} ${cy + Math.sin(a) * 28} Q ${cP1x} ${cP1y} ${ex} ${ey}`} stroke={theme.accent} strokeWidth="1.2" fill="none" opacity={p * 0.5 * (1 - closeV)} strokeLinecap="round" />;
        })}
      </svg>

      {/* Bubbles */}
      {Array.from({ length: N }).map((_, i) => {
        const start = 400 + i * 60;
        const p = Math.max(0, Math.min(1, (t - start) / MDUR.smooth));
        const v = mEase('elastic')(p) * (1 - closeV);
        const a = (i / N) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(a) * R * v;
        const y = cy + Math.sin(a) * R * v;
        const isH = i === hovIdx;
        const isCommit = isH && t >= 1600 && t < 1800;
        const ps = isCommit ? lerp(1, 0.94, mEase('snap')(pPress)) * lerp(0.94, 1.04, mEase('overshoot')(pRel)) : 1;
        return (
          <div key={i} style={{
            position: 'absolute', left: x - 28, top: y - 28, width: 56, height: 56, borderRadius: 28,
            background: isH ? theme.accent : theme.surface, color: isH ? '#fff' : theme.text,
            border: `1px solid ${isH ? theme.accent : theme.accent}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
            boxShadow: '0 4px 12px rgba(0,0,0,.15)',
            transform: `scale(${v * ps})`, opacity: p * (1 - closeV),
            fontFamily: 'ui-sans-serif, system-ui, sans-serif', fontSize: 10, fontWeight: 600,
            boxSizing: 'border-box',
          }}>
            <div style={{ width: 14, height: 14, background: isH ? '#fff' : theme.accent, opacity: 0.8, borderRadius: 3, marginBottom: 2 }} />
            <div>{labels[i]}</div>
          </div>
        );
      })}

      {/* Sub-bubbles around bubble 0 after commit */}
      {t > 1800 && (() => {
        const SUB = 3;
        const subA0 = -Math.PI / 2; // bubble 0 angle
        const bx = cx + Math.cos(subA0) * R;
        const by = cy + Math.sin(subA0) * R;
        const sublabels = ['Beret', 'Signal', 'Anth'];
        return (
          <>
            <svg style={{ position: 'absolute', left: 0, top: 0, width: 720, height: 360, pointerEvents: 'none' }}>
              {Array.from({ length: SUB }).map((_, i) => {
                const start = 1800 + i * 50;
                const p = Math.max(0, Math.min(1, (t - start) / MDUR.smooth));
                const v = mEase('elastic')(p) * (1 - closeV);
                const a = subA0 + (i - 1) * 0.7;
                const ex = bx + Math.cos(a) * 56 * v;
                const ey = by + Math.sin(a) * 56 * v;
                return <line key={i} x1={bx} y1={by} x2={ex} y2={ey} stroke={theme.green} strokeWidth="1" opacity={p * 0.5} />;
              })}
            </svg>
            {Array.from({ length: SUB }).map((_, i) => {
              const start = 1800 + i * 50;
              const p = Math.max(0, Math.min(1, (t - start) / MDUR.smooth));
              const v = mEase('elastic')(p) * (1 - closeV);
              const a = subA0 + (i - 1) * 0.7;
              const x = bx + Math.cos(a) * 56 * v;
              const y = by + Math.sin(a) * 56 * v;
              return (
                <div key={i} style={{
                  position: 'absolute', left: x - 20, top: y - 20, width: 40, height: 40, borderRadius: 20,
                  background: theme.green, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 3px 9px rgba(0,0,0,.15)',
                  transform: `scale(${v})`, opacity: p * (1 - closeV),
                  fontFamily: 'ui-sans-serif, system-ui, sans-serif', fontSize: 9, fontWeight: 700,
                  boxSizing: 'border-box',
                }}>{sublabels[i]}</div>
              );
            })}
          </>
        );
      })()}

      {/* Central node */}
      <div style={{
        position: 'absolute', left: cx - 28, top: cy - 28, width: 56, height: 56, borderRadius: 28,
        background: theme.surface, border: `1.5px solid ${theme.accent}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 6px 18px rgba(0,0,0,.18)',
        transform: `scale(${coreV})`, opacity: coreV,
        boxSizing: 'border-box',
      }}>
        <SysterGlyph size={32} hover />
      </div>

      <MiniCursor x={t < 100 ? 240 : t < 1100 ? 340 : t < 1800 ? cx : cx} y={t < 100 ? 290 : t < 1100 ? 220 : t < 1800 ? cy - R + 30 : cy - R - 20} theme={theme} />
      <div style={{ position: 'absolute', left: 30, bottom: 14, fontSize: 9, color: theme.accent, fontFamily: 'ui-monospace, monospace', letterSpacing: '0.06em', fontWeight: 700 }}>
        {t < 400 ? '◖ CORE spawn' : t < 1100 ? '◐ BLOOM ★' : t < 1500 ? '◑ HOVER bubble 0' : t < 1800 ? '◒ COMMIT' : t < 2200 ? '◓ SUB-BLOOM' : t < 2700 ? '◉ HOLD' : '◗ CLOSE'}
      </div>
    </div>
  );
}

// ── R.05 — Tray audio (drop-from-icon + slider) ─────────────────────
function DemoR05({ theme }) {
  const { t } = useMotionTime();
  const pOpen  = phaseP(t, 100, 380);
  const pTyped = phaseP(t, 380, 800);
  const pSlide = phaseP(t, 800, 1500);
  const pHov2  = phaseP(t, 1500, 1700);
  const pPress = phaseP(t, 1700, 1800);
  const pPart  = phaseP(t, 1800, 2200);
  const pClose = phaseP(t, 2300, 2500);

  const eFade  = mEase('decel')(pOpen) * (1 - mEase('accel')(pClose));
  const eMask  = mEase('decel')(pOpen) * (1 - mEase('accel')(pClose));
  const ty     = lerp(-6, 0, eFade);

  // Volume slider drag : 30 → 72 → 60
  const vol = (() => {
    if (t < 800) return 30;
    if (t < 1200) return lerp(30, 72, mEase('decel')((t - 800) / 400));
    if (t < 1500) return lerp(72, 60, mEase('gentle')((t - 1200) / 300));
    return 60;
  })();
  const typedText = '>_ audio · 1 output';
  const typedN = Math.floor(mEase('linear')(pTyped) * typedText.length);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <StageBg theme={theme} />
      {/* Tray bar */}
      <div style={{ position: 'absolute', top: 12, right: 12, height: 22, padding: '0 8px', borderRadius: 11, background: theme.mode === 'dark' ? 'rgba(17,20,24,.7)' : 'rgba(247,243,237,.85)', border: `.5px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 6 }}>
        {[
          { k: 'audio', glyph: '♪', accent: true },
          { k: 'wifi',  glyph: '◗' },
          { k: 'bt',    glyph: '∞' },
          { k: 'pwr',   glyph: '⏻' },
        ].map((it) => (
          <span key={it.k} style={{
            width: 18, height: 18, color: it.accent ? theme.accent : theme.textDim,
            background: it.accent ? 'rgba(255,106,0,.15)' : 'transparent', borderRadius: 4,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontFamily: 'ui-monospace, monospace',
          }}>{it.glyph}</span>
        ))}
      </div>

      {/* Drop-down audio menu */}
      <div style={{
        position: 'absolute', right: 20, top: 42 + ty,
        clipPath: `circle(${eMask * 160}% at 28px 0)`,
        WebkitClipPath: `circle(${eMask * 160}% at 28px 0)`,
        opacity: eFade, width: 260,
      }}>
        <div style={{ background: theme.surface, borderRadius: 12, border: `.5px solid ${theme.border}`, boxShadow: theme.shadow, padding: 10, fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 600 }}>Audio</span>
            <span style={{ fontSize: 9, color: theme.textFaint, fontFamily: 'ui-monospace, monospace', marginLeft: 'auto' }}>
              {typedText.slice(0, typedN)}<span style={{ opacity: typedN < typedText.length ? 1 : 0 }}>_</span>
            </span>
          </div>
          {/* Slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 10, color: theme.textDim, fontFamily: 'ui-monospace, monospace', width: 18, fontVariantNumeric: 'tabular-nums' }}>{Math.round(vol)}</span>
            <div style={{ flex: 1, height: 6, background: theme.kbdBg, borderRadius: 3, position: 'relative' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${vol}%`, background: theme.accent, borderRadius: 3, transition: 'width 30ms linear' }} />
              <div style={{ position: 'absolute', left: `${vol}%`, top: -4, width: 14, height: 14, borderRadius: 8, background: '#fff', border: `1.5px solid ${theme.accent}`, transform: 'translateX(-7px)', boxShadow: '0 1px 3px rgba(0,0,0,.2)' }} />
            </div>
          </div>
          <div style={{ height: 1, background: theme.border, margin: '8px 0' }} />
          {/* Output list */}
          <div style={{ fontSize: 9, color: theme.accent, letterSpacing: '0.12em', fontWeight: 700, fontFamily: 'ui-monospace, monospace', marginBottom: 4 }}>OUTPUTS</div>
          {[
            { label: 'Casque Bluetooth · Sony WH', active: pHov2 < 0.5 },
            { label: 'Haut-parleurs internes',     hover: pHov2 > 0.5 && t < 1900 },
            { label: 'HDMI · Display Port',        cold: true },
          ].map((o, i) => {
            const isCommit = o.hover && t >= 1700 && t < 1900;
            const ps = isCommit ? lerp(1, 0.96, mEase('snap')(pPress)) * lerp(0.96, 1, mEase('overshoot')(phaseP(t, 1800, 1900))) : 1;
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 8, height: 22, padding: '0 8px',
                borderRadius: 4, background: o.hover ? theme.hover : 'transparent', color: theme.text,
                fontSize: 11, position: 'relative', transform: `scale(${ps})`,
              }}>
                <span style={{ width: 8, height: 8, borderRadius: 4, background: o.active ? theme.green : theme.kbdBg, border: `.5px solid ${o.active ? theme.green : theme.border}` }} />
                <span style={{ opacity: o.cold ? 0.5 : 1 }}>{o.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Commit particles */}
      <svg style={{ position: 'absolute', left: 0, top: 0, width: 720, height: 360, overflow: 'visible', pointerEvents: 'none' }}>
        {pPart > 0 && pPart < 1 && Array.from({ length: 7 }).map((_, i) => {
          const a = (i / 7) * Math.PI * 2 + 0.4;
          const d = 18 + (i % 3) * 4;
          const ev = mEase('decel')(pPart);
          return <circle key={i} cx={580 + Math.cos(a) * d * ev} cy={240 + Math.sin(a) * d * ev} r={1.2 * (1 - pPart * 0.6)} fill={theme.accent} opacity={1 - pPart} />;
        })}
      </svg>

      <MiniCursor x={t < 100 ? 680 : t < 800 ? 668 : t < 1500 ? 460 + vol * 1.2 : 580} y={t < 100 ? 22 : t < 800 ? 76 : t < 1500 ? 110 : 240} theme={theme} />
      <div style={{ position: 'absolute', left: 30, bottom: 14, fontSize: 9, color: theme.textDim, fontFamily: 'ui-monospace, monospace', letterSpacing: '0.06em' }}>
        {t < 380 ? '◖ DROP from tray' : t < 800 ? '◐ TYPE-ON status' : t < 1500 ? '◑ SLIDER drag' : t < 1700 ? '◒ HOVER output' : t < 1900 ? '◕ COMMIT' : t < 2300 ? '◉ HOLD' : '◗ CLOSE'}
      </div>
    </div>
  );
}

// ── Recipe registry ──────────────────────────────────────────────────
const RECIPES = [
  {
    id: 'R.01', title: 'Empty-space · list', sub: 'Le menu canonique. Reveal-from-cursor + cascade + commit + close.',
    demo: DemoR01, dur: 1900, perf: 'medium', touchOk: false,
    why: 'C\'est la recette par défaut, à appliquer sur 90% des menus contextuels. Toutes les autres recettes en sont des variations.',
    phases: [
      { from:    0, to:  280, moment: 'OPEN',    mol: 'M.01 reveal-from-cursor', atoms: ['A.04', 'A.02', 'A.01', 'A.15'] },
      { from:  280, to:  700, moment: 'HOVER 2', mol: 'M.03 row-hover-slide',    atoms: ['A.12'] },
      { from:  700, to: 1080, moment: 'HOVER 4', mol: 'M.03 row-hover-slide',    atoms: ['A.12'] },
      { from: 1080, to: 1280, moment: 'COMMIT',  mol: 'M.04 commit-flash',       atoms: ['A.02', 'A.09'] },
      { from: 1280, to: 1700, moment: 'HOLD',    mol: '(none)',                   atoms: [] },
      { from: 1700, to: 1900, moment: 'CLOSE',   mol: 'M.02 dismiss-to-cursor',  atoms: ['A.04', 'A.02', 'A.01'] },
    ],
    snippet: {
      neutral: `# R.01 · empty-space list
sequence:
  - t:    0   moment: open     molecule: M.01 (mask + scale + fade · stagger 28ms/row)
  - t:  280   moment: hover    molecule: M.03 (magnetic +3px, tick orange)
  - t: 1080   moment: commit   molecule: M.04 (scale 0.96 → 1.04 → 1 + 7 particles)
  - t: 1700   moment: close    molecule: M.02 (mask⁻¹ + scale⁻¹ + fade⁻¹)
audio:
  - open:   cue.menu.open
  - hover:  cue.menu.hover (×3)
  - commit: cue.menu.commit
  - close:  cue.menu.close`,
      qml: `// QML / Quickshell — root state-driven sequence
Item {
  id: menuRoot
  states: [
    State { name: "closed"; PropertyChanges { target: menuRoot; opacity: 0; scale: 0.92 } },
    State { name: "open";   PropertyChanges { target: menuRoot; opacity: 1; scale: 1.00 } }
  ]
  transitions: Transition {
    NumberAnimation { properties: "opacity,scale"; duration: 280; easing.type: Easing.OutCubic }
  }
  // Each row :
  Repeater {
    model: items
    Item {
      property real reveal: 0
      Behavior on reveal { NumberAnimation { duration: 200; easing.type: Easing.OutCubic } }
      Component.onCompleted: Qt.callLater(() => reveal = 1, index * 28)
    }
  }
}`,
      qt: `// Qt C++ — sequential animation group
auto* group = new QSequentialAnimationGroup(menu);
// 1. open (280ms)
auto* open = new QPropertyAnimation(menu, "windowOpacity");
open->setDuration(280);
open->setEasingCurve(QEasingCurve::OutCubic);
open->setStartValue(0.0); open->setEndValue(1.0);
group->addAnimation(open);
// 2. hover dwell, 3. commit pulse, 4. close
// (each row mounted with a QPauseAnimation(index*28) before its NumberAnimation)
group->start();`,
      flutter: `// Flutter — TweenSequence driving menu controller
final ctrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 1900));
final reveal = TweenSequence<double>([
  TweenSequenceItem(tween: Tween(begin: 0, end: 1).chain(CurveTween(curve: Curves.easeOutCubic)), weight: 280),
  TweenSequenceItem(tween: ConstantTween(1.0), weight: 1420),
  TweenSequenceItem(tween: Tween(begin: 1, end: 0).chain(CurveTween(curve: Curves.easeInExpo)), weight: 200),
]).animate(ctrl);
// rows: AnimatedBuilder with delay = index * 28ms
ctrl.forward();`,
      css: `/* CSS reference */
.menu-root { animation: gnu-reveal 280ms cubic-bezier(0.16,1,0.3,1) both; }
.menu-row  { animation: gnu-row-in 200ms cubic-bezier(0.16,1,0.3,1) both; }
.menu-row:nth-child(1) { animation-delay:  0ms; }
.menu-row:nth-child(2) { animation-delay: 28ms; }
.menu-row:nth-child(3) { animation-delay: 56ms; }
/* ... */
@keyframes gnu-reveal {
  from { clip-path: circle(0% at 12px 12px); transform: scale(.94); opacity: 0; }
  to   { clip-path: circle(160% at 12px 12px); transform: scale(1); opacity: 1; }
}`,
    },
    footer: 'Pour Quickshell : préfère StateGroup + Behavior on opacity/scale pour rester déclaratif. Pour Flutter : un seul AnimationController avec un TweenSequence.',
  },

  {
    id: 'R.02', title: 'Widget · card + preview', sub: 'Header preview suit la fenêtre, rows cascade, commit destructif.',
    demo: DemoR02, dur: 1900, perf: 'medium', touchOk: false,
    why: 'Variation de R.01 avec un en-tête identitaire qui ne participe pas au stagger. Le commit destructif (« Remove ») a un cue particulier — particules rouges et son plus court.',
    phases: [
      { from:    0, to:  280, moment: 'OPEN',    mol: 'M.01 reveal-from-cursor (+ header static)', atoms: ['A.04', 'A.02', 'A.01', 'A.15'] },
      { from:  280, to: 1080, moment: 'HOVER',   mol: 'M.03 row-hover-slide × 3 rows',            atoms: ['A.12'] },
      { from: 1080, to: 1280, moment: 'COMMIT',  mol: 'M.04 commit-flash (danger variant)',       atoms: ['A.02', 'A.09'] },
      { from: 1280, to: 1700, moment: 'HOLD',    mol: '(none)',                                    atoms: [] },
      { from: 1700, to: 1900, moment: 'CLOSE',   mol: 'M.02 dismiss-to-cursor',                   atoms: ['A.04', 'A.02', 'A.01'] },
    ],
    snippet: {
      neutral: `# R.02 · widget card
header:
  reveal: static — apparaît avec le menu, n'est pas dans le stagger
  preview-bg: rgba(255,106,0,.05) — n'anime pas
rows:
  stagger: 28ms (5 rows = 140ms total après l'open)
commit:
  danger flavor: particule rouge #FF5040 au lieu d'orange
  audio: cue.menu.commit (durée −20% : 110ms)`,
      qml: `// QML — same as R.01 but with a non-staggered header
ColumnLayout {
  Item { id: header; opacity: menuRoot.reveal }      // animates with root
  Repeater {
    model: rows
    Row { property real reveal: 0
      Behavior on reveal { NumberAnimation { duration: 200; easing.type: Easing.OutCubic } }
      Component.onCompleted: reveal = 1                // delayed via Qt.callLater
    }
  }
}`,
      css: `/* danger commit override */
.menu-row.danger.committing {
  animation: gnu-commit-danger 200ms cubic-bezier(0.4,0,0.2,1) both;
}
@keyframes gnu-commit-danger {
  0%   { transform: scale(1); }
  40%  { transform: scale(.96); }
  100% { transform: scale(1); }
}`,
    },
  },

  {
    id: 'R.03', title: 'Window · title-bar drop + tile picker', sub: 'Drop-down depuis la title-bar, sous-menu visuel (grille de tuiles).',
    demo: DemoR03, dur: 2200, perf: 'medium', touchOk: false,
    why: 'Le menu naît depuis le bord supérieur (mask origin = (8px, 0)) pour rappeler qu\'il appartient à la title-bar. Le sous-menu « Tile to » remplace le sous-menu textuel par une grille visuelle — la cible se choisit du regard.',
    phases: [
      { from:    0, to:  280, moment: 'OPEN',     mol: 'M.01 (origin top) + translateY −6 → 0',    atoms: ['A.04', 'A.03', 'A.01'] },
      { from:  280, to:  700, moment: 'HOVER',    mol: 'M.03 row-hover-slide',                     atoms: ['A.12'] },
      { from:  700, to: 1000, moment: 'SUB-OPEN', mol: 'M.05 sub-cascade + parent translateX −2', atoms: ['A.04', 'A.03', 'A.01'] },
      { from: 1000, to: 1500, moment: 'HOVER L½', mol: 'M.03 (tile cell)',                         atoms: ['A.12'] },
      { from: 1500, to: 2000, moment: 'HOLD',     mol: '(none)',                                    atoms: [] },
      { from: 2000, to: 2200, moment: 'CLOSE',    mol: 'M.06 sub-collapse + M.02 dismiss',          atoms: ['A.04', 'A.02', 'A.01'] },
    ],
    snippet: {
      neutral: `# R.03 · title-bar drop + tile picker
open-origin: (8px, 0px)   # corner of title-bar
sub-open:
  parent: translateX 0 → -2px (140ms ease=gentle)
  child:  mask 0% → 140% at (0, 12) + fade (280ms ease=decel)
sub-close:
  reverse, 140ms ease=accel`,
    },
  },

  {
    id: 'R.04', title: 'Nested · bubble tree ★', sub: 'La signature Gnu.In. Bloom radial spring + sub-bloom à la sélection.',
    demo: DemoR04, dur: 2900, perf: 'medium', touchOk: true, signature: true,
    why: 'Aucune autre recette ne casse aussi explicitement le fade+transient. Chaque bulle est une entité spring indépendante ; la sélection ne ferme pas le panneau — elle lui ajoute une nouvelle couche.',
    phases: [
      { from:    0, to:  100, moment: 'ARM',       mol: 'cursor approche',                  atoms: [] },
      { from:  100, to:  400, moment: 'CORE',      mol: 'M.12 core spawn (spring)',         atoms: ['A.14', 'A.02'] },
      { from:  400, to: 1100, moment: 'BLOOM ★',  mol: 'M.12 bubble-bloom (stagger 60ms)', atoms: ['A.14', 'A.15', 'A.01'] },
      { from: 1100, to: 1600, moment: 'HOVER',     mol: 'M.03 (bubble)',                     atoms: ['A.12'] },
      { from: 1600, to: 1800, moment: 'COMMIT',    mol: 'M.04 commit-flash',                 atoms: ['A.02', 'A.09'] },
      { from: 1800, to: 2200, moment: 'SUB-BLOOM', mol: 'M.12 sub-bloom (3 children)',       atoms: ['A.14', 'A.15'] },
      { from: 2200, to: 2700, moment: 'HOLD',      mol: '(none)',                             atoms: [] },
      { from: 2700, to: 2900, moment: 'CLOSE',     mol: 'reverse bloom + fade',              atoms: ['A.02', 'A.01'] },
    ],
    snippet: {
      neutral: `# R.04 · bubble tree (★ signature)
core:
  spawn: scale 0 → 1 (300ms ease=elastic)
bubbles:
  count: 6
  stagger: 60ms
  per-bubble: translate(0,0) → polar(110, θ_i) (280ms ease=elastic)
sub-bloom:
  trigger: commit on parent bubble
  count: 3 (variable)
  radius: 56px
  stagger: 50ms
close:
  reverse-order (last-in first-out) — bubbles retract along their wires
  total: 200ms

# Cas particulier : pas de mask reveal. C'est la seule recette où le
# pliage 3D / clip-path est absent. Le spring fait tout le travail.`,
      qml: `// QML — bubble bloom
Item {
  id: tree
  property real bloom: 0   // 0 closed → 1 fully bloomed
  Behavior on bloom { NumberAnimation { duration: 700; easing.type: Easing.OutElastic } }
  Repeater {
    model: 6
    Rectangle {
      property real myBloom: tree.bloom    // can stagger via index*0.05 offset
      x: cx + Math.cos(index * Math.PI/3 - Math.PI/2) * 110 * myBloom
      y: cy + Math.sin(index * Math.PI/3 - Math.PI/2) * 110 * myBloom
      // scale = myBloom
    }
  }
  Component.onCompleted: tree.bloom = 1
}`,
      flutter: `// Flutter — staggered spring on radial children
final ctrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 1100));
List<Animation<double>> bubbles = List.generate(6, (i) => Tween<double>(begin: 0, end: 1)
  .chain(CurveTween(curve: Curves.elasticOut))
  .animate(CurvedAnimation(parent: ctrl,
    curve: Interval(i * 0.055, i * 0.055 + 0.4, curve: Curves.linear))));`,
    },
    footer: '★ Signature — à conserver intact. Variantes acceptées : nombre de bulles (4 à 8), taille (40 à 64px), couleur du fil.',
  },

  {
    id: 'R.05', title: 'Tray · audio drop + slider', sub: 'Drop-from-icon, type-on status, slider drag, output switch.',
    demo: DemoR05, dur: 2500, perf: 'medium', touchOk: false,
    why: 'Les menus de tray sont consultés des dizaines de fois par jour ; la motion doit être courte (≤280ms) et invisible. Seuls deux moments cassent l\'invisibilité : le type-on du status (identité) et la pop visible au switch de sortie.',
    phases: [
      { from:    0, to:  100, moment: 'ARM',      mol: 'cursor → tray',                    atoms: [] },
      { from:  100, to:  380, moment: 'OPEN',     mol: 'M.01 (origin top-right) + ty −6', atoms: ['A.04', 'A.03', 'A.01'] },
      { from:  380, to:  800, moment: 'TYPE-ON',  mol: 'A.11 type-on status line',         atoms: ['A.11'] },
      { from:  800, to: 1500, moment: 'SLIDER',   mol: 'drag-then-release',                 atoms: ['A.03'] },
      { from: 1500, to: 1700, moment: 'HOVER',    mol: 'M.03 (output row)',                 atoms: ['A.12'] },
      { from: 1700, to: 1900, moment: 'COMMIT',   mol: 'M.04 commit-flash',                 atoms: ['A.02', 'A.09'] },
      { from: 1900, to: 2300, moment: 'HOLD',     mol: '(none)',                             atoms: [] },
      { from: 2300, to: 2500, moment: 'CLOSE',    mol: 'M.02 dismiss-to-cursor',            atoms: ['A.04', 'A.02', 'A.01'] },
    ],
    snippet: {
      neutral: `# R.05 · tray audio
open-origin: (28px, 0)    # left edge of tray icon
type-on:
  text: ">_ audio · 1 output"
  speed: 420ms total, linear (≈ 50ms/char)
slider:
  drag: track follows pointer immediately (no animation)
  release: snap-back if > 5% off, ease=overshoot, 200ms
  no animation on the value itself during drag
  audio: micro-blip every 5 units (cue.tray.tick @ -36 LUFS)
output-switch:
  particle burst over the new active row (M.04)
  active dot (green) cross-fades 140ms`,
    },
    footer: 'Les menus de tray sont les plus visités. Garder la motion sobre — tout overshoot ici fatiguerait l\'œil.',
  },
];

Object.assign(window, { RECIPES, phaseP });
