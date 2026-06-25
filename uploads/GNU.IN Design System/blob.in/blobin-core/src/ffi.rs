//! ffi.rs — the single hot frontier between blobin-core (Rust) and
//! blobin-qt (C++). Q6: this is the *`cxx` brut* side — flat buffers, zero
//! QObject. The reactive surface (QML props, tweaks) goes through cxx-qt in
//! blobin-qt and calls these same plain functions underneath.
//!
//! Contract, per dirty frame:
//!   C++ → Rust:  set_state · set_size · set_tolerance · tick
//!   Rust → C++:  vertices() · indices() · material_params()  (borrowed, copied)
//!
//! `Vertex` and `MaterialParams` are `#[repr(C)]`; the C++ side reinterprets
//! the vertex slice straight into a QSGGeometry buffer. One memcpy, no
//! per-vertex marshalling.

#[cxx::bridge(namespace = "blobin")]
pub mod ffi {
    /// Mirror of `tessellate::Vertex`. MUST stay layout-identical.
    #[derive(Clone, Copy)]
    struct FfiVertex {
        x: f32,
        y: f32,
        u: f32,
        v: f32,
        r: f32,
        g: f32,
        b: f32,
        a: f32,
    }

    /// Mirror of `material::MaterialParams`.
    #[derive(Clone, Copy)]
    struct FfiMaterial {
        inner: [f32; 4],
        outer: [f32; 4],
        center: [f32; 2],
        noise: f32,
        opacity: f32,
        has_gradient: u32,
    }

    /// Mascot states, FFI-safe enum.
    #[repr(u8)]
    enum FfiState {
        Idle = 0,
        Listening = 1,
        Transmit = 2,
        Veille = 3,
    }

    extern "Rust" {
        type EngineHandle;

        /// Construct one engine per BlobInItem.
        fn engine_new() -> Box<EngineHandle>;

        /// Inputs (cold-ish; called on user/system events).
        fn set_state(self: &mut EngineHandle, state: FfiState);
        fn set_size(self: &mut EngineHandle, px_per_unit: f32);
        fn set_tolerance(self: &mut EngineHandle, tol: f32);

        /// Hot path: advance, returns true if a repaint (mesh upload) is due.
        fn tick(self: &mut EngineHandle, dt: f32) -> bool;

        /// True when the host may throttle repaint cadence (mascot settled).
        fn is_cold(self: &EngineHandle) -> bool;

        /// Borrow the current buffers. Valid until the next `tick`/`set_*`.
        /// The C++ side copies them into the scene-graph node immediately.
        fn vertices(self: &EngineHandle) -> &[FfiVertex];
        fn indices(self: &EngineHandle) -> &[u16];
        fn material(self: &EngineHandle) -> FfiMaterial;

        // ── P4: scheduler (dedicated solver pool, Q2) ──
        // For a scene with several blobs, the host owns ONE SchedulerHandle and
        // batch-ticks off the Qt thread. `engine_*` above stays for single-blob
        // items; the scheduler is the multi-blob fast path.
        type SchedulerHandle;

        fn scheduler_new() -> Box<SchedulerHandle>;
        /// Register an engine, returns its id.
        fn add(self: &mut SchedulerHandle) -> u32;
        fn remove(self: &mut SchedulerHandle, id: u32);
        fn set_engine_state(self: &mut SchedulerHandle, id: u32, state: FfiState);
        fn set_engine_size(self: &mut SchedulerHandle, id: u32, px_per_unit: f32);
        /// Advance all engines; returns ids whose mesh changed (sorted).
        fn tick_all(self: &mut SchedulerHandle, dt: f32) -> Vec<u32>;
        fn all_cold(self: &SchedulerHandle) -> bool;
        fn active(self: &SchedulerHandle) -> usize;
        /// Per-engine buffers, valid until the next `tick_all`/`set_*`.
        fn vertices_of(self: &SchedulerHandle, id: u32) -> &[FfiVertex];
        fn indices_of(self: &SchedulerHandle, id: u32) -> &[u16];
        fn material_of(self: &SchedulerHandle, id: u32) -> FfiMaterial;

        // ── P4: backend selection (BLOBIN_BACKEND=rust|cpp) ──
        /// "rust" (default) or "cpp" (fallback / parity oracle). Read once at
        /// item construction by blobin-qt to route rendering.
        fn backend_from_env() -> String;

        // ── M.12: BubbleBloom — the signature ★ radial recipe (R.04) ──
        // A hub + N leaf bubbles that bloom outward on a ring, spring-staggered,
        // thread-connected. One handle per radial menu instance.
        type BloomHandle;

        /// `n` bubbles, ring radius + bubble size in logical units, `stagger`
        /// seconds between each bubble's bloom start.
        fn bloom_new(n: u32, ring: f32, bubble_size: f32, stagger: f32) -> Box<BloomHandle>;
        fn bloom_set_size(self: &mut BloomHandle, px_per_unit: f32);
        fn bloom_open(self: &mut BloomHandle);
        fn bloom_close(self: &mut BloomHandle);
        fn bloom_tick(self: &mut BloomHandle, dt: f32) -> bool;
        fn bloom_is_cold(self: &BloomHandle) -> bool;
        fn bloom_vertices(self: &BloomHandle) -> &[FfiVertex];
        fn bloom_indices(self: &BloomHandle) -> &[u16];
    }
}

use crate::engine::Engine;
use crate::material::MaterialParams;
use crate::pool::{EngineId, Scheduler};
use crate::state::MascotState;
use crate::tessellate::Vertex;
use ffi::{FfiMaterial, FfiState, FfiVertex};

/// Opaque handle the C++ side owns as `Box<EngineHandle>`.
pub struct EngineHandle {
    engine: Engine,
    /// Scratch buffer of FFI vertices, kept so we return a stable borrow
    /// without reallocating every frame.
    ffi_verts: Vec<FfiVertex>,
}

fn engine_new() -> Box<EngineHandle> {
    Box::new(EngineHandle { engine: Engine::new(), ffi_verts: Vec::new() })
}

impl EngineHandle {
    fn set_state(&mut self, state: FfiState) {
        self.engine.set_state(map_state(state));
    }

    fn set_size(&mut self, px_per_unit: f32) {
        self.engine.set_size(px_per_unit);
    }

    fn set_tolerance(&mut self, tol: f32) {
        self.engine.set_tolerance(tol);
    }

    fn tick(&mut self, dt: f32) -> bool {
        let repaint = self.engine.tick(dt);
        if repaint {
            // Refresh the FFI scratch view (Vertex is repr(C)-identical to
            // FfiVertex, but we keep an explicit copy so the borrow lifetime
            // is owned by the handle, not the engine's internal mesh).
            self.ffi_verts.clear();
            self.ffi_verts.extend(self.engine.vertices().iter().map(conv_vertex));
        }
        repaint
    }

    fn is_cold(&self) -> bool {
        self.engine.is_cold()
    }

    fn vertices(&self) -> &[FfiVertex] {
        &self.ffi_verts
    }

    fn indices(&self) -> &[u16] {
        self.engine.indices()
    }

    fn material(&self) -> FfiMaterial {
        conv_material(self.engine.material_params())
    }
}

#[inline]
fn conv_vertex(v: &Vertex) -> FfiVertex {
    FfiVertex { x: v.x, y: v.y, u: v.u, v: v.v, r: v.r, g: v.g, b: v.b, a: v.a }
}

#[inline]
fn conv_material(p: MaterialParams) -> FfiMaterial {
    FfiMaterial {
        inner: p.inner,
        outer: p.outer,
        center: p.center,
        noise: p.noise,
        opacity: p.opacity,
        has_gradient: p.has_gradient,
    }
}

#[inline]
fn map_state(s: FfiState) -> MascotState {
    match s {
        FfiState::Listening => MascotState::Listening,
        FfiState::Transmit => MascotState::Transmit,
        FfiState::Veille => MascotState::Veille,
        _ => MascotState::Idle,
    }
}

// ── P4: scheduler handle (dedicated solver pool) ──────────────────────────

/// Owns a `Scheduler` plus a per-engine FFI vertex scratch cache, so each
/// `vertices_of` returns a stable borrow without reallocating every frame.
pub struct SchedulerHandle {
    sched: Scheduler,
    scratch: std::collections::BTreeMap<EngineId, Vec<FfiVertex>>,
}

fn scheduler_new() -> Box<SchedulerHandle> {
    Box::new(SchedulerHandle {
        sched: Scheduler::new(),
        scratch: std::collections::BTreeMap::new(),
    })
}

impl SchedulerHandle {
    fn add(&mut self) -> u32 {
        let id = self.sched.add(Engine::new());
        self.scratch.insert(id, Vec::new());
        id
    }

    fn remove(&mut self, id: u32) {
        self.sched.remove(id);
        self.scratch.remove(&id);
    }

    fn set_engine_state(&mut self, id: u32, state: FfiState) {
        self.sched.set_state(id, map_state(state));
    }

    fn set_engine_size(&mut self, id: u32, px_per_unit: f32) {
        if let Some(e) = self.sched.get_mut(id) {
            e.set_size(px_per_unit);
        }
    }

    fn tick_all(&mut self, dt: f32) -> Vec<u32> {
        let dirty: Vec<u32> = self.sched.tick_all(dt).to_vec();
        // Refresh FFI scratch only for engines that repainted.
        for &id in &dirty {
            if let (Some(e), Some(buf)) = (self.sched.get(id), self.scratch.get_mut(&id)) {
                buf.clear();
                buf.extend(e.vertices().iter().map(conv_vertex));
            }
        }
        dirty
    }

    fn all_cold(&self) -> bool {
        self.sched.all_cold()
    }

    fn active(&self) -> usize {
        self.sched.active()
    }

    fn vertices_of(&self, id: u32) -> &[FfiVertex] {
        self.scratch.get(&id).map(|v| v.as_slice()).unwrap_or(&[])
    }

    fn indices_of(&self, id: u32) -> &[u16] {
        self.sched.get(id).map(|e| e.indices()).unwrap_or(&[])
    }

    fn material_of(&self, id: u32) -> FfiMaterial {
        self.sched
            .get(id)
            .map(|e| conv_material(e.material_params()))
            .unwrap_or(FfiMaterial {
                inner: [0.0; 4],
                outer: [0.0; 4],
                center: [0.5, 0.5],
                noise: 0.0,
                opacity: 1.0,
                has_gradient: 0,
            })
    }
}

// ── P4: backend selection ─────────────────────────────────────────────────

fn backend_from_env() -> String {
    crate::backend::Backend::from_env().as_str().to_string()
}

// ── M.12: BubbleBloom handle ──────────────────────────────────────────────

use crate::bloom::{BubbleBloom, BubbleSpec};

pub struct BloomHandle {
    bloom: BubbleBloom,
    ffi_verts: Vec<FfiVertex>,
}

fn bloom_new(n: u32, ring: f32, bubble_size: f32, stagger: f32) -> Box<BloomHandle> {
    // Default palette: accent leaves around a surface hub. The host can recolour
    // per-instance later; the geometry contract is what matters across the FFI.
    let specs: Vec<BubbleSpec> = (0..n.max(1))
        .map(|_| BubbleSpec { size: bubble_size, color: [1.0, 0.416, 0.0, 1.0] })
        .collect();
    let bloom = BubbleBloom::new(0.5, [0.968, 0.953, 0.929, 1.0], ring, &specs, stagger);
    Box::new(BloomHandle { bloom, ffi_verts: Vec::new() })
}

impl BloomHandle {
    fn bloom_set_size(&mut self, px_per_unit: f32) {
        self.bloom.set_size(px_per_unit);
    }
    fn bloom_open(&mut self) {
        self.bloom.open();
    }
    fn bloom_close(&mut self) {
        self.bloom.close();
    }
    fn bloom_tick(&mut self, dt: f32) -> bool {
        let repaint = self.bloom.tick(dt);
        if repaint {
            self.ffi_verts.clear();
            self.ffi_verts.extend(self.bloom.vertices().iter().map(conv_vertex));
        }
        repaint
    }
    fn bloom_is_cold(&self) -> bool {
        self.bloom.is_cold()
    }
    fn bloom_vertices(&self) -> &[FfiVertex] {
        &self.ffi_verts
    }
    fn bloom_indices(&self) -> &[u16] {
        self.bloom.indices()
    }
}
