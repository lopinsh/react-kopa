#!/usr/bin/env bash
# Runs the screenshot baseline (tests/visual) in the official Playwright image, so renders match CI (Linux).
#   scripts/visual-docker.sh            compare against the committed baselines
#   scripts/visual-docker.sh [--update] [playwright args, e.g. -g board]
#   --update rewrite the baselines (only after the diffs were reviewed)
# Needs the app running on :3000 as built and seeded for the visual run (see "Visual baseline" in AGENTS.md):
#   (after the seed: npx prisma db execute --file tests/visual/pin-dates.sql --schema prisma/schema.prisma)
#   TZ=Europe/Riga NODE_OPTIONS="--require ./tests/visual/freeze-time.cjs" on build, seed and start,
#   DATABASE_URL pointing at a throwaway seeded database, ALLOW_DEV_PASSWORDS=true.
set -euo pipefail
cd "$(dirname "$0")/.."
VERSION=$(node -p "require('@playwright/test/package.json').version")
ARGS=()
if [ "${1:-}" = "--update" ]; then ARGS+=(--update-snapshots); shift; fi
MSYS_NO_PATHCONV=1 docker run --rm --ipc=host --add-host=host.docker.internal:host-gateway \
  -v "$(pwd -W 2>/dev/null || pwd):/work" -w /work \
  -e VISUAL_URL=http://host.docker.internal:3000 -e CI="${CI:-}" \
  "mcr.microsoft.com/playwright:v${VERSION}-noble" \
  node node_modules/@playwright/test/cli.js test -c playwright.visual.config.ts "${ARGS[@]}" "$@"
