# 07. 수동 검증 플레이북

이 문서는 수동 검증의 라우터다. 세부 절차는 `docs/manual-verification/` 아래 문서에 둔다.

## 목적

- 자동 테스트만으로 충분히 확인하기 어려운 demo, UX, integration, 사람-facing flow를 검증한다.
- current baseline과 Target MVP 검증 경로를 구분한다.
- 수동 검증 증거를 Phase report에 기록한다.
- 실패한 수동 검증을 `docs/06` failure scenario 또는 현재 Phase TODO와 연결한다.

## 사용 시점

- Phase 완료 전
- release/demo rehearsal 전
- UX, integration, external-provider 변경 후
- Hotfix 후
- 자동 테스트가 없거나 충분하지 않을 때

## 실행 규칙

1. Phase 완료 전 관련 manual verification 문서 하나 이상을 실행한다.
2. 결과는 `docs/reports/_template.md` 형식의 Phase report에 기록한다.
3. demo/UX 품질은 manual verification concern으로 다룬다.
4. 실패는 `docs/06` Failure Scenario와 report TODO에 연결한다.
5. manual verification에 필요한 local tool/runtime이 있으면 AI는 먼저 readiness check와 safe start를 시도하고, 설치/권한/라이선스/비용/외부 resource가 필요한 사람 조치만 분리해 기록한다.

## 세부 검증 문서

- [환경 설정](manual-verification/00-environment-setup.md)
- [핵심 성공 경로](manual-verification/01-golden-path.md)
- [핵심 기능](manual-verification/02-core-feature.md)
- [인증 또는 접근 제어](manual-verification/03-auth-or-access-control.md)
- [데이터 흐름](manual-verification/04-data-flow.md)
- [통합](manual-verification/05-integration.md)
- [실패 시나리오](manual-verification/06-failure-scenarios.md)
- [MVP 데모 스크립트](manual-verification/07-mvp-demo-script.md)
- [M5 Demo Cockpit 학습/실험 통합 가이드](manual-verification/09-m5-demo-cockpit-learning-guide.md)

## AskLake 문서 Rebaseline 수동 점검

1. `README.md`가 AskLake를 Trusted Data & AI Platform 방향으로 설명하는지 확인한다.
2. `README.md`와 `docs/01-product-planning.md`가 current implementation baseline을 제품 목표와 구분하는지 확인한다.
3. `docs/01-product-planning.md`에 Target MVP가 `Trusted Dataset -> Query/Ask -> Evidence -> Recovery` 신뢰 루프로 기록되어 있는지 확인한다.
4. `docs/02-architecture.md`에 current baseline과 target architecture가 분리되어 있는지 확인한다.
5. `docs/03-interface-reference.md`에 baseline contract와 Target MVP interface family가 분리되어 있는지 확인한다.
6. `docs/05`, `docs/06`, `docs/07`, `docs/08`이 같은 milestone/phase 이름을 사용하는지 확인한다.
7. 과거 M0~M5 report가 historical evidence로만 남고 새 기준에 맞춰 소급 수정되지 않았는지 확인한다.

## 협업 전제 확인 수동 점검

1. `docs/09-collaboration-agreement.md`에 Context Assumption Check 합의가 있는지 확인한다.
2. `docs/13-human-command-flow.md`가 개념 질문, 저장소 규칙 질문, 실행 요청, 정책 결정을 구분하는 예시를 포함하는지 확인한다.
3. `docs/08-development-workflow.md`의 Phase 시작 gate가 Context Assumption Check를 Context Loading/Context Budget 전에 적용하는지 확인한다.
4. `docs/15-context-budget-rule.md`가 문맥 읽기 범위와 답변 전제 판별을 다른 책임으로 구분하는지 확인한다.
5. `docs/10-next-action-menu.md`에 전제가 불명확할 때 사용할 메뉴가 있는지 확인한다.
6. 단순 개념 질문은 불필요하게 막지 않고, 답이 달라지는 경우 `일반론 기준 / 이 저장소 기준`으로 나누어 답하도록 되어 있는지 확인한다.

## Current Baseline 수동 점검

0. Docker가 필요한 경우 `command -v docker`, `docker --version`, `docker compose version`, `docker info`를 확인한다. macOS에서 `/Applications/Docker.app`이 설치되어 있고 꺼져 있으면 macOS 전용 safe start로 `open -a Docker`를 시도한 뒤 readiness loop를 돈다. Windows는 WSL2 + Docker Desktop integration shell에서 검증하는 것을 기본 경로로 두고, native PowerShell/CMD 동일 실행은 별도 evidence 없이는 미검증으로 기록한다. host `node`/`npm`은 Docker Compose Tier 1 경로에는 필수가 아니며, host frontend direct run을 검증할 때만 추가로 확인한다.
1. `scripts/smoke-container-app.sh`를 실행한다. WSL2 경로에서 `docker-buildx` plugin 또는 `docker-credential-desktop.exe` 문제가 있으면 스크립트가 local-only fallback을 자동 재시도한다. 그래도 실패하면 필요한 경우 `DOCKER_BUILDKIT=0 COMPOSE_DOCKER_CLI_BUILD=0 scripts/smoke-container-app.sh` 같은 명시 fallback과 오류 출력을 함께 기록한다.
2. 필요하면 `BACKEND_PORT=18000 FRONTEND_PORT=13000 COMPOSE_PROJECT_NAME=asklake_m2_visual docker compose -p asklake_m2_visual up -d`로 앱을 띄운다.
3. `curl -fsS http://localhost:18000/health`가 `status: ok` contract를 반환하는지 확인한다.
4. `curl -fsS http://localhost:13000/`가 AskLake frontend HTML을 반환하는지 확인한다.
5. 샘플 CSV source를 등록한다.
6. catalog detail에서 schema, row count, sample rows, ready status를 확인한다.
7. `select_fields` 컬럼 선택 기반 최소 pipeline을 만든다.
8. pipeline run을 실행한다.
9. run status가 success 또는 failed로 명확히 표시되는지 확인한다.
10. success인 경우 catalog에서 schema, row count, sample 또는 저장 위치를 확인한다.
11. 실패 케이스 하나를 실행해 failed 상태와 오류 메시지가 표시되는지 확인한다.
12. 확인 뒤 필요한 경우 docker compose를 내린다.

## Week 2 M5 Airflow local smoke 점검

이 경로는 기존 reviews demo DAG를 사용해 M5 Airflow 연결이 "진짜 Airflow DAG 실행 -> result artifact -> backend Catalog 저장"까지 이어지는지 확인한다. 현재 Week2 대표 분석 경로는 `gold_product_health`이며, 이 smoke는 Airflow adapter 검증용 legacy/supporting path다.
`/etl` 화면을 보면서 M5가 구현한 범위와 evidence를 학습하려면 먼저 `docs/manual-verification/09-m5-demo-cockpit-learning-guide.md`를 따른다.

1. Docker daemon이 실행 중인지 확인한다.
2. `docker compose -f docker-compose.airflow.yml up -d`를 실행한다.
3. `curl -fsS http://localhost:8080/health`가 Airflow health 응답을 반환하는지 확인한다.
4. Airflow UI `http://localhost:8080`에서 `asklake_week2_reviews` DAG가 보이는지 확인한다.
5. backend를 아래 환경값과 함께 실행한다.

```bash
ASKLAKE_WEEK2_AIRFLOW_BASE_URL=http://localhost:8080 \
ASKLAKE_WEEK2_AIRFLOW_DAG_ID=asklake_week2_reviews \
ASKLAKE_WEEK2_AIRFLOW_USERNAME=airflow \
ASKLAKE_WEEK2_AIRFLOW_PASSWORD=airflow \
ASKLAKE_WEEK2_AIRFLOW_RESULT_ROOT=data/week2/_airflow_results \
ASKLAKE_WEEK2_AIRFLOW_MAX_POLLS=20 \
ASKLAKE_WEEK2_AIRFLOW_POLL_INTERVAL_SECONDS=1 \
PYTHONPATH=backend ./.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
```

6. `POST /api/week2/workflows/pipeline_reviews_json_e2e/runs`에 `{"executor":"airflow","triggered_by":"m5_owner"}`를 보낸다.
7. 응답 `status`가 `succeeded`인지 확인한다.
8. run log에 `airflow adapter executed Week 2 workflow boundary`가 있고 `falling back`이 없는지 확인한다.
9. `data/week2/_airflow_results/<run_id>.json`과 `data/week2/reviews/gold/run_id=<run_id>/dataset_reviews_gold.jsonl`이 생겼는지 확인한다.
10. `GET /api/week2/catalog/dataset_reviews_gold`에서 같은 `run_id`, row count, bytes, local path가 확인되는지 확인한다.
11. 확인 뒤 필요한 경우 `docker compose -f docker-compose.airflow.yml down`을 실행한다.

### M2 SparkRunner handoff artifact 사전 점검

Airflow DAG가 M2 runner를 호출하는 task를 붙이기 전에는 아래 명령으로 M2가 M5용 result artifact를 만들 수 있는지 먼저 확인한다.

```bash
PYTHONPATH=backend .venv/bin/python scripts/week2_m2_airflow_sparkrunner_handoff.py \
  --runtime-profile airflow_sparkrunner_handoff \
  --run-id run_airflow_spark_001 \
  --result-path data/week2/_airflow_results/run_airflow_spark_001.json
```

기대 결과는 `data/week2/_airflow_results/run_airflow_spark_001.json` 안에 `week2_result.status=succeeded`, `output_path`, `row_count`, `bytes`, `duration_ms`, `output_row_count`, `output_bytes`, `task_results[]`가 남는 것이다. 이 파일은 M5 `Week2AirflowAdapter`가 읽는 shared result artifact와 같은 모양이다.

## Target MVP 수동 점검 후보

Target MVP 기능이 구현될 때 아래 경로를 단계별로 실제 manual verification 문서로 승격한다.

### Dataset Module Source Dataset C-2 점검

1. backend와 frontend를 실행한다.
2. `/sources` 데이터셋 화면에서 `데이터셋 생성`을 누른다.
3. `Source Dataset`을 선택한다.
4. 1단계에서 등록된 External Connection 하나를 선택하고 schema preview가 표시되는지 확인한다.
5. 2단계에서 `source_dataset_name`과 raw scope를 확인 또는 수정한다.
6. 3단계 Review에서 `Source dataset 저장`을 누른다.
7. 성공 알림이 표시되고 버튼이 `Source dataset 저장됨` 상태가 되는지 확인한다.
8. `GET /api/source-datasets` 응답에 방금 저장한 dataset의 `connection_id`, `raw_scope`, `schema_preview`, `layer=source`, `status=metadata_ready`가 있는지 확인한다.
9. `데이터셋 생성 -> Target Dataset -> Source 선택`에서 저장된 Source Dataset이 후보로 표시되는지 확인한다.
10. 화면 어디에서도 ingest job, raw table creation, ETL 실행 완료처럼 보이지 않는지 확인한다.

### Taxi PostgreSQL Source Dataset 등록 점검

이 경로는 사용자가 가진 TLC Yellow Taxi Parquet을 로컬 PostgreSQL `taxi_postgre`에 먼저 넣고, AskLake에서 실제 PostgreSQL schema preview를 읽어 Source Dataset metadata를 저장하는지 확인한다.
Target Dataset 실행, Catalog 등록, AI Query 연결은 후속 Phase로 남긴다.

1. 로컬 PostgreSQL 컨테이너를 실행한다. 예: `docker run --name asklake-taxi-postgres -e POSTGRES_DB=taxi_postgre -e POSTGRES_USER=asklake -e POSTGRES_PASSWORD=asklake -p 55432:5432 -d postgres:16-alpine`.
2. 실제 password 값은 local env에만 둔다. 예: `ASKLAKE_TAXI_POSTGRES_PASSWORD=asklake`.
3. 쓰기 전 계획만 확인한다.

```bash
.venv/bin/python scripts/load_taxi_parquet_to_postgres.py \
  --input '<LOCAL_TAXI_PARQUET_DIR>' \
  --limit-files 1 \
  --dry-run
```

4. 1차 smoke 파일 하나를 적재한다. 반복 smoke에서는 중복 방지를 위해 `--truncate`를 명시한다.

```bash
ASKLAKE_TAXI_POSTGRES_PASSWORD=asklake .venv/bin/python scripts/load_taxi_parquet_to_postgres.py \
  --input '<LOCAL_TAXI_PARQUET_DIR>' \
  --limit-files 1 \
  --truncate
```

5. backend를 `ASKLAKE_TAXI_POSTGRES_PASSWORD` env와 함께 실행한다.
6. `/sources`에서 `데이터셋 생성 -> External Connection -> PostgreSQL`을 선택한다.
7. `host=localhost`, `port=55432`, `database=taxi_postgre`, `username=asklake`, `password_env=ASKLAKE_TAXI_POSTGRES_PASSWORD`, `schema_table=public.yellow_taxi_trips`를 입력하고 `Test Connection`으로 schema preview를 확인한 뒤 저장한다.
8. `데이터셋 생성 -> Source Dataset`에서 저장된 Taxi PostgreSQL connection을 선택한다.
9. schema preview에 lowercase/canonical Taxi columns와 `airport_fee`가 보이고 `cbd_congestion_fee`가 없음을 확인한다.
10. Source Dataset을 저장하고 `GET /api/source-datasets`에서 `connection_type=postgres`, `raw_scope=public.yellow_taxi_trips`, `schema_preview`, `layer=source`, `status=metadata_ready`를 확인한다.

### Dataset Module Target Dataset C-3 점검

1. backend와 frontend를 실행한다.
2. `/sources` 데이터셋 화면에서 `데이터셋 생성`을 누른다.
3. `Target Dataset`을 선택한다.
4. 1단계 Overview에서 target dataset 이름과 목적을 확인 또는 수정한다.
5. 2단계 Source 선택에서 저장된 Source Dataset을 고른다.
6. 3단계 Process에서 Select Fields 규칙과 target schema preview를 확인한다.
7. 4단계 Scheduling에서 manual 또는 placeholder schedule note를 확인한다.
8. 5단계 Review에서 `Target draft 저장`을 누른다.
9. 성공 알림과 저장된 draft id가 표시되는지 확인한다.
10. `GET /api/target-datasets` 응답에 `source_dataset_id`, `process_rule`, `selected_fields`, `schedule`, `job_definition`, `status=draft`가 있는지 확인한다.
11. 화면과 API 어디에서도 pipeline run, M5 orchestration, CatalogMetadata 등록이 완료된 것처럼 보이지 않는지 확인한다.

### Dataset Module Target Dataset C-4 점검

1. backend와 frontend를 실행한다.
2. `/sources` 데이터셋 화면에서 Target Dataset C-3 흐름을 따라 draft를 저장한다.
3. Review 화면의 `Job Runs` 패널이 저장된 draft 이후에만 보이는지 확인한다.
4. `Job Run 시작`을 누른다.
5. 성공 알림이 표시되고 `run_id`, executor, status, `fixture output dataset_reviews_gold`가 `Job Runs` 목록에 표시되는지 확인한다.
6. 생성 직후 화면이 `GET /api/target-datasets/{dataset_id}/runs` 목록 결과를 반영하는지 확인한다.
7. `GET /api/target-datasets/{dataset_id}/runs` 응답에 `week2_run_id`, `pipeline_id`, `status`, `execution_result.target_dataset_handoff.runtime_output_scope=week2_fixture_output`가 있는지 확인한다.
8. `GET /api/week2/runs/{week2_run_id}`로 M5 `ExecutionResult`가 조회되는지 확인한다.
9. 독립 `M5 데모` 메뉴를 되살리지 않았고, runtime evidence/CatalogMetadata 보강은 후속 Phase로 남아 있는지 확인한다.

### Modular Contract Baseline 점검

1. `docs/03-interface-reference.md`에 `Dataset`, `TrustGateResult`, `PolicyDecision`, `EvidenceItem`, `AuditEvent` 같은 shared contract가 있는지 확인한다.
2. 각 contract가 owner workstream과 mock/fake boundary를 가진지 확인한다.
3. `docs/08-development-workflow.md`가 R1~R7을 workstream alias로 보존하고, 실행은 Workstream Pool과 Integration Spine으로 안내하는지 확인한다.
4. `.milestones/target-mvp/manifest.yaml`이 workstream scope, contracts, integration checkpoint를 포함하는지 확인한다.
5. Query/Ask workstream이 실제 Trust 구현 전에는 mock/fake policy boundary 안에서만 진행되도록 기록되어 있는지 확인한다.
6. 첫 병렬 wave와 integration checkpoint가 `docs/05` acceptance checkpoint와 연결되는지 확인한다.
7. Week 2 모듈 구현 전 `contracts/source_config.sample.json`, `contracts/schema_definition.sample.json`, `contracts/transform_spec.sample.json`, `contracts/runtime_config.sample.json`, `contracts/kafka_topic_contract.sample.json`, `contracts/workflow_definition.sample.json`, `contracts/execution_result.sample.json`, `contracts/catalog_metadata.sample.json`, `contracts/ai_query_result.sample.json`이 존재하고 유효한 JSON인지 확인한다.
8. Week 2 fixture가 M1~M6 producer/consumer, M2 runtime, M3 transform intent, M4 Kafka raw event handoff, Airflow/local runner fallback, direct `spark_runner`, `SqlEngineAdapter` 경계를 명시하는지 확인한다.
9. Week 2 공통 hardening으로 API/UI route, ID 규칙, storage path pattern, workflow/run status, `QueryResult`, guardrail failure shape, daily smoke evidence 형식이 `docs/03`에 정리되어 있는지 확인한다.
10. `contracts/ai_query_result.sample.json`의 `query_result` 필드가 `docs/03`의 `QueryResult` 필드와 일치하는지 확인한다.
11. M2 Taxi local batch evidence를 확인할 때 `scripts/week2_m2_taxi_local_batch_evidence.py --profile fixed`가 하루치 Taxi row를 Gold Parquet 1행으로 만들고, `--profile local-full-month`가 월별 파일 전체 row count와 Gold output path를 evidence JSON에 남기는지 확인한다.
12. M2 Taxi 5GB local Spark evidence를 확인할 때는 로컬 Taxi Parquet directory를 아래처럼 실행한다. 성공 기준은 summary JSON에 `status=succeeded`, input row/bytes, duration, output path, output row/bytes가 남고, output Parquet을 실제로 읽을 수 있는 것이다. 이 검증은 Docker Spark cluster, MinIO/S3 durable write, Product Health 대표 경로를 대체하지 않는다.

```bash
PYTHONPATH=backend SPARK_LOCAL_IP=127.0.0.1 .venv/bin/python scripts/week2_m2_taxi_spark_local_evidence.py \
  --input '<LOCAL_TAXI_PARQUET_DIR>' \
  --profile local-full-month \
  --run-id run_taxi_5gb_local_spark_001 \
  --master 'local[2]' \
  --driver-memory 8g \
  --disable-vectorized-reader \
  --summary-path data/results/m2_taxi_5gb_local_evidence/run_taxi_5gb_local_spark_001_summary.json
```

13. M2 Taxi Docker Spark evidence를 확인할 때는 host의 Taxi directory를 container의 `/data/taxi`로 mount하고, repo의 `data/results/...`를 container의 `/app/data/results/...`로 쓴다. 작은 파일을 먼저 돌린 뒤 같은 Spark master/worker 경로로 5GB directory를 돌린다. 성공 기준은 summary JSON에 `status=succeeded`, Spark master가 `spark://m2-spark-master:7077`, input row/bytes, duration, output path, output row/bytes가 남고, output Parquet을 실제로 읽을 수 있는 것이다. 끝나면 cluster를 내려둔다.

```bash
ASKLAKE_TAXI_HOST_DIR='<LOCAL_TAXI_PARENT_DIR>' scripts/week2_m2_taxi_spark_docker_evidence.sh small
ASKLAKE_TAXI_HOST_DIR='<LOCAL_TAXI_PARENT_DIR>' scripts/week2_m2_taxi_spark_docker_evidence.sh 5gb
scripts/week2_m2_taxi_spark_docker_evidence.sh down
```

14. M2 Taxi Docker Spark MinIO output smoke를 확인할 때는 같은 Docker Spark cluster compose에 포함된 `m2-minio`를 함께 띄운다. 성공 기준은 summary JSON에 `status=succeeded`, `spark_upload_taxi_daily_metrics` task success, local output path, `s3://asklake-demo/...` object URI, input/output row와 bytes가 남는 것이다. 이 검증은 Spark가 직접 `s3a://`로 쓰는 경로가 아니라, Spark local fallback write 뒤 `Week2StorageAdapter`가 같은 output file을 S3-compatible object로 업로드하는 경로다.

```bash
ASKLAKE_TAXI_HOST_DIR='<LOCAL_TAXI_PARENT_DIR>' scripts/week2_m2_taxi_spark_docker_evidence.sh minio-small
scripts/week2_m2_taxi_spark_docker_evidence.sh down
```

15. M2 Taxi Docker Spark direct S3A smoke를 확인할 때는 같은 Docker Spark cluster와 `m2-minio`를 띄우고, Spark submit에 Hadoop AWS package를 붙여 `s3a://asklake-demo/...` output prefix에 직접 Parquet directory를 쓴다. 성공 기준은 summary JSON에 `status=succeeded`, `spark_direct_s3a_write_taxi_daily_metrics` task success, `write_mode=spark_direct_s3a`, `s3a_uri`, input/output row와 bytes가 남는 것이다. 첫 실행은 Maven package download 때문에 느릴 수 있고, 이 검증은 local MinIO 대상 smoke이며 real AWS S3/IAM 검증은 아니다.

```bash
ASKLAKE_TAXI_HOST_DIR='<LOCAL_TAXI_PARENT_DIR>' scripts/week2_m2_taxi_spark_docker_evidence.sh direct-s3a-small
scripts/week2_m2_taxi_spark_docker_evidence.sh down
```

### Week 2 상품 리스크 대표 경로 점검

이 경로는 Week2 발표 대표 path가 5GB 이상 fact input을 처리해 `gold_product_health`를 만들고, Catalog/SQL/UI까지 이어지는지 확인한다.

작은 입력으로 먼저 M2 실행 경로만 확인할 때는 아래 smoke를 실행한다.

```bash
PYTHONPATH=backend .venv/bin/python scripts/week2_m2_product_health_l6_evidence.py
```

이 smoke는 Product Health source별 read/write evidence, M3 L6 preview-only aggregate spec 실행, `gold_product_health.parquet` 생성, DuckDB SQL read를 확인한다. 5GB input 처리와 `risk_score` 최종 의미 확정은 포함하지 않는다.

1. `pipeline_product_health_e2e` run을 실행하거나 사전 실행된 5GB run id를 선택한다.
2. `ExecutionResult.status`가 `succeeded`인지 확인한다.
3. `ExecutionResult.bytes` 또는 run metrics의 `input_total_bytes`가 5GB 이상인지 확인한다.
4. source별 `row_count`, `bytes`, `duration_ms`, `input_path`가 reviews/behavior/delivery fact input에 대해 남았는지 확인한다.
5. bronze output path, silver output path, gold output path가 같은 `run_id`와 연결되는지 확인한다.
6. `GET /api/week2/catalog/dataset_product_health_gold` 또는 대응 Catalog 화면에서 `gold_product_health` output path, Gold row count, Gold bytes, lineage를 확인한다.
7. M6 AI Query에서 "리뷰가 나쁘고 구매 전환도 낮고 배송 지연까지 겹친 문제 상품군을 찾아줘."를 실행한다.
8. `AIQueryResult.route=sql`, `AIQueryResult.query_result.engine=duckdb`, SELECT-only SQL, returned rows, evidence `dataset_id=dataset_product_health_gold`, `retrieval_trace[].source_id=dataset_product_health_gold`, `retrieval_trace[]`의 `schema`/`metric`/`lineage` 근거가 확인되는지 본다.
9. M6 AI Query에서 "위험 점수가 높은 상품과 그 근거를 설명해줘."를 실행해 `route=hybrid`, SQL rows, CatalogMetadata evidence가 함께 반환되는지 확인한다.
10. M6 AI Query에서 "이 데이터셋의 스키마와 lineage 근거를 알려줘."를 실행해 `route=rag`이고 SQL rows 없이 CatalogMetadata evidence만 반환되는지 확인한다.
11. M1에서 run -> catalog -> ask -> evidence 흐름이 끊기지 않고, 위험 상품군과 `risk_score`, `negative_review_rate`, `conversion_rate`, `late_delivery_rate`가 표시되는지 확인한다.
12. M1 `/query`에서 answer metadata panel이 provider/source, fallback, grounding state, evidence indexes를 표시하고, blocked/unsupported를 성공 답변처럼 보이지 않게 하는지 확인한다.
13. 발표 문구나 UI가 "Gold 파일이 5GB"라고 설명하지 않고, 5GB를 input 처리 evidence로 표시하는지 확인한다.

### M6 OpenAI LLM Adapter 점검

이 점검은 실제 key 없이도 provider gate와 fallback이 안전한지 확인한다. live OpenAI 호출은 사용자가 로컬 `OPENAI_API_KEY`를 채운 뒤 별도 smoke로만 실행한다.

1. 기본 환경에서 `AppContainer`가 `TemplateLLMAdapter`를 선택하고 `external_calls_enabled=false`인지 확인한다.
2. `WEEK2_LLM_PROVIDER=openai`만 설정하고 `OPENAI_API_KEY`를 비운 상태에서 외부 호출 없이 template adapter로 fallback되는지 확인한다.
3. fake HTTP client 기반 test로 OpenAI `/responses` request body에 SQL rows, evidence, retrieval trace만 포함되고 API key, local fallback path, 원본 파일 내용이 포함되지 않는지 확인한다.
4. provider timeout/error/malformed response가 발생해도 M6 응답이 template summary로 fallback되는지 확인한다.

### Trust Gate 점검

1. source를 등록하고 schema discovery 결과를 확인한다.
2. schema inference, user override, 또는 schema 확인 결과를 본다.
3. transform/normalize/load를 실행해 output dataset이 생성되는지 확인한다.
4. output path, row count, bytes, duration이 `ExecutionResult` 또는 `CatalogMetadata`에 남는지 확인한다.
5. SQL 또는 `QueryResult`로 output dataset 결과를 검산한다.
6. catalog draft가 생성되는지 확인한다.
7. dataset status가 `Draft` 또는 `Verifying`으로 시작하는지 확인한다.
8. quality, PII, owner, access policy, approval gate 중 남은 조건이 표시되는지 확인한다.
9. 조건 미충족 dataset이 일반 Query/Ask 후보로 노출되지 않는지 확인한다.
10. 모든 필수 조건이 충족된 뒤에만 `Trusted`로 전환되는지 확인한다.
11. gate 실패 시 `Blocked` 또는 제한 상태와 이유가 표시되는지 확인한다.

### Query / Access 점검

1. `Trusted` dataset에서 Query를 실행한다.
2. Query 실행 전 policy preflight 결과를 확인한다.
3. 권한 없는 column 또는 dataset으로 Query를 시도한다.
4. 차단된 자원, 필요한 권한, masking 대안, access request 경로가 표시되는지 확인한다.
5. query execution 결과가 audit event와 연결되는지 확인한다.

### Ask / Evidence 점검

1. 단일 dataset 수치 질문을 Ask에 입력한다.
2. 여러 dataset join 질문을 Ask에 입력한다.
3. 문서 근거가 필요한 질문을 Ask에 입력한다.
4. 근거 없는 질문 또는 지원하지 않는 예측 질문을 입력한다.
5. 권한 없는 데이터가 필요한 질문을 입력한다.
6. 답변에 SQL, dataset, metric, document chunk, freshness, lineage, retrieval trace evidence가 연결되는지 확인한다.
7. 근거 부족 또는 권한 거부 케이스가 confident answer로 표시되지 않는지 확인한다.

### Recovery 점검

1. schema drift 또는 quality failure sample을 준비한다.
2. 실패한 task와 영향을 받는 dataset/query/dashboard/AI index가 표시되는지 확인한다.
3. dataset이 `Degraded` 또는 `Blocked`로 전환되는지 확인한다.
4. retry/rerun/backfill 범위와 idempotency 기준을 확인한다.
5. 복구 후 quality/freshness를 재검증하는지 확인한다.
6. 중복 또는 누락 없이 상태가 정상화되는지 확인한다.
7. incident, audit event, notification 기록이 남는지 확인한다.

## Phase Report 기록 형식

```text
Manual Verification:
- Document executed:
- Environment:
- Result:
- Failure/limitation:
- Evidence:
```
