#!/usr/bin/env node
/*
 * spec-drift — the rule that keeps documentation honest:
 * a spec declares which files implement it; if those files change and the spec
 * doesn't change in the same diff, the check fails.
 *
 * No dependencies. How it works:
 *   1. Scans the repo for .md files with a `watches:` list in their front matter.
 *   2. Diffs the current branch against --base (default: origin/main).
 *   3. For each spec: if a watched file changed and the spec didn't → DRIFT.
 *
 * Usage:
 *   node spec-drift.mjs [--base origin/main] [--dir .]
 *
 * Spec front matter example:
 *   ---
 *   watches:
 *     - src/billing/**
 *     - api/invoices.py
 *   ---
 *
 * Escape hatch (audited, not silent): if a change genuinely doesn't alter any
 * documented rule, say so where reviewers can see it — e.g. run the CI step
 * only when the PR body does NOT contain "spec-drift: skip — <reason>".
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
function opt(name, fallback) {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
}
const BASE = opt('--base', 'origin/main');
const ROOT = path.resolve(opt('--dir', '.'));

// --- collect specs that declare `watches:` in front matter ---
function* mdFiles(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || e.name === 'node_modules') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* mdFiles(p);
    else if (e.name.endsWith('.md')) yield p;
  }
}

function parseWatches(file) {
  const text = fs.readFileSync(file, 'utf8');
  if (!text.startsWith('---')) return null;
  const end = text.indexOf('\n---', 3);
  if (end < 0) return null;
  const fm = text.slice(3, end);
  const lines = fm.split('\n');
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

// --- minimal glob → regex (supports ** and *) ---
function globToRegex(glob) {
  // zero-backslash implementation: escape specials via char classes, never via backslash
  const BS = String.fromCharCode(92);
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
  if (watches) specs.push({ spec: path.relative(ROOT, f).split(String.fromCharCode(92)).join('/'), watches });
}

if (!specs.length) {
  console.log('spec-drift: no specs with a `watches:` front matter found — nothing to check.');
  process.exit(0);
}

const changedSet = new Set(changed);
let drift = 0;
for (const { spec, watches } of specs) {
  const regexes = watches.map(globToRegex);
  const hits = changed.filter(c => regexes.some(r => r.test(c)));
  if (hits.length && !changedSet.has(spec)) {
    drift++;
    console.error(`DRIFT: ${hits.join(', ')} changed, but ${spec} (which watches ${watches.join(', ')}) did not change in this diff.`);
  }
}

if (drift) {
  console.error(`\nspec-drift: ${drift} spec(s) out of sync. Update the spec in the same change — or state why no documented rule changed (visibly, where reviewers can see it).`);
  process.exit(1);
}
console.log(`spec-drift: ${specs.length} spec(s) checked against ${changed.length} changed file(s) — in sync ✓`);
