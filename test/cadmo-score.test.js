// Behavioral tests for tools/cadmo-score.mjs — the ruler gets exercised, not
// just syntax-checked. Each test builds a throwaway repo in a tmpdir and asserts
// the level and gaps the tool reports; the last test runs it against THIS repo.
const { test } = require('node:test');
const assert = require('node:assert');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const SCORE = path.join(__dirname, '..', 'tools', 'cadmo-score.mjs');
const REPO = path.join(__dirname, '..');

function write(dir, rel, body) {
  const p = path.join(dir, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, body);
}
// Runs the tool and returns parsed --json, tolerating the below-target exit(1).
function score(dir) {
  let stdout;
  try {
    stdout = execFileSync('node', [SCORE, '--dir', dir, '--json'], { encoding: 'utf8' });
  } catch (e) {
    stdout = e.stdout ?? '';
  }
  return JSON.parse(stdout);
}
function tmp() { return fs.mkdtempSync(path.join(os.tmpdir(), 'cadmo-score-')); }

test('empty dir → level 0, with the Mapped rung as the next gaps', () => {
  const r = score(tmp());
  assert.strictEqual(r.level, 0);
  assert.strictEqual(r.nextRung.level, 1);
  const ids = r.gaps.map((g) => g.id);
  assert.ok(ids.includes('map-exists'), 'map-exists should be a gap');
  assert.ok(r.gaps.length >= 1, 'gaps must be listed, never just the number');
});

test('a filled AGENTS.md → level ≥ 1', () => {
  const dir = tmp();
  write(dir, 'AGENTS.md', '# AGENTS.md — my project\n\nThe map is filled in, no blanks here.\n');
  const r = score(dir);
  assert.ok(r.level >= 1, `expected level ≥ 1, got ${r.level}`);
});

test('an AGENTS.md with unfilled <placeholders> does NOT reach level 1', () => {
  const dir = tmp();
  write(dir, 'AGENTS.md', '# AGENTS.md — <project name>\n\nBuild: `<command>`\n');
  const r = score(dir);
  assert.strictEqual(r.level, 0);
  assert.ok(r.gaps.some((g) => g.id === 'map-filled'), 'map-filled should be a gap');
});

test('EARS tokens (<trigger>/<behavior>) are grammar, not blanks — still level 1', () => {
  const dir = tmp();
  write(dir, 'AGENTS.md', '# AGENTS.md — my project\n\nWHEN <trigger>, THE SYSTEM SHALL <behavior>.\n');
  const r = score(dir);
  assert.ok(r.level >= 1, `EARS example should not block level 1, got ${r.level}`);
});

test('this repo (dogfood) scores ≥ 3', () => {
  const r = score(REPO);
  assert.ok(r.level >= 3, `Cadmo repo should be Enforced or better, got ${r.level}`);
});
