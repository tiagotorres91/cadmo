# Direction — where Cadmo is going, and why

*The maintainer's compass, written down so contributors don't have to guess it (or ask it once per person). Complements the [value gate](value-gate.md) (why this was opened) and [CONTRIBUTING](../CONTRIBUTING.md) (how to work here). This is a living document — it changes by decision, not by drift.*

## The goal

Cadmo exists to become **a reference for building software with AI under real governance** — the method a consultant or small team reaches for when someone else depends on what they ship. Success is measured by adoption signals (real adopters reporting back, the collaboration protocol resonating where it's shared) and by the method's ideas surviving contact with other people's practices. It is authored and maintained by Tiago Torres; contributions are credited, authorship stays put (see [ADR 002 context in CONTRIBUTORS](../CONTRIBUTORS.md)).

## The audience, in order

1. **Now: solo consultants and small teams** shipping for real clients — the "too lean for enterprise process, too accountable for no process" profile in the README. Every increment should make *their* first hour better.
2. **Next: the corporate/compliance rung** — where maturity level 4, the validation log, and the compliance map become the selling argument (EU AI Act, ISO/IEC 42001, audit functions). We build *toward* this deliberately, but not at the cost of the first audience's simplicity.

## The horizon (what governs increments right now)

**The repo is feature-frozen until the first external adopters arrive** (see the value gate: the metric is adoption, and building more doesn't move it — validating with real users does). What this means in practice:

- **Research, proposals and critique: always welcome, freeze or no freeze.** Thinking is never frozen.
- **Building: paused** until launch feedback exists. Post-launch, increments are prioritized by what real adopters hit, not by what we find elegant.
- Exceptions to the freeze: defects, doc corrections, and governance/coordination artifacts (like this file).

## The open-core boundary (so nobody guesses wrong)

- **Always open (CC BY / MIT):** the method itself — pillars, protocols, templates, tooling (`spec-drift`, `score`, `validate`), examples, the maturity ladder. If it makes the method *usable*, it's open.
- **Not in this repo, by design:** commercial packaging (pricing, service ladders), client instances, and the maintainer's internal operational playbooks. Proposals that need those layers aren't wrong — they're just conversations with the maintainer, not PRs.

## Out of scope (deliberate "no"s — each reversible only by decision)

- **No permanent agent org-charts** — the multi-agent stance (on-demand, never standing roles) is a founding position, not a phase.
- **No SaaS / hosted platform for now** — Cadmo stays a method + files-in-your-repo tooling. A hosted validation surface is a plausible future, not a current direction.
- **No certification program for now** — the compliance map *supports evidence*; we don't attest, and we don't sell badges.
- **No heavyweight config** — every machine-readable key must be read by a tool and exist nowhere else (ADR 004).

## How to propose something (the method, applied to itself)

Open an **issue** with a mini **value gate** (5 lines — the template is [`templates/value-gate.md`](../templates/value-gate.md)): what hurts / for whom in the audience above / cheaper alternative considered / how we'd know it worked / verdict you propose. Research findings are welcome as issues too — with sources, framed against this direction. The maintainer answers with the protocol's verdicts (✅ / 🔧 / ❓). Big bets (6–12 month shapes) are welcome **as written options** — they'll be decided post-launch, with adoption data on the table.
