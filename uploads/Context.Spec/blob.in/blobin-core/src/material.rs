//! Material — surface parameters of a blob.
//!
//! Ports BlobMaterial (3.5 KB C++). This is the one *split* atom (plan §4):
//! the math — colour resolution, gradient stops, noise amplitude — is here in
//! Rust; the actual fragment shader (.qsb) stays on the Qt side as data. The
//! base colour is baked into the vertex buffer; the richer params travel as a
//! small `MaterialParams` POD over the bridge to drive the shader.

/// Linear-space RGBA, 0..1.
pub type Rgba = [f32; 4];

#[derive(Clone, Copy, Debug)]
pub struct GradientStop {
    pub offset: f32,
    pub color: Rgba,
}

#[derive(Clone, Copy, Debug)]
pub struct Material {
    pub base: Rgba,
    /// Optional radial gradient (centre in normalized path-UV space).
    pub gradient: Option<(GradientStop, GradientStop, [f32; 2])>,
    /// Surface noise amplitude 0..1 (the "skin" texture).
    pub noise: f32,
    pub opacity: f32,
}

impl Material {
    pub fn solid(base: Rgba) -> Self {
        Self { base, gradient: None, noise: 0.0, opacity: base[3] }
    }

    pub fn with_noise(mut self, n: f32) -> Self {
        self.noise = n.clamp(0.0, 1.0);
        self
    }

    pub fn with_radial(mut self, inner: Rgba, outer: Rgba, center: [f32; 2]) -> Self {
        self.gradient = Some((
            GradientStop { offset: 0.0, color: inner },
            GradientStop { offset: 1.0, color: outer },
            center,
        ));
        self
    }

    pub fn with_opacity(mut self, o: f32) -> Self {
        self.opacity = o.clamp(0.0, 1.0);
        self
    }

    /// Colour baked per-vertex. P3 decision: opacity is **NOT** folded here —
    /// it is a separate uniform applied once in the fragment stage (see
    /// `raster::eval_fragment` / blob.frag). Folding it here too caused a
    /// latent opacity² on the flat path; surfaced and fixed in P3.
    pub fn base_rgba(&self) -> Rgba {
        [self.base[0], self.base[1], self.base[2], self.base[3]]
    }

    /// Flatten to the POD the shader consumes. Layout mirrors
    /// `BlobInMaterial`'s uniform block on the C++ side.
    pub fn params(&self) -> MaterialParams {
        let (g_inner, g_outer, center, has_grad) = match self.gradient {
            Some((i, o, c)) => (i.color, o.color, c, 1u32),
            None => (self.base, self.base, [0.5, 0.5], 0u32),
        };
        MaterialParams {
            inner: g_inner,
            outer: g_outer,
            center,
            noise: self.noise,
            opacity: self.opacity,
            has_gradient: has_grad,
            _pad: 0,
        }
    }
}

/// `#[repr(C)]` uniform payload. Mirror this exactly in the shader's UBO.
#[repr(C)]
#[derive(Clone, Copy, Debug)]
pub struct MaterialParams {
    pub inner: Rgba,
    pub outer: Rgba,
    pub center: [f32; 2],
    pub noise: f32,
    pub opacity: f32,
    pub has_gradient: u32,
    pub _pad: u32,
}

/// sRGB → linear, for correct blending. Colours from tokens.json arrive sRGB.
pub fn srgb_to_linear(c: Rgba) -> Rgba {
    let f = |x: f32| if x <= 0.04045 { x / 12.92 } else { ((x + 0.055) / 1.055).powf(2.4) };
    [f(c[0]), f(c[1]), f(c[2]), c[3]]
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn opacity_is_not_folded_into_base() {
        // P3: opacity is a separate fragment uniform, applied once. base_rgba
        // keeps the raw base alpha.
        let m = Material::solid([1.0, 1.0, 1.0, 1.0]).with_opacity(0.5);
        assert!((m.base_rgba()[3] - 1.0).abs() < 1e-6);
        assert!((m.params().opacity - 0.5).abs() < 1e-6);
    }

    #[test]
    fn gradient_sets_flag() {
        let m = Material::solid([0.0, 0.0, 0.0, 1.0])
            .with_radial([1.0, 1.0, 1.0, 1.0], [0.0, 0.0, 0.0, 0.0], [0.4, 0.35]);
        assert_eq!(m.params().has_gradient, 1);
    }
}
