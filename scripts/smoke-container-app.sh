#!/usr/bin/env bash
set -euo pipefail

COMPOSE_PROJECT_NAME="${COMPOSE_PROJECT_NAME:-asklake_m2_smoke}"
BACKEND_PORT="${BACKEND_PORT:-18000}"
FRONTEND_PORT="${FRONTEND_PORT:-13000}"
BACKEND_URL="${BACKEND_URL:-http://localhost:${BACKEND_PORT}/health}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:${FRONTEND_PORT}/}"

export BACKEND_PORT FRONTEND_PORT

cleanup() {
  docker compose -p "${COMPOSE_PROJECT_NAME}" down --remove-orphans >/dev/null 2>&1 || true
}

trap cleanup EXIT

docker compose -p "${COMPOSE_PROJECT_NAME}" build
docker compose -p "${COMPOSE_PROJECT_NAME}" up -d

for _ in $(seq 1 30); do
  if curl -fsS "${BACKEND_URL}" >/dev/null && curl -fsS "${FRONTEND_URL}" >/dev/null; then
    echo "AskLake container smoke passed"
    exit 0
  fi
  sleep 2
done

echo "AskLake container smoke failed" >&2
docker compose -p "${COMPOSE_PROJECT_NAME}" ps >&2 || true
exit 1
