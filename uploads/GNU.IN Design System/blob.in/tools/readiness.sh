#!/usr/bin/env bash
# readiness.sh — P5 readiness gate (executable view of readiness.md).
#
# Runs every AUTO gate it can and prints a pass/fail table. MANUAL gates are
# listed as MANUAL so they never silently pass. Exits non-zero if any auto gate
# fails — wire it into CI as the final step before allowing a `rust`-default
# build.
#
# Usage: bash tools/readiness.sh        (from blob.in/)

set -uo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

VERSION="0.14.0"
pass=0; fail=0; manual=0
declare -a ROWS

run() { # id, label, command...
  local id="$1" label="$2"; shift 2
  if "$@" >/tmp/blobin_readiness.log 2>&1; then
    ROWS+=("PASS  $id  $label"); pass=$((pass+1))
  else
    ROWS+=("FAIL  $id  $label"); fail=$((fail+1))
  fi
}

manual() { # id, label
  ROWS+=("MANUAL $1  $2"); manual=$((manual+1))
}

echo "blob.in readiness · engine v$VERSION"
echo "========================================"

# ── AUTO gates ──
run R1 "tokens in sync"          bash -c 'cargo run -q -p blobin-gen -- tokens.json --rust /tmp/tk.rs && diff -q blobin-core/src/tokens.rs /tmp/tk.rs'
run R2 "workspace tests"          cargo test -q --workspace
run R3 "threaded == sequential"   cargo test -q -p blobin-core --features threaded-solver
run R4 "material parity"          cargo test -q -p blobin-golden
run R5 "C++ shim <= 300 LoC"      bash tools/loc-guard.sh 300
run R6 "no unsafe outside ffi"    bash tools/no-unsafe.sh

# ── MANUAL gates ──
manual R7  "frame budget <= v3.1 baseline (low-end GPU bench)"
manual R8  "GPU shader == raster goldens (software-RHI diff)"
manual R9  "Qt-5 fallback: zero regressions (BLOBIN_BACKEND=cpp)"
manual R10 "dogfood 2 weeks, no P0/P1 bugs"

echo
for r in "${ROWS[@]}"; do echo "  $r"; done
echo "----------------------------------------"
echo "  auto: $pass pass · $fail fail   manual: $manual pending"
echo

if [ "$fail" -gt 0 ]; then
  echo "NOT READY — $fail auto gate(s) failing. See /tmp/blobin_readiness.log"
  exit 1
fi
if [ "$manual" -gt 0 ]; then
  echo "AUTO GATES GREEN — $manual manual gate(s) await sign-off before rust-default flip."
  exit 0
fi
echo "ALL GATES GREEN — clear to flip BLOBIN_BACKEND=rust by default."
