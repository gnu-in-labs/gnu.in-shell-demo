# Goal Alignment & Next Slice — Runtime / Asset Manager / Taskbar

> **Date:** 2026-06-22 · **Phase:** S4 (shell visual + behavioral overhaul) · **Status:** assessment, source-only (Level 1)
> **Companion docs:** [ARCHITECTURE_EVALUATION.md](ARCHITECTURE_EVALUATION.md) · [COMPOSITION_ENGINE_SPEC.md](COMPOSITION_ENGINE_SPEC.md) · [VISUAL_RUNTIME_ENGINE_WORKPLAN.md](VISUAL_RUNTIME_ENGINE_WORKPLAN.md) · [TASKBAR_AUDIT_AND_GPUI_SPEC.md](TASKBAR_AUDIT_AND_GPUI_SPEC.md)

## 0. The goal, restated

> Build GNU.IN as a **modern, native, agentic, fully customizable OS/shell** — not a collection of ported surfaces. A shared Rust engine owns tokens, scenes, motion, local assets, importable sub-components, visual modules, wallpapers, docks, effects, and AI integration, with clean UX defaults.
>
> **Concrete success:** a functional, AI-assisted, extensible local asset/sub-component manager that can compose expressive native affordances (e.g. a "deck of cards" dock) **without rewriting the runtime** — or, at minimum, deeply edit the **taskbar of each screen** in an extensible way.

## 1. Headline finding

**The shared engine the goal describes already exists in spec and largely in code. The deficit is _adoption_, not invention.**

- `engine/gnuin-compose-core` already implements tokenized scene nodes, immutable scene + diff, motion (easing/springs), layout, hit-testing, and Wayland input regions — exactly the "one node model describes menu, bar, dock, blob" principle from [COMPOSITION_ENGINE_SPEC.md](COMPOSITION_ENGINE_SPEC.md) §2.
- **But it is consumed by exactly one host** (`gnuin-compose-host`). The other ~25 surface crates (`gnuin-dock`, `gnuin-osd`, `gnuin-launcher`, `gnuin-bar`, `gnuin-sidebar-*`, …) each reimplement their own `model.rs` / `protocol.rs` / `render.rs` / `theme.rs`. They share only `gnuin-shell-chrome` (≈105 lines: pixel blit + font discovery).
- Architectural-coherence read: **~3.5/10** — a strong shared *renderer primitive*, but tokens/scene/motion/IPC are still per-surface silos. This is precisely the "collection of ported surfaces" the goal warns against.

This reframes the work: the highest-leverage moves **migrate surfaces onto the engine** and **prove the data-driven composition path end-to-end**, rather than building a new engine.

## 2. Goal → reality gap map

| Capability the goal names | State today | Evidence |
|---|---|---|
| Shared engine: tokens/scene/motion | **Landed, underused** | `gnuin-compose-core` (scene/diff/motion/layout/hit/input) consumed by 1 host only |
| Tokens as single source → all hosts | **Partial** | `blob.in/tokens.json` is authority (R1–R9 gated, [readiness.md]); engine still bridges via constants, surfaces re-lookup per-crate `theme.rs` |
| Local asset / sub-component manager | **~85% landed** | `gnuin-asset-core`: 28 tests green, SQLite registry, `ComponentManifest` model, `gnuin-assetctl` CLI |
| …AI-assisted | **Stub** | only `HeuristicAssetEnricher` (string-match); clean `AssetEnricher` trait exists to extend — no LLM/vision hook |
| …extensible (third-party kinds) | **No** | `AssetKind` / `ComponentKind` / `ComponentCapability` are **closed enums**; recipes hardcoded (2) |
| Importable sub-components | **Modeled, not mounted** | `ComponentManifest` (capabilities, `required_assets`, `config_fields` scoped Global/PerMonitor) is rich; host-side **mounting is pending** |
| Declarative surface composition | **Topology only** | `contracts/surfaces.toml` → codegen `SurfaceRegistry.qml` (good, drift-checked); but motion/tokens/content are hand-wired per surface (~4.5/10) |
| Wallpapers as engine nodes | **Aspiration** | still QML `WallpaperService` + `gnuin-background`; not retained scene nodes ([VISUAL_RUNTIME_ENGINE_WORKPLAN.md] §39–40) |
| Dock "deck of cards" affordance | **Planned, not mounted** | `gnuin-dock/src/affordance.rs` parses `DockAffordanceConfig {deck_style: Row\|Stack\|Fan, …}`; asset-core can *plan* it; no live mount/daemon |
| **Per-screen taskbar, deeply editable** | **Wired except extensibility** | see §3 — this is the closest-to-done, highest-signal slice |

## 3. The taskbar floor — already wired, one lock left

The per-screen taskbar pipeline is **built and unit-tested today** on the Rust path:

```
asset-core  plan_taskbar_edit (PerMonitor config_fields)
   → SettingsHandoff  shell.taskbar.modules_json
      → hyprconfd persists + broadcasts
         → gnuin-bar reads it PER MONITOR
            → resolves visible / edge / density / widget layout (left|center|right)
```

Evidence: `engine/gnuin-bar/src/settings.rs` — `extract_taskbar_modules_json_from`, `taskbar_writes_for_monitor`, `taskbar_surface_config_for_monitor` (8 passing tests covering per-monitor edge/placement/density/widget-layout).

**The single remaining lock — the extensibility hole:**

`gnuin-bar/src/settings.rs:307` — `parse_widget_id()` is a closed `match` over the closed enum `TaskbarWidgetId { Workspaces, ActiveWindow, Network, Bluetooth, Audio, Battery, Clock }`. An unknown id returns `None` and is **silently dropped** by the `filter_map` in `parse_widget_list()` (settings.rs:300). Same closed-set pattern mirrors the QML path's hardcoded `componentFor()` switch (`gnu.in-shell/components/Taskbar.qml:94`).

> **Consequence:** users can already reorder / place / hide / hold per-screen the 7 built-in widgets, but **cannot introduce a new module kind** without editing the enum + renderer. Lifting exactly this lock — replacing the closed enum with a **data-driven module registry** — delivers the goal's floor ("éditer en profondeur AU MOINS la barre de chaque écran de manière extensible") and is the **end-to-end proof of the whole thesis**: asset-core already emits `TaskbarModule` manifests; only "the surface renders an arbitrary planned module" is missing.

Secondary defect to fix in passing: silent-drop of unknown widget ids is a robustness gap (a typo or third-party id vanishes with no diagnostic).

## 4. Layer note — two taskbars exist; pick deliberately

- **QML** `TopbarHost.qml` → `Taskbar.qml` is the **contract-canonical** owner today (`surfaces.toml [surfaces.taskbar] owner_qml`, `source_family = "jj"`). Global config; hardcoded `componentFor()`.
- **Rust** `gnuin-bar` already has the **per-monitor handoff wiring + tests**, its own built-in modules, but is **not yet the contract owner**.
- Roadmap S2 ("bar self-ownership") / S4–S5 (retire QML chrome) point at the Rust path as the future. **Building a large extensibility registry in the QML `componentFor()` risks throwaway work.** Recommendation: extend the **Rust** path.

## 5. Recommended sequence (floor → ceiling)

1. **[Floor, recommended next]** Replace `gnuin-bar`'s closed `TaskbarWidgetId` with a **module registry**: a widget is a string id resolved against a registry of module descriptors (built-ins self-register; new modules declared as data). Renderer dispatches via registry; unknown ids surface a diagnostic instead of vanishing. Pure Rust, sandbox-unit-testable, no IPC-authority change. → *extensible per-screen taskbar.*
2. **[Bridge]** Teach `gnuin-asset-core` to emit registry-shaped `TaskbarModule` manifests (open `kind` string instead of closed enum) so a newly registered module round-trips plan → handoff → render. → *asset-core extensibility, scoped to the proven path.*
3. **[Ceiling]** Apply the same registry pattern to `gnuin-dock` affordances and mount the "deck of cards" dock from an asset-core manifest. → *compose an expressive affordance without rewriting the runtime.*
4. **[Adjacent]** Real `AssetEnricher` (local LLM/vision) behind the existing trait — non-mutating, proposal-first. → *AI-assisted.*

## 6. Boundaries / risk

- All of §5 steps 1–2 are **source-only, non-mutating, Level 2** (feature branch + `tools/verify.sh`). No live promotion, no D-Bus/IPC authority change, no `~/.config` writes.
- The **proposal-first / human-applies** contract of asset-core ([gnuin-asset-core/README.md]) must be preserved end-to-end.
- **Branch-drift note:** `gnu.in-os` is on `feat/osd-rust-slice` (not listed in CLAUDE.md's Phase-S4 pin note, which only pins `gnu.in-shell` and `gnu.in-gnosis-app`). Worth confirming this is intentional before any relock-to-`main`.

## 7. Decision needed from a human

1. **Which slice first** — taskbar floor (§5.1, recommended), deck-dock ceiling (§5.3), or asset-core AI/extensibility (§5.4)?
2. **Which layer** for the taskbar — extend the **Rust** `gnuin-bar` path (recommended; future-proof) or the **QML** `Taskbar.qml` path (contract-canonical today, roadmap-doomed)?
