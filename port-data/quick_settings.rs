// gnuin-shell :: control-center quick settings (port target)
// ============================================================================
// The Control Center's "Quick" page: the user-facing quick-settings surface
// (connectivity toggles · volume · brightness · workspace · session/power),
// lifted out of the Central prototype so the host owns no inline heuristics.
//
// Everything here is a thin, PURE projection over real shell state the session
// already holds (ShellSettingsService toggles, the audio sink, the backlight,
// the active workspace). The only genuinely-derived values are the brightness
// backlight DIM opacity (a live overlay), the volume glyph tier, and the
// session PowerAction metadata (label + whether it needs a confirm step).
//
// The fuzzy section-search in the CC nav reuses gnuin-launcher::fuzzy_match —
// see launcher.rs; it is not re-implemented here.

#![allow(dead_code)]

// ── Connectivity quick toggles ──────────────────────────────────────────────

/// The four quick-toggle tiles on the Quick page.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum QuickToggle {
    Wifi,
    Bluetooth,
    Dnd,
    NightShift,
}

impl QuickToggle {
    /// Material symbol drawn in the tile.
    pub fn icon(self) -> &'static str {
        match self {
            QuickToggle::Wifi => "wifi",
            QuickToggle::Bluetooth => "bluetooth",
            QuickToggle::Dnd => "do_not_disturb_on",
            QuickToggle::NightShift => "nightlight",
        }
    }
    /// Sub-label for the (on, off) states.
    pub fn states(self) -> (&'static str, &'static str) {
        match self {
            QuickToggle::Wifi => ("Connecté", "Désactivé"),
            QuickToggle::Bluetooth => ("Appairé", "Désactivé"),
            QuickToggle::Dnd => ("Actif", "Inactif"),
            QuickToggle::NightShift => ("Chaud", "Désactivé"),
        }
    }
}

// ── Brightness → backlight dim overlay ───────────────────────────────────────

/// Clamp a requested brightness percent to the addressable range. The floor is
/// 10 (never fully black) and the ceiling is 100.
pub fn clamp_brightness(percent: i32) -> u32 {
    percent.clamp(10, 100) as u32
}

/// Opacity of the black backlight-dim overlay for a brightness percent.
/// Full brightness (100) ⇒ ~0 dim; the floor (10) ⇒ 0.495. Monotonic.
pub fn brightness_dim(percent: u32) -> f32 {
    (100u32.saturating_sub(percent)) as f32 / 100.0 * 0.55
}

// ── Volume glyph tiering ─────────────────────────────────────────────────────

/// Material symbol for a volume level: muted / low / high.
pub fn volume_icon(volume: u32) -> &'static str {
    match volume {
        0 => "volume_off",
        1..=44 => "volume_down",
        _ => "volume_up",
    }
}

// ── Session / power ──────────────────────────────────────────────────────────

/// A session action invoked from the Quick page's power row. Every action is
/// destructive enough to require a confirm step before it fires.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum PowerAction {
    Lock,
    Logout,
    Restart,
    Shutdown,
}

impl PowerAction {
    pub fn icon(self) -> &'static str {
        match self {
            PowerAction::Lock => "lock",
            PowerAction::Logout => "logout",
            PowerAction::Restart => "restart_alt",
            PowerAction::Shutdown => "power_settings_new",
        }
    }
    /// Button label (fr).
    pub fn label(self) -> &'static str {
        match self {
            PowerAction::Lock => "Verrouiller",
            PowerAction::Logout => "Déconnexion",
            PowerAction::Restart => "Redémarrer",
            PowerAction::Shutdown => "Éteindre",
        }
    }
    /// Confirm-dialog body.
    pub fn desc(self) -> &'static str {
        match self {
            PowerAction::Lock => "verrouille la session courante",
            PowerAction::Logout => "ferme la session",
            PowerAction::Restart => "redémarre le système",
            PowerAction::Shutdown => "arrête le système",
        }
    }
    /// All actions require explicit confirmation (no silent power events).
    pub fn needs_confirm(self) -> bool {
        true
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test] fn brightness_clamps_to_floor_and_ceiling() {
        assert_eq!(clamp_brightness(0), 10);
        assert_eq!(clamp_brightness(5), 10);
        assert_eq!(clamp_brightness(250), 100);
        assert_eq!(clamp_brightness(72), 72);
    }

    #[test] fn dim_is_zero_at_full_and_rises_as_brightness_drops() {
        assert!(brightness_dim(100).abs() < 1e-6); // full brightness ⇒ no dim
        let floor = brightness_dim(10);
        assert!((floor - 0.495).abs() < 1e-4);
        // strictly decreasing in brightness
        assert!(brightness_dim(40) > brightness_dim(85));
    }

    #[test] fn volume_glyph_tiers() {
        assert_eq!(volume_icon(0), "volume_off");
        assert_eq!(volume_icon(20), "volume_down");
        assert_eq!(volume_icon(44), "volume_down");
        assert_eq!(volume_icon(45), "volume_up");
        assert_eq!(volume_icon(100), "volume_up");
    }

    #[test] fn toggle_states_distinct_per_kind() {
        assert_eq!(QuickToggle::Wifi.states().0, "Connecté");
        assert_eq!(QuickToggle::Dnd.states(), ("Actif", "Inactif"));
        assert_eq!(QuickToggle::NightShift.icon(), "nightlight");
    }

    #[test] fn every_power_action_confirms_and_is_labelled() {
        for a in [PowerAction::Lock, PowerAction::Logout, PowerAction::Restart, PowerAction::Shutdown] {
            assert!(a.needs_confirm());
            assert!(!a.label().is_empty());
            assert!(!a.desc().is_empty());
        }
        assert_eq!(PowerAction::Shutdown.icon(), "power_settings_new");
    }
}
