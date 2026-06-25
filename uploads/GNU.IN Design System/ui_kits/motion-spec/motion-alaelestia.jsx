// motion-alaelestia.jsx
// Section blob.in (ex-alaelestia) pour la Motion Spec :
//   ∞.6 · Proxy SVG du moteur de formes organiques
//   ∞.7 · Engine 4.0 · migration C++ → Rust/cxx

/* ════════════════════════════════════════════════════════════════════
   Données
   ════════════════════════════════════════════════════════════════════ */

const BLOB_ATOMS = [
  {
    name: 'BlobShape',
    file: 'blobshape.cpp / .hpp',
    size: '16 335 / 2 538 bytes',
    role: 'Atome central · résoud la forme finale par composition des primitives. Applique BlobMaterial (couleur/opacité) et BlobGroup (transform parent).',
    props: ['radius: real', 'inverted: bool', 'material: BlobMaterial', 'group: BlobGroup'],
    svgProxy: 'SVG <ellipse> + clip-path animé via CSS cubic-bezier',
  },
  {
    name: 'BlobRect',
    file: 'blobrect.cpp / .hpp',
    size: '7 950 / 3 940 bytes',
    role: 'Rectangle avec coins organiques variables (pas un border-radius uniforme). Chaque coin a son propre rayon — permet des formes asymétriques fluides.',
    props: ['topLeft: real', 'topRight: real', 'bottomLeft: real', 'bottomRight: real', 'width, height: real'],
    svgProxy: 'SVG <path> avec 4 arcs Bézier indépendants',
  },
  {
    name: 'BlobInvertedRect',
    file: 'blobinvertedrect.cpp / .hpp',
    size: '5 587 / 1 478 bytes',
    role: 'BlobRect en négatif (coupe dans le parent). Utilisé pour les concavités du mascot — les creux entre les bras, les yeux enfoncés.',
    props: ['topLeft: real', 'topRight: real', 'bottomLeft: real', 'bottomRight: real'],
    svgProxy: 'SVG <clipPath> + <path> inversé',
  },
  {
    name: 'BlobGroup',
    file: 'blobgroup.cpp / .hpp',
    size: '2 898 / 1 306 bytes',
    role: 'Conteneur de transformation (translate + scale + rotate). Permet d\'animer un sous-arbre de BlobShapes en bloc — e.g. bouger les deux yeux ensemble.',
    props: ['x, y: real', 'scaleX, scaleY: real', 'rotation: real'],
    svgProxy: 'SVG <g transform="translate(…) scale(…)">',
  },
  {
    name: 'BlobMaterial',
    file: 'blobmaterial.cpp / .hpp',
    size: '3 476 / 1 688 bytes',
    role: 'Surface du blob : couleur de base, opacité, gradient radial optionnel, bruit de texture (ShaderEffect). Le "peau" du mascot.',
    props: ['color: color', 'opacity: real', 'gradient: bool', 'noiseScale: real'],
    svgProxy: 'SVG fill + feGaussianBlur/feTurbulence filter approximé',
  },
];

const PROXY_TABLE = [
  { aspect: 'Mascot idle',        cpp: 'BlobShape + BlobGroup + BlobMaterial · 60 fps GPU',       svg: '<ellipse> + <g> + CSS animation',           delta: 'Bruit de texture absent · coins moins organiques' },
  { aspect: 'Mascot listening',   cpp: 'BlobRect coins asymétriques · SpringAnimation',            svg: 'border-radius: 60% 40% 40% 60% CSS animé',   delta: 'Asymétrie simplifiée · pas de SpringAnimation' },
  { aspect: 'Mascot transmit',    cpp: 'BlobInvertedRect pour les creux · MultiEffect blur',       svg: 'clip-path polygon approximé',                 delta: 'Creux moins précis · blur absent' },
  { aspect: 'Mascot veille',      cpp: 'BlobGroup.opacity 0.3 + BlobMaterial.noise bas',          svg: 'opacity: 0.35 CSS',                           delta: 'Fidèle pour le design · noise absent' },
  { aspect: 'Contour mascot',     cpp: 'BlobShape.inverted: false · stroke via BlobMaterial',     svg: 'SVG stroke-width',                            delta: 'Identique visuellement' },
  { aspect: 'Formes radiales ★',  cpp: 'N × BlobRect en BubbleBloom (M.12) · Spring stagger',    svg: 'N × <circle> CSS spring approximé',           delta: 'Spring exact absent · stagger ok' },
];

const REPO_NOTE = {
  repo:     'gnu-in-labs/blob.in  (ex-gnuin-alaelestia-component)',
  embedded: 'gnu.in-shell/components/blob.in/  (ex-a-laelestia)',
  rust:     'blobin-core (crate) · lyon · cxx + cxx-qt · cible 4.0',
  cpp:      'blobin-qt (shim QSG <300 LoC) · second moteur / fallback',
};

/* ════════════════════════════════════════════════════════════════════
   Composant SVG proxy — représente visuellement un blob organique
   sans le moteur C++
   ════════════════════════════════════════════════════════════════════ */

function BlobProxyViz({ state = 'idle', size = 120 }) {
  const s = size;
  const variants = {
    idle: {
      path: `M ${s*0.5} ${s*0.12} C ${s*0.8} ${s*0.08}, ${s*0.95} ${s*0.3}, ${s*0.92} ${s*0.55} C ${s*0.9} ${s*0.78}, ${s*0.72} ${s*0.92}, ${s*0.5} ${s*0.9} C ${s*0.28} ${s*0.88}, ${s*0.1} ${s*0.75}, ${s*0.08} ${s*0.52} C ${s*0.06} ${s*0.28}, ${s*0.22} ${s*0.16}, ${s*0.5} ${s*0.12} Z`,
      fill: '#F7F3ED', label: 'idle', dur: '4s',
    },
    listening: {
      path: `M ${s*0.5} ${s*0.08} C ${s*0.76} ${s*0.06}, ${s*0.96} ${s*0.28}, ${s*0.94} ${s*0.52} C ${s*0.92} ${s*0.76}, ${s*0.7} ${s*0.94}, ${s*0.44} ${s*0.92} C ${s*0.22} ${s*0.9}, ${s*0.04} ${s*0.72}, ${s*0.06} ${s*0.48} C ${s*0.08} ${s*0.24}, ${s*0.24} ${s*0.1}, ${s*0.5} ${s*0.08} Z`,
      fill: '#FF6A00', label: 'listening', dur: '2s',
    },
    transmit: {
      path: `M ${s*0.5} ${s*0.06} C ${s*0.82} ${s*0.06}, ${s*0.96} ${s*0.32}, ${s*0.92} ${s*0.58} C ${s*0.88} ${s*0.82}, ${s*0.68} ${s*0.96}, ${s*0.5} ${s*0.94} C ${s*0.32} ${s*0.92}, ${s*0.12} ${s*0.8}, ${s*0.08} ${s*0.56} C ${s*0.04} ${s*0.3}, ${s*0.18} ${s*0.06}, ${s*0.5} ${s*0.06} Z`,
      fill: '#5F7F52', label: 'transmit', dur: '1.2s',
    },
    veille: {
      path: `M ${s*0.5} ${s*0.16} C ${s*0.74} ${s*0.14}, ${s*0.88} ${s*0.34}, ${s*0.86} ${s*0.54} C ${s*0.84} ${s*0.74}, ${s*0.68} ${s*0.88}, ${s*0.5} ${s*0.86} C ${s*0.32} ${s*0.84}, ${s*0.16} ${s*0.72}, ${s*0.14} ${s*0.52} C ${s*0.12} ${s*0.32}, ${s*0.26} ${s*0.18}, ${s*0.5} ${s*0.16} Z`,
      fill: '#2B3037', label: 'veille', dur: '6s',
    },
  };
  const v = variants[state] || variants.idle;
  const id = `blob-${state}-${size}`;
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{ display: 'block' }}>
      <defs>
        <filter id={`blur-${id}`}>
          <feGaussianBlur stdDeviation="1.5" />
        </filter>
        <radialGradient id={`grad-${id}`} cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>
      {/* Shadow */}
      <path d={v.path} fill="rgba(0,0,0,0.25)" filter={`url(#blur-${id})`} transform={`translate(3,5)`} opacity={state === 'veille' ? 0.15 : 0.4} />
      {/* Body */}
      <path d={v.path} fill={v.fill} opacity={state === 'veille' ? 0.35 : 1}>
        <animate attributeName="d" values={`${v.path};${v.path.replace(/0\.5/g, '0.51').replace(/0\.92/g,'0.91')};${v.path}`} dur={v.dur} repeatCount="indefinite" />
      </path>
      {/* Gradient overlay */}
      <path d={v.path} fill={`url(#grad-${id})`} opacity={0.6} />
      {/* Eyes (idle/listening) */}
      {(state === 'idle' || state === 'listening') && (
        <>
          <circle cx={s * 0.38} cy={s * 0.44} r={s * 0.055} fill={state === 'listening' ? '#1A0A00' : '#111418'} />
          <circle cx={s * 0.62} cy={s * 0.44} r={s * 0.055} fill={state === 'listening' ? '#1A0A00' : '#111418'} />
          <circle cx={s * 0.4} cy={s * 0.42} r={s * 0.018} fill="rgba(255,255,255,0.7)" />
          <circle cx={s * 0.64} cy={s * 0.42} r={s * 0.018} fill="rgba(255,255,255,0.7)" />
        </>
      )}
      {/* Transmit glyph */}
      {state === 'transmit' && (
        <text x={s * 0.5} y={s * 0.56} textAnchor="middle" fontSize={s * 0.24} fill="#F7F3ED" fontFamily="ui-monospace,monospace" fontWeight="700">TX</text>
      )}
      {/* Label */}
      <text x={s * 0.5} y={s - 4} textAnchor="middle" fontSize={9} fill="rgba(247,243,237,0.45)" fontFamily="ui-monospace,monospace" letterSpacing="0.08em">{v.label.toUpperCase()}</text>
    </svg>
  );
}

/* ════════════════════════════════════════════════════════════════════
   Board ∞.6 · Alaelestia
   ════════════════════════════════════════════════════════════════════ */

function MotionAlaelestia() {
  const [activeAtom, setActiveAtom] = React.useState(0);
  const atom = BLOB_ATOMS[activeAtom];

  return (
    <FitScale w={1280} h={720} background="#0B0D10">
      <div style={{
        width: 1280, height: 720, background: '#0B0D10', color: '#F7F3ED',
        padding: 52, boxSizing: 'border-box', overflow: 'auto',
        fontFamily: 'ui-sans-serif, system-ui, sans-serif', position: 'relative',
      }}>
        <DitherBg color="#FF6A00" opacity={0.05} />
        <GrainBg opacity={0.06} />
        <div style={{ position: 'relative' }}>

          {/* Header */}
          <div style={{ fontSize: 10, color: '#FF6A00', fontWeight: 700, letterSpacing: '0.18em', fontFamily: 'ui-monospace, monospace' }}>∞.6 · BLOB.IN · PROXY SVG DU MOTEUR DE FORMES ORGANIQUES</div>
          <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em', marginTop: 4 }}>Ce que la spec dessine — et ce que blob.in rend.</div>
          <div style={{ fontSize: 13, color: 'rgba(247,243,237,.6)', marginTop: 4, maxWidth: 900, lineHeight: 1.55 }}>
            Toutes les formes organiques de Gnu.In-Shell — mascot, radials, bubbles — sont rendues par <span style={{ color: '#FF6A00', fontWeight: 600 }}>blob.in</span> (ex-alaelestia). Aujourd'hui un moteur C++/Qt ; en <span style={{ color: '#3D8DCC', fontWeight: 600 }}>4.0</span> le calcul passe en <span style={{ color: '#CE8E3F', fontWeight: 600 }}>Rust</span> (cf. ∞.7). Notre spec utilise des <span style={{ color: '#5F7F52', fontWeight: 600 }}>proxies SVG</span> : fidèles visuellement, sans dépendance GPU. Ce board documente l'écart · ∞.7 documente la bascule moteur.
          </div>

          <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

            {/* Left — Blob atoms */}
            <div>
              <div style={{ fontSize: 10, color: '#FF6A00', fontWeight: 700, letterSpacing: '0.14em', fontFamily: 'ui-monospace, monospace', marginBottom: 10 }}>5 ATOMES — blob.in/atoms/Blobs/ · C++ aujourd'hui → Rust 4.0</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                {BLOB_ATOMS.map((a, i) => (
                  <button key={a.name} onClick={() => setActiveAtom(i)} style={{
                    border: 'none', cursor: 'pointer', padding: '6px 12px', borderRadius: 5,
                    background: i === activeAtom ? '#FF6A00' : 'rgba(247,243,237,.07)',
                    color: i === activeAtom ? '#1A0A00' : '#F7F3ED',
                    fontFamily: 'ui-monospace, monospace', fontSize: 10.5, fontWeight: 700,
                  }}>{a.name}</button>
                ))}
              </div>

              {/* Atom detail card */}
              <div style={{ background: '#15181C', borderRadius: 10, border: '.5px solid rgba(247,243,237,.08)', padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, fontFamily: 'ui-monospace, monospace', color: '#FF6A00' }}>{atom.name}</div>
                    <div style={{ fontSize: 10, color: 'rgba(247,243,237,.45)', fontFamily: 'ui-monospace, monospace', marginTop: 3 }}>{atom.file} · {atom.size}</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, lineHeight: 1.6, color: 'rgba(247,243,237,.8)', marginBottom: 12 }}>{atom.role}</div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 10, color: '#5F7F52', fontFamily: 'ui-monospace, monospace', fontWeight: 700, letterSpacing: '0.12em', marginBottom: 6 }}>PROPS</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {atom.props.map((p) => (
                      <span key={p} style={{ fontSize: 10.5, fontFamily: 'ui-monospace, monospace', color: 'rgba(247,243,237,.7)', background: 'rgba(247,243,237,.06)', padding: '3px 8px', borderRadius: 3 }}>{p}</span>
                    ))}
                  </div>
                </div>
                <div style={{ padding: '10px 12px', background: 'rgba(95,127,82,.08)', border: '.5px solid rgba(95,127,82,.25)', borderRadius: 6, fontSize: 11, fontFamily: 'ui-monospace, monospace' }}>
                  <span style={{ color: '#5F7F52', fontWeight: 700, letterSpacing: '0.1em', fontSize: 9, marginRight: 8 }}>SVG PROXY</span>
                  <span style={{ color: 'rgba(247,243,237,.7)' }}>{atom.svgProxy}</span>
                </div>
              </div>

              {/* Repo note */}
              <div style={{ marginTop: 12, padding: '12px 16px', background: '#15181C', borderRadius: 8, border: '.5px solid rgba(247,243,237,.06)', fontSize: 11, fontFamily: 'ui-monospace, monospace' }}>
                <div style={{ color: '#FF6A00', fontWeight: 700, letterSpacing: '0.12em', fontSize: 9, marginBottom: 8 }}>REPOS</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {Object.entries(REPO_NOTE).map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', gap: 10 }}>
                      <span style={{ color: 'rgba(247,243,237,.4)', minWidth: 80 }}>{k}</span>
                      <span style={{ color: 'rgba(247,243,237,.75)' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right — Proxy comparison */}
            <div>
              <div style={{ fontSize: 10, color: '#5F7F52', fontWeight: 700, letterSpacing: '0.14em', fontFamily: 'ui-monospace, monospace', marginBottom: 10 }}>PROXY SVG — FIDÉLITÉ PAR ÉTAT MASCOT</div>

              {/* Mascot states visualization */}
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', padding: '16px', background: '#15181C', borderRadius: 10, border: '.5px solid rgba(247,243,237,.06)', marginBottom: 12 }}>
                {['idle','listening','transmit','veille'].map((st) => (
                  <div key={st} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <BlobProxyViz state={st} size={100} />
                  </div>
                ))}
              </div>

              {/* Delta table */}
              <div style={{ background: '#15181C', borderRadius: 10, border: '.5px solid rgba(247,243,237,.06)', overflow: 'hidden' }}>
                <div style={{ padding: '10px 14px', borderBottom: '.5px solid rgba(247,243,237,.06)', fontSize: 10, fontFamily: 'ui-monospace, monospace', fontWeight: 700, letterSpacing: '0.12em', color: '#FF6A00' }}>DELTA C++ vs SVG PROXY</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10.5 }}>
                  <thead>
                    <tr style={{ borderBottom: '.5px solid rgba(247,243,237,.08)' }}>
                      {['aspect','runtime C++','SVG proxy','delta'].map((h) => (
                        <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontFamily: 'ui-monospace, monospace', fontSize: 9.5, letterSpacing: '0.1em', fontWeight: 700, color: 'rgba(247,243,237,.45)', textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {PROXY_TABLE.map((row, i) => (
                      <tr key={i} style={{ borderBottom: '.5px solid rgba(247,243,237,.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(247,243,237,.02)' }}>
                        <td style={{ padding: '7px 12px', fontFamily: 'ui-monospace, monospace', fontWeight: 600, color: '#FF6A00', whiteSpace: 'nowrap', verticalAlign: 'top' }}>{row.aspect}</td>
                        <td style={{ padding: '7px 12px', color: 'rgba(247,243,237,.65)', lineHeight: 1.4, verticalAlign: 'top' }}>{row.cpp}</td>
                        <td style={{ padding: '7px 12px', color: '#5F7F52', lineHeight: 1.4, verticalAlign: 'top' }}>{row.svg}</td>
                        <td style={{ padding: '7px 12px', color: 'rgba(247,243,237,.45)', lineHeight: 1.4, verticalAlign: 'top', fontStyle: 'italic' }}>{row.delta}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FitScale>
  );
}

Object.assign(window, { MotionAlaelestia });

/* ════════════════════════════════════════════════════════════════════
   ∞.7 · Engine 4.0 — migration C++ → Rust/cxx
   Schéma d'archi · frontière hybride cxx/cxx-qt · split par atome ·
   progression LoC Rust par phase.
   ════════════════════════════════════════════════════════════════════ */

const RUST = '#CE8E3F';   // rust/ochre
const CPP  = '#3D8DCC';   // C++ blue
const OK   = '#5F7F52';

const ATOM_SPLIT = [
  { name: 'BlobShape',        kb: 16, rust: 100, note: 'trait Blob + compose · blob.rs' },
  { name: 'BlobRect',         kb: 8,  rust: 100, note: 'RectBlob 4 rayons Bézier' },
  { name: 'BlobInvertedRect', kb: 5.5, rust: 100, note: 'Inverted<RectBlob> · combinateur' },
  { name: 'BlobGroup',        kb: 3,  rust: 100, note: 'group.rs · glam affine' },
  { name: 'BlobMaterial',     kb: 3.5, rust: 70,  note: 'math Rust · QSGMaterialShader reste Qt' },
];

const PHASES = [
  { id: 'P0', name: 'Pont',       loc: 8,  gate: 'BlobRect traverse cxx · golden-diff < 1 px' },
  { id: 'P1', name: 'Géométrie',  loc: 50, gate: '5 atomes rendus Rust · parité statique 100 %' },
  { id: 'P2', name: 'Solveurs',   loc: 70, gate: 'M.01–M.12 · tokens unifiés · courbes au 1/100e' },
  { id: 'P3', name: 'Matériaux',  loc: 82, gate: 'gradient + noise Rust · parité matière' },
  { id: 'P4', name: 'États + réactivité', loc: 90, gate: 'pool Rust · C++ < 300 LoC · budget frame ≤ v3.1' },
  { id: 'P5', name: 'Bascule',    loc: 90, gate: 'défaut rust · cpp = fallback · readiness verte' },
];

function MotionEngine40() {
  const [phase, setPhase] = React.useState(0);
  const p = PHASES[phase];

  return (
    <FitScale w={1280} h={720} background="#0B0D10">
      <div style={{
        width: 1280, height: 720, background: '#0B0D10', color: '#F7F3ED',
        padding: 52, boxSizing: 'border-box', overflow: 'auto',
        fontFamily: 'ui-sans-serif, system-ui, sans-serif', position: 'relative',
      }}>
        <DitherBg color={RUST} opacity={0.05} />
        <GrainBg opacity={0.06} />
        <div style={{ position: 'relative' }}>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 10, color: RUST, fontWeight: 700, letterSpacing: '0.18em', fontFamily: 'ui-monospace, monospace' }}>∞.7 · ENGINE 4.0 · MIGRATION C++ → RUST / CXX</div>
              <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em', marginTop: 4 }}>Le calcul en Rust, le rendu en Qt.</div>
              <div style={{ fontSize: 13, color: 'rgba(247,243,237,.6)', marginTop: 4, maxWidth: 760, lineHeight: 1.5 }}>
                Géométrie, tessellation, solveurs et états passent en <span style={{ color: RUST, fontWeight: 600 }}>blobin-core</span> (Rust). Le C++ se réduit à un shim de scène-graphe <span style={{ color: CPP, fontWeight: 600 }}>blobin-qt</span> — réactif, jamais proactif. Cible : <span style={{ color: RUST, fontWeight: 600 }}>≥ 90 % LoC Rust</span>.
              </div>
            </div>
            <div style={{ flexShrink: 0, padding: '10px 14px', background: 'rgba(206,142,63,.08)', border: `.5px solid ${RUST}55`, borderRadius: 8, fontSize: 10.5, maxWidth: 230, lineHeight: 1.5 }}>
              <div style={{ color: RUST, fontFamily: 'ui-monospace, monospace', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 5 }}>NON-NÉGOCIABLES</div>
              <div style={{ color: 'rgba(247,243,237,.75)' }}>① qualité visuelle · ② versatilité · ③ réactivité — aucun sacrifié (cf. plan §2).</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 16 }}>

            {/* Left — Architecture schema */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Rust layer */}
              <div style={{ background: '#15181C', border: `.5px solid ${RUST}44`, borderRadius: 10, padding: 16, position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: 12, fontFamily: 'ui-monospace, monospace', fontWeight: 700, color: RUST }}>blobin-core <span style={{ color: 'rgba(247,243,237,.4)', fontWeight: 400 }}>· crate Rust</span></span>
                  <span style={{ fontSize: 9, padding: '2px 8px', background: RUST, color: '#1A0A00', borderRadius: 3, fontFamily: 'ui-monospace, monospace', fontWeight: 700, letterSpacing: '0.08em' }}>~90 % LoC</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {[
                    ['blob.rs', 'formes · trait Blob'],
                    ['tessellate.rs', 'path→tris · lyon'],
                    ['solve.rs', 'spring/easing · tokens'],
                    ['material.rs', 'couleur/gradient/noise'],
                    ['group.rs', 'affine 2D · glam'],
                    ['state.rs', 'idle/listening/…'],
                  ].map(([f, d]) => (
                    <div key={f} style={{ background: 'rgba(206,142,63,.06)', borderRadius: 5, padding: '7px 10px' }}>
                      <div style={{ fontSize: 11, fontFamily: 'ui-monospace, monospace', color: RUST, fontWeight: 600 }}>{f}</div>
                      <div style={{ fontSize: 10, color: 'rgba(247,243,237,.5)', marginTop: 1 }}>{d}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bridge */}
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1, background: 'rgba(206,142,63,.07)', border: `.5px solid ${RUST}33`, borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontSize: 10, fontFamily: 'ui-monospace, monospace', fontWeight: 700, color: RUST, letterSpacing: '0.06em', marginBottom: 3 }}>cxx BRUT · chemin chaud</div>
                  <div style={{ fontSize: 10.5, color: 'rgba(247,243,237,.65)', lineHeight: 1.4 }}>Vec&lt;Vertex&gt; plat + indices · 1×/frame sale · zéro QObject</div>
                </div>
                <div style={{ flex: 1, background: 'rgba(61,141,204,.07)', border: `.5px solid ${CPP}33`, borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontSize: 10, fontFamily: 'ui-monospace, monospace', fontWeight: 700, color: CPP, letterSpacing: '0.06em', marginBottom: 3 }}>cxx-qt · surface froide</div>
                  <div style={{ fontSize: 10.5, color: 'rgba(247,243,237,.65)', lineHeight: 1.4 }}>états + props QML · binding tweaks-panel</div>
                </div>
              </div>

              <div style={{ textAlign: 'center', fontSize: 16, color: 'rgba(247,243,237,.3)', lineHeight: 1 }}>↓</div>

              {/* C++ layer */}
              <div style={{ background: '#15181C', border: `.5px solid ${CPP}44`, borderRadius: 10, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: 12, fontFamily: 'ui-monospace, monospace', fontWeight: 700, color: CPP }}>blobin-qt <span style={{ color: 'rgba(247,243,237,.4)', fontWeight: 400 }}>· shim C++ · second moteur</span></span>
                  <span style={{ fontSize: 9, padding: '2px 8px', background: CPP, color: '#fff', borderRadius: 3, fontFamily: 'ui-monospace, monospace', fontWeight: 700, letterSpacing: '0.08em' }}>&lt; 300 LoC</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 11, fontFamily: 'ui-monospace, monospace', color: 'rgba(247,243,237,.7)' }}>
                  <div><span style={{ color: CPP }}>BlobInItem::updatePaintNode()</span> — seul chemin chaud · appelle Rust, upload QSGGeometryNode</div>
                  <div><span style={{ color: CPP }}>BlobInMaterial : QSGMaterial</span> — params depuis Rust · shader RHI (.qsb) = data</div>
                  <div style={{ color: 'rgba(247,243,237,.45)' }}>RHI Vulkan/Metal/D3D primaire · GL legacy fallback</div>
                </div>
              </div>
              <div style={{ textAlign: 'center', fontSize: 10, color: 'rgba(247,243,237,.35)', fontFamily: 'ui-monospace, monospace', letterSpacing: '0.1em' }}>↓ Qt Scene Graph → GPU (inchangé vs v3.1)</div>
            </div>

            {/* Right — atom split + phase progression */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Atom split bars */}
              <div>
                <div style={{ fontSize: 10, color: RUST, fontWeight: 700, letterSpacing: '0.14em', fontFamily: 'ui-monospace, monospace', marginBottom: 10 }}>SPLIT PAR ATOME · % RUST</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {ATOM_SPLIT.map((a) => (
                    <div key={a.name}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 3 }}>
                        <span style={{ fontSize: 11.5, fontFamily: 'ui-monospace, monospace', color: '#F7F3ED', fontWeight: 600 }}>{a.name} <span style={{ color: 'rgba(247,243,237,.35)', fontWeight: 400 }}>{a.kb} KB</span></span>
                        <span style={{ fontSize: 11, fontFamily: 'ui-monospace, monospace', color: a.rust === 100 ? OK : RUST, fontWeight: 700 }}>{a.rust}%</span>
                      </div>
                      <div style={{ height: 8, borderRadius: 4, background: 'rgba(61,141,204,.18)', overflow: 'hidden', position: 'relative' }}>
                        <div style={{ width: `${a.rust}%`, height: '100%', background: a.rust === 100 ? OK : RUST, borderRadius: 4 }} />
                      </div>
                      <div style={{ fontSize: 9.5, color: 'rgba(247,243,237,.45)', marginTop: 2, fontFamily: 'ui-monospace, monospace' }}>{a.note}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 8, fontSize: 10, color: 'rgba(247,243,237,.5)', fontFamily: 'ui-monospace, monospace', display: 'flex', gap: 14 }}>
                  <span><span style={{ color: OK }}>■</span> 100 % Rust</span>
                  <span><span style={{ color: RUST }}>■</span> Rust + shim Qt</span>
                  <span><span style={{ color: CPP }}>■</span> reste C++</span>
                </div>
              </div>

              {/* Phase progression */}
              <div style={{ background: '#15181C', borderRadius: 10, border: '.5px solid rgba(247,243,237,.08)', padding: 16 }}>
                <div style={{ fontSize: 10, color: RUST, fontWeight: 700, letterSpacing: '0.14em', fontFamily: 'ui-monospace, monospace', marginBottom: 12 }}>PROGRESSION LoC RUST · 6 PHASES</div>
                {/* Phase pills */}
                <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                  {PHASES.map((ph, i) => (
                    <button key={ph.id} onClick={() => setPhase(i)} style={{
                      flex: 1, border: 'none', cursor: 'pointer', padding: '6px 0', borderRadius: 4,
                      background: i === phase ? RUST : 'rgba(247,243,237,.07)',
                      color: i === phase ? '#1A0A00' : '#F7F3ED',
                      fontFamily: 'ui-monospace, monospace', fontSize: 10, fontWeight: 700,
                    }}>{ph.id}</button>
                  ))}
                </div>
                {/* Big LoC bar */}
                <div style={{ height: 28, borderRadius: 6, background: 'rgba(61,141,204,.16)', overflow: 'hidden', position: 'relative', marginBottom: 6 }}>
                  <div style={{ width: `${p.loc}%`, height: '100%', background: `linear-gradient(90deg, ${RUST}, ${OK})`, borderRadius: 6, transition: 'width .35s cubic-bezier(.2,.8,.2,1)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#1A0A00', fontFamily: 'ui-monospace, monospace', paddingRight: 10 }}>{p.loc}%</span>
                  </div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{p.id} · {p.name}</div>
                <div style={{ fontSize: 11, color: 'rgba(247,243,237,.6)', lineHeight: 1.5, fontFamily: 'ui-monospace, monospace' }}>
                  <span style={{ color: OK, fontWeight: 700, letterSpacing: '0.08em', fontSize: 9, marginRight: 6 }}>GATE</span>{p.gate}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FitScale>
  );
}

Object.assign(window, { MotionEngine40 });

/* ════════════════════════════════════════════════════════════════════
   ∞.8 · Readiness — P5 gate before flipping rust-default
   Phase ladder P0→P5 + the 10 readiness gates (auto/manual) from
   blob.in/readiness.md, with the flip + rollback contract.
   ════════════════════════════════════════════════════════════════════ */

const PHASE_LADDER = [
  { id: 'P0', name: 'Pont',      done: true },
  { id: 'P1', name: 'Géométrie', done: true },
  { id: 'P2', name: 'Solveurs',  done: true },
  { id: 'P3', name: 'Matière',   done: true },
  { id: 'P4', name: 'Pool + backend', done: true },
  { id: 'P5', name: 'Readiness', done: false, active: true },
];

const GATES = [
  { id: 'R1',  label: 'Tokens en sync',           how: 'just check-tokens',                  auto: true,  green: true },
  { id: 'R2',  label: 'Tests workspace',          how: 'cargo test --workspace',             auto: true,  green: true },
  { id: 'R3',  label: 'Threaded == séquentiel',   how: '--features threaded-solver',         auto: true,  green: true },
  { id: 'R4',  label: 'Parité matière',           how: 'cargo test -p blobin-golden',        auto: true,  green: true },
  { id: 'R5',  label: 'Shim C++ ≤ 300 LoC',       how: 'loc-guard.sh · 205 LoC',             auto: true,  green: true },
  { id: 'R6',  label: 'No unsafe hors ffi.rs',    how: 'no-unsafe.sh',                       auto: true,  green: true },
  { id: 'R7',  label: 'Budget frame ≤ v3.1',      how: 'bench low-end GPU',                  auto: false, green: false },
  { id: 'R8',  label: 'Shader GPU == goldens',    how: 'software-RHI diff CI',               auto: false, green: false },
  { id: 'R9',  label: 'Qt-5 fallback 0 régress.', how: 'BLOBIN_BACKEND=cpp smoke',           auto: false, green: false },
  { id: 'R10', label: 'Dogfood 2 sem · 0 P0/P1',  how: 'tracker · blob.in/dogfood',          auto: false, green: false },
];

function MotionReadiness() {
  const autoGreen = GATES.filter((g) => g.auto && g.green).length;
  const autoTotal = GATES.filter((g) => g.auto).length;
  const manualPending = GATES.filter((g) => !g.auto && !g.green).length;

  return (
    <FitScale w={1280} h={720} background="#0B0D10">
      <div style={{
        width: 1280, height: 720, background: '#0B0D10', color: '#F7F3ED',
        padding: 52, boxSizing: 'border-box', overflow: 'auto',
        fontFamily: 'ui-sans-serif, system-ui, sans-serif', position: 'relative',
      }}>
        <DitherBg color="#5F7F52" opacity={0.05} />
        <GrainBg opacity={0.06} />
        <div style={{ position: 'relative' }}>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 10, color: '#5F7F52', fontWeight: 700, letterSpacing: '0.18em', fontFamily: 'ui-monospace, monospace' }}>∞.8 · READINESS · P5 · GATE AVANT BASCULE RUST</div>
              <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em', marginTop: 4 }}>Tout vert, tenu deux semaines.</div>
              <div style={{ fontSize: 13, color: 'rgba(247,243,237,.6)', marginTop: 4, maxWidth: 760, lineHeight: 1.5 }}>
                P5 n'ajoute rien — il <i>valide</i>. Six gates automatiques (CI) + quatre manuels signés. La bascule <code style={{ fontFamily: 'ui-monospace, monospace', color: '#CE8E3F' }}>BLOBIN_BACKEND=rust</code> par défaut n'arrive que quand R1–R10 sont verts.
              </div>
            </div>
            <div style={{ flexShrink: 0, textAlign: 'right' }}>
              <div style={{ fontSize: 38, fontWeight: 700, fontFamily: 'ui-monospace, monospace', color: '#5F7F52', lineHeight: 1 }}>{autoGreen}/{autoTotal}</div>
              <div style={{ fontSize: 10, color: 'rgba(247,243,237,.5)', fontFamily: 'ui-monospace, monospace', letterSpacing: '0.06em', marginTop: 4 }}>AUTO VERTS · {manualPending} MANUELS EN ATTENTE</div>
            </div>
          </div>

          {/* Phase ladder */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
            {PHASE_LADDER.map((p, i) => (
              <div key={p.id} style={{
                flex: 1, padding: '10px 12px', borderRadius: 8,
                background: p.active ? 'rgba(206,142,63,.12)' : p.done ? 'rgba(95,127,82,.1)' : 'rgba(247,243,237,.04)',
                border: p.active ? '1px solid #CE8E3F' : p.done ? '.5px solid rgba(95,127,82,.4)' : '.5px solid rgba(247,243,237,.08)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'ui-monospace, monospace', color: p.active ? '#CE8E3F' : p.done ? '#5F7F52' : 'rgba(247,243,237,.5)' }}>{p.id}</span>
                  <span style={{ fontSize: 11 }}>{p.done ? '✓' : p.active ? '◷' : ''}</span>
                </div>
                <div style={{ fontSize: 10.5, color: 'rgba(247,243,237,.6)', marginTop: 3 }}>{p.name}</div>
              </div>
            ))}
          </div>

          {/* Gates grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            {GATES.map((g) => {
              const tone = g.green ? '#5F7F52' : g.auto ? '#E63A1F' : '#E8A227';
              const status = g.green ? 'VERT' : g.auto ? 'ROUGE' : 'MANUEL';
              return (
                <div key={g.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                  background: '#15181C', borderRadius: 8, border: `.5px solid ${tone}33`,
                }}>
                  <span style={{ fontSize: 11, fontFamily: 'ui-monospace, monospace', fontWeight: 700, color: '#FF6A00', minWidth: 28 }}>{g.id}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600 }}>{g.label}</div>
                    <div style={{ fontSize: 10, color: 'rgba(247,243,237,.45)', fontFamily: 'ui-monospace, monospace', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.how}</div>
                  </div>
                  <span style={{ fontSize: 8.5, padding: '2px 7px', background: tone, color: g.auto && !g.green ? '#fff' : '#0B0D10', borderRadius: 3, fontFamily: 'ui-monospace, monospace', fontWeight: 700, letterSpacing: '0.08em' }}>{status}</span>
                  <span style={{ fontSize: 8.5, color: 'rgba(247,243,237,.35)', fontFamily: 'ui-monospace, monospace', fontWeight: 700, minWidth: 38, textAlign: 'right' }}>{g.auto ? 'AUTO' : 'SIGN'}</span>
                </div>
              );
            })}
          </div>

          {/* Flip + rollback contract */}
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1, padding: '12px 16px', background: 'rgba(95,127,82,.08)', border: '.5px solid rgba(95,127,82,.3)', borderRadius: 8 }}>
              <div style={{ fontSize: 9, fontFamily: 'ui-monospace, monospace', fontWeight: 700, letterSpacing: '0.12em', color: '#5F7F52', marginBottom: 5 }}>BASCULE</div>
              <div style={{ fontSize: 11.5, lineHeight: 1.5, color: 'rgba(247,243,237,.75)' }}>R1–R10 verts + dogfood tenu → défaut <code style={{ fontFamily: 'ui-monospace, monospace', color: '#CE8E3F' }}>rust</code>. Avant : opt-in dev/nightly, <code style={{ fontFamily: 'ui-monospace, monospace' }}>cpp</code> en stable.</div>
            </div>
            <div style={{ flex: 1, padding: '12px 16px', background: 'rgba(230,58,31,.07)', border: '.5px solid rgba(230,58,31,.3)', borderRadius: 8 }}>
              <div style={{ fontSize: 9, fontFamily: 'ui-monospace, monospace', fontWeight: 700, letterSpacing: '0.12em', color: '#E63A1F', marginBottom: 5 }}>ROLLBACK</div>
              <div style={{ fontSize: 11.5, lineHeight: 1.5, color: 'rgba(247,243,237,.75)' }}>P0/P1 après bascule → <code style={{ fontFamily: 'ui-monospace, monospace', color: '#CE8E3F' }}>BLOBIN_BACKEND=cpp</code> (env, sans rebuild). Le C++ n'est jamais supprimé — c'est l'oracle.</div>
            </div>
          </div>
        </div>
      </div>
    </FitScale>
  );
}

Object.assign(window, { MotionReadiness });
