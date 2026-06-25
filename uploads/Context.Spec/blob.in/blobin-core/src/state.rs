//! State — the mascot state machine.
//!
//! Four canonical states (matching the Motion Spec proxy board ∞.6):
//!   Idle · Listening · Transmit · Veille
//!
//! Each state defines a *target* silhouette (superellipse exponent, corner
//! pull, scale, wobble amplitude) and a material. A transition is a set of
//! springs/tweens that the engine ticks; the silhouette is interpolated, so
//! the mascot morphs continuously rather than snapping.

use crate::material::Material;
use crate::solve::Spring;
use crate::tokens::mspring;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum MascotState {
    Idle,
    Listening,
    Transmit,
    Veille,
}

/// The animatable descriptor of a state — every field is a spring target.
#[derive(Clone, Copy, Debug)]
pub struct StateTarget {
    /// Superellipse exponent (roundness).
    pub n: f32,
    /// Uniform scale of the body.
    pub scale: f32,
    /// Wobble amplitude.
    pub wobble_amp: f32,
    /// Wobble speed multiplier (turns/sec).
    pub wobble_speed: f32,
    pub material: Material,
}

impl MascotState {
    pub fn target(self) -> StateTarget {
        match self {
            MascotState::Idle => StateTarget {
                n: 2.6,
                scale: 1.0,
                wobble_amp: 0.035,
                wobble_speed: 0.24, // ~ MDUR.BREATHE pace
                material: Material::solid([0.968, 0.953, 0.929, 1.0]) // #F7F3ED
                    .with_radial(
                        [1.0, 1.0, 1.0, 0.18],
                        [1.0, 1.0, 1.0, 0.0],
                        [0.4, 0.35],
                    )
                    .with_noise(0.04),
            },
            MascotState::Listening => StateTarget {
                n: 2.2,
                scale: 1.06,
                wobble_amp: 0.05,
                wobble_speed: 0.5,
                material: Material::solid([1.0, 0.416, 0.0, 1.0]) // #FF6A00
                    .with_noise(0.06),
            },
            MascotState::Transmit => StateTarget {
                n: 3.0,
                scale: 1.02,
                wobble_amp: 0.08,
                wobble_speed: 0.83,
                material: Material::solid([0.373, 0.498, 0.322, 1.0]), // #5F7F52
            },
            MascotState::Veille => StateTarget {
                n: 2.8,
                scale: 0.88,
                wobble_amp: 0.0, // asleep — perfectly still, so the engine can
                                 // go cold and the host stops requesting frames
                wobble_speed: 0.16,
                material: Material::solid([0.169, 0.188, 0.216, 1.0]) // #2B3037
                    .with_opacity(0.35),
            },
        }
    }
}

/// Live, interpolated mascot. The engine reads `current_*` each frame to build
/// the `SuperBlob` + material, then tessellates.
pub struct StateMachine {
    pub state: MascotState,
    n: Spring,
    scale: Spring,
    wobble_amp: Spring,
    wobble_speed: Spring,
    /// Material is cross-faded discretely toward the target each tick.
    pub material: Material,
    target_material: Material,
    mat_blend: f32,
}

impl StateMachine {
    pub fn new(initial: MascotState) -> Self {
        let t = initial.target();
        Self {
            state: initial,
            n: Spring::new(mspring::SETTLE, t.n),
            scale: Spring::new(mspring::SETTLE, t.scale),
            wobble_amp: Spring::new(mspring::WOBBLY, t.wobble_amp),
            wobble_speed: Spring::new(mspring::SETTLE, t.wobble_speed),
            material: t.material,
            target_material: t.material,
            mat_blend: 1.0,
        }
    }

    /// Request a new state. Springs retarget; material begins cross-fade.
    pub fn transition(&mut self, to: MascotState) {
        if to == self.state {
            return;
        }
        self.state = to;
        let t = to.target();
        self.n.set_target(t.n);
        self.scale.set_target(t.scale);
        self.wobble_amp.set_target(t.wobble_amp);
        self.wobble_speed.set_target(t.wobble_speed);
        self.target_material = t.material;
        self.mat_blend = 0.0;
    }

    /// Advance all channels by `dt` seconds.
    pub fn tick(&mut self, dt: f32) {
        self.n.tick(dt);
        self.scale.tick(dt);
        self.wobble_amp.tick(dt);
        self.wobble_speed.tick(dt);

        // Material blend (snap colour over ~CALM).
        if self.mat_blend < 1.0 {
            self.mat_blend = (self.mat_blend + dt / 0.38).min(1.0);
            self.material = lerp_material(self.material, self.target_material, self.mat_blend);
        }
    }

    pub fn current_n(&self) -> f32 {
        self.n.value
    }
    pub fn current_scale(&self) -> f32 {
        self.scale.value
    }
    pub fn current_wobble_amp(&self) -> f32 {
        self.wobble_amp.value
    }
    pub fn current_wobble_speed(&self) -> f32 {
        self.wobble_speed.value
    }

    /// True when every channel has settled (lets the engine drop to idle
    /// repaint cadence — part of "C++ called as little as possible").
    pub fn at_rest(&self) -> bool {
        self.n.at_rest()
            && self.scale.at_rest()
            && self.wobble_amp.at_rest()
            && self.wobble_speed.at_rest()
            && self.mat_blend >= 1.0
    }
}

fn lerp_material(a: Material, b: Material, t: f32) -> Material {
    let l = |x: [f32; 4], y: [f32; 4]| {
        [
            x[0] + (y[0] - x[0]) * t,
            x[1] + (y[1] - x[1]) * t,
            x[2] + (y[2] - x[2]) * t,
            x[3] + (y[3] - x[3]) * t,
        ]
    };
    Material {
        base: l(a.base, b.base),
        gradient: b.gradient.or(a.gradient),
        noise: a.noise + (b.noise - a.noise) * t,
        opacity: a.opacity + (b.opacity - a.opacity) * t,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn starts_at_rest() {
        let sm = StateMachine::new(MascotState::Idle);
        assert!(sm.at_rest());
    }

    #[test]
    fn transition_disturbs_then_settles() {
        let mut sm = StateMachine::new(MascotState::Idle);
        sm.transition(MascotState::Listening);
        assert!(!sm.at_rest());
        for _ in 0..400 {
            sm.tick(1.0 / 60.0);
        }
        assert!(sm.at_rest());
        assert!((sm.current_scale() - 1.06).abs() < 2e-2);
    }

    #[test]
    fn same_state_is_noop() {
        let mut sm = StateMachine::new(MascotState::Veille);
        sm.transition(MascotState::Veille);
        assert!(sm.at_rest());
    }
}
