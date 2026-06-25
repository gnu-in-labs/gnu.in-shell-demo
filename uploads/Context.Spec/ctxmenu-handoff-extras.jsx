// ctxmenu-handoff-extras.jsx
// Three extra handoff boards to flesh out the "fiche → code" sprint :
//   ◆.3 Repo & file layout · three engines side-by-side
//   ◆.4 Sprint plan       · 3 sprints, deliverables, gates
//   ◆.5 API surface       · public symbols typed across QML / Qt / Flutter

/* ════════════════════════════════════════════════════════════════════
   ◆.3 — Repo & file layout
   Three columns : Quickshell (QML), Qt C++, Flutter. Same shape,
   different idioms. Tree drawn with monospaced glyphs so it survives
   copy-paste into a README without rebuilding.
   ════════════════════════════════════════════════════════════════════ */

const REPO_TREES = {
  qml: [
    { d: 0, name: 'gnu-in-shell/', tag: 'root',  c: '#FF6A00' },
    { d: 1, name: 'gnu_theme/',    tag: 'pkg' },
    { d: 2, name: 'GnuTheme.qml',  tag: 'singleton' },
    { d: 2, name: 'tokens.json',   tag: 'source-of-truth' },
    { d: 1, name: 'primitives/',   tag: '24 atoms' },
    { d: 2, name: 'GnuRow.qml' },
    { d: 2, name: 'GnuShell.qml' },
    { d: 2, name: 'GnuToggle.qml' },
    { d: 2, name: 'GnuKbd.qml' },
    { d: 2, name: 'GnuSlider.qml' },
    { d: 2, name: '…  ·  19 autres' },
    { d: 1, name: 'molecules/',    tag: '16 compos' },
    { d: 2, name: 'GnuSection.qml' },
    { d: 2, name: 'GnuStrip.qml',    tag: 'CM.02' },
    { d: 2, name: 'GnuIdentityHeader.qml' },
    { d: 2, name: '…  ·  13 autres' },
    { d: 1, name: 'recipes/',     tag: '8 archetypes' },
    { d: 2, name: 'EmptySpaceMenu.qml' },
    { d: 2, name: 'BubbleTreeMenu.qml', tag: '★ R.04' },
    { d: 2, name: 'LauncherMenu.qml',   tag: '✦ R.08' },
    { d: 1, name: 'shell/',       tag: 'glue' },
    { d: 2, name: 'MenuBus.qml',  tag: 'right-click bus' },
    { d: 2, name: 'GnuContextMenu.qml' },
  ],
  qt: [
    { d: 0, name: 'gnu-in-shell-qt/', tag: 'root',  c: '#FF6A00' },
    { d: 1, name: 'include/gnuin/' },
    { d: 2, name: 'gnu_theme.h',  tag: 'constexpr struct' },
    { d: 2, name: 'gnu_row.h' },
    { d: 2, name: 'gnu_shell.h' },
    { d: 2, name: 'gnu_context_menu.h' },
    { d: 1, name: 'src/' },
    { d: 2, name: 'gnu_theme.cpp' },
    { d: 2, name: 'primitives/' },
    { d: 3, name: 'gnu_row.cpp' },
    { d: 3, name: 'gnu_shell.cpp' },
    { d: 3, name: '…  ·  22 autres' },
    { d: 2, name: 'molecules/' },
    { d: 3, name: 'gnu_section.cpp' },
    { d: 3, name: '…  ·  15 autres' },
    { d: 2, name: 'recipes/' },
    { d: 3, name: 'empty_space_menu.cpp' },
    { d: 3, name: 'bubble_tree_menu.cpp', tag: '★' },
    { d: 1, name: 'resources/' },
    { d: 2, name: 'tokens.json',  tag: 'shared' },
    { d: 2, name: 'icons.qrc',    tag: '28 SVG' },
    { d: 1, name: 'tests/' },
    { d: 2, name: 'menu_unit_tests.cpp' },
    { d: 2, name: 'a11y_tests.cpp' },
  ],
  flu: [
    { d: 0, name: 'gnu_in_shell/', tag: 'package',  c: '#FF6A00' },
    { d: 1, name: 'lib/' },
    { d: 2, name: 'gnu_in_shell.dart', tag: 'barrel' },
    { d: 2, name: 'theme/' },
    { d: 3, name: 'gnu_theme.dart' },
    { d: 3, name: 'tokens.dart' },
    { d: 2, name: 'primitives/' },
    { d: 3, name: 'gnu_row.dart' },
    { d: 3, name: 'gnu_shell.dart' },
    { d: 3, name: 'gnu_toggle.dart' },
    { d: 3, name: '…  ·  21 autres' },
    { d: 2, name: 'molecules/' },
    { d: 3, name: 'gnu_section.dart' },
    { d: 3, name: '…  ·  15 autres' },
    { d: 2, name: 'recipes/' },
    { d: 3, name: 'empty_space_menu.dart' },
    { d: 3, name: 'bubble_tree_menu.dart', tag: '★' },
    { d: 1, name: 'assets/' },
    { d: 2, name: 'tokens.json',  tag: 'shared' },
    { d: 2, name: 'icons/',       tag: '28 SVG' },
    { d: 1, name: 'test/' },
    { d: 2, name: 'widget_test.dart' },
    { d: 2, name: 'golden/',      tag: '54 snapshots' },
  ],
};

function CtxHandoffRepo() {
  const colors = ['#FF6A00', '#5F7F52', '#3D8DCC'];
  const titles = [
    { k: 'qml', label: 'QUICKSHELL', sub: 'gnu-in-shell · QML 6.6+' },
    { k: 'qt',  label: 'QT C++',     sub: 'libgnuin · Qt 6.6 · CMake' },
    { k: 'flu', label: 'FLUTTER',    sub: 'gnu_in_shell · Dart 3.3+' },
  ];
  return (
    <FitScale w={1280} h={720} background="#FBFAF6">
      <div style={{
        width: 1280, height: 720, background: '#FBFAF6', color: '#111418',
        padding: 52, boxSizing: 'border-box', overflow: 'auto',
        fontFamily: 'ui-sans-serif, system-ui, sans-serif'
      }}>
        <div style={{ fontSize: 10, color: '#FF6A00', fontWeight: 700, letterSpacing: '0.18em', fontFamily: 'ui-monospace, monospace' }}>◆.3 · REPO LAYOUT · 3 MOTEURS</div>
        <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em', marginTop: 6 }}>Même squelette, trois idiomes.</div>
        <div style={{ fontSize: 13, color: 'rgba(17,20,24,.6)', marginTop: 4, maxWidth: 880, lineHeight: 1.5 }}>
          Trois packages, un seul tokens.json partagé. Chaque moteur empile <i>theme → primitives → molecules → recipes</i> de bas en haut. Les noms et la hiérarchie sont normatifs — un dev ne devrait jamais avoir à chercher où vit GnuRow.
        </div>

        <div style={{ marginTop: 22, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {titles.map((t, idx) => {
            const color = colors[idx];
            const tree = REPO_TREES[t.k];
            return (
              <div key={t.k} style={{
                background: '#FFFFFF', border: '.5px solid rgba(17,20,24,.08)',
                borderRadius: 10, padding: 18, boxShadow: '0 1px 3px rgba(17,20,24,.04)',
              }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', borderBottom: '.5px solid rgba(17,20,24,.06)', paddingBottom: 10, marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', fontFamily: 'ui-monospace, monospace', color }}>{t.label}</div>
                    <div style={{ fontSize: 10, color: 'rgba(17,20,24,.55)', fontFamily: 'ui-monospace, monospace', marginTop: 3 }}>{t.sub}</div>
                  </div>
                  <span style={{ fontSize: 9, fontFamily: 'ui-monospace, monospace', fontWeight: 700, letterSpacing: '0.1em', color: '#FFF', background: color, padding: '2px 7px', borderRadius: 3 }}>{idx + 1}/3</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, fontFamily: 'ui-monospace, monospace', fontSize: 10.5, lineHeight: 1.55 }}>
                  {tree.map((row, i) => {
                    const indent = '  '.repeat(row.d);
                    const glyph = row.d === 0 ? '' : '· ';
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                        <span style={{
                          color: row.d === 0 ? (row.c || '#111418') : 'rgba(17,20,24,.7)',
                          fontWeight: row.d === 0 ? 700 : (row.name.endsWith('/') ? 600 : 400),
                          whiteSpace: 'pre',
                        }}>{indent}{glyph}{row.name}</span>
                        {row.tag && (
                          <span style={{
                            fontSize: 8.5, fontFamily: 'ui-monospace, monospace',
                            color: row.tag.startsWith('★') ? '#FF6A00' : 'rgba(17,20,24,.45)',
                            fontWeight: row.tag.startsWith('★') ? 700 : 500,
                            letterSpacing: '0.04em',
                          }}>{row.tag}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{
          marginTop: 18, padding: 14, background: '#111418', color: '#F7F3ED',
          borderRadius: 8, fontSize: 11, fontFamily: 'ui-monospace, monospace',
          display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
        }}>
          <span style={{ color: '#FF6A00', fontWeight: 700, letterSpacing: '0.12em' }}>RÈGLE</span>
          <span>tokens.json est la source unique · les trois packages lisent le même fichier en build-time</span>
          <span style={{ marginLeft: 'auto', opacity: .6 }}>generated · ne pas éditer les fichiers .h / .qml / .dart de theme à la main</span>
        </div>
      </div>
    </FitScale>
  );
}


/* ════════════════════════════════════════════════════════════════════
   ◆.4 — Sprint plan
   Three sprints, two weeks each, with deliverables, owners (placeholder)
   and a "ship gate" per sprint. Visual = stacked horizontal cards with
   a thin Gantt strip across the top.
   ════════════════════════════════════════════════════════════════════ */

const SPRINTS = [
  {
    n: '01', code: 'TOKENS',
    title: 'GnuTheme · 3 sorties depuis un JSON',
    weeks: 'W1 — W2', dates: '2026.06.01 → 06.14',
    owner: 'design infra · 1 dev', risk: 'low',
    deliverables: [
      'tokens.json canonique · 4 core + 6 derived + density × shape',
      'générateur : tokens.json → GnuTheme.qml / .h / .dart',
      'snapshot tests : hex roundtrip identique sur les trois sorties',
      'doc · diff vs Motion Spec tokens (le run-time les partage)',
    ],
    gate: 'compile sur les trois moteurs · hex identiques au pixel près',
  },
  {
    n: '02', code: 'PRIMITIVES',
    title: '24 atomes + 16 molécules portés',
    weeks: 'W3 — W6', dates: '2026.06.15 → 07.12',
    owner: 'shell team · 3 devs', risk: 'medium',
    deliverables: [
      '24 atomes (sect. 2) : GnuRow / GnuKbd / GnuToggle / …',
      '16 molécules (sect. 3) : GnuSection / GnuStrip / GnuIdentityHeader …',
      'storybook par moteur : 1 page = 1 atome avec ses 3-6 états',
      'a11y · roles ARIA déclarés + focus rings théméables',
      'i18n harness : EN / FR / DE / JA / AR (RTL)',
    ],
    gate: 'parité visuelle 100 % vs la fiche · QML/Qt/Flutter pixel-diff < 1 px',
  },
  {
    n: '03', code: 'CONTRACTS',
    title: '8 recettes branchées sur les triggers shell',
    weeks: 'W7 — W10', dates: '2026.07.13 → 08.09',
    owner: 'shell team + UX · 4 devs', risk: 'high',
    deliverables: [
      'GnuContextMenu(archetype) · config-driven',
      '8 recettes (R.01 → R.08) : empty / widget / window / ★bubble / tray / notif / power / ✦launcher',
      'right-click bus · jamais sur le contenu app',
      'bind Motion Spec : M.01..M.12 aux moments d\'ouverture/fermeture',
      'perf : open < 16 ms · 60 fps continu sur low-end GPU',
    ],
    gate: 'dogfood interne 2 semaines · zéro régression Qt 5 fallback · readiness ◇.6 verte',
  },
];

function CtxHandoffSprints() {
  const total = 10; // weeks
  return (
    <FitScale w={1280} h={720} background="#FBFAF6">
      <div style={{
        width: 1280, height: 720, background: '#FBFAF6', color: '#111418',
        padding: 52, boxSizing: 'border-box', overflow: 'auto',
        fontFamily: 'ui-sans-serif, system-ui, sans-serif'
      }}>
        <div style={{ fontSize: 10, color: '#FF6A00', fontWeight: 700, letterSpacing: '0.18em', fontFamily: 'ui-monospace, monospace' }}>◆.4 · SPRINT PLAN · 10 SEMAINES · 3 GATES</div>
        <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em', marginTop: 6 }}>De la fiche au dogfood en dix semaines.</div>
        <div style={{ fontSize: 13, color: 'rgba(17,20,24,.6)', marginTop: 4, maxWidth: 880, lineHeight: 1.5 }}>
          Trois sprints isolables. Chacun ferme une porte (gate) avant que le suivant ne démarre. Pas de big-bang, pas de feature flag en prod.
        </div>

        {/* Gantt strip */}
        <div style={{
          marginTop: 22, padding: 14, background: '#111418', borderRadius: 10,
          color: '#F7F3ED', fontFamily: 'ui-monospace, monospace',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 9, letterSpacing: '0.12em', color: 'rgba(247,243,237,.5)', fontWeight: 700, marginBottom: 8 }}>
            <span style={{ color: '#FF6A00' }}>TIMELINE</span>
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: `repeat(${total}, 1fr)`, gap: 2 }}>
              {Array.from({ length: total }, (_, i) => (
                <div key={i} style={{ textAlign: 'center', color: 'rgba(247,243,237,.4)' }}>W{i + 1}</div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {[
              { code: '01 · TOKENS',     start: 0, span: 2, color: '#FF6A00' },
              { code: '02 · PRIMITIVES', start: 2, span: 4, color: '#5F7F52' },
              { code: '03 · CONTRACTS',  start: 6, span: 4, color: '#3D8DCC' },
            ].map((s) => (
              <div key={s.code} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: s.color, letterSpacing: '0.08em', minWidth: 130 }}>{s.code}</span>
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: `repeat(${total}, 1fr)`, gap: 2, height: 14 }}>
                  {Array.from({ length: total }, (_, i) => (
                    <div key={i} style={{
                      background: i >= s.start && i < s.start + s.span ? s.color : 'rgba(247,243,237,.06)',
                      borderRadius: 2,
                    }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sprint cards */}
        <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          {SPRINTS.map((s) => {
            const riskTone = s.risk === 'low' ? '#5F7F52' : s.risk === 'medium' ? '#E8A227' : '#E63A1F';
            return (
              <div key={s.n} style={{
                background: '#FFFFFF', border: '.5px solid rgba(17,20,24,.08)',
                borderRadius: 10, padding: 18, display: 'flex', flexDirection: 'column', gap: 10,
              }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                    <span style={{ fontSize: 28, fontWeight: 700, color: '#FF6A00', fontFamily: 'ui-monospace, monospace', lineHeight: 1 }}>{s.n}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', fontFamily: 'ui-monospace, monospace', color: '#FF6A00' }}>{s.code}</span>
                  </div>
                  <span style={{ fontSize: 9, padding: '2px 7px', background: riskTone, color: '#FFF', borderRadius: 3, fontFamily: 'ui-monospace, monospace', fontWeight: 700, letterSpacing: '0.08em' }}>{s.risk.toUpperCase()}</span>
                </div>

                <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.3 }}>{s.title}</div>

                <div style={{ fontSize: 10, fontFamily: 'ui-monospace, monospace', color: 'rgba(17,20,24,.55)', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div><span style={{ color: '#FF6A00', fontWeight: 700 }}>weeks</span> {s.weeks}</div>
                  <div><span style={{ color: '#FF6A00', fontWeight: 700 }}>dates</span> {s.dates}</div>
                  <div><span style={{ color: '#FF6A00', fontWeight: 700 }}>owner</span> {s.owner}</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 4 }}>
                  {s.deliverables.map((d, i) => (
                    <div key={i} style={{ display: 'flex', gap: 6, fontSize: 11, lineHeight: 1.45 }}>
                      <span style={{ color: '#FF6A00', flexShrink: 0 }}>▸</span>
                      <span>{d}</span>
                    </div>
                  ))}
                </div>

                <div style={{
                  marginTop: 'auto', padding: '8px 10px', background: 'rgba(255,106,0,.06)',
                  border: '.5px dashed rgba(255,106,0,.4)', borderRadius: 6,
                  fontSize: 10.5, lineHeight: 1.5,
                }}>
                  <span style={{ color: '#FF6A00', fontFamily: 'ui-monospace, monospace', fontWeight: 700, letterSpacing: '0.1em', fontSize: 9, marginRight: 6 }}>GATE</span>
                  {s.gate}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </FitScale>
  );
}


/* ════════════════════════════════════════════════════════════════════
   ◆.5 — API surface
   The five most-used public components, with their typed signatures
   across QML / Qt / Flutter. Compile-target view — what a dev sees
   when they reach for autocomplete.
   ════════════════════════════════════════════════════════════════════ */

const API_SURFACE = [
  {
    sym: 'GnuRow', tag: 'C.01 atome',
    blurb: 'La rangée canonique. icon + label + (sub) + (kbd) + (chevron submenu). Toutes les autres rangées en héritent.',
    sigs: {
      qml: `GnuRow {
  icon:     string        // canonical name (cf. ◇.1)
  label:    string
  subLabel: string?       // grayed second line
  kbd:      list<string>? // ["⌘","⇧","W"]
  submenu:  bool          // chevron-right
  toggle:   bool?         // bind state ref
  danger:   bool          // red row, isolated
  on triggered() {}
}`,
      qt: `class GnuRow : public GnuMenuItem {
  Q_PROPERTY(QString  icon     READ icon     WRITE setIcon)
  Q_PROPERTY(QString  label    READ label    WRITE setLabel)
  Q_PROPERTY(QString  subLabel READ subLabel WRITE setSubLabel)
  Q_PROPERTY(QStringList kbd   READ kbd      WRITE setKbd)
  Q_PROPERTY(bool     submenu  READ isSubmenu WRITE setSubmenu)
  Q_PROPERTY(bool     danger   READ isDanger  WRITE setDanger)
signals:
  void triggered();
};`,
      flu: `class GnuRow extends GnuMenuItem {
  final String        icon;
  final String        label;
  final String?       subLabel;
  final List<String>? kbd;
  final bool          submenu;
  final ValueListenable<bool>? toggle;
  final bool          danger;
  final VoidCallback? onTriggered;
  const GnuRow({ ... });
}`,
    },
  },
  {
    sym: 'GnuContextMenu', tag: 'shell glue',
    blurb: 'L\'orchestrateur. Reçoit un archetype (01..08), wire le trigger, dessine au curseur, joue la motion.',
    sigs: {
      qml: `GnuContextMenu {
  archetype: string       // "01"..."08" (cf. recipes)
  trigger:   var          // Quickshell signal
  width:     int          // default per archetype
  density:   string       // "mouse" | "comfy" | "touch"
  on openAt(point p) {}
  on dismissed() {}
}`,
      qt: `class GnuContextMenu : public QWidget {
  Q_PROPERTY(GnuArchetype archetype READ archetype WRITE setArchetype)
  Q_PROPERTY(int          width     READ width     WRITE setWidth)
  Q_PROPERTY(GnuDensity   density   READ density   WRITE setDensity)
public:
  void openAt(QPoint pos);
  GnuSection* addSection(QString label);
  GnuRow*     addRow(GnuRowSpec spec);
signals:
  void dismissed();
};`,
      flu: `class GnuContextMenu {
  GnuContextMenu({
    required GnuArchetype archetype,
    int width = 224,
    GnuDensity density = GnuDensity.mouse,
  });
  Future<void> openAt(Offset position);
  void dismiss();
}`,
    },
  },
  {
    sym: 'GnuTheme', tag: 'tokens',
    blurb: 'Résolveur de tokens. Lit (dark, brand) et expose la surface / accent / shadow / radii consommés par tous les atomes.',
    sigs: {
      qml: `pragma Singleton
QtObject {
  property bool   dark
  property string brand   // "light" | "medium" | "heavy"
  property color  surface
  property color  accent
  property color  border
  property string shadow
  property var    radii   // { menu, row, kbd }
}`,
      qt: `struct GnuTheme {
  bool         dark;
  GnuBrand     brand;
  QColor       surface;
  QColor       accent;
  QColor       border;
  QString      shadow;
  struct { int menu, row, kbd; } radii;
  static GnuTheme resolve(bool dark, GnuBrand brand);
};`,
      flu: `class GnuTheme {
  final bool   dark;
  final GnuBrand brand;
  final Color  surface;
  final Color  accent;
  final Color  border;
  final List<BoxShadow> shadow;
  final GnuRadii radii;
  factory GnuTheme.resolve({
    required bool dark, required GnuBrand brand,
  });
}`,
    },
  },
  {
    sym: 'GnuShell', tag: 'C.09 atome',
    blurb: 'Le contenant. Borne le menu, applique shape preset + shadow + clip-path éventuel. Reçoit n\'importe quel enfant.',
    sigs: {
      qml: `GnuShell {
  width:    int
  shape:    string      // "rounded" | "sharp" | "pill" | "cut"
  density:  string
  default property alias content
}`,
      qt: `class GnuShell : public QFrame {
  Q_PROPERTY(int        width   READ width   WRITE setWidth)
  Q_PROPERTY(GnuShape   shape   READ shape   WRITE setShape)
  Q_PROPERTY(GnuDensity density READ density WRITE setDensity)
public:
  void setContent(QWidget* content);
};`,
      flu: `class GnuShell extends StatelessWidget {
  final double      width;
  final GnuShape    shape;
  final GnuDensity  density;
  final Widget      child;
  const GnuShell({ ... });
}`,
    },
  },
  {
    sym: 'GnuToggle', tag: 'C.04 atome',
    blurb: 'Rangée avec switch droit. Bind sur un ValueListenable / property / bool ref. Cycle on / off / mixed.',
    sigs: {
      qml: `GnuToggle {
  icon:    string
  label:   string
  bind:    var       // 2-way ref to bool
  mixed:   bool      // tri-state
  on changed(bool v) {}
}`,
      qt: `class GnuToggle : public GnuMenuItem {
  Q_PROPERTY(bool* bind   READ bind   WRITE setBind)
  Q_PROPERTY(bool  mixed  READ mixed  WRITE setMixed)
signals:
  void changed(bool v);
};`,
      flu: `class GnuToggle extends GnuMenuItem {
  final String icon;
  final String label;
  final ValueNotifier<bool> bind;
  final bool   mixed;
  final ValueChanged<bool>? onChanged;
  const GnuToggle({ ... });
}`,
    },
  },
];

function CtxHandoffApi() {
  const [active, setActive] = React.useState(0);
  const [engine, setEngine] = React.useState('qml');
  const item = API_SURFACE[active];
  const engines = [
    { k: 'qml', label: 'QML',     color: '#FF6A00' },
    { k: 'qt',  label: 'QT · C++', color: '#5F7F52' },
    { k: 'flu', label: 'FLUTTER', color: '#3D8DCC' },
  ];
  return (
    <FitScale w={1280} h={720} background="#0B0D10">
      <div style={{
        width: 1280, height: 720, background: '#0B0D10', color: '#F7F3ED',
        padding: 52, boxSizing: 'border-box', overflow: 'auto',
        fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        position: 'relative',
      }}>
        <DitherBg color="#FF6A00" opacity={0.05} />
        <GrainBg opacity={0.06} />
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 10, color: '#FF6A00', fontWeight: 700, letterSpacing: '0.18em', fontFamily: 'ui-monospace, monospace' }}>◆.5 · API SURFACE · 5 SYMBOLES PUBLICS</div>
          <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em', marginTop: 6 }}>Ce que le dev voit en autocomplete.</div>
          <div style={{ fontSize: 13, color: 'rgba(247,243,237,.6)', marginTop: 4, maxWidth: 880, lineHeight: 1.5 }}>
            Les cinq symboles publics les plus utilisés du package. Mêmes noms partout. Mêmes propriétés. Pas de leak de l'implémentation moteur dans la signature.
          </div>

          {/* Symbol tabs */}
          <div style={{ marginTop: 22, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {API_SURFACE.map((s, i) => {
              const isActive = i === active;
              return (
                <button key={s.sym} onClick={() => setActive(i)} style={{
                  border: 'none', cursor: 'pointer',
                  padding: '7px 12px', borderRadius: 5,
                  background: isActive ? '#FF6A00' : 'rgba(247,243,237,.06)',
                  color: isActive ? '#1A0A00' : '#F7F3ED',
                  fontFamily: 'ui-monospace, monospace', fontSize: 11, fontWeight: 700,
                  letterSpacing: '0.04em',
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                }}>
                  <span>{s.sym}</span>
                  <span style={{ fontSize: 9, opacity: isActive ? .65 : .5, fontWeight: 500 }}>{s.tag}</span>
                </button>
              );
            })}
          </div>

          {/* Blurb */}
          <div style={{
            marginTop: 14, padding: '14px 18px',
            background: 'rgba(255,106,0,.08)', borderLeft: '2px solid #FF6A00',
            fontSize: 13, lineHeight: 1.55, maxWidth: 1000,
          }}>{item.blurb}</div>

          {/* Engine tabs + code */}
          <div style={{ marginTop: 16, background: '#15181C', borderRadius: 10, border: '.5px solid rgba(247,243,237,.08)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', borderBottom: '.5px solid rgba(247,243,237,.08)' }}>
              {engines.map((e) => {
                const isActive = e.k === engine;
                return (
                  <button key={e.k} onClick={() => setEngine(e.k)} style={{
                    flex: 1, border: 'none', cursor: 'pointer',
                    padding: '11px 14px', textAlign: 'left',
                    background: isActive ? '#0B0D10' : 'transparent',
                    color: isActive ? e.color : 'rgba(247,243,237,.55)',
                    fontFamily: 'ui-monospace, monospace', fontSize: 10.5, fontWeight: 700,
                    letterSpacing: '0.12em',
                    borderBottom: isActive ? `2px solid ${e.color}` : '2px solid transparent',
                    marginBottom: -1,
                  }}>{e.label}</button>
                );
              })}
            </div>
            <pre style={{
              margin: 0, padding: '16px 20px', overflow: 'auto',
              fontFamily: 'ui-monospace, "JetBrains Mono", monospace',
              fontSize: 12, lineHeight: 1.6, color: '#F7F3ED',
              maxHeight: 280,
            }}>{item.sigs[engine]}</pre>
          </div>

          <div style={{
            marginTop: 14, display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap',
            fontSize: 10.5, color: 'rgba(247,243,237,.55)', fontFamily: 'ui-monospace, monospace', letterSpacing: '0.04em',
          }}>
            <span><span style={{ color: '#FF6A00', fontWeight: 700 }}>≡</span> 24 atomes + 16 molécules + 8 recettes exposés · ces 5 sont les hot-paths</span>
            <span style={{ marginLeft: 'auto' }}>les types complets : voir gnu_in_shell/api.md (générée depuis cette fiche)</span>
          </div>
        </div>
      </div>
    </FitScale>
  );
}

/* ════════════════════════════════════════════════════════════════════
   ◆.6 — ContextMenuService
   Le singleton QML qui orchestre tout : API, data-flow, multi-monitor,
   statut de câblage par archétype, gap screenName="" connu.
   ════════════════════════════════════════════════════════════════════ */

const SERVICE_PROPS = [
  { name: 'open',        type: 'bool',   rw: 'r',  desc: 'true quand un menu est visible' },
  { name: 'anchorX',     type: 'real',   rw: 'r',  desc: 'coordonnée X du curseur au show()' },
  { name: 'anchorY',     type: 'real',   rw: 'r',  desc: 'coordonnée Y du curseur au show()' },
  { name: 'screenName',  type: 'string', rw: 'r',  desc: 'nom de l\'écran cible (multi-monitor)' },
  { name: 'groups',      type: 'var',    rw: 'r',  desc: 'Array<{ head:string, items:Array<Item> }>' },
];

const SERVICE_METHODS = [
  { sig: 'show(x, y, groups, screenName?)',    ret: 'void',   desc: 'Ouvre le menu au point (x,y) avec les groupes donnés.' },
  { sig: 'hide()',                              ret: 'void',   desc: 'Ferme le menu (remet open=false).' },
  { sig: 'trigger(id, label)',                  ret: 'void',   desc: 'Émet actionTriggered(id,label), puis appelle hide().' },
  { sig: 'buildEmptySpaceStandard()',           ret: 'groups', desc: 'Factory · archétype R.01 · desktop right-click.' },
  { sig: 'buildTrayAudio()',                    ret: 'groups', desc: 'Factory · archétype R.04 · tray audio inline.' },
];

const SERVICE_SIGNALS = [
  { sig: 'actionTriggered(id: string, label: string)', desc: 'Émis par trigger() — le consumer réagit ici.' },
];

const ARCHETYPE_WIRING = [
  { id: 'R.01', name: 'Empty Space',    status: 'câblé',   factory: 'buildEmptySpaceStandard()', note: '' },
  { id: 'R.02', name: 'Widget',         status: 'partiel', factory: '—',                         note: 'rows text+kbd seulement' },
  { id: 'R.03', name: 'Window / Tile',  status: 'partiel', factory: '—',                         note: 'rows text+kbd seulement' },
  { id: 'R.04', name: 'Tray · Audio',   status: 'câblé',   factory: 'buildTrayAudio()',           note: 'DeviceRow + slider inline' },
  { id: 'R.05', name: 'Tray · Power',   status: 'open',    factory: '—',                         note: 'goal-2' },
  { id: 'R.06', name: 'Notif · Bubble', status: 'open',    factory: '—',                         note: 'M.12 BubbleBloom — goal-2' },
  { id: 'R.07', name: 'Launcher ✦',     status: 'open',    factory: '—',                         note: 'goal-2' },
  { id: 'R.08', name: 'Notif · Stack',  status: 'open',    factory: '—',                         note: 'goal-2' },
];

const FLOW_STEPS = [
  { label: 'Consumer',         sub: 'e.g. PreviewViewer', note: 'right-click → MouseArea.onClicked', color: '#FF6A00' },
  { label: 'ContextMenuService.show()', sub: 'singleton', note: 'x, y, groups, screenName', color: '#5F7F52' },
  { label: 'open = true',      sub: 'binding flip',   note: 'anchorX/Y/screenName/groups set', color: '#3D8DCC' },
  { label: 'ContextMenuHost',  sub: 'PanelWindow × screen', note: 'visible si screenName match', color: '#3D8DCC' },
  { label: 'UiKit.ContextMenu', sub: 'renderer',      note: 'rows flat, nav clavier, scrim', color: '#3D8DCC' },
  { label: 'trigger(id, label)', sub: 'click / Enter', note: '→ actionTriggered signal',      color: '#5F7F52' },
  { label: 'Consumer handler', sub: 'onActionTriggered', note: '→ hide() auto',               color: '#FF6A00' },
];

function CtxHandoffService() {
  const [tab, setTab] = React.useState('api');
  const tabs = [
    { k: 'api',   label: 'API QML' },
    { k: 'flow',  label: 'Data flow' },
    { k: 'wire',  label: 'Câblage' },
  ];
  const statusColor = (s) => s === 'câblé' ? '#5F7F52' : s === 'partiel' ? '#E8A227' : '#E63A1F';

  return (
    <FitScale w={1280} h={720} background="#0B0D10">
      <div style={{
        width: 1280, height: 720, background: '#0B0D10', color: '#F7F3ED',
        padding: 52, boxSizing: 'border-box', overflow: 'auto',
        fontFamily: 'ui-sans-serif, system-ui, sans-serif', position: 'relative',
      }}>
        <DitherBg color="#FF6A00" opacity={0.05} />
        <GrainBg opacity={0.06} />
        <div style={{ position: 'relative' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 10, color: '#FF6A00', fontWeight: 700, letterSpacing: '0.18em', fontFamily: 'ui-monospace, monospace' }}>◆.6 · CONTEXTMENUSERVICE · SINGLETON QML</div>
              <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em', marginTop: 4 }}>Le chef d'orchestre.</div>
              <div style={{ fontSize: 13, color: 'rgba(247,243,237,.6)', marginTop: 4, maxWidth: 780, lineHeight: 1.5 }}>
                Singleton Quickshell. Reçoit un <code style={{ fontFamily: 'ui-monospace, monospace', color: '#FF6A00' }}>show()</code> depuis n'importe quel consumer, distribue aux <code style={{ fontFamily: 'ui-monospace, monospace', color: '#3D8DCC' }}>ContextMenuHost</code> par écran, émet <code style={{ fontFamily: 'ui-monospace, monospace', color: '#5F7F52' }}>actionTriggered</code> en retour.
              </div>
            </div>
            {/* Gap badge */}
            <div style={{ flexShrink: 0, padding: '10px 14px', background: 'rgba(232,162,39,.08)', border: '.5px solid rgba(232,162,39,.35)', borderRadius: 8, fontSize: 10.5, maxWidth: 260, lineHeight: 1.55 }}>
              <div style={{ color: '#E8A227', fontFamily: 'ui-monospace, monospace', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 5 }}>⚠ GAP CONNU</div>
              <div><code style={{ fontFamily: 'ui-monospace, monospace', color: '#F7F3ED' }}>show(x, y, groups, "")</code> sans screenName → tous les hosts matchent → menu dupliqué multi-monitor.</div>
              <div style={{ marginTop: 5, color: 'rgba(247,243,237,.55)' }}>Fix : fallback "current pointer screen" — goal-2.</div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
            {tabs.map((t) => (
              <button key={t.k} onClick={() => setTab(t.k)} style={{
                border: 'none', cursor: 'pointer', padding: '8px 16px', borderRadius: 5,
                background: tab === t.k ? '#FF6A00' : 'rgba(247,243,237,.07)',
                color: tab === t.k ? '#1A0A00' : '#F7F3ED',
                fontFamily: 'ui-monospace, monospace', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
              }}>{t.label}</button>
            ))}
          </div>

          {/* ── Tab: API QML ── */}
          {tab === 'api' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {/* Properties */}
              <div style={{ background: '#15181C', borderRadius: 10, border: '.5px solid rgba(247,243,237,.08)', overflow: 'hidden' }}>
                <div style={{ padding: '10px 16px', borderBottom: '.5px solid rgba(247,243,237,.08)', fontSize: 10, fontFamily: 'ui-monospace, monospace', fontWeight: 700, letterSpacing: '0.14em', color: '#FF6A00' }}>PROPERTIES</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5, fontFamily: 'ui-monospace, monospace' }}>
                  <tbody>
                    {SERVICE_PROPS.map((p) => (
                      <tr key={p.name} style={{ borderBottom: '.5px solid rgba(247,243,237,.05)' }}>
                        <td style={{ padding: '8px 16px', color: '#FF6A00', fontWeight: 700, whiteSpace: 'nowrap' }}>{p.name}</td>
                        <td style={{ padding: '8px 8px', color: 'rgba(247,243,237,.45)', whiteSpace: 'nowrap' }}>{p.type}</td>
                        <td style={{ padding: '8px 16px 8px 0', color: 'rgba(247,243,237,.7)', lineHeight: 1.4 }}>{p.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Methods + Signals */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ background: '#15181C', borderRadius: 10, border: '.5px solid rgba(247,243,237,.08)', overflow: 'hidden', flex: 1 }}>
                  <div style={{ padding: '10px 16px', borderBottom: '.5px solid rgba(247,243,237,.08)', fontSize: 10, fontFamily: 'ui-monospace, monospace', fontWeight: 700, letterSpacing: '0.14em', color: '#5F7F52' }}>METHODS</div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, fontFamily: 'ui-monospace, monospace' }}>
                    <tbody>
                      {SERVICE_METHODS.map((m) => (
                        <tr key={m.sig} style={{ borderBottom: '.5px solid rgba(247,243,237,.05)' }}>
                          <td style={{ padding: '8px 16px', color: '#5F7F52', fontWeight: 600, whiteSpace: 'nowrap', verticalAlign: 'top' }}>{m.sig.split('(')[0]}<span style={{ color: 'rgba(247,243,237,.4)' }}>({m.sig.split('(')[1]}</span></td>
                          <td style={{ padding: '8px 16px 8px 0', color: 'rgba(247,243,237,.6)', lineHeight: 1.4 }}>{m.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ background: '#15181C', borderRadius: 10, border: '.5px solid rgba(247,243,237,.08)', overflow: 'hidden' }}>
                  <div style={{ padding: '10px 16px', borderBottom: '.5px solid rgba(247,243,237,.08)', fontSize: 10, fontFamily: 'ui-monospace, monospace', fontWeight: 700, letterSpacing: '0.14em', color: '#3D8DCC' }}>SIGNALS</div>
                  {SERVICE_SIGNALS.map((s) => (
                    <div key={s.sig} style={{ padding: '10px 16px', display: 'flex', gap: 12, fontSize: 11, fontFamily: 'ui-monospace, monospace' }}>
                      <span style={{ color: '#3D8DCC', fontWeight: 600, whiteSpace: 'nowrap' }}>{s.sig}</span>
                      <span style={{ color: 'rgba(247,243,237,.6)' }}>{s.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Tab: Data flow ── */}
          {tab === 'flow' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, maxWidth: 860, margin: '0 auto' }}>
              {FLOW_STEPS.map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 0, alignItems: 'stretch' }}>
                  {/* Spine */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 32, flexShrink: 0 }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: s.color, flexShrink: 0, marginTop: 14 }} />
                    {i < FLOW_STEPS.length - 1 && <div style={{ width: 1.5, flex: 1, background: 'rgba(247,243,237,.12)', minHeight: 20 }} />}
                  </div>
                  {/* Card */}
                  <div style={{
                    flex: 1, margin: '6px 0 6px 12px', padding: '12px 16px',
                    background: 'rgba(247,243,237,.04)', borderRadius: 8,
                    border: `.5px solid ${s.color}22`,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
                  }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'ui-monospace, monospace', color: s.color }}>{s.label}</div>
                      <div style={{ fontSize: 11, color: 'rgba(247,243,237,.5)', marginTop: 2 }}>{s.sub}</div>
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(247,243,237,.4)', fontFamily: 'ui-monospace, monospace', textAlign: 'right' }}>{s.note}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Tab: Câblage ── */}
          {tab === 'wire' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 14 }}>
                {ARCHETYPE_WIRING.map((a) => {
                  const c = statusColor(a.status);
                  return (
                    <div key={a.id} style={{ background: '#15181C', borderRadius: 8, padding: '14px 16px', border: `.5px solid ${c}33` }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: 11, fontFamily: 'ui-monospace, monospace', fontWeight: 700, color: '#FF6A00' }}>{a.id}</span>
                        <span style={{ fontSize: 9, padding: '2px 7px', background: c, color: '#fff', borderRadius: 3, fontFamily: 'ui-monospace, monospace', fontWeight: 700, letterSpacing: '0.08em' }}>{a.status.toUpperCase()}</span>
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>{a.name}</div>
                      {a.factory !== '—' && (
                        <div style={{ fontSize: 10, fontFamily: 'ui-monospace, monospace', color: '#5F7F52', marginBottom: 4 }}>{a.factory}</div>
                      )}
                      {a.note && <div style={{ fontSize: 10, color: 'rgba(247,243,237,.45)', lineHeight: 1.4 }}>{a.note}</div>}
                    </div>
                  );
                })}
              </div>
              <div style={{ padding: '12px 16px', background: 'rgba(255,106,0,.06)', border: '.5px dashed rgba(255,106,0,.3)', borderRadius: 8, fontSize: 11, fontFamily: 'ui-monospace, monospace', color: 'rgba(247,243,237,.7)', display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                <span><span style={{ color: '#5F7F52', fontWeight: 700 }}>●</span> CÂBLÉ — factory + QML wired</span>
                <span><span style={{ color: '#E8A227', fontWeight: 700 }}>●</span> PARTIEL — rows text/kbd seulement, pas de variants</span>
                <span><span style={{ color: '#E63A1F', fontWeight: 700 }}>●</span> OPEN — à implémenter (goal-2)</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </FitScale>
  );
}

Object.assign(window, {
  CtxHandoffRepo, CtxHandoffSprints, CtxHandoffApi, CtxHandoffService,
});
