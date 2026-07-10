<p align="right"><b>English</b> | <a href="README.pt-BR.md">Português</a></p>

<p align="center"><img src="media/banner.svg" alt="Cadmo — write it down before you build it" width="880"></p>

<p align="center">
  <a href="https://www.npmjs.com/package/create-cadmo"><img src="https://img.shields.io/npm/v/create-cadmo?label=create-cadmo&color=0891B2" alt="npm"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/docs-CC%20BY%204.0-0891B2" alt="CC BY 4.0"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/code-MIT-0891B2" alt="MIT"></a>
  <a href="CONTRIBUTING.md"><img src="https://img.shields.io/badge/PRs-welcome-0A7A2F" alt="PRs welcome"></a>
</p>

# Cadmo

**A right-sized method for building software with AI as your pair — the human specifies and decides; the AI writes and verifies.**

```bash
npm create cadmo
```
*One command drops the method into your project: `AGENTS.md` (the map your AI reads first), the value-gate, spec, plan and decision templates, plus the spec-drift guard and its ready CI workflow. Nothing is ever overwritten.*

## See it in action

The method is lived as a conversation. This is what the slash commands (installed automatically when a `CLAUDE.md`/`.claude` folder is present — or via `npm create cadmo -- --claude`) look like in use:

```text
You: /cadmo-gate export invoices to CSV
AI:  Before any spec — what hurts today, in numbers?
You: finance hand-copies ~200 invoices/month for the accountant. ~40 min, plus errors.
AI:  Cheaper alternative considered — a report, a shared view, doing nothing?
You: the accountant's tool imports files; a view won't cut it.
AI:  Success metric?
You: hand-copying drops to zero.
AI:  Gate drafted (5 lines). Data is green, one caveat found while checking:
     the tool needs SEMICOLONS, not commas — that would have been a returned
     delivery. Verdict is yours: GO?
You: GO. /cadmo-spec
AI:  Spec drafted — criteria first, the delimiter rule in EARS form
     ("WHEN the user exports, THE SYSTEM SHALL produce a semicolon-separated
     file..."). Validate it before I build anything.

     ...the build happens, in small verified batches...

You: /cadmo-done
AI:  Build+tests pass · real download opened in the accountant's tool on
     staging · criteria checked 4/4 · spec-drift clean.
     NOT tested: exports over 50k rows (no such volume exists in the data).
     Verdict: ready to ship — one caveat, said out loud.
```

The five-line gate caught the real requirement (the delimiter) before any code existed. The spec was validated by a human *before* the build. And "done" included saying what *wasn't* tested. That's the whole method in one exchange — the full walkthrough with the actual artifacts is in [`examples/`](examples/).

AI made writing code fast and cheap. The risk moved from *"it takes too long"* to *"it builds the wrong thing, with confidence."* Cadmo is built for the game that actually matters now: not writing faster — **specifying, verifying and documenting at the speed AI writes.**

> In Greek myth, **Cadmus** brought the alphabet — the written word — to Greece. *Cadmo* is his name in Portuguese — the method was born in Brazil. Its first principle is the same: **write it down before you build it.** The spec before the code, the decision with its reasoning, the documentation as a living artifact your client validates — and the system obeys.

<sub>The name is also an acronym of the five pillars: **C**ollaboration · **A**pplication · **D**evelopment · **M**anagement · **O**perations.</sub>

---

## Who it's for

Solo consultants and small teams shipping production software for real clients — operations too lean for enterprise process, too accountable for no process. If you build with AI and someone else depends on what you ship, Cadmo is sized for you.

## Why

Building with AI fails in a specific way: black-box systems only their author can explain, governance no client can audit, knowledge that lives in one person's head and walks out the door. Cadmo answers by **inverting where the care is spent**: rigor *before* the code (specify the rules, get them validated) and *after* it (tests derived from the specs, a definition of done, verification in staging) — so the middle, the execution, can be fast without being reckless.

It is **not** bureaucracy (right-sizing is the meta-principle — trivial work stays trivial), **not** blind trust in AI (human gates and a verification harness exist precisely because an unverified agent hallucinates completion), and **not** an off-the-shelf process — it's a pragmatic hybrid of the traditions that actually work, sized for a lean operation that still answers to clients who demand governance.

## The five pillars

| Pillar | Question it answers | In one line |
|---|---|---|
| 🗂️ **Management** | Is it worth building? Did it deliver the value? | Every relevant demand passes a value gate before a spec; after delivery, the benefit is checked. |
| 🛠️ **Development** | Are we building it right? | Rules are written *before* the code; tests derived from them run on every change; nothing ships without human approval. |
| ⚙️ **Operations** | Is it live and reliable? | Continuous monitoring, every data load logged, every incident yielding a prevention that makes the system *more diagnosable*. |
| 🤝 **Collaboration** | How does a second developer join without losing the gates? | The method travels in the repo; each dev runs their own AI; the maintainer is the only merge/production gate. |
| 🧭 **Application** | How do we instantiate all of this for a new client/project? | A right-sized checklist — the assembly line that turns the generic method into a running instance. |

The three cores (Management, Development, Operations) cover the full lifecycle: **decide → build → maintain** (and the loop feeds back). Collaboration scales the pair into a team; Application is how the whole thing gets installed somewhere new.

## What's distinctive

- **AI as an engineering pair, not an assistant** — the human specifies and decides; the AI writes and verifies. The bottleneck moved from *writing* to *verifying*, and the method is built around winning that.
- **Documentation that cannot silently lie** — a spec declares which files implement it (`watches:`), and [a small dependency-free CI check](docs/spec-drift.md) fails any change that touches those files without updating the spec. Client-validated docs with signature + exact version, kept true by a mechanism, not by discipline.
- **The method travels in the repo** — a collaborator's AI orients itself by opening the repository. No human onboarding required.
- **Enforcement in layers** — what's critical becomes mechanical (CI, gates that refuse), what's behavioral lives in always-loaded instructions, and a fresh-context reviewer catches the rest.

## Status

Early and open. Cadmo was distilled in 2026 from real production use across client and personal projects, pair-programming with [Claude](https://www.anthropic.com/claude). The concepts and templates are open here; it is a living method — expect it to evolve in the open.

## Start here — routed by what you need

- **Just want it running?** → `npm create cadmo`, then [`docs/getting-started.md`](docs/getting-started.md) (~10 minutes).
- **Want the whole method first?** → [`docs/method.md`](docs/method.md) (one page); the pillars in [`docs/frameworks/`](docs/frameworks/).
- **"Show me, don't tell me"** → the transcript above, then [`examples/`](examples/) (a demand end to end) and [`governance/`](governance/) (this repo's own real artifacts).
- **A second developer is joining (with their own AI)?** → [`docs/collaboration-protocol.md`](docs/collaboration-protocol.md).
- **Shipping for clients who demand accountability?** → [`docs/maturity.md`](docs/maturity.md) (aim at level 4) + the [validation log template](templates/validation-log.md) + [`docs/spec-drift.md`](docs/spec-drift.md).
- **Worried about security with AI-written code?** → [`docs/security-surface.md`](docs/security-surface.md).
- **Tempted to build an agent org-chart?** → [`docs/multi-agent.md`](docs/multi-agent.md) first.
- **Skeptical?** → [`docs/faq.md`](docs/faq.md) — including "isn't this just Spec Kit?".
- **Want to contribute or propose?** → [`governance/direction.md`](governance/direction.md) (where this is going) then [`CONTRIBUTING.md`](CONTRIBUTING.md).

And point your own AI at [`AGENTS.md`](AGENTS.md) so it works the Cadmo way from the first message.

## Use it with, not against

[Spec Kit](https://github.com/github/spec-kit), [OpenSpec](https://github.com/Fission-AI/OpenSpec) and [BMAD](https://github.com/bmad-code-org/BMAD-METHOD) are excellent engines for the middle of the lifecycle — turning a spec into code. Cadmo doesn't compete there; it **wraps that middle** with the parts a client engagement needs on either side. Run your favorite as the engine of the Development pillar — Cadmo is the chassis.

| Lifecycle stage | Cadmo | Spec-to-code tools (Spec Kit / OpenSpec / BMAD) |
|---|---|---|
| Decide *if it's worth building* (business value gate) | ● | ○ |
| Turn a spec into code | ◐ *(bring your own engine)* | ● *(their strength)* |
| Enforce spec↔code drift in CI | ● | ◐ |
| Keep it live (monitoring, incidents, support) | ● | ○ |
| Client validates docs (signature + version) & value is checked after | ● | ○ |

<sub>● covers it · ◐ partial · ○ not its focus. This is a map of *layers*, not a scoreboard — those tools are strong precisely where Cadmo deliberately delegates.</sub>

The [genealogy](docs/frameworks/genealogy.md) credits what each tradition contributed, including where they converged with us (OpenSpec's archive ≈ our absorption; BMAD ships an adversarial reviewer; AWS's AI-DLC arrived independently at right-sizing).

## Governance of this repo

Does the framework have the artifacts the framework proposes? **Yes — real ones.** [`governance/`](governance/) holds this project's own value gate, its decision records (with the alternatives that actually lost — including a protocol fix born from a real failure), and its validation log (including the adversarial review that found this repo's own gaps). The non-fictional companion to [`examples/`](examples/).

## Roadmap

- ✅ `npm create cadmo` — scaffold the method into a project (drift guard + Claude Code slash commands)
- ✅ Spec-drift enforcement — [the mechanism](docs/spec-drift.md), with an opt-in reviewed-state (`--stamp` / SUSPECT) layer, dogfooded on this repo
- ✅ `node tools/cadmo-score.mjs` — [the maturity ladder](docs/maturity.md) as a self-check · `cadmo-validate` — pin a client approval to the exact version
- ✅ Worked examples across all five pillars, incl. a [runnable eval kit](examples/eval-kit/) and an [incident](examples/incident.md); ops [runbook](templates/runbook.md)/[SLO](templates/slo.md) + a [compliance map](docs/compliance-map.md)
- ✅ **Claude Code plugin** — `/plugin marketplace add tiagotorres91/cadmo` then `/plugin install cadmo@cadmo` (the `/cadmo:gate` · `/cadmo:spec` · `/cadmo:done` commands + a Stop hook + the `cadmo-method` skill) · a cross-agent [`cadmo-method` skill](skills/cadmo-method/SKILL.md) (Claude Code / Codex / Copilot) · a reusable [`spec-drift-action`](spec-drift-action/) (`uses: tiagotorres91/cadmo/spec-drift-action@v0.4.2`)
- ⏳ cadmo.dev — the method as a browsable site · publishing to the plugin/action marketplaces
- 💬 Ideas and war stories → [Discussions](https://github.com/tiagotorres91/cadmo/discussions)

## License & attribution

The methodology and docs are licensed **[CC BY 4.0](LICENSE)** — free to use and adapt, **with attribution**. "Cadmo" the name and mark: see [`TRADEMARK.md`](TRADEMARK.md). To cite: [`CITATION.cff`](CITATION.cff).

---

*Cadmo is authored and maintained by [Tiago Torres](https://github.com/tiagotorres91). Contributions welcome — see [`CONTRIBUTING.md`](CONTRIBUTING.md).*
