// ctxmenu-anatomy.jsx
// Two extra boards :
//   ∞.A · Anatomy diagram     — un menu complet avec rappels d'atomes
//   ∞.B · States gallery       — le même row dans tous ses états

/* ════════════════════════════════════════════════════════════════════
   Anatomy diagram
   ════════════════════════════════════════════════════════════════════ */

function CtxAnatomy() {
  const tx = gnuTheme({ dark: false, brand: 'medium' });
  // Layout : menu silhouette at center, annotation labels around it with
  // dashed callout lines pointing at the exact element.
  const labels = [
    { id: 'C.09', txt: 'MenuShell · radius 12 · shadow 3-tier',  side: 'L', y: 70,  ax: 470, ay: 80,  bx: 380, by: 110 },
    { id: 'C.10', txt: 'StatusPill · "WIDGET"',                  side: 'L', y: 110, ax: 470, ay: 120, bx: 392, by: 132 },
    { id: 'CM.03', txt: 'Identity header · icône + nom + id',    side: 'L', y: 150, ax: 470, ay: 160, bx: 392, by: 168 },
    { id: 'C.14', txt: 'Slider · size 4 h · knob 12',            side: 'L', y: 200, ax: 470, ay: 210, bx: 392, by: 220 },
    { id: 'C.07', txt: 'Section label · 9.5 mono · 0.14em',      side: 'L', y: 250, ax: 470, ay: 260, bx: 392, by: 268 },
    { id: 'C.01', txt: 'Row base · h 32',                        side: 'R', y: 80,  ax: 710, ay: 100, bx: 800, by: 110 },
    { id: 'C.02', txt: 'Row hover · tick 2 px accent',           side: 'R', y: 120, ax: 710, ay: 132, bx: 800, by: 142 },
    { id: 'C.04', txt: 'Submenu caret · ▸',                      side: 'R', y: 160, ax: 740, ay: 164, bx: 800, by: 172 },
    { id: 'C.05', txt: 'Toggle pill · 26 × 14',                  side: 'R', y: 200, ax: 740, ay: 196, bx: 800, by: 204 },
    { id: 'C.03', txt: 'Kbd chip · 18×18 · mono 10',             side: 'R', y: 240, ax: 740, ay: 228, bx: 800, by: 236 },
    { id: 'C.08', txt: 'Separator · 1 px · indent 8',            side: 'R', y: 280, ax: 740, ay: 252, bx: 800, by: 262 },
    { id: 'C.11', txt: 'Sub-label · 10.5 mono dim',              side: 'L', y: 330, ax: 470, ay: 360, bx: 392, by: 348 },
    { id: 'C.18', txt: 'Footer · meta · raccourcis',             side: 'L', y: 410, ax: 470, ay: 460, bx: 392, by: 458 },
  ];

  return (
    <FitScale w={1280} h={720} background="#FBFAF6">
      <div style={{ width: 1280, height: 720, background: '#FBFAF6', color: '#111418', padding: 52, boxSizing: 'border-box', fontFamily: 'ui-sans-serif, system-ui, sans-serif', position: 'relative' }}>
        <div style={{ fontSize: 10, color: '#FF6A00', fontWeight: 700, letterSpacing: '0.18em', fontFamily: 'ui-monospace, monospace' }}>ANATOMIE · 18 ATOMES IN-SITU</div>
        <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em', marginTop: 6 }}>Un menu, lu pièce par pièce.</div>
        <div style={{ fontSize: 13, color: 'rgba(17,20,24,.6)', marginTop: 4, maxWidth: 740, lineHeight: 1.5 }}>
          La carte de référence : chaque rappel d'atome pointe l'élément correspondant dans un menu widget canonique. À garder ouvert à côté de l'IDE.
        </div>

        <div style={{ marginTop: 28, position: 'relative', width: '100%', height: 500 }}>
          {/* SVG callout layer */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} viewBox="0 0 1176 500">
            {labels.map((l, i) => (
              <g key={i}>
                <path d={`M ${l.ax} ${l.ay} L ${l.bx} ${l.by}`} stroke="#FF6A00" strokeWidth="0.6" strokeDasharray="2 3" opacity="0.7" fill="none" />
                <circle cx={l.bx} cy={l.by} r="2.2" fill="#FF6A00" />
                <circle cx={l.ax} cy={l.ay} r="1.4" fill="#FF6A00" />
              </g>
            ))}
          </svg>

          {/* Left labels */}
          <div style={{ position: 'absolute', left: 0, top: 0, width: 460, display: 'flex', flexDirection: 'column' }}>
            {labels.filter((l) => l.side === 'L').map((l, i) => (
              <div key={i} style={{
                position: 'absolute', top: l.y - 12, right: 14,
                fontFamily: 'ui-monospace, monospace', fontSize: 11, color: 'rgba(17,20,24,.8)',
                display: 'flex', alignItems: 'baseline', gap: 8, justifyContent: 'flex-end',
              }}>
                <span style={{ color: '#FF6A00', fontWeight: 700 }}>{l.id}</span>
                <span style={{ color: 'rgba(17,20,24,.7)', fontFamily: 'ui-sans-serif, system-ui, sans-serif', fontSize: 11.5 }}>{l.txt}</span>
              </div>
            ))}
          </div>

          {/* Menu silhouette in the center */}
          <div style={{
            position: 'absolute', left: 380, top: 70, width: 410, padding: 0,
            background: tx.surface, borderRadius: 12,
            border: `.5px solid ${tx.border}`,
            boxShadow: '0 24px 64px -8px rgba(17,20,24,.18), 0 8px 24px -4px rgba(17,20,24,.1), 0 0 0 .5px rgba(17,20,24,.06)',
            overflow: 'hidden',
            fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          }}>
            {/* Status pill */}
            <div style={{ padding: '10px 12px 0' }}>
              <span style={{ padding: '3px 8px', fontSize: 9, fontFamily: 'ui-monospace, monospace', fontWeight: 700, letterSpacing: '0.14em', borderRadius: 3, background: tx.accent, color: '#fff' }}>WIDGET</span>
            </div>
            {/* Identity header */}
            <div style={{ padding: '8px 12px 12px', borderBottom: `.5px solid ${tx.border}`, marginTop: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 6, background: tx.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `.5px solid ${tx.border}` }}>
                  <span style={{ width: 18, height: 18, color: tx.accent }}>{MenuIcons.widget}</span>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>System Stats</div>
                  <div style={{ fontSize: 10.5, color: tx.textDim, fontFamily: 'ui-monospace, monospace' }}>140 × 90 · workspace 2</div>
                </div>
                <span style={{ marginLeft: 'auto', fontSize: 9, padding: '2px 6px', borderRadius: 3, background: tx.kbdBg, color: tx.textDim, fontFamily: 'ui-monospace, monospace', fontWeight: 600 }}>0x4A2</span>
              </div>
              {/* slider */}
              <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 9, color: tx.textFaint, fontFamily: 'ui-monospace, monospace', fontWeight: 700, letterSpacing: '0.14em' }}>SIZE</span>
                <div style={{ flex: 1, height: 4, background: tx.kbdBg, borderRadius: 2, position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '42%', background: tx.accent, borderRadius: 2 }} />
                  <div style={{ position: 'absolute', left: '42%', top: -4, width: 12, height: 12, borderRadius: 6, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.2)', transform: 'translateX(-6px)', border: `.5px solid ${tx.border}` }} />
                </div>
                <span style={{ fontSize: 10, color: tx.textDim, fontFamily: 'ui-monospace, monospace' }}>M</span>
              </div>
            </div>
            {/* Section + rows */}
            <div style={{ padding: 6 }}>
              <div style={{ padding: '0 12px 4px', fontSize: 9.5, fontFamily: 'ui-monospace, monospace', letterSpacing: '0.14em', textTransform: 'uppercase', color: tx.sectionLb, fontWeight: 700 }}>Configure</div>

              {/* C.01 row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px', height: 32, borderRadius: 7, fontSize: 13, color: tx.text }}>
                <span style={{ width: 14, height: 14, color: tx.accent, opacity: 0.75 }}>{MenuIcons.settings}</span>
                <span style={{ fontWeight: 500 }}>Configure</span>
                <span style={{ marginLeft: 'auto', display: 'inline-flex', gap: 3 }}>
                  <span style={{ minWidth: 18, height: 18, padding: '0 5px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 3, background: tx.kbdBg, border: `.5px solid ${tx.kbdBorder}`, fontFamily: 'ui-monospace, monospace', fontSize: 10, fontWeight: 600, color: tx.textDim }}>⏎</span>
                </span>
              </div>

              {/* C.02 row hover */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px', height: 32, borderRadius: 7, fontSize: 13, color: tx.text, background: tx.hover, position: 'relative' }}>
                <span style={{ position: 'absolute', left: 0, top: '22%', bottom: '22%', width: 2, background: tx.accent, borderRadius: 2 }} />
                <span style={{ width: 14, height: 14, color: tx.accent }}>{MenuIcons.shape}</span>
                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
                  <span style={{ fontWeight: 500 }}>Shape</span>
                  <span style={{ fontSize: 10.5, color: tx.textDim, fontFamily: 'ui-monospace, monospace' }}>Rounded · 8 px</span>
                </div>
                <span style={{ marginLeft: 'auto', color: tx.accent, fontSize: 12, fontWeight: 700, transform: 'translateX(2px)' }}>▸</span>
              </div>

              {/* C.05 toggle row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px', height: 32, borderRadius: 7, fontSize: 13, color: tx.text }}>
                <span style={{ width: 14, height: 14, color: tx.accent, opacity: 0.75 }}>{MenuIcons.pin}</span>
                <span style={{ fontWeight: 500 }}>Pin everywhere</span>
                <span style={{ marginLeft: 'auto', width: 26, height: 14, borderRadius: 999, background: tx.accent, position: 'relative' }}>
                  <span style={{ position: 'absolute', top: 1, left: 13, width: 10, height: 10, borderRadius: 5, background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,.18)' }} />
                </span>
              </div>

              {/* sep */}
              <div style={{ height: 1, background: tx.border, margin: '4px 8px' }} />

              {/* danger row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px', height: 32, borderRadius: 7, fontSize: 13, color: '#D9442C' }}>
                <span style={{ width: 14, height: 14, color: '#D9442C', opacity: 0.85 }}>{MenuIcons.trash}</span>
                <span style={{ fontWeight: 500 }}>Remove</span>
                <span style={{ marginLeft: 'auto', display: 'inline-flex', gap: 3 }}>
                  <span style={{ minWidth: 18, height: 18, padding: '0 5px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 3, background: tx.kbdBg, border: `.5px solid ${tx.kbdBorder}`, fontFamily: 'ui-monospace, monospace', fontSize: 10, fontWeight: 600, color: tx.textDim }}>⌫</span>
                </span>
              </div>
            </div>
            {/* Footer */}
            <div style={{ padding: '6px 12px', background: 'rgba(17,20,24,.03)', borderTop: `.5px solid ${tx.border}`, fontSize: 9.5, color: tx.textFaint, fontFamily: 'ui-monospace, monospace', display: 'flex', gap: 10 }}>
              <span>id 0x4A2</span>
              <span style={{ opacity: 0.5 }}>·</span>
              <span>↑↓ nav · ⏎ pick · ⎋ close</span>
              <span style={{ marginLeft: 'auto', color: tx.accent }}>v6.2</span>
            </div>
          </div>

          {/* Right labels */}
          <div style={{ position: 'absolute', right: 0, top: 0, width: 320, display: 'flex', flexDirection: 'column' }}>
            {labels.filter((l) => l.side === 'R').map((l, i) => (
              <div key={i} style={{
                position: 'absolute', top: l.y - 12, left: 14,
                fontFamily: 'ui-monospace, monospace', fontSize: 11, color: 'rgba(17,20,24,.8)',
                display: 'flex', alignItems: 'baseline', gap: 8,
              }}>
                <span style={{ color: '#FF6A00', fontWeight: 700 }}>{l.id}</span>
                <span style={{ color: 'rgba(17,20,24,.7)', fontFamily: 'ui-sans-serif, system-ui, sans-serif', fontSize: 11.5 }}>{l.txt}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 'auto', position: 'absolute', bottom: 28, left: 52, right: 52, fontSize: 10.5, color: 'rgba(17,20,24,.5)', fontFamily: 'ui-monospace, monospace', letterSpacing: '0.04em' }}>
          18 atomes lisibles à plat · les molécules CM.01 · CM.03 · CM.11 sont visibles dans leur composition
        </div>
      </div>
    </FitScale>
  );
}

/* ════════════════════════════════════════════════════════════════════
   States gallery
   ════════════════════════════════════════════════════════════════════ */

function CtxStatesGallery() {
  const tx = gnuTheme({ dark: false, brand: 'medium' });
  const states = [
    { k: 'rest',    label: 'Rest',    desc: 'idle · cursor outside · pas d\'attention' },
    { k: 'hover',   label: 'Hover',   desc: 'cursor over · tick + bg + icon α 1' },
    { k: 'press',   label: 'Press',   desc: 'mouse-down · scale 0.96 (M.04)' },
    { k: 'focus',   label: 'Focus',   desc: 'keyboard · ring 1px accent + halo .26' },
    { k: 'disabled',label: 'Disabled',desc: 'inactive · α 0.40 · pas de hover' },
    { k: 'danger',  label: 'Danger',  desc: 'destructeur · couleur #D9442C' },
    { k: 'submenu', label: 'Sub-open',desc: 'caret + bg actifs même hors hover' },
    { k: 'selected',label: 'Selected',desc: 'aria-checked · radio/check actif' },
  ];

  const Row = ({ state }) => {
    let bg = 'transparent', tick = false, knobShown = false, ring = false, alpha = 1, color = tx.text, caret = '▸', caretColor = tx.textDim;
    if (state === 'hover')   { bg = tx.hover; tick = true; }
    if (state === 'press')   { bg = tx.hover; tick = true; }
    if (state === 'focus')   { bg = 'rgba(255,106,0,.06)'; ring = true; }
    if (state === 'disabled'){ alpha = 0.4; }
    if (state === 'danger')  { color = '#D9442C'; }
    if (state === 'submenu') { bg = tx.hover; tick = true; caretColor = tx.accent; }
    if (state === 'selected'){ bg = tx.hover; tick = true; }
    return (
      <div style={{
        position: 'relative', display: 'flex', alignItems: 'center', gap: 10,
        padding: '0 12px', height: 32, borderRadius: 7, background: bg,
        fontFamily: 'ui-sans-serif, system-ui, sans-serif', fontSize: 13, color,
        opacity: alpha, transform: state === 'press' ? 'scale(0.97)' : 'none',
        outline: ring ? `1px solid ${tx.accent}` : 'none',
        outlineOffset: ring ? '1px' : 0,
        boxShadow: ring ? `0 0 0 4px rgba(255,106,0,.18)` : 'none',
        width: 220,
      }}>
        {tick && <span style={{ position: 'absolute', left: 0, top: '22%', bottom: '22%', width: 2, background: tx.accent, borderRadius: 2 }} />}
        <span style={{ width: 14, height: 14, color: state === 'danger' ? '#D9442C' : tx.accent, opacity: state === 'rest' || state === 'disabled' ? 0.7 : 1 }}>{MenuIcons.tile}</span>
        <span style={{ fontWeight: 500 }}>Tile mode</span>
        {state === 'selected' ? (
          <span style={{ marginLeft: 'auto', width: 26, height: 14, borderRadius: 999, background: tx.accent, position: 'relative' }}>
            <span style={{ position: 'absolute', top: 1, left: 13, width: 10, height: 10, borderRadius: 5, background: '#fff' }} />
          </span>
        ) : (
          <span style={{ marginLeft: 'auto', color: caretColor, fontSize: 12, fontWeight: 700, transform: state === 'submenu' ? 'translateX(2px)' : 'none' }}>{caret}</span>
        )}
      </div>
    );
  };

  return (
    <FitScale w={1280} h={720} background="#FBFAF6">
      <div style={{ width: 1280, height: 720, background: '#FBFAF6', color: '#111418', padding: 52, boxSizing: 'border-box', fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>
        <div style={{ fontSize: 10, color: '#FF6A00', fontWeight: 700, letterSpacing: '0.18em', fontFamily: 'ui-monospace, monospace' }}>STATES · UN ROW · 8 ÉTATS</div>
        <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em', marginTop: 6 }}>La même rangée, lue dans tous ses temps.</div>
        <div style={{ fontSize: 13, color: 'rgba(17,20,24,.6)', marginTop: 4, maxWidth: 760, lineHeight: 1.5 }}>
          Le même C.01 « Tile mode » présenté dans tous ses états canoniques. Chaque carte donne aussi le mapping CSS / Qt :state.
        </div>

        <div style={{ marginTop: 36, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18 }}>
          {states.map((st) => (
            <div key={st.k} style={{
              background: '#FFFFFF', borderRadius: 10, padding: 18,
              border: '.5px solid rgba(17,20,24,.08)',
              boxShadow: '0 1px 3px rgba(17,20,24,.04)',
              display: 'flex', flexDirection: 'column', gap: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{st.label}</span>
                <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, background: '#111418', color: '#FF6A00', fontFamily: 'ui-monospace, monospace', fontWeight: 700, letterSpacing: '0.1em' }}>:{st.k}</span>
              </div>
              <Row state={st.k} />
              <div style={{ fontSize: 11, color: 'rgba(17,20,24,.62)', lineHeight: 1.45 }}>{st.desc}</div>
              <div style={{ fontSize: 9.5, color: 'rgba(17,20,24,.45)', fontFamily: 'ui-monospace, monospace', borderTop: '.5px solid rgba(17,20,24,.06)', paddingTop: 6 }}>
                {{
                  rest:    'css [data-state=rest]  · qt: state=rest',
                  hover:   'css :hover · qt :hover',
                  press:   'css :active · qt :pressed',
                  focus:   'css :focus-visible · qt :focus',
                  disabled:'css [aria-disabled=true] · qt :disabled',
                  danger:  'css [data-danger] · qt property=danger',
                  submenu: 'css [aria-expanded=true]',
                  selected:'css [aria-checked=true] · qt :checked',
                }[st.k]}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 24, padding: 16, borderRadius: 8, background: '#111418', color: '#F7F3ED', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ padding: '3px 8px', fontSize: 9, borderRadius: 3, background: '#FF6A00', color: '#1A0A00', fontFamily: 'ui-monospace, monospace', fontWeight: 700, letterSpacing: '0.14em' }}>REGLE</span>
          <span style={{ fontSize: 13, lineHeight: 1.55 }}>
            <span style={{ color: '#FF6A00', fontWeight: 600 }}>Hover et focus partagent leur style</span> (tick + bg) — mais focus ajoute la ring · halo .18 (cf. WCAG 2.2 SC 2.4.7). Sur clavier, ne JAMAIS s'appuyer sur le hover seul.
          </span>
        </div>
      </div>
    </FitScale>
  );
}

Object.assign(window, { CtxAnatomy, CtxStatesGallery });
