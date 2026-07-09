# The collaboration protocol — two humans, two AIs, one repo

This is Cadmo's newest piece, and the one born most AI-native: how a second developer joins a project **without meetings, without onboarding calls, and without losing the gates** — because each developer works in pair with their own AI, and the two AIs coordinate through the repository itself.

It was distilled from real practice: on its first day in production use, an external collaborator — through their AI pair, never having read any internal guide — delivered a dozen merged PRs on a project they had never seen. The protocol below is what made that possible, including the scars.

## The insight

**The repository is the coordination medium.** Not a chat, not a call, not a project manager. Whoever opens the repo — any AI, any developer — inherits the method from three files that travel with the code:

| File | Job |
|---|---|
| `AGENTS.md` / `CLAUDE.md` | the local map: what this is, where things live, how to verify, the gates |
| `CONTRIBUTING.md` | the working protocol (this page, instantiated) |
| an onboarding doc | the project's domain context for a newcomer |

Each human is the "mailman" for their own AI: they trigger their session and deliver its output. Orchestration is distributed — there is deliberately **no permanent orchestrator** (who watches the watcher? — an orchestrating AI is just as probabilistic as the workers, and doubles the cost).

## Roles

- **Maintainer** — owns the main branch, production, and content verification. Reviews everything. The only one who merges.
- **Collaborator** — picks up issues, builds on branches, opens PRs. **Opens a PR and stops.** Never merges, never deploys, never self-approves.

Billing is an architecture decision: heavy work (implementing, writing content) runs on the **collaborator's own AI subscription** — that's what makes the model scale without cost concentrating on the maintainer.

## The channel rules

1. **One demand = one issue.** The issue is the *only* conversation channel. The PR carries code and a `Closes #N` — never discussion. (Splitting conversation across PR comments and issue threads is how context gets lost between AI sessions.)
2. **Spec in the issue body.** The demand arrives specified: goal, acceptance criteria, size guidance. The collaborator's AI reads the issue and starts — no clarification call.
3. **Every review ends with a verdict.** The maintainer closes every round with exactly one of:
   - ✅ **APPROVED** — merged; the round is over.
   - 🔧 **CHANGES** — concrete list; the ball returns to the collaborator.
   - ❓ **DECIDE** — a genuine fork the maintainer wants the collaborator's input on.
4. **Merge is the full stop.** New idea after merge? New issue. Never reopen a merged thread.
5. **Two-round ceiling.** If the same point survives two review rounds, it escalates to the human owners — AIs don't loop forever on a disagreement.
6. **When the maintainer solves it themselves** (urgent, or beyond the collaborator's limits): close the issue with a distinct marker — *"🤖 Resolved by maintainer"* — **not** a verdict. A verdict answers a collaborator's PR; this marker says *"absorb the change, it was never your ball."*

## Context questions — asking without a mail carrier

The protocol's newest piece, distilled from its first real friction: a collaborator's AI needed maintainer context (priority audience? scope appetite?) and there was no structured way to ask — the humans became mail carriers between the AIs. The fix is stigmergic like everything else here:

1. **Before asking, read the cache** — `governance/context.md` (answered questions) and `governance/direction.md` (the maintainer's compass). Most questions die here.
2. **Ask through an issue** (a `context-question` form): one question per issue, what's blocked without it, the options if enumerable, and — crucially — a **default assumption** the agent will act under if no answer comes. An async channel must never deadlock a session.
3. **The answer gets promoted**: the maintainer answers on the issue (verdict ❓ CONTEXT), the answer is written into `governance/context.md`, the issue closes as the audit trail. **Nobody asks twice** — elicitation becomes an accumulating asset, the same way the incident rule makes systems more diagnosable.

Rule zero gains a third list: open `context-question` issues — answered ones get incorporated; your own unanswered blocker means *proceed under the documented default assumption*.

## Sizing what you hand off

Right-size the demand to the handoff: **homogeneous volume scales** (add 10 records, translate 60 names — repeated pattern, low per-item risk: the collaborator parallelizes, the maintainer validates in batch) · **complexity arrives small and with a plan** (logic/architecture changes come as an issue with a phased plan, and the PR opens as a **draft at the risk checkpoint** for an intermediate review before committing the rest) · **new risk gets a spike first** (something with no precedent in the project: an isolated prototype with a measurement, decided before betting the feature on it).

## Rule zero — the infallible inbox

An AI session doesn't get notified while it's away. So every collaborator session **starts with a sweep of two lists**, using the repository's own state as the marker (never memory):

- **List A — the ball is with you:** open issues where the *last* comment is the maintainer's, **or** which have no comments at all (a fresh demand — the spec is in the body).
- **List B — absorb the outcome:** closed issues **not yet acknowledged** — read the final verdict, because the maintainer may have approved *and* adjusted in the merge, or resolved it themselves. Then **the collaborator acks it** (a label like `absorbed`, or a reaction if they lack triage permission). The ack is the "processed" marker — repository state, not memory. Never use a "recent N" window: one productive day of merges overflows it and outcomes die unread.

## Scars that became rules

Real failures from the first days of operation — each one now a rule:

- **Don't filter issues by author.** Issues are usually created by the maintainer, so "my issues" comes back empty for the collaborator. Filter by *who commented last*.
- **Don't filter by "has comments".** A brand-new demand has zero comments — the spec is the issue body. "No comments" means *yours to start*, not *nothing to do*.
- **Every branch starts from up-to-date main.** Chaining branch B on branch A makes the top merge silently miss main. One branch, one PR, base = main. Never stack PRs.
- **Verify the code is on main, not the PR status.** A PR can show "merged" while its changes never landed on main (wrong base). The maintainer checks the real file state before any deploy.
- **A draft PR without `Closes #N` won't close its issue.** Add the link when leaving draft, or close manually.
- **A "recently closed" window loses outcomes.** List B started as "last 5 closed" — then came a 12-merge day, and verdicts fell out of the window unread. The fix is the ack marker above: unacknowledged closures resurface every session, forever, until processed.
- **The merge closes the issue instantly** (via `Closes #N`) — so the maintainer's order is fixed: **verdict comment first, merge second.** Otherwise the issue closes "mute" and the collaborator finds a closure with no outcome.

## Two sessions, one working tree

The protocol above scales *developers* — each with their own repo/checkout, coordinating through issues. A different case is not that, and it bites: two AI sessions running against the **same** checkout at the same time. Uncommitted work from one session gets swept into the other's commit; a `git add .` grabs a half-finished file; a `pull` rebases over live edits. If you must run concurrent sessions on one tree, the hygiene is mandatory: **stage explicit paths** (`git add <path>`, never `.`), **review `git diff --cached`** before every commit, and `pull --rebase` on a clean tree only. The structural fix is **one working tree per session** — a git `worktree` per concurrent session gives each an isolated checkout that shares the one history.

## What this preserves

**Adopting it:** [`templates/CONTRIBUTING.md.template`](../templates/CONTRIBUTING.md.template) is the drop-in instance — roles, rules, and the rule-zero sweep commands, ready to adapt.

The gates survive the scaling: plans still get approved before building, production still ships only through the maintainer, content still gets verified by a human. What disappeared is the coordination overhead — the meetings, the onboarding, the "quick sync". The method travels in the repo; the humans steer; the AIs build and review; the repository remembers.
