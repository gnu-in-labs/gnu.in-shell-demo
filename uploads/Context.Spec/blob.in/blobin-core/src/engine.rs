//! Engine — owns the live mascot scene; the only thing ffi.rs talks to.
//!
//! One `Engine` per `BlobInItem` on the C++ side. The C++ shim does three
//! things and nothing else:
//!   set_state(id)   — user/system requested a new mascot state
//!   tick(dt)        — advance animation; returns `true` if a repaint is due
//!   mesh()          — hand over the triangle buffer to upload
//!
//! All decisions (which silhouette, how to interpolate, when it's settled)
//! are here. The frontier is crossed once per dirty frame with a flat buffer.

use crate::blob::{Blob, Corners, Inverted, RectBlob, SuperBlob, Wobble};
use crate::group::Group;
use crate::material::Material;
use crate::state::{MascotState, StateMachine};
use crate::tessellate::{fill, Mesh, Quality, Vertex};

pub struct Engine {
    sm: StateMachine,
    /// Continuous wobble phase in turns; advanced by wobble_speed each tick.
    phase: f32,
    /// Logical → device scale (set from item size · dpr).
    pub px_per_unit: f32,
    quality: Quality,
    mesh: Mesh,
    dirty: bool,
    /// Idle frames are still ticked (breathing), but the engine can tell the
    /// host the repaint cadence may drop when fully at rest *and* wobble is
    /// imperceptible — keeping the GPU/C++ path cold.
    idle_frames: u32,
}

impl Engine {
    pub fn new() -> Self {
        Self {
            sm: StateMachine::new(MascotState::Idle),
            phase: 0.0,
            px_per_unit: 48.0,
            quality: Quality::default(),
            mesh: Mesh::default(),
            dirty: true,
            idle_frames: 0,
        }
    }

    pub fn set_state(&mut self, state: MascotState) {
        self.sm.transition(state);
        self.dirty = true;
        self.idle_frames = 0;
    }

    pub fn set_size(&mut self, px_per_unit: f32) {
        if (px_per_unit - self.px_per_unit).abs() > f32::EPSILON {
            self.px_per_unit = px_per_unit.max(1.0);
            self.dirty = true;
        }
    }

    pub fn set_tolerance(&mut self, tol: f32) {
        self.quality.tolerance = tol.max(1e-3);
        self.dirty = true;
    }

    /// Advance by `dt` seconds. Returns true if the mesh changed and the host
    /// should repaint.
    pub fn tick(&mut self, dt: f32) -> bool {
        self.sm.tick(dt);
        self.phase = (self.phase + dt * self.sm.current_wobble_speed()).fract();

        let animating = !self.sm.at_rest();
        let breathing = self.sm.current_wobble_amp() > 1e-3;

        if animating || breathing {
            self.rebuild();
            self.idle_frames = 0;
            self.dirty = true;
        } else {
            self.idle_frames = self.idle_frames.saturating_add(1);
            if self.dirty {
                self.rebuild();
            }
        }
        let was_dirty = self.dirty;
        self.dirty = false;
        was_dirty
    }

    /// Whether the host can safely throttle to a low repaint cadence.
    pub fn is_cold(&self) -> bool {
        self.sm.at_rest() && self.sm.current_wobble_amp() <= 1e-3 && self.idle_frames > 2
    }

    pub fn mesh(&self) -> &Mesh {
        &self.mesh
    }

    pub fn material_params(&self) -> crate::material::MaterialParams {
        self.sm.material.params()
    }

    /// Build the full scene: body (+ inverted eye sockets when applicable),
    /// scaled to device pixels, batched into one mesh.
    fn rebuild(&mut self) {
        self.mesh.clear();
        let s = self.px_per_unit;

        // ── Body ──
        let mut body = SuperBlob::mascot(1.0, 1.15);
        body.n = self.sm.current_n();
        body.wobble = Wobble { amp: self.sm.current_wobble_amp(), lobes: 3.0, phase: 0.0 };
        let body_scale = self.sm.current_scale();
        let mut body_path = body.path(self.phase);
        Group::new(0.0, 0.0)
            .with_scale(s * body_scale, s * body_scale)
            .apply(&mut body_path);
        let body_mesh = fill(&body_path, &self.sm.material, self.quality);
        self.mesh.append(&body_mesh);

        // ── Eyes (idle / listening only) — Inverted sockets cut visual depth.
        if matches!(self.sm.state, MascotState::Idle | MascotState::Listening) {
            let eye = Inverted(RectBlob::new(0.12, 0.12, Corners::uniform(0.06)));
            let dark = Material::solid([0.067, 0.078, 0.094, 1.0]); // near-black
            for dx in [-0.22_f32, 0.22] {
                let mut ep = eye.path(self.phase);
                Group::new(dx * s * body_scale, -0.1 * s * body_scale)
                    .with_scale(s * body_scale, s * body_scale)
                    .apply(&mut ep);
                let em = fill(&ep, &dark, self.quality);
                self.mesh.append(&em);
            }
        }
    }

    /// Raw view of the vertex buffer for the FFI memcpy.
    pub fn vertices(&self) -> &[Vertex] {
        &self.mesh.vertices
    }
    pub fn indices(&self) -> &[u16] {
        &self.mesh.indices
    }
}

impl Default for Engine {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn produces_mesh_on_first_tick() {
        let mut e = Engine::new();
        e.tick(1.0 / 60.0);
        assert!(!e.mesh().is_empty());
        assert_eq!(e.indices().len() % 3, 0);
    }

    #[test]
    fn transition_marks_dirty() {
        let mut e = Engine::new();
        e.tick(1.0 / 60.0); // settle baseline
        e.set_state(MascotState::Transmit);
        let repaint = e.tick(1.0 / 60.0);
        assert!(repaint);
    }

    #[test]
    fn goes_cold_when_settled_and_low_wobble() {
        let mut e = Engine::new();
        e.set_state(MascotState::Veille); // low wobble target
        for _ in 0..600 {
            e.tick(1.0 / 60.0);
        }
        assert!(e.is_cold());
    }
}
