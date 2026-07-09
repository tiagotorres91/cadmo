# ADR 002 — Personal authorship, company as future commercial layer

**Status:** accepted · **Date:** 2026-07-09 · **Deciders:** Tiago Torres

## Context
The method was distilled inside a consultancy. Should the public author be the person or the company?

## Decision
**The person.** Cadmo is authored and maintained by Tiago Torres; the company appears nowhere in the public repo. When a commercial support offer exists in English, it enters as a *"commercial support by…"* line (the open-core pattern: Sidekiq/Contribsys, Plausible) — never as author.

## Alternatives considered
- **Company as author** — why not: methods that win are person-signed (Beck/XP, Nygard/ADR, Madison/BMAD); companies sign only when the company *is* the brand (Google SRE, `github/spec-kit`). And a legal subtlety: the company has more than one stakeholder — signing as the company would make the method a corporate asset by default, a partnership conversation that shouldn't happen implicitly. Personal now is reversible later; the reverse is not.
- **Dual attribution** — why not: dilutes the reputational signal the launch exists to build.

## Consequences
Easier: reputation accrues to the voice that writes and answers. Harder: the commercial funnel must be added explicitly later (deliberate, not accidental).

## When to reconsider
If the method becomes a multi-person product with its own team — then a foundation/org umbrella beats a personal handle.
