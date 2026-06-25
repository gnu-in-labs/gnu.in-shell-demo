//! Group — affine 2D composition over `glam`.
//!
//! Ports BlobGroup (3 KB C++) → 100 % Rust. A group is a TRS transform
//! (translate · rotate · scale) that can be composed into a parent chain.
//! Animating a sub-tree of blobs in lockstep — e.g. moving both mascot eyes
//! together — is one `Group` mutation, not a per-shape edit.

use crate::path::{Cubic, Path, Point};
use glam::{Affine2, Mat2, Vec2};

#[derive(Clone, Copy, Debug)]
pub struct Group {
    pub translate: Vec2,
    pub rotation: f32, // radians
    pub scale: Vec2,
}

impl Default for Group {
    fn default() -> Self {
        Self { translate: Vec2::ZERO, rotation: 0.0, scale: Vec2::ONE }
    }
}

impl Group {
    pub fn new(tx: f32, ty: f32) -> Self {
        Self { translate: Vec2::new(tx, ty), ..Default::default() }
    }

    pub fn with_scale(mut self, sx: f32, sy: f32) -> Self {
        self.scale = Vec2::new(sx, sy);
        self
    }

    pub fn with_rotation(mut self, rad: f32) -> Self {
        self.rotation = rad;
        self
    }

    /// The composed affine matrix (scale → rotate → translate).
    pub fn matrix(&self) -> Affine2 {
        let rot = Mat2::from_angle(self.rotation);
        let lin = rot * Mat2::from_diagonal(self.scale);
        Affine2::from_mat2_translation(lin, self.translate)
    }

    /// Compose: `self` applied after `parent`.
    pub fn then(self, parent: &Group) -> Affine2 {
        parent.matrix() * self.matrix()
    }

    /// Apply this transform to a path in place, producing device-ready
    /// logical coordinates. Cheap: one mat·vec per control point.
    pub fn apply(&self, path: &mut Path) {
        let m = self.matrix();
        let xf = |p: Point| -> Point {
            let v = m.transform_point2(Vec2::new(p.x, p.y));
            Point::new(v.x, v.y)
        };
        for c in &mut path.contours {
            c.start = xf(c.start);
            for k in &mut c.cubics {
                *k = Cubic { c1: xf(k.c1), c2: xf(k.c2), to: xf(k.to) };
            }
        }
    }

    /// Linear interpolation between two groups (for state transitions).
    pub fn lerp(self, other: Group, t: f32) -> Group {
        Group {
            translate: self.translate.lerp(other.translate, t),
            rotation: self.rotation + (other.rotation - self.rotation) * t,
            scale: self.scale.lerp(other.scale, t),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn identity_is_noop() {
        let g = Group::default();
        let v = g.matrix().transform_point2(Vec2::new(3.0, -2.0));
        assert!((v.x - 3.0).abs() < 1e-6 && (v.y + 2.0).abs() < 1e-6);
    }

    #[test]
    fn scale_then_translate() {
        let g = Group::new(10.0, 0.0).with_scale(2.0, 2.0);
        let v = g.matrix().transform_point2(Vec2::new(1.0, 0.0));
        // scaled to 2, then translated +10 → 12
        assert!((v.x - 12.0).abs() < 1e-5);
    }
}
