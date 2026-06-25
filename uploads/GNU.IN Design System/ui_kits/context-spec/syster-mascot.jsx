// syster-mascot.jsx
// Sys.ter as a narrative companion — speech bubbles + multiple poses.
// Used to guide reading of the design canvas with playful French commentary.

// ── Sys.ter expanded mascot (larger, expressive) ──────────────────────
function SysterFace({ size = 80, mood = 'neutral', accent = '#FF6A00' }) {
  // Moods: neutral, happy, curious, wink, thinking, alert
  const eye = (cx, cy, m) => {
    if (m === 'wink' && cx > 12) return <path d={`M${cx - 1.2} ${cy} L${cx + 1.2} ${cy}`} stroke="#F7F3ED" strokeWidth="1.2" strokeLinecap="round" />;
    if (m === 'happy') return <path d={`M${cx - 1.3} ${cy + 0.4} Q${cx} ${cy - 1}, ${cx + 1.3} ${cy + 0.4}`} stroke="#F7F3ED" strokeWidth="1.2" fill="none" strokeLinecap="round" />;
    if (m === 'thinking') return <circle cx={cx} cy={cy + 0.2} r="0.7" fill="#F7F3ED" />;
    if (m === 'alert') return <circle cx={cx} cy={cy} r="1.2" fill={accent} />;
    return <circle cx={cx} cy={cy} r="0.95" fill="#F7F3ED" />;
  };
  const mouth = (m) => {
    if (m === 'happy') return <path d="M10 17 Q12 19, 14 17" stroke="#F7F3ED" strokeWidth="1.1" fill="none" strokeLinecap="round" />;
    if (m === 'curious') return <circle cx="12" cy="17.5" r="0.8" fill="none" stroke="#F7F3ED" strokeWidth="1" />;
    if (m === 'thinking') return <path d="M10.5 17.5 L13.5 17.5" stroke="#F7F3ED" strokeWidth="1.1" strokeLinecap="round" />;
    if (m === 'alert') return <path d="M10 17.5 Q12 16.5, 14 17.5" stroke="#F7F3ED" strokeWidth="1.1" fill="none" strokeLinecap="round" />;
    if (m === 'wink') return <path d="M10 17.5 Q12 19, 14 17.5" stroke="#F7F3ED" strokeWidth="1.1" fill="none" strokeLinecap="round" />;
    return <path d="M10.5 17.5 L13.5 17.5" stroke="#F7F3ED" strokeWidth="1.1" strokeLinecap="round" />;
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      {/* shadow */}
      <ellipse cx="12" cy="22.5" rx="6" ry="0.6" fill="rgba(0,0,0,0.18)" />
      {/* body */}
      <rect x="4" y="6" width="16" height="16" rx="2.8" fill={accent} />
      {/* screen */}
      <rect x="6" y="8" width="12" height="12" rx="1.8" fill="#111418" />
      {/* eyes */}
      {eye(10, 13, mood)}
      {eye(14, 13, mood)}
      {/* mouth */}
      {mouth(mood)}
      {/* beret */}
      <ellipse cx="12" cy="4" rx="5.5" ry="1.6" fill="#5F7F52" />
      <circle cx="14.8" cy="3" r="0.9" fill="#5F7F52" />
      {/* antenna shadow */}
      <line x1="12" y1="2.4" x2="12" y2="3.5" stroke="#3A4A30" strokeWidth="0.4" />
    </svg>
  );
}

// ── Speech bubble with tail ───────────────────────────────────────────
function SysterBubble({ children, side = 'right', tone = 'neutral', tail = true, width = 280 }) {
  // Tones: neutral / orange / dark / hint
  const palettes = {
    neutral: { bg: '#FBFAF6', text: '#111418', border: 'rgba(17,20,24,.18)', label: '#FF6A00' },
    orange:  { bg: '#FF6A00', text: '#FFF6EC', border: '#E05A00', label: '#1A0A00' },
    dark:    { bg: '#111418', text: '#F7F3ED', border: 'rgba(247,243,237,.15)', label: '#FF6A00' },
    hint:    { bg: '#FEF4A8', text: '#5A4A2A', border: 'rgba(90,74,42,.2)', label: '#A06A00' },
  };
  const p = palettes[tone];
  return (
    <div style={{ position: 'relative', width, fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>
      <div style={{
        background: p.bg, color: p.text, border: `.5px solid ${p.border}`,
        borderRadius: 14, padding: '14px 16px',
        boxShadow: '0 6px 20px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.06)',
        fontSize: 13.5, lineHeight: 1.55, letterSpacing: '-0.005em',
        position: 'relative',
      }}>
        {children}
      </div>
      {tail && (
        <svg width="24" height="14" viewBox="0 0 24 14"
          style={{
            position: 'absolute', bottom: -10,
            [side]: 28,
            filter: 'drop-shadow(0 2px 2px rgba(0,0,0,.06))',
          }}>
          <path d={side === 'left' ? 'M2 0 L2 1 L18 1 L8 12 Z' : 'M22 0 L22 1 L6 1 L16 12 Z'} fill={p.bg} stroke={p.border} strokeWidth=".5" />
        </svg>
      )}
    </div>
  );
}

// ── Composite: Sys.ter + bubble in a row, used as a narrative beat ────
function SysterCommentaire({ mood = 'neutral', tone = 'neutral', side = 'right', children, width = 320, label, mascotSize = 64 }) {
  // Layout: mascot on the left, bubble on the right (or reversed if side='left')
  const isReversed = side === 'left';
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-end', gap: 14,
      flexDirection: isReversed ? 'row-reverse' : 'row',
      maxWidth: width + 90, padding: '8px 0',
    }}>
      <div style={{ flexShrink: 0, transform: isReversed ? 'scaleX(-1)' : 'none' }}>
        <SysterFace size={mascotSize} mood={mood} />
      </div>
      <div style={{ flex: 1 }}>
        {label && (
          <div style={{
            fontSize: 9.5, color: '#FF6A00', fontWeight: 700, letterSpacing: '0.14em',
            fontFamily: 'ui-monospace, monospace', marginBottom: 6, marginLeft: isReversed ? 0 : 6,
            textTransform: 'uppercase',
          }}>{label}</div>
        )}
        <SysterBubble tone={tone} side={isReversed ? 'right' : 'left'} width={width}>
          {children}
        </SysterBubble>
      </div>
    </div>
  );
}

// ── Section header card — verbose French intro for each section ───────
function SectionIntro({ number, title, lede, mascotMood = 'neutral', mascotMessage, prescriptions }) {
  return (
    <FitScale w={480} h={460} background="#FBFAF6">
    <div style={{
      width: 480, height: 460, padding: 26, position: 'relative', overflow: 'hidden',
      background: '#FBFAF6', color: '#111418',
      fontFamily: 'ui-sans-serif, system-ui, sans-serif',
      borderRadius: 0,
      boxSizing: 'border-box',
    }}>
      {/* dotted grid background */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.5 }}>
        <defs>
          <pattern id={`dots-${number}`} x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.5" fill="rgba(17,20,24,.15)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#dots-${number})`} />
      </svg>

      {/* big number */}
      <div style={{
        position: 'absolute', right: -12, top: -28,
        fontSize: 200, fontWeight: 800, lineHeight: 1,
        color: 'rgba(255,106,0,.08)', fontFamily: 'ui-monospace, monospace',
        userSelect: 'none', pointerEvents: 'none',
      }}>{number}</div>

      <div style={{ position: 'relative' }}>
        <div style={{ fontSize: 10, color: '#FF6A00', letterSpacing: '0.2em', fontWeight: 700, fontFamily: 'ui-monospace, monospace' }}>
          ARCHÉTYPE · {number}
        </div>
        <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em', marginTop: 6, lineHeight: 1.1, maxWidth: 360 }}>
          {title}
        </div>
        <div style={{ fontSize: 13.5, color: 'rgba(17,20,24,.7)', lineHeight: 1.55, marginTop: 14, maxWidth: 380 }}>
          {lede}
        </div>

        {prescriptions && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 9.5, color: '#111418', letterSpacing: '0.14em', fontWeight: 700, fontFamily: 'ui-monospace, monospace', marginBottom: 8 }}>
              PRESCRIPTIONS
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 5 }}>
              {prescriptions.map((p, i) => (
                <li key={i} style={{ display: 'flex', gap: 8, fontSize: 12, color: 'rgba(17,20,24,.78)', lineHeight: 1.5 }}>
                  <span style={{ color: '#FF6A00', fontFamily: 'ui-monospace, monospace', fontWeight: 700, flexShrink: 0 }}>·</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* sys.ter pinned to bottom-right */}
      {mascotMessage && (
        <div style={{ position: 'absolute', bottom: 18, left: 22, right: 22, display: 'flex', alignItems: 'flex-end', gap: 10 }}>
          <SysterFace size={48} mood={mascotMood} />
          <div style={{
            flex: 1, background: '#111418', color: '#F7F3ED', borderRadius: 10,
            padding: '8px 12px', fontSize: 11.5, lineHeight: 1.5, fontStyle: 'italic',
            position: 'relative',
          }}>
            <span style={{ color: '#FF6A00', fontWeight: 700, fontFamily: 'ui-monospace, monospace', fontStyle: 'normal', letterSpacing: '0.08em', fontSize: 9, display: 'block', marginBottom: 2 }}>SYS.TER —</span>
            « {mascotMessage} »
          </div>
        </div>
      )}
    </div>
    </FitScale>
  );
}

// ── A wide narrative card for between-sections commentary / transitions
function NarrativeCard({ children, tone = 'paper', label }) {
  const palette = tone === 'paper'
    ? { bg: '#FBFAF6', text: '#111418', accent: '#FF6A00', sub: 'rgba(17,20,24,.68)' }
    : { bg: '#0B0D10', text: '#F7F3ED', accent: '#FF6A00', sub: 'rgba(247,243,237,.68)' };
  return (
    <FitScale w={480} h={460} background={palette.bg}>
    <div style={{
      width: 480, height: 460, padding: 28, position: 'relative', overflow: 'hidden',
      background: palette.bg, color: palette.text,
      fontFamily: 'ui-sans-serif, system-ui, sans-serif',
      boxSizing: 'border-box',
    }}>
      {tone === 'dark' && <DitherBg color="#FF6A00" opacity={0.06} />}
      <GrainBg opacity={tone === 'dark' ? 0.1 : 0.04} />
      <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>
        {label && (
          <div style={{ fontSize: 9.5, color: palette.accent, letterSpacing: '0.2em', fontWeight: 700, fontFamily: 'ui-monospace, monospace', marginBottom: 12 }}>
            {label}
          </div>
        )}
        {children}
      </div>
    </div>
    </FitScale>
  );
}

Object.assign(window, { SysterFace, SysterBubble, SysterCommentaire, SectionIntro, NarrativeCard });
