//! Mascot QObject — the reactive face of `blobin_core::Engine`.
//!
//! QML usage:
//!
//! ```qml
//! import QtQuick
//! import blob.in.qml 0.4
//!
//! Item {
//!     Mascot {
//!         id: face
//!         size: 72
//!         tolerance: 0.5
//!         state: shell.listening ? "listening" : "idle"
//!         onCooled: console.log("mascot settled")
//!     }
//! }
//! ```
//!
//! `state` is a `QString` (case-insensitive) instead of an enum so QML bindings
//! read naturally; the parser is total — unknown values fall back to `idle`.

use blobin_core::state::MascotState;
use blobin_core::Engine;

#[cxx_qt::bridge(cxx_file_stem = "mascot")]
pub mod ffi {
    extern "RustQt" {
        #[qobject]
        #[qml_element]
        #[qproperty(QString, state)]
        #[qproperty(f32, size)]
        #[qproperty(f32, tolerance)]
        #[qproperty(bool, cold)]
        type Mascot = super::MascotRust;

        /// Emitted the first frame the engine reports cold (host can throttle).
        #[qsignal]
        fn cooled(self: Pin<&mut Mascot>);

        /// Advance the engine by `dt` seconds. Bind to a QML FrameAnimator
        /// (Qt 6.6+) or a QTimer — the QObject doesn't own a clock.
        #[qinvokable]
        fn tick(self: Pin<&mut Mascot>, dt: f32) -> bool;
    }

    unsafe extern "C++" {
        include!("cxx-qt-lib/qstring.h");
        type QString = cxx_qt_lib::QString;
    }

    impl cxx_qt::Constructor<()> for Mascot {}
}

/// Rust-side state. Holds the live `Engine` plus the QObject-visible mirror of
/// its inputs/outputs. cxx-qt synthesises `state()`, `setState()`, etc.
pub struct MascotRust {
    state: cxx_qt_lib::QString,
    size: f32,
    tolerance: f32,
    cold: bool,

    engine: Engine,
}

impl Default for MascotRust {
    fn default() -> Self {
        Self {
            state: cxx_qt_lib::QString::from("idle"),
            size: 72.0,
            tolerance: 0.5,
            cold: false,
            engine: {
                let mut e = Engine::new();
                e.set_size(72.0);
                e
            },
        }
    }
}

impl cxx_qt::Initialize for ffi::Mascot {
    fn initialize(self: core::pin::Pin<&mut Self>) {
        // No-op: defaults handle it. Hook here if a host wants to pre-roll.
        let _ = self;
    }
}

// ── Property-change handlers ────────────────────────────────────────────
// cxx-qt invokes one of these every time QML (or C++) writes the property.
// We translate into the underlying engine and notify.

impl ffi::Mascot {
    /// Called by cxx-qt when QML assigns `mascot.state = "..."`.
    pub fn on_state_changed(mut self: core::pin::Pin<&mut Self>) {
        let s = self.as_ref().state().to_string();
        let st = parse_state(&s);
        self.as_mut().rust_mut().engine.set_state(st);
    }

    pub fn on_size_changed(mut self: core::pin::Pin<&mut Self>) {
        let v = *self.as_ref().size();
        self.as_mut().rust_mut().engine.set_size(v.max(1.0));
    }

    pub fn on_tolerance_changed(mut self: core::pin::Pin<&mut Self>) {
        let v = *self.as_ref().tolerance();
        self.as_mut().rust_mut().engine.set_tolerance(v.clamp(0.05, 5.0));
    }
}

impl ffi::Mascot {
    fn tick(mut self: core::pin::Pin<&mut Self>, dt: f32) -> bool {
        let repaint = self.as_mut().rust_mut().engine.tick(dt);
        let now_cold = self.as_ref().rust().engine.is_cold();
        let was_cold = *self.as_ref().cold();
        if now_cold != was_cold {
            self.as_mut().set_cold(now_cold);
            if now_cold {
                self.as_mut().cooled();
            }
        }
        repaint
    }
}

fn parse_state(s: &str) -> MascotState {
    match s.trim().to_ascii_lowercase().as_str() {
        "listening" => MascotState::Listening,
        "transmit" | "transmitting" => MascotState::Transmit,
        "veille" | "asleep" | "sleeping" => MascotState::Veille,
        _ => MascotState::Idle,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parse_state_is_total() {
        assert!(matches!(parse_state("Listening"), MascotState::Listening));
        assert!(matches!(parse_state("TRANSMIT"), MascotState::Transmit));
        assert!(matches!(parse_state("asleep"), MascotState::Veille));
        assert!(matches!(parse_state(""), MascotState::Idle));
        assert!(matches!(parse_state("nonsense"), MascotState::Idle));
    }
}
