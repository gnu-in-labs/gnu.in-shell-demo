# GNU.IN Workspace — Design & Spec Audit · Handoff

**Date:** 2026-06-27
**Scope:** `~/Projects/Gnu.in/` — all repos, read-only audit
**Auditor note:** point-in-time snapshot. Live-state authority is
`components.lock.toml` + `release/VERSION` + `release/LATEST-BUILD` +
`release/GLOBAL-VERSION.json` + `engine/blob.in/tokens.json` — **not** the
WORKSPACE_INVENTORY or any "v0.4.0" prose.

---

## Start here

This package audits the workspace for **deprecated data, misalignment, and
out-of-date specs** across every repo's docs, contracts, assets, and components.
It found **19 distinct issues** (5 critical, 8 warning, 6 note) and, on the deep
pass into `contracts/` + `engine/`, several more that reframe the originals.

The single most important framing: **QML is retired-as-tech.** The forward chrome
is native Rust/sctk under `gnu.in-os/engine/gnuin-*`; token codegen is
GPUI/Rust-first with QML opt-in and Dart retired. So the real debt is **not**
broken QML — it is that the **design-system docs and OS contracts have not caught
up to the v0.14.x native migration**. One QML bug the earlier audit flagged
(the clipped taskbar clock) is already fixed in the tree.

---

## What's in this package

| File | What it is |
|---|---|
| `README.md` | This file. |
| `AUDIT_FINDINGS.md` | The full findings register — every issue with severity, evidence, file path, impact, and fix. The portable/greppable source of truth. |
| `REMEDIATION_CHECKLIST.md` | The 22 remediation tasks as a Markdown checklist, grouped by priority (mirror of the interactive checklist). |
| `AUDIT_DROP_MANIFEST.json` | Machine-readable manifest of this drop (house `ZIP_DROP_MANIFEST.json` style). |
| `Gnu.in Audit Report.dc.html` | **Interactive** findings report — severity-coded cards with evidence blocks. |
| `Gnu.in Audit Checklist.dc.html` | **Interactive** 22-task work order — check-off state persists in `localStorage`, progress bar, retirement-aware notes, tweak toggles. |
| `Gnu.in P0 Fix Drafts.dc.html` | **Interactive** paste-ready before/after blocks for the P0 + P1 doc edits (copy buttons). |
| `Gnu.in P2 Contract Drafts.dc.html` | **Interactive** contract/schema drafts + the chrome-icon decision memo (copy buttons). |
| `support.js` | DC runtime. Required for the `.dc.html` files to render. |

## How to open the interactive artifacts

The `.dc.html` files load `./support.js` (in this folder) which pulls React from
a CDN — **open them over a local web server** (not `file://`) with network access:

```sh
cd audit-handoff
python3 -m http.server 8080
# then open http://localhost:8080/Gnu.in%20Audit%20Checklist.dc.html
```

To open them inside the real repo instead, drop the four `.dc.html` files at the
repo root (they will use the repo's existing `support.js` / `dc-boot.js`). The
Markdown files need no runtime — read them anywhere.

---

## Severity counts

- **5 CRITICAL** — wrong at an authority surface or agent entry point, or security.
- **8 WARNING** — stale/inaccurate; misleads but not load-bearing.
- **6 NOTE** — hygiene, governance, tracking.

## Top of the list (do first)

1. **`SKILL.md` — 5 corrections** (chrome kit, motion layer, mascot asset,
   canonical surface `#F5EEDD`→`#F7F3ED`, token version `v0.4.0`→`v0.14.0`).
   It is the agent entry point and contradicts the live token authority. Paste-ready in P0 Fix Drafts.
2. **Delete `error.log`** at the workspace root — it leaks a live account ID.
3. **Regenerate `WORKSPACE_INVENTORY`** — it states v0.12.0 (actual v0.14.2) and
   four stale component revs (one on the wrong branch).
4. **Close the 2026-06-11 surface audit** — its P1 (taskbar clock clip) is already
   fixed in `Lift.qml` / `Origami.qml`; the item was never marked resolved.

See `AUDIT_FINDINGS.md` for everything and `REMEDIATION_CHECKLIST.md` for the
ordered task list.
