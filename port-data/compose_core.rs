// gnuin-compose-core — PORT PARITY MIRROR (not the source of truth)
// ============================================================================
// The authoritative crate is checked in and fully unit-tested at:
//     gnu.in-os/engine/gnuin-compose-core   (v0.14.2, edition 2021, std-only)
//
// This file mirrors that crate's PUBLIC API exactly — same type names, variants,
// field names, and the canonical generated constants — so Central's simulator
// and the golden fixtures in ./scenes/*.json line up byte-for-byte with what the
// real `reduce()` / `Scene` emit. It is a conformance reference, NOT a fork: do
// not diverge it; when the crate changes, update this mirror (and PARITY.md).
//
// Spec: docs/COMPOSITION_ENGINE_SPEC.md (menus first). Thesis: one engine owns
// every chrome node, resolves its look from tokens, and composes them in a single
// ordered pass — retiring the mutual-exclusion antipattern (membraneOwnsBar #5,
// the panneau-noir geometry handshake #4, per-style usesMembraneChrome opt-in).
//
// Canonical values below are the generated tokens from blob.in/tokens.json (E1:
// one design source updates all hosts). In the real crate they arrive via
// `include!("../../blob.in/gen/gnu_theme.rs")`; reproduced here as plain consts.

#![allow(dead_code)]

// ── Canonical generated constants (blob.in/tokens.json → gen/gnu_theme.rs) ──
pub mod layer {
    use crate::NodeKind;
    pub const BACKGROUND: i32 = 0;
    pub const WALLPAPER: i32 = 50;
    pub const BLOB: i32 = 100;
    pub const DOCK: i32 = 150;
    pub const BAR: i32 = 200;
    pub const SIDEBAR: i32 = 250;
    pub const MENU_PANEL: i32 = 300;
    pub const MENU_ROW: i32 = 305;
    pub const MENU_SUB: i32 = 310;
    pub const OSD: i32 = 350;
    pub const NOTIFICATION: i32 = 380;
    pub const LAUNCHER: i32 = 390;
    pub const OVERLAY: i32 = 400;
    pub const MODAL: i32 = 420;
    pub const SCREEN_CORNER: i32 = 450;

    /// The single, exhaustive kind→z map: the reducer never picks a layer by
    /// inspecting another node. Blob sits below the chrome it backs.
    pub fn band(kind: NodeKind) -> i32 {
        match kind {
            NodeKind::Background => BACKGROUND,
            NodeKind::Wallpaper => WALLPAPER,
            NodeKind::Blob => BLOB,
            NodeKind::Dock => DOCK,
            NodeKind::Bar => BAR,
            NodeKind::Sidebar => SIDEBAR,
            NodeKind::MenuPanel => MENU_PANEL,
            NodeKind::MenuRow => MENU_ROW,
            NodeKind::Osd => OSD,
            NodeKind::Notification => NOTIFICATION,
            NodeKind::Launcher => LAUNCHER,
            NodeKind::Overlay => OVERLAY,
            NodeKind::Modal => MODAL,
            NodeKind::ScreenCorner => SCREEN_CORNER,
        }
    }
}

/// Blob inflation around each backed element (legacy UI `panelEdgeMargin`).
pub const DEFAULT_EDGE_MARGIN: f64 = 6.0;
// geometry_px: bar_radius 14, menu_radius 12, blob_radius 12, bar_height 40
pub const MENU_RADIUS: f64 = 12.0;
pub const BLOB_RADIUS: f64 = 12.0;
pub const BAR_RADIUS: f64 = 14.0;
// motion durations_ms.base
pub const MOTION_BASE_MS: u32 = 240;

// ── Geometry ────────────────────────────────────────────────────────────────
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Rect { pub x: f64, pub y: f64, pub w: f64, pub h: f64 }
impl Rect {
    pub const ZERO: Rect = Rect { x: 0.0, y: 0.0, w: 0.0, h: 0.0 };
    pub fn new(x: f64, y: f64, w: f64, h: f64) -> Self { Rect { x, y, w, h } }
    pub fn is_empty(&self) -> bool { self.w <= 0.0 || self.h <= 0.0 }
    pub fn right(&self) -> f64 { self.x + self.w }
    pub fn bottom(&self) -> f64 { self.y + self.h }
    pub fn contains(&self, x: f64, y: f64) -> bool {
        !self.is_empty() && x >= self.x && x < self.right() && y >= self.y && y < self.bottom()
    }
    /// Empty stays empty: a zero element ⇒ zero blob, never a stray inflated rect.
    pub fn inflate(&self, m: f64) -> Rect {
        if self.is_empty() { return Rect::ZERO; }
        Rect { x: self.x - m, y: self.y - m, w: self.w + m * 2.0, h: self.h + m * 2.0 }
    }
    pub fn union(&self, o: &Rect) -> Rect {
        if self.is_empty() { return *o; }
        if o.is_empty() { return *self; }
        let x = self.x.min(o.x); let y = self.y.min(o.y);
        Rect { x, y, w: self.right().max(o.right()) - x, h: self.bottom().max(o.bottom()) - y }
    }
    /// Intersection (clip). Empty if they don't overlap — clipping a child's
    /// hit/focus rect to its surface guarantees it NEVER bleeds past the border.
    pub fn intersect(&self, o: &Rect) -> Rect {
        let x = self.x.max(o.x); let y = self.y.max(o.y);
        let r = self.right().min(o.right()); let b = self.bottom().min(o.bottom());
        if r <= x || b <= y { return Rect::ZERO; }
        Rect { x, y, w: r - x, h: b - y }
    }
    /// Shift (not shrink) to sit inside `area` with `margin` — the engine-owned
    /// work-area clamp. Replaces the per-surface panel->service->blob geometry
    /// handshake: a surface near an edge is repositioned, never left overflowing.
    pub fn clamp_inside(&self, area: &Rect, margin: f64) -> Rect {
        let mut x = self.x; let mut y = self.y;
        if x + self.w > area.right() - margin { x = area.right() - margin - self.w; }
        if y + self.h > area.bottom() - margin { y = area.bottom() - margin - self.h; }
        x = x.max(area.x + margin); y = y.max(area.y + margin);
        Rect { x, y, w: self.w, h: self.h }
    }
}

// ── Node identity / kind / lifecycle ──────────────────────────────────────────
/// What a blob backs — several membrane blobs can coexist, one per backed element.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum Backed { Menu, Bar, Dock }

/// Stable diff key across frames. Switching menus replaces the node bound to an id.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum NodeId {
    Bar, Dock, Background, Wallpaper, MenuPanel,
    MenuSub(u8),
    /// Hittable row; indices recover the action via MenuRequest::row_id(group,row).
    MenuRow { group: u16, row: u16 },
    Blob(Backed),
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum NodeKind {
    Background, Wallpaper, Bar, Dock, Sidebar, Blob, MenuPanel, MenuRow,
    Osd, Notification, Launcher, Overlay, Modal, ScreenCorner,
}
impl NodeKind {
    /// Pure backings + decoration never take input → excluded from the input region.
    pub fn is_interactive(self) -> bool {
        !matches!(self, NodeKind::Background | NodeKind::Wallpaper | NodeKind::Blob | NodeKind::ScreenCorner)
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum NodeState { Hidden, Opening, Open, Committing, Closing }

// ── Tokenization (resolved once into each node) ───────────────────────────────
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct Color { pub r: u8, pub g: u8, pub b: u8, pub a: u8 }
impl Color {
    pub const fn rgb(r: u8, g: u8, b: u8) -> Self { Color { r, g, b, a: 255 } }
    pub const fn rgba(r: u8, g: u8, b: u8, a: u8) -> Self { Color { r, g, b, a } }
    pub fn with_alpha(self, a: f64) -> Self { Color { a: (a.clamp(0.0, 1.0) * 255.0).round() as u8, ..self } }
}
// dark-neo palette (color.* in tokens.json)
pub const DARK_NEO_SURFACE: Color = Color::rgb(0x0F, 0x11, 0x15);
pub const DARK_NEO_ELEV_1: Color = Color::rgb(0x15, 0x19, 0x1E);
pub const DARK_NEO_ELEV_2: Color = Color::rgb(0x1A, 0x20, 0x26);
pub const FG3_DARK: Color = Color::rgb(0x7C, 0x82, 0x8A);
pub const BG_TUI: Color = Color::rgb(0x0D, 0x10, 0x14);
pub const ACCENT: Color = Color::rgb(0xFF, 0x6A, 0x00);

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum PerfTier { Sdf, Static }
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Transparency { Opaque, Translucent }
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Contrast { Standard, High }

/// Interaction density — panel/row metrics mirror GnuContextTokens.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Density { Mouse, Comfy, Touch }
impl Density {
    pub fn panel_width(self) -> f64 { match self { Density::Mouse => 280.0, Density::Comfy => 300.0, Density::Touch => 320.0 } }
    pub fn row_height(self) -> f64 { match self { Density::Mouse => 28.0, Density::Comfy => 32.0, Density::Touch => 40.0 } }
    pub fn group_header_height(self) -> f64 { match self { Density::Mouse => 22.0, Density::Comfy => 24.0, Density::Touch => 28.0 } }
    pub fn panel_v_padding(self) -> f64 { match self { Density::Mouse => 4.0, Density::Comfy => 6.0, Density::Touch => 8.0 } }
    pub fn row_h_padding(self) -> f64 { match self { Density::Mouse => 8.0, Density::Comfy => 10.0, Density::Touch => 12.0 } }
}

/// Resolved look for a node — the renderer reads these and never branches on raw settings.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct TokenBundle {
    pub surface: Color, pub border: Color, pub border_px: f64,
    pub radius: f64, pub opacity: f64, pub motion_ms: u32,
}
// TokenBundle::resolve(kind, perf, transparency, contrast) — see the crate; the
// load-bearing cases: MenuPanel→ELEV_2/radius12; Blob(Sdf)→DARK_NEO_SURFACE,
// Blob(Static)→ELEV_1 (tier picks the rasterizer, never toggles the node);
// MenuRow→transparent/radius6/120ms; Background→BG_TUI.

// ── Menu model (typed port of ContextMenuService normalization) ───────────────
/// 23 styles — 7 chrome (membrane-backed) + 16 bespoke (self-surfaced).
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum MenuStyle {
    // chrome — backed_by_blob()==true
    List, Brand, TrayAudio, TrayNetwork, TrayBluetooth, TrayPower, TrayUnified,
    // bespoke — render their own surface, never a blob
    Bubble, BubbleTree, Radial, RadialPill, NestedRadialPill, RadialDetached,
    Concentric, MegaPanel, Fractal, Drill, Cascade, WindowTileGrid,
    WidgetCard, WorkspaceCard, WidgetPills, WindowCompact,
}
impl MenuStyle {
    /// Mirrors usesMembraneChrome = list || brand || startsWith("tray").
    pub fn backed_by_blob(self) -> bool {
        use MenuStyle::*;
        matches!(self, List | Brand | TrayAudio | TrayNetwork | TrayBluetooth | TrayPower | TrayUnified)
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum RowKind { Item, Radio, Toggle, Slider, Tile, Radial, Separator }

#[derive(Debug, Clone, PartialEq)]
pub struct Row {
    pub id: String, pub kind: RowKind, pub label: String, pub group: String,
    pub on: bool, pub accent: bool, pub danger: bool, pub disabled: bool, pub mascot: bool,
    pub submenu: Vec<Row>,
}
#[derive(Debug, Clone, PartialEq)]
pub struct Group { pub head: String, pub sub: String, pub items: Vec<Row> }
#[derive(Debug, Clone, PartialEq)]
pub struct MenuModel { pub style: MenuStyle, pub groups: Vec<Group> }
// MenuModel::new applies enforce_single_mascot; apply_radio_selection is exclusive
// within a group; row_count counts nested submenu rows. (Ported & tested in-crate.)

// ── Node / Scene ──────────────────────────────────────────────────────────────
#[derive(Debug, Clone, PartialEq)]
pub struct BlobBacking { pub backs: NodeId }
#[derive(Debug, Clone, PartialEq)]
pub struct MenuRowData { pub label: String, pub kind: RowKind, pub danger: bool, pub accent: bool, pub disabled: bool }
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct WallpaperData { pub generation: u64, pub source: u64 }

#[derive(Debug, Clone, PartialEq)]
pub enum NodePayload { None, Menu(MenuModel), Blob(BlobBacking), MenuRow(MenuRowData), Wallpaper(WallpaperData) }

#[derive(Debug, Clone, PartialEq)]
pub struct Node {
    pub id: NodeId, pub kind: NodeKind, pub rect: Rect, pub z: i32,
    pub state: NodeState, pub tokens: TokenBundle, pub payload: NodePayload,
}
impl Node {
    pub fn is_live(&self) -> bool { self.state != NodeState::Hidden && !self.rect.is_empty() }
}

#[derive(Debug, Clone, PartialEq)]
pub struct Scene { pub screen: Rect, pub nodes: Vec<Node> }
impl Scene {
    pub fn get(&self, id: NodeId) -> Option<&Node> { self.nodes.iter().find(|n| n.id == id) }
    pub fn ordered(&self) -> Vec<&Node> { let mut v: Vec<&Node> = self.nodes.iter().collect(); v.sort_by_key(|n| n.z); v }
    pub fn live(&self) -> Vec<&Node> { self.ordered().into_iter().filter(|n| n.is_live()).collect() }
    /// Topmost live *interactive* node — a decorative mask never absorbs a click.
    pub fn hit(&self, x: f64, y: f64) -> Option<NodeId> {
        self.nodes.iter().filter(|n| n.is_live() && n.kind.is_interactive() && n.rect.contains(x, y))
            .max_by_key(|n| n.z).map(|n| n.id)
    }
    /// Wayland input mask: live interactive rects — blobs/backings/decoration excluded.
    pub fn input_region(&self) -> Vec<Rect> {
        self.live().into_iter().filter(|n| n.kind.is_interactive()).map(|n| n.rect).collect()
    }
}

// ── Diff / damage — retained-mode reactivity (faithful port of diff.rs) ──
// state → reduce → new Scene → diff → targeted host updates. The host keeps the
// previous Scene and applies only what changed — no surface lifecycle by hand.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum NodeChange { Added(NodeId), Removed(NodeId), Moved(NodeId), Updated(NodeId) }
impl NodeChange {
    pub fn id(self) -> NodeId {
        match self { NodeChange::Added(i) | NodeChange::Removed(i) | NodeChange::Moved(i) | NodeChange::Updated(i) => i }
    }
}
#[derive(Debug, Clone, Default, PartialEq)]
pub struct SceneDiff { pub changes: Vec<NodeChange> }
impl SceneDiff {
    pub fn is_empty(&self) -> bool { self.changes.is_empty() }
    pub fn len(&self) -> usize { self.changes.len() }
}

/// Minimal change set turning `prev` into `next`, keyed by NodeId. A node in
/// both with a different rect yields Moved; if its non-geometry fields (state,
/// z, tokens, payload) also differ it ADDITIONALLY yields Updated — a move +
/// restyle reports both, exactly as the crate.
pub fn diff(prev: &Scene, next: &Scene) -> SceneDiff {
    let mut changes = Vec::new();
    for p in &prev.nodes { if next.get(p.id).is_none() { changes.push(NodeChange::Removed(p.id)); } }
    for n in &next.nodes {
        match prev.get(n.id) {
            None => changes.push(NodeChange::Added(n.id)),
            Some(p) => {
                if p.rect != n.rect { changes.push(NodeChange::Moved(n.id)); }
                if p.state != n.state || p.z != n.z || p.tokens != n.tokens || p.payload != n.payload {
                    changes.push(NodeChange::Updated(n.id));
                }
            }
        }
    }
    SceneDiff { changes }
}

/// The dirty region (E5 contract): union of every changed node's rect — its
/// next rect, plus its prev rect when it moved or was removed. Rect::ZERO when
/// nothing changed, so a motion-only restyle damages just that node and never
/// forces a full-screen repaint.
pub fn damage(prev: &Scene, next: &Scene) -> Rect {
    let mut region = Rect::ZERO;
    for p in &prev.nodes { if next.get(p.id).is_none() { region = region.union(&p.rect); } }
    for n in &next.nodes {
        match prev.get(n.id) {
            None => region = region.union(&n.rect),
            Some(p) => {
                let changed = p.rect != n.rect || p.state != n.state || p.z != n.z
                    || p.tokens != n.tokens || p.payload != n.payload;
                if changed {
                    region = region.union(&n.rect);
                    if p.rect != n.rect { region = region.union(&p.rect); }
                }
            }
        }
    }
    region
}

#[cfg(test)]
mod diff_tests {
    use super::*;
    fn tk() -> TokenBundle { TokenBundle { surface: DARK_NEO_ELEV_2, border: FG3_DARK, border_px: 1.0, radius: 12.0, opacity: 1.0, motion_ms: 240 } }
    fn nd(id: NodeId, kind: NodeKind, rect: Rect, z: i32, st: NodeState) -> Node { Node { id, kind, rect, z, state: st, tokens: tk(), payload: NodePayload::None } }
    fn scr() -> Rect { Rect::new(0.0, 0.0, 1920.0, 1080.0) }
    fn bar() -> Node { nd(NodeId::Bar, NodeKind::Bar, Rect::new(0.0, 0.0, 1920.0, 40.0), 200, NodeState::Open) }
    fn panel_at(x: f64) -> Node { nd(NodeId::MenuPanel, NodeKind::MenuPanel, Rect::new(x, 388.0, 280.0, 92.0), 300, NodeState::Open) }

    #[test] fn identical_scenes_have_no_diff() { let a = Scene { screen: scr(), nodes: vec![bar()] }; assert!(diff(&a, &a).is_empty()); }
    #[test] fn opening_adds_panel() {
        let a = Scene { screen: scr(), nodes: vec![bar()] };
        let b = Scene { screen: scr(), nodes: vec![bar(), panel_at(488.0)] };
        assert!(diff(&a, &b).changes.contains(&NodeChange::Added(NodeId::MenuPanel)));
    }
    #[test] fn closing_removes_panel() {
        let a = Scene { screen: scr(), nodes: vec![bar(), panel_at(488.0)] };
        let b = Scene { screen: scr(), nodes: vec![bar()] };
        assert!(diff(&a, &b).changes.contains(&NodeChange::Removed(NodeId::MenuPanel)));
    }
    #[test] fn moving_reports_moved_not_add_remove() {
        let a = Scene { screen: scr(), nodes: vec![panel_at(200.0)] };
        let b = Scene { screen: scr(), nodes: vec![panel_at(900.0)] };
        let d = diff(&a, &b);
        assert!(d.changes.contains(&NodeChange::Moved(NodeId::MenuPanel)));
        assert!(!d.changes.iter().any(|c| matches!(c, NodeChange::Added(_) | NodeChange::Removed(_))));
    }
    #[test] fn restyle_in_place_is_updated_not_moved() {
        let a = Scene { screen: scr(), nodes: vec![panel_at(488.0)] };
        let mut p2 = panel_at(488.0); p2.state = NodeState::Closing; // same rect, different state
        let b = Scene { screen: scr(), nodes: vec![p2] };
        let d = diff(&a, &b);
        assert!(d.changes.contains(&NodeChange::Updated(NodeId::MenuPanel)));
        assert!(!d.changes.iter().any(|c| matches!(c, NodeChange::Moved(_))));
    }
    #[test] fn move_and_restyle_reports_both() {
        let a = Scene { screen: scr(), nodes: vec![panel_at(200.0)] };
        let mut p2 = panel_at(900.0); p2.z = 305; // moved AND non-geometry change
        let b = Scene { screen: scr(), nodes: vec![p2] };
        let d = diff(&a, &b);
        assert!(d.changes.contains(&NodeChange::Moved(NodeId::MenuPanel)));
        assert!(d.changes.contains(&NodeChange::Updated(NodeId::MenuPanel)));
    }
    #[test] fn identical_scenes_zero_damage() { let a = Scene { screen: scr(), nodes: vec![panel_at(488.0)] }; assert_eq!(damage(&a, &a), Rect::ZERO); }
    #[test] fn adding_damages_only_that_rect() {
        let a = Scene { screen: scr(), nodes: vec![] };
        let b = Scene { screen: scr(), nodes: vec![bar()] };
        assert_eq!(damage(&a, &b), Rect::new(0.0, 0.0, 1920.0, 40.0));
    }
    #[test] fn motion_only_restyle_damages_node_not_screen() {
        let a = Scene { screen: scr(), nodes: vec![panel_at(488.0)] };
        let mut p2 = panel_at(488.0); p2.state = NodeState::Closing;
        let b = Scene { screen: scr(), nodes: vec![p2] };
        let r = damage(&a, &b);
        assert!(!r.is_empty() && (r.w < scr().w || r.h < scr().h));
    }
    #[test] fn moving_damages_old_and_new_footprints() {
        let a = Scene { screen: scr(), nodes: vec![panel_at(200.0)] };
        let b = Scene { screen: scr(), nodes: vec![panel_at(900.0)] };
        let r = damage(&a, &b);
        assert!(r.union(&a.get(NodeId::MenuPanel).unwrap().rect) == r); // covers old
        assert!(r.union(&b.get(NodeId::MenuPanel).unwrap().rect) == r); // covers new
    }
}

// ── Reducer / diff (signatures; bodies in the crate) ──────────────────────────
// pub fn reduce(input: &ComposeInput) -> Scene
//   one ordered pass: optional dock(+blob), exactly-one bar(+blob), menu →
//   blob FIRST (chrome only) then MenuPanel then one MenuRow per hittable row.
//   blob.rect = layout::blob_rect(element_rect, edge_margin) = rect.inflate(6).
// (diff / damage are implemented for real below — faithful to diff.rs.)
//
// ComposeInput { screen, perf, transparency, contrast, bar:Option<BarRequest>,
//   dock:Option<DockRequest>, menu:Option<MenuRequest>, edge_margin }
// MenuRequest { style, groups, anchor, anchor_origin:(12,12), density, content_size, state }
//   ::open(style, groups, anchor)  ·  row_id(group,row)->Option<&str>
// BarRequest/DockRequest { rect, state, membrane_backed } ::shown(rect).membrane_backed(bool)

/// content_height = v_pad + Σ_groups(header_h? + rows*row_h) + v_pad   (layout.rs)
pub fn content_height(groups: &[Group], d: Density) -> f64 {
    let inner: f64 = groups.iter()
        .map(|g| (if g.head.is_empty() { 0.0 } else { d.group_header_height() }) + g.items.len() as f64 * d.row_height())
        .sum();
    d.panel_v_padding() + inner + d.panel_v_padding()
}

#[cfg(test)]
mod parity_tests {
    use super::*;
    fn groups() -> Vec<Group> {
        vec![Group { head: String::new(), sub: String::new(), items: vec![
            Row { id: "terminal".into(), kind: RowKind::Item, label: "Open terminal".into(), group: String::new(), on: false, accent: false, danger: false, disabled: false, mascot: false, submenu: vec![] },
            Row { id: "wallpaper".into(), kind: RowKind::Item, label: "Change wallpaper".into(), group: String::new(), on: false, accent: false, danger: false, disabled: false, mascot: false, submenu: vec![] },
            Row { id: "settings".into(), kind: RowKind::Item, label: "Display settings".into(), group: String::new(), on: false, accent: false, danger: false, disabled: false, mascot: false, submenu: vec![] },
        ] }]
    }
    #[test] fn chrome_styles_backed_bespoke_not() {
        assert!(MenuStyle::List.backed_by_blob() && MenuStyle::TrayPower.backed_by_blob());
        assert!(!MenuStyle::Radial.backed_by_blob() && !MenuStyle::WidgetCard.backed_by_blob());
    }
    #[test] fn blob_below_chrome_in_layer_table() {
        assert!(layer::band(NodeKind::Blob) < layer::band(NodeKind::Dock));
        assert!(layer::band(NodeKind::Dock) < layer::band(NodeKind::Bar));
        assert!(layer::band(NodeKind::Bar) < layer::band(NodeKind::MenuPanel));
        assert!(layer::band(NodeKind::MenuPanel) < layer::band(NodeKind::MenuRow));
    }
    #[test] fn blob_rect_is_derived_inflate_6() {
        let panel = Rect::new(488.0, 388.0, 280.0, 92.0);
        assert_eq!(panel.inflate(DEFAULT_EDGE_MARGIN), Rect::new(482.0, 382.0, 292.0, 104.0));
    }
    #[test] fn fixture_panel_height_matches_content_height() {
        // The golden fixture's MenuPanel.h must equal content_height(3 rows, Mouse).
        assert_eq!(content_height(&groups(), Density::Mouse), 92.0);
    }
    #[test] fn backings_are_non_interactive() {
        for k in [NodeKind::Background, NodeKind::Wallpaper, NodeKind::Blob, NodeKind::ScreenCorner] {
            assert!(!k.is_interactive());
        }
        assert!(NodeKind::MenuRow.is_interactive() && NodeKind::Bar.is_interactive());
    }
}

// ── input · cursor focus + click intent ─────────────────────────────────────
// rapport = (cursor_pos + cursor_focus_data_node) × {awareness, away, select, unfocus}
//
// The engine hot-tracks the pointer, resolves the topmost INTERACTIVE node under
// it every move (Scene::hit — blobs/backings excluded), and classifies each press
// into exactly one ClickIntent. This is the input layer the host calls on every
// pointer event; the engine owns focus + dismissal so no surface toggles a peer.

/// Live pointer state — position plus the data-node it currently resolves to.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct CursorState {
    pub x: f64,
    pub y: f64,
    /// Scene::hit result at (x,y) — the "cursor_focus_data_node". None over bare bg.
    pub over: Option<NodeId>,
    pub over_kind: Option<NodeKind>,
    pub over_z: i32,
}
impl CursorState {
    /// Resolve the focus node fresh from a scene (click-awareness — runs every move).
    pub fn track(scene: &Scene, x: f64, y: f64) -> CursorState {
        match scene.nodes.iter()
            .filter(|n| n.is_live() && n.kind.is_interactive() && n.rect.contains(x, y))
            .max_by_key(|n| n.z)
        {
            Some(n) => CursorState { x, y, over: Some(n.id), over_kind: Some(n.kind), over_z: n.z },
            None => CursorState { x, y, over: None, over_kind: None, over_z: 0 },
        }
    }
    pub fn is_aware(&self) -> bool { self.over.is_some() }
}

/// A node is *selectable* (a press commits focus to it) vs. a mere backing/container.
pub fn is_selectable(kind: NodeKind) -> bool {
    matches!(kind, NodeKind::MenuRow | NodeKind::Bar | NodeKind::Dock | NodeKind::Launcher)
}

/// Which transient surface currently holds a press-to-dismiss (click-away) contract.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Transient { Menu, Launcher, Sidebar }
impl Transient {
    /// Does a hit of `kind` "belong to" this transient (so a press is NOT click-away)?
    fn owns(self, kind: NodeKind) -> bool {
        match self {
            Transient::Menu => matches!(kind, NodeKind::MenuPanel | NodeKind::MenuRow),
            Transient::Launcher => kind == NodeKind::Launcher,
            Transient::Sidebar => kind == NodeKind::Sidebar,
        }
    }
}

/// The exactly-one outcome of a press, given cursor + held focus + open transient.
#[derive(Debug, Clone, PartialEq)]
pub enum ClickIntent {
    /// Pure hot-track; nothing committed (engine is *aware* of `over`, or bare bg).
    Awareness { over: Option<NodeId> },
    /// Press fell outside an open transient → dismiss it.
    Away { surface: Transient },
    /// Press hit a selectable node → commit focus + activate it.
    Select { node: NodeId },
    /// Press hit bare/non-selectable ground while a focus was held → clear it.
    Unfocus,
}

/// resolve_click(scene, x, y, open, has_focus) → exactly one ClickIntent.
/// Precedence: away (dismiss) > select > unfocus > awareness. Pure + total.
pub fn resolve_click(scene: &Scene, x: f64, y: f64, open: Option<Transient>, has_focus: bool) -> ClickIntent {
    let hit = scene.nodes.iter()
        .filter(|n| n.is_live() && n.kind.is_interactive() && n.rect.contains(x, y))
        .max_by_key(|n| n.z);
    if let Some(t) = open {
        let owns = hit.map_or(false, |n| t.owns(n.kind));
        if !owns { return ClickIntent::Away { surface: t }; }
    }
    match hit {
        Some(n) if is_selectable(n.kind) => ClickIntent::Select { node: n.id },
        _ if has_focus => ClickIntent::Unfocus,
        _ => ClickIntent::Awareness { over: hit.map(|n| n.id) },
    }
}

#[cfg(test)]
mod input_tests {
    use super::*;
    // bar (z200) + open list menu: blob (z100) under panel (z300) under one row (z305)
    fn scene_menu_open() -> Scene {
        let tk = TokenBundle { surface: DARK_NEO_ELEV_2, border: FG3_DARK, border_px: 1.0, radius: 12.0, opacity: 1.0, motion_ms: 240 };
        Scene { screen: Rect::new(0.0,0.0,1920.0,1080.0), nodes: vec![
            Node { id: NodeId::Bar, kind: NodeKind::Bar, rect: Rect::new(0.0,0.0,1920.0,40.0), z: 200, state: NodeState::Open, tokens: tk, payload: NodePayload::None },
            Node { id: NodeId::Blob(Backed::Menu), kind: NodeKind::Blob, rect: Rect::new(482.0,382.0,292.0,64.0), z: 100, state: NodeState::Open, tokens: tk, payload: NodePayload::Blob(BlobBacking{ backs: NodeId::MenuPanel }) },
            Node { id: NodeId::MenuPanel, kind: NodeKind::MenuPanel, rect: Rect::new(488.0,388.0,280.0,52.0), z: 300, state: NodeState::Open, tokens: tk, payload: NodePayload::None },
            Node { id: NodeId::MenuRow{group:0,row:0}, kind: NodeKind::MenuRow, rect: Rect::new(496.0,392.0,264.0,28.0), z: 305, state: NodeState::Open, tokens: tk, payload: NodePayload::None },
        ] }
    }
    #[test] fn awareness_resolves_topmost_interactive_excluding_blob() {
        // over the row centre: the blob sits under it but is excluded → MenuRow wins
        let c = CursorState::track(&scene_menu_open(), 600.0, 406.0);
        assert_eq!(c.over, Some(NodeId::MenuRow{group:0,row:0}));
        assert!(c.is_aware());
    }
    #[test] fn select_commits_focus_to_row() {
        let i = resolve_click(&scene_menu_open(), 600.0, 406.0, Some(Transient::Menu), false);
        assert_eq!(i, ClickIntent::Select { node: NodeId::MenuRow{group:0,row:0} });
    }
    #[test] fn click_away_dismisses_open_menu() {
        let i = resolve_click(&scene_menu_open(), 1200.0, 800.0, Some(Transient::Menu), false);
        assert_eq!(i, ClickIntent::Away { surface: Transient::Menu });
    }
    #[test] fn click_unfocus_clears_held_focus_on_bare_ground() {
        let i = resolve_click(&scene_menu_open(), 1200.0, 800.0, None, true);
        assert_eq!(i, ClickIntent::Unfocus);
    }
    #[test] fn bare_ground_no_focus_is_pure_awareness() {
        let i = resolve_click(&scene_menu_open(), 1200.0, 800.0, None, false);
        assert_eq!(i, ClickIntent::Awareness { over: None });
    }
    #[test] fn blob_skirt_never_absorbs_a_press() {
        // inside the blob's inflate skirt but outside panel/row: membrane is input-
        // transparent, menu open → away (engine owns the Wayland mask, not the blob)
        let i = resolve_click(&scene_menu_open(), 485.0, 384.0, Some(Transient::Menu), false);
        assert_eq!(i, ClickIntent::Away { surface: Transient::Menu });
    }
}

// ── edge-awareness · clamp + flip ───────────────────────────────────────────
// THE deeper fix, not a per-surface offset: one geometry pass makes every
// surface aware of its borders. Children clip to their parent surface
// (Rect::intersect), transient surfaces clamp to the work-area
// (Rect::clamp_inside), and a submenu flips to the opposite side at the screen
// edge (submenu_rect). The hit-region and the painted surface share one rect,
// so a hover/focus outline can never bleed past a panel border or off-screen.

/// Which side a submenu (or any anchored child) opens toward.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Side { Right, Left }

/// submenu_rect — flush to the panel edge, FLIP to the opposite side when it
/// would cross the work-area, then clamp vertically. Returns the rect used for
/// BOTH the painted submenu and its hit-region (so they cannot disagree).
pub fn submenu_rect(panel: Rect, area: Rect, size: (f64, f64), margin: f64) -> (Rect, Side) {
    let (sw, sh) = size;
    let overlap = 2.0;
    let side = if panel.right() - overlap + sw > area.right() - margin { Side::Left } else { Side::Right };
    let sx = match side { Side::Right => panel.right() - overlap, Side::Left => panel.x - sw + overlap };
    let r = Rect::new(sx, panel.y + 58.0, sw, sh).clamp_inside(&area, margin);
    (r, side)
}

#[cfg(test)]
mod edge_tests {
    use super::*;
    const WA: Rect = Rect { x: 0.0, y: 0.0, w: 1920.0, h: 1080.0 };
    #[test] fn child_rect_clips_to_parent_never_overflows() {
        let panel = Rect::new(100.0, 100.0, 280.0, 300.0);
        let row = Rect::new(108.0, 120.0, 320.0, 28.0); // intentionally wider than the panel
        let clipped = row.intersect(&panel);
        assert_eq!(clipped.right(), panel.right()); // clipped exactly to the border, never past
    }
    #[test] fn submenu_opens_right_with_room() {
        let (r, side) = submenu_rect(Rect::new(200.0, 200.0, 280.0, 300.0), WA, (150.0, 132.0), 8.0);
        assert_eq!(side, Side::Right);
        assert!(r.right() <= WA.right() - 8.0);
    }
    #[test] fn submenu_flips_left_at_right_edge() {
        let panel = Rect::new(1600.0, 200.0, 280.0, 300.0); // panel hugs the right edge
        let (r, side) = submenu_rect(panel, WA, (150.0, 132.0), 8.0);
        assert_eq!(side, Side::Left);
        assert!(r.x < panel.x && r.x >= WA.x + 8.0); // opened left, still on-screen
    }
    #[test] fn submenu_clamps_vertically_at_bottom() {
        let (r, _) = submenu_rect(Rect::new(200.0, 980.0, 280.0, 300.0), WA, (150.0, 132.0), 8.0);
        assert!(r.bottom() <= WA.bottom() - 8.0);
    }
    #[test] fn panel_clamps_into_work_area_shifted_not_shrunk() {
        let c = Rect::new(1850.0, 1000.0, 280.0, 300.0).clamp_inside(&WA, 8.0);
        assert!(c.right() <= WA.right() - 8.0 && c.bottom() <= WA.bottom() - 8.0);
        assert_eq!((c.w, c.h), (280.0, 300.0));
    }
    #[test] fn disjoint_intersect_is_empty() {
        assert!(Rect::new(0.0,0.0,10.0,10.0).intersect(&Rect::new(50.0,50.0,10.0,10.0)).is_empty());
    }
}
