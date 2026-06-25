# Week2 main E2E path 노트

## 진행 메모

- Phase 2 PR #119가 merge된 `origin/main` `2f811be` 기준으로 workspace를 만들었다.
- Phase 3은 code 구현이 아니라 main E2E path 결정 문서 작업이다.
- 발표 필수 경로는 Amazon Reviews JSON -> M3 -> M5 -> M6 -> M1로 고정한다.
- Taxi, Kafka, SparkRunner는 evidence 또는 후속 구현으로 남기고 main path 선행 조건에서 제외한다.

## 결정

- main E2E path는 Amazon Reviews JSON 중심으로 확정한다.
- M5는 기존 `Week2WorkflowService`/local runner/Catalog를 우선 사용한다.
- M2 SparkRunner는 Phase 6 runner boundary 결정 뒤 후속 implementation으로 붙인다.

## 열린 질문

- Phase 5에서 M3가 PR #105의 JSON source/profile 코드를 어느 범위까지 회수할지 결정해야 한다.
- Phase 6에서 local runner와 SparkRunner가 공유할 result shape를 결정해야 한다.

## 링크 / 증거

- `docs/project-context/asklake-week2-module-plan/ver2/main-e2e-path.md`
- `docs/project-context/asklake-week2-module-plan/ver2/implementation-transition-plan.md`
- `docs/reports/week2-main-e2e-path.md`
