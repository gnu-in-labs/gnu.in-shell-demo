// gnuin-compose-core :: settings-app pages (port target)
// Scaffolds for the 4 GnuSettingsApp pages Central did not yet cover:
// Displays · Input · Services · Developer. The full app is 8 pages —
// Appearance/Shell/Surfaces/Gnosis are realized as Central's General / Taskbar /
// Compositor+Dock / Sidebar sections; these four close the gap.
//
// Source of truth: ShellSettingsService + per-page QML (DisplaysPage / InputPage /
// ServicesPage / DeveloperPage). Mirrors the representative real controls; the
// Developer page ties two flags to live engine state (damage overlay, experimental
// plugins) so it is partly real, not pure placeholder.

// ── Displays ────────────────────────────────────────────────────────────────

#[derive(Clone, Debug, PartialEq)]
pub struct DisplaySettings {
    pub output: String,        // e.g. "eDP-1"
    pub resolution: String,    // "2560x1440"
    pub scale: f32,            // 1.0 .. 2.0
    pub refresh_hz: u16,       // 60 / 120 / 144 / 165
    pub vrr: bool,             // adaptive sync
}
impl Default for DisplaySettings {
    fn default() -> Self {
        DisplaySettings { output: "eDP-1".into(), resolution: "2560x1440".into(), scale: 1.0, refresh_hz: 144, vrr: false }
    }
}
impl DisplaySettings {
    pub fn clamp(&mut self) { self.scale = self.scale.clamp(1.0, 2.0); }
}

// ── Input ───────────────────────────────────────────────────────────────────

#[derive(Clone, Copy, Debug, PartialEq)]
pub struct InputSettings {
    pub repeat_rate: u16,   // keys/s, 10..80
    pub repeat_delay_ms: u16, // 150..600
    pub mouse_accel: bool,  // libinput accel profile
    pub natural_scroll: bool,
    pub tap_to_click: bool,
}
impl Default for InputSettings {
    fn default() -> Self {
        InputSettings { repeat_rate: 40, repeat_delay_ms: 300, mouse_accel: false, natural_scroll: true, tap_to_click: true }
    }
}

// ── Services (mostly read-only health) ──────────────────────────────────────

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum ServiceHealth { Running, Healthy, DependencyFailed, Stopped }
impl ServiceHealth {
    pub fn as_str(self) -> &'static str {
        match self { ServiceHealth::Running => "running", ServiceHealth::Healthy => "healthy", ServiceHealth::DependencyFailed => "dependency-failed", ServiceHealth::Stopped => "stopped" }
    }
    pub fn is_ok(self) -> bool { matches!(self, ServiceHealth::Running | ServiceHealth::Healthy) }
}

#[derive(Clone, Copy, Debug, PartialEq)]
pub struct ServiceStatus {
    /// Portal health is DERIVED from the compositor capture provider + experimental.
    pub portal: ServiceHealth,
    pub notifications: ServiceHealth,
    pub polkit: ServiceHealth,
    pub clipboard_manager: bool,
    pub idle_inhibitor: bool,
}
impl ServiceStatus {
    /// Mirror Central: hyprcapture needs experimental, else the portal dependency fails.
    pub fn derive_portal(capture_is_hyprcapture: bool, experimental: bool) -> ServiceHealth {
        if capture_is_hyprcapture && !experimental { ServiceHealth::DependencyFailed } else { ServiceHealth::Healthy }
    }
}
impl Default for ServiceStatus {
    fn default() -> Self {
        ServiceStatus { portal: ServiceHealth::Healthy, notifications: ServiceHealth::Running, polkit: ServiceHealth::Running, clipboard_manager: true, idle_inhibitor: false }
    }
}

// ── Developer ───────────────────────────────────────────────────────────────

#[derive(Clone, Copy, Debug, PartialEq)]
pub struct DeveloperSettings {
    pub verbose_logging: bool,
    /// TIED to live engine state in Central (the damage-region overlay).
    pub scene_inspector: bool,
    /// TIED to compositor experimental plugins in Central.
    pub experimental_flags: bool,
    pub reload_on_save: bool,
}
impl Default for DeveloperSettings {
    fn default() -> Self {
        DeveloperSettings { verbose_logging: false, scene_inspector: false, experimental_flags: false, reload_on_save: true }
    }
}

/// The 4 scaffolded pages, plus the page registry order.
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum SettingsPage { Displays, Input, Services, Developer }
impl SettingsPage {
    pub const SCAFFOLDED: [SettingsPage; 4] = [SettingsPage::Displays, SettingsPage::Input, SettingsPage::Services, SettingsPage::Developer];
    pub fn id(self) -> &'static str {
        match self { SettingsPage::Displays => "display", SettingsPage::Input => "input", SettingsPage::Services => "services", SettingsPage::Developer => "developer" }
    }
    pub fn parse(s: &str) -> Option<Self> {
        Some(match s { "display" => SettingsPage::Displays, "input" => SettingsPage::Input, "services" => SettingsPage::Services, "developer" => SettingsPage::Developer, _ => return None })
    }
}

#[cfg(test)]
mod settings_pages_tests {
    use super::*;

    #[test]
    fn display_scale_clamps() {
        let mut d = DisplaySettings::default(); d.scale = 3.5; d.clamp();
        assert_eq!(d.scale, 2.0);
        assert_eq!(d.refresh_hz, 144);
    }

    #[test]
    fn input_defaults_match_central() {
        let i = InputSettings::default();
        assert_eq!(i.repeat_rate, 40);
        assert!(i.natural_scroll && i.tap_to_click && !i.mouse_accel);
    }

    #[test]
    fn portal_health_derives_like_compositor() {
        assert_eq!(ServiceStatus::derive_portal(true, false), ServiceHealth::DependencyFailed);
        assert_eq!(ServiceStatus::derive_portal(true, true), ServiceHealth::Healthy);
        assert_eq!(ServiceStatus::derive_portal(false, false), ServiceHealth::Healthy);
        assert!(ServiceHealth::Running.is_ok());
        assert!(!ServiceHealth::DependencyFailed.is_ok());
    }

    #[test]
    fn developer_flags_default_safe() {
        let d = DeveloperSettings::default();
        assert!(!d.verbose_logging && !d.scene_inspector && !d.experimental_flags);
        assert!(d.reload_on_save);
    }

    #[test]
    fn page_ids_round_trip() {
        for p in SettingsPage::SCAFFOLDED { assert_eq!(SettingsPage::parse(p.id()), Some(p)); }
        assert_eq!(SettingsPage::parse("appearance"), None);
    }
}
