// gnuin-dock :: shell settings — dock VISIBILITY / behavior layer (port target)
// ============================================================================
// This is the second of the dock's two real, orthogonal backend layers:
//
//   1. dock_settings.rs   (this file) — VISIBILITY/behavior, owned by
//        ShellSettingsService: dockMode, reveal/hide delays, enable, pin.
//        Source: components/settings/pages/Shell settings page + ShellSettingsService
//        + DockService (ShellIpc dock.*). Mirrored in port-data/shell_settings.json.
//
//   2. dock_affordance.rs — card-deck LAYOUT (Row/Stack/Fan), planned by
//        asset-core and handed off as gnu.in.dock-affordance-plan.v1.
//
// They compose: `mode` decides whether/where the dock surface is shown and
// whether it reserves compositor space; the affordance config decides how the
// cards inside it are laid out. Neither subsumes the other.

#![allow(dead_code)]

/// Dock visibility behavior (ShellSettingsService.dockMode).
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum DockMode {
    /// Always visible; reserves a bottom exclusive zone (layer-shell reserved thickness).
    Docked,
    /// Visible, lifted/floating; reserves NO space.
    Floating,
    /// Hidden; revealed by a bottom edge-hover strip after `reveal_delay`.
    Autohide,
    /// Hidden only while a window overlaps the dock rect (DockGeometryService.dockOverlaps).
    Dodge,
}

impl DockMode {
    pub fn from_str(s: &str) -> Option<DockMode> {
        match s {
            "docked" => Some(DockMode::Docked),
            "floating" => Some(DockMode::Floating),
            "autohide" => Some(DockMode::Autohide),
            "dodge" => Some(DockMode::Dodge),
            _ => None,
        }
    }
    pub fn as_str(self) -> &'static str {
        match self {
            DockMode::Docked => "docked",
            DockMode::Floating => "floating",
            DockMode::Autohide => "autohide",
            DockMode::Dodge => "dodge",
        }
    }
    /// Only `docked` reserves an exclusive zone; pinning forces reservation too (see DockSettings).
    pub fn reserves_space(self) -> bool {
        matches!(self, DockMode::Docked)
    }
    /// Modes that can hide the surface and thus expose a reveal affordance.
    pub fn is_hiding(self) -> bool {
        matches!(self, DockMode::Autohide | DockMode::Dodge)
    }
}

/// The dock's settings as ShellSettingsService exposes them (with setters named for parity).
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct DockSettings {
    pub enabled: bool,        // setDockEnabled
    pub archived: bool,       // setDockArchived (disabled by source policy)
    pub mode: DockMode,       // setDockMode
    pub reveal_delay_ms: u32, // setDockRevealDelay   (0..=1000, step 50)
    pub hide_delay_ms: u32,   // setDockHideDelay      (0..=1000, step 50)
    pub pinned: bool,         // dock.togglePinned (Jillarious pin → reserves space)
}

impl Default for DockSettings {
    fn default() -> Self {
        DockSettings {
            enabled: true,
            archived: false,
            mode: DockMode::Docked,
            reveal_delay_ms: 200,
            hide_delay_ms: 500,
            pinned: true,
        }
    }
}

/// Live inputs the dock runtime evaluates each frame to decide visibility.
#[derive(Clone, Copy, Debug, Default)]
pub struct DockContext {
    /// A window currently overlaps the dock rect (DockGeometryService.dockOverlaps).
    pub window_overlaps: bool,
    /// The bottom edge-hover strip is being hovered (drives Autohide/Dodge reveal).
    pub edge_hovered: bool,
    /// The pointer is over the dock surface itself (keeps it revealed).
    pub pointer_in_dock: bool,
}

/// The resolved, renderer-facing dock state — the single output the host consumes.
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct DockResolution {
    pub painted: bool,        // is the surface drawn at all
    pub visible: bool,        // is it on-screen (vs hidden off the bottom edge)
    pub reserves_zone: bool,  // does the compositor reserve bottom space for it
    pub reveal_strip: bool,   // should the bottom reveal strip be shown
}

impl DockSettings {
    /// Pinning reserves space regardless of mode; otherwise only `docked` does.
    pub fn reserves_zone(&self) -> bool {
        self.enabled && !self.archived && (self.pinned || self.mode.reserves_space())
    }

    /// Pure resolver: (settings, live context) → what the host should paint.
    /// No surface reads another surface's visibility — the dock owns its own state.
    pub fn resolve(&self, cx: &DockContext) -> DockResolution {
        if !self.enabled || self.archived {
            return DockResolution { painted: false, visible: false, reserves_zone: false, reveal_strip: false };
        }
        // A pinned dock is always visible, even in a hiding mode.
        let revealed = self.pinned || cx.edge_hovered || cx.pointer_in_dock;
        let visible = match self.mode {
            DockMode::Docked | DockMode::Floating => true,
            DockMode::Autohide => revealed,
            DockMode::Dodge => revealed || !cx.window_overlaps,
        };
        let reveal_strip = self.mode.is_hiding() && !visible;
        DockResolution {
            painted: true,
            visible,
            reserves_zone: self.reserves_zone(),
            reveal_strip,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test] fn mode_string_round_trip() {
        for m in [DockMode::Docked, DockMode::Floating, DockMode::Autohide, DockMode::Dodge] {
            assert_eq!(DockMode::from_str(m.as_str()), Some(m));
        }
        assert_eq!(DockMode::from_str("nope"), None);
    }

    #[test] fn docked_reserves_floating_does_not() {
        let docked = DockSettings { mode: DockMode::Docked, pinned: false, ..Default::default() };
        let floating = DockSettings { mode: DockMode::Floating, pinned: false, ..Default::default() };
        assert!(docked.resolve(&DockContext::default()).reserves_zone);
        assert!(!floating.resolve(&DockContext::default()).reserves_zone);
    }

    #[test] fn autohide_hidden_until_edge_hover() {
        let s = DockSettings { mode: DockMode::Autohide, pinned: false, ..Default::default() };
        let hidden = s.resolve(&DockContext::default());
        assert!(!hidden.visible && hidden.reveal_strip);
        let revealed = s.resolve(&DockContext { edge_hovered: true, ..Default::default() });
        assert!(revealed.visible && !revealed.reveal_strip);
    }

    #[test] fn dodge_hides_only_under_overlap() {
        let s = DockSettings { mode: DockMode::Dodge, pinned: false, ..Default::default() };
        assert!(s.resolve(&DockContext { window_overlaps: false, ..Default::default() }).visible);
        let dodged = s.resolve(&DockContext { window_overlaps: true, ..Default::default() });
        assert!(!dodged.visible && dodged.reveal_strip);
        // hovering the edge brings it back even under overlap
        assert!(s.resolve(&DockContext { window_overlaps: true, edge_hovered: true, ..Default::default() }).visible);
    }

    #[test] fn pinned_dock_always_visible_and_reserves() {
        let s = DockSettings { mode: DockMode::Autohide, pinned: true, ..Default::default() };
        let r = s.resolve(&DockContext::default());
        assert!(r.visible && r.reserves_zone && !r.reveal_strip);
    }

    #[test] fn disabled_or_archived_paints_nothing() {
        let off = DockSettings { enabled: false, ..Default::default() };
        let arch = DockSettings { archived: true, ..Default::default() };
        assert!(!off.resolve(&DockContext::default()).painted);
        assert!(!arch.resolve(&DockContext::default()).painted);
    }
}
