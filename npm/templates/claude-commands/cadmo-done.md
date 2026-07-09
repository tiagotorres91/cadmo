---
description: Run the definition of done honestly — checked against evidence (run the commands), not memory
---
# /cadmo-done — the definition of done, checked honestly

Run the definition of done for: **$ARGUMENTS** (or the work we just finished).

Check each item **against evidence, not memory** — run the commands, don't assume:

- [ ] Build/tests pass — run them now and show me the output
- [ ] **Tested functionally** — the real flow (browser, curl, CLI run), not just linters
- [ ] Validated in staging before production (when there is one)
- [ ] Acceptance criteria from the spec/plan — checked one by one, quoted
- [ ] Spec updated if a rule changed (same commit) — run `node cadmo/spec-drift.mjs --base origin/main` if present
- [ ] Anything untested? Say it explicitly: "I didn't test X"
- [ ] Touched auth/input/data/secrets? → flag that an adversarial security pass is due before shipping

Then the **process check** (the choreography, not the code): was there a plan before execution? criteria before code? If any answer is no, say so plainly — this checklist exists to be failed honestly, not passed cosmetically.

Finish with a verdict: **ready to ship** / **ready except <items>** / **not ready because <items>**.
