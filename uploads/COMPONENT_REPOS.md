# Component Repositories

GNU.IN OS is now the integration authority for a constellation of component
repositories. The OS repo owns release staging, runtime state templates,
contracts, build orchestration, and compatibility tests. Component source lives
in private repos pinned by `components.lock.toml`.

## Phase 1 Components

| Component | Role | Checkout | License |
|---|---|---|---|
| `gnu.in-shell` | Quickshell/QML shell product surface, including embedded `components/blob.in` until the standalone BlobIn repo is materialized | `../gnu.in-shell` | AGPL-3.0 |
| `gnu.in-design-reference` | Canonical design source, visual references, token files, imported specs, and provenance | `../gnu.in-design-reference` | AGPL-3.0 |
| `gnuin-hyprconf` | Rust Hyprland settings authority | `../gnuin-hyprconf` | MIT |
| `gnu.in-gnosis-app` | Gnosis app surface and shell-facing client layer | `../gnu.in-gnosis-app` | AGPL-3.0 |

## In-repo engines & services

| Engine | Role | Path | License |
|---|---|---|---|
| `blob.in` | Rust organic-shape engine (blobin-core) + Qt render shim (blobin-qt, ≤300 LoC) | `engine/blob.in` | AGPL-3.0 |
| `gnosis-engine` | D-Bus service, schema authority, semantic memory integration, vision/TTS bridges | `engine/gnosis-engine` | AGPL-3.0 |
| `gnosis-sentinel` | Runtime monitoring, telemetry, boot audit, process lifecycle tracking | `engine/gnosis-sentinel` | AGPL-3.0 |
| `gnuin-asset-core` | SQLite-backed local asset and importable component registry for visual modules, taskbar/dock affordances, AI-assisted tags, source-only component manifest proposals plus dock/taskbar composition previews from local assets, provenance-first imports, and source-only taskbar/dock plan handoffs | `engine/gnuin-asset-core` | AGPL-3.0 |
| `gnuin-gpui-theme` | Material Design 3 chrome tokens, GPUI glass primitives for shell surfaces | `engine/gnuin-gpui-theme` | AGPL-3.0 |
| `gnuin-bar` | Native taskbar/topbar (sctk + tiny-skia), per-monitor module handoff consumer, vertical side-edge render path, and single-surface multi-monitor hug modes | `engine/gnuin-bar` | AGPL-3.0 |
| `gnuin-dock` | Native dock host, runtime module state, and affordance renderer for source-planned card-deck dock modules, with source-only tests proving `gnuin-asset-core` preview handoffs render native card-deck frames | `engine/gnuin-dock` | GPL-3.0-or-later |
| `gnuin-settings-core` | Framework-free schema & validator crate (serde-only, fast verify) | `engine/gnuin-settings-core` | AGPL-3.0 |
| `gnuin-settings-schema` | Generated schema from settings definitions | `engine/gnuin-settings-schema` | AGPL-3.0 |
| `gnuin-compose-core` | Framework-free visual runtime core: tokens, retained scene graph, diff/input regions, and motion semantics for native shell surfaces | `engine/gnuin-compose-core` | AGPL-3.0 |
| `gnuin-compose-host` | Native layer-shell host that mounts compose-core scenes and renders composed surfaces | `engine/gnuin-compose-host` | AGPL-3.0 |
| `gnuin-vector-core` | Vector algebra and spatial utilities | `engine/gnuin-vector-core` | AGPL-3.0 |
| `blob-uniforms` | Token generator & design-time utilities (optional; opt-in feature gating) | `engine/blob-uniforms` | AGPL-3.0 |
| `backend` | Miscellaneous daemon helpers & native bridge stubs | `engine/backend` | AGPL-3.0 |

### Notable in-repo engines

**`blob.in`** — versioned with this repo (no lock entry). Its design-source mirror
lives in `gnu.in-design-reference/blob.in/` and is synced engine → reference,
never the reverse. `tools/materialize-shell.sh` stages the workspace into
`components/blob.in/engine/` of every release, and `tools/verify.sh` runs the
auto readiness gates R1-R6 on every verification.

**Flip procedure** — switching the production default to `BLOBIN_BACKEND=rust`
is a config change, not a rebuild, and is **human sign-off only**. The full
criteria (gates R1-R10 green, held for a two-week dogfood, instant rollback to
`cpp`) are defined in `engine/blob.in/readiness.md`; run
`bash engine/blob.in/tools/readiness.sh` for the live auto-gate view and
`bash engine/blob.in/tools/flip-readiness.sh verify` for the final pre-flip
guard. Manual gate protocols and sign-off templates live in
`engine/blob.in/tools/`.

**`gnuin-gpui-theme`** — M3 chrome tokens and GPUI glass primitive definitions for the shell's
adoption of GPUI as the settings renderer and future native surfaces. Separate from
component-locked design tokens; coordinates with `gnu.in-design-reference` for visual coherence.

## Workflow

Use the manifest tooling before build or verification:

```sh
tools/components.py list
tools/components.py verify-lock
tools/components.py sync
tools/bump lock gnu.in-shell
tools/components.py bump lock gnu.in-shell
tools/components.py bump-lock gnu.in-shell
tools/bump-lock.sh gnu.in-shell
tools/bump-lock gnu.in-shell
tools/components-status [--json] [COMPONENT...]
``` 

`components.toml` defines logical repos, local checkout paths, and roles.
`components.lock.toml` defines the exact revisions consumed by this OS branch.
After a component commit is ready, `bump lock` records the checkout `HEAD`,
updates `components.lock.toml`, refreshes `release/GLOBAL-VERSION.json`, and
keeps the live overhaul checkpoint table aligned when it references that
component.

`tools/bump lock` is the short agent-facing command group. It delegates to
`tools/components.py bump lock` so there is one lock mutation implementation.
`tools/bump-lock` is a direct shell alias entrypoint with identical behavior
to support workflows where the `.sh` suffix is not desirable.
`tools/bump-lock.sh` and `tools/components.py bump-lock` are compatibility
entrypoints for existing scripts.

`tools/verify.sh` checks component locks, runs component tests, and then runs OS
integration contracts against a materialized shell tree. `tools/build.sh`
stages the same pinned component payloads into `build/releases/<build-id>/`
without promoting the live runtime.

GitHub Actions needs a `GNUIN_COMPONENTS_TOKEN` secret with read-only access to
the private component repos before it can run full OS integration verification.
Without that secret, CI reports the missing token and skips component verify
instead of pretending the private checkouts exist.

## Boundaries

- The shell repo owns QML runtime source and shell-local tests.
- The design reference repo is a build-time design source. It may provide
  runtime-eligible assets, fonts, tokens, and reference/spec files to the staged
  shell via `tools/materialize-shell.sh`. The materialized `design_system/`
  directory is a self-contained mirror of that canonical source; top-level
  `assets/` and `design_refs/` are compatibility copies. Raw JSX/CSS prototypes
  remain reference material and are not QML runtime source.
- Embedded BlobIn code must use GNU.IN-owned imports and may only acknowledge its
  inspiration in provenance docs.
- Hyprconf owns Hyprland config mutation; QML remains a presentation surface.
- Gnosis app owns the companion HUD, Gnosis service client singletons, overlays,
  and native tracker source. `gnu.in-os` materializes it into the staged shell
  tree via `gnu.in-gnosis-app/tools/materialize-into-shell.sh`; `gnu.in-shell`
  owns the host anchors but not the Gnosis source files.
- `contracts/` stays in `gnu.in-os` until multiple external repos depend on it
  as a stable API.
