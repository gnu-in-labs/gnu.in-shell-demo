# Versioning and Release Policy

GNU.IN OS is officially on the beta train. Beta means the local build, promotion,
rollback, and runtime verification loop is real enough to label and compare
builds, not that the project is production-ready.

The current policy is intentionally conservative: use dated internal build
identifiers for local runtime promotion, attach a semantic version signature
on the active release channel to every build, and use public tags only when the
release notes, limitations, and rollback story are coherent.

Current tracked release train:

```text
version: 0.14.2
channel: beta
```

## Release layers

The project has three different release concepts. They should not be mixed.

### 1. Development commits

Normal commits on branches or `main`. These are not releases.

A commit may be useful, broken, experimental, or incomplete. Commit messages should be clear, but a commit is not a promise of installability.

### 2. Local build artifacts

Produced by `tools/build.sh` under `build/releases/<build-id>/`.

The build ID is operational, not marketing. It should record:

- timestamp;
- commit SHA;
- dirty state;
- verification result;
- artifact hashes;
- beta version signature.

The build script writes `build-manifest.json`, `version-signature.json`, and
`manifests/SHA256SUMS`. Those files are the source of local artifact truth.
`manifests/SHA256SUMS` must include both JSON metadata files and must not include
itself.

For component-sourced builds, the manifest also records `components` metadata
from `components.toml` and `components.lock.toml`. The release validator requires
the pinned `gnu.in-design-reference` revision to be present and mounted as
`design_system`, and cross-checks that metadata against the copied component
manifest and lock. A build artifact can therefore be traced back to the exact
singular design source used to stage it.

Promotion copies the signed build manifest and component manifest/lock into the
runtime metadata directory. `tools/status.sh --strict` uses those files to check
that the live runtime still reports the promoted `gnu.in-design-reference`
revision mounted as `design_system`.

The version signature format is:

```text
gnu.in-os/v<version>+<build-id>
```

Example:

```text
gnu.in-os/v0.8.0-beta.1+20260606-171728-d4839ac
```

### 3. Private GitHub release channel

The GitHub repository may host private pre-releases before the project is ready
for public distribution. Private releases are allowed for maintainer dogfooding,
cross-machine testing, and package-manager channel integration, but they are not
public install claims.

Private GitHub releases should still include:

- build ID or source commit;
- artifact checksums;
- release notes;
- known limitations;
- rollback notes when known;
- whether the artifact is local-session-only, dogfood, or external-test ready.

The Gnosis package-manager surface treats this as a release channel named
`github_releases`. It should default to the private `gnu-in-labs/gnu.in-os`
repository now, and the same channel can become public later when release
readiness is proven.

The same package-manager surface may also expose source packages backed by
GitHub repositories. Source package sync is for maintainer workflows: it can
show local checkout drift, plan upstream/GitHub synchronization, and apply that
plan only after an explicit confirmation token. This is separate from public
release readiness; syncing source packages to private GitHub remotes is not a
claim that the project is externally installable.

### 4. Public release tags

A public GitHub release or tag should exist only when the project has:

- documented scope;
- known installation or promotion path;
- release notes;
- verification evidence;
- known limitations;
- rollback notes if applicable.

Until then, use private pre-releases or public pre-release tags only.

## Suggested version scheme

Use semantic versioning for public releases, but remain below `1.0.0` while the runtime, packaging, security model, and update path are not stable.

Historical and forward track:

- `v0.1.0-alpha`: first documented experimental source release;
- `v0.2.0-alpha`: CI and governance baseline operational;
- `v0.3.0-alpha`: reproducible local build and documented install path;
- `v0.4.0-alpha`: release artifacts uploaded with checksums;
- `v0.5.0-alpha`: first dogfoodable daily-driver snapshot for the maintainer;
- `v0.8.0`: first official beta train with signed local build artifacts;
- `v0.12.0`: JJ-first shell-overhaul checkpoint train;
- `v0.14.2`: current beta checkpoint train with automated release-coherence guards and token authority;
- `v1.0.0`: first non-beta target, only after installation, update, rollback, security boundaries, and docs are stable enough for non-maintainer users.

Patch versions should be boring. If a change modifies behavior, IPC, config, or runtime layout, it is not a patch unless the change is backward-compatible and low-risk.

## Tag format

Public tags:

```text
v0.x.y-alpha.N
v0.x.y
```

Local build IDs:

```text
YYYYMMDD-HHMMSS-<short-sha>
YYYYMMDD-HHMMSS-<short-sha>-dirty
```

Build signatures:

```text
gnu.in-os/v0.x.y+YYYYMMDD-HHMMSS-<short-sha>
gnu.in-os/v0.x.y+YYYYMMDD-HHMMSS-<short-sha>-dirty
```

Do not reuse tags. Do not move public tags after publishing.

## Release readiness checklist

Before creating a public release:

- [ ] `tools/verify.sh` passes;
- [ ] release notes are written;
- [ ] current limitations are listed;
- [ ] install or promotion path is documented;
- [ ] rollback path is documented;
- [ ] licensing status is clear;
- [ ] security-sensitive changes are called out;
- [ ] all release artifacts have checksums;
- [ ] the release is marked pre-release unless the project is truly stable.

For runtime builds promoted locally:

- [ ] source tree is clean, unless explicitly marked dirty;
- [ ] `tools/status.sh --strict` is used locally where appropriate;
- [ ] `tools/build.sh` completes;
- [ ] `tools/validate-build-signature.sh <release-dir>` passes;
- [ ] build ID is recorded;
- [ ] `tools/promote-latest.sh <build-id>` is run only with explicit intent;
- [ ] post-promotion status is checked.

## Release notes format

Each release note should include:

```markdown
# v0.x.y

## Status
Experimental / dogfood / external test / stable.

## What changed
- ...

## Verification
- ...

## Known limitations
- ...

## Security and privacy notes
- ...

## Upgrade or promotion path
- ...

## Rollback
- ...
```

## What not to claim

Do not claim:

- production-ready;
- secure by design;
- verified chain integrity;
- safe autonomous control;
- distro-ready;
- non-technical user-ready;

unless those claims are backed by specific implementation, tests, documentation, and release evidence.

## Practical current release target

The current realistic release milestone is a beta runtime snapshot, not a stable
distribution release:

```text
v0.14.2 — beta checkpoint with signed local runtime build
artifacts, promotion record, rollback notes, global subrepo tracking, and beta
limitations. GNU.IN stays on the beta channel until 1.0.0.
```

That release should say plainly that the project is beta, local-first,
experimental, and primarily useful for review, maintainer dogfooding, and early
external testing where rollback is understood.

## Automated version bump workflow (agent-facing)

`tools/bump-version.sh` is the canonical helper for patch/minor/major version
movement and channel targeting. It validates proposals against
`contracts/versioning.toml` before writing `release/VERSION` and `release/CHANNEL`.

```sh
# refresh component lock manifests from current checked-out component heads
tools/bump lock gnu.in-shell
tools/bump-lock gnu.in-shell
```

Suggested commands:

```sh
# next patch on current channel (safe and contract-checked)
tools/bump-version.sh --patch --dry-run
tools/bump-version.sh --patch

# explicit minor jump, then keep beta channel
tools/bump-version.sh --minor --channel beta

# set explicit version for a known checkpoint and keep contract-valid channel
tools/bump-version.sh --set 0.14.2 --channel beta

# private/canary or dev lanes are allowed only with explicit operator intent
ALLOW_PRIVATE_RELEASES=1 tools/bump-version.sh --minor --channel canary
tools/bump-version.sh --minor --channel dev --allow-private
```

Pre-1.0.0 release policy:

- `beta` is the default dogfood track;
- `preview`, `canary`, and `dev` are allowed for pre-release/private use:
  - `preview`: invited or public prerelease testing.
  - `canary`: restricted to GNU.IN members; intended for fast checkpoints.
  - `dev`: restricted to GNU.IN members; intended for internal automation.
- `stable` is blocked below `1.0.0` by contract validation.
