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
function stamp(dir, specRel) {
  execFileSync('node', [DRIFT, '--stamp', specRel], { cwd: dir, encoding: 'utf8' });
}
function read(dir, rel) { return fs.readFileSync(path.join(dir, rel), 'utf8'); }
function append(dir, rel, body) { fs.appendFileSync(path.join(dir, rel), body); }
// setup.stampSpec (optional): after the base commit, --stamp that spec and commit
// the stamp on main, so `reviewed:` is part of the base the feature branches from.
function repo(setup) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'drift-'));
  git(dir, 'init', '-q', '-b', 'main');
  setup.base(dir);
  git(dir, 'add', '-A'); git(dir, 'commit', '-qm', 'base');
  if (setup.stampSpec) {
    stamp(dir, setup.stampSpec);
    git(dir, 'add', '-A'); git(dir, 'commit', '-qm', 'stamp');
  }
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

// --- v2: reviewed-state / SUSPECT ---

test('--stamp writes a reviewed: sha256 into the spec front matter', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'drift-'));
  git(dir, 'init', '-q', '-b', 'main');
  write(dir, 'docs/s.md', spec(['src/**']));
  write(dir, 'src/a.js', 'v1');
  git(dir, 'add', '-A'); git(dir, 'commit', '-qm', 'base');
  stamp(dir, 'docs/s.md');
  const m = read(dir, 'docs/s.md').match(/^reviewed:\s*([0-9a-f]{64})\s*$/m);
  assert.ok(m, 'spec should carry a reviewed: <64-hex> line after --stamp');
  // watches list is preserved alongside the new key
  assert.match(read(dir, 'docs/s.md'), /watches:/);
});

test('SUSPECT: watched file changed since stamp fires even when the spec was also edited', () => {
  const dir = repo({
    base: d => { write(d, 'docs/s.md', spec(['src/**'])); write(d, 'src/a.js', 'v1'); },
    stampSpec: 'docs/s.md',
    // edit the spec (silences DRIFT) but KEEP its reviewed: hash, and change watched code
    change: d => { append(d, 'docs/s.md', 'edited\n'); write(d, 'src/a.js', 'v2'); },
  });
  assert.strictEqual(run(dir), 1, 'watched code changed since the stamp -> SUSPECT despite the spec edit');
});

test('a spec WITHOUT reviewed: does NOT get SUSPECT (opt-in)', () => {
  const dir = repo({
    base: d => { write(d, 'docs/s.md', spec(['src/**'])); write(d, 'src/a.js', 'v1'); },
    // spec edited together with watched code -> no DRIFT; and no reviewed: -> no SUSPECT
    change: d => { append(d, 'docs/s.md', 'edited\n'); write(d, 'src/a.js', 'v2'); },
  });
  assert.strictEqual(run(dir), 0);
});

test('--stamp then no watched change -> in sync (exit 0)', () => {
  const dir = repo({
    base: d => { write(d, 'docs/s.md', spec(['src/**'])); write(d, 'src/a.js', 'v1'); },
    stampSpec: 'docs/s.md',
    // only an unwatched file moves; watched hash still matches the stamp
    change: d => write(d, 'other.txt', 'v2'),
  });
  assert.strictEqual(run(dir), 0);
});

test('CRLF working tree does not cause a false SUSPECT (autocrlf + multi-line watched file)', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'drift-'));
  git(dir, 'init', '-q', '-b', 'main');
  git(dir, 'config', 'core.autocrlf', 'true');
  write(dir, 'docs/s.md', spec(['src/**']));
  write(dir, 'src/a.js', 'l1\r\nl2\r\nl3\r\n'); // multi-line, CRLF
  git(dir, 'add', '-A'); git(dir, 'commit', '-qm', 'base');
  stamp(dir, 'docs/s.md');
  git(dir, 'add', '-A'); git(dir, 'commit', '-qm', 'stamp');
  git(dir, 'checkout', '-qb', 'feature');
  write(dir, 'other.txt', 'v2'); // watched code untouched
  git(dir, 'add', '-A'); git(dir, 'commit', '-qm', 'unrelated');
  assert.strictEqual(run(dir), 0, 'stamp (working tree) and check (HEAD blob) must hash equal despite CRLF/LF');
});

// --- round-4 regression locks ---

test('grammar: inline watches array is accepted by the tool (hook/tool parity)', () => {
  const dir = repo({
    base: d => { write(d, 'docs/s.md', '---' + String.fromCharCode(10) + 'watches: [src/**]' + String.fromCharCode(10) + '---' + String.fromCharCode(10) + 'spec'); write(d, 'src/a.js', 'v1'); },
    change: d => write(d, 'src/a.js', 'v2'),
  });
  assert.strictEqual(run(dir), 1, 'inline [array] form must be seen by the tool -> DRIFT');
});

test('grammar: unindented list items are accepted (hook/tool parity)', () => {
  const NLCH = String.fromCharCode(10);
  const dir = repo({
    base: d => { write(d, 'docs/s.md', '---' + NLCH + 'watches:' + NLCH + '- src/**' + NLCH + '---' + NLCH + 'spec'); write(d, 'src/a.js', 'v1'); },
    change: d => write(d, 'src/a.js', 'v2'),
  });
  assert.strictEqual(run(dir), 1, 'unindented - item must be seen -> DRIFT');
});

// --- round-5: first-day adopter fixes ---

// run WITHOUT --base: exercises the auto-resolution chain
function runAuto(dir) {
  try {
    const out = execFileSync('node', [DRIFT], { cwd: dir, encoding: 'utf8' });
    return { code: 0, out };
  } catch (e) { return { code: e.status ?? 1, out: (e.stdout || '') + (e.stderr || '') }; }
}

test('no --base, local repo with no remote: feature branch resolves against main -> DRIFT', () => {
  const dir = repo({
    base: d => { write(d, 'docs/s.md', spec(['src/**'])); write(d, 'src/a.js', 'v1'); },
    change: d => write(d, 'src/a.js', 'v2'),
  });
  const r = runAuto(dir);
  assert.strictEqual(r.code, 1, 'watched change without spec must DRIFT with auto-resolved base');
});

test('no --base, single-commit repo with no remote: empty-tree diff, co-committed spec+code -> OK', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'drift-'));
  git(dir, 'init', '-q', '-b', 'main');
  write(dir, 'docs/s.md', spec(['src/**']));
  write(dir, 'src/a.js', 'v1');
  git(dir, 'add', '-A'); git(dir, 'commit', '-qm', 'first and only');
  const r = runAuto(dir);
  assert.strictEqual(r.code, 0, 'single-commit repo must not crash (was: fatal on origin/main)');
  assert.match(r.out, /empty tree/, 'should say it resolved to the empty tree');
});

test('no --base, on main with prior commits and no remote: resolves to HEAD~1 -> DRIFT caught', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'drift-'));
  git(dir, 'init', '-q', '-b', 'main');
  write(dir, 'docs/s.md', spec(['src/**']));
  write(dir, 'src/a.js', 'v1');
  git(dir, 'add', '-A'); git(dir, 'commit', '-qm', 'base');
  write(dir, 'src/a.js', 'v2');
  git(dir, 'add', '-A'); git(dir, 'commit', '-qm', 'watched change, no spec');
  const r = runAuto(dir);
  assert.strictEqual(r.code, 1, 'on main with no remote the last commit must still be checked');
});

test('watches: after a leading HTML comment -> loud WARNING naming the file, not a silent miss', () => {
  const NLCH = String.fromCharCode(10);
  const dir = repo({
    base: d => {
      write(d, 'docs/s.md', '<!-- template intro -->' + NLCH + '---' + NLCH + 'watches:' + NLCH + '  - src/**' + NLCH + '---' + NLCH + 'spec');
      write(d, 'src/a.js', 'v1');
    },
    change: d => write(d, 'src/a.js', 'v2'),
  });
  // exits 0 (no valid specs) but must shout about the invisible one on stderr
  const res = require('node:child_process').spawnSync('node', [DRIFT, '--base', 'main'], { cwd: dir, encoding: 'utf8' });
  assert.strictEqual(res.status, 0);
  assert.match(res.stdout + res.stderr, /WARNING: docs\/s\.md has a watches: line/, 'must name the unguarded file');
});

test('watches: example still INSIDE the leading comment (untouched template) stays silent', () => {
  const NLCH = String.fromCharCode(10);
  const dir = repo({
    base: d => {
      write(d, 'docs/s.md', '<!-- add front matter like:' + NLCH + '---' + NLCH + 'watches:' + NLCH + '  - src/**' + NLCH + '---' + NLCH + 'then it is enforced. -->' + NLCH + '# Spec template');
      write(d, 'src/a.js', 'v1');
    },
    change: d => write(d, 'src/a.js', 'v2'),
  });
  const res = require('node:child_process').spawnSync('node', [DRIFT, '--base', 'main'], { cwd: dir, encoding: 'utf8' });
  assert.strictEqual(res.status, 0);
  assert.doesNotMatch(res.stdout + res.stderr, /WARNING/, 'the scaffolded template must not spam the first run');
});

test('SUSPECT is diff-scoped: an innocent PR (untouched watched set) passes', () => {
  const dir = repo({
    base: d => { write(d, 'docs/s.md', spec(['src/**'])); write(d, 'src/a.js', 'v1'); },
    stampSpec: 'docs/s.md',
    change: d => write(d, 'src/a.js', 'v2'),
  });
  // merge the watched change to main WITHOUT re-stamping (repo now in unreviewed state)
  git(dir, 'checkout', '-q', 'main');
  git(dir, 'merge', '-q', 'feature');
  // innocent PR: only a README
  git(dir, 'checkout', '-qb', 'innocent');
  write(dir, 'README.md', 'docs only');
  git(dir, 'add', '-A'); git(dir, 'commit', '-qm', 'readme');
  assert.strictEqual(run(dir), 0, 'diff does not touch the watched set -> no SUSPECT for this PR');
  // but the full-state check still catches it
  const r = (() => { try { execFileSync('node', [DRIFT, '--base', 'main', '--suspect-all'], { cwd: dir, encoding: 'utf8' }); return 0; } catch (e) { return e.status ?? 1; } })();
  assert.strictEqual(r, 1, '--suspect-all sees the stale stamp');
});
