# ADR 001 — The name: Cadmo

**Status:** accepted · **Date:** 2026-07-08 · **Deciders:** Tiago Torres (with AI-pair analysis)

## Context
A method going public needs an ownable name. Requirements that emerged: tell the method's thesis, be distinctive enough to own (trademark/SEO), have a clean namespace (npm, GitHub, domain), and ideally encode the five pillars.

## Decision
**Cadmo** — Portuguese for Cadmus, the mythological figure who brought the alphabet (the written word) to Greece, matching the method's first principle ("write it down before you build it"). Also an acronym of the five pillars: **C**ollaboration · **A**pplication · **D**evelopment · **M**anagement · **O**perations.

## Alternatives considered (all really evaluated, with namespace checks)
- **Cadmus** (English form) — why not: npm `cadmus` taken, github `cadmus` taken, Cadmus Group is a large US consultancy (same macro-sector — real mark risk), DC Comics "Project Cadmus" pollutes search; and the 6 letters break the 5-pillar acronym.
- **Tower / Torres** (the author's surname translated) — why not: `git-tower` and Ansible Tower saturate the dev namespace; generic English word = weak mark; and the most famous mythical tower is Babel — the *collapse* of communication.
- **Symbiosis** — why not: the #1 cliché of human-AI discourse (unownable), npm and github taken (Symbiosis Finance), describes one feature (the pair), not the thesis (the writing).
- **PairSpec** — why not: instantly readable but generic; descriptive names are weak to own. Kept as the "zero-friction" fallback.

## Consequences
Easier: distinctive brand, clean namespace (`create-cadmo`, cadmo.dev), a story that carries the thesis. Harder: anglophones need one line of explanation ("Cadmo is Cadmus in Portuguese — the method was born in Brazil"), which the README provides.

## When to reconsider
If pronunciation/recognition friction shows up as a *measured* adoption problem (people consistently misnaming or failing to find it) — not on vibes.
