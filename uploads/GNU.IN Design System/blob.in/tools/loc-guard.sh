#!/usr/bin/env bash
# loc-guard.sh — fail if the C++ render shim exceeds its budget (plan §6/§4).
#
# The whole point of 4.0 is that C++ is a thin render shim ("second
# mini-engine"). This guard counts non-blank, non-comment lines across the
# blobin-qt C++ sources and fails CI if they cross BUDGET. If you need to add
# C++ logic, that's a design smell — push it into blobin-core (Rust) instead.
#
# Usage: tools/loc-guard.sh [budget]   (default 300)

set -euo pipefail
BUDGET="${1:-300}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

FILES=(
  "$ROOT/blobin-qt/src/blobin_item.h"
  "$ROOT/blobin-qt/src/blobin_item.cpp"
  "$ROOT/blobin-qt/src/blobin_material.h"
  "$ROOT/blobin-qt/src/blobin_material.cpp"
  "$ROOT/blobin-qt/src/blobin_bloom_item.h"
  "$ROOT/blobin-qt/src/blobin_bloom_item.cpp"
)

total=0
printf '%-22s %5s\n' "file" "code"
for f in "${FILES[@]}"; do
  # Strip /* */ block comments, then drop blank lines and // line comments.
  code=$(sed -e ':a' -e 's:/\*[^*]*\*/::g' -e 'ta' "$f" \
    | grep -vE '^[[:space:]]*$' \
    | grep -vE '^[[:space:]]*//' \
    | wc -l | tr -d ' ')
  printf '%-22s %5s\n' "$(basename "$f")" "$code"
  total=$((total + code))
done
printf '%s\n' "----------------------------------"
printf '%-22s %5s  (budget %s)\n' "TOTAL" "$total" "$BUDGET"

if [ "$total" -gt "$BUDGET" ]; then
  echo "FAIL: C++ shim is $total LoC, over budget $BUDGET." >&2
  echo "Move logic into blobin-core (Rust). The shim only renders." >&2
  exit 1
fi
echo "OK: C++ shim within budget."
