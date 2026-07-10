# ADR 002 — Collaboration inbox: ack label, not a recency window

**Status:** accepted · **Date:** 2026-07-09 · **Deciders:** maintainer + collaborator pairs (from a real failure)

## Context
In the collaboration protocol, the collaborator's session must absorb the outcomes of closed issues ("rule zero", list B). The first implementation listed *the 5 most recently closed issues*. Then a productive day closed 12 — and 7 outcomes (including "approved BUT adjusted in the merge" verdicts) fell out of the window **unread**, with nothing alarming. Worse: even inside the window, "did I already read this?" depended on session memory — violating the protocol's own principle (*repository state is the marker, never memory*).

## Decision
An explicit **acknowledgment marker**: the collaborator adds a label (e.g. `absorbed`) to each closed issue after reading its outcome. List B becomes *"closed issues without the label"* — resurfacing every session, forever, until processed. No window. No memory.

## Alternatives considered
- **Bigger window (top-20)** — why not: same failure, later; any N loses a busy-enough day.
- **Reactions as the marker** — why not: querying "which issues lack MY reaction" is expensive/awkward; a label is one `--search '-label:absorbed'`. Reactions survive only as an **ack-request** for a collaborator without triage permission: the maintainer mirrors them into the label on their own sweep, so the label remains the single queryable truth (a fallback the sweep can't read would resurface acked issues forever — the same failure this ADR kills).
- **Timestamps ("closed since my last session")** — why not: "my last session" is exactly the memory the protocol forbids relying on.

## Consequences
Easier: zero lost outcomes, and the inbox is auditable by anyone. Harder: the collaborator needs triage permission (or the reaction fallback); a one-time catch-up over historical closures.

## When to reconsider
If native agent-to-agent notification lands in the tooling (see anthropics/claude-code#28300) — the ack layer may move from labels to a delivery receipt, but the *principle* (explicit acknowledgment over recency) should survive the transport change.
