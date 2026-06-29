// gnuin-shell :: resources monitor (system metrics) — port target
// ============================================================================
// The model behind the bar's `resources` widget and its expert system-monitor
// popover (CPU · RAM · Network). In the shipping shell the samples come from
// /proc + the compositor's frame timer; here a bounded random walk drives them
// (load correlated to open windows). The DETERMINISTIC core — the rolling ring
// buffer and the walk step — is what lives here and is unit-tested; the random
// jitter source stays host-side.

#![allow(dead_code)]

use std::collections::VecDeque;

/// A fixed-capacity rolling history of metric samples (oldest dropped on push).
#[derive(Clone, Debug)]
pub struct RingBuffer {
    data: VecDeque<f32>,
    cap: usize,
}

impl RingBuffer {
    /// New buffer of `cap` samples, pre-filled with `seed`.
    pub fn new(cap: usize, seed: f32) -> Self {
        let mut data = VecDeque::with_capacity(cap);
        for _ in 0..cap {
            data.push_back(seed);
        }
        Self { data, cap }
    }

    /// Append a sample, evicting the oldest once at capacity.
    pub fn push(&mut self, v: f32) {
        self.data.push_back(v);
        while self.data.len() > self.cap {
            self.data.pop_front();
        }
    }

    pub fn len(&self) -> usize { self.data.len() }
    pub fn last(&self) -> f32 { *self.data.back().unwrap_or(&0.0) }
    pub fn peak(&self) -> f32 { self.data.iter().cloned().fold(0.0, f32::max) }
    pub fn avg(&self) -> f32 {
        if self.data.is_empty() { 0.0 } else { self.data.iter().sum::<f32>() / self.data.len() as f32 }
    }

    /// The last `n` samples as integer bar heights in [6,100] (sparkline).
    pub fn bars(&self, n: usize) -> Vec<u8> {
        let start = self.data.len().saturating_sub(n);
        self.data.iter().skip(start).map(|&v| clamp_bar(v)).collect()
    }
}

/// Clamp a percent to a drawable bar height in [6,100] (a floor so a live bar
/// is always visible).
pub fn clamp_bar(v: f32) -> u8 {
    v.round().clamp(6.0, 100.0) as u8
}

/// One walk step toward `target` with `jitter` applied (the caller supplies the
/// jitter so this stays pure/testable), clamped to [lo,hi]. Mirrors the host:
/// `prev + (target-prev)*0.25 + jitter`.
pub fn walk_step(prev: f32, target: f32, jitter: f32, lo: f32, hi: f32) -> f32 {
    (prev + (target - prev) * 0.25 + jitter).clamp(lo, hi)
}

/// CPU load target as a function of live shell load (open windows + whether the
/// settings panel is open) — the realism hook tying metrics to actual state.
pub fn cpu_target(open_windows: u32, settings_open: bool) -> f32 {
    10.0 + open_windows as f32 * 9.0 + if settings_open { 8.0 } else { 0.0 }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test] fn ring_caps_and_drops_oldest() {
        let mut r = RingBuffer::new(3, 0.0);
        r.push(1.0); r.push(2.0); r.push(3.0); // evicts the three seeds
        assert_eq!(r.len(), 3);
        r.push(4.0); // drops 1.0
        assert_eq!(r.last(), 4.0);
        assert!((r.peak() - 4.0).abs() < 1e-6);
        assert!((r.avg() - 3.0).abs() < 1e-6); // (2+3+4)/3
    }

    #[test] fn bars_floor_and_clamp() {
        let mut r = RingBuffer::new(4, 0.0);
        r.push(0.0); r.push(50.0); r.push(140.0); r.push(7.4);
        let b = r.bars(4);
        assert_eq!(b, vec![6, 50, 100, 7]); // floored to 6, clamped to 100, rounded
    }

    #[test] fn bars_returns_last_n_only() {
        let mut r = RingBuffer::new(8, 10.0);
        for v in [20.0, 30.0, 40.0] { r.push(v); }
        assert_eq!(r.bars(2), vec![30, 40]);
    }

    #[test] fn walk_moves_toward_target_and_clamps() {
        // no jitter: moves a quarter of the way toward target
        let v = walk_step(20.0, 100.0, 0.0, 2.0, 99.0);
        assert!((v - 40.0).abs() < 1e-6);
        // clamps to the ceiling
        assert!((walk_step(98.0, 200.0, 50.0, 2.0, 99.0) - 99.0).abs() < 1e-6);
        // clamps to the floor
        assert!((walk_step(3.0, 0.0, -50.0, 2.0, 99.0) - 2.0).abs() < 1e-6);
    }

    #[test] fn cpu_target_tracks_load() {
        assert_eq!(cpu_target(0, false), 10.0);
        assert_eq!(cpu_target(3, false), 37.0);
        assert_eq!(cpu_target(3, true), 45.0); // settings panel adds load
    }
}
