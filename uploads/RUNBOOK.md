# Runbook

Operational procedures for releasing, promoting, and rolling back GNU.IN OS.

GNU.IN has **no service fleet**. "Deploy" means: land the change on the live
template branch, then **promote a signed build on the host**. Builds are
staging-isolated; only `tools/promote-latest.sh` mutates the live runtime, and it
requires explicit human approval (Level 4 — see
[`AGENTIC_OPERATING_MODEL.md`](AGENTIC_OPERATING_MODEL.md)).

Source: this runbook condenses
[`ARCHITECTURE_DEPLOY_CHECKLISTS.md`](ARCHITECTURE_DEPLOY_CHECKLISTS.md) (the
shared deploy frame) and [`VERSIONING_AND_RELEASES.md`](VERSIONING_AND_RELEASES.md).
Command details live in [`TOOLS_REFERENCE.md`](TOOLS_REFERENCE.md).

## Release & promotion procedure

### 1. Pre-deploy (sandbox-verifiable)

<!-- AUTO-GENERATED:runbook-predeploy START — do not edit by hand; run /update-docs -->

```sh
tools/status.sh --strict            # all trees clean, no untracked source
tools/verify.sh                     # source contracts pass (runtime-signature row is host-only)
tools/check-release-coherence.sh    # branch-doc version, tokens.json, mirror revs, lock revs, GLOBAL-VERSION revs
# Touched Rust crates (run per manifest):
cargo +stable clippy --all-targets -- -D warnings
cargo +stable test
# Touched shell (run in gnu.in-shell/):
bash tools/run-component-tests.sh
```

<!-- AUTO-GENERATED:runbook-predeploy END -->

- New/changed behavior must be pinned by a **contract test**.
- `components.lock.toml` relocked for every changed component; branch-doc table updated.
- All three trees (`gnu.in-os`, `gnu.in-shell`, `gnu.in-design-reference`) clean.

### 2. Deploy (host-only — needs GitHub auth + live Hyprland session)

The one-shot finisher runs preflight → build → promote → push → cleanup:

<!-- AUTO-GENERATED:runbook-deploy START — do not edit by hand; run /update-docs -->

```sh
# Push source first (gnu.in-os, gnu.in-shell, gnu.in-design-reference, + gnu.in.lab if touched)
tools/finish-release.sh             # ⚠ preflight (clean trees, lock verify, coherence guard) → build → promote → push
# Or run the rail manually:
tools/build.sh                      # signed artifact under build/releases/<build-id>/
tools/validate-build-signature.sh build/releases/<build-id>
tools/promote-latest.sh <build-id>  # ⚠ live promotion — explicit human approval
```

<!-- AUTO-GENERATED:runbook-deploy END -->

Then reload the live shell with **Ctrl+Super+R** (not Super+Shift+R) and
smoke-test the changed surface.

### 3. Post-deploy

- Branch-doc checkpoint and `release/VERSION` reflect the promoted build.
- Release notes / [`TECH_DEBT_REGISTER.md`](TECH_DEBT_REGISTER.md) updated.
- Refresh the LAB backup only when the maintainer wants the sync:
  ```sh
  tools/backup.sh
  ```

## Version bump

`tools/bump-version.sh` validates proposals against `contracts/versioning.toml`
before writing `release/VERSION` and `release/CHANNEL`.

<!-- AUTO-GENERATED:runbook-bump START — do not edit by hand; run /update-docs -->

```sh
tools/bump-version.sh --patch --dry-run     # preview a contract-checked patch
tools/bump-version.sh --patch               # apply
tools/bump lock <component>                 # refresh a component lock from its checked-out head
```

<!-- AUTO-GENERATED:runbook-bump END -->

`beta` is the default track; `preview`/`canary`/`dev` require explicit operator
intent; `stable` is blocked below `1.0.0` by contract.

## Health checks & monitoring

There are no remote health endpoints — verification is local:

- `tools/status.sh --strict` — confirms the live runtime still reports the
  promoted `gnu.in-design-reference` revision mounted as `design_system`.
- `tools/validate-build-signature.sh <release-dir>` — signature/manifest integrity.
- **Live smoke test** — reload the shell (Ctrl+Super+R) and exercise the changed
  surface.
- `tools/runtime-ui-matrix.sh` / `tools/taskbar-surface-audit.py` — UI surface
  evidence when a visual/layer change is in play.

## Rollback

<!-- AUTO-GENERATED:runbook-rollback START — do not edit by hand; run /update-docs -->

```sh
# Source rollback:
git revert <merge>
tools/bump lock <component>                 # relock back to the previous head
python tools/update-global-version-manifest.py
# Runtime rollback (promote the previous signed build):
tools/promote-latest.sh <previous-build-id>
```

<!-- AUTO-GENERATED:runbook-rollback END -->

**Triggers:** any contract regression, a shell that won't reload, or a Wayland
surface that fails to lay out.

## Common issues

| Symptom | Fix |
|---------|-----|
| `hyprctl` JSON fails / Abseil version skew breaks taskbar state | `tools/provision-hyprctl-compat.sh` installs a user-space shim for repo-skewed Hyprland builds. |
| `check-release-coherence.sh` fails | Read which class drifted (branch-doc version, `tokens.json` major.minor, engine→design-ref mirror, lock rev, GLOBAL-VERSION rev) and re-sync — often `tools/sync-release-cascade.sh`. |
| Dirty / untracked source blocks a build | Commit or explicitly report the pending state; untracked source is a hard blocker. |
| Shell launches with missing tokens (`GnuTheme` undefined) | Re-materialize (`tools/materialize-shell.sh`) or revert the change that dropped the committed mirror. |
| Build won't promote / wrong design-ref rev | Confirm the pinned `gnu.in-design-reference` revision is present and mounted as `design_system`; re-lock and rebuild. |

## Escalation & approval boundaries

This is a maintainer-gated project, not an on-call rotation. "Escalation" means
**stopping for explicit human approval** before any Level 4 action:

- `tools/promote-latest.sh` and `tools/finish-release.sh` (promote step);
- restarting user services;
- writing into `~/.config`, `~/.local`, `/run/user`, or remote VPS paths;
- deploying `gnu6.live`.

Each Level 4 action requires a known build/artifact ID, a stated rollback path,
and a post-action health check.

## See also

- [`CONTRIBUTING.md`](CONTRIBUTING.md) — setup, workflow, and PR discipline.
- [`TOOLS_REFERENCE.md`](TOOLS_REFERENCE.md) — every script in `tools/`.
- [`VERSIONING_AND_RELEASES.md`](VERSIONING_AND_RELEASES.md) — release layers and readiness checklist.
- [`ARCHITECTURE_DEPLOY_CHECKLISTS.md`](ARCHITECTURE_DEPLOY_CHECKLISTS.md) — per-recommendation deploy gates (A–E).
