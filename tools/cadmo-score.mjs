#!/usr/bin/env node
/*
 * cadmo-score — the maturity ladder (docs/maturity.md) turned into a ruler.
 * Runs ~11 local, best-effort checks and reports where a repo sits on the 0–4
 * ladder: the GAPS and the single next rung first, the number last — a map, not
 * a vanity score. A missing file is a gap, never a crash.
 *
 * No dependencies. Usage:
 *   node cadmo-score.mjs [--dir .] [--json]
 *
 * Config (optional, cadmo.json at the repo root): reads `targetLevel` to mark
 * the goal and set the exit code (below target → exit 1, so CI can gate on it).
 */
import fs from 'node:fs';
import { parseWatches as grammarWatches } from './cadmo-grammar.mjs';
import path from 'node:path';

const args = process.argv.slice(2);
const has = (flag) => args.includes(flag);
function opt(name, fallback) {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
}
const ROOT = path.resolve(opt('--dir', '.'));
const JSON_OUT = has('--json');

// --- safe fs helpers (a missing thing is a gap, not an error) ---
function read(rel) {
  try { return fs.readFileSync(path.join(ROOT, rel), 'utf8'); } catch { return ''; }
}
function exists(rel) {
  try { fs.accessSync(path.join(ROOT, rel)); return true; } catch { return false; }
}
function walk(dir) {
  // repo-relative POSIX paths, skipping .git and node_modules (kept .github etc.)
  const out = [];
  let entries;
  try { entries = fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }); }
  catch { return out; }
  for (const e of entries) {
    if (e.name === '.git' || e.name === 'node_modules') continue;
    const rel = dir ? `${dir}/${e.name}` : e.name;
    if (e.isDirectory()) out.push(...walk(rel));
    else out.push(rel);
  }
  return out;
}
const ALL = walk('');
const MD = ALL.filter((f) => f.endsWith('.md'));
const someMd = (re) => MD.some((f) => re.test(read(f)));
const someFile = (re) => ALL.some((f) => re.test(f));

// --- config anchor (cadmo.json) ---
let config = {};
try { config = JSON.parse(read('cadmo.json') || '{}'); } catch { config = {}; }
const target = Number.isInteger(config.targetLevel) ? config.targetLevel : null;

// --- level 1: the map and its blanks ---
const mapFile = ['AGENTS.md', 'CLAUDE.md'].find(exists) || null;
const mapText = mapFile ? read(mapFile) : '';

// Unfilled scaffold placeholders look like <project name>, <path>, <command>.
// EARS example tokens (<trigger>/<behavior>) are the method's own grammar for
// writing acceptance criteria, not blanks to fill — so they don't count.
const EARS = new Set(['trigger', 'behavior', 'behaviour', 'condition', 'response', 'system']);
const HTML_TAGS = new Set(['a', 'b', 'i', 'p', 'br', 'hr', 'em', 'ul', 'ol', 'li', 'h1', 'h2', 'h3',
  'h4', 'h5', 'h6', 'div', 'span', 'sub', 'sup', 'pre', 'code', 'img', 'table', 'thead', 'tbody', 'tr',
  'td', 'th', 'strong', 'details', 'summary', 'blockquote', 'kbd', 'small', 'figure', 'figcaption',
  'picture', 'source', 'video', 'nav', 'section', 'article', 'header', 'footer', 'mark', 'del', 'ins']);
function unfilledPlaceholders(text) {
  const found = new Set();
  // Any-case <token> is a blank to fill EXCEPT the method's EARS grammar (<trigger>/<behavior>)
  // and HTML tags (<div>, </sub>, <a href="…">). Best-effort local heuristic.
  for (const m of text.matchAll(/<([^>\n]+)>/g)) {
    const inner = m[1].trim();
    if (inner.includes('=')) continue;                     // HTML attribute, e.g. <a href="…">
    const head = inner.toLowerCase().replace(/^\//, '').split(/[\s:/]/)[0];
    if (EARS.has(head) || HTML_TAGS.has(head)) continue;
    found.add(m[0]);
  }
  return [...found];
}
const blanks = mapFile ? unfilledPlaceholders(mapText) : [];

// --- level 3: a spec that actually declares watches: (same rule as spec-drift) ---
function hasWatches(text) {
  const w = grammarWatches(text);
  return !!(w && w.length);
}

// --- level 3: a CI workflow that runs a test suite ---
function ciRunsTests() {
  const workflows = ALL.filter((f) => /^\.github\/workflows\/[^/]+\.ya?ml$/i.test(f));
  const RUNNER = /node --test|npm (run )?test|pnpm(?: run)? test|yarn test|\bpytest\b|\bjest\b|\bvitest\b|go test|cargo test|mvn test|gradle test|\brspec\b|phpunit|dotnet test|\bctest\b/i;
  return workflows.some((f) => RUNNER.test(read(f)));
}

// --- the checks, grouped by the rung they belong to ---
const CHECKS = [
  // Level 1 — Mapped
  { id: 'map-exists', level: 1, ok: !!mapFile,
    okMsg: mapFile ? `found ${mapFile}` : '',
    gap: 'no AGENTS.md or CLAUDE.md — the AI starts every session blind' },
  { id: 'map-filled', level: 1, ok: !!mapFile && blanks.length === 0,
    okMsg: 'no unfilled placeholders in the map',
    gap: mapFile ? `${blanks.length} placeholder(s) left in ${mapFile}: ${blanks.slice(0, 3).join(', ')}` : 'no map to fill' },

  // Level 2 — Gated
  { id: 'value-gate', level: 2, ok: someFile(/(^|\/)[^/]*value-gate[^/]*\.md$/i),
    okMsg: 'value-gate template/artifact present',
    gap: 'no value-gate artifact — work starts without a business case' },
  { id: 'acceptance-plan', level: 2, ok: someFile(/(^|\/)plan\.md$/i) || someMd(/acceptance criteria/i),
    okMsg: 'plan / acceptance-criteria template present',
    gap: 'no plan or acceptance-criteria template — criteria come after the code' },
  { id: 'definition-of-done', level: 2, ok: /definition of done/i.test(mapText),
    okMsg: 'definition of done stated in the map',
    gap: '"definition of done" not stated in the map (AGENTS.md/CLAUDE.md)' },

  // Level 3 — Enforced
  { id: 'ci-tests', level: 3, ok: ciRunsTests(),
    okMsg: 'a CI workflow runs tests',
    gap: 'no CI workflow runs tests (.github/workflows)' },
  { id: 'spec-drift-guard', level: 3, ok: someFile(/spec-drift/i),
    okMsg: 'spec-drift guard present',
    gap: 'no spec-drift guard — code and specs can silently diverge' },
  { id: 'spec-watches', level: 3, ok: MD.some((f) => hasWatches(read(f))),
    okMsg: 'a spec declares a watches: front matter',
    gap: 'no spec declares a `watches:` front matter — nothing is actually enforced' },
  { id: 'staging', level: 3, ok: !!(config.stagingUrl && config.stagingUrl.trim()) || someMd(/\bstaging\b/i),
    okMsg: config.stagingUrl && config.stagingUrl.trim() ? 'staging URL set in cadmo.json' : 'staging is referenced',
    gap: 'staging not mentioned — set stagingUrl in cadmo.json or reference it in the map' },

  // Level 4 — Governed
  { id: 'validation-log', level: 4, ok: someFile(/(^|\/)[^/]*validation-log[^/]*\.md$/i),
    okMsg: 'validation log present',
    gap: 'no validation log — client sign-off leaves no versioned trail' },
  { id: 'evals', level: 4, ok: someMd(/\beval(s|uations?)?\b/i),
    okMsg: 'evals are referenced',
    gap: 'evals not mentioned — AI features would ship on "looks good"' },
];
const detailOf = (c) => (c.ok ? c.okMsg : c.gap);

const LEVELS = [
  { n: 0, name: 'Vibe',     buys: 'nothing is written down — fast until it is not' },
  { n: 1, name: 'Mapped',   buys: 'any new AI session is productive from the first message' },
  { n: 2, name: 'Gated',    buys: '"done" means tested; plans gated; untested parts said out loud' },
  { n: 3, name: 'Enforced', buys: 'the rules stop depending on discipline — CI enforces them' },
  { n: 4, name: 'Governed', buys: 'an auditor could reconstruct why anything exists' },
];
const checksFor = (n) => CHECKS.filter((c) => c.level === n);

// A rung counts only if every check on it — and on every rung below — passes.
let level = 0;
for (let n = 1; n <= 4; n++) {
  if (checksFor(n).every((c) => c.ok)) level = n; else break;
}
const nextRung = level < 4 ? LEVELS[level + 1] : null;
const gaps = nextRung ? checksFor(nextRung.n).filter((c) => !c.ok) : [];

// --- practice hints: this tool measures ARTIFACT PRESENCE, not lived practice.
// Six file-touches can produce level-4 artifacts (round-4 review demo). These cheap
// signals warn when the artifacts look unexercised - they never gate.
const practiceHints = [];
if (!exists('.git')) practiceHints.push('not a git repository - no history, so no practice trail at all');
{
  const vlog = ALL.find((f) => f.toLowerCase().includes('validation-log') && f.endsWith('.md'));
  if (vlog) {
    const NLCH = String.fromCharCode(10);
    const rows = read(vlog).split(NLCH).map((l) => l.trim())
      .filter((l) => l.startsWith('|') && l.endsWith('|'))
      .filter((l) => {
        if (l.toLowerCase().includes('| date')) return false; // header row
        const inner = l.slice(1, -1).split('|').join('').trim();
        if (inner.length && [...inner].every((ch) => '-: '.includes(ch))) return false; // separator
        return inner.length > 0;
      });
    if (rows.length === 0) practiceHints.push('validation log has no recorded rows - present but never used');
  }
}

if (JSON_OUT) {
  console.log(JSON.stringify({
    cadmo: config.cadmo ?? null,
    dir: ROOT,
    level,
    levelName: LEVELS[level].name,
    measures: 'artifact presence — practice is proven by the trail, not by this tool',
    practiceHints,
    target,
    targetMet: target === null ? null : level >= target,
    nextRung: nextRung ? { level: nextRung.n, name: nextRung.name, buys: nextRung.buys } : null,
    gaps: gaps.map((c) => ({ id: c.id, level: c.level, label: c.gap })),
    checks: CHECKS.map((c) => ({ id: c.id, level: c.level, ok: c.ok, detail: detailOf(c) })),
  }, null, 2));
} else {
  const L = (n) => `${n} ${LEVELS[n].name}`;
  const lines = [];
  lines.push(`Cadmo maturity · ${path.basename(ROOT)}  (best-effort, local)`);
  lines.push('');
  if (nextRung) {
    lines.push(`▸ Next rung: ${L(nextRung.n)} — ${nextRung.buys}`);
    lines.push('  Gaps to reach it:');
    for (const c of gaps) lines.push(`    ✗ ${c.id} — ${c.gap}`);
  } else {
    lines.push('▸ Top-rung ARTIFACTS present (4 Governed). This ruler measures presence, not practice — the trail (real validation rows, gate verdicts, CI history) is what proves the practice.');
  }
  lines.push('');
  const tgt = target === null ? '' : level >= target ? `   ·   target ${target} met ✓` : `   ·   target ${target}`;
  lines.push(`Artifact level: ${L(level)}${tgt}   (practice: not verified by this tool)`);
  for (const h of practiceHints) lines.push(`  ⚠ practice: ${h}`);
  lines.push('');
  for (let n = 1; n <= 4; n++) {
    const rung = checksFor(n);
    const passed = rung.every((c) => c.ok);
    const isNext = nextRung && n === nextRung.n;
    const mark = passed ? '✓' : isNext ? '→' : ' ';
    const miss = passed ? '' : `   ← ${rung.filter((c) => !c.ok).length} gap(s)`;
    lines.push(`  [${mark}] ${L(n)}${miss}`);
  }
  lines.push('');
  lines.push('  Run with --json for machine output.');
  console.log(lines.join('\n'));
}

// Below target is a fail the CI can gate on; otherwise a clean report.
process.exit(target !== null && level < target ? 1 : 0);
