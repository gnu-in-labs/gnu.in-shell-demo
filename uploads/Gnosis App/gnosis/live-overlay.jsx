/* global React, Sym, StatusDot */
// ============================================================================
// gnosis/live-overlay.jsx — the deixis layer of a LIVE session.
// Perimeter (the agent's visible viewport), LassoLayer (drag = scope a region,
// click = point at a thing), AnnoBox (agent vision boxes), Callout (anchored
// agent speech), GhostCursor (the agent's hand under a granted contract),
// WatcherChip (a pinned ambient watcher).
// Vision = dynamic chrome accent. The agent's HAND = identity orange.
// ============================================================================
const { useState, useRef, useCallback } = React;

// ---- corner brackets (shared) ----
function Brackets({ className = "" }) {
  return (
    <span className={`gx-brk ${className}`} aria-hidden="true">
      <i className="gx-brk__c gx-brk__c--tl"></i>
      <i className="gx-brk__c gx-brk__c--tr"></i>
      <i className="gx-brk__c gx-brk__c--bl"></i>
      <i className="gx-brk__c gx-brk__c--br"></i>
    </span>
  );
}

// ---- Perimeter --------------------------------------------------------------
// The frame that makes "the agent sees this" a visible, honest fact.
// mode: "live" (chrome accent) | "driving" (identity orange — agent has the hand)
function Perimeter({ mode = "live", fps = 12 }) {
  return (
    <div className={`perimeter perimeter--${mode}`} aria-hidden="true">
      <Brackets className="gx-brk--perimeter" />
      <div className="perimeter__tag">
        <span className="perimeter__dot"></span>
        {mode === "driving" ? (
          <span>SYS.TER DRIVING · esc or move to revoke</span>
        ) : (
          <span>SCREEN SHARED · <b className="num">{fps}</b> fps · sentinel local</span>
        )}
      </div>
    </div>
  );
}

// ---- LassoLayer ---------------------------------------------------------------
// Owns raw pointer input while live. Drag ≥ 8px → onRegion(rect).
// Click → hit-test through the layer for the nearest [data-gx] → onPoint.
const norm = (d) => ({
  x: Math.min(d.x0, d.x1), y: Math.min(d.y0, d.y1),
  w: Math.abs(d.x1 - d.x0), h: Math.abs(d.y1 - d.y0),
});

function LassoLayer({ active, onRegion, onPoint, onBackground }) {
  const [drag, setDrag] = useState(null);
  const layerRef = useRef(null);

  const down = useCallback((e) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag({ x0: e.clientX, y0: e.clientY, x1: e.clientX, y1: e.clientY });
  }, []);

  const move = useCallback((e) => {
    setDrag((d) => (d ? { ...d, x1: e.clientX, y1: e.clientY } : d));
  }, []);

  const up = useCallback((e) => {
    setDrag((d) => {
      if (!d) return null;
      const r = norm(d);
      if (r.w < 8 && r.h < 8) {
        // point: walk the stack under the cursor for a deictic target
        const els = document.elementsFromPoint(e.clientX, e.clientY);
        let hit = null;
        for (const el of els) {
          const t = el.closest && el.closest("[data-gx]");
          if (t) { hit = t; break; }
        }
        if (hit) {
          const tr = hit.getBoundingClientRect();
          const win = hit.closest("[data-win]");
          onPoint && onPoint({
            id: hit.getAttribute("data-gx"),
            label: hit.getAttribute("data-gx-label") || hit.getAttribute("data-gx"),
            winId: win ? win.getAttribute("data-win") : null,
            winTitle: win ? win.getAttribute("data-win-title") : null,
            rect: { x: tr.left, y: tr.top, w: tr.width, h: tr.height },
          });
        } else {
          onBackground && onBackground({ x: e.clientX, y: e.clientY });
        }
      } else {
        onRegion && onRegion(r);
      }
      return null;
    });
  }, [onRegion, onPoint, onBackground]);

  if (!active) return null;
  const r = drag ? norm(drag) : null;
  return (
    <div
      ref={layerRef}
      className="lasso-layer"
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onContextMenu={(e) => e.preventDefault()}
    >
      {r && r.w + r.h > 10 && (
        <div className="lasso-rect" style={{ left: r.x, top: r.y, width: r.w, height: r.h }}>
          <Brackets className="gx-brk--lasso" />
          <span className="lasso-rect__dim num">{Math.round(r.w)}×{Math.round(r.h)}</span>
        </div>
      )}
    </div>
  );
}

// ---- RegionMark ---------------------------------------------------------------
// The committed scope — stays on screen while the intent composes.
function RegionMark({ rect, label, onClear }) {
  if (!rect) return null;
  return (
    <div className="region-mark" style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }}>
      <Brackets className="gx-brk--region" />
      <div className="region-mark__tag">
        <Sym size={11} fill={1}>crop_free</Sym>
        <span>{label}</span>
        <button type="button" className="region-mark__x" onClick={onClear} title="Clear scope" aria-label="Clear scope">
          <Sym size={11}>close</Sym>
        </button>
      </div>
    </div>
  );
}

// ---- PointMark ------------------------------------------------------------------
function PointMark({ point, onClear }) {
  if (!point) return null;
  const { rect, label } = point;
  return (
    <div className="point-mark" style={{ left: rect.x - 4, top: rect.y - 4, width: rect.w + 8, height: rect.h + 8 }}>
      <div className="point-mark__tag">
        <Sym size={11} fill={1}>my_location</Sym>
        <span>{label}</span>
        <button type="button" className="region-mark__x" onClick={onClear} title="Clear point" aria-label="Clear point">
          <Sym size={11}>close</Sym>
        </button>
      </div>
    </div>
  );
}

// ---- AnnoBox -------------------------------------------------------------------
// Vision result box — what the agent SAW in the scoped region.
function AnnoBox({ a }) {
  return (
    <div className={`anno${a.done ? " is-done" : ""}`} style={{ left: a.rect.x, top: a.rect.y, width: a.rect.w, height: a.rect.h, animationDelay: `${a.delay || 0}ms` }}>
      <span className="anno__label">{a.label}</span>
    </div>
  );
}

// ---- Callout -------------------------------------------------------------------
// Anchored agent speech — the dialogue-frame, terminal-voiced.
function Callout({ co, onAction, onClose }) {
  if (!co) return null;
  const { rect, title, lines, actions = [] } = co;
  const vw = window.innerWidth;
  const right = rect.x + rect.w + 340 < vw;
  const style = right
    ? { left: rect.x + rect.w + 14, top: Math.max(70, rect.y - 6) }
    : { left: Math.max(14, rect.x - 334), top: Math.max(70, rect.y - 6) };
  return (
    <div className={`callout${right ? " callout--right" : " callout--left"}`} style={style}>
      <div className="callout__head">
        <span className="callout__glyph">▸</span>
        <span className="callout__title">{title}</span>
        <button type="button" className="region-mark__x" onClick={onClose} aria-label="Dismiss">
          <Sym size={12}>close</Sym>
        </button>
      </div>
      <div className="callout__body">
        {lines.map((l, i) => (
          <div className="callout__ln" key={i} style={{ animationDelay: `${180 + i * 260}ms` }}>{l}</div>
        ))}
      </div>
      {actions.length > 0 && (
        <div className="callout__acts" style={{ animationDelay: `${180 + lines.length * 260}ms` }}>
          {actions.map((a) => (
            <button type="button" key={a.id} className={`callout__btn${a.primary ? " is-primary" : ""}`} onClick={() => onAction(a.id)}>
              {a.glyph && <Sym size={13}>{a.glyph}</Sym>}
              <span>{a.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- GhostCursor ----------------------------------------------------------------
// The agent's hand. IDENTITY orange — never the chrome accent.
function GhostCursor({ ghost }) {
  if (!ghost.on) return null;
  return (
    <div className={`ghost${ghost.press ? " is-press" : ""}`} style={{ transform: `translate(${ghost.x}px, ${ghost.y}px)` }}>
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 3 L19 12.5 L12.6 13.6 L9.4 19.5 Z" fill="var(--brand-accent)" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
      <span className="ghost__ping"></span>
      <span className="ghost__tag">sys.ter</span>
    </div>
  );
}

// ---- WatcherChip ------------------------------------------------------------------
function WatcherChip({ w }) {
  return (
    <div className={`watcher${w.fired ? " is-fired" : ""}`} style={{ left: w.x, top: w.y }}>
      <StatusDot color={w.fired ? "var(--state-warn)" : "var(--m3-primary)"} size={6} pulsing={!w.fired} />
      <span>{w.fired ? w.firedLabel : w.label}</span>
    </div>
  );
}

Object.assign(window, { Brackets, Perimeter, LassoLayer, RegionMark, PointMark, AnnoBox, Callout, GhostCursor, WatcherChip });
