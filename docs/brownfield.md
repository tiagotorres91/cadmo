# Brownfield — reconcile the map before you trust it

*"You don't migrate to Cadmo; you turn it on"* is true of the **mechanism**: the templates, the gate and the guard install in minutes on any repo. The **map** is the exception. Turning on assumes an `AGENTS.md` can be written truthfully today — and on a repo with a history, the documents you'd write it from may already be lying.

That failure mode is worse than having no map at all. Rung 1 is where every adopter starts, but a map distilled from lying docs is **confident fiction** — precisely what this method exists to kill. Written from code, day 0 stays honest; written from prose, it inherits every claim nobody re-checked.

The scars below come from one real adoption (a live, vibe-coded React Native app): the docs described **seven Cloud Functions with an email-verification relink flow; the code had two** — a refactor had replaced the model months earlier and no document followed. The stack section declared a styling framework and a form library that were installed but never wired: *no* code used either.

## The reconciliation loop

**1. Audit sweep — code wins.** Every claim in the existing docs gets checked against the code, and disagreement is resolved in the code's favour, always. Use resolver or graph tools, not text search: grep handed us **two false verdicts** in this sweep — a substring match that "found" a symbol that wasn't there, and a file-versus-directory name collision.

**2. Write the map from the code, never from the docs.** The old documents are **quarantined as historical** and labelled as such in the new map — never silently deleted (they hold intent you'll want) and never silently trusted.

**3. Adversarially fact-check the new map *before* merging it.** Fresh-context reviewers, told to hunt discrepancies rather than confirm the draft (the [independent reviewer](multi-agent.md#the-five-uses)). In our own rewrite they found **8 discrepancies, 2 of them outright errors**: a directory that does not exist, and an architecture rule stated as fact that several screens violate. The map now records that violation as *honest debt* instead of pretending the pattern holds.

> This step is not optional. **A map written from memory lies the same way the old docs did** — the author is different, the mechanism is identical. Only verification keeps rung 1 honest.

**4. Put the first as-built spec on the riskiest surface, with `watches:`.** Not a wish-list spec: the behaviour as it exists today, in EARS, mirroring the code — for us, the auth Cloud Functions and the database rules. The reconciled truth immediately gets a [mechanism](spec-drift.md) holding it, instead of depending on anyone's discipline.

**5. Prove the guard fires before trusting it.** Touch a watched file without touching its spec and confirm CI fails. A guard nobody has seen fire is prose, not enforcement.

## Right-sizing this

The loop is for repos whose documents **exist and make claims**. If yours are thin, stale-but-known-stale, or absent, skip straight to writing the map from the code — absence is honest, and honest is cheap to fix. Budget the sweep by risk, not by completeness: the surfaces that move money, data, auth or integrations earn step 1 and step 4; a settings screen does not.

The loop runs once. What comes out of it — a true map and one spec with a guard — is the same rung 1 everyone else starts at, except yours survived contact with the code.
