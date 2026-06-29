// gnuin-compose-core :: bar (taskbar) appearance + widget settings (port target)
// One surface (band 30). `topbar*` is only the legacy ShellSettingsService key prefix —
// NOT a separate surface. Mirrors those keys + `widgetEnabled`.
// (components/settings/pages/ShellPage.qml getters/setters) as a typed,
// framework-free model. Resolution is pure: (settings, context) -> resolved.
//
// Source of truth: port-data/shell_settings.json (group "topbar" + "widgets").
// Central's Control Center Taskbar section (Apparence + Widgets subsections) and
// the live bar consume the same fields by name.

use std::collections::BTreeMap;

// ── enums (verbatim option sets from the backend) ───────────────────────────

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Edge { Top, Bottom }

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Density { Normal, Compact }

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum CornerStyle { Rounded, Screen, Square }

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum GroupStyle { Capsules, Borderless, Solid }

impl Edge {
    pub fn as_str(self) -> &'static str { match self { Edge::Top => "top", Edge::Bottom => "bottom" } }
    pub fn parse(s: &str) -> Option<Self> {
        match s { "top" => Some(Edge::Top), "bottom" => Some(Edge::Bottom), _ => None }
    }
}
impl Density {
    pub fn as_str(self) -> &'static str { match self { Density::Normal => "normal", Density::Compact => "compact" } }
    /// Bar height in logical px — matches Central's barHpx (touch/compact split).
    pub fn bar_height(self) -> f32 { match self { Density::Normal => 34.0, Density::Compact => 28.0 } }
    pub fn parse(s: &str) -> Option<Self> {
        match s { "normal" => Some(Density::Normal), "compact" => Some(Density::Compact), _ => None }
    }
}
impl CornerStyle {
    pub fn as_str(self) -> &'static str {
        match self { CornerStyle::Rounded => "rounded", CornerStyle::Screen => "screen", CornerStyle::Square => "square" }
    }
    /// Outer corner radius the bar requests, in px.
    pub fn radius(self) -> f32 {
        match self { CornerStyle::Rounded => 14.0, CornerStyle::Screen => 0.0, CornerStyle::Square => 0.0 }
    }
    pub fn parse(s: &str) -> Option<Self> {
        match s {
            "rounded" => Some(CornerStyle::Rounded),
            "screen" => Some(CornerStyle::Screen),
            "square" => Some(CornerStyle::Square),
            _ => None,
        }
    }
}
impl GroupStyle {
    pub fn as_str(self) -> &'static str {
        match self { GroupStyle::Capsules => "capsules", GroupStyle::Borderless => "borderless", GroupStyle::Solid => "solid" }
    }
    pub fn parse(s: &str) -> Option<Self> {
        match s {
            "capsules" => Some(GroupStyle::Capsules),
            "borderless" => Some(GroupStyle::Borderless),
            "solid" => Some(GroupStyle::Solid),
            _ => None,
        }
    }
}

// ── widgets (the 12-strong shell component inventory) ────────────────────────
// ShellSettingsService.widgetEnabled(id) / setWidgetEnabled(id, on).
// Order is the canonical strip order.

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Widget {
    SidebarLeft, ActiveWindow, Resources, Media, Workspaces, Clock,
    GnosisApp, Notifications, Wifi, Bluetooth, Weather, Audio,
}

pub const WIDGET_ORDER: [Widget; 12] = [
    Widget::SidebarLeft, Widget::ActiveWindow, Widget::Resources, Widget::Media,
    Widget::Workspaces, Widget::Clock, Widget::GnosisApp, Widget::Notifications,
    Widget::Wifi, Widget::Bluetooth, Widget::Weather, Widget::Audio,
];

impl Widget {
    pub fn id(self) -> &'static str {
        match self {
            Widget::SidebarLeft => "sidebar-left",
            Widget::ActiveWindow => "active-window",
            Widget::Resources => "resources",
            Widget::Media => "media",
            Widget::Workspaces => "workspaces",
            Widget::Clock => "clock",
            Widget::GnosisApp => "gnosis-app",
            Widget::Notifications => "notifications",
            Widget::Wifi => "wifi",
            Widget::Bluetooth => "bluetooth",
            Widget::Weather => "weather",
            Widget::Audio => "audio",
        }
    }
    pub fn parse(s: &str) -> Option<Self> {
        WIDGET_ORDER.iter().copied().find(|w| w.id() == s)
    }
    /// Default strip slot. Diagnostics/system widgets sit right; identity left; status center.
    pub fn default_slot(self) -> Slot {
        match self {
            Widget::SidebarLeft | Widget::ActiveWindow | Widget::Workspaces => Slot::Left,
            Widget::Clock | Widget::Media => Slot::Center,
            _ => Slot::Right,
        }
    }
}

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Slot { Left, Center, Right }

// ── settings struct ─────────────────────────────────────────────────────────

#[derive(Clone, Debug)]
pub struct BarSettings {
    pub edge: Edge,
    pub density: Density,
    pub background_visible: bool,
    pub corner_style: CornerStyle,
    pub group_style: GroupStyle,
    pub floating_shadow: bool,
    pub auto_hide: bool,
    pub super_reveal: bool,
    pub app_strip_max: u8,
    pub app_strip_max_shortened: u8,
    pub clock_format: String,
    pub show_tooltips: bool,
    /// Per-widget enablement; absent key == enabled (matches QML default-true).
    pub widget_enabled: BTreeMap<&'static str, bool>,
}

impl Default for BarSettings {
    fn default() -> Self {
        BarSettings {
            edge: Edge::Top,
            density: Density::Normal,
            background_visible: true,
            corner_style: CornerStyle::Rounded,
            group_style: GroupStyle::Capsules,
            floating_shadow: false,
            auto_hide: false,
            super_reveal: true,
            app_strip_max: 8,
            app_strip_max_shortened: 4,
            clock_format: "HH:mm".to_string(),
            show_tooltips: true,
            widget_enabled: BTreeMap::new(),
        }
    }
}

impl BarSettings {
    pub fn is_enabled(&self, w: Widget) -> bool {
        *self.widget_enabled.get(w.id()).unwrap_or(&true)
    }
    pub fn set_enabled(&mut self, w: Widget, on: bool) {
        self.widget_enabled.insert(w.id(), on);
    }
    /// Effective app-strip cap for a monitor: shortened budget on narrow outputs.
    pub fn effective_app_cap(&self, monitor_w: f32) -> u8 {
        if monitor_w < 1280.0 { self.app_strip_max_shortened } else { self.app_strip_max }
            .clamp(1, 12)
    }
}

// ── resolution context + result ─────────────────────────────────────────────

#[derive(Clone, Copy, Debug)]
pub struct BarContext {
    pub monitor_w: f32,
    pub super_held: bool,
    pub hover_reveal: bool,
}

#[derive(Clone, Debug, PartialEq)]
pub struct ResolvedBar {
    pub visible: bool,
    pub height: f32,
    pub corner_radius: f32,
    pub draws_background: bool,
    pub draws_shadow: bool,
    pub reserves_zone: bool,
    pub app_cap: u8,
    /// Enabled widgets in strip order, grouped by slot.
    pub left: Vec<Widget>,
    pub center: Vec<Widget>,
    pub right: Vec<Widget>,
}

/// Pure resolution: the engine derives the whole bar plan from settings+context.
pub fn resolve_bar(s: &BarSettings, cx: BarContext) -> ResolvedBar {
    // visibility: auto-hide stays hidden unless an explicit reveal (hover) or
    // super-reveal (Super held) brings it back.
    let visible = if s.auto_hide {
        cx.hover_reveal || (s.super_reveal && cx.super_held)
    } else {
        true
    };
    // floating treatments (no solid background) drop the reserved zone.
    let reserves_zone = s.background_visible && !s.auto_hide;
    let draws_shadow = s.floating_shadow && !s.background_visible;

    let mut left = Vec::new();
    let mut center = Vec::new();
    let mut right = Vec::new();
    for w in WIDGET_ORDER {
        if !s.is_enabled(w) { continue; }
        match w.default_slot() {
            Slot::Left => left.push(w),
            Slot::Center => center.push(w),
            Slot::Right => right.push(w),
        }
    }

    ResolvedBar {
        visible,
        height: s.density.bar_height(),
        corner_radius: if s.background_visible { s.corner_style.radius() } else { 0.0 },
        draws_background: s.background_visible,
        draws_shadow,
        reserves_zone,
        app_cap: s.effective_app_cap(cx.monitor_w),
        left,
        center,
        right,
    }
}

#[cfg(test)]
mod bar_tests {
    use super::*;

    fn cx() -> BarContext { BarContext { monitor_w: 1920.0, super_held: false, hover_reveal: false } }

    #[test]
    fn defaults_show_all_twelve_widgets() {
        let s = BarSettings::default();
        let r = resolve_bar(&s, cx());
        assert_eq!(r.left.len() + r.center.len() + r.right.len(), 12);
        assert!(r.visible && r.draws_background && r.reserves_zone);
    }

    #[test]
    fn disabling_a_widget_drops_it_from_its_slot() {
        let mut s = BarSettings::default();
        s.set_enabled(Widget::Weather, false);
        let r = resolve_bar(&s, cx());
        assert!(!r.right.contains(&Widget::Weather));
        assert_eq!(r.left.len() + r.center.len() + r.right.len(), 11);
    }

    #[test]
    fn auto_hide_hidden_until_reveal_or_super() {
        let mut s = BarSettings::default();
        s.auto_hide = true;
        assert!(!resolve_bar(&s, cx()).visible);
        let hovered = BarContext { hover_reveal: true, ..cx() };
        assert!(resolve_bar(&s, hovered).visible);
        let supered = BarContext { super_held: true, ..cx() };
        assert!(resolve_bar(&s, supered).visible); // super_reveal default true
    }

    #[test]
    fn super_reveal_off_ignores_super_key() {
        let mut s = BarSettings::default();
        s.auto_hide = true;
        s.super_reveal = false;
        let supered = BarContext { super_held: true, ..cx() };
        assert!(!resolve_bar(&s, supered).visible);
    }

    #[test]
    fn floating_drops_reserved_zone_and_can_shadow() {
        let mut s = BarSettings::default();
        s.background_visible = false;
        s.floating_shadow = true;
        let r = resolve_bar(&s, cx());
        assert!(!r.reserves_zone);
        assert!(r.draws_shadow);
        assert_eq!(r.corner_radius, 0.0); // no backing -> no rounded backing corner
    }

    #[test]
    fn narrow_monitor_uses_shortened_app_cap() {
        let s = BarSettings::default();
        assert_eq!(resolve_bar(&s, BarContext { monitor_w: 1024.0, ..cx() }).app_cap, 4);
        assert_eq!(resolve_bar(&s, cx()).app_cap, 8);
    }

    #[test]
    fn compact_density_is_shorter() {
        let mut s = BarSettings::default();
        s.density = Density::Compact;
        assert!(resolve_bar(&s, cx()).height < Density::Normal.bar_height());
    }

    #[test]
    fn enum_round_trips() {
        for v in ["top", "bottom"] { assert_eq!(Edge::parse(v).unwrap().as_str(), v); }
        for v in ["rounded", "screen", "square"] { assert_eq!(CornerStyle::parse(v).unwrap().as_str(), v); }
        for v in ["capsules", "borderless", "solid"] { assert_eq!(GroupStyle::parse(v).unwrap().as_str(), v); }
        assert_eq!(Widget::parse("gnosis-app"), Some(Widget::GnosisApp));
        assert_eq!(Widget::parse("nope"), None);
    }
}
