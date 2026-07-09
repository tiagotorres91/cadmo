# Validation log — the Cadmo public repo

The level-4 surface, applied to this repository itself. Append-only.

| Date | Document / version | Validated by | Verdict | Notes |
|---|---|---|---|---|
| 2026-07-09 | README @ launch (`5614a36`) | Tiago Torres (author, pt-BR read-through) | ✅ approved | hook-first restructure validated before going public |
| 2026-07-09 | whole repo @ `864407c` | independent adversarial review (fresh-context AI, no shared bias) | 🔧 changes | 8 findings: no CLI tests, template drift risk, four/three doc bug, missing level-4 surface, missing version tag, overlaps not credited, moat not implemented, no distribution. Fixed in the commits that followed — see `git log` from `v0.1.0` |
| 2026-07-09 | framework-v2 build @ `v0.3.0` | 5 adversarial reviewers (one per initiative, executed the artifacts) | 🔧 changes | 15 findings incl. a Windows CRLF blocker in the reviewed-state hash, an eval example only a hallucinating model could pass, and a validation row landing in the wrong table. All fixed before commit; behavioral tests added |
| 2026-07-09 | distribution build @ `v0.4.0` | 4 adversarial reviewers (format-checked against the official docs) | 🔧 changes | 14 findings incl. plugin command names derived from filenames (would ship /cadmo:cadmo-gate) and a first-push edge in the action. All fixed; plugin passes `claude plugin validate --strict` |
| 2026-07-09 | guides ↔ Cadmo coherence @ `v0.4.0` | 5-area coherence audit (canonical internal method vs public distillation) | ✅ approved | 12 principle-level drifts found and reconciled on both sides (incl. two contradictions: SLO stance, "runbook" naming; and plan.md regaining its acceptance-criteria home) |
| 2026-07-09 | tooling @ post-`v0.4.0` | round-4 adversarial review (full read of the new 2,500 lines + executed attack demos) | 🔧 changes | 4 findings, all fixed: three divergent grammars unified into `cadmo-grammar.mjs` (the hook carried an already-fixed globstar bug — sync-check now guards the logic copies); `cadmo score` relabeled to *artifact* level + practice hints (level-4 was reachable in 6 file-touches); SUSPECT became diff-scoped (`--suspect-all` for main/scheduled) so innocent PRs don't fail for a skipped stamp; `--verify` hash-poisoning via Notes closed (column-scoped parsing + backtick strip). See issue [#2](https://github.com/tiagotorres91/cadmo/issues/2) |

**Verdicts:** ✅ approved · 🔧 changes requested · 🔁 re-validate.

> This log is the method eating its own cooking: the adversarial review that found the gaps is
> use #1 of [multi-agent](../docs/multi-agent.md) (the independent reviewer), and every finding
> either became a mechanism (tests, drift guards) or a documented artifact (this folder).
