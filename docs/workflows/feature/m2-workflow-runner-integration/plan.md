# M2 Workflow runner 연동 계획

## 브랜치

- Branch: `feature/m2-workflow-runner-integration`
- Workspace: `docs/workflows/feature/m2-workflow-runner-integration`
- Created: 2026-06-27

## 목표

- M5 `Week2WorkflowService`가 M2 `Week2SparkRunner`를 `executor=spark_runner`로 호출할 수 있게 한다.
- Amazon Reviews JSONL demo source를 기존 Week 2 workflow 실행 API에서 Parquet output으로 생성하고, `ExecutionResult`와 `CatalogMetadata`에 실행 증거를 남긴다.
- 이 작업은 M2 runner를 수동 script evidence에서 backend workflow runtime 선택지로 승격하는 좁은 연동이다.

## 범위

- `Week2WorkflowRunRequest.executor`에 `spark_runner`를 허용한다.
- `Week2WorkflowService`에 `Week2SparkRunner` 의존성을 추가하고 `_run_with_executor()`에서 `spark_runner` 분기를 처리한다.
- 기존 `SourceConfig`와 `WorkflowDefinition`에서 `RuntimeConfig`를 만들어 `Week2SparkRunner`에 넘긴다.
- `spark_runner` 실행 결과가 기존 `ExecutionResult` top-level metrics와 `CatalogMetadata.storage.local_fallback_path`에 기록되는지 확인한다.
- focused backend test로 API 호출, Parquet output 생성, catalog metadata 기록을 검증한다.

## 범위 제외

- M1 UI 수정.
- Airflow DAG 내부에서 SparkRunner를 호출하는 구현.
- 실제 Spark cluster 또는 distributed Spark session 실행.
- Taxi dataset 처리, Taxi benchmark, 대용량 데이터 다운로드.
- M3 Bronze/Silver/Gold transformation semantics 구현.
- MinIO/S3 실제 object write.

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

- [ ] `executor=spark_runner` API 요청이 201 응답을 반환한다.
- [ ] `Week2SparkRunner`가 workflow 실행 중 호출되어 `.parquet` output을 만든다.
- [ ] `ExecutionResult.row_count`, `ExecutionResult.bytes`, `ExecutionResult.duration_ms`, `task_results`가 채워진다.
- [ ] `CatalogMetadata.storage.local_fallback_path`가 생성된 Parquet 파일을 가리킨다.
- [ ] `local_runner`와 `airflow` 기존 경로가 regression 없이 통과한다.
- [ ] TDD 상태 기록
- [ ] Acceptance 확인
- [ ] Regression/failure scenario 확인
- [ ] Manual verification 기록
- [ ] CI/check 명령과 결과 기록
- [ ] Report 업데이트
