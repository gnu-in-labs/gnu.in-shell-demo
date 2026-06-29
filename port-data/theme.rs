// gnuin-shell :: theme (dark / light surface palette) — port target
// ============================================================================
// Foundational theming: a Theme selects a Palette of surface ROLE colors that
// the material system (material.rs) and the surfaces consume. This is the
// single source of truth for "what colour is a base surface / its text / a
// separator / the scrim" in each theme — no surface hardcodes a hex.
//
// Accent stays orthogonal (matugen seed); `on_accent` is the text/glyph colour
// that sits on an accent fill and is dark in both themes (accent is bright).

#![allow(dead_code)]

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Theme { Dark, Light }

impl Theme {
    pub fn toggled(self) -> Theme {
        match self { Theme::Dark => Theme::Light, Theme::Light => Theme::Dark }
    }
    pub fn is_light(self) -> bool { matches!(self, Theme::Light) }
    pub fn label(self) -> &'static str {
        match self { Theme::Dark => "Sombre", Theme::Light => "Clair" }
    }
}

/// Resolved surface-role colours for a theme. Strings are CSS colour tokens the
/// renderer applies verbatim (rgba()/hex).
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Palette {
    pub bg_base: &'static str,   // desktop / deepest surface
    pub bg_raised: &'static str, // a panel sitting on the base
    pub bg_inset: &'static str,  // a well recessed into a panel
    pub text: &'static str,      // primary text
    pub subtext: &'static str,   // secondary text
    pub line: &'static str,      // hairline separators / borders
    pub scrim: &'static str,     // full-screen dim behind modals
    pub on_accent: &'static str, // text/glyph on an accent fill
}

pub const DARK: Palette = Palette {
    bg_base: "#1a1722",
    bg_raised: "rgba(28,27,28,0.96)",
    bg_inset: "#201f20",
    text: "#e6e1e1",
    subtext: "#7c828a",
    line: "#2a2829",
    scrim: "rgba(8,7,10,0.62)",
    on_accent: "#1a1207",
};

pub const LIGHT: Palette = Palette {
    bg_base: "#e7e3ee",
    bg_raised: "rgba(248,246,250,0.93)",
    bg_inset: "rgba(0,0,0,0.05)",
    text: "#26222b",
    subtext: "#6b6673",
    line: "rgba(0,0,0,0.09)",
    scrim: "rgba(20,16,28,0.50)",
    on_accent: "#1a1207",
};

impl Theme {
    pub fn palette(self) -> Palette {
        match self { Theme::Dark => DARK, Theme::Light => LIGHT }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test] fn toggle_round_trips() {
        assert_eq!(Theme::Dark.toggled(), Theme::Light);
        assert_eq!(Theme::Light.toggled().toggled(), Theme::Light);
        assert!(Theme::Light.is_light() && !Theme::Dark.is_light());
    }

    #[test] fn palettes_differ_on_every_surface_role() {
        let d = Theme::Dark.palette();
        let l = Theme::Light.palette();
        assert_ne!(d.bg_base, l.bg_base);
        assert_ne!(d.bg_raised, l.bg_raised);
        assert_ne!(d.bg_inset, l.bg_inset);
        assert_ne!(d.text, l.text);
        assert_ne!(d.line, l.line);
    }

    #[test] fn on_accent_is_stable_across_themes() {
        // accent is a bright seed in both themes, so its on-colour stays dark.
        assert_eq!(Theme::Dark.palette().on_accent, Theme::Light.palette().on_accent);
    }
}
