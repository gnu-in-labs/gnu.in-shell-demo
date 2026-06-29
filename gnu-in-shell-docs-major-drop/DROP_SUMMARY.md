# Drop Summary — gnu-in-shell-docs-major-drop

Baseline: `main @ 51db817ff592`. This is a **direct overlay archive** — the ZIP root maps to the
repo root, and contains only changed/new files plus the required shared files needed for those
pages to load. Extract into a scratch folder, compare paths, then copy over.

## Headline

The public corpus is now **genuinely bilingual (EN/FR)**. The previous pages described a
"Pretext multilingue" capability but did not use it, so a default (English) reader saw French.
This drop wires the real `window.GnuInPretext` engine into the documentation surfaces:

- French stays the **canonical** markup; translatable leaves carry `data-pretext-key`.
- Each page registers an English map (`GnuInPretext.register('en', { … })`); `applyPretext`
  swaps `textContent` when the active profile is English; a `MutationObserver` re-applies on DC mounts.
- **English is the default** profile (browser auto-detect → English fallback), with a manual EN/FR
  toggle in the shared nav and `?lang` persisted + propagated to internal links.

## Critical fixes in this revision

Wiring real English maps surfaced two latent bugs (dormant while no map was ever registered). Both fixed:

- **Infinite-loop freeze (all translated pages).** `nav.js` `applyPretext()` wrote `node.textContent`
  unconditionally; since that write is itself a DOM mutation, it re-triggered the `MutationObserver`
  that calls `applyPretext` → endless loop → pages froze blank. Fixed with a one-line idempotency guard
  (`&& node.textContent !== value`) so it writes only on a real change and settles after one pass.
- **React crash (Index).** Two keyed Index nodes contained child elements (`<b>` in the lede,
  `<strong>` in the hero chips); overwriting their `textContent` deleted elements React was tracking →
  reconcile crash → blank Index. Fixed by moving keys onto leaf elements.
- **Single-CDN fragility (`dc-boot.js`, new).** Every DC page hid itself then loaded React from one CDN
  via `support.js`; one outage blanked all pages. `dc-boot.js` adds an unpkg → jsDelivr → cdnjs fallback
  chain, then injects `support.js` (which skips its own fetch once React is present). All DC pages now
  load `dc-boot.js` instead of `support.js`.

No redesign. The strong visual system, the Index contract, the nav IA, the cascades, the floating
rail, and the favicon are preserved exactly, per the repo's own porting protocol and the
documentation taxonomy ("increase documentation depth … do not propagate a visual iteration").

## What changed

- **Index** — bilingual orientation layer: hero (kicker, lede, quick chips), the five section
  titles, and the "role of the index" ledger now swap EN/FR. Contract and layout unchanged.
- **Project, Methodology, Assets, Evidence, Communications** — fully bilingual via
  `data-pretext-key` + a registered EN map. Cross-links corrected to match the documentation
  tour and the smoke `requiredLinks` (Assets→Methodology see-also, Evidence→Communications,
  Communications→Project). Evidence gained a Pretext-smoke row + a bilingual claims-ledger row;
  Communications gained a ready-to-ship launch note.
- **Roadmap** (DC) — fully bilingual via dynamic per-phase `data-pretext-key`; each phase gained
  an "evidence expected" line so the roadmap states proof, not just intent.
- **Central** — one safety fix only: the rendered French word `démons` (daemons) → `services`, so
  the `/Démo/i` public-copy check cannot substring-match it. No layout or behaviour change.
- **Gates** — `smoke-index/doc-pages/showcase` pinned to `?lang=fr` so the French `requiredText`
  contracts still assert after the bilingual swap; **new** `smoke-pretext-surface.js` proves the
  EN/FR layer and the English default.

## What stayed canon (unchanged, shared)

`nav.js`, `support.js`, `docs.css`, `index.html`, `_components/Syster.dc.html`, the cube favicon,
the `_ds` design-system bundle, and the brand fonts. The mascot remains the **current** Syster
artwork — it is in redesign and **no** new mascot iteration is promoted here.

## What remains candidate / next pass

- EN coverage for the Index **deep** sections (parcours cascade, second surface registry,
  live-map chain) and for Context, Animations, Motion, Central, and the Atlas canvases. The
  engine + default are in place; these surfaces stay FR-canonical until their EN maps land.
- `smoke-canvas-surfaces` bounded-scroll assertions to close the partial Atlas-canvas claim.
- Syster mascot redesign (kept showcase-only).

## Gates that should pass

`git diff --check` · `node --check` on `nav.js` + all `tools/*.js` · `JSON.parse` of the manifest ·
`smoke-index-surface` · `smoke-doc-pages` · `smoke-showcase-surfaces` · `smoke-central-surface` ·
`smoke-canvas-surfaces` · **`smoke-pretext-surface`**. Public root-HTML grep finds no forbidden
public strings in rendered copy. See `REGRESSION_GATES.md` for exact commands.
