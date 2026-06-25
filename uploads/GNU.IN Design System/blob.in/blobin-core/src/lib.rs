//! blob.in — organic-shape engine.
//!
//! Everything that *decides* a shape lives here, in Rust:
//!   path        cubic-Bézier path primitive (the lingua franca)
//!   blob        `Blob` trait + shapes (RectBlob, SuperBlob, Inverted)
//!   group       affine 2D composition (glam)
//!   tessellate  Path → (Vec<Vertex>, Vec<u16>) via lyon
//!   solve       spring + easing solvers, driven by tokens
//!   tokens      generated from tokens.json (MDUR / MEASE)
//!   material    surface params (colour, opacity, gradient, noise)
//!   state       idle / listening / transmit / veille → animated target
//!   engine      owns the live scene; the only thing ffi.rs talks to
//!   ffi         #[cxx::bridge] — the single hot frontier to blobin-qt
//!
//! blobin-qt (C++) only *renders*: it asks `engine` for triangles and
//! uploads them. No logic crosses into C++.

pub mod path;
pub mod blob;
pub mod group;
pub mod tessellate;
pub mod tokens;
pub mod solve;
pub mod material;
pub mod state;
pub mod engine;
pub mod bloom;
pub mod pool;
pub mod backend;
pub mod raster;
pub mod diff;

// The cxx bridge module. Not compiled in plain `cargo test` doc builds
// without a C++ toolchain, but always part of the crate graph.
pub mod ffi;

pub use blob::{Blob, RectBlob, SuperBlob, Inverted, BlobKind};
pub use group::Group;
pub use material::Material;
pub use path::{Path, Point};
pub use state::{MascotState, StateMachine};
pub use tessellate::{Mesh, Vertex};
pub use pool::{Scheduler, EngineId};
pub use backend::Backend;
pub use bloom::{BubbleBloom, BubbleSpec};
