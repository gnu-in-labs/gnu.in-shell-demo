// menu-scenes.jsx
// Desktop backdrops the menus appear over, plus the menu compositions.

// ── Desktop backdrop ───────────────────────────────────────────────
function DesktopBg({ theme, dim = 0.55, children, style }) {
  // Animated subtle gradient + tiling, evokes Wayland compositor wallpaper.
  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      background: theme.mode === 'dark'
        ? 'radial-gradient(120% 80% at 30% 30%, #1A1F26 0%, #0B0D10 60%, #07090B 100%)'
        : 'radial-gradient(120% 80% at 30% 30%, #FBF7EE 0%, #EFEAE0 60%, #E5DFD2 100%)',
      ...style,
    }}>
      {/* slow-moving conic gradient as compositor "shader" */}
      <div style={{
        position: 'absolute', inset: '-20%',
        background: theme.mode === 'dark'
          ? `conic-gradient(from 0deg at 50% 50%, ${theme.accent}10, transparent 30%, ${GNU.beret}14 60%, transparent 80%, ${theme.accent}08)`
          : `conic-gradient(from 0deg at 50% 50%, ${theme.accent}18, transparent 30%, ${GNU.beret}22 60%, transparent 80%, ${theme.accent}10)`,
        filter: 'blur(40px)', opacity: dim,
      }} />
      {/* topbar sliver */}
      <div style={{
        position: 'absolute', top: 8, left: 8, right: 8, height: 22,
        borderRadius: 11, background: theme.mode === 'dark' ? 'rgba(17,20,24,.7)' : 'rgba(247,243,237,.85)',
        backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center',
        padding: '0 10px', gap: 8, fontSize: 10, color: theme.textDim,
        border: `.5px solid ${theme.border}`, fontFamily: 'ui-sans-serif, system-ui, sans-serif',
      }}>
        <SysterGlyph size={12} />
        <span style={{ fontWeight: 600, color: theme.text, letterSpacing: '-0.01em' }}>Gnu.In</span>
        <span style={{ opacity: 0.5 }}>·</span>
        <span>workspace 2/6</span>
        <span style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ width: 5, height: 5, borderRadius: 5, background: theme.green }} />
          <span>14:32</span>
        </span>
      </div>
      {children}
    </div>
  );
}

// A floating widget on the desktop (clock, system stats, etc.)
function DesktopWidget({ theme, x, y, w, h, kind, focused, label }) {
  return (
    <div style={{
      position: 'absolute', left: x, top: y, width: w, height: h,
      borderRadius: 10, background: theme.mode === 'dark' ? 'rgba(20,24,29,.85)' : 'rgba(255,255,255,.85)',
      backdropFilter: 'blur(20px)', border: focused ? `1.5px solid ${theme.accent}` : `.5px solid ${theme.border}`,
      boxShadow: focused ? `0 0 0 4px ${theme.accent}33, 0 8px 24px rgba(0,0,0,.18)` : '0 4px 16px rgba(0,0,0,.1)',
      padding: 10, color: theme.text, fontFamily: 'ui-sans-serif, system-ui, sans-serif',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {kind === 'clock' && (
        <>
          <div style={{ fontSize: 9, color: theme.textDim, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>Mardi 28 avril</div>
          <div style={{ fontSize: 32, fontWeight: 600, lineHeight: 1, marginTop: 4, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>14:32</div>
          <div style={{ fontSize: 9, color: theme.accent, marginTop: 'auto', fontWeight: 600 }}>{label || 'CLOCK'}</div>
        </>
      )}
      {kind === 'stats' && (
        <>
          <div style={{ fontSize: 9, color: theme.textDim, letterSpacing: '0.1em', fontWeight: 600 }}>SYSTEM</div>
          <div style={{ display: 'flex', gap: 4, marginTop: 6, height: 20, alignItems: 'flex-end' }}>
            {[0.4, 0.7, 0.3, 0.9, 0.5, 0.6, 0.8, 0.2].map((v, i) => (
              <div key={i} style={{ flex: 1, height: `${v * 100}%`, background: theme.accent, opacity: 0.4 + v * 0.6, borderRadius: 1 }} />
            ))}
          </div>
          <div style={{ fontSize: 10, marginTop: 6, fontWeight: 500 }}>CPU 34%</div>
          <div style={{ fontSize: 9, color: theme.textDim }}>RAM 8.2/16 GB</div>
        </>
      )}
      {kind === 'note' && (
        <>
          <div style={{ fontSize: 9, color: theme.green, letterSpacing: '0.1em', fontWeight: 600 }}>NOTE.MD</div>
          <div style={{ fontSize: 10, lineHeight: 1.4, marginTop: 4, color: theme.textDim }}>
            — review menu shapes<br/>— ask about touch densities<br/>— ship by friday
          </div>
        </>
      )}
    </div>
  );
}

// A floating window (for the window/client menu).
function DesktopWindow({ theme, x, y, w, h, title, focused }) {
  return (
    <div style={{
      position: 'absolute', left: x, top: y, width: w, height: h,
      borderRadius: 8, background: theme.mode === 'dark' ? '#1B1F24' : '#FFFFFF',
      border: focused ? `1.5px solid ${theme.accent}` : `.5px solid ${theme.border}`,
      boxShadow: focused ? `0 0 0 4px ${theme.accent}26, 0 12px 32px rgba(0,0,0,.25)` : '0 6px 20px rgba(0,0,0,.15)',
      overflow: 'hidden', fontFamily: 'ui-sans-serif, system-ui, sans-serif',
    }}>
      <div style={{
        height: 22, background: theme.mode === 'dark' ? '#15181C' : '#F2EEE6',
        borderBottom: `.5px solid ${theme.border}`, display: 'flex', alignItems: 'center',
        padding: '0 8px', gap: 6, fontSize: 9, color: theme.textDim,
      }}>
        <span style={{ width: 8, height: 8, borderRadius: 4, background: '#FF5F57' }} />
        <span style={{ width: 8, height: 8, borderRadius: 4, background: '#FFBD2E' }} />
        <span style={{ width: 8, height: 8, borderRadius: 4, background: '#28C940' }} />
        <span style={{ marginLeft: 8, fontWeight: 500, color: theme.text }}>{title}</span>
      </div>
      <div style={{ padding: 8, fontSize: 9, color: theme.textDim, lineHeight: 1.5 }}>
        <div style={{ width: '60%', height: 6, background: theme.border, borderRadius: 3, marginBottom: 5 }} />
        <div style={{ width: '90%', height: 6, background: theme.border, borderRadius: 3, marginBottom: 5 }} />
        <div style={{ width: '40%', height: 6, background: theme.border, borderRadius: 3, marginBottom: 5 }} />
        <div style={{ width: '75%', height: 6, background: theme.border, borderRadius: 3 }} />
      </div>
    </div>
  );
}

// Cursor glyph.
function Cursor({ x, y, theme }) {
  return (
    <svg style={{ position: 'absolute', left: x - 2, top: y - 2, pointerEvents: 'none', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,.4))', zIndex: 9 }} width="18" height="22" viewBox="0 0 18 22">
      <path d="M2 1 L2 17 L6.5 13 L9 18 L12 16.5 L9.5 11.5 L15 11 Z" fill={theme.mode === 'dark' ? '#fff' : '#000'} stroke={theme.mode === 'dark' ? '#000' : '#fff'} strokeWidth="1" strokeLinejoin="round"/>
    </svg>
  );
}

// Topbar tray icon row (for system tray menu artboard).
function TrayBar({ theme, focusKey }) {
  const items = [
    { k: 'audio', icon: MenuIcons.audio },
    { k: 'network', icon: MenuIcons.network },
    { k: 'bluetooth', icon: MenuIcons.bluetooth },
    { k: 'bell', icon: MenuIcons.bell },
    { k: 'power', icon: MenuIcons.power },
  ];
  return (
    <div style={{
      position: 'absolute', top: 8, right: 8, height: 22, padding: '0 6px',
      borderRadius: 11, background: theme.mode === 'dark' ? 'rgba(17,20,24,.7)' : 'rgba(247,243,237,.85)',
      backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', gap: 4,
      border: `.5px solid ${theme.border}`,
    }}>
      {items.map((it) => (
        <span key={it.k} style={{
          width: 14, height: 14, color: it.k === focusKey ? theme.accent : theme.textDim,
          display: 'inline-flex',
          background: it.k === focusKey ? theme.accentDim : 'transparent',
          borderRadius: 4, padding: 1,
        }}>{it.icon}</span>
      ))}
    </div>
  );
}

Object.assign(window, { DesktopBg, DesktopWidget, DesktopWindow, Cursor, TrayBar });
