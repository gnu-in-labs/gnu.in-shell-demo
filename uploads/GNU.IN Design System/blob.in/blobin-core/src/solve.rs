//! Solve — spring and easing solvers (the heart of reactivity).
//!
//! In v3.1 the animation logic lived on the Qt main-thread in C++. Here it is
//! pure Rust and (with `threaded-solver`, Q2) can run on a dedicated pool, so
//! the Qt thread does nothing but upload. Solvers are stateless math + a tiny
//! per-channel state struct; `engine` owns the state and ticks it.

use crate::tokens::{Ease, SpringToken};

// ── Easing ────────────────────────────────────────────────────────────────

/// Evaluate a cubic-Bézier timing function at progress `x ∈ [0,1]`.
/// Newton-Raphson on the x-curve to find the parameter, then read y.
pub fn ease(e: Ease, x: f32) -> f32 {
    let x = x.clamp(0.0, 1.0);
    if x <= 0.0 {
        return 0.0;
    }
    if x >= 1.0 {
        return 1.0;
    }
    // Bézier with implicit p0=(0,0), p3=(1,1).
    let cx = 3.0 * e.p1x;
    let bx = 3.0 * (e.p2x - e.p1x) - cx;
    let ax = 1.0 - cx - bx;
    let cy = 3.0 * e.p1y;
    let by = 3.0 * (e.p2y - e.p1y) - cy;
    let ay = 1.0 - cy - by;

    let sample_x = |t: f32| ((ax * t + bx) * t + cx) * t;
    let sample_dx = |t: f32| (3.0 * ax * t + 2.0 * bx) * t + cx;

    // Solve sample_x(t) = x.
    let mut t = x;
    for _ in 0..8 {
        let d = sample_x(t) - x;
        if d.abs() < 1e-5 {
            break;
        }
        let dx = sample_dx(t);
        if dx.abs() < 1e-6 {
            break;
        }
        t -= d / dx;
        t = t.clamp(0.0, 1.0);
    }
    ((ay * t + by) * t + cy) * t
}

/// A one-shot eased tween between two scalars over a fixed duration.
#[derive(Clone, Copy, Debug)]
pub struct Tween {
    pub from: f32,
    pub to: f32,
    pub dur_s: f32,
    pub ease: Ease,
    pub elapsed: f32,
}

impl Tween {
    pub fn new(from: f32, to: f32, dur_s: f32, ease: Ease) -> Self {
        Self { from, to, dur_s, ease, elapsed: 0.0 }
    }

    /// Advance by `dt` seconds; returns current value.
    pub fn tick(&mut self, dt: f32) -> f32 {
        self.elapsed = (self.elapsed + dt).min(self.dur_s);
        let p = if self.dur_s <= 0.0 { 1.0 } else { self.elapsed / self.dur_s };
        self.from + (self.to - self.from) * ease(self.ease, p)
    }

    pub fn done(&self) -> bool {
        self.elapsed >= self.dur_s
    }
}

// ── Spring ──────────────────────────────────────────────────────────────

/// A critically-tunable mass-spring-damper, integrated semi-implicitly
/// (stable at large dt, unlike explicit Euler). One per animated channel.
#[derive(Clone, Copy, Debug)]
pub struct Spring {
    pub stiffness: f32,
    pub damping: f32,
    pub mass: f32,
    pub value: f32,
    pub target: f32,
    pub velocity: f32,
}

impl Spring {
    pub fn new(token: SpringToken, start: f32) -> Self {
        Self {
            stiffness: token.stiffness,
            damping: token.damping,
            mass: token.mass.max(1e-3),
            value: start,
            target: start,
            velocity: 0.0,
        }
    }

    #[inline]
    pub fn set_target(&mut self, target: f32) {
        self.target = target;
    }

    /// Semi-implicit (symplectic) Euler step. Sub-steps long frames so a
    /// hitch never destabilizes the spring.
    pub fn tick(&mut self, dt: f32) -> f32 {
        let steps = (dt / (1.0 / 240.0)).ceil().max(1.0) as u32;
        let h = dt / steps as f32;
        for _ in 0..steps {
            let f = -self.stiffness * (self.value - self.target) - self.damping * self.velocity;
            let a = f / self.mass;
            self.velocity += a * h;
            self.value += self.velocity * h;
        }
        self.value
    }

    /// Settled when both displacement and velocity are negligible.
    pub fn at_rest(&self) -> bool {
        (self.value - self.target).abs() < 1e-3 && self.velocity.abs() < 1e-3
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::tokens::{mease, mspring};

    #[test]
    fn ease_endpoints() {
        assert!((ease(mease::ENTER, 0.0) - 0.0).abs() < 1e-6);
        assert!((ease(mease::ENTER, 1.0) - 1.0).abs() < 1e-6);
    }

    #[test]
    fn ease_monotone_enter() {
        let mut prev = -1.0;
        for i in 0..=10 {
            let y = ease(mease::ENTER, i as f32 / 10.0);
            assert!(y >= prev - 1e-4);
            prev = y;
        }
    }

    #[test]
    fn spring_converges() {
        let mut s = Spring::new(mspring::SETTLE, 0.0);
        s.set_target(1.0);
        for _ in 0..240 {
            s.tick(1.0 / 60.0);
        }
        assert!(s.at_rest(), "value={} vel={}", s.value, s.velocity);
        assert!((s.value - 1.0).abs() < 1e-2);
    }

    #[test]
    fn tween_reaches_target() {
        let mut t = Tween::new(0.0, 10.0, 0.24, mease::INOUT);
        for _ in 0..20 {
            t.tick(0.016);
        }
        assert!(t.done());
        assert!((t.tick(0.0) - 10.0).abs() < 1e-3);
    }
}
