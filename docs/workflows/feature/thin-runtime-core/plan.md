# Thin Runtime Core 계획

## 브랜치

- Branch: `feature/thin-runtime-core`
- Workspace: `docs/workflows/feature/thin-runtime-core`
- Created: 2026-06-24

## 목표

- R0.5 Modular Contract Baseline을 실제 runtime 코드에서 import 가능한 thin skeleton으로 연결한다.
- 첫 병렬 wave가 공통 contract와 fake provider를 공유하며 시작할 수 있게 한다.

## 범위

- `backend/app/domain/target_contracts.py`에 Target MVP shared contract model 추가.
- `backend/app/ports/`에 policy/query/job runner Protocol 추가.
- `backend/app/fakes/`에 local-only fake policy/query/source/job provider 추가.
- `backend/app/services/`에 catalog trust, query policy, job orchestrator service skeleton 추가.
- `frontend/src/features/`에 catalog/sources/jobs/query feature entry anchor 추가.
- 최소 contract/fake provider test 추가.
- `docs/03-interface-reference.md`와 `.milestones/target-mvp/status.yaml`에 코드 위치 mapping 최소 반영.

## 범위 제외

- 실제 Source Connector 선택 또는 외부 source 연결.
- 실제 Trino, 외부 LLM, Vector/RAG, Kubernetes, cloud resource, real secret 사용.
- UI 완성, endpoint 확장, DB migration, production config 변경.
- 하네스 규칙 추가 또는 전체 기능 card/backlog 작성.

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/08-development-workflow.md`
- `docs/12-quality-gates.md`
- `docs/14-decision-option-brief.md`
- `docs/15-context-budget-rule.md`
- `docs/02-architecture.md`
- `docs/03-interface-reference.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`
- `docs/17-parallel-milestone-protocol.md`
- `.milestones/target-mvp/manifest.yaml`
- `.milestones/target-mvp/status.yaml`
- `.milestones/target-mvp/handoffs/catalog_trust.md`
- `.milestones/target-mvp/handoffs/source_connector.md`
- `.milestones/target-mvp/handoffs/job_orchestrator.md`
- `.milestones/target-mvp/handoffs/query_policy.md`

## 구현 프롬프트

```text
@AGENTS.md @docs/00-layer-map.md @docs/08-development-workflow.md @docs/12-quality-gates.md @docs/14-decision-option-brief.md @docs/15-context-budget-rule.md

이 branch workspace에 적힌 작업만 구현한다.
기본은 Lite Read로 시작하고, 계약/데이터/보안/sync/quality/integration/decision 위험 신호가 있을 때만 문맥을 확장한다.
core logic, regression 위험, integration contract, bug fix를 바꾸는 경우 TDD 적용 여부를 먼저 기록한다.
고영향 선택은 구현 전에 Decision Option Brief로 정리한다.
이 plan.md를 업데이트하지 않고 범위를 확장하지 않는다.
```

## 검증 프롬프트

```text
@AGENTS.md @docs/05-acceptance-scenarios-and-checklist.md @docs/06-regression-and-failure-scenarios.md @docs/07-manual-verification-playbook.md @docs/12-quality-gates.md

branch 작업을 검증하고 `quality.md`와 workspace report에 증거를 기록한다.
```

## 내부 단계별 프롬프트

- not needed

큰 Phase를 내부 단계로 나누는 경우 아래 양식을 사용한다. 작은 Phase는 이 섹션을 `not needed`로 둔다.

### Step N - [STEP_NAME]

#### 목표

- [STEP_GOAL]

#### 범위

- [STEP_SCOPE]

#### 범위 제외

- [STEP_OUT_OF_SCOPE]

#### 구현 프롬프트

```text
@AGENTS.md @[RELEVANT_DOCS]

[IMPLEMENTATION_REQUEST]
```

#### 검증 프롬프트

```text
@AGENTS.md @[RELEVANT_DOCS]

[VERIFICATION_REQUEST]
```

#### 완료 기준

- [ ] [STEP_COMPLETION_CRITERION]

## 완료 기준

- [x] 범위 완료
- [x] TDD 상태 기록
- [x] Acceptance 확인
- [x] Regression/failure scenario 확인
- [x] Manual verification 기록
- [x] CI/check 명령과 결과 기록
- [x] Report 업데이트
