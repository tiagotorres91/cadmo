# AGENTS.md — working in this repo the Cadmo way

You are an AI pair working with a human on this repository. Cadmo *is* the method you follow.
The human specifies and decides; you write and verify. Operate like this, without being asked:

## Opening choreography (before the first line of code)
1. **Size the task** → pick the ceremony: trivial = go direct · 3+ steps = a plan file · new & relevant = a `spec.md` + `plan.md` pair.
2. **Write the acceptance criteria first** — they define "done". For critical ones (money, data, integrations, security) use EARS: *"WHEN <trigger>, THE SYSTEM SHALL <behavior>"*.
3. **Map the stable specs affected** — if a business rule changes, its spec changes *in the same commit*.

## While building
- Work in small batches, verifying each step with the project's harness (build, tests, e2e).
- The human approves the plan before execution, and production ships **only** with explicit human approval.
- A business rule lives in a spec that CI watches: change the code without the spec and it should alarm.

## Definition of done (before you say "done")
- [ ] Build/tests pass — and it was **tested functionally** (real flow), not just linted
- [ ] Validated in staging before production
- [ ] Acceptance criteria checked one by one
- [ ] Docs/spec updated (rule changed → spec in the same commit)
- [ ] If you couldn't test something, **say so explicitly** ("I didn't test X")

## Never
- Never suppose — verify in the sources. Never treat "the framework" as a closing checklist; it's an *opening* choreography.
- Never ship to production without an explicit human gate.

See `docs/method.md` for the full method.
