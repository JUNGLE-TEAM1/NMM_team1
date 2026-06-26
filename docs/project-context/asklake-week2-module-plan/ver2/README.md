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
6. `existing-implementation-anchor.md`
7. `m3-json-main-path-decision.md`
8. `runner-boundary-decision.md`
9. `m1-live-ui-phase-plan.md`
10. 필요 시 상위 폴더의 `decisions.md`, `plan.md`, `meeting-summary.md`

## 현재 기준

- M1은 UI/API Gateway와 발표 클릭 흐름을 맡는다.
- M2는 Lakehouse Runtime Platform을 맡는다. M2의 구현 책임은 Taxi 전용 ETL이 아니라 데이터셋 독립적인 `RuntimeConfig`/`SparkRunner` 공통 실행기다.
- M3는 Data Processing Spec + ETL Logic을 맡는다.
- M4는 Kafka Ingestion을 맡는다.
- M5는 Workflow Runtime + Catalog Store/API + Lineage를 맡는다.
- M6는 Semantic/RAG/AI Query를 맡는다.

이번 ver2에서 M6의 RAG는 외부 vector DB나 full document RAG가 아니라 `CatalogMetadata` 기반 semantic retrieval, dataset selection evidence, answer grounding을 뜻한다. 즉 발표 기본 범위는 Catalog/Semantic retrieval 기반 RAG-lite와 AI Query이며, 대규모 indexing이나 real LLM 연결은 후속 확장으로 둔다.

## 데이터 경로 기준

Week2는 세 데이터 경로를 모두 구현 대상으로 둔다.

| 데이터 경로 | 담당 | Week2 기준 |
| --- | --- | --- |
| Amazon Reviews JSON / JSONL | M3 중심 | AI Query/분석 대표 경로. M5 Catalog와 M6 Semantic/RAG-lite evidence까지 우선 연결한다. |
| Taxi Batch 또는 정형 batch | M2 중심 | 필수 처리/evidence 경로. TLC NYC Taxi Dataset은 기존 M2 계획과 정형 빅데이터 ETL 가능성을 보여주는 대표 데이터셋이며, M2 구현은 Taxi 전용 runner가 아니라 row_count, bytes, duration, output_path를 공통 반환하는 실행기다. |
| Kafka Event / streaming ingestion | M4 중심 | 필수 처리/evidence 경로. replay/ingestion, throughput, lag, restart evidence를 남긴다. |

분석 대표 경로는 Amazon Reviews JSON으로 고정한다. Taxi/Kafka는 선택 사항이 아니라 필수 처리/evidence 경로이며, M6 분석 연결은 이번 기본 범위가 아니라 후속 확장으로 둔다.

## 핵심 guardrail

- Spark는 M2가 제공하는 공통 runtime이다.
- M2 `SparkRunner`는 dataset별 runner로 쪼개지 않는다. 입력 format/path/options를 `RuntimeConfig`로 받아 JSON/Parquet 등 source를 읽고 같은 result shape를 반환한다.
- M3는 transformation spec/job logic을 제공한다.
- M5는 `WorkflowDefinition`으로 `SparkRunner` 또는 local runner를 호출한다.
- M2/M3/M4가 각자 Spark session, config, output convention을 따로 만들지 않는다.
- `SourceConfig`는 M1 단독 소유가 아니다. M1은 shell/demo tenant/source id/화면 입력 흐름을 관리하고, M3/M4는 source type별 options와 validation 요구사항을 제공한다.
- Iceberg는 이번 발표 범위에서 제외한다.

## 병렬 구현 시작 전 Phase Queue

아래 6개 Phase를 순서대로 완료한 뒤 M2/M3/M5의 병렬 구현을 시작한다.

| Phase | 이름 | 목적 | 완료 기준 |
| --- | --- | --- | --- |
| 1 | Responsibility ver2 고정 | 현재 M1~M6 책임 기준을 팀 문서로 고정 | `ver2/` 기준 문서와 workspace evidence가 PR-ready |
| 2 | Implementation transition plan | 기존 구현을 버리지 않고 ver2로 전환하는 순서 작성 | 유지할 구현, 분석 대표 path, adapter-first 원칙 확정 |
| 3 | Analysis representative path 확정 | Semantic/RAG-lite/AI Query 분석 대표 경로를 하나로 고정 | Amazon Reviews JSON -> M5 Workflow/Catalog -> M6 Semantic/RAG-lite/AI Query -> M1 UI 경로 확정 |
| 4 | Existing implementation anchor 선언 | 기존 구현 중 유지/흡수할 범위 확정 | M5 workflow/catalog, M4 Kafka demo, M6 skeleton, M1 shell 유지 선언 |
| 5 | M3 JSON analysis path decision | M3가 먼저 맡을 JSON 분석 대표 path와 PR #105 회수 여부 결정 | source profile/schema/transform spec/Catalog facts 범위 확정 |
| 6 | M5 runner boundary decision | M2 SparkRunner와 M3 job logic이 붙을 실행 경계 확정 | `Week2WorkflowService` 중심 runner boundary와 호출 계약 확정 |

Phase 2의 현재 기준은 [`implementation-transition-plan.md`](implementation-transition-plan.md)에 둔다.

Phase 3의 현재 기준은 [`main-e2e-path.md`](main-e2e-path.md)에 둔다.

Phase 4의 현재 기준은 [`existing-implementation-anchor.md`](existing-implementation-anchor.md)에 둔다.

Phase 5의 현재 기준은 [`m3-json-main-path-decision.md`](m3-json-main-path-decision.md)에 둔다.

Phase 6의 현재 기준은 [`runner-boundary-decision.md`](runner-boundary-decision.md)에 둔다.

M1 live UI 후속 Phase 기준은 [`m1-live-ui-phase-plan.md`](m1-live-ui-phase-plan.md)에 둔다.

팀원이 빠르게 현재 분업과 진행상황을 파악할 때는 [`team-handoff-summary.md`](team-handoff-summary.md)를 먼저 읽는다.
