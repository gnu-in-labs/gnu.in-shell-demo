// ctxmenu-recettes-prod.jsx
// Three production-grade recipes :
//   R.06 Notifications tray  (NEW — full scene built here)
//   R.07 Power tray          (reuses TrayPower from menu-archetypes)
//   R.08 App launcher        (NEW — Spotlight-style full scene)

/* ════════════════════════════════════════════════════════════════════
   R.06 SCENE · NOTIFICATIONS TRAY
   ════════════════════════════════════════════════════════════════════ */

function NotificationsTray({ theme, dpref }) {
  const tx = theme || gnuTheme({ dark: false, brand: 'medium' });
  const items = [
    { tone: 'info',    icon: MenuIcons.workspace, title: 'Workspace 3 created', body: 'Two windows moved · ⌘Z to undo', age: 'now' },
    { tone: 'success', icon: '✓',                 title: 'Theme applied', body: 'Beret · green paper', age: '12 s' },
    { tone: 'danger',  icon: '!',                 title: 'Sync failed', body: 'Network unreachable · retry in 12 s', age: '2 min' },
    { tone: 'info',    icon: MenuIcons.bell,      title: '3 updates available', body: 'firefox · qt6 · nvim', age: '14 min' },
  ];
  return (
    <Scene theme={tx} w={420} h={460}>
      <DesktopBg theme={tx} />
      <TrayBar theme={tx} focusKey="bell" />
      {/* badge over bell */}
      <span style={{ position: 'absolute', top: 10, right: 36, width: 8, height: 8, borderRadius: '50%', background: '#E63A1F', border: `1.5px solid ${tx.surface}` }} />
      <div style={{ position: 'absolute', top: 36, right: 12, width: 300 }}>
        <MaskReveal origin={{ x: 286, y: 0 }} radius={12}>
          <div style={{
            background: tx.surface, borderRadius: 12, boxShadow: tx.shadow,
            border: `.5px solid ${tx.border}`, overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{
              padding: '10px 12px 8px',
              borderBottom: `.5px solid ${tx.border}`,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ width: 13, height: 13, color: tx.accent }}>{MenuIcons.bell}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: tx.text }}>Notifications</span>
              <span style={{ padding: '1px 5px', background: '#E63A1F', color: '#fff', borderRadius: 9, fontFamily: 'ui-monospace, monospace', fontSize: 9.5, fontWeight: 700, minWidth: 14, textAlign: 'center' }}>3</span>
              <span style={{ flex: 1 }} />
              <span style={{ fontSize: 9.5, color: tx.textDim, fontFamily: 'ui-monospace, monospace', cursor: 'pointer' }}>Clear all</span>
            </div>
            {/* List */}
            <div style={{ padding: 6, display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 280, overflow: 'hidden' }}>
              {items.map((t, i) => {
                const tone = t.tone === 'danger' ? '#E63A1F' : t.tone === 'success' ? '#5F7F52' : tx.accent;
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 9, padding: '8px 10px',
                    borderRadius: 8,
                    background: i === 0 ? tx.hover : 'transparent',
                    position: 'relative',
                  }}>
                    {i === 0 && <span style={{ position: 'absolute', left: 0, top: 12, bottom: 12, width: 2, background: tone, borderRadius: 2 }} />}
                    <span style={{
                      width: 20, height: 20, borderRadius: 10,
                      background: tone, color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, fontFamily: 'ui-monospace, monospace', fontSize: 11, fontWeight: 700,
                    }}>
                      {typeof t.icon === 'string' ? t.icon : <span style={{ width: 11, height: 11 }}>{t.icon}</span>}
                    </span>
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                        <span style={{ fontSize: 11.5, fontWeight: 600, color: tx.text, letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</span>
                        <span style={{ marginLeft: 'auto', fontSize: 9, color: tx.textFaint, fontFamily: 'ui-monospace, monospace', flexShrink: 0 }}>{t.age}</span>
                      </div>
                      <span style={{ fontSize: 10.5, color: tx.textDim, fontFamily: 'ui-monospace, monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.body}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Footer */}
            <div style={{
              padding: '6px 12px',
              background: tx.mode === 'dark' ? 'rgba(247,243,237,.03)' : 'rgba(17,20,24,.03)',
              borderTop: `.5px solid ${tx.border}`,
              fontSize: 9.5, color: tx.textFaint, fontFamily: 'ui-monospace, monospace',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span>4 active · 12 today</span>
              <span style={{ marginLeft: 'auto' }}>Do not disturb</span>
              <span style={{
                width: 22, height: 12, borderRadius: 999, background: tx.kbdBg,
                position: 'relative', cursor: 'pointer',
              }}>
                <span style={{ position: 'absolute', top: 1, left: 1, width: 10, height: 10, borderRadius: 5, background: '#fff' }} />
              </span>
            </div>
          </div>
        </MaskReveal>
      </div>
      <Cursor x={384} y={22} theme={tx} />
    </Scene>
  );
}

/* ════════════════════════════════════════════════════════════════════
   R.08 SCENE · APP LAUNCHER (Spotlight-style)
   ════════════════════════════════════════════════════════════════════ */

function AppLauncher({ theme, dpref }) {
  const tx = theme || gnuTheme({ dark: false, brand: 'medium' });
  const apps = [
    { k: 'term',  icon: MenuIcons.terminal,  label: 'Terminal',   sub: 'system · 4 windows' },
    { k: 'files', icon: MenuIcons.copy,      label: 'Files',      sub: '~/projects' },
    { k: 'set',   icon: MenuIcons.settings,  label: 'Settings',   sub: 'shell · system · audio' },
    { k: 'ed',    icon: MenuIcons.shape,     label: 'Editor',     sub: 'recent : context-spec.jsx' },
  ];
  const recents = ['gnu.in', 'context spec', 'beret theme'];
  return (
    <Scene theme={tx} w={520} h={460}>
      <DesktopBg theme={tx} />
      {/* Centered launcher */}
      <div style={{
        position: 'absolute', left: '50%', top: 70, transform: 'translateX(-50%)',
        width: 380, borderRadius: 14, overflow: 'hidden',
        background: tx.surface, border: `.5px solid ${tx.border}`,
        boxShadow: '0 32px 80px -8px rgba(17,20,24,.32), 0 12px 32px -4px rgba(17,20,24,.16), 0 0 0 .5px rgba(17,20,24,.08)',
      }}>
        {/* Search bar */}
        <div style={{
          padding: '14px 16px', borderBottom: `.5px solid ${tx.border}`,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ width: 18, height: 18, color: tx.accent }}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width={18} height={18}>
              <circle cx="7" cy="7" r="4.5" />
              <line x1="10.5" y1="10.5" x2="13.5" y2="13.5" strokeLinecap="round" />
            </svg>
          </span>
          <span style={{ flex: 1, fontSize: 17, fontWeight: 500, color: tx.text, letterSpacing: '-0.01em', position: 'relative' }}>
            term
            <span style={{ position: 'absolute', left: 32, top: 1, width: 1, height: 20, background: tx.accent, animation: 'gnu-blink-l 600ms steps(2) infinite' }} />
          </span>
          <span style={{ display: 'inline-flex', gap: 3 }}>
            <span style={{ minWidth: 20, height: 20, padding: '0 6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4, background: tx.kbdBg, border: `.5px solid ${tx.kbdBorder}`, fontFamily: 'ui-monospace, monospace', fontSize: 11, fontWeight: 600, color: tx.textDim }}>esc</span>
          </span>
        </div>
        {/* Section : results */}
        <div style={{ padding: 8 }}>
          <div style={{ padding: '4px 12px 6px', fontSize: 9.5, fontFamily: 'ui-monospace, monospace', letterSpacing: '0.14em', textTransform: 'uppercase', color: tx.sectionLb, fontWeight: 700 }}>1 RESULT</div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
            borderRadius: 8, background: tx.hover, position: 'relative',
          }}>
            <span style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: 2, background: tx.accent, borderRadius: 2 }} />
            <div style={{
              width: 32, height: 32, borderRadius: 7,
              background: tx.accent, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <span style={{ width: 17, height: 17 }}>{apps[0].icon}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, lineHeight: 1.2 }}>
              <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em' }}>
                <span style={{ background: 'rgba(255,106,0,.22)', color: tx.accent, padding: '0 2px', borderRadius: 3 }}>Term</span>inal
              </span>
              <span style={{ fontSize: 10.5, color: tx.textDim, fontFamily: 'ui-monospace, monospace' }}>{apps[0].sub}</span>
            </div>
            <span style={{ display: 'inline-flex', gap: 3 }}>
              <span style={{ minWidth: 20, height: 20, padding: '0 6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4, background: tx.kbdBg, border: `.5px solid ${tx.kbdBorder}`, fontFamily: 'ui-monospace, monospace', fontSize: 11, fontWeight: 600, color: tx.textDim }}>⏎</span>
            </span>
          </div>
          {/* Recents row */}
          <div style={{ padding: '12px 12px 4px', fontSize: 9.5, fontFamily: 'ui-monospace, monospace', letterSpacing: '0.14em', textTransform: 'uppercase', color: tx.sectionLb, fontWeight: 700 }}>RECENT</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, padding: '0 12px 4px' }}>
            {recents.map((r, i) => (
              <span key={i} style={{
                padding: '4px 10px', borderRadius: 999,
                background: tx.surface, border: `.5px solid ${tx.border}`,
                fontSize: 11, color: tx.text, fontFamily: 'ui-sans-serif, system-ui, sans-serif',
              }}>{r}</span>
            ))}
          </div>
        </div>
        {/* Footer */}
        <div style={{
          padding: '8px 14px',
          background: tx.mode === 'dark' ? 'rgba(247,243,237,.03)' : 'rgba(17,20,24,.03)',
          borderTop: `.5px solid ${tx.border}`,
          fontSize: 10, color: tx.textFaint, fontFamily: 'ui-monospace, monospace',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <span>↑↓ navigate</span>
          <span>⏎ launch</span>
          <span>⇥ tab category</span>
          <span style={{ marginLeft: 'auto', color: tx.accent }}>gnu.launcher · v0.4</span>
        </div>
      </div>
      <style>{`
        @keyframes gnu-blink-l { 0%, 49% { opacity: 1 } 50%, 100% { opacity: 0 } }
      `}</style>
    </Scene>
  );
}

/* ════════════════════════════════════════════════════════════════════
   PROD RECETTE SNIPPETS
   ════════════════════════════════════════════════════════════════════ */

RSNIP['R.06'] = {
  neutral: `# R.06 · Notifications tray
trigger        right-click on bell icon in tray  OR  tap on red badge
shape          MenuShell width 300 · anchored top-right of bell
header         icon + "Notifications" + count chip (red) + "Clear all"
body           list of CM.14 toasts compacted (max 4 visible, scroll if more)
footer         "n active · m today" + "Do not disturb" toggle
motion         open M.01 (mask reveal from bell)
règle          le badge C.20 disparaît dès l'ouverture (notifs marquées vues)`,
  qml: `// NotificationsTray.qml
GnuTrayMenu {
  archetype: "06"; width: 300
  anchor: tray.bell.bottomRight
  trigger: tray.bell.rightClick
  GnuHeader {
    icon: "bell"; label: "Notifications"
    badge: notifications.unread
    action: { label: "Clear all"; trigger: notifications.clear }
  }
  ScrollView {
    Layout.fillWidth: true; Layout.preferredHeight: 280
    Column {
      Repeater {
        model: notifications.recent
        delegate: ToastCard {
          tone: modelData.tone; title: modelData.title
          body: modelData.body; age: modelData.age
          onDismiss: notifications.dismiss(modelData)
        }
      }
    }
  }
  GnuFooter {
    text: notifications.unread + " active · " + notifications.today + " today"
    rightAction: GnuToggle { label: "Do not disturb"
                              bind: shell.dnd }
  }
}`,
  qt: `auto* m = new GnuTrayMenu(GnuArchetype::Notifications, this);
m->setWidth(300);
m->addHeader("bell", "Notifications", notifications->unread(),
             "Clear all", [n=notifications]{ n->clear(); });
auto* scroll = new QScrollArea;
scroll->setFixedHeight(280);
auto* list = new QVBoxLayout;
for (auto& n : notifications->recent())
  list->addWidget(new Toast(n.tone, n.title, n.body, n.age));
auto* body = new QWidget; body->setLayout(list);
scroll->setWidget(body); m->addWidget(scroll);
m->addFooter({
  QString::number(notifications->unread()) + " active · "
    + QString::number(notifications->today()) + " today",
  new GnuToggle("Do not disturb", &shell->dnd),
});
connect(tray->bell(), &TrayIcon::rightClicked, m, &Menu::openAt);`,
  flutter: `class NotificationsTray extends GnuContextMenu {
  NotificationsTray(this.notif) : super(
    archetype: GnuArchetype.notifications, width: 300);
  final NotificationController notif;
  @override List<GnuMenuItem> build(BuildContext c) => [
    GnuHeader(icon: 'bell', label: 'Notifications',
      badge: notif.unread, action: ('Clear all', notif.clear)),
    Expanded(child: ListView(children: notif.recent.map((n) =>
      GnuToast(tone: n.tone, title: n.title, body: n.body,
               age: n.age, onClose: () => notif.dismiss(n))
    ).toList())),
    GnuFooter(
      text: '\${notif.unread} active · \${notif.today} today',
      rightAction: GnuToggle(label: 'Do not disturb',
                             valueListenable: shell.dnd),
    ),
  ];
}`,
  css: `<gnu-tray-menu data-archetype="06" data-anchor="bell.br">
  <gnu-header icon="bell" badge="3">Notifications
    <button slot="action">Clear all</button>
  </gnu-header>
  <gnu-toast-list max="4" scroll></gnu-toast-list>
  <gnu-footer>
    <span>4 active · 12 today</span>
    <gnu-toggle slot="right" label="Do not disturb"></gnu-toggle>
  </gnu-footer>
</gnu-tray-menu>`,
};

RSNIP['R.07'] = {
  neutral: `# R.07 · Power tray
trigger        right-click on power icon in tray
shape          MenuShell width 240 · anchored top-right of power
content        CM.13 account row (avatar + name + uptime)
               · § Session  [Lock (⌘⇧L), Sleep, Switch user]
               · sep
               · Restart    (⌘⇧R, danger outline)
               · Shutdown   (⌘⇧S, danger filled)
règle d'or     danger filled = action immédiate · danger outline = confirm step`,
  qml: `// PowerTray.qml
GnuTrayMenu {
  archetype: "07"; width: 240
  anchor: tray.power.bottomRight
  trigger: tray.power.rightClick
  AccountRow { account: session.user }
  GnuSeparator {}
  GnuSection {
    label: "Session"
    GnuRow { icon: "lock"; label: "Lock"
             kbd: ["\u2318","\u21E7","L"]
             onTriggered: session.lock() }
    GnuRow { icon: "moon"; label: "Sleep"
             onTriggered: session.sleep() }
    GnuRow { icon: "users"; label: "Switch user"; submenu: true }
  }
  GnuSeparator {}
  GnuRow { icon: "restart"; label: "Restart"
           kbd: ["\u2318","\u21E7","R"]
           danger: "outline"
           confirmAction: true
           onTriggered: session.restart() }
  GnuRow { icon: "power"; label: "Shutdown"
           kbd: ["\u2318","\u21E7","S"]
           danger: "filled"
           onTriggered: session.shutdown() }
}`,
  qt: `auto* m = new GnuTrayMenu(GnuArchetype::Power, this);
m->setWidth(240);
m->addAccountRow(session->user());
m->addSeparator();
auto* s = m->addSection("Session");
s->addRow({"lock",  "Lock",        {"⌘","⇧","L"}, false, {}, false, [&]{ session->lock();   }});
s->addRow({"moon",  "Sleep",       {},             false, {}, false, [&]{ session->sleep();  }});
s->addRow({"users", "Switch user", {},             true});
m->addSeparator();
m->addRow({"restart",  "Restart",  {"⌘","⇧","R"}, false, {}, /*danger=*/Danger::Outline,
  [&]{ if (confirm("Restart now?")) session->restart(); }});
m->addRow({"power",    "Shutdown", {"⌘","⇧","S"}, false, {}, Danger::Filled,
  [&]{ session->shutdown(); }});`,
  flutter: `class PowerTray extends GnuContextMenu {
  PowerTray(this.session) : super(
    archetype: GnuArchetype.power, width: 240);
  final SessionController session;
  @override List<GnuMenuItem> build(BuildContext c) => [
    AccountRow(account: session.user),
    const GnuSeparator(),
    GnuSection('Session', [
      GnuRow(icon: 'lock',  label: 'Lock',  kbd: ['⌘','⇧','L'], onTriggered: session.lock),
      GnuRow(icon: 'moon',  label: 'Sleep', onTriggered: session.sleep),
      GnuRow(icon: 'users', label: 'Switch user', submenu: true),
    ]),
    const GnuSeparator(),
    GnuRow(icon: 'restart', label: 'Restart',
           kbd: const ['⌘','⇧','R'], danger: DangerLevel.outline,
           onTriggered: () async {
             if (await confirm(c, 'Restart now?')) session.restart();
           }),
    GnuRow(icon: 'power', label: 'Shutdown',
           kbd: const ['⌘','⇧','S'], danger: DangerLevel.filled,
           onTriggered: session.shutdown),
  ];
}`,
  css: `<gnu-tray-menu data-archetype="07" data-width="240">
  <gnu-account-row user="@gnu6"></gnu-account-row>
  <gnu-sep></gnu-sep>
  <gnu-section label="Session">
    <gnu-row icon="lock" label="Lock" kbd="⌘ ⇧ L"></gnu-row>
    <gnu-row icon="moon" label="Sleep"></gnu-row>
    <gnu-row icon="users" label="Switch user" submenu></gnu-row>
  </gnu-section>
  <gnu-sep></gnu-sep>
  <gnu-row icon="restart" label="Restart" kbd="⌘ ⇧ R" data-danger="outline"></gnu-row>
  <gnu-row icon="power" label="Shutdown" kbd="⌘ ⇧ S" data-danger="filled"></gnu-row>
</gnu-tray-menu>`,
};

RSNIP['R.08'] = {
  neutral: `# R.08 · App launcher  (Spotlight-style)
trigger        ⌘Space  OR  click on launcher icon in topbar
shape          centered modal · width 380 · radius 14
               shadow 0/32/80 · ultra-prominent
search         C.16 (large : h auto · font 17 · pad 14/16)
results        sectioned · "N RESULT(S)" mono uppercase header
               results = CM.13-style large rows (icon 32 · label 14)
recents        chip row (pills) sous les results
footer         keyboard hints + version
règle          modal overlay · backdrop click → close · ⎋ aussi
fuzzy          score = match-start · acronym · path · usage frequency`,
  qml: `// AppLauncher.qml
GnuLauncherModal {
  archetype: "08"; width: 380
  trigger: shell.shortcut("\u2318Space")
  backdrop: true; backdropOpacity: 0.36
  property string query: ""

  LargeSearchField {
    placeholder: "Search apps, files, actions…"
    onTextChanged: query = text
    Layout.fillWidth: true
  }

  GnuSection {
    label: query.length
      ? results.count + " RESULT" + (results.count > 1 ? "S" : "")
      : "RECENT"
    Repeater {
      model: results
      delegate: LargeRow {
        icon: modelData.icon; label: modelData.label
        sub: modelData.subtitle
        highlight: query
        onActivate: modelData.launch()
      }
    }
  }
  ChipRow { items: launcher.recents }

  GnuFooter {
    text: "↑↓ navigate · ⏎ launch · ⇥ tab category"
    rightLabel: "gnu.launcher · v" + launcher.version
  }
}`,
  qt: `class AppLauncher : public GnuLauncherModal {
public:
  AppLauncher() {
    setArchetype(GnuArchetype::Launcher); setWidth(380);
    setBackdropOpacity(0.36);
    _search = new LargeSearchField("Search apps, files, actions…", this);
    connect(_search, &SearchField::textChanged,
            this, &AppLauncher::refilter);
    _section = new GnuSection("RECENT", this);
    _chips   = new ChipRow(launcher->recents(), this);
    _footer  = new GnuFooter(
      "↑↓ navigate · ⏎ launch · ⇥ tab category",
      "gnu.launcher · v" + launcher->version());
  }
  void refilter(const QString& q) {
    auto r = launcher->fuzzyFind(q);
    _section->setLabel(q.isEmpty() ? "RECENT"
      : QString("%1 RESULT%2").arg(r.size()).arg(r.size()>1?"S":""));
    _section->setItems(r);
  }
};`,
  flutter: `class AppLauncher extends GnuLauncherModal {
  AppLauncher(this.launcher) : super(
    archetype: GnuArchetype.launcher, width: 380,
    backdropOpacity: 0.36);
  final LauncherController launcher;
  @override Widget build(BuildContext c) => Material(
    color: Colors.transparent,
    child: Column(mainAxisSize: MainAxisSize.min, children: [
      LargeSearchField(
        placeholder: 'Search apps, files, actions…',
        onChanged: launcher.search,
      ),
      ValueListenableBuilder<LauncherResults>(
        valueListenable: launcher.results,
        builder: (_, r, __) => Column(children: [
          GnuSection(r.isQuery
            ? '\${r.count} RESULT\${r.count > 1 ? "S" : ""}'
            : 'RECENT',
            r.items.map((it) => LargeRow(item: it,
              highlight: launcher.query)).toList(),
          ),
          ChipRow(items: launcher.recents),
        ]),
      ),
      const GnuFooter(
        text: '↑↓ navigate · ⏎ launch · ⇥ tab category',
        rightLabel: 'gnu.launcher · v0.4',
      ),
    ]),
  );
}`,
  css: `<gnu-launcher-modal data-archetype="08" data-width="380">
  <gnu-search-large placeholder="Search apps, files, actions…">
    <kbd slot="end">esc</kbd>
  </gnu-search-large>
  <gnu-section label="1 RESULT">
    <gnu-row-large icon="terminal" label="Terminal" sub="system · 4 windows">
      <kbd slot="end">⏎</kbd>
    </gnu-row-large>
  </gnu-section>
  <gnu-section label="RECENT">
    <gnu-chip-row>
      <gnu-chip>gnu.in</gnu-chip>
      <gnu-chip>context spec</gnu-chip>
      <gnu-chip>beret theme</gnu-chip>
    </gnu-chip-row>
  </gnu-section>
  <gnu-footer>↑↓ navigate · ⏎ launch · ⇥ tab category</gnu-footer>
</gnu-launcher-modal>`,
};

/* ════════════════════════════════════════════════════════════════════
   PROD RECETTE REGISTRY
   ════════════════════════════════════════════════════════════════════ */

const CTX_RECETTES_PROD = [
  { id: 'R.06', title: 'Notifications tray · toasts list',
    sub: 'Bell tray + header avec count + liste de toasts compactée + footer DnD. Badge disparaît à l\'ouverture.',
    scene: NotificationsTray, dark: false, snip: RSNIP['R.06'],
    atoms: ['CM.14 ×n', 'C.20 (badge)', 'C.05 (DnD toggle)', 'C.18 (footer)'],
    tokens: [['archétype','06'],['width','300'],['anchor','tray.bell.br'],['max visible','4 · scroll au-delà'],['badge clear','à l\'ouverture'],['footer','DnD toggle + counts']],
    states: ['empty (CM.15 EMPTY · WHISPERED)', 'unread badge', 'open', 'dnd on'],
    a11y: { role: 'menu', name: 'aria-label="Notifications · 3 unread"', keyboard: '⌘N depuis n\'importe où · ↑↓ nav · ⏎ ouvre · ⌫ dismiss · ⎋ close' } },

  { id: 'R.07', title: 'Power tray · session controls',
    sub: 'Account row + Lock/Sleep/Switch user + Restart (outline danger, confirm) + Shutdown (filled danger).',
    scene: TrayPower, dark: false, snip: RSNIP['R.07'],
    atoms: ['CM.13 (account)', 'CM.01 (session)', 'C.08', 'C.01 ×2 (danger)'],
    tokens: [['archétype','07'],['width','240'],['anchor','tray.power.br'],['danger filled','immédiat'],['danger outline','requiert confirm step'],['keyboard shortcuts','⌘⇧ pour les actions critiques']],
    states: ['idle', 'pre-confirm (outline danger row pressed)', 'confirming (modal)', 'committed'],
    a11y: { role: 'menu', name: 'aria-label="Session and power"', keyboard: '↑↓ nav · ⏎ pick · ⎋ close · les danger demandent confirm via dialog' } },

  { id: 'R.08', title: 'App launcher ✦ Spotlight-style',
    sub: 'Modal centré ⌘Space. Search large + résultats grands + chips récents + footer raccourcis. Backdrop click ferme.',
    scene: AppLauncher, dark: false, snip: RSNIP['R.08'],
    atoms: ['CM.09 (search list amplifié)', 'C.16 (large)', 'CM.13-style rows', 'C.18 (footer)'],
    tokens: [['archétype','08'],['width','380'],['radius','14'],['shadow','0/32/80 ultra-prominent'],['search font','17 / 500 / -0.01em'],['result rows','large : icon 32 · label 14'],['fuzzy','score = match-start · acronym · usage freq'],['backdrop','0.36 ink · click ferme']],
    states: ['idle (recents)', 'typing (debounce 80ms)', 'results', 'no match (CM.15 EMPTY)', 'navigating (↑↓)'],
    a11y: { role: 'dialog', name: 'aria-label="App launcher" · aria-modal="true"', keyboard: '⌘Space ouvre · ↑↓ nav · ⏎ launch · ⇥ category · ⎋ close · backdrop click close' } },
];

Object.assign(window, { CTX_RECETTES_PROD, NotificationsTray, AppLauncher });
