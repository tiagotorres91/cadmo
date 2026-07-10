#!/usr/bin/env node
/*
 * spec-drift — the rule that keeps documentation honest.
 *
 * Two layers, both zero-dependency:
 *
 *   DRIFT (v1): a spec declares which files implement it (`watches:`); if those
 *   files change in the diff and the spec doesn't change in the same diff → DRIFT.
 *   Cheap, but shallow: co-change in a diff proves the spec was TOUCHED, not that
 *   its content is still TRUE.
 *
 *   SUSPECT (v2, opt-in): a "reviewed-state" layer. `--stamp <spec>` records a
 *   sha256 over the current content of the spec's watched files as `reviewed: <hash>`
 *   — a human affirming "I re-read this code and this spec is still true." The check
 *   recomputes that hash; a mismatch reports SUSPECT even if the spec was edited.
 *   Honesty note: the hash proves bytes unchanged, not semantic truth — a human
 *   still has to actually re-read before re-stamping. The full-length sha256 is
 *   an honesty marker, not an adversarial control: for adversarial assurance use
 *   signed tags / Sigstore (see cadmo-validate's N2/N3 levels).
 *
 * SUSPECT scoping ("checks activate by surface touched"): by default, SUSPECT only
 * fires for specs whose WATCHED SET intersects the current diff — an innocent
 * README-only PR must not fail CI for a stamp a previous merge skipped. Use
 * `--suspect-all` for the full repo-state check (push-to-main / scheduled runs).
 *
 * A spec WITHOUT a `reviewed:` key gets the DRIFT check only — SUSPECT is opt-in
 * (right-sizing: pay the re-read discipline only where it earns its keep).
 *
 * Grammar (front matter forms, glob semantics) lives in ./cadmo-grammar.mjs —
 * the SINGLE grammar shared by spec-drift, cadmo-score and the plugin hook.
 *
 * Usage:
 *   node spec-drift.mjs [--base <ref>] [--dir .] [--suspect-all]
 *   node spec-drift.mjs --stamp <spec.md> [--dir .]
 *
 * With no --base, the first existing ref wins: origin/main → main (when you're
 * on a different branch) → HEAD~1 → the empty tree (single-commit repo: the
 * whole initial commit is the diff). A solo repo with no remote just works.
 *
 * Escape hatch (audited, not silent): if a change genuinely doesn't alter any
 * documented rule, say so where reviewers can see it — the shipped workflow
 * honors "spec-drift: skip — <reason>" in the PR body (pull_request runs) or
 * in the latest commit message (push runs).
 */
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { frontMatter, parseWatches as watchesOf, parseReviewed as reviewedOf, globToRegex } from './cadmo-grammar.mjs';

const BS = String.fromCharCode(92);
const args = process.argv.slice(2);
function opt(name, fallback) {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
}
const ROOT = path.resolve(opt('--dir', '.'));
// sha of git's empty tree — diffing against it means "everything is new"
const EMPTY_TREE = '4b825dc642cb6eb9a060e54bf8d69288fbee4904';
function refExists(ref) {
  try {
    execFileSync('git', ['rev-parse', '--verify', '--quiet', `${ref}^{commit}`], { cwd: ROOT, stdio: ['ignore', 'ignore', 'ignore'] });
    return true;
  } catch { return false; }
}
function resolveBase() {
  if (refExists('origin/main')) return 'origin/main';
  let branch = '';
  try {
    branch = execFileSync('git', ['symbolic-ref', '--short', 'HEAD'], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch { /* detached HEAD */ }
  if (branch !== 'main' && refExists('main')) return 'main';
  if (refExists('HEAD~1')) return 'HEAD~1';
  return EMPTY_TREE;
}
const BASE_GIVEN = opt('--base', null);
const BASE = BASE_GIVEN || resolveBase();
const STAMP = opt('--stamp', null);
const SUSPECT_ALL = args.includes('--suspect-all');
if (args.includes('--stamp') && !STAMP) {
  console.error('spec-drift --stamp: missing <spec.md> argument.');
  process.exit(2);
}

// --- collect specs that declare `watches:` in front matter ---
function* mdFiles(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || e.name === 'node_modules') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* mdFiles(p);
    else if (e.name.endsWith('.md')) yield p;
  }
}

const readSpec = (file) => fs.readFileSync(file, 'utf8');

// Add or update a top-level `reviewed:` key, preserving everything else
// (including the file's EOL style — a CRLF file must not gain a lone LF line).
function setReviewed(text, hash) {
  const eol = text.includes('\r\n') ? '\r\n' : '\n';
  const parsed = frontMatter(text);
  const rest = text.slice(parsed.end); // '\n---' … onwards
  let lines = parsed.fm.split(/\r?\n/);
  let found = false;
  lines = lines.map((l) => {
    if (/^reviewed:\s*/.test(l)) { found = true; return `reviewed: ${hash}`; }
    return l;
  });
  if (!found) {
    if (lines.length && lines[lines.length - 1] === '') lines[lines.length - 1] = `reviewed: ${hash}`;
    else lines.push(`reviewed: ${hash}`);
  }
  return '---' + lines.join(eol) + rest;
}

// --- reviewed-state hashing ---
// Line endings are normalized so a CRLF working tree (git autocrlf) and the
// LF-stored HEAD blob hash identically. Watched files are text source.
function norm(buf) {
  return buf.toString('utf8').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

function matched(watches, files) {
  const regexes = watches.map(globToRegex);
  return files.filter((f) => regexes.some((r) => r.test(f))).sort();
}

function hashWatchedDisk(watches) {
  const tracked = execFileSync('git', ['ls-files'], { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean);
  const h = crypto.createHash('sha256');
  for (const f of matched(watches, tracked)) {
    h.update(f); h.update('\n');
    h.update(norm(fs.readFileSync(path.join(ROOT, f))));
  }
  return h.digest('hex');
}

function hashWatchedHead(watches) {
  const tracked = execFileSync('git', ['ls-tree', '-r', 'HEAD', '--name-only'], { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean);
  const h = crypto.createHash('sha256');
  for (const f of matched(watches, tracked)) {
    h.update(f); h.update('\n');
    h.update(norm(execFileSync('git', ['show', `HEAD:${f}`], { cwd: ROOT })));
  }
  return h.digest('hex');
}

// --- --stamp mode: re-affirm a spec after re-reading its watched files ---
if (STAMP) {
  const specPath = path.resolve(ROOT, STAMP);
  if (!fs.existsSync(specPath)) {
    console.error(`spec-drift --stamp: no such spec: ${STAMP}`);
    process.exit(2);
  }
  const watches = watchesOf(readSpec(specPath));
  if (!watches) {
    console.error(`spec-drift --stamp: ${STAMP} has no \`watches:\` front matter — nothing to stamp.`);
    process.exit(2);
  }
  const hash = hashWatchedDisk(watches);
  // Footgun guard: stamping uncommitted content records a hash HEAD can never match.
  try {
    const head = hashWatchedHead(watches);
    if (head !== hash) {
      console.error('spec-drift --stamp: WARNING — watched files differ between working tree and HEAD; you are stamping UNCOMMITTED content. Commit the watched changes (or stamp after committing) or the check will report SUSPECT.');
    }
  } catch { /* no HEAD yet (fresh repo) — nothing to compare */ }
  fs.writeFileSync(specPath, setReviewed(readSpec(specPath), hash));
  console.log(`spec-drift: stamped ${STAMP} — reviewed: ${hash}`);
  process.exit(0);
}

// --- changed files vs base ---
// The empty tree has no merge base, so it gets a two-dot diff; refs get three-dot.
const RANGE = BASE === EMPTY_TREE ? [BASE, 'HEAD'] : [`${BASE}...HEAD`];
let changed;
try {
  changed = execFileSync('git', ['diff', '--name-only', ...RANGE], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
    .split('\n').filter(Boolean);
  if (!BASE_GIVEN) {
    console.log(`spec-drift: no --base given — diffing against ${BASE === EMPTY_TREE ? 'the empty tree (single-commit repo: the whole initial commit)' : BASE}.`);
  }
} catch (e) {
  const detail = (e.stderr ? e.stderr.toString() : e.message).split(/\r?\n/).find(Boolean) || '';
  console.error(`spec-drift: cannot diff against ${BASE} — ${detail}`);
  console.error('spec-drift: is this a git repository with at least one commit? Pass --base <ref> to pick the comparison point explicitly.');
  process.exit(2);
}

const specs = [];
for (const f of mdFiles(ROOT)) {
  const text = readSpec(f);
  const watches = watchesOf(text);
  const rel = path.relative(ROOT, f).split(BS).join('/');
  if (watches) {
    specs.push({ spec: rel, watches, reviewed: reviewedOf(text) });
  } else if (text.startsWith('<!--') && /^watches:/m.test(text)) {
    // the template ships with a leading HTML comment; front matter placed after
    // it is invisible to the grammar — a spec that LOOKS guarded but isn't.
    console.error(`WARNING: ${rel} has a watches: line but does not start with --- (front matter must be the very first bytes — delete the leading comment). This spec is NOT being checked.`);
  }
}

if (!specs.length) {
  console.log('spec-drift: no specs with a `watches:` front matter found — nothing to check.');
  process.exit(0);
}

const changedSet = new Set(changed);
let drift = 0;
let suspect = 0;
for (const { spec, watches, reviewed } of specs) {
  const regexes = watches.map(globToRegex);
  const hits = changed.filter((c) => regexes.some((r) => r.test(c)));
  if (hits.length && !changedSet.has(spec)) {
    drift++;
    console.error(`DRIFT: ${hits.join(', ')} changed, but ${spec} (which watches ${watches.join(', ')}) did not change in this diff.`);
  }
  // SUSPECT: opt-in via `reviewed:`, and diff-scoped unless --suspect-all —
  // only a diff that touches this spec's watched surface puts it on trial here.
  if (reviewed && (SUSPECT_ALL || hits.length)) {
    const now = hashWatchedHead(watches);
    if (now !== reviewed) {
      suspect++;
      console.error(`SUSPECT: ${spec} was reviewed at ${reviewed.slice(0, 12)}… but its watched files hash ${now.slice(0, 12)}… at HEAD — the code changed since the last review. Re-read the watched files, then re-run: node spec-drift.mjs --stamp ${spec}`);
    }
  }
}

if (drift || suspect) {
  const parts = [];
  if (drift) parts.push(`${drift} drifting`);
  if (suspect) parts.push(`${suspect} suspect`);
  console.error(`\nspec-drift: ${parts.join(', ')}. Update the spec in the same change (or state why no documented rule changed, visibly); re-stamp any SUSPECT spec after actually re-reading its watched files — the hash matches bytes, only you can vouch for the meaning.`);
  process.exit(1);
}
console.log(`spec-drift: ${specs.length} spec(s) checked against ${changed.length} changed file(s) — in sync ✓`);
