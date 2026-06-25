// GENERATED from tokens.json (tokens v0.14.0) by blobin-gen. DO NOT EDIT.
// Regenerate: blobin-gen tokens.json --gpui gen/gnu_theme.gpui.rs
//             or: just tokens
//
// Requires `gpui` (Zed GPU UI framework).
// Add to Cargo.toml:
//   gpui = { git = "https://github.com/zed-industries/zed", rev = "<pin>" }

use gpui::Rgba;

/// GNU.IN design tokens — colour palette for GPUI surfaces.
///
/// Construct via `GnuTheme::default()`. All colours are opaque sRGB.
/// For dynamic (matugen / M3) chrome surfaces use the runtime
/// `--m3-*` / `--col-layer*` role tokens instead — these are the
/// **identity-layer** constants (mascot, badge, splash, marketing).
///
/// # Example
/// ```rust
/// let t = GnuTheme::default();
/// cx.set_global(t);
/// // …
/// let accent = cx.global::<GnuTheme>().accent;
/// ```
pub struct GnuTheme {
    /// Signal Orange — identity accent, the dot in `.in`. Identity layer only.
    pub accent: Rgba,
    /// Shell White (cream) — light identity surface (`#F7F3ED`). NOT pure white.
    pub surface: Rgba,
    /// Anthracite — console face, ink, dark surface.
    pub ink: Rgba,
    /// Bezel — secondary dark, borders, dividers on dark surfaces.
    pub ink_dim: Rgba,
    /// Beret Green — mascot identity, "stable" / transmit state.
    pub transmit: Rgba,
    /// Info Blue — informational state accent.
    pub info: Rgba,
    /// Rust Gold — warm mid-tone, secondary highlight on dark surfaces.
    pub rust: Rgba,
}

impl Default for GnuTheme {
    fn default() -> Self {
        Self {
            accent:   gpui::rgb(0xFF6A00),
            surface:  gpui::rgb(0xF7F3ED),
            ink:      gpui::rgb(0x111418),
            ink_dim:  gpui::rgb(0x2B3037),
            transmit: gpui::rgb(0x5F7F52),
            info:     gpui::rgb(0x3D8DCC),
            rust:     gpui::rgb(0xCE8E3F),
        }
    }
}

/// Motion token shims for GPUI animation.
/// GPUI uses `std::time::Duration`; the values here match the
/// `mdur::*` consts in `blobin-core/src/tokens.rs`.
pub mod motion {
    use std::time::Duration;

    pub const INSTANT: Duration = Duration::from_millis(90);
    pub const QUICK:   Duration = Duration::from_millis(160);
    pub const BASE:    Duration = Duration::from_millis(240);
    pub const CALM:    Duration = Duration::from_millis(380);
    pub const SLOW:    Duration = Duration::from_millis(560);
    pub const BREATHE: Duration = Duration::from_millis(4200);
}
