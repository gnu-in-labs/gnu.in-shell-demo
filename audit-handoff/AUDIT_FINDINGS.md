# GNU.IN Workspace — Audit Findings Register

**Date:** 2026-06-27 · **Scope:** `~/Projects/Gnu.in/` (all repos) · read-only

**Live-state authority** (use these, never the stale docs): `components.lock.toml`,
`release/VERSION`, `release/LATEST-BUILD`, `release/GLOBAL-VERSION.json`,
`engine/blob.in/tokens.json`.

## Framing context (applies to many findings)

- **Actual release train:** `v0.14.2` / channel `beta` / build `20260624-170024-97a86b5`.
- **QML is retired-as-tech.** Forward chrome is native Rust/sctk under
  `gnu.in-os/engine/gnuin-*` (bar, dock, osd, notification, background, launcher,
  lock, settings-gpui, compose-core/host, …). Token codegen is **Rust/C++/GPUI-first**;
  QML is **opt-in**; **Dart retired**. Treat QML-surface fixes as interim or wontfix;
  verify the native replacement instead.
- **Token authority:** `engine/blob.in/tokens.json` is `v0.14.0`. The
  `gnu.in-design-reference` mirror is **in sync** (also `v0.14.0`) — but the
  prose/docs around it still say `v0.4.0`.

## Severity legend

- **CRITICAL** — wrong/contradictory at an authority surface or agent entry point, or security.
- **WARNING** — stale/inaccurate; misleads but not load-bearing.
- **NOTE** — hygiene, governance, tracking.

## Summary table

| ID | Sev | Area | Status | Task |
|----|-----|------|--------|------|
| F01 | CRITICAL | WORKSPACE_INVENTORY version | open | T03 |
| F02 | CRITICAL | WORKSPACE_INVENTORY component revs | open | T03 |
| F03 | CRITICAL | SKILL.md chrome kit pointer | open | T01 |
| F04 | CRITICAL | SKILL.md motion rule | open | T01 |
| F05 | CRITICAL | SKILL.md surface color `#F5EEDD` vs `#F7F3ED` | open | T01/T04 |
| F06 | CRITICAL | `error.log` account-ID leak | open | T02 |
| F07 | WARNING | SKILL.md / README mascot asset | open | T01 |
| F08 | WARNING | SKILL.md / docs token version `v0.4.0` | open | T01/T08 |
| F09 | WARNING | README codegen list (Dart/GPUI/QML) | open | T05 |
| F10 | WARNING | DESIGN_ASSET_MANIFEST missing 06-09 bundles | open | T06 |
| F11 | WARNING | DESIGN_SOURCE_INVENTORY 571 vs 547 file delta | open | T19 |
| F12 | WARNING | `sigma-flutter` vs `findin-file-manager` name | open | T08-name |
| F13 | WARNING | `surfaces.toml` lags engine (native hosts) | open | T09 |
| F14 | WARNING | `runtime.toml` stale pointers | open | T10 |
| F15 | WARNING | chrome icon family (Material Symbols vs Nerd Font) | decision | T11 |
| F16 | WARNING | AppLauncher "v3.2" badge | open | T12 |
| F17 | NOTE | `topbar` vs `taskbar` naming | open | T09 |
| F18 | NOTE | 3 repos unpinned in components.toml | open | T16 |
| F19 | NOTE | UiKitSurface placeholders (QML preview) | downgraded | T13 |
| F20 | NOTE | ControlsSurface gallery gaps (QML preview) | downgraded | T14 |
| F21 | NOTE | Dock/ServiceManager glyphs (archived) | wontfix? | T17 |
| F22 | NOTE | GnuinMotion.qml duplicate `checkTick` key | open | T15 |
| F23 | NOTE | v0.14.3 draft unreferenced in ROADMAP | open | T18 |
| F24 | NOTE | orphan root artifacts DP-1/DP-2/audits | open | T20 |
| F25 | NOTE | `gnu.in.lab` undefined scope | open | T21 |
| F26 | RESOLVED | Lift/Origami clock clip — already fixed in tree | close-out | T07 |

---

## Detail

### F01 · CRITICAL · `docs/WORKSPACE_INVENTORY.md` is 2 minor versions behind
Generated 2026-06-16; states `Current release train: v0.12.0` and
`Latest promoted build: 20260616-110125-824d3e1`. Actual: `v0.14.2` /
`20260624-170024-97a86b5` (`release/VERSION`, `release/LATEST-BUILD`). The whole
v0.13.x + v0.14.x work (JJ overhaul, gnuin-bar, settings-core, arch A–E) is
unrepresented.
**Fix:** regenerate from live git, or add a stale-doc banner redirecting to
`GLOBAL-VERSION.json`. → **T03**

### F02 · CRITICAL · WORKSPACE_INVENTORY component revs don't match the lock
All four pinned revs are stale; the shell branch is wrong.
| Component | Inventory | `components.lock.toml` |
|---|---|---|
| gnu.in-shell | `7273849` / live/jj-overhaul-template | `0c476fce` / **feat/osd-rust-slice** |
| gnu.in-design-reference | `18b8355` | `82d03288` |
| gnu.in-gnosis-app | `9ac677d` | `a46e7d0d` |
| gnuin-hyprconf | `2abce25` | `3d82e71f` |
**Fix:** correct table from the lock + GLOBAL-VERSION. → **T03**

### F03 · CRITICAL · SKILL.md points at the deprecated terminal-panel kit
SKILL.md: *"UI kit: `ui_kits/gnu-in-shell/index.html`…"*. `TASTE.md §1` +
`UPGRADE_PATH.md`: that file is *"identity-mood reference only — not how the
chrome actually looks"*; canonical chrome is `ii-bar-upgrade.html`. SKILL.md is
the agent entry point, so this misdirects every chrome build.
**Fix:** repoint to `ii-bar-upgrade.html`; mark `index.html` deprecated chrome. → **T01**

### F04 · CRITICAL · SKILL.md presents flat-bézier motion as the default
SKILL.md hard-rules `cubic-bezier(0.2,0.7,0.2,1)` with no layer split. `TASTE.md §2`:
chrome uses **M3-expressive springs with overshoot** (`--ease-expressive`); the
flat curve is identity/terminal-layer only.
**Fix:** add the two-layer split to SKILL.md. → **T01**

### F05 · CRITICAL · Canonical light surface contradiction (`#F5EEDD` vs `#F7F3ED`)
`tokens.json` `color.surface = #F7F3ED`; `colors_and_type.css` `--gnu-shell: #F7F3ED`
("canonical surface") and `--gnu-shell-cream: #F5EEDD` ("filled backgrounds only").
But README §Color + SKILL.md hard-rule **`#F5EEDD`** as the canonical Shell White.
The most-used surface color is wrong at the agent entry point.
**Fix:** align docs → token (`#F7F3ED` canonical, `#F5EEDD` cream/fills), *or*, if
the brand truly wants `#F5EEDD`, change the **token** — they must match. → **T01 / T04**

### F06 · CRITICAL · `error.log` at workspace root leaks a live account ID
Untracked root `error.log` (superpowers/ChatGPT bridge, 2026-06-12) contains
`account_id=24665ee9-…` in plaintext.
**Fix:** delete; add `*.log` to a root `.gitignore`; repoint the bridge to a temp path. → **T02**

### F07 · WARNING · Mascot asset: SKILL.md vs README disagree
SKILL.md: use `assets/mascot/syster-master-adaptive.svg`. README §Iconography:
canonical mascot is `assets/mascot/pack/hero.png` (1254×1254 + six layers); the
SVG masters are "legacy adaptive/safe-area".
**Fix:** SKILL.md → `pack/hero.png`; note the SVG as legacy/vector-only. → **T01**

### F08 · WARNING · Token version drift in prose (`v0.4.0` vs `v0.14.0`)
`tokens.json` is `v0.14.0`; README, DESIGN_SOURCE_INVENTORY, and SKILL.md narrate
`v0.4.0`. (History: v0.4.0 import → v0.5.0 B05 unification → v0.14.0 on 2026-06-16.)
Keep the *context-spec bundle* id at v0.4.0 — that's a different thing.
**Fix:** bump prose version strings. → **T01 / T08**

### F09 · WARNING · README token codegen-target list is stale
README: *"lowers tokens.json into GnuTheme.qml, gnu_theme.rs, gnu_theme.h, and
gnu_theme.dart"* (two places). Reality (`tokens.json` comment + TOKEN_AUTHORITY_REPORT):
**Dart retired**, **GPUI primary** (`gnu_theme.gpui.rs`), **QML opt-in**.
**Fix:** update both spots. → **T05**

### F10 · WARNING · DESIGN_ASSET_MANIFEST omits the 2026-06-09 bundles
Lists only the original two ZIPs. Missing: context-spec v0.4.0
(`JRg03EBXcnwgrFcOx2Hy6w`), gnu-in-design-system (`HA-SsOC39xUkJJVyLyoFMw`),
gnosis-app HUD (`ztID4C533zzimECTHu2ATg`) — 120 files incl. the blob.in Rust workspace.
**Fix:** append provenance + SHA256s (in P0 Fix Drafts FIX 6). → **T06**

### F11 · WARNING · DESIGN_SOURCE_INVENTORY 571 vs 547 file delta
Inventory claims 571 covered files; `IMPORT_2026-06-09_REPORT` accounts for
431 + 120 − 4 = 547. 24 unexplained.
**Fix:** run `tools/verify-design-reference.sh`; document the delta. → **T19**

### F12 · WARNING · `sigma-flutter` (inventory) ≠ `findin-file-manager` (disk)
WORKSPACE_INVENTORY §2.8 names `sigma-flutter`; the folder is
`findin-file-manager/` (with `gpui-frontend/`). Rename or wrong repo.
**Fix:** confirm canonical name; update §2.8. → **T08-name**

### F13 · WARNING · `contracts/surfaces.toml` lags the engine
~18 surfaces have a native Rust host in `engine/gnuin-*`, but the contract records
only `owner_qml` for all but `shellSettings` (the sole `owner_rs`). No field
encodes the QML→Rust migration state or the `shell.*Host` selector.
**Fix:** add `native_host` / `host_selector` / `migration_state` per surface
(drafts + 19-surface mapping in P2 Contract Drafts §A). → **T09**

### F14 · WARNING · `contracts/runtime.toml` stale pointers
`active_release = "2026-05-26-gnuin-os"` (a month stale vs build 2026-06-24);
`profile = "stable"` contradicts `CHANNEL=beta`. Also `[wallpaper] enabled=false`
while native wallpaper crates exist (flag, not auto-fix).
**Fix:** refresh `active_release`; reconcile `profile`/channel (P2 §B). → **T10**

### F15 · WARNING · Chrome icon family — Material Symbols vs Nerd Font (DECISION)
Design system mandates **Material Symbols Rounded** ("confirmed in `Appearance.qml`"
— the QML shell). Native `engine/gnuin-bar/src/text.rs` loads a **Nerd-Font (MDI)**
face and ships `nf-md-*` codepoints. The stated authority points at retiring tech.
**Recommendation:** split by layer — native chrome = Nerd-Font MDI, identity = cube
family; retire "Material Symbols = chrome" as QML-era (P2 §C). → **T11**

### F16 · WARNING · AppLauncher "v3.2" badge
Orange "v3.2" matches no current version (OS v0.14.2, tokens v0.14.0). Surface-audit
P4. Land the fix on native `gnuin-launcher`, not only QML `AppLauncher.qml`.
**Fix:** remove or bind to `release/VERSION`. → **T12**

### F17 · NOTE · `topbar` vs `taskbar` naming inconsistency
Surface is `[surfaces.taskbar]` but namespace `gnuin-topbar`, selector
`shell.topbar.host`, host `TopbarHost.qml`. **Owner decision: standardize on
`taskbar`.** Cross-repo grep + schema-enum update + QML file rename, one commit (P2 §A).
**Fix:** rename `topbar`→`taskbar` everywhere. → **T09**

### F18 · NOTE · Three active repos unpinned in `components.toml`
`gnuin-alaelestia-component` (complete), `gnu.in-syster-app` (Phases 0–4),
`findin-file-manager` (in progress) aren't in the manifest, so the build rail
can't lock/verify them.
**Fix:** pin (kind `library`/`optional`) or document the exclusion. → **T16**

### F19 · NOTE (downgraded) · UiKitSurface placeholders
`components/preview/UiKitSurface.qml`: static date `"21:47 · TUESDAY, MAY 13"`,
near-empty ALERTS panel, onboarding overlaps mascot, "veille" chip clipped.
**QML preview/reference surface** — fix only if it stays a shipped design surface;
else migrate the reference to HTML/native. → **T13**

### F20 · NOTE (downgraded) · ControlsSurface gallery gaps
`ControlsSurface.qml`: numbering jumps C.10→C.18 (C.11–C.17 absent), C.18 Divider
draws no line, C.02 Button overflows. Same QML-reference caveat as F19. → **T14**

### F21 · NOTE (wontfix?) · Dock + ServiceManager initials/monograms
Internal surfaces fall back to letter initials / "ADV/DOC/PN" monograms. But both
are `source_family=legacy` / `kind=archived` in `surfaces.toml`. Don't invest
unless un-archived. → **T17**

### F22 · NOTE · `GnuinMotion.qml` duplicate `checkTick` key
TOKEN_AUTHORITY_REPORT flags a duplicated `checkTick` in `motionAtomMetrics`
(JS last-wins; latent). One-line de-dupe. → **T15**

### F23 · NOTE · `v0.14.3` draft unreferenced
`docs/releases/v0.14.3.md` drafts real work (settings-core, schema split, rail
automation) but ROADMAP/WORKSPACE_INVENTORY don't mention it.
**Fix:** add to ROADMAP Phase S4. → **T18**

### F24 · NOTE · Orphan root artifacts
`DP-1/`, `DP-2/`, `audits/settings-launcher-2026-06-07/` — untracked at root
(open since the 06-16 inventory).
**Fix:** move to `gnu.in-os/audit/visual/` or delete; root `.gitignore`. → **T20**

### F25 · NOTE · `gnu.in.lab` undefined scope
Initialized only; no boundary vs `gnu.in-os/docs/prospect/` or throwaway.
**Fix:** add a scope statement + `.gitignore`. → **T21**

### F26 · RESOLVED (close-out) · Lift/Origami clock clip is already fixed
The 2026-06-11 surface audit root-caused the clipped clock ("16:2") to
`Lift.qml`/`Origami.qml` lacking `implicitWidth`. **No longer true** — both now
do `implicitWidth: holder.width` / `implicitHeight: holder.height` (holder uses
`childrenRect`). The native `gnuin-bar` measures text via `fontdue`, so the class
can't recur there either.
**Action:** don't patch — re-run the surface-audit harness and **mark the
2026-06-11 P1 item resolved**. → **T07**

---

## Carried-forward open items (WORKSPACE_INVENTORY §7, still open)

- Branch protection / review rulesets — not confirmed on main branches.
- CI green on a clean (no-GUI) runner — unconfirmed (ROADMAP Phase 0).
- `tools/status.sh` source-only mode — still needed for headless CI (Phase 1).
- `gnu6.live` website — Phase 5 not started; no repo/deploy plan.
- `sigma-flutter` uncommitted files (`.agents/`, `CMakeLists.txt`, `src/`).

→ **T22** consolidates the Phase 0/1 gates.
