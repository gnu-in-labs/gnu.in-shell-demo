// film-scenes.jsx — "La vie d'un trigger" · gnu.in-shell behavioural explainer
// Concatenated AFTER animations.jsx, so Stage/Sprite/TextSprite/Easing/interpolate/
// animate/clamp/useTime/useSprite are all in scope as module-level bindings.

// ── palette ──────────────────────────────────────────────────────────────
const INK = '#0D1014', INK2 = '#111418', BEZEL = '#2B3037', ELEV = '#1A1F26';
const ORANGE = '#FF6A00', ORANGE2 = '#FF8E40', RUST = '#C95400';
const GREEN = '#5F7F52', GREEN2 = '#8DA982', AMBER = '#CE8E3F';
const ALERT = '#E5484D', WARN = '#F5A524', INFO = '#3D8DCC';
const SHELL = '#F5EEDD', PAPER = '#F7F3ED', CREAM = '#faf7f0';
const STONE = '#A1A6AD', SLATE = '#667085';
const MONO = "'JetBrains Mono', ui-monospace, monospace";
const SANS = "'Montreal', 'Inter', system-ui, sans-serif";
const W = 1080, H = 1920;

// ── tiny helpers ─────────────────────────────────────────────────────────
const lerp = (a, b, t) => a + (b - a) * t;
function Spring({ children }) { return children; }

// camera wrapper: scale+translate the whole scene for cinematic push-ins
function Camera({ scale = 1, x = 0, y = 0, children }) {
  return (
    <div style={{ position: 'absolute', inset: 0, transform: `translate(${x}px,${y}px) scale(${scale})`, transformOrigin: 'center center', willChange: 'transform' }}>
      {children}
    </div>
  );
}

// labeled call-out card (the "labeled call-outs")
function Callout({ x, y, w = 520, tag, title, body, color = ORANGE, align = 'left', appear = 0 }) {
  const a = clamp(appear, 0, 1);
  return (
    <div style={{
      position: 'absolute', left: x, top: y, width: w,
      transform: `translateY(${(1 - a) * 18}px)`, opacity: a,
      background: 'rgba(13,16,20,0.86)', backdropFilter: 'blur(8px)',
      border: '1px solid rgba(255,255,255,0.1)', borderLeft: `3px solid ${color}`,
      borderRadius: 16, padding: '20px 24px', textAlign: align,
      boxShadow: '0 18px 44px rgba(0,0,0,0.5)',
    }}>
      <div style={{ font: `700 16px ${MONO}`, letterSpacing: '0.18em', color, textTransform: 'uppercase' }}>{tag}</div>
      <div style={{ font: `700 32px ${SANS}`, color: '#f3eee9', marginTop: 8, letterSpacing: '-0.01em', lineHeight: 1.1 }}>{title}</div>
      {body && <div style={{ font: `400 21px ${SANS}`, color: '#cbc5ca', marginTop: 8, lineHeight: 1.4 }}>{body}</div>}
    </div>
  );
}

// chapter marker (big WHERE / WHEN etc.)
function ChapterTag({ x, y, idx, word, sub, a = 1, color = ORANGE }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, opacity: a, transform: `translateX(${(1 - a) * -20}px)` }}>
      <div style={{ font: `700 20px ${MONO}`, color, letterSpacing: '0.1em' }}>{idx}</div>
      <div style={{ font: `700 96px ${SANS}`, color: '#f3eee9', letterSpacing: '-0.03em', lineHeight: 0.95, marginTop: 6 }}>{word}</div>
      <div style={{ font: `400 24px ${SANS}`, color: '#9aa0a8', marginTop: 10 }}>{sub}</div>
    </div>
  );
}

// status dot with optional pulsing ring
function Dot({ color, size = 16, pulse = 0 }) {
  return (
    <span style={{ position: 'relative', display: 'inline-grid', placeItems: 'center', width: size, height: size }}>
      {pulse > 0 && <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', boxShadow: `0 0 0 ${pulse * 12}px ${color}00`, background: 'transparent', border: `2px solid ${color}`, opacity: 1 - pulse, transform: `scale(${1 + pulse * 1.4})` }} />}
      <span style={{ width: size, height: size, borderRadius: '50%', background: color, boxShadow: `0 0 12px ${color}88` }} />
    </span>
  );
}

// the mascot (assembled hero.png) + state cue overlays
function Mascot({ x, y, size = 300, state = 'idle', t = 0 }) {
  const cue = { idle: STONE, listening: ORANGE, transmit: GREEN, veille: SLATE }[state] || STONE;
  const pulse = (state === 'listening' || state === 'transmit') ? (t % 1.4) / 1.4 : 0;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: size, height: size * (971 / 852) }}>
      <img src="mascot/hero.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', filter: state === 'veille' ? 'saturate(0.7) brightness(0.85)' : 'none' }} />
      {/* antenna-tip ping */}
      {pulse > 0 && (
        <div style={{ position: 'absolute', left: '83%', top: '6%', width: 60, height: 60, transform: 'translate(-50%,-50%)' }}>
          <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `3px solid ${cue}`, opacity: 1 - pulse, transform: `scale(${0.4 + pulse * 1.6})` }} />
        </div>
      )}
      {state === 'veille' && <div style={{ position: 'absolute', left: '74%', top: '2%', font: `700 40px ${SANS}`, color: SLATE, opacity: 0.6 }}>z</div>}
      {/* state label chip */}
      <div style={{ position: 'absolute', left: '50%', bottom: -54, transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px', background: 'rgba(13,16,20,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 999 }}>
        <Dot color={cue} size={12} pulse={pulse} />
        <span style={{ font: `700 18px ${MONO}`, color: cue, letterSpacing: '0.14em', textTransform: 'uppercase' }}>{state}</span>
      </div>
    </div>
  );
}

// the membrane HUD bar (top of shell)
function Membrane({ y = 70, state = 'IDLE', accent = ORANGE, tracking = false, logCount = null }) {
  return (
    <div style={{
      position: 'absolute', left: 48, right: 48, top: y, height: 116,
      display: 'flex', alignItems: 'center', gap: 16, padding: '0 16px',
      background: 'rgba(20,19,19,0.82)', backdropFilter: 'blur(22px) saturate(1.4)',
      border: '1px solid rgba(255,255,255,0.09)', borderRadius: 26,
      boxShadow: tracking ? `0 18px 44px rgba(0,0,0,0.55), 0 0 0 1px ${accent}66, 0 0 40px -6px ${accent}` : '0 18px 44px rgba(0,0,0,0.55)',
    }}>
      <div style={{ width: 60, height: 60, borderRadius: 16, background: `linear-gradient(150deg, ${ORANGE2}, ${ORANGE})`, display: 'grid', placeItems: 'center', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.14)', flex: 'none' }}>
        <span style={{ font: `700 26px ${MONO}`, color: '#fff' }}>›_</span>
      </div>
      <div style={{ flex: 1, minWidth: 0, borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: 16 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span style={{ font: `700 24px ${SANS}`, color: '#f3eee9' }}>Firefox</span>
          <span style={{ font: `700 15px ${MONO}`, letterSpacing: '0.16em', color: accent }}>{state}</span>
        </div>
        <div style={{ font: `400 16px ${MONO}`, color: '#8a868a', marginTop: 4 }}>cur 1170,557 · box 1</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 'none' }}>
        <Chip icon="frame_inspect" label="SCAN" />
        <Chip icon="terminal" label="LOG" solid accent={accent} badge={logCount} />
      </div>
    </div>
  );
}
function Chip({ icon, label, solid, accent = ORANGE, badge }) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, height: 52, padding: '0 18px', borderRadius: 14, background: solid ? `linear-gradient(150deg, ${ORANGE2}, ${ORANGE})` : 'rgba(255,255,255,0.05)', border: solid ? 'none' : '1px solid rgba(255,255,255,0.08)', boxShadow: solid ? `0 2px 12px ${accent}55` : 'none' }}>
      <span className="material-symbols-rounded" style={{ fontSize: 26, color: solid ? '#fff' : '#cbc5ca' }}>{icon}</span>
      <span style={{ font: `700 17px ${MONO}`, letterSpacing: '0.12em', color: solid ? '#fff' : '#d6d0d5' }}>{label}</span>
      {badge != null && <span style={{ position: 'absolute', top: -7, right: -7, minWidth: 26, height: 26, padding: '0 6px', borderRadius: 13, background: ALERT, color: '#fff', font: `700 15px/26px ${MONO}`, textAlign: 'center', boxShadow: '0 0 0 3px rgba(20,19,19,0.9)' }}>{badge}</span>}
    </div>
  );
}

// wallpaper shell backdrop
function ShellBg({ dim = 0.55 }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0c0f' }}>
      <div style={{ position: 'absolute', inset: 0, background: `url('assets/wallpaper-hero.png') center 38% / cover no-repeat` }} />
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, rgba(7,9,12,${dim}) 0%, rgba(7,9,12,0.2) 34%, rgba(7,9,12,0.35) 64%, rgba(7,9,12,0.85) 100%)` }} />
    </div>
  );
}

// pointer cursor
function Cursor({ x, y, press = 0 }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `scale(${1 - press * 0.15})`, transformOrigin: 'top left', filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.5))', zIndex: 50 }}>
      <svg width="52" height="52" viewBox="0 0 24 24"><path d="M4 2l6 16 2.5-6.5L19 9 4 2z" fill="#fff" stroke="#111" strokeWidth="1.2" strokeLinejoin="round" /></svg>
      {press > 0 && <span style={{ position: 'absolute', left: 6, top: 6, width: 36, height: 36, borderRadius: '50%', border: `2px solid ${ORANGE}`, opacity: 1 - press, transform: `scale(${0.4 + press * 1.6})` }} />}
    </div>
  );
}

// the right-click contract menu (R archetypes)
function ContractMenu({ x, y, reveal = 1, highlight = 1 }) {
  const rows = [
    { ic: 'widgets', t: 'Widget', code: 'R.02' },
    { ic: 'grid_view', t: 'Window', code: 'R.03' },
    { ic: 'dns', t: 'Tray', code: 'R.04' },
    { ic: 'hub', t: 'Bubble ★', code: 'R.06' },
    { ic: 'edit_note', t: 'Shell editor', code: 'R.01' },
  ];
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 460, transformOrigin: 'top left', transform: `scale(${lerp(0.86, 1, reveal)})`, opacity: reveal, background: ELEV, border: `1px solid ${BEZEL}`, borderRadius: 24, boxShadow: '0 28px 60px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(255,255,255,0.04)', padding: 10 }}>
      <div style={{ padding: '12px 16px 8px', font: `700 15px ${MONO}`, letterSpacing: '0.14em', color: '#7c828a' }}>›_ CONFIGURE CONTEXT</div>
      {rows.map((r, i) => {
        const on = (highlight === i);
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, height: 64, padding: '0 16px', borderRadius: 14, background: on ? 'rgba(255,106,0,0.16)' : 'transparent' }}>
            <span className="material-symbols-rounded" style={{ fontSize: 30, color: on ? ORANGE2 : '#cbc5ca' }}>{r.ic}</span>
            <span style={{ flex: 1, font: `400 24px ${SANS}`, color: on ? ORANGE2 : '#e6e1e1' }}>{r.t}</span>
            <span style={{ font: `600 16px ${MONO}`, color: on ? ORANGE : '#7c828a' }}>{r.code}</span>
          </div>
        );
      })}
    </div>
  );
}

// the engine spine diagram (light/diagram setting)
function EngineSpine({ active = 4, t = 0 }) {
  const nodes = [
    { k: 'tokens.json', sub: 'source', c: ORANGE, bg: '#241a12' },
    { k: 'engine Rust', sub: 'gnuin-compose-core', c: GREEN2, bg: '#161b16' },
    { k: 'motion', sub: 'springs · GPUI', c: AMBER, bg: '#1c1b14' },
    { k: 'Gnu* composants', sub: '24·16·8', c: '#cbc5ca', bg: '#1c1b1c' },
    { k: 'surface shell', sub: 'host · membrane', c: ORANGE2, bg: '#241a12' },
  ];
  return (
    <div style={{ position: 'absolute', left: 90, right: 90, top: 560, display: 'flex', flexDirection: 'column', gap: 0 }}>
      {nodes.map((n, i) => {
        const on = i <= active;
        const flow = (active === i);
        return (
          <div key={i}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '26px 28px', background: n.bg, border: `1px solid ${flow ? n.c : BEZEL}`, borderRadius: 18, opacity: on ? 1 : 0.4, boxShadow: flow ? `0 0 32px -8px ${n.c}` : 'none', transition: 'none' }}>
              <span style={{ width: 18, height: 18, borderRadius: '50%', background: n.c, flex: 'none', boxShadow: flow ? `0 0 0 ${((t % 1.2) / 1.2) * 14}px ${n.c}00` : 'none' }} />
              <div style={{ flex: 1 }}>
                <div style={{ font: `700 30px ${MONO}`, color: '#f3eee9' }}>{n.k}</div>
                <div style={{ font: `400 19px ${MONO}`, color: '#8a8f96', marginTop: 4 }}>{n.sub}</div>
              </div>
            </div>
            {i < nodes.length - 1 && <div style={{ textAlign: 'center', padding: '8px 0' }}><span className="material-symbols-rounded" style={{ fontSize: 34, color: i < active ? GREEN : '#3a4048' }}>south</span></div>}
          </div>
        );
      })}
    </div>
  );
}

// sentinel event feed
function SentinelFeed({ level = 1 }) {
  const events = [
    { ts: '14:02', c: GREEN, t: 'context loaded · 3 notifs', tag: null },
    { ts: '14:03', c: ORANGE, t: 'TRANSMIT · ./run scheduled', tag: ['L1 SENTINEL', 'REFLEX', GREEN2] },
    { ts: '14:05', c: WARN, t: 'stress · frame budget 6.2ms', tag: ['L2 SENTINEL', 'ANALYST', AMBER], show: level >= 2 },
  ];
  return (
    <div style={{ position: 'absolute', left: 70, right: 70, top: 720, background: 'rgba(13,16,20,0.9)', border: `1px solid ${BEZEL}`, borderRadius: 22, padding: 28 }}>
      <div style={{ font: `700 18px ${MONO}`, letterSpacing: '0.16em', color: '#cbc5ca', marginBottom: 20 }}>EVENT FEED · TIMELINE</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {events.filter(e => e.show !== false).map((e, i) => (
          <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <span style={{ font: `400 18px ${MONO}`, color: '#7c828a', width: 70, flex: 'none' }}>{e.ts}</span>
            <Dot color={e.c} size={14} />
            <div style={{ flex: 1 }}>
              <div style={{ font: `500 24px ${SANS}`, color: '#e6e1e1' }}>{e.t}</div>
              {e.tag && <div style={{ display: 'flex', gap: 10, marginTop: 8 }}><span style={{ font: `700 14px ${MONO}`, letterSpacing: '0.1em', color: '#cbc5ca', padding: '5px 10px', borderRadius: 7, background: 'rgba(255,255,255,0.07)' }}>{e.tag[0]}</span><span style={{ font: `700 14px ${MONO}`, letterSpacing: '0.1em', color: e.tag[2], alignSelf: 'center' }}>{e.tag[1]}</span></div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// progress bar (cursor grant countdown)
function GrantBar({ pct, secs }) {
  return (
    <div style={{ position: 'absolute', left: 70, right: 70, top: 980 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
        <span style={{ font: `700 22px ${MONO}`, color: '#cbc5ca', letterSpacing: '0.06em' }}>CURSOR GRANT</span>
        <span style={{ font: `700 30px ${MONO}`, color: ORANGE2, fontVariantNumeric: 'tabular-nums' }}>{secs}s</span>
      </div>
      <div style={{ height: 18, borderRadius: 9, background: BEZEL, overflow: 'hidden' }}>
        <div style={{ width: `${pct * 100}%`, height: '100%', background: `linear-gradient(90deg, ${ORANGE2}, ${ORANGE})`, borderRadius: 9 }} />
      </div>
    </div>
  );
}

// progress / chapter dots at very bottom
function Progress() {
  const t = useTime();
  const marks = [0, 11, 28, 45, 63, 78, 88];
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 38, display: 'flex', justifyContent: 'center', gap: 12 }}>
      {marks.map((m, i) => {
        const next = marks[i + 1] || 92;
        const on = t >= m && t < next;
        return <span key={i} style={{ width: on ? 40 : 12, height: 6, borderRadius: 3, background: on ? ORANGE : 'rgba(255,255,255,0.25)', transition: 'none' }} />;
      })}
    </div>
  );
}

// kicker brand mark top-left, persistent
function Brand() {
  return (
    <div style={{ position: 'absolute', left: 48, top: 30, font: `700 22px ${MONO}`, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.04em', zIndex: 60 }}>
      gnu<span style={{ color: ORANGE }}>.in</span>-shell
    </div>
  );
}

// timecode label updater (for commenting)
function Timecode() {
  const t = useTime();
  React.useEffect(() => {
    const root = document.querySelector('[data-film-root]');
    if (root) root.setAttribute('data-screen-label', `t=${t.toFixed(0)}s`);
  }, [Math.floor(t)]);
  return null;
}

// ════════════════════════════════════════════════════════════════════════
// SCENES
// ════════════════════════════════════════════════════════════════════════

// 0–11 · INTRO
function SceneIntro() {
  return (
    <Sprite start={0} end={11.5}>
      {({ localTime: lt }) => {
        const push = animate({ from: 1.12, to: 1.0, start: 0, end: 6, ease: Easing.easeOutCubic })(lt);
        const dim = animate({ from: 0.4, to: 0.7, start: 4, end: 10, ease: Easing.linear })(lt);
        return (
          <div style={{ position: 'absolute', inset: 0 }}>
            <Camera scale={push}><ShellBg dim={dim} /></Camera>
            <Mascot x={W / 2 - 150} y={560} size={300} state="idle" t={lt} />
            <Sprite start={2.2} end={11.5}>{({ progress }) => (
              <div style={{ position: 'absolute', left: 70, top: 1030, width: W - 140, opacity: clamp(progress * 4, 0, 1) }}>
                <div style={{ font: `700 26px ${MONO}`, color: ORANGE, letterSpacing: '0.16em' }}>COMPORTEMENT DU SHELL</div>
                <div style={{ font: `700 88px ${SANS}`, color: '#f3eee9', letterSpacing: '-0.03em', lineHeight: 0.98, marginTop: 16 }}>La vie d'un<br />trigger</div>
                <div style={{ font: `400 28px ${SANS}`, color: '#cbc5ca', marginTop: 22, lineHeight: 1.4 }}>comment · quand · où · pourquoi<br />un événement déclenche le système.</div>
              </div>
            )}</Sprite>
            <Sprite start={7} end={11.5}>{({ progress }) => (
              <div style={{ position: 'absolute', left: 70, top: 1560, display: 'flex', gap: 12, opacity: clamp(progress * 3, 0, 1) }}>
                {['WHERE', 'HOW', 'WHEN', 'STRESS', 'LIVE'].map((w, i) => (
                  <span key={i} style={{ font: `700 17px ${MONO}`, color: '#9aa0a8', padding: '9px 14px', border: '1px solid #2b2a2a', borderRadius: 10 }}>{w}</span>
                ))}
              </div>
            )}</Sprite>
          </div>
        );
      }}
    </Sprite>
  );
}

// 11–28 · WHERE — right-click contract
function SceneWhere() {
  return (
    <Sprite start={11} end={28.5}>
      {({ localTime: lt }) => {
        // cursor path: drifts to a point, presses at ~3s, menu reveals
        const cx = interpolate([0, 2.6, 3], [760, 470, 470], [Easing.easeInOutCubic])(lt);
        const cy = interpolate([0, 2.6, 3], [1400, 880, 880], [Easing.easeInOutCubic])(lt);
        const press = (lt > 2.7 && lt < 3.2) ? Math.sin((lt - 2.7) / 0.5 * Math.PI) : 0;
        const reveal = animate({ from: 0, to: 1, start: 3.1, end: 3.7, ease: Easing.easeOutBack })(lt);
        const hl = lt < 5 ? 1 : (lt < 7 ? 3 : 1); // highlight Window then Bubble
        const cam = animate({ from: 1.0, to: 1.18, start: 4, end: 9, ease: Easing.easeInOutCubic })(lt);
        const camY = animate({ from: 0, to: -120, start: 4, end: 9, ease: Easing.easeInOutCubic })(lt);
        return (
          <div style={{ position: 'absolute', inset: 0 }}>
            <ShellBg dim={0.6} />
            <Camera scale={cam} y={camY}>
              <Membrane y={70} state="IDLE" />
              {reveal > 0.02 && <ContractMenu x={400} y={420} reveal={reveal} highlight={hl} />}
              {lt < 3.4 && <Cursor x={cx} y={cy} press={press} />}
            </Camera>
            <ChapterTag x={70} y={1230} idx="01 · OÙ" word="WHERE" sub="clic-droit n'importe où → un contract" a={animate({ from: 0, to: 1, start: 0.2, end: 1, ease: Easing.easeOutCubic })(lt)} />
            <Sprite start={4.5} end={28.5}>{({ progress }) => (
              <Callout x={70} y={1490} w={W - 140} tag="R.01 → R.08" title="Le clic-droit est un contrat" body="L'endroit cliqué choisit l'archétype : espace vide, widget, fenêtre, tray, bubble ★…" appear={clamp(progress * 3, 0, 1)} />
            )}</Sprite>
          </div>
        );
      }}
    </Sprite>
  );
}

// 28–45 · HOW — voice / mic → agent bus
function SceneHow() {
  return (
    <Sprite start={28} end={45.5}>
      {({ localTime: lt }) => {
        const cam = animate({ from: 1.1, to: 1.0, start: 0, end: 4, ease: Easing.easeOutCubic })(lt);
        const bars = 28;
        const typed = '> ./run --context firefox'.slice(0, Math.floor(clamp((lt - 6) / 4, 0, 1) * 26));
        return (
          <div style={{ position: 'absolute', inset: 0 }}>
            <ShellBg dim={0.72} />
            <Camera scale={cam}>
              <Membrane y={70} state="LISTENING" accent={ORANGE} tracking={true} />
            </Camera>
            <Mascot x={W / 2 - 130} y={360} size={260} state="listening" t={lt} />
            {/* waveform */}
            <div style={{ position: 'absolute', left: 70, right: 70, top: 760, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {Array.from({ length: bars }).map((_, i) => {
                const amp = (Math.sin(lt * 6 + i * 0.7) * 0.5 + 0.5) * (0.4 + 0.6 * Math.sin(i / bars * Math.PI));
                const h = lerp(8, 110, amp);
                return <span key={i} style={{ width: 10, height: h, borderRadius: 5, background: i % 3 === 0 ? ORANGE : ORANGE2, opacity: 0.5 + amp * 0.5 }} />;
              })}
            </div>
            {/* command line */}
            <Sprite start={5.5} end={17.5}>{({ progress }) => (
              <div style={{ position: 'absolute', left: 70, right: 70, top: 920, opacity: clamp(progress * 4, 0, 1) }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, height: 80, padding: '0 22px', background: INK, border: `1px solid ${BEZEL}`, borderRadius: 16 }}>
                  <span style={{ font: `700 28px ${MONO}`, color: ORANGE }}>›_</span>
                  <span style={{ font: `400 26px ${MONO}`, color: '#e6e1e1', flex: 1 }}>{typed}<span style={{ opacity: Math.floor(lt * 2) % 2 ? 1 : 0.2 }}>▏</span></span>
                  <span className="material-symbols-rounded" style={{ fontSize: 30, color: ORANGE2 }}>graphic_eq</span>
                </div>
                <div style={{ font: `400 19px ${MONO}`, color: '#7c828a', marginTop: 12 }}>gnomon 0 · intents 0 → 1 · append-only</div>
              </div>
            )}</Sprite>
            <ChapterTag x={70} y={1180} idx="02 · COMMENT" word="HOW" sub="voix / micro → bus d'agent" a={animate({ from: 0, to: 1, start: 0.2, end: 1, ease: Easing.easeOutCubic })(lt)} />
            <Sprite start={9} end={45.5}>{({ progress }) => (
              <Callout x={70} y={1440} w={W - 140} tag="CM.14 GnuCommandLine" title="L'intention devient commande" body="Le micro lève l'état LISTENING ; le verbe entendu se grave dans le transcript de l'agent." color={ORANGE} appear={clamp(progress * 3, 0, 1)} />
            )}</Sprite>
          </div>
        );
      }}
    </Sprite>
  );
}

// 45–63 · WHEN — engine diagram + mascot state machine
function SceneWhen() {
  return (
    <Sprite start={45} end={63.5}>
      {({ localTime: lt }) => {
        const active = lt < 3 ? 0 : lt < 5 ? 1 : lt < 7 ? 2 : lt < 9 ? 3 : 4;
        const mascotState = lt < 4 ? 'idle' : lt < 9 ? 'listening' : 'transmit';
        return (
          <div style={{ position: 'absolute', inset: 0, background: INK }}>
            {/* subtle grid */}
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 80% at 50% 0%, rgba(255,106,0,0.08), transparent 60%)' }} />
            <ChapterTag x={70} y={120} idx="03 · QUAND" word="WHEN" sub="l'événement traverse le moteur" color={GREEN2} a={animate({ from: 0, to: 1, start: 0.2, end: 1, ease: Easing.easeOutCubic })(lt)} />
            <EngineSpine active={active} t={lt} />
            <Sprite start={9.5} end={63.5}>{({ progress }) => (
              <div style={{ position: 'absolute', right: 70, top: 470, opacity: clamp(progress * 4, 0, 1) }}>
                <Mascot x={0} y={0} size={180} state={mascotState} t={lt} />
              </div>
            )}</Sprite>
            <Sprite start={11} end={63.5}>{({ progress }) => (
              <Callout x={70} y={1560} w={W - 140} tag="100% RUST · GPUI RENDER-FIRST" title="Une source, descente unique" body="tokens.json → moteur Rust → motion → composants → surface shell. Le drift est fermé par construction." color={GREEN} appear={clamp(progress * 3, 0, 1)} />
            )}</Sprite>
          </div>
        );
      }}
    </Sprite>
  );
}

// 63–78 · STRESS — Sentinel escalation
function SceneStress() {
  return (
    <Sprite start={63} end={78.5}>
      {({ localTime: lt }) => {
        const level = lt < 6 ? 1 : 2;
        const shake = (lt > 5.4 && lt < 6.2) ? Math.sin((lt - 5.4) * 40) * (1 - (lt - 5.4) / 0.8) * 8 : 0;
        const accent = level >= 2 ? WARN : ORANGE;
        return (
          <div style={{ position: 'absolute', inset: 0 }}>
            <ShellBg dim={0.8} />
            <Camera x={shake}>
              <Membrane y={70} state={level >= 2 ? 'STRESS' : 'TRANSMIT'} accent={accent} tracking={true} logCount={level >= 2 ? 2 : 1} />
            </Camera>
            <ChapterTag x={70} y={300} idx="04 · POURQUOI" word="STRESS" sub="sévérité → escalade L1 → L2" color={WARN} a={animate({ from: 0, to: 1, start: 0.2, end: 1, ease: Easing.easeOutCubic })(lt)} />
            <SentinelFeed level={level} />
            {/* L1 -> L2 escalation badge */}
            <Sprite start={5.6} end={78.5}>{({ progress }) => (
              <div style={{ position: 'absolute', left: 70, top: 1090, display: 'flex', alignItems: 'center', gap: 16, opacity: clamp(progress * 4, 0, 1) }}>
                <span style={{ font: `700 22px ${MONO}`, color: GREEN2, padding: '10px 16px', borderRadius: 10, background: 'rgba(95,127,82,0.16)' }}>L1 REFLEX</span>
                <span className="material-symbols-rounded" style={{ fontSize: 34, color: WARN }}>arrow_forward</span>
                <span style={{ font: `700 22px ${MONO}`, color: AMBER, padding: '10px 16px', borderRadius: 10, background: 'rgba(206,142,63,0.18)', boxShadow: `0 0 24px -6px ${WARN}` }}>L2 ANALYST</span>
              </div>
            )}</Sprite>
            <Sprite start={8} end={78.5}>{({ progress }) => (
              <Callout x={70} y={1470} w={W - 140} tag="SENTINEL" title="Le système se surveille" body="stable → stress → breach. Le Sentinel lit l'état moteur et monte d'un cran quand le budget de frame déborde." color={WARN} appear={clamp(progress * 3, 0, 1)} />
            )}</Sprite>
          </div>
        );
      }}
    </Sprite>
  );
}

// 78–88 · LIVE — cursor grant
function SceneLive() {
  return (
    <Sprite start={78} end={88.5}>
      {({ localTime: lt }) => {
        const secs = Math.max(0, Math.ceil(45 - (lt / 9) * 45));
        const pct = clamp(lt / 9, 0, 1);
        return (
          <div style={{ position: 'absolute', inset: 0 }}>
            <ShellBg dim={0.74} />
            <Membrane y={70} state="GRANT" accent={INFO} tracking={true} />
            <Mascot x={W / 2 - 120} y={360} size={240} state="transmit" t={lt} />
            <ChapterTag x={70} y={760} idx="05 · OÙ + QUAND" word="LIVE" sub="session · grant curseur 45s" color={INFO} a={animate({ from: 0, to: 1, start: 0.2, end: 1, ease: Easing.easeOutCubic })(lt)} />
            <GrantBar pct={1 - pct} secs={secs} />
            <Sprite start={2} end={88.5}>{({ progress }) => (
              <Callout x={70} y={1130} w={W - 140} tag="CONTRACT · CURSOR" title="Un accès borné dans le temps" body="La session Live accorde le curseur pour une durée explicite. Le contrat expire seul — rien n'est permanent." color={INFO} appear={clamp(progress * 3, 0, 1)} />
            )}</Sprite>
          </div>
        );
      }}
    </Sprite>
  );
}

// 88–92 · WHY / veille outro
function SceneWhy() {
  return (
    <Sprite start={88} end={92}>
      {({ localTime: lt, progress }) => {
        const dim = animate({ from: 0.7, to: 0.92, start: 0, end: 4 })(lt);
        return (
          <div style={{ position: 'absolute', inset: 0 }}>
            <ShellBg dim={dim} />
            <Mascot x={W / 2 - 130} y={500} size={260} state="veille" t={lt} />
            <div style={{ position: 'absolute', left: 70, top: 1080, width: W - 140, opacity: clamp(progress * 3, 0, 1) }}>
              <div style={{ font: `700 24px ${MONO}`, color: ORANGE, letterSpacing: '0.16em' }}>VEILLE · LE SYSTÈME SE REPOSE</div>
              <div style={{ font: `700 64px ${SANS}`, color: '#f3eee9', letterSpacing: '-0.02em', lineHeight: 1.05, marginTop: 16 }}>Chaque trigger : un contrat,<br />borné, observable.</div>
              <div style={{ font: `400 24px ${MONO}`, color: '#9aa0a8', marginTop: 28 }}>&gt;_ gnu.in-shell · v0.14.2</div>
            </div>
          </div>
        );
      }}
    </Sprite>
  );
}

function TriggerFilm() {
  return (
    <div data-film-root data-screen-label="t=0s" style={{ position: 'absolute', inset: 0 }}>
      <Stage width={W} height={H} duration={92} background="#0a0c0f" persistKey="triggerfilm">
        <SceneIntro />
        <SceneWhere />
        <SceneHow />
        <SceneWhen />
        <SceneStress />
        <SceneLive />
        <SceneWhy />
        <Brand />
        <Progress />
        <Timecode />
      </Stage>
    </div>
  );
}

Object.assign(window, { TriggerFilm });
