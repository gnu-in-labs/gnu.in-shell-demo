---
name: gnu-in-design
description: Use this skill to generate well-branded interfaces and assets for GNU.IN / Gnu.In-Shell / GNU6, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, **then TASTE.md** (the better-taste quality bar) before shipping anything, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Quick orientation

- **Tokens**: `colors_and_type.css` — single source of truth for colors, type, spacing, radii, shadows, motion. Import this in any artifact.
- **Engineering tokens (Rust/C++ first)**: `blob.in/tokens.json` → `blobin-gen` emits three primary targets: `blob.in/gen/gnu_theme.gpui.rs` (GPUI `Rgba` + motion `Duration`s), `blob.in/gen/gnu_theme.h` (C++ `constexpr`), `blob.in/blobin-core/src/tokens.rs` (Rust solver). QML is opt-in only (`just tokens-qml`). Flutter/Dart removed.
- **Color is DYNAMIC**: OS chrome surfaces *and* accent come from the wallpaper (matugen / Material 3) — use the `--m3-*` / `--col-layer*` role tokens for chrome, never hardcode orange. The brand orange is **identity-only** (`--brand-accent`: cube, badge, splash, marketing). See TASTE.md §0.
- **Voice**: terminal-first but human. Lowercase by default, mono accents, French/English mixed OK. No emoji. Use CLI glyphs (`>_  ▸  ·  ●  ╭ ╮`).
- **Mascot**: the **Sys.ter** — orange cube, green beret, antenna, CLI face. Use `assets/mascot/syster-master-adaptive.svg`. Never recolor by hand — theme via CSS vars on the root `<svg>`.
- **Symbols**: `assets/symbols/symbol-defs.svg` — `<use href="…#gnu6-cube">`, `#gnu6-cube-dialogue`, `#gnu6-notification-badge`.
- **Chrome icons**: **Material Symbols Rounded** (`wght 450`, `FILL 0` rest / `FILL 1` active) — matches the real shell. Lucide is fallback-only. Identity icons stay the cube family.
- **Live tokens**: `preview/*.html` — one card per concept (palettes, type specimens, spacing, components, brand marks).
- **UI kit**: `ui_kits/gnu-in-shell/index.html` — click-through prototype of the OS+ shell (panel, dock, context menu, notifications, terminal, mascot).
- **Terminal signature**: `assets/terminal/web-terminal-signature.css` — drop into any `<pre>` for an instant on-brand terminal block.
- **ASCII patterns**: `assets/terminal/ascii-cli-tui-experiments.md` — eight canonical CLI/TUI compositions to copy.

## Hard rules

- Light surfaces are **`#F5EEDD` Shell White (cream)**, not pure white. Pure white only for elevated cards over Shell White.
- No bluish-purple gradients. Chrome accent is **dynamic**; orange is identity-only — don't let it leak into bars/menus/panels.
- **Motion bounces**: spatial state-changes use expressive springs (`--ease-expressive`, overshoot intentional); calm `--ease-standard` is for the terminal/identity layer only.
- No emoji. CLI glyphs and the orange dot in `gnu.in` are the only branded punctuation.
- Card radii: `12–14px` in light UI, `14px` in dark TUI. Never mix radii on one card.
- Focus uses `--shadow-glow-orange`, never browser default.
- Press = darken ~12% + `scale(0.98)` for ~80ms.
- Motion default ease `cubic-bezier(0.2, 0.7, 0.2, 1)`; durations `120 / 200 / 360ms`; listening pulse `1400ms`.

Read `README.md` for the full Content Fundamentals, Visual Foundations, and Iconography sections before producing anything.
