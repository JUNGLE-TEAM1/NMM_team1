# Runtime evidence integration 계획

## 브랜치

- Branch: `feature/runtime-evidence-integration`
- Workspace: `docs/workflows/feature/runtime-evidence-integration`
- Created: 2026-06-29

## 목표

- M5 run 결과에 M2 batch/runtime evidence와 M4 Kafka replay evidence를 일관된 `ExecutionResult`로 연결한다.
- run detail에서 row count, bytes, duration, output path, Kafka replay evidence를 확인할 수 있게 한다.

## 범위

- M2 runner output을 run evidence로 수집.
- M4 Kafka replay evidence를 optional evidence block으로 수집.
- `ExecutionResult` shape 정렬.
- run detail UI에서 evidence summary 표시.

## 범위 제외

- 새 대용량 benchmark 요구 추가.
- Spark cluster productionization.
- Kafka streaming production deployment.
- CatalogMetadata 최종 등록.
- AI Query 연결.

## 구현 프롬프트

```text
@AGENTS.md @docs/08-development-workflow.md @docs/03-interface-reference.md @docs/12-quality-gates.md

`feature/runtime-evidence-integration` Phase만 구현한다.
M5 run 결과에 M2 runner evidence와 M4 Kafka replay evidence를 `ExecutionResult` compatible shape로 연결한다.
이번 Phase는 evidence 수집과 표시가 목표이며 CatalogMetadata final registration과 AI Query 연결은 구현하지 않는다.
```

## 완료 기준

- [ ] M2 runtime evidence가 run result에 연결된다.
- [ ] M4 Kafka evidence가 optional evidence로 연결된다.
- [ ] run detail에서 output path, row count, bytes, duration을 확인할 수 있다.
- [ ] 실패 evidence가 사용자에게 설명 가능하게 표시된다.
- [ ] report와 quality evidence를 남긴다.
