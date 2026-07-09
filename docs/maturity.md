# The Cadmo maturity ladder — where are you?

Five levels, from vibe coding to audited governance. Each level is stable on its own — you can live at level 2 happily. The ladder exists so you know **where you are, what the next rung buys you, and what it costs.** (Lineage: CMMI's staged maturity idea, right-sized from five heavyweight levels to a ladder a small team can actually climb.)

| Level | Name | What characterizes it | You're here if… |
|---|---|---|---|
| **0** | **Vibe** | The AI generates, the human accepts. Nothing is written down. Fast until it isn't. | "the spec" is your chat history |
| **1** | **Mapped** | An `AGENTS.md` exists: the AI is born knowing the project, its conventions, and how to verify. | any new AI session is productive in the first message |
| **2** | **Gated** | Criteria before code; plans approved before building; a definition of done with real functional testing; production only with explicit approval. | "done" means *tested*, and untested parts are said out loud |
| **3** | **Enforced** | The rules stop depending on discipline: CI runs tests derived from specs, drift between code and spec alarms, staging is mandatory, AI features carry evals. | a rule change without its spec change fails the build |
| **4** | **Governed** | The client (or stakeholder) validates living documentation with version and signature; value gates open work and value checks close it; every sensitive action leaves a trail. | an auditor could reconstruct *why* anything exists |

## How to climb

- **0 → 1** is ten seconds: `npm create cadmo`, then fill the map. ([getting started](getting-started.md))
- **1 → 2** is behavior, not tooling: criteria first, gates on, DoD honest. Costs discipline, buys trust.
- **2 → 3** is mechanization: each repeated failure becomes a mechanism (the [enforcement layers](method.md#enforcement-in-layers-why-it-holds-without-nagging)). Costs setup time, buys sleep.
- **3 → 4** is governance: publish the specs, record validations, check value after delivery. Costs a surface for the client, buys contracts with organizations that demand accountability.

Most solo work is fine at 2. Client work deserves 3. If your client is a corporation, a government body, or anyone with an audit department — 4 is what wins and keeps the contract.

> **Two ladders, don't confuse them:** this one rates *how you build software*. There's a second maturity test — rating *the client's business processes* to find what deserves to become a system at all (the golden rule: automation requires a standardized process). That one lives in [Management](frameworks/01-management.md).

**Honest self-assessment beats aspiration:** most AI-assisted teams today are at 0, and the industry's governance pain lives exactly there. The ladder isn't a judgment — it's a map.
