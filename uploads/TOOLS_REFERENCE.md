# Tools Reference

Catalogue of the governance, verification, build, and release scripts in
[`tools/`](../tools). These scripts are the operational surface of the OS
workspace — the equivalent of a `package.json` scripts block for this
Rust/Bash/Python repo.

- The **scripts themselves are the source of truth.** The tables below are
  generated from each script's header, usage string, or `--help`. Regenerate
  with `/update-docs` rather than hand-editing the generated block.
- Run everything **from the repo root** (`gnu.in-os/`), e.g. `tools/status.sh`.
- Scripts marked **⚠ approval** mutate live runtime or release state and require
  explicit human approval (Level 4 — see
  [`AGENTIC_OPERATING_MODEL.md`](AGENTIC_OPERATING_MODEL.md)). Agents must not run
  these by default.
- Canonical entry points are summarized in the README's
  [Required Workflow](../README.md#required-workflow).

<!-- AUTO-GENERATED:tools-reference START — do not edit by hand; run /update-docs -->

## Daily workflow & verification

| Command | Description |
|---------|-------------|
| `tools/status.sh [--strict]` | Validate workspace tree state across the pinned repos; `--strict` fails on dirty/untracked source. Run at the start of every session. |
| `tools/verify.sh` | Run source-only contract verification — the canonical pre-build / CI gate. |
| `tools/verify-contracts.sh` | Verify system contracts (schema and IPC-boundary checks). |
| `tools/preflight-contract-check.sh` | Preflight contract-check wrapper implementing the preflight gate policy. |
| `tools/check-release-coherence.sh` | Read-only guard over release-cascade couplings (branch-doc version, `tokens.json` major.minor, engine→design-ref mirror, lock revs, GLOBAL-VERSION revs). Fails non-zero on drift so it can gate a promote. |

## Build & promotion

| Command | Description |
|---------|-------------|
| `tools/build.sh` | Build pipeline with strict staging isolation; writes signed artifacts under `build/releases/<build-id>/`. Staging-only — never mutates live runtime. |
| `tools/validate-build-signature.sh <release-dir>` | Validate a build's signature and manifest integrity for a release directory. |
| `tools/finish-release.sh` | ⚠ approval — one-shot release finisher: preflight (clean trees, lock verify, coherence guard) → build → promote → push → cleanup. |
| `tools/promote-latest.sh <build-id>` | ⚠ approval — promote a verified, signed build into the live runtime. |
| `tools/backup.sh` | Back up source refs to the LAB bare Git remote / prepare for remote push. |

## Versioning & component locks

| Command | Description |
|---------|-------------|
| `tools/bump-version.sh [--patch\|--minor\|--major\|--set X] [--channel C] [--dry-run]` | Canonical version-bump helper; validates against `contracts/versioning.toml` before writing `release/VERSION` and `release/CHANNEL`. |
| `tools/bump <subcommand>` | Command dispatcher for version/lock subcommands (e.g. `tools/bump lock <component>`). |
| `tools/bump-lock.sh <component>` | Refresh a component lock manifest from the current checked-out component head. |
| `tools/bump-lock <component>` | Backward/forward-compatible alias for lock mutation. |
| `tools/components.py` | Component manifest engine: resolve and record component revisions/branches into `components.toml` / `components.lock.toml`. |
| `tools/components-status` | Show component pin/lock status. |
| `tools/materialize-shell.sh` | Assemble the staged shell runtime tree from the pinned shell + Gnosis component repos before verify/build. |
| `tools/update-global-version-manifest.py` | Generate the agent-facing `GLOBAL-VERSION.json` (and per-build `global-version.json`) manifest. |
| `tools/validate-versioning-contract.py` | Validate version/channel proposals against the versioning contract. |

## Design-token cascade

| Command | Description |
|---------|-------------|
| `tools/sync-design-tokens.sh` | Regenerate the blob.in token outputs from `tokens.json` and mirror them into the design-reference component, rehashing its inventory (first half of the token cascade). |
| `tools/sync-shell-design.sh [--check]` | Mirror the design-reference token surface into the committed `gnu.in-shell` checkout (shell half of the cascade); `--check` makes committed-mirror drift a promote-blocking gate. |
| `tools/sync-release-cascade.sh` | Run the automatable half of the design-token release cascade end-to-end (regen → mirror → shell-materialize). |

## Audit & inventory

| Command | Description |
|---------|-------------|
| `tools/audit-boot-sequence.py` | Audit the boot/session anti-lockout protocol. |
| `tools/taskbar-surface-audit.py` | Audit taskbar/topbar layer placement against live shell authority (live and static modes). |
| `tools/runtime-ui-scan.py` | Scan runtime UI surfaces and emit the runtime-UI matrix evidence. |
| `tools/runtime-ui-matrix.sh` | Build/refresh the runtime-UI matrix (SQLite evidence under `audit/`); wrapper over `runtime-ui-scan.py`. |
| `tools/audit-jillarious-settings-coverage.py` | Audit settings coverage against the Jillarious overhaul reference. |
| `tools/audit-jillarious-surface-coverage.py` | Audit shell-surface coverage against the Jillarious overhaul reference. |
| `tools/inventory-jillarious-reference.py` | Inventory the Jillarious overhaul design-reference inputs. |
| `tools/inventory-motion-specs.py` | Inventory motion/spec zip sources without extracting them (reproducible audit evidence). |
| `tools/import-phase1-7-ledger.py` | Generate the phase 1.7 causal-ledger event fixtures (`phase1_7_events.json`). |
| `tools/gh04_scanner.py` | Scan for hardcoded paths, model blobs, and secret formats (pre-publish safety scan). |

## Surface & config utilities

| Command | Description |
|---------|-------------|
| `tools/generate-keybinds.sh` | Generate keybinding outputs (staging-isolated). |
| `tools/provision-hyprctl-compat.sh` | Install a user-space `hyprctl`/Abseil compatibility shim for repo-skewed Hyprland builds. |
| `tools/check-blobin-default-flip-ready.sh` | Check whether the BlobIn default-backend flip is ready to land. |
| `tools/gnoclip` | `gnoclip` — GNU.IN local operator CLI. |

## Subdirectories

| Path | Description |
|------|-------------|
| `tools/generators/generate-contracts.py` | Generate contract definitions from source. |
| `tools/github/` | GitHub automation config (`README.md`, `rules`). |
| `tools/tests/test_components_lockfile.py` | Pytest coverage for the components lockfile tooling. |

<!-- AUTO-GENERATED:tools-reference END -->

## See also

- [`README.md` → Required Workflow](../README.md#required-workflow) — the canonical status → verify → build → promote rail.
- [`RUNBOOK.md`](RUNBOOK.md) — operational procedures for release, promotion, and rollback.
- [`VERSIONING_AND_RELEASES.md`](VERSIONING_AND_RELEASES.md) — version scheme, release layers, and the bump workflow.
- [`ARCHITECTURE_DEPLOY_CHECKLISTS.md`](ARCHITECTURE_DEPLOY_CHECKLISTS.md) — per-change deploy/rollback gates.
