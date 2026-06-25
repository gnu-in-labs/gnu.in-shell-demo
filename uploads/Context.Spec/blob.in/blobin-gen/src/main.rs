//! blobin-gen — lowers tokens.json into per-engine source.
//!
//! tokens.json is the single source of truth (plan §7). This binary reads it
//! and emits:
//!   --rust   <path>   motion tokens → blobin_tokens.rs (the Rust solver)
//!   --qml    <path>   colours       → GnuTheme.qml singleton
//!   --header <path>   colours        → gnu_theme.h (constexpr struct)
//!   --dart   <path>   colours        → gnu_theme.dart
//!
//! Any subset of flags may be passed; each writes one file. With no output
//! flag it prints the parsed token summary (a dry-run).
//!
//! Example (closes the loop for the Rust solver):
//!   blobin-gen tokens.json --rust ../blobin-core/src/tokens.rs

use std::collections::BTreeMap;
use std::fs;
use std::process::ExitCode;

use serde::Deserialize;

#[derive(Debug, Deserialize)]
struct Tokens {
    version: String,
    motion: Motion,
    color: BTreeMap<String, String>,
}

#[derive(Debug, Deserialize)]
struct Motion {
    durations_ms: BTreeMap<String, f32>,
    eases: BTreeMap<String, Ease>,
    springs: BTreeMap<String, Spring>,
}

#[derive(Debug, Deserialize)]
struct Ease {
    p1x: f32,
    p1y: f32,
    p2x: f32,
    p2y: f32,
}

#[derive(Debug, Deserialize)]
struct Spring {
    stiffness: f32,
    damping: f32,
    mass: f32,
}

fn main() -> ExitCode {
    let args: Vec<String> = std::env::args().skip(1).collect();
    if args.is_empty() || args[0].starts_with("--") {
        eprintln!("usage: blobin-gen <tokens.json> [--rust P] [--qml P] [--header P] [--dart P]");
        return ExitCode::from(2);
    }

    let input = &args[0];
    let raw = match fs::read_to_string(input) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("error: cannot read {input}: {e}");
            return ExitCode::FAILURE;
        }
    };
    let tokens: Tokens = match serde_json::from_str(&raw) {
        Ok(t) => t,
        Err(e) => {
            eprintln!("error: invalid tokens.json: {e}");
            return ExitCode::FAILURE;
        }
    };

    // Parse output flags.
    let mut outputs: Vec<(&str, &str)> = Vec::new();
    let mut i = 1;
    while i < args.len() {
        match args[i].as_str() {
            f @ ("--rust" | "--qml" | "--header" | "--dart") => {
                let Some(path) = args.get(i + 1) else {
                    eprintln!("error: {f} needs a path");
                    return ExitCode::from(2);
                };
                outputs.push((&f[2..], path));
                i += 2;
            }
            other => {
                eprintln!("error: unknown flag {other}");
                return ExitCode::from(2);
            }
        }
    }

    if outputs.is_empty() {
        // Dry run.
        println!("tokens.json v{} parsed:", tokens.version);
        println!("  durations: {}", tokens.motion.durations_ms.len());
        println!("  eases:     {}", tokens.motion.eases.len());
        println!("  springs:   {}", tokens.motion.springs.len());
        println!("  colours:   {}", tokens.color.len());
        return ExitCode::SUCCESS;
    }

    for (kind, path) in outputs {
        let src = match kind {
            "rust" => emit_rust(&tokens, input),
            "qml" => emit_qml(&tokens, input),
            "header" => emit_header(&tokens, input),
            "dart" => emit_dart(&tokens, input),
            _ => unreachable!(),
        };
        if let Err(e) = fs::write(path, src) {
            eprintln!("error: cannot write {path}: {e}");
            return ExitCode::FAILURE;
        }
        println!("wrote {kind} → {path}");
    }
    ExitCode::SUCCESS
}

fn screaming(name: &str) -> String {
    name.to_uppercase()
}

// ── Rust emitter (motion tokens → solver consts) ──────────────────────────

fn emit_rust(t: &Tokens, src: &str) -> String {
    let mut o = String::new();
    o.push_str(&banner_rust(src, &t.version));

    o.push_str("/// A named duration in milliseconds (MDUR.* in the spec).\n");
    o.push_str("#[derive(Clone, Copy, Debug)]\npub struct Dur(pub f32);\n\n");
    o.push_str("impl Dur {\n    #[inline]\n    pub const fn secs(self) -> f32 {\n        self.0 / 1000.0\n    }\n}\n\n");

    o.push_str("/// Spec MDUR scale. Names match the Motion Spec tables verbatim.\n");
    o.push_str("pub mod mdur {\n    use super::Dur;\n");
    for (name, ms) in &t.motion.durations_ms {
        o.push_str(&format!(
            "    pub const {}: Dur = Dur({:?});\n",
            screaming(name),
            ms
        ));
    }
    o.push_str("}\n\n");

    o.push_str("/// A cubic-Bézier easing, MEASE.* in the spec.\n");
    o.push_str("#[derive(Clone, Copy, Debug)]\npub struct Ease {\n    pub p1x: f32,\n    pub p1y: f32,\n    pub p2x: f32,\n    pub p2y: f32,\n}\n\n");
    o.push_str("pub mod mease {\n    use super::Ease;\n");
    for (name, e) in &t.motion.eases {
        o.push_str(&format!(
            "    pub const {}: Ease = Ease {{ p1x: {:?}, p1y: {:?}, p2x: {:?}, p2y: {:?} }};\n",
            screaming(name), e.p1x, e.p1y, e.p2x, e.p2y
        ));
    }
    o.push_str("}\n\n");

    o.push_str("/// Spring presets (mass-spring-damper).\n");
    o.push_str("#[derive(Clone, Copy, Debug)]\npub struct SpringToken {\n    pub stiffness: f32,\n    pub damping: f32,\n    pub mass: f32,\n}\n\n");
    o.push_str("pub mod mspring {\n    use super::SpringToken;\n");
    for (name, s) in &t.motion.springs {
        o.push_str(&format!(
            "    pub const {}: SpringToken = SpringToken {{ stiffness: {:?}, damping: {:?}, mass: {:?} }};\n",
            screaming(name), s.stiffness, s.damping, s.mass
        ));
    }
    o.push_str("}\n");
    o
}

// ── QML emitter (colours → GnuTheme singleton) ───────────────────────────

fn emit_qml(t: &Tokens, src: &str) -> String {
    let mut o = format!(
        "// GENERATED from {src} (tokens v{}) by blobin-gen. DO NOT EDIT.\npragma Singleton\nimport QtQuick\n\nQtObject {{\n",
        t.version
    );
    for (name, hex) in &t.color {
        o.push_str(&format!("    readonly property color {}: \"{}\"\n", camel(name), hex));
    }
    o.push_str("}\n");
    o
}

// ── C++ header emitter (colours → constexpr struct) ──────────────────────

fn emit_header(t: &Tokens, src: &str) -> String {
    let mut o = format!(
        "// GENERATED from {src} (tokens v{}) by blobin-gen. DO NOT EDIT.\n#pragma once\n#include <cstdint>\n\nnamespace gnuin {{\nstruct GnuTheme {{\n",
        t.version
    );
    for (name, hex) in &t.color {
        let argb = hex_to_argb(hex);
        o.push_str(&format!(
            "    static constexpr uint32_t {} = 0x{:08X};\n",
            screaming(name), argb
        ));
    }
    o.push_str("};\n} // namespace gnuin\n");
    o
}

// ── Dart emitter (colours → const class) ─────────────────────────────────

fn emit_dart(t: &Tokens, src: &str) -> String {
    let mut o = format!(
        "// GENERATED from {src} (tokens v{}) by blobin-gen. DO NOT EDIT.\nimport 'dart:ui';\n\nclass GnuTheme {{\n  GnuTheme._();\n",
        t.version
    );
    for (name, hex) in &t.color {
        let argb = hex_to_argb(hex);
        o.push_str(&format!(
            "  static const Color {} = Color(0x{:08X});\n",
            camel(name), argb
        ));
    }
    o.push_str("}\n");
    o
}

// ── helpers ───────────────────────────────────────────────────────────────

fn banner_rust(src: &str, version: &str) -> String {
    format!(
"//! tokens.rs — GENERATED by blobin-gen from {src} (tokens v{version}).
//! DO NOT EDIT BY HAND. Regenerate:
//!   blobin-gen {src} --rust src/tokens.rs
//!
//! Closes the v1→v3.1 drift (plan §7): the Motion Spec board and this module
//! read the same tokens.json, so a duration in the spec table is the same
//! const the solver executes.

"
    )
}

/// snake_case / lower → camelCase.
fn camel(s: &str) -> String {
    let mut out = String::new();
    let mut up = false;
    for c in s.chars() {
        if c == '_' {
            up = true;
        } else if up {
            out.extend(c.to_uppercase());
            up = false;
        } else {
            out.push(c);
        }
    }
    out
}

/// "#RRGGBB" → 0xFFRRGGBB (opaque ARGB).
fn hex_to_argb(hex: &str) -> u32 {
    let h = hex.trim_start_matches('#');
    let v = u32::from_str_radix(h, 16).unwrap_or(0);
    0xFF00_0000 | (v & 0x00FF_FFFF)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn camel_works() {
        assert_eq!(camel("ink_dim"), "inkDim");
        assert_eq!(camel("accent"), "accent");
    }

    #[test]
    fn argb_opaque() {
        assert_eq!(hex_to_argb("#FF6A00"), 0xFFFF6A00);
        assert_eq!(hex_to_argb("#000000"), 0xFF000000);
    }
}
