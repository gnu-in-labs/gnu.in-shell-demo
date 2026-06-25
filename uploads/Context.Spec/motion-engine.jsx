// motion-engine.jsx
// Time-driven Stage + scrubber/replay + AssetCard layout.
// Atoms and molecules read time via useMotionTime() and render whatever
// frame they want; no CSS-keyframe magic, every value is interpolated in JS.

const MotionCtx = React.createContext(null);

// MotionStage — owns its own clock, exposes time in ms.
//
//   <MotionStage duration={1200} hold={400} loop>
//      <MotionStageView>...animation...</MotionStageView>
//      <MotionControls/>  // optional, recommended in AssetCard footer
//   </MotionStage>
//
// `duration` is the animation length. `hold` is extra ms held at t=duration
// before looping back to 0 (so the user sees the settled state).
function MotionStage({ duration = 800, hold = 600, loop = true, autoplay = true, children, onLoop }) {
  const [t, setT] = React.useState(0);
  const [playing, setPlaying] = React.useState(autoplay);
  const [version, setVersion] = React.useState(0);
  const startRef = React.useRef(null);
  const rafRef = React.useRef(null);
  const scrubAtRef = React.useRef(null); // ms offset when user scrubs

  const total = duration + hold;

  React.useEffect(() => {
    if (!playing) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }
    const tick = (now) => {
      if (startRef.current == null) startRef.current = now - (scrubAtRef.current ?? 0);
      const elapsed = now - startRef.current;
      let cur = elapsed;
      if (loop) {
        if (elapsed >= total) {
          // Wrap; mark new loop.
          startRef.current = now;
          cur = 0;
          if (onLoop) onLoop();
          setVersion((v) => v + 1);
        }
      } else {
        cur = Math.min(elapsed, total);
      }
      setT(cur);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing, loop, total]);

  const replay = React.useCallback(() => {
    startRef.current = null;
    scrubAtRef.current = 0;
    setT(0);
    setVersion((v) => v + 1);
    setPlaying(true);
  }, []);

  const scrub = React.useCallback((ms) => {
    setPlaying(false);
    scrubAtRef.current = ms;
    startRef.current = null;
    setT(Math.max(0, Math.min(total, ms)));
  }, [total]);

  const togglePlay = React.useCallback(() => {
    setPlaying((p) => {
      if (!p) {
        // Resume from current t.
        startRef.current = null;
        scrubAtRef.current = t;
      }
      return !p;
    });
  }, [t]);

  const value = { t, p: Math.min(1, t / duration), duration, hold, total, playing, version, replay, scrub, togglePlay };
  return <MotionCtx.Provider value={value}>{children}</MotionCtx.Provider>;
}

// Hook: returns { t, p, duration, ... }.  p = t/duration clamped to [0, 1].
function useMotionTime() {
  const ctx = React.useContext(MotionCtx);
  if (!ctx) return { t: 0, p: 0, duration: 1000, hold: 0, total: 1000, playing: false, version: 0, replay: () => {}, scrub: () => {}, togglePlay: () => {} };
  return ctx;
}

// Sub-timeline: scope a child to [start, end] of the parent clock.
//   const { p } = useSubTimeline(0, 200);  // p = 0..1 over first 200ms
function useSubTimeline(start, end) {
  const { t } = useMotionTime();
  const p = end > start ? Math.max(0, Math.min(1, (t - start) / (end - start))) : 0;
  return { t: t - start, p, raw: t };
}

// ── Controls bar ────────────────────────────────────────────────────
function MotionControls({ compact = false, theme }) {
  const { t, total, playing, replay, scrub, togglePlay } = useMotionTime();
  const tx = theme || { text: '#111418', accent: '#FF6A00', border: 'rgba(17,20,24,.12)', surface: '#FFFFFF', textDim: 'rgba(17,20,24,.55)', textFaint: 'rgba(17,20,24,.35)' };
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: compact ? '4px 6px' : '8px 10px',
      borderRadius: 8, background: tx.surface, border: `.5px solid ${tx.border}`,
      fontFamily: 'ui-sans-serif, system-ui, sans-serif', fontSize: 11,
    }}>
      <button onClick={togglePlay} style={ctrlBtn(tx)} aria-label={playing ? 'pause' : 'play'}>
        {playing
          ? <svg width="10" height="10" viewBox="0 0 10 10"><rect x="1.5" y="1" width="2.4" height="8" fill="currentColor"/><rect x="6.1" y="1" width="2.4" height="8" fill="currentColor"/></svg>
          : <svg width="10" height="10" viewBox="0 0 10 10"><polygon points="2,1 9,5 2,9" fill="currentColor"/></svg>}
      </button>
      <button onClick={replay} style={ctrlBtn(tx)} aria-label="replay">
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1.5 5.5a4 4 0 1 1 1.3 3"/><path d="M2 9V6h3"/>
        </svg>
      </button>
      <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 10, color: tx.textDim, fontVariantNumeric: 'tabular-nums', minWidth: 56 }}>
        {String(Math.round(t)).padStart(4, '0')} / {String(total).padStart(4, '0')}ms
      </span>
      <Scrubber value={t} max={total} onChange={scrub} theme={tx} />
    </div>
  );
}

function ctrlBtn(tx) {
  return {
    width: 22, height: 22, borderRadius: 4, border: `.5px solid ${tx.border}`,
    background: 'transparent', color: tx.text, cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    padding: 0, flexShrink: 0,
  };
}

function Scrubber({ value, max, onChange, theme }) {
  const ref = React.useRef(null);
  const dragRef = React.useRef(false);
  const onMove = (e) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
    const p = Math.max(0, Math.min(1, x / r.width));
    onChange(p * max);
  };
  React.useEffect(() => {
    const up = () => { dragRef.current = false; };
    const move = (e) => { if (dragRef.current) onMove(e); };
    window.addEventListener('mouseup', up);
    window.addEventListener('mousemove', move);
    window.addEventListener('touchend', up);
    window.addEventListener('touchmove', move);
    return () => {
      window.removeEventListener('mouseup', up);
      window.removeEventListener('mousemove', move);
      window.removeEventListener('touchend', up);
      window.removeEventListener('touchmove', move);
    };
  }, []);
  const pct = (value / max) * 100;
  return (
    <div ref={ref} onMouseDown={(e) => { dragRef.current = true; onMove(e); }}
         onTouchStart={(e) => { dragRef.current = true; onMove(e); }}
      style={{ flex: 1, height: 14, position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
      <div style={{ position: 'absolute', left: 0, right: 0, height: 3, background: theme.border, borderRadius: 2 }} />
      <div style={{ position: 'absolute', left: 0, width: `${pct}%`, height: 3, background: theme.accent, borderRadius: 2 }} />
      <div style={{ position: 'absolute', left: `${pct}%`, width: 10, height: 10, borderRadius: 6, background: '#fff', border: `1.5px solid ${theme.accent}`, transform: 'translateX(-5px)', boxShadow: '0 1px 3px rgba(0,0,0,.2)' }} />
    </div>
  );
}

// ── Stage Frame ──────────────────────────────────────────────────────
// Constant-size area where the animation plays.  Background mat is set
// by theme.  Use this inside an AssetCard's stage column.
function MotionStageView({ w = 520, h = 360, theme, children, withGrain = true, anchor = 'center' }) {
  const tx = theme || { surface: '#FFFFFF', border: 'rgba(17,20,24,.12)' };
  return (
    <div style={{
      width: '100%', height: '100%', borderRadius: 8,
      background: tx.mode === 'dark' ? '#0B0D10' : '#EFEAE0',
      border: `.5px solid ${tx.border}`,
      position: 'relative', overflow: 'hidden',
      display: 'flex', alignItems: anchor === 'top' ? 'flex-start' : 'center', justifyContent: 'center',
    }}>
      <FitScale w={w} h={h} background={tx.mode === 'dark' ? '#0B0D10' : '#EFEAE0'} anchor={anchor}>
        {children}
        {withGrain && <GrainBg opacity={0.04} />}
      </FitScale>
    </div>
  );
}

// ── Spec column primitives ──────────────────────────────────────────
// Compact tag chip for badges.
function MChip({ tone = 'ink', children, style }) {
  const map = {
    ink:    { bg: '#111418', fg: '#F7F3ED', bd: 'transparent' },
    paper:  { bg: '#FBFAF6', fg: '#111418', bd: '#D7DADF' },
    orange: { bg: '#FF6A00', fg: '#1A0A00', bd: 'transparent' },
    green:  { bg: '#5F7F52', fg: '#F7F3ED', bd: 'transparent' },
    soft:   { bg: 'rgba(17,20,24,.06)', fg: '#111418', bd: 'transparent' },
    perf_light:  { bg: '#E8F1E5', fg: '#3D5A33', bd: 'transparent' },
    perf_med:    { bg: '#FBEFD8', fg: '#7A4A0F', bd: 'transparent' },
    perf_heavy:  { bg: '#F5D8D2', fg: '#7A2412', bd: 'transparent' },
  };
  const s = map[tone] || map.soft;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 7px', borderRadius: 3,
      background: s.bg, color: s.fg, border: `.5px solid ${s.bd}`,
      fontFamily: 'ui-monospace, monospace', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
      ...style,
    }}>{children}</span>
  );
}

// Token row in the spec column: KEY ……… VALUE
function MTokenRow({ k, v, dim }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, fontSize: 11, lineHeight: 1.55 }}>
      <span style={{ color: 'rgba(17,20,24,.5)', fontFamily: 'ui-monospace, monospace', letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: 9, fontWeight: 600, minWidth: 56 }}>{k}</span>
      <span style={{ flex: 1, height: 1, borderBottom: '1px dotted rgba(17,20,24,.18)', alignSelf: 'center', marginTop: 4 }} />
      <span style={{ color: dim ? 'rgba(17,20,24,.55)' : '#111418', fontFamily: 'ui-monospace, monospace', fontSize: 10, fontVariantNumeric: 'tabular-nums' }}>{v}</span>
    </div>
  );
}

// Snippet tabs : NEU / CSS / QML / QT / FLU
function MSnippetTabs({ specs, defaultTab = 'neutral' }) {
  const [tab, setTab] = React.useState(defaultTab);
  const tabs = [
    { k: 'neutral', label: 'NEU', desc: 'tokens' },
    { k: 'css',     label: 'CSS', desc: 'web · référence' },
    { k: 'qml',     label: 'QML', desc: 'Quickshell' },
    { k: 'qt',      label: 'QT',  desc: 'Qt C++' },
    { k: 'flutter', label: 'FLU', desc: 'Flutter' },
  ];
  const cur = specs[tab] || specs.neutral || '';
  return (
    <div>
      <div style={{ display: 'flex', gap: 1, marginBottom: 4 }}>
        {tabs.map((tb) => (
          <button key={tb.k} onClick={() => setTab(tb.k)} style={{
            padding: '3px 7px', fontSize: 9, fontFamily: 'ui-monospace, monospace', fontWeight: 700,
            letterSpacing: '0.08em', borderRadius: 3, cursor: 'pointer',
            background: tab === tb.k ? '#111418' : 'rgba(17,20,24,.04)',
            color: tab === tb.k ? '#FF6A00' : 'rgba(17,20,24,.55)',
            border: '.5px solid rgba(17,20,24,.08)',
          }}>{tb.label}</button>
        ))}
        <span style={{ fontSize: 9, color: 'rgba(17,20,24,.4)', fontFamily: 'ui-monospace, monospace', marginLeft: 'auto', alignSelf: 'center' }}>
          {tabs.find((tb) => tb.k === tab)?.desc}
        </span>
      </div>
      <pre style={{
        margin: 0, padding: 10, borderRadius: 6,
        background: '#0B0D10', color: '#F7F3ED',
        fontFamily: 'ui-monospace, "JetBrains Mono", monospace', fontSize: 9.5, lineHeight: 1.55,
        overflow: 'auto', maxHeight: 168, whiteSpace: 'pre',
      }}>{cur}</pre>
    </div>
  );
}

// ── AssetCard ────────────────────────────────────────────────────────
// Layout : two columns inside a 1280×720 DCArtboard.
//   Left  = MotionStage + scrubber under it.
//   Right = spec column.
function AssetCard({ id, kind, title, sub, tone, stage, spec, footer }) {
  const KIND_TONES = {
    atom:     { label: 'ATOME',     bg: '#111418', fg: '#FF6A00' },
    molecule: { label: 'MOLÉCULE',  bg: '#5F7F52', fg: '#F7F3ED' },
    recipe:   { label: 'RECETTE',   bg: '#FF6A00', fg: '#1A0A00' },
    moment:   { label: 'MOMENT',    bg: '#FBFAF6', fg: '#111418', bd: '#111418' },
    handoff:  { label: 'HANDOFF',   bg: '#F7F3ED', fg: '#111418' },
  };
  const t = KIND_TONES[kind] || KIND_TONES.atom;
  return (
    <div style={{
      width: 1280, height: 720, background: '#FBFAF6', color: '#111418',
      fontFamily: 'ui-sans-serif, system-ui, sans-serif', position: 'relative',
      display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: 'auto 1fr',
      padding: 28, columnGap: 24, rowGap: 18, boxSizing: 'border-box',
    }}>
      {/* Header strip spanning both columns */}
      <div style={{
        gridColumn: '1 / -1', display: 'flex', alignItems: 'flex-start', gap: 14,
      }}>
        <span style={{
          padding: '4px 10px', fontSize: 10, fontFamily: 'ui-monospace, monospace',
          fontWeight: 700, letterSpacing: '0.14em', borderRadius: 3,
          background: t.bg, color: t.fg, border: t.bd ? `.5px solid ${t.bd}` : 'none',
        }}>{t.label}</span>
        {id && <span style={{
          padding: '4px 10px', fontSize: 10, fontFamily: 'ui-monospace, monospace',
          fontWeight: 700, letterSpacing: '0.14em', borderRadius: 3,
          background: '#0B0D10', color: '#FF6A00',
        }}>{id}</span>}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.15 }}>{title}</div>
          {sub && <div style={{ fontSize: 12, color: 'rgba(17,20,24,.62)', marginTop: 3, lineHeight: 1.45, maxWidth: 720 }}>{sub}</div>}
        </div>
      </div>

      {/* Stage column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0 }}>
        <div style={{ flex: 1, minHeight: 0 }}>{stage}</div>
        <MotionControls />
      </div>

      {/* Spec column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0, overflow: 'auto' }}>
        {spec}
      </div>

      {/* Footer note */}
      {footer && (
        <div style={{
          gridColumn: '1 / -1', fontSize: 10, color: 'rgba(17,20,24,.5)',
          fontFamily: 'ui-monospace, monospace', letterSpacing: '0.04em', borderTop: '.5px solid rgba(17,20,24,.1)', paddingTop: 8,
        }}>{footer}</div>
      )}
    </div>
  );
}

// ── Generic Spec column composition ─────────────────────────────────
function SpecPanel({ children }) {
  return (
    <div style={{
      flex: 1, padding: 14, borderRadius: 10, background: '#FFFFFF',
      border: '.5px solid rgba(17,20,24,.1)',
      display: 'flex', flexDirection: 'column', gap: 12, overflow: 'auto',
    }}>{children}</div>
  );
}

function SpecBlock({ label, children, style }) {
  return (
    <div style={style}>
      <div style={{
        fontSize: 9, fontWeight: 700, letterSpacing: '0.14em',
        color: '#FF6A00', textTransform: 'uppercase', marginBottom: 6,
        fontFamily: 'ui-monospace, monospace',
      }}>{label}</div>
      {children}
    </div>
  );
}

Object.assign(window, {
  MotionStage, useMotionTime, useSubTimeline, MotionCtx,
  MotionControls, Scrubber, MotionStageView,
  AssetCard, SpecPanel, SpecBlock,
  MChip, MTokenRow, MSnippetTabs,
});
