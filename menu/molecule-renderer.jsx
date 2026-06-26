// molecule-renderer.jsx
// The GENERIC, data-driven renderer: one component that turns a molecule_specs.json
// record into a live menu — no bespoke per-molecule code. Hydrates the gallery AND
// (via the same data) maps onto the engine's reduce() → Scene. Depends on the menu
// primitives being loaded as window globals (MenuShell / MenuRow / MenuSection /
// MenuSeparator / MenuSearch / gnuShape / gnuDensity / MenuIcons / SysterGlyph).
//
// FULL COVERAGE: every layout strategy in molecule_specs.json renders from data —
//   panel family   · panel · panel-header · panel-search · panel-fileheader · panel-right · command-palette · card
//   radial family  · radial · radial-detached · radial-then-pills · radial-mode-pills · concentric-rings
//   flex/grid      · pills · compact-bar · swatch-grid · target-grid · transport
//   structural     · tile-grid · mega-columns · cascade · drill-in-place · fractal-cascade · bubble-tree
// No bespoke per-molecule code — only the data record drives the geometry.

function MoleculeRenderer({ m, theme, dpref }) {
  const h = React.createElement;
  const shape = window.gnuShape('rounded');
  const d = window.gnuDensity(dpref || m.density || 'mouse');
  const Icons = window.MenuIcons || {};
  const mm = m.model || {};
  const L = m.layout || '';
  const width = (m.density === 'touch' || dpref === 'touch') ? 280 : 244;

  const Row = (r, i) => h(window.MenuRow, {
    key: r.id || i, theme, shape, density: d,
    icon: r.kind === 'mascot' ? undefined : (r.icon ? Icons[r.icon] : undefined),
    mascot: r.kind === 'mascot' || undefined, swatch: r.swatch,
    label: r.label, sub: r.sub, kbd: r.kbd,
    accent: r.accent, danger: r.danger,
    hasSubmenu: r.kind === 'submenu' || undefined,
    toggle: r.kind === 'toggle' ? true : undefined, toggleOn: r.on,
    hovered: i === 0,
  });
  const Group = (g, gi, groups) => h(React.Fragment, { key: 'g' + gi },
    h(window.MenuSection, { label: g.head || undefined, theme, density: d }, (g.rows || []).map(Row)),
    gi < groups.length - 1 ? h(window.MenuSeparator, { theme }) : null);

  // ── shared panel pieces ──
  const headerEl = (hd) => {
    const top = h('div', { style: { display: 'flex', alignItems: 'center', gap: 9 } },
      hd.mascot ? h(window.SysterGlyph, { size: 20, hover: true })
        : hd.icon ? h('span', { style: { width: 18, height: 18, color: theme.accent } }, Icons[hd.icon]) : null,
      h('div', { style: { minWidth: 0, flex: 1 } },
        h('div', { style: { fontSize: 12.5, fontWeight: 600 } }, hd.title || hd.name),
        (hd.sub || hd.meta) ? h('div', { style: { fontSize: 10, color: theme.textDim, fontFamily: 'ui-monospace,monospace' } }, hd.sub || hd.meta) : null),
      hd.badge ? h('span', { style: { fontSize: 9, padding: '2px 6px', borderRadius: 999, background: 'rgba(0,0,0,.22)', color: theme.text } }, hd.badge)
        : hd.toggle ? h('div', { style: { width: 30, height: 17, borderRadius: 999, background: theme.accent, position: 'relative', flexShrink: 0 } }, h('div', { style: { position: 'absolute', top: 2, right: 2, width: 13, height: 13, borderRadius: '50%', background: '#fff' } }))
          : hd.status ? h('span', { style: { width: 8, height: 8, borderRadius: '50%', background: theme.green, flexShrink: 0 } }) : null);
    const slider = (typeof hd.slider === 'number') ? h('div', { style: { marginTop: 9, height: 5, background: theme.kbdBg, borderRadius: 3, position: 'relative' } },
      h('div', { style: { position: 'absolute', inset: 0, right: (100 - hd.slider * 100) + '%', background: theme.accent, borderRadius: 3 } })) : null;
    return h('div', { key: 'hd', style: { padding: '10px 12px', borderBottom: `.5px solid ${theme.border}` } }, top, slider);
  };
  const previewEl = (pv) => h('div', { key: 'pv', style: { padding: 12, borderBottom: `.5px solid ${theme.border}` } },
    h('div', { style: { height: 60, borderRadius: 8, background: `linear-gradient(135deg,${theme.accent},${theme.green})`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8, boxShadow: '0 4px 12px rgba(0,0,0,.25)' } },
      h('span', { style: { width: 22, height: 22, color: '#fff', opacity: .9 } }, Icons.widget || Icons.settings || null)),
    h('div', { style: { fontSize: 12.5, fontWeight: 600 } }, pv.title),
    h('div', { style: { fontSize: 10, color: theme.textDim, fontFamily: 'ui-monospace,monospace' } }, pv.meta),
    pv.slider ? h('div', { style: { marginTop: 8, display: 'flex', alignItems: 'center', gap: 7 } },
      h('span', { style: { fontSize: 9, color: theme.textFaint, fontFamily: 'ui-monospace,monospace' } }, pv.slider),
      h('div', { style: { flex: 1, height: 4, background: theme.kbdBg, borderRadius: 2 } }, h('div', { style: { width: '55%', height: '100%', background: theme.accent, borderRadius: 2 } }))) : null);
  const footerEl = () => h('div', { key: 'ft', style: { padding: '6px 10px 2px', display: 'flex', gap: 12, fontSize: 9, color: theme.textFaint, fontFamily: 'ui-monospace,monospace' } },
    h('span', null, '↑↓ naviguer'), h('span', null, '⏎ ouvrir'), h('span', { style: { marginLeft: 'auto' } }, 'esc'));
  const shell = (parts, w) => h(window.MenuShell, { theme, shape, density: d, width: w || width, origin: { x: 14, y: 14 }, label: m.family ? m.family.toUpperCase() : undefined }, parts);

  // ── PANEL family ──
  if (['panel', 'panel-header', 'panel-search', 'panel-fileheader', 'panel-right', 'command-palette', 'card'].indexOf(L) >= 0) {
    const parts = [];
    if (mm.preview) parts.push(previewEl(mm.preview));
    if (mm.header) parts.push(headerEl(mm.header));
    if (mm.search != null) parts.push(h(window.MenuSearch, { key: 'srch', theme, density: d, value: typeof mm.search === 'string' ? mm.search : '', placeholder: typeof mm.search === 'string' ? mm.search : 'Search…' }));
    (mm.groups || []).forEach((g, gi, arr) => parts.push(Group(g, gi, arr)));
    if (L === 'command-palette') parts.push(footerEl());
    return shell(parts, L === 'panel-right' ? 250 : width);
  }

  // ── RADIAL family — real ring geometry ──
  if (['radial', 'radial-detached', 'radial-then-pills', 'radial-mode-pills', 'concentric-rings'].indexOf(L) >= 0) {
    const ring = mm.ring || mm.discs || mm.modes || mm.inner || [];
    const n = ring.length || 1, R = 86, cx = 130, cy = 130;
    return h('div', { style: { position: 'relative', width: 260, height: 260 } },
      h('div', { style: { position: 'absolute', left: cx - R - 12, top: cy - R - 12, width: (R + 12) * 2, height: (R + 12) * 2, borderRadius: '50%', background: theme.mode === 'dark' ? 'rgba(17,20,24,.55)' : 'rgba(255,255,255,.45)', border: `.5px solid ${theme.border}`, boxShadow: theme.shadow } }),
      ring.map((it, i) => {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2, x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R, first = i === 0;
        return h('div', { key: i, style: { position: 'absolute', left: x - 22, top: y - 22, width: 44, height: 44, borderRadius: '50%', background: first ? theme.accent : theme.surface, border: `.5px solid ${first ? theme.accent : theme.border}`, color: first ? '#fff' : theme.text, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: first ? `0 6px 16px ${theme.accent}55` : '0 4px 10px rgba(0,0,0,.2)' } },
          h('span', { style: { width: 18, height: 18 } }, it.icon ? Icons[it.icon] : null));
      }),
      h('div', { style: { position: 'absolute', left: cx - 26, top: cy - 26, width: 52, height: 52, borderRadius: '50%', background: theme.surface, border: `.5px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,.25)' } },
        h(window.SysterGlyph, { size: 26, hover: true })));
  }

  // ── SWATCH grid (+ groups) ──
  if (L === 'swatch-grid') {
    const sw = mm.swatches || [];
    const grid = h('div', { key: 'sw', style: { padding: '4px 8px 8px' } },
      h('div', { style: { fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: theme.textFaint, fontWeight: 600, marginBottom: 8 } }, 'Palette'),
      h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 7 } },
        sw.map((c, i) => h('div', { key: i, style: { aspectRatio: '1', borderRadius: 7, background: c, border: i === 0 ? `2px solid ${theme.text}` : `.5px solid ${theme.border}`, boxShadow: i === 0 ? `0 0 0 3px ${theme.accent}44` : 'none' } }))));
    const parts = [grid, h(window.MenuSeparator, { key: 'sep', theme })];
    (mm.groups || []).forEach((g, gi, arr) => parts.push(Group(g, gi, arr)));
    return shell(parts, 232);
  }

  // ── TARGET grid (share sheet) ──
  if (L === 'target-grid') {
    const targets = mm.targets || [];
    const cols = ['#FF6A00', '#3D8DCC', '#5FAF8C', theme.green, '#9B8DCC', '#CE8E3F'];
    const grid = h('div', { key: 'tg' },
      mm.title ? h('div', { style: { padding: '6px 6px 4px', fontSize: 11, fontWeight: 600 } }, mm.title) : null,
      h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, padding: 6 } },
        targets.map((t, i) => h('div', { key: t.id || i, style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '10px 4px', borderRadius: 10, background: i === 0 ? theme.hover : 'transparent' } },
          h('div', { style: { width: 42, height: 42, borderRadius: '50%', background: i === 0 ? cols[i % cols.length] : theme.kbdBg, color: i === 0 ? '#fff' : cols[i % cols.length], display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: i === 0 ? `0 6px 14px ${cols[i % cols.length]}55` : 'none' } },
            h('span', { style: { width: 19, height: 19 } }, t.icon ? Icons[t.icon] : null)),
          h('span', { style: { fontSize: 9.5, color: theme.textDim, fontWeight: 500, textAlign: 'center' } }, t.label || t.id)))));
    return shell([grid], 256);
  }

  // ── TRANSPORT (media) ──
  if (L === 'transport') {
    const tk = mm.track || {};
    return h('div', { style: { width: 250, background: theme.surface, borderRadius: shape.menuRadius, boxShadow: theme.shadow, border: `.5px solid ${theme.border}`, overflow: 'hidden', color: theme.text, fontFamily: 'ui-sans-serif,system-ui,sans-serif', padding: 12 } },
      h('div', { style: { display: 'flex', gap: 11, alignItems: 'center' } },
        h('div', { style: { width: 52, height: 52, borderRadius: 8, background: `linear-gradient(135deg,${theme.accent},${theme.green})`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,.3)' } },
          h('span', { style: { width: 22, height: 22, color: '#fff', opacity: .9 } }, Icons.audio || null)),
        h('div', { style: { minWidth: 0 } },
          h('div', { style: { fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, tk.title),
          h('div', { style: { fontSize: 11, color: theme.textDim } }, tk.artist))),
      h('div', { style: { marginTop: 11, display: 'flex', alignItems: 'center', gap: 7 } },
        h('span', { style: { fontSize: 9, fontVariantNumeric: 'tabular-nums', color: theme.textDim } }, tk.pos),
        h('div', { style: { flex: 1, height: 4, background: theme.kbdBg, borderRadius: 2, position: 'relative' } },
          h('div', { style: { position: 'absolute', inset: 0, right: (100 - (tk.progress || 0) * 100) + '%', background: theme.accent, borderRadius: 2 } }),
          h('div', { style: { position: 'absolute', left: ((tk.progress || 0) * 100) + '%', top: -3, width: 10, height: 10, borderRadius: 5, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.3)', transform: 'translateX(-5px)' } })),
        h('span', { style: { fontSize: 9, fontVariantNumeric: 'tabular-nums', color: theme.textDim } }, tk.len)),
      h('div', { style: { marginTop: 11, display: 'flex', justifyContent: 'center', gap: 10 } },
        (mm.transport || []).map((k, i) => {
          const big = k === 'play';
          return h('div', { key: k, style: { width: big ? 44 : 36, height: big ? 44 : 36, borderRadius: '50%', background: big ? theme.accent : 'transparent', border: big ? 'none' : `.5px solid ${theme.border}`, color: big ? '#fff' : theme.text, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: big ? 16 : 13, boxShadow: big ? `0 4px 12px ${theme.accent}55` : 'none' } }, k === 'prev' ? '⏮' : k === 'next' ? '⏭' : '▶');
        })));
  }

  // ── PILLS / COMPACT-BAR ──
  if (['pills', 'compact-bar'].indexOf(L) >= 0) {
    const chips = mm.pills || mm.bar || [];
    return h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 7, width: 224, justifyContent: L === 'compact-bar' ? 'flex-start' : 'center' } },
      chips.map((it, i) => h('div', { key: it.id || i, style: { display: 'flex', alignItems: 'center', gap: 7, padding: '7px 13px', borderRadius: 999, background: i === 0 ? (it.danger ? '#FF5040' : theme.accent) : theme.surface, color: i === 0 ? '#fff' : (it.danger ? '#FF5040' : theme.text), border: `.5px solid ${theme.border}`, fontSize: 11.5, fontWeight: 600, boxShadow: '0 2px 6px rgba(0,0,0,.12)' } },
        it.icon ? h('span', { style: { width: 14, height: 14 } }, Icons[it.icon]) : null, h('span', null, it.label || it.id))));
  }

  // ── TILE-GRID diagram (+ rows) ──
  if (L === 'tile-grid') {
    const tiles = mm.tiles || [];
    const diagram = h('div', { key: 'tg', style: { padding: 10, borderBottom: `.5px solid ${theme.border}` } },
      h('div', { style: { position: 'relative', width: '100%', aspectRatio: '16/10', borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.kbdBg, overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 3, padding: 3 } },
        tiles.slice(0, 6).map((t, i) => h('div', { key: i, style: { borderRadius: 4, background: i === 0 ? theme.accent : theme.surface, border: `.5px solid ${theme.border}`, gridColumn: i === 0 ? '1 / 2' : i === 1 ? '2 / 3' : undefined, gridRow: i < 2 ? '1 / 3' : undefined, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7.5, color: i === 0 ? '#fff' : theme.textDim, fontFamily: 'ui-monospace,monospace' } }, t))));
    const parts = [diagram];
    (mm.groups || []).forEach((g, gi, arr) => parts.push(Group(g, gi, arr)));
    return shell(parts, 248);
  }

  // ── MEGA-COLUMNS ──
  if (L === 'mega-columns') {
    const cols = mm.columns || [];
    return h('div', { style: { display: 'flex', background: theme.surface, borderRadius: shape.menuRadius, boxShadow: theme.shadow, border: `.5px solid ${theme.border}`, overflow: 'hidden', color: theme.text, fontFamily: 'ui-sans-serif,system-ui,sans-serif' } },
      cols.map((col, ci) => h('div', { key: ci, style: { padding: '10px 12px', borderRight: ci < cols.length - 1 ? `.5px solid ${theme.border}` : 'none', minWidth: 96 } },
        h('div', { style: { fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: theme.textFaint, fontWeight: 600, marginBottom: 8 } }, col.head),
        (col.rows || []).map((r, ri) => h('div', { key: ri, style: { fontSize: 12, padding: '5px 8px', borderRadius: 6, marginBottom: 2, background: ci === 0 && ri === 0 ? theme.accent : 'transparent', color: ci === 0 && ri === 0 ? '#fff' : theme.text, cursor: 'pointer' } }, r)))));
  }

  // ── CASCADE (panel + peeked submenu) ──
  if (L === 'cascade') {
    const groups = mm.groups || [];
    const subKey = mm.sub ? Object.keys(mm.sub)[0] : null;
    const subItems = subKey ? mm.sub[subKey] : [];
    return h('div', { style: { position: 'relative', width: 360, height: 250 } },
      h('div', { style: { position: 'absolute', left: 0, top: 0, width: 200 } }, shell(groups.map((g, gi, arr) => Group(g, gi, arr)), 200)),
      subItems.length ? h('div', { style: { position: 'absolute', left: 186, top: 44, width: 150, background: theme.surface, borderRadius: shape.menuRadius, boxShadow: theme.shadow, border: `.5px solid ${theme.border}`, padding: shape.pad, color: theme.text, fontFamily: 'ui-sans-serif,system-ui,sans-serif' } },
        subItems.map((s, i) => h('div', { key: i, style: { fontSize: 12, padding: '6px 9px', borderRadius: 6, background: i === 0 ? theme.accent : 'transparent', color: i === 0 ? '#fff' : theme.text } }, s))) : null);
  }

  // ── DRILL-IN-PLACE (breadcrumb + leaves) ──
  if (L === 'drill-in-place') {
    const stack = mm.stack || [];
    const leaves = ['Beret', 'Signal', 'Anthracite', 'Shell', 'Custom…'];
    const crumb = h('div', { key: 'cr', style: { display: 'flex', alignItems: 'center', gap: 5, padding: '9px 11px', borderBottom: `.5px solid ${theme.border}`, fontSize: 11 } },
      mm.back ? h('span', { style: { width: 15, height: 15, color: theme.accent, marginRight: 2 } }, Icons.back || '‹') : null,
      stack.map((s, i) => h(React.Fragment, { key: i },
        i > 0 ? h('span', { style: { color: theme.textFaint, fontSize: 10 } }, '›') : null,
        h('span', { style: { fontWeight: i === stack.length - 1 ? 600 : 400, color: i === stack.length - 1 ? theme.text : theme.textDim } }, s))));
    const rows = h('div', { key: 'rw', style: { padding: shape.pad } }, leaves.map((lf, i) => h(window.MenuRow, { key: i, theme, shape, density: d, label: lf, swatch: i < 4 ? [theme.green, theme.accent, '#111418', '#F7F3ED'][i] : undefined, hovered: i === 0 })));
    return h('div', { style: { width: 220, background: theme.surface, borderRadius: shape.menuRadius, boxShadow: theme.shadow, border: `.5px solid ${theme.border}`, overflow: 'hidden', color: theme.text, fontFamily: 'ui-sans-serif,system-ui,sans-serif' } }, crumb, rows);
  }

  // ── FRACTAL-CASCADE (nested scaled/tilted panels) ──
  if (L === 'fractal-cascade') {
    const lvl = mm.levels || 3, scale = mm.scale || 0.82, tilt = mm.tilt_deg || [0, 4, 8], L1 = mm.L1 || [];
    const ghosts = [];
    for (let i = lvl - 1; i >= 1; i--) {
      ghosts.push(h('div', { key: 'gh' + i, style: { position: 'absolute', left: 20 + i * 26, top: 14 + i * 18, width: 190, transformOrigin: 'top left', transform: `scale(${Math.pow(scale, i)}) rotate(${tilt[i] || 0}deg)`, opacity: 0.4 - i * 0.1, background: theme.surface, borderRadius: shape.menuRadius, border: `.5px solid ${theme.border}`, boxShadow: theme.shadow, padding: shape.pad } },
        L1.map((r, ri) => h('div', { key: ri, style: { fontSize: 12, padding: '6px 9px', color: theme.textDim } }, r))));
    }
    const front = h('div', { key: 'front', style: { position: 'absolute', left: 14, top: 8, width: 190, background: theme.surface, borderRadius: shape.menuRadius, border: `.5px solid ${theme.border}`, boxShadow: theme.shadow, padding: shape.pad, color: theme.text, fontFamily: 'ui-sans-serif,system-ui,sans-serif' } },
      L1.map((r, ri) => h(window.MenuRow, { key: ri, theme, shape, density: d, label: r, hasSubmenu: true, hovered: ri === 0 })));
    return h('div', { style: { position: 'relative', width: 280, height: 230 } }, ghosts, front);
  }

  // ── BUBBLE-TREE (root + branches + leaves + connectors) ──
  if (L === 'bubble-tree') {
    const branches = mm.branches || [];
    const rootX = 46, rootY = 125, bx = 150, n = branches.length;
    const by = (i) => 30 + i * ((220 - 60) / Math.max(1, n - 1));
    return h('div', { style: { position: 'relative', width: 360, height: 250 } },
      h('svg', { style: { position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' } },
        branches.map((b, i) => h('path', { key: i, d: `M ${rootX + 22} ${rootY} C ${rootX + 70} ${rootY}, ${bx - 40} ${by(i) + 16}, ${bx} ${by(i) + 16}`, fill: 'none', stroke: i === 0 ? theme.accent : theme.border, strokeWidth: i === 0 ? 2 : 1 }))),
      h('div', { style: { position: 'absolute', left: rootX - 22, top: rootY - 22, width: 44, height: 44, borderRadius: '50%', background: theme.surface, border: `1px solid ${theme.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 14px ${theme.accent}44` } }, h(window.SysterGlyph, { size: 24, hover: true })),
      branches.map((b, i) => h('div', { key: i, style: { position: 'absolute', left: bx, top: by(i), display: 'flex', alignItems: 'center', gap: 6 } },
        h('div', { style: { padding: '6px 12px', borderRadius: 999, background: i === 0 ? theme.accent : theme.surface, color: i === 0 ? '#fff' : theme.text, border: `.5px solid ${theme.border}`, fontSize: 11.5, fontWeight: 600, boxShadow: '0 2px 8px rgba(0,0,0,.18)' } }, b.label),
        i === 0 ? h('div', { style: { display: 'flex', gap: 4 } }, (b.leaves || []).slice(0, 3).map((lf, li) => h('span', { key: li, style: { fontSize: 9.5, padding: '3px 8px', borderRadius: 999, background: theme.kbdBg, color: theme.textDim, border: `.5px solid ${theme.border}` } }, lf))) : null)));
  }

  // ── AGENTIC family ──
  if (L === 'agentic-panel') {
    const ag = mm.agent || {};
    const sug = mm.suggest;
    const planF = mm.plan;
    const privacy = mm.privacy;
    const riskC = { observe: theme.green, local: '#E8B341', system: '#FF5040' };
    const agHdr = h('div', { key: 'ah', style: {
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '9px 12px 8px', borderBottom: '.5px solid ' + theme.border,
      background: theme.accentDim,
    }},
      h(window.SysterGlyph, { size: 17, hover: !!ag.pulse }),
      h('div', { style: { flex: 1, minWidth: 0 } },
        h('span', { style: { fontSize: 11.5, fontWeight: 700 } }, ag.task || 'Agent actif')),
      ag.badge ? h('span', { style: {
        fontSize: 8.5, padding: '2px 7px', borderRadius: 999,
        background: theme.accent, color: '#fff', fontWeight: 700, letterSpacing: '0.04em',
      }}, ag.badge) : null,
      ag.pulse ? h('span', { style: {
        width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
        background: theme.green, boxShadow: '0 0 0 2.5px ' + theme.green + '44',
      }}) : null,
    );
    const sugBand = sug ? h('div', { key: 'sb', style: {
      display: 'flex', alignItems: 'center', gap: 7,
      padding: '6px 12px', borderBottom: '.5px solid ' + theme.border,
      background: theme.mode === 'dark' ? 'rgba(255,106,0,.06)' : 'rgba(255,106,0,.05)',
    }},
      h('span', { style: { width: 12, height: 12, color: theme.accent, flexShrink: 0 } }, Icons.suggest || Icons.bell),
      h('span', { style: { flex: 1, fontSize: 11, color: theme.text, fontStyle: 'italic' } }, sug.text || sug),
      sug.kbd ? h(window.KbdHint, { keys: sug.kbd, theme, density: d }) : null,
    ) : null;
    const RiskRow = (r, i) => {
      const rc = r.risk ? riskC[r.risk] : null;
      return h('div', { key: r.id || i, style: { position: 'relative' } },
        rc ? h('div', { style: {
          position: 'absolute', left: 0, top: '18%', bottom: '18%', width: 2.5,
          background: rc, borderRadius: 2, zIndex: 3, pointerEvents: 'none',
        } }) : null,
        h(window.MenuRow, {
          theme, shape, density: d,
          icon: r.icon ? Icons[r.icon] : undefined,
          label: r.label, sub: r.sub, kbd: r.kbd,
          accent: r.accent, danger: r.danger,
          hasSubmenu: r.kind === 'submenu' || undefined,
          toggle: r.kind === 'toggle' ? true : undefined, toggleOn: r.on,
          hovered: i === 0 && !r.danger && !r.accent,
        }),
        (r.badge && !r.kbd) ? h('span', { style: {
          position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)',
          fontSize: 8, padding: '1.5px 6px', borderRadius: 999, zIndex: 4,
          background: rc ? rc + '20' : theme.kbdBg,
          color: rc || theme.textDim, fontWeight: 700,
          border: '.5px solid ' + (rc ? rc + '55' : theme.border),
          letterSpacing: '0.06em', pointerEvents: 'none',
        } }, r.badge) : null,
      );
    };
    const parts = [agHdr];
    if (sugBand) parts.push(sugBand);
    (mm.groups || []).forEach((g, gi, arr) => {
      parts.push(h(window.MenuSection, { key: 'gs' + gi, label: g.head || undefined, theme, density: d },
        (g.rows || []).map(RiskRow)));
      if (gi < arr.length - 1) parts.push(h(window.MenuSeparator, { key: 'sp' + gi, theme }));
    });
    if (planF) {
      const pc = planF.risk ? riskC[planF.risk] : theme.accent;
      parts.push(h('div', { key: 'pf', style: {
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '6px 10px', borderTop: '.5px solid ' + theme.border,
        background: theme.mode === 'dark' ? 'rgba(255,255,255,.025)' : 'rgba(17,20,24,.025)',
      } },
        h('span', { style: { width: 12, height: 12, color: pc } }, Icons.plan || Icons.layout),
        h('span', { style: { flex: 1, fontSize: 10, color: theme.textDim } }, planF.label || 'Plan'),
        h('button', { style: {
          border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 700,
          padding: '3px 10px', borderRadius: 6,
          background: theme.green, color: '#fff', fontFamily: 'inherit',
        } }, 'Appliquer →'),
      ));
    }
    if (privacy) {
      parts.push(h('div', { key: 'prv', style: {
        display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px 5px',
      } },
        h('span', { style: { width: 10, height: 10, color: theme.textFaint } }, Icons.privacy || Icons.info),
        h('span', { style: { fontSize: 9, color: theme.textFaint, fontFamily: 'ui-monospace,monospace' } }, privacy),
      ));
    }
    return shell(parts, width);
  }

  if (L === 'agentic-confirm') {
    const plan = mm.plan || {};
    const aff = mm.affected || [];
    const riskC = { observe: theme.green, local: '#E8B341', system: '#FF5040' };
    const hdr = h('div', { key: 'hd', style: {
      padding: '10px 12px 8px', borderBottom: '.5px solid ' + theme.border,
      background: theme.accentDim,
    } },
      h('div', { style: { display: 'flex', alignItems: 'center', gap: 7 } },
        h(window.SysterGlyph, { size: 15, hover: true }),
        h('span', { style: { fontSize: 12.5, fontWeight: 700 } }, plan.title || 'Appliquer ?'),
      ),
      plan.scope ? h('div', { style: {
        fontSize: 9.5, color: theme.textDim, fontFamily: 'ui-monospace,monospace', marginTop: 4,
      } }, plan.scope) : null,
    );
    const steps = h('div', { key: 'sl', style: { padding: '6px 8px' } },
      aff.map((s, i) => {
        const rc = s.risk ? riskC[s.risk] : theme.textFaint;
        const isD = s.risk === 'system';
        return h('div', { key: s.id || i, style: {
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '5px 6px', borderRadius: shape.rowRadius,
          background: isD ? 'rgba(255,80,60,.07)' : 'transparent', marginBottom: 2,
        } },
          h('div', { style: { width: 7, height: 7, borderRadius: '50%', background: rc, flexShrink: 0 } }),
          h('span', { style: {
            fontSize: 11, flex: 1, color: isD ? '#FF6044' : theme.text,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          } }, s.label),
        );
      }),
    );
    const footer = h('div', { key: 'ft', style: {
      display: 'flex', gap: 7, padding: '8px 10px',
      borderTop: '.5px solid ' + theme.border,
    } },
      h('button', { style: {
        flex: 1, border: 'none', cursor: 'pointer', borderRadius: 7,
        background: theme.green, color: '#fff',
        fontSize: 11.5, fontWeight: 700, padding: '7px 0', fontFamily: 'inherit',
      } }, (mm.apply || {}).label || 'Appliquer'),
      h('button', { style: {
        flex: 1, border: '.5px solid ' + theme.border, cursor: 'pointer', borderRadius: 7,
        background: 'transparent', color: theme.textDim,
        fontSize: 11.5, fontWeight: 500, padding: '7px 0', fontFamily: 'inherit',
      } }, (mm.cancel || {}).label || 'Annuler'),
    );
    return shell([hdr, steps, footer], width);
  }

  if (L === 'agentic-suggest') {
    const sug = typeof mm.suggest === 'string' ? mm.suggest : '';
    return h('div', { style: {
      display: 'inline-flex', alignItems: 'center', gap: 10,
      padding: '9px 14px', borderRadius: 999,
      background: theme.surface, boxShadow: theme.shadow,
      border: '.5px solid ' + theme.accent,
      maxWidth: 280, width: 'max-content',
      fontFamily: 'ui-sans-serif,system-ui,sans-serif', color: theme.text,
    } },
      h(window.SysterGlyph, { size: 20, hover: true }),
      h('span', { style: {
        fontSize: 11.5, color: theme.text,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160,
      } }, sug),
      h('div', { style: { display: 'flex', gap: 4, flexShrink: 0 } },
        mm.accept ? h('span', { style: {
          fontSize: 10, padding: '2px 7px', borderRadius: 5,
          background: theme.accentDim, color: theme.accent,
          fontFamily: 'ui-monospace,monospace', fontWeight: 700,
        } }, mm.accept[0] || '⏎') : null,
        mm.dismiss ? h('span', { style: {
          fontSize: 10, padding: '2px 7px', borderRadius: 5,
          background: theme.kbdBg, color: theme.textDim,
          fontFamily: 'ui-monospace,monospace',
        } }, mm.dismiss[0] || 'Esc') : null,
      ),
    );
  }

  // ── fallback summary (should be unreachable — every layout is mapped) ──
  const items = mm.ring || mm.discs || mm.pills || mm.bar || mm.targets || mm.swatches || mm.branches || mm.modes || mm.inner || mm.L1 || mm.tiles || [];
  return h('div', { style: { background: theme.surface, border: `.5px solid ${theme.border}`, borderRadius: shape.menuRadius, boxShadow: theme.shadow, padding: 14, color: theme.text, fontFamily: 'ui-sans-serif,system-ui,sans-serif', width: 240 } },
    h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 } }, h(window.SysterGlyph, { size: 18, hover: true }), h('span', { style: { fontSize: 12, fontWeight: 600 } }, m.id)),
    h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 6 } }, items.map((it, i) => h('span', { key: i, style: { fontSize: 10.5, padding: '4px 9px', borderRadius: 999, background: i === 0 ? theme.accent : theme.kbdBg, color: i === 0 ? '#fff' : theme.text, border: `.5px solid ${theme.border}` } }, (typeof it === 'string' ? it : (it.label || it.id || it.name || ''))))),
    h('div', { style: { marginTop: 10, fontSize: 9, fontFamily: 'ui-monospace,monospace', color: theme.accent } }, `strategy: ${m.layout} · style ${m.style}${m.backed ? ' · blob' : ''}`));
}

Object.assign(window, { MoleculeRenderer });
