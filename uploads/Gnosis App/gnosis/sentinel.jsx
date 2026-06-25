/* global React, Sym, useTween, MDUR */
// ============================================================================
// gnosis/sentinel.jsx — the Sentinel: a graduated analysis-power reactor.
// Five rungs on an 8 GB RTX 3070 budget, grounded in the local-model research:
//   L0 VEILLE  · wake-word ear (openWakeWord)            ~0.1 GB
//   L1 REFLEX  · Qwen3-1.7B / LFM2-1.2B · route+triage   ~1.4 GB
//   L2 ANALYST · Qwen3-4B + Moondream2 vision            ~2.6 GB
//   L3 DEEP    · Qwen3-8B / Qwen2.5-Coder-7B             ~5.2 GB
//   G6 GNU6    · cloud frontier offload (keeps L1 warm)   net
// Chrome is dynamic (M3 role tokens). The cloud rung recolors to --gnu-info.
// ============================================================================
const { useMemo } = React;

const SENTINEL_TIERS = [
  { lvl: 0, code: "L0", name: "VEILLE",  role: "wake-word ear",        model: "openWakeWord",          base: 0.1, kv: 0.0, lat: "—",      glyph: "bedtime" },
  { lvl: 1, code: "L1", name: "REFLEX",  role: "route · classify",     model: "Qwen3 1.7B · LFM2 1.2B", base: 1.4, kv: 0.3, lat: "~40ms",  glyph: "bolt" },
  { lvl: 2, code: "L2", name: "ANALYST", role: "reason + vision",      model: "Qwen3 4B · Moondream2",  base: 2.6, kv: 0.6, lat: "~120ms", glyph: "neurology" },
  { lvl: 3, code: "L3", name: "DEEP",    role: "code · long reasoning", model: "Qwen3 8B · Coder 7B",   base: 5.2, kv: 1.0, lat: "~320ms", glyph: "all_inclusive" },
  { lvl: 4, code: "G6", name: "GNU6",    role: "cloud frontier",       model: "gnu6 · on-demand",       base: 1.4, kv: 0.2, lat: "net",    glyph: "cloud", cloud: true },
];
const VRAM_TOTAL = 8.0; // RTX 3070

// resident VRAM for a given active rung (models swap, they don't stack; the
// cloud rung only keeps the L1 router warm locally)
const tierVram = (t) => +(t.base + t.kv).toFixed(1);
const vramState = (used) => (used > 6.8 ? "alert" : used > 5.6 ? "warn" : "ok");

// ---- SentinelPill (bar) ----------------------------------------------------
function SentinelPill({ tierIdx, open, ramping, onClick }) {
  const t = SENTINEL_TIERS[tierIdx];
  return (
    <button
      type="button"
      className={`sentinel-pill${open ? " is-open" : ""}${t.cloud ? " is-cloud" : ""}`}
      onClick={onClick}
      title="Sentinel · analysis power"
      aria-label={`Sentinel level ${t.code} ${t.name}`}
    >
      <span className={`pwr-meter${ramping ? " is-ramping" : ""}`} aria-hidden="true">
        {[1, 2, 3, 4].map((seg) => {
          const lit = t.cloud ? true : seg <= t.lvl;
          return <span key={seg} className={`pwr-meter__seg${lit ? " is-lit" : ""}${t.cloud ? " is-cloud" : ""}`} />;
        })}
      </span>
      <span className="sentinel-pill__core">
        <span className="sentinel-pill__lvl">
          <span className="sentinel-pill__code">{t.code}</span>
          <span>SENTINEL</span>
        </span>
        <span className="sentinel-pill__name">{t.name}</span>
      </span>
    </button>
  );
}

// ---- SentinelReactor (panel) ----------------------------------------------
function SentinelReactor({ tierIdx, setTierIdx, auto, setAuto, ramping, dense }) {
  const active = SENTINEL_TIERS[tierIdx];
  const used = useMemo(() => tierVram(active), [active]);
  const usedAnim = useTween(used, { dur: MDUR.slow, ease: "elastic" });
  const pct = Math.min(100, (usedAnim / VRAM_TOTAL) * 100);
  const vs = vramState(used);
  const cloud = !!active.cloud;

  const step = (dir) => {
    const next = Math.max(0, Math.min(SENTINEL_TIERS.length - 1, tierIdx + dir));
    if (next !== tierIdx) setTierIdx(next, { manual: true });
  };

  return (
    <div className={`reactor${cloud ? " is-cloud" : ""}`}>
      {/* ---- tier ladder (top = strongest) ---- */}
      <div className="ladder" role="radiogroup" aria-label="Sentinel power tier">
        {SENTINEL_TIERS.map((t, i) => {
          const isActive = i === tierIdx;
          const isOnline = i <= tierIdx && t.lvl > 0 && !(cloud && !t.cloud && t.lvl > 1);
          return (
            <button
              key={t.code}
              type="button"
              role="radio"
              aria-checked={isActive}
              className={`tier${isActive ? " is-active" : ""}${isOnline ? " is-online" : ""}${t.cloud ? " is-cloud" : ""}${isActive && ramping ? " is-ramping" : ""}`}
              onClick={() => setTierIdx(i, { manual: true })}
            >
              <span className="tier__rail"><span className="tier__node" /></span>
              <span className="tier__body">
                <span className="tier__name">{t.name}<span className="tier__code">{t.code}</span></span>
                {!dense && <span className="tier__role">{t.role}</span>}
              </span>
              <span className="tier__glyph"><Sym size={16} fill={isActive ? 1 : 0}>{t.glyph}</Sym></span>
            </button>
          );
        })}
      </div>

      {/* ---- active-tier detail ---- */}
      <div className="reactor__detail">
        <div className="rx-head">
          <span className="rx-head__name">{active.name}</span>
          <span className="rx-head__lvl">{active.code}</span>
          <span className="rx-head__mode">
            <Sym size={13} fill={1}>{cloud ? "cloud_done" : auto ? "auto_mode" : "lock"}</Sym>
            {cloud ? "OFFLOADED" : auto ? "AUTO" : "PINNED"}
          </span>
        </div>

        <div className="rx-model">
          <Sym size={14}>{active.glyph}</Sym>
          <span>{active.model}</span>
        </div>

        {/* VRAM budget */}
        <div className="vram">
          <div className="vram__head">
            <span>VRAM BUDGET{cloud ? " · LOCAL ROUTER" : ""}</span>
            <span>
              <b className={vs === "ok" ? "" : vs}>{usedAnim.toFixed(1)}</b> / {VRAM_TOTAL.toFixed(0)} GB
            </span>
          </div>
          <div className="vram__track">
            <div className={`vram__fill${vs === "warn" ? " is-warn" : vs === "alert" ? " is-alert" : ""}`} style={{ width: `${pct}%` }} />
            <div className="vram__ticks">
              {[2, 4, 6].map((g) => <span key={g} className="vram__tick" style={{ left: `${(g / VRAM_TOTAL) * 100}%` }} />)}
            </div>
          </div>
        </div>

        {/* controls */}
        <div className="rx-ctl">
          <button type="button" className="rx-ctl__step" onClick={() => step(-1)} disabled={tierIdx === 0} title="De-escalate" aria-label="De-escalate">
            <Sym size={18}>remove</Sym>
          </button>
          <button type="button" className="rx-ctl__step" onClick={() => step(1)} disabled={tierIdx === SENTINEL_TIERS.length - 1} title="Escalate" aria-label="Escalate">
            <Sym size={18}>add</Sym>
          </button>
          <button type="button" className={`rx-ctl__auto${auto ? " is-on" : ""}`} onClick={() => setAuto(!auto)} title="Auto-escalation" aria-pressed={auto}>
            <span className="dot" /> auto
          </button>
          <span className="rx-ctl__spacer" />
          <span className="rx-ctl__lat"><b>{active.lat}</b> latency</span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { SENTINEL_TIERS, VRAM_TOTAL, tierVram, vramState, SentinelPill, SentinelReactor });
