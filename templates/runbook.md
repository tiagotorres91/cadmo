# Runbook — <service or failure name>

Runbook-as-code: lives in the repo, versioned with the system it operates. One runbook per failure mode you've actually seen (or credibly expect). If you've never hit it and can't name the trigger, don't write it yet — right-size.

**Owner:** <team or person on call> · **Severity:** SEV1 / SEV2 / SEV3 · **Last drilled:** <YYYY-MM-DD>

## Trigger
When this runbook applies — the observable symptom, not the guess.
- **Alert / signal:** <the alarm, log line, or metric that fires — e.g. "5xx rate > 2% for 5 min", "queue depth > N">
- **Blast radius:** who/what is affected right now.

## Diagnose
Cheapest checks first — confirm it's really this failure before acting.
1. <check> → expected: <value> · if not: <where to look next>
2. <check> → …

## Act
The steps that resolve it. Each step: the exact command or action, and how you know it worked.
1. <command / action> — verify: <observable confirmation>
2. <command / action> — verify: <…>

> Prefer commands over prose. A step you can't paste-and-run at 3am isn't operational.

## Rollback
The undo, if Act makes it worse or doesn't take.
- **Revert:** <exact command / deploy to previous version>
- **Safe state:** what "back to normal" looks like, and how to confirm it.

## Escalate
When to stop trying and hand off — a bounded loop, not heroics.
- **After:** <N minutes without recovery, or if blast radius grows>.
- **To:** <next on-call / vendor / owner> — <how to reach them>.

## After
- File the incident (symptom → cause → correction → **prevention that leaves the system more diagnosable**).
- If the fix changed a business rule, update the stable spec in the same commit.
- If this runbook was wrong or slow, fix it here now — while it still hurts.
