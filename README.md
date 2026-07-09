# Cadmo

**A right-sized method for building software with AI as your pair — the human specifies and decides; the AI writes and verifies.**

AI made writing code fast and cheap. The risk moved from *"it takes too long"* to *"it builds the wrong thing, with confidence."* Cadmo is built for the game that actually matters now: not writing faster — **specifying, verifying and documenting at the speed AI writes.**

> In Greek myth, **Cadmus** brought the alphabet — the written word — to Greece. Cadmo's first principle is the same: **write it down before you build it.** The spec before the code, the decision with its reasoning, the documentation as a living artifact your client validates — and the system obeys.

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
- **Living, client-validated documentation** — specs and decisions aren't a report *about* the system; they're the source the system obeys, published for the client to validate with their signature and the exact version. Documentation that can't drift, because it's the same source the tests enforce.
- **The method travels in the repo** — a collaborator's AI orients itself by opening the repository. No human onboarding required.
- **Enforcement in layers** — what's critical becomes mechanical (CI, gates that refuse), what's behavioral lives in always-loaded instructions, and a fresh-context reviewer catches the rest.

## Status

Early and open. Cadmo was distilled in 2026 from real production use across client and personal projects, pair-programming with [Claude](https://www.anthropic.com/claude). The concepts and templates are open here; it is a living method — expect it to evolve in the open.

## Start here

1. **[`docs/getting-started.md`](docs/getting-started.md)** — turn Cadmo on in an existing project, in ~10 minutes.
2. [`docs/method.md`](docs/method.md) — the whole method in one page; the pillars in [`docs/frameworks/`](docs/frameworks/).
3. [`examples/`](examples/) — one ordinary demand walked end to end: gate → spec → plan → done.
4. [`docs/collaboration-protocol.md`](docs/collaboration-protocol.md) — two humans, two AIs, one repo: how a collaborator's AI onboards itself.
5. Point your own AI at [`AGENTS.md`](AGENTS.md) so it works the Cadmo way from the first message.

## License & attribution

The methodology and docs are licensed **[CC BY 4.0](LICENSE)** — free to use and adapt, **with attribution**. "Cadmo" the name and mark: see [`TRADEMARK.md`](TRADEMARK.md). To cite: [`CITATION.cff`](CITATION.cff).

---

*Cadmo is authored and maintained by [Tiago Torres](https://github.com/tiagotorres91) (B2B Soluções em TI). Contributions welcome — see [`CONTRIBUTING.md`](CONTRIBUTING.md).*
