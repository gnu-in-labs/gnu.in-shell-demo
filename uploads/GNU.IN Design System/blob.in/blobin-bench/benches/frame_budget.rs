//! frame_budget — R7 readiness gate.
//!
//! Measures the cost of one `Engine::tick` at a representative size for each
//! mascot state, so the team can compare against the v3.1 baseline and fail
//! the gate if the Rust engine ever drifts above it.
//!
//! Run: `cargo bench -p blobin-bench --bench frame_budget`
//!
//! Baseline contract (committed in `tools/baseline-v3.1.json` once measured on
//! the reference low-end GPU box; the comparison is informational, not a hard
//! CI gate — the manual sign-off lives in `tools/r7-frame-budget.md`).

use blobin_core::{state::MascotState, Engine};
use criterion::{black_box, criterion_group, criterion_main, BenchmarkId, Criterion};

fn bench_tick(c: &mut Criterion) {
    let dt = 1.0 / 60.0;
    let mut g = c.benchmark_group("engine_tick");

    for &state in &[
        MascotState::Idle,
        MascotState::Listening,
        MascotState::Transmit,
        MascotState::Veille,
    ] {
        // Build once outside the loop so the bench measures steady-state cost,
        // not the first-frame rebuild path. We pre-roll 60 frames to leave the
        // spring solvers in their typical regime.
        let mut e = Engine::new();
        e.set_size(72.0);
        e.set_state(state);
        for _ in 0..60 {
            e.tick(dt);
        }
        g.bench_with_input(
            BenchmarkId::new("state", format!("{state:?}")),
            &state,
            |b, _| {
                b.iter(|| {
                    black_box(e.tick(black_box(dt)));
                });
            },
        );
    }
    g.finish();
}

fn bench_bloom(c: &mut Criterion) {
    use blobin_core::{BubbleBloom, BubbleSpec};
    let dt = 1.0 / 60.0;
    let mut g = c.benchmark_group("bloom_tick");
    for &n in &[4usize, 6, 8, 12] {
        let specs: Vec<_> = (0..n)
            .map(|_| BubbleSpec { size: 0.32, color: [1.0, 0.416, 0.0, 1.0] })
            .collect();
        let mut bloom = BubbleBloom::new(0.5, [0.97, 0.95, 0.93, 1.0], 2.2, &specs, 0.036);
        bloom.set_size(72.0);
        bloom.open();
        for _ in 0..30 {
            bloom.tick(dt);
        }
        g.bench_with_input(BenchmarkId::new("leaves", n), &n, |b, _| {
            b.iter(|| {
                black_box(bloom.tick(black_box(dt)));
            });
        });
    }
    g.finish();
}

criterion_group!(benches, bench_tick, bench_bloom);
criterion_main!(benches);
