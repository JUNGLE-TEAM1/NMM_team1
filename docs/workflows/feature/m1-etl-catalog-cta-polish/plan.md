# M1 ETL Catalog CTA polish 계획

## 브랜치

- Branch: `feature/m1-etl-catalog-cta-polish`
- Workspace: `docs/workflows/feature/m1-etl-catalog-cta-polish`
- Created: 2026-06-29

## 목표

- `/etl` 실행 결과 handoff의 `Catalog detail` CTA가 placeholder성 `/dataset` 흐름으로 빠지지 않고 live Catalog detail route로 바로 이어지게 한다.
- M1 발표 흐름 `/etl -> catalog detail -> /query`의 클릭 연결을 작은 UI polish 범위에서 안정화한다.

## 범위

- `frontend/src/app/App.jsx`의 M1 route navigation/CTA target만 수정한다.
- 기존 Week2 reviews demo dataset인 `dataset_reviews_gold` detail URL을 유지한다.
- Phase workspace 문서, 품질 증거, durable report를 업데이트한다.

## 범위 제외

- `dataset_product_health_gold` 또는 `gold_product_health` 최종 산출물을 만들지 않는다.
- M2/M3/M5/M6 contract, backend API, data schema, SQL runtime을 바꾸지 않는다.
- Product Health 최종 SQL success smoke를 완료로 표시하지 않는다.
- 새 routing library를 도입하지 않는다.

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`
- `docs/08-development-workflow.md`
- `docs/12-quality-gates.md`
- `docs/reports/m1-final-browser-smoke.md`

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

- [x] `/etl`의 `Catalog detail` CTA가 `/catalog/dataset_reviews_gold` URL로 이동한다.
- [x] 직접 `/catalog/dataset_reviews_gold` route가 Catalog detail 화면으로 normalize된다.
- [x] `cd frontend && npm run build`가 통과한다.
- [x] 관련 manual/browser smoke 또는 동등한 DOM/route smoke 결과를 기록한다.
- [x] Acceptance, regression/failure scenario, manual verification 확인 결과를 기록한다.
- [x] `scripts/validate-harness.sh --strict`가 통과한다.
- [x] `docs/reports/m1-etl-catalog-cta-polish.md`를 작성한다.
