# Roadmap

This roadmap is intentionally practical. GNU.IN OS is a beta local-first desktop runtime. The goal is not to pretend it is a finished distribution. The goal is to turn a strong working idea into a project that can be inspected, tested, discussed, and improved by other people.

## Roadmap principles

- Do not market what the repo cannot prove.
- Keep the project fun, but make the fun legible.
- Convert experiments into contracts when they become important.
- Keep local-first ownership as a design constraint, not just a slogan.
- Prefer small reviewable improvements over large opaque rewrites.

## Phase 0: Governance baseline

Status: near-complete — 3 administrative items remain.

Goal: make the project understandable before trying to make it widely usable.

Deliverables:

- [x] project charter;
- [x] public stance on AI, automation, and vibe coding;
- [x] AGPL-3.0 root license;
- [x] CODEOWNERS baseline;
- [x] CI workflow tied to real verification script;
- [x] security workflow baseline;
- [x] Dependabot for real package roots;
- [ ] license policy for mixed AGPL/MIT components; *(draft in `docs/LICENSE_POLICY.md`)*
- [ ] branch protection or ruleset requiring review/checks;
- [ ] CI status confirmed green on a clean runner.

## Phase 1: Source and CI hardening

Status: in progress.

Goal: make the repository self-checking without requiring the maintainer's live graphical session.

Tasks:

- split `tools/status.sh` into source-only and runtime checks;
- add formatting checks for Rust and shell scripts;
- add per-manifest Rust test matrix;
- document required Linux packages for CI;
- add `engine/blob-uniforms` to Dependabot or document why it is out of scope;
- add a CI job that validates docs links and workflow YAML syntax;
- pin or review high-risk GitHub Actions.

Exit criteria:

- CI gives a meaningful red/green signal;
- failed checks fail the workflow;
- runner dependencies are documented;
- CI does not pretend to test live Hyprland runtime behavior.

## Phase 2: Security boundary documentation

Goal: make local automation risk inspectable.

Tasks:

- document D-Bus methods by risk level;
- document Gnomon and Sentinel Unix socket schemas;
- document shared-memory layouts and permissions;
- define command-generation policy before any model-generated command can execute live;
- document screenshot/audio capture behavior;
- add privacy notes to public docs;
- add tests for path expansion, request parsing, and high-risk config mutation paths.

Exit criteria:

- every high-risk method has an owner, risk level, and expected verification path;
- public docs do not overclaim safety;
- telemetry policy is explicit.

## Phase 3: Local release discipline

Goal: make local builds reproducible enough to compare and roll back.

Tasks:

- preserve `tools/build.sh` staging isolation;
- add release manifest and beta version-signature validation;
- add documented rollback flow;
- add artifact checksum verification command;
- create release notes template;
- wire private GitHub releases as the first Gnosis package-manager release channel;
- maintain the `v0.x.y` beta-channel train with signed local build artifacts until `v1.0.0`;
- avoid public install claims until install/update/rollback is documented.

Exit criteria:

- each release has scope, verification, known limitations, and rollback notes;
- each local build has `version-signature.json`, `build-manifest.json`, and verified checksums;
- tags are immutable;
- public releases are pre-release while the project is experimental.

## Phase 4: Architecture documentation

Goal: make the system understandable to someone who did not build it.

Tasks:

- write `docs/ARCHITECTURE.md`;
- map shell surfaces to `contracts/surfaces.toml`;
- map runtime services to `contracts/runtime.toml`;
- document Gnosis Engine responsibilities;
- document Gnomon ledger limitations;
- document Sentinel monitoring responsibilities;
- document how Quickshell, Hyprland, D-Bus, Unix sockets, and shared memory relate.

Exit criteria:

- a reader can understand the system without opening every source file;
- diagrams or tables identify boundaries and data flow;
- experimental parts are marked.

## Phase 5: `gnu6.live` boundary

Goal: publish the public idea without confusing the website with the OS runtime.

Tasks:

- define whether `gnu6.live` lives in a separate repository;
- define static artifact format;
- keep VPS deploy manual until artifact strategy exists;
- publish manifesto, project charter, roadmap, and screenshots when available;
- avoid download/install claims before release packaging exists.

Exit criteria:

- website deployment is independent from OS runtime deployment;
- production secrets are not coupled to the private OS repo;
- site content matches project maturity.

## Phase 6: External tester path

Goal: make the project testable by someone other than the maintainer.

Tasks:

- document supported distro/session assumptions;
- document hardware assumptions;
- document install and uninstall paths;
- create smoke tests;
- define log collection that does not leak private content;
- create known issues list;
- create feedback template.

Exit criteria:

- an external tester can try a pre-release without guessing the architecture;
- rollback/uninstall is documented;
- the project still clearly says experimental.

## Phase S4: Shell visual and behavioral overhaul (active — v0.14.x)

Status: in progress, parallel to Phases 0–1.

This phase was not anticipated in the original sequence but is the active
development rail as of v0.14.2. It runs against the Jillarious-Jimpulse
reference and migrates shell surfaces from QML to native Rust/sctk hosts.

Work completed or in flight:
- `gnuin-bar`, `gnuin-dock`, `gnuin-launcher`, `gnuin-osd`, `gnuin-notification`, `gnuin-screen-corners`, `gnuin-background`, `gnuin-wallpaper-selector`, `gnuin-session-screen`, `gnuin-osk`, `gnuin-region-tools`, `gnuin-screen-translator` — native hosts staged and promoted by the release rail; `gnuin-launcher`, `gnuin-wallpaper-selector`, `gnuin-session-screen`, `gnuin-osk`, and `gnuin-screen-translator` are idle socket user units for the plain app-launch toggle, wallpaper picker, session/power overlay, on-screen keyboard lifecycle, and screen-translator overlay lifecycle/result projection, `gnuin-region-tools` is a windowless socket daemon for region capture/OCR/record actions, while `gnuin-osd`, `gnuin-notification`, `gnuin-screen-corners`, and `gnuin-background` remain the always-on renderer units in this wave;
- `gnuin-compose-core` is now the priority visual runtime engine: canonical
  tokens, retained scene graph, z-order, hit/input regions, diff/invalidation,
  and motion primitives must be shared here before individual Rust hosts chase
  1:1 QML polish independently. Wallpaper becomes a first consumer of this
  model through retained per-output state. The first source slice has
  `WallpaperKey`/`WallpaperSlot` current-pending state, idempotent same-frame
  workspace-slide handling, stale decode generation drops, and bounded
  decoded-frame caching keyed by effective composed-frame inputs; engine-driven
  crossfade/parallax and runtime visual proof remain the next wallpaper steps;
- `gnuin-cheatsheet` — utility-surface native cutover: staged/promoted as an on-demand host plus `gnuin-cheatsheet-toggle`, exposed to the Rust app launcher through its promoted desktop entry, and driven by `CheatsheetService`/Super+less through `gnuin/cheatsheet.sock` when `shell.cheatsheetHost=rust`; the QML host is retained only as fallback;
- `gnuin-media-controls` — utility-surface native cutover: staged/promoted as an on-demand host plus `gnuin-media-controls-toggle`, exposed to the Rust app launcher through its promoted desktop entry, and driven by `MediaControlsService`/media hotkeys through `gnuin/media-controls.sock` when `shell.mediaControlsHost=rust`; the QML media panel is retained only as fallback;
- `gnuin-lock`, `gnuin-sidebar-left/right`, and overlay/semantic hosts — verify-tested crates where present, but not yet promoted into live composition unless called out above;
- `gnuin-settings-core` — framework-free GPUI settings renderer (291 controls, 262 routable, 0 unrenderable) replaces hand-built QML settings pages;
- `gnuin-settings-schema` split from monolithic gnosis-engine (architecture weakness E).

Several Phase 3 (release discipline) and Phase 4 (architecture docs) deliverables
have landed early as a result of this work:
- release manifest, version-signature validation, rollback flow, release notes template — all in place;
- `ARCHITECTURE_EVALUATION.md`, `TECH_DEBT_REGISTER.md`, `COMPONENT_REPOS.md`, `ARCHITECTURE_DEPLOY_CHECKLISTS.md` — documented;
- `RUNBOOK.md` — operational procedures live.

Exit criteria for S4: all Phase S4 surfaces promoted into live composition;
`feat/osd-rust-slice` and `live/ii-overhaul-template` relocked to `main`.

---

## Long-term direction

The long-term idea is an OS-like environment that makes the user want ownership rather than fear configuration. It should feel responsive, visual, local, inspectable, and personal. It should let power users customize deeply while moving toward a future where non-experts can benefit from the same coherence.

The project should stay radical in values and conservative in claims.
