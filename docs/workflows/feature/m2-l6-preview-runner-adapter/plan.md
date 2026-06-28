# M2 L6 preview runner adapter 계획

## 브랜치

- Branch: `feature/m2-l6-preview-runner-adapter`
- Workspace: `docs/workflows/feature/m2-l6-preview-runner-adapter`
- Created: 2026-06-28

## 목표

- M3가 만든 L6 preview-only spec을 M2 `spark_runner` 실행 경계에서 받아, 작은 preview input을 deterministic하게 실행하고 `Week2RunnerResult` 호환 결과로 돌려준다.
- M2는 Bronze/Silver/Gold 의미를 새로 정의하지 않고, L6 spec에 명시된 지원 가능한 operation만 실행한다.

## 범위

- `RuntimeConfig`가 inline `transform_spec` 또는 `transform_spec_path`를 받을 수 있게 한다.
- `Week2SparkRunner`에 L6 preview spec 실행 분기를 추가한다.
- 이번 PR에서 지원하는 최소 operation은 `select`, `rename`, `cast`, `parse_timestamp`, `normalize_null`, `json_string`, `mask`, `drop`, `aggregate`로 제한한다.
- 지원하지 않는 operation은 성공처럼 넘기지 않고 `Week2RunnerResult.status=failed`와 task error로 기록한다.
- 작은 JSONL/Parquet preview input으로 Silver select/cast 계열과 Gold aggregate 계열 smoke test를 남긴다.

## 범위 제외

- M3의 Bronze/Silver/Gold 정책 생성 또는 품질 판정 구현은 하지 않는다.
- Docker Spark cluster, Airflow DAG 내부 SparkRunner 호출, 5GB scale evidence는 이번 PR에서 하지 않는다.
- Product Health 최종 `gold_product_health` 의미 정의나 대용량 실행은 후속 Phase로 남긴다.
- M3 L6 action vocabulary 전체를 구현하지 않는다. 이번 PR은 runner adapter의 첫 얇은 실행 경로다.

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

- [ ] 범위 완료
- [ ] TDD 상태 기록
- [ ] Acceptance 확인
- [ ] Regression/failure scenario 확인
- [ ] Manual verification 기록
- [ ] CI/check 명령과 결과 기록
- [ ] Report 업데이트
