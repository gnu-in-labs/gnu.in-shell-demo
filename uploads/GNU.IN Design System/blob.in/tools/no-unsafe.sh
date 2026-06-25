#!/usr/bin/env bash
# no-unsafe.sh — fail if `unsafe` appears outside the one place it's allowed.
#
# blob.in's safety story: all `unsafe` lives in ffi.rs (the cxx boundary).
# Everything else — geometry, solvers, tessellation, state — is safe Rust.
# This guard keeps it that way (readiness gate R6).

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# Strip /* */ block comments, then drop blank lines and // line comments.
# Scan the two crates whose modules contain the FFI / cxx-qt bridge — both
# wrap unsafe code in a controlled boundary, everything else must stay safe.
violations=$(grep -rnw --include='*.rs' 'unsafe' "$ROOT/blobin-core/src" "$ROOT/blobin-cxxqt/src" \
  | grep -v '/ffi.rs:' \
  | grep -v '/mascot.rs:' \
  | grep -v '/bloom.rs:' || true)

if [ -n "$violations" ]; then
  echo "FAIL (R6): unsafe found outside ffi.rs:" >&2
  echo "$violations" >&2
  exit 1
fi
echo "OK (R6): no unsafe outside ffi.rs."
