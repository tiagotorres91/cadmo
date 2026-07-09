---
watches:
  - npm/index.js
  - npm/templates/**
---
# Getting started — adopt Cadmo in an existing project, in ~10 minutes

You don't migrate to Cadmo; you **turn it on**. Five steps, smallest-first — each one useful on its own, so you can stop anywhere and still be better off.

**The one-sentence version** — if you work with an AI pair, this is the whole setup:

> *"Run `npm create cadmo`, read the Cadmo method (github.com/tiagotorres91/cadmo — `docs/method.md` and `AGENTS.md`), then fill in this project's `AGENTS.md` with me and work the Cadmo way from now on."*

Your AI does the rest — including proposing the map (the scaffolded `AGENTS.md` instructs it to). The steps below are the same journey, unpacked for humans.

## 0. One command (10 seconds)

```bash
npm create cadmo
```

Drops `AGENTS.md`, a `cadmo/` folder (the value-gate, spec, plan and decision templates **plus the spec-drift guard and its workflow**), and — when Claude Code is detected — the `/cadmo-*` slash commands. Nothing is ever overwritten. *(Prefer the [Cadmo plugin](../README.md#roadmap) for the commands? Install it and pass `--no-claude` here — one source, no duplicate spellings.)* The steps below explain what each piece is for; prefer manual? Copy from [`templates/`](../templates/) instead.

## 1. Give your AI the local map (2 min)

Open the `AGENTS.md` it created (or copy [`templates/AGENTS.md.template`](../templates/AGENTS.md.template) yourself) and fill the blanks: what the project is, where things live, **how to verify** (the commands that prove something works), and the gates. From now on, any AI session starts knowing the project — this file is the single non-negotiable piece of the method.

> Using Claude Code? Name it `CLAUDE.md` (or link one to the other). Same idea: the map rides with the repo.

## 2. Turn on the value gate (1 min)

Copy [`templates/value-gate.md`](../templates/value-gate.md) somewhere visible. Rule: **anything relevant** (a new feature, a module, an integration) gets its 5 lines filled *before* anyone writes a spec or code. Trivial fixes skip it. You'll kill your first bad idea within a week — that's the gate paying for itself.

## 3. Write criteria before code (per task, ~5 min each)

For any task with 3+ steps, open a plan file from [`templates/plan.md`](../templates/plan.md) — objective, **acceptance criteria first**, tasks, how to validate. For something genuinely new and relevant, pair it with a [`spec.md`](../templates/spec.md) written in the client's language, and have the client (or their proxy) validate it before you build.

Critical criteria (money, data, integrations, security) go in EARS form — *"WHEN <trigger>, THE SYSTEM SHALL <behavior>"* — because they turn into tests almost word for word.

## 4. Declare the definition of done (2 min)

Add the checklist from [`AGENTS.md`](../AGENTS.md) (the "Definition of done" block) to your `AGENTS.md`. The two habits that change everything: **test the real flow** (not just the linter), and **say explicitly what you didn't test**.

## 5. Let the enforcement grow one layer at a time

Don't build the whole machine on day one. The rule that makes Cadmo self-improving: **when the same failure happens twice, don't re-discipline — mechanize.** A forgotten spec update becomes a CI drift warning; a risky deploy becomes a script that refuses uncommitted work. Each incident donates a mechanism.

---

**Working with a second developer?** Read [`collaboration-protocol.md`](collaboration-protocol.md) — the method travels in the repo, and their AI onboards itself.

**Want to see it whole?** Walk through a complete demand in [`examples/`](../examples/) — gate → spec → plan → done.
