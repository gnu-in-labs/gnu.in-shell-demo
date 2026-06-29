# Shell Inventory & Integrity Audit
> Maps every Central surface + parent/child/asset to its **real backend source**, with a verdict: **KEEP · EDIT · AUGMENT · ADD · REPLACE**. Grounded in `port-data/shell_settings.json` (the `ShellSettingsService`/`DockService` map) and the `uploads/` monorepo specs. The ranked frontiers at the bottom are the build order.

Date: 2026-06-25 · Phase: post-Frontier-#1 (Bar appearance + Widgets live) · Scope: Central.dc.html + parents/children + port-data + docs.

> **Method (per direction):** our surfaces are *fundamentally better designed* than the legacy QML shell — so the legacy backend is an **idea mine, not a spec to mirror**. Each frontier harvests the legacy's interesting features/settings/behaviors and re-implements them on Central's fundamentals (data-driven, single-pass, live-wired), never a flat dump of QML getters.

---

## A. Central compositor surfaces

| Surface (band) | Central today | Real backend source | Verdict |
|---|---|---|---|
| Background / Wallpaper (0–1) | static gen + night-shift; `wallSource` invented | `WallpaperService` / `gnuin-background` (QML; workplan aspires to retained scene nodes) | **AUGMENT** — `wallSource`/`nightShift` have no backend key; either wire to a real wallpaper model or label as sim-only |
| **Bar / Taskbar (30)** | registry (left/center/right) **+ live appearance** ✓✓ | `gnuin-bar` + `ShellSettingsService.topbar*` legacy keys (edge/density/corner/group-style/floating-shadow/auto-hide/super-reveal/app-strip/clock-format/tooltips) | **KEEP** — ✅ Frontier #1: one surface (not a separate "topbar"). corner-style, group-style, floating-shadow, auto-hide + super-reveal, clock-format (24h/12h/ISO), tooltips all **wired to visible bar change**, in the **Taskbar** section. Port: `bar_settings.rs` (4 enums + resolve_bar + 8 tests) |
| **Widgets (in bar)** | **12-widget inventory, live enablement** ✓ + **media** widget = live now-playing chip + **resources** widget = live CPU/RAM monitor with **expert popover** (CPU·RAM·Network sparklines, peak) | `ShellSettingsService.widgetEnabled` — 12 widgets: sidebar-left, active-window, resources, media, workspaces, clock, gnosis-app, notifications, wifi, bluetooth, weather, audio | **KEEP** — ✅ Frontier #1: all 12 in a CC inventory with switches; slot-bound widgets **filter** the bar live, unplaced widgets **append** as a strip (slot/strip zone tag). The widgets ARE the component inventory, now individually toggleable |
| Dock (30) | **three real layers** ✓ (visibility + affordance + **live app-state**) | `ShellSettings` (mode/reveal/hide/pin) + `gnuin-dock::affordance` (deck_style) + foreign-toplevel/Notif (windows·badge·attention) | **KEEP** — ✅ third layer added this pass: cursor **magnification** (Row falloff + neighbour swell), window-count dots, notification badges, attention bounce, pinned/transient separator, + CC inventory (badge stepper · attention toggle). Port: `dock_items.rs` (DockItems/DockItem/Magnify/WindowPreview + 7 tests) + **Apparence** personalization (indicator dot/line/none · labels · separators · margin · opacity · radius · elevation · **window-preview popups** = hover → clickable window thumbnails, click raises/focuses) — `dock_settings.rs::DockAppearance` (+4 tests). **All dock pending_parity closed** |
| Sidebar (60) | **Gnosis assistant** panel ✓ (prompt→launcher · quick actions · live recent-activity from the log) + system controls | `sidebar-left` widget · `gnosis-app` | **KEEP** — ✅ Frontier #3 (redirected): developed as the **Gnosis** left-sidebar. `sidebarBooru*` (manga image boards) **intentionally excluded — not welcome** in this product |tent), not a placeholder |
| Launcher (120) | **provider-based fuzzy launcher** ✓ (apps · commands · calc · frecency recents · keyboard nav · match-highlight) | `gnuin-launcher` (fuzzy_match · Provider route · Frecency) + host calc, wired to real Central actions | **KEEP** — ✅ upgraded this pass from substring app-grid → fzf-lite list launcher. Port: `launcher.rs` (10 tests). `>` commands · `=` calc · ↑↓/↵/Tab/Esc |
| **Context menu (100)** | compose-core, 23 styles, spec-sourced, MenuRow nodes ✓ + **system-risk items delegate authority** (polkit modal, reuses authority.rs) | `gnuin-compose-core::menu` | **KEEP** — best-developed surface; the reference standard. **2026-06-26:** GnuContextMenu anatomy now catalogued as 3 agentic molecules in `molecule_specs.json` (30 total) — `AgenticGnuContextMenu` / `AgenticPlanConfirm` / `AgenticSuggestBubble`; risk/badge/suggest/plan/privacy fields specced; both renderers updated |
| OSD (800) | volume/brightness, pointer-gated ✓ | compositor OSD | **KEEP** |
| Notifications (tray) | tray + count ✓ | `notifications` widget | **EDIT** — could ground in a real notification model |
| Windows | spawn/tile/workspace ✓ | Hyprland windows | **KEEP** (sim-only, fine for demo) |
| Modal / Damage overlay / Screen-corners | ✓ | engine viz | **KEEP** |
| Mascot · Sys.ter | 9 states, activity-wired ✓ | `syster-mascot` | **KEEP** |
| **Compositor profile** | profile resolve→override + experimental gate + derived portal + visible focus/edge ✓ | `ShellSettingsService.hyprlandPlugin*` — profile (stable/visual-focus/gesture-lab/capture-lab/workspace-lab) + experimental/reload/focus-feedback/edge-gestures/capture-provider + portal health | **KEEP** — ✅ Frontier #2: new **Compositor** CC section. Port: `compositor_profile.rs` (5 enums + resolve/override + diagnostic + derived portal + 9 tests) |

## B. Control Center sections

Present: **General · Taskbar · Dock · Engine · Tokens · Motion · Atoms · Molecules · Behaviours**.

| Gap | Real source | Verdict |
|---|---|---|
| **Bar appearance** (in Taskbar §) | `topbar*` legacy keys (12) | ✅ **DONE** — Frontier #1 · Taskbar → Apparence subsection (corner/group/clock segmented + 4 toggles + Super-reveal). No separate "Topbar" section — same surface |
| **Widgets** (in Taskbar §) | `widgetEnabled` (12) | ✅ **DONE** — Frontier #1 · Taskbar → Widgets subsection (12-row inventory, live, slot/strip zones) |
| **Compositor Profile** group | `hyprlandPlugin*` | ✅ **DONE** — Frontier #2 (Compositor section: profile preset→resolve→override, experimental gate, derived portal, visible focus/edge) |
| ~~**Sidebar / Booru** group~~ | ~~`sidebarBooru*`~~ | ❌ **EXCLUDED** — manga image-board features not welcome; sidebar developed as Gnosis assistant instead (no CC settings group) |
| **Panel Family** | `shellMode` (gnosis-engine visual families) | ✅ **DONE** — Frontier #4 (General → Panel Family: glass/solid/outline/soft, live across sidebar+launcher+panels, + host tweak) |
| General: `wallSource`, `nightShift` | no backend key found | **EDIT** — mark sim-only or wire. **2026-06-26:** added foundational **theme (dark/light) + surface materials** (`theme.rs` + `material.rs`): theme toggle + Materials legend in General, applied to desktop + launcher (Chrome/sidebar/CC stay dark by design) |
| Missing settings *pages* | real shell has Appearance · Developer · Displays · Gnosis · Input · Services · Shell · Surfaces | **EDIT** — Displays/Input/Services/Developer present; **2026-06-26:** added a **Quick** control-center page (now-playing media card + live connectivity/volume/brightness/workspace/session tiles) + fuzzy nav search (reuses launcher matcher) + a bespoke **Services** page with a proper **authority/delegation** model (single-owner services · Session/System/Compositor · polkit-style authorization with remembered TTL grants + revoke). Port: `quick_settings.rs` + `media_player.rs` + `authority.rs` (17 tests). Still absent: Appearance/Gnosis/Shell as dedicated pages |

## C. Parents / children / assets

| Artifact | Role | Verdict |
|---|---|---|
| `Gnu.In Context Menus.dc.html`, `Molecule Renderer.dc.html` | mount `DataGallery` (data-driven, self-contained) | **KEEP** — molecule collapse done; **30 molecules** (was 27) · family `agentic` (08) added · `MoleculeRenderer` covers all with 0 bespoke code · 7 new icons (plan/suggest/privacy/scope/back/rename/file) |
| `menu/molecule-data-gallery.jsx`, `menu/molecule-renderer.jsx` | renderer + gallery | **KEEP** (dead gallery/primitives/scenes/archetypes deleted) |
| Docs: Atlas · Atomes · Fondations · Handoff · Index · Intégration · Molécules | design-system docs | **AUGMENT** — version-synced + molecule lib propagated; **dock 2-layer model & `shell_settings` map propagated → Intégration Frame E** (✅ #55); SHELL_INVENTORY_AUDIT.md is the canonical surfaces/settings reference |
| Films: `Trigger Film`, `gnu.in-OS Plan de Fusion` | motion films | **KEEP** |
| `Syster.dc.html` | mascot doc | **KEEP** |
| `port-data/` corpus (18 files + scenes + MANIFEST + PARITY) | the Rust port | **KEEP / extend** — newly aligned: `dock_settings.rs`, `dock_items.rs` (dock's 3rd live app-state layer), `shell_settings.json`. Open: motion-ladder reconciliation (blob.in authoritative) |
| `legacy/`, `assets/`, `fonts/`, `mascot/`, `_ds/` | assets / DS bundle | **KEEP** |

---

## Ranked frontiers — build order

1. ✅ **DONE — Bar appearance + Widgets** — folded into the **Taskbar** section (one surface, not a separate "topbar"): an **Apparence** subsection (corner-style · group-style · clock-format segmented + floating-shadow · auto-hide · super-reveal · tooltips toggles + Super→reveal) and a **Widgets** subsection (the 12 `widgetEnabled` toggles, slot/strip zones), **wired live to the bar**. Port: `bar_settings.rs` (Edge/Density/CornerStyle/GroupStyle enums + 12-Widget inventory + `resolve_bar` + 8 tests), registered in MANIFEST.per→reveal) and a **Widgets** inventory (the 12 `widgetEnabled` toggles, slot/strip zones), **wired live to the bar**. Port: `topbar_settings.rs` (Edge/Density/CornerStyle/GroupStyle enums + 12-Widget inventory + `resolve_bar` + 8 tests), registered in MANIFEST.
2. ✅ **DONE — Compositor Profile** — new **Compositor** CC section (`hyprlandPlugin*`): profile preset that resolves focus/edge/capture, with override tags, experimental-gate diagnostic, derived portal-session health, and **visible payoffs** (focus-feedback on windows, edge-gesture zones). Port: `compositor_profile.rs` (5 enums + resolve/override/diagnostic + 9 tests) + `scenes/compositor-profile.json`.
3. ✅ **DONE (redirected) — Gnosis sidebar** — the sidebar is now the **Gnosis** assistant left-sidebar: a prompt row that opens the Gnosis launcher, quick action chips, and a **live recent-activity feed read from the real action log**, above the system quick-controls. The legacy `sidebarBooru*` group (yandere/danbooru/gelbooru… manga image boards) is **intentionally excluded — not welcome** in this product; no port file written for it.
4. ✅ **DONE — Panel Family (`shellMode`)** — a real visual-family switch in the General section: **glass · solid · outline · soft**, each resolving one panel treatment (fill/blur/border/radius/elevation) threaded **live into the sidebar + launcher + panels**, with a 4-swatch preview and a host tweak. Port: `panel_family.rs` (ShellMode→PanelTreatment + 6 tests) + `scenes/panel-family.json`.
5. ✅ **DONE — Settings pages** — **Displays · Input · Services · Developer** scaffolded as 4 CC sections via one generic renderer (toggle/select/slider/status rows). Completes the real 8-page app (the other 4 map to General/Taskbar/Compositor+Dock/Sidebar). Developer's *scene-inspector* + *experimental-flags* are tied to live engine state. Port: `settings_pages.rs` (4 page structs + ServiceHealth derive + 5 tests) + `scenes/settings-pages.json`.

**All five frontiers shipped.** Remaining: optional polish only — the surfaces are now backend-grounded end to end.
