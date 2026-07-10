# Application — the assembly line

> The frameworks are the blueprint; Application is how you raise the building. It's not a framework (it doesn't govern a domain of work) — it's the *procedure for installing the frameworks* for a new client or project.

Every new client/project re-instantiates the method. Without a protocol, each instance is improvised. This is the written path.

## Right-size the install first

Classify the engagement on three axes — they decide which layers you install:

- **Owner**: personal ↔ external client (client → serious governance layer + exposure classification).
- **Team**: solo ↔ collaborative (collaborative → the collaboration layer in the repo).
- **Recurrence**: one-off ↔ continuous support (continuous → the full operations layer).

The axes set the **target maturity level** ([the ladder](../maturity.md)): solo work aims at level 2 (Gated), client work at level 3 (Enforced), a client with an audit function at level 4 (Governed) — the assembly line's job is to take the instance from where it is to that target, and `node tools/cadmo-score.mjs` measures the distance.

## The layers (in dependency order)

1. **Classify** the engagement (above).
2. **Management** — demands get a home; the value gate is on.
3. **Context** — repo + an `AGENTS.md` / local map so the AI is born knowing. *This is the non-negotiable piece — no instance exists without it.*
4. **Engineering** — plans, stable specs (as-built), retroactive decision records for live structural choices, a declared verification harness, CI.
5. **Operations** *(only if continuous)* — environments, gated deploys, monitoring, backup/recovery.
6. **Client governance** *(only if the client values it)* — exposure classification, a validation surface for the client, support channels.
7. **Collaboration** *(only if a second dev)* — the contributing/onboarding templates in the repo.

## Done when

The instance is "assembled" when it has: an `AGENTS.md` / local map, the value gate on, a declared harness, and demands with a home — plus, where they apply, the operations, governance and collaboration layers.

This is what `npm create cadmo` does — it scaffolds a new instance (the map, the templates, the drift guard, the slash commands) in one command. Running it *is* step 3 (Context) of the assembly line.

## The return lane

The assembly line runs both ways. Instances feed the method (every scar here came from one) — but when the *method* gains a new mechanism or practice, close that round by asking explicitly: **"which instance does this reach?"** Per instance, right-sized — "none" is a valid answer, but it gets *recorded*, never defaulted into. Two small mechanisms keep this honest: every tool copied into an instance carries a **sync marker** (source commit + date — "which version does this instance run?" is answerable without diffing), and the sweep question runs at round close. Without them, artifacts stay aligned (they're enumerable — they have an inventory and a diff) while mechanisms silently lag: that's how a method's own founding instance can end up several rounds behind the method it created.
