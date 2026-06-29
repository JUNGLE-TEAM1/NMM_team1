#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="${ASKLAKE_M2_SPARK_COMPOSE_FILE:-${REPO_ROOT}/docker/m2-taxi-spark-docker-compose.yml}"
PROJECT_NAME="${ASKLAKE_M2_SPARK_PROJECT_NAME:-asklake_m2_taxi_spark}"
SPARK_MASTER="${ASKLAKE_M2_SPARK_MASTER:-spark://m2-spark-master:7077}"
DRIVER_MEMORY="${ASKLAKE_M2_SPARK_DRIVER_MEMORY:-8g}"
OUTPUT_ROOT="${ASKLAKE_M2_DOCKER_OUTPUT_ROOT:-/app/data/results/m2_taxi_spark_docker_evidence}"
TAXI_CONTAINER_DIR="${ASKLAKE_TAXI_CONTAINER_DIR:-/data/taxi}"
SMALL_INPUT="${ASKLAKE_TAXI_SMALL_INPUT:-${TAXI_CONTAINER_DIR}/yellow_tripdata_2019_2025/yellow_tripdata_2020-04.parquet}"
SCALE_INPUT="${ASKLAKE_TAXI_5GB_INPUT:-${TAXI_CONTAINER_DIR}/yellow_tripdata_2019_2025}"
MINIO_CONTAINER_ENDPOINT="${ASKLAKE_M2_MINIO_CONTAINER_ENDPOINT:-http://m2-minio:9000}"
MINIO_HOST_ENDPOINT="${ASKLAKE_M2_MINIO_HOST_ENDPOINT:-http://localhost:${M2_MINIO_API_PORT:-19000}}"
MINIO_BUCKET="${ASKLAKE_M2_MINIO_BUCKET:-asklake-demo}"
MINIO_PREFIX="${ASKLAKE_M2_MINIO_PREFIX:-taxi/gold/daily_metrics/run_id=<run_id>/}"
MODE="${1:-small}"

compose() {
  # 같은 project name과 compose file을 반복해서 쓰기 위한 얇은 wrapper다.
  docker compose -p "${PROJECT_NAME}" -f "${COMPOSE_FILE}" "$@"
}

start_cluster() {
  # Spark standalone cluster를 master 1개, worker 2개로 띄운다.
  compose up -d m2-spark-master m2-spark-worker-1 m2-spark-worker-2
  sleep "${ASKLAKE_M2_SPARK_STARTUP_SLEEP_SECONDS:-6}"
}

start_minio() {
  # Spark driver가 같은 Docker network 안에서 S3-compatible endpoint로 업로드할 수 있게 MinIO를 띄운다.
  compose up -d m2-minio
  for _ in $(seq 1 "${ASKLAKE_M2_MINIO_STARTUP_RETRIES:-30}"); do
    if curl -fsS "${MINIO_HOST_ENDPOINT}/minio/health/live" >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done
  echo "MinIO did not become ready at ${MINIO_HOST_ENDPOINT}" >&2
  compose logs m2-minio >&2 || true
  return 1
}

run_evidence() {
  # driver container 안에서 spark-submit을 실행해 host와 container가 같은 경로 계약을 쓰는지 확인한다.
  local input_path="$1"
  local run_id="$2"
  local profile="$3"
  local upload_to_minio="${4:-false}"
  local summary_path="${OUTPUT_ROOT}/${run_id}_summary.json"
  local upload_args=""

  if [[ "${upload_to_minio}" == "true" ]]; then
    start_minio
    upload_args="--minio-upload --endpoint '${MINIO_CONTAINER_ENDPOINT}' --bucket '${MINIO_BUCKET}' --prefix '${MINIO_PREFIX}' --auto-create-bucket"
  fi
  start_cluster
  compose run --rm m2-spark-driver /bin/bash -lc "
    set -euo pipefail
    python3 -m pip install --user --no-cache-dir -q 'pydantic>=2,<3' 'httpx==0.28.1'
    /opt/spark/bin/spark-submit \
      --master '${SPARK_MASTER}' \
      --driver-memory '${DRIVER_MEMORY}' \
      /app/scripts/week2_m2_taxi_spark_local_evidence.py \
      --input '${input_path}' \
      --output-root '${OUTPUT_ROOT}' \
      --profile '${profile}' \
      --run-id '${run_id}' \
      --master '${SPARK_MASTER}' \
      --driver-memory '${DRIVER_MEMORY}' \
      --disable-vectorized-reader \
      --summary-path '${summary_path}' \
      ${upload_args}
  "
}

case "${MODE}" in
  small)
    run_evidence "${SMALL_INPUT}" "run_taxi_docker_spark_small_001" "demo"
    ;;
  5gb)
    run_evidence "${SCALE_INPUT}" "run_taxi_docker_spark_5gb_001" "local-full-month"
    ;;
  minio-small)
    run_evidence "${SMALL_INPUT}" "run_taxi_docker_spark_minio_small_001" "demo" "true"
    ;;
  minio-5gb)
    run_evidence "${SCALE_INPUT}" "run_taxi_docker_spark_minio_5gb_001" "local-full-month" "true"
    ;;
  up)
    start_cluster
    compose ps
    ;;
  minio-up)
    start_minio
    compose ps
    ;;
  down)
    compose down --remove-orphans
    ;;
  *)
    echo "Usage: $0 [small|5gb|minio-small|minio-5gb|up|minio-up|down]" >&2
    exit 2
    ;;
esac
