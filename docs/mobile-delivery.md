# Mobile delivery — when production is granted, not deployed

The [operations pillars](frameworks/03-operations.md) assume web-ish physics: staging mirrors production, and a deploy is something you *run*. An app store breaks three of those assumptions at once. The pillars don't change — this page is the terrain translation, written from a real adoption (React Native + Expo, live via TestFlight).

## The ladder replaces the staging URL

There is no staging URL. There is a **ladder**, and each rung has a different audience and a different turnaround:

| Rung | Who sees it | Turnaround |
|---|---|---|
| dev client | you | seconds |
| internal distribution (ad-hoc build) | the team | minutes |
| TestFlight / Play internal | the client, real testers | hours |
| store review | the reviewer | hours to days |
| production | everyone | after the grant |

The map (`AGENTS.md`) names your rungs in the `Delivery ladder:` line. Web isn't an exception — it's a **one-rung ladder** (`staging URL → production`). Same line, shorter climb.

## Production is granted, not run

An external reviewer sits between *"the human approved it"* and *"users have it"*. The human gate stays necessary and stops being sufficient — so **"done" splits into merged, submitted, and granted**. Naming which rung a change is on is now part of an honest definition of done: "shipped" with a build sitting in review is the mobile spelling of a lie.

## OTA splits production in two

With over-the-air updates, a runtime-version policy decides which installed binaries receive which JS bundle — so two users on "production" can be running different code. A wrong bump strands users on dead code, and the failure is silent for whoever isn't holding that binary.

The decision rule: **JS-only change inside the same runtime → OTA. Anything touching native modules, permissions, or the runtime version → new binary, back up the ladder.** When in doubt, ship the binary; a needless build costs hours, a wrong OTA costs users you can't see.

**The version-canonicity law (worked example).** The adoption that produced this page found *three* divergent version numbers in one repo: `package.json` at 0.1.0, the CHANGELOG at 0.1.1, and `app.json` at 1.1.0 — and `app.json` is the one that actually governs OTA delivery. Two of the three were decoration. The law that closed it: **whichever file the delivery mechanism reads is canonical; it is named in the map, and every other version follows it in the same commit.** One fact, one source — applied to the number that decides who gets your code.

## Deferred verification: criteria that outlive the merge

*"Validated in staging"* becomes *"validated on the next TestFlight build"* — an acceptance criterion that can lag the merge by days. The honest-DoD rule (**say explicitly what you didn't test**) already covers the honesty; what mobile adds is the **queue**: the criterion stays open, tagged with the rung it's waiting for, and the plan doesn't close until someone checks it on a real binary.

Deferred is legitimate. Deferred and unnamed is a lie with a timer on it.
