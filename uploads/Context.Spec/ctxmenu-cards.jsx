// ctxmenu-cards.jsx
// CtxCard layout — fork of motion AssetCard, no scrubber, geared for static
// menu primitives (atoms / molecules / recettes).
// Also holds the recette registry that wraps existing menu-archetypes.

/* ════════════════════════════════════════════════════════════════════
   CtxCard · 1280×720 layout
   ════════════════════════════════════════════════════════════════════ */

function CtxCard({ id, kind, title, sub, stage, spec, footer }) {
  const KIND_TONES = {
    atom:     { label: 'ATOME',     bg: '#111418', fg: '#FF6A00' },
    molecule: { label: 'MOLÉCULE',  bg: '#5F7F52', fg: '#F7F3ED' },
    recette:  { label: 'RECETTE',   bg: '#FF6A00', fg: '#1A0A00' },
  };
  const t = KIND_TONES[kind] || KIND_TONES.atom;
  return (
    <div style={{
      width: 1280, height: 720, background: '#FBFAF6', color: '#111418',
      fontFamily: 'ui-sans-serif, system-ui, sans-serif', position: 'relative',
      display: 'grid', gridTemplateColumns: '1.05fr 1fr', gridTemplateRows: 'auto 1fr',
      padding: 28, columnGap: 24, rowGap: 18, boxSizing: 'border-box',
    }}>
      {/* Header */}
      <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <span style={{
          padding: '4px 10px', fontSize: 10, fontFamily: 'ui-monospace, monospace',
          fontWeight: 700, letterSpacing: '0.14em', borderRadius: 3,
          background: t.bg, color: t.fg,
        }}>{t.label}</span>
        {id && <span style={{
          padding: '4px 10px', fontSize: 10, fontFamily: 'ui-monospace, monospace',
          fontWeight: 700, letterSpacing: '0.14em', borderRadius: 3,
          background: '#0B0D10', color: '#FF6A00',
        }}>{id}</span>}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.15 }}>{title}</div>
          {sub && <div style={{ fontSize: 12, color: 'rgba(17,20,24,.62)', marginTop: 3, lineHeight: 1.45, maxWidth: 760 }}>{sub}</div>}
        </div>
      </div>

      {/* Stage column */}
      <div style={{ minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, minHeight: 0 }}>{stage}</div>
      </div>

      {/* Spec column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0, overflow: 'auto' }}>
        {spec}
      </div>

      {/* Footer */}
      {footer && (
        <div style={{
          gridColumn: '1 / -1', fontSize: 10, color: 'rgba(17,20,24,.5)',
          fontFamily: 'ui-monospace, monospace', letterSpacing: '0.04em',
          borderTop: '.5px solid rgba(17,20,24,.1)', paddingTop: 8,
        }}>{footer}</div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   Spec column compositors
   ════════════════════════════════════════════════════════════════════ */

function CtxSpec({ entry, kind }) {
  return (
    <SpecPanel>
      {/* Anatomy tokens */}
      <SpecBlock label="Tokens · anatomie">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {(entry.tokens || []).map(([k, v], i) => <MTokenRow key={i} k={k} v={v} />)}
        </div>
      </SpecBlock>

      {/* Composed-of (atoms list) for molecules & recettes */}
      {kind !== 'atom' && entry.atoms && (
        <SpecBlock label="Composé de">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {entry.atoms.map((a, i) => (
              <span key={i} style={{
                padding: '2px 8px', fontSize: 10, fontFamily: 'ui-monospace, monospace',
                background: 'rgba(255,106,0,.10)', color: '#FF6A00', borderRadius: 3, fontWeight: 600,
                border: '.5px solid rgba(255,106,0,.25)',
              }}>{a}</span>
            ))}
          </div>
        </SpecBlock>
      )}

      {/* States + A11y, side-by-side */}
      {(entry.states || entry.a11y) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {entry.states && (
            <SpecBlock label="États">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                {entry.states.map((s, i) => (
                  <span key={i} style={{
                    padding: '2px 7px', fontSize: 9.5,
                    fontFamily: 'ui-monospace, monospace', fontWeight: 600,
                    background: i === 0 ? '#111418' : 'rgba(17,20,24,.06)',
                    color: i === 0 ? '#FF6A00' : 'rgba(17,20,24,.7)',
                    borderRadius: 3, letterSpacing: '0.02em',
                    border: i === 0 ? 'none' : '.5px solid rgba(17,20,24,.08)',
                  }}>{s}</span>
                ))}
              </div>
            </SpecBlock>
          )}
          {entry.a11y && (
            <SpecBlock label="A11y · WAI-ARIA">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3, fontSize: 10.5, fontFamily: 'ui-monospace, monospace', lineHeight: 1.5 }}>
                <div><span style={{ color: '#FF6A00', fontWeight: 700 }}>role</span> <span style={{ color: 'rgba(17,20,24,.78)' }}>{entry.a11y.role}</span></div>
                <div><span style={{ color: '#FF6A00', fontWeight: 700 }}>name</span> <span style={{ color: 'rgba(17,20,24,.78)' }}>{entry.a11y.name}</span></div>
                <div><span style={{ color: '#FF6A00', fontWeight: 700 }}>kbd</span> <span style={{ color: 'rgba(17,20,24,.78)' }}>{entry.a11y.keyboard}</span></div>
              </div>
            </SpecBlock>
          )}
        </div>
      )}

      {/* Chip row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        <MChip tone={kind === 'atom' ? 'ink' : kind === 'molecule' ? 'green' : 'orange'}>
          {kind === 'atom' ? 'ATOME' : kind === 'molecule' ? 'MOLÉCULE' : 'RECETTE'}
        </MChip>
        {entry.signature && <MChip tone="orange">SIGNATURE ★</MChip>}
        {entry.touch && <MChip tone="paper">TOUCH</MChip>}
        {entry.states && <MChip tone="soft">{entry.states.length} ÉTAT{entry.states.length > 1 ? 'S' : ''}</MChip>}
      </div>

      {/* Snippets */}
      <SpecBlock label="Snippets · 5 moteurs" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
          <MSnippetTabs specs={entry.snip} />
        </div>
      </SpecBlock>
    </SpecPanel>
  );
}

/* ════════════════════════════════════════════════════════════════════
   Card renderers per kind
   ════════════════════════════════════════════════════════════════════ */

function CtxAtomCard({ atom, themeOverride }) {
  const theme = themeOverride || gnuTheme({ dark: false, brand: 'medium' });
  const Demo = atom.demo;
  return (
    <CtxCard
      id={atom.id} kind="atom" title={atom.title} sub={atom.sub}
      stage={<Demo theme={theme} />}
      spec={<CtxSpec entry={atom} kind="atom" />}
    />
  );
}

function CtxMoleculeCard({ mol, themeOverride }) {
  const theme = themeOverride || gnuTheme({ dark: false, brand: 'medium' });
  const Demo = mol.demo;
  return (
    <CtxCard
      id={mol.id} kind="molecule" title={mol.title} sub={mol.sub}
      stage={<Demo theme={theme} />}
      spec={<CtxSpec entry={mol} kind="molecule" />}
    />
  );
}

/* ════════════════════════════════════════════════════════════════════
   Recettes — full archetypes (reuse existing menu-archetypes scenes)
   ════════════════════════════════════════════════════════════════════ */

// Wrap an existing menu-archetype scene so it lives inside our stage area.
function RecetteStage({ children, theme }) {
  const tx = theme || gnuTheme({ dark: false, brand: 'medium' });
  return (
    <div style={{
      width: '100%', height: '100%', borderRadius: 10, overflow: 'hidden',
      background: tx.mode === 'dark' ? '#0B0D10' : '#F0EDE6',
      border: `.5px solid ${tx.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative',
    }}>{children}</div>
  );
}

// ── Snippets for each recette ──────────────────────────────────────
const RSNIP = {};

RSNIP['R.01'] = {
  neutral: `# R.01 · Empty space · standard list
trigger        right-click on desktop wallpaper (no widget, no window)
shape          MenuShell (C.09) · width 224 · density mouse
layout         3 grouped sections (CM.01) :
  · § Compose    [Add widget…, Layout preset ▸, Wallpaper]
  · § Workspace  [New workspace, Tile mode (toggle)]
  · § <Système>  [Open terminal here, Shell settings]
status pill    "01" en haut-gauche (C.10 filled)
motion         open M.01 reveal-from-cursor · close M.02
audio          cue.menu.open  (-22 LUFS, 120 ms, "soft cassette click")`,
  css: `<gnu-menu data-archetype="01" data-density="mouse">
  <gnu-section label="Compose">
    <gnu-row icon="add" label="Add widget…" kbd="⌘ ⇧ W" submenu></gnu-row>
    <gnu-row icon="layout" label="Layout preset" submenu></gnu-row>
    <gnu-row icon="wallpaper" label="Change wallpaper" kbd="⌘ B"></gnu-row>
  </gnu-section>
  <gnu-sep></gnu-sep>
  <gnu-section label="Workspace">
    <gnu-row icon="workspace" label="New workspace" kbd="⌘ N"></gnu-row>
    <gnu-row icon="tile" label="Tile mode" toggle on></gnu-row>
  </gnu-section>
  <gnu-sep></gnu-sep>
  <gnu-row icon="terminal" label="Open terminal here" kbd="⌘ T"></gnu-row>
  <gnu-row icon="settings" label="Shell settings" kbd="⌘ ,"></gnu-row>
</gnu-menu>`,
  qml: `// EmptySpaceMenu.qml — bound to Quickshell desktop right-click
GnuContextMenu {
  archetype: "01"   // R.01 (cf. motion moment-matrix)
  trigger: shell.desktop.rightClick
  width: 224
  GnuSection {
    label: "Compose"
    GnuRow { icon: "add"; label: "Add widget…"
             kbd: ["\u2318","\u21E7","W"]; submenu: true }
    GnuRow { icon: "layout"; label: "Layout preset"; submenu: true }
    GnuRow { icon: "wallpaper"; label: "Change wallpaper"
             kbd: ["\u2318","B"] }
  }
  GnuSeparator {}
  GnuSection {
    label: "Workspace"
    GnuRow { icon: "workspace"; label: "New workspace"
             kbd: ["\u2318","N"] }
    GnuRow { icon: "tile"; label: "Tile mode"; toggle: shell.tileMode }
  }
  GnuSeparator {}
  GnuRow { icon: "terminal"; label: "Open terminal here"
           kbd: ["\u2318","T"]; onTriggered: shell.openTerminal() }
  GnuRow { icon: "settings"; label: "Shell settings"
           kbd: ["\u2318",","]; onTriggered: shell.openSettings() }
}`,
  qt: `auto* m = new GnuContextMenu(GnuArchetype::EmptySpace, this);
m->setWidth(224);
auto* s1 = m->addSection("Compose");
s1->addRow({"add",        "Add widget…",       {"⌘","⇧","W"}, /*submenu*/true});
s1->addRow({"layout",     "Layout preset",     {},            true});
s1->addRow({"wallpaper",  "Change wallpaper",  {"⌘","B"},     false});
m->addSeparator();
auto* s2 = m->addSection("Workspace");
s2->addRow({"workspace",  "New workspace",     {"⌘","N"},     false});
s2->addToggle({"tile",    "Tile mode",         &shell.tileMode});
m->addSeparator();
m->addRow({"terminal",    "Open terminal here", {"⌘","T"},    false});
m->addRow({"settings",    "Shell settings",    {"⌘",","},     false});
connect(shell.desktop(), &Desktop::rightClicked, m, &Menu::openAt);`,
  flutter: `class EmptySpaceMenu extends GnuContextMenu {
  EmptySpaceMenu() : super(archetype: GnuArchetype.emptySpace, width: 224);
  @override List<GnuMenuItem> build(BuildContext c) => [
    GnuSection('Compose', [
      GnuRow(icon: 'add',       label: 'Add widget…',      kbd: ['⌘','⇧','W'], submenu: true),
      GnuRow(icon: 'layout',    label: 'Layout preset',    submenu: true),
      GnuRow(icon: 'wallpaper', label: 'Change wallpaper', kbd: ['⌘','B']),
    ]),
    const GnuSeparator(),
    GnuSection('Workspace', [
      GnuRow(icon: 'workspace', label: 'New workspace',    kbd: ['⌘','N']),
      GnuToggle(icon: 'tile',   label: 'Tile mode',        value: shell.tileMode),
    ]),
    const GnuSeparator(),
    GnuRow(icon: 'terminal',    label: 'Open terminal here', kbd: ['⌘','T']),
    GnuRow(icon: 'settings',    label: 'Shell settings',     kbd: ['⌘',',']),
  ];
}`,
};

RSNIP['R.02'] = {
  neutral: `# R.02 · Widget · card with live preview
trigger        right-click on a focused widget instance
shape          MenuShell wide (260) avec CM.03 en tête + rows en-dessous
identity       CM.03 : icône 36 + nom + dims + workspace + id pill + slider taille
actions        [Configure ▸, Shape ▸ (Rounded · 8px), Background ▸ (Glass · 18px),
                Pin everywhere (toggle on), — Remove (danger ⌫)]
motion         open M.01 · widget icône scale 0.94→1 (overshoot 3%)
règle          danger row toujours seule, séparée par C.08`,
  css: `<gnu-menu data-archetype="02" data-density="mouse">
  <gnu-identity icon="widget" name="System Stats" dims="140×90"
                workspace="2" id="0x4A2" size="M"></gnu-identity>
  <gnu-row icon="settings" label="Configure" submenu></gnu-row>
  <gnu-row icon="shape" label="Shape" sub="Rounded · 8px" submenu></gnu-row>
  <gnu-row icon="shader" label="Background" sub="Glass · 18px" submenu></gnu-row>
  <gnu-row icon="pin" label="Pin everywhere" toggle on></gnu-row>
  <gnu-sep></gnu-sep>
  <gnu-row icon="trash" label="Remove" kbd="⌫" data-danger></gnu-row>
</gnu-menu>`,
  qml: `// WidgetMenu.qml
GnuContextMenu {
  archetype: "02"; width: 260
  trigger: widget.rightClick
  GnuIdentityHeader { target: widget }
  GnuRow { icon: "settings"; label: "Configure"; submenu: true }
  GnuRow { icon: "shape";    label: "Shape"
           subLabel: widget.shape.label; submenu: true }
  GnuRow { icon: "shader";   label: "Background"
           subLabel: widget.bg.label; submenu: true }
  GnuToggle { icon: "pin"; label: "Pin everywhere"; bind: widget.pinned }
  GnuSeparator {}
  GnuRow { icon: "trash"; label: "Remove"; kbd: ["\u232B"]; danger: true
           onTriggered: widget.remove() }
}`,
  qt: `auto* m = new GnuContextMenu(GnuArchetype::Widget, this);
m->setWidth(260);
m->addIdentityHeader(widget);
m->addRow({"settings", "Configure", {}, /*submenu=*/true});
m->addRow({"shape",    "Shape",     {}, true, widget->shape().label()});
m->addRow({"shader",   "Background",{}, true, widget->bg().label()});
m->addToggle({"pin",   "Pin everywhere", &widget->pinned});
m->addSeparator();
m->addRow({"trash",    "Remove",    {"⌫"}, false, {}, /*danger=*/true});
connect(widget, &Widget::rightClicked, m, &Menu::openAt);`,
  flutter: `class WidgetMenu extends GnuContextMenu {
  WidgetMenu(this.widget) : super(archetype: GnuArchetype.widget, width: 260);
  final WidgetTarget widget;
  @override List<GnuMenuItem> build(BuildContext c) => [
    GnuIdentityHeader(target: widget),
    GnuRow(icon: 'settings', label: 'Configure', submenu: true),
    GnuRow(icon: 'shape',    label: 'Shape',
           subLabel: widget.shape.label, submenu: true),
    GnuRow(icon: 'shader',   label: 'Background',
           subLabel: widget.background.label, submenu: true),
    GnuToggle(icon: 'pin', label: 'Pin everywhere',
              valueListenable: widget.pinned),
    const GnuSeparator(),
    GnuRow(icon: 'trash', label: 'Remove', kbd: ['⌫'], danger: true,
           onTriggered: widget.remove),
  ];
}`,
};

RSNIP['R.03'] = {
  neutral: `# R.03 · Window · title-bar
trigger        right-click on title-bar  (jamais sur le contenu de l'app !)
shape          MenuShell width 220
status pill    "TITLE-BAR ▸"  en haut-gauche (C.10 outline)
règle d'or     NE PAS intercepter le clic-droit sur le contenu app
  · le shell n'agit que sur ses propres surfaces
  · sinon un navigateur / éditeur perd ses menus contextuels riches
rows           [Tile ▸ (⌘T), Float (toggle on), Fullscreen (F),
                §Workspace [Send to… ▸, Pin to all (sub: Sticky)],
                Window info (⌘I), Close (⌘W) danger]`,
  css: `/* Quickshell binds the title-bar geometry; the *content* area
   bubbles to the app. */
<gnu-menu data-archetype="03" data-density="mouse">
  <gnu-pill>TITLE-BAR ▸</gnu-pill>
  <gnu-row icon="tile" label="Tile" kbd="⌘ T" submenu></gnu-row>
  <gnu-row icon="float" label="Float" toggle on></gnu-row>
  <gnu-row icon="fullscreen" label="Fullscreen" kbd="F"></gnu-row>
  <gnu-sep></gnu-sep>
  <gnu-section label="Workspace">
    <gnu-row icon="workspace" label="Send to…" submenu></gnu-row>
    <gnu-row icon="pin" label="Pin to all" sub="Sticky across workspaces"></gnu-row>
  </gnu-section>
  <gnu-sep></gnu-sep>
  <gnu-row icon="info" label="Window info" kbd="⌘ I"></gnu-row>
  <gnu-row icon="close" label="Close" kbd="⌘ W" data-danger></gnu-row>
</gnu-menu>`,
  qml: `// WindowMenu.qml — wired to Hyprland title-bar via Quickshell
GnuContextMenu {
  archetype: "03"; width: 220
  // CRITICAL : on n'écoute QUE la barre de titre.
  // Le contenu de l'app reste sacré.
  trigger: shell.window.titleBar.rightClick
  GnuRow { icon: "tile"; label: "Tile"
           kbd: ["\u2318","T"]; submenu: true }
  GnuToggle { icon: "float"; label: "Float"; bind: shell.window.floating }
  GnuRow { icon: "fullscreen"; label: "Fullscreen"; kbd: ["F"] }
  GnuSeparator {}
  GnuSection {
    label: "Workspace"
    GnuRow { icon: "workspace"; label: "Send to…"; submenu: true }
    GnuRow { icon: "pin"; label: "Pin to all"
             subLabel: "Sticky across workspaces" }
  }
  GnuSeparator {}
  GnuRow { icon: "info"; label: "Window info"; kbd: ["\u2318","I"] }
  GnuRow { icon: "close"; label: "Close"; kbd: ["\u2318","W"]; danger: true
           onTriggered: shell.window.close() }
}`,
  qt: `// IMPORTANT : install event filter on title-bar widget ONLY.
class TitleBar : public QWidget {
protected:
  void contextMenuEvent(QContextMenuEvent* e) override {
    auto* m = new WindowMenu(window());
    m->openAt(mapToGlobal(e->pos()));
  }
};
// The content widget never installs this — app retains its own menus.`,
  flutter: `class TitleBar extends StatelessWidget {
  /* Only the title-bar GestureDetector responds to right-click;
     the content child below it is untouched. */
  @override Widget build(BuildContext c) => Listener(
    onPointerDown: (e) {
      if (e.kind == PointerDeviceKind.mouse
          && e.buttons == kSecondaryMouseButton) {
        WindowMenu(window).openAt(e.position);
      }
    },
    child: Container(/* title-bar chrome */),
  );
}`,
};

RSNIP['R.04'] = {
  neutral: `# R.04 · Nested · bubble tree  ★ SIGNATURE
trigger        right-click + drag, OR right-click on "Theme/Preset" caret
shape          NO PANEL — bubbles flotantes reliées par fils
hub            SysterGlyph 28 dans disque 44 · centre exact du curseur
ring 1         6 bulles ø 44 sur R = 96 (catégories : Theme / Shape / Motion …)
ring 2         3-4 bulles ø 36 par catégorie · R + 60  (présets)
entrée         M.12 bubble-bloom : spring elastic · 36 ms stagger
hover          fil → α .6  · bulle → bg accent · scale 1.06
fermeture      M.12⁻¹ — bulles se rétractent vers le hub
sortie hover   bulles non-active s'assombrissent à .55α
règle          le SEUL archétype où l'absence de panneau est revendiquée`,
  css: `<gnu-bubble-tree id="theme-tree" data-archetype="04★">
  <gnu-bubble-hub><gnu-syster size="28" state="listening"/></gnu-bubble-hub>
  <gnu-bubble data-cat="theme">    Theme   </gnu-bubble>
  <gnu-bubble data-cat="shape">    Shape   </gnu-bubble>
  <gnu-bubble data-cat="motion">   Motion  </gnu-bubble>
  <gnu-bubble data-cat="layout">   Layout  </gnu-bubble>
  <gnu-bubble data-cat="shader">   Shader  </gnu-bubble>
  <gnu-bubble data-cat="beret">    Beret   </gnu-bubble>
</gnu-bubble-tree>
<style>
  /* connectors drawn via inline SVG; per-bubble entry stagger via CSS var */
  gnu-bubble { animation: gnu-bloom 600ms cubic-bezier(.16,1.40,.30,1) both;
               animation-delay: calc(var(--i,0) * 36ms); }
  @keyframes gnu-bloom {
    from { transform: scale(0) translate(var(--hub-dx, 0), var(--hub-dy, 0)); }
    to   { transform: scale(1) translate(0, 0); }
  }
</style>`,
  qml: `// BubbleTree.qml — uses Canvas + per-bubble SpringAnimation
GnuBubbleTree {
  archetype: "04★"
  origin: cursor.position  // hub anchors there exactly
  hub: SysterGlyph { size: 28; state: "listening" }
  Ring {
    radius: 96
    BubbleNode { id: "theme";  label: "Theme";  subs: ["Beret","Signal","Anthracite","Shell"] }
    BubbleNode { id: "shape";  label: "Shape";  subs: ["Round","Sharp","Pill","Cut"] }
    BubbleNode { id: "motion"; label: "Motion"; subs: ["Settle","Lift","Reveal","Idle"] }
    BubbleNode { id: "layout"; label: "Layout"; subs: ["Tile","Float","Stack"] }
    BubbleNode { id: "shader"; label: "Shader"; subs: ["Dither","Grain","Refract"] }
    BubbleNode { id: "beret";  label: "Beret"   /* nullary, ø 44 single bloom */ }
  }
  entryAnimation: SpringAnimation {
    spring: 220; damping: 18; staggerPerNode: 36
  }
}`,
  qt: `class BubbleTree : public QWidget {
public:
  void openAt(QPoint origin) {
    move(origin.x() - width()/2, origin.y() - height()/2);
    // launch staggered spring animations
    for (int i = 0; i < _bubbles.size(); ++i) {
      QTimer::singleShot(i*36, this, [this,i]{
        _bubbles[i]->animateBloom(/*stiffness=*/220, /*damping=*/18);
      });
    }
    show();
  }
private:
  QVector<BubbleNode*> _bubbles;
  SysterGlyphWidget*   _hub;
};`,
  flutter: `class BubbleTree extends StatefulWidget { /* ... */ }
class _BubbleTreeState extends State<BubbleTree>
    with TickerProviderStateMixin {
  late final List<AnimationController> _ctrls;
  @override void initState() {
    super.initState();
    _ctrls = List.generate(widget.bubbles.length, (i) =>
      AnimationController(vsync: this,
        duration: const Duration(milliseconds: 700)));
    for (var i = 0; i < _ctrls.length; ++i) {
      Future.delayed(Duration(milliseconds: i*36),
        () => _ctrls[i].forward());
    }
  }
  @override Widget build(BuildContext c) => Positioned(
    left: widget.origin.dx - 100, top: widget.origin.dy - 100,
    width: 220, height: 220,
    child: Stack(children: [
      CustomPaint(painter: ConnectorPainter(_ctrls, widget.bubbles)),
      for (var i = 0; i < widget.bubbles.length; ++i)
        AnimatedBuilder(animation: _ctrls[i], builder: (_,__) {
          final t = Curves.elasticOut.transform(_ctrls[i].value);
          return Transform.scale(scale: t,
            child: BubbleNode(b: widget.bubbles[i]));
        }),
      const Positioned.fill(child: Center(child:
        SysterGlyph(size: 28, state: SysterState.listening))),
    ]),
  );
}`,
};

RSNIP['R.05'] = {
  neutral: `# R.05 · Tray · audio
trigger        right-click on audio icon in topbar tray (TrayBar)
shape          MenuShell width 240 · anchored from top-right corner of icon
identity       state header en haut : "OUTPUT · 64%" + meta active sink
slider         volume · 4 px de haut · pleine largeur · accent fill
outputs        listing radio des sinks : · Internal · HD audio · Monitor
action         > Sound settings…  (bottom)
règle          pas de cascade · pas de sub-menu — tout est visible d'un coup
                mémoire musculaire = stabilité du layout dans le temps`,
  css: `<gnu-menu data-archetype="05" data-tray="audio" data-density="mouse">
  <gnu-state-header
    label="OUTPUT" value="64%" meta="Active : Internal speakers"></gnu-state-header>
  <gnu-volume-slider value="0.64"></gnu-volume-slider>
  <gnu-sep></gnu-sep>
  <gnu-section label="Output">
    <gnu-radio name="sink" value="int" checked>Internal speakers</gnu-radio>
    <gnu-radio name="sink" value="hd">HD audio</gnu-radio>
    <gnu-radio name="sink" value="mon">Studio monitor</gnu-radio>
  </gnu-section>
  <gnu-sep></gnu-sep>
  <gnu-row icon="settings" label="Sound settings…"></gnu-row>
</gnu-menu>`,
  qml: `// TrayAudioMenu.qml
GnuTrayMenu {
  archetype: "05"; width: 240
  trigger: tray.audio.rightClick
  anchor: tray.audio.bottomRight
  GnuStateHeader {
    label: "OUTPUT"
    value: Math.round(audio.volume * 100) + "%"
    meta:  "Active : " + audio.activeSink.name
  }
  GnuVolumeSlider { bind: audio.volume }
  GnuSeparator {}
  GnuSection {
    label: "Output"
    Repeater {
      model: audio.sinks
      delegate: GnuRadio {
        groupKey: "sink"; value: modelData.id
        label: modelData.label
        checked: audio.activeSink === modelData
        onPicked: audio.setSink(modelData)
      }
    }
  }
  GnuSeparator {}
  GnuRow { icon: "settings"; label: "Sound settings\u2026"
           onTriggered: shell.openSettings("sound") }
}`,
  qt: `auto* m = new GnuTrayMenu(GnuArchetype::TrayAudio, this);
m->setWidth(240);
m->addStateHeader("OUTPUT",
  QString::number(int(audio->volume()*100)) + "%",
  "Active : " + audio->activeSink()->name());
m->addVolumeSlider(audio, &Audio::volume);
m->addSeparator();
auto* outs = m->addSection("Output");
for (auto* s : audio->sinks())
  outs->addRadio("sink", s->id(), s->label(), s == audio->activeSink());
m->addSeparator();
m->addRow({"settings", "Sound settings…"});
connect(tray->audioIcon(), &TrayIcon::rightClicked, m, &Menu::openAt);`,
  flutter: `class TrayAudioMenu extends GnuContextMenu {
  TrayAudioMenu(this.audio)
    : super(archetype: GnuArchetype.trayAudio, width: 240);
  final AudioController audio;
  @override List<GnuMenuItem> build(BuildContext c) {
    final pct = (audio.volume.value * 100).round();
    return [
      GnuStateHeader(label: 'OUTPUT', value: '\$pct%',
                     meta: 'Active : \${audio.activeSink.name}'),
      GnuVolumeSlider(controller: audio.volume),
      const GnuSeparator(),
      GnuSection('Output',
        audio.sinks.map((s) => GnuRadio(
          groupKey: 'sink', value: s.id, label: s.label,
          checked: s == audio.activeSink,
          onPicked: () => audio.setSink(s),
        )).toList(),
      ),
      const GnuSeparator(),
      GnuRow(icon: 'settings', label: 'Sound settings…',
             onTriggered: () => shell.openSettings('sound')),
    ];
  }
}`,
};

/* ════════════════════════════════════════════════════════════════════
   RECETTE REGISTRY
   ════════════════════════════════════════════════════════════════════ */

const CTX_RECETTES = [
  { id: 'R.01', title: 'Empty space · standard list',
    sub: 'Clic-droit sur le bureau nu. Section Compose · Workspace · Système. Reveal-from-cursor.',
    scene: EmptySpaceStandard, dark: false, snip: RSNIP['R.01'],
    atoms: ['CM.01 ×3', 'C.08', 'C.10'],
    tokens: [['archétype','01'],['width','224'],['rows','7'],['sections','3'],['motion ouverture','M.01 reveal-from-cursor'],['motion fermeture','M.02 dismiss-to-cursor']] },

  { id: 'R.02', title: 'Widget · card with preview',
    sub: 'Menu de widget — identity header + actions + danger row isolée. La cible est nommée.',
    scene: WidgetCard, dark: false, snip: RSNIP['R.02'],
    atoms: ['CM.03', 'C.11 ×2', 'C.04 ×3', 'C.05', 'C.08'],
    tokens: [['archétype','02'],['width','260'],['identity','CM.03 obligatoire'],['danger','C.08 + row rouge isolée'],['live preview','slider taille dans header']] },

  { id: 'R.03', title: 'Window · title-bar',
    sub: 'Sur la barre de titre uniquement. Le clic-droit dans le contenu reste à l\'app.',
    scene: WindowStandard, dark: false, snip: RSNIP['R.03'],
    atoms: ['C.10 outline', 'CM.01', 'C.03 ×4', 'C.05', 'C.08 ×2'],
    tokens: [['archétype','03'],['width','220'],['règle d\'or','contenu app inviolable'],['scope','title-bar uniquement'],['fallback','widget app-menu (Hyprland-style) dans topbar']] },

  { id: 'R.04', title: 'Nested · bubble tree ★',
    sub: 'Signature Gnu.In. Aucun panneau — bulles flottantes reliées par des fils. Spring elastic 36ms stagger.',
    scene: NestedBubbleTree, dark: true, snip: RSNIP['R.04'], signature: true,
    atoms: ['CM.07'],
    tokens: [['archétype','04★'],['no panel','revendiqué'],['hub','SysterGlyph 28 dans disque 44'],['ring 1','6 × ø 44 · R 96'],['ring 2','3-4 × ø 36 · R 156 (sub)'],['entrée','M.12 spring elastic · 36 ms stagger']] },

  { id: 'R.05', title: 'Tray · audio',
    sub: 'État + slider + radios. Pas de cascade. Pas de surprise. Layout stable dans le temps.',
    scene: TrayAudio, dark: false, snip: RSNIP['R.05'],
    atoms: ['CM.01', 'C.10', 'C.08'],
    tokens: [['archétype','05'],['width','240'],['anchor','bottom-right de l\'icône tray'],['header','state OUTPUT + % + active sink'],['règle','tout visible · pas de sub-menu']] },
];

function CtxRecetteCard({ rec, densityOverride }) {
  const theme = gnuTheme({ dark: rec.dark, brand: 'medium' });
  const Scene = rec.scene;
  return (
    <CtxCard
      id={rec.id} kind="recette" title={rec.title} sub={rec.sub}
      stage={
        <RecetteStage theme={theme}>
          <Scene theme={theme} dpref={densityOverride || 'mouse'} />
        </RecetteStage>
      }
      spec={<CtxSpec entry={rec} kind="recette" />}
    />
  );
}

Object.assign(window, {
  CtxCard, CtxSpec, CtxAtomCard, CtxMoleculeCard, CtxRecetteCard,
  CTX_RECETTES, RSNIP,
});
