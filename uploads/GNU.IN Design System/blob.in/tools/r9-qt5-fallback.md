# R9 · Qt-5 fallback — zero regressions

> The `cpp` backend is the parity oracle and the fallback path for any platform
> that can't carry the Rust toolchain. This gate proves the fallback still
> behaves the same as it did before 4.0 landed, on a Qt-5 host.

## Reference fallback box

| Spec    | Value                                       |
|---------|---------------------------------------------|
| OS      | Debian 12 (frozen image)                    |
| Qt      | 5.15.x LTS                                  |
| GPU     | Same as R7 reference                        |
| Build   | `BLOBIN_BACKEND=cpp` · the legacy shim path |

## Smoke matrix

| # | Scenario                                | Expected                                |
|---|-----------------------------------------|-----------------------------------------|
| 1 | Mascot idle on boot                     | Breathes, no jitter, settles to idle    |
| 2 | Listening → Transmit → Veille          | Each transition visually identical to 3.1 |
| 3 | Veille for 5 min                        | Engine cold, GPU at idle, no wake-ups   |
| 4 | Open BubbleBloom (M.12) at cursor       | Hub + leaves bloom, spring stagger ok   |
| 5 | Bloom → close                            | Retracts, threads fade, mascot resumes  |
| 6 | Resize host window (mid-anim)           | No tearing, no frame drops              |
| 7 | Theme swap (light ↔ dark)               | Material recolours, no flash            |
| 8 | Rapid state changes (Listening/Idle x10)| No state machine deadlocks, no hangs    |

## Procedure

1. Boot the frozen image, log in, run `gnuin-shell` (built `cpp` backend).
2. Walk each row of the matrix; record a "pass" or note the deviation.
3. If all 8 pass, append a row to `tools/r9-sign-off.json` with the date,
   build SHA, and reviewer.

## Gate

R9 GREEN when all 8 smoke rows pass on the frozen Qt-5 image. **Any** failure
blocks the `rust`-default flip.

## Why the matrix is small

Qt-5 is end-of-life; we ship there as a courtesy. The matrix covers what users
actually see; exhaustive coverage lives in the unit suite which runs on every
PR regardless of backend.
