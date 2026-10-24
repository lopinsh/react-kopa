#!/usr/bin/env bash
# Zero-downtime blue/green deploy, run on the server by .github/workflows/deploy.yml
# (from /root/ejam-kopa, after `prisma migrate deploy`).
#
#   1. start the idle colour with the freshly pulled image (no host port)
#   2. wait for its Docker health check (/api/health, includes SELECT 1)
#   3. render caddy/Caddyfile with the new colour as primary and reload Caddy
#      gracefully (the stable "proxy" container owns host :3000)
#   4. let in-flight requests on the old colour finish, then stop it
#
# If the new colour never turns healthy it is stopped and the old one keeps serving.
# The pre-blue/green container is stopped and renamed, not deleted. App images no
# container uses are removed at the end: blue and green keep the live and previous one.
set -euo pipefail

cd "$(dirname "$0")"
COMPOSE="docker-compose -f docker-compose.server.yml"
HEALTH_TIMEOUT=180   # seconds to wait for the new colour
DRAIN_SECONDS=10     # in-flight requests on the old colour after the switch

log() { echo "[deploy $(date +%H:%M:%S)] $*"; }

running() { [ "$(docker inspect -f '{{.State.Running}}' "$1" 2>/dev/null || true)" = "true" ]; }
exists() { docker inspect "$1" >/dev/null 2>&1; }

if running ejam-kopa-app-blue; then
  OLD=blue; NEW=green
else
  OLD=green; NEW=blue
fi
log "active: $OLD, deploying: $NEW"

# Shared services: no-op unless their config changed.
$COMPOSE up -d --no-deps db soketi

$COMPOSE pull "app-$NEW"
$COMPOSE up -d --no-deps --force-recreate "app-$NEW"

log "waiting for ejam-kopa-app-$NEW to be healthy"
waited=0
until [ "$(docker inspect -f '{{.State.Health.Status}}' "ejam-kopa-app-$NEW" 2>/dev/null || true)" = "healthy" ]; do
  if [ "$waited" -ge "$HEALTH_TIMEOUT" ] || ! running "ejam-kopa-app-$NEW"; then
    log "ejam-kopa-app-$NEW not healthy after ${waited}s; last log lines:"
    docker logs --tail 40 "ejam-kopa-app-$NEW" || true
    $COMPOSE stop "app-$NEW" || true
    log "aborted, $OLD keeps serving"
    exit 1
  fi
  sleep 2
  waited=$((waited + 2))
done
log "ejam-kopa-app-$NEW healthy after ${waited}s"

# Render the proxy config (write a new file, then mv over the old one).
mkdir -p caddy
sed -e "s/__PRIMARY__/app-$NEW/" -e "s/__STANDBY__/app-$OLD/" Caddyfile.template > caddy/Caddyfile.next
docker run --rm -v "$PWD/caddy:/etc/caddy:ro" caddy:2.8.4-alpine   caddy validate --config /etc/caddy/Caddyfile.next --adapter caddyfile >/dev/null
mv caddy/Caddyfile.next caddy/Caddyfile

if running ejam-kopa-proxy; then
  docker exec ejam-kopa-proxy caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile
  log "proxy reloaded, primary is app-$NEW"
else
  # First blue/green deploy: the old single "app" container still holds host :3000.
  legacy=""
  if exists ejam-kopa-app; then
    legacy="ejam-kopa-app-legacy-$(date +%Y%m%d%H%M%S)"
    log "retiring ejam-kopa-app as $legacy"
    docker update --restart=no ejam-kopa-app >/dev/null
    docker stop ejam-kopa-app >/dev/null || true
    docker rename ejam-kopa-app "$legacy"
  fi
  $COMPOSE up -d --no-deps proxy
  log "proxy started, primary is app-$NEW"
fi

# Confirm the proxy reaches the new colour before the old one goes away.
waited=0
until docker exec ejam-kopa-proxy wget -q -O /dev/null http://127.0.0.1:3000/api/health 2>/dev/null; do
  if [ "$waited" -ge 30 ]; then
    log "proxy not answering after 30s"
    if [ -n "${legacy:-}" ]; then
      log "first switch failed: bringing back the old container"
      $COMPOSE stop proxy || true
      docker rename "$legacy" ejam-kopa-app
      docker update --restart=always ejam-kopa-app >/dev/null
      docker start ejam-kopa-app
    fi
    exit 1
  fi
  sleep 1
  waited=$((waited + 1))
done

if running "ejam-kopa-app-$OLD"; then
  log "draining $OLD for ${DRAIN_SECONDS}s"
  sleep "$DRAIN_SECONDS"
  $COMPOSE stop -t 30 "app-$OLD"
fi
log "done: app-$NEW live"

# Old app images: `docker rmi` without -f refuses any image a container (blue or green) still uses.
repo="$(docker inspect -f '{{.Config.Image}}' "ejam-kopa-app-$NEW")"
repo="${repo%:*}"
removed=0
for id in $(docker images "$repo" -q | sort -u); do
  docker rmi "$id" >/dev/null 2>&1 && removed=$((removed + 1))
done
log "removed $removed old $repo image(s)"
