// Smoke test for the create-cadmo CLI. No dependencies (node:test, built in).
// The method preaches "test the real flow" — the method's own tool gets it.
const { test } = require('node:test');
const assert = require('node:assert');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const CLI = path.join(__dirname, '..', 'index.js');
const EXPECTED = ['AGENTS.md', 'cadmo/value-gate.md', 'cadmo/spec.md', 'cadmo/plan.md', 'cadmo/decision.md'];

function runIn(dir) {
  return execFileSync('node', [CLI], { cwd: dir, encoding: 'utf8' });
}

function tmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'cadmo-test-'));
}

test('scaffolds all five files into an empty project', () => {
  const dir = tmp();
  runIn(dir);
  for (const f of EXPECTED) {
    assert.ok(fs.existsSync(path.join(dir, f)), `expected ${f} to be created`);
  }
});

test('is idempotent — never overwrites an existing file', () => {
  const dir = tmp();
  runIn(dir); // first run creates everything
  const marker = '<<< user edited this >>>';
  const agents = path.join(dir, 'AGENTS.md');
  fs.writeFileSync(agents, marker);
  const out = runIn(dir); // second run
  assert.strictEqual(fs.readFileSync(agents, 'utf8'), marker, 'existing file must not be touched');
  assert.match(out, /kept/, 'second run should report kept files');
});

test('exits zero', () => {
  const dir = tmp();
  assert.doesNotThrow(() => runIn(dir));
});
