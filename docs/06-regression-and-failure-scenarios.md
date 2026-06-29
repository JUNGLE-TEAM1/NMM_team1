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

### M4 Kafka replay 실패 row가 사라지는 경우

| 항목 | 내용 |
| --- | --- |
| Must not break | Kafka replay가 producer batch 오류를 만나면 실행 증거 JSON과 dead-letter JSONL에 실패 정보가 남아야 한다. |
| Failure condition | replay 실패 뒤 `status=failed` 또는 `health.status=error`만 보이고 실패 row 원문을 찾을 경로가 없다. |
| Expected behavior | `KafkaReplayEvidence.dead_letter_path`가 채워지고, `KAFKA_REPLAY_DEAD_LETTER_DIR/<run_id>.jsonl`에 실패 row의 `raw_value`, `topic`, `error`가 남는다. |
| Verification method | `kafka-replay-console/server.mjs`의 `persistDeadLetter`와 `contracts/kafka_topic_contract.sample.json`의 `dead_letter_path`를 확인한다. |
| Related docs/interface/Phase | `docs/03`, `contracts/kafka_topic_contract.sample.json`, `kafka-replay-console/server.mjs` |

### M4 Kafka replay evidence가 무기한 쌓이는 경우

| 항목 | 내용 |
| --- | --- |
| Must not break | 로컬 Kafka replay evidence는 보관 기간을 환경변수로 조정할 수 있어야 한다. |
| Failure condition | `data/results/week2/_metadata/kafka_replay/` 아래 실행 JSON이 계속 쌓이는데 삭제 기준을 설정할 수 없다. |
| Expected behavior | `KAFKA_REPLAY_EVIDENCE_RETENTION_DAYS`가 1 이상이면 오래된 `<run_id>.json`과 dead-letter JSONL을 정리하고, `0`이면 자동 삭제를 끈다. |
| Verification method | `.env.example`, `kafka-replay-console/server.mjs`의 `cleanupOldEvidence`를 확인한다. |
| Related docs/interface/Phase | `.env.example`, `kafka-replay-console/server.mjs`, `docs/03` |

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
| Expected behavior | SQL-only 응답은 `route=sql`, SQL+근거 응답은 `route=hybrid`, CatalogMetadata 설명 응답은 `route=rag`, 지원하지 않는 질문은 `route=unsupported`를 반환한다. Catalog 기반 trace는 `source_type=catalog`, `source_id=<dataset_id>`, score, matched_terms, evidence index를 포함한다. |
| Verification method | `backend/tests/test_query_router.py`, `backend/tests/test_week2_ai_query.py` route/retrieval_trace regression과 `contracts/ai_query_result.sample.json`을 확인한다. |
| Related docs/interface/Phase | `docs/03`, `docs/05`, `contracts/ai_query_result.sample.json`, M6 response contract |

### M6 answer metadata와 UI 표시가 답변 신뢰 상태를 잘못 나타내는 경우

| 항목 | 내용 |
| --- | --- |
| Must not break | `AIQueryResult.answer_metadata`는 summary text를 파싱하지 않고도 source/provider/fallback/grounding state와 사용 evidence index를 표시할 수 있어야 한다. |
| Failure condition | M1이 fallback 또는 blocked 답변을 grounded external answer처럼 표시한다. 또는 M6가 blocked/unsupported 응답에 `grounding_state=grounded`를 반환한다. 또는 provider fallback이 `fallback_used=false`로 표시된다. |
| Expected behavior | 성공한 grounded 답변은 `grounding_state=grounded`와 evidence index를 가진다. guardrail blocked/unsupported는 `source=internal`, `provider=m6`, `grounding_state=blocked`를 반환한다. OpenAI provider fallback은 `provider=openai`, `fallback_used=true`, `fallback_reason`을 반환한다. |
| Verification method | `backend/tests/test_week2_ai_query.py`, `backend/tests/test_openai_llm_adapter.py`, `contracts/ai_query_result.sample.json`, frontend build를 확인한다. |
| Related docs/interface/Phase | `docs/03`, `docs/05`, M6 Answer UX Metadata |

### M6 RAG-only route가 SQL engine을 호출하는 경우

| 항목 | 내용 |
| --- | --- |
| Must not break | schema/metric/lineage/catalog 설명만 필요한 질문은 SQL validate/execute를 호출하지 않는다. |
| Failure condition | `route=rag` 응답에서 SQL이 생성되거나, SQL engine validate/execute가 호출되거나, SQL guardrail 실패를 RAG 설명 실패처럼 표시한다. |
| Expected behavior | `route=rag`, `status=succeeded`, empty SQL/query rows, passed guardrail, CatalogMetadata 기반 summary와 retrieval trace를 반환한다. |
| Verification method | `backend/tests/test_query_router.py`, `backend/tests/test_week2_ai_query.py`의 RAG-only no-SQL regression을 확인한다. |
| Related docs/interface/Phase | `docs/03`, `docs/05`, M6 Hybrid Route |

### M6 Catalog RAG-lite index가 안전하지 않은 데이터를 인덱싱하는 경우

| 항목 | 내용 |
| --- | --- |
| Must not break | M6 index는 CatalogMetadata의 안전한 metadata chunk만 사용하고, 원본 파일 전체, secret, credential, local fallback path를 인덱싱하지 않는다. |
| Failure condition | `storage.local_fallback_path`, 실제 파일 내용, API key, credential, 허용되지 않은 컬럼이 index chunk text나 retrieval trace에 들어간다. 또는 `dataset_id + run_id + updated_at`이 바뀌었는데 stale cache를 계속 사용한다. |
| Expected behavior | index 대상은 dataset name, schema fields, metrics, lineage, query allowlist, freshness로 제한된다. Catalog signature가 바뀌면 persisted cache를 재생성한다. |
| Verification method | `backend/tests/test_catalog_retrieval_index.py`, `backend/tests/test_week2_ai_query.py`의 RAG-lite trace regression을 확인한다. |
| Related docs/interface/Phase | `docs/03`, `docs/05`, `contracts/ai_query_result.sample.json`, M6 Catalog RAG Index |

### M6 LLM adapter가 안전하지 않은 context 또는 외부 호출을 사용하는 경우

| 항목 | 내용 |
| --- | --- |
| Must not break | Week 2 기본 답변 생성은 외부 호출 없는 deterministic `TemplateLLMAdapter`를 사용하고, LLM context에는 허용된 SQL rows, evidence, retrieval trace만 들어간다. OpenAI provider는 `WEEK2_LLM_PROVIDER=openai`와 `OPENAI_API_KEY`가 모두 있을 때만 선택된다. |
| Failure condition | `SqlEngineContext.local_fallback_path`, 실제 파일 내용, API key, credential, secret, 허용되지 않은 컬럼이 LLM context/prompt/request body에 들어간다. 또는 key 부재, provider 오류, timeout, malformed response가 M6 응답 전체를 실패시킨다. 또는 blocked/unsupported 응답에서 LLM adapter를 호출한다. |
| Expected behavior | 성공한 SQL/RAG/Hybrid 응답만 `LLMAdapter.generate_summary()`를 호출한다. blocked/unsupported는 M6 내부 보류 summary를 반환한다. 기본 adapter의 `external_calls_enabled`는 false다. OpenAI adapter 오류는 template fallback으로 처리한다. |
| Verification method | `backend/tests/test_openai_llm_adapter.py`의 safe request/fallback regression, `backend/tests/test_week2_ai_query.py`의 LLM adapter context regression, `backend/tests/test_app_container.py`의 default/provider selection test를 확인한다. |
| Related docs/interface/Phase | `docs/03`, `docs/05`, M6 LLM Answer Adapter |

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

### 처리 증거 없이 대용량/복합 Dataset 조작이 완료된 것처럼 보이는 경우

| 항목 | 내용 |
| --- | --- |
| Must not break | 대용량/복합 dataset 조작은 schema 확인, transform/normalize/load 결과, output path, row count, bytes, duration, SQL 검산 evidence 없이 완료 또는 `Trusted`처럼 표시되지 않는다. |
| Failure condition | UI 또는 catalog가 처리 규모와 검산 결과 없이 dataset을 성공/ready로 표시하거나, transform이 실제 output dataset을 남기지 않았는데 완료로 보인다. |
| Expected behavior | 처리 증거가 없으면 run 또는 dataset을 보류/failed/not ready로 표시하고, 필요한 output path/row count/bytes/duration/SQL 검산 누락을 보여준다. |
| Verification method | schema inference/transform/load 후 `ExecutionResult`, `CatalogMetadata`, `QueryResult` evidence를 확인한다. |
| Related docs/interface/Phase | `docs/03`, `docs/05`, `docs/07`, Week 2 M2~M6 |

### Week 2 상품 리스크 5GB input이 Gold pipeline과 분리되는 경우

| 항목 | 내용 |
| --- | --- |
| Must not break | Week 2 상품 리스크 대표 경로의 5GB evidence는 `gold_product_health` 생성 main pipeline input으로 연결되어야 한다. |
| Failure condition | 5GB 처리가 Taxi 별도 evidence로만 남고 `dataset_product_health_gold`의 `run_id`, lineage, source별 rows/bytes/duration과 연결되지 않는다. |
| Expected behavior | `ExecutionResult`는 `input_total_bytes >= 5GB`와 source별 `row_count`, `bytes`, `duration_ms`, `input_path`, bronze/silver/gold `output_path`를 남기고, M5 Catalog는 같은 `run_id`로 `gold_product_health` output을 가리킨다. |
| Verification method | `pipeline_product_health_e2e` 5GB run의 `ExecutionResult`, `CatalogMetadata`, M6 `QueryResult`, M1 evidence display를 확인한다. |
| Related docs/interface/Phase | `docs/03`, `docs/05`, `docs/07`, `pm/docs/week2-product-risk-demo-scenario.md` |

### Gold output 크기를 5GB input 처리 증거로 오해하는 경우

| 항목 | 내용 |
| --- | --- |
| Must not break | `gold_product_health`는 상품별 집계 Gold이므로 output이 원천보다 작아지는 것이 정상이다. |
| Failure condition | 발표/문서/UI가 "Gold 파일이 5GB"라고 설명하거나, Gold output bytes만으로 5GB input 처리를 증명한다. |
| Expected behavior | 5GB 증거는 source/raw/bronze input bytes와 source별 evidence로 설명하고, Gold bytes는 집계 output 크기로 별도 표시한다. |
| Verification method | 발표 문구, M1 evidence label, `ExecutionResult.bytes`, `CatalogMetadata.metrics.bytes` 의미가 `docs/03`과 일치하는지 확인한다. |
| Related docs/interface/Phase | `docs/03`, `docs/05`, `docs/07`, M1/M5/M6 |

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

### CI/CD 우회

| 항목 | 내용 |
| --- | --- |
| Must not break | 제품 기능은 CI/CD와 container smoke를 우회해 완료 처리되지 않는다. |
| Failure condition | build/test/harness validation 또는 deploy smoke 없이 기능 완료를 선언한다. |
| Expected behavior | 최소 CI job과 container smoke 결과 또는 명확한 deferral reason을 `quality.md`와 report에 기록한다. |
| Verification method | workspace `quality.md`, GitHub Actions 결과 또는 local 동등 명령 확인 |
| Related docs/interface/Phase | `docs/04`, `docs/05`, `docs/08`, workspace `quality.md` |

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
