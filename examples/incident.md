# An incident, end to end

The Operations pillar in one page. Incidents are **reactive** — they don't get a value gate or a spec. They get four labels, and a rule: *the prevention must leave the system more diagnosable than it was.*

*(Illustrative, based on a real pattern — anonymized.)*

## What happened

A nightly sync pulls a partner's data (a list of projects) into the app. One morning, a dashboard showed half its columns blank. No error had fired; the sync reported success.

## The four labels

**Symptom** — several columns on the projects dashboard went blank overnight. The sync job's logs said "success, 1,200 rows".

**Cause** (verified, not guessed) — the partner renamed some columns on their side. The sync matched columns by *display name*; the renamed ones stopped matching and were silently written as empty. "Success" only meant "the rows loaded" — it never checked that the *columns* were the ones expected.

**Correction** — remapped the changed columns; re-ran the sync; the dashboard recovered. A hotfix, straight to done (no spec — nothing about the product's *rules* changed, only a mapping).

**Prevention (the part that matters)** — the sync endpoint now returns, on every run, `columns_expected`, `columns_matched` and `columns_ignored`. A run that ignores a column it expected now surfaces it — in the response and in an alert — instead of writing silence. **The system can now tell you it's blind; before, it just went blind.**

## Why no spec

Nothing about the product's rules changed — the fix was a mapping and a diagnostic. If the fix *had* changed a business rule (say, "empty columns now block the sync"), that rule would go into the stable spec in the same commit. And if the prevention grew into a real feature ("a column-drift dashboard"), it would leave the incident and become its own demand — with its own value gate.

## The takeaway

Every incident closes by making the system **more observable than the incident found it**. A postmortem that only restores service — without adding the diagnostic that would have caught it — has done half the job. "It works again" is not the finish line; "it would tell us next time" is.
