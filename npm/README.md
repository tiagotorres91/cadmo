# create-cadmo

Scaffold the **Cadmo** method into your project — a right-sized method for building software with AI as your pair.

```bash
npm create cadmo
```

Drops into the current directory, never overwriting anything:

- `AGENTS.md` — the local map your AI pair reads first (it will offer to fill it in for you)
- `cadmo/value-gate.md` — 5 lines before any spec: is it worth building?
- `cadmo/spec.md` — the rules, in the client's language, criteria first
- `cadmo/plan.md` — the internal route: tasks, constraints, how to validate
- `cadmo/decision.md` — architecture decisions with a "when to reconsider" trigger
- `cadmo/spec-drift.mjs` + a ready CI workflow — **specs must change with the code they watch** (the drift guard)
- `.claude/commands/cadmo-*.md` — `/cadmo-gate`, `/cadmo-spec`, `/cadmo-done` slash commands (when Claude Code is detected, or `--claude`). **Pick one source for the commands:** if you install the [Cadmo plugin](https://github.com/tiagotorres91/cadmo) (`/plugin install cadmo@cadmo`, which provides `/cadmo:gate` etc.), run the scaffolder with `--no-claude` — otherwise you'll have both spellings.

The method, docs and protocols: **https://github.com/tiagotorres91/cadmo**
