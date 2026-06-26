# Week2 M1 synthetic raw demo sample scale 계획

## 브랜치

- Branch: `feature/week2-m1-synthetic-raw-scale`
- Workspace: `docs/workflows/feature/week2-m1-synthetic-raw-scale`
- Created: 2026-06-26

## 목표

- Week 2 M1 synthetic raw를 Option 1 최소 착수안에서 Option 2 추천 MVP 데모안의 Amazon Reviews 규모로 확장한다.
- M3 Bronze 변환 입력으로 사용할 `reviews_seed.jsonl` 100,000행과 product 기준축 10,000개를 생성한다.

## 범위

- PR #154에서 병합된 `scripts/week2_m1_synthetic_raw.py`를 사용/보강해 scale sample manifest가 `option_2_recommended_mvp_demo`로 기록되게 한다.
- Hugging Face `McAuley-Lab/Amazon-Reviews-2023`의 `Health_and_Personal_Care` category를 사용한다.
- Local ignored `data/` 아래 `reviews_seed.jsonl` 100,000행, `product_master_seed.jsonl` 10,000행, `behavior_events_seed.jsonl` 30,000행, manifest/summary를 재생성한다.
- JSONL parse, M3 필수 6필드, manifest/summary, Week2LocalRunner smoke를 검증한다.

## 범위 제외

- Taxi 기반 `delivery_trips_seed.parquet` 생성.
- M3 Bronze 변환기, M5 runner/catalog, M6 SQL/AI Query 구현 변경.
- `contracts/*.sample.json` 변경.
- generated `data/` 파일 commit.
- PR #154 후속 finalize 기록 보정.

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/08-development-workflow.md`
- `docs/12-quality-gates.md`
- `docs/14-decision-option-brief.md`
- `docs/15-context-budget-rule.md`
- `docs/project-context/asklake-week2-module-plan/README.md`
- `docs/project-context/asklake-week2-module-plan/decisions.md`
- `docs/03-interface-reference.md` Week 2 Contract Package
- `contracts/schema_definition.sample.json`
- `contracts/transform_spec.sample.json`
- `contracts/workflow_definition.sample.json`

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

- Step 1 - scale category/row count 고정
- Step 2 - generator selected option 보강
- Step 3 - 100k/10k local generation and validation
- Step 4 - report/handoff 기록

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

- [x] `reviews_seed.jsonl` 100,000행 생성
- [x] `product_master_seed.jsonl` 10,000행 생성
- [x] `behavior_events_seed.jsonl`에 `view`, `cart`, `purchase`가 모두 존재
- [x] 모든 review row가 M3 계약 필수 6개 필드를 가진다
- [x] manifest에 `selected_option=option_2_recommended_mvp_demo`, `connector_type=json`, `logical_shape=amazon_reviews_json`, `data_origin=demo_synthetic_raw`를 기록한다
- [x] Week2LocalRunner smoke가 `fallback_succeeded`로 통과한다
- [x] Acceptance 확인
- [x] Regression/failure scenario 확인
- [x] Manual verification 기록
- [x] Report 업데이트
