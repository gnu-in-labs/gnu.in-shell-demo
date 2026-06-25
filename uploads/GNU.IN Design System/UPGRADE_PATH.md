# UPGRADE PATH — GNU.IN brand ⇄ the real `ii` shell

> Study of **`tension-atoi/illogical-morgue`** (the GNU.IN / gnu.in-os dotfiles) against this design system, with a concrete roadmap to reconcile the two.
> Live artifact: **`ui_kits/gnu-in-shell/ii-bar-upgrade.html`** — a faithful, interactive recreation of the real top bar, toggleable between two wallpaper-derived schemes with identity held constant.

---

## ✓ DECISIONS LOCKED (2026-06)

- **Accent contract: FULLY DYNAMIC.** Chrome surfaces *and* accent are matugen-derived from the wallpaper; the brand orange is **identity-only** (`--brand-accent`: cube, badge, splash, marketing) and never enters the chrome. The committed mauve scheme is fine as a default and may change if a better quantization method proves out.
- **Taste is now a skillset:** see **`TASTE.md`** — the quality bar every file is being upgraded against, starting with the foundation (`colors_and_type.css` now carries the M3 role tokens + expressive-spring motion).
- The live artifact's toggle was reframed from "brand-pin vs matugen" to **two dynamic schemes (cool/mauve · warm/amber)** to express the fully-dynamic stance.

---

## 1. What the GitHub actually ships

The repo is a **Quickshell** config in the `qs.modules.ii` namespace — i.e. the *illogical-impulse* lineage of Hyprland desktop, heavily customized. Source of truth read for this study:

| File | What it told us |
|---|---|
| `dots/.config/quickshell/ii/modules/common/Appearance.qml` | The real token system — Material 3 color roles, rounding scale, font axes, expressive-spring animation curves, bar sizes. |
| `…/modules/ii/bar/Bar.qml` | Bar window: float vs hug corner styles, auto-hide, super-peek, screen-corner decorators. |
| `…/modules/ii/bar/BarContent.qml` | The tripartite layout and every module placement. |
| `…/modules/ii/bar/Workspaces.qml` | The signature **connected-pill** workspace indicator + stretching active indicator. |

### The bar, precisely

A **40px** bar (`baseBarHeight: 40`), `grid: 1fr auto 1fr`:

- **Left zone** — left-sidebar button, then `ActiveWindow` title. The whole zone is a scroll target: **scroll = brightness**.
- **Middle** — three `BarGroup` pills: `[Resources ⊕ Media]` · `[Workspaces]` · `[Clock ⊕ UtilButtons ⊕ Battery]`, with optional vertical separators in borderless mode.
- **Right zone** — `SysTray`, then a **single pill** (`RippleButton`, `rounding.full`) clustering network / bluetooth / notification-count / mic & volume revealers, then weather. Scroll here = **volume**.
- **Responsive**: `useShortenedForm` collapses modules at ≤1200px and ≤1000px screen widths (active window drops, then media drops, resources expand). The recreation reproduces all three forms.
- **Two corner styles**: `cornerStyle 1` = floating rounded bar (`windowRounding 18`, margin `hyprlandGapsOut 5`, border + optional shadow); `cornerStyle 0` = "hug" — flush bar with inverted **screen-corner decorators** (`screenRounding 23`) underneath.

### The token system (lifted exactly from `Appearance.qml`)

- **Color = Material 3 dynamic (matugen).** Roles are layered `colLayer0…4` with hover/active mixes, plus `m3primary / m3secondaryContainer / …`. **The palette is generated from the wallpaper** by a `ColorQuantizer`, so the accent is whatever the wallpaper yields. In the committed state that is a **desaturated mauve `#cbc4cb`** (primary) on a near-black `#141313` ground — *not* Signal Orange.
- **Rounding:** `verysmall 8 · small 12 · normal 17 · large 23 · verylarge 30 · full 9999`; `windowRounding 18`, `screenRounding 23`.
- **Type:** a variable sans at `wght 450` (titles `550`), sizes `10→23px`; **icons are `Material Symbols Rounded`** (an explicit family in the config), not a brand glyph set.
- **Motion:** *expressive springs* — `expressiveDefaultSpatial` (overshoot, 500ms), `expressiveFastSpatial` (350ms), `elementMoveFast` (200ms), plus a `clickBounce`. This is the M3-Expressive easing language, materially different from the design-system's `cubic-bezier(0.2,0.7,0.2,1)`.

---

## 2. The gap (design system → reality)

| Dimension | Design system today | The real `ii` shell | Verdict |
|---|---|---|---|
| **Accent** | Fixed Signal Orange `#FF6A00` | Wallpaper-derived, currently mauve `#cbc4cb` | **Biggest divergence.** Brand says one orange; the OS says "whatever the wallpaper says." |
| **Color model** | Static hand-picked tokens | Material 3 dynamic, 5 layered surfaces | DS needs an M3-shaped bridge, not a flat palette. |
| **Icons** | Lucide (CDN substitute) | Material Symbols Rounded | DS should adopt Material Symbols for product surfaces; keep the *brand* cube family for identity only. |
| **Type** | Montreal + IBM Plex Mono | Variable sans `wght 450`, Material Symbols | Montreal is fine for marketing; product UI should match the 450-weight rounded grotesque the shell ships. |
| **Motion** | Quick-start/soft-settle bézier | M3-Expressive springs w/ overshoot | DS motion tokens undersell the bounce the OS actually has. |
| **Bar architecture** | Reconstructed "terminal panel" (anthracite, Plex Mono, dot workspaces) | 40px M3 bar, connected-pill workspaces, indicator pill | The kit's old panel is *vibe-accurate but structurally wrong*. The new recreation is the correct target. |
| **Radii** | `4/8/12/14/20/28` | `8/12/17/23/30`, window 18, screen 23 | Reconcile to the shell's scale for product work. |

The honest finding: **the design system captured the brand's *soul* (orange cube, terminal warmth) but not the shell's *implementation* (Material You, expressive springs, Material Symbols).** The two need to meet.

---

## 3. Recommended upgrade path

### A. Resolve the accent contradiction — *pick a contract* (highest priority)

The OS currently lets the accent drift to the wallpaper. **Chosen path: option 3 — fully dynamic** (keep orange as identity-only). The three options, for the record:

1. **Brand-pin the accent.** Ship a matugen/base16 template that **forces `primary` (and `secondaryContainer`) to the GNU orange ramp** while still deriving the neutral surfaces from the wallpaper. Constant brand accent, dynamic surfaces. (Not chosen — kept for reference; this is what the artifact's "warm" scheme resembles.)
2. **Dual-accent.** Let matugen own `primary` but reserve a fixed **brand slot** (`colBrand = #FF6A00`) used only for identity moments (the cube button, notification badge, focus ring). Less brand presence, more dynamic-color freedom.
3. **✓ CHOSEN — Embrace dynamic, orange stays identity.** Keep matugen fully dynamic for all chrome; the brand orange appears only on the identity layer (cube, badge, splash, marketing) via `--brand-accent`, held constant while the chrome shifts around it. The brand feeling is *constant identity ⊕ dynamic surface*. Ship a sensible default wallpaper so the cold-start scheme is pleasant, and keep iterating on the quantization method.

> Concrete next step: produce `matugen/templates/gnu-colors.css` + a `base16-gnu.json` that pins `base08/0A` and the M3 `primary/secondaryContainer` to the orange ramp already in `colors_and_type.css` (`--gnu-orange`, `--gnu-orange-700/300/100`). I can author these on request.

### B. Adopt the real token scale for product surfaces

- Add an **`ii` bridge layer** to `colors_and_type.css`: map `--gnu-*` → the M3 role names the shell uses (`colLayer0…`, `colPrimary`, `colOnSecondaryContainer`, etc.) so HTML mocks read 1:1 against QML.
- Align radii (`17/23` + window `18`, screen `23`) and add the **expressive-spring** easings as motion tokens (`--ease-expressive: cubic-bezier(0.38,1.21,0.22,1.0)` — already used in the recreation).
- Swap the kit's generic icons to **Material Symbols Rounded**; demote Lucide.

### C. Retire the old terminal-panel kit; promote the faithful bar

`ui_kits/gnu-in-shell/index.html` (the hand-built anthracite panel with dot-workspaces) is now **superseded** by `ii-bar-upgrade.html`, which matches the real `BarContent.qml` structure: connected-pill workspaces, the stretching active indicator, the right-side indicator pill, float/hug corner styles, and the shortened-form responsiveness. Recommend making the recreation the kit's `index.html` and keeping the terminal panel only as the *brand-mood* reference.

### D. Keep the brand identity where it belongs

The Sys.ter cube, the terminal/Plex-Mono voice, and "atomic-age warmth" stay the **identity layer** — app icon, the left-sidebar button (already wired to `cube.svg` in the recreation), notifications, splash, marketing. The **product chrome** should speak fluent Material You. Brand ≠ chrome; let each do its job.

---

## 4. Sequenced roadmap

1. **Decide the accent contract** (§A) — one conversation, unblocks everything.
2. **Ship the matugen brand-pin template** so the live OS accent stops drifting.
3. **Add the `ii` bridge tokens + Material Symbols** to the design system.
4. **Promote `ii-bar-upgrade.html`** to the kit's canonical screen; extend it with the left/right **sidebar panels** and the **right-click "contract" menu** (next QML modules to recreate: `sidebarLeft/`, `sidebarRight/`, `overview/`).
5. **Backfill the rest of the shell** from the repo: `dock/`, `notificationPopup/`, `overview/`, `lock/`, `onScreenDisplay/`.

---

## 5. Resolved

- **Accent contract → fully dynamic** (see decisions banner up top). Orange is identity-only; design every chrome surface scheme-proof against ≥2 wallpaper-derived palettes.
- **Mauve palette** → intentional for now, open to a better quantization method later.
- **Old terminal-panel `index.html`** → demoted to identity-mood reference; `ii-bar-upgrade.html` is canonical chrome (per TASTE.md §1).
- **Next surface** → deferred: current focus is upgrading *existing* files against TASTE.md before building new surfaces.
