# GNU.IN OS — Sys.ter Motion Spec v4

Version: 0.4.0

This v4 rebuild addresses the concrete preview errors found in v3: state contamination, wrong glyphs, screen misalignment, one-shot drift, and uneven polish between mascot body and overlay/FX.

## Source of truth

`assets/sys-ter-approved-v4.png`

The preview is intentionally based on the approved new mascot design. The old SVG layout is not used as a runtime geometry source in this preview.

## Layering

1. stage
2. mascot-frame
3. motion-rig
4. approved mascot PNG
5. screen state SVG overlay
6. state-specific FX

The antenna is part of the approved PNG and stays visually in front of the beret. FX are positioned around it, not drawn over it as replacement geometry.

## Geometry

Screen overlay:

- left: `24.1%`
- top: `38.85%`
- width: `41.95%`
- height: `37.85%`
- radius: `12.5%`

Antenna tip anchor:

- x: `74.2%`
- y: `28.7%`

See `geometry.tokens.json` and `preview/alignment-debug.html`.

## States

### Idle

Terminal prompt base: chevron + cream underscore. No X. No dots.

Motion: subtle 1400ms bob.

### Listening

Terminal prompt remains visible. Three dots indicate attention. Antenna rings pulse from the antenna cap.

Motion: subtle 1400ms micro-lean.

### Thinking

Screen-only state. Chevron remains stable while the dot sequence cycles:

`prompt → one dot → two dots → three dots → two dots → prompt`

Frame interval: 200ms. Total loop: 1200ms.

### Success

Terminal prompt with green underscore and restrained screen-local glow. No debug rays around the whole body.

Motion: 520ms one-shot positive bounce on the internal motion rig only.

### Error / Blocked

Red error mark and red underscore. No inherited dots. Small restrained alert ticks near the antenna.

Motion: 520ms one-shot recoil on the internal motion rig only.

## Motion Tokens

- Fast: 120ms
- Base: 200ms
- Slow: 360ms
- Pulse: 1400ms
- Thinking frame: 200ms

## Acceptance Criteria

- Idle never displays an X.
- Listening and thinking always retain the terminal chevron.
- Success never displays error glyphs or debug-like random rays.
- Error never inherits thinking dots after reset.
- The mascot stays centered across one-shot states.
- Screen overlay covers the old prompt cleanly without looking smaller than the physical screen.
- Antenna rings originate from the antenna cap.
