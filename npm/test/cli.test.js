// Smoke tests for the create-cadmo CLI. No dependencies (node:test, built in).
// The method preaches "test the real flow" — the method's own tool gets it.
const { test } = require('node:test');
const assert = require('node:assert');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const CLI = path.join(__dirname, '..', 'index.js');
const BASE = [
  'AGENTS.md',
  'cadmo/value-gate.md', 'cadmo/spec.md', 'cadmo/plan.md', 'cadmo/decision.md',
  'cadmo/cadmo-grammar.mjs', 'cadmo/spec-drift.mjs', 'cadmo/spec-drift-workflow.yml',
  'cadmo/context-question.yml',
];
const CLAUDE = [
  '.claude/commands/cadmo-gate.md', '.claude/commands/cadmo-spec.md', '.claude/commands/cadmo-done.md',
];

function runIn(dir, extra = []) {
  return execFileSync('node', [CLI, ...extra], { cwd: dir, encoding: 'utf8' });
}
function tmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'cadmo-test-'));
}

test('scaffolds the nine base files into an empty project', () => {
  const dir = tmp();
  runIn(dir);
  for (const f of BASE) assert.ok(fs.existsSync(path.join(dir, f)), `expected ${f}`);
  for (const f of CLAUDE) assert.ok(!fs.existsSync(path.join(dir, f)), `did not expect ${f} without Claude markers`);
});

test('detects Claude Code (CLAUDE.md present) and adds the slash commands', () => {
  const dir = tmp();
  fs.writeFileSync(path.join(dir, 'CLAUDE.md'), '# map');
  runIn(dir);
  for (const f of CLAUDE) assert.ok(fs.existsSync(path.join(dir, f)), `expected ${f}`);
});

test('--claude forces the commands; --no-claude suppresses them', () => {
  const a = tmp();
  runIn(a, ['--claude']);
  assert.ok(fs.existsSync(path.join(a, CLAUDE[0])));
  const b = tmp();
  fs.writeFileSync(path.join(b, 'CLAUDE.md'), '# map');
  runIn(b, ['--no-claude']);
  assert.ok(!fs.existsSync(path.join(b, CLAUDE[0])));
});

test('is idempotent — never overwrites an existing file', () => {
  const dir = tmp();
  runIn(dir);
  const marker = '<<< user edited this >>>';
  const agents = path.join(dir, 'AGENTS.md');
  fs.writeFileSync(agents, marker);
  const out = runIn(dir);
  assert.strictEqual(fs.readFileSync(agents, 'utf8'), marker, 'existing file must not be touched');
  assert.match(out, /kept/);
});

test('--dry-run creates nothing', () => {
  const dir = tmp();
  const out = runIn(dir, ['--dry-run']);
  assert.match(out, /would create/);
  assert.ok(!fs.existsSync(path.join(dir, 'AGENTS.md')));
  assert.ok(!fs.existsSync(path.join(dir, 'cadmo')));
});

test('--help prints usage and exits zero', () => {
  const out = runIn(tmp(), ['--help']);
  assert.match(out, /create-cadmo/);
  assert.match(out, /--dry-run/);
});

test('the shipped spec-drift.mjs parses (node --check)', () => {
  execFileSync('node', ['--check', path.join(__dirname, '..', 'templates', 'spec-drift.mjs')]);
});
