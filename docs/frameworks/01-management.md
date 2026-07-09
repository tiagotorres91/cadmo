# Management — decide what, when, and *if it's worth*

> Development builds it right; Operations keeps it live. Neither asks whether it was worth building, or whether the promised value showed up. That's Management.

**Pillars:** Capture → Prioritize → Track → Decide → Close.

- **Capture** — every need becomes a recorded demand in one place, in a canonical format. Relevant ones pass a **value gate** first (a ~5-line business case: measurable problem · why this solution · business success metric · data readiness) *before* any spec.
- **Prioritize** — by urgency and continuous flow (no fixed sprints); critical demands (money/data/integration) declare their risks with responses.
- **Track** — nobody has to ask "how's it going": a board shows it, a daily async pass surfaces what's urgent, and a short status report keeps the client seeing progress. **One report per client**: the management status and the operations indicators merge into a single document — never two.
- **Decide** — business decisions and architecture decisions each have their place, recorded with the *why*; approvals are always human.
- **Close** — three seals: it *works* (definition of done), it *followed the method* (a process check), and it *delivered the value* (revisited weeks after — even to kill what didn't). Closing also covers **decommissioning**: when a system retires, a lightweight checklist (export/backup the data · revoke and rotate credentials · communicate + redirect · archive the repo as historical · record what died and why) — systems deserve an orderly death, not abandonment.

**What deserves to become a system — the process maturity test.** Before the value gate even asks "is X worth building?", Capture asks "*which* X deserves to reach the gate?" Rate each of the client's processes: **1 ad-hoc** (done differently every time, lives in people's heads) · **2 defined** (has an owner and known steps, manual) · **3 standardized** (same way every time — a spreadsheet, a form) · **4 measured** (has numbers) · **5 systematized**. The golden rule: **automation requires level 3+** — automating chaos just accelerates the chaos; a level-1 process gets standardized first, systematized second. Strong candidates are repetitive + standardized + high-volume + measurably painful + already producing data. (Every good system we've shipped started life as somebody's overloaded spreadsheet.)

The distinctive move: closing on **value realized**, not just "it works". Informed by PMBOK 8 (value on entry and exit; tailoring), CPMAI (go/no-go for AI work; data readiness) and the Standard for AI (AI-specific risks; model cards).
