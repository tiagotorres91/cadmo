# Contributing to Cadmo

Cadmo is a living method — improvements from real practice are exactly what it needs. And this repo
runs on its own [collaboration protocol](docs/collaboration-protocol.md): the method travels in the
repo, your AI orients itself from `AGENTS.md`, and the maintainer is the only gate to `main`.

## Quick version (occasional contributor)

- **Found a gap, a sharper phrasing, or a real case?** Open an issue.
- **Proposing a change?** One topic per issue; open a PR from a branch off up-to-date `main` that closes it (`Closes #N`). Keep each PR focused.
- **New pattern or framework piece?** Read [`governance/direction.md`](governance/direction.md) first (where this is going, the audience, the open-core boundary, current freeze) — then explain the *real problem* it solves, ideally as a 5-line value gate. Cadmo only adds what solves a problem someone actually has.
- Right-sizing is the meta-principle: prefer the smallest change that does the job. Docs are the product — write the *why*, not just the *what*.

By contributing, you agree your contributions are licensed under CC BY 4.0 (docs) / MIT (code).

## Working protocol (regular collaborator + their AI)

The full rationale and the scars behind each rule are in [`docs/collaboration-protocol.md`](docs/collaboration-protocol.md). The operational instance:

**Roles.** The **maintainer** ([@tiagotorres91](https://github.com/tiagotorres91)) owns `main`, releases, and content verification — reviews everything, merges everything. A **collaborator** picks up issues, builds on branches from up-to-date `main`, opens PRs — **and stops.** Never merges, never tags a release.

**The rules.**
1. **One demand = one issue.** All conversation happens in the issue; the PR carries code + `Closes #N`, nothing else — except **one state-marker comment on the issue when the PR opens** ("PR #N open — with the maintainer"), so no later session re-picks the demand.
2. **The spec is in the issue body** (goal, acceptance criteria, size). Read the whole issue *including comments* before starting.
3. **Every maintainer review ends with a verdict:** ✅ APPROVED (merged, done) · 🔧 CHANGES (apply and resubmit) · ❓ DECIDE (answer and wait) · ❓ CONTEXT (a context-question got its answer — promoted to `governance/context.md`). A closed issue may instead carry **"🤖 Resolved by maintainer"** — not your work; just absorb the change.
4. **Merge is the full stop.** New topic → new issue. Two rounds on the same point → it escalates to the humans; the maintainer marks it with the `escalated` label (rule zero skips it) and the human decision re-enters as a verdict that removes the label.
5. **Every branch starts from up-to-date `main`.** Never chain PRs. Verify your change is on `main`, not just that the PR says "merged".
6. **The gates never move to the collaborator:** merges to `main`, releases, and content verification are the maintainer's, always. Branch protection enforces the merge gate mechanically.

**Rule zero — run this at the START of every session** (repository state is the marker, never memory):

- **A — the ball is with you:** open issues with no comments, or where the maintainer commented last — **skipping issues assigned to someone else, and skipping `escalated`**. Before you start one: **assign yourself** (`gh issue edit <N> --add-assignee @me`) — the assignee is the claim.
- **B — outcomes to absorb:** closed issues without the `absorbed` label. Read the final verdict (the maintainer may have adjusted things in the merge), then add the label yourself: `gh issue edit <N> --add-label absorbed`. (No triage permission? React 👍 on the closing comment — the maintainer mirrors reactions into the label on their next sweep.)
- **C — context questions:** open issues labeled `context-question` that got an answer → incorporate it and check it was promoted to [`governance/context.md`](governance/context.md); your own unanswered blocking question → proceed under its documented `default-assumption` (never deadlock waiting).

## Context questions — the elicitation channel

When an agent needs maintainer context to proceed (audience? convention? a ruling?), the human must not become a mail carrier between AIs. The channel: **before asking, check [`governance/context.md`](governance/context.md) and [`governance/direction.md`](governance/direction.md)** — then open a [context-question issue](https://github.com/tiagotorres91/cadmo/issues/new?template=context-question.yml) (one question per issue; state what's blocked and your default assumption). The maintainer answers with the verdict **❓ CONTEXT → answered** on the issue; the answer is **promoted to `context.md`** (the cache — nobody asks twice) and the issue closes as the audit trail.

```bash
# List A — two native queries: unclaimed + claimed by you (skip escalated in both)
gh issue list --repo tiagotorres91/cadmo --state open --search 'no:assignee -label:escalated' \
  --json number,title,comments \
  --jq '.[] | select((.comments|length)==0 or .comments[-1].author.login=="tiagotorres91") | "#\(.number) \(.title)"'
gh issue list --repo tiagotorres91/cadmo --state open --assignee "@me" --search '-label:escalated' \
  --json number,title,comments \
  --jq '.[] | select((.comments|length)==0 or .comments[-1].author.login=="tiagotorres91") | "#\(.number) \(.title)"'
# List B
gh issue list --repo tiagotorres91/cadmo --state closed --search '-label:absorbed' \
  --json number,title --jq '.[] | "#\(.number) \(.title)"'
```

**Building.** Follow [`AGENTS.md`](AGENTS.md) — the opening choreography, the definition of done, the gates. Highlights that bear repeating: acceptance criteria before code · test the real flow · say explicitly what you didn't test · a change that touches a spec's watched files updates (or re-`--stamp`s) that spec in the same PR.
