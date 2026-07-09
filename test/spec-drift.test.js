// Behavioral tests for tools/spec-drift.mjs — the moat gets a real harness,
// not just `node --check`. Each test builds a synthetic git repo in a tmpdir,
// commits, branches, changes files, and asserts the guard's exit code.
const { test } = require('node:test');
const assert = require('node:assert');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const DRIFT = path.join(__dirname, '..', 'tools', 'spec-drift.mjs');
const GIT_ENV = {
  ...process.env,
  GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@t',
  GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@t',
};

function git(dir, ...a) { execFileSync('git', a, { cwd: dir, env: GIT_ENV }); }
function write(dir, rel, body) {
  const p = path.join(dir, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, body);
}
function spec(watches) {
  return `---\nwatches:\n${watches.map(w => `  - ${w}`).join('\n')}\n---\n# spec\nrule v1\n`;
}
// returns exit code of the guard on the current HEAD vs `main`
function run(dir) {
  try {
    execFileSync('node', [DRIFT, '--base', 'main'], { cwd: dir, encoding: 'utf8' });
    return 0;
  } catch (e) { return e.status ?? 1; }
}
function repo(setup) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'drift-'));
  git(dir, 'init', '-q', '-b', 'main');
  setup.base(dir);
  git(dir, 'add', '-A'); git(dir, 'commit', '-qm', 'base');
  git(dir, 'checkout', '-qb', 'feature');
  setup.change(dir);
  git(dir, 'add', '-A'); git(dir, 'commit', '-qm', 'change');
  return dir;
}

test('watched file changes without its spec -> DRIFT (exit 1)', () => {
  const dir = repo({
    base: d => { write(d, 'docs/s.md', spec(['src/billing/**'])); write(d, 'src/billing/calc.js', 'v1'); },
    change: d => write(d, 'src/billing/calc.js', 'v2'),
  });
  assert.strictEqual(run(dir), 1);
});

test('watched file and spec change together -> OK (exit 0)', () => {
  const dir = repo({
    base: d => { write(d, 'docs/s.md', spec(['src/**'])); write(d, 'src/a.js', 'v1'); },
    change: d => { write(d, 'src/a.js', 'v2'); write(d, 'docs/s.md', spec(['src/**']) + '\nedited'); },
  });
  assert.strictEqual(run(dir), 0);
});

test('only an unwatched file changes -> OK', () => {
  const dir = repo({
    base: d => { write(d, 'docs/s.md', spec(['src/**'])); write(d, 'other.txt', 'v1'); },
    change: d => write(d, 'other.txt', 'v2'),
  });
  assert.strictEqual(run(dir), 0);
});

test('** matches a deep path (a/b/target.js)', () => {
  const dir = repo({
    base: d => { write(d, 'docs/s.md', spec(['src/**/target.js'])); write(d, 'src/a/b/target.js', 'v1'); },
    change: d => write(d, 'src/a/b/target.js', 'v2'),
  });
  assert.strictEqual(run(dir), 1);
});

test('** matches ZERO segments (src/**/auth.js matches src/auth.js) — the globstar regression', () => {
  const dir = repo({
    base: d => { write(d, 'docs/s.md', spec(['src/**/auth.js'])); write(d, 'src/auth.js', 'v1'); },
    change: d => write(d, 'src/auth.js', 'v2'),
  });
  assert.strictEqual(run(dir), 1, 'src/auth.js should be caught by src/**/auth.js (zero intermediate dirs)');
});

test('exact path match without spec -> DRIFT', () => {
  const dir = repo({
    base: d => { write(d, 'docs/s.md', spec(['api.py'])); write(d, 'api.py', 'v1'); },
    change: d => write(d, 'api.py', 'v2'),
  });
  assert.strictEqual(run(dir), 1);
});

test('single * does NOT cross a segment boundary (src/*.js ignores src/a/b.js)', () => {
  const dir = repo({
    base: d => { write(d, 'docs/s.md', spec(['src/*.js'])); write(d, 'src/a/b.js', 'v1'); },
    change: d => write(d, 'src/a/b.js', 'v2'),
  });
  assert.strictEqual(run(dir), 0, 'src/a/b.js is one segment deeper than src/*.js allows');
});

test('no specs with watches -> OK', () => {
  const dir = repo({
    base: d => write(d, 'src/a.js', 'v1'),
    change: d => write(d, 'src/a.js', 'v2'),
  });
  assert.strictEqual(run(dir), 0);
});
