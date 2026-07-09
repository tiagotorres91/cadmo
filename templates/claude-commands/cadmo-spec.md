# /cadmo-spec — write the spec, criteria first

Write the spec for: **$ARGUMENTS**

Use `cadmo/spec.md` as the skeleton. Rules:

1. **Goal in the client's language** — 2-5 lines a non-developer validates. No jargon.
2. **Acceptance criteria before anything else** — each one observable and specific. For critical ones (money, data, integrations, security) use EARS: *"WHEN <trigger>, THE SYSTEM SHALL <behavior>"* — they become tests almost word for word.
3. **Out of scope** — name what this does NOT cover.
4. **Impact on stable specs** — which existing documented rules will absorb this on delivery. If this spec should be *watched* against code, add the `watches:` front matter (see `cadmo/spec-drift.mjs`).
5. Then pair it with a plan (`cadmo/plan.md`) — technical route, tasks, how to validate. Don't repeat the criteria there.

Stop after the spec and ask me to validate it **before** writing any code. If it changes money, data or an external integration, remind me the client (or their proxy) validates it first.
