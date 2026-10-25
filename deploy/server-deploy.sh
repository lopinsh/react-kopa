#!/usr/bin/env bash
# Zero-downtime blue/green deploy, run on the server by .github/workflows/deploy.yml
# (from /root/ejam-kopa, after `prisma migrate deploy`).
#
#   1. start the 3 containers of the idle colour with the freshly pulled image (no host port)
#   2. wait for all 3 Docker health checks (/api/health, includes SELECT 1)
#   3. render caddy/Caddyfile with the new colour's 3 upstreams and reload Caddy
#      gracefully (the stable "proxy" container owns host :3000)
#   4. let in-flight requests on the old colour finish, then stop it
#
# If a new container never turns healthy all 3 are stopped and the old colour keeps serving.
# The pre-blue/green container is stopped and renamed, not deleted. App images no
# container uses are removed at the end: blue and green keep the live and previous one.
set -euo pipefail

cd "$(dirname "$0")"
# Compose v2 (`docker compose`) when installed; v1 `docker-compose` breaks on recreate with Docker 25+.
if docker compose version >/dev/null 2>&1; then
  COMPOSE="docker compose -f docker-compose.server.yml"
else
  COMPOSE="docker-compose -f docker-compose.server.yml"
fi
HEALTH_TIMEOUT=180   # seconds to wait for the new colour
DRAIN_SECONDS=10     # in-flight requests on the old colour after the switch

log() { echo "[deploy $(date +%H:%M:%S)] $*"; }

running() { [ "$(docker inspect -f '{{.State.Running}}' "$1" 2>/dev/null || true)" = "true" ]; }
exists() { docker inspect "$1" >/dev/null 2>&1; }

# Active colour: blue-1..3, or the single pre-P1 container ejam-kopa-app-blue.
if running ejam-kopa-app-blue-1 || running ejam-kopa-app-blue; then
  OLD=blue; NEW=green
else
  OLD=green; NEW=blue
fi
NEW_SVCS="app-$NEW-1 app-$NEW-2 app-$NEW-3"
log "active: $OLD, deploying: $NEW"

# Shared services: no-op unless their config changed.
$COMPOSE up -d --no-deps db soketi

log "memory before starting $NEW:"; free -m || true
$COMPOSE pull "app-$NEW-1"   # one pull: all 3 share the image (build ID, Server Actions key)
$COMPOSE up -d --no-deps --force-recreate $NEW_SVCS

log "waiting for $NEW_SVCS to be healthy"
waited=0
while :; do
  bad=""; ready=0
  for n in 1 2 3; do
    c="ejam-kopa-app-$NEW-$n"
    if [ "$(docker inspect -f '{{.State.Health.Status}}' "$c" 2>/dev/null || true)" = "healthy" ]; then
      ready=$((ready + 1))
    else
      bad="$bad $c"
    fi
  done
  [ "$ready" -eq 3 ] && break
  dead=0
  for c in $bad; do running "$c" || dead=1; done
  if [ "$waited" -ge "$HEALTH_TIMEOUT" ] || [ "$dead" -eq 1 ]; then
    log "not healthy after ${waited}s:$bad; last log lines:"
    for c in $bad; do echo "--- $c"; docker logs --tail 40 "$c" || true; done
    $COMPOSE stop $NEW_SVCS || true
    log "aborted, $OLD keeps serving"
    exit 1
  fi
  sleep 2
  waited=$((waited + 2))
done
log "$NEW_SVCS healthy after ${waited}s"

# Render the proxy config (write a new file, then mv over the old one).
mkdir -p caddy
sed -e "s/__UPSTREAMS__/app-$NEW-1:3000 app-$NEW-2:3000 app-$NEW-3:3000/" Caddyfile.template > caddy/Caddyfile.next
docker run --rm -v "$PWD/caddy:/etc/caddy:ro" caddy:2.8.4-alpine   caddy validate --config /etc/caddy/Caddyfile.next --adapter caddyfile >/dev/null
[ -f caddy/Caddyfile ] && cp caddy/Caddyfile caddy/Caddyfile.prev
mv caddy/Caddyfile.next caddy/Caddyfile

if running ejam-kopa-proxy; then
  docker exec ejam-kopa-proxy caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile
  log "proxy reloaded, upstreams are app-$NEW-1..3"
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
  log "proxy started, upstreams are app-$NEW-1..3"
fi

# Confirm the proxy reaches the new colour before the old one goes away.
waited=0
until docker exec ejam-kopa-proxy wget -q -O /dev/null http://127.0.0.1:3000/api/health 2>/dev/null; do
  if [ "$waited" -ge 30 ]; then
    log "proxy not answering after 30s"
    if [ -f caddy/Caddyfile.prev ]; then
      log "restoring the previous Caddyfile"
      cp caddy/Caddyfile.prev caddy/Caddyfile
      docker exec ejam-kopa-proxy caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile || true
    fi
    $COMPOSE stop $NEW_SVCS || true
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

# By container name: the old service names (app-blue / app-green) are gone from the compose file.
old_ctrs=""
for c in "ejam-kopa-app-$OLD-1" "ejam-kopa-app-$OLD-2" "ejam-kopa-app-$OLD-3" "ejam-kopa-app-$OLD"; do
  running "$c" && old_ctrs="$old_ctrs $c"
done
if [ -n "$old_ctrs" ]; then
  log "draining $OLD for ${DRAIN_SECONDS}s"
  sleep "$DRAIN_SECONDS"
  docker stop -t 30 $old_ctrs >/dev/null
fi
# Pre-P1 single containers (both colours, stopped by now): remove them so compose does not report orphans.
for c in ejam-kopa-app-blue ejam-kopa-app-green; do
  if exists "$c" && ! running "$c"; then docker rm "$c" >/dev/null || true; fi
done
log "done: $NEW live"

# Old app images: `docker rmi` without -f refuses any image a container (blue or green) still uses.
repo="$(docker inspect -f '{{.Config.Image}}' "ejam-kopa-app-$NEW-1")"
repo="${repo%:*}"
removed=0
for id in $(docker images "$repo" -q | sort -u); do
  docker rmi "$id" >/dev/null 2>&1 && removed=$((removed + 1))
done
log "removed $removed old $repo image(s)"
