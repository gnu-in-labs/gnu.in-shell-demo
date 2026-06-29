// gnuin-dock :: dock items — LIVE APP-STATE layer (port target)
// ============================================================================
// The dock's THIRD orthogonal backend layer. The first two:
//
//   1. dock_settings.rs    — VISIBILITY/behavior (dockMode, reveal/hide, pin).
//   2. dock_affordance.rs  — card-deck LAYOUT (Row/Stack/Fan placement).
//
// This one is the per-item LIVE STATE that turns the dock from a launcher into
// a real running-app dock: which apps are pinned, how many windows each has
// open, notification badges, and attention requests. Source: the compositor's
// toplevel list (foreign-toplevel) + NotificationService badge counts, joined
// against the pinned set persisted by ShellSettingsService.dockPinned.
//
// They compose: settings decide IF the surface shows; affordance decides HOW
// the cards lay out; items decide WHAT each card is and its live indicators.
// The Row affordance additionally supports cursor MAGNIFICATION — a pure
// falloff over slot distance, resolved here so the host has no per-style code.

#![allow(dead_code)]

/// One dock entry as the runtime sees it.
#[derive(Clone, Debug, PartialEq)]
pub struct DockItem {
    pub app: String,
    pub pinned: bool,   // kept in the dock (ShellSettingsService.dockPinned)
    pub windows: u32,   // open toplevels for this app on the active workspace
    pub badge: u32,     // notification count (NotificationService)
    pub attention: bool,// app requested attention (xdg-activation / urgent)
}

impl DockItem {
    pub fn running(&self) -> bool { self.windows > 0 }
    /// Hovering a running item raises a window-preview popup (one card per open window).
    pub fn previewable(&self) -> bool { self.windows > 0 }
    /// A transient item is one shown only because it is running (not pinned).
    pub fn transient(&self) -> bool { !self.pinned && self.running() }
    /// Running indicator dots, capped at 3 (matches the renderer).
    pub fn dots(&self) -> u32 { self.windows.min(3) }
    /// Badge text the renderer paints ("" when none, "9+" when saturated).
    pub fn badge_text(&self) -> String {
        match self.badge { 0 => String::new(), n if n > 9 => "9+".into(), n => n.to_string() }
    }
}

/// A single window preview shown in the hover popup for a running dock item.
/// Clicking one raises/focuses that toplevel (host: foreign-toplevel activate).
#[derive(Clone, Debug, PartialEq)]
pub struct WindowPreview {
    pub id: u32,
    pub title: String,
    pub focused: bool,
}

/// One resolved card slot: either an app or the pinned/transient separator.
#[derive(Clone, Debug, PartialEq)]
pub enum Slot {
    App(DockItem),
    Separator,
}

/// Magnification config for the Row affordance (macOS-style cursor swell).
#[derive(Clone, Copy, Debug)]
pub struct Magnify {
    pub enabled: bool,
    pub strength: f32, // max scale bump at the cursor (0.2..=1.0 → 1.2×..2.0×)
    pub reach: f32,    // falloff distance in slots (cards within `reach` swell)
}
impl Default for Magnify {
    fn default() -> Self { Self { enabled: true, strength: 0.55, reach: 2.3 } }
}
impl Magnify {
    /// Falloff in [0,1] for a slot at `dist` slots from the hovered one.
    pub fn falloff(&self, dist: f32) -> f32 {
        if !self.enabled { return 0.0; }
        (1.0 - dist.abs() / self.reach).max(0.0)
    }
    /// Resolved scale for a slot given the hovered index (None = no hover).
    pub fn scale_at(&self, index: usize, hovered: Option<usize>) -> f32 {
        match hovered {
            Some(h) => 1.0 + self.strength * self.falloff(index as f32 - h as f32),
            None => 1.0,
        }
    }
}

/// The dock's item model: a pinned set joined with live runtime state.
#[derive(Clone, Debug, Default)]
pub struct DockItems {
    pub pinned: Vec<String>, // ordered pinned app ids
}

impl DockItems {
    /// Build the ordered slot list: pinned items, then (if any transient running
    /// apps exist) a separator and the transient items. `state(app)` yields the
    /// live (windows, badge, attention) for an app id.
    pub fn slots<F>(&self, running: &[String], state: F) -> Vec<Slot>
    where F: Fn(&str) -> (u32, u32, bool) {
        let mut out: Vec<Slot> = self.pinned.iter().map(|app| {
            let (windows, badge, attention) = state(app);
            Slot::App(DockItem { app: app.clone(), pinned: true, windows, badge, attention })
        }).collect();

        let transient: Vec<&String> = running.iter()
            .filter(|app| !self.pinned.iter().any(|p| p == *app))
            .collect();

        if !transient.is_empty() {
            out.push(Slot::Separator);
            for app in transient {
                let (windows, badge, attention) = state(app);
                out.push(Slot::App(DockItem { app: app.clone(), pinned: false, windows, badge, attention }));
            }
        }
        out
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn st(app: &str) -> (u32, u32, bool) {
        match app {
            "Mail" => (1, 3, false),
            "Web" => (2, 0, false),
            "Photos" => (1, 0, true),
            _ => (0, 0, false),
        }
    }

    #[test] fn badge_text_saturates() {
        let mut d = DockItem { app: "Mail".into(), pinned: true, windows: 1, badge: 3, attention: false };
        assert_eq!(d.badge_text(), "3");
        d.badge = 0; assert_eq!(d.badge_text(), "");
        d.badge = 42; assert_eq!(d.badge_text(), "9+");
    }

    #[test] fn dots_cap_at_three() {
        let d = DockItem { app: "x".into(), pinned: true, windows: 7, badge: 0, attention: false };
        assert_eq!(d.dots(), 3);
        assert!(d.running());
        assert!(d.previewable());
    }

    #[test] fn transient_apps_follow_a_separator() {
        let dock = DockItems { pinned: vec!["Files".into(), "Web".into(), "Mail".into()] };
        // Photos is running but not pinned → transient, after a separator.
        let slots = dock.slots(&["Web".into(), "Photos".into()], st);
        assert_eq!(slots.len(), 5); // 3 pinned + sep + 1 transient
        assert_eq!(slots[3], Slot::Separator);
        match &slots[4] { Slot::App(d) => { assert_eq!(d.app, "Photos"); assert!(d.transient()); assert!(d.attention); }, _ => panic!() }
    }

    #[test] fn no_separator_without_transient() {
        let dock = DockItems { pinned: vec!["Files".into(), "Web".into()] };
        let slots = dock.slots(&["Web".into()], st); // only a pinned app is running
        assert!(slots.iter().all(|s| !matches!(s, Slot::Separator)));
        assert_eq!(slots.len(), 2);
    }

    #[test] fn magnify_peaks_at_cursor_and_decays() {
        let m = Magnify::default();
        let s_hover = m.scale_at(3, Some(3));
        let s_near = m.scale_at(2, Some(3));
        let s_far = m.scale_at(0, Some(3));
        assert!((s_hover - (1.0 + m.strength)).abs() < 1e-6); // peak at cursor
        assert!(s_near > s_far);                               // monotone decay
        assert!((s_far - 1.0).abs() < 1e-6);                   // beyond reach → rest
    }

    #[test] fn magnify_disabled_or_no_hover_is_flat() {
        let off = Magnify { enabled: false, ..Default::default() };
        assert_eq!(off.scale_at(3, Some(3)), 1.0);
        let m = Magnify::default();
        assert_eq!(m.scale_at(3, None), 1.0);
    }
}
