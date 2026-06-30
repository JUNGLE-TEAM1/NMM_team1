# Product Health Manual Run execution 계획

## 브랜치

- Branch: `feature/product-health-manual-run-execution`
- Workspace: `docs/workflows/feature/product-health-manual-run-execution`
- Created: 2026-06-30

## 목표

- Product Health Target Dataset의 Manual Run이 저장된 `process_rule`과 요청으로 전달된 Source Snapshot artifact를 사용해 `gold_product_health` Parquet output을 생성한다.
- PR 4 Source Snapshot 저장소가 아직 붙지 않아도, `source_snapshots[]` 요청 계약으로 PR 5B 실행 경계를 검증할 수 있게 한다.
- Source Snapshot이 없거나 읽을 수 없으면 성공처럼 보이지 않고 `failed_product_health_execution` evidence를 TargetDatasetRun에 남긴다.

## 범위

- `POST /api/target-datasets/{dataset_id}/runs` 요청에 Product Health용 `source_snapshots[]` 입력 metadata를 받을 수 있게 한다.
- Product Health `process_rule.type=product_health_gold_pipeline`인 Target Dataset은 Week2 reviews fixture 대신 Product Health 전용 실행 경로를 탄다.
- parquet snapshot 입력을 role별로 읽고 M3 Gold Contract v2 기준의 `gold_product_health.parquet`를 생성한다.
- 실행 결과의 `product_health_manual_run_contract`에 실제 `source_snapshot_inputs`, `gold_output`, `quality_results`, `lineage`, `catalog_payload`, `error`를 채운다.

## 범위 제외

- PostgreSQL/MongoDB/Kafka에 직접 접속해서 snapshot을 만드는 기능.
- PR 4의 latest successful snapshot lookup 저장소 구현.
- Catalog 등록, AI Query 연결, Dashboard 저장.
- Spark cluster/Airflow distributed execution. 이번 PR은 local parquet artifact 기반 실행 경계다.

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
