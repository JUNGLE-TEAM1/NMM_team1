# Modular Contract Baseline 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- not needed. User already approved applying the R0.5 prompt; remaining decisions are deferred to workstream start.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| R0.5 structure | `Contract Baseline -> Workstream Pool -> Integration Spine` | 병렬 구현을 가능하게 하면서 기존 R1~R7 문맥을 보존하기 위해 | user request / 2026-06-24 |
| R1~R7 handling | Keep as workstream aliases | 기존 acceptance, workflow, validation anchor를 깨지 않기 위해 | user request / 2026-06-24 |
| Parallel manifest | Add `.milestones/target-mvp/manifest.yaml` draft | workstream ownership, contracts, integration checkpoints를 기계 판독 가능하게 고정하기 위해 | user request / 2026-06-24 |
| Workstream handoffs | Add `.milestones/target-mvp/handoffs/*.md` templates | 병렬 작업 시작 시 scope, required contracts, mock/fake boundary를 반복 가능하게 전달하기 위해 | user request / 2026-06-24 |
| First wave candidate | Catalog / Trust, Source Connector, Job / Orchestrator, Query / Policy mock | trusted dataset draft와 governed query path를 먼저 통합 검증하기 위해 | user request / 2026-06-24 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| first source connector | PostgreSQL/REST API 선택은 구현 Phase의 실제 목표에 의존 | Source Connector workstream 시작 전 | `feature/source-expansion` |
| query engine | local-first/Trino 선택은 policy path 구현 시점에 결정 | Query / Policy workstream 시작 전 | `feature/query-policy-preflight` |
| external LLM | 비용/secret/policy trace 결정 필요 | Ask / Evidence workstream이 deterministic route를 넘을 때 | `feature/ask-evidence` |
| mock/fake boundary release | 실제 권한/데이터/LLM/Trino/cloud/secret 사용 여부는 보안과 검증 비용이 큼 | workstream이 fixture/deterministic provider를 넘을 때 | affected workstream |
| actual parallel execution | R0.5는 실행 구조 정렬이지 병렬 branch 생성 승인이 아님 | R0.5 PR 또는 local hold 선택 후 | Target MVP first wave |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| Workstream model | workstream alias가 혼란을 만들거나 integration checkpoint가 부족함 | `docs/08` queue와 manifest를 재정렬 |
| Manifest scope | parallel execution begins with overlapping write scope | split workstream or assign shared owner before implementation |
| Handoff template | a workstream cannot start from the template without ambiguity | update the handoff before branch creation |
