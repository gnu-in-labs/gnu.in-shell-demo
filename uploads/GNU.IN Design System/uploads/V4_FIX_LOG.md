# v4 Fix Log

## Confirmed v3 problems

1. Wrong base glyph: multiple non-error states displayed an X.
2. State leakage: error sometimes retained thinking dots or listening dots.
3. Screen overlay too small and visibly pasted over the physical screen.
4. Success FX looked like debug markers instead of a polished state cue.
5. One-shot states shifted the whole composition.
6. Listening rings were only approximately anchored to the antenna cap.

## v4 fixes

- All screen symbols rebuilt as SVG inside one deterministic overlay.
- Every state application starts with a complete class reset.
- The screen overlay is larger and better aligned to the physical screen.
- Success is screen-local: green underscore, glow, and subtle sparkle.
- Error uses a contained red symbol and a restrained antenna alert.
- A dedicated `motion-rig` prevents stage drift.
- `alignment-debug.html` exposes live tuning controls and exports geometry.
