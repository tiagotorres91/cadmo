# Value gate — CSV export of invoices

**Problem (measurable):** every month the client's team hand-copies ~200 invoices from the app into a spreadsheet for their accountant. ~40 min/month, plus transcription errors that have already caused one wrong tax filing.

**Why this solution:** an export button beats an accounting-system integration (10× the cost, and the accountant changes tools next year anyway) and beats doing nothing (the error risk is real money).

**Success metric (business):** the accountant imports the file directly; hand-copying drops to zero. Check in ~3 weeks.

**Data readiness:** 🟢 — everything already lives in the `invoices` table. One caveat surfaced while filling this in: the accountant's import tool expects **semicolon-separated** values, not commas. (This would have been a returned delivery.)

**Verdict:** GO — small, clear value, data ready.
