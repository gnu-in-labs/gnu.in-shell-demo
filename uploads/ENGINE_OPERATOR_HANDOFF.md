# Engine Completion — Operator Handoff

> **Date:** 2026-06-23 · **Branch:** `feat/engine-token-bridge` · **Companion:** [ENGINE_COMPLETION_PLAN.md](ENGINE_COMPLETION_PLAN.md)

This records exactly which engine phases are **sandbox-complete** (built + verified here, source-only, Level 2) and what remains for the **Operator** — the work that physically needs a running `wlr-layer-shell` session and the M6 visual-proof rail, neither of which exists in the agent sandbox. *Never claim a surface parity-complete from sandbox output* (the project's own rule).

## Every phase has a committed source/engine deliverable

All 9 phases landed their cargo-testable / compile-checked core on `feat/engine-token-bridge`; dev-mode `verify.sh` PASS. What remains per phase is uniform: the **host-binary cutover** + the **M6 runtime/visual proof** (no display in the sandbox), plus Phase 8's cross-repo membrane delete + `main` relock.

| Phase | Engine/source core (this branch) | Verification |
|---|---|---|
| **0 — token bridge (E1/M1)** | compose-core sources radii/motion/palette from `gen::*` | tests, `verify.sh` PASS (cascade pushed-pending) |
| **0.5 — LAYER/SPACING (E2/E6)** | `blobin-gen` emits `LAYER_*`/`SPACING_*_PX`; compose-core consumes | tests + drift guards |
| **1 — motion host (E3/M2)** | `MotionDriver` + `main.rs` frame-loop fade | 5 tests + `check --features wayland` |
| **2 — scene vocab + dirty-diff (E2/E5)** | 8 surface `NodeKind`s; `is_interactive`; `hit`/`input_region`; `layer::band`; `damage` | 74 tests |
| **3 — Renderer trait (E6/M5)** | `Renderer` + `RenderFrame`; tiny-skia `SoftwareRenderer` impls it | compose-core 74 + host 30 |
| **4 — chrome substrate (S0)** | toolkit-free `surface::{Edge,EdgeAnchor,anchor_for,exclusive_zone}` | 10 tests |
| **5 — bar onto compose-core (S1)** | `gnuin-bar::compose::scene_for_bar` (+ input-region, exclusive-zone) | 50 lib + 9 int. + wayland |
| **6 — wallpaper nodes (M3)** | `NodePayload::Wallpaper{generation,source}` (re-decode → diff) | 74/76 tests |
| **7 — protocol unification (M4)** | `protocol::Envelope` + `PROTOCOL_VERSION` (version-negotiate) | 37 tests + wayland |
| **8 — proof rail (M6)** | `verify-surface-proof.py` + manifest, wired into `verify.sh` | rail self-tested |

The engine itself is genuinely complete for everything provable without a display: token authority, the full surface node vocabulary, one-pass ordering/hit/input/diff/damage, the backend-swap contract, the host motion driver, the shared placement substrate, the bar-as-node adoption, the wallpaper diff identity, the versioned wire envelope, and the M6 gate.

## Operator-remaining (needs wayland + visual proof)

Run each from the Operator machine. The pure-core groundwork each rides is already on this branch.

**Cascade prerequisite (do first).** The accumulated engine token changes (Phases 0–2) are mirrored into `gnu.in-design-reference` (synced, **uncommitted**) and the local `main` ff-merge from Phase 0 is **unpushed**. Close + publish the cascade so a fresh clone/CI passes plain `verify.sh`:
```sh
cd ../gnu.in-design-reference && git add -A && git commit -m "chore(tokens): engine token mirror (E1 + LAYER/SPACING)" && git push   # outward-facing — your call
cd ../gnu.in-os && tools/bump-lock.sh gnu.in-design-reference && bash tools/verify.sh   # plain, must PASS
```

- **Phase 1 — motion host + context-menu parity (E3/M2).** **Source-done + compile-checked:** `MotionDriver` (host lib, 5 tests) + the `main.rs` frame-loop wiring — `show`/`dismiss` retarget it, the `wl_surface` frame callback ticks it and fades the surface by `visible_progress`, re-requesting frames while animating (`cargo check/clippy --features wayland` clean). **Remaining (Operator):** (a) the **visual close-fade** needs deferred surface teardown (the surface tears down at once today); (b) the `shell.contextmenu.host = qml|gpui` **selector key** is a cross-repo settings-authority addition — define it (reusing `enums::HOST`) in `gnuin-hyprconf/crates/gnuin_shell_config`, then add the `Control::select` + the `enum_select_values_match_the_authority_const` table entry in `gnuin-settings-schema`; (c) **proof:** render at 0/50/100 % for one open + one close; retire the QML context-menu host on parity.
- **Phase 4 — extract `gnuin-shell-chrome` host substrate (S0).** **Source-done:** the toolkit-free placement substrate (`surface::{Edge, EdgeAnchor, anchor_for, exclusive_zone}`, 3 tests). The full sctk event-loop wrapper stays deferred (the crate's own note — delegate-macros bind to concrete host types) until a third consumer justifies it. **Remaining (Operator):** that wrapper, when `gnuin-dock`/`gnuin-launcher` land.
- **Phase 5 — bar then dock onto compose-core (S1/S2).** **Source-done (bar):** `gnuin-bar::compose::{scene_for_bar, bar_input_region, bar_exclusive_zone}` — the bar surface is a compose-core `Bar` node (membrane = a blob below it, not `membraneOwnsBar`), 3 tests, `cargo check --features wayland`. **Remaining (Operator):** the bar binary swaps its hand-rolled geometry/input for the scene + renders the node; same for `gnuin-dock`; mount bar+dock+menu in one `reduce()`. **Proof:** screenshots + layer records.
- **Phase 6 — wallpaper retained nodes (M3).** **Engine-side done:** `NodeKind::Wallpaper` + `NodePayload::Wallpaper(WallpaperData{generation,source})` so a re-decode reports `Updated` and `damage` covers it (tested). **Remaining (Operator):** wire `gnuin-background` to emit the Wallpaper node + bump `generation` per decode; crossfade via `MotionSpec`. **Proof:** crossfade with no fallback-flash.
- **Phase 7 — remaining surfaces + protocol unification (S5/M4).** **Source-done:** `protocol::{Envelope, PROTOCOL_VERSION}` — the single versioned wire frame; an unknown version is detected, not mis-parsed, so surfaces version-negotiate onto the unified socket (round-trip tested). **Remaining (Operator):** per-surface cutover onto the envelope + onto `reduce` for OSD/notification/sidebar/launcher/modal/screen-corner (all `NodeKind`s exist).
- **Phase 8 — proof rail, membrane delete, relock (M6/S4).** **Source-done:** the M6 rail — `tools/verify-surface-proof.py` + `surface-proof-manifest.json` (10 surfaces, all `pending`), wired into `verify.sh`; it fails any surface marked `complete` without its 0/50/100 % + close + layer-record evidence. **Remaining (Operator):** populate evidence + flip each surface to `complete` as it is proven; delete `MembraneHost.qml` (cross-repo `gnu.in-shell`); relock `feat/engine-token-bridge` → `main` and the Phase-S4 branches (touches `main` = explicit go).

## Why the split is hard (not a choice)

Every host (`gnuin-compose-host`, `gnuin-bar`, `gnuin-background`) needs `sctk`/layer-shell and a compositor — it cannot build or run in the agent sandbox, and the M6 contract requires screenshots before any surface is called parity-complete. So core-side, cargo-testable slices led (done); all runtime/visual proof is Operator-gated by design.
