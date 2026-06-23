# Target MVP 병렬 Workstream 결정 기록

## Accepted Decisions

| Date | Decision | Reason | Impact |
| --- | --- | --- | --- |
| 2026-06-24 | R1~R7은 workstream alias로 보존한다. | 기존 문서와 validation anchor를 깨지 않으면서 병렬 실행 구조로 전환하기 위해 | `docs/05`, `docs/08`, manifest |
| 2026-06-24 | Query/Ask/Recovery는 contract baseline 이후 mock/fake boundary 안에서 병렬 개발할 수 있다. | Trust/Policy 구현을 기다리지 않고 UI/API path를 병렬 검증하기 위해 | Query / Policy, Ask / Evidence, Recovery / Operate |
| 2026-06-24 | 첫 병렬 wave 후보는 Catalog / Trust, Source Connector, Job / Orchestrator, Query / Policy mock으로 둔다. | trusted dataset draft와 governed query path를 가장 먼저 통합 검증하기 위해 | `.milestones/target-mvp/manifest.yaml`, handoff templates |
| 2026-06-24 | 실제 병렬 worktree/thread/branch 실행은 R0.5 이후 별도 사람 승인으로 시작한다. | R0.5를 runtime implementation 완료로 오해하지 않고 handoff를 통제하기 위해 | `docs/08`, `docs/17`, `status.yaml` |

## Deferred Decisions

| Decision | Deferred Reason | Revisit Trigger |
| --- | --- | --- |
| 실제 첫 source connector 선택 | PostgreSQL/REST API 중 선택 필요 | Source Connector workstream 시작 전 |
| 실제 query engine 선택 | local-first 또는 Trino 도입 시점 결정 필요 | Query / Policy workstream이 dry-run을 넘을 때 |
| 외부 LLM 사용 여부 | 비용, secret, policy trace 결정 필요 | Ask / Evidence workstream이 deterministic route를 넘을 때 |
| mock/fake boundary 해제 | 실제 권한/데이터/LLM 접근은 보안과 검증 비용이 커짐 | 해당 workstream이 fixture 또는 deterministic route를 넘을 때 |
