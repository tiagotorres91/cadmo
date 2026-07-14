#!/usr/bin/env node
/*
 * cadmo-validate — the level-4 (Governed) surface, made buildable.
 *
 * An approval is only meaningful against the *exact text* that was approved.
 * This tool pins a validation to the content it validated (a sha256 of the
 * spec's current bytes) and appends one append-only row to a markdown log.
 * Later, `--verify` tells you whether the spec still matches the last thing
 * someone signed off on — or whether it has drifted since ("expired").
 *
 * No dependencies. node: builtins only. Deterministic by construction:
 * it never invents a date (see "Determinism" below) and never runs the git tag
 * command — tagging and signing are the human's gate.
 *
 * Usage:
 *   node cadmo-validate.mjs <spec-path> --by "<name>" --verdict approved|changes|revalidate
 *                           [--date YYYY-MM-DD] [--notes "…"] [--tag]
 *   node cadmo-validate.mjs --verify <spec-path>
 *
 * Where the row lands:
 *   governance/validation-log.md if it exists, else ./validation-log.md (created on demand).
 *   Append-only — a past row is never edited; a changed document earns a NEW row.
 *
 * Determinism (why the date is an input, not the clock):
 *   Cadmo tooling must be reproducible, so the tool refuses to fabricate a
 *   timestamp. Pass the date in with --date, or set CADMO_DATE in the env.
 *   With neither, it prints the row (date as a placeholder) and stops, so a
 *   human supplies the date — nothing is written on a guess.
 *
 * Hardness levels of a validation (softest → strongest):
 *   N1 — PR approval.        A reviewer approves the change; the record is the merge.
 *   N2 — signed git tag.     `--tag` prints `git tag -s validated/<slug>/<n> <commit>`;
 *                            you run it. A GPG/SSH-signed tag cryptographically pins
 *                            the approved commit. This tool prints — it never tags.
 *   N3 — gitsign + Rekor.    Keyless Sigstore signing with a public transparency log.
 *                            EXTERNAL and OPTIONAL — not implemented here. The `--tag`
 *                            line is the hook: swap `git tag -s` for a gitsign flow and
 *                            record the Rekor entry. Cadmo does not depend on it.
 */
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const VERDICTS = {
  approved: '✅ approved',
  changes: '🔧 changes requested',
  revalidate: '🔁 re-validate',
};

const args = process.argv.slice(2);

function opt(name) {
  // take the next arg as the value regardless of a leading '--' — a legitimate value
  // may start with dashes (e.g. --notes "--see PR 5"); positional() consumes the pair.
  const i = args.indexOf(name);
  return i >= 0 && i + 1 < args.length ? args[i + 1] : undefined;
}
function has(name) {
  return args.includes(name);
}
function positional() {
  // first bare arg that isn't a flag or a flag's value
  const consumed = new Set();
  for (const name of ['--by', '--verdict', '--date', '--notes', '--verify']) {
    const i = args.indexOf(name);
    if (i >= 0) { consumed.add(i); consumed.add(i + 1); }
  }
  for (let i = 0; i < args.length; i++) {
    if (consumed.has(i) || args[i].startsWith('--')) continue;
    return args[i];
  }
  return undefined;
}

function die(msg, code = 2) {
  console.error(msg);
  process.exit(code);
}

if (has('--help') || has('-h') || args.length === 0) {
  console.log(`
  cadmo-validate — pin an approval to the exact content it validated.

  Record a validation:
    node cadmo-validate.mjs <spec-path> --by "<name>" --verdict approved|changes|revalidate
                            [--date YYYY-MM-DD] [--notes "…"] [--tag]

  Check a spec against its last approval:
    node cadmo-validate.mjs --verify <spec-path>
        exit 0  validated   — content still matches the last logged hash
        exit 1  expired      — content changed since approval; needs re-validation
        exit 2  unvalidated  — no approval on record for this spec

  The date is passed IN, never invented (deterministic tooling): use --date or CADMO_DATE.
  --tag prints the git tag command for the human to run — this tool never tags or signs.

  Hardness: N1 PR-approval · N2 signed tag (--tag) · N3 gitsign+Rekor (external, optional).
`);
  process.exit(0);
}

// slug: stable per spec PATH, filesystem-safe, so two specs named spec.md in
// different folders don't collide, and it can live inside a git tag ref.
function specSlug(specPath) {
  const rel = path.relative(process.cwd(), path.resolve(specPath)) || path.basename(specPath);
  return rel
    .replace(/\.md$/i, '')
    .split(path.sep).join('/')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'spec';
}

function fullHash(specPath) {
  const bytes = fs.readFileSync(specPath); // exact bytes = the version being validated
  // FULL sha256 in the log: this is an audit surface — 48 bits was enough against
  // accident, not against a surface presented as governance (round-6 finding).
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

function resolveLog() {
  const gov = path.resolve('governance', 'validation-log.md');
  if (fs.existsSync(gov)) return gov;
  return path.resolve('validation-log.md');
}

const NEW_LOG_HEADER = `# Validation log

The level-4 (Governed) surface: the client's acceptance recorded against the *exact version*.
Append-only — never edit a past row; a changed document gets a new row.

| Date | Document / version | Validated by | Verdict | Notes |
|---|---|---|---|---|

**Verdicts:** ✅ approved · 🔧 changes requested · 🔁 re-validate.
`;

// escape free-text for a markdown table cell (pipes break the table; newlines break the row)
// Backticks are stripped so a note can never mimic the Document/version cell format
// and poison --verify (round-4 finding: a note citing another spec became its
// "latest validation").
function cell(s) {
  return String(s).replace(/\r?\n/g, ' ').replace(/\|/g, '\\|').split(String.fromCharCode(96)).join('').trim();
}

// Insert the row into the VALIDATIONS table specifically — identified by a header
// row that names the "Verdict" column followed by a separator. This skips any other
// table above it (a summary/legend), which would otherwise silently capture the row.
// EOL is normalized to LF on write (avoids CRLF/LF mixing).
function appendRow(logPath, row) {
  const text = fs.existsSync(logPath) ? fs.readFileSync(logPath, 'utf8') : NEW_LOG_HEADER;
  const lines = text.split(/\r?\n/);
  let headerIdx = -1;
  for (let i = 0; i < lines.length - 1; i++) {
    if (lines[i].includes('|') && /\bverdict\b/i.test(lines[i]) &&
        /^\s*\|?\s*:?-{3,}/.test(lines[i + 1]) && lines[i + 1].includes('|')) {
      headerIdx = i; break;
    }
  }
  if (headerIdx < 0) {
    // no validations table — append a fresh one at the end
    const base = text.replace(/\r\n?/g, '\n');
    const glue = base.endsWith('\n') ? '' : '\n';
    fs.writeFileSync(logPath, base + glue + '\n| Date | Document / version | Validated by | Verdict | Notes |\n|---|---|---|---|---|\n' + row + '\n');
    return;
  }
  let insertAt = headerIdx + 2; // after the header row and its separator
  while (insertAt < lines.length && /^\s*\|/.test(lines[insertAt])) insertAt++;
  lines.splice(insertAt, 0, row);
  fs.writeFileSync(logPath, lines.join('\n'));
}

// scan the log for every entry of a slug — hash AND verdict, because an entry is
// only an APPROVAL if its Verdict column says so: a logged "changes requested"
// must never verify as an approval (round-6 finding — the previous code collected
// hashes from every verdict and treated the last one as the approved content).
// Scan ONLY the Document/version column (2nd cell) for the hash - free text in the
// Notes column can no longer masquerade as a validation (round-4 fix).
function loggedEntries(logPath, slug) {
  if (!fs.existsSync(logPath)) return [];
  const NLCH = String.fromCharCode(10);
  const BTCH = String.fromCharCode(96);
  const out = [];
  for (const line of fs.readFileSync(logPath, 'utf8').split(NLCH)) {
    const s = line.trim();
    if (!s.startsWith('|')) continue;
    const cells = s.slice(1).split('|').map((c) => c.trim());
    if (cells.length < 2) continue;
    const doc = cells[1]; // Document / version column
    const want = BTCH + slug + BTCH;
    if (!doc.startsWith(want)) continue;
    const at = doc.indexOf('@');
    if (at < 0) continue;
    const h = doc.slice(at + 1).split(BTCH).join('').trim();
    if (!/^[0-9a-f]{6,64}$/.test(h)) continue;
    const verdict = cells.length > 3 ? cells[3] : '';
    out.push({ hash: h, approved: /approved/i.test(verdict) && !/changes/i.test(verdict) });
  }
  return out;
}

// older rows logged 12-char hashes; new rows log the full sha256 — compare by prefix
function hashesMatch(a, b) {
  return a.length <= b.length ? b.startsWith(a) : a.startsWith(b);
}

function countApprovals(logPath, slug) {
  return loggedEntries(logPath, slug).filter((e) => e.approved).length;
}

// --- verify mode ---
if (has('--verify')) {
  const specPath = opt('--verify') || positional();
  if (!specPath) die('cadmo-validate --verify: missing <spec-path>.');
  if (!fs.existsSync(specPath)) die(`cadmo-validate: spec not found: ${specPath}`);

  const slug = specSlug(specPath);
  const current = fullHash(specPath);
  const logPath = resolveLog();
  const entries = loggedEntries(logPath, slug);

  if (!entries.length) {
    console.log(`unvalidated: no approval on record for \`${slug}\` in ${path.relative(process.cwd(), logPath)}`);
    process.exit(2);
  }
  // the LATEST entry decides the standing state: a "changes requested" logged after
  // an approval means there is no approval in force right now.
  const latest = entries[entries.length - 1];
  if (!latest.approved) {
    console.log(`unvalidated: the latest logged verdict for \`${slug}\` is not an approval — the spec has no standing approval. Re-validate.`);
    process.exit(2);
  }
  if (hashesMatch(latest.hash, current)) {
    console.log(`validated: \`${slug}\` still matches the approved content (\`${current.slice(0, 12)}…\`).`);
    process.exit(0);
  }
  console.log(`expired: content changed since approval — \`${slug}\` is now \`${current.slice(0, 12)}…\`, last approved \`${latest.hash.slice(0, 12)}…\`. Re-validate.`);
  process.exit(1);
}

// --- record mode ---
const specPath = positional();
if (!specPath) die('cadmo-validate: missing <spec-path>. See --help.');
if (!fs.existsSync(specPath)) die(`cadmo-validate: spec not found: ${specPath}`);

const by = opt('--by');
const verdictKey = opt('--verdict');
if (!by) die('cadmo-validate: --by "<name>" is required (who validated).');
if (!verdictKey) die('cadmo-validate: --verdict approved|changes|revalidate is required.');
const verdictLabel = VERDICTS[verdictKey];
if (!verdictLabel) die(`cadmo-validate: unknown --verdict "${verdictKey}". Use: ${Object.keys(VERDICTS).join(' | ')}.`);

const notes = opt('--notes') || '—';
const slug = specSlug(specPath);
const hash = fullHash(specPath);
const version = '`' + slug + '` @ `' + hash + '`';

// Determinism: the date is an INPUT, never the system clock.
const date = opt('--date') || process.env.CADMO_DATE;

// a malformed date (e.g. with pipes) would silently corrupt the markdown table
if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
  die(`cadmo-validate: invalid date "${date}" — the format is YYYY-MM-DD, nothing else enters the log.`);
}

if (!date) {
  const row = `| <YYYY-MM-DD> | ${version} | ${cell(by)} | ${verdictLabel} | ${cell(notes)} |`;
  console.error('cadmo-validate: no date given — this tooling is deterministic and will not invent one.');
  console.error('Re-run with --date YYYY-MM-DD (or set CADMO_DATE), or add this row yourself:\n');
  console.log(row);
  process.exit(3);
}

const logPath = resolveLog();
const row = `| ${cell(date)} | ${version} | ${cell(by)} | ${verdictLabel} | ${cell(notes)} |`;
appendRow(logPath, row);
console.log(`recorded: ${row}`);
console.log(`         → ${path.relative(process.cwd(), logPath)}`);

if (has('--tag')) {
  const n = countApprovals(logPath, slug); // this approval is the nth for the slug
  let commit = '<commit>';
  try {
    commit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  } catch {
    // not a git repo, or git absent — leave the placeholder for the human to fill
  }
  console.log('\nN2 (signed tag) — run this yourself; signing is your gate, not the tool\'s:');
  console.log(`  git tag -s validated/${slug}/${n} ${commit}`);
  console.log('  (N3: swap the signed tag for a gitsign flow + Rekor entry — external, optional.)');
}
