/* GNU.IN OS+ shell — dynamic chrome, single-scope React app.
   All components live here to share scope cleanly. */
const { useState, useEffect, useRef, useCallback } = React;
const CELL = 26;

function Sym({ children, className = "", fill = 0, size, style }) {
  return <span className={"ico " + className}
    style={{ fontVariationSettings: `"FILL" ${fill}, "wght" 450, "GRAD" 0, "opsz" 24`, fontSize: size, ...style }}>{children}</span>;
}

function Ring({ pct, glyph }) {
  const r = 8, c = 2 * Math.PI * r, off = c * (1 - pct / 100);
  return (
    <span className="ring">
      <svg width="19" height="19" viewBox="0 0 19 19">
        <circle cx="9.5" cy="9.5" r={r} fill="none" stroke="var(--layer3)" strokeWidth="2.5" />
        <circle cx="9.5" cy="9.5" r={r} fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} />
      </svg>
      <Sym className="gly">{glyph}</Sym>
    </span>
  );
}

/* ===================== WORKSPACES ===================== */
function Workspaces({ occupied, active, setActive }) {
  const shown = 10;
  const [hover, setHover] = useState(false);
  return (
    <div className="group" style={{ padding: "0 4px", gap: 0 }}>
      <div className="ws" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
        <div className="ws__row" style={{ width: shown * CELL }}>
          <div className="ws__active" style={{ left: (active - 1) * CELL + 2, width: CELL - 4 }} />
          {Array.from({ length: shown }, (_, i) => {
            const id = i + 1, occ = occupied.includes(id);
            const rL = occupied.includes(id - 1) ? 2 : 999, rR = occupied.includes(id + 1) ? 2 : 999;
            const isA = active === id, showNum = isA || hover;
            return (
              <div key={id} className="ws__cell" onClick={() => setActive(id)}>
                {occ && <div className="ws__occ" style={{ borderRadius: `${rL}px ${rR}px ${rR}px ${rL}px` }} />}
                {showNum
                  ? <span className="ws__label" style={{ color: isA ? "var(--on-primary)" : occ ? "var(--on-sec)" : "var(--on1-in)" }}>{id}</span>
                  : <span className="ws__dot" style={{ background: occ ? "var(--on-sec)" : "var(--on1-in)", opacity: occ ? 1 : 0.55 }} />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ===================== BAR ===================== */
function Bar({ ccOpen, toggleCC, leftOpen, toggleLeft, onScrollBright, onScrollVol }) {
  const [active, setActive] = useState(2);
  const occupied = [1, 2, 3, 5, 8];
  const [clock, setClock] = useState(() => new Date());
  const [form, setForm] = useState(0);
  const barRef = useRef(null);
  useEffect(() => { const t = setInterval(() => setClock(new Date()), 10000); return () => clearInterval(t); }, []);
  useEffect(() => {
    const calc = (w) => { if (!w) w = barRef.current?.clientWidth || window.innerWidth || 0; if (!w) return; setForm(w <= 1000 ? 2 : w <= 1280 ? 1 : 0); };
    let ro; if (barRef.current && "ResizeObserver" in window) { ro = new ResizeObserver(es => calc(es[0].contentRect.width)); ro.observe(barRef.current); }
    const or = () => calc(); window.addEventListener("resize", or); requestAnimationFrame(() => calc());
    return () => { ro && ro.disconnect(); window.removeEventListener("resize", or); };
  }, []);
  const hh = String(clock.getHours()).padStart(2, "0"), mm = String(clock.getMinutes()).padStart(2, "0");
  const date = clock.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  return (
    <div className="bar" ref={barRef}>
      <div className="zone left" onWheel={(e) => onScrollBright(e.deltaY < 0 ? 0.05 : -0.05)}>
        <button className={"sidebtn" + (leftOpen ? " on" : "")} title="Left sidebar" onClick={toggleLeft}><img src="../../assets/symbols/cube.svg" alt="GNU.IN" /></button>
        {form === 0 && <div className="activewin"><span className="dotapp" /><span className="title"><b>kitty</b> <span className="sub">— ~/illogical-morgue</span></span></div>}
      </div>
      <div className="mid">
        <div className="group">
          <div className="res"><Ring pct={54} glyph="memory" /><span className="pct">54%</span></div>
          {form === 2 && <div className="res"><Ring pct={31} glyph="developer_board" /><span className="pct">31%</span></div>}
          {form < 2 && <div className="media"><Sym className="bico sm">music_note</Sym><span className="track">Boards of Canada — Roygbiv</span></div>}
        </div>
        <Workspaces occupied={occupied} active={active} setActive={setActive} />
        <div className="group tap" onClick={toggleCC}>
          <div className="clock"><span className="t num">{hh}:{mm}</span>{form === 0 && <span className="d">{date}</span>}</div>
          {form < 2 && <div className="batt"><Sym className="bico sm" fill={1}>battery_5_bar</Sym><span className="pct num">82%</span></div>}
        </div>
      </div>
      <div className="zone right" onWheel={(e) => onScrollVol(e.deltaY < 0 ? 0.05 : -0.05)}>
        <button className={"indi" + (ccOpen ? " on" : "")} onClick={toggleCC} title="Control center">
          <span className="badge">3</span>
          <Sym className="bico sm">signal_cellular_alt</Sym>
          <Sym className="bico sm">bluetooth</Sym>
        </button>
        <div className="systray" style={{ display: form === 0 ? undefined : "none" }}>
          <button className="ti"><Sym>cloud_queue</Sym></button>
          <button className="ti"><Sym>dns</Sym></button>
          <button className="ti"><Sym>headphones</Sym></button>
        </div>
        {form < 2 && <div className="weather"><Sym className="bico sm" fill={1} style={{ color: "var(--green)" }}>partly_cloudy_day</Sym><span className="num">18°</span></div>}
      </div>
    </div>
  );
}

/* ===================== CONTROL CENTER ===================== */
function QSlider({ glyph, glyph2, value, onChange }) {
  const ref = useRef(null);
  const set = (e) => { const r = ref.current.getBoundingClientRect(); onChange(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width))); };
  return (
    <div className={"qslider" + (value >= 0.92 ? " full" : "")} ref={ref}
      onClick={set} onMouseMove={(e) => e.buttons === 1 && set(e)}>
      <div className="qslider__fill" style={{ width: `${value * 100}%` }} />
      {glyph2 && <div className="qslider__div" style={{ left: "30%" }} />}
      <Sym fill={1}>{glyph}</Sym>
    </div>
  );
}

function MiniCal() {
  const now = new Date();
  const y = now.getFullYear(), m = now.getMonth(), today = now.getDate();
  const first = new Date(y, m, 1).getDay(), dim = new Date(y, m + 1, 0).getDate();
  const cells = []; for (let i = 0; i < first; i++) cells.push(null); for (let d = 1; d <= dim; d++) cells.push(d);
  const month = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  return (
    <div className="cc__cal">
      <div className="cc__cal-head">
        <span className="cc__cal-month">{month}</span>
        <div className="cc__cal-nav"><button><Sym size={18}>chevron_left</Sym></button><button><Sym size={18}>chevron_right</Sym></button></div>
      </div>
      <div className="cc__cal-grid">
        {["S","M","T","W","T","F","S"].map((d, i) => <div key={i} className="cc__cal-dow">{d}</div>)}
        {cells.map((d, i) => <div key={i} className={"cc__cal-day" + (d === today ? " today" : "") + (d === null ? " mute" : "")}>{d || ""}</div>)}
      </div>
    </div>
  );
}

const TOGGLES = [
  { id: "wifi", on: true, icon: "wifi", name: "Wi-Fi", state: "syster-net" },
  { id: "bt", on: true, icon: "bluetooth", name: "Bluetooth", state: "2 devices" },
  { id: "night", on: false, icon: "nightlight", name: "Night Light", state: "Off" },
  { id: "game", on: false, icon: "sports_esports", name: "Game Mode", state: "Off" },
  { id: "idle", on: false, icon: "coffee", name: "Keep Awake", state: "Off" },
  { id: "dark", on: true, icon: "dark_mode", name: "Dark", state: "On" },
];

const WIFI_NETS = [
  { nm: "syster-net", icon: "wifi", conn: true, sig: "" },
  { nm: "GNU6-guest", icon: "wifi", sig: "●●●" },
  { nm: "hyprland_5G", icon: "wifi", sig: "●●○" },
  { nm: "eduroam", icon: "wifi_lock", sig: "●○○" },
];
const BT_DEVS = [
  { nm: "Sys.ter Buds", icon: "headphones", conn: true },
  { nm: "MX Master 3", icon: "mouse", conn: true },
  { nm: "Keychron K3", icon: "keyboard", sig: "pair" },
];

function ControlCenter({ onClose, onSession }) {
  const [toggles, setToggles] = useState(TOGGLES);
  const [sliders, setSliders] = useState({ bright: 0.72, vol: 0.45, mic: 0.6 });
  const [dialog, setDialog] = useState(null);
  const flip = (id) => setToggles(t => t.map(x => x.id === id ? { ...x, on: !x.on, state: x.on ? "Off" : (x.id === "bt" ? "2 devices" : "On") } : x));
  const dlg = dialog === "wifi"
    ? { title: "Wi-Fi", items: WIFI_NETS }
    : dialog === "bt" ? { title: "Bluetooth", items: BT_DEVS } : null;
  return (
    <React.Fragment>
      <div className="cc-scrim" onClick={onClose} onContextMenu={(e) => { e.preventDefault(); onClose(); }} />
      <div className="cc" onClick={(e) => e.stopPropagation()}>
        <div className="cc__top">
          <div className="cc__uptime"><Sym fill={1} style={{ color: "var(--primary)" }}>terminal</Sym><span>Up 3h 12m</span></div>
          <div className="cc__sysbtns">
            <button className="cc__sysbtn" title="Reload"><Sym>restart_alt</Sym></button>
            <button className="cc__sysbtn" title="Settings"><Sym>settings</Sym></button>
            <button className="cc__sysbtn danger" title="Session" onClick={onSession}><Sym>power_settings_new</Sym></button>
          </div>
        </div>
        <div className="cc__sliders">
          <QSlider glyph="light_mode" glyph2 value={sliders.bright} onChange={(v) => setSliders(s => ({ ...s, bright: v }))} />
          <QSlider glyph="volume_up" value={sliders.vol} onChange={(v) => setSliders(s => ({ ...s, vol: v }))} />
          <QSlider glyph="mic" value={sliders.mic} onChange={(v) => setSliders(s => ({ ...s, mic: v }))} />
        </div>
        {dlg ? (
          <div className="ccdlg">
            <div className="ccdlg__head">
              <button className="ccdlg__back" onClick={() => setDialog(null)}><Sym>arrow_back</Sym></button>
              <span className="ccdlg__title">{dlg.title}</span>
            </div>
            {dlg.items.map((it, i) => (
              <button key={i} className="ccdlg__item">
                <Sym fill={it.conn ? 1 : 0}>{it.icon}</Sym><span className="nm">{it.nm}</span>
                <span className="meta">{it.conn ? <span className="conn">Connected</span> : <span className="sig">{it.sig}</span>}</span>
              </button>
            ))}
          </div>
        ) : (
          <React.Fragment>
            <div className="cc__toggles">
              {toggles.map(t => (
                <button key={t.id} className={"qtoggle" + (t.on ? " on" : "")} onClick={() => flip(t.id)}>
                  <Sym fill={t.on ? 1 : 0}>{t.icon}</Sym>
                  <span className="qtoggle__txt"><span className="qtoggle__name">{t.name}</span><span className="qtoggle__state">{t.state}</span></span>
                  {(t.id === "wifi" || t.id === "bt") &&
                    <span className="qtoggle__exp" onClick={(e) => { e.stopPropagation(); setDialog(t.id); }}><Sym>chevron_right</Sym></span>}
                </button>
              ))}
            </div>
            <MiniCal />
          </React.Fragment>
        )}
      </div>
    </React.Fragment>
  );
}

/* ===================== SESSION SCREEN ===================== */
const SESSION = [
  { icon: "lock", name: "Lock" }, { icon: "dark_mode", name: "Sleep" }, { icon: "logout", name: "Logout" }, { icon: "browse_activity", name: "Task Manager" },
  { icon: "downloading", name: "Hibernate" }, { icon: "power_settings_new", name: "Shutdown", danger: true }, { icon: "restart_alt", name: "Reboot" }, { icon: "settings_applications", name: "Firmware" },
];
function SessionScreen({ onClose, onLock }) {
  return (
    <div className="sess-scrim" onClick={onClose} onContextMenu={(e) => { e.preventDefault(); onClose(); }}>
      <div className="sess" onClick={(e) => e.stopPropagation()}>
        <div className="sess__title">Session</div>
        <div className="sess__hint">Arrow keys to navigate, Enter to select<br />Esc or click anywhere to cancel</div>
        <div className="sess__grid">
          {SESSION.map((s, i) => (
            <button key={i} className={"sess__btn" + (s.danger ? " danger" : "")} onClick={s.name === "Lock" ? onLock : onClose}>
              <Sym fill={0}>{s.icon}</Sym><span>{s.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ===================== OSD ===================== */
function Osd({ osd }) {
  if (!osd) return null;
  return (
    <div className="osd" key={osd.k}>
      <div className="osd__icon"><Sym fill={1}>{osd.icon}</Sym></div>
      <div className="osd__col">
        <div className="osd__row"><span>{osd.name}</span><span className="num">{Math.round(osd.value * 100)}</span></div>
        <div className="osd__bar"><div className="osd__fill" style={{ width: `${osd.value * 100}%` }} /></div>
      </div>
    </div>
  );
}

/* ===================== CONTRACT MENU ===================== */
function ContractMenu({ x, y, onClose, onOverview }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x, y });
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    setPos({ x: Math.min(x, window.innerWidth - r.width - 8), y: Math.min(y, window.innerHeight - r.height - 8) });
  }, [x, y]);
  const Item = ({ icon, label, kbd, accent }) => (
    <button className={"cm__item" + (accent ? " accent" : "")} onClick={onClose}>
      <Sym>{icon}</Sym><span>{label}</span>{kbd && <span className="kbd">{kbd}</span>}
    </button>
  );
  return (
    <React.Fragment>
      <div className="cm-scrim" onClick={onClose} onContextMenu={(e) => { e.preventDefault(); onClose(); }} />
      <div className="cm" ref={ref} style={{ left: pos.x, top: pos.y }}>
        <div className="cm__label">Contract — empty space</div>
        <Item icon="add" label="Add widget" kbd="W" accent />
        <Item icon="wallpaper" label="Change wallpaper" />
        <button className="cm__item" onClick={() => { onClose(); onOverview(); }}><Sym>dashboard</Sym><span>Overview</span><span className="kbd">Super</span></button>
        <div className="cm__sep" />
        <Item icon="terminal" label="Open shell editor" />
        <Item icon="grid_view" label="Edit layout contract" />
        <Item icon="tune" label="Shell settings" />
        <div className="cm__sep" />
        <Item icon="dark_mode" label="Toggle dark mode" />
        <Item icon="refresh" label="Reload Quickshell" />
      </div>
    </React.Fragment>
  );
}

/* ===================== NOTIFICATIONS ===================== */
function Notifications({ list, dismiss }) {
  if (!list.length) return null;
  return (
    <div className="notif-stack">
      {list.map(n => (
        <div className="notif" key={n.id}>
          <div className="notif__icon"><Sym fill={1}>{n.icon}</Sym></div>
          <div className="notif__body">
            <div className="notif__top"><span className="notif__app">{n.app}</span><span className="notif__time">{n.time}</span></div>
            <div className="notif__title">{n.title}</div>
            <div className="notif__text">{n.text}</div>
            {n.actions && <div className="notif__actions">{n.actions.map((a, i) => <button key={i} className={"notif__btn" + (i === 0 ? " primary" : "")} onClick={() => dismiss(n.id)}>{a}</button>)}</div>}
          </div>
          <button className="notif__close" onClick={() => dismiss(n.id)}><Sym>close</Sym></button>
        </div>
      ))}
    </div>
  );
}

/* ===================== LEFT SIDEBAR (agent pane) ===================== */
function LeftSidebar({ onClose }) {
  const [tab, setTab] = useState("intel");
  const [msgs, setMsgs] = useState([
    { role: "agent", text: "local agent ready >_ context loaded · workspace ~/illogical-morgue" },
    { role: "user", text: "tighten the bar's right cluster spacing" },
    { role: "agent", text: "Commande reçue. Patching BarContent.qml — indicator pill realSpacing 15 → 12:", code: "indicatorsRowLayout.realSpacing: 12" },
  ]);
  const [draft, setDraft] = useState("");
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView?.({ block: "end" }); }, [msgs.length]);
  const send = () => {
    const t = draft.trim(); if (!t) return;
    setMsgs(m => [...m, { role: "user", text: t }, { role: "agent", text: "Exécution planifiée. ./run --scope shell" }]);
    setDraft("");
  };
  const tabs = [{ id: "intel", icon: "neurology", name: "Intelligence" }, { id: "trans", icon: "translate", name: "Translator" }];
  return (
    <React.Fragment>
      <div className="cc-scrim" onClick={onClose} onContextMenu={(e) => { e.preventDefault(); onClose(); }} />
      <div className="ls" onClick={(e) => e.stopPropagation()}>
        <div className="ls__tabs">
          {tabs.map(t => (
            <button key={t.id} className={"ls__tab" + (tab === t.id ? " on" : "")} onClick={() => setTab(t.id)}>
              <Sym fill={tab === t.id ? 1 : 0}>{t.icon}</Sym><span>{t.name}</span>
            </button>
          ))}
        </div>
        <div className="ls__panel">
          <div className="ls__msgs">
            {msgs.map((m, i) => (
              <div key={i} className={"msg " + m.role}>
                <span className="role">{m.role === "agent" ? "agent" : "you"}</span>
                <span>{m.text}</span>
                {m.code && <code className="codeblock">{m.code}</code>}
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <div className="ls__composer">
            <div className="ls__field">
              <input value={draft} placeholder=">_ ask the local agent…"
                onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} />
              <button className="ls__send" onClick={send}><Sym fill={1}>arrow_upward</Sym></button>
            </div>
            <div className="ls__cmds">
              <span className="ls__chip accent"><Sym>bolt</Sym>syster-7b</span>
              <span className="ls__chip"><Sym>attach_file</Sym>context</span>
              <span className="ls__chip"><Sym>delete</Sym>/clear</span>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

/* ===================== OVERVIEW (search + workspace grid) ===================== */
const OV_WINS = {
  1: [{ x: 8, y: 18, w: 88, h: 60, c: "#2d6cdf", i: "web" }, { x: 92, y: 30, w: 68, h: 52, c: "#1f1d1d", i: "terminal" }],
  2: [{ x: 30, y: 16, w: 108, h: 66, c: "#c2410c", i: "code" }],
  3: [{ x: 10, y: 20, w: 70, h: 56, c: "#3a3a3a", i: "folder" }, { x: 84, y: 22, w: 74, h: 58, c: "#7c3aed", i: "chat" }],
  5: [{ x: 26, y: 18, w: 116, h: 64, c: "#0e7490", i: "music_note" }],
  8: [{ x: 14, y: 22, w: 140, h: 58, c: "#15803d", i: "mail" }],
};
const APP_RESULTS = [
  { icon: "terminal", nm: "kitty", sub: "terminal" }, { icon: "web", nm: "Firefox", sub: "browser" },
  { icon: "code", nm: "VS Code", sub: "editor" }, { icon: "folder", nm: "Files", sub: "dolphin" },
  { icon: "settings", nm: "Shell settings", sub: "qs" },
];
function Overview({ onClose }) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(2);
  const inputRef = useRef(null);
  useEffect(() => { inputRef.current?.focus(); }, []);
  const searching = q.trim().length > 0;
  const results = APP_RESULTS.filter(a => a.nm.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <React.Fragment>
      <div className="ov-scrim" onClick={onClose} onContextMenu={(e) => { e.preventDefault(); onClose(); }} />
      <div className="ov">
        <div className="ov__search">
          <Sym>search</Sym>
          <input ref={inputRef} value={q} placeholder="Search apps · run commands · >_ calc, clipboard…"
            onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Escape" && onClose()} />
          {!searching && <span className="pre">Super</span>}
        </div>
        {searching ? (
          <div className="ov__res">
            {results.length ? results.map((a, i) => (
              <button key={i} className={"ov__item" + (i === 0 ? " sel" : "")} onClick={onClose}>
                <Sym fill={1}>{a.icon}</Sym><span className="nm">{a.nm}</span><span className="sub">{a.sub}</span>
              </button>
            )) : <button className="ov__item"><Sym>search_off</Sym><span className="nm">No matches</span></button>}
          </div>
        ) : (
          <div className="ov__grid">
            {Array.from({ length: 10 }, (_, i) => {
              const id = i + 1, wins = OV_WINS[id] || [];
              return (
                <div key={id} className={"ov__ws" + (active === id ? " active" : "")} onClick={() => { setActive(id); onClose(); }}>
                  <span className="ov__ws-num">{id}</span>
                  {wins.map((w, j) => (
                    <div key={j} className="ov__win" style={{ left: w.x, top: w.y, width: w.w, height: w.h, background: w.c }}>
                      <Sym fill={1}>{w.i}</Sym>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </React.Fragment>
  );
}

/* ===================== LOCK SCREEN ===================== */
function LockScreen({ onUnlock }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  const [shake, setShake] = useState(false);
  const [clock, setClock] = useState(() => new Date());
  const PASS = "syster"; // demo password
  useEffect(() => { const t = setInterval(() => setClock(new Date()), 5000); return () => clearInterval(t); }, []);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Enter") { tryUnlock(); }
      else if (e.key === "Escape") { setPw(""); setErr(false); }
      else if (e.key === "Backspace") { setPw(p => p.slice(0, -1)); setErr(false); }
      else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) { setPw(p => (p + e.key).slice(0, 24)); setErr(false); }
    };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  });
  const tryUnlock = () => {
    if (pw === PASS) { onUnlock(); return; }
    setErr(true); setShake(true); setPw(""); setTimeout(() => setShake(false), 380);
  };
  const hh = String(clock.getHours()).padStart(2, "0"), mm = String(clock.getMinutes()).padStart(2, "0");
  const date = clock.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  return (
    <div className="lock" style={{ backgroundImage: "url('../../assets/imagery/wallpaper-hero.png')" }} onClick={(e) => e.stopPropagation()}>
      <div className="lock__scrim" />
      <div className="lock__clock"><div className="lock__time num">{hh}:{mm}</div><div className="lock__date">{date}</div></div>
      <div className="lock__islands">
        <div className="island left">
          <span className="pair"><Sym fill={1}>account_circle</Sym><span>syster</span></span>
          <span className="pair"><Sym fill={1}>keyboard_alt</Sym><span>us</span></span>
        </div>
        <div className="island main">
          <span className="lock__fp"><Sym fill={1}>fingerprint</Sym></span>
          <div className={"lock__field" + (shake ? " shake" : "")} onClick={tryUnlock}>
            {pw.length === 0
              ? <span className={"lock__ph" + (err ? " err" : "")}>{err ? "Incorrect password" : "Enter password — try “syster”"}</span>
              : <span className="lock__dots">{Array.from({ length: pw.length }, (_, i) => <span key={i} className="lock__dot" />)}</span>}
          </div>
          <button className="lock__confirm" onClick={tryUnlock}><Sym>arrow_right_alt</Sym></button>
        </div>
        <div className="island right">
          <span className="pair"><Sym fill={1}>battery_android_full</Sym><span className="num">82</span></span>
          <button className="ibtn" title="Sleep"><Sym fill={1}>dark_mode</Sym></button>
          <button className="ibtn" title="Power"><Sym fill={1}>power_settings_new</Sym></button>
          <button className="ibtn" title="Reboot"><Sym fill={1}>restart_alt</Sym></button>
        </div>
      </div>
      <div className="lock__hint">{">_"} type to fill · Enter or → to unlock · Esc clears</div>
    </div>
  );
}

/* ===================== DOCK ===================== */
const DOCK = [
  { icon: "terminal", run: true }, { icon: "web", run: true }, { icon: "folder", run: false },
  { icon: "code", run: true }, { icon: "chat", run: false }, { icon: "settings", run: false },
];
function Dock() {
  return <div className="dock">{DOCK.map((a, i) => <button key={i} className="dock__app"><Sym fill={1}>{a.icon}</Sym>{a.run && <span className="dotrun" />}</button>)}</div>;
}

/* ===================== APP ===================== */
function App() {
  const [scheme, setScheme] = useState("cool");
  const [corner, setCorner] = useState("float");
  const [ccOpen, setCCOpen] = useState(false);
  const [leftOpen, setLeftOpen] = useState(false);
  const [overviewOpen, setOverviewOpen] = useState(false);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [locked, setLocked] = useState(false);
  const [osd, setOsd] = useState(null);
  const [menu, setMenu] = useState(null);
  const levels = useRef({ bright: 0.72, vol: 0.45 });
  const osdTimer = useRef(null);
  const showOsd = (kind, delta) => {
    const k = kind === "bright" ? "bright" : "vol";
    levels.current[k] = Math.max(0, Math.min(1, levels.current[k] + delta));
    const v = levels.current[k];
    setOsd(kind === "bright"
      ? { k: Date.now(), icon: "light_mode", name: "Brightness", value: v }
      : { k: Date.now(), icon: v === 0 ? "volume_off" : "volume_up", name: "Volume", value: v });
    clearTimeout(osdTimer.current); osdTimer.current = setTimeout(() => setOsd(null), 1500);
  };
  const [notifs, setNotifs] = useState([
    { id: 1, app: "GNU6-shell", time: "now", icon: "bolt", title: "local agent ready", text: ">_ context loaded · 3 notifications en attente", actions: ["Open", "Dismiss"] },
    { id: 2, app: "system", time: "2m", icon: "system_update", title: "Quickshell reloaded", text: "Commande reçue. Exécution planifiée: ./run", actions: null },
  ]);
  const dismiss = (id) => setNotifs(n => n.filter(x => x.id !== id));
  const onContext = useCallback((e) => { e.preventDefault(); setCCOpen(false); setLeftOpen(false); setMenu({ x: e.clientX, y: e.clientY }); }, []);
  useEffect(() => {
    const onKey = (e) => {
      if (locked) return; // lock screen owns the keyboard
      if (e.target.tagName === "INPUT") { if (e.key === "Escape") e.target.blur(); return; }
      if (e.key === "Escape") { setOverviewOpen(false); setCCOpen(false); setLeftOpen(false); setSessionOpen(false); setMenu(null); }
      else if (e.key === "o" || e.key === "O") { setMenu(null); setCCOpen(false); setLeftOpen(false); setOverviewOpen(v => !v); }
    };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  }, [locked]);
  const wp = "../../assets/imagery/wallpaper-hero.png";
  return (
    <React.Fragment>
      <div className="desk" style={{ backgroundImage: `url('${wp}')` }} onContextMenu={onContext}>
        <div className="desk__scrim" />
        <div className="shell" data-scheme={scheme} data-corner={corner}>
          <div className="barwrap">
            <Bar ccOpen={ccOpen} toggleCC={() => { setMenu(null); setLeftOpen(false); setCCOpen(v => !v); }}
              leftOpen={leftOpen} toggleLeft={() => { setMenu(null); setCCOpen(false); setLeftOpen(v => !v); }}
              onScrollBright={(d) => showOsd("bright", d)} onScrollVol={(d) => showOsd("vol", d)} />
            <div className="corners"><div className="corner l" /><div className="corner r" /></div>
          </div>
          <Notifications list={notifs} dismiss={dismiss} />
          <Osd osd={osd} />
          {ccOpen && <ControlCenter onClose={() => setCCOpen(false)} onSession={() => { setCCOpen(false); setSessionOpen(true); }} />}
          {leftOpen && <LeftSidebar onClose={() => setLeftOpen(false)} />}
          {overviewOpen && <Overview onClose={() => setOverviewOpen(false)} />}
          {sessionOpen && <SessionScreen onClose={() => setSessionOpen(false)} onLock={() => { setSessionOpen(false); setLocked(true); }} />}
          {menu && <ContractMenu x={menu.x} y={menu.y} onClose={() => setMenu(null)} onOverview={() => setOverviewOpen(true)} />}
          <Dock />
          {locked && <LockScreen onUnlock={() => setLocked(false)} />}
        </div>

        <div className="desk__hint"><span className="o">{">_"}</span> right-click contract · cube for agent · clock for control center · scroll bar edges for OSD · <b style={{fontWeight:600}}>O</b> overview</div>

        <div className="kctl">
          <div className="kctl__seg">
            <span className="kctl__lab">Dynamic scheme</span>
            <div className="kctl__opts">
              <button className={"kctl__btn cool " + (scheme === "cool" ? "on" : "")} onClick={() => setScheme("cool")}>Cool · mauve</button>
              <button className={"kctl__btn " + (scheme === "warm" ? "on" : "")} onClick={() => setScheme("warm")}>Warm · amber</button>
            </div>
          </div>
          <div className="kctl__seg">
            <span className="kctl__lab">Corner style</span>
            <div className="kctl__opts">
              <button className={"kctl__btn " + (corner === "float" ? "on" : "")} onClick={() => setCorner("float")}>Float</button>
              <button className={"kctl__btn " + (corner === "hug" ? "on" : "")} onClick={() => setCorner("hug")}>Hug</button>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
