//! blobin-cxxqt — the reactive Qt surface (Q6 of plan §8).
//!
//! Two QObject types, both backed by `blobin_core`:
//!   - `Mascot` — Q_PROPERTY on `state`, `size`, `tolerance`; signal
//!     `cooled()` when the engine settles. QML `import blob.in.qml 0.4` then
//!     binds `mascot.state = "listening"` and the redraw happens
//!     automatically — no manual `setState`, no manual `update()`.
//!   - `Bloom`  — Q_PROPERTY on `open`, `leaves`, `ring`, `stagger`; signal
//!     `bloomed()` when fully open, `retracted()` when fully closed. QML
//!     toggles `bloom.open = true` and reads `bloom.cold`.
//!
//! The plain `cxx::bridge` in `blobin-core::ffi` stays valid for hosts that
//! want direct setter/getter wiring. This crate is the **idiomatic Qt** path,
//! built in parallel — not a replacement.

pub mod mascot;
pub mod bloom;
