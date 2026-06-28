# M2 Product Health 실제 L6 실행 증거 생성 계획

## 브랜치

- Branch: `feature/m2-product-health-l6-evidence`
- Workspace: `docs/workflows/feature/m2-product-health-l6-evidence`
- Created: 2026-06-28

## 목표

- 레포에 이미 있는 작은 Product Health 샘플로 M2 실행 경로를 증명한다.
- Product Health source 4종을 source별 Parquet output과 실행 증거로 남긴다.
- M3 L6 preview-only Gold spec을 M2 `Week2SparkRunner`로 실행해 `gold_product_health.parquet` preview를 만든다.
- 생성된 Parquet을 DuckDB SQL로 읽을 수 있음을 확인한다.

## 범위

- `scripts/week2_m2_product_health_l6_evidence.py`를 추가해 작은 Product Health L6 실행 증거를 재현 가능하게 만든다.
- `backend/samples/product_health_l6_gold_generation_spec.json`에 실행 가능한 작은 Gold preview spec fixture를 둔다.
- focused test로 source evidence, L6 output, SQL read smoke를 검증한다.
- `contracts/runtime_config.sample.json`과 관련 문서에 이번 smoke의 경계와 제외 범위를 반영한다.

## 범위 제외

- 5GB 이상 Product Health input 실행.
- Docker Spark cluster 실행.
- Airflow DAG 내부에서 SparkRunner를 호출하는 구현.
- `negative_review_rate`, `conversion_rate`, `late_delivery_rate`, `risk_score` 최종 의미 정의.
- 최종 `gold_product_health` schema와 M5 Catalog 등록 완성.

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

- [ ] Product Health source 4종 read/write evidence가 summary에 남는다.
- [ ] L6 Gold preview spec 실행 결과로 `gold_product_health.parquet`가 생성된다.
- [ ] DuckDB SQL이 생성된 Parquet을 읽고 최소 1개 row를 반환한다.
- [ ] focused test와 CLI smoke가 통과한다.
- [ ] contract JSON validation, backend focused regression, harness validation을 통과한다.
- [ ] 5GB, Docker Spark, Airflow 내부 호출, 최종 risk metric 의미는 후속으로 명확히 남긴다.
- [ ] Report 업데이트
