// syster-mini.jsx
// Syster Mini — front-facing 256×256 hero mascot (distinct from the tiny SysterGlyph).
// Profile de face : pas de béret, pas de side-plane, pas de vents. Coque terminal vue de face,
// antenne montée sur le coin supérieur droit, lampe-signal au bulbe.
// Four animated states: idle · listening · transmit · veille.

const MINI = {
  body:    '#FF6A00',
  screen:  '#111418',
  prompt:  '#F7F3ED',
  antenna: '#A1A6AD',
  bulb:    '#D7DADF',
};

// state ∈ 'idle' | 'listening' | 'transmit' | 'veille'
function SysterMini({ size = 256, state = 'idle', play = true }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!play || reduce) { try { svg.pauseAnimations(); svg.setCurrentTime(state === 'idle' ? 0 : 0.4); } catch (e) {} }
    else { try { svg.unpauseAnimations(); } catch (e) {} }
  }, [play, state]);

  const sleeping = state === 'veille';
  const active = state === 'listening' || state === 'transmit';

  return (
    <svg ref={ref} width={size} height={size} viewBox="0 0 256 256" style={{ flexShrink: 0, overflow: 'visible' }} aria-label={`syster mini ${state}`}>
      {/* ground shadow — breathes opposite the bob */}
      <ellipse cx="128" cy="232" rx="64" ry="6" fill="#000" opacity={sleeping ? 0.28 : 0.24}>
        {play && <animate attributeName="rx" values="64;60;64" dur="3.2s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1" keyTimes="0;0.5;1" />}
      </ellipse>

      {/* bob group — gentle float */}
      <g>
        {play && (
          <animateTransform attributeName="transform" type="translate"
            values={sleeping ? '0 0;0 -2.5;0 0' : '0 0;0 -4;0 0'}
            dur={sleeping ? '4.4s' : '3.2s'} repeatCount="indefinite"
            calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1" keyTimes="0;0.5;1" />
        )}

        {/* antenna — mounted on the top-right of the shell; signal lamp at the bulb */}
        <g>
          <line x1="200" y1="84" x2="200" y2="46" stroke={MINI.antenna} strokeWidth="5" strokeLinecap="round" />
          {active && (
            <circle cx="200" cy="42" r="12" fill={MINI.body} opacity="0.22">
              {play && <animate attributeName="opacity" values="0.05;0.28;0.05" dur="1.1s" repeatCount="indefinite" />}
            </circle>
          )}
          <circle cx="200" cy="42" r="6" fill={active ? MINI.body : MINI.bulb}>
            {play && active &&
              <animate attributeName="r" values="6;8;6" dur="1.1s" repeatCount="indefinite" />}
          </circle>
          <circle cx="198" cy="40" r="1.6" fill="#FFFFFF" opacity="0.75" />
        </g>

        {/* shell body — front face */}
        <rect x="48" y="84" width="148" height="148" rx="22" fill={MINI.body} />

        {/* terminal screen — in veille the display is fully OFF (black, no prompt) */}
        <rect x="62" y="100" width="120" height="116" rx="12" fill={sleeping ? '#000' : MINI.screen} />

        {/* prompt — chevron + cursor. Hidden entirely in veille (screen is off). */}
        {!sleeping && (
          <g>
            <polyline points="92,138 112,158 92,178" fill="none" stroke={MINI.prompt} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
            {state === 'transmit' ? (
              <g fill={MINI.prompt}>
                {[118, 133, 148].map((cx, i) => (
                  <circle key={cx} cx={cx} cy="190" r="5">
                    {play && <animate attributeName="opacity" values="0.2;1;0.2" dur="1.2s" begin={`${i * 0.2}s`} repeatCount="indefinite" />}
                  </circle>
                ))}
              </g>
            ) : (
              <line x1="118" y1="190" x2="148" y2="190" stroke={MINI.prompt} strokeWidth="10" strokeLinecap="round">
                {play && <animate attributeName="opacity" values="1;1;0;0;1" dur="1.6s" repeatCount="indefinite" keyTimes="0;0.45;0.5;0.95;1" />}
              </line>
            )}
          </g>
        )}

        {/* ── STATE: listening — signal arcs radiating from the antenna bulb ── */}
        {state === 'listening' && (
          <g fill="none" stroke={MINI.body} strokeWidth="4" strokeLinecap="round">
            <path d="M218 30 q12 14 0 28">
              {play && <animate attributeName="opacity" values="0;1;0" dur="1.6s" repeatCount="indefinite" keyTimes="0;0.4;1" />}
            </path>
            <path d="M232 22 q22 22 0 44" opacity="0.55">
              {play && <animate attributeName="opacity" values="0;0.55;0" dur="1.6s" begin="0.25s" repeatCount="indefinite" keyTimes="0;0.4;1" />}
            </path>
          </g>
        )}

        {/* ── STATE: transmit — sonar rings broadcast from the antenna tip ── */}
        {state === 'transmit' && (
          <g fill="none" stroke={MINI.body} strokeWidth="3">
            <circle cx="200" cy="42" r="8">
              {play && <>
                <animate attributeName="r" values="8;60" dur="1.7s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.85;0" dur="1.7s" repeatCount="indefinite" />
              </>}
            </circle>
            <circle cx="200" cy="42" r="8">
              {play && <>
                <animate attributeName="r" values="8;60" dur="1.7s" begin="0.85s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.85;0" dur="1.7s" begin="0.85s" repeatCount="indefinite" />
              </>}
            </circle>
          </g>
        )}

        {/* ── STATE: veille — sleep z's emitted from the antenna bulb (~200,42), drifting up-left ── */}
        {state === 'veille' && (
          <g fill={MINI.prompt} fontFamily="ui-monospace, monospace" fontWeight="700">
            <text x="190" y="40" fontSize="15">
              z
              {play && <>
                <animate attributeName="opacity" values="0;0.85;0" dur="2.8s" repeatCount="indefinite" />
                <animateTransform attributeName="transform" type="translate" values="0 0;-10 -16" dur="2.8s" repeatCount="indefinite" />
              </>}
            </text>
            <text x="194" y="34" fontSize="22">
              Z
              {play && <>
                <animate attributeName="opacity" values="0;0.9;0" dur="2.8s" begin="0.7s" repeatCount="indefinite" />
                <animateTransform attributeName="transform" type="translate" values="0 0;-16 -28" dur="2.8s" begin="0.7s" repeatCount="indefinite" />
              </>}
            </text>
          </g>
        )}
      </g>
    </svg>
  );
}

Object.assign(window, { SysterMini, MINI });
