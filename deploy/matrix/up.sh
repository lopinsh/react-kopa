#!/usr/bin/env bash
# npm run matrix:up: render config from .env, make the synapse database, start the container.
set -eu
cd "$(dirname "$0")/../.."
set -a; . <(grep '^MATRIX_' .env | tr -d '\r'); set +a
bash deploy/matrix/render.sh .matrix
docker compose up -d db
until docker exec ejam-kopa-db pg_isready -U kopa_user -d ejam_kopa >/dev/null 2>&1; do sleep 1; done
docker exec -i ejam-kopa-db psql -U kopa_user -d postgres -v "pw=$MATRIX_DB_PASSWORD" < deploy/matrix/create-db.sql
docker compose --profile matrix up -d synapse
