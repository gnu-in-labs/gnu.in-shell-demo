// ctxmenu-tools.jsx
// Six production-grade tool boards :
//   ◇.1 Icon catalogue
//   ◇.2 I18n · RTL & long labels
//   ◇.3 State catalogue (empty · loading · error · success)
//   ◇.4 Performance budget per recette
//   ◇.5 Telemetry events
//   ◇.6 Production readiness checklist

const ICON_CATALOGUE = [
['add', 'C·add'], ['layout', 'C·layout'], ['widget', 'C·widget'], ['wallpaper', 'C·wallpaper'],
['refresh', 'C·refresh'], ['terminal', 'C·terminal'], ['settings', 'C·settings'], ['pin', 'C·pin'],
['trash', 'C·trash'], ['copy', 'C·copy'], ['move', 'C·move'], ['resize', 'C·resize'],
['tile', 'C·tile'], ['float', 'C·float'], ['fullscreen', 'C·fullscreen'], ['workspace', 'C·workspace'],
['close', 'C·close'], ['info', 'C·info'], ['paint', 'C·paint'], ['motion', 'C·motion'],
['shape', 'C·shape'], ['shader', 'C·shader'], ['audio', 'C·audio'], ['network', 'C·network'],
['bluetooth', 'C·bluetooth'], ['power', 'C·power'], ['bell', 'C·bell'], ['search', 'C·search']];


/* ════════════════════════════════════════════════════════════════════
   ◇.1 — Icon catalogue
   ════════════════════════════════════════════════════════════════════ */

function ToolIconCatalogue() {
  return (
    <FitScale w={1280} h={720} background="#FBFAF6">
      <div style={{ width: 1280, background: '#FBFAF6', color: '#111418', padding: 52, boxSizing: 'border-box', fontFamily: 'ui-sans-serif, system-ui, sans-serif', overflow: 'auto', height: "720px" }}>
        <div style={{ fontSize: 10, color: '#FF6A00', fontWeight: 700, letterSpacing: '0.18em', fontFamily: 'ui-monospace, monospace' }}>◇.1 · ICON CATALOGUE · 28 GLYPHS</div>
        <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em', marginTop: 6 }}>Le lexique iconographique.</div>
        <div style={{ fontSize: 13, color: 'rgba(17,20,24,.6)', marginTop: 4, maxWidth: 760, lineHeight: 1.5 }}>
          Tous les glyphes utilisés dans les menus, dessinés en stroke 1.6 sur viewBox 24×24. Le shell consomme les noms canoniques — la SVG est inline (pas de font icon, pas de chargement réseau).
        </div>

        {/* Sizes preview */}
        <div style={{ marginTop: 18, padding: 14, borderRadius: 10, background: '#FFFFFF', border: '.5px solid rgba(17,20,24,.08)', display: 'flex', alignItems: 'center', gap: 28 }}>
          <div style={{ fontSize: 9, color: '#FF6A00', fontWeight: 700, letterSpacing: '0.14em', fontFamily: 'ui-monospace, monospace' }}>TAILLES</div>
          {[12, 14, 16, 18, 24, 32].map((sz) =>
          <div key={sz} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: sz, height: sz, color: '#FF6A00' }}>{MenuIcons.tile}</span>
              <span style={{ fontSize: 10, color: 'rgba(17,20,24,.6)', fontFamily: 'ui-monospace, monospace' }}>{sz} px</span>
            </div>
          )}
          <span style={{ marginLeft: 'auto', fontSize: 10.5, color: 'rgba(17,20,24,.55)', fontFamily: 'ui-monospace, monospace' }}>stroke 1.6 · linecap round · linejoin round · viewBox 24×24</span>
        </div>

        {/* Grid */}
        <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10 }}>
          {ICON_CATALOGUE.map(([name, code]) =>
          <div key={name} style={{
            padding: '14px 10px', borderRadius: 8,
            background: '#FFFFFF', border: '.5px solid rgba(17,20,24,.08)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            boxShadow: '0 1px 2px rgba(17,20,24,.02)'
          }}>
              <div style={{ width: 24, height: 24, color: '#111418' }}>{MenuIcons[name]}</div>
              <div style={{ fontSize: 10, fontFamily: 'ui-monospace, monospace', color: '#111418', fontWeight: 600, letterSpacing: '-0.01em' }}>{name}</div>
              <div style={{ fontSize: 8.5, fontFamily: 'ui-monospace, monospace', color: 'rgba(17,20,24,.45)', letterSpacing: '0.08em', fontWeight: 600 }}>{code.toUpperCase()}</div>
            </div>
          )}
        </div>

        {/* Usage rules */}
        <div style={{ marginTop: 16, padding: 14, borderRadius: 10, background: '#111418', color: '#F7F3ED', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 20 }}>
          {[
          ['STROKE', '1.6 px constant · jamais 2 · jamais 1'],
          ['ALIGN', 'pixel grid · pas de translate 0.5'],
          ['COLOR', 'inherit currentColor · jamais hardcoded'],
          ['VARIANTS', 'pas de fill variant · cohérence monoline']].
          map(([k, v]) =>
          <div key={k}>
              <div style={{ fontSize: 9, color: '#FF6A00', fontWeight: 700, letterSpacing: '0.14em', fontFamily: 'ui-monospace, monospace' }}>{k}</div>
              <div style={{ fontSize: 11.5, marginTop: 4, color: 'rgba(247,243,237,.85)', lineHeight: 1.5 }}>{v}</div>
            </div>
          )}
        </div>
      </div>
    </FitScale>);

}

/* ════════════════════════════════════════════════════════════════════
   ◇.2 — I18n · RTL & long labels
   ════════════════════════════════════════════════════════════════════ */

function ToolI18n() {
  const tx = gnuTheme({ dark: false, brand: 'medium' });
  const samples = [
  { lang: 'EN · base', dir: 'ltr', label: 'Add widget…', sub: 'Compose · widget', kbd: ['⌘', '⇧', 'W'] },
  { lang: 'FR · ~+18%', dir: 'ltr', label: 'Ajouter un widget…', sub: 'Composer · widget', kbd: ['⌘', '⇧', 'W'] },
  { lang: 'DE · ~+44% · long', dir: 'ltr', label: 'Bedienfeld hinzufügen…', sub: 'Komponieren · Widget', kbd: ['⌘', '⇧', 'W'] },
  { lang: 'AR · RTL', dir: 'rtl', label: 'إضافة عنصر واجهة…', sub: 'تكوين · عنصر', kbd: ['⌘', '⇧', 'W'] },
  { lang: 'JA · CJK', dir: 'ltr', label: 'ウィジェットを追加…', sub: '構成 · ウィジェット', kbd: ['⌘', '⇧', 'W'] },
  { lang: 'OVER · 200%', dir: 'ltr', label: 'Tegevuskeskuse vidina lisamine…', sub: 'Tegevuskeskus · vidin', kbd: ['⌘', '⇧', 'W'], overflow: true }];

  return (
    <FitScale w={1280} h={720} background="#FBFAF6">
      <div style={{ width: 1280, height: 720, background: '#FBFAF6', color: '#111418', padding: 52, boxSizing: 'border-box', fontFamily: 'ui-sans-serif, system-ui, sans-serif', overflow: 'auto' }}>
        <div style={{ fontSize: 10, color: '#FF6A00', fontWeight: 700, letterSpacing: '0.18em', fontFamily: 'ui-monospace, monospace' }}>◇.2 · I18N · RTL · LONG LABELS</div>
        <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em', marginTop: 6 }}>Le même row, six idiomes.</div>
        <div style={{ fontSize: 13, color: 'rgba(17,20,24,.6)', marginTop: 4, maxWidth: 760, lineHeight: 1.5 }}>
          Test de référence : aucune fuite de layout entre langues. La rangée allonge en hauteur (line-break) plutôt qu'en largeur — sauf si l'utilisateur a expansé le menu (config).
        </div>

        <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {samples.map((s, i) =>
          <div key={i} style={{
            padding: 14, borderRadius: 10,
            background: '#FFFFFF', border: '.5px solid rgba(17,20,24,.08)'
          }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 9, color: '#FF6A00', fontWeight: 700, letterSpacing: '0.14em', fontFamily: 'ui-monospace, monospace' }}>{s.lang}</span>
                <span style={{ fontSize: 9, color: 'rgba(17,20,24,.45)', fontFamily: 'ui-monospace, monospace', padding: '1px 6px', background: 'rgba(17,20,24,.04)', borderRadius: 3, fontWeight: 700, letterSpacing: '0.1em' }}>{s.dir.toUpperCase()}</span>
                {s.overflow && <span style={{ fontSize: 9, color: '#E63A1F', fontWeight: 700, letterSpacing: '0.14em', fontFamily: 'ui-monospace, monospace' }}>· OVERFLOW</span>}
              </div>
              {/* Row preview */}
              <div dir={s.dir} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '0 12px', minHeight: 32, borderRadius: 7,
              background: tx.hover, position: 'relative',
              fontFamily: 'ui-sans-serif, system-ui, sans-serif', fontSize: 13, color: tx.text,
              width: s.overflow ? 220 : '100%'
            }}>
                <span style={{ position: 'absolute', [s.dir === 'rtl' ? 'right' : 'left']: 0, top: '22%', bottom: '22%', width: 2, background: tx.accent, borderRadius: 2 }} />
                <span style={{ width: 14, height: 14, color: tx.accent, flexShrink: 0 }}>{MenuIcons.add}</span>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, lineHeight: 1.25, minWidth: 0, padding: '4px 0' }}>
                  <span style={{ fontWeight: 500, whiteSpace: s.overflow ? 'nowrap' : 'normal', overflow: s.overflow ? 'hidden' : 'visible', textOverflow: 'ellipsis' }}>{s.label}</span>
                  <span style={{ fontSize: 10.5, color: tx.textDim, fontFamily: 'ui-monospace, monospace', whiteSpace: s.overflow ? 'nowrap' : 'normal', overflow: s.overflow ? 'hidden' : 'visible', textOverflow: 'ellipsis' }}>{s.sub}</span>
                </div>
                <span style={{ display: 'inline-flex', gap: 3, flexShrink: 0 }}>
                  {s.kbd.map((k, j) =>
                <span key={j} style={{ minWidth: 18, height: 18, padding: '0 5px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 3, background: tx.kbdBg, border: `.5px solid ${tx.kbdBorder}`, fontFamily: 'ui-monospace, monospace', fontSize: 10, fontWeight: 600, color: tx.textDim }}>{k}</span>
                )}
                </span>
              </div>
            </div>
          )}
        </div>

        <div style={{ marginTop: 18, padding: 14, borderRadius: 10, background: '#111418', color: '#F7F3ED', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
          {[
          ['RTL', 'tick + chevron flippés · kbd reste LTR (compose toujours ⌘…)'],
          ['EXPANSION', '+18% (FR) acceptable inline · +44% (DE) → line-break · >100% → truncate + tooltip C.23'],
          ['MISSING', 'fallback : afficher la clé entre {{ }} · jamais blank · log telemetry i18n.miss.key']].
          map(([k, v]) =>
          <div key={k}>
              <div style={{ fontSize: 9, color: '#FF6A00', fontWeight: 700, letterSpacing: '0.14em', fontFamily: 'ui-monospace, monospace' }}>{k}</div>
              <div style={{ fontSize: 11.5, marginTop: 4, color: 'rgba(247,243,237,.85)', lineHeight: 1.5 }}>{v}</div>
            </div>
          )}
        </div>
      </div>
    </FitScale>);

}

/* ════════════════════════════════════════════════════════════════════
   ◇.3 — State catalogue · empty / loading / error / success
   ════════════════════════════════════════════════════════════════════ */

function ToolStateCatalogue() {
  const tx = gnuTheme({ dark: false, brand: 'medium' });
  const states = [
  {
    kind: 'EMPTY', tone: tx.accent,
    title: 'No notifications yet',
    body: 'The shell will whisper here when something needs your attention.',
    cta: 'Notification settings',
    icon: MenuIcons.bell
  },
  {
    kind: 'LOADING', tone: tx.accent,
    title: 'Synchronizing…',
    body: 'Connecting to the configuration server.',
    cta: null,
    spinner: true
  },
  {
    kind: 'ERROR', tone: '#E63A1F',
    title: 'Sync failed',
    body: 'The shell cannot reach gnu6.live. Retry · check network · work offline.',
    cta: 'Retry',
    icon: MenuIcons.refresh
  },
  {
    kind: 'SUCCESS', tone: '#5F7F52',
    title: 'Theme applied',
    body: 'Beret · green paper. Reload the shell to see all surfaces refresh.',
    cta: 'Reload shell',
    icon: MenuIcons.refresh
  }];

  return (
    <FitScale w={1280} h={720} background="#FBFAF6">
      <div style={{ width: 1280, height: 720, background: '#FBFAF6', color: '#111418', padding: 52, boxSizing: 'border-box', fontFamily: 'ui-sans-serif, system-ui, sans-serif', overflow: 'auto' }}>
        <div style={{ fontSize: 10, color: '#FF6A00', fontWeight: 700, letterSpacing: '0.18em', fontFamily: 'ui-monospace, monospace' }}>◇.3 · STATES · 4 CASES PER MENU</div>
        <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em', marginTop: 6 }}>Le menu n'est jamais blanc.</div>
        <div style={{ fontSize: 13, color: 'rgba(17,20,24,.6)', marginTop: 4, maxWidth: 760, lineHeight: 1.5 }}>
          Quatre archétypes d'états — EMPTY · LOADING · ERROR · SUCCESS — déclinés en CM.15 avec le bon ton. Aucun menu ne doit jamais montrer un panneau vide.
        </div>

        <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {states.map((s) =>
          <div key={s.kind} style={{
            padding: '28px 20px', borderRadius: 12,
            background: '#FFFFFF',
            border: `.5px dashed ${s.tone}`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center'
          }}>
              {s.spinner ?
            <svg width="36" height="36" viewBox="0 0 36 36" style={{ animation: 'gnu-spin 900ms linear infinite' }}>
                  <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(17,20,24,.08)" strokeWidth="2" />
                  <path d="M 18 4 A 14 14 0 0 1 32 18" fill="none" stroke={s.tone} strokeWidth="2" strokeLinecap="round" />
                </svg> :

            <div style={{
              width: 56, height: 56, borderRadius: 28,
              background: `rgba(${s.tone === tx.accent ? '255,106,0' : s.tone === '#E63A1F' ? '230,58,31' : '95,127,82'},.06)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `.5px dashed ${s.tone}`
            }}>
                  <span style={{ width: 24, height: 24, color: s.tone, opacity: 0.78 }}>{s.icon}</span>
                </div>
            }
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em' }}>{s.title}</div>
                <div style={{ fontSize: 10.5, color: 'rgba(17,20,24,.62)', fontFamily: 'ui-monospace, monospace', marginTop: 4, lineHeight: 1.4 }}>{s.body}</div>
              </div>
              {s.cta &&
            <button style={{
              padding: '6px 12px', borderRadius: 6,
              background: s.tone, color: '#fff', border: 'none',
              fontSize: 11, fontWeight: 600, fontFamily: 'ui-sans-serif, system-ui, sans-serif',
              cursor: 'pointer'
            }}>{s.cta}</button>
            }
              <div style={{
              padding: '2px 8px', fontSize: 8.5, fontFamily: 'ui-monospace, monospace',
              color: s.tone, letterSpacing: '0.14em', fontWeight: 700,
              border: `.5px solid ${s.tone}`, borderRadius: 3, marginTop: 'auto'
            }}>{s.kind}</div>
            </div>
          )}
        </div>

        {/* Rules */}
        <div style={{ marginTop: 22, padding: 18, borderRadius: 10, background: '#111418', color: '#F7F3ED' }}>
          <div style={{ fontSize: 9, color: '#FF6A00', fontWeight: 700, letterSpacing: '0.14em', fontFamily: 'ui-monospace, monospace', marginBottom: 10 }}>RÈGLES · 5 NON-NÉGOCIABLES</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 12, lineHeight: 1.55 }}>
            {[
            ['1.', 'EMPTY contextualisé · jamais "No items" — toujours nommer le type ("No notifications yet")'],
            ['2.', 'LOADING ≤ 250ms → ne montre rien · LOADING > 250ms → spinner · > 1500ms → titre + body'],
            ['3.', 'ERROR donne 3 actions : Retry · diagnose · work-offline'],
            ['4.', 'SUCCESS reste 4s max puis dismiss · jamais d\'auto-dismiss sur ERROR'],
            ['5.', 'Tone color cohérent partout : accent (info) · #5F7F52 (ok) · #E63A1F (alerte) · #E8A227 (warn)']].
            map(([n, t]) =>
            <div key={n} style={{ display: 'flex', gap: 10 }}>
                <span style={{ color: '#FF6A00', fontWeight: 700, fontFamily: 'ui-monospace, monospace' }}>{n}</span>
                <span>{t}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </FitScale>);

}

/* ════════════════════════════════════════════════════════════════════
   ◇.4 — Performance budget per recette
   ════════════════════════════════════════════════════════════════════ */

function ToolPerfBudget() {
  const rows = [
  { id: 'R.01', name: 'Empty space · list', widgets: 9, paint: '0.9 ms', layout: '0.4 ms', gpu: 'light', drawcalls: 12, motion: 'M.01 mask', budget: '6 ms', verdict: 'PASS' },
  { id: 'R.02', name: 'Widget · card preview', widgets: 14, paint: '1.4 ms', layout: '0.6 ms', gpu: 'medium', drawcalls: 22, motion: 'M.01 mask + scale', budget: '8 ms', verdict: 'PASS' },
  { id: 'R.03', name: 'Window · title-bar', widgets: 11, paint: '1.1 ms', layout: '0.5 ms', gpu: 'light', drawcalls: 16, motion: 'M.01 ↓', budget: '6 ms', verdict: 'PASS' },
  { id: 'R.04★', name: 'Bubble tree · signature', widgets: 22, paint: '2.4 ms', layout: '0.9 ms', gpu: 'medium', drawcalls: 38, motion: 'M.12 spring stagger', budget: '12 ms', verdict: 'PASS' },
  { id: 'R.05', name: 'Tray · audio', widgets: 13, paint: '1.0 ms', layout: '0.5 ms', gpu: 'light', drawcalls: 18, motion: 'M.01', budget: '6 ms', verdict: 'PASS' },
  { id: 'R.06', name: 'Notifications tray', widgets: 18, paint: '1.6 ms', layout: '0.8 ms', gpu: 'medium', drawcalls: 28, motion: 'M.01 + toast in', budget: '8 ms', verdict: 'PASS' },
  { id: 'R.07', name: 'Power tray', widgets: 12, paint: '1.1 ms', layout: '0.5 ms', gpu: 'light', drawcalls: 17, motion: 'M.01', budget: '6 ms', verdict: 'PASS' },
  { id: 'R.08', name: 'App launcher ✦', widgets: 24, paint: '2.8 ms', layout: '1.2 ms', gpu: 'medium', drawcalls: 42, motion: 'modal fade + filter', budget: '14 ms', verdict: 'WATCH' }];

  const tone = (v) => v === 'PASS' ? '#5F7F52' : v === 'WATCH' ? '#E8A227' : '#E63A1F';
  return (
    <FitScale w={1280} h={720} background="#FBFAF6">
      <div style={{ width: 1280, height: 720, background: '#FBFAF6', color: '#111418', padding: 52, boxSizing: 'border-box', fontFamily: 'ui-sans-serif, system-ui, sans-serif', overflow: 'auto' }}>
        <div style={{ fontSize: 10, color: '#FF6A00', fontWeight: 700, letterSpacing: '0.18em', fontFamily: 'ui-monospace, monospace' }}>◇.4 · PERFORMANCE BUDGET · 16 MS PAR FRAME</div>
        <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em', marginTop: 6 }}>Aucune recette ne mange une frame.</div>
        <div style={{ fontSize: 13, color: 'rgba(17,20,24,.6)', marginTop: 4, maxWidth: 760, lineHeight: 1.5 }}>
          60 fps = 16 ms par frame. Une recette qui dépasse 60 % de ce budget passe en <b style={{ color: '#E8A227' }}>WATCH</b>. Au-delà de 90 % → <b style={{ color: '#E63A1F' }}>FAIL</b> et CI bloque le merge.
        </div>

        <div style={{ marginTop: 32, background: '#FFFFFF', borderRadius: 10, border: '.5px solid rgba(17,20,24,.08)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'ui-monospace, monospace', fontSize: 11 }}>
            <thead>
              <tr style={{ background: '#111418', color: '#F7F3ED' }}>
                {['ID', 'RECETTE', 'WIDGETS', 'PAINT', 'LAYOUT', 'GPU', 'DRAWCALLS', 'MOTION', 'BUDGET', 'VERDICT'].map((h) =>
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 9, letterSpacing: '0.12em', fontWeight: 700 }}>{h}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const t = tone(r.verdict);
                return (
                  <tr key={r.id} style={{ borderTop: '.5px solid rgba(17,20,24,.06)' }}>
                    <td style={{ padding: '10px 12px', color: '#FF6A00', fontWeight: 700 }}>{r.id}</td>
                    <td style={{ padding: '10px 12px', fontFamily: 'ui-sans-serif, system-ui, sans-serif', fontSize: 12, fontWeight: 500 }}>{r.name}</td>
                    <td style={{ padding: '10px 12px', fontVariantNumeric: 'tabular-nums' }}>{r.widgets}</td>
                    <td style={{ padding: '10px 12px', fontVariantNumeric: 'tabular-nums' }}>{r.paint}</td>
                    <td style={{ padding: '10px 12px', fontVariantNumeric: 'tabular-nums' }}>{r.layout}</td>
                    <td style={{ padding: '10px 12px', color: r.gpu === 'medium' ? '#E8A227' : 'rgba(17,20,24,.6)' }}>{r.gpu}</td>
                    <td style={{ padding: '10px 12px', fontVariantNumeric: 'tabular-nums' }}>{r.drawcalls}</td>
                    <td style={{ padding: '10px 12px', color: 'rgba(17,20,24,.65)', fontSize: 10 }}>{r.motion}</td>
                    <td style={{ padding: '10px 12px', fontVariantNumeric: 'tabular-nums', color: '#FF6A00', fontWeight: 700 }}>{r.budget}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{
                        padding: '2px 8px', fontSize: 9, fontFamily: 'ui-monospace, monospace',
                        fontWeight: 700, letterSpacing: '0.12em', borderRadius: 3,
                        background: r.verdict === 'PASS' ? t : 'transparent',
                        color: r.verdict === 'PASS' ? '#fff' : t,
                        border: r.verdict !== 'PASS' ? `.5px solid ${t}` : 'none'
                      }}>{r.verdict}</span>
                    </td>
                  </tr>);

              })}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div style={{ padding: 16, borderRadius: 10, background: '#FFFFFF', border: '.5px solid rgba(17,20,24,.08)' }}>
            <div style={{ fontSize: 9, color: '#FF6A00', fontWeight: 700, letterSpacing: '0.14em', fontFamily: 'ui-monospace, monospace', marginBottom: 10 }}>FRAME BUDGET · BREAKDOWN</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11.5, lineHeight: 1.5 }}>
              {[
              ['JS · style recalc', '~3 ms'],
              ['Layout', '~2 ms'],
              ['Paint', '~4 ms'],
              ['Composite', '~2 ms'],
              ['Headroom', '~5 ms']].
              map(([k, v]) =>
              <div key={k} style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ color: '#FF6A00', fontWeight: 700, minWidth: 130, fontFamily: 'ui-monospace, monospace' }}>{k}</span>
                  <span style={{ flex: 1, borderBottom: '1px dotted rgba(17,20,24,.15)' }} />
                  <span style={{ fontFamily: 'ui-monospace, monospace', fontVariantNumeric: 'tabular-nums' }}>{v}</span>
                </div>
              )}
            </div>
          </div>
          <div style={{ padding: 16, borderRadius: 10, background: '#111418', color: '#F7F3ED' }}>
            <div style={{ fontSize: 9, color: '#FF6A00', fontWeight: 700, letterSpacing: '0.14em', fontFamily: 'ui-monospace, monospace', marginBottom: 10 }}>CI · BLOCKING RULES</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11.5, lineHeight: 1.5 }}>
              {[
              ['> 16 ms / frame', 'FAIL · block merge'],
              ['> 12 ms / frame', 'WATCH · justification requise'],
              ['regression vs main', '+10 % auto-fail'],
              ['low-end GPU detected', 'auto-degrade : tout HEAVY → LIGHT']].
              map(([cond, mit]) =>
              <div key={cond} style={{ display: 'flex', gap: 10, fontFamily: 'ui-monospace, monospace' }}>
                  <span style={{ color: '#FF6A00', fontWeight: 700, flexShrink: 0, width: 180 }}>{cond}</span>
                  <span style={{ color: 'rgba(247,243,237,.85)' }}>{mit}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </FitScale>);

}

/* ════════════════════════════════════════════════════════════════════
   ◇.5 — Telemetry events catalogue
   ════════════════════════════════════════════════════════════════════ */

function ToolTelemetry() {
  const events = [
  { ns: 'menu', name: 'open', payload: 'archetype · trigger · anchor.xy · density', freq: 'every', pii: 'no' },
  { ns: 'menu', name: 'close', payload: 'archetype · reason (esc · click-outside · pick · timeout)', freq: 'every', pii: 'no' },
  { ns: 'menu', name: 'pick', payload: 'archetype · row.id · path[] · kbd?', freq: 'every', pii: 'no' },
  { ns: 'menu', name: 'sub.open', payload: 'parent.path · sub.id · via (hover · click · kbd)', freq: 'every', pii: 'no' },
  { ns: 'menu', name: 'search', payload: 'q.length · results.count · debounce.ms', freq: 'on input', pii: 'no — never the query itself' },
  { ns: 'menu', name: 'idle.timeout', payload: 'archetype · open.duration.ms', freq: 'after 5s', pii: 'no' },
  { ns: 'menu', name: 'error', payload: 'archetype · code · context', freq: 'rare', pii: 'no — strip user paths' },
  { ns: 'a11y', name: 'kbd.entry', payload: 'archetype · first.key (Tab · ↓ · char)', freq: 'on enter', pii: 'no' },
  { ns: 'a11y', name: 'screen.reader', payload: 'detected · role.misuse?', freq: 'on detect', pii: 'no' },
  { ns: 'a11y', name: 'reduced.motion', payload: 'enabled · source (os · user)', freq: 'session start', pii: 'no' },
  { ns: 'i18n', name: 'miss.key', payload: 'key · locale · namespace', freq: 'on render', pii: 'no — never values' },
  { ns: 'i18n', name: 'overflow', payload: 'archetype · row.id · locale · expansion %', freq: 'on overflow', pii: 'no' },
  { ns: 'perf', name: 'frame.drop', payload: 'archetype · ms · phase (paint/layout/composite)', freq: 'rare', pii: 'no' },
  { ns: 'perf', name: 'budget.exceed', payload: 'archetype · ms · budget.ms', freq: 'on exceed', pii: 'no' }];

  const nsColor = { menu: '#FF6A00', a11y: '#5F7F52', i18n: '#3D8DCC', perf: '#E8A227' };
  return (
    <FitScale w={1280} h={720} background="#FBFAF6">
      <div style={{ width: 1280, height: 720, background: '#FBFAF6', color: '#111418', padding: 52, boxSizing: 'border-box', fontFamily: 'ui-sans-serif, system-ui, sans-serif', overflow: 'auto' }}>
        <div style={{ fontSize: 10, color: '#FF6A00', fontWeight: 700, letterSpacing: '0.18em', fontFamily: 'ui-monospace, monospace' }}>◇.5 · TELEMETRY · 14 EVENTS · 4 NAMESPACES</div>
        <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em', marginTop: 6 }}>Le shell observe ses menus, pas les utilisateurs.</div>
        <div style={{ fontSize: 13, color: 'rgba(17,20,24,.6)', marginTop: 4, maxWidth: 800, lineHeight: 1.5 }}>
          Chaque événement est local · opt-in · agrégé sur 7 jours. Les payloads sont stricts — jamais de contenu utilisateur (requêtes search, paths, valeurs personnelles). Les événements alimentent le motion budget, la table i18n et le bug-tracker.
        </div>

        <div style={{ marginTop: 24, background: '#FFFFFF', borderRadius: 10, border: '.5px solid rgba(17,20,24,.08)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'ui-monospace, monospace', fontSize: 10.5 }}>
            <thead>
              <tr style={{ background: '#111418', color: '#F7F3ED' }}>
                {['NAMESPACE', 'EVENT', 'PAYLOAD', 'FREQ', 'PII'].map((h) =>
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 9, letterSpacing: '0.12em', fontWeight: 700 }}>{h}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {events.map((e, i) =>
              <tr key={i} style={{ borderTop: '.5px solid rgba(17,20,24,.06)' }}>
                  <td style={{ padding: '8px 12px' }}>
                    <span style={{ color: nsColor[e.ns], fontWeight: 700, letterSpacing: '0.08em' }}>{e.ns}</span>
                  </td>
                  <td style={{ padding: '8px 12px', color: '#111418', fontWeight: 600, fontSize: 11 }}>{e.ns}.{e.name}</td>
                  <td style={{ padding: '8px 12px', color: 'rgba(17,20,24,.7)' }}>{e.payload}</td>
                  <td style={{ padding: '8px 12px', color: 'rgba(17,20,24,.55)' }}>{e.freq}</td>
                  <td style={{ padding: '8px 12px' }}>
                    <span style={{
                    padding: '1px 6px', borderRadius: 3,
                    background: e.pii === 'no' ? 'transparent' : 'rgba(230,58,31,.1)',
                    color: e.pii === 'no' ? '#5F7F52' : '#E63A1F',
                    border: `.5px solid ${e.pii === 'no' ? '#5F7F52' : '#E63A1F'}`,
                    fontWeight: 700, fontSize: 9, letterSpacing: '0.1em'
                  }}>{e.pii.startsWith('no') ? 'NO PII' : 'PII!'}</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 20, padding: 14, borderRadius: 10, background: '#111418', color: '#F7F3ED', display: 'flex', gap: 18 }}>
          <div style={{ fontSize: 10, fontFamily: 'ui-monospace, monospace', color: '#FF6A00', fontWeight: 700, letterSpacing: '0.14em' }}>SCHEMA</div>
          <pre style={{ margin: 0, fontSize: 10.5, color: '#F7F3ED', fontFamily: 'ui-monospace, monospace', lineHeight: 1.55, flex: 1 }}>
{`{
  "v": 1,                                  // schema version
  "ts": 1747915200,                        // unix seconds · rounded to minute
  "ns": "menu",                            // namespace
  "name": "pick",                          // event
  "session": "<rotating-hash · 24h>",      // never user-stable
  "p": { ... event payload ... }           // strict shape per event
}`}
          </pre>
        </div>
      </div>
    </FitScale>);

}

/* ════════════════════════════════════════════════════════════════════
   ◇.6 — Production readiness checklist
   ════════════════════════════════════════════════════════════════════ */

function ToolReadiness() {
  // Each component × 6 gates : design / code / a11y / i18n / perf / release-notes
  const items = [
  { id: 'C.01', name: 'Row · base', gates: ['✓', '✓', '✓', '✓', '✓', '✓'] },
  { id: 'C.02', name: 'Row · hover', gates: ['✓', '✓', '✓', '✓', '✓', '✓'] },
  { id: 'C.03', name: 'Kbd hint', gates: ['✓', '✓', '✓', '✓', '✓', '✓'] },
  { id: 'C.04', name: 'Submenu chevron', gates: ['✓', '✓', '✓', '✓', '✓', '✓'] },
  { id: 'C.05', name: 'Toggle pill', gates: ['✓', '✓', '✓', '✓', '✓', '✓'] },
  { id: 'C.06', name: 'Swatch dot', gates: ['✓', '✓', '✓', '✓', '✓', '✓'] },
  { id: 'C.07', name: 'Section label', gates: ['✓', '✓', '✓', '✓', '✓', '✓'] },
  { id: 'C.08', name: 'Separator', gates: ['✓', '✓', '✓', '✓', '✓', '✓'] },
  { id: 'C.09', name: 'Menu shell', gates: ['✓', '✓', '✓', '✓', '✓', '✓'] },
  { id: 'C.10', name: 'Status pill', gates: ['✓', '✓', '✓', '✓', '✓', '✓'] },
  { id: 'C.11', name: 'Sub-label', gates: ['✓', '✓', '✓', '✓', '✓', '✓'] },
  { id: 'C.12', name: 'Mascot row', gates: ['✓', '✓', '✓', '✓', 'WATCH', '✓'] },
  { id: 'C.13', name: 'Radio row', gates: ['✓', '✓', '✓', '✓', '✓', '✓'] },
  { id: 'C.14', name: 'Slider', gates: ['✓', '✓', '✓', '✓', '✓', '✓'] },
  { id: 'C.15', name: 'State header', gates: ['✓', '✓', '✓', '✓', '✓', '✓'] },
  { id: 'C.16', name: 'Search field', gates: ['✓', '✓', '✓', '✓', '✓', '✓'] },
  { id: 'C.17', name: 'Connector', gates: ['✓', '✓', '✓', '✓', '✓', '✓'] },
  { id: 'C.18', name: 'Footer strip', gates: ['✓', '✓', '✓', '✓', '✓', '✓'] },
  { id: 'C.19', name: 'Avatar', gates: ['✓', '✓', '✓', '✓', '✓', '✓'] },
  { id: 'C.20', name: 'Badge · count', gates: ['✓', '✓', '✓', '✓', '✓', '✓'] },
  { id: 'C.21', name: 'Tag chip', gates: ['✓', '✓', '✓', '✓', '✓', '✓'] },
  { id: 'C.22', name: 'Progress · spinner', gates: ['✓', '✓', '✓', '✓', '✓', '✓'] },
  { id: 'C.23', name: 'Tooltip', gates: ['✓', '✓', '✓', '✓', '✓', '✓'] },
  { id: 'C.24', name: 'Step indicator', gates: ['✓', '✓', '✓', '✓', '✓', '✓'] },
  { id: 'CM.07', name: 'Bubble cluster ★', gates: ['✓', '✓', '✓', '✓', 'WATCH', '✓'] },
  { id: 'CM.13', name: 'Account row', gates: ['✓', '✓', '✓', '✓', '✓', '✓'] },
  { id: 'CM.14', name: 'Toast', gates: ['✓', '✓', '✓', '✓', '✓', '✓'] },
  { id: 'CM.15', name: 'Empty state', gates: ['✓', '✓', '✓', '✓', '✓', '✓'] },
  { id: 'CM.16', name: 'Breadcrumb header', gates: ['✓', '✓', '✓', '✓', '✓', '✓'] },
  { id: 'R.04★', name: 'Bubble tree ★', gates: ['✓', '✓', '✓', '✓', 'WATCH', '✓'] },
  { id: 'R.08', name: 'App launcher ✦', gates: ['✓', '✓', '✓', '✓', '✓', '✓'] }];

  const gates = ['DESIGN', 'CODE', 'A11Y', 'I18N', 'PERF', 'RELEASE'];
  const cellTone = (v) => {
    if (v === '✓') return { c: '#5F7F52', fw: 700 };
    if (v === 'WATCH') return { c: '#E8A227', fw: 700 };
    if (v === '·') return { c: 'rgba(17,20,24,.28)', fw: 400 };
    return { c: '#E63A1F', fw: 700 };
  };
  const counts = gates.reduce((acc, _, i) => {
    acc[i] = items.reduce((c, it) => c + (it.gates[i] === '✓' ? 1 : 0), 0);
    return acc;
  }, {});
  return (
    <FitScale w={1280} h={720} background="#FBFAF6">
      <div style={{ width: 1280, height: 720, background: '#FBFAF6', color: '#111418', padding: 52, boxSizing: 'border-box', fontFamily: 'ui-sans-serif, system-ui, sans-serif', overflow: 'auto' }}>
        <div style={{ fontSize: 10, color: '#FF6A00', fontWeight: 700, letterSpacing: '0.18em', fontFamily: 'ui-monospace, monospace' }}>◇.6 · READINESS · 31 COMPONENTS × 6 GATES · v3.1 SHIPPED</div>
        <div style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.02em', marginTop: 6 }}>Tous les composants sont passés. Le board est livré.</div>
        <div style={{ fontSize: 13, color: 'rgba(17,20,24,.6)', marginTop: 4, maxWidth: 760, lineHeight: 1.5 }}>
          Six portes par composant. v3.1 a fermé toutes les portes restantes — restent deux WATCH perf sur les signatures ★ (CM.07 bubble cluster · R.04★ bubble tree) qui consomment volontairement plus de budget que les listes standard.
        </div>

        <div style={{ marginTop: 22, background: '#FFFFFF', borderRadius: 10, border: '.5px solid rgba(17,20,24,.08)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'ui-monospace, monospace', fontSize: 10.5 }}>
            <thead>
              <tr style={{ background: '#111418', color: '#F7F3ED' }}>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 9, letterSpacing: '0.12em', fontWeight: 700 }}>ID</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 9, letterSpacing: '0.12em', fontWeight: 700 }}>COMPONENT</th>
                {gates.map((g, i) =>
                <th key={g} style={{ padding: '10px 8px', textAlign: 'center', fontSize: 9, letterSpacing: '0.12em', fontWeight: 700 }}>
                    {g}
                    <div style={{ fontSize: 8, color: 'rgba(247,243,237,.55)', fontWeight: 500, marginTop: 2 }}>{counts[i]}/{items.length}</div>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {items.map((it) =>
              <tr key={it.id} style={{ borderTop: '.5px solid rgba(17,20,24,.06)' }}>
                  <td style={{ padding: '7px 12px', color: '#FF6A00', fontWeight: 700 }}>{it.id}</td>
                  <td style={{ padding: '7px 12px', fontFamily: 'ui-sans-serif, system-ui, sans-serif', fontSize: 12, fontWeight: 500 }}>{it.name}</td>
                  {it.gates.map((v, i) => {
                  const ct = cellTone(v);
                  return (
                    <td key={i} style={{ padding: '7px 8px', textAlign: 'center', color: ct.c, fontWeight: ct.fw, fontSize: v.length > 1 ? 9.5 : 13 }}>
                        {v}
                      </td>);

                })}
                </tr>
              )}
              <tr style={{ borderTop: '1px solid rgba(17,20,24,.18)', background: 'rgba(255,106,0,.04)' }}>
                <td colSpan={2} style={{ padding: '12px 14px', fontWeight: 700, fontSize: 11 }}>READY · % complete</td>
                {gates.map((g, i) => {
                  const pct = Math.round(counts[i] / items.length * 100);
                  return (
                    <td key={g} style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 700, color: pct >= 80 ? '#5F7F52' : pct >= 50 ? '#E8A227' : '#E63A1F' }}>
                      {pct}%
                    </td>);

                })}
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
          <div style={{ padding: 14, borderRadius: 10, background: '#FFFFFF', border: '.5px solid rgba(17,20,24,.08)' }}>
            <div style={{ fontSize: 9, color: '#FF6A00', fontWeight: 700, letterSpacing: '0.14em', fontFamily: 'ui-monospace, monospace', marginBottom: 8 }}>LEGEND</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11 }}>
              <div><span style={{ color: '#5F7F52', fontWeight: 700 }}>✓</span> done & signed-off</div>
              <div><span style={{ color: '#E8A227', fontWeight: 700 }}>WATCH</span> needs review</div>
              <div><span style={{ color: '#E63A1F', fontWeight: 700 }}>kbd? · rtl</span> known gap</div>
              <div><span style={{ color: 'rgba(17,20,24,.4)' }}>·</span> not started</div>
            </div>
          </div>
          <div style={{ padding: 14, borderRadius: 10, background: '#FFFFFF', border: '.5px solid rgba(17,20,24,.08)' }}>
            <div style={{ fontSize: 9, color: '#FF6A00', fontWeight: 700, letterSpacing: '0.14em', fontFamily: 'ui-monospace, monospace', marginBottom: 8 }}>DEFINITION · CODE READY</div>
            <div style={{ fontSize: 11, lineHeight: 1.5, color: 'rgba(17,20,24,.7)' }}>
              snippets QML+Qt+Flutter+CSS · unit tests · pixel-perfect storybook screen · review approved par 2 ingés · pas de TODO résiduel
            </div>
          </div>
          <div style={{ padding: 14, borderRadius: 10, background: '#111418', color: '#F7F3ED' }}>
            <div style={{ fontSize: 9, color: '#FF6A00', fontWeight: 700, letterSpacing: '0.14em', fontFamily: 'ui-monospace, monospace', marginBottom: 8 }}>RELEASE GATE · v1.0</div>
            <div style={{ fontSize: 11, lineHeight: 1.5, color: 'rgba(247,243,237,.85)' }}>
              tous les <b>atomes</b> à 100 % · au moins <b>3 recettes</b> à 100 % · matrice WCAG 2.2 AA · perf-budget vert sur Wayland Sway / Hyprland · sound design présent
            </div>
          </div>
        </div>
      </div>
    </FitScale>);

}

Object.assign(window, {
  ToolIconCatalogue, ToolI18n, ToolStateCatalogue,
  ToolPerfBudget, ToolTelemetry, ToolReadiness
});