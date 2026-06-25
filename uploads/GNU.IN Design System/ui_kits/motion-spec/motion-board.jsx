// motion-board.jsx
// Cover, manifeste, taxonomie, tables de tokens, moment-matrix, handoff.

// ── Cover ────────────────────────────────────────────────────────────
function MotionCover() {
  return (
    <FitScale w={1280} h={720} background="#0B0D10">
      <div style={{ width: 1280, height: 720, background: '#0B0D10', color: '#F7F3ED', position: 'relative', overflow: 'hidden', fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>
        <DitherBg color="#FF6A00" opacity={0.07} />
        <GrainBg opacity={0.08} />
        <div style={{ position: 'absolute', inset: 60, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Header strip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <SysterGlyph size={56} hover />
            <div>
              <div style={{ fontSize: 11, color: '#FF6A00', fontWeight: 700, letterSpacing: '0.18em', fontFamily: 'ui-monospace, monospace' }}>GNU.IN-SHELL · MOTION SPEC v0.14.0</div>
              <div style={{ fontSize: 48, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1 }}>Fiche d'animation</div>
              <div style={{ fontSize: 20, color: 'rgba(247,243,237,.6)', marginTop: 4, fontWeight: 400 }}>Atomes · molécules · recettes · handoff moteur</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 32, marginTop: 20, flex: 1 }}>
            {/* Lede */}
            <div>
              <div style={{ fontSize: 18, lineHeight: 1.55, color: 'rgba(247,243,237,.85)', maxWidth: 580 }}>
                Le fade+transient des menus contextuels classiques ne suffit pas. Gnu.In-Shell se construit sur un vocabulaire de motion plus riche : <span style={{ color: '#FF6A00', fontWeight: 600 }}>mask reveal depuis le curseur</span>, <span style={{ color: '#FF6A00', fontWeight: 600 }}>spring radial</span>, <span style={{ color: '#FF6A00', fontWeight: 600 }}>origami fold</span>, <span style={{ color: '#FF6A00', fontWeight: 600 }}>dither shift ambiant</span>.
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.6, color: 'rgba(247,243,237,.6)', maxWidth: 580, marginTop: 14 }}>
                Cette fiche est <i>décomposable</i> (chaque atome utilisable seul) et <i>clé-en-main</i> (recettes par archétype). Tokens neutres en haut, snippets QML/Qt/GPUI/CSS à côté de chaque animation. Reduced-motion et perf-budget intégrés.
              </div>
            </div>
            {/* Inventory */}
            <div style={{ background: 'rgba(255,255,255,.04)', borderRadius: 12, padding: 20, border: '.5px solid rgba(255,255,255,.06)' }}>
              <div style={{ fontSize: 10, color: '#FF6A00', fontWeight: 700, letterSpacing: '0.14em', fontFamily: 'ui-monospace, monospace', marginBottom: 14 }}>INVENTAIRE</div>
              {[
              { n: '15', l: 'atomes', s: 'fade · scale · mask · spring · …' },
              { n: '12', l: 'molécules', s: 'reveal-from-cursor · sub-cascade · …' },
              { n: '5', l: 'recettes', s: 'list · widget · titlebar · ★ bubble · tray' },
              { n: '10', l: 'moments', s: 'open · close · hover · commit · sub · drill · retarget · edge · idle · error' },
              { n: '4', l: 'moteurs', s: 'Rust · C++ · GPUI · Qt/QML' }].
              map((it) =>
              <div key={it.l} style={{ display: 'flex', alignItems: 'baseline', gap: 12, padding: '6px 0', borderTop: '.5px solid rgba(255,255,255,.06)' }}>
                  <span style={{ fontSize: 32, fontWeight: 600, color: '#FF6A00', fontFamily: 'ui-monospace, monospace', lineHeight: 1, minWidth: 50, fontVariantNumeric: 'tabular-nums' }}>{it.n}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{it.l}</div>
                    <div style={{ fontSize: 11, color: 'rgba(247,243,237,.5)', fontFamily: 'ui-monospace, monospace' }}>{it.s}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 11, color: 'rgba(247,243,237,.5)', fontFamily: 'ui-monospace, monospace', letterSpacing: '0.06em' }}>
            <span style={{ padding: '4px 10px', borderRadius: 3, background: 'rgba(255,106,0,.15)', color: '#FF6A00', fontWeight: 700 }}>ATOMIC-AGE TONE</span>
            <span>overshoot léger · courbes chaudes · 200ms baseline</span>
            <span style={{ marginLeft: 'auto' }}>v0.14.0 · 2026.06 · moteur : blob.in (Rust/cxx) · GPUI · Qt · Quickshell</span>
          </div>
        </div>
      </div>
    </FitScale>);

}

// ── Manifesto ────────────────────────────────────────────────────────
function MotionManifesto() {
  return (
    <FitScale w={1280} h={720} background="#FBFAF6">
      <div style={{ width: 1280, height: 720, background: '#FBFAF6', color: '#111418', position: 'relative', padding: 60, boxSizing: 'border-box', fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>
        <div style={{ fontSize: 10, color: '#FF6A00', fontWeight: 700, letterSpacing: '0.18em', fontFamily: 'ui-monospace, monospace' }}>MANIFESTE · LECTURE</div>
        <div style={{ fontSize: 40, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05, marginTop: 8, maxWidth: 900 }}>
          Une grammaire en trois échelles, exploitable du bas vers le haut.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 28, marginTop: 36 }}>
          {[
          {
            n: '01', label: 'ATOMES', kw: 'mask · scale · spring · particle',
            text: 'Quinze primitives indépendantes. Chacune fait une chose, et peut être pilotée par le moteur sans connaître la suivante. Lis cette section comme une boîte à outils.',
            detail: 'Chaque atome : 1 paramètre, 1 courbe, 1 durée. Aucune ne déclenche d\'autre. Mappage QML/Qt/GPUI/CSS fourni — copie/colle.'
          },
          {
            n: '02', label: 'MOLÉCULES', kw: 'open · hover · sub-open · commit',
            text: 'Douze combinaisons nommées d\'atomes. C\'est ici qu\'apparaissent les MOMENTS du menu : entrée, sortie, survol, validation, sous-ouverture, refus, idle.',
            detail: 'Chaque molécule cite explicitement ses atomes. Si tu n\'as pas le moteur pour A.04 (mask), tu peux dégrader la molécule à A.01+A.02 — la table reduced-motion donne la marche à suivre.'
          },
          {
            n: '03', label: 'RECETTES', kw: 'list · widget · titlebar · ★ bubble · tray',
            text: 'Cinq orchestrations clé-en-main, une par archétype. Chaque recette est une timeline complète (open → hover → commit → sub → close), lisible au scrubber.',
            detail: 'Les recettes ne nécessitent aucun choix de ta part — branche-les telles quelles sur ton archétype. Mais leur déclaration explicite des moments permet de les forker sans les casser.'
          }].
          map((s) =>
          <div key={s.n} style={{ background: '#FFFFFF', borderRadius: 10, padding: 22, border: '.5px solid rgba(17,20,24,.08)', boxShadow: '0 2px 6px rgba(17,20,24,.04)' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <span style={{ fontSize: 32, color: '#FF6A00', fontWeight: 700, fontFamily: 'ui-monospace, monospace', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{s.n}</span>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', fontFamily: 'ui-monospace, monospace' }}>{s.label}</span>
              </div>
              <div style={{ fontSize: 9, color: '#FF6A00', fontFamily: 'ui-monospace, monospace', marginTop: 4, letterSpacing: '0.06em', fontWeight: 600 }}>{s.kw}</div>
              <div style={{ fontSize: 13, lineHeight: 1.55, marginTop: 14 }}>{s.text}</div>
              <div style={{ fontSize: 11, lineHeight: 1.55, marginTop: 12, color: 'rgba(17,20,24,.6)' }}>{s.detail}</div>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, marginTop: 32 }}>
          <div style={{ background: '#111418', color: '#F7F3ED', borderRadius: 10, padding: 22 }}>
            <div style={{ fontSize: 10, color: '#FF6A00', fontWeight: 700, letterSpacing: '0.14em', fontFamily: 'ui-monospace, monospace' }}>LES RÈGLES NON-NÉGOCIABLES</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12, fontSize: 13, lineHeight: 1.5 }}>
              {[
              ['1.', 'L\'origine de l\'animation est toujours le curseur, pas le centre du menu.'],
              ['2.', 'La sortie est plus rapide que l\'entrée (200ms vs 280ms).'],
              ['3.', 'Une seule fois les particules : au commit. Jamais à l\'entrée.'],
              ['4.', 'L\'overshoot atomic-age est calibré à ~3%. Plus = caricature.'],
              ['5.', 'Reduced-motion n\'est pas optionnel — chaque atome a son fallback.']].
              map(([n, t]) =>
              <div key={n} style={{ display: 'flex', gap: 10 }}>
                  <span style={{ color: '#FF6A00', fontWeight: 700, fontFamily: 'ui-monospace, monospace', flexShrink: 0 }}>{n}</span>
                  <span>{t}</span>
                </div>
              )}
            </div>
          </div>
          <div style={{ background: 'transparent', padding: 22, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 10, color: '#FF6A00', fontWeight: 700, letterSpacing: '0.14em', fontFamily: 'ui-monospace, monospace' }}>COMMENT NAVIGUER LA FICHE</div>
              <div style={{ fontSize: 13, lineHeight: 1.55, marginTop: 12 }}>
                Chaque card a une <b>scène animée</b> (avec play/pause + scrubber + replay) et une <b>colonne spec</b> (tokens, snippets multi-moteurs, perf, audio, reduced-motion).
                Tu peux scruber n'importe quelle animation pour la freezer à un t précis et lire ses paramètres.
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 16, fontSize: 11, color: 'rgba(17,20,24,.55)', fontFamily: 'ui-monospace, monospace', letterSpacing: '0.04em' }}>
              <div>SECT 1 — manifeste · tokens · taxonomie</div>
              <div>SECT 2 — A.01 → A.15 atomes</div>
              <div>SECT 3 — M.01 → M.12 molécules</div>
              <div>SECT 4 — R.01 → R.05 recettes</div>
              <div>SECT 5 — moment matrix · engine mapping · handoff</div>
            </div>
          </div>
        </div>
      </div>
    </FitScale>);

}

// ── Taxonomie diagram ────────────────────────────────────────────────
function MotionTaxonomy() {
  // Visual : 3 colonnes (atomes 15 → molécules 12 → recettes 5)
  return (
    <FitScale w={1280} h={720} background="#FBFAF6">
      <div style={{ width: 1280, height: 720, background: '#FBFAF6', color: '#111418', padding: 60, boxSizing: 'border-box', fontFamily: 'ui-sans-serif, system-ui, sans-serif', position: 'relative' }}>
        <div style={{ fontSize: 10, color: '#FF6A00', fontWeight: 700, letterSpacing: '0.18em', fontFamily: 'ui-monospace, monospace' }}>TAXONOMIE · 15 + 12 + 5 = 32 ASSETS</div>
        <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em', marginTop: 6, lineHeight: 1.1 }}>Du paramètre à l'orchestration complète.</div>
        <div style={{ fontSize: 13, color: 'rgba(17,20,24,.6)', marginTop: 4, maxWidth: 760, lineHeight: 1.5 }}>
          Lis cette table de gauche à droite : chaque colonne consomme la précédente. Tu peux entrer par n'importe quel niveau — atomes pour bricoler, molécules pour les moments, recettes pour brancher direct.
        </div>

        <div style={{ marginTop: 40, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24, height: 480 }}>
          {/* Atomes */}
          <div style={{ background: '#FFFFFF', borderRadius: 10, padding: 18, border: '.5px solid rgba(17,20,24,.08)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ padding: '3px 8px', fontSize: 9, fontFamily: 'ui-monospace, monospace', fontWeight: 700, letterSpacing: '0.12em', background: '#111418', color: '#FF6A00', borderRadius: 3 }}>ATOMES</span>
              <span style={{ fontSize: 18, fontWeight: 600, fontFamily: 'ui-monospace, monospace' }}>15</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 11, fontFamily: 'ui-monospace, monospace' }}>
              {ATOMS.map((a) =>
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: '#FF6A00', fontWeight: 700, fontVariantNumeric: 'tabular-nums', minWidth: 36 }}>{a.id}</span>
                  <span style={{ flex: 1 }}>{a.title}</span>
                  <span style={{ color: 'rgba(17,20,24,.45)', fontSize: 9 }}>{a.perf}</span>
                </div>
              )}
            </div>
          </div>

          {/* Molécules */}
          <div style={{ background: '#FFFFFF', borderRadius: 10, padding: 18, border: '.5px solid rgba(17,20,24,.08)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ padding: '3px 8px', fontSize: 9, fontFamily: 'ui-monospace, monospace', fontWeight: 700, letterSpacing: '0.12em', background: '#5F7F52', color: '#F7F3ED', borderRadius: 3 }}>MOLÉCULES</span>
              <span style={{ fontSize: 18, fontWeight: 600, fontFamily: 'ui-monospace, monospace' }}>12</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 11, fontFamily: 'ui-monospace, monospace' }}>
              {MOLECULES.map((m) =>
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: '#5F7F52', fontWeight: 700, fontVariantNumeric: 'tabular-nums', minWidth: 36 }}>{m.id}</span>
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.title}</span>
                  <span style={{ color: 'rgba(17,20,24,.45)', fontSize: 9 }}>{m.moment.split(' ')[0]}</span>
                </div>
              )}
            </div>
          </div>

          {/* Recettes */}
          <div style={{ background: '#FFFFFF', borderRadius: 10, padding: 18, border: '.5px solid rgba(17,20,24,.08)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ padding: '3px 8px', fontSize: 9, fontFamily: 'ui-monospace, monospace', fontWeight: 700, letterSpacing: '0.12em', background: '#FF6A00', color: '#1A0A00', borderRadius: 3 }}>RECETTES</span>
              <span style={{ fontSize: 18, fontWeight: 600, fontFamily: 'ui-monospace, monospace' }}>5</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 11, fontFamily: 'ui-monospace, monospace' }}>
              {RECIPES.map((r) =>
              <div key={r.id} style={{ padding: 8, background: r.signature ? 'rgba(255,106,0,.08)' : 'rgba(17,20,24,.03)', borderRadius: 4, border: r.signature ? '.5px solid rgba(255,106,0,.4)' : '.5px solid transparent' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: '#FF6A00', fontWeight: 700, fontVariantNumeric: 'tabular-nums', minWidth: 36 }}>{r.id}</span>
                    <span style={{ flex: 1, fontWeight: 600, fontFamily: 'ui-sans-serif, system-ui, sans-serif', fontSize: 12 }}>{r.title}{r.signature && ' ★'}</span>
                  </div>
                  <div style={{ marginTop: 4, fontSize: 9, color: 'rgba(17,20,24,.55)' }}>
                    {r.phases.length} phases · {r.dur}ms · {r.perf}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom legend */}
        <div style={{ marginTop: 24, fontSize: 11, color: 'rgba(17,20,24,.55)', fontFamily: 'ui-monospace, monospace', letterSpacing: '0.04em', lineHeight: 1.6 }}>
          atomes → indépendants, 1 paramètre · molécules → 2–4 atomes, nomment un moment · recettes → orchestration par archétype, contient sa propre timeline
        </div>
      </div>
    </FitScale>);

}

// ── Token reference ──────────────────────────────────────────────────
function MotionTokens() {
  return (
    <FitScale w={1280} h={720} background="#FBFAF6">
      <div style={{ width: 1280, height: 720, background: '#FBFAF6', color: '#111418', padding: 52, boxSizing: 'border-box', fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>
        <div style={{ fontSize: 10, color: '#FF6A00', fontWeight: 700, letterSpacing: '0.18em', fontFamily: 'ui-monospace, monospace' }}>TOKENS · NEUTRES</div>
        <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em', marginTop: 6 }}>Durations · easings · distances · perf</div>
        <div style={{ fontSize: 12, color: 'rgba(17,20,24,.6)', marginTop: 4, maxWidth: 780, lineHeight: 1.55 }}>
          Toute animation Gnu.In-Shell se construit avec ces tokens. Aucune autre valeur magique — si tu en inventes une, ouvre un ticket avant.
        </div>

        <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 28 }}>
          {/* Durations */}
          <div style={{ background: '#FFFFFF', borderRadius: 10, padding: 20, border: '.5px solid rgba(17,20,24,.08)' }}>
            <div style={{ fontSize: 9, color: '#FF6A00', fontWeight: 700, letterSpacing: '0.14em', fontFamily: 'ui-monospace, monospace', marginBottom: 14 }}>DURATIONS · MDUR.*</div>
            <table style={{ width: '100%', fontSize: 11.5, borderCollapse: 'collapse', fontFamily: 'ui-monospace, monospace' }}>
              <thead><tr style={{ fontSize: 9, color: 'rgba(17,20,24,.5)', textAlign: 'left' }}>
                <th style={{ padding: '4px 0', fontWeight: 600 }}>KEY</th>
                <th style={{ padding: '4px 0', fontWeight: 600 }}>MS</th>
                <th style={{ padding: '4px 0', fontWeight: 600 }}>USAGE</th>
              </tr></thead>
              <tbody>
                {[
                ['instant', 'micro-feedback'],
                ['flash', 'press depress'],
                ['fast', 'hover, magnetic'],
                ['base', 'entrance baseline ★'],
                ['smooth', 'mask reveal full'],
                ['slow', 'mega panel, hero'],
                ['unfurl', 'sub-cascade + stagger'],
                ['pulse', 'listening ambient'],
                ['idle', 'slow breathing']].
                map(([k, usage]) =>
                <tr key={k} style={{ borderTop: '.5px solid rgba(17,20,24,.06)' }}>
                    <td style={{ padding: '6px 0', color: '#FF6A00', fontWeight: 700 }}>{k}</td>
                    <td style={{ padding: '6px 0', fontVariantNumeric: 'tabular-nums' }}>{MDUR[k]}</td>
                    <td style={{ padding: '6px 0', color: 'rgba(17,20,24,.7)', fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>{usage}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Easings */}
          <div style={{ background: '#FFFFFF', borderRadius: 10, padding: 20, border: '.5px solid rgba(17,20,24,.08)' }}>
            <div style={{ fontSize: 9, color: '#FF6A00', fontWeight: 700, letterSpacing: '0.14em', fontFamily: 'ui-monospace, monospace', marginBottom: 14 }}>EASINGS · MEASE.*</div>
            <table style={{ width: '100%', fontSize: 10.5, borderCollapse: 'collapse', fontFamily: 'ui-monospace, monospace' }}>
              <thead><tr style={{ fontSize: 9, color: 'rgba(17,20,24,.5)', textAlign: 'left' }}>
                <th style={{ padding: '4px 0', fontWeight: 600 }}>KEY</th>
                <th style={{ padding: '4px 0', fontWeight: 600 }}>BEZIER</th>
                <th style={{ padding: '4px 0', fontWeight: 600 }}>QT</th>
                <th style={{ padding: '4px 0', fontWeight: 600 }}>GPUI</th>
                <th style={{ padding: '4px 0', fontWeight: 600 }}>CURVE</th>
              </tr></thead>
              <tbody>
                {Object.entries(MEASE).map(([k, e]) =>
                <tr key={k} style={{ borderTop: '.5px solid rgba(17,20,24,.06)' }}>
                    <td style={{ padding: '6px 0', color: '#FF6A00', fontWeight: 700 }}>{k}</td>
                    <td style={{ padding: '6px 0', color: 'rgba(17,20,24,.8)', fontVariantNumeric: 'tabular-nums', fontSize: 9.5 }}>{e.bz.map((n) => n.toFixed(2)).join(',')}</td>
                    <td style={{ padding: '6px 0', color: 'rgba(17,20,24,.7)' }}>{e.qt}</td>
                    <td style={{ padding: '6px 0', color: 'rgba(17,20,24,.7)', fontSize: 9.5 }}>{e.gpui}</td>
                    <td style={{ padding: '6px 0', width: 80 }}>
                      <EasingMini bz={e.bz} />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
          {/* Distances */}
          <div style={{ background: '#FFFFFF', borderRadius: 10, padding: 20, border: '.5px solid rgba(17,20,24,.08)' }}>
            <div style={{ fontSize: 9, color: '#FF6A00', fontWeight: 700, letterSpacing: '0.14em', fontFamily: 'ui-monospace, monospace', marginBottom: 14 }}>DISTANCES · MDIST.*</div>
            <table style={{ width: '100%', fontSize: 11, borderCollapse: 'collapse', fontFamily: 'ui-monospace, monospace' }}>
              <tbody>
                {[
                ['lift', '4px', 'soulèvement Y entrée'],
                ['slide', '8px', 'glissement horizontal sub'],
                ['row', '12px', 'offset par rangée stagger'],
                ['mag', '3px', 'aimantation pointeur'],
                ['bloom', '52px', 'déploiement radial bubble'],
                ['bounce', '6px', 'rebond bord d\'écran'],
                ['press', '0.96', 'ratio scale press']].
                map(([k, v, usage]) =>
                <tr key={k} style={{ borderTop: '.5px solid rgba(17,20,24,.06)' }}>
                    <td style={{ padding: '6px 0', color: '#FF6A00', fontWeight: 700, width: 70 }}>{k}</td>
                    <td style={{ padding: '6px 0', fontVariantNumeric: 'tabular-nums', width: 60 }}>{v}</td>
                    <td style={{ padding: '6px 0', color: 'rgba(17,20,24,.7)', fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>{usage}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Perf budget */}
          <div style={{ background: '#111418', color: '#F7F3ED', borderRadius: 10, padding: 20 }}>
            <div style={{ fontSize: 9, color: '#FF6A00', fontWeight: 700, letterSpacing: '0.14em', fontFamily: 'ui-monospace, monospace', marginBottom: 14 }}>PERF · BUDGET PAR NIVEAU</div>
            {Object.entries(MPERF).map(([k, v]) =>
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderTop: '.5px solid rgba(247,243,237,.08)' }}>
                <span style={{
                padding: '2px 8px', fontSize: 9, fontFamily: 'ui-monospace, monospace', fontWeight: 700, borderRadius: 3,
                background: k === 'light' ? '#E8F1E5' : k === 'medium' ? '#FBEFD8' : '#F5D8D2',
                color: k === 'light' ? '#3D5A33' : k === 'medium' ? '#7A4A0F' : '#7A2412',
                minWidth: 50, textAlign: 'center'
              }}>{v.label}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>{v.cost}</div>
                </div>
                <span style={{ fontSize: 11, color: 'rgba(247,243,237,.6)', fontFamily: 'ui-monospace, monospace', fontVariantNumeric: 'tabular-nums' }}>~{Math.round(v.gpu * 100)}% GPU</span>
              </div>
            )}
            <div style={{ marginTop: 14, fontSize: 10.5, lineHeight: 1.5, color: 'rgba(247,243,237,.6)', fontFamily: 'ui-monospace, monospace' }}>
              Sur Wayland sans compositor blur natif : tout HEAVY doit avoir un fallback (cf. handoff).
            </div>
          </div>
        </div>
      </div>
    </FitScale>);

}

// Tiny easing curve preview
function EasingMini({ bz }) {
  const W = 70,H = 26;
  const pts = Array.from({ length: 22 }, (_, i) => {
    const t = i / 21;
    const y = bezierY(bz[0], bz[1], bz[2], bz[3], t);
    return { x: t * W, y: H - y * H };
  });
  return (
    <svg width={W} height={H}>
      <line x1="0" y1={H} x2={W} y2={H} stroke="rgba(17,20,24,.15)" />
      <line x1="0" y1="0" x2="0" y2={H} stroke="rgba(17,20,24,.15)" />
      <polyline points={pts.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#FF6A00" strokeWidth="1.4" />
    </svg>);

}

// ── Moment matrix ────────────────────────────────────────────────────
function MotionMomentMatrix() {
  const moments = ['open', 'close', 'hover', 'commit', 'sub-open', 'sub-close', 'drill', 'retarget', 'edge', 'idle', 'error'];
  const archetypes = [
  { id: '01', label: 'Empty space · list', recipe: 'R.01' },
  { id: '01b', label: 'Empty space · radial', recipe: '—' },
  { id: '02', label: 'Widget', recipe: 'R.02' },
  { id: '03', label: 'Title-bar', recipe: 'R.03' },
  { id: '04', label: 'Nested cascade', recipe: '—' },
  { id: '04★', label: 'Bubble tree ★', recipe: 'R.04' },
  { id: '05', label: 'Tray', recipe: 'R.05' }];

  const matrix = {
    'open': { '01': 'M.01', '01b': 'M.12', '02': 'M.01', '03': 'M.01↓', '04': 'M.01+M.05', '04★': 'M.12', '05': 'M.01↓' },
    'close': { '01': 'M.02', '01b': 'M.12⁻¹', '02': 'M.02', '03': 'M.02', '04': 'M.02+M.06', '04★': 'M.12⁻¹', '05': 'M.02' },
    'hover': { '01': 'M.03', '01b': 'arc', '02': 'M.03', '03': 'M.03', '04': 'M.03', '04★': 'M.03 ◯', '05': 'M.03' },
    'commit': { '01': 'M.04', '01b': 'M.04', '02': 'M.04 danger', '03': 'M.04', '04': 'M.04', '04★': 'M.04', '05': 'M.04' },
    'sub-open': { '01': '—', '01b': 'M.12 sub', '02': 'M.05', '03': 'M.05', '04': 'M.05 / M.07', '04★': 'M.12 sub', '05': '—' },
    'sub-close': { '01': '—', '01b': '—', '02': 'M.06', '03': 'M.06', '04': 'M.06', '04★': 'M.12⁻¹', '05': '—' },
    'drill': { '01': '—', '01b': '—', '02': '—', '03': '—', '04': 'M.07 (touch)', '04★': '—', '05': '—' },
    'retarget': { '01': 'M.08', '01b': 'M.08', '02': '—', '03': '—', '04': 'M.08', '04★': 'M.08', '05': '—' },
    'edge': { '01': 'M.09', '01b': 'M.09', '02': 'M.09', '03': 'M.09', '04': 'M.09', '04★': 'M.09', '05': 'M.09' },
    'idle': { '01': 'M.10', '01b': 'M.10', '02': 'M.10', '03': '—', '04': 'M.10', '04★': 'M.10 ◯', '05': '—' },
    'error': { '01': 'M.11', '01b': 'M.11', '02': 'M.11', '03': 'M.11', '04': 'M.11', '04★': 'M.11', '05': 'M.11' }
  };
  return (
    <FitScale w={1280} h={720} background="#FBFAF6">
      <div style={{ width: 1280, height: 720, background: '#FBFAF6', color: '#111418', padding: 52, boxSizing: 'border-box', fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>
        <div style={{ fontSize: 10, color: '#FF6A00', fontWeight: 700, letterSpacing: '0.18em', fontFamily: 'ui-monospace, monospace' }}>MATRICE · MOMENT × ARCHÉTYPE</div>
        <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', marginTop: 6 }}>Qui utilise quoi.</div>
        <div style={{ fontSize: 12, color: 'rgba(17,20,24,.6)', marginTop: 4, maxWidth: 880, lineHeight: 1.55 }}>
          Lis la cellule : moment <i>(ligne)</i> appliqué à archétype <i>(colonne)</i> = molécule à utiliser. Cellule vide = ce moment n'existe pas pour cet archétype.
        </div>

        <div style={{ marginTop: 28, background: '#FFFFFF', borderRadius: 10, border: '.5px solid rgba(17,20,24,.08)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'ui-monospace, monospace', fontSize: 10.5 }}>
            <thead>
              <tr style={{ background: '#111418', color: '#F7F3ED' }}>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 9, letterSpacing: '0.12em', fontWeight: 700 }}>MOMENT \ ARCHÉTYPE</th>
                {archetypes.map((a) =>
                <th key={a.id} style={{ padding: '8px 8px', textAlign: 'center', fontSize: 9, letterSpacing: '0.08em', fontWeight: 700, color: a.id.includes('★') ? '#FF6A00' : '#F7F3ED' }}>
                    <div>{a.id}</div>
                    <div style={{ fontSize: 8, opacity: 0.65, fontWeight: 500, marginTop: 2, fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>{a.label.replace(/^[\d★ ·]+/, '')}</div>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {moments.map((m) =>
              <tr key={m} style={{ borderTop: '.5px solid rgba(17,20,24,.06)' }}>
                  <td style={{ padding: '8px 12px', fontWeight: 700, color: '#111418', letterSpacing: '0.04em' }}>{m}</td>
                  {archetypes.map((a) => {
                  const v = matrix[m][a.id];
                  const isEmpty = v === '—' || v == null;
                  return (
                    <td key={a.id} style={{ padding: '8px 8px', textAlign: 'center', color: isEmpty ? 'rgba(17,20,24,.3)' : '#FF6A00', fontWeight: isEmpty ? 400 : 700, fontSize: 10 }}>
                        {v || '—'}
                      </td>);

                })}
                </tr>
              )}
              <tr style={{ borderTop: '1px solid rgba(17,20,24,.18)', background: 'rgba(255,106,0,.04)' }}>
                <td style={{ padding: '10px 12px', fontWeight: 700, fontSize: 11 }}>RECETTE</td>
                {archetypes.map((a) =>
                <td key={a.id} style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 700, color: a.recipe === '—' ? 'rgba(17,20,24,.3)' : '#111418', fontSize: 11 }}>{a.recipe}</td>
                )}
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 22, display: 'flex', gap: 16, fontSize: 11, color: 'rgba(17,20,24,.6)', fontFamily: 'ui-monospace, monospace' }}>
          <span>↓ origine top (depuis title-bar / tray)</span>
          <span>◯ uniquement sur le glyphe assistant, jamais sur le contenu</span>
          <span>⁻¹ molécule appliquée en inverse</span>
        </div>
      </div>
    </FitScale>);

}

// ── Engine mapping handoff ───────────────────────────────────────────
function MotionEngineHandoff() {
  return (
    <FitScale w={1280} h={720} background="#FBFAF6">
      <div style={{ width: 1280, height: 720, background: '#FBFAF6', color: '#111418', padding: 52, boxSizing: 'border-box', fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>
        <div style={{ fontSize: 10, color: '#FF6A00', fontWeight: 700, letterSpacing: '0.18em', fontFamily: 'ui-monospace, monospace' }}>HANDOFF MOTEUR · 4 PLATEFORMES</div>
        <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em', marginTop: 6 }}>Un token = quatre langages.</div>
        <div style={{ fontSize: 12, color: 'rgba(17,20,24,.6)', marginTop: 4, maxWidth: 760, lineHeight: 1.55 }}>
          La table de gauche : équivalents directs (durée, easing). La table de droite : capabilities qu'il faut tester avant d'utiliser un atome.
        </div>

        <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 24 }}>
          {/* Mapping table */}
          <div style={{ background: '#FFFFFF', borderRadius: 10, padding: 18, border: '.5px solid rgba(17,20,24,.08)' }}>
            <div style={{ fontSize: 9, color: '#FF6A00', fontWeight: 700, letterSpacing: '0.14em', fontFamily: 'ui-monospace, monospace', marginBottom: 14 }}>EASING · MAPPING</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'ui-monospace, monospace', fontSize: 10 }}>
              <thead><tr style={{ color: 'rgba(17,20,24,.55)', textAlign: 'left' }}>
                <th style={{ padding: '6px 4px', fontWeight: 600 }}>NEUTRAL</th>
                <th style={{ padding: '6px 4px', fontWeight: 600 }}>BEZIER</th>
                <th style={{ padding: '6px 4px', fontWeight: 600 }}>QML</th>
                <th style={{ padding: '6px 4px', fontWeight: 600 }}>QT C++</th>
                <th style={{ padding: '6px 4px', fontWeight: 600 }}>GPUI</th>
                <th style={{ padding: '6px 4px', fontWeight: 600 }}>CSS</th>
              </tr></thead>
              <tbody>
                {Object.entries(MEASE).map(([k, e]) =>
                <tr key={k} style={{ borderTop: '.5px solid rgba(17,20,24,.06)' }}>
                    <td style={{ padding: '6px 4px', color: '#FF6A00', fontWeight: 700 }}>{k}</td>
                    <td style={{ padding: '6px 4px', fontSize: 9 }}>{e.bz.map((n) => n.toFixed(2)).join(',')}</td>
                    <td style={{ padding: '6px 4px', color: 'rgba(17,20,24,.8)' }}>Easing.{e.qt}</td>
                    <td style={{ padding: '6px 4px', color: 'rgba(17,20,24,.8)' }}>QEasingCurve::{e.qt}</td>
                    <td style={{ padding: '6px 4px', color: 'rgba(17,20,24,.8)', fontSize: 9 }}>{e.gpui}</td>
                    <td style={{ padding: '6px 4px', color: 'rgba(17,20,24,.7)', fontSize: 9 }}>cubic-bezier(…)</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Capabilities */}
          <div style={{ background: '#111418', color: '#F7F3ED', borderRadius: 10, padding: 18 }}>
            <div style={{ fontSize: 9, color: '#FF6A00', fontWeight: 700, letterSpacing: '0.14em', fontFamily: 'ui-monospace, monospace', marginBottom: 14 }}>CAPABILITIES · CHECKLIST</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'ui-monospace, monospace', fontSize: 10 }}>
              <thead><tr style={{ color: 'rgba(247,243,237,.55)', textAlign: 'left' }}>
                <th style={{ padding: '6px 4px', fontWeight: 600 }}>FEATURE</th>
                <th style={{ padding: '6px 4px', fontWeight: 600, textAlign: 'center' }}>QML</th>
                <th style={{ padding: '6px 4px', fontWeight: 600, textAlign: 'center' }}>QT</th>
                <th style={{ padding: '6px 4px', fontWeight: 600, textAlign: 'center' }}>FLU</th>
              </tr></thead>
              <tbody>
                {[
                ['clip-path circle', 'ShaderEffect', 'QPainter::setClipPath', 'ClipPath'],
                ['backdrop-blur', 'GaussianBlur', 'QGraphicsBlurEffect', 'BackdropFilter'],
                ['perspective rotate', 'transform.Rotation3D', 'QTransform::rotate', 'Transform'],
                ['spring physics', 'SpringAnimation', 'custom', 'SpringSimulation'],
                ['particles', 'ParticleSystem', 'QPropertyAnimation×N', 'CustomPainter'],
                ['border-radius morph', 'Behavior on radius', 'QPropertyAnimation', 'BorderRadius.lerp']].
                map(([f, qml, qt, flu]) =>
                <tr key={f} style={{ borderTop: '.5px solid rgba(247,243,237,.08)' }}>
                    <td style={{ padding: '6px 4px', color: '#FF6A00', fontWeight: 600 }}>{f}</td>
                    <td style={{ padding: '6px 4px', textAlign: 'center', color: 'rgba(247,243,237,.8)', fontSize: 9 }}>{qml}</td>
                    <td style={{ padding: '6px 4px', textAlign: 'center', color: 'rgba(247,243,237,.8)', fontSize: 9 }}>{qt}</td>
                    <td style={{ padding: '6px 4px', textAlign: 'center', color: 'rgba(247,243,237,.8)', fontSize: 9 }}>{flu}</td>
                  </tr>
                )}
              </tbody>
            </table>
            <div style={{ fontSize: 9, color: 'rgba(247,243,237,.5)', marginTop: 12, lineHeight: 1.5 }}>
              Si une feature manque sur ta plateforme → cf. fallback dans la fiche reduced-motion suivante.
            </div>
          </div>
        </div>

        {/* Reference snippet */}
        <div style={{ marginTop: 24, background: '#FFFFFF', borderRadius: 10, padding: 18, border: '.5px solid rgba(17,20,24,.08)' }}>
          <div style={{ fontSize: 9, color: '#FF6A00', fontWeight: 700, letterSpacing: '0.14em', fontFamily: 'ui-monospace, monospace', marginBottom: 10 }}>EXEMPLE COMPLET · M.01 OPEN</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <pre style={{ margin: 0, padding: 12, borderRadius: 6, background: '#0B0D10', color: '#F7F3ED', fontFamily: 'ui-monospace, monospace', fontSize: 9.5, lineHeight: 1.55, whiteSpace: 'pre' }}>
{`// QML · Quickshell
PopupWindow {
  id: menu
  property bool open: false
  scale:   open ? 1.0 : 0.94
  opacity: open ? 1.0 : 0.0
  Behavior on scale   { NumberAnimation { duration: 280; easing.type: Easing.OutBack } }
  Behavior on opacity { NumberAnimation { duration: 280; easing.type: Easing.OutCubic } }
  layer.enabled: true
  layer.effect: OpacityMask {
    source: ShaderEffectSource {
      sourceItem: Item {
        Rectangle {
          width: parent.width; height: parent.height
          radius: 999
          scale: menu.open ? 1.6 : 0
          Behavior on scale { NumberAnimation { duration: 280; easing.type: Easing.OutCubic } }
        }
      }
    }
  }
}`}
            </pre>
            <pre style={{ margin: 0, padding: 12, borderRadius: 6, background: '#0B0D10', color: '#F7F3ED', fontFamily: 'ui-monospace, monospace', fontSize: 9.5, lineHeight: 1.55, whiteSpace: 'pre' }}>
{`// GPUI · same M.01 — MenuReveal
struct MenuReveal { mask_r: f32, opacity: f32 }
impl Render for MenuReveal {
  fn render(&mut self, _: &mut ViewContext<Self>) -> impl IntoElement {
    div().size_full().relative()
      .child(div().absolute().inset_0()
        .bg(gpui::rgb(0x111418)).opacity(self.opacity)
        .rounded(px(self.mask_r)))
  }
}
// on open → cx.animate(Duration::from_millis(280),
//   |t| bezier_ease(0.16, 1.0, 0.30, 1.0, t),
//   |v, t, cx| { v.mask_r = t * 160.; v.opacity = t; cx.notify(); })`}
            </pre>
          </div>
        </div>
      </div>
    </FitScale>);

}

// ── Reduced motion + audio + failsafe ────────────────────────────────
function MotionReducedAudio() {
  return (
    <FitScale w={1280} h={720} background="#FBFAF6">
      <div style={{ width: 1280, height: 720, background: '#FBFAF6', color: '#111418', padding: 52, boxSizing: 'border-box', fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>
        <div style={{ fontSize: 10, color: '#FF6A00', fontWeight: 700, letterSpacing: '0.18em', fontFamily: 'ui-monospace, monospace' }}>REDUCED-MOTION · AUDIO · FAILSAFE</div>
        <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', marginTop: 6 }}>Ce qui tombe en accessibilité, et ce qui résiste.</div>

        <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Reduced motion table */}
          <div style={{ background: '#FFFFFF', borderRadius: 10, padding: 18, border: '.5px solid rgba(17,20,24,.08)' }}>
            <div style={{ fontSize: 9, color: '#FF6A00', fontWeight: 700, letterSpacing: '0.14em', fontFamily: 'ui-monospace, monospace', marginBottom: 12 }}>REDUCED-MOTION · 15 ATOMES</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'ui-monospace, monospace', fontSize: 10 }}>
              <thead><tr style={{ color: 'rgba(17,20,24,.55)', textAlign: 'left' }}>
                <th style={{ padding: '5px 4px', fontWeight: 600 }}>ATOM</th>
                <th style={{ padding: '5px 4px', fontWeight: 600 }}>FALLBACK</th>
              </tr></thead>
              <tbody>
                {ATOMS.map((a) =>
                <tr key={a.id} style={{ borderTop: '.5px solid rgba(17,20,24,.06)' }}>
                    <td style={{ padding: '5px 4px', color: '#FF6A00', fontWeight: 700, whiteSpace: 'nowrap' }}>{a.id} {a.title}</td>
                    <td style={{ padding: '5px 4px', color: 'rgba(17,20,24,.75)', fontFamily: 'ui-sans-serif, system-ui, sans-serif', fontSize: 11 }}>{a.rm}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Audio cue library + failsafes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: '#111418', color: '#F7F3ED', borderRadius: 10, padding: 18 }}>
              <div style={{ fontSize: 9, color: '#FF6A00', fontWeight: 700, letterSpacing: '0.14em', fontFamily: 'ui-monospace, monospace', marginBottom: 12 }}>AUDIO CUE LIBRARY · PLACEHOLDERS</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'ui-monospace, monospace', fontSize: 10 }}>
                <thead><tr style={{ color: 'rgba(247,243,237,.55)', textAlign: 'left' }}>
                  <th style={{ padding: '5px 4px', fontWeight: 600 }}>ID</th>
                  <th style={{ padding: '5px 4px', fontWeight: 600, textAlign: 'right' }}>MS</th>
                  <th style={{ padding: '5px 4px', fontWeight: 600, textAlign: 'right' }}>LUFS</th>
                  <th style={{ padding: '5px 4px', fontWeight: 600 }}>CARACTÈRE</th>
                </tr></thead>
                <tbody>
                  {Object.entries(MAUDIO).filter(([k, v]) => v != null).map(([k, v]) =>
                  <tr key={k} style={{ borderTop: '.5px solid rgba(247,243,237,.08)' }}>
                      <td style={{ padding: '5px 4px', color: '#FF6A00', fontWeight: 700 }}>{v.id}</td>
                      <td style={{ padding: '5px 4px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{v.dur}</td>
                      <td style={{ padding: '5px 4px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: 'rgba(247,243,237,.8)' }}>{v.vol}</td>
                      <td style={{ padding: '5px 4px', color: 'rgba(247,243,237,.8)', fontStyle: 'italic', fontSize: 9.5 }}>{v.character}</td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div style={{ marginTop: 10, fontSize: 9.5, color: 'rgba(247,243,237,.55)', lineHeight: 1.5 }}>
                Les cues sont des slots. Le shell doit fournir l'asset (WAV/OGG ≤ 50KB, mono 44.1kHz). Si pas de cue → silence ; jamais de fallback générique.
              </div>
            </div>

            {/* Failsafe matrix */}
            <div style={{ background: '#FFFFFF', borderRadius: 10, padding: 18, border: '.5px solid rgba(17,20,24,.08)' }}>
              <div style={{ fontSize: 9, color: '#FF6A00', fontWeight: 700, letterSpacing: '0.14em', fontFamily: 'ui-monospace, monospace', marginBottom: 12 }}>FAILSAFE · CAPABILITY-BASED</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 10.5 }}>
                {[
                ['no backdrop-filter (Wayland sans composer blur)', 'rgba(255,255,255,.85) opaque ; dither x2'],
                ['no clip-path (vieux Qt 5)', 'fade + scale uniquement ; jamais de mask'],
                ['no spring (custom-fail)', 'ease=elastic remplacé par ease=overshoot'],
                ['no particle layer', 'flash de luminosité 60ms sur la rangée'],
                ['prefers-reduced-motion: reduce', 'toute la table reduced-motion s\'active globalement'],
                ['low-end GPU détecté', 'tout HEAVY est dégradé en LIGHT ; durations × 0.7']].
                map(([cond, mit]) =>
                <div key={cond} style={{ display: 'flex', gap: 10, fontFamily: 'ui-monospace, monospace' }}>
                    <span style={{ color: '#FF6A00', fontWeight: 700, flexShrink: 0, width: 220 }}>{cond}</span>
                    <span style={{ color: 'rgba(17,20,24,.75)', fontFamily: 'ui-sans-serif, system-ui, sans-serif', fontSize: 11 }}>{mit}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </FitScale>);

}

// ── Handoff / next steps ─────────────────────────────────────────────
function MotionNext() {
  return (
    <FitScale w={1280} h={720} background="#0B0D10">
      <div style={{ width: 1280, height: 720, background: '#0B0D10', color: '#F7F3ED', padding: 60, boxSizing: 'border-box', fontFamily: 'ui-sans-serif, system-ui, sans-serif', position: 'relative', overflow: 'hidden' }}>
        <DitherBg color="#FF6A00" opacity={0.05} />
        <GrainBg opacity={0.06} />
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 10, color: '#FF6A00', fontWeight: 700, letterSpacing: '0.18em', fontFamily: 'ui-monospace, monospace' }}>HANDOFF · PROCHAINES ÉTAPES</div>
          <div style={{ fontSize: 36, fontWeight: 600, letterSpacing: '-0.02em', marginTop: 6, lineHeight: 1.05 }}>De cette fiche au shell qui anime.</div>
          <div style={{ fontSize: 14, color: 'rgba(247,243,237,.6)', marginTop: 8, maxWidth: 880, lineHeight: 1.55 }}>
            Trois chantiers pour brancher cette fiche dans Quickshell/Qt/GPUI sans la dénaturer. Chacun est un sprint isolable.
          </div>

          <div style={{ marginTop: 36, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 22 }}>
            {[
            {
              n: '01', label: 'GENERATOR',
              title: 'Compiler les tokens en .gpui.rs/.h/.qml',
              steps: [
              'parser : prendre MDUR + MEASE → générer les constantes par moteur',
              'output 1 : gnu_motion.gpui.rs (GPUI Duration + easing closures)',
              'output 2 : gnu_motion.h (struct C++ constexpr)',
              'output 3 : gnu_motion.qml (singleton Quickshell, opt-in)',
              'sortie déterministe → diff git lisible']

            },
            {
              n: '02', label: 'CONTRACT',
              title: 'Déclarer les contrats menu côté Quickshell',
              steps: [
              'chaque menu déclare son archétype (01..05) en property',
              'le moteur choisit la recette R.0n en lookup table',
              'molécules exposées comme verbes : menu.open(at: pointer)',
              'pas de magie : tout est lisible dans l\'inspecteur Quickshell',
              'reduced-motion détecté via system bus, non hard-codé']

            },
            {
              n: '03', label: 'AUDIT',
              title: 'CI motion-budget : pas de slop',
              steps: [
              'lint : interdire literal durations dans le code des menus',
              'profile : capturer un FPS trace au moindre commit',
              'régression : storyboard de la fiche rejoué headless',
              'visual diff sur capture vs golden',
              'fail si une animation dépasse son budget perf déclaré']

            }].
            map((c) =>
            <div key={c.n} style={{ background: 'rgba(255,255,255,.04)', borderRadius: 10, padding: 18, border: '.5px solid rgba(255,255,255,.07)' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                  <span style={{ fontSize: 28, color: '#FF6A00', fontWeight: 700, fontFamily: 'ui-monospace, monospace', lineHeight: 1 }}>{c.n}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', fontFamily: 'ui-monospace, monospace', color: '#FF6A00' }}>{c.label}</span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, marginTop: 8, lineHeight: 1.3 }}>{c.title}</div>
                <ul style={{ margin: '12px 0 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {c.steps.map((s, i) =>
                <li key={i} style={{ fontSize: 11, color: 'rgba(247,243,237,.7)', lineHeight: 1.55, display: 'flex', gap: 8 }}>
                      <span style={{ color: '#FF6A00', flexShrink: 0 }}>▸</span>
                      <span>{s}</span>
                    </li>
                )}
                </ul>
              </div>
            )}
          </div>

          <div style={{ marginTop: 40, padding: 20, borderRadius: 10, background: 'rgba(255,106,0,.12)', border: '.5px solid rgba(255,106,0,.4)' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', fontFamily: 'ui-monospace, monospace', color: '#FF6A00' }}>FEUILLE DE ROUTE · V2 → V3</div>
              <span style={{ fontSize: 9, color: 'rgba(247,243,237,.45)', fontFamily: 'ui-monospace, monospace', letterSpacing: '0.06em' }}>(triage gnosis · 2026.05)</span>
            </div>
            <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
              {[
                {
                  bucket: 'V2 · IN SCOPE', tone: '#FF6A00', count: 4,
                  items: [
                    { tag: '★', label: 'Multi-écran · retarget cross-display', note: 'priorité — multi-output Wayland natif' },
                    { tag: '✓', label: 'GPU dynamique · MDUR adaptatif refresh-rate', note: 'OS distribué multi-hardware' },
                    { tag: '✓', label: 'Wayland fractional scaling · recalibrer MDIST', note: '' },
                    { tag: '✓', label: 'Notification toasts · recette R.06', note: '' },
                  ],
                },
                {
                  bucket: 'V3 · LATER', tone: '#5F7F52', count: 1,
                  items: [
                    { tag: '→', label: 'Drag-drop preview · motion contract distinct', note: 'arch nécessaire avant' },
                  ],
                },
                {
                  bucket: 'BACKLOG', tone: 'rgba(247,243,237,.45)', count: 1,
                  items: [
                    { tag: '↓', label: 'Voiceover · motion sync screen-reader', note: 'pas prioritaire actuellement' },
                  ],
                },
              ].map((col) => (
                <div key={col.bucket} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, paddingBottom: 6, borderBottom: `.5px solid ${col.tone === 'rgba(247,243,237,.45)' ? 'rgba(247,243,237,.15)' : col.tone + '66'}` }}>
                    <span style={{ fontSize: 9, fontFamily: 'ui-monospace, monospace', fontWeight: 700, letterSpacing: '0.12em', color: col.tone }}>{col.bucket}</span>
                    <span style={{ fontSize: 9, color: 'rgba(247,243,237,.4)', fontFamily: 'ui-monospace, monospace', fontVariantNumeric: 'tabular-nums', marginLeft: 'auto' }}>{col.count}</span>
                  </div>
                  {col.items.map((it, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <span style={{ color: col.tone, fontWeight: 700, fontFamily: 'ui-monospace, monospace', fontSize: 11, flexShrink: 0, lineHeight: 1.4, minWidth: 12 }}>{it.tag}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11.5, color: 'rgba(247,243,237,.9)', lineHeight: 1.4, fontWeight: 500 }}>{it.label}</div>
                        {it.note && <div style={{ fontSize: 10, color: 'rgba(247,243,237,.5)', lineHeight: 1.4, marginTop: 2, fontFamily: 'ui-monospace, monospace' }}>{it.note}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 12, fontSize: 10, color: 'rgba(247,243,237,.45)', fontFamily: 'ui-monospace, monospace', letterSpacing: '0.06em' }}>
            <SysterGlyph size={20} />
            <span>fin · Gnu.in Labs · motion spec v0.14.0 · 2026.06</span>
            <span style={{ marginLeft: 'auto' }}>contact : motion@gnu.in</span>
          </div>
        </div>
      </div>
    </FitScale>);

}

Object.assign(window, {
  MotionCover, MotionManifesto, MotionTaxonomy,
  MotionTokens, MotionMomentMatrix, MotionEngineHandoff,
  MotionReducedAudio, MotionNext, MotionChangelog, EasingMini
});

// ── Changelog · v1 → v3.1 ────────────────────────────────────────────
const MOTION_CHANGELOG = [
  {
    version: 'v0.14.0', date: '2026.06', label: 'MOTEUR blob.in · Rust/cxx', highlight: true,
    by: 'gnosis · P0→P5',
    items: [
      { tag: '★', kind: 'arch',    text: 'Moteur de formes organiques porté C++ → Rust (blobin-core) : géométrie, tessellation lyon, solveurs spring/easing, matériaux, états. Le C++ (blobin-qt) réduit à un shim de rendu QSG de 205 LoC' },
      { tag: '★', kind: 'arch',    text: 'Renumbering v3.1 → v0.14.0 : la spec suit le semver du moteur blob.in (4.0/P-series). Branding v3.1 purgé' },
      { tag: '✓', kind: 'fix',     text: 'Boucle tokens fermée : tokens.json → blobin-gen → tokens.rs (+ QML/H/Dart). La colonne token pointe une const générée, garde-fou CI anti-drift' },
      { tag: '✓', kind: 'fix',     text: 'Parité matière (P3) : raster CPU miroir de blob.frag + golden pixel-diff/SSIM. A attrapé un bug gradient (remplacement vs voile composité), corrigé des deux côtés' },
      { tag: '✓', kind: 'fix',     text: 'Pool solveur dédié (P4, rayon) hors thread Qt + bascule BLOBIN_BACKEND=rust|cpp. Veille = immobile → froid → frames coupées' },
      { tag: '→', kind: 'roadmap', text: 'P5 readiness (∞.8) : R1–R6 auto verts, R7–R10 manuels en attente avant bascule rust par défaut. Recettes radiales M.12 BubbleBloom à venir' },
    ],
  },
  {
    version: 'v3.1', date: '2026.05', label: 'sync Context Spec', highlight: false,
    by: 'gnosis · review pass',
    items: [
      { tag: '★', kind: 'arch',    text: 'Sync avec Context Spec v3.1 — les 5 recettes motion servent désormais 8 archétypes (R.06 notif, R.07 power, R.08 ✦ launcher partagent M.01/M.02/M.10 via les tokens MDUR/MEASE)' },
      { tag: '✓', kind: 'fix',     text: 'FitScale · mesure offsetWidth au lieu de getBoundingClientRect — plus de double-scale en focus mode, les cards s\'affichent à la bonne échelle' },
      { tag: '✓', kind: 'fix',     text: 'Colonnes spec + zones snippets en overflow:auto — scrollbar individuel par card quand le contenu dépasse 720 px (atomes, molécules, recettes, outils)' },
      { tag: '→', kind: 'roadmap', text: 'Audio · prochain pass : 6 cues réels (cassette/click/dither) — actuellement placeholders dans MAUDIO' },
      { tag: '+', kind: 'doc',     text: 'Motion Spec et Context Spec partagent les tokens — un seul tokens.json en build-time, généré vers gnu_theme.{qml,h,dart}' },
    ],
  },
  {
    version: 'v2', date: '2026.05', label: 'STABILISATION',
    by: 'gnosis · review pass',
    items: [
      { tag: '★', kind: 'design', text: 'M.10 listening · forme ronde + ton REC (#E63A1F) — distinct du signal orange, charge "écoute/REC" assumée' },
      { tag: '✓', kind: 'fix',    text: 'Alignement centres anneau/disque — box-sizing: border-box sur A.10, M.10, M.12, R.04 (bubbles, sub-bubbles, central node)' },
      { tag: '→', kind: 'roadmap',text: 'Triage v2/v3/backlog des questions ouvertes — 4 entrées V2 (★ multi-écran prioritaire), 1 V3, 1 backlog' },
      { tag: '+', kind: 'doc',    text: 'Panneau changelog ajouté à la fiche — historique versionné' },
    ],
  },
  {
    version: 'v1', date: '2026.05', label: 'INITIAL',
    by: 'foundation',
    items: [
      { tag: '+', kind: 'arch',   text: 'Architecture en 3 échelles · 15 atomes · 12 molécules · 5 recettes · 11 moments' },
      { tag: '+', kind: 'tokens', text: 'Tokens neutres MDUR / MEASE / MDIST / MPERF / MAUDIO + mapping QML / Qt C++ / GPUI / CSS' },
      { tag: '★', kind: 'design', text: 'Recette signature R.04 bubble-tree · spring radial · sub-bloom à la sélection' },
      { tag: '+', kind: 'a11y',   text: 'Reduced-motion · fallback explicite par atome · audio cue library (6 slots placeholder)' },
      { tag: '+', kind: 'a11y',   text: 'Failsafe matrix · capability-based (no backdrop-filter, no clip-path, no spring, no particle, low-end GPU)' },
      { tag: '+', kind: 'tool',   text: 'Scrubber + replay + play/pause sur chaque card · time-driven via useMotionTime()' },
    ],
  },
];

function MotionChangelog() {
  return (
    <FitScale w={1280} h={720} background="#FBFAF6">
      <div style={{ width: 1280, height: 720, background: '#FBFAF6', color: '#111418', padding: 52, boxSizing: 'border-box', fontFamily: 'ui-sans-serif, system-ui, sans-serif', position: 'relative' }}>
        <div style={{ fontSize: 10, color: '#FF6A00', fontWeight: 700, letterSpacing: '0.18em', fontFamily: 'ui-monospace, monospace' }}>HISTORIQUE · VERSION LOG</div>
        <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em', marginTop: 6, lineHeight: 1.1 }}>Ce qui a changé, et pourquoi.</div>
        <div style={{ fontSize: 12, color: 'rgba(17,20,24,.6)', marginTop: 4, maxWidth: 760, lineHeight: 1.55 }}>
          Chaque release annote ses corrections (✓), ses décisions design (★), ses ajouts (+), ses entrées de roadmap (→). À tenir à jour à chaque pass — c'est le fil rouge entre la fiche et le shell qui anime.
        </div>

        <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 22 }}>
          {MOTION_CHANGELOG.map((v) => {
            const kindTone = {
              design:  '#E63A1F',
              fix:     '#5F7F52',
              roadmap: '#FF6A00',
              doc:     'rgba(17,20,24,.55)',
              arch:    '#111418',
              tokens:  '#FF6A00',
              a11y:    '#5F7F52',
              tool:    'rgba(17,20,24,.6)',
            };
            return (
              <div key={v.version} style={{
                background: v.highlight ? '#FFFFFF' : 'transparent',
                borderRadius: 10,
                padding: v.highlight ? '18px 22px' : '14px 22px',
                border: v.highlight ? '.5px solid rgba(255,106,0,.5)' : '.5px solid rgba(17,20,24,.08)',
                boxShadow: v.highlight ? '0 4px 14px rgba(255,106,0,.10)' : 'none',
                display: 'grid', gridTemplateColumns: '140px 1fr', columnGap: 24,
              }}>
                {/* Version chip column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: 22, fontWeight: 700, color: v.highlight ? '#FF6A00' : '#111418', fontFamily: 'ui-monospace, monospace', letterSpacing: '-0.02em' }}>{v.version}</span>
                    {v.highlight && <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', fontFamily: 'ui-monospace, monospace', color: '#FF6A00', padding: '2px 6px', background: 'rgba(255,106,0,.14)', borderRadius: 3 }}>CURRENT</span>}
                  </div>
                  <span style={{ fontSize: 10, fontFamily: 'ui-monospace, monospace', color: 'rgba(17,20,24,.55)' }}>{v.date}</span>
                  <span style={{ fontSize: 10, fontFamily: 'ui-monospace, monospace', color: 'rgba(17,20,24,.55)', fontWeight: 700, letterSpacing: '0.1em' }}>{v.label}</span>
                  <span style={{ fontSize: 10, color: 'rgba(17,20,24,.45)', marginTop: 6, fontFamily: 'ui-monospace, monospace' }}>by {v.by}</span>
                </div>

                {/* Items column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {v.items.map((it, i) => {
                    const tone = kindTone[it.kind] || '#111418';
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <span style={{
                          width: 22, height: 22, borderRadius: '50%',
                          background: tone, color: tone === 'rgba(17,20,24,.55)' || tone === 'rgba(17,20,24,.6)' ? '#fff' : '#fff',
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 700, fontFamily: 'ui-monospace, monospace', flexShrink: 0,
                          boxSizing: 'border-box',
                        }}>{it.tag}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12.5, color: '#111418', lineHeight: 1.45 }}>
                            <span style={{ fontSize: 9, fontFamily: 'ui-monospace, monospace', fontWeight: 700, letterSpacing: '0.1em', color: tone, marginRight: 8, textTransform: 'uppercase' }}>{it.kind}</span>
                            {it.text}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ position: 'absolute', bottom: 24, left: 52, right: 52, display: 'flex', alignItems: 'center', gap: 16, fontSize: 10, color: 'rgba(17,20,24,.55)', fontFamily: 'ui-monospace, monospace', letterSpacing: '0.04em' }}>
          <span><span style={{ color: '#E63A1F', fontWeight: 700 }}>★</span> décision design</span>
          <span><span style={{ color: '#5F7F52', fontWeight: 700 }}>✓</span> correction / a11y</span>
          <span><span style={{ color: '#FF6A00', fontWeight: 700 }}>→</span> roadmap</span>
          <span><span style={{ color: '#111418', fontWeight: 700 }}>+</span> ajout</span>
          <span style={{ marginLeft: 'auto' }}>v2 stabilisée · v3 en backlog</span>
        </div>
      </div>
    </FitScale>
  );
}