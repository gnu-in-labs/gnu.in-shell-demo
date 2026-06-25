// menu-primitives.jsx
// Gnu.In-Shell context menu primitives.
// Tokens, shape presets, mask-reveal animation, dither/grain backgrounds,
// MenuShell, MenuRow, MenuSection, MenuSeparator, KbdHint, Submenu arrow.

const GNU = {
  anthracite: '#111418',
  signal: '#FF6A00',
  beret: '#5F7F52',
  shellWhite: '#F7F3ED',
  // derived
  ink: '#111418',
  paper: '#F7F3ED'
};

// Theme resolver — dark/light + branding heaviness.
function gnuTheme({ dark, brand }) {
  const heavy = brand === 'heavy';
  const medium = brand === 'medium';
  const light = brand === 'light';
  if (dark) {
    return {
      bg: heavy ? '#0E1114' : '#15181C',
      bgGrain: heavy ? '#0A0C0F' : '#10131680',
      surface: heavy ? '#181C20' : '#1B1F23',
      hover: heavy ? '#22272D' : '#252A30',
      border: heavy ? 'rgba(255,106,0,.14)' : 'rgba(255,255,255,.07)',
      text: '#F7F3ED',
      textDim: 'rgba(247,243,237,.55)',
      textFaint: 'rgba(247,243,237,.32)',
      accent: GNU.signal,
      accentDim: 'rgba(255,106,0,.14)',
      green: GNU.beret,
      kbdBg: 'rgba(255,255,255,.06)',
      kbdBorder: 'rgba(255,255,255,.08)',
      sectionLb: heavy ? '#FF6A00' : 'rgba(247,243,237,.4)',
      shadow: '0 24px 64px -8px rgba(0,0,0,.6),0 8px 24px -4px rgba(0,0,0,.4),0 0 0 .5px rgba(255,255,255,.04)',
      mode: 'dark'
    };
  }
  return {
    bg: heavy ? '#F7F3ED' : '#FBFAF6',
    bgGrain: heavy ? '#EFEAE0' : '#F2EEE6',
    surface: '#FFFFFF',
    hover: heavy ? 'rgba(255,106,0,.08)' : 'rgba(17,20,24,.05)',
    border: heavy ? 'rgba(17,20,24,.12)' : 'rgba(17,20,24,.08)',
    text: GNU.anthracite,
    textDim: 'rgba(17,20,24,.62)',
    textFaint: 'rgba(17,20,24,.36)',
    accent: GNU.signal,
    accentDim: 'rgba(255,106,0,.1)',
    green: GNU.beret,
    kbdBg: 'rgba(17,20,24,.04)',
    kbdBorder: 'rgba(17,20,24,.08)',
    sectionLb: heavy ? '#FF6A00' : 'rgba(17,20,24,.45)',
    shadow: '0 24px 64px -8px rgba(17,20,24,.18),0 8px 24px -4px rgba(17,20,24,.1),0 0 0 .5px rgba(17,20,24,.06)',
    mode: 'light'
  };
}

// Shape presets: rounded-soft / sharp / pill / cut.
function gnuShape(preset) {
  switch (preset) {
    case 'sharp':return { menuRadius: 0, rowRadius: 0, pad: 6 };
    case 'pill':return { menuRadius: 14, rowRadius: 999, pad: 6 };
    case 'cut':return { menuRadius: 12, rowRadius: 4, cutCorner: true, pad: 6 };
    default:return { menuRadius: 12, rowRadius: 7, pad: 6 };
  }
}

// Density tokens.
function gnuDensity(d) {
  if (d === 'touch') return { rowH: 44, rowPx: 14, fs: 14, iconSize: 18, gap: 12, kbdFs: 11, secPx: 14, secPy: 10 };
  if (d === 'mouse') return { rowH: 26, rowPx: 10, fs: 12, iconSize: 14, gap: 8, kbdFs: 10, secPx: 10, secPy: 6 };
  /* comfy */return { rowH: 32, rowPx: 12, fs: 13, iconSize: 16, gap: 10, kbdFs: 10, secPx: 12, secPy: 8 };
}

// ─── Shader-y backgrounds ──────────────────────────────────────────────

// Dither / halftone svg pattern. Animated via CSS transform.
function DitherBg({ color = '#FF6A00', opacity = 0.08, animate = true }) {
  const id = React.useId();
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity }}>
      <defs>
        <pattern id={`d-${id}`} x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r=".7" fill={color} />
          <circle cx="4" cy="4" r=".5" fill={color} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#d-${id})`}>
        {animate && <animateTransform attributeName="transform" type="translate" from="0 0" to="6 6" dur="6s" repeatCount="indefinite" />}
      </rect>
    </svg>);

}

// Grain noise (small svg fractal noise).
function GrainBg({ opacity = 0.05 }) {
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity, mixBlendMode: 'overlay' }}>
      <filter id="grain-noise">
        <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="3" />
        <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .8 0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain-noise)" />
    </svg>);

}

// Refraction edge — soft warped colored ring at the menu edge to suggest the bg
// is being warped underneath.
function EdgeRefraction({ color, radius = 12 }) {
  return (
    <div aria-hidden style={{
      position: 'absolute', inset: -1, borderRadius: radius + 1, pointerEvents: 'none',
      background: `radial-gradient(120% 60% at 0% 0%, ${color}11, transparent 50%),
                   radial-gradient(120% 60% at 100% 100%, ${color}08, transparent 50%)`,
      mixBlendMode: 'screen'
    }} />);

}

// ─── Mask reveal: clip-path circle from cursor origin ──────────────────
// origin is { x, y } in pixels relative to menu top-left.
function MaskReveal({ origin = { x: 0, y: 0 }, duration = 280, children, style, radius = 12 }) {
  const [phase, setPhase] = React.useState(0); // 0 closed → 1 open
  React.useEffect(() => {
    let raf, t0;
    const tick = (t) => {
      if (!t0) t0 = t;
      const p = Math.min(1, (t - t0) / duration);
      // ease-out cubic
      setPhase(1 - Math.pow(1 - p, 3));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [duration]);
  // use clip-path circle scaling to ~150% of diagonal
  const r = `${phase * 160}%`;
  return (
    <div style={{
      ...style,
      borderRadius: radius,
      clipPath: `circle(${r} at ${origin.x}px ${origin.y}px)`,
      WebkitClipPath: `circle(${r} at ${origin.x}px ${origin.y}px)`,
      transform: `scale(${0.97 + phase * 0.03})`,
      transformOrigin: `${origin.x}px ${origin.y}px`,
      opacity: 0.4 + phase * 0.6
    }}>{children}</div>);

}

// ─── Particle accents — small SVG burst on click ───────────────────────
function ParticleBurst({ x, y, color = GNU.signal, onDone }) {
  React.useEffect(() => {const t = setTimeout(onDone, 550);return () => clearTimeout(t);}, [onDone]);
  const parts = Array.from({ length: 7 }, (_, i) => {
    const a = i / 7 * Math.PI * 2 + Math.random() * 0.4;
    const d = 14 + Math.random() * 10;
    return { dx: Math.cos(a) * d, dy: Math.sin(a) * d, r: 1 + Math.random() * 1.6, k: i };
  });
  return (
    <svg style={{ position: 'absolute', left: x - 30, top: y - 30, width: 60, height: 60, pointerEvents: 'none', overflow: 'visible' }}>
      {parts.map((p) =>
      <circle key={p.k} cx="30" cy="30" r={p.r} fill={color}>
          <animate attributeName="cx" from="30" to={30 + p.dx} dur=".5s" fill="freeze" />
          <animate attributeName="cy" from="30" to={30 + p.dy} dur=".5s" fill="freeze" />
          <animate attributeName="opacity" from="1" to="0" dur=".5s" fill="freeze" />
        </circle>
      )}
    </svg>);

}

// ─── MenuShell: the unified outer wrapper ──────────────────────────────
function MenuShell({ theme, shape, density, width = 240, origin, withDither = false, withGrain = true, withRefraction = true, children, label, style }) {
  const radius = shape.menuRadius;
  return (
    <div style={{ position: 'relative', width, ...style }}>
      <MaskReveal origin={origin || { x: width / 2, y: 0 }} radius={radius}>
        <div style={{
          background: theme.surface,
          borderRadius: radius,
          padding: shape.pad,
          boxShadow: theme.shadow,
          border: `.5px solid ${theme.border}`,
          color: theme.text,
          fontFamily: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
          fontSize: density.fs,
          position: 'relative',
          overflow: 'hidden',
          clipPath: shape.cutCorner ? 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%)' : 'none'
        }}>
          {withDither && <DitherBg color={theme.accent} opacity={theme.mode === 'dark' ? 0.06 : 0.05} />}
          {withGrain && <GrainBg opacity={theme.mode === 'dark' ? 0.07 : 0.04} />}
          {withRefraction && <EdgeRefraction color={theme.accent} radius={radius} />}
          <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
          {label &&
          <div style={{
            position: 'absolute', top: 6, right: 8, fontSize: 9, letterSpacing: '0.12em',
            fontWeight: 600, color: theme.accent, textTransform: 'uppercase', zIndex: 2,
            fontVariantNumeric: 'tabular-nums', opacity: 0.7
          }}>{label}</div>
          }
        </div>
      </MaskReveal>
    </div>);

}

function MenuSection({ label, theme, density, children }) {
  return (
    <div>
      {label &&
      <div style={{
        padding: `${density.secPy}px ${density.secPx}px 4px`,
        fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase',
        color: theme.sectionLb, fontWeight: 600
      }}>{label}</div>
      }
      {children}
    </div>);

}

function MenuSeparator({ theme }) {
  return <div style={{ height: 1, background: theme.border, margin: '4px 6px' }} />;
}

function KbdHint({ keys, theme, density }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2, marginLeft: 'auto' }}>
      {keys.map((k, i) =>
      <span key={i} style={{
        fontSize: density.kbdFs, fontFamily: 'ui-monospace, "JetBrains Mono", monospace',
        padding: '1px 5px', borderRadius: 3,
        background: theme.kbdBg, border: `.5px solid ${theme.kbdBorder}`,
        color: theme.textDim, fontWeight: 500, lineHeight: 1.3
      }}>{k}</span>
      )}
    </span>);

}

function MenuRow({ icon, label, kbd, sub, danger, accent, hovered, onHover, onClick, theme, shape, density, hasSubmenu, swatch, toggle, toggleOn, disabled, mascot }) {
  const isHover = hovered;
  return (
    <div
      onMouseEnter={onHover}
      onClick={disabled ? undefined : onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: density.gap,
        padding: `0 ${density.rowPx}px`, height: density.rowH, minHeight: density.rowH,
        borderRadius: shape.rowRadius, cursor: disabled ? 'default' : 'pointer',
        background: isHover ? danger ? 'rgba(255,80,60,.12)' : accent ? theme.accent : theme.hover : 'transparent',
        color: disabled ? theme.textFaint : isHover && accent ? '#fff' : danger ? '#FF6044' : theme.text,
        position: 'relative', transition: 'background .08s linear, color .08s linear',
        userSelect: 'none'
      }}>
      
      {/* hover fill bar (left orange tick) */}
      {isHover && !accent && !danger &&
      <div style={{
        position: 'absolute', left: 0, top: '20%', bottom: '20%', width: 2,
        background: theme.accent, borderRadius: 2
      }} />
      }
      {mascot && <SysterGlyph size={density.iconSize + 4} hover={isHover} />}
      {icon && !mascot &&
      <span style={{
        width: density.iconSize, height: density.iconSize, flexShrink: 0,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        color: 'currentColor', opacity: disabled ? 0.5 : isHover ? 1 : 0.78
      }}>{icon}</span>
      }
      {swatch &&
      <span style={{
        width: density.iconSize - 2, height: density.iconSize - 2, borderRadius: 4,
        background: swatch, border: '.5px solid rgba(0,0,0,.2)', flexShrink: 0
      }} />
      }
      <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: '0 1 auto' }}>
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 450 }}>{label}</span>
        {sub &&
        <span style={{ fontSize: density.fs - 2, color: isHover && accent ? 'rgba(255,255,255,.75)' : theme.textDim, lineHeight: 1.2 }}>{sub}</span>
        }
      </span>
      <span style={{ flex: 1 }} />
      {toggle != null &&
      <span style={{
        width: 26, height: 14, borderRadius: 999, position: 'relative',
        background: toggleOn ? theme.accent : theme.kbdBg, transition: 'background .12s',
        flexShrink: 0
      }}>
          <span style={{
          position: 'absolute', top: 2, left: toggleOn ? 14 : 2, width: 10, height: 10,
          borderRadius: 999, background: '#fff', transition: 'left .15s cubic-bezier(.3,.7,.4,1)'
        }} />
        </span>
      }
      {kbd && <KbdHint keys={kbd} theme={theme} density={density} />}
      {hasSubmenu &&
      <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="currentColor" strokeWidth="1.4" style={{ opacity: 0.55, marginLeft: 4, flexShrink: 0 }}>
          <path d="M2 1.5L6 4.5L2 7.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      }
    </div>);

}

// Tiny Sys.ter mascot — front-facing terminal: orange body + anthracite screen + signal antenna.
// No beret, no side-plane, no vents (mirrors Syster Mini). Antenna = vertical stem on the
// top-right shoulder + signal bulb. Canonical miniature, designed legible 11 → 180 px.
// `beret` prop is accepted but ignored (kept for backward-compatible callers).
function SysterGlyph({ size = 16, hover, beret, body = GNU.signal, screen = GNU.anthracite }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0, transition: 'transform .2s', overflow: 'visible' }}>
      {/* antenna — grey stem on the top-right shoulder + signal bulb (mirrors Syster Mini) */}
      <line x1="16.8" y1="6.2" x2="16.8" y2="2.4" stroke="#9AA0A8" strokeWidth="0.9" strokeLinecap="round" />
      {hover &&
        <circle cx="16.8" cy="1.9" r="2" fill={body} opacity="0.22">
          <animate attributeName="opacity" values="0.06;0.28;0.06" dur="1.2s" repeatCount="indefinite" />
        </circle>}
      <circle cx="16.8" cy="1.9" r="1.15" fill={hover ? body : '#C9CDD3'}>
        {hover && <animate attributeName="r" values="1.15;1.5;1.15" dur="1.2s" repeatCount="indefinite" />}
      </circle>
      {/* body — front face */}
      <rect x="4" y="6" width="16" height="16" rx="3" fill={body} />
      {/* screen */}
      <rect x="6" y="8" width="12" height="12" rx="1.8" fill={screen} />
      {/* prompt — chevron + cursor */}
      <path d="M9 12L11.5 14L9 16" stroke={GNU.shellWhite} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <line x1="12.4" y1="16.4" x2="15" y2="16.4" stroke={GNU.shellWhite} strokeWidth="1.4" strokeLinecap="round" />
      {/* signal waves on hover — radiate from the bulb */}
      {hover &&
      <g stroke={body} strokeWidth="0.9" fill="none" strokeLinecap="round" opacity="0.85">
          <path d="M18.6 0.9 q1.3 1.4 0 2.8">
            <animate attributeName="opacity" values="0;1;0" dur="1.4s" repeatCount="indefinite" keyTimes="0;0.4;1" />
          </path>
          <path d="M20 0 q2.1 2.1 0 4.6" opacity="0.5">
            <animate attributeName="opacity" values="0;0.5;0" dur="1.4s" begin="0.25s" repeatCount="indefinite" keyTimes="0;0.4;1" />
          </path>
        </g>
      }
    </svg>);

}

// Common stroke icons (Lucide-ish, 1.6px)
const I = {
  wallpaper: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%"><rect x="3" y="4" width="18" height="14" rx="2" /><path d="m3 14 5-5 5 5" /><path d="m13 12 3-3 5 5" /><circle cx="8" cy="9" r="1" /></svg>,
  layout: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 12h18M12 3v18" /></svg>,
  add: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%"><circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" /></svg>,
  widget: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%"><rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="8" rx="1.5" /><rect x="3" y="13" width="8" height="8" rx="1.5" /><rect x="13" y="13" width="8" height="8" rx="1.5" /></svg>,
  refresh: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%"><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" /><path d="M3 21v-5h5" /></svg>,
  terminal: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="m7 9 3 3-3 3M13 15h4" /></svg>,
  settings: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></svg>,
  pin: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%"><path d="m12 17 .3 4M5 9l4-1 5-5 5 5-5 5-1 4-8-8z" /></svg>,
  trash: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></svg>,
  copy: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%"><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></svg>,
  move: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%"><path d="M5 9 2 12l3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20" /></svg>,
  resize: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%"><path d="M21 8V3h-5M3 16v5h5M21 3l-7 7M10 14l-7 7" /></svg>,
  tile: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%"><rect x="3" y="3" width="8" height="18" rx="1" /><rect x="13" y="3" width="8" height="8" rx="1" /><rect x="13" y="13" width="8" height="8" rx="1" /></svg>,
  float: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%"><rect x="6" y="6" width="14" height="12" rx="1.5" /><rect x="3" y="3" width="10" height="8" rx="1.5" opacity=".5" /></svg>,
  fullscreen: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%"><path d="M3 8V3h5M21 8V3h-5M3 16v5h5M21 16v5h-5" /></svg>,
  workspace: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%"><rect x="3" y="4" width="6" height="6" rx="1" /><rect x="11" y="4" width="6" height="6" rx="1" /><rect x="3" y="14" width="6" height="6" rx="1" /><rect x="11" y="14" width="6" height="6" rx="1" /></svg>,
  close: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%"><path d="M5 5l14 14M19 5L5 19" /></svg>,
  info: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%"><circle cx="12" cy="12" r="9" /><path d="M12 8h.01M11 12h1v5h1" /></svg>,
  paint: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%"><path d="M19 11h2v3a4 4 0 0 1-4 4h-1v2a2 2 0 0 1-4 0v-4h6V11zM3 5a2 2 0 0 1 2-2h12v8H5a2 2 0 0 1-2-2V5z" /></svg>,
  motion: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%"><path d="M3 12c4-8 14-8 18 0M3 12c4 8 14 8 18 0" /></svg>,
  shape: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%"><path d="m12 2 9 5v10l-9 5-9-5V7l9-5z" /></svg>,
  shader: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a13 13 0 0 1 0 18M12 3a13 13 0 0 0 0 18" /></svg>,
  audio: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%"><path d="M11 4 6 9H3v6h3l5 5V4zM15 9a3 3 0 0 1 0 6M18 6a8 8 0 0 1 0 12" /></svg>,
  network: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%"><path d="M5 12.5a10 10 0 0 1 14 0M8 16a6 6 0 0 1 8 0M11 19h2" /></svg>,
  bluetooth: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%"><path d="M7 7l10 10-5 5V2l5 5L7 17" /></svg>,
  power: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%"><path d="M12 2v10M5 7a9 9 0 1 0 14 0" /></svg>,
  bell: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9zM10 21a2 2 0 0 0 4 0" /></svg>,
  search: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" width="100%" height="100%"><circle cx="11" cy="11" r="7" /><path d="m20 20-4.3-4.3" /></svg>
};

// Search row at the top of menus.
function MenuSearch({ theme, density, value, onChange, placeholder = 'Search…' }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8, padding: `4px ${density.rowPx}px`,
      borderBottom: `.5px solid ${theme.border}`, marginBottom: 4
    }}>
      <span style={{ width: density.iconSize, height: density.iconSize, color: theme.textDim }}>{I.search}</span>
      <input
        value={value || ''} onChange={(e) => onChange?.(e.target.value)} placeholder={placeholder}
        style={{
          flex: 1, border: 'none', background: 'transparent', outline: 'none',
          color: theme.text, fontSize: density.fs, fontFamily: 'inherit', height: density.rowH - 4
        }} />
      
      <span style={{
        fontSize: density.kbdFs, fontFamily: 'ui-monospace, monospace',
        padding: '1px 5px', borderRadius: 3,
        background: theme.kbdBg, border: `.5px solid ${theme.kbdBorder}`, color: theme.textFaint
      }}>⌘K</span>
    </div>);

}

Object.assign(window, {
  GNU, gnuTheme, gnuShape, gnuDensity,
  MenuShell, MenuSection, MenuSeparator, MenuRow, KbdHint, MenuSearch,
  DitherBg, GrainBg, EdgeRefraction, MaskReveal, ParticleBurst,
  SysterGlyph, MenuIcons: I,
  FitScale
});

// FitScale — render `children` at logical (w × h) then transform-scale to fit
// the parent container (which is typically the artboard, sized via DCArtboard).
// Letterboxes via the `background` prop. Lets us bump all artboards to 1280×720
// without rewriting every menu's pixel-positioning.
function FitScale({ w, h, children, background = 'transparent', anchor = 'center' }) {
  const ref = React.useRef(null);
  const [s, setS] = React.useState(1);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      // Use offset dims (layout size) so we don't compound an ancestor's CSS
      // transform — e.g. DCFocusOverlay scales the card, and getBoundingClientRect
      // would return the post-transform size, making FitScale re-apply the scale.
      const ow = el.offsetWidth,oh = el.offsetHeight;
      if (ow === 0 || oh === 0) return;
      setS(Math.min(ow / w, oh / h));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [w, h]);
  return (
    <div ref={ref} style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      background, display: 'flex',
      alignItems: anchor === 'top' ? 'flex-start' : 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        width: w, height: h,
        transform: `scale(${s})`,
        transformOrigin: anchor === 'top' ? 'top center' : 'center center',
        flexShrink: 0
      }}>{children}</div>
    </div>);

}