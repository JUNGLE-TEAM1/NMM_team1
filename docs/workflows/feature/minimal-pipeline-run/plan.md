# Minimal pipeline run 계획

## 브랜치

- Branch: `feature/minimal-pipeline-run`
- Workspace: `docs/workflows/feature/minimal-pipeline-run`
- Created: 2026-06-22

## 목표

- M4 범위인 최소 `source -> transform -> target` 실행을 구현한다.
- 실행 요청, run status, 결과 dataset 위치, row count를 API와 UI에서 확인할 수 있게 한다.
- container smoke와 Kubernetes manifest smoke 기준으로 배포 가능 경로를 확인한다.

## 범위

- 등록된 CSV source dataset을 입력으로 사용하는 pipeline 생성 API.
- `select_fields` 기반 최소 transform.
- 로컬 CSV result store에 target dataset 저장.
- pipeline run의 `queued`, `running`, `success`, `failed` 상태 기록.
- frontend에서 source dataset 선택, pipeline 생성/실행, 결과 상태 확인.
- backend tests, frontend build, compose smoke, manifest smoke, harness strict validation.

## 범위 제외

- Spark/Airflow/Kubernetes job runner.
- S3, warehouse, PostgreSQL, 외부 metadata store.
- retry/cancel/schedule, run log streaming, lineage graph.
- 실제 AWS/EKS 배포와 비용 resource 생성.

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

큰 Phase를 내부 단계로 나누는 경우 아래 양식을 사용한다. 작은 Phase는 이 섹션을 `not needed`로 둔다.

### Step 1 - Pipeline Contract

#### 목표

- source dataset, transform config, target dataset, run status contract를 코드 모델로 고정한다.

#### 범위

- `PipelineCreate`, `PipelineRecord`, `PipelineRunRecord`
- metadata store pipeline/run persistence
- happy/failure path backend tests

#### 범위 제외

- async queue, scheduler, external orchestration

#### 구현 프롬프트

```text
@AGENTS.md @docs/03-interface-reference.md @docs/08-development-workflow.md

M4 최소 pipeline contract를 구현한다. 등록된 source dataset을 입력으로 받고,
select_fields transform과 target_name을 저장한다. run은 queued/running/success/failed
상태와 result_dataset_id/result_location/row_count/error/logs를 기록한다.
```

#### 검증 프롬프트

```text
@AGENTS.md @docs/12-quality-gates.md

happy path와 source read 실패 path를 pytest로 검증하고 결과를 quality.md에 기록한다.
```

#### 완료 기준

- [x] pipeline 생성/조회/run API contract가 있다.
- [x] success run이 result dataset을 catalog에 등록한다.
- [x] source read 실패 시 failed run이 기록된다.

### Step 2 - UI and Smoke

#### 목표

- 사람이 웹 UI와 smoke script로 최소 pipeline 실행을 확인할 수 있게 한다.

#### 범위

- Pipeline Run panel
- frontend API client
- compose smoke에서 source 등록, pipeline 생성, run success, result catalog 확인
- Kubernetes manifest smoke shape 확인

#### 범위 제외

- 실제 AWS/EKS deploy
- browser screenshot 기반 E2E

#### 구현 프롬프트

```text
@AGENTS.md @docs/07-manual-verification-playbook.md

등록된 source dataset을 골라 select_fields pipeline을 만들고 실행하는 최소 UI를 붙인다.
container smoke가 pipeline 실행과 result dataset 생성을 검증하도록 확장한다.
```

#### 검증 프롬프트

```text
@AGENTS.md @docs/12-quality-gates.md

frontend build, scripts/smoke-container-app.sh, manifest smoke, harness strict validation을 실행하고 결과를 workspace에 기록한다.
```

#### 완료 기준

- [x] UI에서 pipeline 생성/실행 상태를 볼 수 있다.
- [x] compose smoke가 pipeline result dataset을 확인한다.
- [x] Kubernetes manifest smoke 기준을 통과한다.

## 완료 기준

- [x] 범위 완료
- [x] TDD 상태 기록
- [x] Acceptance 확인
- [x] Regression/failure scenario 확인
- [x] Manual verification 기록
- [x] CI/check 명령과 결과 기록
- [x] Report 업데이트
