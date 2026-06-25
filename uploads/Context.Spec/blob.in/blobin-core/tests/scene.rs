//! scene — P4 scheduler integration. Drives several engines through the
//! `Scheduler` the way blobin-qt's multi-blob host does, and checks the pool
//! contract: batch tick, dirty reporting, all-cold throttling.
//!
//! Run both ways to confirm the threaded solver is deterministic:
//!   cargo test -p blobin-core --test scene
//!   cargo test -p blobin-core --test scene --features threaded-solver

use blobin_core::pool::Scheduler;
use blobin_core::state::MascotState;
use blobin_core::Engine;

fn engine() -> Engine {
    let mut e = Engine::new();
    e.set_size(72.0);
    e
}

#[test]
fn multi_blob_scene_lifecycle() {
    let mut s = Scheduler::new();
    let mascot = s.add(engine());
    let bubble_a = s.add(engine());
    let bubble_b = s.add(engine());

    // Kick three different states.
    s.set_state(mascot, MascotState::Listening);
    s.set_state(bubble_a, MascotState::Transmit);
    s.set_state(bubble_b, MascotState::Veille);

    // First frame: all three are mid-transition → all dirty.
    let dirty = s.tick_all(1.0 / 60.0).to_vec();
    assert_eq!(dirty.len(), 3);
    assert!(!s.all_cold());

    // Listening & Transmit breathe forever (alive); only Veille goes cold.
    // Put the whole scene to sleep, then it must fully quiesce.
    for id in [mascot, bubble_a, bubble_b] {
        s.set_state(id, MascotState::Veille);
    }
    for _ in 0..900 {
        s.tick_all(1.0 / 60.0);
    }
    assert!(s.all_cold());
    assert_eq!(s.active(), 0);

    // Every engine still holds a valid mesh.
    for id in [mascot, bubble_a, bubble_b] {
        let e = s.get(id).unwrap();
        assert_eq!(e.indices().len() % 3, 0);
        assert!(e.indices().iter().all(|&i| (i as usize) < e.vertices().len()));
    }
}

#[test]
fn breathing_blob_never_goes_cold() {
    // A living (idle/listening) mascot breathes forever — it should keep
    // producing frames and never report cold. This is intended: the cold
    // optimisation is for finished bubbles/notifs, not the alive mascot.
    let mut s = Scheduler::new();
    let id = s.add(engine());
    s.set_state(id, MascotState::Listening);
    for _ in 0..600 {
        s.tick_all(1.0 / 60.0);
    }
    assert!(!s.all_cold());
    assert_eq!(s.active(), 1);
}

#[test]
fn veille_scene_quiesces_to_no_dirty() {
    let mut s = Scheduler::new();
    let id = s.add(engine());
    s.set_state(id, MascotState::Veille); // asleep → goes still

    for _ in 0..1200 {
        s.tick_all(1.0 / 60.0);
        if s.all_cold() {
            break;
        }
    }
    // Once cold, a further tick yields no repaint.
    let after = s.tick_all(1.0 / 60.0).len();
    assert!(s.all_cold());
    assert_eq!(after, 0, "cold scene should not dirty");
}
