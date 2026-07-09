# Validation log — <spec or document name>

The level-4 (Governed) surface: where the client's acceptance is recorded against the *exact version*.
One row per validation event. Append-only — never edit a past row; a changed document gets a new row.

| Date | Document version | Validated by | Verdict | Notes |
|---|---|---|---|---|
| 2026-06-12 | `spec-export` @ `a3f9b2c` | Ana Silva (client, Finance) | ✅ approved | — |
| 2026-07-01 | `spec-export` @ `d71e044` | Ana Silva | 🔁 re-validate | column order changed; awaiting sign-off |

**Verdicts:** ✅ approved · 🔧 changes requested · 🔁 re-validate (the document changed after a prior approval).

## Why version-pinned

An approval is only meaningful against the exact text that was approved. Pin the version (a commit
hash, a content hash, or a document version tag) so "the client signed off" can never silently mean
"…on a version that no longer exists." When the document changes, its prior approval doesn't carry
over — the row goes to 🔁 and a new approval is due.

> Where this lives: in a lightweight setup, this file in the repo is enough. At higher assurance,
> the same record is a row in a database with an immutable audit trail (who, when, which version) —
> the principle is identical, only the storage hardens.
