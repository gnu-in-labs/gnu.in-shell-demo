// gnuin-compose-core :: panel family (port target)
// Mirrors ShellSettingsService.shellMode (group "panel_family", options_ref
// "shellModeFamilies") — the gnosis-engine VISUAL FAMILY: one coherent surface
// treatment applied shell-wide (bar, dock, sidebar, launcher, menus).
//
// The backend ships the family LIST dynamically (options_ref), so these four are
// the canonical set realized on Central's surface vocabulary. A family resolves a
// `PanelTreatment` (fill / blur / border / radius / elevation) that every panel
// node reads — no panel hard-codes its own look.
//
// Source of truth: port-data/shell_settings.json (group "panel_family").

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum ShellMode { Glass, Solid, Outline, Soft }

/// Blur radius in px; 0 == no backdrop blur.
#[derive(Clone, Copy, PartialEq, Debug)]
pub struct PanelTreatment {
    /// Fill as straight-alpha RGBA (r,g,b,a) — a == 1.0 is opaque.
    pub fill: (u8, u8, u8, f32),
    pub blur_px: f32,
    pub border_px: f32,
    pub border_rgb: (u8, u8, u8),
    pub radius_px: f32,
    /// Elevation bucket → the host maps to a shadow recipe.
    pub elevation: Elevation,
}

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Elevation { Low, Medium, High }

impl ShellMode {
    pub fn as_str(self) -> &'static str {
        match self { ShellMode::Glass => "glass", ShellMode::Solid => "solid", ShellMode::Outline => "outline", ShellMode::Soft => "soft" }
    }
    pub fn parse(s: &str) -> Option<Self> {
        Some(match s { "glass" => ShellMode::Glass, "solid" => ShellMode::Solid, "outline" => ShellMode::Outline, "soft" => ShellMode::Soft, _ => return None })
    }
    pub const ALL: [ShellMode; 4] = [ShellMode::Glass, ShellMode::Solid, ShellMode::Outline, ShellMode::Soft];

    /// The preset: a family resolves the full panel treatment.
    pub fn resolve(self) -> PanelTreatment {
        match self {
            ShellMode::Glass => PanelTreatment {
                fill: (28, 27, 28, 0.94), blur_px: 14.0,
                border_px: 1.0, border_rgb: (43, 42, 42), radius_px: 14.0, elevation: Elevation::High,
            },
            ShellMode::Solid => PanelTreatment {
                fill: (28, 27, 28, 1.0), blur_px: 0.0,
                border_px: 1.0, border_rgb: (43, 42, 42), radius_px: 12.0, elevation: Elevation::Medium,
            },
            ShellMode::Outline => PanelTreatment {
                fill: (20, 19, 20, 0.5), blur_px: 6.0,
                border_px: 1.5, border_rgb: (69, 65, 69), radius_px: 12.0, elevation: Elevation::Low,
            },
            ShellMode::Soft => PanelTreatment {
                fill: (30, 28, 30, 0.96), blur_px: 16.0,
                border_px: 1.0, border_rgb: (43, 42, 42), radius_px: 18.0, elevation: Elevation::High,
            },
        }
    }
    /// Whether the family draws a translucent fill (host needs a backdrop pass).
    pub fn is_translucent(self) -> bool { self.resolve().fill.3 < 1.0 }
}

impl PanelTreatment {
    /// CSS-ish rgba string for the fill (parity with Central's famBg).
    pub fn fill_css(&self) -> String {
        let (r, g, b, a) = self.fill;
        if (a - 1.0).abs() < f32::EPSILON { format!("#{:02x}{:02x}{:02x}", r, g, b) }
        else { format!("rgba({}, {}, {}, {})", r, g, b, a) }
    }
    pub fn wants_blur(&self) -> bool { self.blur_px > 0.0 }
}

#[cfg(test)]
mod panel_family_tests {
    use super::*;

    #[test]
    fn glass_is_default_translucent_blurred() {
        let t = ShellMode::Glass.resolve();
        assert!(ShellMode::Glass.is_translucent());
        assert!(t.wants_blur());
        assert_eq!(t.radius_px, 14.0);
        assert_eq!(t.elevation, Elevation::High);
    }

    #[test]
    fn solid_is_opaque_no_blur() {
        let t = ShellMode::Solid.resolve();
        assert!(!ShellMode::Solid.is_translucent());
        assert!(!t.wants_blur());
        assert_eq!(t.fill_css(), "#1c1b1c");
    }

    #[test]
    fn outline_has_the_thickest_border_and_lowest_elevation() {
        let o = ShellMode::Outline.resolve();
        for m in [ShellMode::Glass, ShellMode::Solid, ShellMode::Soft] {
            assert!(o.border_px >= m.resolve().border_px);
        }
        assert_eq!(o.elevation, Elevation::Low);
    }

    #[test]
    fn soft_is_the_roundest() {
        let s = ShellMode::Soft.resolve();
        for m in [ShellMode::Glass, ShellMode::Solid, ShellMode::Outline] {
            assert!(s.radius_px >= m.resolve().radius_px);
        }
    }

    #[test]
    fn fill_css_round_trips_translucent() {
        assert_eq!(ShellMode::Glass.resolve().fill_css(), "rgba(28, 27, 28, 0.94)");
    }

    #[test]
    fn enum_round_trips() {
        for m in ShellMode::ALL { assert_eq!(ShellMode::parse(m.as_str()), Some(m)); }
        assert_eq!(ShellMode::parse("nope"), None);
    }
}
