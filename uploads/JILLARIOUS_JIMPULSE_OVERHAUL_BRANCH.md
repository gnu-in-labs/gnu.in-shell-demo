# Jillarious-Jimpulse Overhaul Branch

Branch: `live/jj-overhaul-template`

> **Relock note (Phase S4):** `gnu.in-design-reference`, `gnuin-hyprconf`, and
> `hyprdynamicmonitors` remain fast-forward-merged onto `main`. To deliver the
> Phase S4 shell overhaul, `components.lock.toml` re-pins `gnu.in-shell` to its
> `live/jj-overhaul-template` tip and `gnu.in-gnosis-app` to its
> `live/ii-overhaul-template` tip — those rails carry the S4/ii surface work that
> has not yet been fast-forwarded onto each component's `main`. The `Branch` column
> below mirrors the exact rail each revision is locked from; prefer `main` only for
> components already graduated there.

Latest clean runtime checkpoint: `gnu.in-os/v0.14.2+20260624-170024-97a86b5`
Latest promoted build: `20260624-170024-97a86b5`
Version: `0.14.2`
Channel: `beta`

Pinned component checkpoints:

| Component | Branch | Revision | Role |
| --- | --- | --- | --- |
| `gnu.in-shell` | `feat/osd-rust-slice` | `0c476fce5c51ab8a632f64d5c317c0edad88a705` | JJ surface bridges, ShellIpc routes, runtime QML; Qt launcher stripped (settings now native Rust/GPUI). |
| `gnu.in-design-reference` | `main` | `82d03288740f1a27594d019da90ad327620a549a` | Generated design-system authority consumed by runtime adapters. |
| `gnu.in-gnosis-app` | `live/ii-overhaul-template` | `a46e7d0d72763e0207bda2505b0187dcb091f585` | Native Gnosis app/client layer materialized into the shell build. |
| `gnuin-hyprconf` | `live/ii-overhaul-template` | `3d82e71f1ca8779c86463020c435bbce123f3f25` | Shared shell settings authority via `crates/gnuin_shell_config`. |
| `hyprdynamicmonitors` | `main` | `ce4292c0b136c7933eaf3b79ac72e659d81323cb` | Optional delegated display-profile authority; GNU.IN retains runtime geometry ownership. |

## Objective

Build a live iteration branch for a complete GNU.IN Shell visual and behavioral
overhaul using Jillarious-Jimpulse as the reference system. The branch must turn
the Jillarious-Jimpulse desktop experience into a GNU.IN-native shell template:
surfaces, animations, bindings, tools, settings, rendering, input behavior, and
system workflows should converge on the original reference while remaining
wired to GNU.IN authorities.

This is not a raw copy operation. Imported Jillarious material is reference and
implementation source only after it is routed through the GNU.IN runtime model.

## Authorities

| Area | GNU.IN Authority |
| --- | --- |
| OS integration, release, build, promotion | `gnu.in-os` |
| Runtime QML shell source | `gnu.in-shell` |
| Gnosis app surface and client layer | `gnu.in-gnosis-app` |
| Hyprland settings mutation | `gnuin-hyprconf` |
| Gnosis engine, SHM, D-Bus, semantic services | `gnu.in-os/engine/gnosis-engine` |
| Imported Jillarious reference packet | `gnu.in-os/docs/assets/Jillarious-Jimpulse` |
| Surface/shortcut migration matrix | `gnu.in-os/docs/jillarious-overhaul/surface-matrix.json` |

## Current Runtime Evidence

- The live Hyprland Lua config calls Jillarious-style `quickshell:*` globals.
- The runtime IPC path is alive: `qs ipc ... call gnuin system ping` returns
  `pong`.
- `JillariousShortcutBridge` registers the live Jillarious-style global names so
  Hyprland does not dispatch into silence during the staged rewrite.
- `JillariousCommandService`, `SurfaceRegistry`, `ShellIpc`, `BarService`,
  `LauncherService`, `SidebarService`, `RegionToolsService`,
  `ScreenTranslatorService`, `OverlayService`, `MediaControlsService`, and
  `WallpaperService` now form the bridge layer between JJ actions and GNU.IN
  runtime authorities.

Current GNU.IN global shortcut coverage:

| Registered in GNU.IN | State |
| --- | --- |
| `barToggle`, `barOpen`, `barClose` | bridged through `BarService` and topbar reserved-zone authority |
| `clipboardToggle`, `overviewClipboardToggle` | bridged through launcher clipboard mode |
| `configPanelToggle` | bridged to GNU.IN Settings launcher |
| `emojiToggle`, `overviewEmojiToggle` | bridged through launcher emoji mode |
| `gnosisControlPanel` | bridged to the Gnosis surface and service refresh path |
| `mediaControlsToggle`, `mediaControlsOpen`, `mediaControlsClose` | bridged through MPRIS media controls |
| `oskToggle`, `oskOpen`, `oskClose` | bridged through the on-screen keyboard service |
| `osdVolumeTrigger`, `osdVolumeHide` | bridged through on-screen display service |
| `overlayToggle` | bridged through `OverlayService` and MembraneHost |
| `overviewWorkspacesToggle` | bridged through launcher workspace overview |
| `panelFamilyCycle` | bridged through `ShellSettingsService.cycleShellMode()` |
| `regionOcr`, `regionRecord`, `regionScreenshot`, `regionSearch` | bridged through region tooling and Gnosis policy hooks |
| `screenTranslate` | bridged through screen translator and Gnosis vision hooks |
| `searchToggleRelease`, `searchToggleReleaseInterrupt` | bridged with Super-release interruption semantics |
| `sessionToggle` | ported to the `JillariousSessionScreen` runtime surface |
| `sidebarLeftToggle`, `sidebarLeftOpen`, `sidebarLeftClose`, `sidebarLeftToggleDetach` | bridged through left sidebar authority |
| `sidebarRightToggle`, `sidebarRightOpen`, `sidebarRightClose` | bridged through right sidebar authority |
| `wallpaperSelectorRandom`, `wallpaperSelectorToggle` | bridged through wallpaper service and selector surface |
| `workspaceNumber` | bridged through Super-held workspace number hints |

Jillarious-style live actions still requiring deeper parity work:

| Action | Target State |
| --- | --- |
| bar/taskbar geometry | Move from bridge parity to full JJ visual density, transparency, app strip, workspace number, and multi-monitor behavior. |
| settings control plane | Convert bridged settings pages into a native windowed GNU.IN control plane that survives Quickshell reloads. |
| launcher and command modes | Replace utility launch fallbacks with GNU.IN-owned providers for clipboard, emoji, apps, actions, and commands. |
| region/translation flows | Replace command-level bridges with typed capture, OCR, translation, visual-search, and policy evidence. |
| notification center | Finish popup/center parity beyond bridge-level notification surface coverage. |
| background widgets and wallpaper theming | Weather/background settings are backend-mapped; full analog clock, provider, placement, and wallpaper-derived theming parity remain staged. |

## Legacy Surface Inventory

These GNU.IN surfaces are active legacy/template candidates. They must be
inventoried before deactivation, then either ported, merged into Jillarious
equivalents, or archived.

| Current Surface | Current Owner | Jillarious Target |
| --- | --- | --- |
| `TopbarHost` / `Taskbar` | `gnu.in-shell/components` | Jillarious `modules/ii/bar` connected Material bar. |
| `WorkspaceWidget` | `gnu.in-shell/components` | Jillarious connected workspace pills. |
| `DockHost` / `DockWindow` | `gnu.in-shell/components` | Jillarious dock behavior and panel rules. |
| `AppLauncher` / `LauncherService` | `gnu.in-shell/components`, `services` | Jillarious overview/start/search behavior. |
| `QuickControlPanel` | `gnu.in-shell/components` | Jillarious action center/sidebar flow. |
| `NotificationsTray` / `NotificationArea` | `gnu.in-shell/components/views` | Jillarious notification center and popup stack. |
| `PowerTray` | `gnu.in-shell/components/views` | Archived legacy; mounted runtime replacement is `JillariousSessionScreen`. |
| `GnuSettingsApp` | `gnu.in-shell/components/settings` | GNU.IN-native settings retaining Jillarious visual grammar. |
| `MembraneHost` | `gnu.in-shell/components` | GNU.IN SDF/membrane host for Jillarious surfaces. |
| `GnosisApp` / `GnosisCompanion` | `gnu.in-gnosis-app` materialized into shell | GNU.IN-specific Gnosis layer, visually harmonized with Jillarious. |

## Import/Rewrite Rules

1. Imported Jillarious files must be recorded in `Jillarious-Jimpulse`
   provenance or a branch-specific source-import directory.
2. Runtime behavior must be reimplemented through GNU.IN services, not by
   bypassing them with foreign state writers.
3. Legacy surfaces must not be deleted until their components, bindings,
   settings, tests, and runtime ownership are inventoried.
4. The branch may disable legacy surfaces behind explicit routing gates, but
   live promotion requires build and runtime proof.
5. Every Jillarious global shortcut must have one of three states:
   `ported`, `bridged`, or `pending-port`.
6. Every pending shortcut must be visible in tests; silent missing globals are
   considered a branch regression.

## First Iteration Gate

The first iteration is complete when:

- The branch exists in `gnu.in-os` and `gnu.in-shell`.
- The imported `Jillarious-Jimpulse` reference packet is tracked.
- GNU.IN Shell registers all live Jillarious-style global shortcut names, even
  if some are explicitly marked pending.
- A test prevents reintroducing silent missing shortcut registrations.
- Legacy surfaces have a documented inventory and deactivation strategy.

Full completion of the overhaul remains broader: visual parity, behavioral
parity, backend rewiring, live verification, build, promotion, and screenshots.

## Current Migration Artifacts

- `docs/assets/Jillarious-Jimpulse/quickshell-source/ii/`: imported Jillarious
  Quickshell source reference.
- `docs/jillarious-overhaul/surface-matrix.json`: machine-readable migration
  matrix for surfaces, shortcuts, GNU.IN authorities, and archive gates.
- `docs/jillarious-overhaul/MIGRATION_INVENTORY.md`: readable migration and
  legacy-archive plan.
- `docs/jillarious-overhaul/settings-authority-schema.md`: settings absorption
  map from JJ options to GNU.IN `shell.*` authority.
- `docs/jillarious-overhaul/topbar-taskbar-control-plane.md`: topbar/taskbar,
  workspace, audio, and menu-control functional lock.
- `docs/jillarious-overhaul/motion-menu-profiles.md`: semantic motion,
  transparency, and contrast token profile packet.
- `docs/jillarious-overhaul/hyprland-plugin-roadmap.md`: compositor-plugin
  candidate matrix, portal/session prerequisite, settings authority contract,
  and verification gate for plugin-backed focus, gesture, capture, and
  workspace experiments.
- `docs/jillarious-overhaul/extraction-governance.md`: matrix-first extraction,
  archive-state, and verification method.
- `gnu.in-shell/components/views/JillariousSessionScreen.qml`: first
  GNU.IN-native Jillarious surface replacement, porting `modules/ii/sessionScreen`
  while retaining `SurfaceRegistry.powerTray` as the compositor-facing id.
- `gnu.in-shell/docs/jillarious-overhaul/session-screen-port.md`: shell-side
  archive note for the retired mounted `PowerTray` lane.
- `gnu.in-shell/docs/jillarious-overhaul/overview-search-port.md`: shell-side
  note for the top-aligned overview/search, clipboard utility mode, emoji
  utility mode, workspace/task rows, `search` IPC, Lua overview events, and
  Super-held workspace-number bridge.
- `gnu.in-shell/docs/jillarious-overhaul/bar-visibility-bridge.md`: shell-side
  note for `barToggle`/`barOpen`/`barClose`, `BarService`, IPC `bar`, and
  reserved-zone/membrane gating.
- `gnu.in-shell/docs/jillarious-overhaul/dock-bridge.md`: shell-side note for
  Jillarious dock pin/reveal state, `DockService`, IPC `dock`, control tile, and
  bottom reserved-zone gating.
- `gnu.in-shell/docs/jillarious-overhaul/wallpaper-selector-port.md`:
  shell-side note for the Jillarious `wallpaperSelector` modal bridge,
  `WallpaperService`, IPC `wallpaperSelector`, quick source filters, keyboard
  navigation, and remaining folder/dialog parity deltas.
- `gnu.in-shell/docs/jillarious-overhaul/region-tools-bridge.md`: shell-side
  note for Jillarious `regionSelector` bindings, `RegionToolsService`, IPC
  `region`, local Wayland capture dependencies, and Gnosis policy/vision
  routing.
- `gnu.in-shell/docs/jillarious-overhaul/screen-translator-bridge.md`:
  shell-side note for Jillarious `screenTranslator`, `ScreenTranslatorService`,
  IPC `screenTranslator`, Gnosis active-window `VisionScan`, modal overlay,
  region labels, and the remaining OCR/translation provider parity delta.
- `gnu.in-shell/docs/jillarious-overhaul/overlay-bridge.md`: shell-side note
  for Jillarious `overlay`, `OverlayService`, IPC `overlay`, full-screen
  scrim, floating taskbar, widget canvas, pinned-widget state, MembraneHost
  focus/input masks, and remaining widget parity deltas.
- `gnu.in-shell/docs/jillarious-overhaul/media-controls-bridge.md`:
  shell-side note for Jillarious `mediaControls`, `MediaControlsService`, IPC
  `mediaControls`, MPRIS player rows, transport controls, progress display, and
  the remaining visualizer/color parity delta.
- `gnu.in-shell/docs/jillarious-overhaul/cheatsheet-bridge.md`:
  shell-side note for Jillarious `cheatsheet`, `CheatsheetService`, IPC
  `cheatsheet`, centered MembraneHost modal, keybind tab, compact element tab,
  keyboard tab cycling, and remaining dynamic keybind/parser parity deltas.
- `gnu.in-shell/docs/jillarious-overhaul/on-screen-keyboard-bridge.md`:
  shell-side note for Jillarious `onScreenKeyboard`,
  `OnScreenKeyboardService`, IPC `osk`, bottom MembraneHost surface,
  modifier/pin/layout state, guarded `ydotool` injection, and remaining layout
  and reserved-zone parity deltas.
- `gnu.in-shell/docs/jillarious-overhaul/on-screen-display-bridge.md`:
  shell-side note for Jillarious `onScreenDisplay`,
  `OnScreenDisplayService`, IPC `osd`/`osdVolume`, ambient top MembraneHost
  surface, audio/brightness service wiring, command-center preview routes, and
  remaining icon/indicator parity deltas.
- `gnu.in-shell/docs/jillarious-overhaul/notification-popup-bridge.md`:
  shell-side note for Jillarious `notificationPopup`,
  `NotificationPopupService`, IPC `notificationPopup`, `quickshell:notificationPopup`
  namespace, DND/sidebar/tray popup inhibition, desktop action routing, and
  remaining grouped-card/image/action-button parity deltas.
- `gnu.in-shell/docs/jillarious-overhaul/screen-corners-bridge.md`:
  shell-side note for Jillarious `screenCorners`, `ScreenCornersService`, IPC
  `screenCorners`, fullscreen-aware passive fake-rounded corners,
  `quickshell:screenCorners` namespace, empty input mask, and remaining
  interactive corner action parity deltas.
- `gnu.in-shell/docs/jillarious-overhaul/background-bridge.md`: shell-side
  note for Jillarious `background`, `BackgroundService`, IPC `background`,
  `DesktopBackground`, GNU.IN `WallpaperService` ownership, fullscreen-aware
  auto mode, the first digital clock/status widget lane, and remaining
  cookie/weather/parallax/placement parity deltas.

## 0.12.0 Global Version Checkpoint

The current promoted baseline adds a live iteration checkpoint on the JJ-first
branch with synchronized component pointers and verified runtime promotion.

Evidence:

- `tools/build.sh` completed without `--allow-dirty`.
- Promoted build: `20260615-163926-cbeb40b`.
- Version signature: `gnu.in-os/v0.12.0+20260615-163926-cbeb40b`.
- `release/VERSION` and `release/CHANNEL` now track `0.12.0` and `beta`.
- `tools/status.sh --strict` reports source clean and runtime artifacts clean for
  this promoted checkpoint.
- `tools/verify.sh` passes with `status OK` in staging mode and verified surface
  manifests/contracts for II-style refactoring.
- `release/GLOBAL-VERSION.json` and `build-manifest` metadata remain aligned.
- Jillarious mapping now uses `0.12.0` manifest pointers, and the branch remains
  on the `live/jj-overhaul-template` rail in both `gnu.in-os` and
  `gnu.in-shell`.

Remaining runtime caveat:

- `portal session health` remains `inactive-graphical-session` outside an active
  Hyprland session in this non-graphical verification environment. The session
  launcher and boot-sequence guards pass; portal restart is intentionally skipped
  until the next interactive login.

## 0.11.257 Global Version Checkpoint

The current promoted baseline adds an agent-facing global version manifest and
closes the remaining Gnosis legacy-active inventory gap.

Evidence:

- `tools/build.sh` completed without `--allow-dirty`.
- Promoted build: `20260614-191140-ee48c3c`.
- Version signature: `gnu.in-os/v0.11.257+20260614-191140-ee48c3c`.
- `release/GLOBAL-VERSION.json` tracks the beta train plus pinned component
  revisions for `gnu.in-shell`, `gnu.in-gnosis-app`, `gnuin-hyprconf`,
  `gnu.in-design-reference`, and `hyprdynamicmonitors`.
- The build manifest embeds `global_version` and copies
  `manifests/global-version.json`; promotion installs that runtime metadata.
- `gnosis` is now `bridged` in the surface matrix. The bridge is routed through
  `JillariousCommandService`, `ShellIpc` target `gnosisShell`,
  `SurfaceRegistry.gnosisApp`, `MembraneHost`, and Gnosis backend/settings
  authorities.

Remaining runtime caveat:

- `portal session health` is still `inactive-graphical-session` in this
  non-graphical verification context. The session launcher and boot-sequence
  guards pass; portal restart is intentionally skipped until the next active
  Hyprland login.

## 0.11.256 Clean Runtime Checkpoint

The current promoted baseline removes the dirty hyprconf build from the live
iteration lane.

Evidence:

- `tools/build.sh` completed without `--allow-dirty`.
- Promoted build: `20260614-185200-91c394f`.
- Version signature: `gnu.in-os/v0.11.256+20260614-185200-91c394f`.
- `tools/status.sh --strict` reports source clean, runtime artifacts clean, JJ
  surface coverage pass, JJ settings coverage pass, and IPC `pong`.
- `gnuin-hyprconf` now owns a shared `gnuin_shell_config` crate. `hyprconfd`
  re-exports that crate as its config authority instead of duplicating the
  shell/JJ schema locally.
- `test_jillarious_overhaul_inventory_contract.sh` now verifies that the
  settings absorption model lives in the shared hyprconf crate while
  `hyprconfd/src/config.rs` remains the public re-export surface.

Remaining runtime caveat:

- `portal session health` is still `inactive-graphical-session` in this
  non-graphical verification context. The session launcher and boot-sequence
  guards pass; portal restart is intentionally skipped until the next active
  Hyprland login.
