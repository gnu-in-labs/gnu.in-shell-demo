//! scheduler_throughput — R7 secondary measurement.
//!
//! How many engines can the scheduler tick inside a 16.6 ms frame budget,
//! sequential vs threaded? Drives the decision on whether the rayon pool
//! actually pays off at typical shell scene sizes (mascot + 4–12 blobs).

use blobin_core::{pool::Scheduler, state::MascotState, Engine};
use criterion::{black_box, criterion_group, criterion_main, BenchmarkId, Criterion};

fn bench_scene(c: &mut Criterion) {
    let dt = 1.0 / 60.0;
    let mut g = c.benchmark_group("scheduler_tick_all");
    for &n in &[1usize, 4, 8, 16] {
        let mut s = Scheduler::new();
        for i in 0..n {
            let mut e = Engine::new();
            e.set_size(60.0);
            e.set_state(match i % 4 {
                0 => MascotState::Idle,
                1 => MascotState::Listening,
                2 => MascotState::Transmit,
                _ => MascotState::Veille,
            });
            s.add(e);
        }
        // pre-roll
        for _ in 0..60 {
            s.tick_all(dt);
        }
        g.bench_with_input(BenchmarkId::new("engines", n), &n, |b, _| {
            b.iter(|| {
                black_box(s.tick_all(black_box(dt)));
            });
        });
    }
    g.finish();
}

criterion_group!(benches, bench_scene);
criterion_main!(benches);
