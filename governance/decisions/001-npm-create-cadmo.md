# ADR 001 — npm name: `create-cadmo` (the bare name is frozen, and that's fine)

**Status:** accepted · **Date:** 2026-07-09 · **Deciders:** Tiago Torres

## Context
Publishing the scaffolder, npm's typosquat filter rejected the bare name `cadmo` ("too similar to existing package *caduk*"). This block applies to **every** account — nobody can take the bare name.

## Decision
Publish as **`create-cadmo`** — the ecosystem's convention for scaffolders, which gives users the idiomatic invocation:

```bash
npm create cadmo
```

## Alternatives considered
- **Scoped `@tiagotorres91/cadmo`** — why not: survives the filter but reads as a personal util, not a tool; and `npm create` doesn't resolve scoped names as cleanly for strangers.
- **Fight the filter (npm support)** — why not: days of process for a worse name than the convention already offered.

## Consequences
Easier: `npm create cadmo` is *better* branding than `npx cadmo` (the create-convention is what users already type for Vite/Next/Astro). The frozen bare name is de-facto protection: no squatter can take `cadmo` either. Harder: none found yet.

## When to reconsider
If npm's similarity rules change and the bare name opens — grab it as an alias, keep `create-cadmo` canonical.
