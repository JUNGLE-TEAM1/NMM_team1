# AskLake Week2 책임 분리 ver2

## 문서 목적

이 폴더는 초기 회의안 이후 조정된 AskLake Week2 M1~M6 책임 분리의 현재 작업 기준이다.

기존 `docs/project-context/asklake-week2-module-plan/` 루트 문서는 초기 회의안과 비교용 맥락으로 유지한다. 실제 발표 전 구현과 통합 판단은 이 `ver2/` 문서를 우선 확인한다.

## 읽는 순서

1. `team-handoff-summary.md`
2. `revised-nonoverlap-responsibility.md`
3. `original-vs-revised-flow.md`
4. `implementation-transition-plan.md`
5. `main-e2e-path.md`
6. `product-health-demo-data-design.md`
7. `product-health-synthetic-data-contract.md`
8. `existing-implementation-anchor.md`
9. `m3-json-main-path-decision.md`
10. `runner-boundary-decision.md`
11. `m5-airflow-integration-options.md`
12. `m1-live-ui-phase-plan.md`
13. 필요 시 `m5-technical-depth-study-guide.md`
14. 필요 시 상위 폴더의 `decisions.md`, `plan.md`, `meeting-summary.md`

## 현재 기준

- M1은 UI/API Gateway와 발표 클릭 흐름을 맡는다.
- M2는 Lakehouse Runtime Platform을 맡는다. M2의 구현 책임은 Taxi 전용 ETL이 아니라 데이터셋 독립적인 `RuntimeConfig`/`SparkRunner` 공통 실행기다.
- M3는 Data Processing Spec + ETL Logic을 맡는다.
- M4는 Kafka Ingestion을 맡는다.
- M5는 Workflow Runtime + Catalog Store/API + Lineage를 맡는다.
- M6는 Semantic/RAG/AI Query를 맡는다.

이번 ver2에서 M6의 RAG는 외부 vector DB나 full document RAG가 아니라 `CatalogMetadata` 기반 semantic retrieval, dataset selection evidence, answer grounding을 뜻한다. 즉 발표 기본 범위는 Catalog/Semantic retrieval 기반 RAG-lite와 AI Query이며, 대규모 indexing이나 real LLM 연결은 후속 확장으로 둔다.

M6의 다음 빌드업은 SQL-first로 진행한다. 현재 M6는 CatalogMetadata 선택, template SQL, SQL engine adapter, evidence grounding skeleton을 갖는다. 따라서 2주차 후속 M6 실행 우선순위는 RAG/LLM 확장이 아니라 `dataset_product_health_gold` CatalogMetadata를 기준으로 `storage.local_fallback_path`, `query.table_name`, `query.allowed_columns`, `query.default_limit`만 읽어 실제 SQL MVP를 닫는 것이다. RAG/LLM은 SQL MVP 이후 `SQL MVP -> SQL Planner 강화 -> 응답 계약 보강 -> CatalogMetadata 기반 RAG -> Hybrid query -> 외부 LLM 답변 생성 -> M1 evidence 표시 연동` 순서로 확장한다.

## 데이터 경로 기준

Week2는 상품 리스크 분석 대표 경로와 Kafka replay/streaming evidence 경로를 구분한다. 5GB 처리는 별도 Taxi evidence가 아니라 `gold_product_health`를 만드는 main pipeline input 규모 기준이다.

| 데이터 경로 | 담당 | Week2 기준 |
| --- | --- | --- |
| reviews/behavior/delivery fact input + product dimension | M3/M2/M5/M6/M1 | 상품 리스크 분석 대표 경로. `input_total_bytes >= 5GB` raw/bronze input을 처리해 `gold_product_health`를 만들고, M5 Catalog와 M6 SQL/RAG-lite evidence까지 연결한다. |
| Kafka Event / streaming ingestion | M4 중심 | 1차 blocker가 아니다. 2차 이후 behavior replay evidence, 3차 streaming evidence로 replay/ingestion, throughput, lag, restart evidence를 남긴다. |
| 50GB input scale path | M2/M3/M5 중심 | 3차 확장 목표다. Docker Spark cluster, partitioned Parquet, storage, temp/shuffle/output disk 계획을 포함한다. 100GB는 후속 확장 후보로만 둔다. |

분석 대표 경로는 `gold_product_health`로 고정한다. Amazon Reviews는 리뷰 fact input으로 유지한다. Kafka는 1차 대표 path의 선행 조건으로 두지 않는다.

## 핵심 guardrail

- Spark는 M2가 제공하는 공통 runtime이다.
- M2 `SparkRunner`는 dataset별 runner로 쪼개지 않는다. 입력 format/path/options를 `RuntimeConfig`로 받아 JSON/Parquet 등 source를 읽고 같은 result shape를 반환한다.
- M3는 `gold_product_health` schema, transformation spec/job logic, silver/gold metric semantics를 제공한다.
- M5는 `WorkflowDefinition`으로 `SparkRunner` 또는 local runner를 호출한다.
- M2/M3/M4가 각자 Spark session, config, output convention을 따로 만들지 않는다.
- `SourceConfig`는 M1 단독 소유가 아니다. M1은 shell/demo tenant/source id/화면 입력 흐름을 관리하고, M3/M4는 source type별 options와 validation 요구사항을 제공한다.
- M6는 M5 CatalogMetadata를 읽기 전용으로 소비한다. Catalog 저장/API, ETL, Spark runtime, Kafka ingestion은 각각 M5, M3, M2, M4의 책임으로 유지한다.
- Iceberg는 이번 발표 범위에서 제외한다.

## 병렬 구현 시작 전 Phase Queue

아래 6개 Phase를 순서대로 완료한 뒤 M2/M3/M5의 병렬 구현을 시작한다.

| Phase | 이름 | 목적 | 완료 기준 |
| --- | --- | --- | --- |
| 1 | Responsibility ver2 고정 | 현재 M1~M6 책임 기준을 팀 문서로 고정 | `ver2/` 기준 문서와 workspace evidence가 PR-ready |
| 2 | Implementation transition plan | 기존 구현을 버리지 않고 ver2로 전환하는 순서 작성 | 유지할 구현, 분석 대표 path, adapter-first 원칙 확정 |
| 3 | Analysis representative path 확정 | 상품 리스크 분석 대표 경로를 하나로 고정 | 5GB raw/bronze input -> `gold_product_health` -> M5 Workflow/Catalog -> M6 SQL/RAG-lite/AI Query -> M1 UI 경로 확정 |
| 4 | Existing implementation anchor 선언 | 기존 구현 중 유지/흡수할 범위 확정 | M5 workflow/catalog, M4 Kafka demo, M6 skeleton, M1 shell 유지 선언 |
| 5 | M3 JSON analysis path decision | M3가 먼저 맡을 JSON 분석 대표 path와 PR #105 회수 여부 결정 | source profile/schema/transform spec/Catalog facts 범위 확정 |
| 6 | M5 runner boundary decision | M2 SparkRunner와 M3 job logic이 붙을 실행 경계 확정 | `Week2WorkflowService` 중심 runner boundary와 호출 계약 확정 |

Phase 2의 현재 기준은 [`implementation-transition-plan.md`](implementation-transition-plan.md)에 둔다.

Phase 3의 현재 기준은 [`main-e2e-path.md`](main-e2e-path.md)에 둔다.

Product Health 데모 데이터 준비와 합성 설계는 [`product-health-demo-data-design.md`](product-health-demo-data-design.md)에 둔다.

Product Health 합성데이터 생성을 별도 작업으로 분리할 때의 입력, 출력, schema, metric, 검증 계약은 [`product-health-synthetic-data-contract.md`](product-health-synthetic-data-contract.md)에 둔다.

Product Health 합성데이터 실행 Phase workspace는 아래 순서로 진행한다.

| Phase | Workspace |
| --- | --- |
| PH-DATA-0 Raw sample profiling & contract calibration | [`docs/workflows/feature/product-health-raw-profiling/`](../../../workflows/feature/product-health-raw-profiling/) |
| PH-DATA-1 Synthetic data script smoke | [`docs/workflows/feature/product-health-synthetic-smoke/`](../../../workflows/feature/product-health-synthetic-smoke/) |
| PH-DATA-1B Scenario bucket calibration | [`docs/workflows/feature/product-health-scenario-calibration/`](../../../workflows/feature/product-health-scenario-calibration/) |
| PH-DATA-2 Taxi local file 연결 | [`docs/workflows/feature/product-health-taxi-source-link/`](../../../workflows/feature/product-health-taxi-source-link/) |
| PH-DATA-2B External Connection handoff alignment | [`docs/workflows/feature/product-health-connection-handoff/`](../../../workflows/feature/product-health-connection-handoff/) |
| PH-DATA-2C Smoke byte semantics alignment | [`docs/workflows/feature/product-health-smoke-byte-semantics/`](../../../workflows/feature/product-health-smoke-byte-semantics/) |
| PH-DATA-3 5GB evidence run | [`docs/workflows/feature/product-health-5gb-evidence/`](../../../workflows/feature/product-health-5gb-evidence/) |
| PH-DATA-4 M5 Catalog ingest | [`docs/workflows/feature/product-health-catalog-ingest/`](../../../workflows/feature/product-health-catalog-ingest/) |
| PH-DATA-5 M6 SQL grounding | [`docs/workflows/feature/product-health-sql-grounding/`](../../../workflows/feature/product-health-sql-grounding/) |

Phase 4의 현재 기준은 [`existing-implementation-anchor.md`](existing-implementation-anchor.md)에 둔다.

Phase 5의 현재 기준은 [`m3-json-main-path-decision.md`](m3-json-main-path-decision.md)에 둔다.

Phase 6의 현재 기준은 [`runner-boundary-decision.md`](runner-boundary-decision.md)에 둔다.

M5 실제 Airflow 연결 전 선택지는 [`m5-airflow-integration-options.md`](m5-airflow-integration-options.md)에 둔다.

M1 live UI 후속 Phase 기준은 [`m1-live-ui-phase-plan.md`](m1-live-ui-phase-plan.md)에 둔다.

M5 역할을 기술적으로 깊게 설명해야 할 때는 [`m5-technical-depth-study-guide.md`](m5-technical-depth-study-guide.md)를 보조 학습 문맥으로 사용한다.

팀원이 빠르게 현재 분업과 진행상황을 파악할 때는 [`team-handoff-summary.md`](team-handoff-summary.md)를 먼저 읽는다.
