# Target dataset run handoff 계획

## 브랜치

- Branch: `feature/target-dataset-run-handoff`
- Workspace: `docs/workflows/feature/target-dataset-run-handoff`
- Created: 2026-06-29

## 목표

- 저장된 Target Dataset의 ETL job definition draft를 M5 workflow/run 생성으로 넘긴다.
- 기존 `M5 데모` 노출 방식이 아니라 사용자 언어의 `실행 기록` 또는 `Job Runs` 흐름으로 연결한다.

## 범위

- Target Dataset detail 또는 Review 후 run 생성 CTA.
- M5 workflow/run create API 연결.
- run status 조회와 기본 error/empty/loading state.
- `ExecutionResult` 계약과 run id를 Target Dataset에 연결한다.

## 범위 제외

- Spark/Kafka 실제 runtime 보강.
- CatalogMetadata final registration 보강.
- AI Query 연결.
- Airflow production deployment.

## 구현 프롬프트

```text
@AGENTS.md @docs/08-development-workflow.md @docs/03-interface-reference.md @docs/12-quality-gates.md

`feature/target-dataset-run-handoff` Phase만 구현한다.
Target Dataset의 ETL job definition draft를 M5 workflow/run 생성 API로 넘기고 run status를 조회한다.
화면명은 `M5 데모`가 아니라 `실행 기록` 또는 `Job Runs` 같은 사용자 중심 용어를 사용한다.
runtime 내부 처리, CatalogMetadata 보강, AI Query 연결은 후속 Phase로 넘긴다.
```

## 완료 기준

- [x] Target Dataset에서 run을 생성할 수 있다.
- [x] run status를 조회하고 화면에 표시할 수 있다.
- [x] 실패/대기/성공 상태가 구분된다.
- [x] `M5 데모` 독립 메뉴를 다시 노출하지 않는다.
- [x] report와 quality evidence를 남긴다.
