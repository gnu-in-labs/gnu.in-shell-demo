# GNU.IN Design System

> **One mascot, two scales. Atomic-age warmth, terminal-grade clarity.**

This is the design system for **Gnu.in Labs Inc** — the company behind **GNU.IN / Gnu.In‑Shell**, an OS+ shell experience for Arch / Hyprland rendered through Quickshell and driven by live reactive design contracts. **GNU6** is the parent cloud / on‑demand / studio service layer.

The brand pairs a friendly orange‑cube terminal mascot ("the **Sys.ter**", a green‑bereted CLI creature) with a precise geometric‑sans + monospace type system. It's local, reactive, agent‑ready — and it looks like it.

---

## What's in this folder

| Path | What it is |
|---|---|
| `README.md` | This file. Brand overview, content fundamentals, visual foundations, iconography, index. |
| `SKILL.md` | Cross‑compatible skill manifest so an agent (here or in Claude Code) can use this system. |
| `TASTE.md` | **The better-taste quality bar** — opinionated rules layered on top of the tokens. Read this before shipping anything; it governs the dynamic-color stance, the identity/chrome split, motion, density, and an 8-point upgrade checklist. |
| `UPGRADE_PATH.md` | **Study of the real `gnu.in-os` Quickshell repo** (`tension-atoi/illogical-morgue`) vs this system, with a concrete roadmap to reconcile the brand accent with Material You. Read this for the bar-upgrade analysis. |
| `colors_and_type.css` | All design tokens — colors, type scale, spacing, radii, shadows, motion. The single source of truth. |
| `assets/` | Real visual assets: mascot SVGs, symbol sprite, icons, badges, imagery, the original PPTX, the terminal‑signature CSS, ASCII experiments. |
| `preview/` | Small HTML cards that populate the Design System tab. |
| `ui_kits/gnu-in-shell/` | The high‑fidelity recreation of the OS+ shell — desktop, panel, context menu, notifications, onboarding, terminal. **`ii-bar-upgrade.html`** is the faithful recreation of the *real* Quickshell top bar (matugen vs brand-pin); see `UPGRADE_PATH.md`. |

The `assets/` tree breaks down into:

| Sub‑folder | Notes |
|---|---|
| `assets/symbols/` | The canonical brand marks: prompt mark, cube, cube + dialogue, cube‑dialogue mono, app icon, notification badge, contextual assistant badge, and the **`symbol-defs.svg`** sprite for `<use href>` referencing. |
| `assets/mascot/` | The **Sys.ter** mascot pack: **`pack/hero.png`** (canonical assembled mascot, 1254×1254, transparent) plus six co-named layers — `20-shell`, `30-screen`, `40-prompt`, `50-beret`, `60-antenna`, `10-shadow`. The canonical source of truth. |ants), and `rig/` (the 10 named component layers for animation). Plus the legacy adaptive/safe‑area masters. |
| `assets/components/` | SVG templates for notification pill, message card, onboarding card. |
| `assets/imagery/` | Brand imagery: hero wallpaper, mascot illustration, eye‑keyhole grid (security), state‑grammar boards, kit reference sheets. |
| `assets/terminal/` | `web-terminal-signature.css` and `ascii-cli-tui-experiments.md` — ready‑to‑drop terminal signatures for `<pre>` blocks, splash screens, agent TUIs. |
| `assets/source/` | The original `brand-system-v3.pptx` deck for archival reference. |

---

## Sources & provenance

The system was assembled from one canonical source archive plus the working brand kit:

* **`assets/source/brand-system-v3.pptx`** — *Gnu.In‑Shell · brand system v3 · canonical SVG integration*. The strategic doc that establishes the asset hierarchy, naming, state grammar, context‑menu system, visual tokens, and preview sharing model. All content lifts (taglines, principles, hex codes, copy voice) are sourced from here.
* **`assets/mascot/pack/hero.png`** — the canonical assembled Sys.ter (1254×1254, transparent), with a six-layer component pack alongside it for compositing and animation. files live in `assets/mascot/states/`.
* **`assets/symbols/symbol-defs.svg`** — the compact `<symbol>` sprite (`#gnu6-cube`, `#gnu6-cube-dialogue`, `#gnu6-notification-badge`) intended for inline `<use href>` reference in HTML.
* **`assets/terminal/web-terminal-signature.css`** — the v0 CSS variable set the brand has shipped in code; `colors_and_type.css` extends it.

The **real Quickshell source** has since been located: **`tension-atoi/illogical-morgue`** (the `gnu.in-os` dotfiles, `qs.modules.ii` namespace — an *illogical-impulse*-lineage Hyprland desktop). Key files studied: `dots/.config/quickshell/ii/modules/common/Appearance.qml` (M3 tokens, rounding, fonts, expressive-spring motion) and `…/modules/ii/bar/{Bar,BarContent,Workspaces}.qml`. Findings and the reconciliation roadmap live in **`UPGRADE_PATH.md`**; the faithful bar recreation is `ui_kits/gnu-in-shell/ii-bar-upgrade.html`. The brand book (`assets/source/brand-system-v3.pptx`), raster reference boards, and SVG masters remain the identity-layer source.

---

## Identity hierarchy

| Name | Role |
|---|---|
| **Gnu.in Labs Inc** | Founder / brand guarantor. Product stewardship, design language, implementation covenant. |
| **GNU.IN / Gnu.In‑Shell** | The Arch / Hyprland OS+ shell experience: menus, visuals, previews, and system‑level live editing. |
| **GNU6** | The cloud / web / on‑demand / studio service layer. Kept separate from the local OS+ promise. |
| **Sys.ter** | The mascot — orange terminal cube, green beret, antenna, CLI face. Has scales (main vs mini) and a state grammar. |

Use **GNU.IN** in product nav, **Gnu.In‑Shell** in long‑form ("an OS+ shell for Arch / Hyprland"), **GNU6** when referring to the cloud layer or the company‑as‑service. **GNU6** is also the wordmark used in the heroic logo lockups (`GNU6‑shell`).

---

## CONTENT FUNDAMENTALS

The voice is **terminal‑first but human**. It sounds like a careful engineer who also designs — French and English mixed, lowercase by default, mono accents, never breathless.

### Tone & posture

* **Calm, declarative, present tense.** *"local agent ready"*, *"context loaded"*, *"Commande reçue."* Never hypeful. Never imperative‑shouty.
* **Bilingual is OK and brand‑authentic** — the source materials freely mix French and English ("VEILLE", "Commande reçue", "context loaded"). Don't force one or the other; choose the one that lands shorter and cleaner.
* **The product is described, not personified.** The mascot has states, not feelings. Say *"LISTENING"*, not *"I'm listening!"*.
* **Avoid marketing puffery.** No "revolutionary", "blazing‑fast", "delightful". The brand sells precision, not adjectives.
* **Use you/we sparingly.** Most copy is impersonal: *"Right‑click contract"*, *"Open shell editor"*. When you do address the user, lowercase *you*.

### Casing & punctuation

* **Brand wordmarks**: `GNU6`, `GNU6-shell`, `gnu.in`, `gnu.in-shell` — both casings exist and are *both* correct. `GNU6` is louder; `gnu.in` is quieter / system‑level. The dot in `.in` is brand‑critical and is colored orange in lockups.
* **Headers in kits and decks**: `KIT 01 — PROMPT GATE`, `WINDOW SLICE`. ALL CAPS, generous letter‑spacing (~0.18em), em‑dash separators.
* **Body**: sentence case, no period on isolated UI strings, periods in full sentences.
* **Slogans / triplets**: `TERMINAL GATEWAY / COMMAND ACCESS / SYSTEM CLARITY`, `FOCUS / CURSOR / ACTIVE SYSTEM`, `Precise. Minimal. Functional.` Always in threes, separated by `·`, `/`, or `—`.
* **Mono fragments inline**: wrap in code style. *"`>_ context loaded · 3 notifications`"*.

### Vocabulary the brand uses (steal these)

| Concept | Brand says |
|---|---|
| The shell / runtime | *Quickshell*, *shell*, *runtime*, *system* |
| The agent layer | *local agent*, *agent‑ready*, *agentic socket*, *agent command bus* |
| Menus | *contract* (right‑click is a *"contract"*), *card*, *tray*, *pill* |
| State change | *idle*, *listening*, *transmit*, *veille* (sleep) |
| Severity | *stress*, *overload*, *breach*, *glitch*, *failsafe*, *recover*, *reboot*, *stable* |
| Visual claim | *atomic‑age warmth*, *terminal‑grade clarity*, *dimensional enough to feel alive*, *flat enough for UI* |

### Emoji & special glyphs

* **No emoji.** None. The mascot is the emotion; emoji would dilute it.
* **Unicode CLI glyphs are encouraged** — `>_`, `▸`, `·`, `●`, `┌─┐`, `╭─╮`, `└─┘`, `↗`, `Zz`. They're part of the look. See `assets/terminal/ascii-cli-tui-experiments.md` for the canonical patterns.
* **The orange dot in `gnu.in`** is the only branded "punctuation" — don't decorate beyond that.

### Microcopy examples (lift these directly)

* `GNU6-shell ▸ local agent ready >_`
* `[GNU6-shell] >_ context loaded · 3 notifications`
* `>_ 3 notifications en attente`
* `>_ Configure shell context`
* `>_ Commande reçue. Exécution planifiée: ./run`
* `Right-click contract → Open shell editor`

---

## VISUAL FOUNDATIONS

The brand is **flat enough for UI, dimensional enough to feel alive**. Two layers of visual truth coexist: a **system layer** (precise, geometric, monoline) and a **mascot layer** (warm, hand‑drawn, slightly retro‑industrial).

### Color

> **The chrome is fully dynamic (matugen / Material 3).** Surfaces *and* accent are derived from the wallpaper at runtime — see `UPGRADE_PATH.md` and the `--m3-*` / `--col-layer*` role tokens in `colors_and_type.css`. The four canonical hexes below are the **identity layer** (mascot, app icon, badge, splash, marketing), not the chrome accent. Orange survives fully-dynamic only as `--brand-accent`. See `TASTE.md` §0.

The canonical four (identity layer):

| Token | Hex | Role |
|---|---|---|
| Anthracite | `#111418` | Console face, ink, dark surface |
| Signal Orange | `#FF6A00` | Identity accent, the dot in `.in` (NOT chrome) |
| Beret Green | `#5F7F52` | Mascot identity, "stable" state |
| Shell White (cream) | `#F5EEDD` | Prompt glyph, paper, light identity background |

Plus a small derived neutral set (`Soft #F7F8FA`, `Gray #E6E8EB`, `Line #D7DADF`, `Stone #A1A6AD`, `Slate #667085`, `Bezel #2B3037`) and tonal variants of orange and green for hover/focus/inset. **No blueish‑purple gradients, no rainbow accents.** In chrome, the dynamic M3 accent does the work; in identity, the orange does.

Light identity surfaces are **`Shell White` cream, not pure white**, to keep the warmth. Pure white (`#FFFFFF`) is reserved for elevated cards floating *over* shell white.

### Typography

| **Display & UI**: **Montreal** (vendored in `/fonts/` as `Montreal-Regular.woff` and `Montreal-Bold.woff`) — geometric sans, clean, rational, system‑native. Mapped as weight 400 (Regular) and 700 (Bold); Inter is kept as a fallback for the 500/600 weights we don't yet have a file for, with `font-synthesis-weight: auto` allowing the browser to interpolate.
* **Mono / CLI**: IBM Plex Mono (Google Fonts), with `ui-monospace, SFMono-Regular, Menlo` as fallback. The mono face appears anywhere the shell does — terminal blocks, command pills, mascot speech.
* **Hierarchy** is in `colors_and_type.css` as `.t-display-xl` → `.t-micro` plus a special `.t-tag` for the all‑caps labels seen on every kit sheet.
* **Tracking**: tight (`-0.02em`) on display, neutral on body, **generous** (`0.18em`) on uppercase tags. This contrast is part of the look.

### Spacing & layout

* **Grid**: 4px base, doubled scale (`4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96`).
* **Density**: kit sheets and OS surfaces are surprisingly **airy** — generous gutters between sections, hairline dividers (`#D7DADF`) instead of heavy boxes.
* **Layout rules**: a small uppercase `KIT NN — TITLE` label sits top‑left of every brand sheet, with a metadata line top‑right (year, or `window / prompt / product system`). Big hero block. Then a 3‑column variant grid below a hairline. This pattern is portable to product surfaces (small contextual label, big content, structured meta below).

### Backgrounds

* **No gradients in product chrome.** The OS+ shell uses flat anthracite or shell‑white, full stop.
* **One brand image** — the hero cube wallpaper (`assets/imagery/wallpaper-hero.png`), used as a desktop backdrop or full‑bleed cover. It's 1000×563, dark vignette, mascot 3D‑rendered with a green beret and antenna.
* **No repeating patterns or textures** in UI. The terminal *is* the texture.
* **Brand sheets** can use a very subtle off‑white "paper" feel (`#FAF9F6`‑ish) but never a printed texture overlay.

### Imagery vibe

Warm‑neutral. Slightly cinematic. **Dark backgrounds with a single warm light source** when imagery is present (see the wallpaper). Never cool/teal/purple. Mascot illustrations have a **hand‑drawn outlined** style — bold black strokes, flat orange fills, soft green — like a stylized children's‑book industrial illustration.

### Iconography (full section below)

Two parallel systems: **brand symbols** (cube + dialogue + badge) and **state icons** (eye + keyhole grammar for security/lock). Both monoline, both share the orange‑on‑black contrast.

### Borders, radii, cards

* **Radii** are confident: `4 / 8 / 12 / 14 / 20 / 28` and `pill (999)`. The TUI default is **14px**; cube‑shell vibes use **28px**. Never mix radii on the same card.
* **Cards** in light UI: `#FFFFFF` fill, **1px `#E6E8EB` border** (or `#D7DADF` for higher contrast), radius `12–14px`, soft shadow `--shadow-1` or `--shadow-2`. No left‑border accent stripes (we don't do that).
* **Cards** in dark TUI: `#1A1F26` fill, **1px `#2B3037` border**, radius 14px, **`inset 0 0 0 1px rgba(255,255,255,0.04)`** highlight to give it that bezel feel.

### Shadows

Three‑tier, all warm‑ink (no blue tint):

* `--shadow-1` — UI rest, hairline lift.
* `--shadow-2` — menus, popovers, message cards.
* `--shadow-3` — modals, hero overlays.
* `--shadow-glow-orange` — focus ring on interactive elements (`0 0 0 4px rgba(255,106,0,0.18)`).
* `--shadow-inset-bezel` — the dark‑surface terminal bezel highlight.

### Motion & easing

* **Default ease**: `cubic-bezier(0.2, 0.7, 0.2, 1)` — quick start, soft settle.
* **Snap**: `cubic-bezier(0.4, 0, 0.2, 1)` for state changes.
* **Emphatic**: a small overshoot for the mascot's `LIFT → REVEAL → SETTLE` choreography.
* **Durations**: `120 / 200 / 360ms`. Listening pulse cadence is **1400ms**.
* The mascot has a **state alphabet** authored as transforms: beret lifts, antenna pings (concentric arcs), orange ping (transmit), `Zz` overlay (veille). **Never** replace the cube — only animate around it.

### Hover, press, focus

* **Hover**: 4–8% darker on solid orange / green / dark; on neutral surfaces, a subtle `--bg-inset` swap. Never opacity‑only on text — always darken.
* **Press**: solid surfaces darken further (~12%) and **scale to 0.98** for ~80ms.
* **Focus**: `--shadow-glow-orange` ring, never the browser default. Visible only on `:focus-visible`.
* **Disabled**: 40% alpha on text, no ring, no hover transform.

### Transparency & blur

Used **sparingly**. Only places blur appears:

* The desktop panel / dock (a `backdrop-filter: blur(20px) saturate(1.4)` over the wallpaper).
* The notification pill / contextual badge over a busy backdrop.
* Modal overlays (12% black scrim, 6px blur).

In light surfaces, blur is unnecessary — use solid `Shell White` instead.

### Layout rules (fixed elements)

The OS+ shell has a fixed grammar:

* **Top‑left**: workspace + app indicator. Always.
* **Top‑right**: tray (audio · network · power), notification cluster, mascot mini.
* **Bottom**: optional dock with mascot avatars per running app.
* **Right‑click anywhere** opens a *contract* menu (see Context Menu System in the brand book): `[Empty space, Widget, Window, Nested, Tray]`.

### Density rules

* **Mouse density**: 32–36px hit targets, 14px body in lists, 12px gutters.
* **Touch density**: 44px hit targets, 16px body, 16px gutters.
* The shell is designed to **toggle** between densities live (Quickshell reactive); always design both states.

---

## ICONOGRAPHY

GNU.IN uses **two intentional icon families**, plus a generic UI icon set.

### 1. Brand symbols (the Sys.ter family) — *first‑class, hand‑authored*

Located in `assets/symbols/`. These are **not** generic icons; they're brand marks that appear in headers, app icons, badges, and mascot moments.

| File | Use |
|---|---|
| `prompt-mark.svg` | The bare `>_` prompt glyph. Use for the smallest brand stamp (favicon, status bar). |
| `cube.svg` | The orange cube + black face + white prompt — the bare mascot. |
| `cube-dialogue.svg` | Cube with an orange dialogue frame attached — the "speaking" / agent‑active variant. |
| `cube-dialogue-mono.svg` | Monochrome version for ink‑only contexts. |
| `app-icon.svg` | Rounded‑square app icon (256×256), anthracite background, orange `>_`. |
| `badge-notification.svg` | Cube with red/orange counter bubble — for tray and titlebar use. |
| `badge-assistant-contextual.svg` | Cube + dialogue badge for contextual assistant moments. |
| `dialogue-frame.svg` | The bare dialogue tail, for composing custom callouts. |
| `symbol-defs.svg` | **The sprite** — load once, then `<svg><use href="…/symbol-defs.svg#gnu6-cube"/></svg>`. Defines `#gnu6-cube`, `#gnu6-cube-dialogue`, `#gnu6-notification-badge`. |

**Mascot art** lives in `assets/mascot/pack/`: **`hero.png`** is the canonical assembled mascot (orange terminal cube, live `>_` screen, grey antenna, green beret with gold fleur-de-lis, orange contact shadow). Alongside it are six transparent component layers — `20-shell`, `30-screen`, `40-prompt`, `50-beret`, `60-antenna`, `10-shadow` — each individually framed (not co-registered; composite from the hero, use parts for layered animation). The interactive state grammar is demonstrated in `preview/brand-mascot-motion.html`.

### 2. State grammar — eye + keyhole + cube‑state

Located in `assets/imagery/eye-state-grammar.png` (and the related grids). This is the brand's **security / system‑state** alphabet:

`IDLE / SCAN / FOCUS / PULSE / SYNC / TRACK / LOCK / ALERT / STRESS / OVERLOAD / BREACH / GLITCH / FAILSAFE / RECOVER / REBOOT / STABLE`

For the mascot itself, the parallel grammar is `IDLE / LISTENING / TRANSMIT / VEILLE` plus the LIFT → REVEAL → SETTLE choreography for entrance moments. **Use these names verbatim** in code, copy and component variants — they are part of the design vocabulary.

When you need a state icon and don't have a hand‑drawn one, **leave a placeholder** and FLAG it. Don't approximate the eye/keyhole motif from scratch — it's stylized in a specific way that's easy to get wrong.

### 3. Generic UI icons

The brand book doesn't ship a generic icon font. For product **chrome**, the system uses **Material Symbols Rounded** (`wght 450`, `opsz 20`, `FILL 0` rest / `FILL 1` active) — the exact family the real shell ships (confirmed in `Appearance.qml`). For non-chrome affordances where Material Symbols genuinely can't load, **Lucide** is the monoline fallback.

```html
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-25..0" rel="stylesheet" />
<span class="material-symbols-rounded">settings</span>
```

**FLAG**: Material Symbols Rounded is the confirmed chrome icon family (per the real `Appearance.qml`). Lucide is fallback-only.

### 4. Emoji and Unicode

* **No emoji.**
* **CLI glyphs welcome**: `>_  ▸  ·  ●  ╭ ╮ ╯ ╰  ┌ ┐ ┘ └  ─  │  ↗  ↘  Zz`. They show up natively in the mono font and reinforce the terminal vibe.
* **Status pips**: orange `●` for active/transmit, green `●` for stable, gray `●` for idle, red `●` for breach.

---

## INDEX (where to look)

1. **Read me first** — this file. Brand context, voice, visuals, icons.
2. **Tokens** — `colors_and_type.css`. Everything in CSS variables. Import this in any artifact.
3. **Live tokens preview** — `preview/*.html` cards. Each card is a single token / specimen / component you can lift.
4. **Symbols sprite** — `assets/symbols/symbol-defs.svg` (`<use href>` ready) and the individual SVGs alongside it.
5. **Mascot pack** — `assets/mascot/pack/hero.png` (assembled master) + the six component layers (`20-shell` / `30-screen` / `40-prompt` / `50-beret` / `60-antenna` / `10-shadow`). 1254×1254 transparent PNGs. Interactive states: `preview/brand-mascot-motion.html`.
6. **OS UI kit** — `ui_kits/gnu-in-shell/index.html`. Click‑through prototype of the desktop shell, panel, context menu, notifications, mascot widget, terminal.
7. **Terminal signature CSS** — `assets/terminal/web-terminal-signature.css`. Drop‑in for any `<pre>` block.
8. **ASCII patterns** — `assets/terminal/ascii-cli-tui-experiments.md`. Eight canonical CLI/TUI compositions; copy and reuse.
9. **Original brand book** — `assets/source/brand-system-v3.pptx`. The canonical narrative.
10. **`SKILL.md`** — drop this folder into Claude Code as a skill and it becomes the brand expert there too.
11. **Engineering tokens** — `blob.in/tokens.json` is the motion + colour source of truth for native surfaces. `blobin-gen` lowers it to `gnu_theme.gpui.rs` (GPUI), `gnu_theme.h` (C++), and `tokens.rs` (Rust solver). QML is opt-in; Flutter/Dart removed.

---

## Caveats

* **Fonts**: brand sans is **Montreal** (vendored under `fonts/`). The 400 (Regular) and 700 (Bold) cuts are the on‑brand weights; intermediate weights (500 / 600) fall back to Inter via the CSS stack and `font-synthesis-weight: auto`. If you have the missing Montreal cuts, drop them in and add matching `@font-face` blocks.
* **Chrome icons are Material Symbols Rounded** (per the real shell); Lucide is fallback-only.
* **The real Quickshell source is now known** (`tension-atoi/illogical-morgue`) — tokens reconciled in `colors_and_type.css`; see `UPGRADE_PATH.md`.
