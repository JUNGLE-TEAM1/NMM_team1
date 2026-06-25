# Week2 responsibility ver2 계획

## 브랜치

- Branch: `docs/week2-responsibility-ver2`
- Workspace: `docs/workflows/docs/week2-responsibility-ver2`
- Created: 2026-06-25

## 목표

- AskLake Week2 M1~M6 수정 분업안을 `docs/project-context/asklake-week2-module-plan/ver2/` 아래에 새 기준 문서로 정리한다.
- 기존 `asklake-week2-module-plan` 루트 문서는 초기 회의안/historical context로 보존하고, `README.md` 상단에 ver2 안내만 최소 추가한다.
- Spark/Parquet/Catalog 중복 책임을 제거하고, M2 execution runtime / M3 transformation spec-job logic / M5 workflow-catalog 경계를 명확히 한다.

## 범위

- `docs/project-context/asklake-week2-module-plan/ver2/README.md` 생성
- `docs/project-context/asklake-week2-module-plan/ver2/revised-nonoverlap-responsibility.md` 생성
- `docs/project-context/asklake-week2-module-plan/ver2/original-vs-revised-flow.md` 생성
- `docs/project-context/asklake-week2-module-plan/README.md` 상단 ver2 안내 추가
- 이 workspace의 plan/notes/decisions/shared-docs/sources/quality/next-actions/report 작성

## 범위 제외

- 기존 `docs/project-context/asklake-week2-module-plan/plan.md`, `decisions.md`, `meeting-summary.md` 대량 rewrite
- `docs/03-interface-reference.md`, `contracts/*.sample.json` 즉시 변경
- Spark, MinIO, Airflow, Catalog, M6 query runtime 구현
- PR 생성/merge/finalize

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/08-development-workflow.md`
- `docs/12-quality-gates.md`
- `docs/14-decision-option-brief.md`
- `docs/15-context-budget-rule.md`
- `docs/project-context/asklake-week2-module-plan/README.md`
- `docs/project-context/asklake-week2-module-plan/plan.md`
- `docs/project-context/asklake-week2-module-plan/decisions.md`
- `docs/project-context/asklake-week2-module-plan/meeting-summary.md`
- `docs/project-context/asklake-week2-module-plan/decision-options.md`
- `/Users/tail1/Downloads/asklake-m1-m6-final-nonoverlap-responsibility.md`
- `/Users/tail1/Downloads/asklake-week2-original-vs-revised-m1-m6-flow.md`

## 구현 프롬프트

```text
@AGENTS.md @docs/00-layer-map.md @docs/08-development-workflow.md @docs/12-quality-gates.md @docs/14-decision-option-brief.md @docs/15-context-budget-rule.md

AskLake Week2 M1~M6 분업 수정안을 협업하네스 형식에 맞게 정리한다.
기존 루트 project-context 문서는 historical context로 보존하고, 현재 기준은 ver2/ 아래에 새로 작성한다.
M2는 Lakehouse Runtime Platform, M3는 Data Processing Spec + ETL Logic, M4는 Kafka Ingestion, M5는 Workflow Runtime + Catalog Store/API + Lineage, M6는 Semantic/RAG/AI Query, M1은 UI/API Gateway로 정리한다.
Iceberg는 이번 발표 범위에서 제외한다.
SourceConfig는 M1 단독 소유가 아니라 M1 shell + M3/M4 source-specific provider 구조로 정리한다.
Spark는 M2 공통 runtime, M3는 transformation spec/job logic, M5는 WorkflowDefinition을 통한 runner 호출로 분리한다.
```

## 검증 프롬프트

```text
@AGENTS.md @docs/05-acceptance-scenarios-and-checklist.md @docs/06-regression-and-failure-scenarios.md @docs/07-manual-verification-playbook.md @docs/12-quality-gates.md

branch 작업을 검증하고 `quality.md`와 workspace report에 증거를 기록한다.
Iceberg가 제외로만 표현됐는지, Spark/RuntimeConfig/SourceConfig/CatalogMetadata/ExecutionResult 책임이 ver2 문서에 명시됐는지 rg로 확인한다.
`scripts/validate-harness.sh --strict`와 `git diff --check`를 실행한다.
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

- [ ] `ver2/` 문서만 읽어도 현재 M1~M6 책임 기준을 이해할 수 있다.
- [ ] 기존 루트 문서가 historical context임이 README에서 명확하다.
- [ ] M2/M3/M4의 Spark/Parquet/Catalog 중복 책임이 제거되어 있다.
- [ ] M2 execution runtime, M3 transformation spec/job logic 경계가 분명하다.
- [ ] `SourceConfig`가 M1 shell + M3/M4 source-specific provider 구조로 정리되어 있다.
- [ ] Iceberg가 이번 발표 범위에서 제외되어 있다.
- [ ] 검증 명령과 결과를 `quality.md`와 `report.md`에 기록한다.
