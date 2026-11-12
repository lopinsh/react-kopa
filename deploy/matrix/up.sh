#!/usr/bin/env bash
# npm run db:up (and matrix:up): start db + soketi, then Synapse (K4). Synapse is part of the
# normal local stack: render config from .env, make the synapse database, start the container.
# Without MATRIX_* in .env (no `cp .env.example .env`), Synapse is skipped and the rest still starts.
set -eu
cd "$(dirname "$0")/../.."
docker compose up -d db soketi
if [ ! -f .env ] || ! grep -q '^MATRIX_AS_TOKEN=' .env; then
  echo "MATRIX_* not set in .env: Synapse skipped (cp .env.example .env to enable it)"
  exit 0
fi
set -a; . <(grep '^MATRIX_' .env | tr -d '\r'); set +a
bash deploy/matrix/render.sh .matrix
until docker exec ejam-kopa-db pg_isready -U kopa_user -d ejam_kopa >/dev/null 2>&1; do sleep 1; done
docker exec -i ejam-kopa-db psql -U kopa_user -d postgres -v "pw=$MATRIX_DB_PASSWORD" < deploy/matrix/create-db.sql
docker compose up -d synapse
