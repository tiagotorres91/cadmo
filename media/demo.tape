# Cadmo — README demo tape (VHS)
# ---------------------------------------------------------------------------
# Records media/demo.gif: scaffold a project with `npm create cadmo`, then watch
# the spec-drift guard catch a drift (red) and pass once the spec is updated (green).
#
# HOW TO RECORD (a human runs this — it needs the real `vhs`, `npm`, `git`, `node`):
#     vhs media/demo.tape
# from the repo root. It writes media/demo.gif (~40s). These are the real commands —
# `npm create cadmo` pulls the published create-cadmo from npm, so record it with the
# package published and a warm npx cache (the Sleep after it allows for the download).
# Then embed it in the README:  <p align="center"><img src="media/demo.gif" ...></p>
#
# Every directive is from the VHS command set: https://github.com/charmbracelet/vhs
# ---------------------------------------------------------------------------

Require npm
Require git
Require node

Output media/demo.gif

# --- look & feel -----------------------------------------------------------
Set Shell "bash"
Set FontSize 20
Set Width 1200
Set Height 720
Set Padding 24
Set Theme "Dracula"
Set TypingSpeed 45ms

# --- silent setup: a clean, throwaway repo so the GIF stays focused --------
# (Hide stops frame capture; Show resumes it. None of this appears in the GIF.)
Hide
Type "cd $(mktemp -d) && git init -q"
Enter
Type "git config user.email demo@cadmo.dev && git config user.name Cadmo"
Enter
# Empty CLAUDE.md → the scaffolder auto-detects Claude Code and also installs
# the /cadmo-* slash commands, so the plain `npm create cadmo` shows the full method.
Type "touch CLAUDE.md"
Enter
# A clean, quiet prompt for the recording.
Type "export PS1='$ ' && clear"
Enter
Show

# --- 1. scaffold the method into the project -------------------------------
Type "npm create cadmo -- --yes"
Sleep 500ms
Enter
Sleep 8s          # allow for the npx download of create-cadmo on a cold cache

# --- 2. show what landed: the drift guard + the slash commands -------------
Type "ls cadmo/ .claude/commands/"
Enter
Sleep 2500ms

# --- 3. wire one spec to the code it documents, and commit the baseline ----
# A tiny source file...
Type "mkdir src && printf 'export const feeBps = 250;\n' > src/refund.js"
Enter
# ...and a spec that declares it watches that file (front matter `watches:`).
Type "printf -- '---\nwatches:\n  - src/refund.js\n---\n# Refund fee\nThe refund fee is 250 bps.\n' > cadmo/refund-spec.md"
Enter
Type "git add -A && git commit -qm 'baseline: refund spec + code' && git tag base"
Enter
Sleep 1500ms

# --- 4. change the CODE but not the SPEC → drift ---------------------------
Type "printf 'export const feeBps = 300;\n' > src/refund.js"
Enter
Type "git commit -qam 'bump refund fee to 300 bps'"
Enter
Sleep 800ms
Type "node cadmo/spec-drift.mjs --base base"
Sleep 500ms
Enter
Sleep 3500ms

# --- 5. update the spec in the same story → back in sync -------------------
Type "printf -- '---\nwatches:\n  - src/refund.js\n---\n# Refund fee\nThe refund fee is 300 bps.\n' > cadmo/refund-spec.md"
Enter
Type "git commit -qam 'spec: refund fee is now 300 bps'"
Enter
Sleep 800ms
Type "node cadmo/spec-drift.mjs --base base"
Sleep 500ms
Enter
Sleep 4s
