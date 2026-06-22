#!/usr/bin/env bash
set -euo pipefail

COMPOSE_PROJECT_NAME="${COMPOSE_PROJECT_NAME:-asklake_container_smoke}"
BACKEND_PORT="${BACKEND_PORT:-18000}"
FRONTEND_PORT="${FRONTEND_PORT:-13000}"
BACKEND_URL="${BACKEND_URL:-http://localhost:${BACKEND_PORT}/health}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:${FRONTEND_PORT}/}"
SOURCE_URL="${SOURCE_URL:-http://localhost:${BACKEND_PORT}/api/sources}"
CATALOG_URL="${CATALOG_URL:-http://localhost:${BACKEND_PORT}/api/catalog/datasets}"

export BACKEND_PORT FRONTEND_PORT

cleanup() {
  docker compose -p "${COMPOSE_PROJECT_NAME}" down --remove-orphans >/dev/null 2>&1 || true
}

trap cleanup EXIT

docker compose -p "${COMPOSE_PROJECT_NAME}" build
docker compose -p "${COMPOSE_PROJECT_NAME}" up -d

for _ in $(seq 1 30); do
  if curl -fsS "${BACKEND_URL}" >/dev/null && curl -fsS "${FRONTEND_URL}" >/dev/null; then
    source_response="$(curl -fsS \
      -H "Content-Type: application/json" \
      -d '{"name":"sample_orders_smoke","type":"csv","path":"samples/orders.csv"}' \
      "${SOURCE_URL}")"
    catalog_response="$(curl -fsS "${CATALOG_URL}")"

    if [[ "$source_response" == *'"row_count":5'* && "$catalog_response" == *'"sample_orders_smoke"'* ]]; then
      echo "AskLake container smoke passed"
      exit 0
    fi
  fi
  sleep 2
done

echo "AskLake container smoke failed" >&2
docker compose -p "${COMPOSE_PROJECT_NAME}" ps >&2 || true
exit 1
