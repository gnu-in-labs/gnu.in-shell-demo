# R10 · Dogfood — 2 weeks, no P0/P1

> The team runs the `rust` backend on their own machines for 14 consecutive
> days. Bugs filed under `blob.in/dogfood` are triaged daily. R10 GREEN only
> when the window closes with **zero open P0 or P1 issues** and no rollback
> events.

## Eligibility

A run counts toward the window if:
- The dogfooder runs the latest signed nightly with `BLOBIN_BACKEND=rust`.
- They submit a daily log row (see template below) — silence is treated as
  "did not run" and the window does not advance.
- The machine class is in scope: at least one row from low-end (R7 ref box),
  mid-range, and high-end must contribute every day.

## Severity

| Level | Definition                                       | Window action |
|-------|--------------------------------------------------|---------------|
| P0    | Crash, GPU hang, data loss, unrecoverable        | Window resets |
| P1    | Visible regression vs 3.1 (perf or visual)       | Window resets |
| P2    | Cosmetic, edge case, recoverable                 | Tracked, OK   |
| P3    | Polish, nice-to-have                             | Tracked, OK   |

A window reset means the 14-day clock restarts at day 1 once the offending
P0/P1 lands a fix.

## Exit criteria

R10 GREEN when:
- 14 consecutive days complete with no new P0/P1.
- Every previously-filed P0/P1 is closed (not just deferred).
- At least 3 distinct machine classes participated each day.
- No dogfooder fell back to `BLOBIN_BACKEND=cpp` mid-window.

## Daily log

Append to `tools/r10-dogfood-log.jsonl` (one JSON object per line):

```
{"date":"2026-06-09","dogfooder":"AA","class":"low","hours":4.5,"bugs":[],"backend":"rust","notes":""}
```

Required keys: `date`, `dogfooder` (initials), `class` (low/mid/high),
`hours`, `bugs` (issue ids), `backend`, `notes`.

## Sign-off

When the 14-day window closes clean, append a row to `tools/r10-sign-off.json`
with the date range and the lead's initials.
