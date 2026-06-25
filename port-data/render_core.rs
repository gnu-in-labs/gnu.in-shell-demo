// gnuin-compose-core :: render — PORT PARITY MIRROR (not the source of truth)
// ============================================================================
// Faithful mirror of gnu.in-os/engine/gnuin-compose-core/src/render.rs (v0.14.2),
// the renderer abstraction (E6 / M5).
//
// A host holds a Renderer and never embeds a rasterizer directly. The software
// (tiny-skia) backend and a future GPU backend (wgpu/vello) both implement
// `Renderer`, so SWAPPING A BACKEND CHANGES NOTHING about ComposeInput, Scene,
// node ids, token resolution, input regions, or motion semantics — the E6 exit
// criterion. The renderer is a pure consumer of the scene model: it paints what
// the reducer produced and never decides a node's fate.
//
// The trait is dependency-free; concrete backends live in the hosts (they bring
// tiny-skia / wgpu). Render inputs are bundled in `RenderFrame` so a new input
// is an additive field, not a breaking signature change.

use crate::motion::MotionSample;          // shared with motion_core.rs
use crate::{Node, NodeKind, Rect, Scene, SceneDiff}; // shared with compose_core.rs

/// Everything a backend needs to paint one frame, bundled so the trait method
/// stays minimal and forward-compatible.
pub struct RenderFrame<'a> {
    /// The composed scene to paint — the single source of truth for the frame.
    pub scene: &'a Scene,
    /// The change set since the previous frame; a backend may use it for targeted
    /// updates, or repaint the whole scene if simpler.
    pub diff: &'a SceneDiff,
    /// The region that actually changed (see `damage`); the host damages only
    /// this, so a motion-only restyle never forces a full-screen repaint.
    pub damage: Rect,
    /// The current animation sample for any in-flight transition.
    pub motion: &'a MotionSample,
}

impl<'a> RenderFrame<'a> {
    pub fn new(scene: &'a Scene, diff: &'a SceneDiff, damage: Rect, motion: &'a MotionSample) -> Self {
        RenderFrame { scene, diff, damage, motion }
    }
}

/// A backend that paints a composed `Scene`.
///
/// `Target` is the host's frame surface — a CPU pixel buffer for the software
/// backend, a GPU surface for others — kept as an associated type so the trait
/// is backend-agnostic and compose-core stays free of any rasterizer dependency.
pub trait Renderer {
    /// The host frame surface this backend paints into.
    type Target: ?Sized;

    /// Paint one frame of `frame.scene` into `target`. Pure with respect to the
    /// scene model: a renderer reads resolved tokens, geometry, and z, and never
    /// mutates the scene or consults another node to decide whether to paint.
    fn render(&mut self, frame: &RenderFrame<'_>, target: &mut Self::Target);
}

// ── illustrative consumer (host-side pattern; real backends live in the host) ──
// render.rs intentionally has NO draw-list type — rasterization belongs to the
// host. The recorder below is an ILLUSTRATION of how any backend consumes the
// scene: walk live nodes in z-order and emit one primitive each from resolved
// tokens. It proves the "pure consumer, z-ordered, no peer lookups" contract and
// gives the port a concrete artifact (see scenes/render-frame.json).

#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Rgba { pub r: u8, pub g: u8, pub b: u8, pub a: u8 }

/// One paint primitive. A real backend maps these onto tiny-skia / wgpu calls.
#[derive(Debug, Clone, Copy, PartialEq)]
pub enum DrawCmd {
    /// Filled rounded rectangle (the only primitive chrome surfaces need).
    RoundedRect { rect: Rect, radius: f64, fill: Rgba, z: i32 },
}

#[derive(Debug, Clone, Default, PartialEq)]
pub struct DrawList { pub cmds: Vec<DrawCmd> }

/// A backend that records a draw list instead of touching pixels — the simplest
/// possible Renderer, useful for tests and golden fixtures.
#[derive(Default)]
pub struct RecordingRenderer;

impl RecordingRenderer {
    fn cmd_for(n: &Node) -> DrawCmd {
        let t = n.tokens;
        DrawCmd::RoundedRect {
            rect: n.rect,
            radius: t.radius,
            fill: Rgba { r: (t.surface >> 16) as u8, g: (t.surface >> 8) as u8, b: t.surface as u8,
                         a: (t.opacity.clamp(0.0, 1.0) * 255.0).round() as u8 },
            z: n.z,
        }
    }
}

impl Renderer for RecordingRenderer {
    type Target = DrawList;
    fn render(&mut self, frame: &RenderFrame<'_>, target: &mut DrawList) {
        target.cmds.clear();
        // live() already returns nodes sorted back-to-front by z — paint in that
        // order; MenuRow (z305) lands above its MenuPanel (z300), blob below both.
        for n in frame.scene.live() {
            if n.kind == NodeKind::MenuRow { /* rows paint as text/inner; still emitted */ }
            target.cmds.push(Self::cmd_for(n));
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::motion::MotionSample;
    use crate::{NodeState, NodeId, NodeKind, Node, NodePayload, TokenBundle, SceneDiff,
                DARK_NEO_ELEV_2, FG3_DARK, Rect, Scene};

    fn tk() -> TokenBundle { TokenBundle { surface: DARK_NEO_ELEV_2, border: FG3_DARK, border_px: 1.0, radius: 12.0, opacity: 1.0, motion_ms: 240 } }
    fn nd(id: NodeId, kind: NodeKind, rect: Rect, z: i32) -> Node { Node { id, kind, rect, z, state: NodeState::Open, tokens: tk(), payload: NodePayload::None } }

    /// A counting backend — enough to prove the trait composes with the real
    /// scene pipeline (mirrors render.rs's own test).
    #[derive(Default)]
    struct CountingRenderer { painted: usize }
    impl Renderer for CountingRenderer {
        type Target = usize;
        fn render(&mut self, frame: &RenderFrame<'_>, target: &mut usize) {
            self.painted = frame.scene.live().len();
            *target = self.painted;
        }
    }

    fn menu_scene() -> Scene {
        Scene { screen: Rect::new(0.0, 0.0, 1920.0, 1080.0), nodes: vec![
            nd(NodeId::Bar, NodeKind::Bar, Rect::new(0.0, 0.0, 1920.0, 40.0), 200),
            nd(NodeId::Blob(crate::Backed::Menu), NodeKind::Blob, Rect::new(482.0, 382.0, 292.0, 104.0), 100),
            nd(NodeId::MenuPanel, NodeKind::MenuPanel, Rect::new(488.0, 388.0, 280.0, 92.0), 300),
            nd(NodeId::MenuRow { group: 0, row: 0 }, NodeKind::MenuRow, Rect::new(496.0, 392.0, 264.0, 28.0), 305),
        ] }
    }

    #[test] fn counting_backend_paints_live_nodes_through_the_trait() {
        let scene = menu_scene();
        let frame = RenderFrame::new(&scene, &SceneDiff::default(), Rect::ZERO, &MotionSample::open(NodeState::Open));
        let mut backend = CountingRenderer::default();
        let mut target = 0usize;
        backend.render(&frame, &mut target);
        assert_eq!(target, 4);
    }

    #[test] fn recording_backend_emits_one_cmd_per_node_in_z_order() {
        let scene = menu_scene();
        let frame = RenderFrame::new(&scene, &SceneDiff::default(), Rect::ZERO, &MotionSample::open(NodeState::Open));
        let mut backend = RecordingRenderer;
        let mut list = DrawList::default();
        backend.render(&frame, &mut list);
        assert_eq!(list.cmds.len(), 4);
        // back-to-front: blob(100) < bar(200) < panel(300) < row(305)
        let zs: Vec<i32> = list.cmds.iter().map(|c| match c { DrawCmd::RoundedRect { z, .. } => *z }).collect();
        assert_eq!(zs, vec![100, 200, 300, 305]);
    }

    #[test] fn backend_is_pure_consumer_scene_unchanged() {
        let scene = menu_scene();
        let before = scene.clone();
        let frame = RenderFrame::new(&scene, &SceneDiff::default(), Rect::ZERO, &MotionSample::open(NodeState::Open));
        let mut backend = RecordingRenderer;
        let mut list = DrawList::default();
        backend.render(&frame, &mut list);
        assert_eq!(scene, before); // E6: a render never mutates the scene model
    }
}
