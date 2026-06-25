# Composition Engine Spec — GNU.IN reactive surface compositor (menus first)

> Status: draft · 2026-06-17 · Gnosis.Agent
> Scope: a single Rust composition engine that **owns and tokenizes** every
> chrome surface element (context menus, bar, dock, the SDF blob) as composed
> nodes, replacing the current QML model where independent surfaces negotiate
> priority by toggling each other's visibility. Context menus are the **first
> vertical** that proves the engine. The GPUI window layer is Operator-side; the
> in-sandbox deliverable is the framework-free core crate (mirrors
> `gnuin-settings-core`).
>
> Decisions locked with the Operator (2026-06-17): (1) build the composition
> engine, menus first; (2) **spec → core** (this doc, then the crate); (3) keep
> the SDF blob look, but as one engine-managed node — never a surface that
> toggles others.
>
> Planning authority for the expanded visual-engine arc:
> [VISUAL_RUNTIME_ENGINE_WORKPLAN.md](./VISUAL_RUNTIME_ENGINE_WORKPLAN.md).

## 1. Why rebuild — the mutual-exclusion antipattern

Today each chrome surface is its own `PanelWindow`/`Item` that decides, at
runtime, whether it or a *neighbour* gets to paint. Ownership is negotiated by
boolean flags scattered across components:

- `Taskbar.membraneOwnsBar = BarService.visible && SurfaceRegistry.anyMorphingOpenOnScreen(...)`
  — the bar yields its own background/edge-line when a membrane morph is open,
  so the two don't double-paint (tech-debt #3/#5).
- `MembraneHost` blob `visible: sdfMembraneActive && usesMembraneChrome && contextMenuPanelGeometryReady`
  — the blob gates itself on a *geometry-ready* handshake reported by whichever
  panel happens to be mounted (tech-debt #4, the "panneau noir" race).
- `ContextMenuService.usesMembraneChrome` (list/brand/tray*) decides whether a
  menu delegates its background to the shared blob or draws its own — a per-style
  opt-in that, if mis-scoped, leaves the blob painting the *previous* menu.
- Two `PanelWindow`s (`shell.qml` TopbarHost + MembraneHost) structurally able to
  paint the same bar geometry (tech-debt #5, "double surface / double buttons").

The cost: every new element adds another pairwise "who yields to whom" rule.
Bugs are *timing* bugs (a frame where two owners disagree → double-paint, black
panel, flicker). Contracts can pin the rules but can't remove the negotiation.

**The intended model was always the opposite**: one engine that *owns* a set of
elements, resolves their look from tokens, and composes them in a single ordered
pass. Elements never ask "do I have priority?" — the engine decides z-order,
readiness, and paint, once per frame, for all of them together.

## 2. Principles

1. **Single owner.** One compositor owns the full set of chrome nodes for a
   screen. No node reads another node's visibility to decide its own.
2. **Elements are tokenized nodes.** A node is data: kind, geometry, z, state,
   and a resolved *token bundle* (color/radius/opacity/motion). The same node
   model describes a menu panel, the bar, the dock, and the blob.
3. **One composition pass.** State changes produce a new immutable scene; the
   engine diffs and paints. There is no inter-frame "node A waits for node B to
   hide." Readiness is a property the engine evaluates, not a cross-surface
   signal.
4. **Reactivity = state → recompose.** Inputs (settings, perf tier, pointer,
   service state) feed a reducer that yields the scene. Rendering is a pure
   function of the scene. (Same shape as `gnuin-settings-core`: model → view.)
5. **Tokens are authority.** Look is resolved from the design token surface
   (`GnuChrome`/`GnuContextTokens`/`tokens.json`) — nodes hold *resolved* values,
   not ad-hoc literals. This is the "tokenize" half of the ask.
6. **No framework in the core.** The composition core is `gpui`-free and
   `qml`-free: pure Rust + serde, fully unit-testable in-sandbox. GPUI (or sctk)
   is a thin host that mounts the scene, exactly like the Branch-H bar split.

## 3. The model

```
Scene { screen, nodes: [Node], order: ZOrder }       // immutable per frame

Node {
    id: NodeId,                 // stable identity across frames (diff key)
    kind: NodeKind,
    rect: Rect,                 // engine-assigned geometry (no self-anchoring race)
    z: i32,                     // engine-assigned layer (no peer negotiation)
    state: NodeState,           // opening | open | committing | closing | hidden
    tokens: TokenBundle,        // resolved look (color, radius, opacity, motion)
    payload: NodePayload,       // kind-specific (menu groups, bar widgets, …)
}

NodeKind = Bar | MenuPanel | Blob | Dock | Overlay | …
```

Key inversions vs. today:

- **Geometry is engine-assigned, not self-reported.** A menu panel does not
  measure itself and *report* bounds back for a blob to chase; the engine lays
  out the panel and, in the same pass, derives the blob node's rect from it.
  This structurally removes the "panneau noir" geometry handshake — there is no
  window where one node holds another's stale rect.
- **Z-order is engine-owned.** "The blob paints behind chrome" is a property of
  `order`, not a `visible:` flag each surface sets while watching its neighbours.
- **Readiness is a scene property.** A node enters `open` only once its tokens +
  geometry are resolved; the engine never paints a half-ready node. (Replaces the
  `contextMenuPanelGeometryReady` cross-surface gate.)

## 4. Tokenization

The reducer resolves each node's `TokenBundle` from, in priority order:

1. **Design tokens** — the generated `tokens.json` surface (`GnuTheme`/`GnuChrome`
   today): colors, radii, durations, the `font_px` channel, `geometry_px`.
2. **Context vocabulary** — the `GnuContextTokens` precedent (density →
   `panelWidths {mouse:280, comfy:300, touch:320}`, tray/card metrics, spec
   version). Ported into the core as typed token tables.
3. **Runtime state** — perf tier (`sdf|static`, recommended by
   `gnosis-sentinel` from pressure), transparency mode, contrast style,
   reduce-motion.

The bundle is *resolved once* into the node. Renderers read resolved values;
they never branch on raw settings. Adding a new visual axis = adding a token
channel + a reducer rule, not a new cross-component flag.

## 5. The blob as a managed node (SDF kept)

The SDF blob look stays — `engine/blob-uniforms` already ports the std140 UBO
serializer. It becomes a `NodeKind::Blob` the engine emits **behind** chrome
nodes that opt into membrane backing, derived from those nodes' rects in the same
pass:

- The blob node's rect = the union/inflation of the chrome nodes it backs
  (menu panel, bar node, dock node) — computed by the engine, not chased.
- The **perf tier selects the blob node's renderer**, not a QML visibility war:
  `sdf` → SDF-extruded surface (blob-uniforms); `static` → a plain rounded
  rect node with the same rect/tokens. Same scene, different rasterizer.
- The blob never toggles another node. If no chrome node requests backing, the
  engine simply emits no blob node that frame.

This satisfies "garder le blob comme nœud géré parmi d'autres, qui ne toggle
jamais les autres."

## 6. First vertical — context menus

The menu subsystem is the proof-of-engine. It already has a clean data model in
`ContextMenuService` worth porting (not reinventing):

- **Menu model**: groups → rows, with `_normalizeGroups`/`_normalizeSubmenuRows`
  (id, type item|radio|toggle|slider|tile|radial…, submenu nesting, single-mascot
  enforcement, radio-group selection). This becomes pure Rust `MenuModel` with
  tests (the normalization rules are exactly the kind of logic that belongs in
  the framework-free core).
- **Styles**: the 20 registered styles, split into *chrome* (`list`, `brand`,
  `tray*` → membrane-backed) and *bespoke* (radial/bubble/card/window… → self-
  surfaced). In the engine this is just `backed_by_blob: bool` per style — the
  compositor reads it to decide whether to emit a Blob node, removing
  `usesMembraneChrome` as a cross-surface opt-in.
- **Geometry/anchor**: anchor point + density → panel rect, clamped to screen.
  Engine-owned layout replaces the panel→service→blob geometry report loop.
- **Composition**: a menu open produces, in one pass, a `MenuPanel` node (+ a
  `Blob` node behind it iff the style is chrome). Switching menus replaces nodes
  by id; the engine diffs — no `_switchTimer`, no `open=false`→clear→reopen
  dance, no stale-geometry frame.

Structurally retired by this vertical: the "panneau noir" race (#4 remainder),
and the per-style membrane opt-in. The QML menu host can remain until the GPUI
host reaches parity (coexistence, §8).

## 7. Runtime host (Operator-side) + core (in-sandbox)

Mirror the validated split:

- **`gnuin-compose-core`** (new crate, framework-free): node/scene model, token
  tables, the reducer (state → scene), the menu model port, layout, and the
  blob-rect derivation. Pure Rust + serde. **Fully unit-tested in-sandbox** —
  this is the verifiable seam, exactly like `gnuin-settings-core`'s coverage gate.
- **GPUI host** (Operator-side): mounts the scene into a `gpui` window, drives
  the reducer from live input, rasterizes nodes (SDF via blob-uniforms, text,
  rows). No `gpui` dep enters the sandbox; the host is built/validated on the
  Operator's machine. The Branch-H `gnuin-bar` (sctk/tiny-skia/calloop) is the
  precedent for a settings-driven, event-driven Wayland host and can later mount
  the same scene for the bar node.

## 8. Migration & coexistence (no big-bang)

1. Land `gnuin-compose-core` with the menu model + reducer + tests. No runtime
   change; QML keeps rendering menus.
2. Stand up the GPUI host rendering the **context-menu vertical only**, behind a
   selector key (same pattern as `shell.topbar.host = qml|gpui`): add
   `shell.contextmenu.host = qml|gpui`. Default `qml`. Operator flips to `gpui`
   per-screen to reload-validate.
3. Once parity is reached, retire the QML context-menu host + the membrane blob's
   context-menu branch; the bar/dock nodes migrate next, collapsing the
   mutual-exclusion flags (#3/#5) as they move under the single compositor.

Each step is contract-guarded (selector key validated + routable, scene
invariants unit-tested) and reversible via the selector.

## 9. What this retires

- **#4** context-menu geometry race — engine-owned geometry/z removes the
  handshake entirely (not just hardens it).
- **#5 / #3** taskbar double-surface + single-owner bar paint — once the bar is a
  node under one compositor, no second surface can paint it; `membraneOwnsBar`
  disappears.
- The membrane *mutual-exclusion* model generally — replaced by one ordered pass.
- **#7** is already addressed at the QML layer (semantic `GnuIcons` registry);
  the engine inherits the same semantic token tables for bar/menu glyphs.

## 10. Decisions (resolved 2026-06-17)

The Operator asked for the most complete, versatile, resilient, proven options;
resolved as follows:

- **Host runtime → sctk/tiny-skia** (the Branch-H `gnuin-bar` pattern). It is
  already proven on hardware for layer-shell and sidesteps the GPUI-layer-shell
  churn (merged→reverted→re-PR'd upstream, tech-debt #10). The core is host-
  agnostic regardless, so a GPUI host remains possible later without core changes.
- **Scene transport → both, in-process by default.** The default build links the
  core directly (zero deps, simplest, fastest). The optional `serde` feature adds
  `Serialize`/`Deserialize` on the scene graph plus `Scene::to_json`/`from_json`,
  enabling a socket host (the hyprconf/sentinel pattern) without forcing serde on
  the in-process path. Most versatile + resilient: pick per host, no lock-in.
- **Per-screen ownership → one engine, per-screen scenes.** `reduce` takes the
  screen rect and emits that screen's scene; the host runs it per output.
- **Token source of truth → generated tables** (consistent with the codegen
  target). The core currently ports the palette/metrics as consts; wiring to the
  generated token tables directly is a mechanical follow-up, not a blocker.

## 11. Status / next step

**Core landed (in-sandbox), wired into `tools/verify.sh`.**
`engine/gnuin-compose-core` is the priority visual runtime nucleus, not a side
experiment. Shell-native parity depends on this engine owning the affordances
that QML used to provide implicitly:

- **Scene/node model** — `Rect` (with `contains`/`inflate`/`union`/`clamp_inside`),
  `Backed`, `NodeId` (multi-blob: `Blob(Backed)`), `NodeKind`, `NodeState`,
  `TokenBundle`, `Node`, `Scene`, engine-owned `layer` constants.
- **Tokens** — palette ported from `GnuTheme`, density widths from
  `GnuContextTokens`, perf/transparency/contrast axes → resolved `TokenBundle`.
- **Menu model** — `MenuStyle` (chrome-vs-bespoke `backed_by_blob`, 23 styles,
  `FromStr` round-trip), `Row`/`Group`, single-mascot enforcement, exclusive
  radio selection.
- **Layout** — anchor→panel rect, screen clamp, host-measured-content override,
  blob rect derived from the element.
- **Reducer** — `reduce(state)→Scene`, single pass, now composing **menu + bar +
  dock** (versatile multi-element), each optionally membrane-backed by its own
  blob; exactly one bar node (kills the double-surface, #5).
- **Diff** — `diff(prev,next)→SceneDiff` (Added/Removed/Moved/Updated) for
  retained-mode, targeted host updates.
- **Hit-testing & input** — `Scene::hit` (topmost live node) and
  `Scene::input_region` (engine-owned Wayland mask, blobs excluded), replacing the
  per-surface mask/click-away negotiation.
- **Motion engine** — `MotionSpec` + `Easing` + `Spring` +
  `advance_motion(...)` + `interrupt_motion(...)`, owning lifecycle timing,
  reduced-motion, non-linear easing, spring overshoot, and interruption mapping
  without a visible jump. The old linear `advance(...)` remains as a compatibility
  wrapper.
- **Transport** — optional `serde` feature: scene-graph (de)serialization +
  `Scene::to_json`/`from_json`, JSON round-trip tested. Default build is dep-free.

## 12. Priority lock — visual engine before surface polish

As of 2026-06-22, the next arc is not "make each Rust host prettier one by one".
It is to rebuild the missing UI affordances explicitly in the shared engine:

- **Canonical tokens**: generated `tokens.json`/`gnu_theme.rs` must feed
  `TokenBundle` and motion tables directly. The current ported constants are a
  bridge, not the final authority.
- **Retained scene graph**: every shell chrome element must become a node with
  stable identity, bounds, z-order, payload, diff, invalidation, and hit region.
- **Motion**: lifecycle, easing, springs, reduced motion, and interruption rules
  live in `gnuin-compose-core`, with hosts only sampling the frame clock.
- **Backend**: keep the current tiny-skia/sctk backend for simple layer-shell
  surfaces; evaluate wgpu/vello only as a long-term backend under the same scene
  contract.
- **Layer/input contract**: layer-shell role, focus, exclusive-zone,
  pass-through, click-away, and screen routing are host duties driven by the
  engine's scene/input-region output.
- **Visual tests**: every new backend path needs screenshot/golden evidence,
  layer validation, and timing/state tests before it replaces a QML surface.

Wallpaper is a first consumer of this model: per-output/per-workspace wallpaper
state must be cached and diffed, decoded frames must be retained by effective
request key, fallback repaint is allowed only on first load/clear/error, and
crossfade/parallax should be driven by the same motion spec instead of ad hoc
workspace-change reloads.

**Next (Operator-side host).** Build the sctk/tiny-skia host for the context-menu
vertical behind `shell.contextmenu.host = qml|gpui` (default `qml`): run `reduce`
per screen, rasterize nodes (SDF blob via `blob-uniforms`, text/rows via
tiny-skia), apply `diff` between frames, drive `advance` from the frame clock,
feed `hit`/`input_region` to the Wayland surface. Reach parity, reload-validate
per-screen, then retire the QML context-menu host + the membrane blob's
context-menu branch (§8). The bar/dock nodes migrate next, collapsing
`membraneOwnsBar` and the double-surface debts (#3/#5).
