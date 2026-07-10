# Privacy policy — Cadmo plugin

**The Cadmo plugin collects nothing.**

- No telemetry, no analytics, no usage tracking.
- No network calls: every component (the `/cadmo:gate`, `/cadmo:spec`, `/cadmo:done` commands, the Stop hook, the `cadmo-method` skill) runs entirely locally inside your Claude Code session.
- No data leaves your machine because of this plugin. The Stop hook reads only your local git state (changed files vs. spec front matter) and prints a reminder to your own session.
- No accounts, no keys, no configuration stored outside your repository.

The plugin's full source is small and auditable: [`plugins/cadmo/`](.) in the [Cadmo repository](https://github.com/tiagotorres91/cadmo).

Questions: open an issue on the repository.
