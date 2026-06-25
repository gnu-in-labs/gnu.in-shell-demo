// motion-cards.jsx
// AssetCard renderers : transforme une entrée du registre (ATOMS / MOLECULES /
// RECIPES) en card complet (stage + spec column + scrubber).

// ── Petit helper de mise en page de spec ────────────────────────────
function CommonSpecBody({ entry, kind }) {
  const dur = entry.dur ?? 0;
  const e = MEASE[entry.ease] || null;
  const audio = entry.audio ? MAUDIO[entry.audio] : null;
  const perfKey = entry.perf || 'light';
  const perfTone = { light: 'perf_light', medium: 'perf_med', heavy: 'perf_heavy' }[perfKey];
  return (
    <SpecPanel>
      {/* Tokens */}
      <SpecBlock label="Tokens · neutres">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <MTokenRow k="duration" v={`${dur}ms`} />
          <MTokenRow k="easing"   v={`${entry.ease}${e ? ` · cubic-bezier(${e.bz.map((n)=>n.toFixed(2)).join(', ')})` : ''}`} />
          <MTokenRow k="delta"    v={entry.delta ?? entry.spec?.from + ' → ' + entry.spec?.to} />
          {entry.spec?.delay && <MTokenRow k="delay" v={String(entry.spec.delay) + 'ms'} />}
        </div>
      </SpecBlock>

      {/* Why */}
      {entry.why && (
        <SpecBlock label="Pourquoi">
          <div style={{ fontSize: 11.5, lineHeight: 1.55, color: 'rgba(17,20,24,.78)' }}>{entry.why}</div>
        </SpecBlock>
      )}

      {/* Decomposition for molecules / recipes */}
      {entry.atoms && entry.atoms.length > 0 && (
        <SpecBlock label="Composé de">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {entry.atoms.map((a, i) => (
              <span key={i} style={{
                padding: '2px 8px', fontSize: 10, fontFamily: 'ui-monospace, monospace',
                background: 'rgba(255,106,0,.10)', color: '#FF6A00', borderRadius: 3, fontWeight: 600,
                border: '.5px solid rgba(255,106,0,.25)',
              }}>{a}</span>
            ))}
          </div>
        </SpecBlock>
      )}

      {/* Chip row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        <MChip tone={perfTone}>PERF · {perfKey.toUpperCase()}</MChip>
        {audio && <MChip tone="ink">AUDIO · {audio.id}</MChip>}
        {!audio && <MChip tone="soft">AUDIO · —</MChip>}
        {entry.rm && <MChip tone="paper">REDUCED · OK</MChip>}
      </div>

      {/* Reduced motion */}
      {entry.rm && (
        <SpecBlock label="Reduced-motion · fallback">
          <div style={{ fontSize: 11, lineHeight: 1.5, color: 'rgba(17,20,24,.7)', fontFamily: 'ui-monospace, monospace' }}>{entry.rm}</div>
        </SpecBlock>
      )}

      {/* Code snippets (atoms only — molecules/recipes have specs.atoms list above) */}
      {kind === 'atom' && entry.spec && (
        <SpecBlock label="Snippets · 5 moteurs" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
            <MSnippetTabs specs={snipAll(entry.spec)} />
          </div>
        </SpecBlock>
      )}

      {/* Audio detail */}
      {audio && (
        <SpecBlock label="Audio cue">
          <div style={{ fontSize: 10.5, lineHeight: 1.5, color: 'rgba(17,20,24,.65)', fontFamily: 'ui-monospace, monospace' }}>
            {audio.id} · {audio.dur}ms · {audio.vol} LUFS · <span style={{ fontStyle: 'italic' }}>{audio.character}</span>
          </div>
        </SpecBlock>
      )}
    </SpecPanel>
  );
}

// ── Atom Card ────────────────────────────────────────────────────────
function AtomCard({ atom }) {
  const theme = gnuTheme({ dark: false, brand: 'medium' });
  const Demo = atom.demo;
  return (
    <MotionStage duration={atom.dur} hold={600}>
      <AssetCard
        id={atom.id}
        kind="atom"
        title={atom.title}
        sub={atom.sub}
        stage={
          <MotionStageView w={720} h={360} theme={theme}>
            <Demo theme={theme} />
          </MotionStageView>
        }
        spec={<CommonSpecBody entry={atom} kind="atom" />}
      />
    </MotionStage>
  );
}

// ── Molecule Card ────────────────────────────────────────────────────
function MoleculeCard({ mol }) {
  const theme = gnuTheme({ dark: false, brand: 'medium' });
  const Demo = mol.demo;
  // For molecules, give a bit more idle hold so the user can read.
  const hold = mol.moment === 'idle' ? 0 : 800;
  return (
    <MotionStage duration={mol.dur} hold={hold}>
      <AssetCard
        id={mol.id}
        kind="molecule"
        title={`${mol.title}  ·  ${mol.moment}`}
        sub={mol.sub}
        stage={
          <MotionStageView w={720} h={360} theme={theme}>
            <Demo theme={theme} />
          </MotionStageView>
        }
        spec={<CommonSpecBody entry={mol} kind="molecule" />}
      />
    </MotionStage>
  );
}

// ── Recipe Card ──────────────────────────────────────────────────────
function RecipeCard({ recipe }) {
  const theme = gnuTheme({ dark: recipe.dark ?? false, brand: 'heavy' });
  const Demo = recipe.demo;
  return (
    <MotionStage duration={recipe.dur} hold={400}>
      <AssetCard
        id={recipe.id}
        kind="recipe"
        title={recipe.title}
        sub={recipe.sub}
        stage={
          <MotionStageView w={720} h={360} theme={theme}>
            <Demo theme={theme} />
          </MotionStageView>
        }
        spec={<RecipeSpec recipe={recipe} />}
        footer={recipe.footer}
      />
    </MotionStage>
  );
}

function RecipeSpec({ recipe }) {
  const { t } = useMotionTime();
  return (
    <SpecPanel>
      <SpecBlock label="Storyboard · timeline">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {recipe.phases.map((ph, i) => {
            const isActive = t >= ph.from && t <= ph.to;
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', borderRadius: 5,
                background: isActive ? 'rgba(255,106,0,.10)' : 'transparent',
                border: isActive ? '.5px solid rgba(255,106,0,.4)' : '.5px solid transparent',
                transition: 'background 80ms, border 80ms',
              }}>
                <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 9, fontWeight: 700, color: isActive ? '#FF6A00' : 'rgba(17,20,24,.45)', minWidth: 64, fontVariantNumeric: 'tabular-nums' }}>
                  {String(ph.from).padStart(4, '0')}–{String(ph.to).padStart(4, '0')}
                </span>
                <span style={{ fontSize: 10.5, fontWeight: 600, color: isActive ? '#111418' : 'rgba(17,20,24,.65)', minWidth: 80 }}>{ph.moment}</span>
                <span style={{ fontSize: 10, color: isActive ? 'rgba(17,20,24,.75)' : 'rgba(17,20,24,.5)', fontFamily: 'ui-monospace, monospace' }}>{ph.mol}</span>
              </div>
            );
          })}
        </div>
      </SpecBlock>

      <SpecBlock label="Atomes utilisés">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {[...new Set(recipe.phases.flatMap((p) => p.atoms || []))].map((a, i) => (
            <span key={i} style={{
              padding: '2px 8px', fontSize: 10, fontFamily: 'ui-monospace, monospace',
              background: 'rgba(255,106,0,.10)', color: '#FF6A00', borderRadius: 3, fontWeight: 600,
              border: '.5px solid rgba(255,106,0,.25)',
            }}>{a}</span>
          ))}
        </div>
      </SpecBlock>

      {recipe.why && (
        <SpecBlock label="Pourquoi cette recette">
          <div style={{ fontSize: 11.5, lineHeight: 1.55, color: 'rgba(17,20,24,.78)' }}>{recipe.why}</div>
        </SpecBlock>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        <MChip tone="ink">DUR · {recipe.dur}ms</MChip>
        <MChip tone={{ light: 'perf_light', medium: 'perf_med', heavy: 'perf_heavy' }[recipe.perf || 'medium']}>PERF · {(recipe.perf||'medium').toUpperCase()}</MChip>
        {recipe.touchOk && <MChip tone="green">TACTILE OK</MChip>}
        {recipe.signature && <MChip tone="orange">SIGNATURE ★</MChip>}
      </div>

      {recipe.snippet && (
        <SpecBlock label="Snippet · clé-en-main" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
            <MSnippetTabs specs={recipe.snippet} />
          </div>
        </SpecBlock>
      )}
    </SpecPanel>
  );
}

Object.assign(window, { AtomCard, MoleculeCard, RecipeCard, CommonSpecBody, RecipeSpec });
