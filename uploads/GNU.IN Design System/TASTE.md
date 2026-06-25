---
name: gnu-in-better-taste
description: The taste layer for GNU.IN. Read this BEFORE shipping any GNU.IN interface or asset — it is the opinionated quality bar that sits on top of the tokens in colors_and_type.css. Use it to upgrade existing work and to judge new work. Pairs with README.md (foundations) and SKILL.md (entry point).
user-invocable: true
---

# Better-Taste — the GNU.IN quality bar

Tokens tell you what's *allowed*. This tells you what's *good*. When a choice is technically on-brand but feels cheap, busy, or generic, this file is the tie-breaker. **Restraint is the house style.** One thousand no's for every yes.

---

## 0. The one decision that governs the rest: color is DYNAMIC

The OS chrome is **fully dynamic** — surfaces *and* accent are derived from the wallpaper by matugen at runtime. Taste consequences:

- **Never hardcode the chrome accent.** Reach for the M3 role tokens (`--m3-primary`, `--col-layer0…3`, `--m3-secondary-container`) — not `--gnu-orange`. A mock that pins orange into the chrome is *off-brand now*, because the real OS would never show it that way.
- **The brand orange is identity, not chrome.** It lives on the cube, the app icon, the notification badge, splash and marketing — fixed points that stay constant *while the chrome shifts around them*. That contrast (constant identity ⊕ dynamic surface) is the actual brand feeling. Use `--brand-accent` for those moments and nothing else.
- **Design for a scheme family, not one palette.** Anything you build should look right whether the wallpaper yields mauve, amber, teal, or slate. Test it against at least two. If it only works in orange, it's not finished. (`ii-bar-upgrade.html` demonstrates this with its scheme toggle.)

---

## 1. Two layers, never blended

| | **Identity layer** | **Chrome layer** |
|---|---|---|
| Speaks | atomic-age warmth, hand-drawn, terminal | Material You, precise, dynamic |
| Color | fixed GNU orange / beret green | wallpaper-derived M3 roles |
| Type | Montreal + IBM Plex Mono | the shell's rounded sans @ `wght 450` |
| Icons | the Sys.ter cube family (`assets/symbols/`) | **Material Symbols Rounded** |
| Motion | calm `--ease-standard` | expressive springs (overshoot) |
| Where | logo, app icon, mascot, badge, splash, decks | bars, panels, menus, settings, product UI |

The fastest way to look amateur with this brand is to put the terminal aesthetic into the chrome (anthracite + Plex Mono panels) or to let the dynamic accent leak onto the cube. Keep the membrane clean.

> Note: the original `ui_kits/gnu-in-shell/index.html` (anthracite "terminal panel" with Plex-Mono and dot-workspaces) was built before the real shell was located. It is **identity-mood reference only** — not how the chrome actually looks. The canonical chrome is `ii-bar-upgrade.html`. Don't propagate the terminal-panel styling into new product surfaces.

---

## 2. Motion has a bounce — use it

The shell runs M3-Expressive springs, not flat easings. Spatial moves (a workspace indicator stretching, a panel opening, a pill resizing) use `--ease-expressive` / `--ease-expressive-fast` — the overshoot is *intentional* and is half the personality. Color/opacity fades use `--ease-expressive-effects` (200ms). Reserve the calm `--ease-standard` for the identity/terminal layer. **No linear, no ease-in-out defaults.** A move with no overshoot reads as a different, lesser OS.

What *not* to do: infinite decorative loops, parallax, springy hover on everything. The bounce belongs on state changes, not ambient motion.

---

## 3. Density, rhythm, restraint

- **Earn every element.** No filler stats, no decorative icons next to labels that don't need them, no "3 notifications · 5 updates · 2 alerts" data-slop. If a pill shows one number, show one number.
- **Group, don't box.** The shell separates with rounded `--col-layer1` pill *groups* and hairlines (`--col-layer0-border`), never heavy bordered boxes. Prefer a faint group background + generous internal `gap` over dividers and frames.
- **Hairlines over walls.** Dividers are 1px `--m3-outline-variant`. If you're drawing a 2px border to separate things, you're shouting.
- **Tabular numbers everywhere a number can change** (clock, %, counts): `font-variant-numeric: tabular-nums`. Jitter is a tell.
- **Radii are a scale, not a vibe.** Chrome: `small 12 / normal 17 / large 23`, window `18`, screen `23`, pills `999`. Never mix two radii on one element. The connected-workspace-pill trick (adjacent radii collapse to ~2px when neighbours are occupied) is signature — preserve it.

---

## 4. Iconography discipline

- **Chrome icons = Material Symbols Rounded**, `wght 450`, `opsz 20`, `FILL 0` at rest / `FILL 1` when active. Match the shell exactly; do not substitute Lucide in product chrome (Lucide stays a *fallback* only where Material Symbols genuinely can't load).
- **Identity marks = the cube family**, untouched — theme via CSS vars, never recolor by hand, never redraw.
- **No emoji. Ever.** CLI glyphs (`>_ ▸ · ● ╭ ╮`) are the only decorative punctuation, and only in the terminal/identity layer — not in M3 chrome.

---

## 5. Copy taste

Terminal-first but human. Lowercase by default, present tense, declarative. Bilingual FR/EN is authentic — pick whichever lands shorter. Describe state (`LISTENING`, `VEILLE`), don't personify. No marketing puffery ("blazing", "delightful", "revolutionary"). The orange dot in `gnu.in` is the only branded flourish. See README → CONTENT FUNDAMENTALS for the lexicon.

---

## 6. The upgrade checklist (run this on every file)

1. **Accent**: is any chrome color hardcoded orange? → move to `--m3-primary` / role tokens. Orange only on identity.
2. **Scheme-proof**: does it still read under a second wallpaper-derived scheme? → if not, fix.
3. **Motion**: do spatial state-changes use an expressive spring with overshoot? → upgrade flat easings.
4. **Icons**: chrome on Material Symbols Rounded? identity on the cube family? no emoji? → fix.
5. **Density**: any filler content, decorative numbers, or heavy boxes? → delete / soften to hairlines + groups.
6. **Numbers**: tabular-nums on anything that ticks? → add.
7. **Radii**: one radius per element, from the scale? → align.
8. **Layer hygiene**: terminal aesthetic kept out of chrome; dynamic accent kept off the cube? → separate.

If a file passes all eight, it has taste. If you changed something, note it so the next pass is faster.
