/* global React, ScalePop, Sym */
// ============================================================================
// gnosis/desktop.jsx — the simulated workspace the LIVE session looks at.
// Three app windows: Firefox (acme.dev pricing), Kitty (build log), Code
// (a diff the ghost cursor applies during a granted FIX plan).
// Every element the agent can deict at carries data-gx + data-gx-label.
// Windows carry data-win + data-win-title so regions can be attributed.
// These are CONTENT, not chrome: the page is a webpage, the term is a term.
// ============================================================================

const GX_PLANS = [
  { id: "starter", name: "Starter", price: 19, rows: ["3 seats", "10k req/day", "community support", "no SLA"] },
  { id: "pro", name: "Pro", price: 49, rows: ["12 seats", "250k req/day", "priority support", "SLA 99.9"] },
  { id: "scale", name: "Scale", price: 149, rows: ["40 seats", "2M req/day", "dedicated + SSO", "SLA 99.95"] },
];

function FirefoxWindow({ proPrice = 49 }) {
  return (
    <div className="gwin gwin--firefox" data-win="firefox" data-win-title="Firefox · acme.dev">
      <div className="gwin__bar">
        <span className="gwin__dots"><i></i><i></i><i></i></span>
        <span className="gwin__title">acme.dev / pricing — Firefox</span>
        <span className="gwin__meta num">1680×988</span>
      </div>
      <div className="gwin__body page">
        <div className="page__nav">
          <span className="page__brand">acme<b>cloud</b></span>
          <span className="page__links"><a>Docs</a><a className="is-on">Pricing</a><a>Changelog</a></span>
        </div>
        <div className="page__head">
          <h1 className="page__h">Pricing</h1>
          <p className="page__sub">Per-workspace, billed monthly.</p>
        </div>
        <div className="page__grid" data-gx="pricing-grid" data-gx-label="pricing grid">
          {GX_PLANS.map((p) => (
            <div className={`plan${p.id === "pro" ? " plan--hot" : ""}`} key={p.id} data-gx={`plan-${p.id}`} data-gx-label={`plan · ${p.name}`}>
              <div className="plan__name">{p.name}</div>
              <div className={`plan__price num${p.id === "pro" && proPrice !== 49 ? " is-changed" : ""}`} data-gx={`price-${p.id}`} data-gx-label={`price · ${p.name}`}>
                ${p.id === "pro" ? proPrice : p.price}<span>/mo</span>
              </div>
              <ul className="plan__rows">
                {p.rows.map((r, i) => (<li key={i}>{r}</li>))}
              </ul>
            </div>
          ))}
        </div>
        <div className="page__foot" data-gx="changelog-note" data-gx-label="changelog note">
          <b>v0.4.2</b> — switched TLS backend to OpenSSL · webhook retries · new EU region
        </div>
      </div>
    </div>
  );
}

// ---- Kitty ------------------------------------------------------------------
const KITTY_BASE = [
  { t: "$ ninja -C build", k: "cmd" },
  { t: "[12/14] clang++ -O2 -c src/bus.cc", k: "ok" },
  { t: "[13/14] clang++ -O2 -c src/vision.cc", k: "ok" },
  { t: "[14/14] LINK gnosis-engine  FAILED", k: "err" },
];

function KittyWindow({ extra = [], busy = false }) {
  return (
    <div className="gwin gwin--kitty" data-win="kitty" data-win-title="Kitty · build">
      <div className="gwin__bar gwin__bar--dark">
        <span className="gwin__dots"><i></i><i></i><i></i></span>
        <span className="gwin__title">kitty — ~/gnosis/build</span>
        <span className="gwin__meta num">zsh</span>
      </div>
      <div className="gwin__body term">
        {KITTY_BASE.map((l, i) => (
          <div className={`term__ln term__ln--${l.k}`} key={`b${i}`}>{l.t}</div>
        ))}
        <div className="term__blk" data-gx="term-error" data-gx-label="link error">
          <div className="term__ln term__ln--err">ld: undefined reference to `SSL_CTX_new`</div>
          <div className="term__ln term__ln--err">clang: error: linker command failed (exit 1)</div>
        </div>
        {extra.map((l, i) => (
          <div className={`term__ln term__ln--${l.k}${l.fresh ? " is-fresh" : ""}`} key={`x${i}`}>{l.t}</div>
        ))}
        <div className="term__ln term__ln--cmd">$ <span className={`term__caret${busy ? " is-busy" : ""}`}>▍</span></div>
      </div>
    </div>
  );
}

// ---- Code (appears during a granted FIX plan) -------------------------------
function CodeWindow({ open, applied }) {
  if (!open) return null;
  return (
    <ScalePop origin="center">
      <div className="gwin gwin--code" data-win="code" data-win-title="Code · flags.cmake">
        <div className="gwin__bar gwin__bar--dark">
          <span className="gwin__dots"><i></i><i></i><i></i></span>
          <span className="gwin__title">flags.cmake — gnosis-engine</span>
          <span className={`gwin__meta num${applied ? " is-saved" : ""}`}>{applied ? "saved" : "+1 −1"}</span>
        </div>
        <div className="gwin__body code">
          <div className="code__ln"><span className="num">16</span>set(CMAKE_CXX_STANDARD 20)</div>
          <div className="code__ln"><span className="num">17</span>find_package(OpenSSL REQUIRED)</div>
          <div className={`code__ln code__ln--minus${applied ? " is-gone" : ""}`} data-gx="diff-line" data-gx-label="patch line">
            <span className="num">18</span>set(ENGINE_LIBS crypto)
          </div>
          <div className={`code__ln code__ln--plus${applied ? " is-in" : ""}`}>
            <span className="num">18</span>set(ENGINE_LIBS crypto ssl)
          </div>
          <div className="code__ln"><span className="num">19</span>target_link_libraries(gnosis-engine ${"$"}{"{"}ENGINE_LIBS{"}"})</div>
        </div>
      </div>
    </ScalePop>
  );
}

Object.assign(window, { FirefoxWindow, KittyWindow, CodeWindow, GX_PLANS });
