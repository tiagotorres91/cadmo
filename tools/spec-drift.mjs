#!/usr/bin/env node
/*
 * spec-drift — the rule that keeps documentation honest.
 *
 * Two layers, both zero-dependency:
 *
 *   DRIFT (v1): a spec declares which files implement it (`watches:`); if those
 *   files change in the diff and the spec doesn't change in the same diff → DRIFT.
 *   Cheap, but shallow: co-change in a diff proves the spec was TOUCHED, not that
 *   its content is still TRUE. A wide refactor can sweep the spec into the diff
 *   for an unrelated reason and the watched change rides along unreviewed.
 *
 *   SUSPECT (v2): an opt-in "reviewed-state" layer that narrows that gap. Running
 *   `--stamp <spec>` records a sha256 over the current content of the spec's
 *   watched files as `reviewed: <hash>` in its front matter — a human affirming
 *   "I re-read this code and this spec is still true." The check then recomputes
 *   that hash at HEAD; if the watched code changed since the stamp, it reports
 *   SUSPECT — EVEN IF the spec was also edited in the diff (which silences DRIFT).
 *   Honesty note: SUSPECT narrows the semantic-truth gap, it does not close it. A
 *   matching hash only proves the bytes are unchanged; a human still has to
 *   actually re-read the code and mean it when they re-stamp.
 *
 * A spec WITHOUT a `reviewed:` key gets the DRIFT check only — SUSPECT is opt-in
 * (right-sizing: pay the re-read discipline only where it earns its keep).
 *
 * No dependencies. How the check works:
 *   1. Scans the repo for .md files with a `watches:` list in their front matter.
 *   2. Diffs the current branch against --base (default: origin/main)  → DRIFT.
 *   3. For each spec with `reviewed:`, hashes its watched files at HEAD and
 *      compares to the stamped hash                                    → SUSPECT.
 *
 * Usage:
 *   node spec-drift.mjs [--base origin/main] [--dir .]   # check (DRIFT + SUSPECT)
 *   node spec-drift.mjs --stamp <spec.md> [--dir .]      # re-affirm a spec
 *
 * Spec front matter example (after a --stamp):
 *   ---
 *   watches:
 *     - src/billing/**
 *     - api/invoices.py
 *   reviewed: 9f2c…            # sha256 of the watched files at review time
 *   ---
 *
 * Escape hatch (audited, not silent): if a change genuinely doesn't alter any
 * documented rule, say so where reviewers can see it — e.g. run the CI step
 * only when the PR body does NOT contain "spec-drift: skip — <reason>".
 */
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const BS = String.fromCharCode(92);
const args = process.argv.slice(2);
function opt(name, fallback) {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
}
const BASE = opt('--base', 'origin/main');
const ROOT = path.resolve(opt('--dir', '.'));
const STAMP = opt('--stamp', null);

// --- collect specs that declare `watches:` in front matter ---
function* mdFiles(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || e.name === 'node_modules') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* mdFiles(p);
    else if (e.name.endsWith('.md')) yield p;
  }
}

function frontMatter(text) {
  if (!text.startsWith('---')) return null;
  const end = text.indexOf('\n---', 3);
  if (end < 0) return null;
  return { fm: text.slice(3, end), end };
}

function parseWatches(file) {
  const parsed = frontMatter(fs.readFileSync(file, 'utf8'));
  if (!parsed) return null;
  const lines = parsed.fm.split('\n');
  const watches = [];
  let inWatches = false;
  for (const line of lines) {
    if (/^watches:\s*$/.test(line)) { inWatches = true; continue; }
    if (inWatches) {
      const m = line.match(/^\s+-\s+(.+?)\s*$/);
      if (m) watches.push(m[1].replace(/^["']|["']$/g, ''));
      else if (!/^\s/.test(line)) inWatches = false;
    }
  }
  return watches.length ? watches : null;
}

function parseReviewed(file) {
  const parsed = frontMatter(fs.readFileSync(file, 'utf8'));
  if (!parsed) return null;
  for (const line of parsed.fm.split('\n')) {
    const m = line.match(/^reviewed:\s*(\S+)\s*$/);
    if (m) return m[1];
  }
  return null;
}

// Add or update a top-level `reviewed:` key, preserving everything else.
function setReviewed(text, hash) {
  const parsed = frontMatter(text);
  const rest = text.slice(parsed.end); // '\n---' … onwards
  let lines = parsed.fm.split('\n');
  let found = false;
  lines = lines.map(l => {
    if (/^reviewed:\s*/.test(l)) { found = true; return `reviewed: ${hash}`; }
    return l;
  });
  if (!found) {
    if (lines.length && lines[lines.length - 1] === '') lines[lines.length - 1] = `reviewed: ${hash}`;
    else lines.push(`reviewed: ${hash}`);
  }
  return '---' + lines.join('\n') + rest;
}

// --- minimal glob → regex (supports ** and *) ---
function globToRegex(glob) {
  // zero-backslash implementation: escape specials via char classes, never via backslash
  let esc = '';
  for (const ch of glob) {
    if (ch === '*' || ch === '/') esc += ch;
    else if ('.+^$(){}|[]?'.includes(ch) || ch === BS) esc += BS + ch;
    else esc += ch;
  }
  esc = esc.split('**').join('__DSTAR__');
  esc = esc.split('*').join('[^/]*');
  // ** matches zero or more path segments (gitignore semantics), so src/**/auth.js matches src/auth.js
  esc = esc.split('/__DSTAR__/').join('/(?:.*/)?'); // a/**/b -> a/b and a/x/y/b
  esc = esc.split('__DSTAR__/').join('(?:.*/)?');   // **/b  -> b and x/b
  esc = esc.split('/__DSTAR__').join('(?:/.*)?');   // a/**  -> a and a/x
  esc = esc.split('__DSTAR__').join('.*');          // bare **
  return new RegExp('^' + esc + '$');
}

// --- reviewed-state hashing ---
// The watched set is resolved through git so the working-tree view (--stamp) and
// the HEAD view (check) enumerate the same files; hashing sorts for determinism.
function matched(watches, files) {
  const regexes = watches.map(globToRegex);
  return files.filter(f => regexes.some(r => r.test(f))).sort();
}

// Normalize line endings so a CRLF working tree (git autocrlf on checkout) and the
// LF-stored HEAD blob hash IDENTICALLY. Without this, --stamp (working-tree bytes) and
// the check (HEAD blob) never agree for multi-line files and SUSPECT stays permanently
// red on Windows. Watched files are text source; binary watches are nonsensical here.
function norm(buf) {
  return buf.toString('utf8').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
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
  const watches = parseWatches(specPath);
  if (!watches) {
    console.error(`spec-drift --stamp: ${STAMP} has no \`watches:\` front matter — nothing to stamp.`);
    process.exit(2);
  }
  const hash = hashWatchedDisk(watches);
  fs.writeFileSync(specPath, setReviewed(fs.readFileSync(specPath, 'utf8'), hash));
  console.log(`spec-drift: stamped ${STAMP} — reviewed: ${hash}`);
  process.exit(0);
}

// --- changed files vs base ---
let changed;
try {
  changed = execFileSync('git', ['diff', '--name-only', `${BASE}...HEAD`], { cwd: ROOT, encoding: 'utf8' })
    .split('\n').filter(Boolean);
} catch (e) {
  console.error(`spec-drift: cannot diff against ${BASE} — ${e.message}`);
  process.exit(2);
}

const specs = [];
for (const f of mdFiles(ROOT)) {
  const watches = parseWatches(f);
  if (watches) specs.push({ spec: path.relative(ROOT, f).split(BS).join('/'), watches, reviewed: parseReviewed(f) });
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
  const hits = changed.filter(c => regexes.some(r => r.test(c)));
  if (hits.length && !changedSet.has(spec)) {
    drift++;
    console.error(`DRIFT: ${hits.join(', ')} changed, but ${spec} (which watches ${watches.join(', ')}) did not change in this diff.`);
  }
  // SUSPECT is opt-in: only specs that carry a `reviewed:` hash are held to it.
  if (reviewed) {
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
