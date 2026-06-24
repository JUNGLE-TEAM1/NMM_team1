# Thin Runtime Core 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- not needed. This Phase uses R0.5 accepted contracts and keeps real provider decisions deferred.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| Runtime skeleton scope | Thin contract/fake/service anchors only | 병렬 구현을 가능하게 하되 기능 구현과 외부 provider 도입을 피하기 위해 | user request / 2026-06-24 |
| Provider boundary | local fake providers only | secret, Trino, LLM, cloud, real DB integration 위험을 피하기 위해 | user request / 2026-06-24 |
| Harness changes | no new harness rule | 이미 R0.5/Pre-PR/Parallel Protocol이 충분해 하네스를 더 무겁게 만들지 않기 위해 | user request / 2026-06-24 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| first source connector | actual source choice is outside R0.6 | Source Connector workstream start | `feature/source-expansion` |
| real query engine | local fake is enough for R0.6 | Query / Policy workstream leaves fake boundary | `feature/query-policy-preflight` |
| actual parallel execution | R0.6 prepares runtime anchors but does not open multiple branches | after R0.6 PR/handoff | Target MVP first wave |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| Thin skeleton | module anchors create more confusion than they remove | simplify or move code mapping before first wave starts |
| Fake provider boundary | real provider is introduced without decision | stop and require Decision Option Brief |
