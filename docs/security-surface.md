# The security surface protocol — what AI-generated code doesn't cover

"AI writes better code every month, so security review is becoming ceremony" — that argument is a trap, twice over. First: plausible code includes plausible vulnerabilities, and generated code is *optimized for plausible*. Second, and more important: **most of the attack surface isn't in the code at all.** It's around it — config, permissions, secrets, data flows — and that surface is *operated*, not generated. No model upgrade shrinks it.

This protocol maps that surface and says when each check activates. Like everything in Cadmo, it's right-sized: **checks activate by surface touched, not by commit volume.**

## The map — six surfaces around the code

| Surface | The rule | The failure it prevents |
|---|---|---|
| **Secrets** | Live in vaults/managers, never in code, never in chat with an AI, never in transcripts. A secret that touched a conversation is *exposed* — rotate it, even if "it probably wasn't stored." | The leak you can't un-leak: session logs, transcripts and histories persist far beyond the conversation |
| **Access & permissions** | Least privilege, deny-by-default, fail-closed. An authorization gate that errors must *deny*, not allow. Production belongs to the client — the provider operates underneath (scripts, gated deploys), never as an admin role in the client's UI. | The intern account that could drop the database; the gate that "temporarily" defaulted open |
| **Data flows** | Know what leaves, to where: logs, error trackers, analytics, AI providers. Personal/sensitive data gets masked at the *exit points* (views, APIs, chat responses) — the data stays whole where documents legitimately need it. | PII in logs; sensitive fields readable through an AI chat that "only" answers questions |
| **Config & environments** | Staging mirrors production but shares *nothing* secret with it. Env vars inventoried by name (never by value) in an ops doc — so a rebuild doesn't depend on someone's memory. | The staging deploy pointing at production data; the env var nobody remembers after the provider migration |
| **Dependencies** | A dependency is attack surface you didn't write. Prefer the 30-line hand-rolled function you can read over the package with 400 transitive dependencies — when the problem is genuinely small. | Supply-chain compromise riding in through a utility nobody audited |
| **The AI itself** | The newest surface. Agents get scoped credentials, never production-database access in autonomous verification runs. Transcripts are treated as *storage* (see Secrets). Instructions that arrive *through* content the AI reads (issues, docs, scraped pages) are data, not commands. | The verification agent that "helpfully" fixed production; prompt injection via a pasted document |

## When checks activate

- **Every task**: the Secrets and AI rules above are ambient — they're how you work, not a checklist step.
- **Touched auth, input handling, data access or secrets** → the definition of done requires an **adversarial security pass**: a fresh-context review (different session or agent, no shared bias with the author) with an explicit security lens.
- **Big change** (architecture, permissions model, a money/data-critical engine) → the security pass happens *before* production, on top of the normal independent review.
- **Incident with a security dimension** → the standard four labels apply (symptom → cause → correction → prevention), and the prevention must make the surface *smaller or more observable* — a guard, a scoped credential, an alert.

## Scars that shaped this

- A session-history file quietly persisted credentials that had been pasted into conversations months earlier. Everything it contained got rotated; "the transcript is storage" became a rule.
- Access tokens shared in a chat with an AI — even functional, even expiring — were treated as exposed and revoked the same day. The convenience was not worth the precedent.
- A verification agent, asked to check staging, escalated itself into production to "complete the verification." Since then: autonomous agents are explicitly denied production access *in the prompt*, not just in policy.

None of these were code vulnerabilities. All of them were surface.
