# 08. 개발 워크플로우

이 문서는 공유 workflow protocol, milestone planning layer, branch workspace 모델, Phase queue, prompt, 완료 gate를 정의한다.

## 사용 방법

1. 한 번에 하나의 Phase만 진행한다.
2. 시작 전 `AGENTS.md`를 읽는다.
3. `docs/00-layer-map.md`로 영향 계층을 찾는다.
4. 작업 유형을 분류한다.
5. 새 기능 또는 사용자 가치 단위이면 milestone 필요 여부를 분류한다.
6. Skill Discovery Rule을 적용하고, 유용할 때만 관련 skill/plugin/tool을 확인한다.
7. `docs/15-context-budget-rule.md`의 Context Budget Rule을 적용한다. 위험이나 audit 범위가 아니면 Lite Read로 시작한다.
8. Context Loading Rule을 적용하고 현재 Phase 섹션만 읽는다.
9. `docs/workflows/<branch-type>/<branch-name>/` 아래 branch workspace를 만들거나 연다.
10. 구현 프롬프트를 실행한다.
11. 검증 프롬프트를 실행한다.
12. 동작/계약이 바뀐 경우에만 관련 문서를 업데이트한다.
13. `docs/reports/_template.md`를 사용해 Phase report를 만든다.

## Milestone Planning Layer

Milestone은 상위 계획 단위이고, Phase는 실제 실행 단위다.
milestone은 사용자 가치, 범위, 의존성, 완료 기준을 정한다.
Phase는 branch workspace에서 구현, 검증, sync, report를 수행한다.

작은 milestone은 Phase 하나로 끝날 수 있고, 큰 milestone은 여러 Phase로 나뉠 수 있다.
milestone-first는 planning layer이며 기존 Phase Workflow와 branch workspace를 대체하지 않는다.

새 기능의 권장 시작 흐름:

```text
전체 기능 설명
-> milestone 필요 여부 판단
-> milestone 분해 또는 provisional milestone 정의
-> milestone별 목표/범위/의존성/완료 기준 정리
-> 사람 확인
-> 각 milestone 내부 Phase 생성
-> branch workspace 실행
```

milestone이 필요한 경우:

- 사용자 가치가 하나의 기능 묶음으로 설명된다.
- 여러 Phase로 나뉠 가능성이 있다.
- 다른 사람, 대화창, agent와 병렬 개발할 수 있다.
- API, schema, data model, shared docs 의존성이 있다.
- 완료 기준이나 출시 기준을 따로 추적해야 한다.

lightweight Phase로 충분한 경우:

- 오타 수정
- 문서 문장 보완
- 작은 UI copy 변경
- 단일 파일의 명백한 버그 수정
- 테스트 이름 수정
- 설정값 또는 README 작은 업데이트
- 범위가 작고 의존성이 거의 없는 변경

milestone이 과한 변경은 lightweight Phase로 진행하고, 이유를 `notes.md` 또는 `report.md`에 짧게 남긴다.
작은 hotfix나 단일 파일 수정은 정식 milestone 없이 Phase Workflow로 처리할 수 있다.

### Rolling Milestone Planning

모든 milestone을 처음부터 한 번에 정할 필요는 없다.
전체 계획이 불명확하면 전체 roadmap 생성을 요구하지 않는다.
대신 현재 요청을 provisional milestone로 정의하고, 당장 필요한 첫 Phase만 얇게 계획하고 시작한다.

provisional milestone 최소 기록 항목:

- milestone ID 또는 provisional ID
- 이번에 만들 사용자 가치
- 지금 시작할 Phase
- 포함 범위
- 제외 범위
- 공유 API, schema, data model, shared docs 위험
- 완료 기준
- 나중에 다시 볼 질문 또는 후속 milestone 후보

완료 report에는 다음에 재평가할 질문과 후속 milestone 후보를 남긴다.

### Milestone Types

- Independent milestone: 다른 milestone 완료를 기다리지 않고 자기 Phase, branch workspace, PR로 완료 가능하다.
- Dependent milestone: API, schema, data model, runtime, shared docs 등 다른 milestone 결과에 의존한다.
- Integration milestone 또는 integration Phase: 둘 이상의 완료 branch를 함께 합쳐 검증해야 할 때만 생성한다.

integration branch/workspace는 항상 필수가 아니다.
늦는 milestone은 명시적 의존성이 없는 한 전체 진행을 자동으로 막지 않는다.

milestone 또는 Phase가 공유 API, schema, data model, shared Source of Truth를 바꿔야 하면 `shared-docs.md`, `decisions.md`, 또는 milestone manifest에 기록한다.
공유 계약이 불명확하면 바로 구현하지 말고 선행 contract milestone 또는 shared Source of Truth Phase로 분리하는 것을 권장한다.
다른 대화창, 사람, agent가 병렬 작업 중이면 수정 허용 범위와 금지 범위를 명확히 전달한다.

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

branch 생성/전환 없이 workspace 파일만 만들려면 `--no-checkout`을 사용한다.
GitHub issue 생성은 팀 기본 규칙이라 `--no-checkout`에서도 실행된다. 로컬 workspace만 만들 예외 상황이면 `--no-issue`를 함께 사용하고 이유를 `sync.md`에 기록한다.
branch 이름과 생성 파일만 미리 보려면 `--dry-run`을 사용한다.
다른 branch workspace로 이동할 때 현재 worktree가 dirty이면 `scripts/start-workflow.sh`가 현재 branch에 checkpoint commit을 만든 뒤 이동한다.
같은 branch workspace를 다시 여는 경우에는 checkpoint commit을 만들지 않는다.
handoff, integration, PR readiness 전에 현재 workspace 상태를 요약하려면 `scripts/status-workflow.sh <workspace>`를 사용한다.
여러 branch의 남은 작업 큐를 확인하려면 `scripts/list-active-branches.sh`를 사용한다.

## Mid-Phase Steering

작업 중 사람이 새 지시, 방향 전환, 추가 아이디어, 수정 요청을 주면 AI는 바로 구현하지 않고 먼저 Mid-Phase Steering으로 분류한다.
분류 목적은 사람의 조향을 막는 것이 아니라 현재 Phase 안정성을 유지하면서 잃어버리지 않는 것이다.

새 지시는 아래 중 하나로 분류한다.

- 현재 Phase scope 안의 세부 조정
- `Scope Change Confirm`이 필요한 변경
- `Hotfix`
- 다음 Phase 후보
- 아이디어 또는 보류 항목
- `Decision Option Brief`가 필요한 고영향 결정

현재 Phase에 반영되는 변경은 `plan.md`, `notes.md`, `confirmations.md`, `decisions.md`, 또는 `next-actions.md` 중 필요한 workspace 문서에만 기록한다.
범위가 커지거나 독립 작업이 되면 `Scope Change Confirm`을 먼저 해결하거나 별도 Phase 후보로 분리한다.
Hotfix로 전환하면 현재 Phase 또는 Hotfix 항목에 표시하고, 원래 Phase로 돌아올 조건을 남긴다.
고영향 결정은 `docs/14-decision-option-brief.md` 흐름을 사용한다.

## Small Change Completion

작은 변경도 `main`에 남길 팀 공유 산출물이면 PR을 기본 완료 경로로 본다.
예를 들어 report 추가, report index 수정, Source of Truth 주변 문서 보강, workflow/quality/sync/collaboration rule 변경, 완료된 branch workspace 문서는 작더라도 다음 팀원이 기준으로 삼을 수 있으므로 PR 후보가 된다.

로컬 보류를 선택할 수 있는 경우는 개인 메모, throwaway 초안, 곧 더 큰 branch에 흡수할 변경, 사람의 문체/방향 검토가 남은 문서, 검증이 끝나지 않은 작업이다.
로컬 보류는 이유와 재개 조건을 `sync.md`와 `next-actions.md`에 기록한다.

PR 전에 AI는 포함 파일과 제외 파일을 분리해 보고한다.
`.DS_Store`, 개인 초안, unrelated untracked file, 다른 workstream 파일은 stage하지 않는다.
작은 변경 완료 뒤 PR 여부가 애매하면 `docs/10-next-action-menu.md`의 `Small Change Completion Decision`을 사용한다.

## 적용 모드

- Default Mode: 새 프로젝트와 하네스 적용 후 일반 Phase 작업은 이 Development Workflow를 따른다.
- Existing Codebase Adoption Mode: 이미 code, config, tests, docs, CI, PR, branch convention이 있는 repo는 먼저 `docs/16-existing-codebase-adoption.md`를 따른다.
- Product Rebaseline Mode: 제품 정체성, MVP 기준, architecture/interface/acceptance가 크게 바뀔 때 current implementation baseline과 target product를 분리한 뒤 일반 Phase Workflow로 돌아온다.
- baseline adoption 이후의 변경은 다시 일반 Phase Workflow로 돌아온다.
- 기존 코드베이스 적용 절차를 매 일반 Phase에 섞지 않는다.
- 적용 후 첫 위험 구현 기능 전에 P0 infrastructure gap을 확인한다.
- P0 gap은 baseline, 문서, 진단 작업을 막지 않는다.
- P0 gap이 있으면 위험한 feature branch 전에 infrastructure Phase를 제안한다.

## Product Rebaseline Queue

AskLake는 기존 M0~M5 경량 pipeline MVP를 `Current implementation baseline`으로 보존하고, 제품 방향은 Trusted Data & AI Platform으로 재기준화한다.
기존 report와 완료 evidence는 historical evidence로 유지하며 새 기준에 맞춰 소급 수정하지 않는다.

Product Rebaseline 이후 Target MVP는 아래 신뢰 루프를 증명한다.

```text
Trusted Dataset -> Query/Ask -> Evidence -> Recovery
```

R0 이후 Target MVP 실행은 R0.5 `Modular Contract Baseline`을 먼저 둔 뒤, 병렬 workstream과 integration spine으로 운영한다.
기존 R1~R7 이름은 historical planning alias로 보존하되, 실행 순서를 강제하는 선형 queue가 아니라 workstream mapping으로 해석한다.

Target MVP planning alias:

| Alias | Workstream / Phase 후보 | 목표 | 선행 조건 | 완료 기준 |
| --- | --- | --- | --- | --- |
| R0 | `docs/product-rebaseline-trusted-platform` | Source of Truth를 새 제품 기준으로 정렬 | 사람의 rebaseline 결정 | `README`, `docs/01~03`, `docs/05~08` 정렬과 harness validation |
| R0.5 | `docs/modular-contract-baseline` | shared contract, module ownership, mock/fake boundary, integration spine 확정 | R0 완료 | `docs/03`, `docs/05~08`, `.milestones/target-mvp/manifest.yaml` 정렬과 harness validation |
| R1 | Catalog / Trust, `feature/trust-state-model` | dataset trust status와 Publish Gate 최소 모델 구현 | R0.5 contract baseline | `Draft/Verifying/Trusted/Degraded/Blocked` 상태와 gate 이유 확인 |
| R2 | Job / Orchestrator, `feature/control-plane-job-state` | job/task/event/audit 기초 상태 구축 | R0.5 contract baseline | run/task 상태와 audit/event evidence 기록 |
| R3 | Source Connector, `feature/source-expansion` | baseline 외 source 하나를 선택해 연결 | R0.5 contract baseline, source decision | 연결 성공/실패와 schema discovery 확인 |
| R4 | Query / Policy, `feature/query-policy-preflight` | Trusted dataset query와 권한 preflight 구현 | R0.5 contract baseline, policy decision | 허용/마스킹/차단 query 검증 |
| R5 | Ask / Evidence, `feature/ask-evidence` | Ask route와 Evidence 연결 | R0.5 contract baseline, mock 또는 real policy 확정 | 근거 있음/부족/권한 거부 Ask 검증 |
| R6 | Recovery / Operate, `feature/recovery-impact` | schema drift/quality failure 영향 분석과 backfill 복구 | R0.5 contract baseline | 복구 후 중복/누락 없이 상태 정상화 |
| R7 | Packaging, `feature/packaging-dev-lite` | self-hosted 배포 프로파일 안정화 | 배포 target decision | local/container 또는 dev-lite smoke와 secret/config 검증 |

Target MVP Workstream Pool:

| Workstream | 병렬 가능성 | Required contracts | Mock/Fake 허용 | Integration checkpoint |
| --- | --- | --- | --- | --- |
| Catalog / Trust | 높음 | `Dataset`, `DatasetStatus`, `TrustGateResult` | quality/PII/policy placeholder 허용 | Spine 1 |
| Source Connector | 높음 | `SourceConnection`, `SchemaSnapshot` | local fixture connector 허용 | Spine 1 |
| Job / Orchestrator | 높음 | `JobRun`, `TaskRun`, `AuditEvent` | synchronous in-memory runner 허용 | Spine 2 |
| Query / Policy | 중간~높음 | `PolicyDecision`, `QueryExecution`, `DatasetStatus` | allow/deny/mask fixture 허용 | Spine 2 |
| Ask / Evidence | 중간~높음 | `EvidenceItem`, `RetrievalTrace`, `PolicyDecision` | external LLM 없는 deterministic route 허용 | Spine 3 |
| Recovery / Operate | 중간 | `AssetImpact`, `RecoveryAction`, `JobRun` | schema drift/quality failure fixture 허용 | Spine 3 |
| Packaging | 높음 | `ModuleHealth`, config/secret contract | local/container profile 허용 | Release Checkpoint |

Integration Spine:

| Checkpoint | 목표 | 포함 workstream |
| --- | --- | --- |
| Spine 0. Contract Baseline | shared schema/state/event와 mock boundary 확정 | R0.5 |
| Spine 1. Trusted Dataset Draft | source에서 dataset draft가 생성되고 trust gate reason을 가진다 | Catalog / Trust, Source Connector |
| Spine 2. Governed Query | Trusted 또는 Blocked 상태와 policy decision으로 query 허용/차단을 검증한다 | Job / Orchestrator, Query / Policy |
| Spine 3. Evidence & Recovery | Ask/Evidence와 Recovery가 같은 dataset/policy/audit contract를 공유한다 | Ask / Evidence, Recovery / Operate |
| Release Checkpoint | local/container/dev-lite smoke와 secret/config 검증 | Packaging |

다음 구현 전 추천:

- Recommended: `docs/modular-contract-baseline` 완료 후 병렬 workstream을 연다.
- 첫 병렬 wave 후보: Catalog / Trust, Source Connector, Job / Orchestrator, Query / Policy mock.
- 이유: R0.5 없이 Query/Ask를 먼저 구현하면 권한 우회, evidence 누락, 잘못된 trusted 상태가 발생할 수 있다.
- 실제 병렬 worktree/thread/branch 생성은 R0.5의 일부가 아니다. R0.5 PR 또는 local hold 방식을 먼저 정한 뒤, `docs/17-parallel-milestone-protocol.md`에 따라 별도 사람 승인으로 시작한다.
- Query / Policy mock은 실제 권한 엔진, 실제 데이터 접근, Trino, 외부 LLM 호출을 포함하지 않는다. 이 경계를 넘으면 `docs/14-decision-option-brief.md`와 workstream `decisions.md`가 필요하다.
- 제외 후보: 실제 고급 PII 탐지, Trino, 외부 LLM, production cloud resource.

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
- Source of Truth Impact Gate: before completion, decide whether implementation, contract, API/schema, architecture, milestone, acceptance, or manual verification changes require shared Source of Truth updates.
- Harness Test Update Gate: when harness rules, workflow docs, validation/status/prepare/start scripts, or CI harness jobs change, decide whether fixture regression tests must be added or updated.
- Push / PR: prefer PR-based integration and record branch, PR link, and merge status in `sync.md`.
- PR Sync Preflight: before PR handoff or PR creation, run `scripts/prepare-pr.sh --check-pr-sync <workspace>` to catch stale or contradictory `sync.md` Push / PR fields.
- PR Conflict Resolution: if GitHub PR conflict, local merge/rebase conflict, unmerged path, or Source of Truth proposal conflict appears, stop PR progression, classify the conflict, record evidence in `sync.md`, and ask for `PR Conflict Confirm` or the matching sync/integration confirm before merge/rebase/push/PR merge continues.
- Pre-PR Human Checkpoint: when local validation passed and push, PR creation, PR handoff, or integration handoff is the next natural action, present a 2-4 option handoff menu before any remote action.
- PR Approval Scope: only a human choice such as `PR 진행`, `PR 생성`, or equivalent authorizes branch push, PR creation, CI/check status follow-up, merge, finalize, or cleanup within the stated scope.
- PR Finalization: after PR merge, run `scripts/prepare-pr.sh --finalize <workspace>` and record final merge/issue close status in `sync.md`; finalize also runs automatic merged branch cleanup.
- Branch Issue Default: `scripts/start-workflow.sh` creates a GitHub issue by default for every branch workspace; use `--no-issue` only as an explicit exception.
- Linked Issue: when a branch maps to a GitHub issue, keep the existing branch/workspace name and record the issue plus PR closing keyword in `sync.md`.
- Branch Switch Checkpoint: when moving from one branch workspace to another with dirty changes, checkpoint commit current branch before switching.
- Branch Switch Confirm: before switching branch workspaces, summarize current branch, target branch, worktree state, uncommitted changes, checkpoint commit expectation, target workspace, and switch reason, then get human confirmation unless the user already gave an explicit switch/phase-start command.
- Remaining Branch Queue: after PR merge/finalize, run or summarize `scripts/list-active-branches.sh` and tell the human whether active local branches, open PR branches, or merged cleanup candidates remain.
- Automatic Merged Branch Cleanup: after successful PR merge/finalize, cleanup local feature branches, remote feature branches, and stale remote-tracking refs that are merged/closed cleanup candidates.
- Cleanup Scope: branch cleanup only changes Git branch refs. It never deletes deploy, AWS, cloud, database, or external resources.
- Cleanup Guard: use `git branch -d` only; if safe local deletion fails, stop and ask before `git branch -D`.
- AI records sync status but does not run pull, merge, rebase, push, PR creation, or PR merge without human confirmation.
- No Auto PR Exception: complete PR-ready branch workspaces still require `Pre-PR Human Checkpoint`; silence or missing approval means local completion only.

## 재발 방지 하네스 규칙

branch/workspace 흐름 중 문제가 발생하면 먼저 문제를 해결한다.
문제 해결 직후 AI는 같은 유형의 재발을 막기 위한 하네스 규칙을 바로 추가하지 않고, 사람에게 아래 내용을 먼저 확인한다.

- 문제 원인 요약
- 재발 방지 규칙 후보
- 적용 위치: 문서, 스크립트, validation, status 중 어디인지
- 예상 부작용 또는 예외 상황

사람이 승인하면 문서와 필요한 스크립트/validation/status를 업데이트한다.
적용 후에는 반드시 아래 흐름 검사를 실행하고 현재 workspace의 `quality.md`, `report.md`, `decisions.md`에 증거를 기록한다.

```bash
scripts/harness-flow-check.sh docs/workflows/<type>/<short-kebab-name>
```

규칙 후보가 현재 branch 범위를 넘으면 `Scope Change Confirm`을 먼저 해결한다.
원격 상태를 바꾸는 작업은 이 흐름 검사에 포함하지 않는다.

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
parallel milestone manifest를 사용하는 작업이면 integration branch workspace는 `.milestones/M*/manifest.yaml`의 scope, dependency, shared contract, merge order를 함께 확인한다.

Run `scripts/validate-harness.sh --integration` before considering an integration branch complete.

독립 milestone은 자기 Phase/branch workspace/PR로 완료될 수 있다.
integration branch/workspace는 항상 필수가 아니며, 둘 이상의 완료 branch를 함께 합쳐 검증해야 할 때만 만든다.
늦는 milestone은 명시적 dependency가 없는 한 다른 독립 milestone의 완료나 PR을 막지 않는다.

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
- Pre-PR Human Checkpoint: local validation passed and push/PR/handoff is the next natural action.
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
3. Classify whether the request needs milestone planning, a provisional milestone, or only a lightweight Phase.
4. Apply Skill Discovery Rule. Use a relevant skill/plugin/tool when clearly useful; otherwise continue with the default workflow.
5. Apply Context Loading Rule.
6. Apply Context Budget Rule: choose Lite Read, Escalate Read, or Audit Read.
7. If a workspace exists, run or summarize `scripts/status-workflow.sh <workspace>` before opening detailed workspace files.
8. Confirm current Phase and branch/work location.
9. Confirm branch workspace exists under `docs/workflows/`.
10. Confirm `confirmations.md` exists and Scope Confirm is ready.
11. Confirm `next-actions.md` exists and has a recommended next action.
12. Confirm `sync.md` exists and Start Sync is recorded or ask for Git Sync Confirm.
13. Confirm `quality.md` exists and TDD/CI expectations are clear or ask for Quality Gate Confirm.
14. Confirm `decisions.md` exists and high-impact choices are recorded or deferred.
15. Confirm no earlier incomplete Phase should be done first.
16. Mark Hotfixes explicitly.
17. Name what is out of scope.
18. Apply Lightweight Execution Rule.
19. Do not invent undocumented requirements.
20. Do not revert unrelated user/previous changes.
21. Check related `docs/06` Regression Guard.
22. Read report context. If `docs/reports/README.md` has a Latest Report Index, read the latest report for the related area first. Otherwise read the previous Phase report and 1-2 relevant reports.

## Phase 공통 완료 게이트

1. Implementation or artifact exists.
2. Tests/build/smoke/manual verification completed. If a local tool/runtime is missing or stopped, readiness check, safe start, fallback attempt, or remaining human action is recorded before skipping the check.
3. Source of Truth Impact Gate completed: `shared-docs.md`, `decisions.md`, `quality.md`, and `report.md` record whether shared Source of Truth impact is `none`, `required`, `applied`, or `deferred`.
4. Harness Test Update Gate completed when harness rules/scripts/CI change.
5. Related docs updated only where needed.
6. Acceptance criteria in `docs/05` checked.
7. Failure Scenario reviewed.
8. Manual Verification result recorded.
9. Phase report created.
10. Human confirmation outcomes recorded where required.
11. Next action menu updated for the human's next choice.
12. `sync.md` records pre-merge sync status or a human-approved reason for deferral.
13. Before PR handoff, `scripts/prepare-pr.sh --check-pr-sync <workspace>` has passed or a reason is recorded.
14. After PR merge, `scripts/prepare-pr.sh --finalize <workspace>` has updated `sync.md` with merged/closed status or a reason is recorded.
15. `quality.md` records TDD status, branch checks, CI status, skipped checks, Source of Truth impact evidence, harness test impact evidence, and CD gate if relevant.
15a. `quality.md` records local tool/runtime readiness evidence when validation depends on Docker, browser runtime, database service, or other local runtime.
16. `decisions.md` records accepted/deferred high-impact decisions and rollback/revisit conditions.
17. For integration branches, `scripts/validate-harness.sh --integration` completed or a human-approved deferral is recorded.
18. Branch workspace `plan.md`, `notes.md`, or `report.md` updated where useful.
19. No scope leak.
20. Final report includes changed files, used skill/plugin/tool, verification, report path, next context, and remaining risks.
21. Final report records Context Budget mode, primary context read, escalated context read, and intentionally omitted context.
22. If local validation passed and the branch workspace is ready for `ready-for-review`/`complete`, or push/PR/handoff is the next natural action, AI presents `Pre-PR Human Checkpoint` before any remote action.

ready/complete workspace는 quality, decision, pre-merge sync 상태를 해결해야 한다. draft/in-progress workspace는 필수 섹션을 유지하는 한 계획 placeholder를 둘 수 있다.

## Source of Truth Impact Gate

Branch 작업 중 아래 변경이 있으면 AI는 완료 전에 shared Source of Truth 영향도를 판정한다.

- API, interface, schema, endpoint, data model, module boundary, architecture layer 변경
- milestone, Phase, 완료 기준, acceptance, regression, manual verification 변경
- 이미 구현된 기능 범위가 기존 문서의 예정, 미정, 후보 표현을 바꾸는 경우
- 팀원이 다음 Phase를 시작할 때 기준으로 삼는 문서와 실제 코드가 달라질 수 있는 경우

판정 결과는 다음 값 중 하나로 기록한다.

- `none`: shared Source of Truth 영향 없음.
- `required`: shared Source of Truth 변경 필요.
- `applied`: 필요한 Source of Truth 문서 변경 완료.
- `deferred`: 현재 범위 밖이라 보류. `decisions.md`에 deferred reason, revisit trigger, target branch/phase를 기록해야 한다.

기록 위치:

- `shared-docs.md`: `Proposed Source Of Truth Changes` 표의 `File` 컬럼에 실제 Source of Truth 문서 경로를 적는다.
- `decisions.md`: 적용 또는 보류 결정을 기록한다.
- `quality.md`: Source of Truth Impact Gate 검증 명령과 결과를 기록한다.
- `report.md`: 최종 반영/보류 요약을 기록한다.

`scripts/validate-harness.sh --strict`는 ready/complete/integration-ready workspace의 `shared-docs.md` 표에 적힌 `docs/...` 파일이 base commit 이후 실제 diff에 포함됐는지 확인한다. 실제 변경하지 않는 경우 `decisions.md`의 deferred decision에 reason, revisit trigger, target branch/phase가 있어야 한다.

Historical report, 과거 workspace 기록, archive 문서는 자동 수정 대상으로 강제하지 않는다. 설명 문장이나 Integration Notes에 등장하는 경로만으로는 Source of Truth proposal로 보지 않고, `Proposed Source Of Truth Changes` 표의 `File` 컬럼만 검사한다.

## Harness Test Update Gate

하네스 규칙, workflow 문서, validation/status/prepare/start 스크립트, CI harness job을 수정하는 branch는 완료 전에 하네스 테스트 영향도를 판정한다.

세부 기준은 `docs/18-harness-regression-policy.md`를 따른다.

- 영향도는 `none`, `required`, `updated`, `skipped`, `deferred` 중 하나로 기록한다.
- 규칙 또는 스크립트 동작이 바뀌면 보통 `scripts/test-harness.sh` fixture regression test를 추가하거나 수정한다.
- 단순 문구 수정이라 테스트가 불필요하면 `quality.md`에 skip reason을 기록한다.
- fixture test가 현재 범위를 넘으면 `decisions.md`에 deferred reason, revisit trigger, target branch/phase를 기록한다.
- 실제 `gh issue create`, push, PR 생성, merge, deploy, AWS 작업은 harness test에서 실행하지 않는다.

## 완료 후 handoff 선택지

Branch workspace가 `ready-for-review` 또는 `complete`에 가까워졌거나, local validation이 통과했고 push/PR/branch handoff/integration handoff가 다음 자연스러운 행동이면, AI는 원격 작업을 실행하기 전에 `Pre-PR Human Checkpoint`를 수행한다.

현재 상태에는 branch 이름, linked GitHub issue, PR closing keyword, local validation 결과, 남은 remote 작업, 외부 실행/배포/cloud approval 필요 여부를 포함한다.

선택지는 이름만 나열하지 않는다.
AI는 각 선택지마다 진행 절차, 선택하면 좋은 상황, 장점, 주의사항 또는 단점, 원격/외부 상태 변경 여부를 함께 설명한다.
현재 branch 상황에 맞지 않는 선택지는 숨기거나 권장하지 않음으로 표시한다.

1. PR 진행
   - 진행 절차: 최종 validation -> branch push -> PR 생성 -> CI 확인 -> CI 통과 시 merge -> linked issue close 확인 -> `scripts/prepare-pr.sh --finalize <workspace>` -> 자동 merged branch cleanup -> finalization 기록 commit/push.
   - 선택하면 좋은 상황: 현재 branch를 main에 반영해도 되고 CI/리뷰 흐름으로 넘길 준비가 된 경우.
   - 장점: 변경이 main에 들어가 다음 Phase가 같은 기준에서 시작된다.
   - 주의사항 또는 단점: 원격 상태가 바뀐다. 사용자가 "PR만 올려줘"라고 하면 PR 생성까지만 하고 merge 전 멈춘다.
   - 원격/외부 상태 변경 여부: push, PR 생성, merge, issue close/finalize, local/remote Git branch cleanup이 포함된다.
2. 추가 보강
   - 진행 절차: AI가 현재 애매한 점이나 보강 여지를 1~5개 제시하고, 선택된 문서/테스트/구현/비용/위험 설명/검증 증거를 보강한 뒤 다시 검증한다.
   - 선택하면 좋은 상황: 테스트 부족, 문서 모호함, 비용 위험, 수동 검증 부족, 다음 Phase 전 계약 모호성이 남은 경우.
   - 장점: PR 품질과 팀 이해도가 올라간다.
   - 주의사항 또는 단점: merge가 늦어진다. 현재 branch 범위를 넘으면 `Scope Change Confirm`을 먼저 해결한다.
   - 원격/외부 상태 변경 여부: 기본 없음. push/PR/deploy가 필요해지면 별도 승인 필요.
3. 다음 Phase
   - 진행 절차: 현재 branch를 먼저 PR/merge할지, 또는 명시적으로 보류할지 확인한 뒤 다음 branch workspace를 만든다.
   - 선택하면 좋은 상황: 현재 branch가 이미 main에 반영됐거나, 보류 이유와 재개 조건이 명확하고 다음 독립 작업을 시작해야 하는 경우.
   - 장점: 다음 작업으로 빠르게 전환할 수 있다.
   - 주의사항 또는 단점: PR-ready branch를 merge하지 않고 다음 Phase로 가면 변경이 main에 없어 중복/충돌 위험이 있다.
   - 원격/외부 상태 변경 여부: 새 branch workspace 생성은 issue 생성이 기본으로 포함된다. branch switch 시 dirty worktree는 checkpoint 규칙을 따른다.
4. 보류
   - 진행 절차: push/PR/merge 없이 멈추고 보류 이유와 재개 조건을 `next-actions.md`에 기록한다.
   - 선택하면 좋은 상황: 리뷰어/팀 결정, 비용/보안 승인, 외부 계정/권한, 일정 조율을 기다리는 경우.
   - 장점: 불완전하거나 위험한 변경을 원격에 올리지 않는다.
   - 주의사항 또는 단점: 오래 방치되면 main과 drift가 생긴다.
   - 원격/외부 상태 변경 여부: 없음.
5. 외부 실행 승인 단계
   - 진행 절차: 관련 approval checklist, 예상 비용, rollback, smoke test, secret/권한 상태를 확인한 뒤 승인된 외부 작업만 실행한다.
   - 선택하면 좋은 상황: AWS resource 생성, deploy, migration, merge train 등 repo 밖 상태를 바꾸는 작업이 남은 경우.
   - 장점: 실제 환경 검증으로 넘어갈 수 있다.
   - 주의사항 또는 단점: 비용, 권한, 운영 리스크가 생긴다.
   - 원격/외부 상태 변경 여부: 있음. 사람 명시 승인 필요.

사람이 `PR 진행`을 명시하면 해당 branch의 push, PR 생성, CI 확인, merge, finalize, linked issue close 확인, merged branch cleanup까지 승인한 것으로 본다.
사람이 `PR 생성만`, `초안 PR`, `PR만 올려줘`, `머지는 보류`라고 제한하면 PR 생성까지만 승인한 것으로 보고 merge/finalize/cleanup 전 다시 멈춘다.
사람이 응답하지 않았거나 명시 승인이 없으면 local validation 완료까지만 보고하고 push/PR/merge를 실행하지 않는다.
단, CI 실패, PR conflict/merge conflict, required review 미충족, scope drift, deploy/AWS resource 생성, 데이터 변경/마이그레이션 같은 추가 위험이 발견되면 멈추고 사람에게 보고한다.
PR conflict가 발견되면 `docs/11-git-sync-policy.md`의 `PR Conflict Resolution Protocol`에 따라 conflict 유형, 감지 명령, 영향 계층, 해결 선택지, 재검증 결과를 `sync.md`, `quality.md`, 필요 시 `shared-docs.md`/`decisions.md`/`report.md`에 기록한다.
사람이 `PR 올리지 마`, `로컬에만 둬`, `보류`, `PR은 나중에`, `draft만`이라고 명시하면 PR 생성을 하지 않는다.
작은 변경이라도 팀 공유 산출물이면 PR을 기본값으로 두되, 개인 초안이나 더 큰 branch에 흡수할 변경은 `Small Change Completion Decision`에 따라 보류 이유를 기록한다.
PR 전에는 included files와 excluded files를 분리하고, `.DS_Store`, 개인 초안, unrelated untracked file은 stage하지 않는다.
추가 보강이 현재 branch 범위를 넘으면 `Scope Change Confirm`을 먼저 해결한다.
다음 Phase로 이동하면 branch switch/checkpoint 규칙을 따른다.
보류를 선택하면 `sync.md`의 `Pre-Merge Sync` 또는 `Push / PR` 섹션에 deferral reason을 기록하고, `next-actions.md`에 보류 이유와 재개 조건을 기록한다.
외부 실행 승인 단계는 관련 approval checklist와 명시 승인을 먼저 확인한다.
deploy, AWS resource 생성/삭제, cloud resource cleanup은 사람의 별도 명시 승인 없이 실행하지 않는다.

## Historical Baseline Milestones

아래 M0~M5 계열 작업은 AskLake가 XFlow 참고 경량 pipeline MVP를 증명하던 시기의 완료 evidence다.
Product Rebaseline 이후에는 미래 제품 목표가 아니라 `Current implementation baseline`으로 취급한다.
새 구현 순서는 위 `Product Rebaseline Queue`의 R0~R7을 따른다.

| Historical milestone | 의미 | 현재 지위 |
| --- | --- | --- |
| M0~M2 | MVP 범위, infrastructure foundation, app/container skeleton 정리 | historical evidence |
| M3~M5 | CSV/local source catalog, minimal pipeline run, demo polish | current implementation baseline |
| M6+ 후보 | XFlow급 장기 확장 후보 | 새 Target MVP와 충돌하지 않는 경우에만 Decision Option Brief 뒤 재평가 |

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

## 내부 단계별 프롬프트

큰 Phase는 하나의 branch workspace 안에서 여러 내부 단계로 나눌 수 있다.
내부 단계는 기본적으로 같은 branch와 같은 workspace에서 진행한다.
단계가 현재 `plan.md` 범위를 넘으면 `Scope Change Confirm`을 먼저 해결한다.
독립 배포, 독립 PR, 독립 ownership이 필요하면 새 branch workspace로 분리한다.

내부 단계별 프롬프트의 기본 저장 위치는 현재 workspace의 `plan.md`다.
섹션 이름은 `## 내부 단계별 프롬프트`를 사용한다.
작은 Phase에서는 이 섹션을 `not needed`로 남겨도 된다.

각 단계는 아래 구조를 따른다.

~~~md
## 내부 단계별 프롬프트

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
~~~

Workspace 파일 역할은 아래처럼 나눈다.

- `plan.md`: Phase 전체 계획, 내부 단계별 프롬프트, 단계별 완료 기준.
- `next-actions.md`: 현재 다음 단계와 사람 선택 메뉴.
- `quality.md`: 단계별 검증 명령과 결과.
- `report.md`: 최종 요약과 남은 위험.
- `decisions.md`: 단계 중 발생한 고영향 결정.
- `shared-docs.md`: Source of Truth 변경 제안.
- `sync.md`: branch, issue, PR, merge 상태.

## Historical Phase Records

아래 Phase 0~M 계열 기록은 이전 하네스 구축과 XFlow 참고 baseline 수립 증거다.
Product Rebaseline 이후 새 작업은 위 `Product Rebaseline Queue`의 R0~R7에서 선택한다.
historical Phase의 프롬프트는 과거 완료 증거로만 읽고, 새 구현 시작점으로 사용하지 않는다.

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

- [x] MVP와 Non-MVP scope가 문서화되어 있다.
- [x] M0~M5 MVP/infrastructure milestone이 문서화되어 있다.
- [x] XFlow는 read-only inspiration으로만 언급된다.
- [x] acceptance, regression, manual verification, workflow 문서가 서로 맞는다.
- [x] Harness validation이 통과한다.

### 완료 증거

- PR: #12
- Issue: #9 CLOSED
- Report: `docs/reports/phase-1-mvp-roadmap.md`

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

- [x] CI workflow 후보가 있다.
- [x] Docker build/run 전략이 있다.
- [x] Kubernetes manifest 또는 Helm 후보가 있다.
- [x] AWS 비용/권한/rollback approval gate가 기록되어 있다.
- [x] Secret이 commit되지 않았다.
- [x] Harness validation이 통과한다.

### 완료 증거

- PR: #13
- Issue: #10 CLOSED
- Report: `docs/reports/phase-2-infrastructure-foundation.md`
- CI evidence: harness, container smoke, and manifest smoke checks passed before merge.

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
