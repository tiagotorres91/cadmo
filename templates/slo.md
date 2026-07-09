# SLO — <service or user journey>

> **Right-size it:** start with just the objective + the SLI (a declared target over a real measurement is already 90% of the value). The **error budget + burn policy below are the higher-assurance tier** — add them when the stakes earn the ceremony, not by default.

A declarative service-level objective: state the target, measure it, and decide *in advance* what happens when the budget burns. OpenSLO in spirit, plain markdown in practice. Set targets for what users feel (a journey), not for every internal metric.

**Owner:** <team> · **Status:** proposed / active · **Reviewed:** <YYYY-MM-DD>

## Objective
> <SLI> should be at or above <target> over <window>.

- **SLI (what we measure):** the ratio of good events to valid events — e.g. "requests served < 300ms", "checkouts that succeeded", "sync runs that completed". Define *good* and *valid* precisely enough to compute.
- **Target:** <e.g. 99.5%> — chosen because <the level users actually need; a target of 100% is a bug, it forbids all change>.
- **Window:** <rolling 28 days | calendar month> — rolling windows react faster; calendar windows align to reporting.

## Error budget
The target's complement — how much failure you're allowed to spend.
- **Budget:** <100% − target, e.g. 0.5%> of <window> = <translate to real units: minutes of downtime, count of failed requests>.
- **Measured from:** <where the numbers come from — dashboard, query, log>.

## Burn policy
What the budget *does* — a budget with no consequence is decoration.
- **Healthy (budget remaining):** ship freely.
- **Burning fast (<threshold, e.g. 50% spent mid-window>):** <page on-call | freeze risky deploys>.
- **Exhausted (budget gone):** <halt feature deploys until the window resets or reliability work restores headroom>. Reliability work takes priority over features.

## Alerting
- Alert on **budget burn rate**, not on every breach — page when the trend will exhaust the budget, so alerts mean "act", not "noticed".
- Link the runbook that responds: <path to runbook.md>.

<!-- Review at the cadence above: if the target is never at risk it may be too low; if it's always breached it's aspirational, not an objective. -->
