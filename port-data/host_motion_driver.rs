// gnuin-compose-host :: motion_driver — PORT PARITY MIRROR (not the source of truth)
// ============================================================================
// Faithful mirror of gnu.in-os/engine/gnuin-compose-host/src/motion_driver.rs.
//
// The per-surface motion driver — the host's frame-tick adoption of the engine's
// motion engine (Phase 1 / E3). The engine owns the motion MATH (advance_motion,
// interrupt_motion in motion_core.rs); this driver is the thin host-side state a
// frame timer ticks. It tracks one transition's (state, elapsed) and:
//   - open()/dismiss() retarget toward Opening/Closing via interrupt_motion, so a
//     dismiss landed mid-open never jumps;
//   - tick(dt) advances time and settles Opening→Open / Closing→Hidden;
//   - sample() yields the current MotionSample the host feeds into a RenderFrame;
//   - is_animating() tells the loop to keep requesting frames.
//
// This is EXACTLY the model Central wires onto its context menu (cmMotion +
// advanceCmMotion + openK interrupt): cm.p IS sample().visible_progress.

use crate::motion::{advance_motion, interrupt_motion, MotionSample, MotionSpec};
use crate::NodeState;

/// Drives one surface's open/close transition off the host frame clock.
#[derive(Debug, Clone)]
pub struct MotionDriver {
    state: NodeState,
    elapsed_ms: u32,
    spec: MotionSpec,
}

impl MotionDriver {
    pub fn new(spec: MotionSpec) -> Self {
        MotionDriver { state: NodeState::Hidden, elapsed_ms: 0, spec }
    }

    /// Honour `shell.motion.reduced_motion` — collapse transitions to instant.
    pub fn set_reduced_motion(&mut self, reduced: bool) {
        self.spec = self.spec.with_reduced_motion(reduced);
    }

    /// Begin (or retarget toward) an open, preserving current visible progress.
    pub fn open(&mut self) { self.retarget(NodeState::Opening); }
    /// Begin (or retarget toward) a dismiss, preserving current visible progress.
    pub fn dismiss(&mut self) { self.retarget(NodeState::Closing); }

    fn retarget(&mut self, target: NodeState) {
        let current = advance_motion(self.state, self.elapsed_ms, self.spec);
        let it = interrupt_motion(current, target, self.spec);
        self.state = it.state;
        self.elapsed_ms = it.elapsed_ms;
    }

    /// Advance by `dt_ms`, settling at the terminal (Opening→Open, Closing→Hidden).
    pub fn tick(&mut self, dt_ms: u32) -> MotionSample {
        self.elapsed_ms = self.elapsed_ms.saturating_add(dt_ms);
        let sample = advance_motion(self.state, self.elapsed_ms, self.spec);
        self.state = sample.state;
        sample
    }

    /// The current sample without advancing time (for a non-tick repaint).
    pub fn sample(&self) -> MotionSample {
        advance_motion(self.state, self.elapsed_ms, self.spec)
    }

    pub fn state(&self) -> NodeState { self.state }

    /// Whether a transition is in flight — the host keeps requesting frames while true.
    pub fn is_animating(&self) -> bool {
        matches!(self.state, NodeState::Opening | NodeState::Closing)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    fn spec() -> MotionSpec { MotionSpec::ease_out(200) }

    #[test] fn starts_hidden_and_idle() {
        let d = MotionDriver::new(spec());
        assert_eq!(d.state(), NodeState::Hidden);
        assert!(!d.is_animating());
        assert_eq!(d.sample().visible_progress, 0.0);
    }
    #[test] fn open_then_tick_to_completion_settles_open() {
        let mut d = MotionDriver::new(spec());
        d.open();
        assert!(d.is_animating());
        let mid = d.tick(100);
        assert_eq!(mid.state, NodeState::Opening);
        assert!(mid.visible_progress > 0.0 && mid.visible_progress < 1.0);
        let end = d.tick(200);
        assert_eq!(end.state, NodeState::Open);
        assert_eq!(end.visible_progress, 1.0);
        assert!(!d.is_animating());
    }
    #[test] fn dismiss_from_open_settles_hidden() {
        let mut d = MotionDriver::new(spec());
        d.open(); d.tick(300);
        d.dismiss();
        assert!(d.is_animating());
        let end = d.tick(300);
        assert_eq!(end.state, NodeState::Hidden);
        assert_eq!(end.visible_progress, 0.0);
    }
    #[test] fn reduced_motion_settles_instantly() {
        let mut d = MotionDriver::new(spec());
        d.set_reduced_motion(true);
        d.open();
        let s = d.tick(1);
        assert_eq!(s.state, NodeState::Open);
        assert_eq!(s.visible_progress, 1.0);
        assert!(!d.is_animating());
    }
    #[test] fn dismiss_mid_open_does_not_jump_visible_progress() {
        let mut d = MotionDriver::new(spec());
        d.open();
        let before = d.tick(100).visible_progress;
        d.dismiss();
        let after = d.sample().visible_progress;
        assert!((after - before).abs() < 0.2, "before {before}, after {after}");
    }
}
