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
1. **One demand = one issue.** All conversation happens in the issue; the PR carries code + `Closes #N`, nothing else.
2. **The spec is in the issue body** (goal, acceptance criteria, size). Read the whole issue *including comments* before starting.
3. **Every maintainer review ends with a verdict:** ✅ APPROVED (merged, done) · 🔧 CHANGES (apply and resubmit) · ❓ DECIDE (answer and wait). A closed issue may instead carry **"🤖 Resolved by maintainer"** — not your work; just absorb the change.
4. **Merge is the full stop.** New topic → new issue. Two rounds on the same point → it escalates to the humans.
5. **Every branch starts from up-to-date `main`.** Never chain PRs. Verify your change is on `main`, not just that the PR says "merged".
6. **The gates never move to the collaborator:** merges to `main`, releases, and content verification are the maintainer's, always. Branch protection enforces the merge gate mechanically.

**Rule zero — run this at the START of every session** (repository state is the marker, never memory):

- **A — the ball is with you:** open issues with no comments, or where the maintainer commented last.
- **B — outcomes to absorb:** closed issues without the `absorbed` label. Read the final verdict (the maintainer may have adjusted things in the merge), then add the label yourself: `gh issue edit <N> --add-label absorbed`.

```bash
# List A
gh issue list --repo tiagotorres91/cadmo --state open --json number,title,comments \
  --jq '.[] | select((.comments|length)==0 or .comments[-1].author.login=="tiagotorres91") | "#\(.number) \(.title)"'
# List B
gh issue list --repo tiagotorres91/cadmo --state closed --search '-label:absorbed' \
  --json number,title --jq '.[] | "#\(.number) \(.title)"'
```

**Building.** Follow [`AGENTS.md`](AGENTS.md) — the opening choreography, the definition of done, the gates. Highlights that bear repeating: acceptance criteria before code · test the real flow · say explicitly what you didn't test · a change that touches a spec's watched files updates (or re-`--stamp`s) that spec in the same PR.
