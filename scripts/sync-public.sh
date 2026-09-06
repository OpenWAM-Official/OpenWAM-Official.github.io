#!/usr/bin/env bash
#
# Publish the current tree to the public project-page repository.
#
#   scripts/sync-public.sh "Update the RoboDojo numbers"
#
# This repository keeps the full development history; the public one gets a
# tidy history of its own, one commit per sync. The two are deliberately
# unrelated — nothing from here is rewritten or force-pushed there.
#
# It works by checking out the public repository's tip on a local branch,
# replacing its tree wholesale with this branch's tree, and committing the
# difference. `git read-tree --reset -u` is what makes that exact: unlike
# `git checkout <branch> -- .`, it also removes files the source no longer has.

set -euo pipefail

PUBLIC_REMOTE="public"
PUBLIC_URL="https://github.com/OpenWAM-Official/OpenWAM-Official.github.io.git"
PUBLIC_BRANCH="main"
WORK_BRANCH="public-sync"

msg="${1:-}"
if [[ -z "$msg" ]]; then
  echo "usage: scripts/sync-public.sh \"commit message\"" >&2
  exit 2
fi

cd "$(git rev-parse --show-toplevel)"

if [[ -n "$(git status --porcelain)" ]]; then
  echo "working tree is dirty — commit or stash first" >&2
  exit 1
fi

source_branch="$(git rev-parse --abbrev-ref HEAD)"

git remote get-url "$PUBLIC_REMOTE" >/dev/null 2>&1 \
  || git remote add "$PUBLIC_REMOTE" "$PUBLIC_URL"

restore() { git checkout -q "$source_branch"; }
trap restore EXIT

git fetch -q "$PUBLIC_REMOTE" "$PUBLIC_BRANCH"
git checkout -q -B "$WORK_BRANCH" "$PUBLIC_REMOTE/$PUBLIC_BRANCH"

# Make the public branch's tree identical to the source branch's.
git read-tree --reset -u "$source_branch"

if git diff --cached --quiet; then
  echo "public repository is already up to date"
  exit 0
fi

git commit -q -m "$msg"
git push -q "$PUBLIC_REMOTE" "$WORK_BRANCH:$PUBLIC_BRANCH"

echo "pushed to $PUBLIC_URL"
git --no-pager log --oneline -1
