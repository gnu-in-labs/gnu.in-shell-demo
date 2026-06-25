//! Diff — image comparison for the golden harness (Q4).
//!
//! Two measures, per the decision:
//!   • `pixel_diff` — max per-channel delta + fraction of pixels over a
//!     threshold. This is the **hard gate**: merge fails if it trips.
//!   • `ssim` — structural similarity, windowed. A **signal**, not a gate:
//!     it flags perceptual drift even when per-pixel deltas stay small.
//!
//! Both operate on straight RGBA8 buffers of equal size.

/// Result of a pixel comparison.
#[derive(Clone, Copy, Debug)]
pub struct PixelDiff {
    /// Largest single-channel absolute difference, in 0..=255.
    pub max_delta: u8,
    /// Number of pixels with any channel delta > threshold.
    pub over: u32,
    /// Total pixels compared.
    pub total: u32,
}

impl PixelDiff {
    pub fn over_fraction(&self) -> f32 {
        if self.total == 0 {
            0.0
        } else {
            self.over as f32 / self.total as f32
        }
    }

    /// The hard gate: max channel delta within `max_delta_allowed` AND the
    /// fraction of offending pixels within `max_over_fraction`.
    pub fn passes(&self, max_delta_allowed: u8, max_over_fraction: f32) -> bool {
        self.max_delta <= max_delta_allowed && self.over_fraction() <= max_over_fraction
    }
}

/// Compare two RGBA8 buffers. `threshold` is the per-channel delta above which
/// a pixel is counted as "over".
pub fn pixel_diff(a: &[u8], b: &[u8], threshold: u8) -> PixelDiff {
    assert_eq!(a.len(), b.len(), "buffers must match");
    let mut max_delta = 0u8;
    let mut over = 0u32;
    let total = (a.len() / 4) as u32;
    for px in 0..total as usize {
        let mut hit = false;
        for c in 0..4 {
            let i = px * 4 + c;
            let d = a[i].abs_diff(b[i]);
            if d > max_delta {
                max_delta = d;
            }
            if d > threshold {
                hit = true;
            }
        }
        if hit {
            over += 1;
        }
    }
    PixelDiff { max_delta, over, total }
}

/// Global SSIM over luminance, single window covering the whole image (cheap
/// and adequate for these small, flat-ish material patches). Returns 0..1.
pub fn ssim(a: &[u8], b: &[u8]) -> f32 {
    assert_eq!(a.len(), b.len());
    let n = (a.len() / 4) as f64;
    if n == 0.0 {
        return 1.0;
    }

    // Luminance (Rec. 601), straight (ignore alpha for structure).
    let lum = |buf: &[u8], px: usize| -> f64 {
        let i = px * 4;
        0.299 * buf[i] as f64 + 0.587 * buf[i + 1] as f64 + 0.114 * buf[i + 2] as f64
    };

    let (mut mu_a, mut mu_b) = (0.0, 0.0);
    for px in 0..n as usize {
        mu_a += lum(a, px);
        mu_b += lum(b, px);
    }
    mu_a /= n;
    mu_b /= n;

    let (mut va, mut vb, mut cov) = (0.0, 0.0, 0.0);
    for px in 0..n as usize {
        let da = lum(a, px) - mu_a;
        let db = lum(b, px) - mu_b;
        va += da * da;
        vb += db * db;
        cov += da * db;
    }
    va /= n - 1.0;
    vb /= n - 1.0;
    cov /= n - 1.0;

    // Stabilizers for 8-bit dynamic range (L=255).
    let c1 = (0.01 * 255.0_f64).powi(2);
    let c2 = (0.03 * 255.0_f64).powi(2);

    let s = ((2.0 * mu_a * mu_b + c1) * (2.0 * cov + c2))
        / ((mu_a * mu_a + mu_b * mu_b + c1) * (va + vb + c2));
    s as f32
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn identical_is_perfect() {
        let buf = vec![10, 20, 30, 255, 40, 50, 60, 255];
        let d = pixel_diff(&buf, &buf, 0);
        assert_eq!(d.max_delta, 0);
        assert_eq!(d.over, 0);
        assert!((ssim(&buf, &buf) - 1.0).abs() < 1e-6);
    }

    #[test]
    fn small_delta_passes_gate() {
        let a = vec![100, 100, 100, 255, 100, 100, 100, 255];
        let b = vec![101, 99, 100, 255, 100, 102, 100, 255];
        let d = pixel_diff(&a, &b, 3);
        assert_eq!(d.max_delta, 2);
        assert!(d.passes(3, 0.0));
    }

    #[test]
    fn big_delta_fails_gate() {
        let a = vec![0, 0, 0, 255];
        let b = vec![255, 0, 0, 255];
        let d = pixel_diff(&a, &b, 3);
        assert!(!d.passes(3, 0.0));
        assert_eq!(d.max_delta, 255);
    }
}
