//! Bloom QObject — the reactive face of `blobin_core::BubbleBloom` (M.12).
//!
//! QML usage:
//!
//! ```qml
//! import QtQuick
//! import blob.in.qml 0.4
//!
//! Bloom {
//!     id: radial
//!     leaves: 6
//!     ring: 2.2
//!     stagger: 0.036
//!     open: shell.cursorHeld
//!     onBloomed: console.log("fully open")
//!     onRetracted: console.log("fully closed")
//! }
//! ```

use blobin_core::{BubbleBloom, BubbleSpec};

#[cxx_qt::bridge(cxx_file_stem = "bloom")]
pub mod ffi {
    extern "RustQt" {
        #[qobject]
        #[qml_element]
        #[qproperty(bool, open)]
        #[qproperty(i32, leaves)]
        #[qproperty(f32, ring)]
        #[qproperty(f32, stagger)]
        #[qproperty(f32, bubble_size)]
        #[qproperty(bool, cold)]
        type Bloom = super::BloomRust;

        #[qsignal]
        fn bloomed(self: Pin<&mut Bloom>);
        #[qsignal]
        fn retracted(self: Pin<&mut Bloom>);

        #[qinvokable]
        fn tick(self: Pin<&mut Bloom>, dt: f32) -> bool;

        #[qinvokable]
        fn set_pixel_size(self: Pin<&mut Bloom>, px_per_unit: f32);
    }

    impl cxx_qt::Constructor<()> for Bloom {}
}

pub struct BloomRust {
    open: bool,
    leaves: i32,
    ring: f32,
    stagger: f32,
    bubble_size: f32,
    cold: bool,

    bloom: BubbleBloom,
    last_value: f32,
}

impl Default for BloomRust {
    fn default() -> Self {
        let leaves = 6;
        let ring = 2.2;
        let bubble_size = 0.32;
        let stagger = 0.036;
        let bloom = build(leaves, ring, bubble_size, stagger);
        Self {
            open: false,
            leaves,
            ring,
            stagger,
            bubble_size,
            cold: true,
            bloom,
            last_value: 0.0,
        }
    }
}

impl cxx_qt::Initialize for ffi::Bloom {
    fn initialize(self: core::pin::Pin<&mut Self>) {
        let _ = self;
    }
}

impl ffi::Bloom {
    /// Toggle: open or close the radial menu.
    pub fn on_open_changed(mut self: core::pin::Pin<&mut Self>) {
        let want = *self.as_ref().open();
        if want {
            self.as_mut().rust_mut().bloom.open();
        } else {
            self.as_mut().rust_mut().bloom.close();
        }
    }

    /// Rebuild the underlying bloom when its shape changes. Cheap; only the
    /// QObject knobs trigger it, not per-frame state.
    pub fn on_leaves_changed(self: core::pin::Pin<&mut Self>) {
        Self::rebuild(self);
    }
    pub fn on_ring_changed(self: core::pin::Pin<&mut Self>) {
        Self::rebuild(self);
    }
    pub fn on_stagger_changed(self: core::pin::Pin<&mut Self>) {
        Self::rebuild(self);
    }
    pub fn on_bubble_size_changed(self: core::pin::Pin<&mut Self>) {
        Self::rebuild(self);
    }

    fn rebuild(mut self: core::pin::Pin<&mut Self>) {
        let n = (*self.as_ref().leaves()).max(1);
        let ring = *self.as_ref().ring();
        let stagger = *self.as_ref().stagger();
        let bubble = *self.as_ref().bubble_size();
        let was_open = *self.as_ref().open();
        let new_bloom = build(n, ring, bubble, stagger);
        self.as_mut().rust_mut().bloom = new_bloom;
        if was_open {
            self.as_mut().rust_mut().bloom.open();
        }
    }
}

impl ffi::Bloom {
    fn tick(mut self: core::pin::Pin<&mut Self>, dt: f32) -> bool {
        let repaint = self.as_mut().rust_mut().bloom.tick(dt);
        let now_cold = self.as_ref().rust().bloom.is_cold();
        let was_cold = *self.as_ref().cold();
        if now_cold != was_cold {
            self.as_mut().set_cold(now_cold);
            if now_cold {
                // Distinguish "settled open" from "settled closed" by the
                // bloom progress: any leaf with value > 0.5 → bloomed.
                let open = *self.as_ref().open();
                if open {
                    self.as_mut().bloomed();
                } else {
                    self.as_mut().retracted();
                }
            }
        }
        repaint
    }

    fn set_pixel_size(mut self: core::pin::Pin<&mut Self>, px_per_unit: f32) {
        self.as_mut().rust_mut().bloom.set_size(px_per_unit);
    }
}

fn build(n: i32, ring: f32, bubble_size: f32, stagger: f32) -> BubbleBloom {
    let specs: Vec<BubbleSpec> = (0..n.max(1))
        .map(|_| BubbleSpec { size: bubble_size, color: [1.0, 0.416, 0.0, 1.0] })
        .collect();
    BubbleBloom::new(0.5, [0.968, 0.953, 0.929, 1.0], ring, &specs, stagger)
}
