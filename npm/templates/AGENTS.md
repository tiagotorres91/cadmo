# AGENTS.md — <project name>

> Drop this at the root of your project so any AI pair works the Cadmo way from the first message.
> This is the *local map*: what this project is, where things live, and how to verify. The method
> itself is in AGENTS.md at the Cadmo repo; this file is the project-specific instance.
>
> **AI pair reading this while it still has `<placeholders>`:** your first job is to fill it —
> scan the repository (structure, package files, scripts, CI) and propose the map to your human:
> what the project is, where specs/plans should live, and the actual verify commands. Then remove
> this paragraph.

## What this project is
<one paragraph: the product, the client/owner, the stack>

## Where things live
- Specs / decisions: <path>
- Plans: <path>
- Demands / task board: <where — GitHub issues works; "none yet" is honest>

## How to verify (the harness — run before saying "done")
- Build/type-check: `<command>`
- Tests: `<command>`
- End-to-end / smoke: `<command>`
- Staging URL: <url — or "none: ships as a package / binary / store build">  ·  Production: <url or delivery channel>

## Gates
- Plan approved before building; production ships only with explicit human approval.
- <any project-specific rule or gotcha>

## The method
Opening choreography, definition of done, the layers — see the Cadmo method:
https://github.com/tiagotorres91/cadmo/blob/main/docs/method.md
