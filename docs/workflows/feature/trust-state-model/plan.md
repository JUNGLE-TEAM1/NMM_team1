# Trust State Model 계획

## 브랜치

- Branch: `feature/trust-state-model`
- Workspace: `docs/workflows/feature/trust-state-model`
- Created: 2026-06-24

## 목표

- Catalog dataset에 Target MVP용 trust 상태와 publish gate reason을 추가한다.
- 기존 baseline `status: ready` 계약은 유지하면서 `trust_status`와 `trust_gate_result`를 별도 경로로 제공한다.
- 다음 Phase들이 `DatasetStatus`와 `TrustGateResult`를 공통 기준으로 사용할 수 있게 한다.

## 범위

- `CatalogDataset` API 응답에 `owner`, `trust_status`, `trust_gate_result` 추가
- `POST /api/catalog/datasets/{dataset_id}/trust-gate` 최소 endpoint 추가
- deterministic placeholder gate로 `Trusted` 또는 `Blocked` 상태 계산
- SQLite metadata store에 trust 상태 저장 컬럼 추가
- Catalog detail UI에 trust 상태, owner, gate reason 표시
- `docs/03-interface-reference.md` 계약 반영
- focused/backend/frontend/harness 검증 증거 기록

## 범위 제외

- 실제 PII 탐지 엔진
- 실제 외부 policy service 또는 secret-backed provider
- Query / Ask 실행 차단 로직
- Source connector 확장
- Job scheduler, retry, rerun, backfill 구현
- Trino, external LLM, cloud resource, production data 접근

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/08-development-workflow.md`
- `docs/12-quality-gates.md`
- `docs/14-decision-option-brief.md`
- `docs/15-context-budget-rule.md`

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
