// gnuin-compose-host :: menu_state — PORT PARITY MIRROR (not the source of truth)
// ============================================================================
// Faithful mirror of gnu.in-os/engine/gnuin-compose-host/src/menu_state.rs.
//
// Pure lifecycle state machine for the context-menu overlay — zero Wayland/sctk
// imports (all side-effects live in main.rs behind the `wayland` feature). It
// models the invariant the live host must enforce: AT MOST ONE overlay surface
// is alive at any time. The three bugs it fixes all violate that:
//   - Double surfaces: open while live created a 2nd layer-shell surface →
//     open() now REPLACES (has_surface 1→1), reporting previous_surface_torn_down.
//   - Stuck surfaces: a never-promoted pending_request lingered → dismiss() now
//     unconditionally zeros every field.
//   - Stale configure: a configure arriving after dismiss → configure() is a
//     no-op when !has_surface (never resurrects a dismissed menu).
//
// on_hit() maps a Scene::hit result to an outcome — the same mapping Central's
// input model uses: MenuRow→Action, MenuPanel/Blob→KeepOpen, None→Dismiss.

use crate::compose::MenuRequest;
use crate::NodeId;

/// Outcome of `MenuState::open`. The host must destroy the old LayerSurface
/// before creating the new one when `previous_surface_torn_down` is true.
#[derive(Debug, Clone, PartialEq)]
pub struct OpenOutcome { pub previous_surface_torn_down: bool }

/// Whether the host recreates the overlay surface or reuses the live one. A
/// wlr-layer-shell surface is bound to one output for life and can't be
/// reparented: same output → Reuse (removes per-menu create/destroy churn);
/// different output or none → Recreate.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum SurfaceAction { Reuse, Recreate }

/// Pure, Wayland-free reuse-vs-recreate decision (the heart of the persistent-
/// surface design).
pub fn surface_action(existing_output: Option<&str>, target: &str) -> SurfaceAction {
    match existing_output {
        Some(output) if output == target => SurfaceAction::Reuse,
        _ => SurfaceAction::Recreate,
    }
}

/// Outcome of `MenuState::on_hit`.
#[derive(Debug, Clone, PartialEq)]
pub enum HitOutcome {
    /// Hit a MenuRow → write HostEvent::Action{id} to the QML client, then dismiss.
    Action(String),
    /// Hit a non-row node (MenuPanel/Blob) → keep the overlay open.
    KeepOpen,
    /// Missed every node (click-away) or None → dismiss the overlay.
    Dismiss,
}

/// Pure lifecycle model. `main.rs::App` wraps this and turns each outcome into
/// Wayland side-effects (create/destroy LayerSurface, paint, write HostEvent).
#[derive(Debug, Default)]
pub struct MenuState {
    pub current_output: Option<String>,
    pub current_request: Option<MenuRequest>,
    pub pending_request: Option<MenuRequest>,
    pub has_surface: bool,
    pub configured: bool,
}

impl MenuState {
    pub fn new() -> Self { Self::default() }

    /// Request a new overlay. If a surface is live it is REPLACED (old torn
    /// down) — never accumulated. After: has_surface, !configured,
    /// current_request=None, pending_request=Some, current_output=Some.
    pub fn open(&mut self, request: MenuRequest, output: String) -> OpenOutcome {
        let previous_surface_torn_down = self.has_surface;
        self.current_request = None;
        self.pending_request = None;
        self.configured = false;
        self.current_output = Some(output);
        self.pending_request = Some(request);
        self.has_surface = true;
        OpenOutcome { previous_surface_torn_down }
    }

    /// Compositor `configure`. Promotes pending→current and marks configured.
    /// No-op (returns false) when !has_surface: a late configure must never
    /// resurrect a dismissed menu.
    pub fn configure(&mut self, _w: u32, _h: u32) -> bool {
        if !self.has_surface { return false; }
        self.configured = true;
        if let Some(req) = self.pending_request.take() { self.current_request = Some(req); }
        true
    }

    /// Tear down — zero every field (kills "stuck surfaces").
    pub fn dismiss(&mut self) {
        self.has_surface = false;
        self.configured = false;
        self.current_request = None;
        self.pending_request = None;
        self.current_output = None;
    }

    /// Resolve a hit-test result into a HitOutcome.
    /// MenuRow → look up the action id from current_request (out-of-bounds →
    /// Dismiss); any other node → KeepOpen; None → Dismiss.
    pub fn on_hit(&self, node: Option<NodeId>) -> HitOutcome {
        match node {
            Some(NodeId::MenuRow { group, row }) => {
                let id = self.current_request.as_ref()
                    .and_then(|r| r.row_id(group, row)).map(str::to_owned);
                match id { Some(id) => HitOutcome::Action(id), None => HitOutcome::Dismiss }
            }
            Some(_) => HitOutcome::KeepOpen,
            None => HitOutcome::Dismiss,
        }
    }

    /// Fully idle (no surface, no requests)?
    pub fn is_idle(&self) -> bool {
        !self.has_surface && !self.configured
            && self.current_request.is_none()
            && self.pending_request.is_none()
            && self.current_output.is_none()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::menu::{Group, MenuStyle, Row};
    use crate::{Backed, NodeId};

    fn req_a() -> MenuRequest {
        MenuRequest::open(MenuStyle::List,
            vec![Group::new("Actions", vec![Row::item("copy", "Copy"), Row::item("paste", "Paste")])],
            (120.0, 80.0))
    }
    fn req_b() -> MenuRequest {
        MenuRequest::open(MenuStyle::List,
            vec![Group::new("Edit", vec![Row::item("undo", "Undo")])], (300.0, 200.0))
    }

    // INVARIANT: no double surfaces — open twice never yields two live surfaces.
    #[test] fn open_twice_never_yields_two_surfaces() {
        let mut s = MenuState::new();
        assert!(!s.open(req_a(), "DP-1".into()).previous_surface_torn_down);
        let second = s.open(req_b(), "DP-2".into());
        assert!(second.previous_surface_torn_down, "2nd open reports prior torn down");
        assert!(s.has_surface, "still exactly one surface (replace, not accumulate)");
        assert!(s.current_request.is_none(), "current cleared until configure");
    }

    // INVARIANT: dismiss fully clears (kills stuck surfaces).
    #[test] fn dismiss_fully_clears_all_state() {
        let mut s = MenuState::new();
        s.open(req_a(), "DP-1".into()); s.configure(1920, 1080);
        s.dismiss();
        assert!(s.is_idle());
    }

    // INVARIANT: stale configure after dismiss does not resurrect the menu.
    #[test] fn stale_configure_after_dismiss_is_noop() {
        let mut s = MenuState::new();
        s.open(req_a(), "DP-1".into()); s.dismiss();
        assert!(!s.configure(1920, 1080), "late configure returns false");
        assert!(s.is_idle());
    }

    // on_hit mapping (mirrors Central's input model: row→action, panel/blob→keep, none→dismiss).
    #[test] fn on_hit_row_returns_action_id() {
        let mut s = MenuState::new();
        s.open(req_a(), "DP-1".into()); s.configure(1920, 1080);
        assert_eq!(s.on_hit(Some(NodeId::MenuRow { group: 0, row: 0 })), HitOutcome::Action("copy".into()));
        assert_eq!(s.on_hit(Some(NodeId::MenuRow { group: 0, row: 1 })), HitOutcome::Action("paste".into()));
    }
    #[test] fn on_hit_panel_and_blob_keep_open() {
        let mut s = MenuState::new();
        s.open(req_a(), "DP-1".into()); s.configure(1920, 1080);
        assert_eq!(s.on_hit(Some(NodeId::MenuPanel)), HitOutcome::KeepOpen);
        assert_eq!(s.on_hit(Some(NodeId::Blob(Backed::Menu))), HitOutcome::KeepOpen);
    }
    #[test] fn on_hit_none_dismisses() {
        let s = MenuState::new();
        assert_eq!(s.on_hit(None), HitOutcome::Dismiss);
    }

    // configure promotes pending→current.
    #[test] fn configure_promotes_pending_to_current() {
        let mut s = MenuState::new();
        s.open(req_a(), "DP-1".into());
        assert!(s.pending_request.is_some() && s.current_request.is_none());
        assert!(s.configure(1920, 1080));
        assert!(s.pending_request.is_none() && s.current_request.is_some());
    }

    // persistent-surface decision: reuse same output, recreate on change/none.
    #[test] fn surface_action_reuse_vs_recreate() {
        assert_eq!(surface_action(None, "DP-1"), SurfaceAction::Recreate);
        assert_eq!(surface_action(Some("DP-1"), "DP-1"), SurfaceAction::Reuse);
        assert_eq!(surface_action(Some("DP-1"), "DP-2"), SurfaceAction::Recreate);
    }
}
