// ctxmenu-atoms.jsx
// Twelve atomic primitives that compose every Gnu.In-Shell context menu.
// Each atom : one mini demo (320×220 stage area), one engine snippet bundle.

/* ════════════════════════════════════════════════════════════════════
   STAGE WRAPPER · all atoms render at this fixed canvas
   ════════════════════════════════════════════════════════════════════ */

function CtxStageView({ w = 540, h = 380, theme, children, bg }) {
  const tx = theme || gnuTheme({ dark: false, brand: 'medium' });
  const matBg = bg || (tx.mode === 'dark' ? '#0B0D10' : '#F0EDE6');
  return (
    <div style={{
      width: '100%', height: '100%', borderRadius: 10, overflow: 'hidden',
      background: matBg, border: `.5px solid ${tx.border}`,
      position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.02)',
    }}>
      <div style={{ position: 'relative', width: w, height: h }}>
        {/* dot grid backdrop */}
        <svg style={{ position: 'absolute', inset: 0, opacity: 0.5 }} width={w} height={h}>
          <defs>
            <pattern id="ctx-dots" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.6" fill={tx.mode === 'dark' ? 'rgba(255,255,255,.07)' : 'rgba(17,20,24,.10)'} />
            </pattern>
          </defs>
          <rect width={w} height={h} fill="url(#ctx-dots)" />
        </svg>
        {/* origin marker (the "cursor anchor") */}
        <div style={{
          position: 'absolute', left: 18, top: 18, fontSize: 9,
          color: 'rgba(255,106,0,.7)', fontFamily: 'ui-monospace, monospace',
          letterSpacing: '0.1em', fontWeight: 700, pointerEvents: 'none',
        }}>· ORIGIN</div>
        {children}
      </div>
    </div>
  );
}

// Cycle a value through an array of states every `ms`.
function useCycle(values, ms = 1400) {
  const [i, setI] = React.useState(0);
  React.useEffect(() => {
    if (!values || values.length < 2) return;
    const t = setInterval(() => setI((x) => (x + 1) % values.length), ms);
    return () => clearInterval(t);
  }, [values && values.join('|'), ms]);
  return values[i];
}

/* ════════════════════════════════════════════════════════════════════
   ATOM DEMOS
   ════════════════════════════════════════════════════════════════════ */

// C.01 — Row base ────────────────────────────────────────────────────
function CtxAtomRow({ theme }) {
  const tx = theme || gnuTheme({ dark: false, brand: 'medium' });
  return (
    <CtxStageView theme={tx}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px', height: 32,
        width: 280, borderRadius: 7, background: tx.surface, border: `.5px solid ${tx.border}`,
        color: tx.text, fontFamily: 'ui-sans-serif, system-ui, sans-serif', fontSize: 13,
      }}>
        <span style={{ width: 14, height: 14, color: tx.accent }}>{MenuIcons.add}</span>
        <span>Add widget…</span>
      </div>
      <Annot x={24} y={300} theme={tx}>icon (14px) · gap 10 · label (13px / 450)</Annot>
    </CtxStageView>
  );
}

// C.02 — Row hover (with the signature orange tick + bg) ────────────
function CtxAtomRowHover({ theme }) {
  const tx = theme || gnuTheme({ dark: false, brand: 'medium' });
  return (
    <CtxStageView theme={tx}>
      <div style={{ position: 'relative', width: 280 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px', height: 32,
          borderRadius: 7, background: tx.hover, color: tx.text,
          fontFamily: 'ui-sans-serif, system-ui, sans-serif', fontSize: 13, position: 'relative',
        }}>
          <span style={{ position: 'absolute', left: 0, top: '22%', bottom: '22%', width: 2, background: tx.accent, borderRadius: 2 }} />
          <span style={{ width: 14, height: 14, color: tx.accent }}>{MenuIcons.terminal}</span>
          <span style={{ fontWeight: 500 }}>Open terminal here</span>
          <span style={{ marginLeft: 'auto', fontSize: 10, color: tx.textDim, fontFamily: 'ui-monospace, monospace' }}>⌘T</span>
        </div>
        <svg style={{ position: 'absolute', left: -30, top: 16, width: 26, height: 1, overflow: 'visible' }}>
          <line x1="0" y1="0" x2="22" y2="0" stroke={tx.accent} strokeWidth="0.5" strokeDasharray="2 2" />
          <text x="-2" y="-3" fontSize="8" fill={tx.accent} fontFamily="ui-monospace, monospace" textAnchor="end">tick 2px</text>
        </svg>
      </div>
      <Annot x={24} y={300} theme={tx}>bg = theme.hover · tick = accent · pas de translateX au repos</Annot>
    </CtxStageView>
  );
}

// C.03 — Kbd hint chip ──────────────────────────────────────────────
function CtxAtomKbd({ theme }) {
  const tx = theme || gnuTheme({ dark: false, brand: 'medium' });
  const combos = [['⌘', 'T'], ['⌘', '⇧', 'W'], ['F'], ['⌫']];
  return (
    <CtxStageView theme={tx}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
        {combos.map((c, i) => (
          <div key={i} style={{ display: 'flex', gap: 3 }}>
            {c.map((k, j) => (
              <span key={j} style={{
                minWidth: 18, height: 18, padding: '0 5px', display: 'inline-flex',
                alignItems: 'center', justifyContent: 'center', borderRadius: 3,
                background: tx.kbdBg, border: `.5px solid ${tx.kbdBorder}`,
                fontFamily: 'ui-monospace, monospace', fontSize: 10, fontWeight: 600,
                color: tx.textDim, fontVariantNumeric: 'tabular-nums',
              }}>{k}</span>
            ))}
          </div>
        ))}
      </div>
      <Annot x={24} y={300} theme={tx}>18×18 chip · radius 3 · couleur textDim · gap 3px entre touches</Annot>
    </CtxStageView>
  );
}

// C.04 — Submenu chevron ────────────────────────────────────────────
function CtxAtomChevron({ theme }) {
  const tx = theme || gnuTheme({ dark: false, brand: 'medium' });
  return (
    <CtxStageView theme={tx}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px', height: 32,
        width: 280, borderRadius: 7, background: tx.hover, color: tx.text,
        fontFamily: 'ui-sans-serif, system-ui, sans-serif', fontSize: 13,
      }}>
        <span style={{ width: 14, height: 14, color: tx.accent }}>{MenuIcons.layout}</span>
        <span style={{ fontWeight: 500 }}>Layout preset</span>
        <span style={{ marginLeft: 'auto', color: tx.textDim, fontSize: 12, fontWeight: 700, transform: 'translateX(2px)' }}>▸</span>
      </div>
      <Annot x={24} y={300} theme={tx}>caret ▸ aligné à droite · couleur textDim · au hover → accent</Annot>
    </CtxStageView>
  );
}

// C.05 — Toggle pill ────────────────────────────────────────────────
function CtxAtomToggle({ theme }) {
  const tx = theme || gnuTheme({ dark: false, brand: 'medium' });
  const on = useCycle([true, false], 1600);
  return (
    <CtxStageView theme={tx}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          { label: 'Tile mode', on },
          { label: 'Pin to all workspaces', on: !on },
        ].map((it, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px', height: 32,
            width: 280, borderRadius: 7, background: tx.surface, border: `.5px solid ${tx.border}`,
            color: tx.text, fontFamily: 'ui-sans-serif, system-ui, sans-serif', fontSize: 13,
          }}>
            <span style={{ width: 14, height: 14, color: tx.accent }}>{MenuIcons.tile}</span>
            <span>{it.label}</span>
            <span style={{ marginLeft: 'auto', display: 'inline-flex' }}>
              <span style={{
                width: 26, height: 14, borderRadius: 999, position: 'relative',
                background: it.on ? tx.accent : tx.kbdBg,
                border: `.5px solid ${it.on ? tx.accent : tx.kbdBorder}`,
                transition: 'background 140ms',
              }}>
                <span style={{
                  position: 'absolute', top: 1, left: it.on ? 13 : 1, width: 10, height: 10, borderRadius: 5,
                  background: '#fff', transition: 'left 140ms cubic-bezier(.32,.72,.32,1)',
                  boxShadow: '0 1px 2px rgba(0,0,0,.18)',
                }} />
              </span>
            </span>
          </div>
        ))}
      </div>
      <Annot x={24} y={300} theme={tx}>switch 26×14 · knob 10px · transition 140ms · on = accent</Annot>
    </CtxStageView>
  );
}

// C.06 — Swatch dot in row ──────────────────────────────────────────
function CtxAtomSwatch({ theme }) {
  const tx = theme || gnuTheme({ dark: false, brand: 'medium' });
  const swatches = [
    { c: GNU.beret, label: 'Beret', sub: 'green · paper' },
    { c: GNU.signal, label: 'Signal', sub: 'orange · ink' },
    { c: GNU.anthracite, label: 'Anthracite', sub: 'ink · ink' },
  ];
  const idx = useCycle([0, 1, 2], 1500);
  return (
    <CtxStageView theme={tx}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {swatches.map((s, i) => {
          const isHover = i === idx;
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px', height: 32,
              width: 240, borderRadius: 7,
              background: isHover ? tx.hover : tx.surface,
              border: `.5px solid ${isHover ? tx.accentDim : tx.border}`,
              color: tx.text, fontFamily: 'ui-sans-serif, system-ui, sans-serif', fontSize: 13,
              position: 'relative',
            }}>
              {isHover && <span style={{ position: 'absolute', left: 0, top: '22%', bottom: '22%', width: 2, background: tx.accent, borderRadius: 2 }} />}
              <span style={{
                width: 14, height: 14, borderRadius: 4, background: s.c,
                border: `.5px solid ${tx.border}`, flexShrink: 0,
              }} />
              <span style={{ fontWeight: 500 }}>{s.label}</span>
              <span style={{ marginLeft: 'auto', fontSize: 10, color: tx.textDim, fontFamily: 'ui-monospace, monospace' }}>{s.sub}</span>
            </div>
          );
        })}
      </div>
      <Annot x={24} y={300} theme={tx}>swatch 14×14 · radius 4 · remplace l'icône monoline pour les pickers couleur</Annot>
    </CtxStageView>
  );
}

// C.07 — Section label ──────────────────────────────────────────────
function CtxAtomSection({ theme }) {
  const tx = theme || gnuTheme({ dark: false, brand: 'medium' });
  return (
    <CtxStageView theme={tx}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: 240 }}>
        <div style={{
          fontSize: 9.5, fontFamily: 'ui-monospace, monospace', letterSpacing: '0.14em',
          textTransform: 'uppercase', color: tx.sectionLb, fontWeight: 700,
          padding: '0 12px 4px',
        }}>Workspace</div>
        <div style={{
          padding: '0 12px', height: 28, borderRadius: 6, background: 'transparent',
          color: tx.textDim, fontSize: 12, display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ width: 12, height: 12, background: tx.kbdBg, borderRadius: 2 }} />
          <span style={{ flex: 1, height: 5, background: tx.kbdBg, borderRadius: 2 }} />
        </div>
        <div style={{
          padding: '0 12px', height: 28, borderRadius: 6, background: 'transparent',
          color: tx.textDim, fontSize: 12, display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ width: 12, height: 12, background: tx.kbdBg, borderRadius: 2 }} />
          <span style={{ flex: 1, height: 5, background: tx.kbdBg, borderRadius: 2 }} />
        </div>
      </div>
      <Annot x={24} y={300} theme={tx}>9.5px · letter-spacing .14em · uppercase · couleur sectionLb · padding bas 4px</Annot>
    </CtxStageView>
  );
}

// C.08 — Hairline separator ─────────────────────────────────────────
function CtxAtomSep({ theme }) {
  const tx = theme || gnuTheme({ dark: false, brand: 'medium' });
  return (
    <CtxStageView theme={tx}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, width: 260 }}>
        <div style={{ height: 28, padding: '0 12px', display: 'flex', alignItems: 'center' }}>
          <span style={{ width: 100, height: 6, background: tx.kbdBg, borderRadius: 2 }} />
        </div>
        <div style={{ height: 1, background: tx.border, margin: '4px 8px' }} />
        <div style={{ height: 28, padding: '0 12px', display: 'flex', alignItems: 'center' }}>
          <span style={{ width: 140, height: 6, background: tx.kbdBg, borderRadius: 2 }} />
        </div>
      </div>
      <Annot x={24} y={300} theme={tx}>1px hairline · couleur border · indent 8px · n'utilise jamais une bordure pleine</Annot>
    </CtxStageView>
  );
}

// C.09 — MenuShell (the floating panel) ─────────────────────────────
function CtxAtomShell({ theme }) {
  const tx = theme || gnuTheme({ dark: false, brand: 'medium' });
  return (
    <CtxStageView theme={tx}>
      <div style={{
        width: 220, height: 140, borderRadius: 12, background: tx.surface,
        boxShadow: tx.shadow, border: `.5px solid ${tx.border}`,
        padding: 8, position: 'relative', display: 'flex', flexDirection: 'column', gap: 4,
      }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ height: 22, borderRadius: 6, background: i === 1 ? tx.hover : 'transparent', padding: '0 8px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, background: tx.accent, opacity: i === 1 ? 1 : 0.5, borderRadius: 2 }} />
            <span style={{ flex: 1, height: 4, background: tx.kbdBg, borderRadius: 2 }} />
          </div>
        ))}
        {/* radius annotation */}
        <svg style={{ position: 'absolute', left: -52, top: -10, width: 60, height: 30, overflow: 'visible' }}>
          <path d="M 4 26 Q 4 4, 26 4" stroke={tx.accent} strokeWidth="0.5" fill="none" strokeDasharray="2 2" />
          <text x="0" y="10" fontSize="8" fill={tx.accent} fontFamily="ui-monospace, monospace">r=12</text>
        </svg>
      </div>
      <Annot x={24} y={300} theme={tx}>r 12 · pad 8 · shadow 3-tier · bezel inset 1px (sombre uniquement)</Annot>
    </CtxStageView>
  );
}

// C.10 — Status pill ─────────────────────────────────────────────────
function CtxAtomStatusPill({ theme }) {
  const tx = theme || gnuTheme({ dark: false, brand: 'medium' });
  const labels = ['ROOT', 'WIDGET', 'TITLE-BAR ▸', '01'];
  return (
    <CtxStageView theme={tx}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-start' }}>
        {labels.map((l, i) => (
          <div key={i} style={{
            padding: '3px 8px', fontSize: 9, fontFamily: 'ui-monospace, monospace',
            fontWeight: 700, letterSpacing: '0.14em', borderRadius: 3,
            background: i === 0 ? tx.accent : 'transparent',
            color: i === 0 ? '#fff' : tx.accent,
            border: i === 0 ? 'none' : `.5px solid ${tx.accent}`,
          }}>{l}</div>
        ))}
      </div>
      <Annot x={24} y={300} theme={tx}>9px mono · letter-spacing .14em · radius 3 · sert d'ID contextuel au menu</Annot>
    </CtxStageView>
  );
}

// C.11 — Sub-label (secondary text) ─────────────────────────────────
function CtxAtomSubLabel({ theme }) {
  const tx = theme || gnuTheme({ dark: false, brand: 'medium' });
  const items = [
    { l: 'Preset', s: 'Beret · Anthracite · Signal' },
    { l: 'Shape', s: 'Rounded · 8px' },
    { l: 'Background', s: 'Glass · 18px' },
  ];
  return (
    <CtxStageView theme={tx}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: 280 }}>
        {items.map((it, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '5px 12px',
            borderRadius: 7, background: i === 0 ? tx.hover : 'transparent',
            color: tx.text, fontFamily: 'ui-sans-serif, system-ui, sans-serif', position: 'relative',
          }}>
            {i === 0 && <span style={{ position: 'absolute', left: 0, top: 8, bottom: 8, width: 2, background: tx.accent, borderRadius: 2 }} />}
            <span style={{ width: 14, height: 14, background: tx.accent, opacity: 0.85, borderRadius: 3, flexShrink: 0 }} />
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, lineHeight: 1.15 }}>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{it.l}</span>
              <span style={{ fontSize: 10.5, color: tx.textDim, fontFamily: 'ui-monospace, monospace' }}>{it.s}</span>
            </div>
            <span style={{ color: tx.textDim, fontSize: 12, fontWeight: 700 }}>▸</span>
          </div>
        ))}
      </div>
      <Annot x={24} y={300} theme={tx}>label 13px · sub 10.5px mono dim · sert à montrer la valeur courante</Annot>
    </CtxStageView>
  );
}

// C.12 — Mascot row (with Sys.ter) ──────────────────────────────────
function CtxAtomMascot({ theme }) {
  const tx = theme || gnuTheme({ dark: false, brand: 'medium' });
  return (
    <CtxStageView theme={tx}>
      <div style={{ position: 'relative' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px', height: 36,
          width: 280, borderRadius: 7,
          background: tx.accent, color: '#fff', position: 'relative',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif', fontSize: 13,
        }}>
          <SysterGlyph size={20} hover />
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
            <span style={{ fontWeight: 600 }}>Summon assistant</span>
            <span style={{ fontSize: 10, opacity: 0.78 }}>Ask the shell anything</span>
          </div>
          <span style={{ marginLeft: 'auto', display: 'flex', gap: 2 }}>
            {['⌘', 'K'].map((k, i) => (
              <span key={i} style={{
                minWidth: 16, height: 16, padding: '0 4px', display: 'inline-flex',
                alignItems: 'center', justifyContent: 'center', borderRadius: 3,
                background: 'rgba(255,255,255,.18)', fontFamily: 'ui-monospace, monospace',
                fontSize: 10, fontWeight: 600,
              }}>{k}</span>
            ))}
          </span>
        </div>
      </div>
      <Annot x={24} y={300} theme={tx}>hauteur 36 · fond = accent · mascotte 20px · sub-label 10px / 78% alpha</Annot>
    </CtxStageView>
  );
}

/* ── Small annotation helper for stages ─────────────────────────── */
function Annot({ x, y, theme, children }) {
  const tx = theme || gnuTheme({ dark: false, brand: 'medium' });
  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      fontFamily: 'ui-monospace, monospace', fontSize: 10,
      color: tx.mode === 'dark' ? 'rgba(247,243,237,.5)' : 'rgba(17,20,24,.55)',
      letterSpacing: '0.03em', maxWidth: 460,
    }}>{children}</div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   SNIPPET HELPERS · same shape as motion · neutral/css/qml/qt/flutter
   ════════════════════════════════════════════════════════════════════ */

// Each atom carries its own hand-authored snippet for each engine.
// All snippets are real-shaped (compilable shape; not toy pseudo-code)
// so the QML/Qt/Flutter engineer can drop them into the menu module.

const SNIP = {};

SNIP['C.01'] = {
  neutral: `# row · base
height          32 px
padding         0 12
gap             10
icon            14 × 14 · color=accent (rest 0.7α)
label           13 px / 450 / -0.01em
radius          7
state           idle | hover | press | disabled
hit-target      ≥ 32 (mouse) · 44 (touch)`,
  css: `.gnu-row {
  display: flex; align-items: center; gap: 10px;
  height: 32px; padding: 0 12px;
  border-radius: 7px;
  font: 500 13px/1 ui-sans-serif, system-ui;
  letter-spacing: -0.01em;
  color: var(--fg1);
}
.gnu-row__icon { width: 14px; height: 14px; color: var(--accent); opacity: 0.7; }`,
  qml: `// MenuRow.qml
Item {
  id: row
  property string label
  property url    icon
  property bool   hovered: false
  width: parent.width; height: 32
  Rectangle {
    anchors.fill: parent; radius: 7
    color: row.hovered ? GnuTheme.hover : "transparent"
  }
  RowLayout {
    anchors.fill: parent
    anchors.leftMargin: 12; anchors.rightMargin: 12
    spacing: 10
    Image { source: row.icon; sourceSize: Qt.size(14,14)
            opacity: row.hovered ? 1.0 : 0.7 }
    Label { text: row.label; font.pixelSize: 13; font.weight: Font.Medium
            color: GnuTheme.fg1; Layout.fillWidth: true }
  }
}`,
  qt: `// MenuRow (Qt Widgets)
class MenuRow : public QWidget {
  Q_OBJECT
public:
  MenuRow(const QIcon& icon, const QString& label, QWidget* p=nullptr)
    : QWidget(p), _icon(icon), _label(label) { setFixedHeight(32); }
protected:
  void paintEvent(QPaintEvent*) override {
    QPainter g(this);
    g.setRenderHint(QPainter::Antialiasing);
    if (_hover) {
      g.setBrush(GnuTheme::hover); g.setPen(Qt::NoPen);
      g.drawRoundedRect(rect(), 7, 7);
    }
    _icon.paint(&g, QRect(12, 9, 14, 14));
    g.setPen(GnuTheme::fg1);
    g.setFont(GnuTheme::body(13, QFont::Medium));
    g.drawText(QRect(36, 0, width()-48, height()),
               Qt::AlignVCenter, _label);
  }
private:
  QIcon _icon; QString _label; bool _hover = false;
};`,
  flutter: `// MenuRow widget
class MenuRow extends StatelessWidget {
  const MenuRow({super.key, required this.icon,
                 required this.label, this.hovered = false});
  final IconData icon; final String label; final bool hovered;
  @override
  Widget build(BuildContext c) => Container(
    height: 32, padding: const EdgeInsets.symmetric(horizontal: 12),
    decoration: BoxDecoration(
      color: hovered ? GnuTheme.hover : Colors.transparent,
      borderRadius: BorderRadius.circular(7),
    ),
    child: Row(children: [
      Icon(icon, size: 14, color: GnuTheme.accent.withOpacity(hovered?1.0:.7)),
      const SizedBox(width: 10),
      Text(label, style: const TextStyle(
        fontSize: 13, fontWeight: FontWeight.w500,
        letterSpacing: -0.01)),
    ]),
  );
}`,
};

SNIP['C.02'] = {
  neutral: `# row · hover
bg              theme.hover  (8% accent · 5% ink)
tick            2 × 60% rowH · accent · radius 2 · gauche
transition      bg 80ms linear · pas de translateX (cf. M.03 motion)
inset           tick déborde du padding (left:0)
icon opacity    0.7 → 1.0`,
  css: `.gnu-row { position: relative; transition: background 80ms linear; }
.gnu-row[data-hover] {
  background: var(--bg-hover);
}
.gnu-row[data-hover]::before {
  content: ""; position: absolute;
  left: 0; top: 22%; bottom: 22%; width: 2px;
  background: var(--accent); border-radius: 2px;
}
.gnu-row[data-hover] .gnu-row__icon { opacity: 1; }`,
  qml: `// MenuRow.qml · hover layer
Rectangle {
  id: tick
  width: 2; radius: 2
  anchors.left: parent.left
  anchors.verticalCenter: parent.verticalCenter
  height: parent.height * 0.56
  color: GnuTheme.accent
  visible: row.hovered
  Behavior on visible { NumberAnimation { duration: 80 } }
}`,
  qt: `void MenuRow::enterEvent(QEnterEvent*) {
  _hover = true; _anim->start(); update();
}
void MenuRow::paintEvent(QPaintEvent*) {
  // ... bg ...
  if (_hover) {
    g.fillRect(QRect(0, height()*0.22, 2, height()*0.56),
               GnuTheme::accent);
  }
}`,
  flutter: `MouseRegion(
  onEnter: (_) => setState(() => hovered = true),
  onExit:  (_) => setState(() => hovered = false),
  child: Stack(children: [
    if (hovered) Positioned(
      left: 0, top: 7, bottom: 7,
      child: Container(width: 2,
        decoration: BoxDecoration(color: GnuTheme.accent,
          borderRadius: BorderRadius.circular(2))),
    ),
    MenuRow(/* ... */),
  ]),
)`,
};

SNIP['C.03'] = {
  neutral: `# kbd chip
size            18 × 18 (min-width)
padding         0 5
radius          3
bg              theme.kbdBg
border          0.5 · theme.kbdBorder
font            10 px / 600 · ui-monospace
color           textDim
gap entre touches  3 px
support         glyphes ⌘ ⇧ ⌥ ⌃ ⏎ ⌫ + lettres`,
  css: `.gnu-kbd {
  min-width: 18px; height: 18px;
  padding: 0 5px;
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: 3px;
  background: var(--kbd-bg); border: .5px solid var(--kbd-border);
  font: 600 10px/1 ui-monospace, "JetBrains Mono", monospace;
  color: var(--fg-dim);
}
.gnu-kbd-row { display: inline-flex; gap: 3px; }`,
  qml: `// KbdChip.qml
Rectangle {
  property string glyph
  implicitWidth: Math.max(18, txt.implicitWidth + 10)
  implicitHeight: 18
  radius: 3
  color: GnuTheme.kbdBg
  border.width: 0.5; border.color: GnuTheme.kbdBorder
  Label {
    id: txt; anchors.centerIn: parent
    text: glyph; font.family: "IBM Plex Mono"
    font.pixelSize: 10; font.weight: Font.DemiBold
    color: GnuTheme.fgDim
  }
}`,
  qt: `class KbdChip : public QLabel {
public:
  KbdChip(const QString& g, QWidget* p=nullptr) : QLabel(g, p) {
    setAlignment(Qt::AlignCenter);
    setMinimumSize(18,18);
    setStyleSheet(R"(
      background: %1; color: %2;
      border: .5px solid %3; border-radius: 3px;
      font: 600 10px 'IBM Plex Mono';
      padding: 0 5px;
    )"_qs.arg(GnuTheme::kbdBg.name())
        .arg(GnuTheme::fgDim.name())
        .arg(GnuTheme::kbdBorder.name()));
  }
};`,
  flutter: `class KbdChip extends StatelessWidget {
  const KbdChip(this.glyph, {super.key});
  final String glyph;
  @override Widget build(BuildContext c) => Container(
    constraints: const BoxConstraints(minWidth: 18, minHeight: 18),
    padding: const EdgeInsets.symmetric(horizontal: 5),
    decoration: BoxDecoration(
      color: GnuTheme.kbdBg,
      border: Border.all(color: GnuTheme.kbdBorder, width: .5),
      borderRadius: BorderRadius.circular(3),
    ),
    alignment: Alignment.center,
    child: Text(glyph, style: const TextStyle(
      fontFamily: 'IBMPlexMono', fontSize: 10,
      fontWeight: FontWeight.w600)),
  );
}`,
};

SNIP['C.04'] = {
  neutral: `# submenu chevron
glyph           ▸  (U+25B8)
font-size       12 px
weight          700
color           textDim · au hover → accent
position        flex-end · margin-left: auto
offset          translateX(+2px) au hover (M.05)
no-click        purement décoratif — la rangée elle-même active le sub`,
  css: `.gnu-row__chev {
  margin-left: auto;
  color: var(--fg-dim);
  font: 700 12px/1 system-ui;
  transition: color 80ms, transform 140ms cubic-bezier(.32,.72,.32,1);
}
.gnu-row[data-hover] .gnu-row__chev {
  color: var(--accent);
  transform: translateX(2px);
}`,
  qml: `Label {
  id: chev; text: "\u25B8"
  font.pixelSize: 12; font.weight: Font.Bold
  color: row.hovered ? GnuTheme.accent : GnuTheme.fgDim
  Behavior on color { ColorAnimation { duration: 80 } }
  transform: Translate {
    x: row.hovered ? 2 : 0
    Behavior on x { NumberAnimation {
      duration: 140; easing.type: Easing.OutCubic } }
  }
}`,
  qt: `void MenuRow::paintChevron(QPainter& g) {
  g.setFont(QFont("system-ui", 12, QFont::Bold));
  g.setPen(_hover ? GnuTheme::accent : GnuTheme::fgDim);
  int x = width() - 20 + (_hover ? 2 : 0);
  g.drawText(QRect(x, 0, 20, height()),
             Qt::AlignVCenter | Qt::AlignLeft, QStringLiteral("\u25B8"));
}`,
  flutter: `AnimatedSlide(
  offset: hovered ? const Offset(0.05, 0) : Offset.zero,
  duration: const Duration(milliseconds: 140),
  curve: Curves.easeOutCubic,
  child: Text('\u25B8', style: TextStyle(
    fontSize: 12, fontWeight: FontWeight.bold,
    color: hovered ? GnuTheme.accent : GnuTheme.fgDim)),
)`,
};

SNIP['C.05'] = {
  neutral: `# toggle pill
track           26 × 14 · radius pill
knob            10 px · #fff · shadow 0/1/2/rgba(0,0,0,.18)
on              bg = accent · border = accent
off             bg = kbdBg · border = kbdBorder
transition      knob.x 140ms cubic-bezier(.32,.72,.32,1) ; bg 100ms`,
  css: `.gnu-toggle {
  width: 26px; height: 14px; border-radius: 999px;
  background: var(--kbd-bg); border: .5px solid var(--kbd-border);
  position: relative; transition: background 100ms;
}
.gnu-toggle[aria-checked="true"] {
  background: var(--accent); border-color: var(--accent);
}
.gnu-toggle::after {
  content: ""; position: absolute; top: 1px; left: 1px;
  width: 10px; height: 10px; border-radius: 5px;
  background: #fff; box-shadow: 0 1px 2px rgba(0,0,0,.18);
  transition: left 140ms cubic-bezier(.32,.72,.32,1);
}
.gnu-toggle[aria-checked="true"]::after { left: 13px; }`,
  qml: `// Toggle.qml
Item {
  id: tg; property bool on: false
  width: 26; height: 14
  Rectangle {
    anchors.fill: parent; radius: 7
    color: tg.on ? GnuTheme.accent : GnuTheme.kbdBg
    border.width: 0.5
    border.color: tg.on ? GnuTheme.accent : GnuTheme.kbdBorder
    Behavior on color { ColorAnimation { duration: 100 } }
  }
  Rectangle {
    y: 1; width: 10; height: 10; radius: 5
    x: tg.on ? 13 : 1
    color: "white"
    layer.enabled: true
    Behavior on x { NumberAnimation {
      duration: 140; easing.type: Easing.OutCubic } }
  }
}`,
  qt: `class Toggle : public QAbstractButton {
  Q_OBJECT
public:
  Toggle(QWidget* p=nullptr) : QAbstractButton(p) {
    setCheckable(true); setFixedSize(26,14);
    _anim = new QPropertyAnimation(this, "knobX", this);
    _anim->setDuration(140);
    _anim->setEasingCurve(QEasingCurve::OutCubic);
    connect(this, &QAbstractButton::toggled, [this](bool on){
      _anim->setStartValue(_knobX);
      _anim->setEndValue(on ? 13 : 1); _anim->start();
    });
  }
  // ... paintEvent draws track + knob ...
};`,
  flutter: `class GnuToggle extends StatelessWidget {
  const GnuToggle({super.key, required this.on,
                   required this.onChanged});
  final bool on; final ValueChanged<bool> onChanged;
  @override Widget build(BuildContext c) => GestureDetector(
    onTap: () => onChanged(!on),
    child: AnimatedContainer(
      width: 26, height: 14,
      duration: const Duration(milliseconds: 100),
      decoration: BoxDecoration(
        color: on ? GnuTheme.accent : GnuTheme.kbdBg,
        borderRadius: BorderRadius.circular(7),
        border: Border.all(width: .5,
          color: on ? GnuTheme.accent : GnuTheme.kbdBorder),
      ),
      child: AnimatedAlign(
        alignment: on ? Alignment.centerRight
                      : Alignment.centerLeft,
        duration: const Duration(milliseconds: 140),
        curve: Curves.easeOutCubic,
        child: Container(margin: const EdgeInsets.all(1),
          width: 10, height: 10,
          decoration: const BoxDecoration(shape: BoxShape.circle,
            color: Colors.white)),
      ),
    ),
  );
}`,
};

SNIP['C.06'] = {
  neutral: `# swatch
size            14 × 14
radius          4
border          0.5 · theme.border
remplace        l'icône monoline pour les pickers couleur/preset
hover           tick orange identique à row.hover (M.03)
sub-label       en mono · décrit la couleur ("green · paper")`,
  css: `.gnu-swatch {
  width: 14px; height: 14px; border-radius: 4px;
  border: .5px solid var(--border);
  flex-shrink: 0;
}
.gnu-swatch[data-c="beret"]      { background: #5F7F52; }
.gnu-swatch[data-c="signal"]     { background: #FF6A00; }
.gnu-swatch[data-c="anthracite"] { background: #111418; }
.gnu-swatch[data-c="shell"]      { background: #F7F3ED; }`,
  qml: `Rectangle {
  property color swatch
  width: 14; height: 14; radius: 4
  color: swatch
  border.width: 0.5; border.color: GnuTheme.border
}`,
  qt: `void MenuRow::drawSwatch(QPainter& g, const QColor& c) {
  QPainterPath p;
  p.addRoundedRect(QRect(12, 9, 14, 14), 4, 4);
  g.fillPath(p, c);
  g.setPen(QPen(GnuTheme::border, 0.5));
  g.drawPath(p);
}`,
  flutter: `Container(width: 14, height: 14,
  decoration: BoxDecoration(
    color: swatch,
    borderRadius: BorderRadius.circular(4),
    border: Border.all(color: GnuTheme.border, width: .5),
  ))`,
};

SNIP['C.07'] = {
  neutral: `# section label
font            9.5 px / 700 / 0.14em letter-spacing
case            UPPERCASE
family          ui-monospace
color           theme.sectionLb  (heavy = accent · default = fg-faint)
padding         0 12 4 12  (4px gap avant la 1re rangée)
rôle            regroupement sémantique — pas un titre de section visuel`,
  css: `.gnu-section__label {
  padding: 0 12px 4px;
  font: 700 9.5px/1 ui-monospace, monospace;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: var(--section-lb);
}`,
  qml: `// SectionLabel.qml
Label {
  text: label.toUpperCase()
  font.family: "IBM Plex Mono"
  font.pixelSize: 9.5; font.weight: Font.Bold
  font.letterSpacing: 1.33  // approx 0.14em
  color: GnuTheme.sectionLb
  leftPadding: 12; rightPadding: 12; bottomPadding: 4
}`,
  qt: `void MenuSection::drawLabel(QPainter& g) {
  QFont f("IBM Plex Mono", 9, QFont::Bold);
  f.setLetterSpacing(QFont::AbsoluteSpacing, 1.3);
  g.setFont(f); g.setPen(GnuTheme::sectionLb);
  g.drawText(QRect(12, 0, width()-24, 16),
             Qt::AlignVCenter | Qt::AlignLeft, _label.toUpper());
}`,
  flutter: `Padding(
  padding: const EdgeInsets.fromLTRB(12, 0, 12, 4),
  child: Text(label.toUpperCase(),
    style: TextStyle(
      fontFamily: 'IBMPlexMono', fontSize: 9.5,
      fontWeight: FontWeight.w700,
      letterSpacing: 1.33,
      color: GnuTheme.sectionLb)),
)`,
};

SNIP['C.08'] = {
  neutral: `# separator
épaisseur       1 px (effective · 0.5 + sub-pixel)
couleur         theme.border
marge           4 px haut · 4 px bas · indent latéral 8 px
règle           UN seul style — jamais double-trait, jamais full-width`,
  css: `.gnu-sep {
  height: 1px; margin: 4px 8px;
  background: var(--border);
}`,
  qml: `Rectangle {
  height: 1; color: GnuTheme.border
  anchors.left: parent.left; anchors.leftMargin: 8
  anchors.right: parent.right; anchors.rightMargin: 8
  Layout.topMargin: 4; Layout.bottomMargin: 4
}`,
  qt: `void MenuShell::paintEvent(QPaintEvent*) {
  // ... rows ...
  for (auto y : _sepYs) {
    g.fillRect(QRect(8, y, width()-16, 1), GnuTheme::border);
  }
}`,
  flutter: `Padding(
  padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 8),
  child: Container(height: 1, color: GnuTheme.border),
)`,
};

SNIP['C.09'] = {
  neutral: `# menu shell
radius          12
padding         6 (rows touchent les bords moins ce pad)
background      theme.surface  (#FFF light · #1B1F23 dark)
border          0.5 · theme.border
shadow          24 / 64 · 8 / 24 · hairline ring  (3-tier warm-ink)
bezel           inset 0 0 0 1px rgba(255,255,255,.04)  ← dark only
mask-clip       circle(R at cursor) pour l'open · cf. motion A.04`,
  css: `.gnu-shell {
  background: var(--surface);
  border-radius: 12px;
  border: .5px solid var(--border);
  padding: 6px;
  box-shadow:
    0 24px 64px -8px rgba(17,20,24,.18),
    0 8px  24px -4px rgba(17,20,24,.10),
    0 0    0    .5px rgba(17,20,24,.06);
}
.gnu-shell[data-mode="dark"] {
  box-shadow:
    0 24px 64px -8px rgba(0,0,0,.6),
    0 8px  24px -4px rgba(0,0,0,.4),
    inset 0 0 0 1px rgba(255,255,255,.04);
}`,
  qml: `// MenuShell.qml
Rectangle {
  id: shell
  radius: 12
  color: GnuTheme.surface
  border.width: 0.5; border.color: GnuTheme.border
  layer.enabled: true
  layer.effect: DropShadow {
    horizontalOffset: 0; verticalOffset: 24
    radius: 64; samples: 33; color: "#33000000"
  }
  Item {
    id: content; anchors.fill: parent; anchors.margins: 6
    // rows here
  }
}`,
  qt: `class MenuShell : public QWidget {
public:
  MenuShell(QWidget* p=nullptr) : QWidget(p) {
    setWindowFlags(Qt::Popup | Qt::FramelessWindowHint);
    setAttribute(Qt::WA_TranslucentBackground);
    auto* e = new QGraphicsDropShadowEffect(this);
    e->setBlurRadius(64); e->setOffset(0, 24);
    e->setColor(QColor(0,0,0,80)); setGraphicsEffect(e);
  }
protected:
  void paintEvent(QPaintEvent*) override {
    QPainter g(this);
    g.setRenderHint(QPainter::Antialiasing);
    g.setBrush(GnuTheme::surface);
    g.setPen(QPen(GnuTheme::border, 0.5));
    g.drawRoundedRect(rect().adjusted(0,0,-1,-1), 12, 12);
  }
};`,
  flutter: `class MenuShell extends StatelessWidget {
  const MenuShell({super.key, required this.child});
  final Widget child;
  @override Widget build(BuildContext c) => Container(
    decoration: BoxDecoration(
      color: GnuTheme.surface,
      borderRadius: BorderRadius.circular(12),
      border: Border.all(color: GnuTheme.border, width: .5),
      boxShadow: const [
        BoxShadow(offset: Offset(0,24), blurRadius: 64,
          color: Color(0x33111418)),
        BoxShadow(offset: Offset(0,8), blurRadius: 24,
          color: Color(0x1A111418)),
      ],
    ),
    padding: const EdgeInsets.all(6),
    child: child,
  );
}`,
};

SNIP['C.10'] = {
  neutral: `# status pill
font            9 px mono / 700 / 0.14em
padding         3 8
radius          3
filled          bg = accent  · fg = white
outline         border 0.5 accent · fg = accent
rôle            étiquette contextuelle ("ROOT", "WIDGET", "TITLE-BAR ▸")
position        coin haut-gauche du menu ou label de section avancée`,
  css: `.gnu-pill {
  padding: 3px 8px;
  font: 700 9px/1 ui-monospace, monospace;
  letter-spacing: .14em;
  border-radius: 3px;
}
.gnu-pill--filled  { background: var(--accent); color: #fff; }
.gnu-pill--outline {
  background: transparent; color: var(--accent);
  border: .5px solid var(--accent);
}`,
  qml: `Rectangle {
  property string text
  property bool   filled: true
  radius: 3
  color: filled ? GnuTheme.accent : "transparent"
  border.width: filled ? 0 : 0.5; border.color: GnuTheme.accent
  implicitWidth: lbl.implicitWidth + 16
  implicitHeight: lbl.implicitHeight + 6
  Label {
    id: lbl; anchors.centerIn: parent
    text: parent.text; font.family: "IBM Plex Mono"
    font.pixelSize: 9; font.weight: Font.Bold
    font.capitalization: Font.AllUppercase
    color: parent.filled ? "white" : GnuTheme.accent
  }
}`,
  qt: `class StatusPill : public QLabel {
public:
  StatusPill(const QString& t, bool filled=true, QWidget* p=nullptr)
    : QLabel(t.toUpper(), p) {
    setContentsMargins(8,3,8,3);
    auto* f = new QFont("IBM Plex Mono", 9, QFont::Bold);
    f->setLetterSpacing(QFont::AbsoluteSpacing, 1.2);
    setFont(*f);
    setStyleSheet(filled
      ? "background:#FF6A00; color:white; border-radius:3px;"
      : "background:transparent; color:#FF6A00;"
        "border:.5px solid #FF6A00; border-radius:3px;");
  }
};`,
  flutter: `class StatusPill extends StatelessWidget {
  const StatusPill(this.text, {super.key, this.filled = true});
  final String text; final bool filled;
  @override Widget build(BuildContext c) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
    decoration: BoxDecoration(
      color: filled ? GnuTheme.accent : Colors.transparent,
      borderRadius: BorderRadius.circular(3),
      border: filled ? null
        : Border.all(color: GnuTheme.accent, width: .5),
    ),
    child: Text(text.toUpperCase(), style: TextStyle(
      fontFamily: 'IBMPlexMono', fontSize: 9,
      fontWeight: FontWeight.w700, letterSpacing: 1.2,
      color: filled ? Colors.white : GnuTheme.accent)),
  );
}`,
};

SNIP['C.11'] = {
  neutral: `# sub-label  (valeur courante sous le label principal)
label           13 px · 500 · -0.01em
sub             10.5 px · ui-mono · color = textDim
line-height     1.15  (rangée encore lisible à 32px d'hauteur)
hauteur de row  cresce à 36-40 quand sub présent
contenu         actuel  (ex: "Beret · Anthracite · Signal")`,
  css: `.gnu-row__body { display: flex; flex-direction: column; line-height: 1.15; }
.gnu-row__body > .label { font: 500 13px/1 ui-sans-serif; letter-spacing: -0.01em; }
.gnu-row__body > .sub   {
  font: 400 10.5px/1 ui-monospace, monospace;
  color: var(--fg-dim);
  margin-top: 1px;
}`,
  qml: `ColumnLayout {
  spacing: 1
  Label { text: row.label; font.pixelSize: 13; font.weight: Font.Medium }
  Label { text: row.sub
          font.family: "IBM Plex Mono"; font.pixelSize: 10.5
          color: GnuTheme.fgDim }
}`,
  qt: `void MenuRow::paintBody(QPainter& g, int x) {
  g.setPen(GnuTheme::fg1);
  g.setFont(QFont("system-ui", 13, QFont::Medium));
  g.drawText(QPoint(x, 16), _label);
  if (!_sub.isEmpty()) {
    g.setPen(GnuTheme::fgDim);
    g.setFont(QFont("IBM Plex Mono", 10));
    g.drawText(QPoint(x, 30), _sub);
  }
}`,
  flutter: `Column(crossAxisAlignment: CrossAxisAlignment.start,
  mainAxisSize: MainAxisSize.min, children: [
  Text(label, style: const TextStyle(
    fontSize: 13, fontWeight: FontWeight.w500,
    letterSpacing: -0.01)),
  if (sub != null) Text(sub!, style: TextStyle(
    fontFamily: 'IBMPlexMono', fontSize: 10.5,
    color: GnuTheme.fgDim)),
])`,
};

SNIP['C.12'] = {
  neutral: `# mascot row
hauteur         36
bg              accent  (orange) · fg = white
mascot          Sys.ter glyph 20px · état listening
label           14 px / 600
sub             10 px · 78% alpha
kbd             chips translucides : bg rgba(255,255,255,.18)
position        toujours en 1re position quand présent (Summon assistant)
unique          1 par menu max`,
  css: `.gnu-row--mascot {
  height: 36px; padding: 0 12px;
  background: var(--accent); color: #fff;
  border-radius: 7px; display: flex; align-items: center; gap: 10px;
}
.gnu-row--mascot .label  { font: 600 14px/1 ui-sans-serif; }
.gnu-row--mascot .sub    { font: 400 10px/1; opacity: .78; }
.gnu-row--mascot .gnu-kbd {
  background: rgba(255,255,255,.18); border: none; color: #fff;
}`,
  qml: `// MascotRow.qml — utilise SysterGlyph.qml (cf. mascot kit)
Rectangle {
  height: 36; radius: 7
  color: GnuTheme.accent
  RowLayout {
    anchors.fill: parent
    anchors.leftMargin: 12; anchors.rightMargin: 12
    spacing: 10
    SysterGlyph { size: 20; state: "listening" }
    ColumnLayout {
      Label { text: "Summon assistant"; color: "white"
              font.pixelSize: 14; font.weight: Font.DemiBold }
      Label { text: "Ask the shell anything"; color: "white"
              opacity: 0.78; font.pixelSize: 10 }
    }
    Item { Layout.fillWidth: true }
    KbdRow { keys: ["\u2318", "K"]; translucent: true }
  }
}`,
  qt: `class MascotRow : public QWidget {
public:
  MascotRow(QWidget* p=nullptr) : QWidget(p) {
    setFixedHeight(36);
    auto* l = new QHBoxLayout(this);
    l->setContentsMargins(12,0,12,0); l->setSpacing(10);
    l->addWidget(new SysterGlyph(20, "listening", this));
    auto* col = new QVBoxLayout;
    col->addWidget(new QLabel("Summon assistant"));
    col->addWidget(new QLabel("Ask the shell anything"));
    l->addLayout(col); l->addStretch();
    l->addWidget(new KbdRow({"⌘","K"}, /*translucent=*/true));
    setStyleSheet("background:#FF6A00; color:white;"
                  "border-radius:7px;");
  }
};`,
  flutter: `class MascotRow extends StatelessWidget {
  const MascotRow({super.key});
  @override Widget build(BuildContext c) => Container(
    height: 36, padding: const EdgeInsets.symmetric(horizontal: 12),
    decoration: BoxDecoration(
      color: GnuTheme.accent, borderRadius: BorderRadius.circular(7)),
    child: Row(children: [
      const SysterGlyph(size: 20, state: SysterState.listening),
      const SizedBox(width: 10),
      const Expanded(child: Column(
        crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text('Summon assistant', style: TextStyle(
          color: Colors.white, fontSize: 14,
          fontWeight: FontWeight.w600)),
        Text('Ask the shell anything', style: TextStyle(
          color: Colors.white70, fontSize: 10)),
      ])),
      const KbdRow(['\u2318','K'], translucent: true),
    ]),
  );
}`,
};

/* ════════════════════════════════════════════════════════════════════
   ATOM REGISTRY
   ════════════════════════════════════════════════════════════════════ */

const CTX_ATOMS = [
  { id: 'C.01', title: 'Row · base',         sub: 'Icône + label, 32 px, radius 7. La rangée par défaut.',
    demo: CtxAtomRow,        snip: SNIP['C.01'], tokens: [['height','32 px'],['padding','0 12'],['radius','7'],['icon','14 px · accent · 0.7α'],['label','13 / 450 / -0.01em']] },
  { id: 'C.02', title: 'Row · hover',        sub: 'Tick orange 2 px à gauche + bg theme.hover. Pas de translateX au repos.',
    demo: CtxAtomRowHover,   snip: SNIP['C.02'], tokens: [['bg','theme.hover'],['tick','2 × 60% rowH · accent'],['transition','bg 80ms linear'],['icon α','0.7 → 1.0']] },
  { id: 'C.03', title: 'Kbd hint',           sub: 'Chip 18×18, ui-mono 10 px / 600. Glyphes ⌘ ⇧ ⌥ ⌃ ⏎ ⌫.',
    demo: CtxAtomKbd,        snip: SNIP['C.03'], tokens: [['size','18×18 min'],['radius','3'],['bg','theme.kbdBg'],['font','10/600 mono'],['gap','3 px']] },
  { id: 'C.04', title: 'Submenu chevron',    sub: 'Glyphe ▸, 12 px / 700. translateX +2 au hover · couleur → accent.',
    demo: CtxAtomChevron,    snip: SNIP['C.04'], tokens: [['glyph','▸  U+25B8'],['font','12 / 700'],['color rest','textDim'],['color hover','accent'],['offset hover','+2 px']] },
  { id: 'C.05', title: 'Toggle pill',        sub: 'Switch 26×14, knob 10 px. Transition knob 140 ms cubic-bezier(.32,.72,.32,1).',
    demo: CtxAtomToggle,     snip: SNIP['C.05'], tokens: [['track','26 × 14 pill'],['knob','10 px white'],['on','bg = accent'],['off','bg = kbdBg'],['ease','cubic-bezier(.32,.72,.32,1)']] },
  { id: 'C.06', title: 'Swatch dot',         sub: 'Carré 14×14, radius 4. Remplace l\'icône monoline pour les pickers couleur.',
    demo: CtxAtomSwatch,     snip: SNIP['C.06'], tokens: [['size','14 × 14'],['radius','4'],['border','0.5 theme.border'],['scope','presets · themes uniquement']] },
  { id: 'C.07', title: 'Section label',      sub: 'Mono 9.5 px / 700 / 0.14em letter-spacing. Regroupement sémantique, pas un titre visuel.',
    demo: CtxAtomSection,    snip: SNIP['C.07'], tokens: [['font','9.5 / 700 mono'],['letter-spacing','0.14em'],['case','UPPERCASE'],['color','theme.sectionLb'],['padding','0 12 4 12']] },
  { id: 'C.08', title: 'Separator',          sub: 'Hairline 1 px theme.border, marges 4 px haut/bas, indent 8 px. Jamais full-width.',
    demo: CtxAtomSep,        snip: SNIP['C.08'], tokens: [['height','1 px'],['color','theme.border'],['marges','4 px'],['indent','8 px']] },
  { id: 'C.09', title: 'Menu shell',         sub: 'Le contenant flottant. Radius 12, shadow 3-tier warm-ink, bezel inset (dark).',
    demo: CtxAtomShell,      snip: SNIP['C.09'], tokens: [['radius','12'],['padding','6'],['surface','#FFF / #1B1F23'],['shadow','24/64 + 8/24 + 0.5'],['bezel','inset rgba(255,255,255,.04)']] },
  { id: 'C.10', title: 'Status pill',        sub: 'Étiquette contextuelle ROOT / WIDGET / 01. Filled ou outline.',
    demo: CtxAtomStatusPill, snip: SNIP['C.10'], tokens: [['font','9 / 700 mono'],['letter-spacing','0.14em'],['radius','3'],['filled','bg accent · fg white'],['outline','border 0.5 accent']] },
  { id: 'C.11', title: 'Sub-label',          sub: 'Valeur courante sous le label (Preset · Beret). Row passe de 32 à 36-40.',
    demo: CtxAtomSubLabel,   snip: SNIP['C.11'], tokens: [['label','13 / 500'],['sub','10.5 mono dim'],['line-height','1.15'],['hauteur row','36-40']] },
  { id: 'C.12', title: 'Mascot row',         sub: 'Sys.ter accent — 1 par menu max, toujours en 1re position. État listening.',
    demo: CtxAtomMascot,     snip: SNIP['C.12'], tokens: [['height','36'],['bg','accent'],['mascot','20 px · listening'],['label','14 / 600'],['kbd','rgba(255,255,255,.18)']] },
];

Object.assign(window, { CTX_ATOMS, CtxStageView, useCycle, Annot, SNIP });
