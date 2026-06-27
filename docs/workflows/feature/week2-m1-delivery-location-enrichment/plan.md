# Week2 M1 delivery location enrichment 계획

## 브랜치

- Branch: `feature/week2-m1-delivery-location-enrichment`
- Workspace: `docs/workflows/feature/week2-m1-delivery-location-enrichment`
- Created: 2026-06-27

## 목표

- 기존 Week2 M1 `delivery_trips_seed`에 Taxi 원본의 pickup/dropoff location 정보를 보존한다.
- TLC Taxi Zone lookup을 사용해 borough/zone 이름을 enrichment한다.
- 이 데이터는 M3 main raw가 아니라 M5/M6 분석 보조 synthetic dataset으로 유지한다.

## 범위

- `scripts/week2_m1_delivery_seed.py`에 `source_pickup_location_id`, `source_dropoff_location_id`를 추가한다.
- `data/external/nyc-taxi/taxi_zone_lookup.csv`를 local ignored 입력으로 사용한다.
- lookup이 있으면 `pickup_borough`, `pickup_zone`, `dropoff_borough`, `dropoff_zone`을 추가한다.
- manifest/summary에 `taxi_zone_lookup` lineage와 zone present rate를 기록한다.
- focused unit test와 generated data validation을 업데이트한다.
- 새 workspace handoff를 작성한다.

## 범위 제외

- delivery seed를 M3 main raw로 승격.
- generated `data/` 파일 commit.
- DuckDB dependency 추가.
- M5/M6 소비 구현.

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

Follow-up 목표:
- PR #180에서 생성한 delivery seed generator를 위치 정보 보존/enrichment로 보강한다.
- 원본 `PULocationID`, `DOLocationID`를 각각 `source_pickup_location_id`, `source_dropoff_location_id`로 보존한다.
- TLC Taxi Zone lookup을 사용해 pickup/dropoff borough와 zone을 추가한다.
- canonical JSONL과 convenience Parquet 원칙은 유지한다.
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

- [x] `source_pickup_location_id`, `source_dropoff_location_id` 보존
- [x] TLC Taxi Zone lookup 기반 borough/zone enrichment
- [x] manifest/summary에 lookup lineage와 zone present rate 기록
- [x] focused unit test 업데이트
- [x] generated JSONL 100,000 rows 검증
- [x] Parquet convenience copy read 검증
- [x] TDD 상태 기록
- [x] Acceptance 확인
- [x] Regression/failure scenario 확인
- [x] Manual verification 기록
- [x] CI/check 명령과 결과 기록
- [x] Report 업데이트
