// ctxmenu-molecules-extra.jsx
// Four supplemental compositions :
//   CM.09 Search + filtered list
//   CM.10 Radio group with state header  (tray audio body)
//   CM.11 Footer + meta strip
//   CM.12 Connector cluster  (cascade visualization)

/* ════════════════════════════════════════════════════════════════════
   DEMOS
   ════════════════════════════════════════════════════════════════════ */

// CM.09 — Search + filtered list ────────────────────────────────────
function CtxMolSearchList({ theme }) {
  const tx = theme || gnuTheme({ dark: false, brand: 'medium' });
  const all = [
    { i: MenuIcons.tile,      l: 'Tile mode',          s: 'Workspace · 0', score: 9 },
    { i: MenuIcons.tile,      l: 'Tile current window', s: 'Window · 1',   score: 8 },
    { i: MenuIcons.workspace, l: 'New workspace',      s: 'Workspace · 2', score: 0 },
    { i: MenuIcons.add,       l: 'Add widget…',        s: 'Compose · 1',   score: 0 },
    { i: MenuIcons.terminal,  l: 'Open terminal here', s: 'System · 3',    score: 0 },
  ];
  const q = ['', 'ti', 'til', 'tile'];
  const cur = q[useCycle([0, 1, 2, 3], 700)];
  const matches = cur ? all.filter((r) => r.l.toLowerCase().includes(cur.toLowerCase())) : all.slice(0, 5);
  return (
    <CtxStageView theme={tx}>
      <div style={{
        width: 280, padding: 6, borderRadius: 12,
        background: tx.surface, border: `.5px solid ${tx.border}`, boxShadow: tx.shadow,
        display: 'flex', flexDirection: 'column', gap: 4,
      }}>
        {/* Search bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', height: 30,
          borderRadius: 7, background: tx.surface,
          border: `.5px solid ${cur ? tx.accent : tx.border}`,
          margin: '2px 2px 4px',
        }}>
          <span style={{ width: 13, height: 13, color: cur ? tx.accent : tx.textDim }}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" width={13} height={13}>
              <circle cx="7" cy="7" r="4.5" /><line x1="10.5" y1="10.5" x2="13.5" y2="13.5" strokeLinecap="round" />
            </svg>
          </span>
          <span style={{ flex: 1, fontSize: 12, color: cur ? tx.text : tx.textFaint, fontFamily: 'ui-sans-serif, system-ui, sans-serif', position: 'relative' }}>
            {cur || 'Search actions…'}
            {cur && <span style={{ position: 'absolute', left: cur.length * 6.3 + 1, top: 1, width: 1, height: 14, background: tx.accent }} />}
          </span>
          {cur && (
            <span style={{ minWidth: 18, height: 18, padding: '0 5px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 3, background: tx.kbdBg, border: `.5px solid ${tx.kbdBorder}`, fontFamily: 'ui-monospace, monospace', fontSize: 9.5, fontWeight: 600, color: tx.textDim }}>esc</span>
          )}
        </div>
        {/* Result count */}
        <div style={{ padding: '0 12px', fontSize: 9, fontFamily: 'ui-monospace, monospace', color: tx.textFaint, letterSpacing: '0.14em', fontWeight: 700 }}>
          {cur ? `${matches.length} RESULT${matches.length > 1 ? 'S' : ''}` : 'RECENT'}
        </div>
        {/* Results */}
        {matches.slice(0, 4).map((r, i) => {
          const hl = cur ? r.l.replace(new RegExp(`(${cur})`, 'i'), '«$1»') : r.l;
          const parts = hl.split(/«|»/);
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px',
              height: 30, borderRadius: 7, position: 'relative',
              background: i === 0 ? tx.hover : 'transparent',
              fontFamily: 'ui-sans-serif, system-ui, sans-serif', fontSize: 12,
            }}>
              {i === 0 && <span style={{ position: 'absolute', left: 0, top: '22%', bottom: '22%', width: 2, background: tx.accent, borderRadius: 2 }} />}
              <span style={{ width: 13, height: 13, color: tx.accent, opacity: i === 0 ? 1 : 0.7 }}>{r.i}</span>
              <span style={{ fontWeight: 500, color: tx.text }}>
                {parts.map((p, j) => j % 2 === 1
                  ? <span key={j} style={{ background: 'rgba(255,106,0,.22)', color: tx.accent, padding: '0 1px', borderRadius: 2 }}>{p}</span>
                  : <span key={j}>{p}</span>)}
              </span>
              <span style={{ marginLeft: 'auto', fontSize: 9, color: tx.textFaint, fontFamily: 'ui-monospace, monospace' }}>{r.s}</span>
            </div>
          );
        })}
      </div>
      <Annot x={24} y={300} theme={tx}>champ search en haut · count chip · match highlight (rgba accent .22) · « RECENT » quand vide</Annot>
    </CtxStageView>
  );
}

// CM.10 — Radio group + state header  (tray audio body) ────────────
function CtxMolRadioState({ theme }) {
  const tx = theme || gnuTheme({ dark: false, brand: 'medium' });
  const v = 0.64;
  const picked = useCycle([0, 1, 2], 1700);
  const sinks = [
    { l: 'Internal speakers', s: '64% · default' },
    { l: 'HD audio',          s: 'available' },
    { l: 'Studio monitor',    s: '-' },
  ];
  return (
    <CtxStageView theme={tx}>
      <div style={{
        width: 280, borderRadius: 12, overflow: 'hidden',
        background: tx.surface, border: `.5px solid ${tx.border}`, boxShadow: tx.shadow,
      }}>
        {/* State header */}
        <div style={{
          padding: '12px 14px',
          background: tx.mode === 'dark' ? 'rgba(255,106,0,.06)' : 'rgba(255,106,0,.05)',
          borderBottom: `.5px solid ${tx.border}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span style={{ fontSize: 9.5, color: tx.accent, fontFamily: 'ui-monospace, monospace', fontWeight: 700, letterSpacing: '0.14em' }}>OUTPUT</span>
            <span style={{ fontSize: 22, fontWeight: 600, color: tx.text, fontVariantNumeric: 'tabular-nums', fontFamily: 'ui-monospace, monospace', letterSpacing: '-0.02em' }}>{Math.round(v * 100)}%</span>
          </div>
          <div style={{ fontSize: 11, color: tx.textDim, fontFamily: 'ui-monospace, monospace', marginTop: 2 }}>Active : {sinks[picked].l}</div>
          {/* slider */}
          <div style={{ marginTop: 10, height: 4, background: tx.kbdBg, borderRadius: 2, position: 'relative' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${v * 100}%`, background: tx.accent, borderRadius: 2 }} />
            <div style={{ position: 'absolute', left: `${v * 100}%`, top: -4, width: 12, height: 12, borderRadius: 6, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.2)', transform: 'translateX(-6px)', border: `.5px solid ${tx.border}` }} />
          </div>
        </div>
        {/* Radio group */}
        <div style={{ padding: 6 }}>
          <div style={{ padding: '0 12px 2px', fontSize: 9.5, fontFamily: 'ui-monospace, monospace', letterSpacing: '0.14em', textTransform: 'uppercase', color: tx.sectionLb, fontWeight: 700 }}>Output</div>
          {sinks.map((s, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px', height: 28,
              borderRadius: 6, background: i === picked ? tx.hover : 'transparent',
              color: tx.text, fontFamily: 'ui-sans-serif, system-ui, sans-serif', fontSize: 12, position: 'relative',
            }}>
              {i === picked && <span style={{ position: 'absolute', left: 0, top: '22%', bottom: '22%', width: 2, background: tx.accent, borderRadius: 2 }} />}
              <span style={{
                width: 14, height: 14, borderRadius: 7,
                border: `1.2px solid ${i === picked ? tx.accent : tx.kbdBorder}`,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {i === picked && <span style={{ width: 6, height: 6, borderRadius: 3, background: tx.accent }} />}
              </span>
              <span style={{ fontWeight: 500 }}>{s.l}</span>
              <span style={{ marginLeft: 'auto', fontSize: 10, color: tx.textDim, fontFamily: 'ui-monospace, monospace' }}>{s.s}</span>
            </div>
          ))}
        </div>
      </div>
      <Annot x={24} y={300} theme={tx}>C.15 + C.14 + C.07 + C.13 ×n · le body canonique d'un menu tray-audio  ·  pas de cascade · tout visible</Annot>
    </CtxStageView>
  );
}

// CM.11 — Footer + meta strip ───────────────────────────────────────
function CtxMolFooter({ theme }) {
  const tx = theme || gnuTheme({ dark: false, brand: 'medium' });
  return (
    <CtxStageView theme={tx}>
      <div style={{
        width: 280, borderRadius: 12, overflow: 'hidden',
        background: tx.surface, border: `.5px solid ${tx.border}`, boxShadow: tx.shadow,
      }}>
        {/* sketched menu body */}
        <div style={{ padding: 8 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ height: 26, display: 'flex', alignItems: 'center', gap: 8, padding: '0 8px', borderRadius: 6, background: i === 1 ? tx.hover : 'transparent' }}>
              <span style={{ width: 10, height: 10, background: tx.accent, opacity: 0.55, borderRadius: 2 }} />
              <span style={{ flex: 1, height: 5, background: tx.kbdBg, borderRadius: 2 }} />
            </div>
          ))}
        </div>
        {/* Footer */}
        <div style={{
          padding: '6px 12px',
          background: tx.mode === 'dark' ? 'rgba(247,243,237,.03)' : 'rgba(17,20,24,.03)',
          borderTop: `.5px solid ${tx.border}`,
          fontSize: 9.5, color: tx.textFaint, fontFamily: 'ui-monospace, monospace',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span>id 0x4A2</span>
          <span style={{ opacity: 0.5 }}>·</span>
          <span>↑↓ nav · ⏎ pick · ⎋ close</span>
          <span style={{ marginLeft: 'auto', color: tx.accent }}>v6.2</span>
        </div>
      </div>
      <Annot x={24} y={300} theme={tx}>footer h24 · id à gauche · raccourcis au centre · version chip accent à droite</Annot>
    </CtxStageView>
  );
}

// CM.12 — Connector cluster  (cascade visualization) ───────────────
function CtxMolConnectorCluster({ theme }) {
  const tx = theme || gnuTheme({ dark: false, brand: 'medium' });
  const hoverIdx = useCycle([0, 1, 2], 1500);
  return (
    <CtxStageView theme={tx}>
      <div style={{ position: 'relative', width: 480, height: 240 }}>
        {/* Root menu */}
        <div style={{
          position: 'absolute', left: 14, top: 60, width: 140, padding: 6,
          borderRadius: 10, background: tx.surface, border: `.5px solid ${tx.border}`, boxShadow: tx.shadow,
        }}>
          <div style={{ padding: '0 10px 3px', fontSize: 9, color: tx.accent, fontWeight: 700, letterSpacing: '0.14em', fontFamily: 'ui-monospace, monospace' }}>ROOT</div>
          {['Theme', 'Preset', 'Animation'].map((l, i) => (
            <div key={i} style={{
              padding: '0 10px', height: 24, display: 'flex', alignItems: 'center', gap: 8,
              borderRadius: 5, fontSize: 11, fontWeight: 500, color: tx.text,
              background: i === hoverIdx ? tx.hover : 'transparent', position: 'relative',
            }}>
              {i === hoverIdx && <span style={{ position: 'absolute', left: 0, top: 4, bottom: 4, width: 2, background: tx.accent, borderRadius: 2 }} />}
              <span style={{ width: 9, height: 9, background: tx.accent, opacity: 0.6, borderRadius: 2 }} />
              <span style={{ flex: 1 }}>{l}</span>
              <span style={{ color: i === hoverIdx ? tx.accent : tx.textDim, fontSize: 10, fontWeight: 700 }}>▸</span>
            </div>
          ))}
        </div>
        {/* Sub menu (target depends on hover) */}
        <div style={{
          position: 'absolute', left: 176, top: 56 + hoverIdx * 28, width: 140, padding: 6,
          borderRadius: 10, background: tx.surface, border: `.5px solid ${tx.border}`, boxShadow: tx.shadow,
          transition: 'top 240ms cubic-bezier(.2,.7,.2,1)',
        }}>
          <div style={{ padding: '0 10px 3px', fontSize: 9, color: tx.accent, fontWeight: 700, letterSpacing: '0.14em', fontFamily: 'ui-monospace, monospace' }}>{['THEME', 'PRESET', 'ANIMATION'][hoverIdx]}</div>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{ height: 22, padding: '0 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: i === 0 ? tx.accent : tx.kbdBg }} />
              <span style={{ flex: 1, height: 4, background: tx.kbdBg, borderRadius: 2 }} />
            </div>
          ))}
        </div>
        {/* Sub-sub menu */}
        <div style={{
          position: 'absolute', left: 338, top: 80, width: 120, padding: 6,
          borderRadius: 10, background: tx.surface, border: `.5px solid ${tx.border}`, boxShadow: tx.shadow,
          opacity: 0.92,
        }}>
          <div style={{ padding: '0 10px 3px', fontSize: 9, color: tx.accent, fontWeight: 700, letterSpacing: '0.14em', fontFamily: 'ui-monospace, monospace' }}>BERET</div>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ height: 20, padding: '0 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 9, height: 9, borderRadius: 2, background: tx.kbdBg }} />
              <span style={{ flex: 1, height: 4, background: tx.kbdBg, borderRadius: 2 }} />
            </div>
          ))}
        </div>
        {/* Connectors */}
        <svg style={{ position: 'absolute', left: 0, top: 0, width: 480, height: 240, pointerEvents: 'none' }}>
          <line
            x1="156" y1={76 + hoverIdx * 28}
            x2="174" y2={76 + hoverIdx * 28}
            stroke={tx.accent} strokeWidth="1" strokeDasharray="2 2" opacity="0.6"
            style={{ transition: 'all 240ms cubic-bezier(.2,.7,.2,1)' }}
          />
          <circle cx="156" cy={76 + hoverIdx * 28} r="2" fill={tx.accent} style={{ transition: 'cy 240ms cubic-bezier(.2,.7,.2,1)' }} />
          <circle cx="174" cy={76 + hoverIdx * 28} r="2" fill={tx.accent} style={{ transition: 'cy 240ms cubic-bezier(.2,.7,.2,1)' }} />
          <line x1="318" y1="92" x2="336" y2="92" stroke={tx.accent} strokeWidth="1" strokeDasharray="2 2" opacity="0.4" />
          <circle cx="318" cy="92" r="2" fill={tx.accent} opacity="0.6" />
          <circle cx="336" cy="92" r="2" fill={tx.accent} opacity="0.6" />
        </svg>
        {/* Path label */}
        <div style={{ position: 'absolute', left: 14, top: 18, fontSize: 9, color: tx.accent, fontFamily: 'ui-monospace, monospace', fontWeight: 700, letterSpacing: '0.1em' }}>
          ROOT  /  {['THEME', 'PRESET', 'ANIMATION'][hoverIdx]}  /  BERET
        </div>
      </div>
      <Annot x={24} y={350} theme={tx}>3 niveaux · connecteurs C.17 · sub se replace selon le row parent hovered · transition 240 ms cubic</Annot>
    </CtxStageView>
  );
}

/* ════════════════════════════════════════════════════════════════════
   EXTRA MOLECULE SNIPPETS
   ════════════════════════════════════════════════════════════════════ */

MSNIP['CM.09'] = {
  neutral: `# search + filtered list
search          C.16 search field, sticky en haut du menu
count chip      "n RESULTS" en mono uppercase (avant la 1re row)
highlight       match exact wrappé · bg = rgba(accent, .22) · radius 2
empty state     row "RECENT" puis derniers 5 picks de l'utilisateur
keyboard        ⌘F focus search · ↑↓ navigate · ⏎ pick · ⎋ clear puis close
scope           > 6 rows visibles → afficher search automatiquement`,
  css: `<gnu-search-menu>
  <gnu-search></gnu-search>
  <gnu-count>3 RESULTS</gnu-count>
  <gnu-row hover>
    <gnu-icon name="tile"></gnu-icon>
    <span>
      <mark class="gnu-match">Tile</mark> mode
    </span>
  </gnu-row>
  <gnu-row>…</gnu-row>
</gnu-search-menu>
<style>
  .gnu-match {
    background: rgba(255,106,0,.22);
    color: var(--accent); padding: 0 1px; border-radius: 2px;
  }
</style>`,
  qml: `// SearchableMenu.qml
GnuMenuShell {
  property string query: ""
  SearchField {
    id: sf
    onTextChanged: query = text
    Layout.fillWidth: true
  }
  Label {
    text: query
      ? (filtered.count + " RESULT" + (filtered.count > 1 ? "S" : ""))
      : "RECENT"
    color: GnuTheme.fgFaint
    font.family: "IBM Plex Mono"
    font.pixelSize: 9; font.letterSpacing: 1.26
    font.capitalization: Font.AllUppercase
    leftPadding: 12; bottomPadding: 2
  }
  ListView {
    id: filtered
    model: SortFilterProxyModel {
      sourceModel: menu.actions
      filterString: query
      filterRoleName: "label"
    }
    delegate: MenuRow {
      label: model.label
      // highlight matched substring in red.label.replace(...)
    }
  }
}`,
  qt: `class SearchableMenu : public GnuMenuShell {
public:
  SearchableMenu(QWidget* p=nullptr) : GnuMenuShell(p) {
    _search = new SearchField(this);
    _proxy  = new QSortFilterProxyModel(this);
    _proxy->setFilterCaseSensitivity(Qt::CaseInsensitive);
    _list   = new QListView(this);
    _list->setModel(_proxy);
    _list->setItemDelegate(new MenuRowDelegate(this));
    connect(_search, &SearchField::textChanged, this, [this](const QString& q){
      _proxy->setFilterFixedString(q);
      _count->setText(q.isEmpty() ? "RECENT"
        : QString("%1 RESULT%2").arg(_proxy->rowCount())
                                .arg(_proxy->rowCount() > 1 ? "S" : ""));
    });
  }
};`,
  flutter: `class SearchableMenu extends StatefulWidget {
  /* TextField → debounced ValueNotifier<String> →
     ValueListenableBuilder around the rows list.
     Rows are filtered via String.contains(q.toLowerCase()).
     Use TextSpan to highlight match: split label on (q), wrap matches
     in a colored TextSpan. */
}`,
};

MSNIP['CM.10'] = {
  neutral: `# radio group + state header  (tray audio body)
brique          C.15 state header  +  C.14 slider  +  C.07 section  +  C.13 radios
ordre fixe      state header en haut · slider · section · radios · footer optionnel
slider          binding live au state.value
radios          name = "sink" · checked auto-sync avec state.activeSink
règle           PAS de cascade · 4 sinks max avant search · tout visible
keyboard        Tab : slider · radios · footer  ·  ⏎ pick radio  ·  ←/→ slider
audio          mute/unmute via clic sur l'icône (cf. C.15 value)`,
  css: `<gnu-menu data-tray="audio">
  <gnu-state label="OUTPUT" value="64%" meta="Active : Internal"/>
  <gnu-slider name="volume" value="0.64"/>
  <gnu-section label="Output">
    <gnu-radio name="sink" value="int" checked>Internal speakers</gnu-radio>
    <gnu-radio name="sink" value="hd">HD audio</gnu-radio>
    <gnu-radio name="sink" value="mon">Studio monitor</gnu-radio>
  </gnu-section>
</gnu-menu>`,
  qml: `// AudioBody.qml
ColumnLayout {
  spacing: 0
  StateHeader {
    label: "OUTPUT"
    value: Math.round(audio.volume * 100) + "%"
    meta:  "Active : " + audio.activeSink.name
  }
  GnuSlider {
    value: audio.volume
    onMoved: audio.setVolume(value)
    Layout.fillWidth: true
    Layout.margins: 6
  }
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
}`,
  qt: `auto* body = new QWidget;
auto* col   = new QVBoxLayout(body);
col->setContentsMargins(0,0,0,0); col->setSpacing(0);
col->addWidget(new StateHeader("OUTPUT",
  QString::number(int(audio->volume()*100)) + "%",
  "Active : " + audio->activeSink()->name()));
auto* sl = new GnuSlider; sl->setRange(0, 100);
sl->setValue(audio->volume() * 100);
connect(sl, &QSlider::valueChanged,
  audio, [audio](int v){ audio->setVolume(v / 100.0); });
col->addWidget(sl);
auto* sec = new MenuSection("Output", body);
auto* grp = new QButtonGroup(body);
for (auto* s : audio->sinks()) {
  auto* r = new RadioRow(s->label(), body);
  r->setChecked(s == audio->activeSink());
  grp->addButton(r);
  sec->addRow(r);
}
col->addWidget(sec);`,
  flutter: `class AudioMenuBody extends StatelessWidget {
  const AudioMenuBody({super.key, required this.audio});
  final AudioController audio;
  @override Widget build(BuildContext c) => Column(children: [
    StateHeader(label: 'OUTPUT',
      value: '\${(audio.volume.value*100).round()}%',
      meta:  'Active : \${audio.activeSink.name}'),
    GnuSlider(value: audio.volume.value,
      onChanged: audio.setVolume),
    GnuSection('Output', audio.sinks.map((s) => RadioRow(
      label: s.label,
      checked: s == audio.activeSink,
      onPick: () => audio.setSink(s),
    )).toList()),
  ]);
}`,
};

MSNIP['CM.11'] = {
  neutral: `# footer + meta strip
contenu canonique (gauche → droite)  :
  · ID  (mono · ex: "id 0x4A2")
  · raccourcis du menu  (↑↓ nav · ⏎ pick · ⎋ close)
  · version chip  (accent · droite)
hauteur          24
règle            jamais > 1 footer par menu
optionnel       affiché si :
  · l'utilisateur a activé "developer mode"  →  id + perf hints
  · le menu vient d'un widget custom  →  attribution + version
  · le screen reader est détecté  →  hints a11y verbeuses`,
  css: `<gnu-menu>
  <!-- … rows … -->
  <gnu-footer>
    <span>id 0x4A2</span>
    <span class="sep">·</span>
    <span>↑↓ nav · ⏎ pick · ⎋ close</span>
    <span class="version">v6.2</span>
  </gnu-footer>
</gnu-menu>
<style>
  gnu-footer .version {
    margin-left: auto; color: var(--accent);
  }
  gnu-footer .sep { opacity: .5; }
</style>`,
  qml: `// Footer.qml
Rectangle {
  height: 24
  color: Qt.rgba(0, 0, 0, 0.03)
  RowLayout {
    anchors.fill: parent
    anchors.leftMargin: 12; anchors.rightMargin: 12
    spacing: 10
    Label { text: footer.id; color: GnuTheme.fgFaint
            font.family: "IBM Plex Mono"; font.pixelSize: 9.5 }
    Label { text: "·"; color: GnuTheme.fgFaint; opacity: 0.5 }
    Label { text: footer.hint; color: GnuTheme.fgFaint
            font.family: "IBM Plex Mono"; font.pixelSize: 9.5 }
    Item { Layout.fillWidth: true }
    Label { text: footer.version; color: GnuTheme.accent
            font.family: "IBM Plex Mono"; font.pixelSize: 9.5 }
  }
}`,
  qt: `class Footer : public QWidget {
public:
  Footer(const FooterSpec& s, QWidget* p=nullptr) : QWidget(p) {
    setFixedHeight(24);
    auto* l = new QHBoxLayout(this);
    l->setContentsMargins(12,0,12,0); l->setSpacing(10);
    l->addWidget(makeMonoLabel(s.id));
    l->addWidget(makeSep());
    l->addWidget(makeMonoLabel(s.hint));
    l->addStretch();
    auto* v = makeMonoLabel(s.version);
    v->setStyleSheet("color:" + GnuTheme::accent.name() + ";");
    l->addWidget(v);
  }
};`,
  flutter: `class GnuFooter extends StatelessWidget {
  const GnuFooter({super.key, this.id, this.hint, this.version});
  final String? id, hint, version;
  @override Widget build(BuildContext c) => Container(
    height: 24, padding: const EdgeInsets.symmetric(horizontal: 12),
    color: Colors.black.withOpacity(.03),
    child: Row(children: [
      if (id != null) Text(id!, style: _mono),
      const SizedBox(width: 10),
      Text('·', style: _mono.copyWith(color: Colors.black38)),
      const SizedBox(width: 10),
      if (hint != null) Text(hint!, style: _mono),
      const Spacer(),
      if (version != null) Text(version!,
        style: _mono.copyWith(color: GnuTheme.accent)),
    ]),
  );
  static const _mono = TextStyle(fontFamily: 'IBMPlexMono',
    fontSize: 9.5, color: GnuTheme.fgFaint);
}`,
};

MSNIP['CM.12'] = {
  neutral: `# connector cluster  (cascade visualization)
3 niveaux        ROOT · SUB · SUB-SUB
gap horizontal   22 px (espace exact pour le connecteur C.17)
sub position     y = y(row hovered dans le parent) — pas le centre du menu
transition       top 240 ms cubic-bezier(.2,.7,.2,1)  quand on change de row parent
path overlay     "ROOT / SUB / LEAF" en mono accent · coin haut-gauche
règles
  · 1 sub max ouvert par niveau
  · ←/→ navigue dans la cascade  (cf. menu-cascade keyboard contract)
  · ⎋ ferme depuis la pointe vers la racine niveau par niveau`,
  css: `.gnu-cascade {
  position: relative; display: flex; gap: 22px;
  align-items: flex-start;
}
.gnu-cascade__sub {
  position: relative;
  transition: transform 240ms cubic-bezier(.2,.7,.2,1);
}
.gnu-cascade__connector {
  position: absolute; pointer-events: none;
  /* drawn by C.17, anchored to the active row in parent */
}
.gnu-cascade__path {
  position: absolute; top: 0; left: 14px;
  font: 700 9px/1 ui-monospace; letter-spacing: .1em;
  color: var(--accent);
}`,
  qml: `// MenuCascade.qml
Row {
  id: cas
  spacing: 22
  property int parentHoverIdx: 0

  MenuShell { id: root /* rows */ }

  MenuShell {
    id: sub
    y: root.itemAt(cas.parentHoverIdx).y
    Behavior on y { NumberAnimation {
      duration: 240; easing.type: Easing.OutCubic } }
    Connector {  // anchored between root[hoverIdx] and sub top
      from: Qt.point(root.right, root.itemAt(cas.parentHoverIdx).y + 12)
      to:   Qt.point(sub.left,  sub.y + 12)
    }
  }
}`,
  qt: `class MenuCascade : public QWidget {
public:
  void setParentHover(int row) {
    auto* sub = _subs[0];
    int targetY = _root->rowGeometry(row).y();
    auto* a = new QPropertyAnimation(sub, "y", this);
    a->setDuration(240); a->setEasingCurve(QEasingCurve::OutCubic);
    a->setStartValue(sub->y()); a->setEndValue(targetY);
    a->start(QAbstractAnimation::DeleteWhenStopped);
    _connector->setFromTo(
      QPoint(_root->geometry().right(), targetY + 12),
      QPoint(sub->geometry().left(),    targetY + 12));
  }
};`,
  flutter: `class MenuCascade extends StatelessWidget {
  /* Row with AnimatedPositioned for the sub MenuShell.
     CustomPaint overlay draws the connector(s).
     parentHoverIdx tracked via Provider; sub.top
     animates via Tween<double> across 240ms cubic-out. */
}`,
};

/* ════════════════════════════════════════════════════════════════════
   MOLECULE REGISTRY EXTENSION + a11y/states for the original 8
   ════════════════════════════════════════════════════════════════════ */

const CTX_MOLECULES_EXTRA = [
  { id: 'CM.09', title: 'Search · filtered list',
    sub: 'C.16 search + count chip + match highlight. Apparaît si > 6 rangées.',
    demo: CtxMolSearchList,        snip: MSNIP['CM.09'],
    atoms: ['C.16', 'C.10 (count chip)', 'C.02 (rows + highlight)'],
    tokens: [['threshold','> 6 rows'],['highlight','bg rgba(255,106,0,.22)'],['count chip','mono 9 / 0.14em'],['empty state','"RECENT" · 5 derniers picks'],['debounce','80 ms']] },

  { id: 'CM.10', title: 'Radio group + state header',
    sub: 'C.15 + C.14 + C.07 + C.13 ×n. Le body canonique des menus de tray audio / sortie.',
    demo: CtxMolRadioState,        snip: MSNIP['CM.10'],
    atoms: ['C.15', 'C.14', 'C.07', 'C.13'],
    tokens: [['ordre','header · slider · section · radios'],['radios max','4 avant search'],['no cascade','tout visible'],['keyboard','Tab puis ↑↓ dans le group'],['live binding','slider ↔ state.value']] },

  { id: 'CM.11', title: 'Footer · meta strip',
    sub: 'ID + raccourcis + version. Une ligne mono à la base — uniquement quand utile.',
    demo: CtxMolFooter,            snip: MSNIP['CM.11'],
    atoms: ['C.18'],
    tokens: [['hauteur','24'],['contenu','ID · raccourcis · version'],['scope','dev mode · widget custom · screen reader'],['version','accent · droite']] },

  { id: 'CM.12', title: 'Connector cluster',
    sub: 'Cascade 3 niveaux avec connecteurs C.17. Path label "ROOT / SUB / LEAF" en haut.',
    demo: CtxMolConnectorCluster,  snip: MSNIP['CM.12'],
    atoms: ['C.09 ×3', 'C.17 ×2', 'C.10 (path label)'],
    tokens: [['gap horizontal','22 px'],['sub position','y = row hovered'],['transition','240 ms cubic-out'],['1 sub max','par niveau'],['keyboard','←/→ navigate · ⎋ par niveau']] },
];

/* ── States + a11y for original CM.01..CM.08 ────────────────────── */

const _CTX_MOL_STATES = {
  'CM.01': ['idle', 'one-row hovered', 'one-row pressed', 'sub-open (row caret active)'],
  'CM.02': ['idle', 'mascot listening', 'mascot speaking'],
  'CM.03': ['idle', 'preview live-updating', 'slider being dragged'],
  'CM.04': ['idle', 'cell hovered', 'cell picked (animated shape)'],
  'CM.05': ['idle (auto-cycle)', 'slice hovered', 'slice pressed', 'sub-deploying'],
  'CM.06': ['idle', 'one pill hovered', 'one pressed', 'danger hover'],
  'CM.07': ['blooming (M.12 in)', 'rest', 'one branch hovered', 'collapsing (M.12 out)'],
  'CM.08': ['root open', 'sub-open', 'sub-replacing (row hover change)', 'closing'],
};

const _CTX_MOL_A11Y = {
  'CM.01': { role: 'group', name: 'aria-label = section label', keyboard: '↑↓ cycle within section · respecter sub C.04 si présent' },
  'CM.02': { role: 'banner', name: 'décoratif · le row mascot porte aria-label="Summon assistant"', keyboard: '⌘K déclenche depuis n\'importe où' },
  'CM.03': { role: 'banner', name: 'aria-label décrit la cible widget', keyboard: 'slider Tab + ←/→ · radios suivent' },
  'CM.04': { role: 'radiogroup', name: 'aria-label="Tile to"', keyboard: '↑↓←→ navigate dans la grille · Space pick' },
  'CM.05': { role: 'menu', name: 'aria-orientation="vertical" (les slices sont des items)', keyboard: '←/→ cycle slices · Space pick' },
  'CM.06': { role: 'menu', name: 'identique à CM.01', keyboard: '↑↓ · ⏎ · ⎋' },
  'CM.07': { role: 'tree', name: 'aria-expanded sur chaque branche', keyboard: '↑↓ navigate ring · →/← drill · ⏎ pick' },
  'CM.08': { role: 'menu', name: 'aria-haspopup sur rows à caret · aria-level sur le sub', keyboard: '→ open sub · ← close · ⎋ close all' },
};

if (typeof CTX_MOLECULES !== 'undefined') {
  CTX_MOLECULES.forEach((m) => {
    m.states = _CTX_MOL_STATES[m.id] || [];
    m.a11y   = _CTX_MOL_A11Y[m.id] || null;
  });
  CTX_MOLECULES_EXTRA.forEach((m) => {
    m.states = m.id === 'CM.09' ? ['idle (RECENT)', 'typing', 'results', 'no match']
             : m.id === 'CM.10' ? ['idle', 'volume dragging', 'sink switching']
             : m.id === 'CM.11' ? ['idle', 'screen reader detected (verbose)']
             : ['idle', 'parent row hovered', 'sub-replacing'];
    m.a11y = m.id === 'CM.09' ? { role: 'search', name: 'aria-label="Filter menu"', keyboard: '⌘F focus · ↑↓ nav · ⏎ pick · ⎋ clear' }
           : m.id === 'CM.10' ? { role: 'group', name: 'aria-label="Audio output"', keyboard: 'Tab puis ←/→ slider · ↑↓ radios' }
           : m.id === 'CM.11' ? { role: 'status', name: 'aria-live="polite"', keyboard: 'non-focusable' }
           : { role: 'presentation', name: 'connecteurs décoratifs · path label aria-current', keyboard: '←/→ navigate cascade · ⎋ ferme un niveau' };
  });
}

Object.assign(window, { CTX_MOLECULES_EXTRA });
