#!/usr/bin/env node
/*
 * create-cadmo — scaffold the Cadmo method into the current project.
 * No dependencies. Never overwrites an existing file.
 * https://github.com/tiagotorres91/cadmo
 */
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const DRY = args.includes('--dry-run');
const FORCE_CLAUDE = args.includes('--claude');
const NO_CLAUDE = args.includes('--no-claude');

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
  create-cadmo — drop the Cadmo method into the current project.

  Usage: npm create cadmo [-- --dry-run] [-- --claude | --no-claude]

    --dry-run     show what would be created, create nothing
    --claude      also install Claude Code slash commands (/cadmo-gate, /cadmo-spec, /cadmo-done)
    --no-claude   skip the Claude Code commands even if CLAUDE.md/.claude is detected

  Creates (never overwrites):
    AGENTS.md                       the local map your AI pair reads first
    cadmo/value-gate.md             5 lines before any spec: is it worth building?
    cadmo/spec.md                   the rules, client language, criteria first
    cadmo/plan.md                   the internal route: tasks, constraints, validation
    cadmo/decision.md               ADR with a "when to reconsider" trigger
    cadmo/spec-drift.mjs            the drift guard: specs must change with the code they watch
    cadmo/cadmo-grammar.mjs         the shared front-matter/glob grammar the guard imports
    cadmo/spec-drift-workflow.yml   ready CI workflow (move into .github/workflows/)
    cadmo/context-question.yml      issue form for the context channel (move into .github/ISSUE_TEMPLATE/ when a second dev joins)
    .claude/commands/cadmo-*.md     (when Claude Code is detected, or --claude)

  The method in one page: https://github.com/tiagotorres91/cadmo
`);
  process.exit(0);
}

const here = (...p) => path.join(__dirname, 'templates', ...p);
const cwd = process.cwd();

const FILES = [
  ['AGENTS.md', 'AGENTS.md'],
  ['value-gate.md', path.join('cadmo', 'value-gate.md')],
  ['spec.md', path.join('cadmo', 'spec.md')],
  ['plan.md', path.join('cadmo', 'plan.md')],
  ['decision.md', path.join('cadmo', 'decision.md')],
  ['cadmo-grammar.mjs', path.join('cadmo', 'cadmo-grammar.mjs')],
  ['spec-drift.mjs', path.join('cadmo', 'spec-drift.mjs')],
  ['spec-drift-workflow.yml', path.join('cadmo', 'spec-drift-workflow.yml')],
  ['context-question.yml', path.join('cadmo', 'context-question.yml')],
];

const hasClaude = FORCE_CLAUDE || (!NO_CLAUDE &&
  (fs.existsSync(path.join(cwd, 'CLAUDE.md')) || fs.existsSync(path.join(cwd, '.claude'))));

const CLAUDE_FILES = [
  [path.join('claude-commands', 'cadmo-gate.md'), path.join('.claude', 'commands', 'cadmo-gate.md')],
  [path.join('claude-commands', 'cadmo-spec.md'), path.join('.claude', 'commands', 'cadmo-spec.md')],
  [path.join('claude-commands', 'cadmo-done.md'), path.join('.claude', 'commands', 'cadmo-done.md')],
];

const plan = hasClaude ? FILES.concat(CLAUDE_FILES) : FILES;

console.log(`\n  Cadmo — write it down before you build it.${DRY ? '  (dry run)' : ''}\n`);

let placed = 0, skipped = 0;
for (const [src, dest] of plan) {
  const target = path.join(cwd, dest);
  if (fs.existsSync(target)) {
    console.log(`  = kept      ${dest} (already exists — not touched)`);
    skipped++;
    continue;
  }
  if (DRY) {
    console.log(`  ~ would create ${dest}`);
  } else {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(here(src), target);
    console.log(`  + created   ${dest}`);
  }
  placed++;
}

console.log(`\n  ${placed} file(s) ${DRY ? 'would be created' : 'created'}, ${skipped} kept.\n`);
if (!hasClaude && !NO_CLAUDE) {
  console.log('  (No CLAUDE.md/.claude folder detected — run: npm create cadmo -- --claude   (the -- matters: npm swallows flags without it) to also install the /cadmo-* slash commands.)');
}
console.log('  Next steps:');
console.log('  1. Fill in AGENTS.md — the local map your AI pair reads first');
console.log('     (using CLAUDE.md? link or rename it — same idea).');
console.log('  2. For your next relevant feature: cadmo/value-gate.md (5 lines, before any spec).');
console.log('  3. For any 3+ step task: copy cadmo/plan.md — acceptance criteria before code.');
console.log('  4. Turn on the drift guard: move cadmo/spec-drift-workflow.yml to .github/workflows/');
console.log('     and add a `watches:` front matter to your first spec.');
console.log('\n  The method in one page: https://github.com/tiagotorres91/cadmo\n');
