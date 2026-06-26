# ZIP Drop Audit - Merging design assets and specs (2)

Source archive: `/home/tension_atoi/Downloads/Merging design assets and specs (2).zip`
Extracted for audit: `/tmp/gnuin-zipdrop-2`
SHA256: `659d26c2a8cfcb480aef929e23ae8f64e0a739d11a3a1e5a9dc83c8ff4f26d60`

## Executive Decision

Do not import this drop as a whole. It contains real new work, but it is mixed with older page shells that would regress the current documentation site.

The safe strategy is a selective merge:

1. Keep the repo-owned site shell: `nav.js`, `docs.css`, `index.html`, cube favicon, docs pages, current Index, current Syster component, and current smoke tests.
2. Cherry-pick data/runtime advances from the drop: Central frontiers, `port-data` additions, agentic molecules, motion reconciliation, and the Gnosis live-overlay fix.
3. Manually patch public pages with the useful new content, preserving nav/favicon/mobile/a11y and scrubbing public `QML` / `demo` copy.

## Raw Diff Totals

Compared archive contents against the current repo, excluding `.git`:

| Class | Count | Meaning |
|---|---:|---|
| Added in ZIP | 65 | New paths in the archive that the repo does not have. |
| Repo-only | 68 | Current repo paths not present in the archive. Most are current site architecture and regression artifacts. |
| Changed common files | 72 | Same path exists in both, content differs. |
| Same common files | 481 | No content difference. |

The most important repo-only files are `nav.js`, `docs.css`, `index.html`, docs pages, current `Sys.ter Mascot Kit.dc.html`, `_components/Syster.dc.html`, and all smoke tests. A full archive overwrite would delete or bypass these.

## Hard Regressions In The ZIP

### Public HTML Shell

Every root `.dc.html` in the drop is missing the shared favicon and nav script:

- `nav.js`: missing from every root `.dc.html` in the ZIP.
- `assets/symbols/cube.svg`: missing from every root `.dc.html` in the ZIP.

This directly violates the current site contract: common nav, cube favicon, floating rail, cascade menus, mobile rail behavior, and current smoke gates.

### Public Language

The drop reintroduces copy that current gates are meant to block:

- `Central.dc.html`: `Auto-demo`; visible or renderable `QML` string.
- Atlas/Fondations/Handoff/Plan pages: multiple `QML` / `Quickshell/QML` labels.
- `animations.jsx`, `trigger-film.jsx`, film sources: `demo` and `surface QML`.

Public pages should keep the cleaner wording already used in the repo: native host / runtime / source / preview / showcase, depending on context.

### Index

The ZIP `Gnu.In-Shell - Index.dc.html` is older and much smaller:

- current: 53,282 bytes
- ZIP: 14,493 bytes

It removes the enriched Index architecture, title treatment, public documentation framing, nav, and favicon. Keep the repo Index as canonical.

### Syster Source

The ZIP adds root `Syster.dc.html`. This is not a blocking issue because the mascot is already in redesign. The only rule is publication discipline: do not promote this root file as the new canonical mascot component until the redesign is validated.

- ZIP antenna: `left:86.25%; top:8.50%; width:14.90%`
- Current canonical component antenna: `left:83.75%; top:8.90%; width:14.40%`
- ZIP face: `left:18.19%; top:28.75%; width:63.62%; height:51.91%`
- Current canonical face: `left:21.90%; top:33.20%; width:56.20%; height:41.70%`

Keep `_components/Syster.dc.html` as the temporary public canon until the redesign is ready. The ZIP `Syster.dc.html` can remain a redesign/prototype source if needed, but it should not replace the public component in this batch.

### Runtime Support

The ZIP `support.js` has one useful improvement: sequential multi-file `x-import` loading. But it also removes the special routing that fetches `Syster` from `_components/Syster.dc.html`.

Current repo behavior must be preserved. If the multi-import loader is needed later, port it manually without dropping the Syster routing.

### Molecule Gallery

The ZIP adds the agentic family, which is useful, but its `menu/molecule-data-gallery.jsx` also removes current mobile/a11y work:

- removes `narrow` responsive state;
- removes mobile-specific padding/grid sizing;
- removes `aria-pressed` on segmented buttons;
- removes the renderer proof cards;
- changes French public proof copy back to English.

Merge only the agentic icons/layouts/spec records. Preserve the current responsive gallery structure.

### Gnosis App Duplicate

The ZIP adds `uploads/Gnosis App (1)`, but this is almost a duplicate of existing `uploads/Gnosis App`.

Real differences:

- new `screenshots/live-settled.png`;
- changed `.thumbnail`;
- changed `Gnosis HUD.html` defaults and removed favicon;
- changed `Gnosis Live.html` and removed favicon;
- changed `gnosis/live-overlay.jsx`.

Only `gnosis/live-overlay.jsx` is a clear code fix: it avoids calling a parent update from inside a React state updater. Port that file or patch that block into the canonical existing folder. Do not import the duplicated directory name.

## Useful New Work

### Central Frontiers

The ZIP `Central.dc.html` grows from 249,633 bytes to 321,102 bytes and adds substantial live-surface work:

- Gnosis HUD and Gnosis left sidebar;
- Taskbar appearance and 12 widget toggles;
- Compositor section with profile/candidates/experimental gate/portal health;
- Panel Family controls;
- Displays/Input/Services/Developer settings scaffolds;
- agentic `GnuContextMenu` anatomy with risk tiers, suggestions, plan/apply footer, privacy lamps.

Merge direction: port the feature work into current `Central.dc.html`, but keep current nav/favicon, scrub `Auto-demo`, scrub visible `QML`, and add a Central-specific smoke gate.

### Port Data

Good candidates to import or manually merge:

- `port-data/MANIFEST.json`
- `port-data/PARITY.md`
- `port-data/molecule_specs.json`
- `port-data/motion.spec.json`
- `port-data/bar_settings.rs`
- `port-data/compositor_profile.rs`
- `port-data/panel_family.rs`
- `port-data/settings_pages.rs`
- `port-data/scenes/compositor-profile.json`
- `port-data/scenes/panel-family.json`
- `port-data/scenes/settings-pages.json`

Caution: several files use `QML` in source/provenance copy. That can remain in technical source files if needed, but public pages must not render it.

### Agentic Molecules

The ZIP moves the context menu registry from 27 to 30 molecules:

- `AgenticGnuContextMenu`
- `AgenticPlanConfirm`
- `AgenticSuggestBubble`

New model fields:

- `risk`
- `badge`
- `agent`
- `plan`
- `privacy`

Merge direction: update `port-data/molecule_specs.json`, extend `MoleculeRenderer`, and keep the current gallery mobile/a11y shell.

### Motion Reconciliation

The ZIP `port-data/motion.spec.json` adds a two-layer motion model:

- engine layer: `blob.in/tokens.json` v0.14.0, authoritative;
- UI-kit layer: motion spec v0.4.0 for menu/chrome atom-molecule vocabulary;
- shared springs: `settle`, `snap`, `wobbly`.

Merge direction: import the reconciliation block, then update `Motion.dc.html`, `Evidence.dc.html`, and `Central Live.dc.html` in public language.

### Integration And Molecules Pages

Useful sections exist inside changed Atlas pages:

- `Gnu.In-Shell - Intégration.dc.html`: new Frame E for surfaces/settings and `shell_settings` map.
- `Gnu.In-Shell - Molécules.dc.html`: new CM.18 `GnuContextMenu` agentic section.

Merge direction: transplant those sections into current pages while preserving nav/favicon and removing public `QML` copy.

## Reject / Hold List

Do not import as-is:

- `Gnu.In-Shell - Index.dc.html`: older Index, destructive.
- all root `.dc.html` wrappers from ZIP: missing nav/favicon.
- `Syster.dc.html`: hold as redesign/prototype source; do not promote as public canon in this batch.
- `support.js`: useful loader idea but breaks Syster routing if copied.
- `animations.jsx`: only regresses wording from preview to demo.
- `film-scenes.jsx`, `trigger-film.jsx`, `Trigger Film.dc.html`: film remains hidden and ZIP regresses language.
- `uploads/Gnosis App (1)` as a folder name: duplicate source, import only targeted changes.
- `SHELL_INVENTORY_AUDIT.md` as-is: useful data, but has malformed text and public-language issues.
- `CONTEXT_MENU_FRONTIERS.md` as public copy: useful plan source, but contains roadmap/internal framing.

## Proposed Merge Batches

### Batch 1 - Data And Runtime Sources

Import/patch `port-data` additions, agentic molecule records, renderer strategies, and the Gnosis `live-overlay.jsx` fix.

Gates:

- `node --check` on changed JS;
- JSON parse for all changed `.json`;
- smoke renderer must report 30 molecules and include the agentic family.

Batch 1 execution status: applied.

Imported or patched:

- new port mirrors: `bar_settings.rs`, `compositor_profile.rs`, `panel_family.rs`, `settings_pages.rs`;
- new golden scenes: `scenes/compositor-profile.json`, `scenes/panel-family.json`, `scenes/settings-pages.json`;
- `molecule_specs.json` now carries 30 molecules, including `AgenticGnuContextMenu`, `AgenticPlanConfirm`, and `AgenticSuggestBubble`;
- `MoleculeRenderer` and `DataGallery` now render the agentic layouts while preserving the current responsive gallery shell;
- `motion.spec.json` carries the engine/ui-kit reconciliation block;
- canonical `uploads/Gnosis App/gnosis/live-overlay.jsx` includes the React state-updater fix from the duplicate ZIP source;
- no full root page shell, `support.js`, duplicated `uploads/Gnosis App (1)`, or Syster redesign source was imported.

Verification note: Node 22 cannot syntax-check `.jsx` directly in this repo (`ERR_UNKNOWN_FILE_EXTENSION`), so JSX behavior is validated by the browser smoke scripts instead.

### Batch 2 - Central Live Surface

Port Central frontiers into current `Central.dc.html`.

Required cleanup:

- keep nav/favicon;
- replace `Auto-demo` with non-demo language;
- remove visible `QML`;
- keep current Syster import path;
- add bounded mobile behavior check.

Gates:

- new `tools/smoke-central-surface.js`;
- no body `QML` / `demo`;
- no missing favicon;
- no mobile horizontal overflow;
- key sections visible: Taskbar, Widgets, Compositor, Panel Family, Settings, Gnosis, Agentic menu.

Batch 2 execution status: applied.

Imported or patched:

- `Central.dc.html` now carries the Central frontier work from the ZIP: Gnosis HUD/sidebar, Syster toggle, taskbar and widget controls, compositor profile controls, panel family controls, settings pages, and agentic context-menu anatomy;
- the repo shell contract was restored after import: shared `nav.js`, cube favicon, current `_components/Syster.dc.html` path, and public language scrub;
- visible `Auto-demo` was replaced with `Auto-preview`;
- visible `QML` wording was replaced with neutral runtime language;
- `tools/smoke-central-surface.js` was added as the dedicated Central gate.

Verification passed:

```bash
OUT_DIR=/tmp/gnuin-smoke-central-batch2 node tools/smoke-central-surface.js
OUT_DIR=/tmp/gnuin-smoke-index-batch2 node tools/smoke-index-surface.js
OUT_DIR=/tmp/gnuin-smoke-docs-batch2 node tools/smoke-doc-pages.js
OUT_DIR=/tmp/gnuin-smoke-showcase-batch2 node tools/smoke-showcase-surfaces.js
git diff --check
node --check tools/smoke-central-surface.js tools/smoke-showcase-surfaces.js tools/smoke-doc-pages.js tools/smoke-index-surface.js
```

### Batch 3 - Public Documentation Updates

Patch, not replace:

- `Central Live.dc.html`
- `Evidence.dc.html`
- `Assets.dc.html`
- `Context.dc.html`
- `Motion.dc.html`
- `Gnu.In-Shell - Intégration.dc.html`
- `Gnu.In-Shell - Molécules.dc.html`

The copy should describe useful documentation: what exists, what is source-backed, what is showcase-only, and what remains not final. Avoid meta/project-management text on public surfaces.

### Batch 4 - Regression Gates

Update smoke tests to include:

- 30 molecule count;
- agentic family;
- Central frontier text;
- nav/favicon on all public root surfaces;
- no `QML` / `demo` in rendered body text;
- no top-level Film surfacing.

## Verification Commands

Use after each implementation batch:

```bash
git diff --check
node --check nav.js tools/smoke-doc-pages.js tools/smoke-showcase-surfaces.js tools/smoke-index-surface.js
node tools/smoke-doc-pages.js
node tools/smoke-showcase-surfaces.js
node tools/smoke-index-surface.js
```

Add after Central merge:

```bash
node tools/smoke-central-surface.js
```

## Full Changed-Path Inventory

### Added In ZIP

```text
CONTEXT_MENU_FRONTIERS.md
Syster.dc.html
gnu.in-OS - Plan de Fusion.dc.html
port-data/bar_settings.rs
port-data/compositor_profile.rs
port-data/panel_family.rs
port-data/scenes/compositor-profile.json
port-data/scenes/panel-family.json
port-data/scenes/settings-pages.json
port-data/settings_pages.rs
uploads/Gnosis App (1)/*
uploads/pasted-1782440946751-0.png
```

### Repo-Only Structural Files

```text
.gitignore
.nojekyll
Animations.dc.html
Assets.dc.html
Central Live.dc.html
Communications.dc.html
Context.dc.html
Evidence.dc.html
Methodology.dc.html
Motion.dc.html
Project.dc.html
Roadmap.dc.html
Sys.ter Mascot Kit.dc.html
_components/Syster.dc.html
assets/symbols/cube.svg
docs.css
docs/README.md
docs/documentation-architecture-set-taxonomy.md
docs/zip-drop-porting-protocol.md
index.html
menu/context-menu-showcase.jsx
nav.js
port-data/topbar_settings.rs
tools/smoke-doc-pages.js
tools/smoke-index-surface.js
tools/smoke-showcase-surfaces.js
```

### Changed Common Files Requiring Review

```text
Central.dc.html
Gnu.In Context Menus.dc.html
Gnu.In-Shell - Atlas Unifié.dc.html
Gnu.In-Shell - Atomes.dc.html
Gnu.In-Shell - Fondations.dc.html
Gnu.In-Shell - Handoff.dc.html
Gnu.In-Shell - Index.dc.html
Gnu.In-Shell - Intégration.dc.html
Gnu.In-Shell - Molécules.dc.html
Molecule Renderer.dc.html
SHELL_INVENTORY_AUDIT.md
Trigger Film.dc.html
animations.jsx
film-scenes.jsx
gnu.in-OS - Plan de Fusion (complet).dc.html
menu/molecule-data-gallery.jsx
menu/molecule-renderer.jsx
port-data/MANIFEST.json
port-data/PARITY.md
port-data/compose_core.rs
port-data/dock_settings.rs
port-data/host_menu_state.rs
port-data/host_protocol.rs
port-data/molecule_specs.json
port-data/motion.spec.json
port-data/motion_core.rs
port-data/scenes/wire-protocol.json
port-data/shell_settings.json
support.js
trigger-film.jsx
uploads/Context.Spec/*
uploads/GNU.IN Design System/*
uploads/Gnosis App/*
uploads/gnosis.html
uploads/recursive-membranes.html
uploads/visualizers.html
```
