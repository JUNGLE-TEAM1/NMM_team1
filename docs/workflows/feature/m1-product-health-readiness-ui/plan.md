# M1 product health readiness UI 계획

## 브랜치

- Branch: `feature/m1-product-health-readiness-ui`
- Workspace: `docs/workflows/feature/m1-product-health-readiness-ui`
- Created: 2026-06-28

## 목표

- `dataset_product_health_gold`가 아직 준비되지 않은 상태를 M1 화면에서 명확히 보여준다.
- Gold output/Catalog/query evidence가 없을 때 fake success를 만들지 않고, 어느 모듈 작업이 필요한지 표시한다.

## 범위

- `/catalog`와 `/query` 주변에 product health readiness 상태를 추가한다.
- `dataset_product_health_gold` CatalogMetadata 없음, `storage.local_fallback_path` 없음, `query.allowed_columns` 없음, `local_path_missing` 상태를 구분한다.
- 준비 전에는 M3/M2/M5 실행 필요 안내를 표시한다.
- 준비된 경우에는 query readiness와 evidence readiness를 표시한다.
- 기존 reviews/demo dataset 표시를 깨지 않도록 defensive rendering만 적용한다.

## 범위 제외

- `gold_product_health` 생성 또는 schema 정의
- M2 runtime/5GB evidence 생성
- M5 Catalog API 변경
- M6 local path guardrail 변경
- 실제 data migration 또는 seed 생성

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/08-development-workflow.md`
- `docs/12-quality-gates.md`
- `docs/14-decision-option-brief.md`
- `docs/15-context-budget-rule.md`
- `docs/project-context/asklake-week2-module-plan/ver2/team-handoff-summary.md`
- `docs/reports/week2-product-risk-source-of-truth-propagation.md`
- `docs/reports/m2-product-health-runtime-smoke.md`
- `docs/reports/m6-duckdb-runtime-integration.md`
- `docs/reports/m1-week2-final-demo-flow.md`

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

- [x] `dataset_product_health_gold` 준비/미준비 상태가 화면에 표시된다.
- [x] Gold output 없음, Catalog 없음, local path 없음, query 준비됨 상태가 구분된다.
- [x] 미준비 상태에서 다음 필요 작업이 M2/M3/M5 책임으로 표시된다.
- [x] fake success 또는 임의 row 생성이 없다.
- [x] `cd frontend && npm run build` 통과
- [x] readiness keyword scan 통과
- [x] `scripts/validate-harness.sh --strict` 통과
- [x] `quality.md`와 `report.md` 업데이트
