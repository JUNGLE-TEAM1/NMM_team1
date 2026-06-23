# Modular Contract Baseline 보고서

## Short Report / 짧은 보고

- Type: docs
- Branch/work location: `docs/modular-contract-baseline`, `docs/workflows/docs/modular-contract-baseline`
- Date: 2026-06-24
- Changed: R0.5 Modular Contract Baseline, Target MVP Workstream Pool, Integration Spine, `.milestones/target-mvp` manifest와 handoff template 초안을 추가했다.
- Verified: `scripts/validate-harness.sh`, `scripts/validate-harness.sh --strict`
- Remaining: PR/push/handoff는 `Pre-PR Human Checkpoint` 선택 전까지 보류. 실제 병렬 workstream은 아직 시작하지 않았다.
- Next context: 첫 병렬 wave를 열기 전에 `.milestones/target-mvp/manifest.yaml`의 scope와 owner를 확인한다.
- Risk: manifest는 실행 계약 초안이며 실제 workstream 시작 시 write scope overlap을 다시 확인해야 한다.

## 1. 변경 시작 계층

- Start layer: Interface
- Propagation: Interface -> Acceptance -> Regression -> Manual Verification -> Workflow
- Parallel execution: existing `docs/17-parallel-milestone-protocol.md` reused

## 2. 반영 내용

| 문서 | 변경 |
| --- | --- |
| `docs/01-product-planning.md` | R0.5와 R1~R7 workstream alias 구조 추가 |
| `docs/03-interface-reference.md` | `Modular Contract Baseline` shared contract / owner / mock boundary 추가 |
| `docs/05-acceptance-scenarios-and-checklist.md` | R0.5와 Integration Spine checkpoint 추가 |
| `docs/06-regression-and-failure-scenarios.md` | contract baseline 없이 병렬 workstream 시작 금지 guard 추가 |
| `docs/07-manual-verification-playbook.md` | Modular Contract Baseline 점검 절차 추가 |
| `docs/08-development-workflow.md` | Product Rebaseline Queue를 Workstream Pool + Integration Spine 중심으로 재정렬 |
| `.milestones/target-mvp/manifest.yaml` | Target MVP 병렬 workstream 실행 계약 초안 |
| `.milestones/target-mvp/handoffs/*.md` | workstream별 handoff template 추가 |

## 3. Workstream Pool

| Workstream | Alias | Integration checkpoint |
| --- | --- | --- |
| Catalog / Trust | R1 | Spine 1 |
| Source Connector | R3 | Spine 1 |
| Job / Orchestrator | R2 | Spine 2 |
| Query / Policy | R4 | Spine 2 |
| Ask / Evidence | R5 | Spine 3 |
| Recovery / Operate | R6 | Spine 3 |
| Packaging | R7 | Release Checkpoint |

## 4. 보완 결과

- First parallel wave는 Catalog / Trust, Source Connector, Job / Orchestrator, Query / Policy mock 후보로만 기록했다.
- 실제 병렬 worktree/thread/branch 생성은 R0.5 범위가 아니며, 별도 사람 승인과 `docs/17-parallel-milestone-protocol.md` 적용이 필요하다.
- Query / Policy, Ask / Evidence, Recovery / Operate, Packaging의 mock/fake boundary 해제는 Decision Option Brief 대상으로 남겼다.

## 5. 검증

```bash
scripts/validate-harness.sh
scripts/validate-harness.sh --strict
```

결과:

- `scripts/validate-harness.sh`: passed
- `scripts/validate-harness.sh --strict`: passed

## 6. 다음 선택

1. `PR 진행`: issue 연결, push, PR 생성, CI 확인, merge/finalize
2. `로컬 완료로 보류`: branch를 local complete로 보류
3. `추가 수정`: manifest scope나 contract baseline 보강
4. `다음 Phase`: 현재 branch 처리 후 첫 병렬 wave 계획
