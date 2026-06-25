# Taskbar Audit & GPUI Re-engineering Spec

> Status: draft · 2026-06-16 · author: Gnosis.Agent
> Scope: gnu.in-shell topbar/taskbar, context-menu system, settings-panel wiring.
> Posture: Level 0/1 — audit + spec only. No runtime code changed by this document.

This document has two halves. **Part A** is a code-mapped audit of the current
taskbar, its motion/tokens, its context menus, and the settings wiring (with
`path:line` evidence and severity). **Part B** is the re-engineering spec with a
per-component GPUI / Rust / C++ vs QML recommendation, a reuse-vs-replace ledger,
a phased migration, and the one technical risk that gates the whole plan.

---

## Part A — Audit

### A0. The unifying root cause

Two distinct families of defect share one anti-pattern:

1. **Backing and interaction surfaces are layered at identical geometry to the
   real content, with masks/inputs computed independently of the painter.** This
   produces the "second opaque bar that masks badly" (#1) and the "double
   button/surface at both ends" (#4).
2. **Variant explosion routed by string equality with late-resolved geometry.**
   This produces the fragile, "brisé" context menus (#5).

Neither is a tuning bug; both are consequences of the current two-`PanelWindow`
bar design and the 19-`Loader` menu router. They are cheap to mitigate and
expensive to fully fix in place — which is the case for the GPUI pass.

### A1. Double opaque bar surface (HIGH)

The bar edge is painted by **two independent `PanelWindow`s on the same
`WlrLayer.Overlay`**, both filling `membraneSurface`:

- `components/shell.qml:285` mounts `TopbarHost`, `:290` mounts `MembraneHost`
  per screen — both Overlay, both full-width, same edge.
- `components/TopbarHost.qml:6,23-24` — TopbarHost owns the real `Taskbar`; its
  background is drawn in `Taskbar.qml:448-456` (`barBackground`,
  `GnuChrome.topbarBackground(...)` = `alpha(membraneSurface, 0.48–0.98)`).
- `components/MembraneHost.qml:181-191` — `staticTaskbarSurface`, a **second**
  rectangle at `taskbarNode` geometry, `GnuChrome.membraneSurface` (full
  opacity), `visible: taskbarMembraneChromeActive && !sdfMembraneActive`. The SDF
  path duplicates it again at `:209-218` (`BlobRect` taskbar background).

Root cause: TopbarHost was meant to be the single authoritative bar surface
(`MembraneHost.qml:482-483`), but MembraneHost still emits its own taskbar
backing whenever `taskbarMembraneChromeActive` (`:31` =
`BarService.visible && nonContextMorphingSurfaceOpen`). So opening any membrane
surface (launcher/dock/sidebar) renders **both** backings at the identical
`taskbarNode` rect (`:161-169`) with different alpha curves and different radii
(`taskbarNode.radius` vs `topbarBackgroundRadius`) → the doubled, mis-masking
bar. Input/paint desync: the Wayland input mask only unions the taskbar rect when
`taskbarMembraneChromeActive` (`:67-68`), so clickable and painted regions drift.

### A2. Dubious geometry / alignment (MED)

- `Taskbar.qml:18` height = `ShellSettingsService.topbarHeight`, which is
  hardcoded `waffle?44:40` at `ShellSettingsService.qml:32` — not a token, not a
  settable key. The reserved exclusion strip is computed separately via
  `BarService.topReservedZone` (`shell.qml:276`), so reserved height and painted
  height can drift.
- `Taskbar.qml:123` `BarGroup.implicitHeight = min(topbarHeight, iiBaseBarHeight)`
  then fixed `topMargin/bottomMargin: 4` (`:127-128`) → groups off-centre at 44px.
- Side sections compute width from a center section resolved late:
  `leftSideInteractionZone.width = max(0, middleSection.x)` (`:473`),
  `rightSideInteractionZone.width` from `middleSection.x+width` (`:589`), while
  `middleSection` is `horizontalCenter`-anchored (`:533`) → transient width 0 /
  layout jump on first paint and on reflow.
- Mixed sizing models: `RoundAction` fixed `34×28` (`:155-156`) vs dynamic
  `WidgetBase`/`BarGroup`.

### A3. Visually poor single-letter widgets (HIGH, cosmetic)

Every topbar widget is an ASCII abbreviation via `Text` + `MaterialEngine.fontBold`,
no icons: WiFi `"WI"` (`:841`), BT `"BT"/"BT*"/"BT-"` (`:872`), Audio
`"VOL"/"AUD!"` (`:935`), Weather `"WX"` (`:897`), Resources `"RES"` (`:726`),
Power `"PWR"` (`:975`), Notifications `"N"` (`:813`), Media `"PLAY"/"MPRIS"`
(`:754`), sidebar `"AI"` (`:651`), hints `"SUN"/"VOL"` (`:501,617`). AppChip uses
`label.slice(0,2)` glyph fallback (`:228`), real icon only if `app.icon` resolves
(`:254-262`). `components/uikit/GnuIcon.qml` exists but no topbar widget uses it;
`shell.fonts.icon_nerd` is a backend key with no binding.

### A4. Double button / surface at both ends (MED)

Each extremity stacks a full-height interaction zone *under* a widget row at the
same coordinates:

- Left: `leftSideInteractionZone` (MouseArea+WheelHandler+`"SUN"` hint,
  `:468-505`, `z:0`) under `leftSectionRow` (`:507-509`, `z:1`) holding the
  `sidebar-left "AI"` `RoundAction`.
- Right: symmetric `rightSideInteractionZone` (`:584-621`, `z:0`) under
  `rightSectionRow` (`:623-627`, `z:1`).

The `RoundAction` MouseArea (`:173`) and the side zone (`:488`) both cover the
corner → ambiguous hit-testing; `BarService.handleLeftClick/RightClick` fire from
the backing zone even when a real button is present.

### A5. Context menus broken / fragile (HIGH)

- Membrane backing race: `ContextMenuPanel.qml:64-73` reports panel geometry to
  `ContextMenuService.reportPanelGeometry`; the blob that draws the background
  (`MembraneHost.qml:221-249`) is visible only when `usesMembraneChrome &&
  contextMenuPanelGeometryReady` (`:227,:16`). If geometry signals fire before
  `open` flips true, `reportPanelGeometry` early-returns
  `rejectPanelGeometry("inactive-or-style-mismatch")`
  (`ContextMenuService.qml:134-135`) → panel exists, backing never appears
  (transparent/black menu).
- Stale-rect flash: documented "panneau noir du précédent menu"
  (`ContextMenuService.qml:42-44`); mitigations `onStyleChanged: clearPanelGeometry()`
  (`:50`) + the `_switchTimer interval:0` (`:79-92`) flip `open=false` then
  reapply next tick — during which `panelGeometryReady` can be stale and flash the
  old bounds.
- Motion removed: `ContextMenuPanel.qml:100,102` hardcode `dismissFrame`
  opacity/scale to `1.0` ("removed for Membrane extrusion"); when
  `contextMenuBackingAuthority` returns `"local"` (`GnuChrome.qml:2071-2072`, only
  `membrane_crisp` gets `membrane+local-fallback`) the panel has no entrance/exit
  motion and can unmount mid-reopen via `closeTimer` (`:82-92`).
- Router fragility: 19 menu styles via parallel `Loader`s
  (`ContextMenuHost.qml:39-157`), all `anchors.fill`, keyed only on
  `ContextMenuService.style` string equality vs the `show*` setters
  (`ContextMenuService.qml:349-562`) — no enum, trivially desynced.
- Click-away: `ContextMenuHost.qml:26-36` masks the bar strip by margins; on
  wrong edge / multi-monitor mismatch it covers/exposes the wrong region.

### A6. Motion / token consumption (MED)

- `GnuinMotion.qml:42-52` defines `durTokens` as **hardcoded ms literals**; `dur()`
  (`:67-70`) prefers `GnuTheme.duration(...)` (blob.in tokens) but silently falls
  back to the literal when a token is missing → motion not fully token-authoritative.
- Hardcoded values bypassing tokens in the bar: `font.pixelSize 11/12` throughout
  `Taskbar.qml`, `RoundAction 34×28 r14` (`:155-157`), `SideScrollHint 24 r12`
  (`:190-191`), `BarGroup padding/spacing 5` (`:116,138`), separator `1×20`
  (`:992-993`), group margins `4` (`:127-128`). None reference `topbarMetrics`/GnuTheme.

### A7. Settings wiring parity — FULLSTACK (HIGH)

Path: settings UI → `ShellSettingsService.qml` → `hyprconfd` (Rust) → engine schema.

| Layer | Count | Notes |
|---|---|---|
| Engine schema `gnosis-engine/src/settings_schema.rs` `build_schema()` (`:428-452`) | **237** bound `shell.*` keys / 11 groups | control descriptors (toggle/select/slider `:231-279`) |
| hyprconf authority `gnuin_shell_config/src/lib.rs` | **242** canonical keys | persistence + validation authority (superset) |
| QML read model `ShellSettingsService.qml` | 264 props, **148** adapter-backed | reads `~/.config/gnuin/shell-settings.json` (`:12`) **receive-only** |

- **Write path is daemon-only**: `setShellProperty()` over D-Bus, socat fallback to
  `hyprconf.sock` (`:759-771`); `_write()` is a **no-op** (`:774-778`). Local
  validations (`_validateSettings` `:780-829`, e.g. dockArchived `:787-790`) never
  persist — they depend on the daemon echoing back.
- **UI is hand-built, not schema-generated**: 8 `components/settings/pages/*Page.qml`
  mirror the Rust schema by hand → guaranteed drift.
- **Dead zones** (backend keys with no QML reader): `shell.bar.util_buttons.*` (~7),
  `shell.region_selector.*` (~13), `shell.overview.*`, `shell.background.clock.cookie.*`
  (~12), `shell.work_safety.*`. Conversely `topbarHeight` is QML-only with no editable
  backend key.
- **Parity estimate**: bar/topbar subsystem ≈ **85%**; whole-shell schema↔QML-reader
  ≈ **60–65%** (≈148 readers vs 237 keys).

### A8. GPUI-readiness (informational)

- blob.in already emits `gen/{gnu_theme.gpui.rs, gnu_theme.rs, gnu_theme.h,
  GnuTheme.qml}` — a GPUI bar consumes `gnu_theme.gpui.rs` directly (same source
  the QML theme mirrors).
- Rust bridges exist: `blobin-cxxqt/` (cxx-qt), `blobin-qt/` (QSG items),
  `blobin-core/` (SDF engine: `engine.rs`, `blob.rs`, `bloom.rs`, `diff.rs`). The
  SDF membrane (`BlobGroup`/`BlobRect`, `import Gnuin.BlobIn.Blobs`) is **already**
  a Rust-bridged primitive, reusable from GPUI via blobin-core.
- The settings backend (`hyprconfd` + `settings_schema.rs`) is already
  language-neutral over D-Bus/socat — reusable as-is by a Rust/GPUI client.

---

## Part B — Re-engineering spec

### B0. The gating risk — verify GPUI layer-shell support FIRST

GPUI (Zed's UI framework) is built for **top-level desktop windows**. The bar,
dock, OSD, notifications and context menus are **`wlr-layer-shell`** surfaces
(`WlrLayer.Overlay`, exclusive zones, edge anchors). GPUI does **not** ship
first-class `wlr-layer-shell` support. This is the single fact that decides the
architecture, so it must be settled by a **Phase-0 spike** before any rewrite:

- **Spike**: stand up a minimal GPUI surface as a `zwlr_layer_surface_v1` (anchor,
  exclusive zone, keyboard-interactivity). Try (a) GPUI's Wayland backend +
  a layer-shell shim, (b) driving the layer-shell role via
  `smithay-client-toolkit` and handing GPUI a raw surface, (c) `gtk4-layer-shell`
  equivalent. Outcome decides B1.

Until the spike resolves, treat the following as **two branches**:

- **Branch G (GPUI owns the surface)** — if the spike proves layer-shell works.
- **Branch H (hybrid)** — a thin Rust `wlr-layer-shell` host (smithay-client-toolkit)
  renders blobin-core/GPUI content; or Quickshell stays the layer-shell *host* and
  only the *logic, tokens, widgets and menu model* move to Rust. This is the
  low-risk fallback and is recommended if the spike is inconclusive.

### B1. Per-component recommendation

| Component | Recommendation | Rationale |
|---|---|---|
| **Bar surface mounting** (TopbarHost+MembraneHost double `PanelWindow`) | **Rust, single authoritative layer-shell surface** (Branch G/H) | Fixes #1/#4 at the root — one painter, one input mask. Cannot be cleanly fixed in the two-PanelWindow QML model. |
| **SDF membrane backing** | **Reuse `blobin-core`** (Rust) | Already Rust; expose to GPUI instead of re-implementing. |
| **Widgets** (clock, tray, wifi, bt, audio, power, notif, media, workspaces, mascot-mini) | **GPUI components, icon-first**, token-driven (Material Symbols Rounded / nerd-font per brand) | Replaces the `Text`-glyph placeholders (#3); one capsule sizing model kills #2's mixed sizing. |
| **Context-menu engine** | **GPUI/Rust, single data-driven renderer** (menu spec → one renderer) | Replaces the 19-Loader string router + geometry race (#5). Backing via blobin-core SDF; geometry computed in Rust before paint, so no "ready" race, no stale-rect flash. |
| **Motion / tokens** | **Consume `gnu_theme.gpui.rs` directly**; port `GnuinMotion`/`GnuChrome` helpers to Rust functions | Removes the hardcoded-literal fallbacks (#6); tokens become authoritative. |
| **Settings backend** (`hyprconfd` + `settings_schema.rs`) | **Reuse as-is and extend with module-plan keys** | Language-neutral D-Bus/socat. `shell.taskbar.modules_json` is now the durable handoff key for imported per-monitor taskbar module plans, and `gnuin-bar` consumes live surface config writes per output (`visible`, `edge`, reserved thickness, density) plus widget slot writes (`left_widgets`, `center_widgets`, `right_widgets`) with side-edge vertical paint/hit routing. |
| **Settings read model** (`ShellSettingsService.qml`) | **Replace with a Rust D-Bus client** of the same surface | Removes the no-op `_write()` ambiguity (#7); single source of truth. |
| **Settings UI** | **Generate the GPUI settings app FROM `settings_schema.rs`** | Schema-driven UI makes backend↔UI parity *structural*, eliminating the hand-built-page drift and the dead zones (#7). Biggest single parity win. |

### B2. Reuse vs Replace ledger

**Reuse:** `blobin-core` (SDF engine), `gnu_theme.gpui.rs` (tokens), `hyprconfd` +
`gnuin_shell_config` + `settings_schema.rs` (settings authority over D-Bus/socat,
including `shell.taskbar.modules_json`), the Gnosis engine D-Bus surface.

**Replace:** TopbarHost / Taskbar / MembraneHost QML `PanelWindow` mounting;
ContextMenuHost + the 19 menu `Loader`s + `ContextMenuService` routing; all
`Text`-glyph widgets; `ShellSettingsService.qml` read model; `GnuinMotion` /
`GnuChrome` QML helpers; the 8 hand-built settings pages.

### B3. Phased migration

- **Phase 0 — layer-shell spike** (gates everything; see B0). Decide Branch G vs H.
- **Phase 1 — foundations (Rust, no UI swap yet)**: a Rust settings client over the
  existing D-Bus surface; a Rust token module over `gnu_theme.gpui.rs`; a typed
  **menu-spec data model** (replaces the 19 string styles with one enum + data);
  `gnuin-asset-core` taskbar module manifests planned through
  `TaskbarEditPlan::to_settings_handoff`, persisted by
  `shell.taskbar.modules_json`, and consumed by `gnuin-bar` for per-output
  visibility, placement, density, and widget slot composition.
- **Phase 2 — bar shell**: one authoritative layer-shell bar surface; port widgets
  to icon-first GPUI components; collapse the double backing (#1) and the
  end-zone double surfaces (#4) by construction.
- **Phase 3 — context-menu engine**: single data-driven renderer with
  Rust-computed geometry + blobin-core backing; delete the Loader router.
- **Phase 4 — schema-driven settings app**: generate the GPUI settings UI from
  `settings_schema.rs`; retire the QML pages and `ShellSettingsService`.
- **Phase 5 — retire QML chrome**: remove TopbarHost/MembraneHost/ContextMenuHost;
  flip the default; keep QML only where the spike said it must stay.

### B4. Tactical stopgaps (optional, QML, pre-rewrite)

If you want relief before the port lands (each is a contained QML fix, not part of
the spec deliverable):

1. **#1** — ⚠️ **corrected after attempting it**: gating off the membrane's bar
   backing is WRONG. `tests/test_gnosis_membrane_contract.sh` **codifies** that the
   membrane paints the bar during morph
   (`visible: root.taskbarMembraneChromeActive && !root.sdfMembraneActive`), i.e.
   the membrane is the *intended* bar painter while a surface morphs out of the bar
   (SDF continuity). The double-surface is therefore **TopbarHost not yielding**.
   Correct stopgap: hide `Taskbar.qml:448 barBackground` (and `barEdgeLine`) while
   the membrane owns the bar — i.e. when `BarService.visible && <a morphing surface
   is open on this screen>` (derive via `SurfaceRegistry.isOpenOnScreen` for the set
   in `MembraneHost.qml:17-29`, or expose `taskbarMembraneChromeActive` through a
   shared service so TopbarHost and MembraneHost read one source of truth). This
   needs **live visual confirmation of the morph** before commit — do it with the
   shell running, not blind.
2. **#4**: make the side interaction zones siblings *beside* the widget rows (not
   underneath), or disable their MouseArea where a real button overlaps.
3. **#5**: compute and report panel geometry *before* `open` flips, or hold the
   blob at last-good bounds until new geometry is `ready`, to kill the black-flash.

These reduce the worst pain (#1, #5) but do **not** resolve the structural causes —
those are deferred to the GPUI pass by design.

### B5. Boundaries

Per `AGENTIC_OPERATING_MODEL.md`: this spec is Level 0/1. Implementation of any
phase is Level 2 (feature branch + verify) and the layer-shell spike should land
its own branch with a go/no-go before Phase 1. No `main`/promote without explicit
human approval.
