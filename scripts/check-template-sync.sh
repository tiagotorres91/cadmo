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
check tools/spec-drift.mjs           npm/templates/spec-drift.mjs
check tools/spec-drift-workflow.yml  npm/templates/spec-drift-workflow.yml
check templates/claude-commands/cadmo-gate.md  npm/templates/claude-commands/cadmo-gate.md
check templates/claude-commands/cadmo-spec.md  npm/templates/claude-commands/cadmo-spec.md
check templates/claude-commands/cadmo-done.md  npm/templates/claude-commands/cadmo-done.md
# the Claude Code plugin bundles byte-identical copies of the commands (renamed) + the skill
check templates/claude-commands/cadmo-gate.md  plugins/cadmo/commands/gate.md
check templates/claude-commands/cadmo-spec.md  plugins/cadmo/commands/spec.md
check templates/claude-commands/cadmo-done.md  plugins/cadmo/commands/done.md
check skills/cadmo-method/SKILL.md             plugins/cadmo/skills/cadmo-method/SKILL.md
if [ "$fail" -eq 0 ]; then
  echo "templates in sync ✓"
else
  echo "Fix: cp templates/*.md npm/templates/ ; cp templates/AGENTS.md.template npm/templates/AGENTS.md ; cp tools/spec-drift.mjs tools/spec-drift-workflow.yml npm/templates/ ; cp templates/claude-commands/*.md npm/templates/claude-commands/"
  exit 1
fi
