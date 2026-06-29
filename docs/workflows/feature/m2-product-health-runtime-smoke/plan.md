# M2 product health runtime smoke 계획

## 브랜치

- Branch: `feature/m2-product-health-runtime-smoke`
- Workspace: `docs/workflows/feature/m2-product-health-runtime-smoke`
- Created: 2026-06-28

## 목표

- M2 `Week2SparkRunner`가 `gold_product_health` 대표 경로의 여러 raw input을 받을 수 있게 한다.
- reviews/behavior/delivery/product source를 의미 변환 없이 pass-through Parquet으로 쓰고, source별 row count, bytes, duration, output path evidence를 남긴다.
- 이번 작업은 M3 Bronze/Silver/Gold `TransformSpec` 실행 전 단계의 runtime/storage/evidence smoke로 제한한다.

## 범위

- `RuntimeConfig`에 기존 단일 입력 호환성을 유지한 채 `source_inputs[]` 입력을 추가한다.
- `Week2SparkRunner`가 `source_inputs[]`를 source별로 읽고 source별 Parquet output을 만든다.
- `Week2RunnerResult` 호환 shape로 total row/bytes/duration/output path와 source별 `task_results`를 반환한다.
- product health sample JSONL 4종과 재실행 CLI를 추가한다.
- `contracts/runtime_config.sample.json`과 `docs/03-interface-reference.md`에 새 입력 모양을 반영한다.

## 범위 제외

- M3 소유인 Bronze/Silver/Gold 변환 의미, `risk_score`, metric semantics 구현.
- `gold_product_health` 최종 집계 생성.
- M5 Airflow DAG 내부 SparkRunner 호출.
- Docker Spark cluster 또는 5GB scale run.
- Taxi 추가 evidence.

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/08-development-workflow.md`
- `docs/12-quality-gates.md`
- `docs/14-decision-option-brief.md`
- `docs/15-context-budget-rule.md`
- `docs/project-context/asklake-week2-module-plan/ver2/team-handoff-summary.md`
- `docs/project-context/asklake-week2-module-plan/ver2/main-e2e-path.md`
- `docs/project-context/asklake-week2-module-plan/ver2/runner-boundary-decision.md`
- `docs/reports/m3-expanded-layer-contract/l0-l10-design.md`
- `docs/reports/m3-expanded-layer-contract/layers/l1-bronze-envelope.md`

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

- [ ] `RuntimeConfig.source_inputs[]`가 여러 source 입력을 표현한다.
- [ ] 기존 단일 `input_path` runner 테스트가 계속 통과한다.
- [ ] multi-source product health smoke가 source별 Parquet output과 evidence를 만든다.
- [ ] M3 Bronze/Silver/Gold semantics를 구현하지 않았음을 문서와 evidence에 명시한다.
- [ ] TDD 상태 기록
- [ ] Acceptance 확인
- [ ] Regression/failure scenario 확인
- [ ] Manual verification 기록
- [ ] CI/check 명령과 결과 기록
- [ ] Report 업데이트
