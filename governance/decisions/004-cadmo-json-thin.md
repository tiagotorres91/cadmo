# ADR 004 — `cadmo.json`: a thin tool anchor, never a second source of truth

**Status:** accepted · **Date:** 2026-07-09 · **Deciders:** maintainer + adversarial review round 3

## Context
`cadmo score` (the maturity ruler) needed machine-readable config: what level is this repo aiming at? Tooling configs tend to grow into parallel descriptions of the project — which would collide with Cadmo's own rule (*one subject, one source*): the prose map lives in `AGENTS.md`, and the files a spec enforces live in that spec's `watches:` front matter.

## Decision
`cadmo.json` holds **only what exists nowhere else and a tool actually reads**: the version marker, `targetLevel`, and `stagingUrl`. A leading `_note` states the intent. The adversarial review enforced it literally — keys shipped in the first draft that no tool read (`specsDir`, `productionUrl`) were **removed** rather than documented.

## Alternatives considered
- **Rich config** (paths, spec lists, URLs, tool options) — why not: every key that repeats something stated elsewhere is a drift pair waiting to disagree; the method can't preach spec-drift enforcement while shipping a config that drifts by design.
- **No config at all** (flags only) — why not: `targetLevel` must persist so CI can hold the line (`cadmo score` exits non-zero below target); a flag on a workflow line is invisible governance.

## Consequences
Easier: the file is self-explaining and cannot lie much — it's three keys. Harder: future tools must justify every new key against "does a tool read it, and does it exist nowhere else?" — that friction is the point.

## When to reconsider
When a tool genuinely needs a new persistent input (e.g. `cadmo metrics` wanting a release-tag pattern) — add the key *with* the tool, in the same commit, never ahead of it.
