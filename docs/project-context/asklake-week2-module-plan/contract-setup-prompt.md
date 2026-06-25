# AskLake 2주차 공통 계약 설정 Phase 프롬프트

## 목적

AskLake 2주차 구현을 시작하기 전에 공통 계약 설정 Phase를 먼저 진행한다.

이 프롬프트는 M1~M6 모듈이 각자 구현을 시작하기 전 공유할 fixture contract, producer/consumer 경계, adapter/fallback 경계를 얇게 고정하기 위한 실행 지시문이다.

## 프롬프트

```text
AskLake 2주차 구현을 시작하기 전에 “공통 계약 설정 Phase”를 먼저 진행한다.

목표:
- `docs/project-context/asklake-week2-module-plan/decisions.md`와 `plan.md`를 참고해 2주차 모듈 분업의 초기 계약을 고정한다.
- 바로 기능 구현으로 들어가지 말고, M1~M6가 공유할 fixture contract와 producer/consumer 경계를 먼저 만든다.
- Source of Truth 반영이 필요한 계약은 `docs/00-layer-map.md`의 Change Propagation Rule에 따라 최소 범위로 전파한다.

필수로 먼저 읽을 문서:
- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/15-context-budget-rule.md`
- `docs/project-context/asklake-week2-module-plan/README.md`
- `docs/project-context/asklake-week2-module-plan/decisions.md`
- `docs/project-context/asklake-week2-module-plan/plan.md`
- 계약 영향 확인용으로 `docs/03-interface-reference.md`
- 현재 Phase 순서 확인용으로 `docs/08-development-workflow.md`

작업 범위:
1. 새 Phase workspace를 만든다. 후보 이름은 `docs/asklake-week2-contract-setup` 또는 `feature/asklake-week2-contract-setup`.
2. `contracts/` 아래에 아래 sample fixture를 추가한다.
   - `contracts/source_config.sample.json`
   - `contracts/schema_definition.sample.json`
   - `contracts/workflow_definition.sample.json`
   - `contracts/execution_result.sample.json`
   - `contracts/catalog_metadata.sample.json`
   - `contracts/ai_query_result.sample.json`
3. 각 fixture에는 최소한 아래 원칙을 반영한다.
   - 모든 주요 엔티티에 `tenant_id` 또는 연결 가능한 tenant context를 둔다.
   - Amazon Reviews JSON 메인 E2E를 기준으로 한다.
   - MinIO bucket/path는 임의 확장하지 말고 MVP에서 필요한 최소 예시만 둔다.
   - sample row 수와 실제 파일 경로는 확정 가능한 경우만 기록하고, 불확실하면 TODO/decision으로 남긴다.
   - `ExecutionResult`는 Airflow 실행과 local runner fallback이 같은 형식으로 소비되게 만든다.
   - `CatalogMetadata`는 M6가 Dataset Retrieval과 SQL 실행에 사용할 수 있어야 한다.
   - `AIQueryResult`는 Dataset, evidence, SQL, rows, summary, chart spec, executed_at을 포함한다.
4. `SqlEngineAdapter` 계약 초안을 문서 또는 fixture에 반영한다.
   - M6는 DuckDB를 직접 import하지 않는다.
   - MVP 구현체는 `DuckDBSqlEngine`이지만 호출자는 `SqlEngineAdapter`만 안다.
   - 최소 메서드는 `validate`, `execute`, `explain_schema`, `health_check`로 둔다.
5. Source of Truth 변경이 필요하면 `docs/03-interface-reference.md`에 “AskLake Week 2 Contract Package” 또는 동등한 작은 섹션으로 반영한다.
6. acceptance/regression/manual verification에 영향이 있으면 필요한 최소 문서만 갱신한다.
7. 완료 후 `docs/reports/_template.md`를 사용해 Phase report를 작성한다.

제외 범위:
- 실제 Airflow DAG 구현
- 실제 DuckDB 실행 구현
- RAG/AI Query 구현
- UI 구현
- Taxi/Kafka 실제 ingestion 구현
- Trino/Athena/AWS S3 전환
- 로그인/RBAC
- production 배포

검증:
- `scripts/validate-harness.sh --strict`
- JSON fixture가 유효한지 확인
- 각 contract의 producer/consumer가 `plan.md`의 M1~M6 모듈 구조와 맞는지 수동 점검
- secret, API key, token, private key가 포함되지 않았는지 확인

완료 기준:
- 6개 sample contract가 존재한다.
- M1~M6가 각자 어떤 fixture를 생산/소비하는지 명확하다.
- 불확실한 값은 임의 확정하지 않고 decision/TODO로 남겼다.
- `SqlEngineAdapter`와 Airflow fallback의 경계가 구현 전 합의 가능한 수준으로 정리됐다.
- harness strict validation이 통과했다.
```

## 사용 메모

- 이 프롬프트는 실제 구현 계약이 아니라 다음 Phase 시작 입력이다.
- 실행 중 확정되는 API, schema, 검증 기준은 Source of Truth 계층에 별도로 전파한다.
- 세부 path, row count, sample contract 값은 공통 계약 설정 Phase에서 확인되기 전까지 임의 확정하지 않는다.
