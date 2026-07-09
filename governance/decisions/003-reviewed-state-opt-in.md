# ADR 003 — Spec-drift v2: the reviewed-state (SUSPECT) layer is opt-in

**Status:** accepted · **Date:** 2026-07-09 · **Deciders:** maintainer + adversarial review round 3

## Context
Co-change in a diff proves a spec was *touched*, not that it is still *true* — proven in production when a doc bug reappeared one commit after being fixed, with the guard green (the whole range co-changed). v2 adds a stronger layer: `--stamp` records a hash of the watched files ("I re-read this code; the spec is still true"); the check reports **SUSPECT** when watched code moved since the stamp, even if the spec was edited. The question: should SUSPECT apply to every spec with `watches:`, or only to specs that carry a `reviewed:` stamp?

## Decision
**Opt-in.** A spec without `reviewed:` gets the DRIFT check only; SUSPECT activates only after the first `--stamp`. Right-sizing applied to the mechanism itself: pay the re-read discipline only where it earns its keep.

## Alternatives considered
- **Always-on SUSPECT** — why not: every wide refactor would turn all watched specs red at once, demanding N re-stamps per sweep; a check that cries wolf gets deleted. The strongest guard is the one teams keep.
- **Warn-only SUSPECT** — why not: a warning nobody must act on decays into noise; where a team opts in, they mean it — it fails.

## Consequences
Easier: teams adopt the moat incrementally (DRIFT first, stamp the money-critical specs later). Harder: an unstamped spec keeps the touched≠true gap — documented honestly in the tool header and in the method docs.

## When to reconsider
If real-world adoption shows teams *forgetting* the stamp exists (nobody opts in), promote visibility: the check could suggest stamping high-churn specs — still never forcing it.
