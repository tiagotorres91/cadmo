# FAQ

**Isn't this just Spec Kit?**
Spec Kit is one of Cadmo's declared ancestors (see the [genealogy](frameworks/genealogy.md)) — and it covers one pillar: how a spec becomes code. Cadmo is the whole lifecycle around that: whether it's worth building (value gates), keeping it alive (operations), scaling to a second dev (the collaboration protocol), and installing it all for a new client (application). Also different in kind: Cadmo's specs are *client-validated governance artifacts* with version and signature, not only developer inputs.

**Does it require Claude?**
No. The method is model-agnostic — `AGENTS.md` is an open convention, and every practice (gates, criteria-first, verification, verdicts) works with any capable coding agent. It was *distilled* pairing with Claude, and the collaboration protocol has only been battle-tested with Claude instances so far. If you run it with another agent, that's exactly the kind of report we want in Discussions.

**I'm a solo dev with no clients. Is this for me?**
Levels 1–2 of the [maturity ladder](maturity.md), absolutely: the map (`AGENTS.md`), criteria before code, an honest definition of done. The governance layers (client validation, value checks) assume someone depends on what you ship — if that someone is just future-you, the lighter levels already pay for themselves.

**Isn't this a lot of process?**
Right-sizing is the meta-principle: trivial work goes direct, with zero ceremony. The method only adds weight where a mistake is expensive (money, data, integrations, production). If you're filling in templates for a typo fix, you're using it wrong — and the docs say so.

**AI keeps getting better at coding. Won't this become unnecessary?**
The opposite, mostly. As generation gets cheaper, the bottleneck moves further toward *specifying* (what exactly do we want?) and *verifying* (did we get it? is it safe?). Those are precisely the pillars here. And most of the security surface [isn't in the code at all](security-surface.md) — it's operated, not generated.

**Why the Portuguese name?**
Cadmus — *Cadmo* in Portuguese — brought the alphabet to Greece; the method's first principle is "write it down before you build it." It was born in Brazil, and the name is also an acronym of the five pillars. Distinctive beats descriptive.

**Can I use this commercially / in my company?**
Yes — docs are CC BY 4.0 (attribution required), code is MIT. You can adapt it internally, train your team on it, build on it. The only thing reserved is the *name* (see [TRADEMARK.md](../TRADEMARK.md)): don't call your derivative "Cadmo".

**How do I know this works?**
You don't have to take our word: the repo carries a [worked example](../examples/) end to end, the [collaboration protocol](collaboration-protocol.md) documents real first-day scars (not just the happy path), and the method was distilled from running production systems for paying clients through 2026. It's one consultancy's practice — the point of opening it is to find out what breaks in yours.
