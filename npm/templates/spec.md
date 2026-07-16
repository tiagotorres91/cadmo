<!-- To enforce this spec against code, add real YAML front matter as the VERY FIRST lines:
---
watches:
  - src/the-area-this-governs/**
  - api/the-endpoint.py
---
Then spec-drift fails any change to those files that doesn't update this spec.

Pending questions: every real open point is a [NEEDS CLARIFICATION: objective question — who answers]
marker in the text — greppable and countable; a spec with an open marker is not ready for validation. -->

# Spec — <name>

**Status:** draft — awaiting validation (<who>)  ·  **Demand:** <link/id>

## Goal & context
The business problem and what changes in the world (2–5 lines, in the client's language).
(Relevant work already passed the value gate — its success metric becomes an acceptance criterion here.)

## Acceptance criteria
- [ ] Simple ones in free form
- [ ] Critical ones (money / data / integration / security) in EARS:
      WHEN <trigger>, THE SYSTEM SHALL <behavior>

## Data (AI features only)
Source, owner, access, quality/bias, corpus refresh plan.

## Risks (critical or AI demands only)
Risk → response. For AI: corpus drift, provider API change, cost, regulation.

## Out of scope
What this delivery does NOT cover (controlled expectations).

## Impact on stable specs
Which sections of the system/domain specs will be updated on delivery (the absorption).

## Impact on existing data (only if this touches persisted state)
Does this change data that already exists — a DB schema/migration, saved user records, files a
prior version produced? Name what existing data is affected and the migration/backfill plan (or
"none — new data only"). A rule that changes *how* something is computed does not retroactively
fix rows already written; say how the old ones are handled.

<!-- REVIEW CHECKLIST — run before calling this spec ready for validation (/cadmo:done checks it;
     this comment never renders and never ships to the client):
  [ ] Describes only the SYSTEM — zero process narrative ("validated/implemented/discovered on <date>", sessions, agents)
  [ ] No team log, no meeting dates — the technical fact stands on its own
  [ ] Self-contained for handover: references are files IN this repo (path from root) or the imported essence (2-6 lines); public citations carry a URL
  [ ] Every open point is a [NEEDS CLARIFICATION: ...] marker — never a loose phrase
  [ ] Internal terms defined at first use
  [ ] Status changes only with the CLIENT's validation; before the first validation, edit clean — revision history protects what was approved, not drafts
-->
