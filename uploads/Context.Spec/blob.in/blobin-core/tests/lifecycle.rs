//! Integration test — exercises the full engine the way blobin-qt does,
//! without any C++: construct, drive states, tick, assert the mesh stays
//! valid and the engine goes cold when settled.
//!
//! Run: `cargo test --manifest-path blob.in/blobin-core/Cargo.toml`

use blobin_core::engine::Engine;
use blobin_core::state::MascotState;

fn drive(e: &mut Engine, frames: u32) {
    for _ in 0..frames {
        e.tick(1.0 / 60.0);
    }
}

#[test]
fn full_lifecycle_stays_valid() {
    let mut e = Engine::new();
    e.set_size(60.0);

    // Idle → mesh appears, triangles well-formed.
    e.tick(1.0 / 60.0);
    assert!(!e.mesh().is_empty());
    assert_eq!(e.indices().len() % 3, 0);
    assert!(e.indices().iter().all(|&i| (i as usize) < e.vertices().len()));

    // Through every state, mesh remains valid.
    for st in [
        MascotState::Listening,
        MascotState::Transmit,
        MascotState::Veille,
        MascotState::Idle,
    ] {
        e.set_state(st);
        drive(&mut e, 120);
        assert_eq!(e.indices().len() % 3, 0);
        assert!(
            e.indices().iter().all(|&i| (i as usize) < e.vertices().len()),
            "index out of range after {:?}",
            st
        );
    }
}

#[test]
fn settles_cold_after_idle() {
    let mut e = Engine::new();
    e.set_size(60.0);
    e.set_state(MascotState::Veille);
    drive(&mut e, 600);
    assert!(e.is_cold(), "engine should throttle when fully settled");
}

#[test]
fn listening_is_larger_than_veille() {
    // Sanity on the silhouette: listening scale 1.06 vs veille 0.88.
    let mut idle = Engine::new();
    idle.set_size(100.0);
    idle.set_state(MascotState::Listening);
    drive(&mut idle, 240);
    let big = idle.vertices().iter().map(|v| v.x.abs()).fold(0.0_f32, f32::max);

    let mut sleep = Engine::new();
    sleep.set_size(100.0);
    sleep.set_state(MascotState::Veille);
    drive(&mut sleep, 240);
    let small = sleep.vertices().iter().map(|v| v.x.abs()).fold(0.0_f32, f32::max);

    assert!(big > small, "listening {big} should exceed veille {small}");
}
