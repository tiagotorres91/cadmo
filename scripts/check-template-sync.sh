#!/usr/bin/env bash
# The CLI ships a copy of templates/ inside npm/ (npm publish only bundles the package dir).
# One subject, one source: templates/ is canonical; npm/templates/ is derived and must not drift.
set -euo pipefail
cd "$(dirname "$0")/.."
fail=0
check() { if ! diff -q "$1" "$2" >/dev/null; then echo "DRIFT: $1 != $2"; fail=1; fi; }
check templates/value-gate.md        npm/templates/value-gate.md
check templates/spec.md              npm/templates/spec.md
check templates/plan.md              npm/templates/plan.md
check templates/decision.md          npm/templates/decision.md
check templates/AGENTS.md.template   npm/templates/AGENTS.md
if [ "$fail" -eq 0 ]; then
  echo "templates in sync ✓"
else
  echo "Fix: cp templates/*.md npm/templates/ && cp templates/AGENTS.md.template npm/templates/AGENTS.md"
  exit 1
fi
