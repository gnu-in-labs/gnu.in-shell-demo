// ctxmenu-atoms-prod.jsx
// Six more atoms — production-grade : avatar · badge · tag · progress · tooltip · step

/* ════════════════════════════════════════════════════════════════════
   PROD ATOM DEMOS
   ════════════════════════════════════════════════════════════════════ */

// C.19 — Avatar (initials/photo + status dot) ───────────────────────
function CtxAtomAvatar({ theme }) {
  const tx = theme || gnuTheme({ dark: false, brand: 'medium' });
  const sizes = [
    { px: 20, label: '20 · row inline' },
    { px: 24, label: '24 · row standard' },
    { px: 32, label: '32 · row prominent (CM.13)' },
    { px: 44, label: '44 · header / sheet' },
  ];
  const initials = ['G', 'JS', 'A', 'MX'];
  const states = ['online', 'busy', 'away', 'offline'];
  const stateColor = { online: '#5F7F52', busy: '#E63A1F', away: '#E8A227', offline: 'rgba(17,20,24,.4)' };
  return (
    <CtxStageView theme={tx}>
      <div style={{ display: 'flex', gap: 22, alignItems: 'flex-end' }}>
        {sizes.map((s, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <div style={{ position: 'relative', width: s.px, height: s.px }}>
              <div style={{
                width: s.px, height: s.px, borderRadius: '50%',
                background: tx.accent, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'ui-monospace, monospace', fontSize: s.px * 0.42, fontWeight: 700,
                letterSpacing: '0.02em',
                border: `.5px solid ${tx.mode === 'dark' ? 'rgba(255,255,255,.1)' : 'rgba(17,20,24,.08)'}`,
              }}>{initials[i]}</div>
              <span style={{
                position: 'absolute', right: -1, bottom: -1,
                width: s.px * 0.32, height: s.px * 0.32, borderRadius: '50%',
                background: stateColor[states[i]],
                border: `1.5px solid ${tx.surface}`,
              }} />
            </div>
            <div style={{ fontSize: 9.5, color: tx.textDim, fontFamily: 'ui-monospace, monospace', letterSpacing: '0.05em' }}>{states[i]}</div>
          </div>
        ))}
      </div>
      <Annot x={24} y={300} theme={tx}>4 tailles · 20/24/32/44 · initials 0.42× · status dot 0.32× au coin BR · ring 1.5px theme.surface</Annot>
    </CtxStageView>
  );
}

// C.20 — Badge / count chip ─────────────────────────────────────────
function CtxAtomBadge({ theme }) {
  const tx = theme || gnuTheme({ dark: false, brand: 'medium' });
  const variants = [
    { kind: 'dot',   color: '#E63A1F' },
    { kind: 'count', value: '3', color: '#E63A1F' },
    { kind: 'count', value: '12', color: tx.accent },
    { kind: 'count', value: '99+', color: tx.accent },
  ];
  return (
    <CtxStageView theme={tx}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 280 }}>
        {variants.map((v, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px', height: 32,
            borderRadius: 7, background: i === 1 ? tx.hover : 'transparent',
            color: tx.text, fontFamily: 'ui-sans-serif, system-ui, sans-serif', fontSize: 13, position: 'relative',
          }}>
            {i === 1 && <span style={{ position: 'absolute', left: 0, top: '22%', bottom: '22%', width: 2, background: tx.accent, borderRadius: 2 }} />}
            <span style={{ width: 14, height: 14, color: tx.accent }}>{MenuIcons.bell}</span>
            <span style={{ fontWeight: 500 }}>{['Notifications', '3 nouvelles', 'Updates available', 'Messages'][i]}</span>
            <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center' }}>
              {v.kind === 'dot' ? (
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: v.color, boxShadow: `0 0 0 2px ${tx.surface}` }} />
              ) : (
                <span style={{
                  minWidth: 18, height: 18, padding: '0 5px',
                  borderRadius: 9,
                  background: v.color, color: '#fff',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'ui-monospace, monospace', fontSize: 10, fontWeight: 700,
                  fontVariantNumeric: 'tabular-nums',
                }}>{v.value}</span>
              )}
            </span>
          </div>
        ))}
      </div>
      <Annot x={24} y={300} theme={tx}>dot 7 px · count h18 pill · max display "99+" au-delà · couleur red pour alerte · accent pour info</Annot>
    </CtxStageView>
  );
}

// C.21 — Tag chip (BETA / NEW / etc) ───────────────────────────────
function CtxAtomTag({ theme }) {
  const tx = theme || gnuTheme({ dark: false, brand: 'medium' });
  const tags = [
    { label: 'NEW',          bg: tx.accent, fg: '#fff' },
    { label: 'BETA',         bg: 'transparent', fg: tx.accent, border: tx.accent },
    { label: 'EXPERIMENTAL', bg: '#5F7F52',  fg: '#fff' },
    { label: 'DEPRECATED',   bg: 'transparent', fg: '#E63A1F', border: '#E63A1F' },
    { label: 'PRO',          bg: '#111418', fg: '#FFD166' },
  ];
  return (
    <CtxStageView theme={tx}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: 280 }}>
        {tags.map((t, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px', height: 30,
            borderRadius: 7, background: i === 0 ? tx.hover : 'transparent',
            color: tx.text, fontFamily: 'ui-sans-serif, system-ui, sans-serif', fontSize: 12, position: 'relative',
          }}>
            {i === 0 && <span style={{ position: 'absolute', left: 0, top: '22%', bottom: '22%', width: 2, background: tx.accent, borderRadius: 2 }} />}
            <span style={{ width: 12, height: 12, background: tx.accent, opacity: 0.7, borderRadius: 2 }} />
            <span style={{ fontWeight: 500 }}>Feature {i + 1}</span>
            <span style={{ marginLeft: 'auto' }}>
              <span style={{
                padding: '2px 6px',
                background: t.bg,
                color: t.fg,
                border: t.border ? `.5px solid ${t.border}` : 'none',
                borderRadius: 3,
                fontFamily: 'ui-monospace, monospace', fontSize: 8.5, fontWeight: 700,
                letterSpacing: '0.12em',
              }}>{t.label}</span>
            </span>
          </div>
        ))}
      </div>
      <Annot x={24} y={300} theme={tx}>h auto · pad 2/6 · fs 8.5 · 0.12em letter-spacing · NEW=accent filled · BETA=outline · DEPRECATED=#E63A1F outline</Annot>
    </CtxStageView>
  );
}

// C.22 — Progress (linear + indeterminate spinner) ──────────────────
function CtxAtomProgress({ theme }) {
  const tx = theme || gnuTheme({ dark: false, brand: 'medium' });
  const v = [0.18, 0.42, 0.78, 1.0][useCycle([0, 1, 2, 3], 700)];
  return (
    <CtxStageView theme={tx}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22, width: 280 }}>
        {/* Determinate */}
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 500, color: tx.text }}>Downloading update</span>
            <span style={{ fontSize: 10, color: tx.textDim, fontFamily: 'ui-monospace, monospace', fontVariantNumeric: 'tabular-nums' }}>{Math.round(v * 100)}%</span>
          </div>
          <div style={{ height: 3, background: tx.kbdBg, borderRadius: 2, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${v * 100}%`, background: tx.accent, borderRadius: 2, transition: 'width 600ms cubic-bezier(.2,.7,.2,1)' }} />
          </div>
        </div>
        {/* Indeterminate */}
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 500, color: tx.text }}>Reloading shell</span>
            <span style={{ fontSize: 10, color: tx.textDim, fontFamily: 'ui-monospace, monospace' }}>working…</span>
          </div>
          <div style={{ height: 3, background: tx.kbdBg, borderRadius: 2, position: 'relative', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute', top: 0, bottom: 0, width: '40%',
              background: `linear-gradient(90deg, transparent, ${tx.accent}, transparent)`,
              borderRadius: 2,
              animation: 'gnu-shimmer 1400ms cubic-bezier(.45,.05,.55,.95) infinite',
            }} />
          </div>
        </div>
        {/* Spinner inline */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" style={{ animation: 'gnu-spin 900ms linear infinite' }}>
            <circle cx="7" cy="7" r="5.5" fill="none" stroke={tx.kbdBg} strokeWidth="1.5" />
            <path d="M 7 1.5 A 5.5 5.5 0 0 1 12.5 7" fill="none" stroke={tx.accent} strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span style={{ fontSize: 11, color: tx.text }}>Connecting…</span>
        </div>
      </div>
      <style>{`
        @keyframes gnu-shimmer { 0% { left: -40%; } 100% { left: 100%; } }
        @keyframes gnu-spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }
      `}</style>
      <Annot x={24} y={310} theme={tx}>determinate 3 h · transition 600ms · indeterminate 40% shimmer 1.4s · spinner 14 px 900ms</Annot>
    </CtxStageView>
  );
}

// C.23 — Tooltip ─────────────────────────────────────────────────────
function CtxAtomTooltip({ theme }) {
  const tx = theme || gnuTheme({ dark: false, brand: 'medium' });
  return (
    <CtxStageView theme={tx}>
      <div style={{ position: 'relative', width: 280, height: 200 }}>
        {/* anchor button */}
        <div style={{
          position: 'absolute', left: 100, top: 80,
          width: 36, height: 36, borderRadius: 7,
          background: tx.hover, border: `.5px solid ${tx.accent}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ width: 16, height: 16, color: tx.accent }}>{MenuIcons.layout}</span>
        </div>
        {/* tooltip */}
        <div style={{
          position: 'absolute', left: 60, top: 130,
          padding: '5px 9px',
          background: '#111418', color: '#F7F3ED',
          borderRadius: 5,
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap',
          boxShadow: '0 4px 12px rgba(0,0,0,.25)',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span>Layout preset</span>
          <span style={{ opacity: 0.5 }}>·</span>
          <span style={{ display: 'inline-flex', gap: 2 }}>
            {['⌘', 'L'].map((k, i) => (
              <span key={i} style={{
                minWidth: 14, height: 14, padding: '0 3px',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 2, background: 'rgba(255,255,255,.12)',
                fontFamily: 'ui-monospace, monospace', fontSize: 9, fontWeight: 600,
              }}>{k}</span>
            ))}
          </span>
          {/* arrow */}
          <span style={{
            position: 'absolute', top: -3, left: 64,
            width: 6, height: 6, background: '#111418', transform: 'rotate(45deg)', borderRadius: 1,
          }} />
        </div>
        <div style={{ position: 'absolute', left: 80, top: 50, fontSize: 9, color: tx.textFaint, fontFamily: 'ui-monospace, monospace' }}>delay 400 ms · pop 120 ms</div>
      </div>
      <Annot x={24} y={300} theme={tx}>bg toujours #111418 (peu importe le thème) · fg shellWhite · radius 5 · arrow 6×6 rotate 45 · delay hover 400 ms</Annot>
    </CtxStageView>
  );
}

// C.24 — Step indicator (1/3, 2/3, 3/3) ─────────────────────────────
function CtxAtomStep({ theme }) {
  const tx = theme || gnuTheme({ dark: false, brand: 'medium' });
  const cur = useCycle([0, 1, 2], 1300);
  const steps = ['Authenticate', 'Select sinks', 'Confirm'];
  return (
    <CtxStageView theme={tx}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: 320 }}>
        {/* Dot variant */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span style={{ fontSize: 9, fontFamily: 'ui-monospace, monospace', color: tx.textFaint, letterSpacing: '0.14em', fontWeight: 700 }}>DOTS · 1/3</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {[0, 1, 2].map((i) => (
              <React.Fragment key={i}>
                <span style={{
                  width: i === cur ? 16 : 8, height: 8,
                  borderRadius: 4,
                  background: i <= cur ? tx.accent : tx.kbdBg,
                  transition: 'width 220ms cubic-bezier(.32,.72,.32,1), background 120ms',
                }} />
                {i < 2 && <span style={{ flex: 1, height: 1, background: i < cur ? tx.accent : tx.border }} />}
              </React.Fragment>
            ))}
          </div>
          <span style={{ fontSize: 11, fontWeight: 500, color: tx.text, fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>{steps[cur]}</span>
        </div>
        {/* Numbered variant */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span style={{ fontSize: 9, fontFamily: 'ui-monospace, monospace', color: tx.textFaint, letterSpacing: '0.14em', fontWeight: 700 }}>NUMBERED · 2/3</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {steps.map((s, i) => (
              <React.Fragment key={i}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    width: 18, height: 18, borderRadius: 9,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    background: i < cur ? tx.accent : i === cur ? tx.surface : 'transparent',
                    border: `1px solid ${i <= cur ? tx.accent : tx.border}`,
                    color: i < cur ? '#fff' : i === cur ? tx.accent : tx.textFaint,
                    fontFamily: 'ui-monospace, monospace', fontSize: 9.5, fontWeight: 700,
                  }}>{i < cur ? '✓' : i + 1}</span>
                  <span style={{ fontSize: 10, fontWeight: i === cur ? 600 : 400, color: i <= cur ? tx.text : tx.textFaint }}>{s.split(' ')[0]}</span>
                </div>
                {i < steps.length - 1 && <span style={{ flex: 1, height: 1, background: i < cur ? tx.accent : tx.border }} />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
      <Annot x={24} y={300} theme={tx}>dots 8 · active 16 · transition 220ms cubic · numbered : 18 px · check sur done · line entre étapes</Annot>
    </CtxStageView>
  );
}

/* ════════════════════════════════════════════════════════════════════
   PROD SNIPPETS
   ════════════════════════════════════════════════════════════════════ */

SNIP['C.19'] = {
  neutral: `# avatar
sizes           20 · 24 · 32 · 44
shape           circle (borderRadius 50%)
content         initials 0.42× du size · ui-mono · 700 · -0.02em letter-spacing
   OR           photo (cover · object-fit cover)
background      accent par défaut · OU palette (hash du name → couleur)
status dot      0.32× au coin BR · ring 1.5px theme.surface
states          online #5F7F52 · busy #E63A1F · away #E8A227 · offline rgba(ink,.4)
a11y            aria-label = name complet · role="img" si photo`,
  css: `.gnu-avatar {
  width: var(--size); height: var(--size);
  border-radius: 50%; position: relative;
  background: var(--accent); color: #fff;
  display: grid; place-items: center;
  font: 700 calc(var(--size) * 0.42)/1 ui-monospace, monospace;
  letter-spacing: -0.02em;
}
.gnu-avatar__dot {
  position: absolute; right: -1px; bottom: -1px;
  width: calc(var(--size) * 0.32);
  height: calc(var(--size) * 0.32);
  border-radius: 50%;
  border: 1.5px solid var(--surface);
}
.gnu-avatar__dot[data-state="online"]  { background: #5F7F52; }
.gnu-avatar__dot[data-state="busy"]    { background: #E63A1F; }
.gnu-avatar__dot[data-state="away"]    { background: #E8A227; }
.gnu-avatar__dot[data-state="offline"] { background: rgba(17,20,24,.4); }`,
  qml: `// Avatar.qml
Item {
  id: av
  property int    size: 24
  property string initials: ""
  property url    photo
  property string status: "offline"
  property color  bg: GnuTheme.accent
  width: size; height: size

  Rectangle {
    anchors.fill: parent; radius: size / 2
    color: av.photo == "" ? av.bg : "transparent"
    Image { anchors.fill: parent
            source: av.photo; fillMode: Image.PreserveAspectCrop
            layer.enabled: true
            layer.effect: OpacityMask {
              maskSource: Item { width: av.width; height: av.height
                Rectangle { anchors.fill: parent; radius: av.width/2 } }
            } }
    Label { anchors.centerIn: parent; text: av.initials
            color: "white"
            font.family: "IBM Plex Mono"
            font.pixelSize: av.size * 0.42
            font.weight: Font.Bold }
  }
  Rectangle {
    width: av.size * 0.32; height: av.size * 0.32
    radius: width / 2
    x: parent.width - width + 1; y: parent.height - height + 1
    color: ({ online:"#5F7F52", busy:"#E63A1F",
              away:"#E8A227", offline:"#6E737A" })[av.status]
    border.width: 1.5; border.color: GnuTheme.surface
  }
}`,
  qt: `class Avatar : public QWidget {
public:
  enum Status { Online, Busy, Away, Offline };
  Avatar(int size, const QString& initials,
         Status status, QWidget* p=nullptr)
    : QWidget(p), _size(size), _initials(initials), _status(status) {
    setFixedSize(size, size);
  }
protected:
  void paintEvent(QPaintEvent*) override {
    QPainter g(this); g.setRenderHint(QPainter::Antialiasing);
    // disc
    QPainterPath p; p.addEllipse(rect());
    g.fillPath(p, GnuTheme::accent);
    // initials
    QFont f("IBM Plex Mono", _size * 0.42 * 72 / 96, QFont::Bold);
    g.setFont(f); g.setPen(Qt::white);
    g.drawText(rect(), Qt::AlignCenter, _initials);
    // status dot
    int d = _size * 0.32;
    QRect dot(width() - d + 1, height() - d + 1, d, d);
    g.setBrush(_statusColor()); g.setPen(QPen(GnuTheme::surface, 1.5));
    g.drawEllipse(dot);
  }
private:
  QColor _statusColor() const {
    switch (_status) {
      case Online:  return QColor("#5F7F52");
      case Busy:    return QColor("#E63A1F");
      case Away:    return QColor("#E8A227");
      case Offline: return QColor(17,20,24,102);
    }
    return Qt::transparent;
  }
};`,
  flutter: `class GnuAvatar extends StatelessWidget {
  const GnuAvatar({super.key, required this.size,
                   required this.initials, this.photoUrl,
                   this.status = AvatarStatus.offline});
  final double size; final String initials;
  final String? photoUrl; final AvatarStatus status;
  @override Widget build(BuildContext c) => SizedBox(
    width: size, height: size,
    child: Stack(clipBehavior: Clip.none, children: [
      Container(
        decoration: BoxDecoration(
          shape: BoxShape.circle, color: GnuTheme.accent,
          image: photoUrl != null ? DecorationImage(
            image: NetworkImage(photoUrl!), fit: BoxFit.cover) : null,
        ),
        alignment: Alignment.center,
        child: photoUrl != null ? null : Text(initials,
          style: TextStyle(color: Colors.white,
            fontFamily: 'IBMPlexMono',
            fontSize: size * 0.42, fontWeight: FontWeight.w700,
            letterSpacing: -0.02 * size * 0.42)),
      ),
      Positioned(
        right: -1, bottom: -1,
        child: Container(width: size * 0.32, height: size * 0.32,
          decoration: BoxDecoration(
            shape: BoxShape.circle, color: status.color,
            border: Border.all(color: GnuTheme.surface, width: 1.5))),
      ),
    ]),
  );
}`,
};

SNIP['C.20'] = {
  neutral: `# badge / count
dot variant     7 × 7 · #E63A1F (alerte) · ring 2px theme.surface
count variant   h 18 · pad 0 5 · radius 9 · min-width 18
              · couleur red pour alerte · accent pour info
font           10 mono · 700 · tabular-nums · #fff
cap             "99+" si > 99
position        marginLeft auto · à la fin du row
animation       scale 0.7 → 1.0 (overshoot · 220ms) à l'apparition`,
  css: `.gnu-badge--dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: #E63A1F;
  box-shadow: 0 0 0 2px var(--surface);
}
.gnu-badge--count {
  min-width: 18px; height: 18px; padding: 0 5px;
  border-radius: 9px; background: #E63A1F; color: #fff;
  display: inline-flex; align-items: center; justify-content: center;
  font: 700 10px/1 ui-monospace, monospace;
  font-variant-numeric: tabular-nums;
  animation: gnu-badge-in 220ms cubic-bezier(.32,.72,.32,1) backwards;
}
.gnu-badge--info { background: var(--accent); }
@keyframes gnu-badge-in {
  from { transform: scale(0.7); }
  to   { transform: scale(1); }
}`,
  qml: `// Badge.qml
Rectangle {
  property int    count: 0
  property bool   info: false
  visible: count > 0
  height: 18
  implicitWidth: Math.max(18, txt.implicitWidth + 10)
  radius: 9
  color: info ? GnuTheme.accent : "#E63A1F"
  scale: 1
  Component.onCompleted: { scale = 0.7; scaleAnim.start(); }
  NumberAnimation on scale { id: scaleAnim
    from: 0.7; to: 1.0; duration: 220
    easing.type: Easing.OutCubic }
  Label {
    id: txt; anchors.centerIn: parent
    text: count > 99 ? "99+" : count
    color: "white"; font.family: "IBM Plex Mono"
    font.pixelSize: 10; font.weight: Font.Bold
  }
}`,
  qt: `class Badge : public QWidget {
public:
  Badge(int count, bool info=false, QWidget* p=nullptr)
    : QWidget(p), _count(count), _info(info) {
    QFontMetrics fm(font());
    int w = qMax(18, fm.horizontalAdvance(_text()) + 10);
    setFixedSize(w, 18);
    _anim = new QPropertyAnimation(this, "geometry", this);
    _anim->setDuration(220);
    _anim->setEasingCurve(QEasingCurve::OutCubic);
  }
  QString _text() const {
    return _count > 99 ? "99+" : QString::number(_count);
  }
  void paintEvent(QPaintEvent*) override {
    QPainter g(this); g.setRenderHint(QPainter::Antialiasing);
    g.setBrush(_info ? GnuTheme::accent : QColor("#E63A1F"));
    g.setPen(Qt::NoPen);
    g.drawRoundedRect(rect(), 9, 9);
    g.setPen(Qt::white);
    g.setFont(QFont("IBM Plex Mono", 8, QFont::Bold));
    g.drawText(rect(), Qt::AlignCenter, _text());
  }
};`,
  flutter: `class GnuBadge extends StatelessWidget {
  const GnuBadge.dot({super.key}) : count = 0, info = false;
  const GnuBadge.count(this.count, {super.key, this.info = false});
  final int count; final bool info;
  @override Widget build(BuildContext c) {
    if (count == 0) return Container(width: 7, height: 7,
      decoration: BoxDecoration(shape: BoxShape.circle,
        color: const Color(0xFFE63A1F),
        boxShadow: [BoxShadow(color: GnuTheme.surface,
          spreadRadius: 2, blurRadius: 0)]));
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0.7, end: 1),
      duration: const Duration(milliseconds: 220),
      curve: Curves.easeOutCubic,
      builder: (_, scale, child) => Transform.scale(scale: scale,
        child: child),
      child: Container(
        constraints: const BoxConstraints(minWidth: 18, minHeight: 18),
        padding: const EdgeInsets.symmetric(horizontal: 5),
        decoration: BoxDecoration(
          color: info ? GnuTheme.accent : const Color(0xFFE63A1F),
          borderRadius: BorderRadius.circular(9),
        ),
        alignment: Alignment.center,
        child: Text(count > 99 ? '99+' : '\$count',
          style: const TextStyle(color: Colors.white,
            fontFamily: 'IBMPlexMono', fontSize: 10,
            fontWeight: FontWeight.bold)),
      ),
    );
  }
}`,
};

SNIP['C.21'] = {
  neutral: `# tag chip
height          18 · pad 2/6 · radius 3
font            8.5 mono · 700 · letter-spacing 0.12em · UPPERCASE
position        marginLeft auto OU inline avec le label
variantes
  · filled       bg = accent · fg = #fff           (NEW)
  · outline      bg = transparent · fg + border 0.5 (BETA · DEPRECATED)
  · solid-color  bg = couleur custom · fg = #fff   (EXPERIMENTAL · PRO)
sémantique      NEW = accent · BETA = accent outline · DEPRECATED = #E63A1F outline
règle           jamais > 1 tag par row · jamais "DEPRECATED" sur action critique`,
  css: `.gnu-tag {
  padding: 2px 6px;
  border-radius: 3px;
  font: 700 8.5px/1 ui-monospace, monospace;
  letter-spacing: .12em;
  text-transform: uppercase;
}
.gnu-tag--filled  { background: var(--accent); color: #fff; }
.gnu-tag--outline {
  background: transparent; color: var(--accent);
  border: .5px solid var(--accent);
}
.gnu-tag--danger  {
  background: transparent; color: #E63A1F;
  border: .5px solid #E63A1F;
}
.gnu-tag--pro {
  background: #111418; color: #FFD166;
}`,
  qml: `// Tag.qml
Rectangle {
  property string label
  property string variant: "filled"  // filled · outline · danger · pro
  implicitWidth: txt.implicitWidth + 12
  implicitHeight: 18
  radius: 3
  color: variant === "filled" ? GnuTheme.accent
       : variant === "pro" ? "#111418" : "transparent"
  border.width: ["outline","danger"].includes(variant) ? 0.5 : 0
  border.color: variant === "danger" ? "#E63A1F" : GnuTheme.accent
  Label {
    id: txt; anchors.centerIn: parent
    text: label.toUpperCase()
    font.family: "IBM Plex Mono"; font.pixelSize: 8.5
    font.weight: Font.Bold; font.letterSpacing: 1.02
    color: variant === "filled" ? "white"
         : variant === "danger" ? "#E63A1F"
         : variant === "pro"    ? "#FFD166"
         : GnuTheme.accent
  }
}`,
  qt: `enum class TagVariant { Filled, Outline, Danger, Pro };
class Tag : public QLabel {
public:
  Tag(const QString& l, TagVariant v, QWidget* p=nullptr)
    : QLabel(l.toUpper(), p), _v(v) {
    setContentsMargins(6, 2, 6, 2);
    auto* f = new QFont("IBM Plex Mono", 6, QFont::Bold);
    f->setLetterSpacing(QFont::AbsoluteSpacing, 1.0);
    setFont(*f);
    QString css;
    switch (v) {
      case TagVariant::Filled:
        css = "background:#FF6A00; color:white;"; break;
      case TagVariant::Outline:
        css = "color:#FF6A00; border:.5px solid #FF6A00;"; break;
      case TagVariant::Danger:
        css = "color:#E63A1F; border:.5px solid #E63A1F;"; break;
      case TagVariant::Pro:
        css = "background:#111418; color:#FFD166;"; break;
    }
    setStyleSheet(css + "border-radius:3px;");
  }
private: TagVariant _v;
};`,
  flutter: `enum TagVariant { filled, outline, danger, pro }
class GnuTag extends StatelessWidget {
  const GnuTag(this.label, {super.key, this.variant = TagVariant.filled});
  final String label; final TagVariant variant;
  @override Widget build(BuildContext c) {
    final colors = switch (variant) {
      TagVariant.filled  => (bg: GnuTheme.accent,  fg: Colors.white,  border: null),
      TagVariant.outline => (bg: Colors.transparent, fg: GnuTheme.accent,
                             border: GnuTheme.accent),
      TagVariant.danger  => (bg: Colors.transparent, fg: const Color(0xFFE63A1F),
                             border: const Color(0xFFE63A1F)),
      TagVariant.pro     => (bg: const Color(0xFF111418), fg: const Color(0xFFFFD166),
                             border: null),
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: colors.bg, borderRadius: BorderRadius.circular(3),
        border: colors.border != null
          ? Border.all(color: colors.border!, width: .5) : null,
      ),
      child: Text(label.toUpperCase(), style: TextStyle(
        color: colors.fg, fontFamily: 'IBMPlexMono',
        fontSize: 8.5, fontWeight: FontWeight.w700,
        letterSpacing: 1.02)),
    );
  }
}`,
};

SNIP['C.22'] = {
  neutral: `# progress
linéaire        h 3 · radius 2 · bg = kbdBg · fill = accent
determinate     transition width 600ms cubic-bezier(.2,.7,.2,1)
indeterminate   shimmer · 40% gradient slide · 1400ms infinite cubic-in-out
spinner inline  14 px · stroke 1.5 · 270° arc · 900ms linear infinite
labels          au-dessus · "label" + "%" tabular OU "working…"
règle           toujours un texte d'état au-dessus · jamais nu`,
  css: `.gnu-progress {
  height: 3px; background: var(--kbd-bg);
  border-radius: 2px; position: relative; overflow: hidden;
}
.gnu-progress__fill {
  height: 100%; background: var(--accent); border-radius: 2px;
  transition: width 600ms cubic-bezier(.2,.7,.2,1);
}
.gnu-progress[data-indeterminate] .gnu-progress__fill {
  width: 40%;
  background: linear-gradient(90deg, transparent, var(--accent), transparent);
  animation: gnu-shimmer 1400ms cubic-bezier(.45,.05,.55,.95) infinite;
}
.gnu-spinner {
  width: 14px; height: 14px;
  animation: gnu-spin 900ms linear infinite;
}
@keyframes gnu-shimmer {
  from { transform: translateX(-100%); }
  to   { transform: translateX(250%); }
}
@keyframes gnu-spin {
  to { transform: rotate(360deg); }
}`,
  qml: `// Progress.qml
Rectangle {
  property real value: 0     // 0..1
  property bool indeterminate: false
  height: 3; radius: 2; color: GnuTheme.kbdBg
  Rectangle {
    radius: 2; height: parent.height
    width: parent.width * (indeterminate ? 0.4 : value)
    color: GnuTheme.accent
    Behavior on width { NumberAnimation {
      duration: 600; easing.type: Easing.OutCubic
    } }
    SequentialAnimation on x { loops: -1
      running: parent.indeterminate
      NumberAnimation { from: -parent.width * 0.4
                        to:   parent.width; duration: 1400
                        easing.type: Easing.InOutSine }
    }
  }
}
// Spinner
BusyIndicator { width: 14; height: 14 }`,
  qt: `class Progress : public QProgressBar {
public:
  Progress(QWidget* p=nullptr) : QProgressBar(p) {
    setFixedHeight(3); setTextVisible(false);
    setStyleSheet(R"(
      QProgressBar { background: %1; border-radius: 2px; }
      QProgressBar::chunk { background: %2; border-radius: 2px; }
    )"_qs.arg(GnuTheme::kbdBg.name())
        .arg(GnuTheme::accent.name()));
  }
};
class Spinner : public QWidget {
public:
  Spinner(QWidget* p=nullptr) : QWidget(p) {
    setFixedSize(14, 14);
    _t = new QTimer(this);
    connect(_t, &QTimer::timeout, this, [this](){
      _angle = (_angle + 8) % 360; update();
    });
    _t->start(20);
  }
protected:
  void paintEvent(QPaintEvent*) override {
    QPainter g(this); g.setRenderHint(QPainter::Antialiasing);
    g.translate(7, 7); g.rotate(_angle);
    g.setPen(QPen(GnuTheme::kbdBg, 1.5));
    g.drawEllipse(QPoint(0,0), 5, 5);
    g.setPen(QPen(GnuTheme::accent, 1.5, Qt::SolidLine, Qt::RoundCap));
    g.drawArc(QRect(-5,-5,10,10), 90*16, -270*16);
  }
private: QTimer* _t; int _angle = 0;
};`,
  flutter: `class GnuProgress extends StatelessWidget {
  const GnuProgress({super.key, this.value, this.indeterminate = false});
  final double? value; final bool indeterminate;
  @override Widget build(BuildContext c) => SizedBox(height: 3,
    child: indeterminate
      ? const LinearProgressIndicator(
          backgroundColor: Color(0xFFE6E8EB),
          valueColor: AlwaysStoppedAnimation(GnuTheme.accent),
          minHeight: 3)
      : TweenAnimationBuilder<double>(
          tween: Tween(begin: 0, end: value ?? 0),
          duration: const Duration(milliseconds: 600),
          curve: Curves.easeOutCubic,
          builder: (_, v, __) => LinearProgressIndicator(
            value: v, minHeight: 3,
            backgroundColor: const Color(0xFFE6E8EB),
            valueColor: const AlwaysStoppedAnimation(GnuTheme.accent),
          ),
        ),
  );
}
class GnuSpinner extends StatelessWidget {
  const GnuSpinner({super.key, this.size = 14});
  final double size;
  @override Widget build(BuildContext c) => SizedBox(
    width: size, height: size,
    child: const CircularProgressIndicator(
      strokeWidth: 1.5,
      valueColor: AlwaysStoppedAnimation(GnuTheme.accent),
    ),
  );
}`,
};

SNIP['C.23'] = {
  neutral: `# tooltip
bg              ALWAYS #111418  (peu importe le thème — c'est l'identité)
fg              #F7F3ED · shell-white
radius          5
padding         5/9
font            11 / 500
arrow           6×6 · rotate(45) · radius 1 · même bg que tooltip
shadow          0/4/12 rgba(0,0,0,.25)
delay hover     400 ms in · 80 ms out (rapide à disparaître)
position        bottom par défaut · auto-flip si overflow viewport
contenu         label + raccourci  OU  description courte (≤ 80 chars)
règle           jamais sur un row qui a déjà un label visible — sauf raccourci`,
  css: `.gnu-tooltip {
  position: absolute; z-index: 1000;
  padding: 5px 9px; border-radius: 5px;
  background: #111418; color: #F7F3ED;
  font: 500 11px/1 ui-sans-serif, system-ui;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(0,0,0,.25);
  pointer-events: none;
  opacity: 0;
  transition: opacity 120ms 400ms;  /* 400ms delay before show */
}
.gnu-tooltip[data-visible] { opacity: 1; transition-delay: 0; }
.gnu-tooltip[data-hidden] { transition-duration: 80ms; }
.gnu-tooltip::after {
  content: ""; position: absolute;
  top: -3px; left: 50%; transform: translateX(-50%) rotate(45deg);
  width: 6px; height: 6px; background: #111418; border-radius: 1px;
}`,
  qml: `// Tooltip.qml — uses Quickshell PopupWindow (no Qt Tooltip glitches)
PopupWindow {
  id: tt
  property string text
  property string shortcut
  property Item anchorTo
  width: row.implicitWidth + 18; height: 22
  color: "transparent"
  visible: false
  Timer { id: showTimer; interval: 400
          onTriggered: tt.visible = true }
  Rectangle {
    anchors.fill: parent; anchors.margins: 3
    color: "#111418"; radius: 5
    layer.enabled: true
    layer.effect: DropShadow { verticalOffset: 4; radius: 12
                               color: Qt.rgba(0,0,0,.25) }
    RowLayout {
      id: row; anchors.centerIn: parent; spacing: 6
      Label { text: tt.text; color: "#F7F3ED"; font.pixelSize: 11 }
      Label { visible: tt.shortcut !== ""
              text: tt.shortcut; color: Qt.rgba(247,243,237,.55)
              font.family: "IBM Plex Mono"; font.pixelSize: 9.5 }
    }
  }
  // arrow drawn via Canvas — omitted for brevity
}`,
  qt: `class Tooltip : public QFrame {
public:
  Tooltip(const QString& label, const QString& shortcut="",
          QWidget* p=nullptr) : QFrame(p) {
    setWindowFlags(Qt::ToolTip | Qt::FramelessWindowHint);
    setAttribute(Qt::WA_TranslucentBackground);
    setStyleSheet(R"(
      QFrame {
        background: #111418; color: #F7F3ED;
        border-radius: 5px; padding: 5px 9px;
      }
    )");
    auto* h = new QHBoxLayout(this);
    h->setContentsMargins(0,0,0,0); h->setSpacing(6);
    h->addWidget(new QLabel(label));
    if (!shortcut.isEmpty()) {
      auto* sc = new QLabel(shortcut);
      sc->setStyleSheet("color:rgba(247,243,237,.55);"
                        "font:9.5px 'IBM Plex Mono';");
      h->addWidget(sc);
    }
    setFont(QFont("system-ui", 11));
  }
  void anchor(QWidget* w) {
    QTimer::singleShot(400, this, [this, w]{
      auto p = w->mapToGlobal(QPoint(w->width()/2 - width()/2,
                                     w->height() + 6));
      move(p); show();
    });
  }
};`,
  flutter: `class GnuTooltip extends StatelessWidget {
  const GnuTooltip({super.key, required this.label,
                    this.shortcut, required this.child});
  final String label; final String? shortcut;
  final Widget child;
  @override Widget build(BuildContext c) => Tooltip(
    message: shortcut == null ? label : '\$label · \$shortcut',
    waitDuration: const Duration(milliseconds: 400),
    showDuration: const Duration(milliseconds: 80),
    decoration: BoxDecoration(
      color: const Color(0xFF111418),
      borderRadius: BorderRadius.circular(5),
    ),
    textStyle: const TextStyle(color: Color(0xFFF7F3ED),
                               fontSize: 11),
    child: child,
  );
}`,
};

SNIP['C.24'] = {
  neutral: `# step indicator
variants
  · dots         8 px round · active 16 px capsule
  · numbered     18 px circle · check on done · number on current
spacing         lignes 1 px theme.border entre dots/circles
fill            done = accent · current = accent (numbered) ou accent capsule (dots)
                pending = kbdBg
transition      width/scale 220 ms cubic-bezier(.32,.72,.32,1)
label           sous le bloc · 11 px · fontWeight 500 (current) / 400 (others)
règle           > 5 étapes → bouger vers un sidebar/breadcrumb (cf. CM.16)`,
  css: `.gnu-step-dots {
  display: flex; align-items: center; gap: 6px;
}
.gnu-step-dots__dot {
  width: 8px; height: 8px; border-radius: 4px;
  background: var(--kbd-bg);
  transition: width 220ms cubic-bezier(.32,.72,.32,1),
              background 120ms;
}
.gnu-step-dots__dot[data-done]    { background: var(--accent); }
.gnu-step-dots__dot[data-current] {
  width: 16px; background: var(--accent);
}
.gnu-step-dots__line {
  flex: 1; height: 1px; background: var(--border);
}
.gnu-step-dots__line[data-done] { background: var(--accent); }

.gnu-step-numbered__circle {
  width: 18px; height: 18px; border-radius: 9px;
  display: inline-flex; align-items: center; justify-content: center;
  font: 700 9.5px/1 ui-monospace, monospace;
  border: 1px solid var(--border); color: var(--fg-faint);
}
.gnu-step-numbered__circle[data-done] {
  background: var(--accent); border-color: var(--accent); color: #fff;
}
.gnu-step-numbered__circle[data-current] {
  border-color: var(--accent); color: var(--accent);
}`,
  qml: `// StepIndicator.qml
RowLayout {
  property int total: 3
  property int current: 0  // 0-indexed
  property string variant: "dots"   // dots · numbered
  spacing: 6
  Repeater {
    model: total
    delegate: RowLayout {
      Rectangle {
        property bool done: index < current
        property bool isCurrent: index === current
        width: variant === "dots"
          ? (isCurrent ? 16 : 8)
          : 18
        height: variant === "dots" ? 8 : 18
        radius: width / 2
        color: done || isCurrent ? GnuTheme.accent
                                 : GnuTheme.kbdBg
        Behavior on width { NumberAnimation {
          duration: 220; easing.type: Easing.OutCubic
        } }
        Label { visible: variant === "numbered"
                anchors.centerIn: parent
                text: parent.done ? "\u2713" : (index + 1)
                color: "white" }
      }
      Rectangle { visible: index < total - 1
                  Layout.fillWidth: true; height: 1
                  color: index < current
                    ? GnuTheme.accent : GnuTheme.border }
    }
  }
}`,
  qt: `class StepIndicator : public QWidget {
public:
  StepIndicator(int total, int current, QWidget* p=nullptr)
    : QWidget(p), _total(total), _current(current) {
    setFixedHeight(20);
  }
  void setCurrent(int c) {
    if (c == _current) return;
    _anim = new QPropertyAnimation(this, "_progress", this);
    _anim->setDuration(220);
    _anim->setEasingCurve(QEasingCurve::OutCubic);
    _anim->setStartValue(_current); _anim->setEndValue(c);
    _anim->start(); _current = c;
  }
protected:
  void paintEvent(QPaintEvent*) override {
    QPainter g(this); g.setRenderHint(QPainter::Antialiasing);
    int x = 0, gap = 6;
    int dotW = 8, currentDotW = 16;
    int lineW = (width() - _total*dotW - (_total-1)*gap) / (_total-1);
    for (int i = 0; i < _total; ++i) {
      bool done = i < _current, cur = i == _current;
      g.setBrush(done || cur ? GnuTheme::accent : GnuTheme::kbdBg);
      g.setPen(Qt::NoPen);
      int w = cur ? currentDotW : dotW;
      g.drawRoundedRect(QRect(x, 6, w, 8), 4, 4);
      x += w;
      if (i < _total - 1) {
        g.fillRect(QRect(x, 9, lineW, 1),
                   done ? GnuTheme::accent : GnuTheme::border);
        x += lineW;
      }
    }
  }
};`,
  flutter: `class StepIndicator extends StatelessWidget {
  const StepIndicator({super.key, required this.total,
                       required this.current,
                       this.variant = StepVariant.dots});
  final int total; final int current; final StepVariant variant;
  @override Widget build(BuildContext c) => Row(children: [
    for (var i = 0; i < total; ++i) ...[
      AnimatedContainer(
        duration: const Duration(milliseconds: 220),
        curve: Curves.easeOutCubic,
        width: variant == StepVariant.dots
          ? (i == current ? 16 : 8) : 18,
        height: variant == StepVariant.dots ? 8 : 18,
        decoration: BoxDecoration(
          color: i <= current ? GnuTheme.accent : GnuTheme.kbdBg,
          borderRadius: BorderRadius.circular(variant == StepVariant.dots
            ? 4 : 9),
          border: variant == StepVariant.numbered && i > current
            ? Border.all(color: GnuTheme.border) : null,
        ),
        alignment: Alignment.center,
        child: variant == StepVariant.numbered ? Text(
          i < current ? '✓' : '\${i+1}',
          style: const TextStyle(color: Colors.white,
            fontFamily: 'IBMPlexMono', fontSize: 9.5,
            fontWeight: FontWeight.w700)) : null,
      ),
      if (i < total - 1) Expanded(child: Container(
        height: 1, color: i < current ? GnuTheme.accent : GnuTheme.border)),
    ],
  ]);
}`,
};

/* ════════════════════════════════════════════════════════════════════
   PROD ATOM REGISTRY
   ════════════════════════════════════════════════════════════════════ */

const CTX_ATOMS_PROD = [
  { id: 'C.19', title: 'Avatar',
    sub: 'Disque 20-44 px · initiales ou photo · status dot au coin BR. 4 états (online · busy · away · offline).',
    demo: CtxAtomAvatar,    snip: SNIP['C.19'],
    tokens: [['sizes','20 · 24 · 32 · 44'],['shape','circle 50%'],['initials','0.42× · mono 700'],['status dot','0.32× · BR · ring 1.5px theme.surface'],['states','online #5F7F52 · busy #E63A1F · away #E8A227 · offline ink .4']],
    states: ['idle', 'online', 'busy', 'away', 'offline', 'hover (lift 1px optional)'],
    a11y: { role: 'img', name: 'aria-label = nom complet du compte', keyboard: 'le parent row écoute · l\'avatar lui-même non-focusable' } },

  { id: 'C.20', title: 'Badge · count',
    sub: 'Dot 7 px ou pill h18 avec compteur. Red pour alerte, accent pour info. Apparition scale 0.7 → 1 overshoot.',
    demo: CtxAtomBadge,     snip: SNIP['C.20'],
    tokens: [['dot','7 × 7 · #E63A1F'],['count h','18 · pad 0 5 · min-w 18'],['radius','9 (pill)'],['font','10 mono · 700 · tabular'],['cap','"99+" au-delà'],['anim','scale 0.7→1 · 220 ms overshoot']],
    states: ['hidden (count=0)', 'dot', 'count', 'count-overflow ("99+")', 'updating (re-anim)'],
    a11y: { role: 'status', name: 'aria-label="3 nouvelles notifications"', keyboard: 'parent row reçoit Enter pour ouvrir' } },

  { id: 'C.21', title: 'Tag chip',
    sub: 'Étiquette catégorielle NEW / BETA / DEPRECATED / PRO. 4 variantes : filled · outline · danger · pro.',
    demo: CtxAtomTag,       snip: SNIP['C.21'],
    tokens: [['height','18'],['pad','2 / 6'],['radius','3'],['font','8.5 mono · 700'],['letter-spacing','0.12em UPPERCASE'],['variants','filled · outline · danger · pro']],
    states: ['filled', 'outline', 'danger', 'pro'],
    a11y: { role: 'presentation', name: 'décoratif · le contenu de tag intégré dans aria-label du row', keyboard: 'non-focusable' } },

  { id: 'C.22', title: 'Progress · spinner',
    sub: 'Barre linéaire 3 px (déterminée ou shimmer) + spinner inline 14 px. Toujours un texte d\'état au-dessus.',
    demo: CtxAtomProgress,  snip: SNIP['C.22'],
    tokens: [['linear h','3 · radius 2'],['fill','accent'],['transition','600 ms cubic-out'],['shimmer','40% gradient · 1400 ms'],['spinner','14 px · stroke 1.5 · 900 ms linear']],
    states: ['determinate (0%)', 'determinate (mid)', 'determinate (100%)', 'indeterminate', 'spinner', 'error (fill #E63A1F)'],
    a11y: { role: 'progressbar', name: 'aria-valuenow + aria-valuetext + aria-busy="true" si indeterminate', keyboard: 'non-interactive' } },

  { id: 'C.23', title: 'Tooltip',
    sub: 'Surcouche d\'info au hover. Toujours fond #111418 (peu importe le thème). Delay 400 ms in · 80 ms out.',
    demo: CtxAtomTooltip,   snip: SNIP['C.23'],
    tokens: [['bg','#111418 (toujours)'],['fg','#F7F3ED'],['radius','5'],['padding','5 / 9'],['font','11 / 500'],['arrow','6×6 rotate 45'],['delay','400 ms in · 80 ms out']],
    states: ['hidden', 'pending (400ms)', 'visible', 'hiding (80ms)'],
    a11y: { role: 'tooltip', name: 'le row porte aria-describedby={tooltip.id}', keyboard: 'apparait au focus aussi · ⎋ ferme · jamais sur action critique' } },

  { id: 'C.24', title: 'Step indicator',
    sub: '1/3 · 2/3 · 3/3. Variantes dots (capsule au current) ou numbered (cercle 18 + check).',
    demo: CtxAtomStep,      snip: SNIP['C.24'],
    tokens: [['dots','8 px · 16 px au current'],['numbered','18 px · check ✓ done'],['line','1 px entre · accent si done'],['transition','220 ms cubic-out'],['max steps','5 avant breadcrumb CM.16']],
    states: ['pending', 'current', 'done', 'error (numbered ! rouge)'],
    a11y: { role: 'list', name: 'aria-label="Étapes" · chaque step = listitem · current = aria-current="step"', keyboard: '←/→ navigate · ⏎ saute à l\'étape · Tab progresse normalement' } },
];

Object.assign(window, { CTX_ATOMS_PROD });
