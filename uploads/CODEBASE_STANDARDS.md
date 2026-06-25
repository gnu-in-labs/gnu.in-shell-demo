# Codebase Standards

This document defines the practical engineering standards for GNU.IN OS. It is intentionally modest: the project is experimental, but experiments still need boundaries.

## Current architecture shape

GNU.IN OS is now an integration workspace with pinned component repositories.
The OS repo owns contracts, state, engine services, release staging, and
cross-component verification. Component source is resolved through
`components.toml` and `components.lock.toml`.

- `engine/`: Rust daemons, local AI services, causal ledger, sentinels, and native support code;
- `contracts/`: runtime and surface contracts;
- `state/`: window manager and runtime state templates;
- `tools/`: component resolution, source, build, verification, backup, and promotion scripts;
- `docs/`: project authority documentation;
- `release/`: release pointers and metadata.

Pinned component repos currently provide:

- `gnu.in-shell`: Quickshell/QML desktop shell, UI components, and embedded
  `components/blob.in` organic-shape engine until the standalone BlobIn repo
  is materialized;
- `gnu.in-design-reference`: canonical design source, token files, visual
  references, imported specs, runtime-eligible assets, and provenance;
- `gnu.in-gnosis-app`: Gnosis app surfaces, shell-facing client singletons,
  overlays, and native tracker source;
- `gnuin-hyprconf`: Hyprland settings parser, validator, IPC layer, and daemon.

The project should preserve these separations. When a change crosses multiple surfaces, the PR must say why.
`tools/materialize-shell.sh` is the shared assembly point for the staged shell
tree used by verification and builds.

## Source of truth

The source tree is the authority. Runtime installs under `~/.local`, session config under `~/.config`, and machine-local vault notes are not source authority unless their contents are copied into the repo.

Configuration sources must be documented. When a value can exist in multiple places, one of them must be named as canonical.

Examples:

- `contracts/runtime.toml` describes intended runtime boundaries;
- `~/.config/gnuin/gnuin.toml` is live user config;
- generated legacy JSON exists for compatibility and should not become the design authority.

Design authority is `gnu.in-design-reference`: `colors_and_type.css` for
design tokens and `blob.in/tokens.json` for engine/motion token source. Runtime
QML may expose translated token APIs such as `MaterialEngine` and
`GnuinMotion`, but those APIs must preserve the design contract rather than
becoming independent token authorities.

## Build and verification

Use the real project tools:

```sh
tools/verify.sh
tools/build.sh
```

`tools/build.sh` should remain staging-only. It must not mutate live runtime paths, restart services, or write directly into user config.

Live promotion belongs to:

```sh
tools/promote-latest.sh <build-id>
```

This separation is a core project invariant.

## CI expectations

CI should verify the source tree without pretending to be a live Hyprland session.

Recommended split:

- source CI: formatting, tests, static checks, generator checks;
- runtime local checks: service state, IPC ping, Quickshell logs, Hyprland plugin state;
- release checks: artifact hashes, manifest integrity, staging isolation.

`tools/status.sh` should eventually be split or extended into:

```sh
tools/status.sh --source-strict
tools/status.sh --runtime
tools/status.sh --strict
```

CI should use `--source-strict`, not runtime checks that require the maintainer's graphical session.

## Languages and style

### Rust

- Prefer small modules with explicit error handling.
- Avoid `unwrap()` in daemon paths unless failure is truly unrecoverable.
- Use typed request/response structs for IPC boundaries.
- Add tests for policy, parsing, serialization, and path expansion.
- Keep shared-memory layouts pinned and documented.

Recommended commands as the repo matures:

```sh
cargo fmt --check
cargo clippy --all-targets --all-features -- -D warnings
cargo test
```

Because the repo has multiple Cargo projects rather than one root workspace, commands may need to run per manifest.

### Bash

- Use `set -euo pipefail` for operational scripts.
- Avoid silent fallbacks in release paths.
- Print what is being mutated.
- Keep staging and live mutation separate.
- Prefer explicit arguments over ambient assumptions.

### QML / Quickshell

- Keep shell surfaces small and composable.
- Avoid hidden cross-component state when a service singleton is more legible.
- Document layer-shell namespace, focus, and exclusivity behavior for each major surface.
- Treat animation and visual polish as real code, not decorative leftovers.

### C / C++ / native bridge code

- Pin ABI assumptions with comments and compile-time assertions where possible.
- Keep FFI boundaries narrow.
- Do not pass complex ownership across language boundaries unless the lifetime model is documented.

## Dependency management

Dependabot should track real package roots only. If a package exists but is intentionally excluded, document why.

Known candidate roots (ordered by CI priority):

- `/engine/gnosis-engine` — core daemon, D-Bus, heavy native deps;
- `/engine/gnosis-sentinel` — monitoring & telemetry;
- `/engine/gnuin-settings-core` — framework-free schema, fast verify;
- `/engine/gnuin-bar` — native taskbar, sctk layer-shell;
- `/engine/gnuin-gpui-theme` — GPUI theme tokens, git pinned to zed-industries/zed;
- `/engine/gnuin-asset-core` — local SQLite asset/component registry;
- `/engine/gnuin-compose-core` — menu composition IPC;
- `/engine/backend` — daemon helpers;
- `/engine/blob-uniforms` if active;
- `gnu-in-labs/gnuin-hyprconf`;
- `gnu-in-labs/gnu.in-shell`;
- GitHub Actions.

*Note:* Engine crates with only internal module dependencies (gnuin-settings-schema, gnuin-vector-core) may not need active Dependabot tracking if their dependencies are satisfied by the roots listed above.

## Licensing

The repository has an AGPL-3.0 root license. Some subcrates may currently declare MIT. That may be intentional, but it must be documented.

Add a license policy before a public release:

- what is AGPL-3.0;
- what remains MIT;
- whether MIT crates are standalone components;
- whether assets/fonts have separate licenses;
- how generated artifacts should report license information.

## Documentation standards

Every major subsystem should eventually have:

- purpose;
- entrypoint;
- runtime dependencies;
- IPC or file boundaries;
- configuration source;
- verification command;
- known limitations.

Minimum docs before a public alpha:

- project charter;
- architecture overview;
- agentic operating model;
- security and automation boundaries;
- versioning and release policy;
- codebase standards;
- roadmap.

## Definition of done

A change is done when:

- the source tree reflects the intended change;
- relevant checks have run or are explicitly marked unverified;
- documentation is updated if behavior, workflow, or public meaning changed;
- release or rollback implications are understood;
- the PR explains risk.

A change is not done merely because it compiles once or looks good in the shell.
