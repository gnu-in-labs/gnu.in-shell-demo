# GNU.IN — OS+ shell UI kit · DYNAMIC CHROME

A high-fidelity, click-through recreation of the **Gnu.In-Shell** desktop — rebuilt against the **real Quickshell `ii` modules** (`tension-atoi/illogical-morgue`). This is the canonical chrome: a **fully-dynamic Material 3** shell, not the old terminal-panel mock.

This is **not** the Quickshell runtime — it's a cosmetic recreation, but it copies the real structure: a 40px tripartite bar with connected-pill workspaces, the control center (right sidebar), the right-click contract menu, notification cluster, and a dock. Color is dynamic: a **scheme toggle** (cool/mauve ↔ warm/amber) demonstrates that surfaces *and* accent are wallpaper-derived, while the brand cube stays constant. See `../../TASTE.md` and `../../UPGRADE_PATH.md`.

## Try it
- **Right-click the desktop** → the *contract* menu (its Overview item opens the overview).
- **Click the cube** (top-left) → the left **agent sidebar** (Intelligence chat, Translator tab, composer).
- **Click the clock or the indicator pill** → the control center (sliders, quick toggles, calendar).
- **Press `O`** → the **overview**: a search bar (type to filter apps/commands) over a workspace grid with live window thumbnails. `Esc` closes any surface.
- **Scroll over the bar's left/right edges** → the **OSD** (brightness / volume) pops up and auto-hides.
- **Control center → power** → the **session screen** (lock/sleep/logout/shutdown/reboot…). **Session → Lock** (or any lock entry) → the **lock screen**: type `syster` + Enter/→ to unlock (wrong password shakes + clears). **Wi-Fi / Bluetooth chevrons** → inline device/network dialogs.
- **Click a workspace** → watch the active indicator stretch (expressive spring).
- **Bottom-left controls** → flip the dynamic scheme and the bar's corner style (Float/Hug).

## Files
- `index.html` — the live desktop. Open this.
- `shell-app.jsx` — all chrome components in one scope: `Bar`, `Workspaces`, `ControlCenter` (quick-sliders, quick-toggles, mini-calendar), `LeftSidebar` (agent chat + tabs), `Overview` (search + workspace grid), `ContractMenu`, `Notifications`, `Dock`, and the `App` desktop.
- `shell.css` — dynamic M3 chrome tokens (cool/warm schemes) + every chrome component class. Imports the system tokens from `../../colors_and_type.css`.

## What's faithful to the repo
- **Bar** ← `modules/ii/bar/{Bar,BarContent,Workspaces}.qml`: tripartite layout, connected-pill occupied workspaces, stretching active indicator, the right-side indicator pill, `useShortenedForm` responsiveness, Float/Hug corner styles.
- **Control center** ← `modules/ii/sidebarRight/{SidebarRightContent,QuickSliders}.qml` + `quickToggles/AndroidQuickPanel.qml`: uptime pill + system buttons, M3 quick-sliders, the android-style quick-toggle grid.
- **Left sidebar** ← `modules/ii/sidebarLeft/{SidebarLeftContent,AiChat}.qml`: the tabbed agent pane (Intelligence / Translator), message bubbles, composer with model + command chips.
- **Overview** ← `modules/ii/overview/{Overview,OverviewWidget,SearchWidget}.qml`: centered search bar over a workspace grid with positioned window thumbnails; type to switch to app/command results.
- **Session screen** ← `modules/ii/sessionScreen/SessionScreen.qml`: the 4×2 action grid (lock, sleep, logout, task manager, hibernate, shutdown, reboot, firmware).
- **Lock screen** ← `modules/ii/lock/{LockSurface,PasswordChars}.qml`: big clock over the wallpaper, three bottom islands (username + keyboard layout · fingerprint + material-shape password dots + confirm · battery + sleep/power/reboot), shake-on-wrong-password.
- **OSD** ← `modules/ii/onScreenDisplay/OsdValueIndicator.qml`: the rounded value pill (icon + name + value + progress) on volume/brightness scroll.
- **Icons** = Material Symbols Rounded (the real shell's family). **Identity** = the Sys.ter `cube.svg` on the left sidebar button.

## Caveats
- The lock-screen password is a hardcoded demo (`syster`); fingerprint/keyboard-layout are cosmetic.
- Quick-toggle dialogs (Wi-Fi / Bluetooth) list devices but selecting one is cosmetic; other toggles flip state only.
- The contract menu's item set is representative of the brand book's "contract" concept, styled to match `SysTrayMenu.qml`; the exact Hyprland menu contents may differ.
- Session-screen arrow-key navigation is not wired (click / `Esc` only).
- No build step — Babel-standalone transpiles in the browser (dev only).
