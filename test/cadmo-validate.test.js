// Behavioral tests for tools/cadmo-validate.mjs — the governed surface gets a
// real harness. Each test runs the CLI against a tmpdir log and asserts the
// row it writes, the verify verdict, and that the tool is deterministic.
const { test } = require('node:test');
const assert = require('node:assert');
const { execFileSync } = require('node:child_process');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const TOOL = path.join(__dirname, '..', 'tools', 'cadmo-validate.mjs');

function tmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'cadmo-val-'));
}
function write(dir, rel, body) {
  const p = path.join(dir, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, body);
  return p;
}
// run the CLI in `dir`; returns { status, stdout, stderr }
function run(dir, ...argv) {
  try {
    const stdout = execFileSync('node', [TOOL, ...argv], { cwd: dir, encoding: 'utf8' });
    return { status: 0, stdout, stderr: '' };
  } catch (e) {
    return { status: e.status ?? 1, stdout: e.stdout ?? '', stderr: e.stderr ?? '' };
  }
}
function shortHash(body) {
  return crypto.createHash('sha256').update(body).digest('hex'); // full sha256 since round-6
}

test('append with --date writes the right hash and all five columns', () => {
  const dir = tmp();
  const body = '# spec\nrule v1\n';
  write(dir, 'cadmo/spec.md', body);

  const r = run(dir, 'cadmo/spec.md', '--by', 'Ana Silva', '--verdict', 'approved', '--date', '2026-06-12', '--notes', 'first sign-off');
  assert.strictEqual(r.status, 0, r.stderr);

  const log = fs.readFileSync(path.join(dir, 'validation-log.md'), 'utf8');
  const rowLine = log.split('\n').find((l) => l.includes('2026-06-12'));
  assert.ok(rowLine, 'a row with the passed-in date must exist');

  const cells = rowLine.split('|').map((c) => c.trim());
  // ['', date, document@version, by, verdict, notes, '']
  assert.strictEqual(cells[1], '2026-06-12');
  assert.strictEqual(cells[2], '`cadmo-spec` @ `' + shortHash(body) + '`');
  assert.strictEqual(cells[3], 'Ana Silva');
  assert.strictEqual(cells[4], '✅ approved');
  assert.strictEqual(cells[5], 'first sign-off');
});

test('prefers governance/validation-log.md when it exists, append-only', () => {
  const dir = tmp();
  write(dir, 'cadmo/spec.md', 'body\n');
  const gov = write(dir, 'governance/validation-log.md',
    '# Validation log\n\n| Date | Document / version | Validated by | Verdict | Notes |\n|---|---|---|---|---|\n| 2026-01-01 | `old` @ `abc123abc123` | X | ✅ approved | seed |\n\n**Verdicts:** …\n');

  const r = run(dir, 'cadmo/spec.md', '--by', 'Y', '--verdict', 'changes', '--date', '2026-02-02');
  assert.strictEqual(r.status, 0, r.stderr);

  const log = fs.readFileSync(gov, 'utf8');
  assert.ok(log.includes('| 2026-01-01 |'), 'existing row must be preserved (append-only)');
  assert.ok(log.includes('| 2026-02-02 |'), 'new row must be added');
  assert.ok(log.includes('🔧 changes requested'), 'verdict label mapped');
  // ./validation-log.md must NOT be created when governance/ one exists
  assert.ok(!fs.existsSync(path.join(dir, 'validation-log.md')));
  // new row lands inside the table, before the trailing legend prose
  const lines = log.split('\n');
  const newRow = lines.findIndex((l) => l.includes('| 2026-02-02 |'));
  const legend = lines.findIndex((l) => l.includes('**Verdicts:**'));
  assert.ok(newRow >= 0 && legend >= 0 && newRow < legend, 'row inserted into the table, prose kept below');
});

test('--verify says validated, then expired after the content changes', () => {
  const dir = tmp();
  const p = write(dir, 'cadmo/spec.md', '# spec\nrule v1\n');
  run(dir, 'cadmo/spec.md', '--by', 'Ana', '--verdict', 'approved', '--date', '2026-06-12');

  const ok = run(dir, '--verify', 'cadmo/spec.md');
  assert.strictEqual(ok.status, 0, ok.stderr);
  assert.match(ok.stdout, /validated/);

  fs.writeFileSync(p, '# spec\nrule v2 CHANGED\n');
  const bad = run(dir, '--verify', 'cadmo/spec.md');
  assert.strictEqual(bad.status, 1);
  assert.match(bad.stdout, /expired: content changed since approval/);
});

test('--verify on an unvalidated spec reports unvalidated (exit 2)', () => {
  const dir = tmp();
  write(dir, 'cadmo/spec.md', 'body\n');
  const r = run(dir, '--verify', 'cadmo/spec.md');
  assert.strictEqual(r.status, 2);
  assert.match(r.stdout, /unvalidated/);
});

test('no date provided → prints the row and writes nothing (exit 3)', () => {
  const dir = tmp();
  write(dir, 'cadmo/spec.md', 'body\n');
  const r = run(dir, 'cadmo/spec.md', '--by', 'Ana', '--verdict', 'approved');
  assert.strictEqual(r.status, 3);
  assert.match(r.stdout, /\| <YYYY-MM-DD> \|/, 'prints a row with a date placeholder');
  assert.ok(!fs.existsSync(path.join(dir, 'validation-log.md')), 'nothing is written without a date');
});

test('CADMO_DATE env is honored (deterministic date input)', () => {
  const dir = tmp();
  write(dir, 'cadmo/spec.md', 'body\n');
  const stdout = execFileSync('node', [TOOL, 'cadmo/spec.md', '--by', 'Ana', '--verdict', 'approved'], {
    cwd: dir, encoding: 'utf8', env: { ...process.env, CADMO_DATE: '2026-09-09' },
  });
  assert.match(stdout, /recorded:/);
  const log = fs.readFileSync(path.join(dir, 'validation-log.md'), 'utf8');
  assert.ok(log.includes('| 2026-09-09 |'));
});

test('--tag prints the signed-tag command with the nth number and HEAD commit', () => {
  const dir = tmp();
  const env = { ...process.env, GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@t', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@t' };
  const git = (...a) => execFileSync('git', a, { cwd: dir, env });
  git('init', '-q', '-b', 'main');
  write(dir, 'cadmo/spec.md', 'body\n');
  git('add', '-A'); git('commit', '-qm', 'base');
  const head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: dir, encoding: 'utf8' }).trim();

  const r = execFileSync('node', [TOOL, 'cadmo/spec.md', '--by', 'Ana', '--verdict', 'approved', '--date', '2026-06-12', '--tag'], {
    cwd: dir, encoding: 'utf8', env,
  });
  assert.match(r, new RegExp('git tag -s validated/cadmo-spec/1 ' + head));
});

test('the tool is deterministic — no Date.now / new Date / Math.random in source', () => {
  const src = fs.readFileSync(TOOL, 'utf8');
  assert.doesNotMatch(src, /Date\.now/, 'must not call Date.now()');
  assert.doesNotMatch(src, /new Date/, 'must not construct a Date');
  assert.doesNotMatch(src, /Math\.random/, 'must not use Math.random()');
});

// round-4 regression lock: free text in Notes can never masquerade as a validation
test('a note citing another spec does not poison --verify (hash parsed from the version column only)', () => {
  const dir = tmp();
  write(dir, 'spec-billing.md', 'billing rules v1');
  write(dir, 'other.md', 'other spec');
  // properly validate spec-billing
  const r1 = run(dir, 'spec-billing.md', '--by', 'Ana', '--verdict', 'approved', '--date', '2026-01-01');
  assert.strictEqual(r1.status, 0);
  // validate other.md with a NOTE that cites spec-billing @ a bogus hash
  const BT = String.fromCharCode(96);
  const bogus = 'supersedes ' + BT + 'spec-billing' + BT + ' @ ' + BT + 'aaaaaaaaaaaa' + BT;
  const r2 = run(dir, 'other.md', '--by', 'Ana', '--verdict', 'approved', '--date', '2026-01-02', '--notes', bogus);
  assert.strictEqual(r2.status, 0);
  // spec-billing untouched: --verify must still say VALIDATED (exit 0), not expired
  const v = run(dir, '--verify', 'spec-billing.md');
  assert.strictEqual(v.status, 0, 'note text must not become spec-billing latest validation');
});

// --- round-6 regression locks (external audit findings) ---

test('a rejected verdict is NOT an approval: verify exits 2 after changes-requested', () => {
  const dir = tmp();
  write(dir, 'cadmo/spec.md', '# spec\nrule v1\n');
  const r1 = run(dir, 'cadmo/spec.md', '--by', 'Client', '--verdict', 'approved', '--date', '2026-07-01');
  assert.strictEqual(r1.status, 0);
  // client later rejects the SAME content
  const r2 = run(dir, 'cadmo/spec.md', '--by', 'Client', '--verdict', 'changes', '--date', '2026-07-02');
  assert.strictEqual(r2.status, 0);
  const v = run(dir, '--verify', 'cadmo/spec.md');
  assert.strictEqual(v.status, 2, 'latest verdict is changes-requested — there is no standing approval');
  assert.match(v.stdout, /not an approval/);
});

test('changes-requested with NO prior approval never verifies (the original round-6 repro)', () => {
  const dir = tmp();
  write(dir, 'cadmo/spec.md', '# spec\nrule v1\n');
  run(dir, 'cadmo/spec.md', '--by', 'Client', '--verdict', 'changes', '--date', '2026-07-01');
  const v = run(dir, '--verify', 'cadmo/spec.md');
  assert.strictEqual(v.status, 2, 'a rejected spec must not read as validated');
});

test('an invalid date is refused and writes nothing', () => {
  const dir = tmp();
  write(dir, 'cadmo/spec.md', '# spec\n');
  const r = run(dir, 'cadmo/spec.md', '--by', 'C', '--verdict', 'approved', '--date', '2026|07|10');
  assert.notStrictEqual(r.status, 0);
  assert.ok(!fs.existsSync(path.join(dir, 'validation-log.md')), 'malformed date must not corrupt the table');
});

test('legacy 12-char hashes in old logs still verify (prefix compatibility)', () => {
  const dir = tmp();
  const body = '# spec\nrule v1\n';
  write(dir, 'cadmo/spec.md', body);
  const full = shortHash(body);
  const legacy = full.slice(0, 12);
  write(dir, 'validation-log.md',
    '| Date | Document / version | Validated by | Verdict | Notes |\n|---|---|---|---|---|\n' +
    '| 2026-07-01 | `cadmo-spec` @ `' + legacy + '` | Client | ✅ approved | — |\n');
  const v = run(dir, '--verify', 'cadmo/spec.md');
  assert.strictEqual(v.status, 0, 'a pre-round-6 12-char row must still count as the approval');
});
