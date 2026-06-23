# Modular Contract Baseline 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/01-product-planning.md` | R0.5와 workstream alias 구조 추가 | Product milestone 문맥이 Workflow와 갈라지지 않게 함 | Medium |
| `docs/03-interface-reference.md` | Modular Contract Baseline 추가 | 병렬 workstream의 shared contract 기준 | Medium |
| `docs/05-acceptance-scenarios-and-checklist.md` | R0.5와 Integration checkpoint acceptance 추가 | 완료 기준을 workstream 구조와 연결 | Medium |
| `docs/06-regression-and-failure-scenarios.md` | contract baseline 없이 병렬 workstream 시작 금지 guard와 mock/fake boundary guard 추가 | 계약 drift와 실제 provider/secret/data 접근 drift 방지 | Low |
| `docs/07-manual-verification-playbook.md` | Modular Contract Baseline 수동 점검 추가 | 병렬 시작 전 human verification 경로 | Low |
| `docs/08-development-workflow.md` | Product Rebaseline Queue를 workstream pool / integration spine 중심으로 재정렬 | 실제 실행 순서를 병렬 구조와 맞춤 | Medium |
| `docs/reports/modular-contract-baseline.md` | R0.5 report 추가 | Phase evidence 기록 | Low |

## Integration Notes / 통합 메모

- `.milestones/target-mvp/manifest.yaml`은 병렬 실행 범위, 소유권, contract, integration checkpoint 초안이다.
- `.milestones/target-mvp/handoffs/*.md`는 workstream 시작 시 scope, contract, mock/fake boundary를 전달하는 템플릿이다.
- R1~R7 이름은 삭제하지 않고 alias로 보존했다.
- 첫 병렬 wave 후보는 Catalog / Trust, Source Connector, Job / Orchestrator, Query / Policy mock이지만, 실제 병렬 실행 승인은 아니다.

## Conflicts To Resolve / 해결할 충돌

- `feature/trust-state-model` anchor는 strict validation과 기존 문맥을 위해 남겨두었다.
