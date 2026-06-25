# blob.in — Readiness gate (P5)

> The final phase before flipping `BLOBIN_BACKEND=rust` on by default in
> production. P5 is **validation, not new features**: every box below must be
> green, held for a two-week dogfood, with zero Qt-5 fallback regressions.
>
> Run the executable view: `bash tools/readiness.sh` (or `just readiness`).
> It runs the gates it can and prints this table with live pass/fail.

## Engine version

`blob.in` engine + spec are versioned together at **0.4.0** (was Motion
Spec v3.1 — renumbered to track the engine semver from 4.0/P-series).

## Gates

| # | Gate | Source of truth | Auto? | Status |
|---|------|-----------------|-------|--------|
| R1 | Tokens in sync | `just check-tokens` (tokens.rs vs tokens.json) | ✅ auto | gated |
| R2 | Engine + generator tests pass | `cargo test --workspace` | ✅ auto | gated |
| R3 | Threaded solver == sequential | `cargo test -p blobin-core --features threaded-solver` | ✅ auto | gated |
| R4 | Material parity (pixel + SSIM) | `cargo test -p blobin-golden` | ✅ auto | gated |
| R5 | C++ shim ≤ 300 LoC | `tools/loc-guard.sh 300` | ✅ auto | gated |
| R6 | No `unsafe` outside FFI crates | `tools/no-unsafe.sh` | ✅ auto | gated |
| R7 | Frame budget ≤ v3.1 baseline | `just bench` + `tools/r7-frame-budget.md` | ⚠ manual | protocol committed |
| R8 | GPU shader == raster goldens | software-RHI diff · `tools/r8-shader-parity.md` | ⚠ manual | protocol committed |
| R9 | Qt-5 fallback: zero regressions | smoke matrix · `tools/r9-qt5-fallback.md` | ⚠ manual | protocol committed |
| R10 | Dogfood 2 weeks, no P0/P1 bugs | log + criteria · `tools/r10-dogfood.md` | ⚠ manual | protocol committed |

Auto gates (R1–R6) are wired into `just ci` + `tools/readiness.sh`. Manual
gates (R7–R10) each have a committed protocol document and a sign-off JSON
template (`tools/_signoff-template.json`); the readiness script prints them
as `MANUAL` so they never silently pass.

## Flip criteria

Production default flips to `rust` when **R1–R10 are all green** and held for
the dogfood window. Until then:

- `rust` is opt-in per build (`BLOBIN_BACKEND=rust`), default stays `cpp` in
  shipped channels, `rust` in dev/nightly.
- The `cpp` backend is never deleted — it remains the parity oracle (plan §6).

## Rollback

If a P0/P1 surfaces after the flip: set `BLOBIN_BACKEND=cpp` (env, no rebuild),
file under `blob.in/regression`, re-open the relevant gate. The flip is a
config change, not a code change — rollback is instant.
