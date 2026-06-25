// ctxmenu-atoms-extra.jsx
// Six additional atomic primitives that complete the menu vocabulary.
// C.13 Radio · C.14 Slider · C.15 State header · C.16 Search · C.17 Connector · C.18 Footer strip

/* ════════════════════════════════════════════════════════════════════
   EXTRA ATOM DEMOS
   ════════════════════════════════════════════════════════════════════ */

// C.13 — Radio row ──────────────────────────────────────────────────
function CtxAtomRadio({ theme }) {
  const tx = theme || gnuTheme({ dark: false, brand: 'medium' });
  const picked = useCycle([0, 1, 2], 1500);
  const opts = [
    { l: 'Internal speakers', s: '64% · default' },
    { l: 'HD audio',          s: '·' },
    { l: 'Studio monitor',    s: 'available' },
  ];
  return (
    <CtxStageView theme={tx}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: 260 }}>
        {opts.map((o, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px', height: 30,
            borderRadius: 7, background: i === picked ? tx.hover : 'transparent',
            color: tx.text, fontFamily: 'ui-sans-serif, system-ui, sans-serif', fontSize: 12, position: 'relative',
          }}>
            {i === picked && <span style={{ position: 'absolute', left: 0, top: '22%', bottom: '22%', width: 2, background: tx.accent, borderRadius: 2 }} />}
            <span style={{
              width: 14, height: 14, borderRadius: 7,
              border: `1.2px solid ${i === picked ? tx.accent : tx.kbdBorder}`,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              transition: 'border-color 100ms',
            }}>
              {i === picked && <span style={{ width: 6, height: 6, borderRadius: 3, background: tx.accent, transition: 'transform 140ms cubic-bezier(.32,.72,.32,1)' }} />}
            </span>
            <span style={{ fontWeight: 500 }}>{o.l}</span>
            <span style={{ marginLeft: 'auto', fontSize: 10, color: tx.textDim, fontFamily: 'ui-monospace, monospace' }}>{o.s}</span>
          </div>
        ))}
      </div>
      <Annot x={24} y={300} theme={tx}>cercle 14 · 1.2px stroke · pastille 6 · groupe = name unique · keyboard ↑↓ pour cycler</Annot>
    </CtxStageView>
  );
}

// C.14 — Slider ─────────────────────────────────────────────────────
function CtxAtomSlider({ theme }) {
  const tx = theme || gnuTheme({ dark: false, brand: 'medium' });
  const ticks = [0.24, 0.42, 0.64, 0.78, 0.42];
  const v = ticks[useCycle([0, 1, 2, 3, 4], 1000)];
  return (
    <CtxStageView theme={tx}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22, width: 280 }}>
        {/* Default volume slider */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 9, color: tx.textFaint, fontFamily: 'ui-monospace, monospace', fontWeight: 700, letterSpacing: '0.14em' }}>VOLUME</span>
            <span style={{ fontSize: 11, color: tx.text, fontFamily: 'ui-monospace, monospace', fontVariantNumeric: 'tabular-nums' }}>{Math.round(v * 100)}%</span>
          </div>
          <div style={{ height: 4, background: tx.kbdBg, borderRadius: 2, position: 'relative' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${v * 100}%`, background: tx.accent, borderRadius: 2, transition: 'width 800ms cubic-bezier(.2,.7,.2,1)' }} />
            <div style={{ position: 'absolute', left: `${v * 100}%`, top: -4, width: 12, height: 12, borderRadius: 6, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.2)', transform: 'translateX(-6px)', border: `.5px solid ${tx.border}`, transition: 'left 800ms cubic-bezier(.2,.7,.2,1)' }} />
          </div>
        </div>
        {/* Discrete (size: S M L XL) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 9, color: tx.textFaint, fontFamily: 'ui-monospace, monospace', fontWeight: 700, letterSpacing: '0.14em' }}>SIZE · DISCRETE</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {['S', 'M', 'L', 'XL'].map((s, i) => {
              const active = i === 1;
              return (
                <div key={s} style={{
                  flex: 1, height: 24, borderRadius: 5,
                  background: active ? tx.accent : tx.surface,
                  color: active ? '#fff' : tx.textDim,
                  border: `.5px solid ${active ? tx.accent : tx.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontFamily: 'ui-monospace, monospace', fontWeight: 700,
                }}>{s}</div>
              );
            })}
          </div>
        </div>
      </div>
      <Annot x={24} y={300} theme={tx}>track 4 px · fill = accent · knob 12 px white · shadow 0/1/3/.2 · transition 800 ms</Annot>
    </CtxStageView>
  );
}

// C.15 — State header (OUTPUT · 64% · meta) ─────────────────────────
function CtxAtomStateHeader({ theme }) {
  const tx = theme || gnuTheme({ dark: false, brand: 'medium' });
  const vals = [
    { l: 'OUTPUT',   v: '64%', m: 'Active : Internal speakers' },
    { l: 'NETWORK',  v: '5GHz', m: 'Connected · home-5G · 92 Mbps' },
    { l: 'BATTERY',  v: '47%', m: '2h 34min remaining · power-save' },
  ];
  const it = vals[useCycle([0, 1, 2], 1800)];
  return (
    <CtxStageView theme={tx}>
      <div style={{
        width: 280, padding: '12px 14px',
        background: tx.mode === 'dark' ? 'rgba(255,106,0,.06)' : 'rgba(255,106,0,.05)',
        borderTop: `.5px solid ${tx.border}`, borderBottom: `.5px solid ${tx.border}`,
        borderRadius: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span style={{ fontSize: 9.5, color: tx.accent, fontFamily: 'ui-monospace, monospace', fontWeight: 700, letterSpacing: '0.14em' }}>{it.l}</span>
          <span style={{ fontSize: 22, fontWeight: 600, color: tx.text, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', fontFamily: 'ui-monospace, monospace' }}>{it.v}</span>
        </div>
        <div style={{ fontSize: 11, color: tx.textDim, fontFamily: 'ui-monospace, monospace', marginTop: 2 }}>{it.m}</div>
      </div>
      <Annot x={24} y={300} theme={tx}>bande tonale chaude · label 9.5 · valeur 22 mono · meta 11 mono dim · sépare le header de la liste</Annot>
    </CtxStageView>
  );
}

// C.16 — Search field ──────────────────────────────────────────────
function CtxAtomSearch({ theme }) {
  const tx = theme || gnuTheme({ dark: false, brand: 'medium' });
  const queries = ['', 'tile', 'tile mo', 'tile mode'];
  const q = queries[useCycle([0, 1, 2, 3], 700)];
  const focused = q.length > 0;
  return (
    <CtxStageView theme={tx}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: 260 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', height: 32,
          borderRadius: 8, background: tx.surface,
          border: `.5px solid ${focused ? tx.accent : tx.border}`,
          transition: 'border-color 100ms',
        }}>
          <span style={{ width: 13, height: 13, color: focused ? tx.accent : tx.textDim, flexShrink: 0 }}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width={13} height={13}>
              <circle cx="7" cy="7" r="4.5" />
              <line x1="10.5" y1="10.5" x2="13.5" y2="13.5" strokeLinecap="round" />
            </svg>
          </span>
          <span style={{ flex: 1, fontSize: 12, color: q ? tx.text : tx.textFaint, fontFamily: 'ui-sans-serif, system-ui, sans-serif', position: 'relative' }}>
            {q || 'Search actions…'}
            {focused && <span style={{ position: 'absolute', left: q.length * 6.5, top: 1, width: 1, height: 14, background: tx.accent, animation: 'gnu-blink 600ms steps(2) infinite' }} />}
          </span>
          {focused && (
            <span style={{ display: 'inline-flex', gap: 3 }}>
              <span style={{ minWidth: 18, height: 18, padding: '0 5px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 3, background: tx.kbdBg, border: `.5px solid ${tx.kbdBorder}`, fontFamily: 'ui-monospace, monospace', fontSize: 10, fontWeight: 600, color: tx.textDim }}>esc</span>
            </span>
          )}
        </div>
        {/* Result list */}
        {focused && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ padding: '0 12px', fontSize: 9, fontFamily: 'ui-monospace, monospace', color: tx.textFaint, letterSpacing: '0.14em', fontWeight: 700 }}>1 RESULT</div>
            <div style={{ padding: '0 12px', height: 28, display: 'flex', alignItems: 'center', gap: 8, borderRadius: 6, background: tx.hover, position: 'relative' }}>
              <span style={{ position: 'absolute', left: 0, top: '22%', bottom: '22%', width: 2, background: tx.accent, borderRadius: 2 }} />
              <span style={{ width: 12, height: 12, color: tx.accent }}>{MenuIcons.tile}</span>
              <span style={{ fontSize: 12, fontWeight: 500, color: tx.text }}>
                <span style={{ background: 'rgba(255,106,0,.22)', color: tx.accent }}>Tile mode</span>
              </span>
              <span style={{ marginLeft: 'auto', fontSize: 9, color: tx.textFaint, fontFamily: 'ui-monospace, monospace' }}>Workspace</span>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes gnu-blink { 0%, 49% { opacity: 1 } 50%, 100% { opacity: 0 } }`}</style>
      <Annot x={24} y={300} theme={tx}>32 h · icône loupe 13 · focus = border accent · caret blink 600 ms · esc chip à droite · résultats sous le champ</Annot>
    </CtxStageView>
  );
}

// C.17 — Connector arc / dashed line ───────────────────────────────
function CtxAtomConnector({ theme }) {
  const tx = theme || gnuTheme({ dark: false, brand: 'medium' });
  return (
    <CtxStageView theme={tx}>
      <div style={{ position: 'relative', width: 380, height: 220 }}>
        {/* Left menu silhouette */}
        <div style={{
          position: 'absolute', left: 10, top: 80, width: 130, height: 80, borderRadius: 10,
          background: tx.surface, border: `.5px solid ${tx.border}`, boxShadow: tx.shadow,
          padding: 6, display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{
              height: 18, borderRadius: 5, background: i === 1 ? tx.hover : 'transparent',
              padding: '0 6px', display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{ width: 8, height: 8, background: tx.accent, opacity: 0.55, borderRadius: 2 }} />
              <span style={{ flex: 1, height: 4, background: tx.kbdBg, borderRadius: 2 }} />
              {i === 1 && <span style={{ color: tx.accent, fontSize: 9, fontWeight: 700 }}>▸</span>}
            </div>
          ))}
        </div>
        {/* Right menu silhouette */}
        <div style={{
          position: 'absolute', left: 220, top: 100, width: 140, height: 100, borderRadius: 10,
          background: tx.surface, border: `.5px solid ${tx.border}`, boxShadow: tx.shadow,
          padding: 6, display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{ height: 16, borderRadius: 5, background: i === 0 ? tx.hover : 'transparent', padding: '0 6px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, background: tx.accent, opacity: 0.55, borderRadius: 2 }} />
              <span style={{ flex: 1, height: 4, background: tx.kbdBg, borderRadius: 2 }} />
            </div>
          ))}
        </div>
        {/* Connector */}
        <svg style={{ position: 'absolute', left: 138, top: 115, width: 84, height: 8, overflow: 'visible' }}>
          <path d="M0 4 H 82" stroke={tx.accent} strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
          <circle cx="0" cy="4" r="2" fill={tx.accent} />
          <circle cx="82" cy="4" r="2" fill={tx.accent} />
        </svg>
        <div style={{ position: 'absolute', left: 152, top: 92, fontSize: 9, color: tx.accent, fontFamily: 'ui-monospace, monospace', fontWeight: 700, letterSpacing: '0.06em' }}>
          gap 22 · dashed 2/2
        </div>
      </div>
      <Annot x={24} y={300} theme={tx}>1 px · dashed 2/2 · accent .6α · 2 px disks aux deux extrémités · sert à matérialiser parent → sub</Annot>
    </CtxStageView>
  );
}

// C.18 — Footer strip ──────────────────────────────────────────────
function CtxAtomFooter({ theme }) {
  const tx = theme || gnuTheme({ dark: false, brand: 'medium' });
  return (
    <CtxStageView theme={tx}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {[
          { l: 'app-menu widget · acts on focused window · 0x7F12', mono: true },
          { l: '↑↓ navigate · ⏎ activate · ⎋ close', mono: true, keys: true },
          { l: 'Reduced motion ON · spring degraded → ease-out', mono: false },
        ].map((f, i) => (
          <div key={i} style={{
            padding: '6px 12px', borderRadius: 7,
            background: tx.mode === 'dark' ? 'rgba(247,243,237,.03)' : 'rgba(17,20,24,.03)',
            border: `.5px solid ${tx.border}`,
            fontSize: 9.5, color: tx.textFaint,
            fontFamily: 'ui-monospace, monospace', letterSpacing: '0.04em',
            width: 280,
          }}>{f.l}</div>
        ))}
      </div>
      <Annot x={24} y={300} theme={tx}>9.5 px mono textFaint · padding 6/12 · sous la dernière section · meta · raccourcis · a11y notes</Annot>
    </CtxStageView>
  );
}

/* ════════════════════════════════════════════════════════════════════
   EXTRA SNIPPETS
   ════════════════════════════════════════════════════════════════════ */

SNIP['C.13'] = {
  neutral: `# radio row
height          30
radio circle    14 · 1.2px stroke · radius 7
selected fill   center 6 px · accent
group           name = single key  (model→value)
keyboard        ↑↓ cycle · Space pick · auto-focus first
règle           jamais > 6 options · au-delà → C.16 search`,
  css: `.gnu-radio { display: flex; align-items: center; gap: 10px;
  height: 30px; padding: 0 12px; border-radius: 7px;
  font: 500 12px/1 ui-sans-serif, system-ui; }
.gnu-radio__dot {
  width: 14px; height: 14px; border-radius: 7px;
  border: 1.2px solid var(--kbd-border);
  display: inline-flex; align-items: center; justify-content: center;
  transition: border-color 100ms;
}
.gnu-radio[aria-checked="true"] .gnu-radio__dot { border-color: var(--accent); }
.gnu-radio[aria-checked="true"] .gnu-radio__dot::after {
  content: ""; width: 6px; height: 6px; border-radius: 3px;
  background: var(--accent);
  animation: gnu-pick 140ms cubic-bezier(.32,.72,.32,1);
}
@keyframes gnu-pick { from { transform: scale(0); } to { transform: scale(1); } }`,
  qml: `// RadioRow.qml
ItemDelegate {
  id: radio
  property string label
  property bool checked: false
  height: 30
  background: Rectangle {
    radius: 7
    color: radio.hovered ? GnuTheme.hover : "transparent"
  }
  contentItem: RowLayout {
    spacing: 10
    Rectangle {
      width: 14; height: 14; radius: 7
      color: "transparent"
      border.width: 1.2
      border.color: radio.checked
        ? GnuTheme.accent : GnuTheme.kbdBorder
      Rectangle {
        anchors.centerIn: parent
        width: 6; height: 6; radius: 3
        color: GnuTheme.accent
        visible: radio.checked
        scale: radio.checked ? 1 : 0
        Behavior on scale { NumberAnimation {
          duration: 140; easing.type: Easing.OutCubic
        } }
      }
    }
    Label { text: radio.label; font.pixelSize: 12 }
  }
  onClicked: radio.checked = true
}`,
  qt: `class RadioRow : public QRadioButton {
public:
  RadioRow(const QString& l, QWidget* p=nullptr)
    : QRadioButton(l, p) {
    setFixedHeight(30);
    setStyleSheet(R"(
      QRadioButton {
        padding: 0 12px;
        font: 500 12px ui-sans-serif;
        spacing: 10px;
      }
      QRadioButton::indicator { width: 14px; height: 14px; }
      QRadioButton::indicator:unchecked {
        border: 1.2px solid %1; border-radius: 7px;
      }
      QRadioButton::indicator:checked {
        border: 1.2px solid %2; border-radius: 7px;
        image: url(:/gnu/radio-dot.svg);  /* 6×6 accent disc */
      }
    )"_qs.arg(GnuTheme::kbdBorder.name(),
              GnuTheme::accent.name()));
  }
};`,
  flutter: `class RadioRow extends StatelessWidget {
  const RadioRow({super.key, required this.label,
                  required this.checked, required this.onPick});
  final String label; final bool checked;
  final VoidCallback onPick;
  @override Widget build(BuildContext c) => InkWell(
    onTap: onPick,
    borderRadius: BorderRadius.circular(7),
    child: Container(
      height: 30, padding: const EdgeInsets.symmetric(horizontal: 12),
      child: Row(children: [
        AnimatedContainer(
          duration: const Duration(milliseconds: 100),
          width: 14, height: 14,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(width: 1.2,
              color: checked ? GnuTheme.accent : GnuTheme.kbdBorder),
          ),
          alignment: Alignment.center,
          child: AnimatedScale(
            scale: checked ? 1 : 0,
            duration: const Duration(milliseconds: 140),
            curve: Curves.easeOutCubic,
            child: Container(width: 6, height: 6,
              decoration: const BoxDecoration(shape: BoxShape.circle,
                color: GnuTheme.accent)),
          ),
        ),
        const SizedBox(width: 10),
        Text(label, style: const TextStyle(
          fontSize: 12, fontWeight: FontWeight.w500)),
      ]),
    ),
  );
}`,
};

SNIP['C.14'] = {
  neutral: `# slider
track h         4
fill            accent · width = value × 100%
knob            12 × 12 · #fff · radius 6 · shadow 0/1/3/.2 · border .5 theme.border
transition      800 ms cubic-bezier(.2,.7,.2,1)  (continuous value)
keyboard        ←/→ ±5%  ·  ↑/↓ ±5%  ·  Home 0 · End 100 · Shift+arrow ±25%
discrete variant   pas de track · 4 cellules · cell active = accent fill
règle           toujours afficher la valeur numérique à côté (mono · tabular)`,
  css: `.gnu-slider {
  position: relative; height: 4px;
  background: var(--kbd-bg); border-radius: 2px;
}
.gnu-slider__fill {
  position: absolute; left: 0; top: 0; bottom: 0;
  background: var(--accent); border-radius: 2px;
  transition: width 800ms cubic-bezier(.2,.7,.2,1);
}
.gnu-slider__knob {
  position: absolute; top: -4px;
  width: 12px; height: 12px; border-radius: 6px;
  background: #fff; transform: translateX(-6px);
  border: .5px solid var(--border);
  box-shadow: 0 1px 3px rgba(0,0,0,.2);
  transition: left 800ms cubic-bezier(.2,.7,.2,1);
}`,
  qml: `// Slider.qml
Slider {
  id: s
  background: Rectangle {
    height: 4; radius: 2
    color: GnuTheme.kbdBg
    Rectangle {
      width: s.visualPosition * parent.width
      height: parent.height; radius: parent.radius
      color: GnuTheme.accent
      Behavior on width { NumberAnimation {
        duration: 800; easing.type: Easing.OutQuart
      } }
    }
  }
  handle: Rectangle {
    x: s.visualPosition * (s.width - width)
    y: s.height/2 - height/2
    width: 12; height: 12; radius: 6
    color: "white"
    border.width: 0.5; border.color: GnuTheme.border
    layer.enabled: true
    layer.effect: DropShadow {
      verticalOffset: 1; radius: 3
      color: Qt.rgba(0,0,0,.2)
    }
  }
}`,
  qt: `class GnuSlider : public QSlider {
public:
  GnuSlider(QWidget* p=nullptr) : QSlider(Qt::Horizontal, p) {
    setFixedHeight(12);
    setStyleSheet(R"(
      QSlider::groove:horizontal { height: 4px;
        background: %1; border-radius: 2px; }
      QSlider::sub-page:horizontal { background: %2;
        border-radius: 2px; }
      QSlider::handle:horizontal {
        width: 12px; height: 12px; margin: -4px 0;
        background: white; border: .5px solid %3;
        border-radius: 6px;
      }
    )"_qs.arg(GnuTheme::kbdBg.name())
        .arg(GnuTheme::accent.name())
        .arg(GnuTheme::border.name()));
  }
};`,
  flutter: `class GnuSlider extends StatelessWidget {
  const GnuSlider({super.key, required this.value,
                   required this.onChanged});
  final double value;
  final ValueChanged<double> onChanged;
  @override Widget build(BuildContext c) => SliderTheme(
    data: SliderTheme.of(c).copyWith(
      trackHeight: 4,
      activeTrackColor: GnuTheme.accent,
      inactiveTrackColor: GnuTheme.kbdBg,
      thumbColor: Colors.white,
      thumbShape: const RoundSliderThumbShape(
        enabledThumbRadius: 6, elevation: 3),
      overlayShape: SliderComponentShape.noOverlay,
    ),
    child: Slider(value: value, onChanged: onChanged),
  );
}`,
};

SNIP['C.15'] = {
  neutral: `# state header
hauteur         h-content + 24 (12 pad top + 12 pad bottom)
bg              rgba(255,106,0, dark ? .06 : .05)  — bande tonale chaude
border          .5 px · theme.border · haut & bas
label           9.5 mono · 700 · 0.14em · accent
value           22 mono · 600 · -0.02em · tabular-nums · ink/paper
meta            11 mono · textDim · 1 ligne · pas de wrap
usage           première brique d'un menu de tray (audio · network · power)
règle           jamais > 1 par menu`,
  css: `.gnu-state {
  padding: 12px 14px;
  background: rgba(255,106,0,.05);
  border-top: .5px solid var(--border);
  border-bottom: .5px solid var(--border);
}
.gnu-state__head { display: flex; align-items: baseline; gap: 10px; }
.gnu-state__label {
  font: 700 9.5px/1 ui-monospace, monospace;
  letter-spacing: .14em; color: var(--accent);
}
.gnu-state__value {
  font: 600 22px/1 ui-monospace, monospace;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em; color: var(--fg1);
}
.gnu-state__meta {
  font: 400 11px/1.3 ui-monospace, monospace;
  color: var(--fg-dim); margin-top: 2px;
}`,
  qml: `// StateHeader.qml
Rectangle {
  property string label
  property string value
  property string meta
  color: Qt.rgba(1, 0.42, 0, 0.05)
  height: childrenRect.height + 24
  Column {
    anchors.fill: parent; anchors.margins: 12; spacing: 2
    Row {
      spacing: 10
      Label { text: parent.parent.label.toUpperCase()
              font.family: "IBM Plex Mono"
              font.pixelSize: 9.5; font.weight: Font.Bold
              font.letterSpacing: 1.33; color: GnuTheme.accent
              baseline: 1; verticalAlignment: Text.AlignBaseline }
      Label { text: parent.parent.value
              font.family: "IBM Plex Mono"
              font.pixelSize: 22; font.weight: Font.DemiBold
              font.letterSpacing: -0.44; color: GnuTheme.fg1 }
    }
    Label { text: parent.parent.meta
            font.family: "IBM Plex Mono"; font.pixelSize: 11
            color: GnuTheme.fgDim }
  }
}`,
  qt: `class StateHeader : public QFrame {
public:
  StateHeader(const QString& l, const QString& v,
              const QString& m, QWidget* p=nullptr) : QFrame(p) {
    setStyleSheet("background: rgba(255,106,0,.05);"
                  "border-top: .5px solid #DDD;"
                  "border-bottom: .5px solid #DDD;");
    auto* col = new QVBoxLayout(this);
    col->setContentsMargins(14,12,14,12); col->setSpacing(2);
    auto* head = new QHBoxLayout; head->setSpacing(10);
    auto* lbl = new QLabel(l.toUpper());
    lbl->setStyleSheet("color:#FF6A00; font:700 9.5px 'IBM Plex Mono';"
                       "letter-spacing:1.3px;");
    auto* val = new QLabel(v);
    val->setStyleSheet("color:#111; font:600 22px 'IBM Plex Mono';");
    head->addWidget(lbl); head->addWidget(val); head->addStretch();
    col->addLayout(head);
    auto* meta = new QLabel(m);
    meta->setStyleSheet("color:#666; font:11px 'IBM Plex Mono';");
    col->addWidget(meta);
  }
};`,
  flutter: `class StateHeader extends StatelessWidget {
  const StateHeader({super.key, required this.label,
                     required this.value, required this.meta});
  final String label, value, meta;
  @override Widget build(BuildContext c) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
    decoration: BoxDecoration(
      color: GnuTheme.accent.withOpacity(.05),
      border: const Border(
        top:    BorderSide(color: Color(0x14111418), width: .5),
        bottom: BorderSide(color: Color(0x14111418), width: .5),
      ),
    ),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
      Row(crossAxisAlignment: CrossAxisAlignment.baseline,
          textBaseline: TextBaseline.alphabetic, children: [
        Text(label.toUpperCase(), style: const TextStyle(
          fontFamily: 'IBMPlexMono', fontSize: 9.5,
          fontWeight: FontWeight.w700,
          letterSpacing: 1.33, color: GnuTheme.accent)),
        const SizedBox(width: 10),
        Text(value, style: const TextStyle(
          fontFamily: 'IBMPlexMono', fontSize: 22,
          fontWeight: FontWeight.w600,
          letterSpacing: -0.44)),
      ]),
      const SizedBox(height: 2),
      Text(meta, style: TextStyle(
        fontFamily: 'IBMPlexMono', fontSize: 11,
        color: GnuTheme.fgDim)),
    ]),
  );
}`,
};

SNIP['C.16'] = {
  neutral: `# search field
height          32
icon            magnifier 13 px · couleur = textDim → accent au focus
caret           1 × 14 · accent · blink 600 ms steps(2)
placeholder     "Search actions…"  · textFaint
focus border    .5 → accent
shortcut chip   "esc" visible au focus  (côté droit)
debounce        80 ms avant filtrage  (fluide sans flicker)
fuzzy           score = match start + tokens · keep top-5
règle           apparaît si > 6 rangées dans le menu courant`,
  css: `.gnu-search {
  display: flex; align-items: center; gap: 8px;
  height: 32px; padding: 0 12px; border-radius: 8px;
  background: var(--surface);
  border: .5px solid var(--border);
  transition: border-color 100ms;
}
.gnu-search:focus-within { border-color: var(--accent); }
.gnu-search__icon { width: 13px; height: 13px; color: var(--fg-dim); }
.gnu-search:focus-within .gnu-search__icon { color: var(--accent); }
.gnu-search input {
  flex: 1; border: none; outline: none; background: transparent;
  font: 500 12px/1 ui-sans-serif, system-ui;
  color: var(--fg1); caret-color: var(--accent);
}
.gnu-search input::placeholder { color: var(--fg-faint); }`,
  qml: `// SearchField.qml
Rectangle {
  id: sf
  property alias text: input.text
  height: 32; radius: 8
  color: GnuTheme.surface
  border.width: 0.5
  border.color: input.activeFocus
    ? GnuTheme.accent : GnuTheme.border
  Behavior on border.color { ColorAnimation { duration: 100 } }
  RowLayout {
    anchors.fill: parent
    anchors.leftMargin: 12; anchors.rightMargin: 12
    spacing: 8
    Image { source: "search.svg"; sourceSize: Qt.size(13,13) }
    TextField {
      id: input
      placeholderText: "Search actions\u2026"
      background: null
      font.family: "Inter"; font.pixelSize: 12
      cursorDelegate: Rectangle {
        width: 1; color: GnuTheme.accent
        SequentialAnimation on opacity { loops: -1
          NumberAnimation { to: 0; duration: 300 }
          NumberAnimation { to: 1; duration: 300 } }
      }
      Layout.fillWidth: true
    }
    KbdChip { glyph: "esc"; visible: input.activeFocus }
  }
}`,
  qt: `class SearchField : public QLineEdit {
public:
  SearchField(QWidget* p=nullptr) : QLineEdit(p) {
    setFixedHeight(32);
    setPlaceholderText("Search actions…");
    setStyleSheet(R"(
      QLineEdit {
        padding: 0 12px 0 32px;  /* room for icon */
        background: %1; border: .5px solid %2;
        border-radius: 8px; font: 500 12px 'Inter';
      }
      QLineEdit:focus { border-color: %3; }
    )"_qs.arg(GnuTheme::surface.name())
        .arg(GnuTheme::border.name())
        .arg(GnuTheme::accent.name()));
    // overlay magnifier icon as QLabel child
  }
  void keyPressEvent(QKeyEvent* e) override {
    if (e->key() == Qt::Key_Escape) { clear(); clearFocus(); return; }
    QLineEdit::keyPressEvent(e);
  }
};`,
  flutter: `class SearchField extends StatefulWidget {
  const SearchField({super.key, required this.onChanged});
  final ValueChanged<String> onChanged;
  @override State<SearchField> createState() => _SearchFieldState();
}
class _SearchFieldState extends State<SearchField> {
  final _node = FocusNode();
  final _ctrl = TextEditingController();
  Timer? _debounce;
  @override Widget build(BuildContext c) => AnimatedContainer(
    duration: const Duration(milliseconds: 100),
    height: 32, padding: const EdgeInsets.symmetric(horizontal: 12),
    decoration: BoxDecoration(
      color: GnuTheme.surface,
      borderRadius: BorderRadius.circular(8),
      border: Border.all(width: .5,
        color: _node.hasFocus ? GnuTheme.accent : GnuTheme.border),
    ),
    child: Row(children: [
      Icon(Icons.search, size: 13,
        color: _node.hasFocus ? GnuTheme.accent : GnuTheme.fgDim),
      const SizedBox(width: 8),
      Expanded(child: TextField(
        focusNode: _node, controller: _ctrl,
        cursorColor: GnuTheme.accent,
        decoration: const InputDecoration(
          isCollapsed: true, border: InputBorder.none,
          hintText: 'Search actions…'),
        style: const TextStyle(fontSize: 12),
        onChanged: (v) {
          _debounce?.cancel();
          _debounce = Timer(const Duration(milliseconds: 80),
            () => widget.onChanged(v));
        },
      )),
      if (_node.hasFocus) const KbdChip('esc'),
    ]),
  );
}`,
};

SNIP['C.17'] = {
  neutral: `# connector  (parent → sub)
1 px stroke · accent · alpha .6
dash 2/2 · linecap butt
2 px disks (radius) aux deux extrémités · même couleur, alpha 1
horizontal ou vertical · jamais courbé pour menus standards
courbé (arc Q) seulement pour expérimentations radiales
gap horizontal entre menus = 22 px (espace pour le connector)`,
  css: `.gnu-connector {
  position: absolute;
  pointer-events: none;
  height: 1px; background: transparent;
}
.gnu-connector::before, .gnu-connector::after {
  content: ""; position: absolute; top: -1.5px;
  width: 4px; height: 4px; border-radius: 2px;
  background: var(--accent);
}
.gnu-connector::before { left: 0; }
.gnu-connector::after  { right: 0; }
.gnu-connector__line {
  position: absolute; inset: 0;
  background: repeating-linear-gradient(90deg,
    var(--accent) 0 2px, transparent 2px 4px);
  opacity: 0.6;
}`,
  qml: `// Connector.qml
Canvas {
  id: conn
  property point from
  property point to
  property color stroke: GnuTheme.accent
  onPaint: {
    const c = getContext("2d");
    c.clearRect(0,0,width,height);
    c.strokeStyle = stroke; c.lineWidth = 1;
    c.globalAlpha = 0.6;
    c.setLineDash([2, 2]);
    c.beginPath(); c.moveTo(from.x, from.y);
    c.lineTo(to.x, to.y); c.stroke();
    c.globalAlpha = 1; c.fillStyle = stroke;
    c.beginPath(); c.arc(from.x, from.y, 2, 0, Math.PI*2); c.fill();
    c.beginPath(); c.arc(to.x,   to.y,   2, 0, Math.PI*2); c.fill();
  }
}`,
  qt: `void Connector::paintEvent(QPaintEvent*) {
  QPainter g(this); g.setRenderHint(QPainter::Antialiasing);
  QPen p(GnuTheme::accent, 1);
  p.setStyle(Qt::CustomDashLine);
  p.setDashPattern({2, 2});
  g.setPen(p); g.setOpacity(0.6);
  g.drawLine(_from, _to);
  g.setOpacity(1.0); g.setBrush(GnuTheme::accent);
  g.setPen(Qt::NoPen);
  g.drawEllipse(_from, 2, 2);
  g.drawEllipse(_to,   2, 2);
}`,
  flutter: `class Connector extends StatelessWidget {
  const Connector({super.key, required this.from, required this.to});
  final Offset from, to;
  @override Widget build(BuildContext c) => CustomPaint(
    painter: _ConnPainter(from, to), size: Size.infinite,
  );
}
class _ConnPainter extends CustomPainter {
  _ConnPainter(this.from, this.to);
  final Offset from, to;
  @override void paint(Canvas c, Size s) {
    final p = Paint()..color = GnuTheme.accent.withOpacity(.6)
      ..strokeWidth = 1..style = PaintingStyle.stroke;
    final path = Path()..moveTo(from.dx, from.dy)
      ..lineTo(to.dx, to.dy);
    c.drawPath(_dashPath(path, 2, 2), p);
    final dot = Paint()..color = GnuTheme.accent;
    c.drawCircle(from, 2, dot);
    c.drawCircle(to,   2, dot);
  }
  @override bool shouldRepaint(_) => true;
}`,
};

SNIP['C.18'] = {
  neutral: `# footer strip
hauteur         24 (1 ligne)
padding         6 × 12
bg              rgba(ink/paper, .03)  — bande quasi-transparente
border          .5 × theme.border
font            9.5 mono · textFaint · 0.04em
contenu         meta (id, état, raccourcis, accessibilité)
position        toujours en bas, après la dernière section
optionnel       jamais empilé · jamais > 1 par menu`,
  css: `.gnu-footer {
  padding: 6px 12px;
  background: rgba(17,20,24,.03);
  border-top: .5px solid var(--border);
  font: 400 9.5px/1.3 ui-monospace, monospace;
  letter-spacing: .04em;
  color: var(--fg-faint);
}`,
  qml: `// Footer.qml
Rectangle {
  height: 24
  color: Qt.rgba(0, 0, 0, 0.03)
  Label {
    anchors.fill: parent
    anchors.leftMargin: 12; anchors.rightMargin: 12
    verticalAlignment: Text.AlignVCenter
    text: footer.text
    font.family: "IBM Plex Mono"
    font.pixelSize: 9.5
    color: GnuTheme.fgFaint
  }
}`,
  qt: `auto* f = new QLabel(text, this);
f->setFixedHeight(24);
f->setContentsMargins(12, 0, 12, 0);
f->setStyleSheet(
  "background: rgba(17,20,24,.03);"
  "border-top: .5px solid " + GnuTheme::border.name() + ";"
  "color: " + GnuTheme::fgFaint.name() + ";"
  "font: 400 9.5px 'IBM Plex Mono';"
);`,
  flutter: `class GnuFooter extends StatelessWidget {
  const GnuFooter(this.text, {super.key});
  final String text;
  @override Widget build(BuildContext c) => Container(
    height: 24, padding: const EdgeInsets.symmetric(horizontal: 12),
    decoration: BoxDecoration(
      color: Colors.black.withOpacity(.03),
      border: Border(top: BorderSide(
        color: GnuTheme.border, width: .5)),
    ),
    alignment: Alignment.centerLeft,
    child: Text(text, style: TextStyle(
      fontFamily: 'IBMPlexMono', fontSize: 9.5,
      letterSpacing: .4, color: GnuTheme.fgFaint)),
  );
}`,
};

/* ════════════════════════════════════════════════════════════════════
   ATOM REGISTRY EXTENSION
   ════════════════════════════════════════════════════════════════════ */

const CTX_ATOMS_EXTRA = [
  { id: 'C.13', title: 'Radio row',
    sub: 'Cercle 14 + pastille 6 px accent. Pour les choix exclusifs (sortie audio, layout actif).',
    demo: CtxAtomRadio,        snip: SNIP['C.13'],
    tokens: [['height','30 px'],['circle','14 · 1.2 px stroke'],['fill','6 px · accent'],['group','name unique (radio model)'],['max options','6 avant search']],
    states: ['rest','hover','checked','focus','disabled'],
    a11y: { role: 'radio', name: 'aria-checked', keyboard: '↑↓ cycle · Space pick · Tab next group' } },

  { id: 'C.14', title: 'Slider',
    sub: 'Track 4 px + knob 12 px · transition 800 ms. Continu (volume) ou discret (S/M/L/XL).',
    demo: CtxAtomSlider,       snip: SNIP['C.14'],
    tokens: [['track','4 h · kbdBg'],['fill','accent'],['knob','12 px · white · radius 6'],['ease','cubic-bezier(.2,.7,.2,1)'],['value','toujours affichée · tabular-nums']],
    states: ['rest','hover','dragging','focus','disabled'],
    a11y: { role: 'slider', name: 'aria-valuenow + aria-valuetext', keyboard: '←/→ ±5 · Shift ±25 · Home/End 0/100' } },

  { id: 'C.15', title: 'State header',
    sub: 'Bande tonale chaude · label + grosse valeur + meta. Première brique des menus de tray.',
    demo: CtxAtomStateHeader,  snip: SNIP['C.15'],
    tokens: [['bg','rgba(255,106,0,.05)'],['label','9.5 / 700 / 0.14em accent'],['value','22 / 600 / -0.02em mono'],['meta','11 mono dim'],['borders','.5 px top + bottom']],
    states: ['rest','live-update','stale'],
    a11y: { role: 'status', name: 'aria-live="polite"', keyboard: 'non-interactive' } },

  { id: 'C.16', title: 'Search field',
    sub: 'Magnifier + caret blink + esc chip. Apparaît si la liste dépasse 6 rangées.',
    demo: CtxAtomSearch,       snip: SNIP['C.16'],
    tokens: [['height','32 px'],['icon','13 · textDim → accent au focus'],['border focus','accent'],['caret blink','600 ms steps(2)'],['debounce','80 ms']],
    states: ['rest','focus','typing','empty','results'],
    a11y: { role: 'searchbox', name: 'aria-label="Search menu actions"', keyboard: '↑↓ navigate · ⏎ pick · ⎋ close · ⌫ clear' } },

  { id: 'C.17', title: 'Connector',
    sub: '1 px dashed accent · disks aux extrémités. Matérialise la relation parent → sub.',
    demo: CtxAtomConnector,    snip: SNIP['C.17'],
    tokens: [['stroke','1 px accent · α .6'],['dash','2 / 2 · butt linecap'],['endpoints','disks 2 px · α 1'],['gap','22 px entre menus'],['orientation','horizontal · jamais courbé en standard']],
    states: ['idle','active (parent hovered)'],
    a11y: { role: 'presentation', name: 'décoratif · aria-hidden', keyboard: 'non-interactive' } },

  { id: 'C.18', title: 'Footer strip',
    sub: 'Méta · raccourcis · notes a11y. 1 ligne mono à la base du menu.',
    demo: CtxAtomFooter,       snip: SNIP['C.18'],
    tokens: [['height','24 px'],['padding','6 × 12'],['bg','rgba(ink,.03)'],['font','9.5 mono textFaint'],['scope','1 par menu max']],
    states: ['rest'],
    a11y: { role: 'status', name: 'aria-label décrit le contenu', keyboard: 'non-interactive · contient des hints' } },
];

/* ════════════════════════════════════════════════════════════════════
   Patch CTX_ATOMS (C.01..C.12) with states + a11y metadata so the new
   CtxSpec renderer can show consistent blocks everywhere.
   ════════════════════════════════════════════════════════════════════ */

const _CTX_STATES = {
  'C.01': ['rest', 'hover', 'press', 'focus', 'disabled'],
  'C.02': ['rest', 'hover (tick + bg)', 'press', 'sub-open (tick stays)'],
  'C.03': ['rest', 'parent-row hover (chips dim ↑)', 'pressed key (chip flash)'],
  'C.04': ['rest', 'parent hover (color + translateX +2)', 'sub-open (color stays)'],
  'C.05': ['off', 'on', 'press (knob shrinks 1 px)', 'disabled'],
  'C.06': ['rest', 'hover', 'selected (tick + check overlay)'],
  'C.07': ['rest', 'collapsed (chevron · optional)'],
  'C.08': ['rest'],
  'C.09': ['closed', 'opening (M.01 mask)', 'open', 'closing (M.02)'],
  'C.10': ['filled', 'outline', 'dim (when not focused)'],
  'C.11': ['rest', 'hover', 'sub-open'],
  'C.12': ['idle', 'listening (pulse breathe)', 'speaking', 'rest+focus'],
};

const _CTX_A11Y = {
  'C.01': { role: 'menuitem',     name: 'aria-label = label',
            keyboard: '↑↓ navigate · ⏎ activate · ⎋ close' },
  'C.02': { role: 'menuitem',     name: 'aria-current="true" quand actif',
            keyboard: 'hover via souris · focus via clavier — même style' },
  'C.03': { role: 'presentation', name: 'décoratif · aria-keyshortcuts sur le row parent',
            keyboard: 'le row écoute le combo · le chip est visuel uniquement' },
  'C.04': { role: 'presentation', name: 'aria-haspopup="menu" sur le row',
            keyboard: '→ ouvre · ← ferme (cf. menu-cascade)' },
  'C.05': { role: 'menuitemcheckbox', name: 'aria-checked',
            keyboard: 'Space toggle · ⏎ aussi accepté' },
  'C.06': { role: 'menuitemradio', name: 'aria-checked dans un group',
            keyboard: '↑↓ cycle dans le group · Space pick' },
  'C.07': { role: 'group',        name: 'aria-label = label section',
            keyboard: 'pas focusable · regroupe ses rows' },
  'C.08': { role: 'separator',    name: 'aria-orientation="horizontal"',
            keyboard: 'non-focusable' },
  'C.09': { role: 'menu',         name: 'aria-label si pas de label visible',
            keyboard: '⎋ ferme · ⇥ exit focus · prevent default sur right-click' },
  'C.10': { role: 'presentation', name: 'décoratif · texte lisible par AT via aria-label sur menu parent',
            keyboard: 'non-focusable' },
  'C.11': { role: 'menuitem',     name: 'aria-label combine label + sub',
            keyboard: 'identique à C.01' },
  'C.12': { role: 'menuitem',     name: 'aria-label="Summon assistant"',
            keyboard: '⌘K aussi déclenche depuis n\'importe où' },
};

if (typeof CTX_ATOMS !== 'undefined') {
  CTX_ATOMS.forEach((a) => {
    a.states = _CTX_STATES[a.id] || [];
    a.a11y   = _CTX_A11Y[a.id] || null;
  });
}

Object.assign(window, { CTX_ATOMS_EXTRA });
