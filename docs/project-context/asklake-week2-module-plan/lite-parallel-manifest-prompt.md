# AskLake 2주차 Lite 병렬 Manifest 보완 프롬프트

## 목적

AskLake 2주차 6인 병렬 개발을 시작하기 전에 `.milestones/week2-demo/` 아래 Lite manifest를 만든다.

이 프롬프트는 사람을 세부 통제하기 위한 문서가 아니라 AI/harness coordination용 실행 계약을 만들기 위한 입력이다. 구현 세부 방식은 각 모듈 Phase에서 열어두고, scope ownership / produces / consumes / shared contracts / handoff / daily smoke / integration owner만 얇게 고정한다.

## 프롬프트

```text
AskLake 2주차 6인 병렬 개발을 위한 Lite Manifest 보완 작업을 진행한다.

목표:
- M1~M6가 동시에 개발을 시작할 수 있도록 `.milestones/week2-demo/` 아래 Lite manifest를 만든다.
- manifest는 사람을 통제하기 위한 문서가 아니라 AI/harness coordination용 실행 계약으로 둔다.
- 구현 세부 방식은 잠그지 않고, scope ownership / produces / consumes / shared contracts / handoff / daily smoke / integration owner만 얇게 고정한다.

필수로 먼저 읽을 문서:
- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/17-parallel-milestone-protocol.md`
- `docs/project-context/asklake-week2-module-plan/decisions.md`
- `docs/project-context/asklake-week2-module-plan/plan.md`
- `docs/03-interface-reference.md`의 `AskLake Week 2 Contract Package` 섹션
- `contracts/*.sample.json`
- `docs/workflows/feature/asklake-week2-shared-contract-hardening/report.md`

작업 범위:
1. `.milestones/week2-demo/` 디렉터리를 만든다.
2. `.milestones/week2-demo/manifest.yaml`을 만든다.
   - `schema_version: 1`
   - `planning_mode: lite`
   - `human_reading_required: minimal`
   - `purpose: "AI/harness coordination, not detailed implementation control"`
   - milestone id/title/status/execution_mode/integration_owner
   - objective
   - context documents
   - M1~M6 workstreams
   - shared contracts
   - done criteria
   - integration policy

3. manifest의 M1~M6 workstream에는 최소한 아래 필드를 둔다.
   - `id`
   - `module`
   - `owner`
   - `branch_candidate`
   - `status`
   - `owns`
   - `must_not_own`
   - `consumes`
   - `produces`
   - `handoff`
   - `conflict_policy`

4. 각 모듈 기준은 아래처럼 잡는다.

M1 플랫폼 코어·통합:
- owns: API shell, UI shell, route map, demo tenant, E2E smoke runbook
- consumes: all `contracts/*.sample.json`
- produces: route map, UI click flow, daily smoke evidence
- must_not_own: source-specific extraction, Airflow task internals, RAG/SQL generation

M2 정형 Batch:
- owns: Taxi PostgreSQL batch, bronze/gold parquet, metrics/retry evidence
- consumes: `SourceConfig`, `CatalogMetadata`, storage path pattern
- produces: batch output parquet, `ExecutionResult`, `CatalogMetadata`
- must_not_own: workflow runner, AI query, UI shell

M3 JSON·Schema:
- owns: Amazon Reviews reader, schema inference, override, normalize, silver/gold output
- consumes: `SourceConfig`, `SchemaDefinition`, storage path pattern
- produces: `SchemaDefinition`, normalized parquet, `CatalogMetadata`
- must_not_own: workflow runner, AI query, UI shell

M4 Kafka Streaming:
- owns: event replay, Kafka topic/consumer, micro-batch parquet, lag/throughput evidence
- consumes: `SourceConfig`, storage path pattern
- produces: streaming parquet, `ExecutionResult`, `CatalogMetadata` candidate
- must_not_own: AI query, workflow runner, UI shell

M5 Workflow·Catalog:
- owns: `WorkflowDefinition`, runner adapter, fallback runner boundary, `ExecutionResult`, catalog registration, lineage
- consumes: `SourceConfig`, `SchemaDefinition`, `CatalogMetadata`, storage path pattern
- produces: `ExecutionResult`, `CatalogMetadata`, lineage, run status
- must_not_own: source-specific extraction, RAG/AI summary, UI shell

M6 RAG·AI Query:
- owns: metadata retrieval, KPI registry, SQL guardrail, `SqlEngineAdapter` boundary, `AIQueryResult`
- consumes: `CatalogMetadata`, `QueryResult`, `AIQueryResult`, SQL guardrail contract
- produces: `AIQueryResult`, `query_result`, summary, chart spec, validation question evidence
- must_not_own: raw ingestion, workflow runner, UI shell

5. `.milestones/week2-demo/status.yaml`을 만든다.
   - M1~M6 status는 `ready`로 둔다.
   - branch/workspace는 후보값으로 둔다.
   - blockers는 TODO 또는 빈 배열로 둔다.

6. `.milestones/week2-demo/decisions.md`를 만든다.
   - Lite manifest를 만든 결정과 이유를 기록한다.
   - “사람을 위한 세부 통제 문서가 아니라 AI/harness coordination 계약”이라고 명시한다.
   - 구현 세부 방식은 각 모듈 Phase에서 열어둔다고 기록한다.

7. `.milestones/week2-demo/handoffs/` 아래 M1~M6 handoff template을 만든다.
   - `m1_platform_core.md`
   - `m2_batch.md`
   - `m3_json_schema.md`
   - `m4_kafka_streaming.md`
   - `m5_workflow_catalog.md`
   - `m6_rag_ai_query.md`

8. 각 handoff template에는 아래 섹션만 둔다.
   - Module
   - Branch / Workspace
   - Produced contracts
   - Consumed contracts
   - Changed files
   - Commands run
   - Evidence
   - Blockers
   - Contract changes proposed
   - Integration notes

9. 필요한 경우 `docs/workflows/feature/asklake-week2-shared-contract-hardening/next-actions.md`를 병렬 실행 기준으로 업데이트한다.
   - M1~M6를 모두 병렬 후보로 표시한다.
   - 실제 branch/worktree/thread 생성은 사람 확인 후 진행한다고 남긴다.

10. durable report를 작성한다.
   - `docs/reports/asklake-week2-lite-parallel-manifest.md`

제외 범위:
- 실제 M1~M6 구현
- worktree/thread 생성
- branch switch
- push/PR/merge
- 내부 함수명, UI 세부 디자인, Airflow DAG 내부 구조, RAG 검색 방식, Kafka consumer 구현 방식 잠금
- 기존 `.milestones/target-mvp/manifest.yaml` 대체

검증:
- `scripts/validate-harness.sh --strict`
- YAML parse 가능 여부 확인
- manifest에 M1~M6가 모두 있는지 확인
- 각 handoff template이 존재하는지 확인

완료 기준:
- `.milestones/week2-demo/manifest.yaml`이 있다.
- `planning_mode: lite`가 명시되어 있다.
- M1~M6 workstream이 모두 있다.
- 각 workstream의 owns / must_not_own / consumes / produces / handoff가 있다.
- status.yaml, decisions.md, handoffs 6개가 있다.
- 기존 Target MVP manifest를 대체하지 않고 Week 2 병렬 실행 계약으로만 존재한다.
- strict harness validation이 통과한다.
```

## 사용 메모

- 이 프롬프트는 Lite manifest 생성 작업을 실행하기 위한 입력이다.
- 실제 `.milestones/week2-demo/manifest.yaml`은 아직 생성된 것이 아니다.
- manifest는 AI/harness coordination용이며, 모듈 내부 구현 방식은 각 Phase에서 열어둔다.
