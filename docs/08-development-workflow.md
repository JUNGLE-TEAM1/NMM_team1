# 08. 개발 워크플로우

이 문서는 공유 workflow protocol, branch workspace 모델, Phase queue, prompt, 완료 gate를 정의한다.

## 사용 방법

1. 한 번에 하나의 Phase만 진행한다.
2. 시작 전 `AGENTS.md`를 읽는다.
3. `docs/00-layer-map.md`로 영향 계층을 찾는다.
4. 작업 유형을 분류한다.
5. Skill Discovery Rule을 적용하고, 유용할 때만 관련 skill/plugin/tool을 확인한다.
6. `docs/15-context-budget-rule.md`의 Context Budget Rule을 적용한다. 위험이나 audit 범위가 아니면 Lite Read로 시작한다.
7. Context Loading Rule을 적용하고 현재 Phase 섹션만 읽는다.
8. `docs/workflows/<branch-type>/<branch-name>/` 아래 branch workspace를 만들거나 연다.
9. 구현 프롬프트를 실행한다.
10. 검증 프롬프트를 실행한다.
11. 동작/계약이 바뀐 경우에만 관련 문서를 업데이트한다.
12. `docs/reports/_template.md`를 사용해 Phase report를 만든다.

## Branch Workspace 모델

공유 workflow는 이 파일에 둔다. 실제 branch마다 별도 작업 folder를 가진다.

```text
docs/workflows/
├─ README.md
├─ feature/
│  └─ task-board/
│     ├─ plan.md
│     ├─ notes.md
│     ├─ report.md
│     ├─ quality.md
│     ├─ decisions.md
│     ├─ shared-docs.md
│     ├─ sources.md
│     ├─ confirmations.md
│     ├─ next-actions.md
│     └─ sync.md
└─ docs/
   └─ project-bootstrap/
      ├─ plan.md
      ├─ notes.md
      ├─ report.md
      ├─ quality.md
      ├─ decisions.md
      ├─ shared-docs.md
      ├─ sources.md
      ├─ confirmations.md
      ├─ next-actions.md
      └─ sync.md
```

branch와 workspace는 `scripts/start-workflow.sh`로 함께 만든다.

```bash
scripts/start-workflow.sh feature task-board "Task board MVP"
```

생성되는 항목:

- Git branch: `feature/task-board`
- Workspace folder: `docs/workflows/feature/task-board/`
- `plan.md`
- `notes.md`
- `report.md`
- `quality.md`
- `decisions.md`
- `shared-docs.md`
- `sources.md`
- `confirmations.md`
- `next-actions.md`
- `sync.md`

branch 생성/전환 없이 파일만 만들려면 `--no-checkout`을 사용한다.
branch 이름과 생성 파일만 미리 보려면 `--dry-run`을 사용한다.
handoff, integration, PR readiness 전에 현재 workspace 상태를 요약하려면 `scripts/status-workflow.sh <workspace>`를 사용한다.

## 적용 모드

- Default Mode: 새 프로젝트와 하네스 적용 후 일반 Phase 작업은 이 Development Workflow를 따른다.
- Existing Codebase Adoption Mode: 이미 code, config, tests, docs, CI, PR, branch convention이 있는 repo는 먼저 `docs/16-existing-codebase-adoption.md`를 따른다.
- baseline adoption 이후의 변경은 다시 일반 Phase Workflow로 돌아온다.
- 기존 코드베이스 적용 절차를 매 일반 Phase에 섞지 않는다.
- 적용 후 첫 위험 구현 기능 전에 P0 infrastructure gap을 확인한다.
- P0 gap은 baseline, 문서, 진단 작업을 막지 않는다.
- P0 gap이 있으면 위험한 feature branch 전에 infrastructure Phase를 제안한다.

Workspace state 값:

- `draft`: newly created or not yet scoped.
- `in-progress`: active implementation or documentation work.
- `ready-for-review`: branch believes implementation/checks are ready for review.
- `complete`: branch is complete.
- `integration-ready`: integration branch is ready for final integration validation.
- `archived`: historical evidence; only minimal validation applies.

## Git Sync 규칙

시작, mid-phase, pre-merge, PR 결정은 `docs/11-git-sync-policy.md`를 따른다.

- Start Sync: before implementation, check that work begins from the intended main/base and record it in `sync.md`.
- Mid-Phase Sync: if upstream main changes or shared Source of Truth docs change, stop and ask for a sync decision.
- Pre-Merge Sync: before completion/integration, re-check main freshness and record conflicts or validation.
- Push / PR: prefer PR-based integration and record branch, PR link, and merge status in `sync.md`.
- Linked Issue: when a branch maps to a GitHub issue, keep the existing branch/workspace name and record the issue plus PR closing keyword in `sync.md`.
- AI records sync status but does not run pull, merge, rebase, push, PR creation, or PR merge without human confirmation.

## 품질 게이트 규칙

TDD, branch check, CI, CD/deploy 결정은 `docs/12-quality-gates.md`를 따른다.

- TDD: for core logic, bug fixes, regression-prone behavior, or integration contracts, write or identify the failing test before implementation.
- Branch checks: record test/build/typecheck/harness validation commands and results in `quality.md`.
- CI: PR-ready branches should have the project CI command set or a recorded reason why CI is not applicable.
- CD: deploy/publish/rollback commands require human confirmation and smoke/rollback notes.
- AI records quality evidence but does not skip required checks without a recorded reason.

## Decision Option Brief 규칙

고영향 선택에는 `docs/14-decision-option-brief.md`를 사용한다.

AI가 큰 요청을 받았을 때:

1. Extract requirements.
2. Split features into branch workspaces when useful.
3. Identify high-impact human decisions.
4. Classify each decision type.
5. Present a Decision Option Brief using the type-specific template.
6. After the human chooses, record the outcome in `decisions.md`.
7. Update `confirmations.md`, `notes.md`, `shared-docs.md`, `quality.md`, or `sync.md` when the decision affects those files.

작고 되돌리기 쉬운 선택에는 Decision Option Brief를 쓰지 않는다.

## 상태 요약 규칙

사람이 현재 상태, PR readiness, integration readiness, "다음 뭐 하지?"를 물으면 AI는 `scripts/status-workflow.sh`를 사용한다.

상태 요약에는 아래를 포함한다.

- missing workspace files
- pending confirmations
- sync readiness
- quality/TDD/CI readiness
- shared Source of Truth proposals
- integration source/base records
- recommended next action from `docs/10-next-action-menu.md`

## Context Budget 규칙

`docs/15-context-budget-rule.md`를 따른다.

- Start with Lite Read for ordinary branch work: `AGENTS.md`, `docs/00-layer-map.md`, workspace status output when available, and directly relevant Source of Truth files.
- Escalate when API/schema/data/security/acceptance/regression/manual verification/integration/Git sync/quality/decision risk appears.
- Use Audit Read for whole-project checks, risk analysis, retrospectives, migration planning, or harness evaluation.
- `scripts/status-workflow.sh` is a summary entry point, not a replacement for Source of Truth.
- Report the Context Budget mode and key files read in the Phase report.

## Integration Branch Rule / 통합 브랜치 규칙

branch가 두 개 이상의 feature branch를 합치면 integration branch workspace를 만들고, `sources.md`에 source branch를 적고, source branch/base commit 정보를 기록한다. 또한 각 source branch의 `shared-docs.md`, `plan.md`, `report.md`, `quality.md`, `decisions.md`, `confirmations.md`, `sync.md`를 읽는다.

Run `scripts/validate-harness.sh --integration` before considering an integration branch complete.

integration branch는 아래 충돌을 해결해야 한다.

- shared data model changes
- interface contract changes
- acceptance scenario overlap
- regression guard overlap
- manual verification overlap
- unresolved questions from source branches

## 사람 확인 게이트

AI는 gate 사이에서는 자율적으로 작업하되, 범위, 계약, 검증, 완료, 통합 방향을 바꾸는 결정에서는 멈추고 사람 확인을 받는다.

Record confirmation status in the branch workspace `confirmations.md`.

필수 gate:

- Scope Confirm: branch/workspace, included scope, excluded scope, impacted docs.
- Contract Confirm: data model, interface/API/CLI/UI contract, external dependency, shared Source of Truth change.
- Scope Change Confirm: any expansion beyond `plan.md` or split into another branch.
- Verification Confirm: test/build/smoke commands, manual verification path, completion criteria.
- Quality Gate Confirm: TDD evidence, required branch checks, CI gates, skipped checks, and CD/deploy gate.
- Git Sync Confirm: start sync, mid-phase upstream changes, pre-merge sync, and PR readiness.
- Sync Conflict Confirm: main changes or shared Source of Truth conflicts that affect the branch.
- Completion Confirm: changed summary, verification result, remaining risk, next task context.
- Integration Conflict Confirm: conflicts between source branches, shared models, interfaces, acceptance, regression, or manual verification.

## 다음 행동 메뉴 규칙

confirmation gate, verification result, integration conflict 뒤에는 열린 질문 대신 짧은 next action menu를 제시한다.

Use `docs/10-next-action-menu.md` as the state menu reference and record the current menu in branch workspace `next-actions.md`.

각 메뉴에는 아래를 포함한다.

- current state
- recommended next action
- 2-4 options
- what AI will do after the human chooses

The human can answer with a number or natural language, such as "1번으로 진행해", "범위 수정하자", "별도 브랜치로 빼자", or "검증 먼저 해줘".

## Phase 공통 시작 게이트

0. Read `AGENTS.md`.
1. Check `docs/00-layer-map.md` and identify the earliest impacted layer.
2. Classify the task type.
3. Apply Skill Discovery Rule. Use a relevant skill/plugin/tool when clearly useful; otherwise continue with the default workflow.
4. Apply Context Loading Rule.
5. Apply Context Budget Rule: choose Lite Read, Escalate Read, or Audit Read.
6. If a workspace exists, run or summarize `scripts/status-workflow.sh <workspace>` before opening detailed workspace files.
7. Confirm current Phase and branch/work location.
8. Confirm branch workspace exists under `docs/workflows/`.
9. Confirm `confirmations.md` exists and Scope Confirm is ready.
10. Confirm `next-actions.md` exists and has a recommended next action.
11. Confirm `sync.md` exists and Start Sync is recorded or ask for Git Sync Confirm.
12. Confirm `quality.md` exists and TDD/CI expectations are clear or ask for Quality Gate Confirm.
13. Confirm `decisions.md` exists and high-impact choices are recorded or deferred.
14. Confirm no earlier incomplete Phase should be done first.
15. Mark Hotfixes explicitly.
16. Name what is out of scope.
17. Apply Lightweight Execution Rule.
18. Do not invent undocumented requirements.
19. Do not revert unrelated user/previous changes.
20. Check related `docs/06` Regression Guard.
21. Read report context. If `docs/reports/README.md` has a Latest Report Index, read the latest report for the related area first. Otherwise read the previous Phase report and 1-2 relevant reports.

## Phase 공통 완료 게이트

1. Implementation or artifact exists.
2. Tests/build/smoke/manual verification completed.
3. Related docs updated only where needed.
4. Acceptance criteria in `docs/05` checked.
5. Failure Scenario reviewed.
6. Manual Verification result recorded.
7. Phase report created.
8. Human confirmation outcomes recorded where required.
9. Next action menu updated for the human's next choice.
10. `sync.md` records pre-merge sync status or a human-approved reason for deferral.
11. `quality.md` records TDD status, branch checks, CI status, skipped checks, and CD gate if relevant.
12. `decisions.md` records accepted/deferred high-impact decisions and rollback/revisit conditions.
13. For integration branches, `scripts/validate-harness.sh --integration` completed or a human-approved deferral is recorded.
14. Branch workspace `plan.md`, `notes.md`, or `report.md` updated where useful.
15. No scope leak.
16. Final report includes changed files, used skill/plugin/tool, verification, report path, next context, and remaining risks.
17. Final report records Context Budget mode, primary context read, escalated context read, and intentionally omitted context.

ready/complete workspace는 quality, decision, pre-merge sync 상태를 해결해야 한다. draft/in-progress workspace는 필수 섹션을 유지하는 한 계획 placeholder를 둘 수 있다.

## 우선순위

| 우선순위 | 범위 | 비고 |
| --- | --- | --- |
| P0 | XFlow 참고 MVP 범위와 마일스톤 확정 | 요구사항, 검증, 실행 명령을 최소 초안으로 정리 |
| P1 | 인프라 foundation 선행 | CI/CD, Docker, Kubernetes, AWS 전략과 approval gate를 먼저 확정 |
| P2 | 첫 실제 기능 Phase 진행 | container/deployable skeleton과 branch workspace 흐름 검증 |

## MVP 마일스톤

| 마일스톤 | Phase 후보 | 목표 | 완료 신호 |
| --- | --- | --- | --- |
| M0. MVP 범위 확정 | `feature/mvp-roadmap` | XFlow 참고 범위를 AskLake MVP로 축소하고 Source of Truth에 반영 | 하네스 검증 통과, 다음 구현 Phase 후보 확정 |
| M1. 인프라 foundation | `feature/infrastructure-foundation` | CI/CD, Docker, Kubernetes, AWS strategy, approval gate 확정 | workflow, Dockerfile, manifest/Helm 후보, AWS checklist, rollback/smoke 기준 기록 |
| M2. 앱 골격과 컨테이너 | `feature/container-app-skeleton` | React + FastAPI 후보 구조, health check, container build/run 명령 확정 | frontend/backend가 container로 실행되고 smoke check 기록 |
| M3. 소스와 카탈로그 | `feature/source-catalog` | 샘플 source 등록과 catalog 목록/상세 표시 | source metadata와 schema/sample이 보임 |
| M4. 최소 파이프라인 실행과 배포 smoke | `feature/minimal-pipeline-run` | source -> transform -> target 실행과 container/K8s smoke 표시 | success/failed run과 배포 smoke 결과 확인 |
| M5. 데모 정리 | `feature/demo-polish` | 데모 UX, 오류 메시지, report, release gate 정리 | 3분 golden path 시연 가능 |

## 장기 구현 마일스톤

M5 이후는 XFlow급 기능 볼륨을 AskLake 방식으로 구현하기 위한 roadmap이다. MVP 범위를 키우지 않고, 각 단계는 별도 branch workspace에서 검증 가능한 작은 단위로 진행한다.

| 마일스톤 | Phase 후보 | 포함 범위 | 제외 범위 | 선행 조건 | 검증 | 완료 신호 | 리스크 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| M6. 소스 확장 | `feature/source-connectors` | PostgreSQL 또는 MySQL connection test, schema/sample preview | 모든 source type 동시 구현 | M3 | 연결 성공/실패 수동 검증 | 최소 1개 RDB source 등록 | secret과 local DB 재현성 |
| M7. 변환 확장 | `feature/transform-library` | select/drop/filter/union/sql transform | Spark SQL, 복잡 join 최적화 | M4 | transform별 output 검증 | transform 결과 schema 기록 | schema drift |
| M8. 실행 관리 | `feature/job-run-management` | run history, logs, retry, cancel 후보, schedule placeholder | Airflow 필수화 | M4 | run 상태 전이 검증 | run 추적 가능 | partial output |
| M9. 카탈로그 고도화 | `feature/catalog-metadata` | owner/tags/domain, detail, basic search | OpenSearch 필수화 | M3, M4 | 검색/filter/detail 검증 | dataset 발견 가능 | metadata drift |
| M10. 품질 검사 | `feature/data-quality` | row count/null/duplicate/quality score | alerting, 고급 통계 | M9 | 정상/불량 dataset 비교 | 품질 결과 catalog 연결 | 성능과 오해 |
| M11. Lineage와 시각 편집 | `feature/lineage-visual-editor` | React Flow graph, lineage view, form fallback | 전체 DAG orchestration | M7, M9 | graph 저장/실행 검증 | graph와 contract 일치 | UI 복잡도 |
| M12. SQL Lab | `feature/sql-lab` | DuckDB local query, query history, result preview | Trino 필수화 | M9 | sample query 검증 | local query 가능 | resource 제한 |
| M13. AI Assistant | `feature/ai-assistant` | schema-aware SQL draft, pipeline 설명 보조, local/mock fallback | Bedrock/외부 LLM 필수화 | M9, M12 | AI off/on 경로 비교 | AI가 보조로만 작동 | 비용과 hallucination |
| M14. Streaming/CDC 후보 | `feature/streaming-cdc-spike` | Kafka/Debezium option brief, local simulation | production Kafka 필수화 | batch 안정화 | spike report | 도입/보류 결정 | 운영 복잡도 |
| M15. 선택적 분산/클라우드 확장 | `feature/distributed-cloud-option` | S3/Spark/Airflow/Trino/OpenSearch/EKS option brief와 작은 PoC | 무승인 cloud 비용 | 병목 증거 | 비용/rollback 검토 | 승인된 PoC | 비용과 scope 폭증 |

## 현실 원칙

- Prefer the smallest demoable slice.
- Defer infrastructure or architecture expansion until the core flow works.
- Keep optional work out of P0 unless required by acceptance criteria.
- Prefer visible verification over assumed completion.

## Phase 작성 형식

~~~md
## Phase N - [PHASE_NAME] ([BRANCH_OR_WORK_LOCATION])

### Goal

- [GOAL]

### Scope

- [SCOPE_ITEM]

### Out Of Scope

- [OUT_OF_SCOPE]

### Implementation Prompt

```text
@AGENTS.md @[RELEVANT_DOCS]

[IMPLEMENTATION_REQUEST]
```

### Verification Prompt

```text
@AGENTS.md @[RELEVANT_DOCS]

[VERIFICATION_REQUEST]
```

### Completion Criteria

- [ ] [CRITERION]
~~~

Phase 제목에는 항상 branch 또는 작업 위치를 포함한다. branch 작업이 불가능하면 local path 또는 `local workspace`를 쓰고 Phase report에 이유를 설명한다.

## Phase 0 - 프로젝트 부트스트랩 (`feature/project-bootstrap`)

### 목표

- AskLake 프로젝트 전용 Source of Truth 기반을 만든다.

### 구현 프롬프트

```text
@AGENTS.md @docs/01-product-planning.md @docs/02-architecture.md @docs/03-interface-reference.md

Bootstrap AskLake project operations for Phase 0 only.
Do not implement later features.
Fill only the minimum known requirements, architecture, interface, verification, and workflow context.
Keep unknown product details as TBD with clear open questions.
```

### 검증 프롬프트

```text
@AGENTS.md @docs/05-acceptance-scenarios-and-checklist.md

Verify Phase 0 without adding features.
Confirm local run commands, env examples, and smoke/health behavior.
Report failures and missing docs.
```

### 완료 기준

- [ ] Project Source of Truth에 최소 문맥이 있다.
- [ ] Smoke check가 문서화되었거나 명시적으로 보류되었다.
- [ ] Phase report가 생성되었다.

## Phase 1 - XFlow 참고 MVP 로드맵 (`feature/mvp-roadmap`)

### 목표

- `/Users/tail1/Documents/데이터 파이프라인/xflow`를 read-only reference로만 사용해 AskLake MVP와 milestone을 정의한다.

### 범위

- product scope, architecture, interface, acceptance, regression, manual verification, workflow 문서를 업데이트한다.
- XFlow는 reference로만 두고 구현 코드를 복사하지 않는다.
- CI/CD, Docker, Kubernetes, AWS foundation은 제품 기능 개발 전에 먼저 정리한다.
- 실제 AWS resource 생성은 비용/권한/rollback 승인 gate 뒤에 둔다.

### 범위 제외

- 제품 코드 구현.
- Airflow, Spark, Kafka, OpenSearch, Trino, Bedrock 또는 기타 데이터 플랫폼 확장 기능을 MVP 필수 dependency로 추가하는 일.
- 승인 없이 AWS resource를 생성하는 일.
- 과거 작업을 위한 retroactive workspace 생성.

### 구현 프롬프트

```text
@AGENTS.md @docs/00-layer-map.md @docs/01-product-planning.md @docs/02-architecture.md @docs/03-interface-reference.md @docs/05-acceptance-scenarios-and-checklist.md @docs/08-development-workflow.md

Read XFlow only as reference context.
Define an infrastructure-first MVP and milestone plan for AskLake.
Update only the Source of Truth docs needed to make the next implementation Phase clear.
Do not copy XFlow source code.
Keep CI/CD, Docker, Kubernetes, and AWS foundation before product development, but do not create paid AWS resources without approval.
```

### 검증 프롬프트

```text
@AGENTS.md @docs/05-acceptance-scenarios-and-checklist.md @docs/06-regression-and-failure-scenarios.md @docs/07-manual-verification-playbook.md

Verify that the MVP scope, milestones, acceptance criteria, regression guards, and manual checks are consistent.
Run harness validation and strict validation.
Record skipped product runtime checks because this Phase is documentation-only.
```

### 완료 기준

- [ ] MVP와 Non-MVP scope가 문서화되어 있다.
- [ ] M0~M5 MVP/infrastructure milestone이 문서화되어 있다.
- [ ] XFlow는 read-only inspiration으로만 언급된다.
- [ ] acceptance, regression, manual verification, workflow 문서가 서로 맞는다.
- [ ] Harness validation이 통과한다.

## Phase 2 - 인프라 foundation (`feature/infrastructure-foundation`)

### 목표

- 제품 기능 구현 전에 CI/CD, Docker, Kubernetes, AWS 기반과 approval gate를 확정한다.

### 범위

- GitHub Actions CI workflow 후보를 만든다.
- frontend/backend Dockerfile 또는 MVP image 전략을 정한다.
- Kubernetes manifest 또는 Helm chart 후보를 만든다.
- AWS account/region/IAM/ECR/EKS 또는 대체 compute/storage 전략을 문서화한다.
- 실제 AWS resource 생성 전 비용/권한/rollback approval checklist를 만든다.

### 범위 제외

- 제품 기능 구현.
- 실제 AWS 비용이 발생하는 resource 생성.
- production-grade autoscaling, full observability, multi-AZ 운영 구성.

### 구현 프롬프트

```text
@AGENTS.md @docs/02-architecture.md @docs/04-development-guide.md @docs/05-acceptance-scenarios-and-checklist.md @docs/06-regression-and-failure-scenarios.md @docs/08-development-workflow.md

Set up the infrastructure foundation before product feature development.
Create or update CI/CD, Docker, Kubernetes, and AWS planning artifacts.
Do not create paid AWS resources without explicit human approval.
Record smoke, rollback, secret, and cost gates.
```

### 검증 프롬프트

```text
@AGENTS.md @docs/05-acceptance-scenarios-and-checklist.md @docs/06-regression-and-failure-scenarios.md @docs/12-quality-gates.md

Verify CI/CD, Docker, Kubernetes manifest/Helm, and AWS approval gates.
Run harness validation and strict validation.
Record skipped cloud actions and approval requirements.
```

### 완료 기준

- [ ] CI workflow 후보가 있다.
- [ ] Docker build/run 전략이 있다.
- [ ] Kubernetes manifest 또는 Helm 후보가 있다.
- [ ] AWS 비용/권한/rollback approval gate가 기록되어 있다.
- [ ] Secret이 commit되지 않았다.
- [ ] Harness validation이 통과한다.

## Phase 3 - 첫 실제 기능 (`feature/<short-kebab-name>`)

### 목표

- branch workspace와 함께 첫 실제 제품 기능을 시작한다.

### 범위

- Create a workspace with `scripts/start-workflow.sh`.
- Link a GitHub issue when available.
- Record scope, quality gate, sync status, and PR closing keyword requirements.
- Implement only the accepted feature slice.

### 범위 제외

- Unrelated refactors.
- Multiple independent feature slices.
- 명시적으로 범위에 포함되지 않은 deployment 작업.

### 구현 프롬프트

```text
@AGENTS.md @docs/00-layer-map.md @docs/05-acceptance-scenarios-and-checklist.md @docs/06-regression-and-failure-scenarios.md @docs/07-manual-verification-playbook.md @docs/08-development-workflow.md

Start the first real feature Phase.
Create or open the branch workspace, record scope and verification expectations, then implement only the accepted slice.
```

### 검증 프롬프트

```text
@AGENTS.md @docs/05-acceptance-scenarios-and-checklist.md @docs/06-regression-and-failure-scenarios.md @docs/07-manual-verification-playbook.md

Verify the implemented feature against acceptance, regression, manual verification, and quality gates.
```

### 완료 기준

- [ ] Feature scope completed
- [ ] Verification evidence recorded
- [ ] Phase report created
