//! Pool — the dedicated solver scheduler (Q2, enabled by default in P4).
//!
//! A shell shows more than one blob at once: the mascot, plus radial bubbles
//! (M.12), plus notification pills. Each is a `blobin_core::Engine`. In v3.1
//! every one of those ticked on the Qt main-thread in C++. Here a `Scheduler`
//! owns them all and advances them **off** the Qt thread — with the
//! `threaded-solver` feature, in parallel across a rayon pool.
//!
//! The Qt side does one thing per frame: call `tick_all(dt)`, get back the set
//! of engine ids whose mesh changed, and upload only those. The main-thread
//! never runs a solver.
//!
//! Determinism: a fixed `dt` produces identical results whether ticked
//! sequentially or in parallel — engines never touch shared state during a
//! tick, so there is no ordering hazard (golden parity is preserved between
//! `--features threaded-solver` and not).

use crate::engine::Engine;
use crate::state::MascotState;
use std::collections::BTreeMap;

/// Stable handle for an engine inside the scheduler.
pub type EngineId = u32;

pub struct Scheduler {
    next: EngineId,
    engines: BTreeMap<EngineId, Engine>,
    /// Scratch reused each frame to report repainted ids without allocating.
    dirty: Vec<EngineId>,
}

impl Scheduler {
    pub fn new() -> Self {
        Self { next: 1, engines: BTreeMap::new(), dirty: Vec::new() }
    }

    pub fn len(&self) -> usize {
        self.engines.len()
    }

    pub fn is_empty(&self) -> bool {
        self.engines.is_empty()
    }

    /// Register an engine; returns its id.
    pub fn add(&mut self, engine: Engine) -> EngineId {
        let id = self.next;
        self.next += 1;
        self.engines.insert(id, engine);
        id
    }

    pub fn remove(&mut self, id: EngineId) -> Option<Engine> {
        self.engines.remove(&id)
    }

    pub fn get(&self, id: EngineId) -> Option<&Engine> {
        self.engines.get(&id)
    }

    pub fn get_mut(&mut self, id: EngineId) -> Option<&mut Engine> {
        self.engines.get_mut(&id)
    }

    pub fn set_state(&mut self, id: EngineId, state: MascotState) {
        if let Some(e) = self.engines.get_mut(&id) {
            e.set_state(state);
        }
    }

    /// Advance every engine by `dt`. Returns the ids whose mesh changed and
    /// must be re-uploaded. Parallel with `threaded-solver`, else sequential.
    pub fn tick_all(&mut self, dt: f32) -> &[EngineId] {
        self.dirty.clear();

        #[cfg(feature = "threaded-solver")]
        {
            use rayon::prelude::*;
            // Tick in parallel; collect (id, repaint) pairs, then gather dirty.
            let mut pairs: Vec<(EngineId, bool)> = self
                .engines
                .par_iter_mut()
                .map(|(&id, e)| (id, e.tick(dt)))
                .collect();
            pairs.sort_unstable_by_key(|(id, _)| *id);
            for (id, repaint) in pairs {
                if repaint {
                    self.dirty.push(id);
                }
            }
        }

        #[cfg(not(feature = "threaded-solver"))]
        {
            for (&id, e) in self.engines.iter_mut() {
                if e.tick(dt) {
                    self.dirty.push(id);
                }
            }
        }

        &self.dirty
    }

    /// True when *every* engine is cold — the host can drop to an idle repaint
    /// cadence (or stop requesting frames) until the next state change. This is
    /// the "C++ called as little as possible" lever at the scene level.
    pub fn all_cold(&self) -> bool {
        self.engines.values().all(|e| e.is_cold())
    }

    /// Number of engines currently animating (not cold) — for diagnostics /
    /// adaptive frame pacing.
    pub fn active(&self) -> usize {
        self.engines.values().filter(|e| !e.is_cold()).count()
    }
}

impl Default for Scheduler {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn settled_engine(state: MascotState) -> Engine {
        let mut e = Engine::new();
        e.set_size(60.0);
        e.set_state(state);
        e
    }

    #[test]
    fn ticks_all_and_reports_dirty() {
        let mut s = Scheduler::new();
        s.add(settled_engine(MascotState::Listening));
        s.add(settled_engine(MascotState::Transmit));
        let dirty = s.tick_all(1.0 / 60.0).to_vec();
        // both are mid-transition → both repaint
        assert_eq!(dirty.len(), 2);
    }

    #[test]
    fn goes_all_cold_when_settled() {
        let mut s = Scheduler::new();
        s.add(settled_engine(MascotState::Veille));
        for _ in 0..600 {
            s.tick_all(1.0 / 60.0);
        }
        assert!(s.all_cold());
        assert_eq!(s.active(), 0);
    }

    #[test]
    fn remove_drops_engine() {
        let mut s = Scheduler::new();
        let id = s.add(settled_engine(MascotState::Idle));
        assert_eq!(s.len(), 1);
        assert!(s.remove(id).is_some());
        assert!(s.is_empty());
    }

    #[test]
    fn dirty_ids_are_sorted() {
        let mut s = Scheduler::new();
        let _a = s.add(settled_engine(MascotState::Listening));
        let _b = s.add(settled_engine(MascotState::Listening));
        let _c = s.add(settled_engine(MascotState::Listening));
        let dirty = s.tick_all(1.0 / 60.0);
        let mut sorted = dirty.to_vec();
        sorted.sort_unstable();
        assert_eq!(dirty, &sorted[..]);
    }
}
