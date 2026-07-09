# The Cadmo method, in one page

Cadmo is how you build software when **AI writes and verifies, and a human specifies and decides** — sized so the rigor never becomes bureaucracy.

## The meta-principle: right-sizing

Every rule below scales to the task. Trivial work goes direct; a real feature earns a spec the client validates first. *Poucos processos = ineffective; too many = waste.* You calibrate — that's the whole game.

## Model economy (tier right-sizing)

Right-sizing applies to *which model runs which work*, too. **Design costs quality; execution costs volume.** Fine judgment — architecture, the spec of something new, curation, content verification — runs on the most capable tier, where getting it right compounds and getting it wrong propagates. Homogeneous execution and orchestration against an already-decided plan run on a cheaper, faster tier, or on right-tiered sub-agents. The honesty rule: **name the tier mismatch** — if new design work landed on an execution tier, say so ("this deserves the top tier; or I proceed with a caveat"), never pretend the smaller tier delivers the same quality.

## The flow

```
   MANAGEMENT ──▶ DEVELOPMENT ──▶ OPERATIONS ──▶ (feeds back to MANAGEMENT)
   decide           build           maintain
   is it worth?     build it right  keep it live, with a trail
```

A need enters (a request, a support ticket, something operations revealed) → **Management** decides if it's worth building (a value gate) → **Development** builds it right (spec first, tests derived, human gates) → **Operations** keeps it live (monitoring, incidents that strengthen the system) → and what operations reveals feeds back as new demands. **Collaboration** scales the pair into a team; **Application** installs the whole thing for a new client or project.

## The value chain of a rule (the spine)

The most important chain in the method — how a business rule travels from idea to the client's signature:

1. **Value gate** — is it worth building? A business metric is defined.
2. **Spec** — the rule, written, in the client's language, validated *before* construction.
3. **Tests derived** — each acceptance criterion becomes a test (critical ones word-for-word, in EARS).
4. **Absorption** — on delivery, the demand's spec is absorbed into the system's stable specs.
5. **Same commit** — a rule changes → its spec changes *with the code*; CI watches for drift.
6. **Published** — the client sees the doc, versioned.
7. **Validated** — the client's acceptance is recorded against the exact version. Changed? Re-validate.

## Validation by MVP (the default)

Experience gives assertiveness about what the client wants. So the normal flow is: **approve the spec as the client's proxy → build the MVP in staging → the client validates spec *and* MVP together.** Seeing beats reading. Prior document-only validation is reserved for high-risk work (money, data, structural integration).

## Enforcement in layers (why it holds without nagging)

1. **Mechanical** (never fails): CI + drift warnings · a deploy that refuses uncommitted work · destructive-command guards.
2. **Active instruction** (every session): the AI's always-loaded rules + the project's local map.
3. **Reviewer** (on demand): a fresh-context, adversarial review before big merges.
4. **Human audit** (occasional): *"are we following it?"* — and every gap found drops down to layer 1 as a new mechanism.

The rule that makes it self-improving: **a repeated failure isn't re-disciplined, it's mechanized.**

## The vocabulary

- **Artifact** — a tangible document (spec, decision record, plan).
- **Practice** — a recurring ritual (gates, staging-before-production, definition of done).
- **Mechanism** — automation that runs on its own (CI, deploy scripts, generators).

## The two PDCA loops

Cadmo runs Deming's cycle at two levels: **on the demand** (gate/spec → build → done/verify → learnings) and **on the method itself** (the guides → real use → gap audit → each failure becomes a new layer). By trigger, not by calendar — right-sizing even the improvement.

---

Each pillar is one short doc in [`frameworks/`](frameworks/). The genealogy — what Cadmo took from Spec-Driven Development, SRE, ITIL, PMBOK, XP and others, and what's its own — is in [`frameworks/genealogy.md`](frameworks/genealogy.md).
