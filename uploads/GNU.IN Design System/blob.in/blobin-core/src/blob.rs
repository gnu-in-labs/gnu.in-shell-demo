//! Blob — the `Blob` trait and the concrete organic shapes.
//!
//! A `Blob` lowers itself to a `Path` at animation phase `t ∈ [0,1]`. The
//! phase drives an organic *wobble*: control handles breathe on offset sine
//! waves so the silhouette is never mechanically static. This is what made
//! the C++ originals feel alive; it's reproduced here exactly, but as data.
//!
//! Replacing the C++ class hierarchy with one trait + combinators is the
//! versatility win (plan §2): a new shape is a new `impl Blob`, and `Inverted`
//! / composition come for free — no `QQuickItem` subclassing, no recompiled Qt.

use crate::path::{Contour, Path, Point, KAPPA};
use std::f32::consts::TAU;

/// Anything that can produce a path at a given animation phase.
pub trait Blob: Send + Sync {
    /// Lower to a path. `t` is the *wobble phase* in turns (0..1 loops).
    fn path(&self, t: f32) -> Path;

    /// Discriminant for the FFI layer / debug.
    fn kind(&self) -> BlobKind;
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum BlobKind {
    Rect,
    Super,
    Inverted,
}

/// How strongly a shape breathes. 0 = rigid, ~0.06 = lively mascot.
#[derive(Clone, Copy, Debug)]
pub struct Wobble {
    pub amp: f32,
    /// Spatial frequency around the contour (lobes).
    pub lobes: f32,
    /// Per-shape phase offset so neighbours don't pulse in lockstep.
    pub phase: f32,
}

impl Default for Wobble {
    fn default() -> Self {
        Self { amp: 0.035, lobes: 3.0, phase: 0.0 }
    }
}

impl Wobble {
    /// Radial perturbation at normalized contour position `u ∈ [0,1)`.
    #[inline]
    fn at(&self, u: f32, t: f32) -> f32 {
        1.0 + self.amp * ((u * self.lobes + self.phase + t) * TAU).sin()
    }
}

// ─────────────────────────────────────────────────────────────────────────
// RectBlob — rounded rectangle with four independent corner radii.
//   Ports BlobRect (8 KB C++) → 100 % Rust.
// ─────────────────────────────────────────────────────────────────────────

/// Corner radii in logical units, order: [TL, TR, BR, BL].
#[derive(Clone, Copy, Debug)]
pub struct Corners(pub [f32; 4]);

impl Corners {
    pub const fn uniform(r: f32) -> Self {
        Corners([r, r, r, r])
    }
    /// Interpolate corner sets — used by `state.rs` to morph silhouettes.
    pub fn lerp(self, other: Corners, t: f32) -> Corners {
        let mut out = [0.0; 4];
        for i in 0..4 {
            out[i] = self.0[i] + (other.0[i] - self.0[i]) * t;
        }
        Corners(out)
    }
}

#[derive(Clone, Copy, Debug)]
pub struct RectBlob {
    pub w: f32,
    pub h: f32,
    pub corners: Corners,
    pub wobble: Wobble,
}

impl RectBlob {
    pub fn new(w: f32, h: f32, corners: Corners) -> Self {
        Self { w, h, corners, wobble: Wobble { amp: 0.0, ..Default::default() } }
    }

    pub fn with_wobble(mut self, wobble: Wobble) -> Self {
        self.wobble = wobble;
        self
    }
}

impl Blob for RectBlob {
    fn path(&self, t: f32) -> Path {
        let (hw, hh) = (self.w * 0.5, self.h * 0.5);
        let [tl, tr, br, bl] = self.corners.0;
        // Clamp radii so opposite corners never overlap.
        let clamp = |r: f32| r.min(hw).min(hh).max(0.0);
        let (tl, tr, br, bl) = (clamp(tl), clamp(tr), clamp(br), clamp(bl));

        // Breathing factor sampled per corner so the wobble is coherent.
        let wob = |u: f32| self.wobble.at(u, t);

        // Start at top edge just right of the TL corner.
        let mut c = Contour::new(Point::new(-hw + tl, -hh));

        // Top edge → TR corner
        c.cubics.push(crate::path::Cubic {
            c1: Point::new(hw - tr, -hh),
            c2: Point::new(hw - tr, -hh),
            to: Point::new(hw - tr, -hh),
        });
        round_corner(&mut c, Point::new(hw, -hh), tr * wob(0.0), Side::TopRight);

        // Right edge → BR
        line_to(&mut c, Point::new(hw, hh - br));
        round_corner(&mut c, Point::new(hw, hh), br * wob(0.25), Side::BottomRight);

        // Bottom edge → BL
        line_to(&mut c, Point::new(-hw + bl, hh));
        round_corner(&mut c, Point::new(-hw, hh), bl * wob(0.5), Side::BottomLeft);

        // Left edge → TL
        line_to(&mut c, Point::new(-hw, -hh + tl));
        round_corner(&mut c, Point::new(-hw, -hh), tl * wob(0.75), Side::TopLeft);

        Path::new().with_contour(c)
    }

    fn kind(&self) -> BlobKind {
        BlobKind::Rect
    }
}

// ─────────────────────────────────────────────────────────────────────────
// SuperBlob — superellipse / squircle body. The mascot core.
//   Ports BlobShape (16 KB C++, the big one) → 100 % Rust.
// ─────────────────────────────────────────────────────────────────────────

#[derive(Clone, Copy, Debug)]
pub struct SuperBlob {
    pub rx: f32,
    pub ry: f32,
    /// Superellipse exponent. 2 = ellipse, >2 = squircle, large = rect.
    pub n: f32,
    pub wobble: Wobble,
    /// Number of cubic segments around the contour (tessellation of the
    /// *parametric* curve; lyon further flattens to triangles).
    pub segments: u16,
}

impl SuperBlob {
    pub fn mascot(rx: f32, ry: f32) -> Self {
        Self {
            rx,
            ry,
            n: 2.6,
            wobble: Wobble { amp: 0.05, lobes: 3.0, phase: 0.0 },
            segments: 24,
        }
    }
}

impl Blob for SuperBlob {
    fn path(&self, t: f32) -> Path {
        let seg = self.segments.max(4);
        let two_over_n = 2.0 / self.n;

        // Sample the superellipse, then convert sampled points into a smooth
        // cubic contour using Catmull-Rom → Bézier handles.
        let mut pts: Vec<Point> = Vec::with_capacity(seg as usize);
        for i in 0..seg {
            let u = i as f32 / seg as f32;
            let a = u * TAU;
            let (s, co) = a.sin_cos();
            // Superellipse parametric form with signed power.
            let sx = co.signum() * co.abs().powf(two_over_n);
            let sy = s.signum() * s.abs().powf(two_over_n);
            let r = self.wobble.at(u, t);
            pts.push(Point::new(sx * self.rx * r, sy * self.ry * r));
        }
        Path::new().with_contour(catmull_rom_contour(&pts))
    }

    fn kind(&self) -> BlobKind {
        BlobKind::Super
    }
}

// ─────────────────────────────────────────────────────────────────────────
// Inverted — combinator that turns any blob into a hole.
//   Ports BlobInvertedRect (5.5 KB C++) → a zero-cost generic wrapper.
// ─────────────────────────────────────────────────────────────────────────

#[derive(Clone, Copy, Debug)]
pub struct Inverted<B: Blob>(pub B);

impl<B: Blob> Blob for Inverted<B> {
    fn path(&self, t: f32) -> Path {
        let mut p = self.0.path(t);
        for c in &mut p.contours {
            c.reverse_winding();
        }
        p
    }

    fn kind(&self) -> BlobKind {
        BlobKind::Inverted
    }
}

// ── geometry helpers ──────────────────────────────────────────────────────

enum Side {
    TopRight,
    BottomRight,
    BottomLeft,
    TopLeft,
}

fn line_to(c: &mut Contour, to: Point) {
    // Degenerate cubic == straight line (both handles on the segment).
    let from = c.cubics.last().map(|k| k.to).unwrap_or(c.start);
    c.cubics.push(crate::path::Cubic {
        c1: from.lerp(to, 1.0 / 3.0),
        c2: from.lerp(to, 2.0 / 3.0),
        to,
    });
}

/// Append a rounded corner using the KAPPA quarter-circle approximation.
/// `apex` is the sharp corner point; the arc of radius `r` cuts it.
fn round_corner(c: &mut Contour, apex: Point, r: f32, side: Side) {
    if r <= f32::EPSILON {
        line_to(c, apex);
        return;
    }
    let k = r * KAPPA;
    let from = c.cubics.last().map(|k| k.to).unwrap_or(c.start);
    let (c1, c2, to) = match side {
        Side::TopRight => (
            Point::new(from.x + k, from.y),
            Point::new(apex.x, apex.y + r - k),
            Point::new(apex.x, apex.y + r),
        ),
        Side::BottomRight => (
            Point::new(from.x, from.y - k),
            Point::new(apex.x - r + k, apex.y),
            Point::new(apex.x - r, apex.y),
        ),
        Side::BottomLeft => (
            Point::new(from.x - k, from.y),
            Point::new(apex.x, apex.y - r + k),
            Point::new(apex.x, apex.y - r),
        ),
        Side::TopLeft => (
            Point::new(from.x, from.y + k),
            Point::new(apex.x + r - k, apex.y),
            Point::new(apex.x + r, apex.y),
        ),
    };
    c.cubics.push(crate::path::Cubic { c1, c2, to });
}

/// Build a smooth closed contour through sampled points using a
/// Catmull-Rom → cubic-Bézier conversion (tension 0.5). This is what gives
/// the superellipse body its fluid, hand-drawn quality.
fn catmull_rom_contour(pts: &[Point]) -> Contour {
    let n = pts.len();
    debug_assert!(n >= 3);
    let mut c = Contour::new(pts[0]);
    for i in 0..n {
        let p0 = pts[(i + n - 1) % n];
        let p1 = pts[i];
        let p2 = pts[(i + 1) % n];
        let p3 = pts[(i + 2) % n];
        // Catmull-Rom to Bézier control points.
        let c1 = Point::new(p1.x + (p2.x - p0.x) / 6.0, p1.y + (p2.y - p0.y) / 6.0);
        let c2 = Point::new(p2.x - (p3.x - p1.x) / 6.0, p2.y - (p3.y - p1.y) / 6.0);
        c.cubics.push(crate::path::Cubic { c1, c2, to: p2 });
    }
    c
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn rect_closes() {
        let b = RectBlob::new(2.0, 1.0, Corners::uniform(0.2));
        let p = b.path(0.0);
        assert_eq!(p.contours.len(), 1);
        assert!(p.contours[0].cubics.len() >= 8);
    }

    #[test]
    fn inverted_flips_winding() {
        let b = RectBlob::new(1.0, 1.0, Corners::uniform(0.1));
        let cw = b.path(0.0).contours[0].clockwise;
        let inv = Inverted(b).path(0.0).contours[0].clockwise;
        assert_ne!(cw, inv);
    }

    #[test]
    fn super_has_segments() {
        let b = SuperBlob::mascot(1.0, 1.2);
        let p = b.path(0.3);
        assert_eq!(p.contours[0].cubics.len(), b.segments as usize);
    }

    #[test]
    fn wobble_moves_with_phase() {
        let b = SuperBlob::mascot(1.0, 1.0);
        let a = b.path(0.0).contours[0].cubics[0].to;
        let c = b.path(0.5).contours[0].cubics[0].to;
        assert!((a.x - c.x).abs() + (a.y - c.y).abs() > 1e-4);
    }
}
