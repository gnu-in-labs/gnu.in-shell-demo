# blob.in — Engineering Notes

> Working notes on non-obvious engineering decisions, kept separate from the
> spec/plan so the rationale survives for anyone studying the code. Append-only,
> dated. Each entry: the problem, the options considered, the trade-offs, the
> call. These are *thinking artifacts* — the "why", not the "what".

---

## EN-01 · 2026-06-08 · C++ shim LoC budget vs. the radial item

### Problem

The architecture stakes a headline claim: the C++ side is a thin render shim,
**≤ 300 LoC**, enforced by `tools/loc-guard.sh` (gate R5). Adding the
BubbleBloom recipe (M.12) meant a second `QQuickItem` (`BloomItem`). First cut:

```
blobin_item.h          37
blobin_item.cpp       100
blobin_material.h      17
blobin_material.cpp    51
blobin_bloom_item.h    34
blobin_bloom_item.cpp  84
─────────────────────────
TOTAL                 323   ← over budget (300)
```

The two items duplicated the whole `updatePaintNode` body (node creation,
geometry allocate, two memcpy, markDirty) and the frame-clock wiring.

### Options considered

**A · Dedup the mesh upload into a shared free function** *(chosen, first pass)*
`uploadBlobMesh(node, verts, idx)` with external linkage in `blobin_item.cpp`,
called by both items. Removes ~20 duplicated lines.
- ✅ Better design anyway: the hot path lives in exactly one place.
- ✅ Keeps both items as pure render shims (no logic added).
- ⚠ Got to 313 — still 13 over. Necessary but not sufficient.

**B · Also dedup the frame-clock wiring** *(chosen, second pass)*
Both constructors run an identical `windowChanged → beforeSynchronizing`
lambda. Factor into `wireFrameClock(item, slot)`.
- ✅ Removes ~5 lines per item, real duplication.
- ✅ One place to get the DirectConnection / transparent-window contract right.
- Net: brings the total under 300 honestly.

**C · Extract a `BlobRenderItem` base class**
Base holds clock + window wiring + the dpr/size/dt boilerplate; each item
implements only `advance(dt)` and `meshNode(old)`.
- ✅ Most "OO-correct" — zero duplication between items.
- ❌ A base header + vtable for two items is over-engineering; the shared free
  functions (A+B) give 90 % of the benefit with less ceremony and no virtual
  dispatch on a hot path.
- Rejected: cost/benefit doesn't justify it at two items. Revisit at 4+.

**D · Drop a feature (e.g. `leaves` property) to fit the number**
- ❌ Engineering the LoC count by removing real capability is dishonest — it
  games the metric instead of respecting its intent. Rejected on principle.

**E · Raise the documented budget to ~340 with justification**
- The budget was a proxy for "C++ stays thin / no logic", not a sacred number.
  A genuine second item type is a legitimate reason for the shim to grow.
- ❌ But A+B remove enough *real* duplication that we don't need to move the
  goalpost. Kept 300 because we can meet it without gaming it. If a third item
  type lands and A+B are exhausted, **then** raise the budget (to ~120 LoC per
  item type) rather than start golfing — and record it here.

### Decision

Apply **A + B** (shared `uploadBlobMesh` + `wireFrameClock`). Budget stays 300;
the guard stays meaningful (it still trips if *logic* — not just a new pure
render item — creeps into C++). Base class (C) is the documented next step if
the item count grows; budget raise (E) is the fallback after that, never (D).

### Principle extracted

> The LoC guard measures a *principle* (C++ is thin and logic-free), not a
> line count for its own right. When it trips: first remove real duplication
> (A/B), then factor (C), then — only with written justification — move the
> budget (E). Never delete capability to satisfy the number (D).

---

## EN-02 · 2026-06-08 · Why two free functions instead of a base class

Tiny note, cross-ref EN-01·C. `QQuickItem` subclasses sharing a render path is
the textbook base-class case, but at **two** concrete items the indirection
(virtual `advance`/`meshNode`, a third header, fragile protected state) costs
more reading than it saves. Free functions with external linkage keep the data
flow flat and greppable: `uploadBlobMesh` is *the* hot path, period. The moment
a third render item appears (notif pills? tray sliders?), the duplication in
the per-item `onFrame`/ctor crosses the threshold and the base class earns its
keep — that is the trigger to refactor, not before.
