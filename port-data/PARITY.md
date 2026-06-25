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
- **Demo row set** — Central composes 6 illustrative rows (New, Open terminal,
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

## Test coverage (in-crate, in-sandbox)

`gnuin-compose-core` carries the load-bearing invariants as unit tests:
chrome-emits-blob / bespoke-emits-none, `blob.rect == panel.inflate(6)`,
exactly-one-bar, exactly-one-panel & ≤1 menu-blob across all styles,
`input_region` excludes blobs, `hit` at a row centre returns `MenuRow`,
panel height scales with row count, wallpaper re-decode is visible to `diff`,
layer bands strictly increasing, MenuStyle/RowKind string round-trips,
single-mascot + exclusive-radio normalization, and serde round-trips.
`compose_core.rs` adds matching `parity_tests` so the mirror can't silently drift.
