# 06. 회귀 보호와 실패 시나리오

이 문서는 깨지면 안 되는 동작과 실패 시 기대 동작을 정의한다.

## 목적

- 이미 구현되었거나 합의된 동작을 보호한다.
- current baseline과 Target MVP가 섞여 문서/구현 맥락을 흐리는 것을 막는다.
- 실패와 fallback의 기대 동작을 정의한다.
- 회귀/실패 확인을 manual verification과 Phase report에 연결한다.

## 사용 방법

1. Phase 시작 전 관련 Regression Guard를 읽는다.
2. 완료 전 관련 Failure Scenario를 최소 1개 검토한다.
3. 자동 테스트가 없으면 관련 manual verification을 실행한다.
4. 결과를 Phase report에 기록한다.

## 기능 회귀 보호

### 프로젝트 하네스 정체성

| 항목 | 내용 |
| --- | --- |
| Must not break | 이 저장소는 AskLake 프로젝트 운영 문서와 검증 하네스를 포함한다. |
| Failure condition | 핵심 문서가 다시 “다른 프로젝트에 복사하는 패키지”로 설명된다. |
| Expected behavior | README, AGENTS, product planning, workflow docs가 현재 프로젝트 운영 기준을 설명한다. |
| Verification method | README, AGENTS, `docs/01`, `docs/08`을 수동 검토한다. |
| Related docs/interface/Phase | `README.md`, `AGENTS.md`, `docs/01`, `docs/08` |

### Current Baseline이 제품 목표처럼 남는 경우

| 항목 | 내용 |
| --- | --- |
| Must not break | 기존 CSV/local pipeline MVP는 `Current implementation baseline`으로만 남고 Target MVP를 대체하지 않는다. |
| Failure condition | README 또는 `docs/01`이 AskLake의 제품 목표를 여전히 “경량 데이터 파이프라인 MVP”로 설명한다. |
| Expected behavior | 제품 방향은 Trusted Data & AI Platform이고, baseline은 현재 구현 상태와 historical evidence로 구분한다. |
| Verification method | `rg -n "경량 데이터 파이프라인 MVP|Current implementation baseline|Trusted Data" README.md docs/01-product-planning.md` |
| Related docs/interface/Phase | `README.md`, `docs/01`, `docs/reports/` |

### Target MVP 범위 경계

| 항목 | 내용 |
| --- | --- |
| Must not break | Target MVP는 `Trusted Dataset -> Query/Ask -> Evidence -> Recovery` 신뢰 루프를 증명하며, 연결되지 않는 기능 확장을 우선하지 않는다. |
| Failure condition | connector 수, dashboard 고도화, Kafka/Flink/전용 Vector DB/외부 Airflow 호환이 Trust/Evidence/Recovery보다 먼저 필수화된다. |
| Expected behavior | post-MVP 또는 Decision 이후 범위를 명확히 분리하고, 다음 Phase는 하나의 검증 가능한 신뢰 루프 조각만 다룬다. |
| Verification method | `docs/01`, `docs/05`, `docs/08`에서 Target MVP와 excluded/post-MVP 범위를 확인한다. |
| Related docs/interface/Phase | `docs/01`, `docs/05`, `docs/08` |

### Trust Gate 없이 Query/Ask가 진행되는 경우

| 항목 | 내용 |
| --- | --- |
| Must not break | `Trusted`가 아닌 dataset은 일반 Query/Ask 기본 후보가 되지 않는다. |
| Failure condition | `Draft`, `Verifying`, `Blocked` dataset이 경고 없이 Query/Ask 후보로 사용된다. |
| Expected behavior | Trust Gate 상태와 남은 조건을 표시하고, `Trusted` 조건을 통과하기 전에는 소비를 막거나 명확한 제한 상태로 처리한다. |
| Verification method | Target R1/R4/R5 manual verification에서 trust status별 Query/Ask 후보 여부 확인 |
| Related docs/interface/Phase | `docs/03`, `docs/05`, `docs/07` |

### Contract Baseline 없이 병렬 Workstream이 시작되는 경우

| 항목 | 내용 |
| --- | --- |
| Must not break | Target MVP 병렬 workstream은 shared contract, owner, mock/fake boundary, integration checkpoint 없이 시작하지 않는다. |
| Failure condition | Catalog/Trust, Query/Policy, Ask/Evidence 같은 workstream이 `DatasetStatus`, `PolicyDecision`, `EvidenceItem` 등 공통 계약을 각자 다르게 정의한다. |
| Expected behavior | R0.5 `Modular Contract Baseline`에서 `docs/03` shared contract와 `.milestones/target-mvp/manifest.yaml`을 먼저 확인하고, 필요한 계약 변경은 manifest 또는 Source of Truth에 반영한다. |
| Verification method | `docs/03`, `docs/08`, `.milestones/target-mvp/manifest.yaml`, branch workspace `shared-docs.md`를 확인한다. |
| Related docs/interface/Phase | `docs/03`, `docs/08`, `docs/17`, `.milestones/target-mvp/manifest.yaml` |

### Week 2 Fixture Contract 없이 모듈 구현이 시작되는 경우

| 항목 | 내용 |
| --- | --- |
| Must not break | AskLake 2주차 M1~M6 구현은 `SourceConfig`, `SchemaDefinition`, `TransformSpec`, `RuntimeConfig`, `KafkaTopicContract`, `WorkflowDefinition`, `ExecutionResult`, `CatalogMetadata`, `AIQueryResult` fixture contract 없이 시작하지 않는다. |
| Failure condition | 각 모듈이 tenant id, source id, dataset id, runtime/transform/input event, workflow result, catalog metadata, SQL result shape를 서로 다르게 정의한다. |
| Expected behavior | `contracts/*.sample.json`과 `docs/03`의 Week 2 contract package를 먼저 확인하고, 불확실한 path/row count/MinIO layout은 TODO 또는 decision으로 남긴다. `RuntimeConfig.source_inputs[]`는 legacy `input_format`/`input_path`와 새 `source_type`/`format`/`path`를 호환 유지하며, `source_type`과 `format`을 같은 계층으로 섞지 않는다. |
| Verification method | JSON fixture 유효성, `docs/03` contract package, branch workspace `quality.md`와 `decisions.md`를 확인한다. |
| Related docs/interface/Phase | `contracts/`, `docs/03`, `docs/project-context/asklake-week2-module-plan/` |

### Week 2 공통 hardening 없이 모듈 구현이 시작되는 경우

| 항목 | 내용 |
| --- | --- |
| Must not break | M1~M6 구현은 API/UI route, ID 규칙, storage path pattern, workflow/run status, `QueryResult`, guardrail failure shape, daily smoke evidence 형식 없이 시작하지 않는다. |
| Failure condition | 모듈별로 endpoint 이름, `run_id`/`dataset_id`, MinIO path, run status, SQL 결과, guardrail 실패 응답, smoke evidence 형식이 달라진다. |
| Expected behavior | `docs/03` Week 2 Contract Package와 `contracts/*.sample.json`을 먼저 확인하고 변경이 필요하면 공통 계약을 갱신한 뒤 구현한다. |
| Verification method | `docs/03`, `contracts/*.sample.json`, workspace `decisions.md`, `quality.md`, daily smoke evidence format을 확인한다. |
| Related docs/interface/Phase | `docs/03`, `docs/05`, `docs/07`, `contracts/` |

### Week 2 Airflow 실패가 local fallback 성공으로 가려지는 경우

| 항목 | 내용 |
| --- | --- |
| Must not break | M5 Airflow smoke는 local fallback 성공만으로 Airflow 연결 성공이라고 판단하지 않는다. |
| Failure condition | Airflow DAG trigger, DAG success, result artifact, Catalog update 중 하나가 실패했는데 `fallback_succeeded`만 보고 Airflow 연결이 완료된 것으로 표시한다. |
| Expected behavior | 일반 demo API는 fallback을 유지하되, Airflow smoke evidence는 `status=succeeded`, `airflow adapter executed Week 2 workflow boundary` log, `data/week2/_airflow_results/<run_id>.json`, output JSONL, Catalog lineage를 함께 확인한다. |
| Verification method | `docs/07` Week 2 M5 Airflow local smoke 점검과 `backend/tests/test_week2_airflow_adapter.py`를 확인한다. |
| Related docs/interface/Phase | `docs/03`, `docs/07`, `backend/app/services/week2_airflow_adapter.py`, `docker-compose.airflow.yml` |

### Week 2 storage URI와 local fallback path가 다른 prefix를 가리키는 경우

| 항목 | 내용 |
| --- | --- |
| Must not break | `CatalogMetadata.s3_uri`, `storage.prefix`, `storage.local_fallback_path`는 같은 bucket/prefix/run_id 계약에서 계산되어야 한다. |
| Failure condition | runner는 local path에 파일을 쓰지만 Catalog의 `s3_uri` 또는 `storage.prefix`가 다른 run_id/domain/layer를 가리킨다. |
| Expected behavior | M2 storage adapter가 S3-compatible URI와 local fallback path를 함께 계산하고, opt-in upload smoke에서는 같은 object key로 MinIO/S3-compatible endpoint에 PUT한다. upload가 실패해도 secret 값을 로그나 Git에 남기지 않는다. |
| Verification method | `backend/tests/test_week2_storage_adapter.py`, `backend/tests/test_week2_spark_runner.py`, `backend/tests/test_week2_workflow_catalog.py`를 확인한다. |
| Related docs/interface/Phase | `docs/03`, `contracts/runtime_config.sample.json`, `contracts/catalog_metadata.sample.json`, M2 storage adapter |

### Week 2 SQL runtime이 adapter guardrail 없이 local file을 읽는 경우

| 항목 | 내용 |
| --- | --- |
| Must not break | `DuckDBSqlEngine`은 `SqlEngineAdapter` 뒤에서만 사용하고, `CatalogMetadata.storage.local_fallback_path`를 기준으로 Parquet/JSONL을 읽어야 한다. |
| Failure condition | M6가 DuckDB를 직접 import하거나, SELECT-only/table allowlist/column allowlist/LIMIT/local path 확인 없이 SQL을 실행한다. |
| Expected behavior | SQL 실행 전 guardrail이 실패하면 `AIQueryResult.status`는 `blocked`가 되고, 성공한 경우에만 `QueryResult.engine=duckdb`와 실제 row를 반환한다. |
| Verification method | `backend/tests/test_duckdb_sql_engine.py`, `backend/tests/test_week2_ai_query_duckdb.py`, `scripts/week2_m2_sql_runtime_smoke.py`를 확인한다. |
| Related docs/interface/Phase | `docs/03`, `contracts/catalog_metadata.sample.json`, M2 SQL runtime smoke |

### M6 route 또는 retrieval trace가 응답 근거와 어긋나는 경우

| 항목 | 내용 |
| --- | --- |
| Must not break | `AIQueryResult.route`는 실제 실행 경로를 나타내고, `retrieval_trace`는 선택된 evidence와 연결되어야 한다. |
| Failure condition | SQL 실행 응답인데 route가 `rag`로 표시되거나, unsupported 질문이 `sql`로 표시되거나, trace의 `evidence_index`가 없는 evidence를 가리킨다. |
| Expected behavior | SQL 응답은 `route=sql`, SQL+근거 응답은 `route=hybrid`, schema/lineage metadata 응답은 `route=rag`, 지원하지 않는 질문은 `route=unsupported`를 반환한다. Catalog 기반 trace는 `source_type=catalog/schema/metric/lineage`, `source_id`, score, matched_terms, evidence index를 포함한다. |
| Verification method | `backend/tests/test_query_router.py`, `backend/tests/test_catalog_retrieval_index.py`, `backend/tests/test_week2_ai_query.py`, `contracts/ai_query_result.sample.json`을 확인한다. |
| Related docs/interface/Phase | `docs/03`, `docs/05`, `contracts/ai_query_result.sample.json`, M6 response contract |

### 외부 LLM context에 local path 또는 secret이 섞이는 경우

| 항목 | 내용 |
| --- | --- |
| Must not break | `AIQueryResult.evidence[].storage.local_fallback_path`는 UI/SQL handoff evidence로 유지하지만, 외부 LLM 요청 payload에는 local path, parquet/jsonl path, credential, token, secret 값이 들어가지 않는다. |
| Failure condition | OpenAI adapter request body에 `local_fallback_path`, `/tmp`, `.parquet`, `.jsonl`, API key, secret reference가 포함된다. |
| Expected behavior | LLM adapter는 safe evidence view만 전송하고 provider 오류 또는 빈 응답은 template fallback으로 처리한다. |
| Verification method | `backend/tests/test_openai_llm_adapter.py`, `backend/tests/test_week2_ai_query.py` LLM context regression을 확인한다. |
| Related docs/interface/Phase | `docs/03`, C-48 AI Query route/RAG/LLM 적용 |

### Mock/Fake Boundary를 넘어 실제 접근으로 진행되는 경우

| 항목 | 내용 |
| --- | --- |
| Must not break | mock/fake로 표시된 workstream은 사람 승인과 Decision Option Brief 없이 실제 권한 엔진, 실제 데이터 접근, 외부 LLM, Trino, cloud resource, secret을 사용하지 않는다. |
| Failure condition | Query/Policy mock, Ask/Evidence deterministic route, Recovery fixture가 실제 provider 또는 민감 데이터 path를 사용하면서 `docs/14` 결정과 workstream `decisions.md` 기록이 없다. |
| Expected behavior | workstream을 중단하고 mock/fake boundary 해제를 별도 결정으로 올린다. 승인 전에는 fixture, deterministic route, local fake provider만 사용한다. |
| Verification method | `.milestones/target-mvp/manifest.yaml`, workstream `handoff.md`, branch `decisions.md`, secret/config diff를 확인한다. |
| Related docs/interface/Phase | `docs/03`, `docs/08`, `docs/14`, `docs/17`, `.milestones/target-mvp/manifest.yaml` |

### 질문 전제를 확인하지 않고 답변 또는 실행하는 경우

| 항목 | 내용 |
| --- | --- |
| Must not break | AI는 질문/명령이 일반론, 저장소 규칙, 비교 답변, 실행 요청, 정책 결정, 고영향 행동 중 무엇인지 먼저 판별한다. |
| Failure condition | 일반론과 저장소 규칙이 다른데 전제를 밝히지 않거나, 개념 질문을 실행 승인처럼 처리하거나, PR/merge/finalize/cleanup/검증 생략 같은 고영향 행동을 확인 없이 진행한다. |
| Expected behavior | 답이 전제에 따라 달라지면 `일반론 기준 / 이 저장소 기준`처럼 렌즈를 분리하고, 상태 변경 또는 고영향 행동이면 matching confirmation gate를 먼저 통과한다. |
| Verification method | `docs/08`, `docs/09`, `docs/10`, `docs/13`, `docs/15`에서 Context Assumption Check 흐름을 확인한다. |
| Related docs/interface/Phase | `docs/08`, `docs/09`, `docs/10`, `docs/13`, `docs/15` |

### 권한 없는 데이터가 SQL/RAG/Prompt에 들어가는 경우

| 항목 | 내용 |
| --- | --- |
| Must not break | 권한 없는 dataset/column/document는 SQL 실행, RAG retrieval, prompt assembly, final answer 어느 단계에도 들어가지 않는다. |
| Failure condition | 최종 답변에서만 가리거나, retrieval/prompt 단계에 이미 민감 데이터가 들어간다. |
| Expected behavior | policy preflight, retrieval filtering, prompt redaction, audit event가 모두 적용된다. |
| Verification method | denied dataset/column/document fixture로 Query와 Ask를 실행하고 trace/audit 확인 |
| Related docs/interface/Phase | `docs/03`, `docs/05`, `docs/07`, `docs/12` |

### Evidence 없는 AI 답변이 성공처럼 표시되는 경우

| 항목 | 내용 |
| --- | --- |
| Must not break | Ask 결과는 evidence 또는 보류 사유를 가져야 한다. |
| Failure condition | SQL, dataset, metric, document chunk, freshness, lineage, retrieval trace 없이 confident answer가 표시된다. |
| Expected behavior | evidence 부족 시 `Insufficient Evidence` 또는 보류 상태로 표시하고 필요한 다음 행동을 안내한다. |
| Verification method | 근거 없는 질문, 모호한 KPI, 권한 거부 질문으로 Ask path 확인 |
| Related docs/interface/Phase | `docs/03`, `docs/05`, `docs/07` |

### Recovery/Backfill이 잘못된 Trusted 상태를 만드는 경우

| 항목 | 내용 |
| --- | --- |
| Must not break | retry/rerun/backfill은 중복, 누락, 검증 없는 `Trusted` 복구를 만들지 않는다. |
| Failure condition | backfill 후 quality/freshness 검증 없이 `Trusted`로 돌아가거나 같은 구간이 중복 적재된다. |
| Expected behavior | 대상 구간, idempotency key, output partition, quality result를 기록하고 검증 후 상태를 복구한다. |
| Verification method | schema drift 또는 실패 sample에서 recovery manual verification 실행 |
| Related docs/interface/Phase | `docs/02`, `docs/03`, `docs/05`, `docs/07` |

### 파이프라인 결과 무결성

| 항목 | 내용 |
| --- | --- |
| Must not break | 실패한 pipeline run이 성공한 catalog dataset처럼 표시되지 않는다. |
| Failure condition | 실행 실패 또는 partial output이 `ready`/`success` 상태로 노출된다. |
| Expected behavior | run status는 `failed`가 되고 catalog는 not ready 또는 failed 상태를 보여준다. |
| Verification method | 실패하는 sample source/transform으로 run을 실행하고 UI/API 상태를 확인한다. |
| Related docs/interface/Phase | `docs/03`, `docs/05`, `docs/07` |

### CatalogMetadata publish 무결성

| 항목 | 내용 |
| --- | --- |
| Must not break | 성공하지 않은 Job Run이 Gold CatalogDataset처럼 등록되지 않는다. |
| Failure condition | queued/failed/unmaterialized run에서 `Catalog 등록`이 성공하거나, 같은 run을 여러 번 publish해 중복 catalog row가 생긴다. |
| Expected behavior | publish API는 `succeeded`와 `output_path`/`row_count`가 있는 run만 허용하고, 같은 `run_id` 재요청은 기존 CatalogDataset을 반환한다. |
| Verification method | `/api/target-dataset-job-runs/{run_id}/publish-catalog` backend test와 `/runs` UI publish smoke로 확인한다. |
| Related docs/interface/Phase | `docs/03`, `docs/05`, `docs/07`, C-6 |

### Job schedule metadata와 definition 수정이 섞이는 경우

| 항목 | 내용 |
| --- | --- |
| Must not break | Jobs 화면의 schedule 수정이 Source/Silver/Gold definition, schema, processing recipe, executor handoff를 바꾸지 않는다. |
| Failure condition | `Schedule 수정` 저장이 transform/gold definition을 변경하거나 실제 scheduler/DAG 등록처럼 동작한다. |
| Expected behavior | `PATCH /api/silver-datasets/{dataset_id}/schedule`와 `PATCH /api/target-dataset-drafts/{draft_id}/schedule`은 `schedule.mode/note`만 저장하고, `Run 준비`는 기존처럼 queued Job Run을 만든다. |
| Verification method | C-12 backend focused tests와 `/jobs/silver-transform`, `/jobs/gold-build` browser smoke로 확인한다. |
| Related docs/interface/Phase | `docs/03`, `docs/05`, `docs/07`, C-12 |

### Dataset 관리 삭제가 참조 관계를 깨는 경우

| 항목 | 내용 |
| --- | --- |
| Must not break | External Connection, Source Dataset, Silver Dataset, Target Dataset draft 삭제가 downstream metadata 참조를 깨지 않는다. |
| Failure condition | Source Dataset이 참조 중인 Connection, Silver가 참조 중인 Source, Target draft가 참조 중인 Silver, Job Run이 참조 중인 Target draft가 삭제된다. |
| Expected behavior | 삭제 API는 metadata-only로 동작하고 참조 중이면 `409`와 명확한 이유를 반환한다. Target draft가 참조 중인 Silver의 `name` 변경도 stale lineage 방지를 위해 `409`로 차단한다. registered CatalogDataset은 C-13에서 수정/삭제하지 않는다. |
| Verification method | C-13 backend focused tests와 `/connections`, `/datasets/silver`, `/datasets/gold`, Jobs `Dataset 편집` browser smoke로 확인한다. |
| Related docs/interface/Phase | `docs/03`, `docs/05`, `docs/07`, C-13 |

### CatalogDataset management가 evidence file 삭제와 섞이는 경우

| 항목 | 내용 |
| --- | --- |
| Must not break | registered CatalogDataset은 AI Query context와 run lineage evidence anchor이므로 metadata 관리와 실제 output file 삭제가 섞이지 않는다. |
| Failure condition | Gold Dataset 화면에서 registered CatalogDataset 삭제 버튼이 metadata-only 삭제인지 file delete인지 구분 없이 제공되거나, 삭제가 AI Query readiness를 조용히 깨뜨린다. |
| Expected behavior | C-21에서는 `GET /api/catalog/datasets/management-policy`와 Gold Dataset UI가 read-only boundary를 표시한다. 허용 action은 detail/AI Query context이고, metadata update/delete, file delete, cascade delete는 disabled/deferred다. |
| Verification method | C-21 backend focused test와 `/datasets/gold` UI에서 management boundary panel, registered item 상세-only action을 확인한다. |
| Related docs/interface/Phase | `docs/03`, `docs/05`, `docs/07`, C-21 |

### Dataset detail이 metadata-only를 실제 파일처럼 보이게 하는 경우

| 항목 | 내용 |
| --- | --- |
| Must not break | Source/Silver/Gold Dataset 상세는 실제 local file evidence와 metadata-only/missing 상태를 구분한다. |
| Failure condition | 존재하지 않는 path나 metadata-only draft가 `file-backed`처럼 보이거나, missing file 때문에 목록 전체가 실패한다. |
| Expected behavior | `file_evidence.status`는 `file_backed`, `missing`, `metadata_only` 중 하나로 표시되고, path/bytes/row/schema evidence는 확인 가능한 경우에만 보인다. |
| Verification method | C-16 backend focused tests와 `/datasets/source`, `/datasets/silver`, `/datasets/gold` browser smoke로 확인한다. |
| Related docs/interface/Phase | `docs/03`, `docs/05`, `docs/07`, C-16 |

### Prepared Gold parquet와 local demo JSONL 경계가 섞이는 경우

| 항목 | 내용 |
| --- | --- |
| Must not break | Gold Build local execution은 prepared parquet reference와 generated JSONL demo output을 구분한다. |
| Failure condition | prepared parquet를 1-row demo materialization처럼 보이게 하거나, parquet Catalog schema가 draft preview와 달라 AI Query SQL이 실패한다. |
| Expected behavior | prepared mode는 `runtime_evidence.materialization_mode=prepared_gold_reference`, `storage.format=parquet`, 실제 parquet schema를 Catalog에 남긴다. demo mode는 기존 `local_demo_jsonl`과 `data/dataset_runs/<run_id>/` JSONL output을 유지한다. |
| Verification method | C-17 backend focused tests, `/runs` browser smoke, `/api/week2/ai/query` DuckDB smoke로 확인한다. |
| Related docs/interface/Phase | `docs/03`, `docs/05`, `docs/07`, C-17 |

### Kafka replay evidence 조회가 실제 Kafka 실행처럼 보이는 경우

| 항목 | 내용 |
| --- | --- |
| Must not break | Kafka replay UI는 durable receipt 조회 전용이며 broker/topic consume 또는 produce trigger를 제공하지 않는다. |
| Failure condition | evidence가 없을 때 broker 장애처럼 보이거나, 사용자가 UI에서 실제 Kafka replay를 실행할 수 있다고 오해한다. |
| Expected behavior | `/runs`의 Kafka Replay Evidence는 `missing_evidence`를 정상 상태로 설명하고, evidence가 있으면 health/run metrics와 lineage만 read-only로 표시한다. |
| Verification method | C-18 backend focused tests와 `/runs` browser smoke로 확인한다. |
| Related docs/interface/Phase | `docs/03`, `docs/05`, `docs/07`, C-18 |

### Airflow readiness가 DAG trigger 성공처럼 보이는 경우

| 항목 | 내용 |
| --- | --- |
| Must not break | Airflow readiness UI는 env 설정 가능 상태와 local fallback 경계만 보여주며 DAG trigger 또는 DAG success evidence로 보이지 않는다. |
| Failure condition | env missing 상태를 Airflow 실행 가능으로 표시하거나, readiness panel이 trigger button/credential value를 노출하거나, fallback 가능 상태를 Airflow DAG 성공처럼 표현한다. |
| Expected behavior | `/runs`의 Airflow Trigger Readiness는 `not_configured`이면 `trigger_available=false`, `fallback_available=true`를 표시하고, `configured`여도 read-only readiness로 유지한다. 실제 DAG 성공은 별도 Airflow smoke evidence로만 판단한다. |
| Verification method | C-19 backend focused tests, `/api/week2/airflow/readiness` HTTP smoke, `/runs` UI smoke로 확인한다. |
| Related docs/interface/Phase | `docs/03`, `docs/05`, `docs/07`, C-19 |

### Spark readiness가 distributed Spark 실행 가능처럼 보이는 경우

| 항목 | 내용 |
| --- | --- |
| Must not break | Spark readiness UI는 현재 `Week2SparkRunner`가 local pyarrow smoke 경계라는 점과 distributed cluster 실행 미지원 상태를 분리해서 표시한다. |
| Failure condition | `spark_runner`가 S3/PostgreSQL/MongoDB/Kafka source를 직접 읽거나 distributed Spark cluster job을 실행할 수 있는 것처럼 표시한다. |
| Expected behavior | `/runs`의 Spark Runner Readiness는 `runner_implementation=local_pyarrow_smoke`, `supported_source_types=["local_file"]`, `distributed_cluster_available=false`를 표시하고, cluster env가 있어도 실행 가능 evidence로 해석하지 않는다. |
| Verification method | C-20 backend focused tests, `/api/week2/spark/readiness` HTTP smoke, `/runs` UI smoke로 확인한다. |
| Related docs/interface/Phase | `docs/03`, `docs/05`, `docs/07`, C-20 |

### AI Query dataset context 연결 무결성

| 항목 | 내용 |
| --- | --- |
| Must not break | publish된 Gold CatalogDataset이 AI Query 후보로 들어갈 때 schema/storage/metrics/lineage가 다른 fixture catalog와 섞이지 않는다. |
| Failure condition | `selected_datasets`, `evidence.dataset_id`, `retrieval_trace.source_id`, SQL `FROM` table, `evidence.storage.local_fallback_path`가 서로 다른 dataset/run/path를 가리키거나, publish된 catalog가 있어도 fixture만 선택된다. |
| Expected behavior | AI Query는 published CatalogDataset을 CatalogMetadata shape로 변환해 선택하고, evidence와 SQL context가 같은 catalog id/run id/local path를 사용한다. |
| Verification method | C-39 backend focused test와 `/api/week2/ai/query` HTTP smoke에서 publish된 target dataset context를 확인한다. |
| Related docs/interface/Phase | `docs/03`, `docs/05`, `docs/07`, C-39 |

### 처리 증거 없이 대용량/복합 Dataset 조작이 완료된 것처럼 보이는 경우

| 항목 | 내용 |
| --- | --- |
| Must not break | 대용량/복합 dataset 조작은 schema 확인, transform/normalize/load 결과, output path, row count, bytes, duration, SQL 검산 evidence 없이 완료 또는 `Trusted`처럼 표시되지 않는다. |
| Failure condition | UI 또는 catalog가 처리 규모와 검산 결과 없이 dataset을 성공/ready로 표시하거나, transform이 실제 output dataset을 남기지 않았는데 완료로 보인다. |
| Expected behavior | 처리 증거가 없으면 run 또는 dataset을 보류/failed/not ready로 표시하고, 필요한 output path/row count/bytes/duration/SQL 검산 누락을 보여준다. |
| Verification method | schema inference/transform/load 후 `ExecutionResult`, `CatalogMetadata`, `QueryResult` evidence를 확인한다. |
| Related docs/interface/Phase | `docs/03`, `docs/05`, `docs/07`, Week 2 M2~M6 |

### Source Snapshot sample을 full ingest로 오해하는 경우

| 항목 | 내용 |
| --- | --- |
| Must not break | Source Snapshot은 bounded sample evidence로 표시되고, full 대용량 ingest 또는 Product Health 5GB 처리 증거처럼 보이지 않는다. |
| Failure condition | `row_count=100`, snapshot output bytes, 또는 local available input bytes가 전체 ingest 완료나 5GB processed input success로 표시된다. |
| Expected behavior | Snapshot 응답/UI는 `snapshot_mode=bounded_sample`, requested sample size, coverage status, `large_data_status=not_full_large_data_ingest`를 표시한다. full ingest/retry/backfill/Spark/Airflow 실행은 후속 Phase로 남긴다. |
| Verification method | Source Dataset 상세에서 Raw snapshot 생성 후 bounded/sample label과 input/output bytes 의미를 확인하고, `docs/03` snapshot contract와 일치하는지 본다. |
| Related docs/interface/Phase | `docs/03`, `docs/05`, `docs/07`, C-36 |

### Week 2 상품 리스크 5GB input이 Gold pipeline과 분리되는 경우

| 항목 | 내용 |
| --- | --- |
| Must not break | Week 2 상품 리스크 대표 경로의 5GB evidence는 `gold_product_health` 생성 main pipeline input으로 연결되어야 한다. |
| Failure condition | 5GB 처리가 Taxi 별도 evidence로만 남고 `dataset_product_health_gold`의 `run_id`, lineage, source별 rows/bytes/duration과 연결되지 않는다. |
| Expected behavior | `ExecutionResult`는 `input_total_bytes >= 5GB`와 source별 `row_count`, `bytes`, `duration_ms`, `input_path`, bronze/silver/gold `output_path`를 남기고, M5 Catalog는 같은 `run_id`로 `gold_product_health` output을 가리킨다. |
| Verification method | `pipeline_product_health_e2e` 5GB run의 `ExecutionResult`, `CatalogMetadata`, M6 `QueryResult`, M1 evidence display를 확인한다. |
| Related docs/interface/Phase | `docs/03`, `docs/05`, `docs/07`, `pm/docs/week2-product-risk-demo-scenario.md` |

### Product Health prepared dataset을 외부 raw source처럼 표시하는 경우

| 항목 | 내용 |
| --- | --- |
| Must not break | Product Health Source Inventory는 raw file, prepared dataset, missing, mismatch 상태를 분리해 표시한다. |
| Failure condition | prepared parquet가 실제 외부 raw source처럼 표시되거나, missing source가 Source Dataset 저장 가능한 ready 후보처럼 보인다. |
| Expected behavior | `GET /api/product-health/source-inventory`와 Source Dataset UI는 `binding_type`과 `status`를 표시하고, `can_create_source_dataset=false` 후보는 선택/저장을 차단한다. |
| Verification method | C-37 focused API test와 Source Dataset wizard에서 후보 카드의 label/status/path/schema를 확인한다. |
| Related docs/interface/Phase | `docs/03`, `docs/05`, `docs/07`, C-37 |

### Gold output 크기를 5GB input 처리 증거로 오해하는 경우

| 항목 | 내용 |
| --- | --- |
| Must not break | `gold_product_health`는 상품별 집계 Gold이므로 output이 원천보다 작아지는 것이 정상이다. |
| Failure condition | 발표/문서/UI가 "Gold 파일이 5GB"라고 설명하거나, Gold output bytes만으로 5GB input 처리를 증명한다. |
| Expected behavior | 5GB 증거는 source/raw/bronze input bytes와 source별 evidence로 설명하고, Gold bytes는 집계 output 크기로 별도 표시한다. |
| Verification method | 발표 문구, M1 evidence label, `ExecutionResult.bytes`, `CatalogMetadata.metrics.bytes` 의미가 `docs/03`과 일치하는지 확인한다. |
| Related docs/interface/Phase | `docs/03`, `docs/05`, `docs/07`, M1/M5/M6 |

### Product Health Gold 실행 결과가 prepared path만 참조하는 경우

### Frontend shell 분리가 route/navigation을 깨뜨리는 경우

| 항목 | 내용 |
| --- | --- |
| Must not break | App shell refactor 후 기존 route alias, navigation, page entry가 동일하게 동작한다. |
| Failure condition | `/`, `/datasets`, `/jobs`, `/query`, `/catalog/<id>` normalize가 바뀌거나, 주요 메뉴가 잘못 active 처리되거나, standalone page가 비어 보인다. |
| Expected behavior | `App.jsx`는 shell/router composition을 분리하되 기존 route behavior와 API 호출 순서를 유지한다. |
| Verification method | C-48A frontend build와 route browser smoke에서 주요 경로 접근, nav active state, console error를 확인한다. |
| Related docs/interface/Phase | `docs/05`, `docs/07`, C-48A |

### Dataset feature boundary 분리가 wizard/action 상태를 잃는 경우

| 항목 | 내용 |
| --- | --- |
| Must not break | Connection/Source/Silver/Gold/Jobs 화면의 생성, 상세, 수정, 삭제, Run 준비 흐름이 리팩토링 후에도 유지된다. |
| Failure condition | hook/module 분리 후 wizard 단계가 초기화되거나, 저장 후 목록 refresh가 누락되거나, dataset edit 이동과 schedule modal이 깨진다. |
| Expected behavior | Dataset workspace 내부 state/action/model은 분리되지만 API payload, user flow, route, UI copy는 behavior-preserving으로 유지된다. |
| Verification method | C-48B focused frontend/browser smoke와 기존 dataset API focused tests를 실행한다. |
| Related docs/interface/Phase | `docs/05`, `docs/07`, C-48B |

### Product Health Gold 실행 결과가 prepared path만 참조하는 경우

| 항목 | 내용 |
| --- | --- |
| Must not break | 성공한 Product Health Gold Run은 실행별 `data/lake/gold/run_id=<run_id>/...parquet` output artifact를 남긴다. |
| Failure condition | Run `output_path`가 `data/local_sources/product_health/gold/gold_product_health.parquet`만 가리키거나, prepared path가 Catalog publish 대상 최신 output처럼 표시된다. |
| Expected behavior | prepared Gold parquet는 input/reference evidence로 남기고, local runner는 run별 lake output으로 copy/write-through 한다. Run rows/bytes/schema는 lake output 기준으로 계산한다. |
| Verification method | C-49 backend test와 `/runs` 수동 실행 smoke에서 `output_path` 존재, row count, bytes, materialization mode, prepared source evidence를 확인한다. |
| Related docs/interface/Phase | `docs/03`, `docs/05`, `docs/07`, C-49 |

### Catalog와 AI Query가 lake output 대신 prepared source를 최신 결과로 읽는 경우

| 항목 | 내용 |
| --- | --- |
| Must not break | Product Health CatalogDataset과 AI Query evidence는 방금 실행한 lake output path와 run id를 기준으로 연결된다. |
| Failure condition | Catalog `storage.local_path`, AI Query `evidence.storage.local_fallback_path`, SQL table context 중 하나가 `data/local_sources/product_health` prepared path를 최신 run output처럼 가리킨다. |
| Expected behavior | Catalog publish는 C-49 run `output_path`를 storage path로 쓰고, prepared path는 lineage/reference evidence에만 남긴다. AI Query selected dataset, evidence, retrieval trace는 같은 catalog/run/lake path를 사용한다. |
| Verification method | C-50 backend smoke와 `/catalog` -> `/query` browser smoke에서 dataset id, run id, local path 일치를 확인한다. |
| Related docs/interface/Phase | `docs/03`, `docs/05`, `docs/07`, C-50 |

### Schedule placeholder가 실제 스케줄러처럼 보이는 경우

| 항목 | 내용 |
| --- | --- |
| Must not break | schedule metadata와 실제 run trigger는 분리된다. |
| Failure condition | schedule 저장만으로 Run이 자동 생성/실행된 것처럼 보이거나, Airflow/Spark scheduler가 성공한 것처럼 UI/API가 표현한다. |
| Expected behavior | `manual`은 수동 execute button으로만 실행하고, `placeholder`는 자동 실행 미구현 상태와 다음 필요 조건을 표시한다. 실제 scheduler 등록, DAG trigger, cron worker, retry/backfill은 별도 Phase로 남긴다. |
| Verification method | C-51 UI/API smoke에서 schedule 수정 후 run count/output path가 자동 변경되지 않는지, 수동 실행 후에만 lake output이 생기는지 확인한다. |
| Related docs/interface/Phase | `docs/03`, `docs/05`, `docs/07`, C-51 |

### Container App Health

| 항목 | 내용 |
| --- | --- |
| Must not break | backend health API와 frontend 정적 앱이 container-first 실행 경로에서 응답한다. |
| Failure condition | `GET /health` 또는 `GET /api/health`가 200/ok contract를 반환하지 않거나 frontend container가 `/`를 제공하지 않는다. |
| Expected behavior | `scripts/smoke-container-app.sh`가 backend/frontend image build, compose up, health/frontend curl을 통과한다. |
| Verification method | `scripts/smoke-container-app.sh` |
| Related docs/interface/Phase | `docs/03`, `docs/04`, `docs/08`, M2 `feature/container-app-skeleton` |

### 로컬 환경 지원 범위가 불명확해지는 경우

| 항목 | 내용 |
| --- | --- |
| Must not break | macOS, Windows WSL2, native Windows shell의 지원 범위와 미검증 범위가 구분되어 있다. |
| Failure condition | README 또는 개발 가이드가 Windows native PowerShell/CMD에서도 `scripts/*.sh`가 동일하게 동작한다고 암시하거나, WSL2 권장 경로를 지운다. |
| Expected behavior | `docs/04`가 Docker Compose 권장 경로, WSL2 지원 경로, native Windows 미검증 범위, bash-compatible shell 요구사항을 유지한다. |
| Verification method | `rg -n "WSL2|PowerShell|bash-compatible|Docker Compose|support tier|지원 등급" docs/04-development-guide.md docs/07-manual-verification-playbook.md docs/manual-verification` |
| Related docs/interface/Phase | `docs/04`, `docs/05`, `docs/07`, `docs/08` |

### Source Catalog Ready State

| 항목 | 내용 |
| --- | --- |
| Must not break | CSV source 등록 결과가 schema, row count, sample rows와 함께 catalog ready dataset으로 표시된다. |
| Failure condition | 없는 CSV path가 ready dataset으로 저장되거나, 등록된 CSV의 schema/sample이 catalog detail에서 사라진다. |
| Expected behavior | 정상 CSV는 ready catalog dataset이 되고, 없는 file path는 4xx validation error로 끝나며 catalog에 저장되지 않는다. |
| Verification method | `docker run --rm asklake-backend:<tag> python -m pytest`; `scripts/smoke-container-app.sh` |
| Related docs/interface/Phase | `docs/03`, `docs/05`, `docs/07`, M3 `feature/source-catalog` |

## 기능 실패 시나리오

### 예시 산출물이 다시 들어오는 경우

| 항목 | 내용 |
| --- | --- |
| Must not break | 운영 문서가 초기 예시 산출물로 다시 오염되지 않는다. |
| Failure condition | 과거 시뮬레이션 report나 example workspace가 기본 운영 경로에 추가된다. |
| Expected behavior | 예시는 필요할 때 별도 Phase에서 명시적으로 추가하고, 기본 `docs/workflows/`와 `docs/reports/`는 실제 작업만 담는다. |
| Verification method | `find docs/workflows -mindepth 2 -maxdepth 2 -type d` and `find docs/reports -maxdepth 1 -name "phase-*.md"` |
| Related docs/interface/Phase | `docs/workflows/`, `docs/reports/` |

### 프로젝트별 명령이 없는 경우

| 항목 | 내용 |
| --- | --- |
| Must not break | 실제 기능 Phase 전에 실행/test/build 명령이 확인된다. |
| Failure condition | 기능 구현 완료를 선언했지만 `quality.md`에 실행한 검증 명령이나 skip reason이 없다. |
| Expected behavior | 프로젝트별 명령을 확정하거나, 미확정이면 deferral reason을 기록한다. |
| Verification method | workspace `quality.md`, `scripts/status-workflow.sh <workspace>` |
| Related docs/interface/Phase | `docs/04`, `docs/12`, workspace `quality.md` |

### 고비용 인프라 승인 누락

| 항목 | 내용 |
| --- | --- |
| Must not break | 비용이 발생하거나 운영 부담이 큰 인프라는 approval gate 없이 필수화되지 않는다. |
| Failure condition | AWS, EKS, S3, RDS, Bedrock, OpenSearch, Trino, Kafka, Spark, Airflow를 승인 없이 기본 실행 경로에 넣거나 실제 resource를 만든다. |
| Expected behavior | 각 고비용 기능은 container/local smoke 대체 경로와 option brief를 가진 뒤 승인된 Phase에서만 구현한다. |
| Verification method | workspace `decisions.md`, `shared-docs.md`, `quality.md`, 관련 Phase report 확인 |
| Related docs/interface/Phase | `docs/02`, `docs/08`, workspace `decisions.md` |

### DB/S3 credential 값이 metadata 또는 로그에 저장되는 경우

| 항목 | 내용 |
| --- | --- |
| Must not break | DB/S3 connector는 `secret_ref` 또는 env var name 같은 reference만 저장하고 raw password/access key/token 값을 request/response/log/metadata에 남기지 않는다. |
| Failure condition | External Connection create/update/inspect가 raw credential 필드를 받거나, error message가 credential 값을 echo하거나, placeholder credential이 Git에 commit된다. |
| Expected behavior | `/api/external-connections/credential-policy`와 연결 UI가 `secret_ref_only` boundary를 표시한다. C-25부터 lightweight runtime connection test는 가능하지만 request는 env var name reference만 받고, 응답은 `secret_values_exposed=false`, `schema_discovery_completed=false`를 반환한다. Schema discovery, ingest, Source Dataset 생성, sync job 등록은 여전히 별도 단계다. |
| Verification method | C-22/C-25 backend focused test, `/connections` UI policy/runtime check panel, diff secret scan으로 확인한다. |
| Related docs/interface/Phase | `docs/03`, `docs/05`, `docs/07`, C-22 |

### CI/CD 우회

| 항목 | 내용 |
| --- | --- |
| Must not break | 제품 기능은 CI/CD와 container smoke를 우회해 완료 처리되지 않는다. |
| Failure condition | build/test/harness validation 또는 deploy smoke 없이 기능 완료를 선언한다. |
| Expected behavior | 최소 CI job과 container smoke 결과 또는 명확한 deferral reason을 `quality.md`와 report에 기록한다. |
| Verification method | workspace `quality.md`, GitHub Actions 결과 또는 local 동등 명령 확인 |
| Related docs/interface/Phase | `docs/04`, `docs/05`, `docs/08`, workspace `quality.md` |

### Product Health prepared Gold reference가 새 대용량 ETL처럼 보이는 경우

| 항목 | 내용 |
| --- | --- |
| Must not break | Product Health Gold Run은 prepared parquet reference와 새 local materialization을 구분한다. |
| Failure condition | `gold_product_health.parquet`를 참조했는데 UI/API가 full 5GB ETL 재실행처럼 표현하거나 output path/row/bytes 없이 succeeded로 표시한다. |
| Expected behavior | prepared mode는 `runtime_evidence.materialization_mode=prepared_gold_reference`, `large_etl_rerun=false`, `catalog_publish_ready=true`, 실제 parquet path/row/bytes/schema evidence를 남긴다. |
| Verification method | `backend/tests/test_target_dataset_local_materialization.py`와 `/runs` 실행 기록에서 Mode, Output, Rows, Bytes를 확인한다. |
| Related docs/interface/Phase | `docs/03`, C-38 |

### Product Health preset synthesis가 범용 ETL 실행처럼 보이는 경우

| 항목 | 내용 |
| --- | --- |
| Must not break | Product Health preset 합성은 이미 정의된 demo-only synthesis run으로 제한된다. |
| Failure condition | UI/API가 임의 Source 조합, 사용자 정의 join/risk rule 편집, Airflow/Spark production 실행, 새 5GB 다운로드 또는 processed evidence 재측정처럼 표현한다. |
| Expected behavior | `/api/product-health/preset-synthesis`는 기존 local synthesis script를 실행하고 `seed_product_mapping`, Silver parquet, Gold parquet, Catalog/Evidence 준비 artifact path/row/status만 반환한다. |
| Verification method | `backend/tests/test_product_health_preset_synthesis.py`, `/datasets/gold` Product Health preset panel, `npm --prefix frontend run build`로 확인한다. |
| Related docs/interface/Phase | `docs/03`, C-41 |

### Product Health runtime source가 local/prepared primary로 되돌아가는 경우

| 항목 | 내용 |
| --- | --- |
| Must not break | Product Health 원천 후보는 Kafka/PostgreSQL/MongoDB/S3 runtime source를 primary로 표시하고 local/prepared artifact는 fallback evidence로만 표시한다. |
| Failure condition | Source inventory 카드나 API가 `reviews=prepared_dataset`, `product_catalog=local_file`처럼 fallback artifact를 primary connection type처럼 보여준다. |
| Expected behavior | `/api/product-health/source-inventory`는 `binding_type=runtime_source`, `connection_type`은 `kafka/postgres/mongodb/s3`, fallback은 `fallback_binding_type`과 `fallback_path`에 담는다. |
| Verification method | `backend/tests/test_product_health_source_inventory.py`, `/datasets/source` Product Health inventory panel, `npm --prefix frontend run build`로 확인한다. |
| Related docs/interface/Phase | `docs/03`, C-42 |

### Product Health runtime connection seed가 secret 값을 저장하거나 중복 생성하는 경우

| 항목 | 내용 |
| --- | --- |
| Must not break | Product Health runtime connection seed는 raw credential 값을 저장/응답하지 않고 connection name 기준으로 idempotent하게 동작한다. |
| Failure condition | seed 응답이나 External Connection metadata에 password/access key/secret key/token/raw credential 값이 포함되거나, 버튼을 반복 실행할 때 같은 connection이 중복 생성된다. |
| Expected behavior | `/api/product-health/runtime-connections/seed`는 Kafka/PostgreSQL/MongoDB/S3 metadata 4개를 생성/업데이트하고, readiness에는 `testable` 또는 `secret_ref_required` 상태만 표시한다. |
| Verification method | `backend/tests/test_product_health_runtime_connection_seed.py`, `/connections` Product Health runtime connection panel, `npm --prefix frontend run build`로 확인한다. |
| Related docs/interface/Phase | `docs/03`, C-43 |

### Product Health Source Dataset 저장이 fallback path를 primary raw scope로 쓰는 경우

| 항목 | 내용 |
| --- | --- |
| Must not break | Product Health Source Dataset은 Kafka/PostgreSQL/MongoDB/S3 runtime scope를 primary `raw_scope`로 저장한다. |
| Failure condition | `source_product_reviews`의 `raw_scope`가 prepared parquet path로 저장되거나, `source_user_events`의 `connection_type`이 `local_file`처럼 저장된다. |
| Expected behavior | 저장 응답과 목록/상세 응답은 `runtime_source`에 connection type/scope를 담고, local/prepared path는 `fallback_evidence`로만 표시한다. |
| Verification method | `backend/tests/test_product_health_source_save_alignment.py`, Source Dataset 상세 UI, `npm --prefix frontend run build`로 확인한다. |
| Related docs/interface/Phase | `docs/03`, C-44 |

### Product Health runtime seed loader가 secret 또는 잘못된 target에 적재하는 경우

| 항목 | 내용 |
| --- | --- |
| Must not break | 11GB 합성 데이터셋 적재는 role별 target mapping을 지키고, dry-run을 기본값으로 유지하며, secret 값을 evidence에 남기지 않는다. |
| Failure condition | loader가 `behavior_events`를 Kafka 외 target에 넣거나, `product_catalog`/`reviews`/`delivery_trip_logs` target을 바꾸거나, MinIO access key 같은 raw secret을 `data/results` evidence에 기록한다. |
| Expected behavior | `scripts/product_health_runtime_seed_loaders.py`는 manifest의 role/target을 검증 가능한 `ProductHealthRuntimeSeedLoadEvidence`로 남기고, `--execute`가 없으면 외부 runtime에 쓰지 않는다. |
| Verification method | `python3 -m py_compile scripts/product_health_runtime_seed_loaders.py`, `python3 scripts/product_health_runtime_seed_loaders.py`, `python3 -m json.tool contracts/product_health_runtime_seed_manifest.sample.json`로 확인한다. |
| Related docs/interface/Phase | `docs/03`, C-47 |

## 공통 인프라 실패 시나리오

- 필수 environment variable 누락
- data store 사용 불가
- migration/data 변경 실패
- external provider timeout/error
- background job 실패
- auth/access-control 실패
- file 또는 input validation 실패
- policy decision 누락
- retrieval/index stale
- audit event 저장 실패

## Phase Report 최소 형식

```text
Regression Guard:
- Checked feature:
- Protected behavior:
- Result:

Failure Scenario:
- Reviewed failure:
- Expected behavior:
- Verification:
- Result:
```
