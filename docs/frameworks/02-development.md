# Development — build the right thing, right

> A way to build software where the AI writes and verifies, and the human specifies and decides. The bottleneck moved from *writing* to *verifying* — the method is built to win that.

**Pillars:** Specify → Contextualize → Execute with gates → Verify → Measure.

- **Specify** — acceptance criteria *before* code. New, relevant work gets a `spec.md` (the client validates it first) + a `plan.md`. Structural choices get a decision record with alternatives and consequences.
- **Contextualize** — whoever builds (the human + the AI pair) starts from documented conventions, architecture and decisions — not memory. Knowledge lives in documents.
- **Execute with gates** — nothing relevant is built without an approved plan; nothing reaches production without explicit approval. Humans decide; automation executes.
- **Verify** — automated tests *derived from the specs* run on every change; if a rule changes in the code but not in the spec, an alarm fires. Staging before production. The definition of done includes *testing the real flow*, not just linting — and saying explicitly "I didn't test X" when true.
- **Measure** — AI features carry a benchmark that runs before and after every change, with history: regression does not ship.

Right-sizing sets the rite by size: trivial goes direct · a 3+ step fix gets one plan file · new-and-relevant gets a `spec.md` + `plan.md`. Genealogy: Spec-Driven Development, EARS (Kiro / Rolls-Royce), architecture decision records (Nygard), agent engineering (Anthropic), and XP (pair programming — here the pair is human + AI).
