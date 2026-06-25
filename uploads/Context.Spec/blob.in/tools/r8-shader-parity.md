# R8 · Shader parity — GPU vs raster oracle

> P3 already gates the **maths**: Rust raster `eval_fragment` is bit-equal to
> what `blob.frag` is supposed to compute, golden PNGs are signed by both the
> Rust oracle and an independent JS oracle. R8 closes the last loop: the
> **actual compiled `.qsb` shader, run through Qt RHI**, produces the same
> pixels as the goldens.

## Why this gate exists

Driver bugs, RHI quirks, half-precision rounding on integrated GPUs — these
only surface on real hardware. Running the same diff against a software RHI
catches the deterministic subset of those; running on the reference box
catches the rest.

## Software-RHI run (CI)

```
QT_QUICK_BACKEND=software \
  QT_RHI_BACKEND=null      \
  blobin-qt/tests/render_goldens --output ./out
diff-png ./out blobin-golden/golden --gate r8
```

Gate (same as P3): max channel delta ≤ 4, ≤ 1 % pixels over threshold,
SSIM ≥ 0.99. Any breach = R8 RED.

`render_goldens` is a Qt test binary (not yet committed — placeholder until a
CI runner with Qt's software RHI is provisioned). It instantiates a
`BlobInItem`, drives it to each mascot state with a fixed clock, snapshots the
QQuickWindow into a PNG, and exits.

## Hardware run (reference box)

Same procedure, with the default GL RHI. Tolerances relaxed: max delta ≤ 6,
SSIM ≥ 0.98 (driver noise on integrated GPUs adds a small permanent floor).
Result is **informational** for the sign-off — the strict gate is the software
RHI run.

## Sign-off

Reviewer records both runs in `tools/r8-sign-off.json`. R8 GREEN only when
software RHI ≤ R8 tolerances **and** hardware run shows no qualitative regression
(no visible banding, no edge sparkles, no colour cast vs the golden contact
sheet).
