#!/usr/bin/env bash
# collab-bootstrap — create/check the facilities rule zero depends on (issue #16).
# Day 0 of a collaboration, run by the maintainer, inside the repo:
#   scripts/collab-bootstrap.sh <collaborator-handle>
#
# CREATES if missing (idempotent, safe to re-run):
#   - the `absorbed` / `context-question` / `escalated` labels
#   - the context-question issue form (.github/ISSUE_TEMPLATE/context-question.yml)
# CHECKS and reports (exit non-zero on any confirmed failure):
#   - the collaborator's permission is triage or better — including the silent
#     day-0 failure this script exists to catch: an invitation sent but never
#     accepted, which no repository state ever surfaces to rule zero
#   - branch protection exists on the default branch (CONTRIBUTING asserts it)
# A check the caller lacks permission to verify degrades to WARN, never a guess:
# the maintainer (admin) gets real answers; a collaborator self-checking gets
# warnings pointing at what the maintainer must confirm.
# Needs: gh (authenticated) + git. Works from any directory inside the repo.
set -euo pipefail

COLLAB="${1:-}"
if [ -z "$COLLAB" ]; then
  echo "usage: scripts/collab-bootstrap.sh <collaborator-handle>" >&2
  exit 2
fi

REPO="$(gh repo view --json nameWithOwner --jq .nameWithOwner)"
ROOT="$(git rev-parse --show-toplevel)"
DEFAULT_BRANCH="$(gh repo view --json defaultBranchRef --jq .defaultBranchRef.name)"
fail=0
echo "collab-bootstrap: $REPO — collaborator: $COLLAB"
echo

# ---- create-if-missing: the three labels rule zero reads --------------------
# name|color|description (colors/descriptions match the mothership repo)
LABELS="absorbed|0E8A16|Closed issue whose outcome the collaborator has read/absorbed (rule zero, list B)
context-question|D4C5F9|An agent needs maintainer context to proceed (elicitation channel)
escalated|D93F0B|two-round ceiling hit — ball with the humans; rule zero skips it"

EXISTING="$(gh label list --repo "$REPO" --limit 200 --json name --jq '.[].name')"
echo "$LABELS" | while IFS='|' read -r name color desc; do
  if printf '%s\n' "$EXISTING" | grep -qx "$name"; then
    echo "  = label      $name (already exists — not touched)"
  else
    gh label create "$name" --repo "$REPO" --color "$color" --description "$desc" >/dev/null
    echo "  + label      $name (created)"
  fi
done

# ---- create-if-missing: the context-question issue form ---------------------
FORM="$ROOT/.github/ISSUE_TEMPLATE/context-question.yml"
if [ -f "$FORM" ]; then
  echo "  = issue form .github/ISSUE_TEMPLATE/context-question.yml (already exists — not touched)"
else
  mkdir -p "$ROOT/.github/ISSUE_TEMPLATE"
  # byte-identical to templates/context-question.yml — guarded by scripts/check-template-sync.sh
  cat > "$FORM" <<'CADMO_FORM_EOF'
name: Context question
description: An agent (or human) needs maintainer context to proceed — the structured elicitation channel.
title: "[context] "
labels: ["context-question"]
body:
  - type: markdown
    attributes:
      value: |
        **Before asking:** check [`governance/context.md`](../blob/main/governance/context.md) (answered questions live there — nobody asks twice) and [`governance/direction.md`](../blob/main/governance/direction.md) (goal, audience, scope). If the answer is in neither, ask away.
  - type: textarea
    id: question
    attributes:
      label: The question
      description: One question per issue. Specific beats broad.
      placeholder: e.g. "Should verdicts on public issues be written in English or pt-BR?"
    validations:
      required: true
  - type: textarea
    id: why-blocking
    attributes:
      label: What is blocked without the answer
      description: The work that waits on this — so the maintainer can gauge urgency.
    validations:
      required: true
  - type: textarea
    id: options
    attributes:
      label: Options (if multiple-choice)
      description: When the question has enumerable answers, list them — mirrors how agents ask humans best.
      placeholder: |
        A) …
        B) …
  - type: textarea
    id: default-assumption
    attributes:
      label: Default assumption
      description: What you will assume (and document) if there's no answer in time — an async channel must never deadlock a session.
    validations:
      required: true
  - type: input
    id: asked-by
    attributes:
      label: Asked by
      description: Which agent/human is asking (e.g. "Matheus's AI pair", "maintainer's AI").
    validations:
      required: true
CADMO_FORM_EOF
  echo "  + issue form .github/ISSUE_TEMPLATE/context-question.yml (created — commit it)"
fi
if [ ! -f "$ROOT/governance/context.md" ] || [ ! -f "$ROOT/governance/direction.md" ]; then
  echo "  ~ note: the form links governance/context.md + governance/direction.md — create them so the links resolve"
fi
echo

# ---- check: collaborator permission (triage or better) ----------------------
ROLE="$(gh api "repos/$REPO/collaborators/$COLLAB/permission" --jq .role_name 2>/dev/null || echo "__unreadable__")"
case "$ROLE" in
  admin|maintain|write|triage)
    echo "  OK   permission: $COLLAB has '$ROLE' (triage or better)" ;;
  read|none)
    echo "  FAIL permission: $COLLAB has '$ROLE' — rule zero needs triage or better (labels, self-assign)"
    fail=1 ;;
  __unreadable__)
    # not a collaborator at all, or the caller can't read permissions — look for the silent case
    INVITE_ID="$(gh api "repos/$REPO/invitations" --jq ".[] | select(.invitee.login==\"$COLLAB\") | .id" 2>/dev/null || echo "")"
    if [ -n "$INVITE_ID" ]; then
      echo "  FAIL permission: $COLLAB was invited but NEVER ACCEPTED (invitation $INVITE_ID)."
      echo "       This state is invisible to rule zero. Have them accept on github.com or run:"
      echo "       gh api --method PATCH user/repository_invitations/$INVITE_ID"
      fail=1
    else
      echo "  WARN permission: could not read $COLLAB's permission (needs admin, or they were never invited)."
      echo "       Maintainer: check https://github.com/$REPO/settings/access"
    fi ;;
  *)
    echo "  FAIL permission: $COLLAB has unexpected role '$ROLE'"
    fail=1 ;;
esac

# ---- check: branch protection on the default branch -------------------------
# Two protection systems exist: rulesets (readable at read level) and classic
# branch protection (readable only by admins — a non-admin gets the same 404 as
# "not protected", so without admin the classic answer is a WARN, never a guess).
RULE_COUNT="$(gh api "repos/$REPO/rules/branches/$DEFAULT_BRANCH" --jq 'length' 2>/dev/null || echo "")"
if [ -n "$RULE_COUNT" ] && [ "$RULE_COUNT" -gt 0 ]; then
  echo "  OK   branch protection: '$DEFAULT_BRANCH' is protected ($RULE_COUNT active ruleset rule(s))"
elif gh api "repos/$REPO/branches/$DEFAULT_BRANCH/protection" --silent 2>/dev/null; then
  echo "  OK   branch protection: '$DEFAULT_BRANCH' is protected (classic branch protection)"
else
  IS_ADMIN="$(gh api "repos/$REPO" --jq '.permissions.admin' 2>/dev/null || echo false)"
  if [ "$IS_ADMIN" = "true" ]; then
    echo "  FAIL branch protection: '$DEFAULT_BRANCH' has no ruleset and no classic protection —"
    echo "       the merge gate is discipline-only. Fix: https://github.com/$REPO/settings/rules"
    fail=1
  else
    echo "  WARN branch protection: no ruleset found and classic protection needs admin to read."
    echo "       Maintainer: confirm at https://github.com/$REPO/settings/branches"
  fi
fi

echo
if [ "$fail" -eq 0 ]; then
  echo "collab-bootstrap: all facilities present ✓ — rule zero has what it needs"
else
  echo "collab-bootstrap: FAILURES above — rule zero will misbehave until they are fixed"
  exit 1
fi
