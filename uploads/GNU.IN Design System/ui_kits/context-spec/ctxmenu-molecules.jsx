// ctxmenu-molecules.jsx
// Eight composed pieces · each one combines 2-4 atoms into a recognizable
// menu fragment. Demo + tokens + per-engine snippet.

/* ════════════════════════════════════════════════════════════════════
   MOLECULE DEMOS
   ════════════════════════════════════════════════════════════════════ */

// C.M.01 — Grouped section (label + 3 rows + sep) ──────────────────
function CtxMolSection({ theme }) {
  const tx = theme || gnuTheme({ dark: false, brand: 'medium' });
  const idx = useCycle([0, 1, 2], 1500);
  const rows = [
    { i: MenuIcons.workspace, l: 'New workspace', k: ['⌘', 'N'] },
    { i: MenuIcons.tile, l: 'Tile mode', toggle: true },
    { i: MenuIcons.layout, l: 'Layout preset', caret: true },
  ];
  return (
    <CtxStageView theme={tx}>
      <div style={{
        width: 240, padding: 6, borderRadius: 12,
        background: tx.surface, border: `.5px solid ${tx.border}`,
        boxShadow: tx.shadow,
      }}>
        <div style={{
          padding: '0 12px 4px', fontSize: 9.5, fontFamily: 'ui-monospace, monospace',
          letterSpacing: '0.14em', textTransform: 'uppercase',
          color: tx.sectionLb, fontWeight: 700,
        }}>Workspace</div>
        {rows.map((r, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px',
            height: 32, borderRadius: 7, position: 'relative',
            background: idx === i ? tx.hover : 'transparent',
            color: tx.text, fontFamily: 'ui-sans-serif, system-ui, sans-serif', fontSize: 13,
          }}>
            {idx === i && <span style={{ position: 'absolute', left: 0, top: '22%', bottom: '22%', width: 2, background: tx.accent, borderRadius: 2 }} />}
            <span style={{ width: 14, height: 14, color: tx.accent, opacity: idx === i ? 1 : 0.7 }}>{r.i}</span>
            <span style={{ fontWeight: 500 }}>{r.l}</span>
            <span style={{ marginLeft: 'auto', display: 'inline-flex', gap: 3 }}>
              {r.k && r.k.map((k, j) => (
                <span key={j} style={{ minWidth: 18, height: 18, padding: '0 5px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 3, background: tx.kbdBg, border: `.5px solid ${tx.kbdBorder}`, fontFamily: 'ui-monospace, monospace', fontSize: 10, fontWeight: 600, color: tx.textDim }}>{k}</span>
              ))}
              {r.toggle && (
                <span style={{ width: 26, height: 14, borderRadius: 999, background: tx.accent, position: 'relative' }}>
                  <span style={{ position: 'absolute', top: 1, left: 13, width: 10, height: 10, borderRadius: 5, background: '#fff' }} />
                </span>
              )}
              {r.caret && <span style={{ color: idx === i ? tx.accent : tx.textDim, fontSize: 12, fontWeight: 700, transform: idx === i ? 'translateX(2px)' : 'none' }}>▸</span>}
            </span>
          </div>
        ))}
      </div>
      <Annot x={24} y={300} theme={tx}>C.07 label + 3 × (C.01 / C.02) + C.03 / C.05 / C.04 · pad 6 du shell</Annot>
    </CtxStageView>
  );
}

// C.M.02 — Branded header strip ────────────────────────────────────
function CtxMolBranded({ theme }) {
  const tx = theme || gnuTheme({ dark: false, brand: 'medium' });
  return (
    <CtxStageView theme={tx}>
      <div style={{
        width: 280, borderRadius: 12, overflow: 'hidden',
        background: tx.surface, border: `.5px solid ${tx.border}`, boxShadow: tx.shadow,
      }}>
        <div style={{
          background: tx.accent, color: '#fff', padding: '8px 12px',
          display: 'flex', alignItems: 'center', gap: 8, position: 'relative', overflow: 'hidden',
        }}>
          <SysterGlyph size={20} hover />
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '-0.01em' }}>Gnu.In-Shell</span>
            <span style={{ fontSize: 9, opacity: 0.78, letterSpacing: '0.08em', fontFamily: 'ui-monospace, monospace' }}>DESKTOP · SLOT 0</span>
          </div>
          <span style={{ flex: 1 }} />
          <span style={{
            fontSize: 9, padding: '2px 6px', borderRadius: 999,
            background: 'rgba(0,0,0,.22)', fontFamily: 'ui-monospace, monospace',
            fontWeight: 600,
          }}>v6.2</span>
          <DitherBg color="#fff" opacity={0.18} />
        </div>
        <div style={{ padding: 6, color: tx.text }}>
          {['Add widget', 'Layout preset', 'Wallpaper'].map((l, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px', height: 28, borderRadius: 6 }}>
              <span style={{ width: 12, height: 12, background: tx.accent, opacity: 0.7, borderRadius: 2 }} />
              <span style={{ fontSize: 12, fontWeight: 500 }}>{l}</span>
            </div>
          ))}
        </div>
      </div>
      <Annot x={24} y={300} theme={tx}>strip orange · mascot 20 · id mono · version chip rgba(0,0,0,.22) · dither overlay</Annot>
    </CtxStageView>
  );
}

// C.M.03 — Identity header (widget name + id pill) ─────────────────
function CtxMolIdentity({ theme }) {
  const tx = theme || gnuTheme({ dark: false, brand: 'medium' });
  return (
    <CtxStageView theme={tx}>
      <div style={{
        width: 280, borderRadius: 12, overflow: 'hidden',
        background: tx.surface, border: `.5px solid ${tx.border}`, boxShadow: tx.shadow,
      }}>
        <div style={{
          padding: '10px 12px', borderBottom: `.5px solid ${tx.border}`, position: 'relative',
          background: tx.mode === 'dark' ? 'rgba(255,106,0,.05)' : 'rgba(255,106,0,.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 6, background: tx.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `.5px solid ${tx.border}`,
            }}>
              <span style={{ width: 18, height: 18, color: tx.accent }}>{MenuIcons.widget}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '-0.01em' }}>System Stats</span>
              <span style={{ fontSize: 10, color: tx.textDim, fontFamily: 'ui-monospace, monospace' }}>140 × 90 · workspace 2</span>
            </div>
            <span style={{ marginLeft: 'auto', fontSize: 9, padding: '2px 6px', borderRadius: 3, background: tx.kbdBg, color: tx.textDim, fontFamily: 'ui-monospace, monospace', fontWeight: 600 }}>0x4A2</span>
          </div>
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 9, color: tx.textFaint, letterSpacing: '0.1em', fontWeight: 600, fontFamily: 'ui-monospace, monospace' }}>SIZE</span>
            <div style={{ flex: 1, height: 4, background: tx.kbdBg, borderRadius: 2, position: 'relative' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '40%', background: tx.accent, borderRadius: 2 }} />
              <div style={{ position: 'absolute', left: '40%', top: -3, width: 10, height: 10, borderRadius: 5, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.2)', transform: 'translateX(-5px)' }} />
            </div>
            <span style={{ fontSize: 10, color: tx.textDim, fontFamily: 'ui-monospace, monospace' }}>M</span>
          </div>
        </div>
        <div style={{ padding: 6, color: tx.text }}>
          {['Configure', 'Shape · Rounded · 8px', 'Background · Glass · 18px'].map((l, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px', height: 26, borderRadius: 6 }}>
              <span style={{ width: 12, height: 12, background: tx.accent, opacity: 0.7, borderRadius: 2 }} />
              <span style={{ fontSize: 12, fontWeight: 500 }}>{l}</span>
              <span style={{ marginLeft: 'auto', color: tx.textDim, fontSize: 11, fontWeight: 700 }}>▸</span>
            </div>
          ))}
        </div>
      </div>
      <Annot x={24} y={300} theme={tx}>icône 36 · titre 12/600 · meta mono · id pill kbdBg · slider taille intégré</Annot>
    </CtxStageView>
  );
}

// C.M.04 — Tile picker grid ────────────────────────────────────────
function CtxMolTile({ theme }) {
  const tx = theme || gnuTheme({ dark: false, brand: 'medium' });
  const tiles = [
    { k: 'tile-l',  label: 'Left ½',  area: { x: 0, y: 0, w: 50, h: 100 } },
    { k: 'tile-r',  label: 'Right ½', area: { x: 50, y: 0, w: 50, h: 100 } },
    { k: 'tile-tl', label: 'Top L',   area: { x: 0, y: 0, w: 50, h: 50 } },
    { k: 'tile-tr', label: 'Top R',   area: { x: 50, y: 0, w: 50, h: 50 } },
    { k: 'tile-bl', label: 'Bot L',   area: { x: 0, y: 50, w: 50, h: 50 } },
    { k: 'tile-br', label: 'Bot R',   area: { x: 50, y: 50, w: 50, h: 50 } },
  ];
  const hover = useCycle(tiles.map((t) => t.k), 1100);
  return (
    <CtxStageView theme={tx}>
      <div style={{ width: 280, padding: 8, borderRadius: 12, background: tx.surface, border: `.5px solid ${tx.border}`, boxShadow: tx.shadow }}>
        <div style={{ padding: '4px 4px 8px', fontSize: 9.5, fontFamily: 'ui-monospace, monospace', letterSpacing: '0.14em', textTransform: 'uppercase', color: tx.sectionLb, fontWeight: 700 }}>Tile to</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
          {tiles.map((t) => {
            const isHover = hover === t.k;
            return (
              <div key={t.k} style={{
                position: 'relative', height: 40, borderRadius: 5,
                background: isHover ? tx.accentDim : tx.kbdBg,
                border: `.5px solid ${isHover ? tx.accent : tx.border}`,
                transition: 'all .12s', overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', left: `${t.area.x}%`, top: `${t.area.y}%`,
                  width: `${t.area.w}%`, height: `${t.area.h}%`,
                  background: isHover ? tx.accent : tx.textDim, opacity: isHover ? 0.9 : 0.45,
                  borderRadius: 1, transition: 'all .12s',
                }} />
                <span style={{ position: 'absolute', bottom: 2, left: 4, fontSize: 8, color: isHover ? tx.accent : tx.textFaint, fontWeight: 600, letterSpacing: '0.05em', fontFamily: 'ui-monospace, monospace' }}>{t.label}</span>
              </div>
            );
          })}
        </div>
      </div>
      <Annot x={24} y={300} theme={tx}>grid 3×2 · cell 40h · forme remplie au centre = preview de la tuile · hover = accent</Annot>
    </CtxStageView>
  );
}

// C.M.05 — Radial wheel ────────────────────────────────────────────
function CtxMolRadial({ theme }) {
  const tx = theme || gnuTheme({ dark: false, brand: 'medium' });
  const items = [
    { k: 'add', icon: MenuIcons.add, label: 'Add' },
    { k: 'lay', icon: MenuIcons.layout, label: 'Layout' },
    { k: 'wp', icon: MenuIcons.wallpaper, label: 'Wall' },
    { k: 'term', icon: MenuIcons.terminal, label: 'Term' },
    { k: 'ws', icon: MenuIcons.workspace, label: 'Wksp' },
    { k: 'set', icon: MenuIcons.settings, label: 'Set' },
  ];
  const n = items.length;
  const hover = useCycle(items.map((i) => i.k), 900);
  const cx = 270, cy = 190, R = 90, r = 32;
  return (
    <CtxStageView theme={tx}>
      <div style={{ position: 'absolute', left: cx - R - 10, top: cy - R - 10, width: (R + 10) * 2, height: (R + 10) * 2, borderRadius: '50%', background: tx.mode === 'dark' ? 'rgba(17,20,24,.6)' : 'rgba(255,255,255,.45)', backdropFilter: 'blur(20px)', border: `.5px solid ${tx.border}`, boxShadow: tx.shadow }} />
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
          return <path key={it.k} d={path} fill={isHover ? tx.accent : (tx.mode === 'dark' ? '#1B1F24' : '#FFF')} stroke={tx.border} strokeWidth=".5" style={{ transition: 'fill .12s' }} />;
        })}
      </svg>
      {items.map((it, i) => {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2;
        const ix = cx + Math.cos(a) * (R - 22) - 10;
        const iy = cy + Math.sin(a) * (R - 22) - 10;
        const isHover = hover === it.k;
        return (
          <React.Fragment key={it.k}>
            <div style={{ position: 'absolute', left: ix, top: iy, width: 20, height: 20, color: isHover ? '#fff' : tx.text, pointerEvents: 'none' }}>{it.icon}</div>
            <div style={{ position: 'absolute', left: cx + Math.cos(a) * (R + 14) - 24, top: cy + Math.sin(a) * (R + 14) - 7, width: 48, textAlign: 'center', fontSize: 10, color: tx.textDim, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', pointerEvents: 'none', fontFamily: 'ui-monospace, monospace' }}>{it.label}</div>
          </React.Fragment>
        );
      })}
      <div style={{ position: 'absolute', left: cx - r, top: cy - r, width: r * 2, height: r * 2, borderRadius: '50%', background: tx.surface, border: `.5px solid ${tx.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,.15)' }}>
        <SysterGlyph size={28} hover />
      </div>
      <Annot x={24} y={350} theme={tx}>R outer 90 · r inner 32 · 6 slices · hub mascot · refraction lens (blur 20 sat 1.4)</Annot>
    </CtxStageView>
  );
}

// C.M.06 — Pill stack ──────────────────────────────────────────────
function CtxMolPills({ theme }) {
  const tx = theme || gnuTheme({ dark: false, brand: 'medium' });
  const items = [
    { k: 'cfg',  icon: MenuIcons.settings, label: 'Configure' },
    { k: 'mv',   icon: MenuIcons.move,     label: 'Move' },
    { k: 'rs',   icon: MenuIcons.resize,   label: 'Resize' },
    { k: 'pin',  icon: MenuIcons.pin,      label: 'Pin' },
    { k: 'dup',  icon: MenuIcons.copy,     label: 'Duplicate' },
    { k: 'rm',   icon: MenuIcons.trash,    label: 'Remove', danger: true },
  ];
  const hover = useCycle(items.map((i) => i.k), 900);
  return (
    <CtxStageView theme={tx}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map((it, i) => {
          const isHover = hover === it.k;
          return (
            <div key={it.k} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', height: 36,
              borderRadius: 18, background: isHover ? (it.danger ? '#FF5040' : tx.accent) : tx.surface,
              color: isHover ? '#fff' : (it.danger ? '#FF5040' : tx.text),
              boxShadow: isHover ? '0 4px 12px rgba(0,0,0,.18)' : '0 2px 6px rgba(0,0,0,.08)',
              border: `.5px solid ${tx.border}`, fontSize: 13, fontWeight: 500,
              transform: `translateX(${isHover ? 6 : 0}px)`, transition: 'all .14s cubic-bezier(.3,.7,.4,1)',
              transitionDelay: `${i * 8}ms`,
              fontFamily: 'ui-sans-serif, system-ui, sans-serif',
              width: 180,
            }}>
              <span style={{ width: 14, height: 14, opacity: isHover ? 1 : 0.7 }}>{it.icon}</span>
              <span>{it.label}</span>
            </div>
          );
        })}
      </div>
      <Annot x={24} y={300} theme={tx}>capsule h36 r18 · hover : translateX 6 · cible tactile ≥ 36 · stagger 8 ms par row</Annot>
    </CtxStageView>
  );
}

// C.M.07 — Bubble cluster ★ ────────────────────────────────────────
function CtxMolBubbles({ theme }) {
  const tx = theme || gnuTheme({ dark: false, brand: 'medium' });
  const items = ['Theme', 'Shape', 'Motion', 'Layout', 'Shader', 'Beret'];
  const hover = useCycle(items, 1100);
  const cx = 270, cy = 190, R = 96;
  return (
    <CtxStageView theme={tx}>
      <svg style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        {items.map((it, i) => {
          const a = (i / items.length) * Math.PI * 2 - Math.PI / 2;
          const bx = cx + Math.cos(a) * R, by = cy + Math.sin(a) * R;
          return <line key={i} x1={cx} y1={cy} x2={bx} y2={by} stroke={tx.accent} strokeWidth="1" opacity={hover === it ? 0.6 : 0.18} strokeLinecap="round" />;
        })}
      </svg>
      {items.map((it, i) => {
        const a = (i / items.length) * Math.PI * 2 - Math.PI / 2;
        const bx = cx + Math.cos(a) * R - 22, by = cy + Math.sin(a) * R - 22;
        const isHover = hover === it;
        return (
          <div key={it} style={{
            position: 'absolute', left: bx, top: by, width: 44, height: 44, borderRadius: 22,
            background: isHover ? tx.accent : tx.surface,
            color: isHover ? '#fff' : tx.text,
            border: `.5px solid ${isHover ? tx.accent : tx.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 3px 9px rgba(0,0,0,.15)',
            transform: `scale(${isHover ? 1.06 : 1})`,
            transition: 'all .18s cubic-bezier(.32,.72,.32,1)',
            fontSize: 9.5, fontWeight: 700, letterSpacing: '0.04em',
            fontFamily: 'ui-monospace, monospace',
          }}>{it.slice(0, 4).toUpperCase()}</div>
        );
      })}
      <div style={{ position: 'absolute', left: cx - 22, top: cy - 22, width: 44, height: 44, borderRadius: 22, background: tx.surface, border: `1px solid ${tx.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,.18)' }}>
        <SysterGlyph size={28} hover />
      </div>
      <div style={{ position: 'absolute', left: 24, top: 18, fontSize: 9, color: tx.accent, fontWeight: 700, letterSpacing: '0.16em', fontFamily: 'ui-monospace, monospace' }}>★ SIGNATURE · BUBBLE TREE</div>
      <Annot x={24} y={350} theme={tx}>noyau Sys.ter · 6 bulles ø 44 sur ring R 96 · fil reliant chacune au centre · pop spring elastic 36 ms stagger</Annot>
    </CtxStageView>
  );
}

// C.M.08 — Sub-cascade (root + sub) ─────────────────────────────────
function CtxMolCascade({ theme }) {
  const tx = theme || gnuTheme({ dark: false, brand: 'medium' });
  const idx = useCycle([0, 1, 2, 3], 1400);
  const rows = ['Theme', 'Preset', 'Animation', 'Shape'];
  const subs = ['Beret', 'Signal', 'Anthracite', 'Shell'];
  return (
    <CtxStageView theme={tx}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', gap: 22 }}>
        {/* Root */}
        <div style={{
          width: 168, padding: 6, borderRadius: 12,
          background: tx.surface, border: `.5px solid ${tx.border}`, boxShadow: tx.shadow,
        }}>
          <div style={{ padding: '0 12px 4px', fontSize: 9, color: tx.accent, fontWeight: 700, letterSpacing: '0.14em', fontFamily: 'ui-monospace, monospace' }}>ROOT</div>
          {rows.map((r, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', height: 28,
              borderRadius: 6, background: i === idx ? tx.hover : 'transparent',
              fontSize: 12, fontWeight: 500, color: tx.text, position: 'relative',
            }}>
              {i === idx && <span style={{ position: 'absolute', left: 0, top: '22%', bottom: '22%', width: 2, background: tx.accent, borderRadius: 2 }} />}
              <span style={{ width: 11, height: 11, background: tx.accent, opacity: 0.7, borderRadius: 2 }} />
              <span style={{ flex: 1 }}>{r}</span>
              <span style={{ color: i === idx ? tx.accent : tx.textDim, fontSize: 11, fontWeight: 700, transform: i === idx ? 'translateX(2px)' : 'none' }}>▸</span>
            </div>
          ))}
        </div>
        {/* Connector */}
        <svg style={{ position: 'absolute', left: 168, top: 24 + idx * 28, width: 22, height: 8, overflow: 'visible' }}>
          <path d="M0 4 H 22" stroke={tx.accent} strokeWidth="1" strokeDasharray="2 2" opacity="0.55" />
        </svg>
        {/* Sub */}
        <div style={{
          width: 168, padding: 6, borderRadius: 12, transform: 'translateY(8px)',
          background: tx.surface, border: `.5px solid ${tx.border}`, boxShadow: tx.shadow,
        }}>
          <div style={{ padding: '0 12px 4px', fontSize: 9, color: tx.accent, fontWeight: 700, letterSpacing: '0.14em', fontFamily: 'ui-monospace, monospace' }}>{rows[idx].toUpperCase()}</div>
          {subs.map((s, i) => {
            const swatch = [GNU.beret, GNU.signal, GNU.anthracite, GNU.shellWhite][i];
            return (
              <div key={s} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', height: 28,
                borderRadius: 6, background: i === 0 ? tx.hover : 'transparent',
                fontSize: 12, fontWeight: 500, color: tx.text, position: 'relative',
              }}>
                {i === 0 && <span style={{ position: 'absolute', left: 0, top: '22%', bottom: '22%', width: 2, background: tx.accent, borderRadius: 2 }} />}
                <span style={{ width: 12, height: 12, borderRadius: 3, background: swatch, border: `.5px solid ${tx.border}` }} />
                <span style={{ flex: 1 }}>{s}</span>
              </div>
            );
          })}
        </div>
      </div>
      <Annot x={24} y={300} theme={tx}>parent recule -2 px · sub naît côté gauche · connector pointillé accent .55α · sub-label = nom de la rangée parente</Annot>
    </CtxStageView>
  );
}

/* ════════════════════════════════════════════════════════════════════
   MOLECULE SNIPPETS
   ════════════════════════════════════════════════════════════════════ */

const MSNIP = {};

MSNIP['CM.01'] = {
  neutral: `# section group  (C.07 + 3×C.01/C.02 + variants C.03/C.04/C.05)
shell pad     6
label         9.5 mono · 0.14em · sectionLb · pad 0 12 4
rows          32 · radius 7 · gap implicite 0 (rows touchent)
mix           1 row+kbd / 1 row+toggle / 1 row+caret
règle         pas plus de 3 rows par section avant d'en ouvrir une 2e`,
  css: `.gnu-section {
  display: flex; flex-direction: column;
}
.gnu-section > .gnu-section__label { /* C.07 */ }
.gnu-section > .gnu-row { /* C.01 ou C.02 */ }`,
  qml: `// MenuSection.qml
Column {
  spacing: 0
  property string label
  Label { /* C.07 */ text: parent.label }
  Repeater {
    model: rows
    delegate: MenuRow {
      label: modelData.label; icon: modelData.icon
      kbd:   modelData.kbd       // [C.03] chip array
      toggle: modelData.toggle   // [C.05]
      hasSubmenu: modelData.sub  // [C.04] chevron
    }
  }
}`,
  qt: `class MenuSection : public QWidget {
public:
  void addRow(const RowSpec& s) {
    auto* r = new MenuRow(s, this);
    _layout->addWidget(r); _rows << r;
  }
  void setLabel(const QString& l) {
    _label->setText(l.toUpper());
  }
  // _layout = QVBoxLayout (spacing 0, margins 0)
  // _label  = section label widget (C.07)
};`,
  gpui: `// GPUI · MenuSection
#[derive(IntoElement)]
struct MenuSection { label: SharedString, rows: Vec<AnyElement> }
impl RenderOnce for MenuSection {
  fn render(self, _: &mut WindowContext) -> impl IntoElement {
    div().flex_col()
      .child(div().px(px(12.)).py(px(4.))
        .font_family("IBM Plex Mono").text_xs()
        .font_weight(FontWeight::BOLD).letter_spacing(em(0.14))
        .text_color(gpui::rgb(0xFF6A00))
        .child(self.label.to_uppercase()))
      .children(self.rows)
  }
}`,
};

MSNIP['CM.02'] = {
  neutral: `# branded header strip
context       seul pour menus "shell-identity" (empty space, sys settings)
strip h       36-40
bg            accent · color #fff
left          SysterGlyph 20px (hover/listening)
center        title (11 / 700)  + sub mono 9 / 0.08em / 0.78α
right         version chip rgba(0,0,0,.22) radius pill
overlay       DitherBg #fff α=0.18  (atomic-age texture)
règle         max 1 par menu · NE PAS empiler avec C.M.03 (identity)`,
  css: `.gnu-strip {
  background: var(--accent); color: #fff;
  padding: 8px 12px; display: flex; align-items: center; gap: 8px;
  position: relative; overflow: hidden;
}
.gnu-strip__title { font: 700 11px/1.1 ui-sans-serif; }
.gnu-strip__sub   { font: 400 9px/1.1 ui-monospace; letter-spacing: .08em; opacity: .78; }
.gnu-strip__ver   {
  margin-left: auto;
  font: 600 9px/1 ui-monospace; padding: 2px 6px;
  background: rgba(0,0,0,.22); border-radius: 999px;
}
.gnu-strip::after { /* dither overlay */
  content: ""; position: absolute; inset: 0;
  background: url("dither.svg"); opacity: .18; pointer-events: none;
}`,
  qml: `// BrandedHeader.qml
Rectangle {
  height: 36
  color: GnuTheme.accent
  RowLayout {
    anchors.fill: parent
    anchors.leftMargin: 12; anchors.rightMargin: 12
    spacing: 8
    SysterGlyph { size: 20; state: "listening" }
    ColumnLayout {
      spacing: 1
      Label { text: "Gnu.In-Shell"; color: "white"
              font.pixelSize: 11; font.weight: Font.Bold }
      Label { text: "DESKTOP · SLOT 0"; color: "white"
              opacity: 0.78; font.family: "IBM Plex Mono"
              font.pixelSize: 9; font.letterSpacing: 0.72 }
    }
    Item { Layout.fillWidth: true }
    VersionChip { text: "v6.2" }
  }
  // Dither overlay (cf. A.06 motion atom)
  Image { source: "dither.svg"; anchors.fill: parent
          opacity: 0.18; fillMode: Image.Tile }
}`,
  qt: `// see MascotRow + add version chip
auto* v = new QLabel("v6.2", this);
v->setStyleSheet("background: rgba(0,0,0,.22); color: white;"
                 "border-radius: 999px; padding: 2px 6px;"
                 "font: 600 9px 'IBM Plex Mono';");`,
  gpui: `// GPUI · BrandedHeader
#[derive(IntoElement)]
struct BrandedHeader;
impl RenderOnce for BrandedHeader {
  fn render(self, _: &mut WindowContext) -> impl IntoElement {
    div().h(px(44.)).w_full().relative()
      .bg(gpui::rgb(0x111418)).flex().items_center().px(px(12.))
      .child(div().absolute().inset_0()
        .bg(gpui::rgb(0xFF6A00)).opacity(0.08))
      .child(div().font_family("IBM Plex Mono").text_xs()
        .font_weight(FontWeight::BOLD).letter_spacing(em(0.18))
        .text_color(gpui::rgb(0xFF6A00)).child("GNU6-SHELL"))
      .child(div().ml_auto().text_xs().font_family("IBM Plex Mono")
        .text_color(gpui::rgb(0xA1A6AD)).child(">_"))
  }
}`,
};

MSNIP['CM.03'] = {
  neutral: `# identity header (widget target)
context       menu de widget · "j'agis sur QUOI"
bloc          icône 36 + nom 12/600 + meta 10 mono
id pill       coin droit · kbdBg · 0x4A2 (hex id)
slider        SIZE en-dessous · 4 px de haut · knob 10px
fond          rgba(255,106,0,.04) — bande tonale chaude
règle         obligatoire pour les menus widget (cf. R.02)`,
  css: `.gnu-identity {
  padding: 10px 12px;
  background: rgba(255,106,0,.04);
  border-bottom: .5px solid var(--border);
}
.gnu-identity__head { display: flex; align-items: center; gap: 8px; }
.gnu-identity__thumb {
  width: 36px; height: 36px; border-radius: 6px;
  background: var(--bg); border: .5px solid var(--border);
  display: grid; place-items: center;
}
.gnu-identity__name { font: 600 12px/1.1 ui-sans-serif; letter-spacing: -0.01em; }
.gnu-identity__meta { font: 400 10px/1.1 ui-monospace; color: var(--fg-dim); }
.gnu-identity__id   {
  margin-left: auto; padding: 2px 6px; border-radius: 3px;
  background: var(--kbd-bg); color: var(--fg-dim);
  font: 600 9px/1 ui-monospace;
}`,
  qml: `// IdentityHeader.qml
Rectangle {
  property var target  // { icon, name, w, h, ws, id }
  color: Qt.rgba(1, 0.42, 0, 0.04)
  height: childrenRect.height + 16
  ColumnLayout {
    anchors.fill: parent; anchors.margins: 12; spacing: 8
    RowLayout {
      spacing: 8
      WidgetThumb { width: 36; height: 36; icon: target.icon }
      ColumnLayout {
        spacing: 1
        Label { text: target.name; font.pixelSize: 12
                font.weight: Font.DemiBold }
        Label { text: target.w + " × " + target.h
                       + " · workspace " + target.ws
                color: GnuTheme.fgDim
                font.family: "IBM Plex Mono"; font.pixelSize: 10 }
      }
      Item { Layout.fillWidth: true }
      IdPill { text: target.id }
    }
    SizeSlider { value: target.size }
  }
}`,
  qt: `class IdentityHeader : public QFrame {
  /* QFrame with tinted bg; QVBoxLayout holding:
       row[ thumb 36, name+meta col, spacer, id pill ]
       SizeSlider (custom QSlider with GnuTheme accent)
  */
};`,
  gpui: `// GPUI · IdentityHeader
struct IdentityHeader { target: WidgetTarget }
impl Render for IdentityHeader {
  fn render(&mut self, _: &mut ViewContext<Self>) -> impl IntoElement {
    div().h(px(52.)).flex().items_center().gap(px(10.)).px(px(12.))
      .bg(gpui::rgb(0xF7F3ED))
      .child(div().size(px(32.)).rounded_full().bg(gpui::rgb(0xFF6A00)))
      .child(div().flex_col()
        .child(div().text_sm().font_weight(FontWeight::BOLD)
          .text_color(gpui::rgb(0x111418)).child(self.target.name()))
        .child(div().text_xs().font_family("IBM Plex Mono")
          .text_color(gpui::rgb(0x667085)).child(self.target.subtitle())))
  }
}`,
};

MSNIP['CM.04'] = {
  neutral: `# tile picker grid
grid          3 × 2 · gap 6
cell          40h · radius 5
preview       shape interne = silhouette de la tuile (50%/100%, 50%/50%, …)
hover         border + bg → accentDim · forme → accent · transition 120 ms
label         caption mono 8px coin bas-gauche
règle         remplace les sous-rangées textuelles pour les actes spatiaux`,
  css: `.gnu-tile-grid { display: grid;
  grid-template-columns: repeat(3, 1fr); gap: 6px; }
.gnu-tile {
  position: relative; height: 40px; border-radius: 5px;
  background: var(--kbd-bg); border: .5px solid var(--border);
  transition: all 120ms; overflow: hidden;
}
.gnu-tile[data-hover] {
  background: var(--accent-dim); border-color: var(--accent);
}
.gnu-tile__shape {
  position: absolute; background: var(--fg-dim); opacity: .45;
  border-radius: 1px; transition: all 120ms;
}
.gnu-tile[data-hover] .gnu-tile__shape {
  background: var(--accent); opacity: .9;
}
.gnu-tile__cap {
  position: absolute; bottom: 2px; left: 4px;
  font: 600 8px/1 ui-monospace; letter-spacing: .05em;
  color: var(--fg-faint);
}
.gnu-tile[data-hover] .gnu-tile__cap { color: var(--accent); }`,
  qml: `// TileGrid.qml
GridLayout {
  columns: 3; rowSpacing: 6; columnSpacing: 6
  Repeater {
    model: [
      { k: "L",  area: Qt.rect(0, 0, 50, 100), label: "Left ½" },
      { k: "R",  area: Qt.rect(50, 0, 50, 100), label: "Right ½" },
      { k: "TL", area: Qt.rect(0, 0, 50, 50),  label: "Top L" },
      // …
    ]
    delegate: TileCell {
      area: modelData.area
      label: modelData.label
      onClicked: shell.tileFocused(modelData.k)
    }
  }
}`,
  qt: `class TileCell : public QPushButton {
public:
  TileCell(QRect area, const QString& label, QWidget* p=nullptr)
    : QPushButton(p), _area(area), _label(label) {
    setFixedHeight(40); setCheckable(true);
  }
protected:
  void paintEvent(QPaintEvent*) override {
    QPainter g(this); g.setRenderHint(QPainter::Antialiasing);
    // 1. cell bg + rounded rect
    g.setBrush(_hover ? GnuTheme::accentDim : GnuTheme::kbdBg);
    g.setPen(QPen(_hover ? GnuTheme::accent : GnuTheme::border, .5));
    g.drawRoundedRect(rect(), 5, 5);
    // 2. inner shape (the tile preview)
    QRect r = rect().adjusted(2,2,-2,-2);
    QRect inner(r.x() + r.width()  * _area.x() / 100,
                r.y() + r.height() * _area.y() / 100,
                r.width()  * _area.width()  / 100,
                r.height() * _area.height() / 100);
    g.fillRect(inner, _hover ? GnuTheme::accent : GnuTheme::fgDim);
    // 3. caption
    g.setFont(QFont("IBM Plex Mono", 8, QFont::DemiBold));
    g.drawText(inner.adjusted(2, 0, 0, -2),
               Qt::AlignBottom | Qt::AlignLeft, _label);
  }
};`,
  gpui: `// GPUI · TileGrid
struct TileGrid { tiles: Vec<Tile>, on_pick: Arc<dyn Fn(usize)> }
impl Render for TileGrid {
  fn render(&mut self, cx: &mut ViewContext<Self>) -> impl IntoElement {
    div().grid().grid_cols(3).gap(px(8.)).p(px(12.))
      .children(self.tiles.iter().enumerate().map(|(i, tile)| {
        let cb = self.on_pick.clone();
        div().aspect_ratio(1.).rounded(px(8.))
          .bg(gpui::rgb(0xF7F3ED)).flex().items_center().justify_center()
          .on_click(move |_, cx| cb(i))
          .child(div().text_sm().child(tile.label.clone()))
      }))
  }
}`,
};

MSNIP['CM.05'] = {
  neutral: `# radial wheel  (touch-first)
slices        6 · angle = 2π/n
inner r       32 · outer r 90
slice path    annular sector  (M A L A Z)
hover         fill = accent · transition 120 ms
hub           cercle 64 · SysterGlyph 28 · au-dessus
labels        coordonnées polaires sur ring R+14 · mono 10
lens          backdrop-filter blur 20 sat 1.4  derrière le wheel
density       touch only — cible angulaire ≥ 50 px de chord`,
  css: `/* SVG-driven, see QML for the canonical implementation */
.gnu-radial { position: relative; width: 200px; height: 200px; }
.gnu-radial__lens {
  position: absolute; inset: -10px; border-radius: 50%;
  background: rgba(255,255,255,.45);
  backdrop-filter: blur(20px) saturate(1.4);
  border: .5px solid var(--border);
}
.gnu-radial__slice { transition: fill 120ms; cursor: pointer; }
.gnu-radial__slice[data-hover] { fill: var(--accent); }
.gnu-radial__hub {
  position: absolute; left: 50%; top: 50%;
  width: 64px; height: 64px; border-radius: 50%;
  transform: translate(-50%, -50%);
  background: var(--surface); border: .5px solid var(--border);
  display: grid; place-items: center;
}`,
  qml: `// RadialWheel.qml
Item {
  id: wheel; width: 200; height: 200
  property var items: []
  property int hoverIndex: -1

  Rectangle {  // lens
    anchors.centerIn: parent
    width: parent.width + 20; height: parent.height + 20
    radius: width / 2
    color: Qt.rgba(1,1,1, 0.45)
    layer.enabled: true
    layer.effect: GaussianBlur { radius: 20; samples: 33 }
  }

  Canvas {
    anchors.fill: parent
    onPaint: {
      const c = getContext("2d");
      const cx = width/2, cy = height/2, R = 90, r = 32;
      const n = items.length;
      for (let i = 0; i < n; ++i) {
        const a0 = i/n * Math.PI*2 - Math.PI/2 - Math.PI/n;
        const a1 = a0 + Math.PI*2/n;
        c.beginPath();
        c.arc(cx, cy, R, a0, a1);
        c.arc(cx, cy, r, a1, a0, true);
        c.closePath();
        c.fillStyle = (i === hoverIndex)
          ? GnuTheme.accent : GnuTheme.surface;
        c.fill();
        c.lineWidth = 0.5; c.strokeStyle = GnuTheme.border;
        c.stroke();
      }
    }
  }

  // hub with mascot at center
  Rectangle {
    anchors.centerIn: parent
    width: 64; height: 64; radius: 32
    color: GnuTheme.surface
    border.width: 0.5; border.color: GnuTheme.border
    SysterGlyph { anchors.centerIn: parent; size: 28; state: "listening" }
  }
}`,
  qt: `void RadialWheel::paintEvent(QPaintEvent*) {
  QPainter g(this); g.setRenderHint(QPainter::Antialiasing);
  const QPointF c(width()/2., height()/2.);
  const double R = 90, r = 32;
  const int n = _items.size();
  for (int i = 0; i < n; ++i) {
    double a0 = i*2*M_PI/n - M_PI/2 - M_PI/n;
    double a1 = a0 + 2*M_PI/n;
    QPainterPath p;
    p.moveTo(c + QPointF(cos(a0)*r, sin(a0)*r));
    p.lineTo(c + QPointF(cos(a0)*R, sin(a0)*R));
    p.arcTo(QRectF(c.x()-R, c.y()-R, R*2, R*2),
            -a0*180/M_PI, -(a1-a0)*180/M_PI);
    p.lineTo(c + QPointF(cos(a1)*r, sin(a1)*r));
    p.arcTo(QRectF(c.x()-r, c.y()-r, r*2, r*2),
            -a1*180/M_PI,  (a1-a0)*180/M_PI);
    p.closeSubpath();
    g.fillPath(p, i==_hoverIdx ? GnuTheme::accent : GnuTheme::surface);
  }
}`,
  gpui: `// GPUI · RadialWheel (custom canvas)
struct RadialWheel { items: Vec<RadialItem>, hover_idx: Option<usize> }
impl Render for RadialWheel {
  fn render(&mut self, _: &mut ViewContext<Self>) -> impl IntoElement {
    let (items, hover) = (self.items.clone(), self.hover_idx);
    canvas(|_, _| {}, move |bounds, cx| {
      let c = bounds.center(); let r = px(52.);
      for (i, item) in items.iter().enumerate() {
        let a = (i as f32 / items.len() as f32) * TAU;
        let col = if hover == Some(i) { gpui::rgb(0xFF6A00) } else { gpui::rgb(0x2B3037) };
        cx.paint_quad(Quad {
          bounds: Bounds::centered_at(point(c.x + px(a.cos())*r, c.y + px(a.sin())*r),
            size(px(32.), px(32.))),
          background: col, corner_radii: Corners::all(px(8.)), ..Default::default() });
      }
    }).size_full()
  }
}`,
};

MSNIP['CM.06'] = {
  neutral: `# pill stack  (touch)
capsule       h 36 · radius 18 · gap 6
contenu       icône 14 + label 13/500
shadow rest   0/2/6/.08
shadow hover  0/4/12/.18
hover         translateX +6 · bg = accent · fg = #fff
stagger       8 ms par row (entrée seulement)
danger        bg → #FF5040 quand hover · jamais au repos
règle         remplace la liste classique sur tactile — uniquement`,
  css: `.gnu-pill-row {
  height: 36px; padding: 0 14px;
  display: flex; align-items: center; gap: 10px;
  background: var(--surface); color: var(--fg1);
  border-radius: 18px; border: .5px solid var(--border);
  box-shadow: 0 2px 6px rgba(0,0,0,.08);
  transition: all 140ms cubic-bezier(.3,.7,.4,1);
  font: 500 13px/1 ui-sans-serif;
  width: 180px;
}
.gnu-pill-row:hover {
  background: var(--accent); color: #fff;
  transform: translateX(6px);
  box-shadow: 0 4px 12px rgba(0,0,0,.18);
}
.gnu-pill-row--danger:hover { background: #FF5040; }
.gnu-pill-stack > * { transition-delay: calc(var(--i, 0) * 8ms); }`,
  qml: `// PillRow.qml
Rectangle {
  id: pill
  property string label
  property url    icon
  property bool   danger: false
  property bool   hovered: false
  property int    indexInStack: 0
  width: 180; height: 36; radius: 18
  border.width: 0.5; border.color: GnuTheme.border
  color: hovered
    ? (danger ? "#FF5040" : GnuTheme.accent)
    : GnuTheme.surface
  transform: Translate {
    x: pill.hovered ? 6 : 0
    Behavior on x { NumberAnimation {
      duration: 140; easing.type: Easing.OutCubic
    } }
  }
  Behavior on color { ColorAnimation { duration: 140 } }
  // ...icon + label ...
}`,
  qt: `class PillRow : public QWidget {
public:
  PillRow(const QIcon& i, const QString& l, bool danger,
          QWidget* p=nullptr) : QWidget(p), _i(i), _l(l), _d(danger) {
    setFixedSize(180, 36);
    _anim = new QPropertyAnimation(this, "_tx", this);
    _anim->setDuration(140);
    _anim->setEasingCurve(QEasingCurve::OutCubic);
  }
  // hover events animate _tx 0 ↔ 6, paintEvent reads it
};`,
  gpui: `// GPUI · PillRow
struct PillRow { icon: SharedString, label: SharedString, danger: bool, hover: bool }
impl Render for PillRow {
  fn render(&mut self, cx: &mut ViewContext<Self>) -> impl IntoElement {
    let bg = if self.hover {
      gpui::rgb(if self.danger { 0xE63A1F } else { 0x1A1F26 })
    } else { transparent_black() };
    div().h(px(36.)).px(px(12.)).flex().items_center().gap(px(8.))
      .rounded(px(6.)).bg(bg)
      .on_mouse_over(cx.listener(|this, _, cx| { this.hover = true; cx.notify(); }))
      .on_mouse_leave(cx.listener(|this, _, cx| { this.hover = false; cx.notify(); }))
      .child(div().text_sm().text_color(gpui::rgb(0xFF6A00)).child(self.icon.clone()))
      .child(div().text_sm().text_color(gpui::rgb(0xF7F3ED)).child(self.label.clone()))
  }
}`,
};

MSNIP['CM.07'] = {
  neutral: `# bubble cluster  ★ SIGNATURE
contexte      nested cascade · signature visuelle Gnu.In
nœud central  SysterGlyph 28 dans disque ø 44 · border 1px accent
satellites    6 ø 44 sur ring R = 96
connecteurs   ligne 1px accent · α .18 rest · α .6 hover
hover         scale 1.06 · bg → accent · fg → #fff · transition 180 ms cubic
entrée        molécule M.12 motion-spec (spring elastic · 36 ms stagger)
règle         seul archétype où l'absence de panneau est revendiquée`,
  css: `.gnu-bubble {
  position: absolute; width: 44px; height: 44px;
  border-radius: 22px; display: grid; place-items: center;
  background: var(--surface); color: var(--fg1);
  border: .5px solid var(--border);
  box-shadow: 0 3px 9px rgba(0,0,0,.15);
  transition: all 180ms cubic-bezier(.32,.72,.32,1);
  font: 700 9.5px/1 ui-monospace; letter-spacing: .04em;
}
.gnu-bubble[data-hover] {
  background: var(--accent); color: #fff;
  border-color: var(--accent); transform: scale(1.06);
}
.gnu-bubble__hub {
  border: 1px solid var(--accent); border-width: 1px;
}
.gnu-bubble-link { stroke: var(--accent); stroke-width: 1;
  opacity: .18; transition: opacity 180ms; }
.gnu-bubble-link[data-active] { opacity: .6; }`,
  qml: `// BubbleCluster.qml — uses Canvas for connectors,
// individual Items for bubbles (so each can spring independently).
Item {
  id: cluster
  property var nodes: []
  property int hoverIdx: -1
  Canvas {  // connectors
    anchors.fill: parent
    onPaint: {
      const c = getContext("2d");
      c.clearRect(0,0,width,height);
      const cx = width/2, cy = height/2, R = 96;
      for (let i = 0; i < nodes.length; ++i) {
        const a = i/nodes.length * Math.PI*2 - Math.PI/2;
        c.beginPath();
        c.moveTo(cx, cy);
        c.lineTo(cx + Math.cos(a)*R, cy + Math.sin(a)*R);
        c.strokeStyle = GnuTheme.accent;
        c.globalAlpha = i === hoverIdx ? 0.6 : 0.18;
        c.lineWidth = 1; c.stroke();
      }
    }
  }
  Repeater {
    model: nodes
    delegate: BubbleNode {
      index: index; node: modelData
      Component.onCompleted: spring.start()
      SpringAnimation on scale { /* M.12 entry */ }
    }
  }
  BubbleHub { anchors.centerIn: parent }  // mascot core
}`,
  qt: `class BubbleCluster : public QWidget {
  /* QGraphicsScene-style hand-rolled :
     - paintEvent draws lines (connectors)
     - each BubbleNode is a child QWidget at polar (R, θ_i)
     - hover events propagate via mouseMoveEvent + hit-test
     - QPropertyAnimation drives each bubble's scale independently
  */
};`,
  gpui: `// GPUI · BubbleCluster (animated via cx.animate)
struct BubbleCluster { radii: Vec<f32> }
impl Render for BubbleCluster {
  fn render(&mut self, _: &mut ViewContext<Self>) -> impl IntoElement {
    let n = self.radii.len();
    div().size_full().relative()
      .children((0..n).map(|i| {
        let a = (i as f32 / n as f32) * TAU;
        let r = self.radii[i];
        div().absolute()
          .left(px(160. + a.cos()*52. - 16.))
          .top(px(160. + a.sin()*52. - 16.))
          .size(px(32.)).rounded_full()
          .bg(gpui::rgb(0xFF6A00)).opacity(r)
      }))
  }
}
// open: stagger i*60ms → animate radii[i] 0→1, bezier(.34,1.56,.64,1)`,
};

MSNIP['CM.08'] = {
  neutral: `# sub-cascade  (root → sub)
spawn         clic-droit sur la rangée parent (caret ▸)
parent        recule translateX −2 px  (motion M.05)
child         naît côté gauche · clip-path circle from (0, 12px)
connecteur    pointillé 1px accent · alpha .55 · 2 px gap entre menus
sub-label     reproduit la rangée parente en uppercase mono
fermeture     M.06 — sub mask⁻¹ · parent revient à 0 quand sub fini
keyboard      ←/→ pour drill in/out · Escape = ferme tout`,
  css: `.gnu-cascade { position: relative; display: flex; gap: 22px; }
.gnu-cascade__sub {
  transform: translateY(8px);
  clip-path: circle(140% at 0 14px);
  animation: gnu-sub-open 280ms cubic-bezier(.16,1,.30,1);
}
@keyframes gnu-sub-open {
  from { clip-path: circle(0 at 0 14px); opacity: 0; }
  to   { clip-path: circle(140% at 0 14px); opacity: 1; }
}
.gnu-cascade__parent[data-sub-open] {
  transform: translateX(-2px);
  transition: transform 140ms cubic-bezier(.2,.7,.2,1);
}`,
  qml: `// SubCascade.qml
Item {
  id: cas
  property var parentRow  // hovered row in root
  Row {
    spacing: 22
    MenuShell {
      id: rootMenu
      transform: Translate {
        x: cas.subOpen ? -2 : 0
        Behavior on x { NumberAnimation { duration: 140 } }
      }
      // ... rows ...
    }
    MenuShell {
      id: subMenu
      visible: cas.subOpen
      opacity: cas.subOpen ? 1 : 0
      Behavior on opacity { NumberAnimation { duration: 280 } }
      // clip-path animated via layer.effect (cf. A.04)
    }
  }
  Component.onCompleted: subMenu.y = rootMenu.hoveredRowY
}`,
  qt: `class SubCascade : public QWidget {
public:
  void openSubFor(MenuRow* parent) {
    _parent->animate("x", 0, -2, 140);
    _sub->setPos(_parent->geometry().right() + 22,
                 _parent->mapTo(this, parent->pos()).y());
    _sub->showWithMaskReveal();  // clip-path animation
  }
};`,
  gpui: `// GPUI · SubCascade
struct SubCascade { sub_open: bool, reveal_t: f32 }
impl Render for SubCascade {
  fn render(&mut self, _: &mut ViewContext<Self>) -> impl IntoElement {
    div().flex().relative()
      .child(div().w(px(220.)).flex_col()
        .bg(gpui::rgb(0x1A1F26)).rounded(px(10.)).shadow(menu_shadow()))
      .when(self.sub_open, |el| el
        .child(div().absolute().left(px(224.)).top(px(0.))
          .w(px(200.)).flex_col().bg(gpui::rgb(0x1A1F26))
          .rounded(px(10.)).shadow(menu_shadow())
          .opacity(self.reveal_t)
          .transform(Transform::translation(
            px(-8.*(1.-self.reveal_t)), px(0.)))))
  }
}`,
};

/* ════════════════════════════════════════════════════════════════════
   MOLECULE REGISTRY
   ════════════════════════════════════════════════════════════════════ */

const CTX_MOLECULES = [
  { id: 'CM.01', title: 'Section · grouped rows',
    sub: 'Label + 3 rangées + variantes kbd/toggle/caret. La brique standard de toute liste de menu.',
    demo: CtxMolSection,  snip: MSNIP['CM.01'], atoms: ['C.07', 'C.01', 'C.02', 'C.03', 'C.05', 'C.04', 'C.08'],
    tokens: [['shell pad','6'],['label','C.07'],['rows','C.01/C.02 · 32 h'],['max rows','3 avant 2e section'],['sep','C.08 entre sections']] },

  { id: 'CM.02', title: 'Branded header strip',
    sub: 'Bande orange + Sys.ter + version chip + overlay dither. Pour menus shell-identity uniquement.',
    demo: CtxMolBranded,  snip: MSNIP['CM.02'], atoms: ['C.12', 'C.10', 'C.06 (dither)'],
    tokens: [['strip h','36-40'],['bg','accent'],['mascot','SysterGlyph 20'],['version chip','rgba(0,0,0,.22) pill'],['overlay','dither 0.18α']] },

  { id: 'CM.03', title: 'Identity header',
    sub: 'Icône cible + nom + id + slider taille. Obligatoire pour menus widget (R.02).',
    demo: CtxMolIdentity, snip: MSNIP['CM.03'], atoms: ['C.10 (id pill)', 'C.01 (rows en-dessous)', 'C.11'],
    tokens: [['icon','36 · radius 6'],['name','12 · 600'],['meta','10 mono · dim'],['id pill','kbdBg · 9 mono'],['size slider','4 h · knob 10']] },

  { id: 'CM.04', title: 'Tile picker grid',
    sub: 'Sélecteur visuel 3×2 — chaque cellule montre la silhouette de la tuile. Remplace les rangées textuelles pour les actes spatiaux.',
    demo: CtxMolTile,     snip: MSNIP['CM.04'], atoms: ['C.07', 'C.06 (cell)'],
    tokens: [['grid','3 × 2 · gap 6'],['cell h','40 · radius 5'],['shape','silhouette interne 50/100%'],['hover','bg accentDim · forme accent'],['caption','8 mono · coin BG']] },

  { id: 'CM.05', title: 'Radial wheel',
    sub: '6 slices + hub mascotte + refraction lens. Touch-first — cible angulaire ≥ 50 px de chord.',
    demo: CtxMolRadial,   snip: MSNIP['CM.05'], atoms: ['C.09 (lens)', 'mascotte', 'C.10 (labels)'],
    tokens: [['slices','6'],['R outer','90'],['r inner','32'],['hub','64 · SysterGlyph 28'],['lens','backdrop-filter blur 20 sat 1.4']] },

  { id: 'CM.06', title: 'Pill stack',
    sub: 'Capsules tactiles staggerées, hover = translateX +6 + bg accent. Touch only.',
    demo: CtxMolPills,    snip: MSNIP['CM.06'], atoms: ['C.01 (en pill)', 'C.04 (chevron implicite)'],
    tokens: [['capsule','36 h · 18 r'],['gap','6 px'],['hover','translateX +6 · bg accent'],['stagger','8 ms / row'],['danger','#FF5040 au hover seulement']] },

  { id: 'CM.07', title: 'Bubble cluster ★',
    sub: 'Signature Gnu.In — hub Sys.ter + 6 bulles satellites reliées par des fils. Spring elastic.',
    demo: CtxMolBubbles,  snip: MSNIP['CM.07'], atoms: ['C.09 (bubbles)', 'mascotte (hub)'],
    tokens: [['nœud central','ø 44 · border 1 accent'],['satellites','6 × ø 44 · ring R 96'],['fils','1px accent · α .18 / .6'],['hover','scale 1.06 · bg accent'],['entrée','M.12 spring elastic']] },

  { id: 'CM.08', title: 'Sub-cascade',
    sub: 'Root → sub avec connector pointillé. Le parent recule -2 px, le sub naît côté gauche par mask circle.',
    demo: CtxMolCascade,  snip: MSNIP['CM.08'], atoms: ['C.09', 'C.04 (caret parent)', 'C.10 (sub label)'],
    tokens: [['gap','22 px entre menus'],['parent shift','-2 px (motion M.05)'],['sub mask','circle(0→140%) at 0 14px'],['connector','1px accent · .55α dashed'],['close','M.06 mask⁻¹']] },
];

Object.assign(window, { CTX_MOLECULES, MSNIP });
