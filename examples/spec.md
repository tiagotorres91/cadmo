# Spec — Invoice CSV export

**Status:** validated by client (Ana, 2026-06-12) · **Demand:** #47

## Goal & context

The finance team sends monthly invoice data to the external accountant. Today that's manual copying — slow and error-prone. This adds an **Export CSV** button to the invoices screen that produces a file the accountant's tool imports directly.

## Acceptance criteria

- [ ] An **Export CSV** button on the invoices screen exports **exactly the rows matching the current filters** (period, status, client).
- [ ] WHEN the user exports, THE SYSTEM SHALL produce a semicolon-separated file, UTF-8 with BOM, with the columns: number; date; client; net amount; tax; total; status. *(EARS — this is the accountant-compatibility rule, the criterion that carries money.)*
- [ ] WHEN an export matches more than 10,000 rows, THE SYSTEM SHALL warn and offer to narrow the filter instead of freezing the browser.
- [ ] Amounts use comma as the decimal separator (the accountant's locale), quoted so the semicolons don't split them.

## Out of scope

Scheduled/automatic exports; PDF export; changing which columns exist (that's the accountant's current template, frozen).

## Impact on stable specs

On delivery, `docs/invoicing.md` gains an **Exports** section with these rules; this file is then absorbed and archived.
