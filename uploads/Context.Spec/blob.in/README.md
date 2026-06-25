# blob.in

Organic-shape engine for **Gnu.In-Shell** (ex-`alaelestia`). Renders the
mascot, radial menus and notification bubbles.

> **4.0 architecture** — the engine is **Rust** (`blobin-core`); Qt/C++
> (`blobin-qt`) is a thin render shim. Geometry, tessellation, spring/easing
> solvers, materials and state are computed in Rust and handed to the Qt
> scene-graph over a `cxx` bridge, once per dirty frame, as a flat buffer.
> See `Motion-Spec-4.0-Plan.md` for the full plan.

```
blob.in/
├─ blobin-core/        Rust — THE engine (~90% of the code)
│  ├─ src/
│  │  ├─ path.rs         cubic-Bézier path primitive
│  │  ├─ blob.rs         `Blob` trait · RectBlob · SuperBlob · Inverted
│  │  ├─ group.rs        affine 2D composition (glam)
│  │  ├─ tessellate.rs   Path → triangle mesh (lyon)
│  │  ├─ tokens.rs       MDUR/MEASE/MSPRING — GENERATED from tokens.json
│  │  ├─ solve.rs        cubic-Bézier easing + mass-spring-damper
│  │  ├─ material.rs     colour · gradient · noise params
│  │  ├─ raster.rs       CPU reference rasterizer (mirror of blob.frag)
│  │  ├─ diff.rs         pixel-diff gate + SSIM signal (Q4)
│  │  ├─ state.rs        idle/listening/transmit/veille machine
│  │  ├─ engine.rs       owns the live scene; builds & batches the mesh
│  │  ├─ bloom.rs        BubbleBloom (M.12) — signature ★ radial recipe
│  │  ├─ pool.rs         multi-engine scheduler · rayon solver pool (Q2)
│  │  ├─ backend.rs      BLOBIN_BACKEND=rust|cpp selection
│  │  └─ ffi.rs          #[cxx::bridge] — the single hot frontier
│  └─ tests/lifecycle.rs full engine exercise, no C++
└─ blobin-qt/         C++ — render shim ("second mini-engine", <300 LoC)
   ├─ src/blobin_item.*      QQuickItem · updatePaintNode → QSGGeometry
   ├─ src/blobin_material.*  QSGMaterial → RHI shader
   ├─ shaders/blob.{vert,frag}   flat + radial gradient + value noise
   └─ qml/MascotView.qml         drop-in harness

tokens.json              single source of truth (motion + colour)
blobin-gen/              tokens.json → tokens.rs (+ QML/C++/Dart)
blobin-golden/           material parity goldens (P3) + pixel/SSIM diff
gen/                     generated theme files (GnuTheme.qml/.h/.dart)
Cargo.toml · justfile    workspace + `just tokens` / `just parity` / …
```

## Material parity (P3)

The material *maths* lives in Rust; the GPU shader is data. To prove they
agree without a GPU, `raster.rs` mirrors `blob.frag` line-for-line, golden
PNGs are produced from it (cross-checked by an independent JS oracle), and the
GPU output is pixel-diffed against them.

```
raster::eval_fragment  ≡  blob.frag  (kept bit-identical)
        │
        ├─ render goldens → blobin-golden/golden/*.png
        └─ compare: pixel_diff (hard gate) + ssim (signal)

just parity    # render via Rust, diff vs committed goldens
just goldens   # UPDATE_GOLDEN=1 — rewrite goldens, review contact sheet
```

Gate: max channel delta ≤ 4, ≤ 1 % pixels over threshold, SSIM ≥ 0.99.

## Solver pool & backend (P4)

A shell shows several blobs at once (mascot + radial bubbles + notif pills).
One `Scheduler` owns them and batch-ticks **off the Qt thread** — in parallel
on a rayon pool with `--features threaded-solver`, sequential without. A fixed
`dt` gives identical output either way, so golden parity holds.

```
host frame:  scheduler.tick_all(dt) → [dirty ids]   # upload only these
             scheduler.all_cold()    → throttle when the scene sleeps

BLOBIN_BACKEND=rust   # default — blobin-core computes everything
BLOBIN_BACKEND=cpp    # fallback / parity oracle (plan §6)
```

"Cold" = an engine settled **and** still (no breathing). Veille sleeps → goes
cold → the host stops requesting frames. Idle/listening/transmit breathe and
stay warm by design (a living mascot is never frozen).

## C++ shim budget

The whole bet is that C++ stays a thin render shim. A guard enforces it:

```
just loc        # counts blobin-qt C++ LoC, fails CI over budget (300)
```

Current: **205 LoC** (item 137 + material 68). Headroom intact.

## The token loop (closed)

`tokens.json` is the only place a duration, easing or spring is written.
`blobin-gen` lowers it to each engine:

```
tokens.json ──blobin-gen──┬──> blobin-core/src/tokens.rs   (solver consts)
                          ├──> gen/GnuTheme.qml             (colours)
                          ├──> gen/gnu_theme.h
                          └──> gen/gnu_theme.dart

just tokens        # regenerate everything
just check-tokens  # CI guard: fails if tokens.rs is stale vs tokens.json
```

The Motion Spec board and `solve.rs` now read the *same* numbers — the spec's
"token" column points at a generated const, not a hand-copied value.

## What's implemented (P0 → P2 of the plan)

- **Geometry** — all five atoms as Rust: `RectBlob` (per-corner Bézier radii),
  `SuperBlob` (superellipse body, Catmull-Rom smoothed, organic wobble),
  `Inverted<B>` (zero-cost hole combinator), `Group` (glam affine).
- **Tessellation** — `lyon` fill, adaptive tolerance (can exceed the old C++
  fixed-segment fidelity for free).
- **Solvers** — Newton-Raphson cubic-Bézier easing + semi-implicit
  mass-spring-damper, sub-stepped for stability. Driven by `tokens.rs`.
- **State** — four mascot states, each a set of spring targets; transitions
  morph the silhouette continuously.
- **Engine** — builds body + inverted eye sockets, batches to one draw call,
  reports `is_cold()` so the host can stop requesting frames when settled.
- **Bridge** — `cxx` flat-buffer FFI; `FfiVertex`/`FfiMaterial` are
  `#[repr(C)]` and memcpy straight into the scene-graph.
- **Qt shim** — real `updatePaintNode`, custom `QSGGeometry` attribute set,
  `QSGMaterial` + RHI `.qsb` shaders.

## Build

```bash
# Rust core + tests (no Qt needed)
cargo test --manifest-path blob.in/blobin-core/Cargo.toml

# Full Qt plugin (needs Qt 6.6 + a Rust toolchain; Corrosion wires cargo)
cmake -S blob.in/blobin-qt -B build -DCMAKE_PREFIX_PATH=$QT_DIR
cmake --build build
```

## Decisions in force (plan §8)

| | |
|---|---|
| Tessellation | `lyon` |
| Solver thread | dedicated Rust pool (`threaded-solver`, wired in P4) |
| RHI | Vulkan/Metal/D3D via Qt RHI · GL legacy fallback |
| Golden tests | pixel image-diff (hard gate) + SSIM (signal) |
| Bridge | `cxx` brut on the hot path · `cxx-qt` on the reactive surface |
| Backend switch | `BLOBIN_BACKEND=rust\|cpp` — C++ is the fallback / parity oracle |

## Reactive bindings (Q6)

The plain `cxx::bridge` in `blobin-core::ffi` keeps direct setter/getter wiring
for hosts that want it. The **idiomatic Qt** path lives in `blobin-cxxqt/` —
two QObjects with `Q_PROPERTY` semantics:

```qml
import blob.in.qml 0.4

Mascot {
    state: shell.listening ? "listening" : "idle"  // bind and forget
    onCooled: console.log("settled")
}
```

`Mascot` exposes `state` · `size` · `tolerance` · `cold` (+ `cooled()` signal).
`Bloom` exposes `open` · `leaves` · `ring` · `stagger` · `bubble_size` · `cold`
(+ `bloomed()` · `retracted()`). Build: `just cxxqt`.

## Not yet (later phases)

- P5 manual sign-off — R7/R8/R9/R10 protocols are committed under `tools/`;
  awaiting reference-box runs + dogfood window (see `readiness.md`)
- per-instance bubble recolouring for BubbleBloom (geometry contract is frozen;
  the host passes a palette — today the FFI uses the default accent leaves)
- wire the `cpp` backend's actual legacy path (today it's the selection + the
  documented fallback contract; the Rust path is what's implemented)
