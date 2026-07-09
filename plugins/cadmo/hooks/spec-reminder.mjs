#!/usr/bin/env node
// Cadmo Stop hook: a non-blocking reminder.
// When a turn ends, if the working tree has changes that a Cadmo spec is
// watching, nudge the human to run the definition of done and re-check drift.
// It never blocks — every path exits 0 and only prints a reminder.
//
// Grammar (front-matter parsing + glob semantics) comes from ./cadmo-grammar.mjs —
// a byte-identical copy of the repo's single grammar (tools/cadmo-grammar.mjs),
// guarded by check-template-sync.sh. Round 4 found this hook had drifted onto its
// own grammar (with an already-fixed globstar bug); never again.

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const EXIT_OK = 0;

const here = dirname(fileURLToPath(import.meta.url));
const { parseWatches, globToRegex } = await import(pathToFileURL(resolve(here, "cadmo-grammar.mjs")).href);

function readStdin() {
  try {
    return readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

function git(cwd, args) {
  return execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
}

// git status --porcelain quotes paths containing spaces/special chars.
function unquotePath(p) {
  if (p.startsWith('"') && p.endsWith('"')) {
    try { return JSON.parse(p); } catch { return p.slice(1, -1); }
  }
  return p;
}

function main() {
  let cwd = process.cwd();
  const raw = readStdin();
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.cwd === "string") cwd = parsed.cwd;
  } catch {
    /* stdin optional */
  }

  let changed;
  try {
    changed = git(cwd, ["status", "--porcelain", "--untracked-files=all"])
      .split(/\r?\n/)
      .map((l) => l.slice(3).trim())
      .filter(Boolean)
      .map((p) => (p.includes(" -> ") ? p.split(" -> ")[1] : p))
      .map(unquotePath);
  } catch {
    return EXIT_OK; // not a git repo, or git unavailable
  }
  if (changed.length === 0) return EXIT_OK;

  let specFiles;
  try {
    specFiles = git(cwd, ["ls-files", "*.md"]).split(/\r?\n/).filter(Boolean);
  } catch {
    return EXIT_OK;
  }

  const hits = new Set();
  for (const spec of specFiles) {
    let globs;
    try {
      globs = parseWatches(readFileSync(resolve(cwd, spec), "utf8"));
    } catch {
      continue;
    }
    if (!globs || globs.length === 0) continue;
    const res = globs.map(globToRegex);
    if (changed.some((f) => res.some((r) => r.test(f)))) hits.add(spec);
  }

  if (hits.size === 0) return EXIT_OK;

  const list = [...hits].join(", ");
  // stdout (not stderr) so the reminder surfaces; exit 0 so a Stop hook never blocks.
  process.stdout.write(
    "\n[cadmo] You changed files watched by: " + list + "\n" +
    "        Run /cadmo:done for the definition of done, and re-check spec drift\n" +
    "        (e.g. `node cadmo/spec-drift.mjs --base origin/main`), then re-stamp the spec if a rule moved.\n\n"
  );
  return EXIT_OK;
}

process.exit(main());
