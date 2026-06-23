# Modular Contract Baseline 보고서

## Short Report / 짧은 보고

- Type: docs
- Branch/work location: `docs/modular-contract-baseline`, `docs/workflows/docs/modular-contract-baseline`
- Date: 2026-06-24
- Workspace state: complete
- Context Budget mode: Audit Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/01`, `docs/03`, `docs/05~08`, `docs/12`, `docs/15`, `docs/17`
- Escalated context read: `docs/reports/target-mvp-parallel-workstream-realignment-analysis.md`, `scripts/validate-harness.sh`
- Context omitted intentionally: runtime source code, full historical workspaces, unrelated reports
- Changed: R0.5 Modular Contract Baseline, shared contract table, workstream pool, integration spine, manifest draft, handoff templates, acceptance/regression/manual verification alignment
- Verified: `scripts/validate-harness.sh`, `scripts/validate-harness.sh --strict`
- Remaining: PR/push/handoff requires `Pre-PR Human Checkpoint`; first actual parallel wave is not started
- Next context: choose PR handoff or local hold, then start first parallel wave from `.milestones/target-mvp/manifest.yaml`
- Risk: manifest is a planning contract, not an implementation guarantee; workstream scope must be rechecked before actual parallel execution.

## 변경 시작 계층

- Start layer: Interface
- Propagation: Interface -> Acceptance -> Regression -> Manual Verification -> Workflow
- Parallel execution layer: `docs/17-parallel-milestone-protocol.md` was reused without new harness rules.

## 적용 요약

| 영역 | 변경 |
| --- | --- |
| Product | R0.5와 R1~R7 workstream alias 구조 추가 |
| Interface | `Modular Contract Baseline` shared contract / owner / mock boundary 추가 |
| Acceptance | R0.5와 Integration Spine checkpoint 추가 |
| Regression | contract baseline 없이 병렬 workstream 시작 금지 guard 추가 |
| Manual Verification | Modular Contract Baseline 점검 절차 추가 |
| Workflow | Product Rebaseline Queue를 Workstream Pool + Integration Spine 중심으로 재정렬 |
| Parallel manifest | `.milestones/target-mvp/manifest.yaml`, `status.yaml`, `decisions.md` 추가 |
| Handoff templates | `.milestones/target-mvp/handoffs/*.md` 추가 |

## Acceptance / Regression / Manual Verification

Acceptance:

- `docs/05`에 R0.5와 Integration Spine checkpoint가 있다.
- R1~R7은 workstream alias로 보존된다.

Regression Guard:

- Checked feature: Contract Baseline 없이 병렬 Workstream이 시작되는 경우
- Protected behavior: shared contract와 manifest 없이 독립 workstream이 각자 다른 schema를 만들지 않는다.
- Checked feature: Mock/Fake Boundary를 넘어 실제 접근으로 진행되는 경우
- Protected behavior: 사람 승인과 Decision Option Brief 없이 실제 권한 엔진, 실제 데이터 접근, 외부 LLM, Trino, cloud resource, secret을 쓰지 않는다.
- Result: `docs/06`에 guards 추가.

Manual Verification:

- Document executed: `docs/07-manual-verification-playbook.md` Modular Contract Baseline 점검 항목
- Environment: documentation/static validation
- Result: R0.5 점검 절차 추가
- Failure/limitation: 실제 병렬 worktree는 아직 생성하지 않음
- Evidence: `scripts/validate-harness.sh --strict`
