#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/lib/portable-tools.sh
source "${script_dir}/lib/portable-tools.sh"

COMPOSE_PROJECT_NAME="${COMPOSE_PROJECT_NAME:-asklake_container_smoke}"
BACKEND_PORT="${BACKEND_PORT:-18000}"
FRONTEND_PORT="${FRONTEND_PORT:-13000}"
BACKEND_URL="${BACKEND_URL:-http://localhost:${BACKEND_PORT}/health}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:${FRONTEND_PORT}/}"
SOURCE_URL="${SOURCE_URL:-http://localhost:${BACKEND_PORT}/api/sources}"
CATALOG_URL="${CATALOG_URL:-http://localhost:${BACKEND_PORT}/api/catalog/datasets}"
PIPELINE_URL="${PIPELINE_URL:-http://localhost:${BACKEND_PORT}/api/pipelines}"

export BACKEND_PORT FRONTEND_PORT

python_bin="$(portable_python_bin)"
temp_docker_config=""
fallbacks_applied=0

compose() {
  docker compose -p "${COMPOSE_PROJECT_NAME}" "$@"
}

apply_wsl_docker_fallbacks() {
  local reason="$1"

  if [[ "$fallbacks_applied" -eq 0 ]]; then
    echo "INFO: ${reason}" >&2
  fi

  if [[ -z "${DOCKER_BUILDKIT+x}" ]]; then
    export DOCKER_BUILDKIT=0
  fi

  if [[ -z "${COMPOSE_DOCKER_CLI_BUILD+x}" ]]; then
    export COMPOSE_DOCKER_CLI_BUILD=0
  fi

  if [[ -z "${DOCKER_CONFIG+x}" ]] && ! command -v docker-credential-desktop.exe >/dev/null 2>&1; then
    temp_docker_config="$(mktemp -d "${TMPDIR:-/tmp}/asklake-docker-config.XXXXXX")"
    printf '{}\n' > "${temp_docker_config}/config.json"
    export DOCKER_CONFIG="${temp_docker_config}"
    echo "INFO: docker-credential-desktop.exe is unavailable in this shell; using temporary local DOCKER_CONFIG=${temp_docker_config}" >&2
  fi

  fallbacks_applied=1
}

compose_build_with_fallbacks() {
  local output
  local status

  set +e
  output="$(compose build 2>&1)"
  status=$?
  set -e

  if [[ "$status" -eq 0 ]]; then
    printf '%s\n' "$output"
    return 0
  fi

  printf '%s\n' "$output" >&2

  if [[ "$output" == *"docker-buildx"* || "$output" == *"buildx"* || "$output" == *"docker-credential-desktop.exe"* || "$output" == *'executable file not found in $PATH'* ]]; then
    apply_wsl_docker_fallbacks "Retrying docker compose build with local-only WSL2 fallbacks."
    compose build
    return 0
  fi

  return "$status"
}

cleanup() {
  compose down --remove-orphans >/dev/null 2>&1 || true
  if [[ -n "$temp_docker_config" && -d "$temp_docker_config" ]]; then
    rm -rf "$temp_docker_config"
  fi
}

trap cleanup EXIT

compose_build_with_fallbacks
compose up -d

for _ in $(seq 1 30); do
  if curl -fsS "${BACKEND_URL}" >/dev/null && curl -fsS "${FRONTEND_URL}" >/dev/null; then
    source_response="$(curl -fsS \
      -H "Content-Type: application/json" \
      -d '{"name":"sample_orders_smoke","type":"csv","path":"samples/orders.csv"}' \
      "${SOURCE_URL}")"
    dataset_id="$("$python_bin" -c 'import json,sys; print(json.load(sys.stdin)["dataset"]["id"])' <<<"${source_response}")"
    pipeline_response="$(curl -fsS \
      -H "Content-Type: application/json" \
      -d "{\"name\":\"sample_pipeline_smoke\",\"source_dataset_id\":\"${dataset_id}\",\"select_fields\":[\"order_id\",\"amount\"],\"target_name\":\"sample_pipeline_result\"}" \
      "${PIPELINE_URL}")"
    pipeline_id="$("$python_bin" -c 'import json,sys; print(json.load(sys.stdin)["id"])' <<<"${pipeline_response}")"
    run_response="$(curl -fsS -X POST "${PIPELINE_URL}/${pipeline_id}/runs")"
    catalog_response="$(curl -fsS "${CATALOG_URL}")"

    if [[ "$source_response" == *'"row_count":5'* && "$run_response" == *'"status":"success"'* && "$catalog_response" == *'"sample_pipeline_result"'* ]]; then
      echo "AskLake container smoke passed"
      exit 0
    fi
  fi
  sleep 2
done

echo "AskLake container smoke failed" >&2
compose ps >&2 || true
exit 1
