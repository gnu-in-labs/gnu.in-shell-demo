// gnuin-compose-core :: compositor profile (port target)
// Mirrors ShellSettingsService.hyprlandPlugin* (components/settings/pages/Appearance settings page)
// as a typed, framework-free model. A *profile* is a PRESET that RESOLVES the
// focus/edge/capture candidates; individual candidates may then override.
//
// Non-stable candidates require `experimental` enabled — otherwise the change is
// REJECTED with a diagnostic (never silently applied). Portal session health is
// DERIVED, not stored. This mirrors Central's Compositor section exactly.
//
// Source of truth: port-data/shell_settings.json (group "compositor_profile").

// ── enums (verbatim option sets) ────────────────────────────────────────────

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Profile { Stable, VisualFocus, GestureLab, CaptureLab, WorkspaceLab }

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum FocusFeedback { Off, OfficialFocus, Hyprfocus, BordersPlusPlus }

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum EdgeGestures { Off, Hyprgrass, HyprHotEdge, Combined }

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum CaptureProvider { Builtin, Hyprcapture }

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum PortalHealth { Healthy, DependencyFailed, InactiveGraphicalSession, PortalUnowned, Unknown }

impl Profile {
    pub fn as_str(self) -> &'static str {
        match self {
            Profile::Stable => "stable",
            Profile::VisualFocus => "visual-focus",
            Profile::GestureLab => "gesture-lab",
            Profile::CaptureLab => "capture-lab",
            Profile::WorkspaceLab => "workspace-lab",
        }
    }
    pub fn parse(s: &str) -> Option<Self> {
        Some(match s {
            "stable" => Profile::Stable,
            "visual-focus" => Profile::VisualFocus,
            "gesture-lab" => Profile::GestureLab,
            "capture-lab" => Profile::CaptureLab,
            "workspace-lab" => Profile::WorkspaceLab,
            _ => return None,
        })
    }
    /// Only `stable` is stable; every other profile needs experimental plugins.
    pub fn is_stable(self) -> bool { matches!(self, Profile::Stable) }
    /// The preset: a profile resolves a full candidate triple.
    pub fn resolve(self) -> (FocusFeedback, EdgeGestures, CaptureProvider) {
        match self {
            Profile::Stable       => (FocusFeedback::OfficialFocus,   EdgeGestures::Off,        CaptureProvider::Builtin),
            Profile::VisualFocus  => (FocusFeedback::Hyprfocus,       EdgeGestures::Off,        CaptureProvider::Builtin),
            Profile::GestureLab   => (FocusFeedback::Off,             EdgeGestures::Combined,   CaptureProvider::Builtin),
            Profile::CaptureLab   => (FocusFeedback::Off,             EdgeGestures::HyprHotEdge, CaptureProvider::Hyprcapture),
            Profile::WorkspaceLab => (FocusFeedback::BordersPlusPlus, EdgeGestures::Hyprgrass,  CaptureProvider::Builtin),
        }
    }
}

impl FocusFeedback {
    pub fn as_str(self) -> &'static str {
        match self { FocusFeedback::Off => "off", FocusFeedback::OfficialFocus => "official-focus", FocusFeedback::Hyprfocus => "hyprfocus", FocusFeedback::BordersPlusPlus => "borders-plus-plus" }
    }
    pub fn parse(s: &str) -> Option<Self> {
        Some(match s { "off" => FocusFeedback::Off, "official-focus" => FocusFeedback::OfficialFocus, "hyprfocus" => FocusFeedback::Hyprfocus, "borders-plus-plus" => FocusFeedback::BordersPlusPlus, _ => return None })
    }
    /// Stable candidates need no experimental flag.
    pub fn is_stable(self) -> bool { matches!(self, FocusFeedback::Off | FocusFeedback::OfficialFocus) }
}

impl EdgeGestures {
    pub fn as_str(self) -> &'static str {
        match self { EdgeGestures::Off => "off", EdgeGestures::Hyprgrass => "hyprgrass", EdgeGestures::HyprHotEdge => "hypr-hot-edge", EdgeGestures::Combined => "combined" }
    }
    pub fn parse(s: &str) -> Option<Self> {
        Some(match s { "off" => EdgeGestures::Off, "hyprgrass" => EdgeGestures::Hyprgrass, "hypr-hot-edge" => EdgeGestures::HyprHotEdge, "combined" => EdgeGestures::Combined, _ => return None })
    }
    pub fn is_stable(self) -> bool { matches!(self, EdgeGestures::Off) }
    /// Which screen edges carry an active gesture zone (drives Central's indicator).
    pub fn edges(self) -> (bool, bool) { // (left, bottom)
        match self {
            EdgeGestures::Off => (false, false),
            EdgeGestures::Hyprgrass => (true, false),
            EdgeGestures::HyprHotEdge => (false, true),
            EdgeGestures::Combined => (true, true),
        }
    }
}

impl CaptureProvider {
    pub fn as_str(self) -> &'static str { match self { CaptureProvider::Builtin => "builtin", CaptureProvider::Hyprcapture => "hyprcapture" } }
    pub fn parse(s: &str) -> Option<Self> {
        Some(match s { "builtin" => CaptureProvider::Builtin, "hyprcapture" => CaptureProvider::Hyprcapture, _ => return None })
    }
    pub fn is_stable(self) -> bool { matches!(self, CaptureProvider::Builtin) }
}

impl PortalHealth {
    pub fn as_str(self) -> &'static str {
        match self {
            PortalHealth::Healthy => "healthy",
            PortalHealth::DependencyFailed => "dependency-failed",
            PortalHealth::InactiveGraphicalSession => "inactive-graphical-session",
            PortalHealth::PortalUnowned => "portal-unowned",
            PortalHealth::Unknown => "unknown",
        }
    }
    pub fn is_healthy(self) -> bool { matches!(self, PortalHealth::Healthy) }
}

// ── the settings struct ─────────────────────────────────────────────────────

#[derive(Clone, Copy, Debug, PartialEq)]
pub struct CompositorProfile {
    pub profile: Profile,
    pub experimental: bool,
    pub reload_on_startup: bool,
    pub focus: FocusFeedback,
    pub edge: EdgeGestures,
    pub capture: CaptureProvider,
}

impl Default for CompositorProfile {
    fn default() -> Self {
        // stable preset
        CompositorProfile {
            profile: Profile::Stable,
            experimental: false,
            reload_on_startup: true,
            focus: FocusFeedback::OfficialFocus,
            edge: EdgeGestures::Off,
            capture: CaptureProvider::Builtin,
        }
    }
}

/// A rejected change — surfaced to the user, never silently dropped.
#[derive(Clone, Debug, PartialEq)]
pub struct Diagnostic { pub key: String, pub msg: String }

pub type Apply = Result<(), Diagnostic>;

impl CompositorProfile {
    /// Apply a profile preset. Non-stable profiles require experimental.
    pub fn set_profile(&mut self, p: Profile) -> Apply {
        if !p.is_stable() && !self.experimental {
            return Err(Diagnostic { key: p.as_str().into(), msg: format!("profil « {} » non-stable — active les plugins expérimentaux d'abord", p.as_str()) });
        }
        let (f, e, c) = p.resolve();
        self.profile = p; self.focus = f; self.edge = e; self.capture = c;
        Ok(())
    }
    pub fn set_focus(&mut self, f: FocusFeedback) -> Apply {
        if !f.is_stable() && !self.experimental {
            return Err(Diagnostic { key: f.as_str().into(), msg: format!("focus « {} » — candidat expérimental", f.as_str()) });
        }
        self.focus = f; Ok(())
    }
    pub fn set_edge(&mut self, e: EdgeGestures) -> Apply {
        if !e.is_stable() && !self.experimental {
            return Err(Diagnostic { key: e.as_str().into(), msg: format!("edge « {} » — candidat expérimental", e.as_str()) });
        }
        self.edge = e; Ok(())
    }
    pub fn set_capture(&mut self, c: CaptureProvider) -> Apply {
        if !c.is_stable() && !self.experimental {
            return Err(Diagnostic { key: c.as_str().into(), msg: format!("capture « {} » — candidat expérimental", c.as_str()) });
        }
        self.capture = c; Ok(())
    }
    /// Turning experimental OFF clamps a non-stable profile back to stable.
    pub fn set_experimental(&mut self, on: bool) {
        self.experimental = on;
        if !on && !self.profile.is_stable() {
            let _ = self.force_stable();
        }
    }
    fn force_stable(&mut self) -> Apply {
        let (f, e, c) = Profile::Stable.resolve();
        self.profile = Profile::Stable; self.focus = f; self.edge = e; self.capture = c;
        Ok(())
    }
    /// True when a candidate diverges from its profile preset.
    pub fn is_override(&self) -> (bool, bool, bool) {
        let (f, e, c) = self.profile.resolve();
        (self.focus != f, self.edge != e, self.capture != c)
    }
    /// DERIVED portal health: hyprcapture needs experimental; builtin needs no portal.
    pub fn portal_health(&self) -> PortalHealth {
        match self.capture {
            CaptureProvider::Hyprcapture => if self.experimental { PortalHealth::Healthy } else { PortalHealth::DependencyFailed },
            CaptureProvider::Builtin => PortalHealth::Healthy,
        }
    }
}

#[cfg(test)]
mod compositor_tests {
    use super::*;

    #[test]
    fn default_is_stable_and_resolved() {
        let c = CompositorProfile::default();
        assert_eq!(c.profile, Profile::Stable);
        assert_eq!(c.focus, FocusFeedback::OfficialFocus);
        assert_eq!(c.is_override(), (false, false, false));
        assert!(c.portal_health().is_healthy());
    }

    #[test]
    fn non_stable_profile_rejected_without_experimental() {
        let mut c = CompositorProfile::default();
        let r = c.set_profile(Profile::GestureLab);
        assert!(r.is_err());
        assert_eq!(c.profile, Profile::Stable); // unchanged — not silently applied
    }

    #[test]
    fn profile_resolves_candidate_triple() {
        let mut c = CompositorProfile::default();
        c.set_experimental(true);
        c.set_profile(Profile::CaptureLab).unwrap();
        assert_eq!(c.focus, FocusFeedback::Off);
        assert_eq!(c.edge, EdgeGestures::HyprHotEdge);
        assert_eq!(c.capture, CaptureProvider::Hyprcapture);
        assert_eq!(c.is_override(), (false, false, false));
    }

    #[test]
    fn individual_override_flags() {
        let mut c = CompositorProfile::default();
        c.set_experimental(true);
        c.set_profile(Profile::VisualFocus).unwrap(); // focus=hyprfocus
        c.set_focus(FocusFeedback::BordersPlusPlus).unwrap();
        assert_eq!(c.is_override().0, true); // focus now diverges from preset
    }

    #[test]
    fn experimental_candidate_rejected_when_off() {
        let mut c = CompositorProfile::default();
        assert!(c.set_focus(FocusFeedback::Hyprfocus).is_err());
        assert_eq!(c.focus, FocusFeedback::OfficialFocus);
        assert!(c.set_focus(FocusFeedback::Off).is_ok()); // stable candidate ok
    }

    #[test]
    fn turning_experimental_off_clamps_to_stable() {
        let mut c = CompositorProfile::default();
        c.set_experimental(true);
        c.set_profile(Profile::WorkspaceLab).unwrap();
        c.set_experimental(false);
        assert_eq!(c.profile, Profile::Stable);
        assert_eq!(c.focus, FocusFeedback::OfficialFocus);
    }

    #[test]
    fn portal_health_derived_from_capture_and_experimental() {
        let mut c = CompositorProfile::default();
        c.set_experimental(true);
        c.set_capture(CaptureProvider::Hyprcapture).unwrap();
        assert_eq!(c.portal_health(), PortalHealth::Healthy);
        // flip experimental off → profile clamps to stable → capture back to builtin
        c.set_experimental(false);
        assert_eq!(c.capture, CaptureProvider::Builtin);
        assert_eq!(c.portal_health(), PortalHealth::Healthy);
    }

    #[test]
    fn edge_zones_map_to_screen_edges() {
        assert_eq!(EdgeGestures::Off.edges(), (false, false));
        assert_eq!(EdgeGestures::Hyprgrass.edges(), (true, false));
        assert_eq!(EdgeGestures::HyprHotEdge.edges(), (false, true));
        assert_eq!(EdgeGestures::Combined.edges(), (true, true));
    }

    #[test]
    fn enum_round_trips() {
        for v in ["stable","visual-focus","gesture-lab","capture-lab","workspace-lab"] { assert_eq!(Profile::parse(v).unwrap().as_str(), v); }
        for v in ["off","official-focus","hyprfocus","borders-plus-plus"] { assert_eq!(FocusFeedback::parse(v).unwrap().as_str(), v); }
        for v in ["off","hyprgrass","hypr-hot-edge","combined"] { assert_eq!(EdgeGestures::parse(v).unwrap().as_str(), v); }
        for v in ["builtin","hyprcapture"] { assert_eq!(CaptureProvider::parse(v).unwrap().as_str(), v); }
    }
}
