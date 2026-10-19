#!/bin/bash
# Auto-commit and push any changes to GitHub after the agent finishes.
# Runs detached in the background so it never blocks the agent.
cat >/dev/null # consume hook JSON from stdin

(
  cd "$(dirname "$0")/../.." || exit 0
  LOG=".cursor/hooks/auto-push.log"
  {
    echo "--- $(date '+%Y-%m-%d %H:%M:%S') ---"
    # Nothing to do if the working tree is clean (.gitignore keeps .env* out).
    if [ -z "$(git status --porcelain)" ]; then
      echo "No changes."
      exit 0
    fi
    git add -A
    git commit -m "Auto-commit: update $(git diff --cached --name-only | head -3 | paste -sd, -)" || exit 0
    git push origin "$(git branch --show-current)"
  } >>"$LOG" 2>&1
) >/dev/null 2>&1 &

echo '{}'
exit 0
