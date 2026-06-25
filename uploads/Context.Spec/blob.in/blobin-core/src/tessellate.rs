//! Tessellate — Path → triangle mesh via lyon (Q1).
//!
//! The output `Mesh` is a flat, GPU-ready vertex/index buffer. It is exactly
//! what crosses the cxx frontier: blobin-qt memcpy's it into a
//! `QSGGeometryNode` and uploads. No Rust type escapes; only `Vertex` (a
//! `#[repr(C)]` POD) and `u16` indices.

use crate::material::Material;
use crate::path::{Path as BlobPath, Point};
use lyon::math::point as lp;
use lyon::path::Path as LyonPath;
use lyon::tessellation::{
    BuffersBuilder, FillOptions, FillTessellator, FillVertex, VertexBuffers,
};

/// GPU vertex. `#[repr(C)]` so the C++ side can reinterpret the buffer
/// directly. Layout MUST match `BlobInMaterial`'s QSGGeometry attribute set:
///   vec2 pos · vec2 uv · vec4 rgba
#[repr(C)]
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Vertex {
    pub x: f32,
    pub y: f32,
    pub u: f32,
    pub v: f32,
    pub r: f32,
    pub g: f32,
    pub b: f32,
    pub a: f32,
}

/// A finished mesh: triangles as (vertices, indices).
#[derive(Clone, Debug, Default)]
pub struct Mesh {
    pub vertices: Vec<Vertex>,
    pub indices: Vec<u16>,
}

impl Mesh {
    pub fn is_empty(&self) -> bool {
        self.indices.is_empty()
    }

    pub fn clear(&mut self) {
        self.vertices.clear();
        self.indices.clear();
    }

    /// Append `other`, offsetting its indices. Lets `engine` batch a whole
    /// scene (body + eyes + radials) into one draw call.
    pub fn append(&mut self, other: &Mesh) {
        let base = self.vertices.len() as u16;
        self.vertices.extend_from_slice(&other.vertices);
        self.indices.extend(other.indices.iter().map(|i| i + base));
    }
}

/// Quality knob. `tolerance` is the max flattening error in logical units;
/// adaptive, so a small idle mascot and a large hero blob both stay smooth
/// without a fixed segment count (the C++ original used a fixed count — this
/// is the "can exceed C++ fidelity cheaply" claim from the plan, made real).
#[derive(Clone, Copy, Debug)]
pub struct Quality {
    pub tolerance: f32,
}

impl Default for Quality {
    fn default() -> Self {
        Self { tolerance: 0.02 }
    }
}

/// Convert a blob-space `Path` into a lyon path.
fn to_lyon(path: &BlobPath) -> LyonPath {
    let mut b = LyonPath::builder();
    for c in &path.contours {
        b.begin(lp(c.start.x, c.start.y));
        for k in &c.cubics {
            b.cubic_bezier_to(
                lp(k.c1.x, k.c1.y),
                lp(k.c2.x, k.c2.y),
                lp(k.to.x, k.to.y),
            );
        }
        b.end(true);
    }
    b.build()
}

/// Tessellate one path with a flat fill colour (the common case). UVs are the
/// normalized position within the path bounds, so the fragment shader can do
/// gradient / noise without extra data.
pub fn fill(path: &BlobPath, material: &Material, quality: Quality) -> Mesh {
    if path.is_empty() {
        return Mesh::default();
    }
    let (min, max) = rough_bounds(path);
    let span = Point::new((max.x - min.x).max(1e-4), (max.y - min.y).max(1e-4));
    let rgba = material.base_rgba();

    let mut buffers: VertexBuffers<Vertex, u16> = VertexBuffers::new();
    let mut tess = FillTessellator::new();
    let opts = FillOptions::tolerance(quality.tolerance);

    let lyon_path = to_lyon(path);
    let result = tess.tessellate_path(
        &lyon_path,
        &opts,
        &mut BuffersBuilder::new(&mut buffers, |v: FillVertex| {
            let p = v.position();
            Vertex {
                x: p.x,
                y: p.y,
                u: (p.x - min.x) / span.x,
                v: (p.y - min.y) / span.y,
                r: rgba[0],
                g: rgba[1],
                b: rgba[2],
                a: rgba[3],
            }
        }),
    );

    if result.is_err() {
        return Mesh::default();
    }
    Mesh { vertices: buffers.vertices, indices: buffers.indices }
}

fn rough_bounds(path: &BlobPath) -> (Point, Point) {
    let mut min = Point::new(f32::MAX, f32::MAX);
    let mut max = Point::new(f32::MIN, f32::MIN);
    for c in &path.contours {
        let (lo, hi) = c.rough_bounds();
        min.x = min.x.min(lo.x);
        min.y = min.y.min(lo.y);
        max.x = max.x.max(hi.x);
        max.y = max.y.max(hi.y);
    }
    (min, max)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::blob::{Blob, Corners, RectBlob};
    use crate::material::Material;

    #[test]
    fn rect_tessellates_to_triangles() {
        let b = RectBlob::new(2.0, 1.0, Corners::uniform(0.2));
        let mesh = fill(&b.path(0.0), &Material::solid([1.0, 0.4, 0.0, 1.0]), Quality::default());
        assert!(!mesh.is_empty());
        assert_eq!(mesh.indices.len() % 3, 0);
        // colour propagated to every vertex
        assert!(mesh.vertices.iter().all(|v| (v.r - 1.0).abs() < 1e-6));
    }

    #[test]
    fn append_offsets_indices() {
        let mut a = Mesh {
            vertices: vec![Vertex { x: 0.0, y: 0.0, u: 0.0, v: 0.0, r: 0.0, g: 0.0, b: 0.0, a: 1.0 }; 3],
            indices: vec![0, 1, 2],
        };
        let b = a.clone();
        a.append(&b);
        assert_eq!(a.indices, vec![0, 1, 2, 3, 4, 5]);
    }
}
