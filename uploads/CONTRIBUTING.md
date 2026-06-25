# Contributing to GNU.IN OS

GNU.IN OS is an experimental, local-first desktop runtime. It accepts
agent-assisted work, but **agents do not own the project** — the source tree,
tests, documentation, and human review remain the authority. This file is the
front door for contributors; it orchestrates the canonical docs rather than
restating them. Follow the links for the detail.

This repository (`gnu.in-os`) is the **OS integration workspace**: it owns
contracts, state, engine services, release staging, and cross-component
verification. Frontend and selected services live in pinned component repos
resolved through `components.toml` / `components.lock.toml`.

## Read first

Before any substantial change, read the governing docs:

- [`PROJECT_CHARTER.md`](PROJECT_CHARTER.md) — project identity, public stance, and non-negotiables.
- [`AGENTIC_OPERATING_MODEL.md`](AGENTIC_OPERATING_MODEL.md) — how humans and agents are allowed to work.
- [`SECURITY_AND_AUTOMATION_BOUNDARIES.md`](SECURITY_AND_AUTOMATION_BOUNDARIES.md) — risk boundaries for IPC, D-Bus, shell, screenshots, audio, telemetry.
- [`CODEBASE_STANDARDS.md`](CODEBASE_STANDARDS.md) — Rust/Bash/QML/native style and the definition of done.
- [`VERSIONING_AND_RELEASES.md`](VERSIONING_AND_RELEASES.md) — version scheme, release layers, and the bump workflow.
- [`../AGENTS.md`](../AGENTS.md) — the repository agent contract.

**Source authority:** the source tree is the truth. Runtime installs under
`~/.local`, session config under `~/.config`, LAB paths, and the Obsidian vault
are **not** source authority unless their contents are copied into the repo.

## Permission model

Work is gated by permission level (full detail in
[`AGENTIC_OPERATING_MODEL.md`](AGENTIC_OPERATING_MODEL.md)):

| Level | Scope | Approval |
|-------|-------|----------|
| 0 Observe | Read, summarize, identify risks, propose plans | none |
| 1 Draft | Write doc drafts, prepare patches/PRs on a branch | none |
| 2 Stage | Edit source on a **feature branch**, run verification | branch + focused commits |
| 3 Apply | Touch `main`, tags, CI, security/licensing files | **explicit human instruction** |
| 4 Live mutation | `tools/promote-latest.sh`, restart services, write `~/.config`/`~/.local`, deploy | **explicit human approval per action** |

Pause and request human review for changes that execute shell from model output,
expand D-Bus/IPC authority, change socket paths or shared-memory layouts, touch
`tools/promote-latest.sh` / release pointers, alter licensing or public
positioning, or add network calls / telemetry.

## Environment setup

Prerequisites for source work (CI is source-only and must not assume a live
desktop):

- **Rust** stable toolchain — `cargo`, `clippy`, `rustfmt`. The repo has multiple
  Cargo projects under `engine/`, not one root workspace, so commands run per
  manifest.
- **Python 3** — used by the `tools/` audit/release scripts (`ruff`, `pytest`).
- **Bash** — operational scripts use `set -euo pipefail`.
- **Runtime only** (not required for source CI): Hyprland + Quickshell. The local
  session is a development target, not source authority.

Setup:

1. Clone `gnu.in-os` plus the sibling component repos it pins (`gnu.in-shell`,
   `gnu.in-design-reference`, `gnu.in-gnosis-app`, `gnuin-hyprconf`) as siblings.
2. Let the materializer assemble the staged shell — **never hand-copy files
   between repos**:
   ```sh
   tools/materialize-shell.sh
   ```
3. Validate the tree before changing anything:
   ```sh
   tools/status.sh --strict
   ```

## Daily workflow

The canonical rail is **status → verify → build → promote**. See
[`TOOLS_REFERENCE.md`](TOOLS_REFERENCE.md) for the full script catalogue and
[`README.md` → Required Workflow](../README.md#required-workflow).

<!-- AUTO-GENERATED:contributing-workflow START — do not edit by hand; run /update-docs -->

| Step | Command | Purpose |
|------|---------|---------|
| Status | `tools/status.sh --strict` | Validate tree state; fail on dirty/untracked source. |
| Verify | `tools/verify.sh` | Source-only contract verification (the CI gate). |
| Coherence | `tools/check-release-coherence.sh` | Guard release-cascade couplings before a promote. |
| Build | `tools/build.sh` | Produce a signed, staging-isolated artifact. |
| Promote | `tools/promote-latest.sh <build-id>` | ⚠ Live promotion — explicit human approval only. |

<!-- AUTO-GENERATED:contributing-workflow END -->

## Code style

Condensed from [`CODEBASE_STANDARDS.md`](CODEBASE_STANDARDS.md):

- **Rust** — small modules, explicit error handling, no `unwrap()` in daemon
  paths, typed request/response structs at IPC boundaries, pinned + documented
  shared-memory layouts. Run `cargo fmt --check`, `cargo clippy --all-targets
  --all-features -- -D warnings`, `cargo test` (per manifest).
- **Bash** — `set -euo pipefail`; print what is mutated; no silent fallbacks in
  release paths; keep staging and live mutation separate.
- **QML / Quickshell** — small composable surfaces; prefer service singletons
  over hidden cross-component state; document each surface's layer-shell
  namespace, focus, and exclusivity.
- **C/C++/native bridge** — pin ABI assumptions with compile-time assertions;
  keep FFI boundaries narrow; document ownership across language boundaries.

## Testing

Pin new or changed behavior with a **contract test** so it cannot silently
regress. Verified entrypoints:

<!-- AUTO-GENERATED:contributing-tests START — do not edit by hand; run /update-docs -->

| Scope | Command | Run from |
|-------|---------|----------|
| OS source contracts | `tools/verify.sh` | `gnu.in-os/` |
| OS tool tests | `python -m pytest tools/tests/` | `gnu.in-os/` |
| Engine crates | `cargo +stable test` (per manifest under `engine/`) | crate dir |
| Engine lint | `cargo +stable clippy --all-targets -- -D warnings` | crate dir |
| Shell components | `bash tools/run-component-tests.sh` | `gnu.in-shell/` |
| Alaelestia components | `bash tools/verify-alaelestia.sh` | `gnuin-alaelestia-component/` |
| Hyprconf | `cargo test --workspace` | `gnuin-hyprconf/` |
| Syster app | `syster-app/build/syster-app --self-test` | `gnu.in-syster-app/` |

<!-- AUTO-GENERATED:contributing-tests END -->

CI should verify the source tree without pretending to be a live Hyprland
session; prefer source-only checks (`tools/verify.sh`) over runtime checks that
need the maintainer's graphical session.

## Commit & PR discipline

Prefer a branch and a draft PR for non-trivial work. Keep changes small and
reviewable. Commit message prefixes:

`docs:` · `ci:` · `fix:` · `feat:` · `refactor:` · `test:` · `security:`

Every PR must answer (see [`AGENTIC_OPERATING_MODEL.md`](AGENTIC_OPERATING_MODEL.md)):

- Why is this change needed?
- What changed?
- What risk boundary does it touch?
- How was it tested?
- What remains unverified?
- Is rollback obvious?

## Definition of done

A change is done only when:

- the source tree reflects the intended change and is committed (or pending state
  is explicitly reported — **untracked source files are a blocker**);
- `tools/verify.sh` passes, or failures are reported with exact causes;
- documentation is updated if behavior, workflow, or public meaning changed;
- release/rollback implications are understood;
- the PR explains the risk.

A change is **not** done merely because it compiles once or looks right in the
shell.

## Public claim discipline

You may honestly describe GNU.IN OS as experimental, local-first, agent-assisted,
user-ownership oriented, and disciplined about staging and review. **Do not**
claim it is production-ready, secure by design, safe for autonomous agents, or
ready for non-technical users unless the repository provides direct evidence.

## See also

- [`TOOLS_REFERENCE.md`](TOOLS_REFERENCE.md) — every script in `tools/`.
- [`RUNBOOK.md`](RUNBOOK.md) — release, promotion, and rollback procedures.
- [`ARCHITECTURE_DEPLOY_CHECKLISTS.md`](ARCHITECTURE_DEPLOY_CHECKLISTS.md) — per-change deploy/rollback gates.
