---
watches:
  - tools/spec-drift.mjs
  - tools/cadmo-grammar.mjs
---
# Spec-drift — the mechanism that keeps documentation honest

Every methodology says "keep the docs in sync with the code." Cadmo *enforces* it: **a spec declares which files implement it, and CI fails the PR when those files change without the spec changing in the same diff.** This is the mechanical heart of the whole method — the reason a Cadmo spec can be trusted as governance (a client validates it, an auditor reads it) instead of decaying into wishful documentation.

(And this page practices it: the `watches:` above ties it to the tool it describes — if the guard changes and this doc doesn't, the guard fails its own build.)

## How it works

**1. The spec declares what it governs** — a `watches:` list in its front matter:

```markdown
---
watches:
  - src/billing/**
  - api/invoices.py
---
# Spec — Invoicing rules
...
```

The front matter must be the **very first bytes** of the file — a `watches:` block placed after a leading comment is invisible, and the guard prints a loud WARNING naming the file rather than silently skipping it. (The example `watches:` still *inside* the scaffolded template's leading comment stays silent — only the real mistake warns.)

**2. A small dependency-free script checks the diff** — [`spec-drift.mjs`](../tools/spec-drift.mjs) (dropped into your project by `npm create cadmo` as `cadmo/spec-drift.mjs`):

```bash
node cadmo/spec-drift.mjs
# DRIFT: src/billing/calc.js changed, but docs/spec-billing.md
#        (which watches src/billing/**) did not change in this diff.
```

No `--base` needed: it resolves the remote's declared default branch (`origin/HEAD`) → `origin/main` → `origin/master` → `main`/`master` (when you're on another branch) → `HEAD~1` → the empty tree, in that order — a solo repo with no remote just works, including on its very first commit, and a `master`/`trunk` repo is not silently under-checked.

Three honesty properties of the diff (each one a real escape someone found):
- **Uncommitted work counts** — `/cadmo:done` runs the guard *before* the commit, so a working-tree-only change to a watched file already reports DRIFT (in CI the checkout is clean; this adds nothing there);
- **Renames surface both sides** — `git mv src/a.js other/` is a change to the watched surface, not an exit from it;
- **The whole branch is checked**, not just the last commit.

**3. CI runs it on every PR and push** — the scaffolder also drops a ready workflow (`cadmo/spec-drift-workflow.yml`; move it to `.github/workflows/`). A watched change without its spec fails the build.

## The escape hatch is audited, never silent

Sometimes a watched file changes without any documented rule changing (a refactor, a typo). The shipped workflow honors:

```
spec-drift: skip — refactor only, no rule touched
```

written **in the PR body** (pull_request runs) or **in the latest commit message** (push runs) — the two places reviewers actually look. The check can be overridden, but never quietly.

## v2 — the reviewed-state layer (opt-in)

DRIFT is cheap but shallow: co-change in a diff proves the spec was *touched*, not that its content is still *true*. The opt-in second layer records an explicit human re-read:

```bash
node cadmo/spec-drift.mjs --stamp docs/spec-billing.md
# writes `reviewed: <sha256 of the watched files' content>` into the front matter
```

The stamp means *"I re-read this code and this spec is still true."* From then on, if the watched files' content at HEAD no longer matches the stamp, the check reports **SUSPECT** — even when the spec file itself was edited (editing a spec silences DRIFT; it cannot silence SUSPECT).

Scoping follows "checks activate by surface touched": by default SUSPECT only fires when the current diff intersects the spec's watched set — an innocent README-only PR never fails for a stamp a previous merge skipped. Use `--suspect-all` on push-to-main or scheduled runs for the full repo-state check.

Honesty note: the hash proves the bytes changed, not what the change means — only a human re-read can vouch for the meaning, which is why re-stamping is a deliberate act, not something CI does for you. A spec without `reviewed:` gets DRIFT only (right-sizing: pay the re-read discipline only where it earns its keep).

## Why this is the moat

Anyone can write specs. The hard part is **specs that stay true** — and that's a mechanism problem, not a discipline problem (Cadmo's rule: a repeated failure isn't re-disciplined, it's mechanized). With drift enforcement, the spec becomes the thing Cadmo promises the client: *documentation that cannot silently lie.*

We run it on this very repo: [`docs/getting-started.md`](getting-started.md) watches the CLI (`npm/index.js`, `npm/templates/**`) — because this exact drift already bit us once (the docs said "four templates" while the CLI shipped five). The scar became the mechanism; the mechanism now guards its own documentation — and this page, and the getting-started stamp exercises the SUSPECT layer in this repo's own CI.

## Right-sizing it

Start with **one spec watching one risky area** (billing, permissions, the calculation engine). Don't front-matter your whole repo on day one — a check that cries wolf gets deleted. Grow the coverage the way everything grows in Cadmo: when a drift bites, add the pair.
