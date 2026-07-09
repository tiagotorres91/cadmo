# Multi-agent, without the org chart

The fashionable answer to "how do I use multiple AI agents?" is to build a little company: a PM agent, an architect agent, developer agents, a standing pipeline with handoffs. Cadmo's position is the opposite: **agents on demand, never permanent roles.**

The reasoning: a permanent orchestrator is just another probabilistic model — who watches the watcher? It doubles cost, and every handoff between standing roles loses information. Meanwhile, your main session's accumulated context — the conversation where the human corrected course three times — is usually your most valuable asset, and a pipeline throws it away. What a fresh agent *does* have that your session doesn't: **freedom from your session's accumulated biases.** That's the property worth paying for — so you spawn agents exactly where independence beats context.

## The four uses

**1. The independent reviewer** — before a big merge or production ship: a fresh-context agent reviews the change *adversarially* ("find what's wrong", not "confirm it's fine"). It hasn't spent three hours convincing itself the approach works — that's the point. For changes touching auth, input, data or secrets, this review runs with an explicit security lens (see the [security surface](security-surface.md)).

**2. The exploratory fan-out** — when the work is broad and homogeneous (audit every module, migrate every call site, research five libraries): parallel agents each take a slice and report back. The main session synthesizes. Scale without losing the thread.

**3. The judge panel** — for an expensive, hard-to-reverse decision (architecture, vendor, data model): two or three agents each argue a *different bias* — one optimizes for simplicity, one for robustness, one for cost. The human decides with the trade-offs laid bare, instead of anchoring on the first plausible design. Diversity of perspective catches what redundancy can't.

**4. The process check** — at the close of any non-trivial piece of work: a small independent agent verifies **the choreography, not the code** — was there a plan before execution? criteria before code? did the spec change ship in the same commit as the rule change? did the definition of done actually run? It's the method auditing itself.

## The escalation rule

The process check has a second job: pattern detection. **The same item failing twice doesn't get re-disciplined — it gets mechanized** (a CI check, a hook, a generator). Agents verify; mechanisms enforce; discipline is the fallback, never the plan. This is how the [enforcement layers](method.md#enforcement-in-layers-why-it-holds-without-nagging) grow.

## One hard rule for autonomous agents

Verification agents get **read access scoped away from production** — stated explicitly in their instructions, not just assumed. The scar behind this rule is in the [security surface protocol](security-surface.md#scars-that-shaped-this).
