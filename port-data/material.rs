// gnuin-shell :: surface materials — port target
// ============================================================================
// "Actual material for surfaces": every surface is painted with a named
// MATERIAL — a treatment (fill / border / elevation / blur) resolved from the
// active Theme palette (theme.rs). Surfaces stop hardcoding rgba()/shadow ad
// hoc; they declare WHICH material they are and the material resolves.
//
// A material may or may not FOLLOW THE THEME. This pass: Surface/Inset/Scrim
// follow (dark↔light); Chrome (top bar / dock) is a deliberately persistent
// dark material in both themes (a stable "menubar" surface). `follows_theme()`
// encodes that decision so the rollout is explicit, not accidental.

#![allow(dead_code)]

use crate::theme::{Theme, Palette};

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum SurfaceRole {
    Chrome,  // top bar, dock tray — persistent dark
    Surface, // panels that sit on the desktop (launcher, popovers)
    Inset,   // a well recessed inside a Surface
    Scrim,   // full-screen dim behind a modal
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Material {
    pub fill: &'static str,
    pub border: &'static str,
    pub text: &'static str,
    pub elevation: u8, // 0 flat … 3 floating (renderer maps to a shadow token)
}

/// The fixed dark Chrome material (used in both themes).
const CHROME: Material = Material {
    fill: "rgba(28,27,28,0.92)",
    border: "#2b2a2a",
    text: "#cbc5ca",
    elevation: 1,
};

impl SurfaceRole {
    /// Whether this material re-resolves with the theme (vs. staying fixed).
    pub fn follows_theme(self) -> bool {
        !matches!(self, SurfaceRole::Chrome)
    }

    /// Resolve the material for a theme. Chrome ignores the theme by design.
    pub fn resolve(self, theme: Theme) -> Material {
        let p: Palette = theme.palette();
        match self {
            SurfaceRole::Chrome => CHROME,
            SurfaceRole::Surface => Material { fill: p.bg_raised, border: p.line, text: p.text, elevation: 3 },
            SurfaceRole::Inset => Material { fill: p.bg_inset, border: p.line, text: p.text, elevation: 0 },
            SurfaceRole::Scrim => Material { fill: p.scrim, border: "transparent", text: "#ffffff", elevation: 0 },
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test] fn chrome_is_theme_invariant() {
        assert!(!SurfaceRole::Chrome.follows_theme());
        assert_eq!(SurfaceRole::Chrome.resolve(Theme::Dark), SurfaceRole::Chrome.resolve(Theme::Light));
    }

    #[test] fn surface_follows_theme() {
        assert!(SurfaceRole::Surface.follows_theme());
        let d = SurfaceRole::Surface.resolve(Theme::Dark);
        let l = SurfaceRole::Surface.resolve(Theme::Light);
        assert_ne!(d.fill, l.fill);
        assert_ne!(d.text, l.text);
    }

    #[test] fn surface_is_the_most_elevated() {
        assert!(SurfaceRole::Surface.resolve(Theme::Dark).elevation > SurfaceRole::Inset.resolve(Theme::Dark).elevation);
        assert_eq!(SurfaceRole::Scrim.resolve(Theme::Light).elevation, 0);
    }

    #[test] fn inset_pulls_from_palette_inset() {
        assert_eq!(SurfaceRole::Inset.resolve(Theme::Light).fill, Theme::Light.palette().bg_inset);
    }
}
