# M2 Amazon Reviews JSONL runner evidence 계획

## 브랜치

- Branch: `feature/m2-amazon-reviews-runner-evidence`
- Workspace: `docs/workflows/feature/m2-amazon-reviews-runner-evidence`
- Created: 2026-06-26

## 목표

- Week 2 발표 필수 경로인 Amazon Reviews JSONL 입력을 M2 `Week2SparkRunner`로 실행해 Parquet output과 처리 증거를 남긴다.
- 이 작업은 "M2 runner가 Amazon Reviews 계열 JSONL을 받아 Parquet 결과를 만들 수 있다"는 재현 가능한 local evidence를 만드는 것이다.
- 기본 입력은 repository sample을 사용하고, M1 synthetic raw가 로컬에 있으면 같은 명령에 input path만 바꿔 더 큰 JSONL에도 적용할 수 있게 한다.

## 범위

- `scripts/week2_m2_amazon_reviews_runner_evidence.py`를 추가해 Amazon Reviews JSONL path, output root, run id를 받아 `Week2SparkRunner`를 실행한다.
- 입력 JSONL이 `review_id`, `product_id`, `rating`, `review_text`, `review_time`, `verified_purchase` 필드를 갖는지 확인하고 summary를 출력한다.
- 실행 결과로 status, row count, bytes, duration, Parquet output path, output row count를 JSON으로 출력한다.
- 기본 sample `backend/samples/amazon_reviews_demo.jsonl` 기준 focused test를 추가한다.
- 검증 결과와 남은 리스크를 workspace `quality.md`, `report.md`, `next-actions.md`에 기록한다.

## 범위 제외

- Taxi Parquet 처리 또는 Taxi benchmark.
- M3 Bronze/Silver/Gold 변환 로직.
- M5 Workflow/Catalog API 연결.
- SQL smoke와 SQL query engine 연결.
- 실제 Spark cluster 실행. 이번 작업은 Spark 교체가 가능한 runner boundary를 local `pyarrow` 실행으로 검증한다.
- Amazon Reviews 원본 대용량 파일 다운로드 또는 generated `data/` 산출물 commit.

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/08-development-workflow.md`
- `docs/12-quality-gates.md`
- `docs/14-decision-option-brief.md`
- `docs/15-context-budget-rule.md`
- `docs/workflows/docs/week2-main-e2e-path/decisions.md`
- `docs/workflows/docs/week2-main-e2e-path/notes.md`
- `docs/workflows/feature/week2-m1-synthetic-raw/report.md`
- `docs/workflows/feature/m2-runtime-sparkrunner-smoke/report.md`
- `contracts/runtime_config.sample.json`

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

- [ ] Amazon Reviews JSONL 기본 sample을 Parquet로 변환하는 명령이 있다.
- [ ] 같은 명령에 M1 synthetic raw path를 넘기면 더 큰 JSONL에도 적용 가능한 구조다.
- [ ] row count, bytes, duration, output path, output row count가 출력된다.
- [ ] focused test와 backend runner regression test가 통과한다.
- [ ] Acceptance, Regression/failure scenario, Manual verification 확인 결과가 기록된다.
- [ ] `data/` 아래 생성 산출물은 commit하지 않는다.
- [ ] Report 업데이트
