#!/usr/bin/env node
/*
 * create-cadmo — scaffold the Cadmo method into the current project.
 * No dependencies. Never overwrites an existing file.
 * https://github.com/tiagotorres91/cadmo
 */
const fs = require('fs');
const path = require('path');

const here = (...p) => path.join(__dirname, 'templates', ...p);
const cwd = process.cwd();

const FILES = [
  // [source in package, destination in project]
  ['AGENTS.md', 'AGENTS.md'],
  ['value-gate.md', path.join('cadmo', 'value-gate.md')],
  ['spec.md', path.join('cadmo', 'spec.md')],
  ['plan.md', path.join('cadmo', 'plan.md')],
  ['decision.md', path.join('cadmo', 'decision.md')],
];

console.log('\n  Cadmo — write it down before you build it.\n');

let placed = 0, skipped = 0;
for (const [src, dest] of FILES) {
  const target = path.join(cwd, dest);
  if (fs.existsSync(target)) {
    console.log(`  = kept      ${dest} (already exists — not touched)`);
    skipped++;
    continue;
  }
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(here(src), target);
  console.log(`  + created   ${dest}`);
  placed++;
}

console.log(`\n  ${placed} file(s) created, ${skipped} kept.\n`);
console.log('  Next steps:');
console.log('  1. Fill in AGENTS.md — the local map your AI pair reads first');
console.log('     (using CLAUDE.md? link or rename it — same idea).');
console.log('  2. For your next relevant feature: cadmo/value-gate.md (5 lines, before any spec).');
console.log('  3. For any 3+ step task: copy cadmo/plan.md — acceptance criteria before code.');
console.log('\n  The method in one page: https://github.com/tiagotorres91/cadmo\n');
