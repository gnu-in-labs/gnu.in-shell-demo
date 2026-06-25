# R7 · Frame budget — sign-off protocol

> Auto signal: `cargo bench -p blobin-bench` (Criterion). Manual sign-off
> compares the result against the committed v3.1 baseline on the **reference
> low-end GPU box** and records pass/fail in `r7-sign-off.json`.

## Reference box

Frozen so results are comparable across runs. Update only with reviewer
sign-off.

| Spec       | Value                                   |
|------------|-----------------------------------------|
| CPU        | 4c/8t · ~2.4 GHz baseline class         |
| GPU        | Integrated, ~Vega 8 / Intel UHD 620     |
| RAM        | 8 GB                                    |
| Display    | 1920×1080 @ 60 Hz                       |
| OS / Qt    | Linux · Qt 6.6 · RHI: GL                |
| Power      | AC, governor `performance`              |

## Baseline (v3.1 reference)

Run on the reference box once, before P4 landed. Numbers in µs per `tick`:

| Bench                          | v3.1 baseline (µs) | Notes              |
|--------------------------------|--------------------|--------------------|
| engine_tick/Idle               | ~ 18               | breathing only     |
| engine_tick/Listening          | ~ 26               | wobble + spring    |
| engine_tick/Transmit           | ~ 24               | spring overshoot   |
| engine_tick/Veille             | ~ 12               | cold path          |
| bloom_tick/4                   | ~ 38               | 4 leaves           |
| bloom_tick/12                  | ~ 92               | 12 leaves          |
| scheduler_tick_all/16          | ~ 380              | scene-of-many      |

> Numbers above are placeholders — the reviewer **commits the real measured
> baseline** into this file the first time R7 is signed.

## Gate

`R7 GREEN` when:
- All `engine_tick/*` regress ≤ 5 % vs baseline.
- All `bloom_tick/*` regress ≤ 8 %.
- `scheduler_tick_all/16` regresses ≤ 10 % (rayon pool variance accepted).
- 16.6 ms frame: at 16 engines + 1 bloom + paint, total ≤ 10 ms CPU.

## Procedure

1. Boot reference box on AC, governor `performance`, close everything else.
2. `cd blob.in && cargo bench -p blobin-bench -- --save-baseline current`
3. `cargo bench -p blobin-bench -- --baseline v31`
4. Read regression table; if every row is within budget, record a row in
   `r7-sign-off.json` with date, commit SHA, and the reviewer's initials.

## Sign-off log

`tools/r7-sign-off.json` — append-only list of signed runs. See template at
`tools/_signoff-template.json`.
