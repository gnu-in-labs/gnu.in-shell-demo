//! Raster — CPU reference rasterizer. The shared oracle for material parity.
//!
//! `eval_fragment` is a line-by-line port of `blobin-qt/shaders/blob.frag`.
//! Three implementations must agree on it:
//!   • this Rust fn          (the engine's own evaluation / tests)
//!   • blob.frag (GLSL)      (what the GPU runs)
//!   • the golden oracle     (blobin-golden JS reference → PNG goldens)
//!
//! P3 (plan §4): the material *maths* lives in Rust; the shader is data. This
//! module is how we prove the maths matches the shader without a GPU — golden
//! images are produced from this exact function, then the GPU shader is
//! pixel-diffed against them (Q4: pixel gate + SSIM signal).
//!
//! Keep `eval_fragment` and blob.frag bit-for-bit equivalent. If you touch
//! one, touch the other and regenerate goldens (`just goldens`).

use crate::material::MaterialParams;

#[inline]
fn fract(x: f32) -> f32 {
    x - x.floor()
}

#[inline]
fn clamp01(x: f32) -> f32 {
    x.clamp(0.0, 1.0)
}

#[inline]
fn mix4(a: [f32; 4], b: [f32; 4], t: f32) -> [f32; 4] {
    [
        a[0] + (b[0] - a[0]) * t,
        a[1] + (b[1] - a[1]) * t,
        a[2] + (b[2] - a[2]) * t,
        a[3] + (b[3] - a[3]) * t,
    ]
}

/// Value-noise hash — identical to blob.frag's `hash(vec2)`.
#[inline]
fn hash(mut px: f32, mut py: f32) -> f32 {
    px = fract(px * 123.34);
    py = fract(py * 345.45);
    // p += dot(p, p + 34.345)  — scalar added to both components
    let d = px * (px + 34.345) + py * (py + 34.345);
    px += d;
    py += d;
    fract(px * py)
}

/// Evaluate the blob fragment at UV `(u,v)` for a base colour and material.
/// Returns **premultiplied** RGBA in 0..1, exactly as blob.frag outputs.
/// `qt_opacity` is the scene-graph inherited opacity (1.0 in isolation).
pub fn eval_fragment(u: f32, v: f32, base: [f32; 4], m: &MaterialParams, qt_opacity: f32) -> [f32; 4] {
    let mut col = base;

    if m.has_gradient == 1 {
        let dx = u - m.center[0];
        let dy = v - m.center[1];
        let d = clamp01((dx * dx + dy * dy).sqrt() * 1.6);
        // P3 fix: the gradient is a *sheen composited over* the base, weighted
        // by the sheen's own alpha — not a replacement. Keeps the body colour
        // and alpha; only the RGB picks up the highlight. (Old code replaced
        // col entirely, which erased the body on gradient materials.)
        let g = mix4(m.inner, m.outer, d);
        col[0] += (g[0] - col[0]) * g[3];
        col[1] += (g[1] - col[1]) * g[3];
        col[2] += (g[2] - col[2]) * g[3];
    }

    if m.noise > 0.0 {
        let n = (hash(u * 220.0, v * 220.0) - 0.5) * m.noise;
        col[0] += n;
        col[1] += n;
        col[2] += n;
    }

    let a = col[3] * m.opacity * qt_opacity;
    // Premultiplied output (Qt scene-graph blending).
    [col[0] * a, col[1] * a, col[2] * a, a]
}

/// Render an `w×h` UV patch of a material into straight premultiplied RGBA8.
/// UV spans [0,1]² across the patch — isolates material parity from geometry.
pub fn render_patch(w: u32, h: u32, base: [f32; 4], m: &MaterialParams) -> Vec<u8> {
    let mut out = vec![0u8; (w * h * 4) as usize];
    for y in 0..h {
        for x in 0..w {
            let u = (x as f32 + 0.5) / w as f32;
            let v = (y as f32 + 0.5) / h as f32;
            let p = eval_fragment(u, v, base, m, 1.0);
            let i = ((y * w + x) * 4) as usize;
            out[i] = to_u8(p[0]);
            out[i + 1] = to_u8(p[1]);
            out[i + 2] = to_u8(p[2]);
            out[i + 3] = to_u8(p[3]);
        }
    }
    out
}

#[inline]
fn to_u8(x: f32) -> u8 {
    (clamp01(x) * 255.0 + 0.5) as u8
}

/// Preview/golden background. Compositing premultiplied output over a fixed
/// opaque colour makes goldens (a) directly viewable and (b) free of the
/// low-alpha precision loss that straight-alpha PNG roundtrips suffer. Both
/// the Rust harness and the JS oracle use the *same integer* formula below,
/// so the composite step adds zero divergence.
pub const PREVIEW_BG: [u8; 3] = [0x0B, 0x0D, 0x10];

/// Composite a premultiplied RGBA8 buffer over an opaque background, returning
/// opaque RGBA8. Integer math, deterministic across implementations.
pub fn composite_over(premult: &[u8], bg: [u8; 3]) -> Vec<u8> {
    let mut out = vec![0u8; premult.len()];
    for px in 0..premult.len() / 4 {
        let i = px * 4;
        let a = premult[i + 3] as u32;
        let inv = 255 - a;
        for c in 0..3 {
            let src = premult[i + c] as u32; // already premultiplied
            let b = bg[c] as u32;
            out[i + c] = (src + (b * inv + 127) / 255) as u8;
        }
        out[i + 3] = 255;
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::material::Material;

    #[test]
    fn flat_opaque_is_base() {
        let m = Material::solid([0.2, 0.4, 0.6, 1.0]).params();
        let p = eval_fragment(0.5, 0.5, [0.2, 0.4, 0.6, 1.0], &m, 1.0);
        // premultiplied, a=1 → rgb unchanged
        assert!((p[0] - 0.2).abs() < 1e-4 && p[3] >= 0.999);
    }

    #[test]
    fn opacity_applied_once() {
        let mat = Material::solid([1.0, 1.0, 1.0, 1.0]).with_opacity(0.5);
        let p = eval_fragment(0.5, 0.5, mat.base_rgba(), &mat.params(), 1.0);
        assert!((p[3] - 0.5).abs() < 1e-4, "alpha={}", p[3]);
    }

    #[test]
    fn gradient_centre_is_inner() {
        let mat = Material::solid([0.0, 0.0, 0.0, 1.0])
            .with_radial([1.0, 0.0, 0.0, 1.0], [0.0, 0.0, 1.0, 1.0], [0.5, 0.5]);
        let p = eval_fragment(0.5, 0.5, mat.base_rgba(), &mat.params(), 1.0);
        // at centre d=0 → sheen=inner (opaque red) fully composited over black
        assert!(p[0] > 0.9 && p[2] < 0.1);
    }

    #[test]
    fn gradient_preserves_base_where_sheen_transparent() {
        // sheen alpha 0 everywhere → base shows through untouched.
        let mat = Material::solid([0.3, 0.6, 0.9, 1.0])
            .with_radial([1.0, 1.0, 1.0, 0.0], [1.0, 1.0, 1.0, 0.0], [0.5, 0.5]);
        let p = eval_fragment(0.5, 0.5, mat.base_rgba(), &mat.params(), 1.0);
        assert!((p[0] - 0.3).abs() < 1e-3 && (p[2] - 0.9).abs() < 1e-3);
    }

    #[test]
    fn patch_has_expected_size() {
        let m = Material::solid([1.0, 1.0, 1.0, 1.0]).params();
        let buf = render_patch(8, 4, [1.0, 1.0, 1.0, 1.0], &m);
        assert_eq!(buf.len(), 8 * 4 * 4);
    }

    #[test]
    fn noise_perturbs_but_bounded() {
        let mat = Material::solid([0.5, 0.5, 0.5, 1.0]).with_noise(0.1);
        let a = eval_fragment(0.13, 0.77, mat.base_rgba(), &mat.params(), 1.0);
        let b = eval_fragment(0.14, 0.77, mat.base_rgba(), &mat.params(), 1.0);
        // neighbouring pixels differ (noise is high-frequency)
        assert!((a[0] - b[0]).abs() > 1e-5);
        // but stays in range
        assert!(a[0] >= 0.0 && a[0] <= 1.0);
    }
}
