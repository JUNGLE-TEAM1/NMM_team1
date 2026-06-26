# Week2 M1 synthetic raw demo data 계획

## 브랜치

- Branch: `feature/week2-m1-synthetic-raw`
- Workspace: `docs/workflows/feature/week2-m1-synthetic-raw`
- Created: 2026-06-26

## 목표

- Week 2 M1 병렬 workstream으로 M3 `raw -> Bronze` 계약에 넣을 데모용 Amazon Reviews 호환 raw seed를 만든다.
- 먼저 `Gift_Cards` 공개 샘플에서 최소 성공 기준인 `reviews_seed.jsonl` 10,000행을 생성하고, metadata/summary/handoff에 필요한 증거를 남긴다.

## 범위

- Hugging Face `McAuley-Lab/Amazon-Reviews-2023` 공개 데이터셋에서 작은 카테고리 파일을 내려받아 local ignored `data/external/` 아래에 둔다.
- `data/week2/mvp_synthesis/raw_demo/reviews_seed.jsonl`을 M3 계약 6개 필드(`review_id`, `product_id`, `rating`, `review_text`, `review_time`, `verified_purchase`)로 생성한다.
- `product_master_seed.jsonl`, `behavior_events_seed.jsonl`, `source_manifest.json`, `raw_demo_summary.json`을 생성한다.
- 생성 스크립트와 focused test를 추가해 JSONL parse, 필수 필드, row count, manifest profile 값을 검증한다.
- M3 확인 답변을 반영해 connector/app 등록 타입은 `json`, logical shape/profile은 `amazon_reviews_json`, 출처는 `demo_synthetic_raw`로 분리한다.

## 범위 제외

- `contracts/*.sample.json` 변경.
- M3 Bronze 변환기, M5 runner/catalog, M6 SQL/AI Query 구현 변경.
- Taxi 기반 `delivery_trips_seed.parquet` 생성.
- 100,000행 이상 추천 MVP 규모 확장.
- 원본 대용량 데이터 파일 commit.
- 원격 issue/PR/merge/finalize 작업.

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/08-development-workflow.md`
- `docs/12-quality-gates.md`
- `docs/14-decision-option-brief.md`
- `docs/15-context-budget-rule.md`
- `docs/17-parallel-milestone-protocol.md`
- `docs/project-context/asklake-week2-module-plan/README.md`
- `docs/project-context/asklake-week2-module-plan/decisions.md`
- `docs/03-interface-reference.md` Week 2 Contract Package
- `contracts/source_config.sample.json`
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

- Step 1 - workspace/contract scope 기록
- Step 2 - generator script + focused test
- Step 3 - local data generation + validation evidence
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

- [x] `reviews_seed.jsonl` 10,000행 생성
- [x] `reviews_seed.jsonl` JSONL parse 성공
- [x] 모든 review row가 M3 계약 필수 6개 필드를 가진다
- [x] `source_manifest.json`에 `connector_type=json`, `logical_shape=amazon_reviews_json`, `data_origin=demo_synthetic_raw`를 기록한다
- [x] `raw_demo_summary.json`에 row count, 기간, 필드, synthetic notice, known limitation을 기록한다
- [x] focused test와 generation validation 통과
- [x] Acceptance 확인
- [x] Regression/failure scenario 확인
- [x] Manual verification 기록
- [x] Report 업데이트
