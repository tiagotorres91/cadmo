#!/usr/bin/env node
// Cadmo Stop hook: a non-blocking reminder.
// When a turn ends, if the working tree has changes that a Cadmo spec is
// watching, nudge the human to run the definition of done and re-check drift.
// It never blocks — every path exits 0 and only prints a reminder.

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const EXIT_OK = 0;

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

// A watched glob → RegExp. Supports ** (any depth) and * (within a segment).
function globToRegExp(glob) {
  let re = "";
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === "*") {
      if (glob[i + 1] === "*") { re += ".*"; i++; } else { re += "[^/]*"; }
    } else if (".^$+?()[]{}|\\".includes(c)) {
      re += "\\" + c;
    } else {
      re += c;
    }
  }
  return new RegExp("^" + re + "$");
}

// Pull the `watches:` entries out of a markdown file's YAML front matter.
// Handles both `watches: [a, b]` and a block list of `- glob` lines.
function parseWatches(text) {
  const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fm) return [];
  const lines = fm[1].split(/\r?\n/);
  const globs = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^watches:\s*(.*)$/);
    if (!m) continue;
    const inline = m[1].trim();
    if (inline.startsWith("[")) {
      inline.replace(/^\[|\]$/g, "").split(",").forEach((g) => {
        const v = g.trim().replace(/^["']|["']$/g, "");
        if (v) globs.push(v);
      });
    } else if (inline) {
      globs.push(inline.replace(/^["']|["']$/g, ""));
    }
    for (let j = i + 1; j < lines.length; j++) {
      const item = lines[j].match(/^\s*-\s*(.+)$/);
      if (!item) break;
      globs.push(item[1].trim().replace(/^["']|["']$/g, ""));
    }
    break;
  }
  return globs;
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
      .map((p) => (p.includes(" -> ") ? p.split(" -> ")[1] : p));
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
    if (globs.length === 0) continue;
    const res = globs.map(globToRegExp);
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
