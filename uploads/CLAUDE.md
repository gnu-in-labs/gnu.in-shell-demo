# GNU.IN Workspace — Claude Desktop Context

This folder is the org-level workspace for the **gnu-in-labs** project:
an experimental local-first desktop runtime built on Hyprland + Quickshell.

## Key facts

- **Current release**: v0.14.2 / channel=beta / latest build `20260621-131852-9695821`
- **Primary OS repo**: `gnu.in-os/` — source authority, release tooling, engine services, contracts
- **Live target**: local Hyprland/Quickshell session (`~/.local/share/gnuin-shell/`) — NOT source authority
- **Agent posture**: read/draft/stage freely; live promotion requires explicit human approval (`tools/promote-latest.sh`)

## Repository map

| Repo | Role | Active branch |
|------|------|--------------|
| `gnu.in-os/` | OS integration workspace, release rail, engine | `main` |
| `gnu.in-shell/` | Quickshell/QML desktop shell | `feat/osd-rust-slice` *(Phase S4)* |
| `gnu.in-gnosis-app/` | Gnosis app surface (tracking, overlays, voice/vision) | `live/ii-overhaul-template` *(Phase S4)* |
| `gnuin-hyprconf/` | Rust authority layer for Hyprland settings | `main` |
| `gnu.in-design-reference/` | Design tokens, assets, reference specs | `main` |
| `gnuin-alaelestia-component/` | Reusable QML/C++ visual component library | `main` |
| `gnu.in-syster-app/` | Native QtQuick/QML coding app (syster.app) | `main` |
| `hyprdynamicmonitors/` | Optional monitor profile daemon (external, pinned) | `main` |
| `dot-github/` | GitHub org profile + community files | `main` |
| `tension-atoi/` | Personal public profile | `main` |
| `gnu.in.lab/` | Private lab/staging repo | `main` |

> **0.14.x integration model:** `main` is the canonical integration branch.
> During Phase S4 (shell visual/behavioral overhaul), `gnu.in-shell` is pinned to
> `feat/osd-rust-slice` and `gnu.in-gnosis-app` to `live/ii-overhaul-template` —
> these are active work branches, not deprecated aliases. All other components pin
> `main`. Once Phase S4 surfaces land, components relock to `main`.

## Session start checklist

Before substantial changes to `gnu.in-os`:
```sh
tools/status.sh --strict          # tree state
tools/verify.sh                   # source-only verification
```

Component tests:
```sh
# gnu.in-shell
bash tests/run-component-tests.sh

# gnuin-alaelestia-component
bash tools/verify-alaelestia.sh

# gnuin-hyprconf
cargo test --workspace

# gnu.in-syster-app
syster-app/build/syster-app --self-test
```

## Component pinning

`gnu.in-os/components.lock.toml` pins exact revisions of all component repos.
`tools/materialize-shell.sh` assembles the staged shell from those pins before
verify/build. Never hand-copy files between repos — let the materializer do it.

## Boundaries (non-negotiable)

- Do NOT edit `~/.local/share/gnuin-shell/` directly
- Do NOT run `tools/promote-latest.sh` without explicit human approval
- Do NOT treat the Obsidian vault as source authority
- Do NOT copy `gnu.in-gnosis-app` source into `gnu.in-shell` by hand
- Do NOT leave untracked source files in `gnu.in-os`

## Agent permission levels (from AGENTIC_OPERATING_MODEL.md)

- **Level 0** (default): read, summarize, identify risks
- **Level 1**: write docs drafts, prepare patches on branch
- **Level 2**: update source on feature branch, run verify commands
- **Level 3** (requires explicit human instruction): touch `main`, tags, deploy scripts, promote

## Key docs

- `gnu.in-os/AGENTS.md` — detailed agent contract
- `gnu.in-os/docs/PROJECT_CHARTER.md` — project identity and public stance
- `gnu.in-os/docs/ROADMAP.md` — phased roadmap (Phase 0 near-complete; Phase 1 in progress)
- `gnu.in-os/docs/AGENTIC_OPERATING_MODEL.md` — agent permission model
- `gnu.in-os/docs/SECURITY_AND_AUTOMATION_BOUNDARIES.md` — risk boundaries
- `gnu.in-os/docs/CODEBASE_STANDARDS.md` — Rust/Bash/QML standards
