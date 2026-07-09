# Application — the assembly line

> The frameworks are the blueprint; Application is how you raise the building. It's not a framework (it doesn't govern a domain of work) — it's the *procedure for installing the frameworks* for a new client or project.

Every new client/project re-instantiates the method. Without a protocol, each instance is improvised. This is the written path.

## Right-size the install first

Classify the engagement on three axes — they decide which layers you install:

- **Owner**: personal ↔ external client (client → serious governance layer + exposure classification).
- **Team**: solo ↔ collaborative (collaborative → the collaboration layer in the repo).
- **Recurrence**: one-off ↔ continuous support (continuous → the full operations layer).

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
