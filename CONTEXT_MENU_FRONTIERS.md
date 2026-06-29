# Context-Menu Frontiers — agentic GnuContextMenu
> Roadmap to drastically augment Central's context menu into the real **GnuContextMenu** primitive (`uploads/Gnosis App/gnosis/ctxmenu.jsx`), wired to the agentic backend (Gnosis · gnu6 socket). Anatomy top→bottom: **context header · deterministic sections · deferred "gnosis suggère…" · privacy/resource footer**. Governing law: *the menu opens INSTANTLY with known actions; suggestions fill after — the engine never blocks the open; the menu never mutates directly (risky actions route through plan→apply).*

Date: 2026-06-25 · Builds on the compose-core menu (23 styles, MenuRow nodes, edge-aware, motion-driven).

---

## Frontiers

| # | Frontier | What it adds | Source |
|---|---|---|---|
| **CM-1** | **Agentic anatomy** ← NEXT | Rebuild the menu to the GnuContextMenu shape: **context header** (eyebrow · title · sub · meta chips), **deterministic sections** (instant), **deferred "gnosis suggère…"** (open instantly → `thinking` spinner + skeleton → `ready` after ~600ms, non-blocking), **privacy/resource footer**. | `ctxmenu.jsx` GnuContextMenu |
| **CM-2** | **Risk tiers + plan→apply** | Every item carries a `risk` (`observe`/`local`/`system`); `confirm` items route through an inline **plan → apply** confirm row — the menu never mutates directly. | `confirm`, `cm-confirm` |
| **CM-3** | **Context-aware role kits** | Menu content derived from live ctx (`focus.role`): **browser · editor · terminal · media · compositor** kits, each with contextual actions + tailored suggestions. | `ROLE_KIT`, `buildWindowMenu` |
| **CM-4** | **Three menu families** | One primitive, three builders: **Window** (per-role) · **Orb** (gnosis assistant: state · profiles · unload) · **Resource** (VRAM governor: loaded models · Eco/Full-Burn). | `buildWindow/Orb/Resource` |
| **CM-5** | **Keyboard navigation** | Flat keyboard list over enabled items **+ ready suggestions**; ↑/↓/Enter; Esc / outside-press dismiss (focus-grab analog). | `flat`, cursor nav |
| **CM-6** | **Privacy lamps + resource governor** | Footer **privacy lamps** (mic / vision · live/safe/off, clickable) + **VRAM chip** with pressure state + **mode/tier chip**. | `privacyLamps`, `vramChip` |
| **CM-7** | **Agent-bus binding** | Bind deferred suggestions + action dispatch to the real **Gnosis agent bus** (gnu6 socket, capability grants) when live; locally simulated. | `agents.jsx` Agent Bus |

## Sequence — implementation order

**CM-1 is the attack** and carries the agentic core (the deferred suggestion engine), so it lands with CM-2 (risk + plan/apply), CM-5 (keyboard), and CM-6 (footer lamps + chips) woven in — those are inseparable from the anatomy. CM-3 (role kits) and CM-4 (orb/resource families) follow as content layers on the same primitive. CM-7 (real socket) is the final binding once the local simulation is proven.

**Risk vocabulary** (semantic, fixed tokens): `observe` (read-only, no badge) · `local` (writes a local artifact — amber badge) · `system` (mutates runtime/power — red badge, always confirm).

**Agentic contract realized in Central:** right-click → menu paints instantly with deterministic actions → a simulated agent (setTimeout ~600ms, the gnu6-socket stand-in) flips `gnosis suggère` from `thinking` (spinner + 2 skeleton rows) to `ready` (contextual suggestions). Risky actions show **plan ready · apply?** inline. Footer shows mic/vision privacy lamps + VRAM. This is the local mirror of the agent bus; CM-7 swaps the timer for the socket.

---

## Status

- ✅ **CM-1 · Agentic anatomy** — header · risk-tiered sections · deferred "gnosis suggère" (thinking→skeleton→ready ~620ms) · privacy/resource footer. Live in Central's context menu.
- ✅ **CM-2 · Risk + plan→apply** — `observe`/`local`/`system` badges + inline plan→apply confirm for risky actions. Woven into CM-1.
- ✅ **CM-3 · Role kits** — browser/editor/terminal/media/compositor/window content from the focused window's role.
- ✅ **CM-4 · Three families** — Window · **Orb** (gnosis: état · profil · modèles) · **Resource** (VRAM governor: loaded models · Eco/Full-Burn), switchable via an in-menu segmented control.
- ✅ **CM-6 · Footer lamps + chips** — mic/vision lamps + mode/VRAM chips.
- ✅ **Molecule-spec catalogue (2026-06-26)** — GnuContextMenu anatomy now exists as **3 data records** in `molecule_specs.json` (family `agentic`, **30 molecules total**): `AgenticGnuContextMenu` (layout `agentic-panel`), `AgenticPlanConfirm` (`agentic-confirm`), `AgenticSuggestBubble` (`agentic-suggest`). Risk/badge/suggest/plan/privacy are canonically specced as model-level fields; `MoleculeRenderer` covers all 30 with 0 bespoke code. Kills the double-implementation for this surface. Icons added: `plan · suggest · privacy · scope · back · rename · file`.
- ✅ **CM-5 · Keyboard nav** — flat keyboard cursor over enabled items + ready suggestions; ↑/↓ (clamp at ends), neutral-on-open (first ↓ selects row 0), Esc + outside-press dismiss (precedence **Esc > outside > select**), risk `observe`. Specced in the **Atelier** (gnosis ▸ ux) and committed to `port-data/`: `keyboard_nav.rs` (`KeyboardNav` + `step` + `dismisses`, 7 tests), the **AgenticKeyboardNav** molecule (`agentic-panel` → **31 molecules total**), and golden fixture `scenes/keyboard-nav.json` (5 cases).
- ◧ **CM-7 · Agent-bus binding** — **seam built** in the Atelier: a transport-abstracted `GnosisBus` framed in the real `host_protocol` envelope (`{version, message}`, newline-delimited JSON), with a capability grant (`infer.shell.uiux`, TTL) + a live wire readout. `SimTransport` loopback stands in for the ~620ms timer; the real gnu6 `SocketTransport` is the remaining drop-in (final).
