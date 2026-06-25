// menu-archetypes.jsx
// Five right-click context menus × three declinaisons (variants) each.
// All consume tokens from menu-primitives.jsx.

// ── Helpers ────────────────────────────────────────────────────────
// useHover cycles through an array of keys on a timer, so each menu
// "demos" itself instead of sitting frozen on a single hover state.
// Setting the value manually (mouse-enter) pauses the cycle for 2.4s
// before it resumes, so users can still inspect a specific item.
function useHover(initial = null, cycle = null, interval = 1600) {
  const keys = Array.isArray(initial) ? initial : (cycle || (initial ? [initial] : null));
  const [h, setH] = React.useState(Array.isArray(initial) ? initial[0] : initial);
  const pausedUntil = React.useRef(0);
  React.useEffect(() => {
    if (!keys || keys.length < 2) return;
    let i = keys.indexOf(h);
    if (i < 0) i = 0;
    const t = setInterval(() => {
      if (Date.now() < pausedUntil.current) return;
      i = (i + 1) % keys.length;
      setH(keys[i]);
    }, interval);
    return () => clearInterval(t);
  }, [keys && keys.join('|'), interval]);
  const setH2 = React.useCallback((v) => {
    pausedUntil.current = Date.now() + 2400;
    setH(v);
  }, []);
  return [h, setH2];
}

// useAutoCursor — moves a synthetic cursor to track the currently-hovered
// row in the menu DOM. The Scene renders the cursor; menus tag their rows
// with data-row="key" so the cursor can find them via querySelector.
function useAutoCursor(sceneRef, hoverKey, fallback = { x: 70, y: 80 }) {
  const [pos, setPos] = React.useState(fallback);
  React.useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !hoverKey) return;
    const target = scene.querySelector(`[data-row="${hoverKey}"]`);
    if (!target) return;
    const sRect = scene.getBoundingClientRect();
    const tRect = target.getBoundingClientRect();
    setPos({
      x: tRect.left - sRect.left + Math.min(28, tRect.width * 0.35),
      y: tRect.top - sRect.top + tRect.height / 2,
    });
  }, [hoverKey]);
  return pos;
}

// Each Artboard wraps a menu in a desktop scene at a fixed cursor location.
// Renders at logical (w × h) then auto-fits the artboard via FitScale so all
// the absolute-positioned menu pieces still land where they were authored.
function Scene({ theme, w = 380, h = 380, cursor, children, density = 'mouse' }) {
  return (
    <FitScale w={w} h={h} background={theme && theme.mode === 'dark' ? '#07090B' : '#E5DFD2'}>
      <div style={{ position: 'relative', width: w, height: h, overflow: 'hidden' }}>
        {children}
        {cursor && <Cursor x={cursor.x} y={cursor.y} theme={theme} />}
      </div>
    </FitScale>
  );
}

/* ════════════════════════════════════════════════════════════════════
   1 · EMPTY-SPACE MENU — right-click on unclaimed desktop
   Variants: Standard / Branded heavy / Touch radial
   ════════════════════════════════════════════════════════════════════ */

function EmptySpaceStandard({ theme, dpref }) {
  const shape = gnuShape('rounded'); const d = gnuDensity(dpref);
  const [hover, setHover] = useHover(['add-widget', 'layout', 'wallpaper', 'new-ws', 'tile', 'term', 'settings']);
  return (
    <Scene theme={theme} w={400} h={420}>
      <DesktopBg theme={theme} />
      <div style={{ position: 'absolute', left: 110, top: 70 }}>
        <MenuShell theme={theme} shape={shape} density={d} width={dpref === 'touch' ? 260 : 224} origin={{ x: 14, y: 14 }} label="01">
          <MenuSection theme={theme} density={d}>
            <MenuRow theme={theme} shape={shape} density={d} icon={MenuIcons.add} label="Add widget…" kbd={['⌘', '⇧', 'W']}
              hovered={hover === 'add-widget'} onHover={() => setHover('add-widget')} hasSubmenu />
            <MenuRow theme={theme} shape={shape} density={d} icon={MenuIcons.layout} label="Layout preset" hasSubmenu
              hovered={hover === 'layout'} onHover={() => setHover('layout')} />
            <MenuRow theme={theme} shape={shape} density={d} icon={MenuIcons.wallpaper} label="Change wallpaper" kbd={['⌘', 'B']}
              hovered={hover === 'wallpaper'} onHover={() => setHover('wallpaper')} />
          </MenuSection>
          <MenuSeparator theme={theme} />
          <MenuSection label="Workspace" theme={theme} density={d}>
            <MenuRow theme={theme} shape={shape} density={d} icon={MenuIcons.workspace} label="New workspace" kbd={['⌘', 'N']}
              hovered={hover === 'new-ws'} onHover={() => setHover('new-ws')} />
            <MenuRow theme={theme} shape={shape} density={d} icon={MenuIcons.tile} label="Tile mode" toggle toggleOn
              hovered={hover === 'tile'} onHover={() => setHover('tile')} />
          </MenuSection>
          <MenuSeparator theme={theme} />
          <MenuRow theme={theme} shape={shape} density={d} icon={MenuIcons.terminal} label="Open terminal here" kbd={['⌘', 'T']}
            hovered={hover === 'term'} onHover={() => setHover('term')} />
          <MenuRow theme={theme} shape={shape} density={d} icon={MenuIcons.settings} label="Shell settings" kbd={['⌘', ',']}
            hovered={hover === 'settings'} onHover={() => setHover('settings')} />
        </MenuShell>
      </div>
      <Cursor x={120} y={80} theme={theme} />
    </Scene>
  );
}

function EmptySpaceBranded({ theme, dpref }) {
  const shape = gnuShape('rounded'); const d = gnuDensity(dpref);
  const [hover, setHover] = useHover(['syster', 'add', 'preset', 'wp', 'term', 'reload']);
  // Heavy branding: orange header strip with Sys.ter mascot, beret-green accents, dither overlay
  return (
    <Scene theme={theme} w={400} h={420}>
      <DesktopBg theme={theme} />
      <div style={{ position: 'absolute', left: 100, top: 60 }}>
        <div style={{ position: 'relative', width: dpref === 'touch' ? 280 : 240 }}>
          <MaskReveal origin={{ x: 16, y: 16 }} radius={shape.menuRadius}>
            <div style={{
              background: theme.surface, borderRadius: shape.menuRadius, padding: 0,
              boxShadow: theme.shadow, border: `.5px solid ${theme.border}`,
              overflow: 'hidden', position: 'relative',
            }}>
              {/* Branded strip header */}
              <div style={{
                background: GNU.signal, color: GNU.shellWhite, padding: '8px 12px',
                display: 'flex', alignItems: 'center', gap: 8, position: 'relative', overflow: 'hidden',
              }}>
                <SysterGlyph size={20} hover />
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '-0.01em' }}>Gnu.In-Shell</span>
                  <span style={{ fontSize: 9, opacity: 0.75, letterSpacing: '0.08em' }}>DESKTOP · SLOT 0</span>
                </div>
                <span style={{ flex: 1 }} />
                <span style={{
                  fontSize: 9, padding: '2px 6px', borderRadius: 999, background: 'rgba(0,0,0,.2)',
                  fontFamily: 'ui-monospace, monospace', fontWeight: 600,
                }}>v6.2</span>
                <DitherBg color="#fff" opacity={0.18} />
              </div>
              {/* Body */}
              <div style={{
                padding: shape.pad, position: 'relative', color: theme.text,
                fontSize: d.fs, fontFamily: 'ui-sans-serif, system-ui, sans-serif',
              }}>
                <DitherBg color={theme.accent} opacity={theme.mode === 'dark' ? 0.05 : 0.04} />
                <GrainBg opacity={theme.mode === 'dark' ? 0.07 : 0.04} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <MenuRow theme={theme} shape={shape} density={d} mascot label="Summon assistant" sub="Ask the shell anything" kbd={['⌘', 'K']}
                    hovered={hover === 'syster'} onHover={() => setHover('syster')} accent />
                  <MenuSeparator theme={theme} />
                  <MenuSection label="Compose" theme={theme} density={d}>
                    <MenuRow theme={theme} shape={shape} density={d} icon={MenuIcons.add} label="Add widget" hasSubmenu
                      hovered={hover === 'add'} onHover={() => setHover('add')} />
                    <MenuRow theme={theme} shape={shape} density={d} icon={MenuIcons.layout} label="Preset" sub="Beret · Anthracite · Signal"
                      hovered={hover === 'preset'} onHover={() => setHover('preset')} hasSubmenu />
                    <MenuRow theme={theme} shape={shape} density={d} icon={MenuIcons.wallpaper} label="Wallpaper"
                      hovered={hover === 'wp'} onHover={() => setHover('wp')} hasSubmenu />
                  </MenuSection>
                  <MenuSeparator theme={theme} />
                  <MenuSection label="System" theme={theme} density={d}>
                    <MenuRow theme={theme} shape={shape} density={d} icon={MenuIcons.terminal} label="Terminal here" kbd={['⌘', 'T']}
                      hovered={hover === 'term'} onHover={() => setHover('term')} />
                    <MenuRow theme={theme} shape={shape} density={d} icon={MenuIcons.refresh} label="Reload shell"
                      hovered={hover === 'reload'} onHover={() => setHover('reload')} />
                  </MenuSection>
                </div>
              </div>
            </div>
          </MaskReveal>
        </div>
      </div>
      <Cursor x={110} y={70} theme={theme} />
    </Scene>
  );
}

function EmptySpaceRadial({ theme }) {
  // Radial pie menu — touch-first
  const shape = gnuShape('rounded'); const d = gnuDensity('touch');
  const cx = 200, cy = 220, R = 100, r = 38;
  const items = [
    { k: 'add', icon: MenuIcons.add, label: 'Add' },
    { k: 'layout', icon: MenuIcons.layout, label: 'Layout' },
    { k: 'wallpaper', icon: MenuIcons.wallpaper, label: 'Wall' },
    { k: 'term', icon: MenuIcons.terminal, label: 'Term' },
    { k: 'workspace', icon: MenuIcons.workspace, label: 'Wksp' },
    { k: 'settings', icon: MenuIcons.settings, label: 'Set' },
  ];
  const [hover, setHover] = useHover(items.map(i => i.k));
  const n = items.length;
  return (
    <Scene theme={theme} w={400} h={440}>
      <DesktopBg theme={theme} />
      {/* Refraction lens behind the pie */}
      <div style={{
        position: 'absolute', left: cx - R - 10, top: cy - R - 10, width: (R + 10) * 2, height: (R + 10) * 2, borderRadius: '50%',
        background: theme.mode === 'dark' ? 'rgba(17,20,24,.6)' : 'rgba(255,255,255,.45)',
        backdropFilter: 'blur(20px)', border: `.5px solid ${theme.border}`,
        boxShadow: theme.shadow,
      }} />
      {/* Slices */}
      <svg style={{ position: 'absolute', left: cx - R, top: cy - R, width: R * 2, height: R * 2 }} viewBox={`0 0 ${R * 2} ${R * 2}`}>
        {items.map((it, i) => {
          const a0 = (i / n) * Math.PI * 2 - Math.PI / 2 - Math.PI / n;
          const a1 = a0 + (Math.PI * 2) / n;
          const x0 = R + Math.cos(a0) * R, y0 = R + Math.sin(a0) * R;
          const x1 = R + Math.cos(a1) * R, y1 = R + Math.sin(a1) * R;
          const xi0 = R + Math.cos(a0) * r, yi0 = R + Math.sin(a0) * r;
          const xi1 = R + Math.cos(a1) * r, yi1 = R + Math.sin(a1) * r;
          const path = `M ${xi0} ${yi0} L ${x0} ${y0} A ${R} ${R} 0 0 1 ${x1} ${y1} L ${xi1} ${yi1} A ${r} ${r} 0 0 0 ${xi0} ${yi0} Z`;
          const isHover = hover === it.k;
          return (
            <path key={it.k} d={path}
              onMouseEnter={() => setHover(it.k)}
              fill={isHover ? theme.accent : (theme.mode === 'dark' ? '#1B1F24' : '#FFF')}
              stroke={theme.border} strokeWidth=".5"
              style={{ transition: 'fill .12s', cursor: 'pointer' }}
            />
          );
        })}
      </svg>
      {/* Icons + labels */}
      {items.map((it, i) => {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2;
        const ix = cx + Math.cos(a) * (R - 22) - 10;
        const iy = cy + Math.sin(a) * (R - 22) - 10;
        const isHover = hover === it.k;
        return (
          <React.Fragment key={it.k}>
            <div style={{
              position: 'absolute', left: ix, top: iy, width: 20, height: 20,
              color: isHover ? '#fff' : theme.text, pointerEvents: 'none',
            }}>{it.icon}</div>
            <div style={{
              position: 'absolute', left: cx + Math.cos(a) * (R + 14) - 24, top: cy + Math.sin(a) * (R + 14) - 7,
              width: 48, textAlign: 'center', fontSize: 10, color: theme.textDim,
              fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', pointerEvents: 'none',
            }}>{it.label}</div>
          </React.Fragment>
        );
      })}
      {/* Center disc with mascot */}
      <div style={{
        position: 'absolute', left: cx - r, top: cy - r, width: r * 2, height: r * 2, borderRadius: '50%',
        background: theme.surface, border: `.5px solid ${theme.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,.15)',
      }}>
        <SysterGlyph size={36} hover />
      </div>
      <Cursor x={cx + 60} y={cy - 60} theme={theme} />
    </Scene>
  );
}

/* ════════════════════════════════════════════════════════════════════
   2 · WIDGET MENU — right-click on a widget
   Variants: Inline tools / Card with preview / Pill stack
   ════════════════════════════════════════════════════════════════════ */

function WidgetInline({ theme, dpref }) {
  const shape = gnuShape('rounded'); const d = gnuDensity(dpref);
  const [hover, setHover] = useHover(['configure', 'move', 'resize', 'pin', 'dup', 'rm']);
  return (
    <Scene theme={theme} w={400} h={420}>
      <DesktopBg theme={theme} />
      <DesktopWidget theme={theme} x={40} y={50} w={140} h={90} kind="clock" focused label="CLOCK" />
      <DesktopWidget theme={theme} x={200} y={50} w={140} h={90} kind="stats" />
      {/* drag-handles around focused */}
      <svg style={{ position: 'absolute', left: 36, top: 46, width: 148, height: 98, pointerEvents: 'none' }}>
        {[[4,4],[144,4],[4,94],[144,94]].map(([x,y],i)=>(
          <rect key={i} x={x-3} y={y-3} width="6" height="6" fill={theme.accent} stroke={theme.surface} strokeWidth="1" />
        ))}
      </svg>
      <div style={{ position: 'absolute', left: 60, top: 150 }}>
        <MenuShell theme={theme} shape={shape} density={d} width={dpref === 'touch' ? 240 : 210} origin={{ x: 14, y: 14 }} label="WIDGET">
          <div style={{ padding: '4px 10px 6px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 14, height: 14, color: theme.accent }}>{MenuIcons.widget}</span>
            <span style={{ fontSize: d.fs - 1, fontWeight: 600 }}>Clock</span>
            <span style={{ fontSize: 9, color: theme.textFaint, fontFamily: 'ui-monospace, monospace', marginLeft: 'auto' }}>id 0x4A2</span>
          </div>
          <MenuSeparator theme={theme} />
          <MenuRow theme={theme} shape={shape} density={d} icon={MenuIcons.settings} label="Configure…" kbd={['⏎']}
            hovered={hover === 'configure'} onHover={() => setHover('configure')} />
          <MenuRow theme={theme} shape={shape} density={d} icon={MenuIcons.move} label="Move" kbd={['M']}
            hovered={hover === 'move'} onHover={() => setHover('move')} />
          <MenuRow theme={theme} shape={shape} density={d} icon={MenuIcons.resize} label="Resize" kbd={['R']}
            hovered={hover === 'resize'} onHover={() => setHover('resize')} />
          <MenuRow theme={theme} shape={shape} density={d} icon={MenuIcons.pin} label="Pin to all workspaces" toggle toggleOn={false}
            hovered={hover === 'pin'} onHover={() => setHover('pin')} />
          <MenuSeparator theme={theme} />
          <MenuRow theme={theme} shape={shape} density={d} icon={MenuIcons.copy} label="Duplicate"
            hovered={hover === 'dup'} onHover={() => setHover('dup')} />
          <MenuRow theme={theme} shape={shape} density={d} icon={MenuIcons.trash} label="Remove" kbd={['⌫']} danger
            hovered={hover === 'rm'} onHover={() => setHover('rm')} />
        </MenuShell>
      </div>
      <Cursor x={70} y={160} theme={theme} />
    </Scene>
  );
}

function WidgetCard({ theme, dpref }) {
  const shape = gnuShape('rounded'); const d = gnuDensity(dpref);
  const [hover, setHover] = useHover(['configure', 'shape', 'bg', 'pin', 'rm']);
  return (
    <Scene theme={theme} w={400} h={420}>
      <DesktopBg theme={theme} />
      <DesktopWidget theme={theme} x={40} y={50} w={140} h={90} kind="stats" focused label="STATS" />
      <div style={{ position: 'absolute', left: 60, top: 150, width: 240 }}>
        <MaskReveal origin={{ x: 14, y: 14 }} radius={shape.menuRadius}>
          <div style={{
            background: theme.surface, borderRadius: shape.menuRadius, boxShadow: theme.shadow,
            border: `.5px solid ${theme.border}`, overflow: 'hidden', position: 'relative',
            color: theme.text, fontSize: d.fs, fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          }}>
            <GrainBg opacity={theme.mode === 'dark' ? 0.06 : 0.04} />
            {/* Live preview header */}
            <div style={{
              padding: '10px 12px', borderBottom: `.5px solid ${theme.border}`, position: 'relative', zIndex: 1,
              background: theme.mode === 'dark' ? 'rgba(255,106,0,.05)' : 'rgba(255,106,0,.04)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 6, background: theme.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `.5px solid ${theme.border}`,
                }}>
                  <span style={{ width: 18, height: 18, color: theme.accent }}>{MenuIcons.widget}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '-0.01em' }}>System Stats</span>
                  <span style={{ fontSize: 10, color: theme.textDim }}>140 × 90 · workspace 2</span>
                </div>
              </div>
              {/* size slider preview */}
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 9, color: theme.textFaint, letterSpacing: '0.1em', fontWeight: 600 }}>SIZE</span>
                <div style={{ flex: 1, height: 4, background: theme.kbdBg, borderRadius: 2, position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '40%', background: theme.accent, borderRadius: 2 }} />
                  <div style={{ position: 'absolute', left: '40%', top: -3, width: 10, height: 10, borderRadius: 5, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.2)', transform: 'translateX(-5px)' }} />
                </div>
                <span style={{ fontSize: 10, fontVariantNumeric: 'tabular-nums', color: theme.textDim }}>M</span>
              </div>
            </div>
            <div style={{ padding: shape.pad, position: 'relative', zIndex: 1 }}>
              <MenuRow theme={theme} shape={shape} density={d} icon={MenuIcons.settings} label="Configure" hasSubmenu
                hovered={hover === 'configure'} onHover={() => setHover('configure')} />
              <MenuRow theme={theme} shape={shape} density={d} icon={MenuIcons.shape} label="Shape" sub="Rounded · 8px"
                hovered={hover === 'shape'} onHover={() => setHover('shape')} hasSubmenu />
              <MenuRow theme={theme} shape={shape} density={d} icon={MenuIcons.shader} label="Background" sub="Glass · 18px"
                hovered={hover === 'bg'} onHover={() => setHover('bg')} hasSubmenu />
              <MenuRow theme={theme} shape={shape} density={d} icon={MenuIcons.pin} label="Pin everywhere" toggle toggleOn
                hovered={hover === 'pin'} onHover={() => setHover('pin')} />
              <MenuSeparator theme={theme} />
              <MenuRow theme={theme} shape={shape} density={d} icon={MenuIcons.trash} label="Remove" kbd={['⌫']} danger
                hovered={hover === 'rm'} onHover={() => setHover('rm')} />
            </div>
          </div>
        </MaskReveal>
      </div>
      <Cursor x={70} y={160} theme={theme} />
    </Scene>
  );
}

function WidgetPills({ theme, dpref }) {
  // Pill stack — each row a floating capsule. Touch-friendly.
  const d = gnuDensity('touch');
  const items = [
    { k: 'configure', icon: MenuIcons.settings, label: 'Configure' },
    { k: 'move', icon: MenuIcons.move, label: 'Move' },
    { k: 'resize', icon: MenuIcons.resize, label: 'Resize' },
    { k: 'pin', icon: MenuIcons.pin, label: 'Pin' },
    { k: 'dup', icon: MenuIcons.copy, label: 'Duplicate' },
    { k: 'rm', icon: MenuIcons.trash, label: 'Remove', danger: true },
  ];
  const [hover, setHover] = useHover(items.map(i => i.k));
  return (
    <Scene theme={theme} w={400} h={420}>
      <DesktopBg theme={theme} />
      <DesktopWidget theme={theme} x={40} y={50} w={140} h={90} kind="note" focused label="NOTE" />
      <div style={{ position: 'absolute', left: 60, top: 150, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map((it, i) => {
          const isHover = hover === it.k;
          return (
            <div key={it.k}
              onMouseEnter={() => setHover(it.k)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', height: 36,
                borderRadius: 18, background: isHover ? (it.danger ? '#FF5040' : theme.accent) : theme.surface,
                color: isHover ? '#fff' : (it.danger ? '#FF5040' : theme.text),
                boxShadow: isHover ? '0 4px 12px rgba(0,0,0,.2)' : '0 2px 6px rgba(0,0,0,.08)',
                border: `.5px solid ${theme.border}`, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                transform: `translateX(${isHover ? 6 : 0}px)`, transition: 'all .14s cubic-bezier(.3,.7,.4,1)',
                transitionDelay: `${i * 8}ms`, fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                width: 180,
              }}>
              <span style={{ width: 14, height: 14, opacity: isHover ? 1 : 0.7 }}>{it.icon}</span>
              <span>{it.label}</span>
            </div>
          );
        })}
      </div>
      <Cursor x={70} y={160} theme={theme} />
    </Scene>
  );
}

/* ════════════════════════════════════════════════════════════════════
   3 · WINDOW / CLIENT MENU
   Variants: Standard floating / Tile diagram / Compact
   ════════════════════════════════════════════════════════════════════ */

function WindowStandard({ theme, dpref }) {
  const shape = gnuShape('rounded'); const d = gnuDensity(dpref);
  const [hover, setHover] = useHover(['tile', 'float', 'full', 'send', 'pin', 'info', 'close']);
  return (
    <Scene theme={theme} w={400} h={420}>
      <DesktopBg theme={theme} />
      <DesktopWindow theme={theme} x={30} y={40} w={300} h={140} title="Files — ~/projects" focused />
      {/* highlight on title-bar showing right-click target */}
      <div style={{ position: 'absolute', left: 30, top: 40, width: 300, height: 22, border: `1.5px dashed ${theme.accent}`, borderRadius: '8px 8px 0 0', pointerEvents: 'none', boxSizing: 'border-box' }} />
      <div style={{ position: 'absolute', left: 110, top: 70 }}>
        <MenuShell theme={theme} shape={shape} density={d} width={dpref === 'touch' ? 240 : 220} origin={{ x: 14, y: 14 }} label="TITLE-BAR ▸">
          <MenuRow theme={theme} shape={shape} density={d} icon={MenuIcons.tile} label="Tile" hasSubmenu kbd={['⌘', 'T']}
            hovered={hover === 'tile'} onHover={() => setHover('tile')} />
          <MenuRow theme={theme} shape={shape} density={d} icon={MenuIcons.float} label="Float" toggle toggleOn
            hovered={hover === 'float'} onHover={() => setHover('float')} />
          <MenuRow theme={theme} shape={shape} density={d} icon={MenuIcons.fullscreen} label="Fullscreen" kbd={['F']}
            hovered={hover === 'full'} onHover={() => setHover('full')} />
          <MenuSeparator theme={theme} />
          <MenuSection label="Workspace" theme={theme} density={d}>
            <MenuRow theme={theme} shape={shape} density={d} icon={MenuIcons.workspace} label="Send to…" hasSubmenu
              hovered={hover === 'send'} onHover={() => setHover('send')} />
            <MenuRow theme={theme} shape={shape} density={d} icon={MenuIcons.pin} label="Pin to all" sub="Sticky across workspaces"
              hovered={hover === 'pin'} onHover={() => setHover('pin')} />
          </MenuSection>
          <MenuSeparator theme={theme} />
          <MenuRow theme={theme} shape={shape} density={d} icon={MenuIcons.info} label="Window info" kbd={['⌘', 'I']}
            hovered={hover === 'info'} onHover={() => setHover('info')} />
          <MenuRow theme={theme} shape={shape} density={d} icon={MenuIcons.close} label="Close" kbd={['⌘', 'W']} danger
            hovered={hover === 'close'} onHover={() => setHover('close')} />
        </MenuShell>
      </div>
      <Cursor x={120} y={56} theme={theme} />
      <div style={{ position: 'absolute', left: 30, top: 188, fontSize: 9, color: theme.textFaint, fontFamily: 'ui-monospace, monospace', letterSpacing: '0.05em' }}>↑ right-click on title-bar (browsers / per-app menus stay native otherwise)</div>
    </Scene>
  );
}

function WindowTileDiagram({ theme, dpref }) {
  const shape = gnuShape('rounded'); const d = gnuDensity(dpref);
  const [hover, setHover] = useHover(['tile-l', 'tile-tl', 'tile-tr', 'tile-r', 'tile-br', 'tile-bl', 'float', 'full', 'close']);
  // Visual tile picker
  const tiles = [
    { k: 'tile-l', label: 'Left ½', area: { x: 0, y: 0, w: 50, h: 100 } },
    { k: 'tile-r', label: 'Right ½', area: { x: 50, y: 0, w: 50, h: 100 } },
    { k: 'tile-tl', label: 'Top L', area: { x: 0, y: 0, w: 50, h: 50 } },
    { k: 'tile-tr', label: 'Top R', area: { x: 50, y: 0, w: 50, h: 50 } },
    { k: 'tile-bl', label: 'Bot L', area: { x: 0, y: 50, w: 50, h: 50 } },
    { k: 'tile-br', label: 'Bot R', area: { x: 50, y: 50, w: 50, h: 50 } },
  ];
  return (
    <Scene theme={theme} w={400} h={420}>
      <DesktopBg theme={theme} />
      <DesktopWindow theme={theme} x={30} y={40} w={300} h={140} title="Editor" focused />
      <div style={{ position: 'absolute', left: 30, top: 40, width: 300, height: 22, border: `1.5px dashed ${theme.accent}`, borderRadius: '8px 8px 0 0', pointerEvents: 'none', boxSizing: 'border-box' }} />
      <div style={{ position: 'absolute', left: 70, top: 70, width: 240 }}>
        <MaskReveal origin={{ x: 16, y: 16 }} radius={shape.menuRadius}>
          <div style={{
            background: theme.surface, borderRadius: shape.menuRadius, boxShadow: theme.shadow,
            border: `.5px solid ${theme.border}`, overflow: 'hidden', position: 'relative', padding: shape.pad,
            color: theme.text, fontSize: d.fs, fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          }}>
            <GrainBg opacity={theme.mode === 'dark' ? 0.06 : 0.04} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ padding: `${d.secPy}px ${d.secPx}px 6px`, fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: theme.sectionLb, fontWeight: 600 }}>Tile to</div>
              {/* 2x3 grid of tile previews */}
              <div style={{ padding: `0 ${d.secPx}px 8px`, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                {tiles.map((t) => {
                  const isHover = hover === t.k;
                  return (
                    <div key={t.k}
                      onMouseEnter={() => setHover(t.k)}
                      style={{
                        position: 'relative', height: 40, borderRadius: 5,
                        background: isHover ? theme.accentDim : theme.kbdBg,
                        border: `.5px solid ${isHover ? theme.accent : theme.border}`,
                        cursor: 'pointer', transition: 'all .12s', overflow: 'hidden',
                      }}>
                      <div style={{
                        position: 'absolute', left: `${t.area.x}%`, top: `${t.area.y}%`,
                        width: `${t.area.w}%`, height: `${t.area.h}%`,
                        background: isHover ? theme.accent : theme.textDim, opacity: isHover ? 0.9 : 0.45,
                        borderRadius: 1, transition: 'all .12s',
                      }} />
                      <span style={{
                        position: 'absolute', bottom: 2, left: 4, fontSize: 8,
                        color: isHover ? theme.accent : theme.textFaint, fontWeight: 600, letterSpacing: '0.05em',
                      }}>{t.label}</span>
                    </div>
                  );
                })}
              </div>
              <MenuSeparator theme={theme} />
              <MenuRow theme={theme} shape={shape} density={d} icon={MenuIcons.float} label="Float" toggle toggleOn={false}
                hovered={hover === 'float'} onHover={() => setHover('float')} />
              <MenuRow theme={theme} shape={shape} density={d} icon={MenuIcons.fullscreen} label="Fullscreen" kbd={['F']}
                hovered={hover === 'full'} onHover={() => setHover('full')} />
              <MenuSeparator theme={theme} />
              <MenuRow theme={theme} shape={shape} density={d} icon={MenuIcons.close} label="Close" kbd={['⌘','W']} danger
                hovered={hover === 'close'} onHover={() => setHover('close')} />
            </div>
          </div>
        </MaskReveal>
      </div>
      <Cursor x={80} y={110} theme={theme} />
    </Scene>
  );
}

function WindowCompact({ theme, dpref }) {
  // "App menu" widget — Hyprland-style: lives in the bar, always shows current focused window's controls.
  const d = gnuDensity('mouse');
  const items = [
    { k: 'tile', icon: MenuIcons.tile, label: 'Tile' },
    { k: 'float', icon: MenuIcons.float, label: 'Float' },
    { k: 'full', icon: MenuIcons.fullscreen, label: 'Full' },
    { k: 'pin', icon: MenuIcons.pin, label: 'Pin' },
    { k: 'send', icon: MenuIcons.workspace, label: 'Send' },
    { k: 'close', icon: MenuIcons.close, label: 'Close', danger: true },
  ];
  const [hover, setHover] = useHover(items.map(i => i.k));
  return (
    <Scene theme={theme} w={400} h={420}>
      <DesktopBg theme={theme} />
      <DesktopWindow theme={theme} x={30} y={170} w={300} h={140} title="Terminal" focused />
      {/* App-menu widget docked in topbar */}
      <div style={{ position: 'absolute', left: 38, top: 36, display: 'flex', alignItems: 'center', gap: 6, padding: '3px 8px', height: 22, borderRadius: 11, background: theme.mode === 'dark' ? 'rgba(255,106,0,.18)' : 'rgba(255,106,0,.14)', border: `.5px solid ${theme.accent}`, color: theme.accent, fontSize: 10, fontWeight: 600, fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>
        <span style={{ width: 11, height: 11 }}>{MenuIcons.terminal}</span>
        <span>Terminal</span>
        <span style={{ opacity: 0.55, fontFamily: 'ui-monospace, monospace', fontWeight: 500 }}>· focused</span>
      </div>
      <div style={{ position: 'absolute', left: 38, top: 64 }}>
        <MaskReveal origin={{ x: 30, y: 0 }} radius={10}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 0, padding: 4, borderRadius: 10,
            background: theme.surface, boxShadow: theme.shadow, border: `.5px solid ${theme.border}`,
            position: 'relative',
          }}>
            <GrainBg opacity={0.05} />
            {items.map((it, i) => {
              const isHover = hover === it.k;
              return (
                <React.Fragment key={it.k}>
                  <button onMouseEnter={() => setHover(it.k)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                      padding: '6px 10px', border: 'none', borderRadius: 6, cursor: 'pointer',
                      background: isHover ? (it.danger ? 'rgba(255,80,60,.14)' : theme.accent) : 'transparent',
                      color: isHover ? (it.danger ? '#FF5040' : '#fff') : (it.danger ? '#FF5040' : theme.text),
                      fontSize: 10, fontWeight: 600, letterSpacing: '0.04em',
                      fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                      transition: 'background .1s, color .1s',
                    }}>
                    <span style={{ width: 16, height: 16, opacity: isHover ? 1 : 0.78 }}>{it.icon}</span>
                    <span>{it.label}</span>
                  </button>
                  {i === 2 && <span style={{ width: 1, height: 24, background: theme.border, margin: '0 2px' }} />}
                </React.Fragment>
              );
            })}
          </div>
        </MaskReveal>
        <div style={{
          fontSize: 9, color: theme.textFaint, marginTop: 6,
          fontFamily: 'ui-monospace, monospace', letterSpacing: '0.05em',
        }}>app-menu widget · acts on focused window · 0x7F12</div>
      </div>
      <Cursor x={68} y={42} theme={theme} />
    </Scene>
  );
}

/* ── Experiments: radial + pill hybrids for nested cascades ─────────── */

function NestedRadialPill({ theme, dpref }) {
  // Center radial picker → on hover, a pill stack of sub-options unfurls outward.
  const cx = 200, cy = 220, R = 88, r = 34;
  const items = [
    { k: 'theme', icon: MenuIcons.paint, label: 'Theme', subs: ['Beret', 'Signal', 'Anthracite', 'Shell'] },
    { k: 'shape', icon: MenuIcons.shape, label: 'Shape', subs: ['Round', 'Sharp', 'Pill', 'Cut'] },
    { k: 'motion', icon: MenuIcons.motion, label: 'Motion', subs: ['Settle', 'Lift', 'Reveal', 'Idle'] },
    { k: 'layout', icon: MenuIcons.layout, label: 'Layout', subs: ['Tile', 'Float', 'Stack'] },
    { k: 'shader', icon: MenuIcons.shader, label: 'Shader', subs: ['Dither', 'Grain', 'Refract'] },
  ];
  const [hover, setHover] = useHover(items.map(i => i.k), null, 1900);
  const cur = items.find((i) => i.k === hover) || items[0];
  const n = items.length;
  return (
    <Scene theme={theme} w={520} h={440}>
      <DesktopBg theme={theme} />
      {/* Refraction lens */}
      <div style={{ position: 'absolute', left: cx - R - 16, top: cy - R - 16, width: (R + 16) * 2, height: (R + 16) * 2, borderRadius: '50%', background: theme.mode === 'dark' ? 'rgba(17,20,24,.6)' : 'rgba(255,255,255,.45)', backdropFilter: 'blur(20px)', border: `.5px solid ${theme.border}`, boxShadow: theme.shadow }} />
      {/* Slice ring */}
      <svg style={{ position: 'absolute', left: cx - R, top: cy - R, width: R * 2, height: R * 2 }} viewBox={`0 0 ${R * 2} ${R * 2}`}>
        {items.map((it, i) => {
          const a0 = (i / n) * Math.PI * 2 - Math.PI / 2 - Math.PI / n;
          const a1 = a0 + (Math.PI * 2) / n;
          const x0 = R + Math.cos(a0) * R, y0 = R + Math.sin(a0) * R;
          const x1 = R + Math.cos(a1) * R, y1 = R + Math.sin(a1) * R;
          const xi0 = R + Math.cos(a0) * r, yi0 = R + Math.sin(a0) * r;
          const xi1 = R + Math.cos(a1) * r, yi1 = R + Math.sin(a1) * r;
          const path = `M ${xi0} ${yi0} L ${x0} ${y0} A ${R} ${R} 0 0 1 ${x1} ${y1} L ${xi1} ${yi1} A ${r} ${r} 0 0 0 ${xi0} ${yi0} Z`;
          const isHover = hover === it.k;
          return <path key={it.k} d={path} onMouseEnter={() => setHover(it.k)} fill={isHover ? theme.accent : (theme.mode === 'dark' ? '#1B1F24' : '#fff')} stroke={theme.border} strokeWidth=".5" style={{ transition: 'fill .12s', cursor: 'pointer' }} />;
        })}
      </svg>
      {items.map((it, i) => {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2;
        const ix = cx + Math.cos(a) * (R - 24) - 9;
        const iy = cy + Math.sin(a) * (R - 24) - 9;
        const isHover = hover === it.k;
        return (
          <div key={it.k} style={{ position: 'absolute', left: ix, top: iy, width: 18, height: 18, color: isHover ? '#fff' : theme.text, pointerEvents: 'none' }}>{it.icon}</div>
        );
      })}
      {/* Center disc */}
      <div style={{ position: 'absolute', left: cx - r, top: cy - r, width: r * 2, height: r * 2, borderRadius: '50%', background: theme.surface, border: `.5px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,.15)', flexDirection: 'column' }}>
        <SysterGlyph size={26} hover />
        <div style={{ fontSize: 8, color: theme.accent, fontWeight: 700, letterSpacing: '0.1em', marginTop: 1 }}>{cur.label.toUpperCase()}</div>
      </div>
      {/* Pill cascade unfurling to the right */}
      <div style={{ position: 'absolute', left: cx + R + 24, top: cy - (cur.subs.length * 36) / 2, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {cur.subs.map((s, i) => (
          <div key={s} style={{
            padding: '0 14px', height: 30, display: 'flex', alignItems: 'center', borderRadius: 15,
            background: i === 0 ? theme.accent : theme.surface, color: i === 0 ? '#fff' : theme.text,
            boxShadow: '0 2px 6px rgba(0,0,0,.1)', border: `.5px solid ${theme.border}`,
            fontSize: 11, fontWeight: 600, transform: `translateX(${-(cur.subs.length - i) * 4}px)`,
            transition: 'all .18s cubic-bezier(.3,.7,.4,1)', transitionDelay: `${i * 30}ms`,
            fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          }}>{s}</div>
        ))}
      </div>
      <Cursor x={cx + 50} y={cy - 30} theme={theme} />
      <div style={{ position: 'absolute', left: 16, bottom: 14, fontSize: 9, color: theme.textFaint, fontFamily: 'ui-monospace, monospace', letterSpacing: '0.05em' }}>experiment · radial root → pill cascade</div>
    </Scene>
  );
}

function NestedConcentric({ theme, dpref }) {
  // Concentric radial: outer ring is sub-options of the hovered inner slice.
  const cx = 220, cy = 220, RIN = 64, ROUT = 116, hub = 28;
  const items = [
    { k: 'theme', icon: MenuIcons.paint, subs: ['Beret', 'Signal', 'Anth', 'Shell'] },
    { k: 'shape', icon: MenuIcons.shape, subs: ['Round', 'Sharp', 'Pill', 'Cut'] },
    { k: 'motion', icon: MenuIcons.motion, subs: ['Settle', 'Lift', 'Reveal', 'Idle'] },
    { k: 'shader', icon: MenuIcons.shader, subs: ['Dither', 'Grain', 'Refract', 'Off'] },
  ];
  const [hover, setHover] = useHover(items.map(i => i.k), null, 1900);
  const cur = items.find((i) => i.k === hover) || items[0];
  const n = items.length;
  const arc = (r0, r1, a0, a1, cxx, cyy) => {
    const x0 = cxx + Math.cos(a0) * r1, y0 = cyy + Math.sin(a0) * r1;
    const x1 = cxx + Math.cos(a1) * r1, y1 = cyy + Math.sin(a1) * r1;
    const xi0 = cxx + Math.cos(a0) * r0, yi0 = cyy + Math.sin(a0) * r0;
    const xi1 = cxx + Math.cos(a1) * r0, yi1 = cyy + Math.sin(a1) * r0;
    return `M ${xi0} ${yi0} L ${x0} ${y0} A ${r1} ${r1} 0 0 1 ${x1} ${y1} L ${xi1} ${yi1} A ${r0} ${r0} 0 0 0 ${xi0} ${yi0} Z`;
  };
  return (
    <Scene theme={theme} w={520} h={440}>
      <DesktopBg theme={theme} />
      <div style={{ position: 'absolute', left: cx - ROUT - 16, top: cy - ROUT - 16, width: (ROUT + 16) * 2, height: (ROUT + 16) * 2, borderRadius: '50%', background: theme.mode === 'dark' ? 'rgba(17,20,24,.6)' : 'rgba(255,255,255,.45)', backdropFilter: 'blur(22px)', border: `.5px solid ${theme.border}`, boxShadow: theme.shadow }} />
      <svg style={{ position: 'absolute', left: cx - ROUT, top: cy - ROUT, width: ROUT * 2, height: ROUT * 2 }} viewBox={`0 0 ${ROUT * 2} ${ROUT * 2}`}>
        {/* outer (sub) ring — only for hovered */}
        {cur.subs.map((s, i) => {
          const a0 = (i / cur.subs.length) * Math.PI * 2 - Math.PI / 2 - Math.PI / cur.subs.length;
          const a1 = a0 + (Math.PI * 2) / cur.subs.length;
          const path = arc(RIN + 4, ROUT, a0, a1, ROUT, ROUT);
          const isFirst = i === 0;
          return <path key={s} d={path} fill={isFirst ? theme.accent : (theme.mode === 'dark' ? '#22272D' : '#F2EEE6')} stroke={theme.border} strokeWidth=".5" />;
        })}
        {/* inner ring */}
        {items.map((it, i) => {
          const a0 = (i / n) * Math.PI * 2 - Math.PI / 2 - Math.PI / n;
          const a1 = a0 + (Math.PI * 2) / n;
          const path = arc(hub, RIN, a0, a1, ROUT, ROUT);
          const isHover = hover === it.k;
          return <path key={it.k} d={path} onMouseEnter={() => setHover(it.k)} fill={isHover ? theme.accent : (theme.mode === 'dark' ? '#1B1F24' : '#fff')} stroke={theme.border} strokeWidth=".5" style={{ transition: 'fill .12s', cursor: 'pointer' }} />;
        })}
      </svg>
      {/* Inner icons */}
      {items.map((it, i) => {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2;
        const ix = cx + Math.cos(a) * ((hub + RIN) / 2) - 8;
        const iy = cy + Math.sin(a) * ((hub + RIN) / 2) - 8;
        const isHover = hover === it.k;
        return <div key={it.k} style={{ position: 'absolute', left: ix, top: iy, width: 16, height: 16, color: isHover ? '#fff' : theme.text, pointerEvents: 'none' }}>{it.icon}</div>;
      })}
      {/* Outer labels */}
      {cur.subs.map((s, i) => {
        const a = (i / cur.subs.length) * Math.PI * 2 - Math.PI / 2;
        const lx = cx + Math.cos(a) * ((RIN + ROUT) / 2) - 26;
        const ly = cy + Math.sin(a) * ((RIN + ROUT) / 2) - 6;
        return <div key={s} style={{ position: 'absolute', left: lx, top: ly, width: 52, textAlign: 'center', fontSize: 10, fontWeight: 600, color: i === 0 ? '#fff' : theme.text, pointerEvents: 'none', letterSpacing: '0.04em' }}>{s}</div>;
      })}
      {/* Hub */}
      <div style={{ position: 'absolute', left: cx - hub, top: cy - hub, width: hub * 2, height: hub * 2, borderRadius: '50%', background: theme.surface, border: `.5px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <SysterGlyph size={26} hover />
      </div>
      <Cursor x={cx + 70} y={cy - 30} theme={theme} />
      <div style={{ position: 'absolute', left: 16, bottom: 14, fontSize: 9, color: theme.textFaint, fontFamily: 'ui-monospace, monospace', letterSpacing: '0.05em' }}>experiment · concentric radial nesting (inner→outer)</div>
    </Scene>
  );
}

function EmptyRadialPill({ theme }) {
  // Empty-space variant: small radial of "modes" → pill stack of items per mode.
  const cx = 110, cy = 220, R = 60, r = 24;
  const modes = [
    { k: 'add', icon: MenuIcons.add, items: ['Widget…', 'Workspace', 'Folder', 'File'] },
    { k: 'change', icon: MenuIcons.paint, items: ['Wallpaper', 'Theme', 'Layout'] },
    { k: 'open', icon: MenuIcons.terminal, items: ['Terminal', 'Files', 'Browser'] },
    { k: 'system', icon: MenuIcons.settings, items: ['Settings', 'Reload shell', 'Lock'] },
  ];
  const [hover, setHover] = useHover(modes.map(m => m.k), null, 1900);
  const cur = modes.find((m) => m.k === hover) || modes[0];
  const n = modes.length;
  return (
    <Scene theme={theme} w={400} h={440}>
      <DesktopBg theme={theme} />
      <div style={{ position: 'absolute', left: cx - R - 12, top: cy - R - 12, width: (R + 12) * 2, height: (R + 12) * 2, borderRadius: '50%', background: theme.mode === 'dark' ? 'rgba(17,20,24,.6)' : 'rgba(255,255,255,.5)', backdropFilter: 'blur(18px)', border: `.5px solid ${theme.border}`, boxShadow: theme.shadow }} />
      <svg style={{ position: 'absolute', left: cx - R, top: cy - R, width: R * 2, height: R * 2 }} viewBox={`0 0 ${R * 2} ${R * 2}`}>
        {modes.map((m, i) => {
          const a0 = (i / n) * Math.PI * 2 - Math.PI / 2 - Math.PI / n;
          const a1 = a0 + (Math.PI * 2) / n;
          const x0 = R + Math.cos(a0) * R, y0 = R + Math.sin(a0) * R;
          const x1 = R + Math.cos(a1) * R, y1 = R + Math.sin(a1) * R;
          const xi0 = R + Math.cos(a0) * r, yi0 = R + Math.sin(a0) * r;
          const xi1 = R + Math.cos(a1) * r, yi1 = R + Math.sin(a1) * r;
          const path = `M ${xi0} ${yi0} L ${x0} ${y0} A ${R} ${R} 0 0 1 ${x1} ${y1} L ${xi1} ${yi1} A ${r} ${r} 0 0 0 ${xi0} ${yi0} Z`;
          const isHover = hover === m.k;
          return <path key={m.k} d={path} onMouseEnter={() => setHover(m.k)} fill={isHover ? theme.accent : (theme.mode === 'dark' ? '#1B1F24' : '#fff')} stroke={theme.border} strokeWidth=".5" style={{ transition: 'fill .12s', cursor: 'pointer' }} />;
        })}
      </svg>
      {modes.map((m, i) => {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2;
        const ix = cx + Math.cos(a) * ((r + R) / 2) - 8;
        const iy = cy + Math.sin(a) * ((r + R) / 2) - 8;
        const isHover = hover === m.k;
        return <div key={m.k} style={{ position: 'absolute', left: ix, top: iy, width: 16, height: 16, color: isHover ? '#fff' : theme.text, pointerEvents: 'none' }}>{m.icon}</div>;
      })}
      <div style={{ position: 'absolute', left: cx - r, top: cy - r, width: r * 2, height: r * 2, borderRadius: '50%', background: theme.surface, border: `.5px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <SysterGlyph size={22} hover />
      </div>
      {/* Pill cascade emerging on the right */}
      <div style={{ position: 'absolute', left: cx + R + 24, top: cy - (cur.items.length * 36) / 2, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ fontSize: 9, color: theme.accent, fontWeight: 700, letterSpacing: '0.12em', marginBottom: 2, fontFamily: 'ui-monospace, monospace' }}>{cur.k.toUpperCase()}/</div>
        {cur.items.map((s, i) => (
          <div key={s} style={{
            padding: '0 14px', height: 30, display: 'flex', alignItems: 'center', borderRadius: 15,
            background: i === 0 ? theme.accent : theme.surface, color: i === 0 ? '#fff' : theme.text,
            boxShadow: '0 2px 6px rgba(0,0,0,.1)', border: `.5px solid ${theme.border}`,
            fontSize: 11, fontWeight: 600, transition: 'all .18s', transitionDelay: `${i * 30}ms`,
            fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          }}>{s}</div>
        ))}
      </div>
      <Cursor x={cx + 36} y={cy - 24} theme={theme} />
      <div style={{ position: 'absolute', left: 16, bottom: 14, fontSize: 9, color: theme.textFaint, fontFamily: 'ui-monospace, monospace', letterSpacing: '0.05em' }}>experiment · radial mode → pill items</div>
    </Scene>
  );
}

/* ════════════════════════════════════════════════════════════════════
   4 · NESTED SUBMENU CASCADE — presets/themes/animations
   Variants: Cascading / In-place drill / Mega panel
   ════════════════════════════════════════════════════════════════════ */

function NestedCascade({ theme, dpref }) {
  const shape = gnuShape('rounded'); const d = gnuDensity(dpref);
  const [hover, setHover] = useHover(['theme', 'preset', 'anim', 'shape'], null, 2200);
  const [subHover, setSubHover] = useHover(['beret', 'signal', 'anth', 'shell', 'custom'], null, 1700);
  const [subSubHover, setSubSubHover] = useHover(['on', 'lift', 'reveal', 'settle'], null, 1400);
  return (
    <Scene theme={theme} w={520} h={420}>
      <DesktopBg theme={theme} />
      {/* Root */}
      <div style={{ position: 'absolute', left: 24, top: 56 }}>
        <MenuShell theme={theme} shape={shape} density={d} width={dpref === 'touch' ? 200 : 170} origin={{ x: 12, y: 12 }} label="ROOT">
          <MenuRow theme={theme} shape={shape} density={d} icon={MenuIcons.paint} label="Theme" hasSubmenu
            hovered={hover === 'theme'} onHover={() => setHover('theme')} />
          <MenuRow theme={theme} shape={shape} density={d} icon={MenuIcons.layout} label="Preset" sub="Beret" hasSubmenu
            hovered={hover === 'preset'} onHover={() => setHover('preset')} />
          <MenuRow theme={theme} shape={shape} density={d} icon={MenuIcons.motion} label="Animation" hasSubmenu
            hovered={hover === 'anim'} onHover={() => setHover('anim')} />
          <MenuSeparator theme={theme} />
          <MenuRow theme={theme} shape={shape} density={d} icon={MenuIcons.shape} label="Shape" hasSubmenu
            hovered={hover === 'shape'} onHover={() => setHover('shape')} />
        </MenuShell>
      </div>
      {/* Connector arc */}
      <svg style={{ position: 'absolute', left: 192, top: 84, width: 36, height: 24, pointerEvents: 'none', overflow: 'visible' }}>
        <path d="M0 12 C 12 12, 12 12, 24 12" stroke={theme.accent} strokeWidth="1" fill="none" strokeDasharray="2 2" opacity="0.4" />
      </svg>
      {/* Sub */}
      <div style={{ position: 'absolute', left: 200, top: 76 }}>
        <MenuShell theme={theme} shape={shape} density={d} width={dpref === 'touch' ? 200 : 170} origin={{ x: 0, y: 12 }} label="PRESET">
          <MenuRow theme={theme} shape={shape} density={d} swatch={GNU.beret} label="Beret" sub="green · paper" hasSubmenu accent
            hovered={subHover === 'beret'} onHover={() => setSubHover('beret')} />
          <MenuRow theme={theme} shape={shape} density={d} swatch={GNU.signal} label="Signal" sub="orange · ink"
            hovered={subHover === 'signal'} onHover={() => setSubHover('signal')} />
          <MenuRow theme={theme} shape={shape} density={d} swatch={GNU.anthracite} label="Anthracite" sub="ink · ink"
            hovered={subHover === 'anth'} onHover={() => setSubHover('anth')} />
          <MenuRow theme={theme} shape={shape} density={d} swatch={GNU.shellWhite} label="Shell" sub="paper · ink"
            hovered={subHover === 'shell'} onHover={() => setSubHover('shell')} />
          <MenuSeparator theme={theme} />
          <MenuRow theme={theme} shape={shape} density={d} icon={MenuIcons.add} label="Custom…"
            hovered={subHover === 'custom'} onHover={() => setSubHover('custom')} />
        </MenuShell>
      </div>
      {/* Sub-sub */}
      <div style={{ position: 'absolute', left: 376, top: 96 }}>
        <MenuShell theme={theme} shape={shape} density={d} width={dpref === 'touch' ? 140 : 120} origin={{ x: 0, y: 12 }} label="STATE">
          <MenuRow theme={theme} shape={shape} density={d} label="On"
            hovered={subSubHover === 'on'} onHover={() => setSubSubHover('on')} />
          <MenuRow theme={theme} shape={shape} density={d} label="Lift"
            hovered={subSubHover === 'lift'} onHover={() => setSubSubHover('lift')} />
          <MenuRow theme={theme} shape={shape} density={d} label="Reveal"
            hovered={subSubHover === 'reveal'} onHover={() => setSubSubHover('reveal')} />
          <MenuRow theme={theme} shape={shape} density={d} label="Settle" accent
            hovered={subSubHover === 'settle'} onHover={() => setSubSubHover('settle')} />
        </MenuShell>
      </div>
      <Cursor x={388} y={108} theme={theme} />
    </Scene>
  );
}

function NestedDrill({ theme, dpref }) {
  // In-place drill: a single panel where submenu replaces parent w/ slide animation
  const shape = gnuShape('rounded'); const d = gnuDensity(dpref);
  const [hover, setHover] = useHover(['beret', 'signal', 'anth', 'shell', 'new', 'dup']);
  return (
    <Scene theme={theme} w={400} h={420}>
      <DesktopBg theme={theme} />
      <div style={{ position: 'absolute', left: 90, top: 70 }}>
        <MenuShell theme={theme} shape={shape} density={d} width={dpref === 'touch' ? 240 : 220} origin={{ x: 14, y: 14 }} label="01 / PRESET">
          {/* Breadcrumb back row */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: `4px ${d.rowPx}px`, cursor: 'pointer',
            color: theme.textDim, fontSize: d.fs - 1, fontWeight: 500,
            borderBottom: `.5px solid ${theme.border}`, marginBottom: 4,
          }}>
            <svg width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
              <path d="M6 1.5L3 4.5L6 7.5" />
            </svg>
            <span>Theme</span>
            <span style={{ marginLeft: 'auto', color: theme.accent, fontWeight: 600, fontFamily: 'ui-monospace, monospace', fontSize: 9 }}>preset/</span>
          </div>
          <MenuSection label="Color presets" theme={theme} density={d}>
            <MenuRow theme={theme} shape={shape} density={d} swatch={GNU.beret} label="Beret" sub="green · paper · settle" hasSubmenu accent
              hovered={hover === 'beret'} onHover={() => setHover('beret')} />
            <MenuRow theme={theme} shape={shape} density={d} swatch={GNU.signal} label="Signal" sub="orange · ink · transmit" hasSubmenu
              hovered={hover === 'signal'} onHover={() => setHover('signal')} />
            <MenuRow theme={theme} shape={shape} density={d} swatch={GNU.anthracite} label="Anthracite" sub="dark · idle" hasSubmenu
              hovered={hover === 'anth'} onHover={() => setHover('anth')} />
            <MenuRow theme={theme} shape={shape} density={d} swatch={GNU.shellWhite} label="Shell" sub="paper · listening" hasSubmenu
              hovered={hover === 'shell'} onHover={() => setHover('shell')} />
          </MenuSection>
          <MenuSeparator theme={theme} />
          <MenuSection label="Custom" theme={theme} density={d}>
            <MenuRow theme={theme} shape={shape} density={d} icon={MenuIcons.add} label="New from current"
              hovered={hover === 'new'} onHover={() => setHover('new')} />
            <MenuRow theme={theme} shape={shape} density={d} icon={MenuIcons.copy} label="Duplicate Beret"
              hovered={hover === 'dup'} onHover={() => setHover('dup')} />
          </MenuSection>
        </MenuShell>
      </div>
      <Cursor x={250} y={120} theme={theme} />
    </Scene>
  );
}

function NestedMegaPanel({ theme, dpref }) {
  // Mega panel — preset list + live preview side by side
  const shape = gnuShape('rounded'); const d = gnuDensity(dpref);
  const [hover, setHover] = useHover(['beret', 'signal', 'anth', 'shell', 'new'], null, 2000);
  const presets = [
    { k: 'beret', name: 'Beret', sw: GNU.beret, sub: 'paper · green', accent: GNU.beret, bg: GNU.shellWhite, ink: GNU.anthracite },
    { k: 'signal', name: 'Signal', sw: GNU.signal, sub: 'ink · orange', accent: GNU.signal, bg: GNU.anthracite, ink: GNU.shellWhite },
    { k: 'anth', name: 'Anthracite', sw: GNU.anthracite, sub: 'mono', accent: GNU.shellWhite, bg: GNU.anthracite, ink: GNU.shellWhite },
    { k: 'shell', name: 'Shell', sw: GNU.shellWhite, sub: 'paper · ink', accent: GNU.anthracite, bg: GNU.shellWhite, ink: GNU.anthracite },
  ];
  const cur = presets.find((p) => p.k === hover) || presets[0];
  return (
    <Scene theme={theme} w={520} h={420}>
      <DesktopBg theme={theme} />
      <div style={{ position: 'absolute', left: 30, top: 60, width: 460 }}>
        <MaskReveal origin={{ x: 16, y: 16 }} radius={shape.menuRadius}>
          <div style={{
            display: 'flex', background: theme.surface, borderRadius: shape.menuRadius,
            boxShadow: theme.shadow, border: `.5px solid ${theme.border}`,
            overflow: 'hidden', position: 'relative',
            color: theme.text, fontSize: d.fs, fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          }}>
            <GrainBg opacity={theme.mode === 'dark' ? 0.05 : 0.04} />
            {/* Left: list */}
            <div style={{ width: 200, padding: shape.pad, position: 'relative', zIndex: 1, borderRight: `.5px solid ${theme.border}` }}>
              <div style={{ padding: `${d.secPy}px ${d.secPx}px 4px`, fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: theme.sectionLb, fontWeight: 600 }}>Presets</div>
              {presets.map((p) => (
                <MenuRow key={p.k} theme={theme} shape={shape} density={d}
                  swatch={p.sw} label={p.name} sub={p.sub}
                  hovered={hover === p.k} onHover={() => setHover(p.k)} accent={hover === p.k} />
              ))}
              <MenuSeparator theme={theme} />
              <MenuRow theme={theme} shape={shape} density={d} icon={MenuIcons.add} label="New custom"
                hovered={hover === 'new'} onHover={() => setHover('new')} />
            </div>
            {/* Right: preview */}
            <div style={{ flex: 1, position: 'relative', zIndex: 1, padding: 14 }}>
              <div style={{
                fontSize: 9, color: theme.sectionLb, letterSpacing: '0.1em',
                textTransform: 'uppercase', fontWeight: 600, marginBottom: 8,
              }}>Live preview · {cur.name}</div>
              <div style={{
                background: cur.bg, color: cur.ink, borderRadius: 8, padding: 14, position: 'relative',
                border: `.5px solid ${theme.border}`, height: 160, overflow: 'hidden',
                fontFamily: 'ui-sans-serif, system-ui, sans-serif',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <SysterGlyph size={18} body={cur.accent} screen={cur.bg === cur.ink ? cur.bg : cur.ink} beret={cur.sw} />
                  <span style={{ fontWeight: 600, fontSize: 12 }}>Shell</span>
                  <span style={{ fontSize: 9, opacity: 0.6, marginLeft: 'auto', fontFamily: 'ui-monospace, monospace' }}>14:32</span>
                </div>
                <div style={{
                  display: 'inline-block', padding: '4px 10px', borderRadius: 6,
                  background: cur.accent, color: cur.bg, fontSize: 11, fontWeight: 600,
                }}>Run · {cur.name}</div>
                <div style={{ marginTop: 10, height: 4, background: cur.accent, opacity: 0.18, borderRadius: 2 }}>
                  <div style={{ width: '60%', height: '100%', background: cur.accent, borderRadius: 2 }} />
                </div>
                <div style={{ marginTop: 8, fontSize: 10, opacity: 0.7 }}>Lorem ipsum dolor sit amet. Adipisicing elit, sed do.</div>
                {/* tile cluster */}
                <div style={{ position: 'absolute', right: 10, bottom: 10, display: 'grid', gridTemplateColumns: '12px 12px 12px', gap: 3 }}>
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} style={{
                      width: 12, height: 12, borderRadius: 2,
                      background: i % 3 === 0 ? cur.accent : (i % 5 === 0 ? cur.sw : 'transparent'),
                      border: `.5px solid ${cur.ink}33`,
                    }} />
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                <button style={{
                  flex: 1, padding: '6px 8px', fontSize: 11, fontWeight: 600, borderRadius: 6, border: 'none',
                  background: theme.accent, color: '#fff', cursor: 'pointer',
                }}>Apply</button>
                <button style={{
                  padding: '6px 10px', fontSize: 11, fontWeight: 500, borderRadius: 6,
                  border: `.5px solid ${theme.border}`, background: 'transparent', color: theme.text, cursor: 'pointer',
                }}>Edit…</button>
              </div>
            </div>
          </div>
        </MaskReveal>
      </div>
      <Cursor x={140} y={140} theme={theme} />
    </Scene>
  );
}

/* ════════════════════════════════════════════════════════════════════
   5 · SYSTEM TRAY MENU — right-click on a tray icon
   Variants: Audio (with sliders) / Network (list) / Power
   ════════════════════════════════════════════════════════════════════ */

function TrayAudio({ theme, dpref }) {
  const shape = gnuShape('rounded'); const d = gnuDensity(dpref);
  const [hover, setHover] = useHover(['out-int', 'out-hd', 'out-mon', 'set']);
  return (
    <Scene theme={theme} w={400} h={420}>
      <DesktopBg theme={theme} />
      <TrayBar theme={theme} focusKey="audio" />
      <div style={{ position: 'absolute', right: 14, top: 38 }}>
        <MenuShell theme={theme} shape={shape} density={d} width={dpref === 'touch' ? 280 : 250} origin={{ x: 240, y: 0 }} label="AUDIO">
          {/* Volume slider */}
          <div style={{ padding: `8px ${d.rowPx}px 6px` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 16, height: 16, color: theme.accent }}>{MenuIcons.audio}</span>
              <span style={{ fontSize: d.fs - 1, fontWeight: 500 }}>Output</span>
              <span style={{ marginLeft: 'auto', fontSize: 11, fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>62%</span>
            </div>
            <div style={{ marginTop: 6, height: 6, background: theme.kbdBg, borderRadius: 3, position: 'relative' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '62%', background: theme.accent, borderRadius: 3 }} />
              <div style={{ position: 'absolute', left: '62%', top: -3, width: 12, height: 12, borderRadius: 6, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.25)', transform: 'translateX(-6px)' }} />
            </div>
          </div>
          <MenuSeparator theme={theme} />
          <MenuSection label="Output device" theme={theme} density={d}>
            <MenuRow theme={theme} shape={shape} density={d} icon={MenuIcons.audio} label="Internal speakers" sub="default" accent
              hovered={hover === 'out-int'} onHover={() => setHover('out-int')} />
            <MenuRow theme={theme} shape={shape} density={d} icon={MenuIcons.bluetooth} label="HD 660 S2" sub="bt · 84%"
              hovered={hover === 'out-hd'} onHover={() => setHover('out-hd')} />
            <MenuRow theme={theme} shape={shape} density={d} icon={MenuIcons.audio} label="Studio Monitor" sub="usb"
              hovered={hover === 'out-mon'} onHover={() => setHover('out-mon')} />
          </MenuSection>
          <MenuSeparator theme={theme} />
          <MenuRow theme={theme} shape={shape} density={d} icon={MenuIcons.settings} label="Sound settings…"
            hovered={hover === 'set'} onHover={() => setHover('set')} />
        </MenuShell>
      </div>
      <Cursor x={290} y={26} theme={theme} />
    </Scene>
  );
}

function TrayNetwork({ theme, dpref }) {
  const shape = gnuShape('rounded'); const d = gnuDensity(dpref);
  const [hover, setHover] = useHover(['hh', 'cf', 'gn', 'lp']);
  const networks = [
    { k: 'hh', name: 'home-honeycomb', sec: 'WPA3', sig: 4, conn: true },
    { k: 'cf', name: 'cafe.local', sec: 'WPA2', sig: 3 },
    { k: 'gn', name: 'gnu.in/guest', sec: 'open', sig: 2 },
    { k: 'lp', name: 'linksys-2.4', sec: 'WPA2', sig: 2 },
  ];
  return (
    <Scene theme={theme} w={400} h={420}>
      <DesktopBg theme={theme} />
      <TrayBar theme={theme} focusKey="network" />
      <div style={{ position: 'absolute', right: 14, top: 38 }}>
        <MenuShell theme={theme} shape={shape} density={d} width={dpref === 'touch' ? 280 : 240} origin={{ x: 220, y: 0 }} label="NET">
          <div style={{ padding: `6px ${d.rowPx}px`, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 14, height: 14, color: theme.accent }}>{MenuIcons.network}</span>
            <span style={{ fontSize: d.fs - 1, fontWeight: 500 }}>Wi-Fi</span>
            <span style={{ marginLeft: 'auto' }}>
              <span style={{
                width: 26, height: 14, borderRadius: 999, position: 'relative', display: 'inline-block',
                background: theme.accent,
              }}>
                <span style={{ position: 'absolute', top: 2, left: 14, width: 10, height: 10, borderRadius: 999, background: '#fff' }} />
              </span>
            </span>
          </div>
          <MenuSeparator theme={theme} />
          <MenuSection label="Networks" theme={theme} density={d}>
            {networks.map((n) => (
              <MenuRow key={n.k} theme={theme} shape={shape} density={d}
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" width="100%" height="100%">
                    <path d="M12 18h.01" opacity={n.sig >= 1 ? 1 : 0.25}/>
                    <path d="M8.5 14.5a5 5 0 0 1 7 0" opacity={n.sig >= 2 ? 1 : 0.25}/>
                    <path d="M5.5 11a9 9 0 0 1 13 0" opacity={n.sig >= 3 ? 1 : 0.25}/>
                    <path d="M2.5 7.5a13 13 0 0 1 19 0" opacity={n.sig >= 4 ? 1 : 0.25}/>
                  </svg>
                }
                label={n.name} sub={n.sec} accent={n.conn}
                hovered={hover === n.k} onHover={() => setHover(n.k)}
                kbd={n.conn ? ['✓'] : undefined} />
            ))}
          </MenuSection>
          <MenuSeparator theme={theme} />
          <MenuRow theme={theme} shape={shape} density={d} icon={MenuIcons.add} label="Other network…"
            hovered={hover === 'other'} onHover={() => setHover('other')} />
          <MenuRow theme={theme} shape={shape} density={d} icon={MenuIcons.settings} label="Network settings…"
            hovered={hover === 'set'} onHover={() => setHover('set')} />
        </MenuShell>
      </div>
      <Cursor x={300} y={26} theme={theme} />
    </Scene>
  );
}

function TrayPower({ theme, dpref }) {
  const shape = gnuShape('rounded'); const d = gnuDensity(dpref);
  const [hover, setHover] = useHover(['lock', 'sleep', 'logout', 'restart', 'shutdown']);
  return (
    <Scene theme={theme} w={400} h={420}>
      <DesktopBg theme={theme} />
      <TrayBar theme={theme} focusKey="power" />
      <div style={{ position: 'absolute', right: 14, top: 38 }}>
        <div style={{ position: 'relative', width: dpref === 'touch' ? 240 : 200 }}>
          <MaskReveal origin={{ x: 240, y: 0 }} radius={shape.menuRadius}>
            <div style={{
              background: theme.surface, borderRadius: shape.menuRadius, boxShadow: theme.shadow,
              border: `.5px solid ${theme.border}`, overflow: 'hidden', position: 'relative',
              color: theme.text, fontSize: d.fs, fontFamily: 'ui-sans-serif, system-ui, sans-serif',
            }}>
              <GrainBg opacity={theme.mode === 'dark' ? 0.06 : 0.04} />
              {/* status header */}
              <div style={{ padding: '10px 12px', borderBottom: `.5px solid ${theme.border}`, position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <SysterGlyph size={20} hover />
                  <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
                    <span style={{ fontSize: 11, fontWeight: 600 }}>m4ckenzie</span>
                    <span style={{ fontSize: 9, color: theme.textDim, fontFamily: 'ui-monospace, monospace' }}>uptime 3d 14h</span>
                  </div>
                  <span style={{ flex: 1 }} />
                  <span style={{
                    fontSize: 10, padding: '2px 6px', borderRadius: 999,
                    background: theme.green + '22', color: theme.green, fontWeight: 600,
                  }}>● online</span>
                </div>
              </div>
              <div style={{ padding: shape.pad, position: 'relative', zIndex: 1 }}>
                <MenuRow theme={theme} shape={shape} density={d}
                  icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" width="100%" height="100%"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>}
                  label="Lock" kbd={['⌘', 'L']}
                  hovered={hover === 'lock'} onHover={() => setHover('lock')} />
                <MenuRow theme={theme} shape={shape} density={d}
                  icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" width="100%" height="100%"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>}
                  label="Sign out"
                  hovered={hover === 'out'} onHover={() => setHover('out')} />
                <MenuSeparator theme={theme} />
                <MenuRow theme={theme} shape={shape} density={d}
                  icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" width="100%" height="100%"><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/></svg>}
                  label="Sleep" sub="veille"
                  hovered={hover === 'sleep'} onHover={() => setHover('sleep')} />
                <MenuRow theme={theme} shape={shape} density={d} icon={MenuIcons.refresh} label="Restart"
                  hovered={hover === 'restart'} onHover={() => setHover('restart')} />
                <MenuRow theme={theme} shape={shape} density={d} icon={MenuIcons.power} label="Shut down" danger
                  hovered={hover === 'off'} onHover={() => setHover('off')} />
              </div>
            </div>
          </MaskReveal>
        </div>
      </div>
      <Cursor x={380} y={26} theme={theme} />
    </Scene>
  );
}

/* ── Detached radial: discs float independently around the cursor ───── */

function RadialDetached({ theme, dpref }) {
  // Each option is its own floating disc — not pie slices. Positioned on a ring,
  // hover swells the disc and reveals a label tag.
  const cx = 220, cy = 220, R = 96;
  const items = [
    { k: 'add', icon: MenuIcons.add, label: 'Add' },
    { k: 'paint', icon: MenuIcons.paint, label: 'Theme' },
    { k: 'wall', icon: MenuIcons.wallpaper, label: 'Wallpaper' },
    { k: 'term', icon: MenuIcons.terminal, label: 'Terminal' },
    { k: 'workspace', icon: MenuIcons.workspace, label: 'Workspace' },
    { k: 'set', icon: MenuIcons.settings, label: 'Settings' },
  ];
  const [hover, setHover] = useHover(items.map(i => i.k), null, 1700);
  const n = items.length;
  return (
    <Scene theme={theme} w={460} h={440}>
      <DesktopBg theme={theme} />
      {/* hub: cursor anchor */}
      <div style={{ position: 'absolute', left: cx - 22, top: cy - 22, width: 44, height: 44, borderRadius: '50%', background: theme.surface, border: `.5px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 16px rgba(0,0,0,.25)' }}>
        <SysterGlyph size={22} hover />
      </div>
      {/* dotted guide ring */}
      <svg style={{ position: 'absolute', left: cx - R, top: cy - R, width: R * 2, height: R * 2, pointerEvents: 'none' }} viewBox={`0 0 ${R * 2} ${R * 2}`}>
        <circle cx={R} cy={R} r={R} fill="none" stroke={theme.border} strokeWidth=".5" strokeDasharray="2 4" opacity="0.5" />
      </svg>
      {items.map((it, i) => {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2;
        const dx = cx + Math.cos(a) * R;
        const dy = cy + Math.sin(a) * R;
        const isHover = hover === it.k;
        const sz = isHover ? 52 : 40;
        return (
          <React.Fragment key={it.k}>
            {/* the disc */}
            <div
              onMouseEnter={() => setHover(it.k)}
              style={{
                position: 'absolute', left: dx - sz / 2, top: dy - sz / 2, width: sz, height: sz,
                borderRadius: '50%', background: isHover ? theme.accent : theme.surface,
                border: `.5px solid ${isHover ? theme.accent : theme.border}`,
                color: isHover ? '#fff' : theme.text,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: isHover ? `0 8px 22px ${theme.accent}55` : '0 4px 10px rgba(0,0,0,.18)',
                transition: 'all .18s cubic-bezier(.3,.7,.4,1)', cursor: 'pointer',
              }}>
              <span style={{ width: isHover ? 22 : 18, height: isHover ? 22 : 18 }}>{it.icon}</span>
            </div>
            {/* label tag */}
            <div style={{
              position: 'absolute',
              left: dx + Math.cos(a) * 30 - 30, top: dy + Math.sin(a) * 30 - 9,
              padding: '3px 8px', borderRadius: 9, height: 18,
              background: theme.mode === 'dark' ? 'rgba(11,13,16,.85)' : 'rgba(255,255,255,.92)',
              color: theme.text, fontSize: 9.5, fontWeight: 600, letterSpacing: '0.04em',
              border: `.5px solid ${theme.border}`,
              opacity: isHover ? 1 : 0, transform: `translate(${Math.cos(a) * (isHover ? 14 : 4)}px, ${Math.sin(a) * (isHover ? 14 : 4)}px)`,
              transition: 'all .2s', pointerEvents: 'none', whiteSpace: 'nowrap',
              fontFamily: 'ui-sans-serif, system-ui, sans-serif',
              width: 60, textAlign: 'center', marginLeft: 0,
            }}>{it.label}</div>
          </React.Fragment>
        );
      })}
      <Cursor x={cx + 6} y={cy + 6} theme={theme} />
      <div style={{ position: 'absolute', left: 16, bottom: 14, fontSize: 9, color: theme.textFaint, fontFamily: 'ui-monospace, monospace', letterSpacing: '0.05em' }}>experiment · detached radial · floating discs (no pie)</div>
    </Scene>
  );
}

/* ── Bubble dialogue tree: every node a detached bubble, connected by lines ── */

function NestedBubbleTree({ theme, dpref }) {
  // Root → branches → leaves, all floating bubbles. Hover reveals the leaves
  // attached to the active branch. No containing panels.
  const [hover, setHover] = useHover(['theme', 'shape', 'motion', 'shader', 'layout'], null, 2200);
  const cx = 70, cy = 220;
  const branches = [
    { k: 'theme', label: 'Theme', icon: MenuIcons.paint, ang: -0.95, dist: 130, leaves: ['Beret', 'Signal', 'Anth', 'Shell'] },
    { k: 'shape', label: 'Shape', icon: MenuIcons.shape, ang: -0.42, dist: 145, leaves: ['Round', 'Sharp', 'Pill'] },
    { k: 'motion', label: 'Motion', icon: MenuIcons.motion, ang: 0.05, dist: 155, leaves: ['Settle', 'Lift', 'Reveal', 'Iris'] },
    { k: 'shader', label: 'Shader', icon: MenuIcons.shader, ang: 0.55, dist: 145, leaves: ['Dither', 'Grain', 'Refract'] },
    { k: 'layout', label: 'Layout', icon: MenuIcons.layout, ang: 1.0, dist: 130, leaves: ['Tile', 'Float', 'Stack'] },
  ];

  const branchPos = (b) => ({ x: cx + Math.cos(b.ang) * b.dist, y: cy + Math.sin(b.ang) * b.dist });
  const leafPos = (b, i, n) => {
    const bp = branchPos(b);
    // splay leaves outward from the branch, perpendicular-ish to the root vector
    const baseAng = b.ang;
    const spread = 0.55; // radians
    const a = baseAng - spread / 2 + (n === 1 ? spread / 2 : (i / (n - 1)) * spread);
    const r = 110;
    return { x: bp.x + Math.cos(a) * r, y: bp.y + Math.sin(a) * r };
  };

  const cur = branches.find((b) => b.k === hover) || branches[0];

  return (
    <Scene theme={theme} w={580} h={440}>
      <DesktopBg theme={theme} />

      {/* Connection lines */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        {/* Root → branches */}
        {branches.map((b) => {
          const p = branchPos(b);
          const isActive = b.k === hover;
          return (
            <line key={`r-${b.k}`} x1={cx} y1={cy} x2={p.x} y2={p.y}
              stroke={isActive ? theme.accent : theme.border}
              strokeWidth={isActive ? 1.25 : 0.6}
              strokeDasharray={isActive ? '0' : '2 3'}
              opacity={isActive ? 0.85 : 0.5} />
          );
        })}
        {/* Active branch → leaves */}
        {cur.leaves.map((_, i) => {
          const bp = branchPos(cur);
          const lp = leafPos(cur, i, cur.leaves.length);
          return (
            <line key={`l-${i}`} x1={bp.x} y1={bp.y} x2={lp.x} y2={lp.y}
              stroke={theme.accent} strokeWidth=".75" opacity=".6" strokeDasharray="2 2" />
          );
        })}
      </svg>

      {/* Root bubble */}
      <div style={{ position: 'absolute', left: cx - 28, top: cy - 28, width: 56, height: 56, borderRadius: '50%', background: theme.surface, border: `.5px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 22px rgba(0,0,0,.25)', flexDirection: 'column' }}>
        <SysterGlyph size={26} hover />
        <div style={{ fontSize: 7, color: theme.accent, fontWeight: 700, letterSpacing: '0.12em', marginTop: -1, fontFamily: 'ui-monospace, monospace' }}>ROOT</div>
      </div>

      {/* Branch bubbles */}
      {branches.map((b) => {
        const p = branchPos(b);
        const isActive = b.k === hover;
        const sz = isActive ? 56 : 44;
        return (
          <div key={b.k} onMouseEnter={() => setHover(b.k)}
            style={{
              position: 'absolute', left: p.x - sz / 2, top: p.y - sz / 2, width: sz, height: sz,
              borderRadius: '50%',
              background: isActive ? theme.accent : theme.surface,
              border: `.5px solid ${isActive ? theme.accent : theme.border}`,
              color: isActive ? '#fff' : theme.text,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
              boxShadow: isActive ? `0 8px 22px ${theme.accent}55` : '0 4px 12px rgba(0,0,0,.18)',
              transition: 'all .18s cubic-bezier(.3,.7,.4,1)', cursor: 'pointer',
            }}>
            <span style={{ width: isActive ? 18 : 16, height: isActive ? 18 : 16 }}>{b.icon}</span>
            <span style={{ fontSize: isActive ? 9 : 8.5, fontWeight: 600, letterSpacing: '0.04em', marginTop: 1, fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>{b.label}</span>
          </div>
        );
      })}

      {/* Leaf bubbles for active branch */}
      {cur.leaves.map((leaf, i) => {
        const lp = leafPos(cur, i, cur.leaves.length);
        const isFirst = i === 0;
        const sz = 36;
        return (
          <div key={`leaf-${cur.k}-${i}`}
            style={{
              position: 'absolute', left: lp.x - sz / 2, top: lp.y - sz / 2,
              minWidth: sz, height: sz, padding: '0 10px',
              borderRadius: 999,
              background: isFirst ? theme.accent : theme.surface,
              border: `.5px solid ${isFirst ? theme.accent : theme.border}`,
              color: isFirst ? '#fff' : theme.text,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(0,0,0,.18)',
              fontSize: 10, fontWeight: 600, letterSpacing: '0.04em',
              transition: 'all .2s', transitionDelay: `${i * 30}ms`,
              fontFamily: 'ui-sans-serif, system-ui, sans-serif',
              whiteSpace: 'nowrap',
            }}>{leaf}</div>
        );
      })}

      <Cursor x={cx + 42} y={cy + 12} theme={theme} />
      <div style={{ position: 'absolute', left: 16, bottom: 14, fontSize: 9, color: theme.textFaint, fontFamily: 'ui-monospace, monospace', letterSpacing: '0.05em' }}>experiment · bubble dialogue tree · no panels, only nodes + edges</div>
    </Scene>
  );
}

function NestedFractal({ theme, dpref }) {
  // A self-similar cascade. Three levels visible. Each child panel is ~78% the size
  // of its parent and tilts slightly, branching off the hovered row.
  const [hoverL1, setHoverL1] = useHover(['theme', 'shape', 'motion', 'shader'], null, 2400);
  const [hoverL2, setHoverL2] = useHover(['beret', 'signal', 'anth', 'shell', 'round', 'sharp', 'pill', 'settle', 'lift', 'reveal', 'dither', 'grain', 'refract'], null, 1500);
  const L1 = [
    { k: 'theme', label: 'Theme', icon: MenuIcons.paint },
    { k: 'shape', label: 'Shape', icon: MenuIcons.shape },
    { k: 'motion', label: 'Motion', icon: MenuIcons.motion },
    { k: 'shader', label: 'Shader', icon: MenuIcons.shader },
  ];
  const L2_byK = {
    theme: [{ k: 'beret', label: 'Beret' }, { k: 'signal', label: 'Signal' }, { k: 'anth', label: 'Anthracite' }, { k: 'shell', label: 'Shell' }],
    shape: [{ k: 'round', label: 'Round' }, { k: 'sharp', label: 'Sharp' }, { k: 'pill', label: 'Pill' }],
    motion: [{ k: 'settle', label: 'Settle' }, { k: 'lift', label: 'Lift' }, { k: 'reveal', label: 'Reveal' }],
    shader: [{ k: 'dither', label: 'Dither' }, { k: 'grain', label: 'Grain' }, { k: 'refract', label: 'Refract' }],
  };
  const L3_byK = {
    beret: ['#FF6A00', '#E05A00', '#3A1500', 'A10'],
    signal: ['Bright', 'Muted', 'Mono'],
    anth: ['9%', '12%', '15%'],
    shell: ['Cream', 'Warm', 'Cool'],
    round: ['8 px', '12 px', '16 px'],
    sharp: ['0 px'],
    pill: ['999'],
    settle: ['180 ms', '240 ms', '320 ms'],
    lift: ['Soft', 'Hard'],
    reveal: ['Mask', 'Wipe', 'Iris'],
    dither: ['1×', '2×', '4×'],
    grain: ['On', 'Off'],
    refract: ['Edge', 'Lens', 'Off'],
  };
  const L2 = L2_byK[hoverL1] || [];
  const L3 = L3_byK[hoverL2] || [];

  // panel sizes — fractal scaling 1 → 0.78 → 0.6
  const W1 = 200, W2 = Math.round(W1 * 0.82), W3 = Math.round(W2 * 0.78);
  const tilt2 = 4, tilt3 = 8;

  return (
    <Scene theme={theme} w={520} h={440}>
      <DesktopBg theme={theme} />
      {/* connection lines */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        <path d={`M ${50 + W1} ${90 + 40} Q ${80 + W1 + 10} 130, ${50 + W1 + 36} ${90 + 60}`} stroke={theme.accent} strokeWidth=".75" fill="none" opacity=".5" strokeDasharray="2 3" />
        <path d={`M ${50 + W1 + 36 + W2} ${90 + 60 + 30} Q ${50 + W1 + 36 + W2 + 14} ${180}, ${50 + W1 + 36 + W2 + 36} ${90 + 60 + 70}`} stroke={theme.accent} strokeWidth=".75" fill="none" opacity=".5" strokeDasharray="2 3" />
      </svg>

      {/* L1 panel */}
      <div style={{ position: 'absolute', left: 50, top: 90, width: W1 }}>
        <FractalPanel theme={theme} width={W1} title="Preset" tilt={0} level={1}>
          {L1.map((it) => (
            <FractalRow key={it.k} theme={theme} icon={it.icon} label={it.label} hovered={hoverL1 === it.k} onHover={() => setHoverL1(it.k)} caret level={1} />
          ))}
        </FractalPanel>
      </div>
      {/* L2 panel — tilted, smaller */}
      <div style={{ position: 'absolute', left: 50 + W1 + 36, top: 90 + 60, width: W2, transform: `rotate(${tilt2}deg)`, transformOrigin: 'top left' }}>
        <FractalPanel theme={theme} width={W2} title={L1.find((x) => x.k === hoverL1)?.label || ''} tilt={tilt2} level={2}>
          {L2.map((it) => (
            <FractalRow key={it.k} theme={theme} label={it.label} hovered={hoverL2 === it.k} onHover={() => setHoverL2(it.k)} caret level={2} />
          ))}
        </FractalPanel>
      </div>
      {/* L3 panel — tilted more, smaller again */}
      <div style={{ position: 'absolute', left: 50 + W1 + 36 + W2 + 36, top: 90 + 60 + 70, width: W3, transform: `rotate(${tilt3}deg)`, transformOrigin: 'top left' }}>
        <FractalPanel theme={theme} width={W3} title={L2.find((x) => x.k === hoverL2)?.label || ''} tilt={tilt3} level={3}>
          {L3.map((s, i) => (
            <FractalRow key={s} theme={theme} label={s} hovered={i === 0} level={3} mono />
          ))}
        </FractalPanel>
      </div>
      <Cursor x={70} y={120} theme={theme} />
      <div style={{ position: 'absolute', left: 16, bottom: 14, fontSize: 9, color: theme.textFaint, fontFamily: 'ui-monospace, monospace', letterSpacing: '0.05em' }}>experiment · fractal cascade · each level scales 0.82× and tilts</div>
    </Scene>
  );
}

function FractalPanel({ theme, width, title, level, children }) {
  const opacity = level === 1 ? 1 : level === 2 ? 0.96 : 0.92;
  return (
    <MaskReveal origin={{ x: 8, y: 8 }} radius={10}>
      <div style={{
        background: theme.surface, borderRadius: 10, boxShadow: theme.shadow,
        border: `.5px solid ${theme.border}`, overflow: 'hidden', position: 'relative',
        color: theme.text, fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        opacity,
      }}>
        <GrainBg opacity={theme.mode === 'dark' ? 0.06 : 0.04} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ padding: '6px 10px', borderBottom: `.5px solid ${theme.border}`, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: theme.accent, fontWeight: 700, fontFamily: 'ui-monospace, monospace', display: 'flex', justifyContent: 'space-between' }}>
            <span>{title}</span>
            <span style={{ color: theme.textFaint }}>L{level}</span>
          </div>
          <div style={{ padding: 4 }}>{children}</div>
        </div>
      </div>
    </MaskReveal>
  );
}

function FractalRow({ theme, icon, label, hovered, onHover, caret, level, mono }) {
  const fs = level === 1 ? 12 : level === 2 ? 11 : 10;
  const py = level === 1 ? 6 : level === 2 ? 5 : 4;
  return (
    <div onMouseEnter={onHover} style={{
      display: 'flex', alignItems: 'center', gap: 8, padding: `${py}px 8px`,
      borderRadius: 6, background: hovered ? theme.accent : 'transparent',
      color: hovered ? '#fff' : theme.text, fontSize: fs, fontWeight: 500,
      cursor: 'pointer', transition: 'all .12s',
      fontFamily: mono ? 'ui-monospace, monospace' : 'ui-sans-serif, system-ui, sans-serif',
    }}>
      {icon && <span style={{ width: fs, height: fs, opacity: hovered ? 1 : 0.75 }}>{icon}</span>}
      <span style={{ flex: 1 }}>{label}</span>
      {caret && <span style={{ opacity: hovered ? 1 : 0.5, fontSize: fs - 2 }}>›</span>}
    </div>
  );
}

Object.assign(window, {
  EmptySpaceStandard, EmptySpaceBranded, EmptySpaceRadial, EmptyRadialPill, RadialDetached,
  WidgetInline, WidgetCard, WidgetPills,
  WindowStandard, WindowTileDiagram, WindowCompact,
  NestedCascade, NestedDrill, NestedMegaPanel, NestedRadialPill, NestedConcentric, NestedFractal, NestedBubbleTree,
  TrayAudio, TrayNetwork, TrayPower,
});
