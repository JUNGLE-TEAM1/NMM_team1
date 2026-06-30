# Product Health Manual Run contract 계획

## 브랜치

- Branch: `feature/product-health-manual-run-contract`
- Workspace: `docs/workflows/feature/product-health-manual-run-contract`
- Created: 2026-06-30

## 목표

- Product Health Target Dataset Manual Run 결과에 PR 4/5B/6/7/8이 공유할 `product_health_manual_run_contract` metadata 계약을 추가한다.
- 실제 Gold 생성 없이 source snapshot input, pending Gold output, pending quality result, lineage, Catalog payload shape를 고정한다.

## 범위

- `POST /api/target-datasets/{dataset_id}/runs` 응답의 `execution_result`에 Product Health 전용 contract block을 추가한다.
- `process_rule.type=product_health_gold_pipeline`일 때만 contract block을 붙여 기존 manual/select-fields run을 유지한다.
- M3 Product Health contract file에서 schema/version/allowed columns를 읽어 #310 Gold v2가 머지되어도 같은 경로로 따라가게 한다.
- `docs/03`, `docs/05`, `docs/06`, `docs/07`에 변경된 interface, acceptance, regression, manual verification 기준을 최소 반영한다.

## 범위 제외

- 실제 Source Snapshot 생성 또는 조회 구현은 PR 4 범위다.
- 실제 Product Health Gold parquet 생성, Spark/M2 runner 연결은 PR 5B 범위다.
- Catalog 실제 등록은 PR 6 범위다.
- AI Query와 Dashboard 연결은 PR 7/8 범위다.
- Target Dataset wizard UI 재구성은 PR 5C 범위다.

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/08-development-workflow.md`
- `docs/03-interface-reference.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`
- `docs/11-git-sync-policy.md`
- `docs/12-quality-gates.md`

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
