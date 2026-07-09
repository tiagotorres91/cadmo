# Spec-drift — the mechanism that keeps documentation honest

Every methodology says "keep the docs in sync with the code." Cadmo *enforces* it: **a spec declares which files implement it, and CI fails the PR when those files change without the spec changing in the same diff.** This is the mechanical heart of the whole method — the reason a Cadmo spec can be trusted as governance (a client validates it, an auditor reads it) instead of decaying into wishful documentation.

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

**2. A 100-line dependency-free script checks the diff** — [`spec-drift.mjs`](../tools/spec-drift.mjs) (dropped into your project by `npm create cadmo` as `cadmo/spec-drift.mjs`):

```bash
node cadmo/spec-drift.mjs --base origin/main
# DRIFT: src/billing/calc.js changed, but docs/spec-billing.md
#        (which watches src/billing/**) did not change in this diff.
```

**3. CI runs it on every PR** — the scaffolder also drops a ready workflow (`cadmo/spec-drift-workflow.yml`; move it to `.github/workflows/`). A watched change without its spec fails the build.

## The escape hatch is audited, never silent

Sometimes a watched file changes without any documented rule changing (a refactor, a typo). The workflow honors a PR body containing:

```
spec-drift: skip — refactor only, no rule touched
```

The skip and its reason live **in the PR, where reviewers see them** — the check can be overridden, but never quietly.

## Why this is the moat

Anyone can write specs. The hard part is **specs that stay true** — and that's a mechanism problem, not a discipline problem (Cadmo's rule: a repeated failure isn't re-disciplined, it's mechanized). With drift enforcement, the spec becomes the thing Cadmo promises the client: *documentation that cannot silently lie.*

We run it on this very repo: [`docs/getting-started.md`](getting-started.md) watches the CLI (`npm/index.js`, `npm/templates/**`) — because this exact drift already bit us once (the docs said "four templates" while the CLI shipped five). The scar became the mechanism; the mechanism now guards its own documentation.

## Right-sizing it

Start with **one spec watching one risky area** (billing, permissions, the calculation engine). Don't front-matter your whole repo on day one — a check that cries wolf gets deleted. Grow the coverage the way everything grows in Cadmo: when a drift bites, add the pair.
