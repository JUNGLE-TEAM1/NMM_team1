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

## Target MVP 수동 점검 후보

Target MVP 기능이 구현될 때 아래 경로를 단계별로 실제 manual verification 문서로 승격한다.

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
8. `AIQueryResult.route=sql`, `AIQueryResult.query_result.engine=duckdb`, SELECT-only SQL, returned rows, evidence `dataset_id=dataset_product_health_gold`, `retrieval_trace[].source_id=dataset_product_health_gold`가 확인되는지 본다.
9. M1에서 run -> catalog -> ask -> evidence 흐름이 끊기지 않고, 위험 상품군과 `risk_score`, `negative_review_rate`, `conversion_rate`, `late_delivery_rate`가 표시되는지 확인한다.
10. 발표 문구나 UI가 "Gold 파일이 5GB"라고 설명하지 않고, 5GB를 input 처리 evidence로 표시하는지 확인한다.

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

### C-6 CatalogMetadata publish 점검

1. 데이터셋 > Gold Build Jobs에서 `Run 준비`를 눌러 Job Run을 만든다.
2. 실행 기록에서 queued run을 `Local 실행`한다.
3. succeeded run에서 `Catalog 등록`을 누른다.
4. 데이터셋 > Gold Datasets로 이동해 `registered` Gold Dataset이 표시되는지 확인한다.
5. API로 `GET /api/catalog/datasets`를 조회해 `source_type=target_dataset_job_run`, `lineage.run_id`, `metrics.row_count`, `storage.local_path`, `runtime_evidence.runner`, `source_evidence[]`가 남는지 확인한다.
6. queued run에서 publish가 거부되는지 확인한다.
7. 같은 run을 다시 publish해도 catalog row가 중복 생성되지 않는지 확인한다.

### C-12 Job schedule metadata 점검

1. `/jobs/silver-transform`에서 Silver Transform Job의 `Schedule 수정`을 누른다.
2. `Schedule placeholder`와 note를 저장한 뒤 카드에 schedule note가 반영되는지 확인한다.
3. API로 `GET /api/silver-datasets`를 조회해 해당 Silver Dataset의 `schedule.mode/note`만 바뀌었는지 확인한다.
4. `/jobs/gold-build`에서 Gold Build Job의 `Schedule 수정`을 누른다.
5. `Schedule placeholder`와 note를 저장한 뒤 카드에 schedule note가 반영되는지 확인한다.
6. `Run 준비`를 눌러 queued Job Run이 생성되고, run의 `schedule`이 저장된 Gold schedule metadata를 복사하는지 확인한다.
7. schedule 수정이 Source/Silver/Gold definition edit, 실제 scheduler 등록, Airflow DAG trigger로 보이지 않는지 확인한다.

### C-13 Dataset 관리 액션 점검

1. `/connections`에서 External Connection 카드에 `상세`, `수정`, `삭제` 액션이 보이는지 확인한다.
2. Connection metadata를 수정하고 목록에 반영되는지 확인한다.
3. Source Dataset이 참조 중인 Connection 삭제가 차단되는지 확인한다.
4. Silver Dataset이 참조 중인 Source Dataset 삭제가 차단되는지 확인한다.
5. `/datasets/silver`에서 Silver Dataset 카드에 `상세`, `수정`, `삭제` 액션이 보이는지 확인한다.
6. Silver metadata를 수정하고 목록에 반영되는지 확인한다.
7. Target Dataset draft가 참조 중인 Silver 삭제가 차단되는지 확인한다.
8. Target Dataset draft가 참조 중인 Silver의 `name` 변경은 차단되고 `purpose`/rules 수정은 가능한지 확인한다.
9. `/datasets/gold`에서 planned Gold Dataset draft 카드에 `상세`, `수정`, `삭제` 액션이 보이는지 확인한다.
10. Gold 이름 수정 후 목록 title이 새 이름으로 바뀌는지 확인한다.
11. registered CatalogDataset은 상세만 가능하고 수정/삭제가 보이지 않거나 disabled인지 확인한다.
12. `/jobs/silver-transform`에서 `Dataset 편집`을 누르면 해당 Silver Dataset 수정 modal이 바로 열리는지 확인한다.
13. `/jobs/gold-build`에서 `Dataset 편집`을 누르면 해당 Gold/Target draft 수정 modal이 바로 열리는지 확인한다.

### C-21 CatalogDataset management boundary 점검

1. `GET /api/catalog/datasets/management-policy`가 `status=read_only_boundary`를 반환하는지 확인한다.
2. policy의 `allowed_actions`가 `detail`, `ai_query_context`만 포함하는지 확인한다.
3. policy의 `disabled_actions`에 `metadata_update`, `metadata_delete`, `file_delete`, `cascade_delete`가 포함되는지 확인한다.
4. `/datasets/gold`에서 `CatalogDataset Management Boundary` panel이 보이는지 확인한다.
5. registered CatalogDataset 카드에 수정/삭제 액션이 없고 상세만 가능한지 확인한다.
6. output parquet/jsonl file delete가 metadata management와 같은 액션으로 제공되지 않는지 확인한다.

### C-22 Credential secret connection design 점검

1. `GET /api/external-connections/credential-policy`가 `status=secret_ref_design_only`를 반환하는지 확인한다.
2. policy의 `credential_storage`가 `secret_ref_only`, `secret_value_storage`가 `forbidden`인지 확인한다.
3. policy가 Database/Object Storage/Kafka required reference field names만 반환하고 실제 credential 값을 반환하지 않는지 확인한다.

### C-25 External Connection runtime checks 점검

1. PostgreSQL, MongoDB, MinIO/S3, Kafka local runtime이 떠 있는지 확인한다.
2. backend를 local demo env reference와 함께 실행한다. request/response/log에는 env var 이름만 남기고 raw credential 값은 남기지 않는다.
3. `POST /api/external-connections/test`로 `postgres`, `mongodb`, `s3`, `kafka`를 각각 확인한다.
4. 각 response가 `status=passed`, `secret_values_exposed=false`, `schema_discovery_completed=false`를 반환하는지 확인한다.
5. `/connections`에서 `Runtime connection checks` panel이 보이고, 테스트 성공이 Source Dataset 생성 또는 schema discovery 완료처럼 표시되지 않는지 확인한다.
4. `/connections`에서 `Credential Secret Boundary` panel이 보이는지 확인한다.
5. Database/Object Storage connector가 실제 접속/inspect/save 흐름으로 열리지 않고 후속 Phase 또는 blocked 상태로 보이는지 확인한다.
6. diff와 test output에 실제 password/access key/token 값이 없는지 확인한다.

### C-16 File-backed Dataset detail 점검

1. `/datasets/source`에서 Source Dataset 목록에 `file-backed` 또는 `metadata-only` 상태가 보이는지 확인한다.
2. Source Dataset 상세를 열어 local path, bytes, row count status, schema fields가 실제 evidence 상태에 맞게 표시되는지 확인한다.
3. `/datasets/silver`에서 Silver Dataset 상세를 열어 prepared parquet path와 parquet metadata row/schema evidence가 표시되는지 확인한다.
4. `/datasets/gold`에서 planned Gold Dataset 상세를 열어 prepared Gold parquet path와 row/schema evidence가 표시되는지 확인한다.
5. 존재하지 않는 local path를 가진 Dataset은 `missing file`로 표시되고 목록 전체 로딩은 실패하지 않는지 확인한다.

### C-17 Gold Build prepared/local 경계 점검

1. `gold_output=dataset_product_health`인 Gold draft로 Gold Build Job Run을 만든다.
2. 실행 기록에서 `Local 실행` 또는 API `POST /api/target-dataset-job-runs/{run_id}/execute`를 실행한다.
3. 실행 결과가 `prepared parquet reference`, `rows 1000`, `data/local_sources/product_health/gold/gold_product_health.parquet`로 보이는지 확인한다.
4. `Catalog 등록` 후 `GET /api/catalog/datasets`에서 `storage.format=parquet`, `runtime_evidence.materialization_mode=prepared_gold_reference`, 실제 parquet schema의 `internal_product_id`가 보이는지 확인한다.
5. `/api/week2/ai/query`에 위험 점수 질문을 보내 `SELECT internal_product_id, risk_score ...` SQL과 succeeded status가 반환되는지 확인한다.
6. 기존 `gold_output=dataset_product_health_gold` demo path는 `local_demo_jsonl`과 `data/dataset_runs/<run_id>/...jsonl`을 유지하는지 확인한다.

### C-36 Source Snapshot 대용량 경계 점검

1. `/datasets/source`에서 local file 또는 Product Health 관련 Source Dataset 상세를 연다.
2. `Raw snapshot 생성`을 누른다.
3. 결과 카드가 `bounded sample` 또는 `source exhausted`처럼 sample/full ingest 경계를 표시하는지 확인한다.
4. `Rows`는 snapshot에 쓴 row/message 수이고, `input bytes`는 inspected scope의 available input bytes로 표시되는지 확인한다.
5. UI가 Source Snapshot을 full 5GB ingest, Spark/Airflow 실행, Product Health processed input evidence 완료로 표현하지 않는지 확인한다.

### C-37 Product Health Source Inventory Binding 점검

1. `/datasets/source`에서 `Source Dataset 생성`을 연다.
2. `Product Health source inventory` 영역에 behavior, reviews, product catalog, delivery/trip 후보가 보이는지 확인한다.
3. 각 후보가 `Raw file`, `Prepared dataset`, `Missing`, `Mismatch` 중 하나로 표시되는지 확인한다.

### C-38 Product Health Silver/Gold Run Execution 점검

1. `/datasets/gold`에서 `gold_output=dataset_product_health`인 Product Health Gold draft를 준비한다.
2. `Run 준비`로 queued Gold Build Run을 만든다.
3. `/runs`에서 해당 Run의 `실행`을 누른다.
4. 실행 결과가 `prepared parquet reference`, `rows 1000`, `data/local_sources/product_health/gold/gold_product_health.parquet`로 표시되는지 확인한다.
5. API 응답 또는 상세 evidence에서 `runtime_evidence.materialization_mode=prepared_gold_reference`, `large_etl_rerun=false`, `catalog_publish_ready=true`가 남는지 확인한다.
6. 같은 화면이 Airflow/Spark 실행 또는 full 5GB ETL 재실행으로 오해되지 않는지 확인한다.
4. missing/mismatch 후보는 선택할 수 없거나 Source Dataset 저장으로 이어지지 않는지 확인한다.
5. ready 후보를 선택하면 Source Dataset 이름, raw scope/path, schema preview가 자동 채워지는지 확인한다.
6. 저장 후 Source Dataset 목록/상세에서 같은 name/path/schema가 표시되는지 확인한다.

### C-18 Kafka replay evidence UI 점검

1. `/runs`를 연다.
2. `Kafka Replay Evidence` panel이 보이는지 확인한다.
3. evidence 파일이 없으면 `missing_evidence`와 `Kafka replay evidence 없음`이 표시되고 화면 전체가 실패하지 않는지 확인한다.
4. evidence 파일이 있으면 latest run id, topic, sent rows, error count, throughput/progress가 표시되는지 확인한다.
5. replay run 목록에서 `Evidence 보기`를 눌러 source file, target topic, started/finished, metrics가 read-only로 표시되는지 확인한다.
6. UI에 Kafka consume/produce 실행 버튼이 없는지 확인한다.

### C-19 Airflow trigger readiness UI 점검

1. Airflow env 없이 backend와 frontend를 실행한다.
2. `GET /api/week2/airflow/readiness`가 `status=not_configured`, `trigger_available=false`, `fallback_available=true`, `credential_values_exposed=false`를 반환하는지 확인한다.
3. `/runs`를 연다.
4. `Airflow Trigger Readiness` panel이 보이는지 확인한다.
5. env missing 상태에서 DAG id, result root, local fallback 여부가 보이고, 화면 전체가 실패하지 않는지 확인한다.
6. UI에 DAG trigger 실행 버튼이나 credential 값이 없는지 확인한다.
7. Airflow env가 있는 환경에서는 같은 endpoint가 `status=configured`, `trigger_available=true`를 반환하되, readiness 조회만 수행하고 DAG trigger는 실행하지 않는지 확인한다.

### C-20 Spark runner readiness UI 점검

1. backend와 frontend를 실행한다.
2. `GET /api/week2/spark/readiness`가 `runner=spark_runner`, `runner_implementation=local_pyarrow_smoke`, `distributed_cluster_available=false`를 반환하는지 확인한다.
3. `/runs`를 연다.
4. `Spark Runner Readiness` panel이 보이는지 확인한다.
5. supported source type이 `local_file`로 표시되고, S3/PostgreSQL/MongoDB/Kafka는 deferred 또는 unsupported로 보이는지 확인한다.
6. cluster master env가 있더라도 UI가 distributed Spark job 실행 가능 또는 Product Health large ETL 재실행으로 보이지 않는지 확인한다.
7. UI에 Spark cluster 실행 버튼, S3/DB/Kafka read 실행 버튼, 대용량 ETL 재실행 버튼이 없는지 확인한다.

### C-7 AI Query dataset context 점검

1. C-6 흐름으로 Gold Dataset을 `Catalog 등록`한다.
2. AI Query 화면에서 publish된 Gold Dataset schema가 답할 수 있는 질문을 실행한다.
3. 결과의 `Dataset`, `Evidence`, `retrieval_trace`, SQL `FROM` table이 같은 published catalog/run을 가리키는지 확인한다.
4. readiness panel이 `Live catalog readiness`로 표시되고 같은 published catalog id, local path, schema columns, run_id를 보여주는지 확인한다.
5. row 결과가 없거나 storage path가 없으면 성공처럼 표시하지 않고 blocked/error로 보이는지 확인한다.
6. publish된 target catalog가 없을 때 기존 Week2 fixture fallback query가 유지되는지 확인한다.

### C-39 Catalog AI Query Clean-room Handoff 점검

1. C-38 Product Health Gold Run을 성공시킨 뒤 `Catalog 등록`을 실행한다.
2. `/catalog`에서 등록된 CatalogDataset의 `source_id`, `lineage.run_id`, `storage.local_path`, schema가 C-38 run evidence와 같은지 확인한다.
3. `/query`에서 Product Health 위험 점수 질문을 실행한다.
4. `selected_datasets[0].dataset_id`, `evidence[0].dataset_id`, `retrieval_trace[0].source_id`가 같은 CatalogDataset id인지 확인한다.
5. `evidence[0].run_id`가 C-38 run id이고 `evidence[0].storage.local_fallback_path`가 CatalogDataset `storage.local_path`와 같은지 확인한다.
6. 화면의 evidence 카드가 local path를 보여주고, 오래된 fixture/fallback 결과를 최신 run처럼 표시하지 않는지 확인한다.

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
