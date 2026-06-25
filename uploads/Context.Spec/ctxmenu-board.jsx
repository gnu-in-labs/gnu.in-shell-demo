// ctxmenu-board.jsx
// Cover, manifesto, taxonomy, archetype × moment matrix, handoff.

/* ════════════════════════════════════════════════════════════════════
   Cover
   ════════════════════════════════════════════════════════════════════ */

function CtxCover() {
  return (
    <FitScale w={1280} h={720} background="#0B0D10">
      <div style={{
        width: 1280, height: 720, background: '#0B0D10', color: '#F7F3ED',
        position: 'relative', overflow: 'hidden',
        fontFamily: 'ui-sans-serif, system-ui, sans-serif'
      }}>
        <DitherBg color="#FF6A00" opacity={0.07} />
        <GrainBg opacity={0.08} />
        <div style={{ position: 'absolute', inset: 60, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <SysterGlyph size={56} hover />
            <div>
              <div style={{ fontSize: 11, color: '#FF6A00', fontWeight: 700, letterSpacing: '0.18em', fontFamily: 'ui-monospace, monospace' }}>GNU.IN-SHELL · CONTEXT SPEC v0.4.0</div>
              <div style={{ fontSize: 48, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1 }}>Right-click contracts</div>
              <div style={{ fontSize: 20, color: 'rgba(247,243,237,.6)', marginTop: 4, fontWeight: 400 }}>24 atomes · 16 molécules · 8 recettes · 6 outils prod · 31 portes fermées · ready</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 32, marginTop: 14, flex: 1 }}>
            <div>
              <div style={{ fontSize: 18, lineHeight: 1.55, color: 'rgba(247,243,237,.85)', maxWidth: 580 }}>
                v1 a posé les <span style={{ color: '#FF6A00', fontWeight: 600 }}>5 archétypes</span> et leurs déclinaisons. v2 les <i>décompose</i> : chaque rangée, chaque header, chaque cluster est désormais un asset autonome — branchable, théméable, codé en quatre moteurs.
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.6, color: 'rgba(247,243,237,.6)', maxWidth: 580, marginTop: 14 }}>
                Lis cette fiche du bas vers le haut : 12 atomes → 8 molécules → 5 recettes. Chaque card pose une démo, ses tokens, ses moteurs. La motion vit dans un document jumeau (Motion Spec). Les deux fiches se complètent — pas de duplication.
              </div>
              <div style={{ marginTop: 22, display: 'flex', gap: 10, fontSize: 10, fontFamily: 'ui-monospace, monospace', flexWrap: 'wrap' }}>
                {['NEU · tokens', 'CSS · web ref', 'QML · Quickshell', 'QT · C++', 'FLU · Flutter'].map((t) =>
                <span key={t} style={{ padding: '4px 10px', background: 'rgba(255,106,0,.14)', color: '#FF6A00', borderRadius: 3, fontWeight: 700, letterSpacing: '0.08em' }}>{t}</span>
                )}
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,.04)', borderRadius: 12, padding: 20, border: '.5px solid rgba(255,255,255,.06)' }}>
              <div style={{ fontSize: 10, color: '#FF6A00', fontWeight: 700, letterSpacing: '0.14em', fontFamily: 'ui-monospace, monospace', marginBottom: 14 }}>INVENTAIRE · v0.4.0</div>
              {[
              { n: '24', l: 'atomes', s: 'row · kbd · toggle · avatar · badge · slider …' },
              { n: '16', l: 'molécules', s: 'section · header · search · toast · empty · breadcrumb' },
              { n: '8', l: 'recettes', s: 'empty · widget · window · ★ bubble · tray · notif · power · ✦ launcher' },
              { n: '6', l: 'outils', s: 'icons · i18n · states · perf · telemetry · readiness' },
              { n: '54', l: 'snippets', s: 'tous compilables · non pseudo-code' }].
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
            <span style={{ padding: '4px 10px', borderRadius: 3, background: 'rgba(255,106,0,.15)', color: '#FF6A00', fontWeight: 700 }}>CONTEXT SPEC v0.4.0</span>
            <span>compagnon du Motion Spec v0.4.0 · même grammaire d'atomes</span>
            <span style={{ marginLeft: 'auto' }}>2026.06 · cible : Quickshell · Qt 6.6 · Flutter 3.22</span>
          </div>
        </div>
      </div>
    </FitScale>);

}

/* ════════════════════════════════════════════════════════════════════
   Manifeste
   ════════════════════════════════════════════════════════════════════ */

function CtxManifesto() {
  return (
    <FitScale w={1280} h={720} background="#FBFAF6">
      <div style={{
        width: 1280, height: 720, background: '#FBFAF6', color: '#111418',
        padding: 60, boxSizing: 'border-box', overflow: 'auto',
        fontFamily: 'ui-sans-serif, system-ui, sans-serif'
      }}>
        <div style={{ fontSize: 10, color: '#FF6A00', fontWeight: 700, letterSpacing: '0.18em', fontFamily: 'ui-monospace, monospace' }}>MANIFESTE · LECTURE</div>
        <div style={{ fontSize: 40, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05, marginTop: 8, maxWidth: 920 }}>
          Une grammaire en trois échelles, livrée avec son code.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 28, marginTop: 36 }}>
          {[
          { n: '01', label: 'ATOMES (12)', kw: 'row · kbd · chevron · toggle · swatch',
            text: 'Les briques visuelles indivisibles du menu. Chacune fait une chose, à une taille, avec un état clair. Théméables via les tokens GnuTheme.',
            detail: 'Pour chaque atome : démo isolée + tokens + snippet QML / Qt / Flutter / CSS. Lit-toi du bas vers le haut quand tu construis un nouveau menu.' },
          { n: '02', label: 'MOLÉCULES (8)', kw: 'section · header · tile · radial · bubble',
            text: 'Compositions nommées d\'atomes : une « brique » sémantique reconnaissable. C\'est ici que le menu prend forme — section regroupée, header brandé, sélecteur visuel.',
            detail: 'Chaque molécule cite ses atomes (Composé de…). Tu peux la remplacer par une version dégradée si une feature moteur manque — cf. compat handoff.' },
          { n: '03', label: 'RECETTES (5)', kw: 'empty · widget · window · ★ bubble · tray',
            text: 'Les 5 archétypes complets de v1, présentés en démo vivante avec leur code source par moteur. Branche-les tels quels sur ton runtime — ou fork.',
            detail: 'Chaque recette nomme son archétype (01..05) et son trigger (clic-droit sur quoi). Une seule règle d\'or : ne JAMAIS voler le clic-droit aux apps.' }].
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
            <div style={{ fontSize: 10, color: '#FF6A00', fontWeight: 700, letterSpacing: '0.14em', fontFamily: 'ui-monospace, monospace' }}>RÈGLES NON-NÉGOCIABLES</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12, fontSize: 13, lineHeight: 1.5 }}>
              {[
              ['1.', 'L\'app GARDE son clic-droit. Le shell n\'intercepte que ses propres surfaces (title-bar, tray, bureau, widgets).'],
              ['2.', 'L\'origine du menu = la position exacte du curseur. Pas le centre. Pas le coin.'],
              ['3.', 'Une seule molécule mascotte par menu — toujours en 1re position si présente.'],
              ['4.', 'Pas de cascade dans les menus de barre système. Tout doit être visible d\'un coup.'],
              ['5.', 'La sortie est plus rapide que l\'entrée (200 ms / 280 ms). Cf. Motion Spec.']].
              map(([n, t]) =>
              <div key={n} style={{ display: 'flex', gap: 10 }}>
                  <span style={{ color: '#FF6A00', fontWeight: 700, fontFamily: 'ui-monospace, monospace', flexShrink: 0 }}>{n}</span>
                  <span>{t}</span>
                </div>
              )}
            </div>
          </div>

          <div style={{ padding: 22, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 10, color: '#FF6A00', fontWeight: 700, letterSpacing: '0.14em', fontFamily: 'ui-monospace, monospace' }}>COMMENT LIRE CHAQUE CARD</div>
              <div style={{ fontSize: 13, lineHeight: 1.55, marginTop: 12 }}>
                Chaque card a une <b>démo vivante</b> à gauche (hover cycle automatique) et une <b>colonne spec</b> à droite : tokens d'anatomie, atomes le composant, et 5 onglets de snippets.
                Click sur l'onglet QML / QT / FLU pour copier-coller dans ton moteur de prédilection. NEU est l'expression neutre des tokens — la source de vérité.
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 16, fontSize: 11, color: 'rgba(17,20,24,.55)', fontFamily: 'ui-monospace, monospace', letterSpacing: '0.04em' }}>
              <div>SECT 1 — manifeste · taxonomie · tokens</div>
              <div>SECT 2 — C.01 → C.12 atomes</div>
              <div>SECT 3 — CM.01 → CM.08 molécules</div>
              <div>SECT 4 — R.01 → R.05 recettes</div>
              <div>SECT 5 — moment-matrix · handoff</div>
            </div>
          </div>
        </div>
      </div>
    </FitScale>);

}

/* ════════════════════════════════════════════════════════════════════
   Taxonomie · 3 colonnes
   ════════════════════════════════════════════════════════════════════ */

function CtxTaxonomy() {
  return (
    <FitScale w={1280} h={720} background="#FBFAF6">
      <div style={{
        width: 1280, height: 720, background: '#FBFAF6', color: '#111418',
        padding: 60, boxSizing: 'border-box',
        fontFamily: 'ui-sans-serif, system-ui, sans-serif'
      }}>
        <div style={{ fontSize: 10, color: '#FF6A00', fontWeight: 700, letterSpacing: '0.18em', fontFamily: 'ui-monospace, monospace' }}>TAXONOMIE · 12 + 8 + 5 = 25 ASSETS</div>
        <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em', marginTop: 6, lineHeight: 1.1 }}>De la rangée à la recette complète.</div>
        <div style={{ fontSize: 13, color: 'rgba(17,20,24,.6)', marginTop: 4, maxWidth: 760, lineHeight: 1.5 }}>
          Chaque colonne consomme la précédente. Tu peux entrer par n'importe quel niveau — atomes pour bricoler une rangée custom, molécules pour assembler un menu, recettes pour brancher direct.
        </div>

        <div style={{ marginTop: 36, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24, height: 470 }}>
          {/* Atomes */}
          <div style={{ background: '#FFFFFF', borderRadius: 10, padding: 18, border: '.5px solid rgba(17,20,24,.08)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ padding: '3px 8px', fontSize: 9, fontFamily: 'ui-monospace, monospace', fontWeight: 700, letterSpacing: '0.12em', background: '#111418', color: '#FF6A00', borderRadius: 3 }}>ATOMES</span>
              <span style={{ fontSize: 18, fontWeight: 600, fontFamily: 'ui-monospace, monospace' }}>12</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 11, fontFamily: 'ui-monospace, monospace' }}>
              {CTX_ATOMS.map((a) =>
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: '#FF6A00', fontWeight: 700, fontVariantNumeric: 'tabular-nums', minWidth: 38 }}>{a.id}</span>
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</span>
                </div>
              )}
            </div>
          </div>

          {/* Molécules */}
          <div style={{ background: '#FFFFFF', borderRadius: 10, padding: 18, border: '.5px solid rgba(17,20,24,.08)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ padding: '3px 8px', fontSize: 9, fontFamily: 'ui-monospace, monospace', fontWeight: 700, letterSpacing: '0.12em', background: '#5F7F52', color: '#F7F3ED', borderRadius: 3 }}>MOLÉCULES</span>
              <span style={{ fontSize: 18, fontWeight: 600, fontFamily: 'ui-monospace, monospace' }}>8</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 11, fontFamily: 'ui-monospace, monospace' }}>
              {CTX_MOLECULES.map((m) =>
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: '#5F7F52', fontWeight: 700, fontVariantNumeric: 'tabular-nums', minWidth: 44 }}>{m.id}</span>
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.title.replace(' · ', ' / ')}</span>
                </div>
              )}
            </div>
            <div style={{ marginTop: 'auto', paddingTop: 12, fontSize: 9, color: 'rgba(17,20,24,.5)', fontFamily: 'ui-monospace, monospace', lineHeight: 1.5 }}>
              chaque molécule cite explicitement ses atomes
            </div>
          </div>

          {/* Recettes */}
          <div style={{ background: '#FFFFFF', borderRadius: 10, padding: 18, border: '.5px solid rgba(17,20,24,.08)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ padding: '3px 8px', fontSize: 9, fontFamily: 'ui-monospace, monospace', fontWeight: 700, letterSpacing: '0.12em', background: '#FF6A00', color: '#1A0A00', borderRadius: 3 }}>RECETTES</span>
              <span style={{ fontSize: 18, fontWeight: 600, fontFamily: 'ui-monospace, monospace' }}>5</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 11, fontFamily: 'ui-monospace, monospace' }}>
              {CTX_RECETTES.map((r) =>
              <div key={r.id} style={{
                padding: 10, borderRadius: 6,
                background: r.signature ? 'rgba(255,106,0,.08)' : 'rgba(17,20,24,.03)',
                border: r.signature ? '.5px solid rgba(255,106,0,.4)' : '.5px solid transparent'
              }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: '#FF6A00', fontWeight: 700, fontVariantNumeric: 'tabular-nums', minWidth: 36 }}>{r.id}</span>
                    <span style={{ flex: 1, fontWeight: 600, fontFamily: 'ui-sans-serif, system-ui, sans-serif', fontSize: 12 }}>{r.title.split(' · ')[0]}{r.signature && ' ★'}</span>
                  </div>
                  <div style={{ marginTop: 4, fontSize: 9.5, color: 'rgba(17,20,24,.55)', lineHeight: 1.4 }}>
                    {r.atoms.length} bloc{r.atoms.length > 1 ? 's' : ''} · {r.title.split(' · ').slice(1).join(' · ')}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 22, fontSize: 11, color: 'rgba(17,20,24,.55)', fontFamily: 'ui-monospace, monospace', letterSpacing: '0.04em', lineHeight: 1.6 }}>
          atomes → indépendants · théméables · une démo · une anatomie · 5 snippets  ·  molécules → 3-6 atomes · une intention sémantique  ·  recettes → orchestration complète d'un archétype
        </div>
      </div>
    </FitScale>);

}

/* ════════════════════════════════════════════════════════════════════
   Tokens reference (palette · density · shape)
   ════════════════════════════════════════════════════════════════════ */

function CtxTokens() {
  const swatches = [
  { name: 'Anthracite', hex: '#111418', role: 'console face · ink' },
  { name: 'Signal Orange', hex: '#FF6A00', role: 'accent · hot action' },
  { name: 'Beret Green', hex: '#5F7F52', role: 'mascotte · stable state' },
  { name: 'Shell White', hex: '#F7F3ED', role: 'paper · light UI' }];

  const derived = [
  { k: 'soft', hex: '#F7F8FA' }, { k: 'gray', hex: '#E6E8EB' },
  { k: 'line', hex: '#D7DADF' }, { k: 'stone', hex: '#A1A6AD' },
  { k: 'slate', hex: '#667085' }, { k: 'bezel', hex: '#2B3037' }];

  return (
    <FitScale w={1280} h={720} background="#FBFAF6">
      <div style={{ width: 1280, height: 720, background: '#FBFAF6', color: '#111418', padding: 52, boxSizing: 'border-box', fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>
        <div style={{ fontSize: 10, color: '#FF6A00', fontWeight: 700, letterSpacing: '0.18em', fontFamily: 'ui-monospace, monospace' }}>TOKENS · PALETTE · DENSITY · SHAPE</div>
        <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em', marginTop: 6 }}>La matière des menus.</div>

        <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: '1.3fr 1fr 1fr', gap: 24 }}>
          {/* Palette */}
          <div style={{ background: '#FFFFFF', borderRadius: 10, padding: 20, border: '.5px solid rgba(17,20,24,.08)' }}>
            <div style={{ fontSize: 9, color: '#FF6A00', fontWeight: 700, letterSpacing: '0.14em', fontFamily: 'ui-monospace, monospace', marginBottom: 14 }}>CORE · 4 + 6 DERIVED</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {swatches.map((s) =>
              <div key={s.hex} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 6, background: s.hex, border: '.5px solid rgba(17,20,24,.1)', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{s.name}</div>
                    <div style={{ fontSize: 10, color: 'rgba(17,20,24,.55)', fontFamily: 'ui-monospace, monospace' }}>{s.hex} · {s.role}</div>
                  </div>
                </div>
              )}
            </div>
            <div style={{ marginTop: 16, paddingTop: 12, borderTop: '.5px solid rgba(17,20,24,.08)' }}>
              <div style={{ fontSize: 9, color: 'rgba(17,20,24,.5)', fontFamily: 'ui-monospace, monospace', marginBottom: 6, letterSpacing: '0.08em' }}>DERIVED NEUTRALS</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {derived.map((d) =>
                <div key={d.k} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 14, height: 14, background: d.hex, borderRadius: 3, border: '.5px solid rgba(17,20,24,.1)' }} />
                    <span style={{ fontSize: 9.5, fontFamily: 'ui-monospace, monospace', color: 'rgba(17,20,24,.65)' }}>{d.k}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Density */}
          <div style={{ background: '#FFFFFF', borderRadius: 10, padding: 20, border: '.5px solid rgba(17,20,24,.08)' }}>
            <div style={{ fontSize: 9, color: '#FF6A00', fontWeight: 700, letterSpacing: '0.14em', fontFamily: 'ui-monospace, monospace', marginBottom: 14 }}>DENSITY · 3 PRESETS</div>
            <table style={{ width: '100%', fontSize: 11, borderCollapse: 'collapse', fontFamily: 'ui-monospace, monospace' }}>
              <thead><tr style={{ fontSize: 9, color: 'rgba(17,20,24,.5)', textAlign: 'left' }}>
                <th style={{ padding: '4px 0', fontWeight: 600 }}>preset</th>
                <th style={{ padding: '4px 0', fontWeight: 600 }}>row-h</th>
                <th style={{ padding: '4px 0', fontWeight: 600 }}>fs</th>
                <th style={{ padding: '4px 0', fontWeight: 600 }}>icon</th>
              </tr></thead>
              <tbody>
                {[
                ['mouse', '26', '12', '14'],
                ['comfy', '32', '13', '16'],
                ['touch', '44', '14', '18']].
                map(([p, h, fs, ic]) =>
                <tr key={p} style={{ borderTop: '.5px solid rgba(17,20,24,.06)' }}>
                    <td style={{ padding: '8px 0', color: '#FF6A00', fontWeight: 700 }}>{p}</td>
                    <td style={{ padding: '8px 0', fontVariantNumeric: 'tabular-nums' }}>{h} px</td>
                    <td style={{ padding: '8px 0', fontVariantNumeric: 'tabular-nums' }}>{fs} px</td>
                    <td style={{ padding: '8px 0', fontVariantNumeric: 'tabular-nums' }}>{ic} px</td>
                  </tr>
                )}
              </tbody>
            </table>
            <div style={{ marginTop: 16, fontSize: 10.5, color: 'rgba(17,20,24,.6)', lineHeight: 1.55 }}>
              Le shell DOIT pouvoir basculer entre densités en temps réel (Quickshell reactive). Toutes les démos de ce board sont en <b>mouse</b> par défaut.
            </div>
          </div>

          {/* Shape */}
          <div style={{ background: '#FFFFFF', borderRadius: 10, padding: 20, border: '.5px solid rgba(17,20,24,.08)' }}>
            <div style={{ fontSize: 9, color: '#FF6A00', fontWeight: 700, letterSpacing: '0.14em', fontFamily: 'ui-monospace, monospace', marginBottom: 14 }}>SHAPE · 4 PRESETS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
              { k: 'rounded', desc: 'menu 12 · row 7', r: 12 },
              { k: 'sharp', desc: 'menu 0 · row 0', r: 0 },
              { k: 'pill', desc: 'menu 14 · row 999', r: 14 },
              { k: 'cut', desc: 'menu 12 · cut TR', r: 12, cut: true }].
              map((s) =>
              <div key={s.k} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                  width: 50, height: 30, background: '#FFFFFF', border: '.5px solid rgba(17,20,24,.2)',
                  borderRadius: s.r === 999 ? 999 : s.r,
                  clipPath: s.cut ? 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)' : 'none'
                }} />
                  <div>
                    <div style={{ fontSize: 11.5, fontWeight: 600 }}>{s.k}</div>
                    <div style={{ fontSize: 10, color: 'rgba(17,20,24,.55)', fontFamily: 'ui-monospace, monospace' }}>{s.desc}</div>
                  </div>
                </div>
              )}
            </div>
            <div style={{ marginTop: 14, fontSize: 10, color: 'rgba(17,20,24,.55)', lineHeight: 1.5, fontFamily: 'ui-monospace, monospace' }}>
              gnuShape(preset) · jamais mélanger les radii dans une même card
            </div>
          </div>
        </div>

        {/* Theme modes preview */}
        <div style={{ marginTop: 28, background: '#FFFFFF', borderRadius: 10, padding: 20, border: '.5px solid rgba(17,20,24,.08)' }}>
          <div style={{ fontSize: 9, color: '#FF6A00', fontWeight: 700, letterSpacing: '0.14em', fontFamily: 'ui-monospace, monospace', marginBottom: 12 }}>THEME RESOLVERS · gnuTheme({'{'} dark, brand {'}'})</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
            {[
            ['light · light', false, 'light'],
            ['light · medium', false, 'medium'],
            ['light · heavy', false, 'heavy'],
            ['dark · light', true, 'light'],
            ['dark · medium', true, 'medium'],
            ['dark · heavy', true, 'heavy']].
            map(([label, dark, brand]) => {
              const tx = gnuTheme({ dark, brand });
              return (
                <div key={label} style={{
                  padding: 12, borderRadius: 6, background: tx.surface, border: `.5px solid ${tx.border}`,
                  color: tx.text, position: 'relative'
                }}>
                  <div style={{ fontSize: 9, color: tx.textDim, fontFamily: 'ui-monospace, monospace', fontWeight: 700, letterSpacing: '0.1em' }}>{label.toUpperCase()}</div>
                  <div style={{ marginTop: 8, height: 6, background: tx.kbdBg, borderRadius: 2 }} />
                  <div style={{ marginTop: 4, height: 6, background: tx.kbdBg, borderRadius: 2, width: '75%' }} />
                  <div style={{ marginTop: 6, padding: '3px 8px', fontSize: 9, background: tx.accent, color: '#fff', borderRadius: 3, display: 'inline-block', fontFamily: 'ui-monospace, monospace', fontWeight: 700 }}>HOT</div>
                </div>);

            })}
          </div>
        </div>
      </div>
    </FitScale>);

}

/* ════════════════════════════════════════════════════════════════════
   Archetype × molecule matrix
   ════════════════════════════════════════════════════════════════════ */

function CtxMatrix() {
  const moleculeRow = (mol, cells) => ({ id: mol.id, title: mol.title.split(' · ')[0], ...cells });
  const archetypes = [
  { id: '01', label: 'Empty space' },
  { id: '02', label: 'Widget' },
  { id: '03', label: 'Window' },
  { id: '04★', label: 'Bubble tree' },
  { id: '05', label: 'Tray' }];

  const rows = [
  moleculeRow(CTX_MOLECULES[0], { '01': '★', '02': '✓', '03': '✓', '04★': '—', '05': '✓' }),
  moleculeRow(CTX_MOLECULES[1], { '01': 'opt', '02': '—', '03': '—', '04★': '—', '05': '—' }),
  moleculeRow(CTX_MOLECULES[2], { '01': '—', '02': '★', '03': '—', '04★': '—', '05': '—' }),
  moleculeRow(CTX_MOLECULES[3], { '01': '—', '02': '—', '03': '★', '04★': '—', '05': '—' }),
  moleculeRow(CTX_MOLECULES[4], { '01': 'opt', '02': '—', '03': '—', '04★': '—', '05': '—' }),
  moleculeRow(CTX_MOLECULES[5], { '01': 'opt', '02': '✓', '03': '—', '04★': '—', '05': '—' }),
  moleculeRow(CTX_MOLECULES[6], { '01': '—', '02': '—', '03': '—', '04★': '★', '05': '—' }),
  moleculeRow(CTX_MOLECULES[7], { '01': '✓', '02': '✓', '03': '✓', '04★': '—', '05': '—' })];

  const cell = (v) => {
    if (v === '—') return { color: 'rgba(17,20,24,.3)', weight: 400 };
    if (v === 'opt') return { color: 'rgba(17,20,24,.55)', weight: 500 };
    if (v === '★') return { color: '#FF6A00', weight: 700, bg: 'rgba(255,106,0,.08)' };
    return { color: '#5F7F52', weight: 700 };
  };
  return (
    <FitScale w={1280} h={720} background="#FBFAF6">
      <div style={{ width: 1280, height: 720, background: '#FBFAF6', color: '#111418', padding: 52, boxSizing: 'border-box', fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>
        <div style={{ fontSize: 10, color: '#FF6A00', fontWeight: 700, letterSpacing: '0.18em', fontFamily: 'ui-monospace, monospace' }}>MATRICE · MOLÉCULE × ARCHÉTYPE</div>
        <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em', marginTop: 6 }}>Qui sert qui.</div>
        <div style={{ fontSize: 13, color: 'rgba(17,20,24,.62)', marginTop: 4, maxWidth: 880, lineHeight: 1.5 }}>
          Lis la cellule : molécule <i>(ligne)</i> dans archétype <i>(colonne)</i>. ★ = canonique. ✓ = utilisable. opt = en variante. — = hors-domaine.
        </div>

        <div style={{ marginTop: 32, background: '#FFFFFF', borderRadius: 10, border: '.5px solid rgba(17,20,24,.08)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'ui-monospace, monospace', fontSize: 11 }}>
            <thead>
              <tr style={{ background: '#111418', color: '#F7F3ED' }}>
                <th style={{ padding: '12px 14px', textAlign: 'left', fontSize: 9, letterSpacing: '0.12em', fontWeight: 700, width: '34%' }}>MOLÉCULE \ ARCHÉTYPE</th>
                {archetypes.map((a) =>
                <th key={a.id} style={{ padding: '10px 10px', textAlign: 'center', fontSize: 9, letterSpacing: '0.08em', fontWeight: 700, color: a.id.includes('★') ? '#FF6A00' : '#F7F3ED' }}>
                    <div>{a.id}</div>
                    <div style={{ fontSize: 9, opacity: 0.65, fontWeight: 500, marginTop: 2, fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>{a.label}</div>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) =>
              <tr key={r.id} style={{ borderTop: '.5px solid rgba(17,20,24,.06)' }}>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ color: '#5F7F52', fontWeight: 700, fontSize: 10, marginRight: 8 }}>{r.id}</span>
                    <span style={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif', fontSize: 12, fontWeight: 500 }}>{r.title}</span>
                  </td>
                  {archetypes.map((a) => {
                  const v = r[a.id];
                  const cs = cell(v);
                  return (
                    <td key={a.id} style={{
                      padding: '10px', textAlign: 'center',
                      color: cs.color, fontWeight: cs.weight,
                      background: cs.bg || 'transparent',
                      fontSize: v === '★' ? 13 : 12
                    }}>{v}</td>);

                })}
                </tr>
              )}
              <tr style={{ borderTop: '1px solid rgba(17,20,24,.18)', background: 'rgba(255,106,0,.04)' }}>
                <td style={{ padding: '12px 14px', fontWeight: 700, fontSize: 11 }}>RECETTE</td>
                {CTX_RECETTES.map((r) =>
                <td key={r.id} style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 700, color: '#111418', fontSize: 11 }}>{r.id}</td>
                )}
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 22, display: 'flex', gap: 22, fontSize: 11, color: 'rgba(17,20,24,.6)', fontFamily: 'ui-monospace, monospace', flexWrap: 'wrap' }}>
          <span><span style={{ color: '#FF6A00', fontWeight: 700 }}>★</span> molécule canonique pour cet archétype</span>
          <span><span style={{ color: '#5F7F52', fontWeight: 700 }}>✓</span> utilisable</span>
          <span><span style={{ color: 'rgba(17,20,24,.55)' }}>opt</span> variante optionnelle</span>
          <span><span style={{ color: 'rgba(17,20,24,.3)' }}>—</span> hors-domaine</span>
        </div>
      </div>
    </FitScale>);

}

/* ════════════════════════════════════════════════════════════════════
   Handoff · sources d'icônes · packaging
   ════════════════════════════════════════════════════════════════════ */

function CtxHandoff() {
  return (
    <FitScale w={1280} h={720} background="#0B0D10">
      <div style={{ width: 1280, height: 720, background: '#0B0D10', color: '#F7F3ED', padding: 60, boxSizing: 'border-box', fontFamily: 'ui-sans-serif, system-ui, sans-serif', position: 'relative', overflow: 'hidden' }}>
        <DitherBg color="#FF6A00" opacity={0.05} />
        <GrainBg opacity={0.06} />
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 10, color: '#FF6A00', fontWeight: 700, letterSpacing: '0.18em', fontFamily: 'ui-monospace, monospace' }}>HANDOFF · DE LA FICHE AU CODE</div>
          <div style={{ fontSize: 36, fontWeight: 600, letterSpacing: '-0.02em', marginTop: 6, lineHeight: 1.05 }}>Trois paquets, trois sprints.</div>
          <div style={{ fontSize: 14, color: 'rgba(247,243,237,.6)', marginTop: 8, maxWidth: 880, lineHeight: 1.55 }}>
            Cette fiche se branche en trois étapes isolables. Chacune produit un artefact que les autres consomment. Pas de big-bang.
          </div>

          <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 22 }}>
            {[
            { n: '01', label: 'TOKENS', title: 'gnu_theme.{qml,h,dart}',
              steps: [
              'générer GnuTheme depuis colors_and_type.css',
              'output 1 : GnuTheme.qml (singleton Quickshell)',
              'output 2 : gnu_theme.h (struct C++ constexpr)',
              'output 3 : gnu_theme.dart (classe GnuTheme)',
              'tests : compare hex à la palette canonique']
            },
            { n: '02', label: 'PRIMITIVES', title: 'GnuRow · GnuShell · GnuToggle · …',
              steps: [
              'porter les 12 atomes (sect 2) en composants',
              'chaque atome a ses props + slots typés',
              'cible : 100 % couverture des snippets de la fiche',
              'storybook visuel par moteur (lit la fiche)',
              'audit a11y : ARIA roles + focus rings']
            },
            { n: '03', label: 'CONTRACTS', title: 'GnuContextMenu(archetype, trigger)',
              steps: [
              'déclarer les 5 recettes en config-driven',
              'archetype = lookup table → liste de molécules',
              'wire triggers : right-click bus de Quickshell',
              'règle d\'or : title-bar ONLY pour les apps',
              'bind motion spec (M.01..M.12) aux moments']
            }].
            map((c) =>
            <div key={c.n} style={{ background: 'rgba(255,255,255,.04)', borderRadius: 10, padding: 20, border: '.5px solid rgba(255,255,255,.07)' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                  <span style={{ fontSize: 28, color: '#FF6A00', fontWeight: 700, fontFamily: 'ui-monospace, monospace', lineHeight: 1 }}>{c.n}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', fontFamily: 'ui-monospace, monospace', color: '#FF6A00' }}>{c.label}</span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, marginTop: 8, lineHeight: 1.3, fontFamily: 'ui-monospace, monospace' }}>{c.title}</div>
                <ul style={{ margin: '14px 0 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
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

          {/* Compat checklist */}
          <div style={{ marginTop: 32, background: 'rgba(255,106,0,.08)', borderRadius: 10, padding: 22, border: '.5px solid rgba(255,106,0,.32)' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', fontFamily: 'ui-monospace, monospace', color: '#FF6A00' }}>COMPAT · CAPABILITY DEGRADATION</div>
              <span style={{ fontSize: 9, color: 'rgba(247,243,237,.5)', fontFamily: 'ui-monospace, monospace' }}>(si la feature manque dans ton moteur)</span>
            </div>
            <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, fontSize: 11.5, lineHeight: 1.55 }}>
              {[
              ['no clip-path  (vieux Qt 5)', 'remplace M.01 reveal par fade + scale (cf. atom A.04 fallback)'],
              ['no backdrop-filter (Wayland sans blur)', 'radial wheel : surface opaque + dither x2 — pas de lens'],
              ['no spring animation', 'CM.07 bubble bloom dégradé en cubic-out simple'],
              ['no particle layer', 'commit flash de 60 ms sur la rangée (pas de gerbe)'],
              ['prefers-reduced-motion', 'toute la table reduced-motion s\'active globalement'],
              ['low-end GPU détecté', 'tile-grid sans transitions · radial désactivé']].
              map(([cond, mit]) =>
              <div key={cond} style={{ display: 'flex', gap: 10, fontFamily: 'ui-monospace, monospace' }}>
                  <span style={{ color: '#FF6A00', fontWeight: 700, flexShrink: 0, width: 240, fontSize: 10.5 }}>{cond}</span>
                  <span style={{ color: 'rgba(247,243,237,.78)', fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>{mit}</span>
                </div>
              )}
            </div>
          </div>

          <div style={{ marginTop: 'auto', position: 'absolute', bottom: 32, left: 60, right: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: 'rgba(247,243,237,.5)', fontFamily: 'ui-monospace, monospace', letterSpacing: '0.06em' }}>
            <span>GNU.IN-SHELL · CONTEXT SPEC v0.4.0 · 2026.06</span>
            <span>brancher la motion-spec : Motion Spec v0.4.0 ↔ Context Spec v0.4.0 partagent les atomes</span>
          </div>
        </div>
      </div>
    </FitScale>);

}

Object.assign(window, {
  CtxCover, CtxManifesto, CtxTaxonomy, CtxTokens, CtxMatrix, CtxHandoff
});