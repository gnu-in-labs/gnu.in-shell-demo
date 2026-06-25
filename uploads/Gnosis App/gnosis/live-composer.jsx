/* global React, Sym, Spinner, StatusDot */
// ============================================================================
// gnosis/live-composer.jsx — the INTENT COMPOSER + the PLAN CONTRACT.
// The composer replaces the query box: it assembles {what you scoped} +
// {what you pointed at} + {what you said} into a verb the agent guesses.
// Enter runs the guess; clicking a verb steers it. Nothing here "sends" —
// intents are composed, then released.
// The PlanCard is the cursor-grant contract: deterministic steps, risk tags,
// explicit grant window, always-on revoke.
// ============================================================================
const { useEffect, useState } = React;

// ---- ComposerWave (listening) ----
function ComposerWave() {
  return (
    <span className="cwave" aria-hidden="true">
      {Array.from({ length: 9 }).map((_, i) => (
        <i key={i} style={{ animationDelay: `${(i % 5) * 110}ms` }}></i>
      ))}
    </span>
  );
}

// ---- ctx pill ----
function CtxPill({ glyph, kind, text, onClear }) {
  return (
    <span className={`ctx-pill ctx-pill--${kind}`}>
      <Sym size={12} fill={1}>{glyph}</Sym>
      <span className="ctx-pill__txt">{text}</span>
      {onClear && (
        <button type="button" className="ctx-pill__x" onClick={onClear} aria-label={`clear ${kind}`}>
          <Sym size={11}>close</Sym>
        </button>
      )}
    </span>
  );
}

// ---- IntentComposer ---------------------------------------------------------
function IntentComposer({ ctx, listening, verbs, guess, guessSrc, countdown, job, onVerb, onClear }) {
  const hasCtx = !!(ctx.region || ctx.point || ctx.voice);
  const show = hasCtx || listening || !!job;
  if (!show) return null;

  return (
    <div className="composer" data-screen-label="Intent composer">
      {job ? (
        <div className="composer__job">
          <Spinner size={14} stroke={2.2} />
          <span className="composer__job-verb">{job.label}</span>
          <span className="composer__job-sub">{job.sub}</span>
        </div>
      ) : (
        <>
          <div className="composer__ctx">
            <span className="composer__prompt">&gt;_</span>
            {ctx.region && <CtxPill glyph="crop_free" kind="region" text={ctx.region.label} onClear={() => onClear("region")} />}
            {ctx.point && <CtxPill glyph="my_location" kind="point" text={ctx.point.label} onClear={() => onClear("point")} />}
            {listening && (
              <span className="ctx-pill ctx-pill--voice is-live">
                <ComposerWave />
                <span className="ctx-pill__txt">listening…</span>
              </span>
            )}
            {!listening && ctx.voice && <CtxPill glyph="graphic_eq" kind="voice" text={`“${ctx.voice}”`} onClear={() => onClear("voice")} />}
          </div>

          <div className="composer__verbs">
            <span className="composer__arrow">→</span>
            {verbs.map((v) => {
              const isGuess = guess === v.id;
              return (
                <button
                  type="button"
                  key={v.id}
                  className={`verb${isGuess ? " is-guess" : ""}`}
                  onClick={() => onVerb(v.id)}
                  title={isGuess ? "enter ▸ run" : `run ${v.label}`}
                >
                  {isGuess && countdown != null && (
                    <span className="verb__count" style={{ transform: `scaleX(${Math.max(0, 1 - countdown)})` }}></span>
                  )}
                  <Sym size={14} fill={isGuess ? 1 : 0}>{v.glyph}</Sym>
                  <span>{v.label}</span>
                  {isGuess && <span className="verb__tag">{guessSrc === "voice" ? "heard" : "suggéré"}</span>}
                </button>
              );
            })}
          </div>

          <div className="composer__hint">{guess ? "enter ▸ run · esc ▸ clear" : "pick a verb · or hold space and say it"}</div>
        </>
      )}
    </div>
  );
}

// ---- PlanCard — the cursor-grant contract ------------------------------------
const RISK_LABEL = { safe: "safe", local: "local", system: "system" };

function PlanStep({ s, idx }) {
  return (
    <div className={`pstep pstep--${s.status}`}>
      <span className="pstep__mark">
        {s.status === "done" ? <Sym size={14} fill={1}>check_circle</Sym>
          : s.status === "run" ? <Spinner size={13} stroke={2.2} />
          : s.status === "paused" ? <Sym size={14} fill={1}>pause_circle</Sym>
          : <span className="pstep__n num">{idx + 1}</span>}
      </span>
      <span className="pstep__label">{s.label}</span>
      {s.needsCursor && <span className="pstep__cursor"><Sym size={12}>ads_click</Sym>cursor</span>}
      <span className={`pstep__risk pstep__risk--${s.risk}`}>{RISK_LABEL[s.risk]}</span>
    </div>
  );
}

function PlanCard({ plan, grantSec, onGrant, onDeny, onInterrupt, onResume, onPark }) {
  if (!plan) return null;
  const { steps, status, grantLeft } = plan;
  return (
    <div className={`plancard plancard--${status}`} data-screen-label="Plan contract">
      <div className="plancard__head">
        <span className="plancard__glyph">▸</span>
        <span className="plancard__title">{plan.title}</span>
        <span className="plancard__sub">{steps.length} steps · {steps.filter((s) => s.needsCursor).length} need cursor</span>
      </div>
      <div className="plancard__steps">
        {steps.map((s, i) => (<PlanStep s={s} idx={i} key={s.id} />))}
      </div>

      {status === "proposed" && (
        <div className="plancard__contract">
          <div className="plancard__terms">
            <Sym size={13} fill={1}>ads_click</Sym>
            <span>grant cursor · <b className="num">{grantSec}s</b> window · scope <b>kitty + code</b> · esc or move revokes</span>
          </div>
          <div className="plancard__btns">
            <button type="button" className="plancard__btn" onClick={onDeny}>park plan</button>
            <button type="button" className="plancard__btn is-grant" onClick={onGrant}>
              <Sym size={14} fill={1}>play_arrow</Sym>grant
            </button>
          </div>
        </div>
      )}

      {status === "running" && (
        <div className="plancard__contract is-running">
          <div className="plancard__grantbar">
            <span className="plancard__grantfill" style={{ transform: `scaleX(${Math.max(0, grantLeft / grantSec)})` }}></span>
          </div>
          <span className="plancard__grantleft num">{Math.ceil(grantLeft)}s</span>
          <button type="button" className="plancard__btn is-stop" onClick={onInterrupt}>
            <Sym size={14} fill={1}>front_hand</Sym>interrupt
          </button>
        </div>
      )}

      {status === "paused" && (
        <div className="plancard__contract">
          <div className="plancard__terms is-paused">
            <Sym size={13} fill={1}>front_hand</Sym>
            <span>cursor revoked · plan held at step {1 + steps.findIndex((s) => s.status === "paused")}</span>
          </div>
          <div className="plancard__btns">
            <button type="button" className="plancard__btn" onClick={onPark}>park → gnomon</button>
            <button type="button" className="plancard__btn is-grant" onClick={onResume}>
              <Sym size={14} fill={1}>resume</Sym>resume
            </button>
          </div>
        </div>
      )}

      {status === "done" && (
        <div className="plancard__contract">
          <div className="plancard__terms is-done">
            <Sym size={13} fill={1}>check_circle</Sym>
            <span>plan complete · cursor returned · logged to gnomon</span>
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { IntentComposer, PlanCard, ComposerWave });
