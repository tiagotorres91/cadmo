# Collaboration — scale the pair into a team

> The human+AI pair doesn't scale by putting one human to orchestrate two AIs in a room. It scales when each pair (a human + their own AI) works at its own limit, the method travels in the repository, and the maintainer is the only merge-and-production gate.

**The core insight: the repository *is* the coordination medium.** Whoever opens it — any AI, any developer — inherits the method with no human onboarding.

- **Orient without onboarding** — a contributing guide, an onboarding doc and an agent-instructions file (`AGENTS.md`) live in the repo. The collaborator's AI orients itself.
- **Channel** — one demand, one issue; the issue is where the conversation happens, the PR carries only code (`Closes #N`).
- **Close rounds** — every maintainer review ends with a clear verdict: approved (merge, done) · changes · decide. Merge is the full stop; a new topic is a new issue; a ceiling of two rounds on one point escalates to the human owner.
- **Never lose a reply** — the async doesn't leave orphan messages: a start-of-session sweep of the repository's own state (issues where the ball is with the collaborator; recently closed ones to read the final verdict) is the infallible inbox.
- **Gate** — merges to the main branch, production deploys and content verification belong to the maintainer only. The collaborator opens a PR and stops.

Billing is an architecture decision: heavy work runs on the collaborator's own AI (their limit) — that's how it scales without cost to the maintainer. Genealogy: GitHub Flow / trunk-based development, asynchronous code review, and the repo-as-context idea made native to AI agents.
