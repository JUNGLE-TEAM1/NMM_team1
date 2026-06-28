# M2 Taxi 5GB local Spark evidence 계획

## 브랜치

- Branch: `feature/m2-taxi-5gb-local-evidence`
- Workspace: `docs/workflows/feature/m2-taxi-5gb-local-evidence`
- Created: 2026-06-29

## 목표

- 사용자가 로컬에 준비한 TLC NYC Taxi Parquet 묶음을 PySpark local mode로 실제 처리한다.
- 입력 5GB급 Parquet을 읽고, Taxi daily Gold metric Parquet을 쓰며, `Week2RunnerResult` 호환 summary에 row count, bytes, duration, output path를 남긴다.
- 이 증거가 Week 2 대표 Product Health 경로를 대체하지 않고, M2 Spark runtime scale 보조 증거임을 명확히 남긴다.

## 범위

- `Week2TaxiSparkRunner`가 단일 Parquet 파일뿐 아니라 Parquet 디렉터리 입력도 처리하게 한다.
- 월별 Taxi Parquet schema drift를 daily metric에 필요한 공통 타입으로 맞춘 뒤 Spark DataFrame으로 합친다.
- 로컬 5GB 실행을 위해 Spark driver memory와 Parquet vectorized reader option을 CLI에서 조절할 수 있게 한다.
- 실행 결과와 재실행 명령을 workspace 문서와 Phase report에 기록한다.

## 범위 제외

- Docker Spark cluster 구성은 이번 PR에서 하지 않는다.
- Airflow DAG 내부에서 Spark를 호출하는 통합은 이번 PR에서 하지 않는다.
- Product Health 5GB 대표 경로 실행은 이번 PR에서 하지 않는다.
- Taxi metric 의미, 품질 필터, quarantine 정책을 M2가 최종 확정하지 않는다. 해당 의미는 M3 `TransformSpec` / quality rule 책임이다.

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

- [x] 범위 완료
- [x] TDD 상태 기록
- [x] Acceptance 확인
- [x] Regression/failure scenario 확인
- [x] Manual verification 기록
- [x] CI/check 명령과 결과 기록
- [x] Report 업데이트
