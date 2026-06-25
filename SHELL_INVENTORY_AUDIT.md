# Shell Inventory & Integrity Audit
> Maps every Central surface + parent/child/asset to its **real backend source**, with a verdict: **KEEP · EDIT · AUGMENT · ADD · REPLACE**. Grounded in `port-data/shell_settings.json` (the `ShellSettingsService`/`DockService` map) and the `uploads/` monorepo specs. The ranked frontiers at the bottom are the build order.

Date: 2026 · Phase: post-dock-reconciliation · Scope: Central.dc.html + parents/children + port-data + docs.

---

## A. Central compositor surfaces

| Surface (band) | Central today | Real backend source | Verdict |
|---|---|---|---|
| Background / Wallpaper (0–1) | static gen + night-shift; `wallSource` invented | `WallpaperService` / `gnuin-background` (legacy host; workplan aspires to retained scene nodes) | **AUGMENT** — `wallSource`/`nightShift` have no backend key; either wire to a real wallpaper model or label as sim-only |
| **Bar / Topbar (30)** | data-driven module registry (left/center/right) ✓ | `gnuin-bar` (live taskbar consumer) + `ShellSettingsService.topbar*` (edge/density/corner/group-style/floating-shadow/auto-hide/super-reveal/app-strip/clock-format/tooltips) | **AUGMENT** — registry is strong; **none of the 12 real topbar appearance keys exist** as settings |
| **Widgets (in bar)** | icons hardcoded in right slot | `ShellSettingsService.widgetEnabled` — 12 widgets: sidebar-left, active-window, resources, media, workspaces, clock, gnosis-app, notifications, wifi, bluetooth, weather, audio | **ADD** — no per-widget enablement; the widgets ARE the shell's component inventory |
| Dock (30) | **two real layers** ✓ (visibility + affordance) | `ShellSettings` (mode/reveal/hide/pin) + `gnuin-dock::affordance` (deck_style) | **KEEP** — done this pass; faithful |
| Sidebar (60) | generic "contrôle" panel | `sidebar-left` widget + `sidebarBooru*` (provider/nsfw/limit/username) | **REPLACE** — ground in the real sidebar (Booru provider grid + left-sidebar content), not a placeholder |
| Launcher (100+) | live fuzzy filter ✓ | Gnosis app (`gnosis-app` widget) / spotlight | **EDIT** — solid; rename/ground as the Gnosis launcher |
| **Context menu (100)** | compose-core, 23 styles, spec-sourced, MenuRow nodes ✓ | `gnuin-compose-core::menu` | **KEEP** — best-developed surface; the reference standard |
| OSD (800) | volume/brightness, pointer-gated ✓ | compositor OSD | **KEEP** |
| Notifications (tray) | tray + count ✓ | `notifications` widget | **EDIT** — could ground in a real notification model |
| Windows | spawn/tile/workspace ✓ | Hyprland windows | **KEEP** (sim-only, fine for showcase) |
| Modal / Damage overlay / Screen-corners | ✓ | engine viz | **KEEP** |
| Mascot · Sys.ter | 9 states, activity-wired ✓ | `syster-mascot` | **KEEP** |
| **Compositor profile** | **ABSENT** | `ShellSettingsService.hyprlandPlugin*` — profile (stable/visual-focus/gesture-lab/capture-lab/workspace-lab) + experimental/reload/focus-feedback/edge-gestures/capture-provider + portal health | **ADD** — entirely missing; real, high-signal backend |

## B. Control Center sections

Present: **General · Taskbar · Dock · Engine · Tokens · Motion · Atoms · Molecules · Behaviours**.

| Gap | Real source | Verdict |
|---|---|---|
| **Topbar** group | `topbar*` (12 keys) | **ADD** |
| **Widgets** group | `widgetEnabled` (12) | **ADD** |
| **Compositor Profile** group | `hyprlandPlugin*` | **ADD** |
| **Sidebar / Booru** group | `sidebarBooru*` | **ADD** |
| **Panel Family** | `shellMode` (gnosis-engine visual families) | **AUGMENT** — `shellMode` exists as a prop but isn't a real settings control |
| General: `wallSource`, `nightShift` | no backend key found | **EDIT** — mark sim-only or wire |
| Missing settings *pages* | real shell has Appearance · Developer · Displays · Gnosis · Input · Services · Shell · Surfaces | **ADD later** — Displays/Input/Services/Developer absent |

## C. Parents / children / assets

| Artifact | Role | Verdict |
|---|---|---|
| `Gnu.In Context Menus.dc.html`, `Molecule Renderer.dc.html` | mount `DataGallery` (data-driven, self-contained) | **KEEP** — the molecule collapse is done; single source `molecule_specs.json` → `MoleculeRenderer` |
| `menu/molecule-data-gallery.jsx`, `menu/molecule-renderer.jsx` | renderer + gallery | **KEEP** (dead gallery/primitives/scenes/archetypes deleted) |
| Docs: Atlas · Atomes · Fondations · Handoff · Index · Intégration · Molécules | design-system docs | **AUGMENT** — version-synced + molecule lib propagated; Fondations/Surfaces should gain the **dock 2-layer model** + the **`shell_settings` map** so the docs inventory the real settings |
| Films: `Trigger Film`, `gnu.in-OS Plan de Fusion` | motion films | **KEEP** |
| `Syster.dc.html` | mascot doc | **KEEP** |
| `port-data/` corpus (17 files + scenes + MANIFEST + PARITY) | the Rust port | **KEEP / extend** — newly aligned: `dock_settings.rs`, `shell_settings.json`. Open: motion-ladder reconciliation (blob.in authoritative) |
| `legacy/`, `assets/`, `fonts/`, `mascot/`, `_ds/` | assets / DS bundle | **KEEP** |

---

## Ranked frontiers — build order

1. **Topbar + Widgets** *(highest signal)* — a Control Center **Topbar** group (edge · density · corner-style · group-style · floating-shadow · auto-hide · super-reveal · clock-format · tooltips) and a **Widgets** group (the 12 `widgetEnabled` toggles), both **wired live to the bar**. This is the surface the user touches most, and the 12 widgets literally *are* the shell's component inventory. Port: `topbar_settings.rs` + extend `shell_settings.json` consumers.
2. **Compositor Profile** — the `hyprlandPlugin*` group (profile + focus-feedback + edge-gestures + capture-provider + portal health). Entirely absent; pure-backend; great showcase/documentation value. Port: `compositor_profile.rs`.
3. **Sidebar / Booru** — replace the placeholder "contrôle" panel with the real left-sidebar + Booru provider grid (provider · nsfw gate · limit · username), wired. Port: `sidebar_settings.rs`.
4. **Panel Family (`shellMode`)** — promote `shellMode` to a real visual-family switch driving the compositor look.
5. **Settings pages** — Displays · Input · Services · Developer scaffolds to match the real 8-page settings app.

**Frontier #1 is the attack.** It converts "most widgets/surfaces aren't developed to their highest" into a concrete, backend-grounded build: the bar becomes fully settings-driven and every shell widget is individually inventoried + toggleable, live.
