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

function shortHash(specPath) {
  const bytes = fs.readFileSync(specPath); // exact bytes = the version being validated
  return crypto.createHash('sha256').update(bytes).digest('hex').slice(0, 12);
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
function cell(s) {
  return String(s).replace(/\r?\n/g, ' ').replace(/\|/g, '\\|').trim();
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

// find the hash of the LAST logged validation for a slug, scanning raw lines so
// it works regardless of the surrounding table's exact column layout.
function lastLoggedHash(logPath, slug) {
  if (!fs.existsSync(logPath)) return null;
  const text = fs.readFileSync(logPath, 'utf8');
  const re = new RegExp('`' + slug + '`\\s*@\\s*`([0-9a-f]{6,64})`', 'g');
  let m, last = null;
  while ((m = re.exec(text))) last = m[1];
  return last;
}

function countValidations(logPath, slug) {
  if (!fs.existsSync(logPath)) return 0;
  const text = fs.readFileSync(logPath, 'utf8');
  const re = new RegExp('`' + slug + '`\\s*@\\s*`[0-9a-f]{6,64}`', 'g');
  return (text.match(re) || []).length;
}

// --- verify mode ---
if (has('--verify')) {
  const specPath = opt('--verify') || positional();
  if (!specPath) die('cadmo-validate --verify: missing <spec-path>.');
  if (!fs.existsSync(specPath)) die(`cadmo-validate: spec not found: ${specPath}`);

  const slug = specSlug(specPath);
  const current = shortHash(specPath);
  const logPath = resolveLog();
  const logged = lastLoggedHash(logPath, slug);

  if (!logged) {
    console.log(`unvalidated: no approval on record for \`${slug}\` in ${path.relative(process.cwd(), logPath)}`);
    process.exit(2);
  }
  if (logged === current) {
    console.log(`validated: \`${slug}\` still matches the approved content (\`${current}\`).`);
    process.exit(0);
  }
  console.log(`expired: content changed since approval — \`${slug}\` is now \`${current}\`, last approved \`${logged}\`. Re-validate.`);
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
const hash = shortHash(specPath);
const version = '`' + slug + '` @ `' + hash + '`';

// Determinism: the date is an INPUT, never the system clock.
const date = opt('--date') || process.env.CADMO_DATE;

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
  const n = countValidations(logPath, slug); // this validation is the nth for the slug
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
