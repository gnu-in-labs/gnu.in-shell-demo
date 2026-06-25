// ctxmenu-molecules-prod.jsx
// Four production-grade molecules : account row · toast · empty state · breadcrumb

/* ════════════════════════════════════════════════════════════════════
   PROD MOLECULE DEMOS
   ════════════════════════════════════════════════════════════════════ */

// CM.13 — Account row (avatar + name + status + sub) ───────────────
function CtxMolAccount({ theme }) {
  const tx = theme || gnuTheme({ dark: false, brand: 'medium' });
  return (
    <CtxStageView theme={tx}>
      <div style={{
        width: 300, padding: 6, borderRadius: 12,
        background: tx.surface, border: `.5px solid ${tx.border}`, boxShadow: tx.shadow,
      }}>
        {/* Account row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '10px 12px', borderRadius: 8, background: tx.hover, position: 'relative',
        }}>
          <span style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: 2, background: tx.accent, borderRadius: 2 }} />
          <div style={{ position: 'relative', width: 32, height: 32, flexShrink: 0 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 16, background: tx.accent, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'ui-monospace, monospace', fontSize: 13, fontWeight: 700,
            }}>G</div>
            <span style={{
              position: 'absolute', right: -1, bottom: -1, width: 10, height: 10,
              borderRadius: 5, background: '#5F7F52',
              border: `1.5px solid ${tx.surface}`,
            }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, lineHeight: 1.2 }}>
            <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em' }}>Gaston · @gnu6</span>
            <span style={{ fontSize: 10.5, color: tx.textDim, fontFamily: 'ui-monospace, monospace' }}>online · gnu6.live</span>
          </div>
          <span style={{ color: tx.accent, fontSize: 13, fontWeight: 700, transform: 'translateX(2px)' }}>▸</span>
        </div>
        {/* Followup rows */}
        <div style={{ height: 1, background: tx.border, margin: '4px 8px' }} />
        {['Switch account', 'Account settings', 'Sign out'].map((l, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px', height: 28, borderRadius: 6 }}>
            <span style={{ width: 12, height: 12, background: i === 2 ? '#E63A1F' : tx.accent, opacity: 0.7, borderRadius: 2 }} />
            <span style={{ fontSize: 12, color: i === 2 ? '#E63A1F' : tx.text, fontWeight: 500 }}>{l}</span>
            {i === 0 && <span style={{ marginLeft: 'auto', padding: '1px 5px', fontSize: 8, fontFamily: 'ui-monospace, monospace', fontWeight: 700, color: tx.accent, border: `.5px solid ${tx.accent}`, borderRadius: 3, letterSpacing: '0.12em' }}>2</span>}
          </div>
        ))}
      </div>
      <Annot x={24} y={300} theme={tx}>C.19 avatar 32 + display-name 13/600 + meta 10.5 mono · status visible · chevron au hover</Annot>
    </CtxStageView>
  );
}

// CM.14 — Toast / notification card ─────────────────────────────────
function CtxMolToast({ theme }) {
  const tx = theme || gnuTheme({ dark: false, brand: 'medium' });
  return (
    <CtxStageView theme={tx}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 320 }}>
        {[
          { tone: 'info',    icon: MenuIcons.info, title: 'Workspace 3 created', body: 'Two windows moved · ⌘Z to undo', age: 'now' },
          { tone: 'success', icon: '✓',            title: 'Theme applied', body: 'Beret · green paper', age: '12 s' },
          { tone: 'danger',  icon: '!',            title: 'Sync failed', body: 'Check network · retry in 12 s', age: '2 min' },
        ].map((t, i) => {
          const tone = t.tone === 'danger' ? '#E63A1F' : t.tone === 'success' ? '#5F7F52' : tx.accent;
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px',
              borderRadius: 10, background: tx.surface,
              border: `.5px solid ${tx.border}`,
              boxShadow: '0 6px 20px rgba(17,20,24,.12)',
              position: 'relative',
            }}>
              <span style={{
                width: 22, height: 22, borderRadius: 11,
                background: tone, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, fontFamily: 'ui-monospace, monospace', fontSize: 11, fontWeight: 700,
              }}>
                {typeof t.icon === 'string' ? t.icon : <span style={{ width: 12, height: 12 }}>{t.icon}</span>}
              </span>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: tx.text, letterSpacing: '-0.01em' }}>{t.title}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 9.5, color: tx.textFaint, fontFamily: 'ui-monospace, monospace', flexShrink: 0 }}>{t.age}</span>
                </div>
                <span style={{ fontSize: 11, color: tx.textDim, fontFamily: 'ui-monospace, monospace' }}>{t.body}</span>
              </div>
              <span style={{
                position: 'absolute', top: 8, right: 8, width: 14, height: 14, borderRadius: 7,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: tx.textFaint, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                opacity: 0,  // visible only on hover in real impl
              }}>×</span>
              <span style={{ position: 'absolute', left: 0, top: 14, bottom: 14, width: 2, background: tone, borderRadius: 2 }} />
            </div>
          );
        })}
      </div>
      <Annot x={24} y={320} theme={tx}>card r10 · tick latéral selon tone · icône 22 disque · titre 12.5/600 · body mono dim · timestamp droite · × au hover</Annot>
    </CtxStageView>
  );
}

// CM.15 — Empty state ───────────────────────────────────────────────
function CtxMolEmpty({ theme }) {
  const tx = theme || gnuTheme({ dark: false, brand: 'medium' });
  return (
    <CtxStageView theme={tx}>
      <div style={{
        width: 320, padding: '28px 24px',
        borderRadius: 12, background: tx.surface,
        border: `.5px dashed ${tx.border}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center',
      }}>
        {/* Illustration */}
        <div style={{
          width: 56, height: 56, borderRadius: 28,
          background: tx.mode === 'dark' ? 'rgba(255,106,0,.08)' : 'rgba(255,106,0,.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `.5px dashed ${tx.accent}`,
        }}>
          <span style={{ width: 24, height: 24, color: tx.accent, opacity: 0.7 }}>{MenuIcons.bell}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: tx.text, letterSpacing: '-0.01em' }}>No notifications yet</span>
          <span style={{ fontSize: 11, color: tx.textDim, fontFamily: 'ui-monospace, monospace', maxWidth: 220, lineHeight: 1.4 }}>
            The shell will whisper here when something needs your attention.
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
          <button style={{
            padding: '6px 12px', borderRadius: 6,
            background: tx.accent, color: '#fff', border: 'none',
            fontSize: 11, fontWeight: 600, fontFamily: 'ui-sans-serif, system-ui, sans-serif',
            cursor: 'pointer',
          }}>Notification settings</button>
          <button style={{
            padding: '6px 12px', borderRadius: 6,
            background: 'transparent', color: tx.textDim,
            border: `.5px solid ${tx.border}`,
            fontSize: 11, fontWeight: 500, fontFamily: 'ui-sans-serif, system-ui, sans-serif',
            cursor: 'pointer',
          }}>Learn more</button>
        </div>
        <div style={{
          marginTop: 6, padding: '2px 8px', fontSize: 8.5,
          fontFamily: 'ui-monospace, monospace', color: tx.textFaint,
          letterSpacing: '0.12em', fontWeight: 700,
          border: `.5px solid ${tx.border}`, borderRadius: 3,
        }}>EMPTY · WHISPERED</div>
      </div>
      <Annot x={24} y={310} theme={tx}>illustration 56 dashed border accent · titre 13/600 · body 11 mono · CTA primary + secondary · TAG type</Annot>
    </CtxStageView>
  );
}

// CM.16 — Breadcrumb header ─────────────────────────────────────────
function CtxMolBreadcrumb({ theme }) {
  const tx = theme || gnuTheme({ dark: false, brand: 'medium' });
  const cur = useCycle([0, 1, 2], 1700);
  const trails = [
    ['Theme', 'Beret', 'Custom'],
    ['Workspace', 'Tile mode', 'Right ½'],
    ['Audio', 'Output', 'HD audio'],
  ];
  const cap = trails[cur];
  return (
    <CtxStageView theme={tx}>
      <div style={{
        width: 320, borderRadius: 12, overflow: 'hidden',
        background: tx.surface, border: `.5px solid ${tx.border}`, boxShadow: tx.shadow,
      }}>
        {/* Breadcrumb */}
        <div style={{
          padding: '8px 12px',
          background: tx.mode === 'dark' ? 'rgba(247,243,237,.03)' : 'rgba(17,20,24,.03)',
          borderBottom: `.5px solid ${tx.border}`,
          display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontFamily: 'ui-monospace, monospace',
        }}>
          {/* Back arrow */}
          <span style={{ color: tx.textDim, fontWeight: 700, cursor: 'pointer' }}>‹</span>
          {/* Path */}
          {cap.map((seg, i) => (
            <React.Fragment key={i}>
              <span style={{
                color: i === cap.length - 1 ? tx.accent : tx.textDim,
                fontWeight: i === cap.length - 1 ? 700 : 500,
                letterSpacing: i === cap.length - 1 ? '0.08em' : '0.04em',
                textTransform: i === cap.length - 1 ? 'uppercase' : 'none',
                fontFamily: i === cap.length - 1 ? 'ui-monospace, monospace' : 'ui-sans-serif, system-ui, sans-serif',
                fontSize: i === cap.length - 1 ? 9.5 : 11,
              }}>{seg}</span>
              {i < cap.length - 1 && <span style={{ color: tx.textFaint, fontSize: 10 }}>/</span>}
            </React.Fragment>
          ))}
          {/* Close */}
          <span style={{ marginLeft: 'auto', color: tx.textDim, fontSize: 11, cursor: 'pointer' }}>⎋</span>
        </div>
        {/* Body */}
        <div style={{ padding: 6 }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px', height: 28,
              borderRadius: 6, background: i === 0 ? tx.hover : 'transparent', position: 'relative',
            }}>
              {i === 0 && <span style={{ position: 'absolute', left: 0, top: '22%', bottom: '22%', width: 2, background: tx.accent, borderRadius: 2 }} />}
              <span style={{ width: 11, height: 11, background: tx.accent, opacity: 0.7, borderRadius: 2 }} />
              <span style={{ fontSize: 12, fontWeight: 500, color: tx.text }}>Option {i + 1}</span>
            </div>
          ))}
        </div>
      </div>
      <Annot x={24} y={320} theme={tx}>chevron back · path en mono · last segment = ACCENT uppercase · close ⎋ à droite · alternative à la cascade pour mobile</Annot>
    </CtxStageView>
  );
}

/* ════════════════════════════════════════════════════════════════════
   PROD MOLECULE SNIPPETS
   ════════════════════════════════════════════════════════════════════ */

MSNIP['CM.13'] = {
  neutral: `# account row
hauteur         44 (display-name + meta + status)
icône           C.19 avatar 32 · status dot
contenu         · ligne 1 : display-name 13/600 + handle "@gnu6"
                · ligne 2 : status + domaine en mono dim
chevron         caret accent au hover  (drill vers profil)
suivi           rows "switch account" · "settings" · "sign out" (danger)
règle           1 max par menu · toujours en haut · jamais dans body de tray`,
  css: `.gnu-account-row {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 12px; border-radius: 8px;
  background: var(--hover); position: relative;
}
.gnu-account-row__body {
  display: flex; flex-direction: column; line-height: 1.2;
}
.gnu-account-row__name {
  font: 600 13px/1.2 ui-sans-serif; letter-spacing: -0.01em;
}
.gnu-account-row__handle {
  color: var(--accent); font-weight: 500;
}
.gnu-account-row__meta {
  font: 400 10.5px/1.2 ui-monospace; color: var(--fg-dim);
}`,
  qml: `// AccountRow.qml
ItemDelegate {
  id: row
  property var account
  height: 44; width: parent.width
  background: Rectangle {
    radius: 8
    color: row.hovered || row.activeFocus ? GnuTheme.hover : "transparent"
  }
  contentItem: RowLayout {
    spacing: 12
    Avatar { size: 32
             initials: account.initials
             status:   account.status
             bg:       account.color }
    ColumnLayout {
      spacing: 1; Layout.fillWidth: true
      RowLayout {
        spacing: 4
        Label { text: account.name
                font.pixelSize: 13; font.weight: Font.DemiBold
                font.letterSpacing: -0.13 }
        Label { text: "@" + account.handle
                font.pixelSize: 13; font.weight: Font.Medium
                color: GnuTheme.accent }
      }
      Label { text: account.status + " · " + account.domain
              font.pixelSize: 10.5; font.family: "IBM Plex Mono"
              color: GnuTheme.fgDim }
    }
    Label { text: "\u25B8"; color: GnuTheme.accent
            font.pixelSize: 13; font.weight: Font.Bold
            transform: Translate {
              x: row.hovered ? 2 : 0
              Behavior on x { NumberAnimation { duration: 140 } }
            } }
  }
}`,
  qt: `class AccountRow : public QWidget {
public:
  AccountRow(const Account& a, QWidget* p=nullptr) : QWidget(p) {
    setFixedHeight(44);
    auto* h = new QHBoxLayout(this);
    h->setContentsMargins(12, 10, 12, 10); h->setSpacing(12);
    h->addWidget(new Avatar(32, a.initials, a.status));
    auto* col = new QVBoxLayout; col->setSpacing(1);
    auto* nameRow = new QHBoxLayout; nameRow->setSpacing(4);
    auto* name = new QLabel(a.name);
    name->setStyleSheet("font:600 13px ui-sans-serif;");
    auto* handle = new QLabel("@" + a.handle);
    handle->setStyleSheet("color:#FF6A00; font:500 13px ui-sans-serif;");
    nameRow->addWidget(name); nameRow->addWidget(handle);
    nameRow->addStretch();
    col->addLayout(nameRow);
    col->addWidget(makeMonoLabel(a.status + " · " + a.domain));
    h->addLayout(col, 1);
    auto* caret = new QLabel("▸");
    caret->setStyleSheet("color:#FF6A00; font:700 13px ui-sans-serif;");
    h->addWidget(caret);
  }
};`,
  gpui: `// GPUI · AccountRow
#[derive(IntoElement)]
struct AccountRow { account: Account }
impl RenderOnce for AccountRow {
  fn render(self, _: &mut WindowContext) -> impl IntoElement {
    div().h(px(44.)).px(px(12.)).flex().items_center().gap(px(10.))
      .child(GnuAvatar::new(self.account.initials(), AvatarStatus::Online))
      .child(div().flex_col()
        .child(div().text_sm().font_weight(FontWeight::BOLD)
          .text_color(gpui::rgb(0xF7F3ED)).child(self.account.display_name()))
        .child(div().text_xs().font_family("IBM Plex Mono")
          .text_color(gpui::rgb(0x667085)).child(self.account.handle())))
  }
}`,
};

MSNIP['CM.14'] = {
  neutral: `# toast / notification card
shape           rounded card r10 · pad 10/12 · shadow 0/6/20 rgba(0,0,0,.12)
tone            info | success | danger
tone color      info=accent · success=#5F7F52 · danger=#E63A1F
icon            22 px disque · couleur=tone · fg=#fff
title           12.5 / 600 / -0.01em
body            11 mono · textDim · 1-2 lignes max
tick latéral    2 px accent=tone · à gauche
timestamp       9.5 mono · textFaint · marginLeft auto · "now/12 s/2 min"
× close         coin TR · visible au hover seulement
animation       slide-in from edge (cf. motion M.01 adapted)  · auto-dismiss 5 s default
règle           jamais empilées > 3 visibles · les surplus collapsent dans le tray`,
  css: `.gnu-toast {
  position: relative;
  display: flex; align-items: flex-start; gap: 10px;
  padding: 10px 12px; border-radius: 10px;
  background: var(--surface);
  border: .5px solid var(--border);
  box-shadow: 0 6px 20px rgba(17,20,24,.12);
}
.gnu-toast::before {  /* tick */
  content: ""; position: absolute;
  left: 0; top: 14px; bottom: 14px; width: 2px;
  background: var(--tone-color); border-radius: 2px;
}
.gnu-toast__icon {
  width: 22px; height: 22px; border-radius: 11px;
  background: var(--tone-color); color: #fff;
  display: grid; place-items: center;
  flex-shrink: 0;
}
.gnu-toast__close {
  position: absolute; top: 8px; right: 8px;
  opacity: 0; transition: opacity 100ms;
}
.gnu-toast:hover .gnu-toast__close { opacity: 1; }`,
  qml: `// Toast.qml
Rectangle {
  property string tone: "info"   // info · success · danger
  property string title
  property string body
  property string age
  property var    toneColor: ({
    info:    GnuTheme.accent,
    success: GnuTheme.beret,
    danger:  "#E63A1F"
  })

  radius: 10; color: GnuTheme.surface
  border.width: 0.5; border.color: GnuTheme.border
  layer.enabled: true
  layer.effect: DropShadow { verticalOffset: 6; radius: 20
                             color: Qt.rgba(0,0,0,.12) }
  // tick + icon + body  — RowLayout omitted for brevity
  Component.onCompleted: dismissTimer.start()
  Timer { id: dismissTimer; interval: 5000
          onTriggered: parent.destroy() }
}`,
  qt: `class Toast : public QFrame {
public:
  enum Tone { Info, Success, Danger };
  Toast(Tone t, const QString& title, const QString& body,
        QWidget* p=nullptr) : QFrame(p) {
    setWindowFlags(Qt::Tool | Qt::FramelessWindowHint
                 | Qt::WindowStaysOnTopHint);
    setAttribute(Qt::WA_TranslucentBackground);
    auto* e = new QGraphicsDropShadowEffect(this);
    e->setBlurRadius(20); e->setOffset(0, 6);
    e->setColor(QColor(0,0,0,30)); setGraphicsEffect(e);
    setStyleSheet(R"(
      QFrame { background: %1; border-radius: 10px;
               border: .5px solid %2; }
    )"_qs.arg(GnuTheme::surface.name())
        .arg(GnuTheme::border.name()));
    // …layout with tick (paintEvent), icon disc, title, body, age, close…
    QTimer::singleShot(5000, this, &QObject::deleteLater);
  }
};`,
  gpui: `// GPUI · GnuToast
#[derive(Clone, Copy, PartialEq)] pub enum ToastTone { Info, Success, Danger }
struct GnuToast { tone: ToastTone, icon: SharedString, title: SharedString, body: SharedString }
impl Render for GnuToast {
  fn render(&mut self, _: &mut ViewContext<Self>) -> impl IntoElement {
    let accent = match self.tone {
      ToastTone::Info    => gpui::rgb(0x3D8DCC),
      ToastTone::Success => gpui::rgb(0x5F7F52),
      ToastTone::Danger  => gpui::rgb(0xE63A1F),
    };
    div().w(px(320.)).p(px(14.)).rounded(px(10.))
      .bg(gpui::rgb(0x1A1F26)).shadow(menu_shadow())
      .border_l_2().border_color(accent)
      .flex().items_start().gap(px(10.))
      .child(div().text_color(accent).child(self.icon.clone()))
      .child(div().flex_col()
        .child(div().text_sm().font_weight(FontWeight::BOLD)
          .text_color(gpui::rgb(0xF7F3ED)).child(self.title.clone()))
        .child(div().text_xs().text_color(gpui::rgb(0xA1A6AD)).child(self.body.clone())))
  }
}`,
};

MSNIP['CM.15'] = {
  neutral: `# empty state
context         menu rendu avec aucun contenu  (recents vide · pas de wifi · etc)
shape           card dashed border · padding 28/24 · centré
illustration    56 × 56 disque · bg accent .06 · border dashed accent · icône 24 (.7α)
title           13 / 600 / -0.01em · ALWAYS proche-action ("No notifications yet")
body            11 mono · textDim · 220 px max · ton chaud ("The shell will whisper here…")
CTAs            primary (accent button) + secondary (outline) · max 2
type tag        EMPTY · LOADING · ERROR · WHISPERED  — coin BG  (cf. tool ◇.3)
règle           jamais d'illustration générique · contextualise toujours`,
  css: `.gnu-empty {
  padding: 28px 24px; border-radius: 12px;
  background: var(--surface);
  border: .5px dashed var(--border);
  display: flex; flex-direction: column; align-items: center;
  gap: 14px; text-align: center;
}
.gnu-empty__art {
  width: 56px; height: 56px; border-radius: 28px;
  background: rgba(255,106,0,.06);
  border: .5px dashed var(--accent);
  display: grid; place-items: center;
}
.gnu-empty__cta--primary {
  background: var(--accent); color: #fff; border: none;
  padding: 6px 12px; border-radius: 6px;
  font: 600 11px/1 ui-sans-serif; cursor: pointer;
}
.gnu-empty__cta--secondary {
  background: transparent; color: var(--fg-dim);
  border: .5px solid var(--border);
  padding: 6px 12px; border-radius: 6px;
  font: 500 11px/1 ui-sans-serif; cursor: pointer;
}`,
  qml: `// EmptyState.qml
Rectangle {
  property string title
  property string body
  property url    icon
  property var    primaryAction
  property var    secondaryAction
  property string variant: "EMPTY · WHISPERED"
  color: GnuTheme.surface; radius: 12
  border.width: 0.5; border.color: GnuTheme.border
  // … dashed border via Canvas …
  ColumnLayout {
    anchors.centerIn: parent; spacing: 14
    Item {  // illustration
      width: 56; height: 56
      Rectangle { anchors.fill: parent; radius: 28
                  color: Qt.rgba(1, .42, 0, .06)
                  /* dashed border via Canvas overlay */ }
      Image { anchors.centerIn: parent; source: icon
              sourceSize: Qt.size(24,24) }
    }
    Label { text: title; font.pixelSize: 13; font.weight: Font.DemiBold }
    Label { text: body; color: GnuTheme.fgDim
            font.family: "IBM Plex Mono"; font.pixelSize: 11
            wrapMode: Text.WordWrap; horizontalAlignment: Text.AlignHCenter
            Layout.preferredWidth: 220 }
    RowLayout {
      spacing: 6
      Button { text: primaryAction.label
               onClicked: primaryAction.trigger() }
      Button { visible: secondaryAction !== undefined
               text: secondaryAction.label
               onClicked: secondaryAction.trigger()
               flat: true }
    }
    Label { text: variant; color: GnuTheme.fgFaint
            font.family: "IBM Plex Mono"; font.pixelSize: 8.5
            font.letterSpacing: 1.02
            font.capitalization: Font.AllUppercase
            font.weight: Font.Bold
            background: Rectangle { /* outline */ } }
  }
}`,
  qt: `class EmptyState : public QFrame {
public:
  EmptyState(const EmptyConfig& cfg, QWidget* p=nullptr) : QFrame(p) {
    setStyleSheet("background:" + GnuTheme::surface.name() + ";"
                  "border-radius:12px;");
    auto* col = new QVBoxLayout(this);
    col->setContentsMargins(24, 28, 24, 28); col->setSpacing(14);
    col->setAlignment(Qt::AlignCenter);
    col->addWidget(makeIllustration(cfg.icon));
    col->addWidget(makeLabel(cfg.title, 13, QFont::DemiBold));
    col->addWidget(makeLabel(cfg.body, 11, QFont::Normal,
                             GnuTheme::fgDim, /*wrap=*/true, /*maxW=*/220));
    auto* ctas = new QHBoxLayout; ctas->setSpacing(6);
    ctas->addWidget(makePrimaryButton(cfg.primaryAction));
    if (cfg.hasSecondary)
      ctas->addWidget(makeSecondaryButton(cfg.secondaryAction));
    col->addLayout(ctas);
    col->addWidget(new Tag(cfg.variant, TagVariant::Outline));
  }
};`,
  gpui: `// GPUI · GnuEmpty
#[derive(Clone, Copy, PartialEq)] pub enum EmptyVariant { Empty, Loading, Error, Whispered }
struct GnuEmpty { variant: EmptyVariant, title: SharedString, body: SharedString }
impl Render for GnuEmpty {
  fn render(&mut self, _: &mut ViewContext<Self>) -> impl IntoElement {
    div().flex_col().items_center().justify_center().gap(px(8.)).py(px(32.))
      .child(div().size(px(40.)).rounded_full().bg(gpui::rgb(0x1A1F26))
        .flex().items_center().justify_center()
        .child(div().font_family("IBM Plex Mono").text_sm()
          .text_color(gpui::rgb(0xFF6A00)).child(match self.variant {
            EmptyVariant::Loading => ">_", EmptyVariant::Error => "!",
            EmptyVariant::Whispered => "~", EmptyVariant::Empty => "·",
          })))
      .child(div().text_sm().font_weight(FontWeight::BOLD)
        .text_color(gpui::rgb(0xF7F3ED)).child(self.title.clone()))
      .child(div().text_xs().text_color(gpui::rgb(0x667085)).child(self.body.clone()))
  }
}`,
};

MSNIP['CM.16'] = {
  neutral: `# breadcrumb header
context         remplace la cascade quand l'écran est étroit  (mobile · touch)
hauteur         28-32 · padding 8/12
bg              rgba(ink/paper, .03)  — bande discrète
contenu         · ‹  back arrow  (cliquable)
                · path segments séparés par "/"
                · last segment = ACCENT · UPPERCASE · mono 9.5 / 700 / 0.08em
                · ⎋  close à l'extrême droite
keyboard        ← back (= cliquer la flèche) · ⎋ ferme tout · clic segment = jump
règle           seul archétype où on remplace une cascade par une nav linéaire`,
  css: `.gnu-breadcrumb {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 12px; height: 28px;
  background: rgba(17,20,24,.03);
  border-bottom: .5px solid var(--border);
  font: 500 11px/1 ui-sans-serif;
  font-family: ui-monospace, monospace;
}
.gnu-breadcrumb__back { color: var(--fg-dim); cursor: pointer; }
.gnu-breadcrumb__seg  { color: var(--fg-dim); cursor: pointer; }
.gnu-breadcrumb__seg--active {
  color: var(--accent); font-weight: 700;
  text-transform: uppercase; letter-spacing: .08em;
  font-size: 9.5px;
}
.gnu-breadcrumb__sep  { color: var(--fg-faint); }
.gnu-breadcrumb__close { margin-left: auto; color: var(--fg-dim);
                          cursor: pointer; }`,
  qml: `// BreadcrumbHeader.qml
Rectangle {
  property var trail: []
  height: 28
  color: Qt.rgba(0,0,0,.03)
  RowLayout {
    anchors.fill: parent
    anchors.leftMargin: 12; anchors.rightMargin: 12; spacing: 6
    Label { text: "\u2039"; color: GnuTheme.fgDim
            font.weight: Font.Bold
            MouseArea { anchors.fill: parent
                        onClicked: nav.popBack() } }
    Repeater {
      model: trail
      delegate: RowLayout {
        spacing: 6
        Label {
          text: index === trail.length - 1
            ? modelData.toUpperCase() : modelData
          color: index === trail.length - 1
            ? GnuTheme.accent : GnuTheme.fgDim
          font.weight: index === trail.length - 1 ? Font.Bold : Font.Medium
          font.family: index === trail.length - 1
            ? "IBM Plex Mono" : "Inter"
          font.pixelSize: index === trail.length - 1 ? 9.5 : 11
          font.letterSpacing: index === trail.length - 1 ? 0.76 : 0
          MouseArea { anchors.fill: parent
                      onClicked: nav.jumpTo(index) }
        }
        Label { visible: index < trail.length - 1
                text: "/"; color: GnuTheme.fgFaint }
      }
    }
    Item { Layout.fillWidth: true }
    Label { text: "\u238B"; color: GnuTheme.fgDim
            MouseArea { anchors.fill: parent
                        onClicked: menu.close() } }
  }
}`,
  qt: `class BreadcrumbHeader : public QWidget {
public:
  BreadcrumbHeader(const QStringList& trail, QWidget* p=nullptr)
    : QWidget(p) {
    setFixedHeight(28);
    setStyleSheet("background: rgba(17,20,24,.03);"
                  "border-bottom: .5px solid " +
                  GnuTheme::border.name() + ";");
    auto* h = new QHBoxLayout(this);
    h->setContentsMargins(12, 0, 12, 0); h->setSpacing(6);
    auto* back = makeClickableLabel("‹");
    h->addWidget(back);
    for (int i = 0; i < trail.size(); ++i) {
      auto* seg = makeClickableLabel(
        i == trail.size() - 1 ? trail[i].toUpper() : trail[i]);
      if (i == trail.size() - 1)
        seg->setStyleSheet("color:#FF6A00; font:700 9.5px 'IBM Plex Mono';"
                           "letter-spacing:0.76px;");
      h->addWidget(seg);
      if (i < trail.size() - 1)
        h->addWidget(makeLabel("/"));
    }
    h->addStretch();
    h->addWidget(makeClickableLabel("⎋"));
  }
};`,
  gpui: `// GPUI · GnuBreadcrumb
#[derive(IntoElement)]
struct GnuBreadcrumb { trail: Vec<SharedString>, on_back: Arc<dyn Fn()>, on_close: Arc<dyn Fn()> }
impl RenderOnce for GnuBreadcrumb {
  fn render(self, _: &mut WindowContext) -> impl IntoElement {
    div().h(px(36.)).px(px(12.)).flex().items_center().gap(px(4.))
      .border_b_1().border_color(gpui::rgb(0x2B3037))
      .child(div().on_click({let cb = self.on_back.clone(); move |_, _| cb()})
        .child(div().text_xs().font_family("IBM Plex Mono")
          .text_color(gpui::rgb(0x667085)).child("‹")))
      .children(self.trail.iter().enumerate().map(|(i, seg)|
        div().flex().items_center().gap(px(4.))
          .when(i > 0, |el| el.child(div().text_xs()
            .text_color(gpui::rgb(0x2B3037)).child("▸")))
          .child(div().text_xs().font_family("IBM Plex Mono")
            .text_color(gpui::rgb(0xF7F3ED)).child(seg.clone()))))
      .child(div().ml_auto().on_click(move |_, _| (self.on_close)())
        .child(div().text_xs().font_family("IBM Plex Mono")
          .text_color(gpui::rgb(0x667085)).child("×")))
  }
}`,
};

/* ════════════════════════════════════════════════════════════════════
   PROD MOLECULE REGISTRY
   ════════════════════════════════════════════════════════════════════ */

const CTX_MOLECULES_PROD = [
  { id: 'CM.13', title: 'Account row',
    sub: 'C.19 avatar 32 + display-name + handle + status. Drill vers profil. 1 max par menu.',
    demo: CtxMolAccount,    snip: MSNIP['CM.13'],
    atoms: ['C.19', 'C.11 (sub-label)', 'C.04 (chevron)'],
    tokens: [['height','44'],['avatar','C.19 size 32'],['name','13 / 600 / -0.01em'],['handle','accent · 500'],['meta','10.5 mono dim'],['chevron','accent au hover · translateX +2']],
    states: ['rest', 'hover', 'press', 'focus', 'sub-open (caret stays accent)'],
    a11y: { role: 'menuitem', name: 'aria-label = name + handle + status', keyboard: '⏎ drill · → aussi · ⎋ ferme' } },

  { id: 'CM.14', title: 'Toast · notification',
    sub: 'Card flottante info/success/danger. Tick latéral coloré. Auto-dismiss 5 s. × visible au hover.',
    demo: CtxMolToast,      snip: MSNIP['CM.14'],
    atoms: ['C.20 (count en-cluster)', 'C.18 (timestamp)', 'illustration tone'],
    tokens: [['shape','card r10'],['shadow','0/6/20 rgba(ink,.12)'],['tick','2 px latéral · tone color'],['icon disc','22 px'],['auto-dismiss','5 s'],['max stack','3 visibles']],
    states: ['entering (slide-in 240ms)', 'rest', 'hover (× visible)', 'dismissing (slide-out 180ms)', 'queued (collapsed)'],
    a11y: { role: 'status', name: 'aria-live="polite" (info/success) · aria-live="assertive" (danger)', keyboard: '⎋ dismiss focused toast · Tab cycle dans la stack' } },

  { id: 'CM.15', title: 'Empty state',
    sub: 'Illustration centrée + titre proche-action + body chaud + CTAs (primary + secondary). Type tag.',
    demo: CtxMolEmpty,      snip: MSNIP['CM.15'],
    atoms: ['C.21 (type tag)', 'C.18 (CTA primary/secondary)', 'illustration'],
    tokens: [['shape','dashed card r12'],['illustration','56 px disc · dashed accent'],['title','13 / 600 proche-action'],['body','11 mono dim · 220 px max'],['CTAs','primary accent + secondary outline · max 2'],['variants','EMPTY · LOADING · ERROR · WHISPERED']],
    states: ['empty', 'loading (spinner inline)', 'error (icône !)', 'whispered (mascot 24 px)'],
    a11y: { role: 'status', name: 'aria-label = title + body', keyboard: 'Tab focus CTAs · ⏎ active primary · ⎋ ferme menu' } },

  { id: 'CM.16', title: 'Breadcrumb header',
    sub: 'Path linéaire ROOT / SUB / LEAF. Remplace la cascade quand l\'écran est étroit. Last segment = ACCENT.',
    demo: CtxMolBreadcrumb, snip: MSNIP['CM.16'],
    atoms: ['C.10 (segment style)', 'C.04 (back arrow)', 'C.18 (close)'],
    tokens: [['hauteur','28'],['pad','8 / 12'],['bg','rgba(ink,.03)'],['back','‹ · cliquable'],['sep','/'],['last','ACCENT · uppercase · 9.5 / 700 / 0.08em'],['close','⎋ · droite']],
    states: ['root only', '2 levels', '3 levels', '4+ (truncate · "…" au milieu)'],
    a11y: { role: 'navigation', name: 'aria-label="Menu path"', keyboard: '← pop · ⎋ close all · ⏎ jump to segment · last = aria-current="page"' } },
];

/* attach states/a11y dynamically for the prod set (already inline above) */

Object.assign(window, { CTX_MOLECULES_PROD });
