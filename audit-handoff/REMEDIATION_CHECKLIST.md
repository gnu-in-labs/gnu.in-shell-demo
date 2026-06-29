# GNU.IN Audit — Remediation Checklist

22 atomic tasks, priority-ordered. Mirror of the interactive
`Gnu.in Audit Checklist.dc.html` (which persists check state in `localStorage`).
Each task: one repo, one change, one verify condition. Live-state authority is
`components.lock.toml` + `release/VERSION` + `GLOBAL-VERSION.json` + `tokens.json`.

> **QML is retired-as-tech.** Forward chrome is native Rust under `engine/gnuin-*`.
> Tasks marked `[qml-retired]` touch reference/legacy QML — downgraded or wontfix.
> Paste-ready text for the doc edits is in **Gnu.in P0 Fix Drafts** and
> **Gnu.in P2 Contract Drafts**.

## P0 — do now (entry-point truth + security)

- [ ] **T01 · gnu.in-design-reference** — SKILL.md: apply the 5 corrections
  (chrome kit `index.html`→`ii-bar-upgrade.html`; motion two-layer; mascot
  `pack/hero.png`; surface `#F5EEDD`→`#F7F3ED`; token `v0.4.0`→`v0.14.0`).
  _Verify:_ SKILL.md agrees with TASTE.md, `colors_and_type.css`, `tokens.json`.
  _Drafts:_ P0 Fix Drafts FIX 1.
- [ ] **T02 · workspace root** — delete `error.log` (leaks a live account ID);
  add `*.log` to a root `.gitignore`; repoint the bridge to a temp path.
  _Verify:_ no account ID in tree; `git status` clean at root.

## P1 — this week (authority + provenance)

- [ ] **T03 · gnu.in-os/docs** — regenerate WORKSPACE_INVENTORY (v0.12.0→v0.14.2,
  build, 4 component revs/branches, + retirement note). _Drafts:_ FIX 2.
  _Verify:_ matches `components.lock.toml` / `GLOBAL-VERSION.json`.
- [ ] **T04 · gnu.in-design-reference** — README: canonical light surface
  `#F5EEDD`→`#F7F3ED` (table row + the "light surfaces" rule). _Drafts:_ FIX 4.
  _Verify:_ README surface color == `tokens.json` `color.surface`.
- [ ] **T05 · gnu.in-design-reference** — README: fix the token codegen list
  (drop Dart, add GPUI-primary, QML opt-in), both spots. _Drafts:_ FIX 5.
- [ ] **T06 · gnu.in-shell/assets** — DESIGN_ASSET_MANIFEST: add the 3 June-9
  bundles (IDs + SHA256s). _Drafts:_ FIX 6.
- [ ] **T07 · gnu.in-shell** — close AUDIT_SURFACES_2026-06-11: the Lift/Origami
  clock fix already landed. Re-run the harness; mark the P1 resolved. `[qml-retired]`
  _Note:_ no patch needed; native `gnuin-bar` measures text via fontdue.

## P2 — coherence (contracts + version truth)

- [ ] **T08 · gnu.in-design-reference** — bump token version `v0.4.0`→`v0.14.0`
  across DESIGN_SOURCE_INVENTORY + README (keep context-spec bundle at v0.4.0).
  _Drafts:_ FIX 7. Also: confirm `findin-file-manager` vs `sigma-flutter` name (§2.8).
- [ ] **T09 · gnu.in-os** — `surfaces.toml`: add `native_host`/`host_selector`/
  `migration_state` per surface; **rename `topbar`→`taskbar`** (`gnuin-topbar`,
  `shell.topbar.host`, `TopbarHost.qml`). One commit + schema enum + call sites.
  _Drafts:_ P2 Contract Drafts §A. _Verify:_ no `topbar` identifier remains.
- [ ] **T10 · gnu.in-os** — `runtime.toml`: refresh `active_release`; reconcile
  `profile`/CHANNEL; flag `[wallpaper] enabled`. _Drafts:_ P2 §B.
- [ ] **T11 · gnu.in-design-reference / gnu.in-os** — DECISION: chrome icon family
  (Material Symbols vs Nerd-Font MDI). _Rec:_ split by layer (P2 §C). Then align
  TASTE.md §4 + README + SKILL.md + the native bar.
- [ ] **T12 · gnu.in-shell → gnuin-launcher** — remove the "v3.2" launcher badge
  (or bind to `release/VERSION`); land on the native launcher. `[qml-retired]`

## P3 — surfaces (qml-reference + tracking)

- [ ] **T13 · gnu.in-shell** — UiKitSurface placeholders (LockWake date, ALERTS,
  onboarding overlap, veille chip). Fix only if the preview stays shipped; else
  migrate the reference. `[qml-retired]`
- [ ] **T14 · gnu.in-shell** — ControlsSurface gallery (C.11–C.17 gap, C.18
  divider invisible, C.02 overflow). Same caveat. `[qml-retired]`
- [ ] **T15 · gnu.in-shell** — `GnuinMotion.qml`: de-dupe the `checkTick` key in
  `motionAtomMetrics`.
- [ ] **T16 · gnu.in-os** — pin `gnuin-alaelestia-component` + `gnu.in-syster-app`
  in `components.toml` (or document the exclusion).

## P4 — hygiene (governance + orphans)

- [ ] **T17 · gnu.in-shell** — Dock + ServiceManager glyphs. Both are
  legacy/archived in `surfaces.toml` → confirm and close as wontfix unless
  un-archived. `[qml-retired]`
- [ ] **T18 · gnu.in-os/docs** — reference `v0.14.3` draft in ROADMAP Phase S4.
- [ ] **T19 · gnu.in-design-reference** — reconcile the 571 vs 547 file delta;
  run `tools/verify-design-reference.sh`.
- [ ] **T20 · workspace root** — triage `DP-1/`, `DP-2/`, `audits/` orphans.
- [ ] **T21 · gnu.in.lab** — define scope + `.gitignore`.
- [ ] **T22 · gnu.in-os** — close Phase 0/1 gates: branch protection,
  `status.sh` source-only mode, CI green on a clean runner.

---

**Status as of audit:** all open except **T07** (resolved in tree, needs close-out)
and **T11** (decision pending). Counts: 5 critical · 8 warning · 6 note · 1 resolved.
