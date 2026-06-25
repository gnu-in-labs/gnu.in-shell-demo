//! Bloom — BubbleBloom (M.12), the signature ★ radial recipe (R.04).
//!
//! The mascot is one blob. This is the engine's first *multi-blob scene that
//! isn't a mascot*: a hub at the cursor with N leaf bubbles that bloom
//! outward on a ring, each on a spring with a staggered start, connected to
//! the hub by tapered threads whose opacity tracks the bloom. No containing
//! panel — the whole thing is blobs and lines.
//!
//! Reuses everything: `SuperBlob` for each bubble, `Group` to place them,
//! `Spring` for the elastic bloom, `tessellate::fill` + a hand-built line
//! quad, all batched into one mesh by the same `Mesh::append` the engine uses.
//!
//! Motion: M.12 BubbleBloom — spring elastic, per-bubble stagger. Tokens come
//! from `mspring::WOBBLY` (overshoot) so the bloom has the elastic snap the
//! Motion Spec calls for.

use crate::blob::{Blob, SuperBlob, Wobble};
use crate::group::Group;
use crate::material::{Material, Rgba};
use crate::solve::Spring;
use crate::tessellate::{fill, Mesh, Quality, Vertex};
use crate::tokens::mspring;
use std::f32::consts::TAU;

/// One leaf bubble on the ring.
struct Bubble {
    /// Angle on the ring, radians.
    angle: f32,
    /// Ring radius in logical units (distance hub→bubble when fully bloomed).
    ring: f32,
    /// Bubble radius in logical units when fully bloomed.
    size: f32,
    color: Rgba,
    /// Bloom progress 0→1 (scale + fly-out + thread opacity all derive from it).
    bloom: Spring,
    /// Seconds before this bubble starts blooming (the stagger).
    delay: f32,
    elapsed: f32,
}

impl Bubble {
    fn tick(&mut self, dt: f32, opening: bool) {
        self.elapsed += dt;
        // Gate the spring start by the stagger delay (only while opening; on
        // close everything retracts together for a snappy dismiss).
        let target = if !opening {
            0.0
        } else if self.elapsed >= self.delay {
            1.0
        } else {
            0.0
        };
        self.bloom.set_target(target);
        self.bloom.tick(dt);
    }

    fn at_rest(&self) -> bool {
        self.bloom.at_rest()
    }

    /// Current bloom value clamped to [0,1] for geometry (the spring can
    /// overshoot >1; we *want* that visually on scale, so don't clamp scale —
    /// only clamp the thread alpha).
    fn value(&self) -> f32 {
        self.bloom.value
    }
}

/// Spec for one bubble at construction.
#[derive(Clone, Copy, Debug)]
pub struct BubbleSpec {
    pub size: f32,
    pub color: Rgba,
}

pub struct BubbleBloom {
    hub_size: f32,
    hub_color: Rgba,
    ring: f32,
    bubbles: Vec<Bubble>,
    opening: bool,
    px_per_unit: f32,
    thread_color: Rgba,
    quality: Quality,
    mesh: Mesh,
    dirty: bool,
}

impl BubbleBloom {
    /// Build a bloom with `specs.len()` bubbles evenly spread on a ring.
    /// `stagger` is the per-bubble start delay in seconds (M.12 ≈ 0.036).
    pub fn new(hub_size: f32, hub_color: Rgba, ring: f32, specs: &[BubbleSpec], stagger: f32) -> Self {
        let n = specs.len().max(1);
        let bubbles = specs
            .iter()
            .enumerate()
            .map(|(i, s)| Bubble {
                angle: (i as f32 / n as f32) * TAU - TAU * 0.25, // first bubble at top
                ring,
                size: s.size,
                color: s.color,
                bloom: Spring::new(mspring::WOBBLY, 0.0),
                delay: i as f32 * stagger,
                elapsed: 0.0,
            })
            .collect();
        Self {
            hub_size,
            hub_color,
            ring,
            bubbles,
            opening: false,
            px_per_unit: 48.0,
            thread_color: [hub_color[0], hub_color[1], hub_color[2], 0.5],
            quality: Quality::default(),
            mesh: Mesh::default(),
            dirty: true,
        }
    }

    pub fn set_size(&mut self, px_per_unit: f32) {
        if (px_per_unit - self.px_per_unit).abs() > f32::EPSILON {
            self.px_per_unit = px_per_unit.max(1.0);
            self.dirty = true;
        }
    }

    /// Begin blooming outward.
    pub fn open(&mut self) {
        self.opening = true;
        for b in &mut self.bubbles {
            b.elapsed = 0.0;
        }
        self.dirty = true;
    }

    /// Retract to the hub.
    pub fn close(&mut self) {
        self.opening = false;
        for b in &mut self.bubbles {
            b.elapsed = 0.0;
        }
        self.dirty = true;
    }

    pub fn is_open(&self) -> bool {
        self.opening
    }

    /// Advance; returns true if the mesh changed and a repaint is due.
    pub fn tick(&mut self, dt: f32) -> bool {
        let mut moving = false;
        for b in &mut self.bubbles {
            let before = b.value();
            b.tick(dt, self.opening);
            if (b.value() - before).abs() > 1e-5 || !b.at_rest() {
                moving = true;
            }
        }
        if moving || self.dirty {
            self.rebuild();
            self.dirty = false;
            return true;
        }
        false
    }

    /// Settled — host can stop requesting frames (open & fully bloomed, or
    /// closed & fully retracted). The radial recipe is transient UI: unlike the
    /// mascot it does NOT breathe, so it goes cold cleanly.
    pub fn is_cold(&self) -> bool {
        self.bubbles.iter().all(|b| b.at_rest())
    }

    pub fn mesh(&self) -> &Mesh {
        &self.mesh
    }
    pub fn vertices(&self) -> &[Vertex] {
        &self.mesh.vertices
    }
    pub fn indices(&self) -> &[u16] {
        &self.mesh.indices
    }

    fn rebuild(&mut self) {
        self.mesh.clear();
        let s = self.px_per_unit;

        // ── Threads first (drawn under the bubbles) ──
        for b in &self.bubbles {
            let v = b.value();
            let alpha = v.clamp(0.0, 1.0);
            if alpha <= 1e-3 {
                continue;
            }
            // Bubble centre flies out from hub along its angle as it blooms.
            let (sin, cos) = b.angle.sin_cos();
            let cx = cos * b.ring * v * s;
            let cy = sin * b.ring * v * s;
            // Thread from hub edge to bubble edge.
            let hub_r = self.hub_size * s;
            let hx = cos * hub_r;
            let hy = sin * hub_r;
            let mut col = self.thread_color;
            col[3] = self.thread_color[3] * alpha;
            push_thread(
                &mut self.mesh,
                [hx, hy],
                [cx, cy],
                (0.06 * s).max(1.0),
                col,
            );
        }

        // ── Hub ──
        let hub = SuperBlob {
            rx: 1.0,
            ry: 1.0,
            n: 2.4,
            wobble: Wobble { amp: 0.0, lobes: 3.0, phase: 0.0 },
            segments: 20,
        };
        let mut hub_path = hub.path(0.0);
        Group::new(0.0, 0.0)
            .with_scale(self.hub_size * s, self.hub_size * s)
            .apply(&mut hub_path);
        self.mesh.append(&fill(&hub_path, &Material::solid(self.hub_color), self.quality));

        // ── Leaf bubbles ──
        for b in &self.bubbles {
            let v = b.value();
            if v <= 1e-3 {
                continue;
            }
            let (sin, cos) = b.angle.sin_cos();
            let cx = cos * b.ring * v * s;
            let cy = sin * b.ring * v * s;
            let bubble = SuperBlob {
                rx: 1.0,
                ry: 1.0,
                n: 2.6,
                wobble: Wobble { amp: 0.0, lobes: 3.0, phase: 0.0 },
                segments: 18,
            };
            let mut bp = bubble.path(0.0);
            // scale uses the raw spring value (overshoot allowed → elastic pop).
            let r = b.size * v * s;
            Group::new(cx, cy).with_scale(r, r).apply(&mut bp);
            self.mesh.append(&fill(&bp, &Material::solid(b.color), self.quality));
        }
    }
}

/// Append a tapered thread (hub end thick, bubble end thin) as two triangles.
fn push_thread(mesh: &mut Mesh, from: [f32; 2], to: [f32; 2], width: f32, col: Rgba) {
    let dx = to[0] - from[0];
    let dy = to[1] - from[1];
    let len = (dx * dx + dy * dy).sqrt().max(1e-4);
    // Perpendicular unit vector.
    let nx = -dy / len;
    let ny = dx / len;
    let hw0 = width * 0.5; // hub end
    let hw1 = width * 0.25; // bubble end (tapered)

    let v = |x: f32, y: f32| Vertex {
        x,
        y,
        u: 0.0,
        v: 0.0,
        r: col[0],
        g: col[1],
        b: col[2],
        a: col[3],
    };
    let base = mesh.vertices.len() as u16;
    mesh.vertices.push(v(from[0] + nx * hw0, from[1] + ny * hw0));
    mesh.vertices.push(v(from[0] - nx * hw0, from[1] - ny * hw0));
    mesh.vertices.push(v(to[0] - nx * hw1, to[1] - ny * hw1));
    mesh.vertices.push(v(to[0] + nx * hw1, to[1] + ny * hw1));
    mesh.indices.extend_from_slice(&[base, base + 1, base + 2, base, base + 2, base + 3]);
}

#[cfg(test)]
mod tests {
    use super::*;

    fn specs(n: usize) -> Vec<BubbleSpec> {
        (0..n)
            .map(|_| BubbleSpec { size: 0.3, color: [1.0, 0.4, 0.0, 1.0] })
            .collect()
    }

    fn bloom(n: usize) -> BubbleBloom {
        BubbleBloom::new(0.5, [0.97, 0.95, 0.93, 1.0], 2.2, &specs(n), 0.036)
    }

    fn drive(b: &mut BubbleBloom, frames: u32) {
        for _ in 0..frames {
            b.tick(1.0 / 60.0);
        }
    }

    #[test]
    fn starts_collapsed_and_cold() {
        let b = bloom(6);
        assert!(b.is_cold(), "closed bloom should be at rest");
    }

    #[test]
    fn open_blooms_then_settles() {
        let mut b = bloom(6);
        b.open();
        // mid-bloom it's animating
        b.tick(1.0 / 60.0);
        assert!(!b.is_cold());
        drive(&mut b, 600);
        assert!(b.is_cold(), "bloom should settle when open");
        // mesh present and well-formed
        assert!(!b.mesh().is_empty());
        assert_eq!(b.indices().len() % 3, 0);
        assert!(b.indices().iter().all(|&i| (i as usize) < b.vertices().len()));
    }

    #[test]
    fn stagger_delays_later_bubbles() {
        let mut b = bloom(6);
        b.open();
        // After a single short frame, the first bubble has moved more than the
        // last (its delay hasn't elapsed yet).
        b.tick(0.02);
        let first = b.bubbles[0].value();
        let last = b.bubbles[5].value();
        assert!(first > last, "first {first} should lead last {last}");
    }

    #[test]
    fn close_retracts_to_cold() {
        let mut b = bloom(5);
        b.open();
        drive(&mut b, 600);
        b.close();
        drive(&mut b, 600);
        assert!(b.is_cold());
        // fully retracted → bubbles near zero, only hub remains in mesh
        assert!(b.bubbles.iter().all(|x| x.value().abs() < 1e-2));
    }

    #[test]
    fn scene_scales_with_size() {
        let mut b = bloom(4);
        b.set_size(80.0);
        b.open();
        drive(&mut b, 600);
        let extent = b.vertices().iter().map(|v| v.x.hypot(v.y)).fold(0.0_f32, f32::max);
        // bubbles reach roughly ring(2.2)*size(80) plus bubble radius
        assert!(extent > 2.2 * 80.0 * 0.5, "extent {extent} too small");
    }
}
