# Invoice CSV export — plan (internal)

Pairs with [`spec.md`](spec.md) — criteria live there.

## Objective

Finance stops hand-copying invoices; the accountant imports our file directly.

## Investigation

Considered streaming the CSV from the backend vs generating client-side. Client-side dies on big filters (memory) and can't respect row-level permissions cleanly → backend endpoint. Considered a library for CSV; the format is trivial and the delimiter/locale rules are the *whole* point — hand-rolled 30-liner with tests beats a dependency here.

## Context & constraints

Filters already live in `InvoiceFilter` (backend) — reuse, don't duplicate. Permissions: the endpoint must apply the same row scope as the list view. Don't touch the invoice list rendering.

## Technical plan

- `GET /invoices/export` — accepts the same query params as the list; streams `text/csv`.
- Formatter: semicolon delimiter, UTF-8 BOM, quoted fields, `pt` decimal comma (per spec criterion 2 — test word for word).
- Row-count precheck: >10,000 → `409` with count; frontend shows the narrow-your-filter dialog.
- Button + dialog on `InvoicesPage`, disabled while running.

## Tasks

- [x] Endpoint with filter + permission reuse
- [x] Formatter with the 4 format rules (unit tests mirror EARS criteria)
- [x] Row-count precheck + 409 path
- [x] Frontend button, dialog, loading state
- [x] Staging: real download, opened in the accountant's tool ✓

## How to validate

`npm test` (formatter suite) · staging: export with filters and open the file in LibreOffice with the accountant's import profile · try a >10k filter and confirm the dialog. **Not tested: exports over 50k rows** (no such volume exists in the data; noted to the client).
