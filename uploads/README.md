<p align="center">
  <img src="./docs/assets/gnu-in-os-hero.svg" alt="GNU.IN OS: experimental local-first desktop runtime with source authority, staged builds, bounded agents, and human-gated promotion." width="100%">
</p>

# GNU.IN OS Workspace

This is the canonical source workspace for GNU.IN OS.

GNU.IN is a beta local-first desktop runtime and OS workspace, not the current user's local session. The local session is a test/development instance. Runtime installs under `~/.local`, session config under `~/.config`, and the Obsidian vault are not source authority.

The project is intentionally honest about its maturity: it is fun, ambitious, agent-assisted, and not production-ready. Its goal is to explore a user-owned desktop where shell surfaces, local automation, runtime checks, and local AI can cooperate without making cloud platforms the default authority over the machine.

Current release train: `v0.14.2` (`release/CHANNEL=beta`). Every new
`tools/build.sh` artifact carries a `version-signature.json`, an agent-facing
`global-version.json`, and matching `build-manifest.json` fields.

## System Map

<p align="center">
  <img src="./docs/assets/runtime-map.svg" alt="GNU.IN OS system map showing source authority, apps, shell, engine services, contracts, tools, release artifacts, LAB backups, and local runtime." width="100%">
</p>

## Authority Model

- **Source authority**: `~/Projects/Gnu.in/gnu.in-os`
- **LAB backup remote**: `/mnt/lab/gnuin/_git/gnu.in-os.git`
- **LAB release artifacts**: `/mnt/lab/gnuin/_releases`
- **Runtime install targets**: `~/.local/bin`, `~/.local/share/gnuin-shell`, `~/.config/systemd/user`
- **Vault role**: Governance, planning, architecture context, and handoff notes. The Obsidian vault represents the knowledge and instructions but not the executable codebase.

## Repository Structure & Codebases

This repository is the OS integration workspace. It owns release staging,
runtime state templates, contracts, engine services, and compatibility tests.
Frontend and selected service components are split into private component repos
and pinned by `components.lock.toml`.

- `components.toml` / `components.lock.toml` - Component repo manifest and exact revisions used by this OS branch.
- `engine/` - Core daemon and backend intelligence services (contains `gnosis-engine`, `gnosis-sentinel`, backend scripts, and dynamic blobs).
- `contracts/` - System schema definitions, IPC buffer guidelines, and data boundaries (`runtime.toml`, `surfaces.toml`, gnomon contracts).
- `agent_tasks/` - Spec files and targeted agent mission definitions in JSON format to automate code refactoring and audit trails.
- `state/` - Window manager state boundaries and configurations for integration (e.g., `hyprland/`).
- `tools/` - Governance scripts for repository status checks, build validation, artifact promotion, and backup protocol.
- `release/` - Tracked release metadata, deployment pointers, and history logs.
- `build/` - Transient output directory for compiling binaries and staging OS image/payload constructs.
- `docs/` - Source-authority documentation, protocol specs, and architectural overviews.

Pinned private component repos:

- `gnu.in-shell` - Quickshell/QML desktop shell product surface, including
  the embedded `components/blob.in` organic-shape engine until the standalone
  `gnu-in-labs/blob.in` repo is materialized.
- `gnu.in-design-reference` - Canonical visual reference, assets, token source,
  and provenance. Runtime-eligible design assets/specs are overlaid into the
  staged shell during materialization; QML runtime behavior still belongs in
  `gnu.in-shell`.
- `gnuin-hyprconf` - Rust authority layer for Hyprland settings.
- `gnu.in-gnosis-app` - Gnosis app surface and shell-facing client layer.

`tools/materialize-shell.sh` assembles the pinned shell runtime tree from the
shell and Gnosis component repos before verification and builds; BlobIn is
currently embedded under the shell component at `components/blob.in`.

## Governance Documentation

Start here when reviewing the project as a system rather than as isolated code:

- [`AGENTS.md`](AGENTS.md) - repository-specific instructions for agent-assisted work.
- [`docs/PROJECT_CHARTER.md`](docs/PROJECT_CHARTER.md) - project identity, public stance, AI/vibe-coding disclosure, and non-negotiables.
- [`docs/PUBLIC_DISCLOSURE_GUIDE.md`](docs/PUBLIC_DISCLOSURE_GUIDE.md) - public wording, accessibility, and stance disclosure guidance.
- [`docs/AGENTIC_OPERATING_MODEL.md`](docs/AGENTIC_OPERATING_MODEL.md) - how humans and agents are allowed to work on the repo.
- [`docs/VERSIONING_AND_RELEASES.md`](docs/VERSIONING_AND_RELEASES.md) - versioning, release layers, tag policy, and release checklist.
- [`docs/RELEASE_NOTES_TEMPLATE.md`](docs/RELEASE_NOTES_TEMPLATE.md) - release-note structure and beta wording.
- [`docs/CODEBASE_STANDARDS.md`](docs/CODEBASE_STANDARDS.md) - practical codebase standards for Rust, Bash, QML, native bridges, docs, and CI.
- [`docs/SECURITY_AND_AUTOMATION_BOUNDARIES.md`](docs/SECURITY_AND_AUTOMATION_BOUNDARIES.md) - risk boundaries for local automation, IPC, D-Bus, shell commands, screenshots, audio, and telemetry.
- [`docs/LICENSE_POLICY.md`](docs/LICENSE_POLICY.md) - license policy draft for AGPL-3.0 root scope and mixed-license subcomponents.
- [`docs/ROADMAP.md`](docs/ROADMAP.md) - phased roadmap from governance baseline to external tester path.
- [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md) - contributor setup, daily workflow, testing, and PR discipline.
- [`docs/RUNBOOK.md`](docs/RUNBOOK.md) - release, promotion, rollback, and common-issue procedures.
- [`docs/TOOLS_REFERENCE.md`](docs/TOOLS_REFERENCE.md) - catalogue of every script in `tools/`.

## Required Workflow

Start every agent session or manual intervention here by validating the tree state:

```sh
tools/status.sh --strict
```

For CI or non-graphical runners, this should eventually become a source-only status mode. Until that split exists, CI should prefer `tools/verify.sh`.

Before building an update or release:

<p align="center">
  <img src="./docs/assets/release-rail.svg" alt="GNU.IN OS release rail: status, verify, build, promote, and observe." width="100%">
</p>

```sh
tools/verify.sh
tools/build.sh
```

Use this when preparing checkpoints:

```sh
tools/bump lock gnu.in-shell
tools/bump-lock gnu.in-shell
tools/bump-version.sh --patch --dry-run
tools/bump-version.sh --patch
```

To deploy a verified build payload to the local development session:

```sh
tools/promote-latest.sh <build-id>
```

To back up source refs to the LAB or prepare for remote push:

```sh
tools/backup.sh
```

**CRITICAL RULE**: No source work is considered complete while `git status --short --untracked-files=all` shows uncommitted edits. Ensure all changes are staged and cleanly committed prior to triggering builds or remote operations.

## Public Claim Discipline

Do not claim that GNU.IN OS is production-ready, secure by design, safe for autonomous agents, or ready for non-technical users until the repo proves it through implementation, tests, documentation, release evidence, and rollback paths.

The project may honestly claim that it is experimental, local-first, agent-assisted, user-ownership oriented, and disciplined about staging and review.
