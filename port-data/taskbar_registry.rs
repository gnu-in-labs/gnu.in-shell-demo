// gnuin-compose-core :: taskbar module registry (port target)
// Mirrors Central's data-driven taskbar. The point of this type set is that a
// taskbar widget is resolved from an OPEN string-id registry — NOT a closed
// `enum TaskbarWidgetId`. An unknown id resolves to `None` and the caller emits
// a diagnostic; it is never silently dropped by a `filter_map`.
//
// Replaces the closed pattern documented in
// TASKBAR_AUDIT_AND_GPUI_SPEC.md A7 / GOAL_ALIGNMENT_AND_NEXT_SLICE.md §3:
//   gnuin-bar/src/settings.rs:307 parse_widget_id() -> closed match -> None dropped.

use std::collections::BTreeMap;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Edge { Top, Bottom }

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Density { Regular, Compact }

/// How the host renders a resolved module. Open by construction: a new render
/// shape is a new variant OR a host-registered custom painter keyed by id.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum ModuleKind { Pills, Text, Icon, Mascot, Custom }

/// A registry entry. `ext = true` marks a third-party / non-builtin module that
/// resolves through the SAME registry as the builtins (the capability the old
/// closed enum lacked).
#[derive(Clone, Debug)]
pub struct ModuleDescriptor {
    pub id: &'static str,     // canonical, kebab-case
    pub label: &'static str,
    pub icon: &'static str,   // Material Symbols Rounded glyph
    pub kind: ModuleKind,
    pub ext: bool,
}

/// Per-output module plan. Durable handoff key: `shell.taskbar.modules_json`.
#[derive(Clone, Debug)]
pub struct TaskbarPlan {
    pub output: String,       // e.g. "eDP-1"
    pub edge: Edge,
    pub visible: bool,
    pub density: Density,
    pub left: Vec<String>,
    pub center: Vec<String>,
    pub right: Vec<String>,
}

/// What a slot resolution produces. A `Reject` is a first-class, surfaced
/// outcome — the renderer shows a diagnostic chip instead of dropping silently.
#[derive(Clone, Debug)]
pub enum Resolved<'a> {
    Module(&'a ModuleDescriptor),
    Reject { id: String, reason: &'static str },
}

pub struct ModuleRegistry {
    by_id: BTreeMap<&'static str, ModuleDescriptor>,
}

impl ModuleRegistry {
    pub fn with_builtins() -> Self {
        let mut by_id = BTreeMap::new();
        let d = |id, label, icon, kind, ext| ModuleDescriptor { id, label, icon, kind, ext };
        for m in [
            d("workspaces",    "Workspaces",    "view_column",           ModuleKind::Pills,  false),
            d("clock",         "Clock",         "schedule",              ModuleKind::Text,   false),
            d("active-window", "Active window", "web_asset",             ModuleKind::Text,   false),
            d("network",       "Network",       "wifi",                  ModuleKind::Icon,   false),
            d("bluetooth",     "Bluetooth",     "bluetooth",             ModuleKind::Icon,   false),
            d("audio",         "Audio",         "volume_up",             ModuleKind::Icon,   false),
            d("battery",       "Battery",       "battery_full",          ModuleKind::Icon,   false),
            d("tray",          "Settings tray", "tune",                  ModuleKind::Icon,   false),
            d("mascot",        "Sys.ter mini",  "smart_toy",             ModuleKind::Mascot, false),
            // third-party, registered as data — resolved through the same path:
            d("cpu",           "CPU load",      "memory",                ModuleKind::Text,   true),
            d("weather",       "Weather",       "wb_sunny",              ModuleKind::Text,   true),
            d("battery-pct",   "Battery %",     "battery_charging_full", ModuleKind::Text,   true),
        ] {
            by_id.insert(m.id, m);
        }
        Self { by_id }
    }

    pub fn register(&mut self, m: ModuleDescriptor) { self.by_id.insert(m.id, m); }
    pub fn len(&self) -> usize { self.by_id.len() }

    /// Open resolution. Unknown id -> Reject (surfaced), never silently dropped.
    pub fn resolve(&self, raw_id: &str) -> Resolved<'_> {
        let id = raw_id.trim().to_ascii_lowercase().replace([' ', '_'], "-");
        match self.by_id.get(id.as_str()) {
            Some(desc) => Resolved::Module(desc),
            None => Resolved::Reject { id, reason: "unknown-module-id: absent from registry" },
        }
    }

    /// Resolve a whole slot, collecting rejects as diagnostics (not dropping them).
    pub fn resolve_slot<'a>(&'a self, ids: &[String], diags: &mut Vec<String>) -> Vec<&'a ModuleDescriptor> {
        let mut out = Vec::new();
        for raw in ids {
            match self.resolve(raw) {
                Resolved::Module(d) => out.push(d),
                Resolved::Reject { id, reason } => diags.push(format!("taskbar: reject \"{id}\" ({reason})")),
            }
        }
        out
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn builtins_and_ext_share_one_registry() {
        let r = ModuleRegistry::with_builtins();
        assert!(matches!(r.resolve("workspaces"), Resolved::Module(_)));
        assert!(matches!(r.resolve("cpu"), Resolved::Module(_))); // ext resolves the same way
        assert_eq!(r.len(), 12);
    }

    #[test]
    fn unknown_id_is_surfaced_not_dropped() {
        let r = ModuleRegistry::with_builtins();
        match r.resolve("zorp") {
            Resolved::Reject { id, .. } => assert_eq!(id, "zorp"),
            _ => panic!("unknown id must reject, not resolve"),
        }
        // a closed enum's filter_map would have produced an empty Vec with no signal:
        let mut diags = Vec::new();
        let kept = r.resolve_slot(&["clock".into(), "zorp".into()], &mut diags);
        assert_eq!(kept.len(), 1);
        assert_eq!(diags.len(), 1); // the drop became a diagnostic
    }

    #[test]
    fn id_is_normalized() {
        let r = ModuleRegistry::with_builtins();
        assert!(matches!(r.resolve("Active Window"), Resolved::Module(d) if d.id == "active-window"));
    }
}
