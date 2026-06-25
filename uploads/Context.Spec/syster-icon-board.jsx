// syster-icon-board.jsx
// Sys.ter — icône canonique. The miniature used everywhere as the shell helper /
// dynamic assistant glyph. Anatomy, size ladder, states, construction & tokens.

function SwatchFrame({ children, dark, label, sub }) {
  const bg = dark ? '#0E1114' : '#FFFFFF';
  const fg = dark ? 'rgba(247,243,237,.5)' : 'rgba(17,20,24,.45)';
  return (
    <div style={{
      flex: 1, background: bg, borderRadius: 12, border: `.5px solid ${dark ? 'rgba(255,255,255,.08)' : 'rgba(17,20,24,.1)'}`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14,
      padding: '26px 18px', position: 'relative', overflow: 'hidden'
    }}>
      {/* baseline grid hint */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: dark ? 0.06 : 0.05 }}>
        <defs>
          <pattern id={`gr-${label}`} width="16" height="16" patternUnits="userSpaceOnUse">
            <path d="M16 0H0V16" fill="none" stroke={dark ? '#fff' : '#111'} strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#gr-${label})`} style={{ width: "143px" }} />
      </svg>
      <div style={{ position: 'relative' }}>{children}</div>
      <div style={{ position: 'relative', textAlign: 'center' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', fontFamily: 'ui-monospace, monospace', color: '#FF6A00' }}>{label}</div>
        <div style={{ fontSize: 10.5, color: fg, marginTop: 3 }}>{sub}</div>
      </div>
    </div>);

}

function AnatomyRow({ sw, name, token, note }) {
  return (
    <li style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '7px 0', borderTop: '.5px solid rgba(17,20,24,.08)' }}>
      <span style={{ width: 12, height: 12, borderRadius: 3, background: sw, flexShrink: 0, marginTop: 2, border: '.5px solid rgba(17,20,24,.18)' }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: '#111418' }}>{name}</span>
          <span style={{ fontSize: 10, color: 'rgba(17,20,24,.45)', fontFamily: 'ui-monospace, monospace', marginLeft: 'auto' }}>{token}</span>
        </div>
        <div style={{ fontSize: 11, color: 'rgba(17,20,24,.6)', lineHeight: 1.45, marginTop: 1 }}>{note}</div>
      </div>
    </li>);

}

function SysterIconBoard() {
  const ladder = [
  { size: 11, where: 'topbar sliver' },
  { size: 16, where: 'menu row' },
  { size: 20, where: 'identity header' },
  { size: 28, where: 'radial hub' },
  { size: 56, where: 'cover / hero' }];

  return (
    <FitScale w={1280} h={720} background="#FBFAF6">
      <div style={{
        width: 1280, height: 720, background: '#FBFAF6', color: '#111418',
        fontFamily: 'ui-sans-serif, system-ui, sans-serif', position: 'relative', overflow: 'hidden',
        padding: 56, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 22
      }}>
        {/* dotted bg */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.5 }}>
          <defs>
            <pattern id="ic-dots" width="14" height="14" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.5" fill="rgba(17,20,24,.15)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#ic-dots)" />
        </svg>

        {/* Header */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 16 }}>
          <SysterGlyph size={44} hover />
          <div>
            <div style={{ fontSize: 11, color: '#FF6A00', fontWeight: 700, letterSpacing: '0.18em', fontFamily: 'ui-monospace, monospace' }}>GNU.IN-SHELL · ICÔNE CANONIQUE · SYS.TER</div>
            <div style={{ fontSize: 34, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.05, marginTop: 2 }}>Sys.ter — miniature canonique</div>
          </div>
          <div style={{ marginLeft: 'auto', maxWidth: 360, fontSize: 12.5, lineHeight: 1.5, color: 'rgba(17,20,24,.62)', textAlign: 'right' }}>
            Le glyphe-template de l'assistant dynamique. Profil de face : antenne-signal + corps-terminal. Une seule géométrie 24×24, lisible de 11 à 180 px.
          </div>
        </div>

        {/* Main grid */}
        <div style={{ position: 'relative', flex: 1, display: 'grid', gridTemplateColumns: '1.15fr 1fr 1fr', gap: 20, minHeight: 0 }}>

          {/* Col 1 — hero swatches */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minHeight: 0 }}>
            <div style={{ flex: 1, display: 'flex', gap: 14 }}>
              <SwatchFrame label="IDLE" sub="repos" dark={false}>
                <SysterGlyph size={150} />
              </SwatchFrame>
              <SwatchFrame label="LISTENING" sub="antenne pulse + ondes" dark>
                <SysterGlyph size={150} hover />
              </SwatchFrame>
            </div>
            <div style={{ fontSize: 11, color: 'rgba(17,20,24,.55)', lineHeight: 1.5, fontFamily: 'ui-monospace, monospace' }}>
              état « listening » = bulbe d'antenne r 1.05→1.5 · onde droite α 0→1 · loop 1.2 s. <span style={{ color: '#FF6A00' }}>reduced-motion → bulbe fixe r 1.3.</span>
            </div>
          </div>

          {/* Col 2 — anatomy */}
          <div style={{ background: '#FFFFFF', borderRadius: 12, border: '.5px solid rgba(17,20,24,.1)', padding: '16px 18px', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div style={{ fontSize: 9.5, color: '#111418', letterSpacing: '0.14em', fontWeight: 700, fontFamily: 'ui-monospace, monospace', marginBottom: 4 }}>ANATOMIE</div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              <AnatomyRow sw="#FF6A00" name="Antenne · bulbe" token="r 1.15 / body" note="Stem gris sur l'épaule droite → bulbe signal. Le « tell » dynamique : pulse en écoute." />
              <AnatomyRow sw="#FF6A00" name="Corps" token="#FF6A00 · rx 3" note="Bloc-terminal orange signal, vue de face. 16×16 sur grille 24." />
              <AnatomyRow sw="#111418" name="Écran" token="#111418 · rx 1.8" note="Encart anthracite 12×12, inset 2 px." />
              <AnatomyRow sw="#F7F3ED" name="Prompt" token="#F7F3ED · 1.4" note="Chevron + ligne de saisie. En transmit → « … » animé." />
            </ul>
            <div style={{ marginTop: 'auto', paddingTop: 12, fontSize: 10.5, color: 'rgba(17,20,24,.5)', lineHeight: 1.45 }}>
              Géométrie verrouillée — ne pas redessiner. Recolorier via <span style={{ fontFamily: 'ui-monospace, monospace', color: '#FF6A00' }}>body / screen</span> uniquement (cf. avatars de thème).
            </div>
          </div>

          {/* Col 3 — size ladder + tokens */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minHeight: 0 }}>
            <div style={{ background: '#FFFFFF', borderRadius: 12, border: '.5px solid rgba(17,20,24,.1)', padding: '16px 18px' }}>
              <div style={{ fontSize: 9.5, color: '#111418', letterSpacing: '0.14em', fontWeight: 700, fontFamily: 'ui-monospace, monospace', marginBottom: 12 }}>ÉCHELLES D'USAGE</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 6 }}>
                {ladder.map((l) =>
                <div key={l.size} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1 }}>
                    <div style={{ height: 60, display: 'flex', alignItems: 'flex-end' }}>
                      <SysterGlyph size={l.size} />
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#FF6A00', fontFamily: 'ui-monospace, monospace' }}>{l.size}</div>
                    <div style={{ fontSize: 8.5, color: 'rgba(17,20,24,.5)', textAlign: 'center', lineHeight: 1.25, height: 22 }}>{l.where}</div>
                  </div>
                )}
              </div>
            </div>
            <div style={{ flex: 1, background: '#0E1114', borderRadius: 12, padding: '16px 18px', color: '#F7F3ED', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <div style={{ fontSize: 9.5, color: '#FF6A00', letterSpacing: '0.14em', fontWeight: 700, fontFamily: 'ui-monospace, monospace', marginBottom: 12 }}>TOKENS</div>
              {[
              ['body', '#FF6A00', 'signal'],
              ['screen', '#111418', 'anthracite'],
              ['prompt', '#F7F3ED', 'shellWhite']].
              map(([k, hex, name]) =>
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0', borderTop: '.5px solid rgba(255,255,255,.07)' }}>
                  <span style={{ width: 14, height: 14, borderRadius: 4, background: hex, border: '.5px solid rgba(255,255,255,.18)' }} />
                  <span style={{ fontSize: 11.5, fontFamily: 'ui-monospace, monospace', color: '#FF6A00' }}>{k}</span>
                  <span style={{ fontSize: 11, fontFamily: 'ui-monospace, monospace', color: 'rgba(247,243,237,.55)', marginLeft: 'auto' }}>{hex}</span>
                  <span style={{ fontSize: 10.5, color: 'rgba(247,243,237,.4)', minWidth: 64, textAlign: 'right' }}>{name}</span>
                </div>
              )}
              <div style={{ marginTop: 'auto', paddingTop: 10, fontSize: 10, color: 'rgba(247,243,237,.4)', fontFamily: 'ui-monospace, monospace' }}>viewBox 0 0 24 24 · stroke 1.4 · grille 1 px</div>
            </div>
          </div>
        </div>
      </div>
    </FitScale>);

}

Object.assign(window, { SysterIconBoard });