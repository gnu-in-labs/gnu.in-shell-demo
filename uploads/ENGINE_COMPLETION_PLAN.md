# Engine Completion Plan — gnuin-compose-core adoption

> **Date:** 2026-06-23 · **Source:** multi-agent engine-completeness map (6 subsystem readers + synthesis)
> **Companion:** [COMPOSITION_ENGINE_SPEC.md](COMPOSITION_ENGINE_SPEC.md) · [VISUAL_RUNTIME_ENGINE_WORKPLAN.md](VISUAL_RUNTIME_ENGINE_WORKPLAN.md) · [SHELL_NATIVE_RUST_ARCHITECTURE_PLAN.md](SHELL_NATIVE_RUST_ARCHITECTURE_PLAN.md) · [GOAL_ALIGNMENT_AND_NEXT_SLICE.md](GOAL_ALIGNMENT_AND_NEXT_SLICE.md)

## Reframe

The **engine crate itself (`gnuin-compose-core`) is ~95% done** — 61 (now 63) tests, full reducer/diff/motion/layout/hit-test, no stubs. "Completing the engine" is **not building it**; it is **(1)** closing the token bridge and **(2)** the long **adoption** tail: 1 of ~25 surfaces consumes the engine today. Most of the tail requires **wayland hosts the Operator must compile/run** — un-buildable in the agent sandbox. The plan therefore front-loads the core-side, source-only, cargo-testable work; all runtime/visual parity proof is Operator-gated.

## Definition of complete (the project's own, not invented)

No big-bang milestone — a surface-by-surface adoption contract (S0–S5 / M0–M6). The engine is complete when **all** chrome surfaces (menu, bar, dock, launcher, OSD, notifications, wallpaper, sidebars, modals) consume the shared engine's **tokens, scene, motion, hit-regions, and diff** under **one ordered composition pass**, with proof artifacts gating each promotion. Exit criteria: E1 (token change → all hosts via generation), E2 (new surface = state→scene→render, not a custom lifecycle), E3 (no per-host easing constants for the same role), E6/M5 (backend swap doesn't change ComposeInput/Scene/ids/tokens/regions/motion), M6 (no parity-complete without screenshot+layer evidence), S0–S5 (no QML WlrLayershell surfaces remain; chrome 100% native Rust).

## Scorecard

| Subsystem | % | Note |
|---|---|---|
| `gnuin-compose-core` crate | 95 | done; token-bridge gap **now closed** (Phase 0) |
| Surface adoption | 10 | 1/25 — the long pole |
| Token chain / canonical consumption | 55 → **higher** | compose-core now consumes generated tokens (Phase 0); LAYER/SPACING channels still absent |
| Wallpaper/effects as scene nodes | 35 | no `NodeKind::Wallpaper` yet |
| IPC / single-owner composition | 40 | proven for context-menu only; bar/dock still QML-flag negotiated |
| Phase plan progress (S0–S5/M0–M6) | 42 | M0 closed, core landed; S0 not extracted |

## Phases (dependency-ordered)

0. **Canonical token bridge (E1/M1)** — pure-core, sandbox-testable. *(DONE — see below.)*
1. **Motion host adoption + context-menu vertical to parity (E3/M2)** — wire `advance/interrupt_motion` into `gnuin-compose-host`; selector key `shell.contextmenu.host=qml|gpui`; retire the QML context-menu host on parity. *dep: 0.*
2. **Scene expansion + dirty-region diff (E2/E5/M4)** — `NodeKind` + payloads for background/wallpaper/launcher/OSD/notification/sidebar/modal/screen-corner; damage hints in `SceneDiff`; invariant tests. *dep: 0, 1.*
3. **Renderer trait + SDF blob isolation (E6/M5)** — `Renderer` trait over `(Scene, SceneDiff, MotionSample)`; SDF blob as a `NodeRenderer`; re-export the tiny-skia renderer as a shared lib. *dep: 2.*
4. **Extract `gnuin-shell-chrome` shared host crate (S0)** — factor the sctk/calloop/layer-shell/blit/font boilerplate into one substrate. *dep: 3.*
5. **Bar then dock onto compose-core (S2/S1)** — emit `BarRequest`/`DockRequest` nodes; one `reduce()` pass; delete `membraneOwnsBar`. *dep: 4, 1, 0.*
6. **Wallpaper retained nodes (M3)** — `NodeKind::Wallpaper`, decode-generation in the diff key, crossfade motion. *dep: 2.*
7. **Remaining surfaces + protocol unification (S5/M4)** — migrate the rest; versioned `HostMessage` envelope replacing the 15+ socket silos. *dep: 5, 6.*
8. **Proof rail, membrane delete, relock (M6/S4)** — per-surface screenshot+layer evidence; delete the membrane; relock `feat/*` → `main`. *dep: 7.*

> **Sandbox boundary:** Phases 0 and the pure-core parts of 2/3 are agent-buildable+verifiable here. Phases 1, 4, 5, 6, 7, 8 involve wayland hosts → **Operator-side build + visual proof**. Never claim a surface parity-complete from the sandbox.

## Phase 0 — DONE (branch `feat/engine-token-bridge`, commit `2f11a30`)

`gnuin-compose-core/src/tokens.rs` now sources radii/motion from `gen::GEOM_*`/`DURATION_BASE_MS` and the palette from `gen::COLORS` (compile-time const-fn, `pub const` API preserved). Added `menu_radius`/`blob_radius` to `tokens.json`; regenerated all targets. Drift guards: unit tests + a `tools/verify.sh` check that fails on any re-hardcoded radius/motion **or palette** literal. 63 tests, clippy `-D warnings`, fmt, R1 check-tokens — all green. Adversarial-reviewed (0 critical; the HIGH palette-guard gap fixed).

**Release cascade — CLOSED (commits `2f11a30` + `1af2345` + `f0f0977`):** the design-token change was mirrored into `gnu.in-design-reference` (`tools/sync-design-tokens.sh`), the mirror commit fast-forwarded onto its `main` (`0b484d6 → 9fb38f6`, Operator-approved), and the new revision pinned across `components.lock.toml`, `release/GLOBAL-VERSION.json` (rev only; version `0.14.2` unchanged), and the regenerated overhaul branch document. **Plain `tools/verify.sh` PASSES** (no `--allow-dirty-components`) — `feat/engine-token-bridge` is mergeable. The only remaining release step is the eventual S4 relock of `feat/engine-token-bridge` → `main` at promotion.

## Phase 0.5 — DONE (commit `0b6433d`)

Backfilled the canonical **LAYER** (z-index per surface role) and **SPACING** (4px scale) token channels — the E2/E6 dependency Phase 2 rides. `blobin-gen` extended to emit `shell.layer` → `LAYER_*` and `shell.spacing_px` → `SPACING_*_PX` (Rust theme + C++ header + QML); `gnuin-compose-core` consumes them (`layer_z(NodeKind)` + a `spacing` module, sourced from `gen::*`, drift-guarded). The z-stack already names the future surface roles (background…screen_corner) awaiting their `NodeKind`. **Scaffolding, not yet load-bearing** — `layer_z`/`spacing` have no non-test callers until Phase 2 wires them into the reducer/layout, so E2/E6 are *prepared*, not yet *met*. 65 + 7 tests, clippy `-D warnings`, fmt, adversarial-reviewed (0 critical; 2 MEDIUM guard-rigor gaps fixed). Cascade closure (mirror commit + ff-merge + bump-lock) batches with the Phase 0 Operator push.

## Risks (carried)

- Un-compilable wayland binaries in sandbox → drives the phase order; runtime proof is Operator-gated.
- `NodeKind` expansion (Phase 2) ripples every match arm → `non_exhaustive` + invariant tests before broadening.
- Protocol unification (Phase 7) is a breaking wire change → versioned envelope + per-surface cutover.
- QML/Rust coexistence → the `shell.*.host=qml|gpui` selector keeps every cutover reversible per-screen.
- Multi-repo cascade: a token change must sync the design-reference mirror (`tools/sync-design-tokens.sh`) + bump-lock + relock at promotion (Operator step).
