// syster-mini-board.jsx
// Promo "fiche" for the Syster Mini mascot — hero (auto-cycling states) +
// the four states live, with their motion tokens. Built for the Motion Spec canvas.

const MINI_STATES = [
  { id: 'idle',      label: 'IDLE',      title: 'Repos',         note: 'Flotte doucement · le curseur clignote.',     spec: 'bob 3.2s ease-in-out · cursor 1.6s' },
  { id: 'listening', label: 'LISTENING', title: 'À l\u2019écoute',  note: 'Bulbe d\u2019antenne pulse · ondes sonores.',  spec: 'pulse 1.1s · ondes 1.6s ×2' },
  { id: 'transmit',  label: 'TRANSMIT',  title: 'Transmission',  note: 'Anneaux sonar émis depuis le tip d’antenne · curseur « … ».',  spec: 'ripple r 8→60 · 1.7s ×2 · dots 1.2s' },
  { id: 'veille',    label: 'VEILLE',    title: 'Veille',        note: 'Écran off · les z’s montent depuis l’antenne.',         spec: 'drift 2.8s ↖ · écran off' },
];

function MiniStateTile({ s, active, onClick }) {
  return (
    <div onClick={onClick} style={{
      border: `.5px solid ${active ? 'rgba(255,106,0,.5)' : 'rgba(255,255,255,.1)'}`, borderRadius: 14,
      padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, position: 'relative', overflow: 'hidden',
      cursor: 'pointer', transition: 'border-color .3s ease, background .3s ease',
      background: active ? 'linear-gradient(0deg, rgba(255,106,0,.06), rgba(255,106,0,.06)), #111418' : '#111418',
    }}>
      <div style={{
        width: 96, height: 96, flexShrink: 0, borderRadius: 12, background: '#0B0D10',
        border: '.5px solid rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <SysterMini size={84} state={s.id} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 9.5, color: '#FF6A00', fontWeight: 700, letterSpacing: '0.16em', fontFamily: 'ui-monospace, monospace' }}>{s.label}</div>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#F7F3ED', marginTop: 1, letterSpacing: '-0.01em' }}>{s.title}</div>
        <div style={{ fontSize: 11.5, color: 'rgba(247,243,237,.6)', lineHeight: 1.4, marginTop: 4 }}>{s.note}</div>
        <div style={{ fontSize: 10, color: 'rgba(247,243,237,.4)', fontFamily: 'ui-monospace, monospace', marginTop: 6 }}>{s.spec}</div>
      </div>
    </div>
  );
}

function SysterMiniBoard() {
  const [i, setI] = React.useState(1); // start on "listening"
  const [paused, setPaused] = React.useState(false);
  React.useEffect(() => {
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || paused) return;
    const t = setInterval(() => setI((p) => (p + 1) % MINI_STATES.length), 2800);
    return () => clearInterval(t);
  }, [paused]);
  const cur = MINI_STATES[i];

  return (
    <FitScale w={1280} h={720} background="#0B0D10">
      <div style={{
        width: 1280, height: 720, background: '#0B0D10', color: '#F7F3ED', position: 'relative', overflow: 'hidden',
        fontFamily: 'ui-sans-serif, system-ui, sans-serif', padding: 56, boxSizing: 'border-box',
        display: 'flex', flexDirection: 'column', gap: 22,
      }}>
        <DitherBg color="#FF6A00" opacity={0.06} />
        <GrainBg opacity={0.08} />

        {/* Header */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', gap: 18 }}>
          <div>
            <div style={{ fontSize: 11, color: '#FF6A00', fontWeight: 700, letterSpacing: '0.18em', fontFamily: 'ui-monospace, monospace' }}>GNU.IN-SHELL · MASCOTTE SYSTÈME · SYSTER MINI</div>
            <div style={{ fontSize: 40, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1, marginTop: 4 }}>Syster Mini, en mouvement</div>
          </div>
          <div style={{ marginLeft: 'auto', maxWidth: 360, fontSize: 13, lineHeight: 1.5, color: 'rgba(247,243,237,.6)', textAlign: 'right' }}>
            Quatre états, une personnalité. Le compagnon du shell respire, écoute, transmet et s'endort — chaque humeur portée par une seule courbe chaude.
          </div>
        </div>

        {/* Main */}
        <div style={{ position: 'relative', flex: 1, display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: 26, minHeight: 0 }}>

          {/* Hero — auto-cycling, hover to pause, click dots to pick */}
          <div
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            style={{
            position: 'relative', borderRadius: 18, overflow: 'hidden',
            background: 'radial-gradient(120% 90% at 50% 32%, rgba(255,106,0,.16), rgba(11,13,16,0) 60%), #0E1114',
            border: '.5px solid rgba(255,255,255,.08)', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 22, padding: 28,
          }}>
            {/* concentric guide rings */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.5 }}>
              <defs>
                <radialGradient id="mini-ring" cx="50%" cy="42%" r="50%">
                  <stop offset="0%" stopColor="rgba(255,106,0,0)" />
                  <stop offset="78%" stopColor="rgba(255,106,0,0)" />
                  <stop offset="80%" stopColor="rgba(255,106,0,.12)" />
                  <stop offset="82%" stopColor="rgba(255,106,0,0)" />
                </radialGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#mini-ring)" />
            </svg>
            <div style={{ position: 'relative', filter: 'drop-shadow(0 18px 30px rgba(0,0,0,.45))' }}>
              <SysterMini size={320} state={cur.id} />
            </div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10 }}>
              {MINI_STATES.map((s, idx) => (
                <button key={s.id} onClick={() => { setI(idx); setPaused(true); }} aria-label={s.title} style={{
                  width: idx === i ? 22 : 9, height: 9, borderRadius: 5, padding: 0, border: 'none', cursor: 'pointer',
                  background: idx === i ? '#FF6A00' : 'rgba(247,243,237,.22)', transition: 'all .4s ease',
                }} />
              ))}
            </div>
            <div style={{ position: 'relative', textAlign: 'center', minHeight: 44 }}>
              <div style={{ fontSize: 11, color: '#FF6A00', fontWeight: 700, letterSpacing: '0.16em', fontFamily: 'ui-monospace, monospace' }}>{cur.label}</div>
              <div style={{ fontSize: 13, color: 'rgba(247,243,237,.62)', fontFamily: 'ui-monospace, monospace', marginTop: 4 }}>{cur.spec}</div>
            </div>
          </div>

          {/* States grid */}
          <div style={{ display: 'grid', gridTemplateRows: 'repeat(4, 1fr)', gap: 14, minHeight: 0 }}>
            {MINI_STATES.map((s, idx) => <MiniStateTile key={s.id} s={s} active={idx === i} onClick={() => { setI(idx); setPaused(true); }} />)}
          </div>
        </div>

        {/* Footer — build + motion note */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 14, fontSize: 11, color: 'rgba(247,243,237,.5)', fontFamily: 'ui-monospace, monospace', letterSpacing: '0.04em' }}>
          <span style={{ padding: '4px 10px', borderRadius: 3, background: 'rgba(255,106,0,.15)', color: '#FF6A00', fontWeight: 700 }}>256 × 256 · SMIL</span>
          <span>antenne-signal + corps-terminal · profil de face · une géométrie, quatre humeurs</span>
          <span style={{ marginLeft: 'auto' }}>reduced-motion → état figé au repos</span>
        </div>
      </div>
    </FitScale>
  );
}

Object.assign(window, { SysterMiniBoard, MINI_STATES });
