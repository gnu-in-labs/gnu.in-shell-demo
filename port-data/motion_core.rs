// gnuin-compose-core :: motion — PORT PARITY MIRROR (not the source of truth)
// ============================================================================
// Faithful mirror of gnu.in-os/engine/gnuin-compose-core/src/motion.rs (v0.14.2).
// The non-rendering half of the motion engine: easing + spring curves,
// reduced-motion resolution, lifecycle advancement, and interruption mapping.
// Hosts own their real frame clocks; the SEMANTIC rules live here so every
// native shell surface follows the same motion contract. This is a module of
// the crate (`use crate::NodeState;`), kept in sync with compose_core.rs.

use crate::NodeState; // shared with compose_core.rs

/// Curve mapping normalized time → presentation progress.
#[derive(Debug, Clone, Copy, PartialEq)]
pub enum Easing { Linear, EaseOutCubic, EaseInOutCubic, Spring(Spring) }

impl Easing {
    /// Evaluate at normalized time `t`. Cubics stay in 0..1; Spring may overshoot
    /// above 1.0 so hosts can drive scale/position with a real rebound. Use
    /// MotionSample::visible_progress for opacity/input-safe progress.
    pub fn sample(self, t: f32) -> f32 {
        let t = clamp_unit(t);
        match self {
            Easing::Linear => t,
            Easing::EaseOutCubic => 1.0 - (1.0 - t).powi(3),
            Easing::EaseInOutCubic => if t < 0.5 { 4.0 * t.powi(3) } else { 1.0 - (-2.0 * t + 2.0).powi(3) / 2.0 },
            Easing::Spring(s) => s.sample(t),
        }
    }
    /// Approximate inverse for interruption mapping. Monotonic curves invert by
    /// binary search (preserve exact visual progress on reversal); springs map
    /// linearly because an overshooting curve is not one-to-one.
    pub fn inverse_sample(self, progress: f32) -> f32 {
        let progress = clamp_unit(progress);
        match self {
            Easing::Spring(_) | Easing::Linear => progress,
            Easing::EaseOutCubic | Easing::EaseInOutCubic => {
                let (mut lo, mut hi) = (0.0f32, 1.0f32);
                for _ in 0..24 { let mid = (lo + hi) * 0.5; if self.sample(mid) < progress { lo = mid; } else { hi = mid; } }
                (lo + hi) * 0.5
            }
        }
    }
}

/// Spring tuning. Lower `response_ms` ⇒ faster/tighter; `damping_ratio` near 1.0
/// approaches critical damping, lower overshoots more.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Spring { pub response_ms: u32, pub damping_ratio: f32 }

impl Spring {
    pub const fn new(response_ms: u32, damping_ratio: f32) -> Spring { Spring { response_ms, damping_ratio } }
    pub const fn soft() -> Spring { Spring::new(320, 0.82) }
    fn sample(self, t: f32) -> f32 {
        if t <= 0.0 { return 0.0; }
        if t >= 1.0 { return 1.0; }
        let response = self.response_ms.max(1) as f32;
        let cycles = (420.0 / response).clamp(0.75, 2.5);
        let damping = self.damping_ratio.clamp(0.15, 1.6);
        let decay = (-damping * 6.0 * t).exp();
        let oscillation = (t * cycles * std::f32::consts::TAU).cos();
        1.0 - decay * oscillation
    }
}
impl Default for Spring { fn default() -> Self { Spring::soft() } }

/// Resolved motion policy for one node transition.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct MotionSpec { pub duration_ms: u32, pub easing: Easing, pub reduced_motion: bool }

impl MotionSpec {
    pub const fn new(duration_ms: u32, easing: Easing) -> MotionSpec { MotionSpec { duration_ms, easing, reduced_motion: false } }
    pub const fn linear(duration_ms: u32) -> MotionSpec { MotionSpec::new(duration_ms, Easing::Linear) }
    pub const fn ease_out(duration_ms: u32) -> MotionSpec { MotionSpec::new(duration_ms, Easing::EaseOutCubic) }
    pub const fn spring(duration_ms: u32, spring: Spring) -> MotionSpec { MotionSpec::new(duration_ms, Easing::Spring(spring)) }
    pub const fn reduced() -> MotionSpec { MotionSpec { duration_ms: 0, easing: Easing::Linear, reduced_motion: true } }
    pub fn with_reduced_motion(mut self, r: bool) -> MotionSpec { self.reduced_motion = r; self }
    /// Reduced motion collapses every transition to 0 ms (snap to terminal).
    pub fn effective_duration_ms(self) -> u32 { if self.reduced_motion { 0 } else { self.duration_ms } }
}
impl Default for MotionSpec { fn default() -> Self { MotionSpec::ease_out(240) } }

/// A sampled animation frame. `curve_progress` may overshoot >1.0 (spring);
/// `visible_progress` is the input/opacity-safe value (0..1, inverted on close).
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct MotionSample { pub state: NodeState, pub raw_progress: f32, pub curve_progress: f32, pub visible_progress: f32 }

impl MotionSample {
    pub fn open(state: NodeState) -> MotionSample { MotionSample { state, raw_progress: 1.0, curve_progress: 1.0, visible_progress: 1.0 } }
    pub fn hidden(state: NodeState) -> MotionSample { MotionSample { state, raw_progress: 1.0, curve_progress: 1.0, visible_progress: 0.0 } }
}

/// Advance a node transition. Opening→Open, Closing→Hidden; Open/Committing and
/// Hidden are terminal.
pub fn advance_motion(state: NodeState, elapsed_ms: u32, spec: MotionSpec) -> MotionSample {
    match state {
        NodeState::Opening => transition(elapsed_ms, spec, NodeState::Opening, NodeState::Open),
        NodeState::Closing => transition(elapsed_ms, spec, NodeState::Closing, NodeState::Hidden),
        NodeState::Open | NodeState::Committing => MotionSample::open(state),
        NodeState::Hidden => MotionSample::hidden(state),
    }
}

fn transition(elapsed_ms: u32, spec: MotionSpec, running: NodeState, terminal: NodeState) -> MotionSample {
    let duration = spec.effective_duration_ms();
    if duration == 0 || elapsed_ms >= duration {
        return match terminal { NodeState::Hidden => MotionSample::hidden(terminal), _ => MotionSample::open(terminal) };
    }
    let raw = (elapsed_ms as f32 / duration as f32).clamp(0.0, 1.0);
    let curve = spec.easing.sample(raw);
    let visible = match running { NodeState::Closing => 1.0 - clamp_unit(curve), _ => clamp_unit(curve) };
    MotionSample { state: running, raw_progress: raw, curve_progress: curve, visible_progress: visible }
}

/// Result of retargeting an in-flight transition (start `state` at `elapsed_ms`).
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct MotionInterruption { pub state: NodeState, pub elapsed_ms: u32, pub visible_progress: f32 }

/// Retarget an in-flight transition WITHOUT a visible jump. For monotonic
/// easings, resampling with the same spec preserves the current visible_progress
/// — the load-bearing rule for reversible open/close (no client re-entrancy hacks).
pub fn interrupt_motion(current: MotionSample, target: NodeState, spec: MotionSpec) -> MotionInterruption {
    let visible = clamp_unit(current.visible_progress);
    let duration = spec.effective_duration_ms();
    if duration == 0 {
        let terminal = match target { NodeState::Hidden | NodeState::Closing => NodeState::Hidden, _ => NodeState::Open };
        return MotionInterruption { state: terminal, elapsed_ms: 0, visible_progress: if terminal == NodeState::Hidden { 0.0 } else { 1.0 } };
    }
    let (state, curve_target) = match target {
        NodeState::Hidden | NodeState::Closing => {
            if visible <= 0.0 { return MotionInterruption { state: NodeState::Hidden, elapsed_ms: duration, visible_progress: 0.0 }; }
            (NodeState::Closing, 1.0 - visible)
        }
        NodeState::Open | NodeState::Opening | NodeState::Committing => {
            if visible >= 1.0 { return MotionInterruption { state: NodeState::Open, elapsed_ms: duration, visible_progress: 1.0 }; }
            (NodeState::Opening, visible)
        }
    };
    let raw = spec.easing.inverse_sample(curve_target);
    let elapsed_ms = ((raw * duration as f32).round() as u32).min(duration);
    MotionInterruption { state, elapsed_ms, visible_progress: visible }
}

fn clamp_unit(v: f32) -> f32 { v.clamp(0.0, 1.0) }

#[cfg(test)]
mod tests {
    use super::*;
    #[test] fn ease_out_cubic_faster_than_linear() {
        assert!(Easing::EaseOutCubic.sample(0.25) > 0.25);
        assert_eq!(Easing::EaseOutCubic.sample(1.0), 1.0);
    }
    #[test] fn spring_overshoots_for_transform_but_visibility_safe() {
        let spec = MotionSpec::spring(320, Spring::soft());
        let s = advance_motion(NodeState::Opening, 160, spec);
        assert!(s.curve_progress > 1.0);          // overshoot exposed for scale/position
        assert_eq!(s.visible_progress, 1.0);      // opacity/input stays clamped
    }
    #[test] fn reduced_motion_snaps_to_terminal() {
        let spec = MotionSpec::ease_out(240).with_reduced_motion(true);
        assert_eq!(advance_motion(NodeState::Opening, 0, spec).state, NodeState::Open);
        assert_eq!(advance_motion(NodeState::Closing, 0, spec).state, NodeState::Hidden);
    }
    #[test] fn closing_reports_inverse_visibility() {
        let s = advance_motion(NodeState::Closing, 60, MotionSpec::linear(240));
        assert_eq!(s.raw_progress, 0.25);
        assert_eq!(s.visible_progress, 0.75);
    }
    #[test] fn interrupting_close_to_open_preserves_visibility() {
        let spec = MotionSpec::ease_out(240);
        let cur = advance_motion(NodeState::Closing, 60, spec);
        let it = interrupt_motion(cur, NodeState::Opening, spec);
        let resumed = advance_motion(it.state, it.elapsed_ms, spec);
        assert!((resumed.visible_progress - cur.visible_progress).abs() < 0.01);
    }
    #[test] fn interrupting_open_to_close_preserves_visibility() {
        let spec = MotionSpec::ease_out(240);
        let cur = advance_motion(NodeState::Opening, 90, spec);
        let it = interrupt_motion(cur, NodeState::Closing, spec);
        let resumed = advance_motion(it.state, it.elapsed_ms, spec);
        assert!((resumed.visible_progress - cur.visible_progress).abs() < 0.01);
    }
}
