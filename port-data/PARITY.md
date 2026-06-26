# Port Parity — Central simulator ↔ `gnuin-compose-core`

Central (`Central.dc.html`) is the **100%-simulated** GNU.IN shell; this `port-data/`
corpus is the **data for the Rust port, in parallel**. The authoritative engine
crate now exists in the workspace, so this file pins exactly how the simulation
maps onto it — what is faithful, what is a deliberate subset, and where the
golden fixtures come from.

## Authoritative source

| | |
|---|---|
| Crate | `gnu.in-os/engine/gnuin-compose-core` **v0.14.2** (edition 2021, std-only; optional `serde`) |
| Spec | `docs/COMPOSITION_ENGINE_SPEC.md` — reactive surface compositor, **menus first** |
| Tokens (E1) | `gnu.in-os/engine/blob.in/tokens.json` → `gen/gnu_theme.rs` (one source updates all hosts) |
| Host | `gnuin-compose-host` (sctk/tiny-skia), blob via `engine/blob-uniforms` |

`port-data/compose_core.rs` is a **conformance mirror** of that crate's public
API (same names/variants/fields + canonical constants). It is not a fork — the
crate is the source of truth; the mirror keeps the fixtures honest.

## What the mirror/fixtures reproduce faithfully

- **Scene model** — `Node { id, kind, rect, z, state, tokens, payload }`, immutable
  `Scene { screen, nodes }`. `NodeKind` (14), `NodeId` (incl. `Blob(Backed)`,
  `MenuRow{group,row}`, `MenuSub(u8)`), `NodeState` (5), `NodePayload` (5).
- **Single ordered pass** — `reduce`: optional dock(+blob), **exactly one** bar
  (+blob), menu → blob FIRST (chrome only) → `MenuPanel` → one `MenuRow` per
  hittable row (separators/disabled skipped).
- **Blob as a managed node** — rect = `element.inflate(DEFAULT_EDGE_MARGIN=6)`,
  derived in the same pass, `payload = Blob{ backs }`; `PerfTier` picks the
  rasterizer (`Sdf`→extruded / `Static`→rounded-rect), never toggles the node.
- **Engine-owned layers** — z from `blob.in/tokens.json` `shell.layer.*`:
  background 0 · wallpaper 50 · **blob 100** · dock 150 · bar 200 · sidebar 250 ·
  **menu 300 · menu_row 305** · menu_sub 310 · osd 350 · notification 380 ·
  launcher 390 · overlay 400 · modal 420 · screen_corner 450.
- **Input/hit** — `input_region`/`hit` over live **interactive** nodes; blobs,
  background, wallpaper, screen-corners excluded (`NodeKind::is_interactive`).
- **Menu taxonomy** — 23 `MenuStyle`s; chrome (blob-backed) = `list, brand,
  trayaudio, traynetwork, traybluetooth, traypower, trayunified`; the other 16
  are bespoke/self-surfaced. `RowKind` = item/radio/toggle/slider/tile/radial/separator.
- **Tokens** — `TokenBundle{ surface, border, border_px, radius, opacity,
  motion_ms }` from the dark-neo palette; `menu_radius`/`blob_radius` 12,
  `bar_radius` 14, `motion base` 240 ms; density metrics (Mouse 280/28/22/4/8).
- **Golden fixture** — `scenes/menu-vertical.json` is real-serde `Scene` JSON
  (`Scene::from_json`-loadable) for `reduce(List, Mouse, Sdf, anchor (500,400))`
  with 3 item rows; panel `(488,388,280,92)`, blob `(482,382,292,104)`, 3 rows.

## Deliberate deltas (Central's inspector vs. the crate)

The Engine section was upgraded to mirror the crate's model directly, so most
earlier gaps are closed. What remains are simplifications in the **live HTML
inspector**, never in the port data:

- **Menu styles** — ✅ closed. Central's Engine picker now lists all **23**
  styles, grouped exactly as the crate: 7 chrome (`list, brand, trayaudio,
  traynetwork, traybluetooth, traypower, trayunified`) + 16 bespoke. Selecting
  any one recomposes the scene; chrome emits the blob, bespoke do not.
- **MenuRow nodes** — ✅ closed. `composeCore` emits one `MenuRow` node (z305)
  per hittable row beside the `MenuPanel`, and a live `hitTest(x,y)` (Scene::hit)
  readout proves `row > panel > blob(excluded)`. Row *count* differs from the
  golden fixture (see below), but they are now first-class hittable nodes.
- **z bands** — ✅ closed for the Engine model. `composeCore` uses the canonical
  token z (blob 100 · dock 150 · bar 200 · menu 300 · menu_row 305 · sub 310)
  and `DEFAULT_EDGE_MARGIN = 6`. (The *other* inspector — the broad left
  scene-graph tab for all 14 surfaces — still uses its own compact display
  bands for the 1280×800 stage; ordering and invariants match, only the
  printed numbers differ.)
- **Bespoke rendering** — the compositor draws bespoke styles as **family
  representatives** (panel-card vs. radial ring), not 16 pixel-distinct layouts.
  The *scene model* (backed flag, kind, MenuRow nodes, z) is faithful for all
  23; only the on-screen affordance is a stand-in. The visible chrome-vs-bespoke
  difference is precisely the blob membrane — the thesis, shown literally.
- **Sample row set** — Central composes 6 illustrative rows (New, Open terminal,
  Change wallpaper, Display settings, Inspect surface, About); the golden
  fixture uses 3. Both are valid `reduce` inputs — row count is data, not model.
- **Coordinate space** — Central composes at 1280×800 (preview stage); fixtures
  use 1920×1080. `reduce` is screen-agnostic, so both are valid inputs.

## Input · cursor focus + click intent

New in both Central and the port: the input layer, modelled as
**rapport = (cursor_pos + cursor_focus_data_node) × {click-awareness,
click-away, click-select, click-unfocus}**.

- **Central** — the monitor hot-tracks the pointer (`onStageMove` → `Scene::hit`
  over `liveHitNodes`), draws a dashed hot-track ring + a solid focus ring, and
  classifies every press (`onStageDown`) into exactly one intent. The Engine
  section renders the live cursor/focus readout and the 2×4 intent matrix; the
  Behaviours checkup gains a `input` group (click-awareness/away/select/unfocus).
- **Port** — `compose_core.rs` adds `CursorState`, `ClickIntent`, `Transient`,
  `is_selectable`, `CursorState::track`, and `resolve_click` (pure + total,
  precedence away > select > unfocus > awareness), with 6 `input_tests` and the
  `scenes/input-focus.json` golden fixture (6 cases). Blobs/backings are excluded
  from hit-testing, so the membrane never absorbs a press — the engine owns focus
  and dismissal, no surface toggles a peer.

## Edge-awareness · clamp + flip

Reported bug (real OS + Central): a row's hover/focus outline and the submenu
bridge ran straight **past the panel's right border**, with the submenu hit-
region floating detached off the edge. Reproducible on every surface.

**Diagnosis — deeper, not an offset.** There was no edge-clamp pass: child
affordances and hit/focus rects were placed in absolute coordinates and never
intersected against (a) their parent surface's content box or (b) the screen
work-area. So wherever a surface or its children sat near an edge, the geometry
bled past the border — globally, because the clamp was globally missing.

**Fix — one geometry pass, applied uniformly** (Central + `compose_core.rs`):
- **Children clip to their surface** — `Rect::intersect`; a `MenuRow`'s focus
  ring is clipped to the panel content box, so it can never exceed the border.
- **Transient surfaces clamp to the work-area** — `Rect::clamp_inside(area,
  margin)` *shifts* (never shrinks) a panel that would overflow.
- **Submenu flips at the screen edge** — `submenu_rect(panel, area, size,
  margin) -> (Rect, Side)` flushes to the panel edge and flips Left↔Right at the
  work-area boundary, then clamps vertically. The hit-region and the painted
  submenu share this one rect, so they cannot disagree.
- In Central: `intersectR` / `clampInside` / `workArea` / `subSide` helpers;
  `menuPanelRect` + `subPanelRect` are now edge-aware; the panel render
  (`cmLeftPct`/`cmTopPct`) derives from the clamped rect; focus + selection
  rings are intersected with each node's `clip`. Golden fixture
  `scenes/edge-aware.json`; 6 `edge_tests`.

## Diff / damage · retained-mode reactivity

Aligned Central + port to the crate's `diff.rs`. The loop is
state → `reduce` → new `Scene` → `diff` → targeted host updates; `damage` gives
the dirty region so a motion-only restyle never repaints the whole screen (E5).

- **Was (Central):** `recordCompose` lumped any change into "updated" via a
  JSON-stringify compare — no `Moved`, and damage was an ad-hoc per-frame array.
- **Now (faithful to `diff.rs`):** `diff` reports **Removed** (prev\\next) first,
  then per-next **Added** | **Moved** (rect changed) + **Updated** (state/z/
  tokens/payload changed) — a move + restyle reports **both**. `damage` is the
  union of changed rects (next rect; + prev rect when moved/removed), `ZERO`
  when nothing changed.
- **Central:** `recordCompose` snapshots the composed scene (`snapNodes`) and
  computes the same change set; the Engine → SceneDiff block gains a **Moved**
  row and a live **`damage(prev,next)`** readout (rect + % of screen + the E5
  "région seule, pas de repaint complet" proof). Open a chrome submenu → the
  blob grows (`Moved blob.menu`) while `menu.sub` is `Added`.
- **Port:** `compose_core.rs` implements `NodeChange`/`SceneDiff`/`diff`/`damage`
  with **10 `diff_tests`**; golden fixture `scenes/diff-damage.json` (5 cases).

## Motion · curves, springs, interruption

`motion_core.rs` mirrors `src/motion.rs` (the non-rendering half of the motion
engine) — distinct from `motion.spec.json`, which is the legacy **design**
language (durations/eases/atoms/molecules). The engine motion model:

- `Easing { Linear, EaseOutCubic, EaseInOutCubic, Spring }`; `Spring{ response_ms,
  damping_ratio }` (`soft` = 320 / 0.82). `MotionSpec` default `ease_out(240)`.
- `MotionSample` separates `curve_progress` (springs may overshoot >1.0 for
  scale/position) from `visible_progress` (input/opacity-safe 0..1, inverted on
  close) — the contract Central's preview spring approximates.
- `advance_motion` (Opening→Open, Closing→Hidden), `interrupt_motion` (retarget
  in-flight with no visible jump via `inverse_sample`), reduced-motion snaps to
  terminal (`effective_duration_ms` = 0). 6 tests. **Wired live** into Central's
  Motion section as a **Motion Lab**: Open/Close drives the lifecycle, an easing
  picker (linear/easeOut/easeInOut/spring), live `raw`/`curve`/`visible` bars,
  and **Interrupt** retargets mid-flight showing `visible_progress` preserved.
  Verified: spring open shows `curve 111%` overshoot while `visible` stays 100%
  (clamped); mid-flight interrupt reports `closing → opening · pas de saut`.
  (`anim.rs` — the thin linear compat shim over `motion.rs` — is mirrored only
  in spirit by Central's per-surface spring driver; not a separate port file.)

### Menu lifecycle wired onto the motion engine

The **context menu** is now driven by the motion engine instead of the physical
spring: `cm.p` IS `advance_motion`'s `visible_progress` (easeOut 220 ms), and
`openK('cmenu', …)` retargets an in-flight transition via `interrupt_motion` —
so **closing mid-open reverses smoothly** (no restart) and reopening mid-close
does likewise. Each interrupt logs `Motion{ menu interrupt → … } no-jump`; the
Engine section shows a live `menu lifecycle: <state> · interrupts N` line and a
`Menu lifecycle` behaviour row. The other surfaces keep the physical spring
solver (velocity-carrying, also interruption-smooth) — both approaches coexist.

## Render · backend abstraction (E6 / M5)

`render_core.rs` mirrors `src/render.rs`: a host holds a `Renderer` and never
embeds a rasterizer, so **swapping a backend changes nothing** about
`ComposeInput`, `Scene`, ids, tokens, input regions, or motion — the E6 exit
criterion. The renderer is a pure consumer: it paints what `reduce` produced.

- `RenderFrame { scene, diff, damage, motion }` bundles a frame's inputs so a
  new input is additive, not a breaking signature change. `trait Renderer {
  type Target; render(&mut self, frame, target); }`.
- Illustrative `RecordingRenderer → DrawList[DrawCmd::RoundedRect]` shows the
  consumption pattern (real backends bring tiny-skia / wgpu, host-side): one
  primitive per live node, back-to-front by z (blob 100 < bar 200 < panel 300 <
  row 305), scene unchanged after render. 3 tests; fixture
  `scenes/render-frame.json`. With this, every core crate module
  (compose · menu · layout · tokens · diff · motion · render) is mirrored;
  `anim.rs` is the only one folded in by reference rather than file.

## Hosts · gnuin-compose-host (sctk / tiny-skia)

With the engine fully mirrored, the port now reaches the **host** — the thin
Operator-built shell that ticks the engine and does the Wayland work. Two
Wayland-free host modules are mirrored (both unit-tested in sandbox):

- **`host_motion_driver.rs`** (← `src/motion_driver.rs`) — `MotionDriver{ open,
  dismiss, tick(dt), sample, is_animating, set_reduced_motion }`, the per-surface
  frame-tick adoption of the engine motion: `open`/`dismiss` retarget via
  `interrupt_motion` (dismiss mid-open never jumps), `tick` settles
  Opening→Open / Closing→Hidden. **This is exactly what Central wires onto its
  context menu** (`cmMotion` + `advanceCmMotion` + `openK` interrupt; `cm.p` IS
  `sample().visible_progress`). 5 tests.
- **`host_menu_state.rs`** (← `src/menu_state.rs`) — the pure overlay lifecycle
  state machine enforcing **at-most-one surface**: `open` replaces (never
  accumulates, reports `previous_surface_torn_down`), `configure` promotes
  pending→current and is a no-op after dismiss (no stale-configure resurrection),
  `dismiss` zeros every field, `on_hit` maps `MenuRow→Action` /
  `MenuPanel|Blob→KeepOpen` / `None→Dismiss` (the same mapping as Central's
  input-model click intents), and `surface_action` decides Reuse (same output)
  vs Recreate. 8 tests covering the three bug classes (double / stuck / stale).
- **`host_protocol.rs`** (← `src/protocol.rs`) — the legacy UI/Rust IPC wire:
  newline-delimited JSON over a Unix socket. `HostMessage{ Open{request,screen} |
  Close }` (client→host), `HostEvent{ Action{id} }` (host→client), and a versioned
  `Envelope{ version, #[flatten] message }` whose unknown versions are *detected*
  (`is_supported`) rather than mis-parsed. Canonical wire frames (the
  cross-language contract legacy UI must match) are pinned in
  `scenes/wire-protocol.json`. **Transitional only** — this bridge exists for the
  per-surface bridge cutover; the destination is **bridge-free and in-process** (the
  host links `gnuin_compose_core` directly and bypasses the socket entirely, per
  the module's own doc). Central reflects this: the inspector's "host wire"
  readout is labelled *legacy · pre-cutover*, and reads *in-process* when idle.

Still host-side and not yet mirrored: `scene_builder.rs` (glue), `render.rs`
(tiny-skia paint of the trait from `render_core.rs`), and `main.rs` (the
calloop/Wayland event loop — the only display-coupled file). These are the
next host slices.


## Test coverage (in-crate, in-sandbox)

`gnuin-compose-core` carries the load-bearing invariants as unit tests:
chrome-emits-blob / bespoke-emits-none, `blob.rect == panel.inflate(6)`,
exactly-one-bar, exactly-one-panel & ≤1 menu-blob across all styles,
`input_region` excludes blobs, `hit` at a row centre returns `MenuRow`,
panel height scales with row count, wallpaper re-decode is visible to `diff`,
layer bands strictly increasing, MenuStyle/RowKind string round-trips,
single-mascot + exclusive-radio normalization, and serde round-trips.
`compose_core.rs` adds matching `parity_tests` so the mirror can't silently drift.


## Frontier #2 — Compositor Profile (`compositor_profile.rs`)

Mirrors `ShellSettingsService.hyprlandPlugin*` (Appearance settings page). A **profile is a
preset** that `resolve()`s a `(FocusFeedback, EdgeGestures, CaptureProvider)` triple;
individual candidates may then **override** it (`is_override()` flags divergence).
Non-stable profiles/candidates require `experimental` — otherwise the setter returns
`Err(Diagnostic)` and the value is **unchanged** (never silently applied), exactly like
Central's Compositor section + the taskbar unknown-id pattern. Turning `experimental`
off **clamps** a non-stable profile back to stable. **Portal health is derived**
(`portal_health()`): `hyprcapture` needs `experimental` (else `dependency-failed`),
`builtin` needs no portal. 9 tests. Central ties: `setCompProfile`/`_setCompCandidate`
+ the experimental-gate diagnostic + derived `portalHealth`; **focus feedback is wired
to visible window rendering** (`hyprfocus` dims unfocused, `borders-plus-plus` thickens
the focused border, `official-focus` accents it) and **edge gestures** light the
compositor's left/bottom zones (`EdgeGestures::edges()`). Golden states in
`scenes/compositor-profile.json`. Note: this is net-new design harvested from the
legacy backend's *ideas* (no in-crate module yet) — the port file is the proposed
target, not a mirror of existing crate source.


## Frontier #4 — Panel Family (`panel_family.rs`)

Mirrors `ShellSettingsService.shellMode` (group `panel_family`, `options_ref:
shellModeFamilies` — backend ships the list dynamically). `ShellMode` (glass/solid/
outline/soft) `resolve()`s one `PanelTreatment { fill, blur_px, border_px,
border_rgb, radius_px, elevation }` that every panel node reads — no panel
hard-codes its look. Central ties: `setShellMode` + the `fam*` tokens threaded live
into the sidebar + launcher (and a 4-swatch preview in General); also a host tweak
(`shellMode` prop). `is_translucent()`/`wants_blur()` tell the host whether a
backdrop pass is needed. 6 tests; golden treatments in `scenes/panel-family.json`.
Net-new design harvested from the legacy family concept (no in-crate module yet).


## Reconciliation — motion ladder (engine vs ui_kit)

`motion.spec.json` now pins the **two-layer** motion model explicitly. The **engine
layer** is `blob.in/tokens.json` v0.14.0 (authoritative single source of truth:
6 durations `90/160/240/380/560/4200`, 4 eases `enter/exit/inout/bloom`, 3 springs),
mirrored verbatim into `engine_tokens_authoritative`. The **ui_kit layer** (this file,
motion-spec v0.4.0, legacy) is the finer menu/chrome atom-molecule vocabulary
(9 durations, 8 eases) built on top, marked `tokens._layer`. The **3 springs are
IDENTICAL** across both (`settle 170/22 · snap 260/24 · wobbly 200/12`) — the
reconciliation anchor; durations/eases differ **by design** (engine coarse vs ui_kit
fine), and a `reconciliation` block records the authority (blob.in wins conflicts).
No regeneration needed — the layers are complementary, not in conflict.


## Frontier #5 — Settings pages (`settings_pages.rs`)

Scaffolds the 4 GnuSettingsApp pages Central hadn't covered — **Displays · Input ·
Services · Developer** — completing the real 8-page app (Appearance/Shell/Surfaces/
Gnosis already map to General/Taskbar/Compositor+Dock/Sidebar). Typed structs:
`DisplaySettings` (scale clamps 1–2), `InputSettings`, `ServiceStatus`
(`derive_portal` reuses the compositor capture+experimental rule — identical to
`compositor_profile.rs`), `DeveloperSettings`. Central renders all 4 from one generic
template (`appPageControls`: toggle/select/slider/status), and the Developer page's
scene-inspector + experimental-flags toggles are wired to live engine state
(`showDamage`, `compositor.experimental`). 5 tests; `scenes/settings-pages.json`.
