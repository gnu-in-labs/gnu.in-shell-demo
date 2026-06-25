//! Backend — runtime selection of the rendering/compute backend (P4).
//!
//! `BLOBIN_BACKEND=rust|cpp` (default `rust`). In 4.0 the Rust path is the
//! engine; the C++ path is the **fallback / parity oracle** kept alive per
//! plan §6 ("second mini-engine, called as little as possible"):
//!   • `rust` — geometry/anim/material computed in blobin-core (default)
//!   • `cpp`  — the legacy C++ shape engine, for platforms without a mature
//!              Rust toolchain or for golden-parity bring-up
//!
//! This module only *decides and reports* the backend; blobin-qt reads it once
//! at item construction and routes accordingly. Keeping the decision in Rust
//! means the env contract is documented and tested in one place.

use std::fmt;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Backend {
    Rust,
    Cpp,
}

impl Backend {
    /// Resolve from an explicit string (case-insensitive). Unknown → Rust,
    /// with the caller free to warn.
    pub fn parse(s: &str) -> Option<Backend> {
        match s.trim().to_ascii_lowercase().as_str() {
            "rust" | "rs" => Some(Backend::Rust),
            "cpp" | "c++" | "cxx" => Some(Backend::Cpp),
            _ => None,
        }
    }

    /// Resolve from the environment. `BLOBIN_BACKEND` unset or unrecognised
    /// yields the default (`Rust`).
    pub fn from_env() -> Backend {
        std::env::var("BLOBIN_BACKEND")
            .ok()
            .and_then(|v| Backend::parse(&v))
            .unwrap_or(Backend::Rust)
    }

    pub fn is_default(self) -> bool {
        self == Backend::Rust
    }

    pub fn as_str(self) -> &'static str {
        match self {
            Backend::Rust => "rust",
            Backend::Cpp => "cpp",
        }
    }
}

impl Default for Backend {
    fn default() -> Self {
        Backend::Rust
    }
}

impl fmt::Display for Backend {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(self.as_str())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parse_aliases() {
        assert_eq!(Backend::parse("rust"), Some(Backend::Rust));
        assert_eq!(Backend::parse("RS"), Some(Backend::Rust));
        assert_eq!(Backend::parse("c++"), Some(Backend::Cpp));
        assert_eq!(Backend::parse("cxx"), Some(Backend::Cpp));
        assert_eq!(Backend::parse("wat"), None);
    }

    #[test]
    fn default_is_rust() {
        assert!(Backend::default().is_default());
        assert_eq!(Backend::Rust.as_str(), "rust");
    }
}
