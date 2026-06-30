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
`docs/08`은 요청이 milestone인지 lightweight Phase인지 분류하고, 실제 실행은 branch workspace로 보낸다.

- Milestone이 필요한 경우: 사용자 가치 묶음, 여러 Phase, 공유 API/schema/data/shared docs, 출시 기준, 또는 병렬 가능성이 있다.
- Lightweight Phase로 충분한 경우: 오타, 작은 문서/설정/copy 수정, 단일 파일의 명백한 버그, 범위가 작고 의존성이 거의 없는 변경이다.
- 전체 계획이 불명확하면 provisional milestone로 지금 필요한 첫 Phase만 얇게 기록한다.
- 병렬 worktree/thread, manifest, milestone ownership, integration order는 `docs/17-parallel-milestone-protocol.md`를 따른다.
- 고영향 선택은 `docs/14-decision-option-brief.md`를 따른다.

Provisional milestone 최소 기록:

- milestone ID 또는 provisional ID
- 사용자 가치
- 지금 시작할 Phase
- 포함 범위와 제외 범위
- 공유 API/schema/data/shared docs 위험
- 완료 기준
- 후속 질문 또는 재검토 trigger

Milestone planning은 기존 Phase Workflow와 branch workspace를 대체하지 않는다.
작은 hotfix나 단일 파일 수정은 정식 milestone 없이 Phase Workflow로 처리할 수 있다.

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
이 checkpoint는 이미 Git이 추적 중인 파일의 수정/삭제만 자동으로 포함한다.
untracked file, `.DS_Store`, 개인 초안, editor artifact는 자동 checkpoint에 포함하지 않고 목록으로 보고한다.
새 파일을 현재 branch checkpoint에 포함해야 하면 branch 전환 전에 사람이 명시적으로 stage/commit하거나 범위를 확정해야 한다.
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
GitHub Issue / Project / PR 같은 원격 운영 상태를 직접 보정했고 그 보정이 하네스 스크립트, 문서, 또는 검증 규칙으로 재현 가능하게 반영된 경우도 팀 공유 산출물이므로 자동 PR 대상이다.
이 경우 workspace evidence에는 `Remote operations reconciliation` 또는 동등한 한국어 기록으로 어떤 원격 상태를 바꿨고 어떤 하네스 변경으로 재현성을 확보했는지 남긴다.

로컬 보류를 선택할 수 있는 경우는 개인 메모, throwaway 초안, 곧 더 큰 branch에 흡수할 변경, 사람의 문체/방향 검토가 남은 문서, 검증이 끝나지 않은 작업이다.
로컬 보류는 이유와 재개 조건을 `sync.md`와 `next-actions.md`에 기록한다.

PR 전에 AI는 포함 파일과 제외 파일을 분리해 보고한다.
`.DS_Store`, 개인 초안, unrelated untracked file, 다른 workstream 파일은 stage하지 않는다.
작은 변경 완료 뒤 PR 여부가 애매하면 `docs/10-next-action-menu.md`의 `Small Change Completion Decision`을 사용한다.
여기서 `PR 진행`을 고르는 것은 팀 공유 산출물로 PR-ready 경로를 탄다는 뜻이며, readiness와 stop condition이 clear이면 feature branch push와 PR 생성까지 자동 진행할 수 있다.
merge, finalize, cleanup 같은 후속 remote/ref 변경은 PR 생성 뒤 `Pre-PR Human Checkpoint`에서 사람이 `PR 진행`, `merge 진행`, 또는 동등한 명시 승인을 한 뒤에만 실행한다.

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

이 신뢰 루프의 입력은 단순 조회용 샘플이 아니라 대용량/복합 데이터셋 조작 흐름이다.
Target MVP는 local/container 환경에서 schema inference/user override, transform 또는 normalize, Parquet/S3-compatible output, row count/bytes/duration, SQL 검산 evidence를 남기는 경로를 우선 확인한다.

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
| R7 | Packaging, `feature/packaging-dev-lite` | local/container 또는 dev-lite packaging 프로파일 안정화 | 배포 target decision | local/container 또는 dev-lite smoke와 secret/config 검증 |

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

## Data Integration UX Rebuild Queue

상태: Superseded.

회의 피드백에 따라 데이터 통합 화면은 AskLake 데모의 주 무대로 다룬다.
먼저 화면을 비우고, XFlow의 기본 생성 흐름을 read-only reference로 삼아 `Source -> Transform -> Target -> Run`을 작은 확인 단위로 다시 쌓는다.
각 Phase는 독립 확인 가능해야 하며, 이전 Phase를 사람이 확인한 뒤 다음 Phase를 시작한다.

2026-06-29 논의 결과, 이 큐는 generic pipeline/job 생성 흐름으로 보이는 문제가 있어 `Dataset Creation UX Reframe Queue`로 대체한다.
이미 생성/구현된 `data-integration-*` workspace는 삭제하지 않고 prototype evidence로 보존한다.
아직 구현 전이던 `feature/data-integration-review-run-step`은 보류하고, target dataset 생성의 Review/Scheduling Phase로 재구성한다.

| 순서 | Branch / workspace | 목표 | 선행 조건 | 완료 기준 |
| --- | --- | --- | --- | --- |
| A | `feature/data-integration-screen-reset` | 데이터 통합 화면의 보조 컨테이너와 내부 placeholder를 걷어내고 최소 진입점만 남긴다 | 사람의 데이터 통합 UX 재구성 결정 | 화면 목적이 "파이프라인을 만드는 곳"으로 보이고 다른 nav/API/schema 변경이 없음 |
| B-1 | `feature/data-integration-flow-skeleton` | `Source -> Transform -> Target -> Run` 4단계 skeleton을 카드/stepper로 표시한다 | A 완료 또는 사람 확인 | 4단계 순서와 상태 label이 보이고 실제 동작은 아직 약속하지 않음 |
| B-2 | `feature/data-integration-source-step` | Source step에서 source를 선택하고 Source 카드 상태에 반영한다 | B-1 완료 또는 사람 확인 | source 선택/empty state/schema preview 자리가 확인됨 |
| B-3 | `feature/data-integration-transform-step` | Transform step에 `Select Fields` 컬럼 선택 UX를 추가한다 | B-2 완료 또는 사람 확인 | 선택 컬럼이 Transform 카드에 요약되고 추가 transform은 제외됨 |
| B-3.5 | `feature/data-integration-wizard-flow` | 데이터 통합 화면을 AWS 설정 wizard처럼 한 번에 한 단계만 보이는 흐름으로 보완한다 | B-3 완료 또는 사람 확인 | Source 선택 -> Transform 설정 -> 뒤로가기/다음 흐름이 확인되고 기존 Source/Transform 기능이 유지됨 |
| B-4 | `feature/data-integration-target-step` | Target step에 `target_name` 입력을 추가한다 | B-3.5 완료 또는 사람 확인 | 결과 dataset 이름이 Target 카드와 Review 준비 상태에 반영됨 |
| B-5 | `feature/data-integration-review-run-step` | Review & Run에서 기존 pipeline create/run API를 호출하고 최소 실행 결과를 표시한다 | B-4 완료 또는 사람 확인 | validation, create/run, status/row count/result location 또는 error 표시가 확인됨 |

범위 원칙:

- XFlow는 UX 구조 참고용이며 코드를 복사하지 않는다.
- full visual canvas, schedule, permission, lineage, CDC, streaming은 이 큐의 초기 범위가 아니다.
- 상세 evidence panel, Catalog deep integration, Week2 workflow 연결은 B-5 이후 별도 Phase로 판단한다.
- 각 Phase는 `docs/workflows/feature/data-integration-*/plan.md`를 기준으로 실행하고 report와 quality evidence를 남긴다.

## Dataset Creation UX Reframe Queue

상태: Superseded by `Dataset Creation IA Reframe Queue`.

데모의 주 화면은 "데이터 통합"이 아니라 "데이터셋" 관리와 생성으로 재정의한다.
`데이터셋 생성`을 누르면 먼저 Source Dataset과 Target Dataset 중 하나를 고르고, 이후 각 dataset type에 맞는 짧은 wizard로 이동한다.
Target Dataset 생성은 XFlow처럼 source를 선택하고 process/schedule/review를 거쳐 output dataset과 ETL job definition을 함께 준비하는 흐름으로 표현한다.

2026-06-29 논의 결과, 이 큐는 외부 데이터 연결 설정 단계가 빠져 Source Dataset 생성이 이미 등록된 데이터셋을 다시 고르는 것처럼 보이는 문제가 있었다.
기존 `D-*` workspace는 구현 evidence로 보존하되, 후속 작업은 아래 `R-*` 큐를 기준으로 진행한다.

| 순서 | Branch / workspace | 목표 | 선행 조건 | 완료 기준 |
| --- | --- | --- | --- | --- |
| D-1 | `feature/dataset-section-reframe` | nav/page title/empty copy를 `데이터셋` 중심으로 바꾸고 pipeline wording을 줄인다 | 기존 transform output preview 확인 | 화면 목적이 dataset 관리와 생성으로 읽히고 기존 source/transform demo state가 깨지지 않음 |
| D-2 | `feature/dataset-create-type-choice` | `데이터셋 생성` 버튼에서 Source Dataset / Target Dataset 선택 modal을 연다 | D-1 완료 또는 사람 확인 | 두 선택지가 보이고 선택 후 각 wizard mode로 진입할 수 있음 |
| D-3 | `feature/source-dataset-create-wizard` | Source Dataset 생성 3단계 wizard를 추가한다: 데이터 소스 선택, Configure, Review | D-2 완료 또는 사람 확인 | CSV/Kafka/PostgreSQL/MongoDB/API/S3 같은 source type 선택과 configure/review 흐름이 확인됨 |
| D-4 | `feature/target-dataset-create-wizard-reframe` | 기존 generic flow를 Target Dataset 생성으로 재구성한다: Overview, Source 선택, Process | D-2 완료 또는 사람 확인 | target dataset 이름/설명, source 선택, field/process preview가 한 흐름으로 보임 |
| D-5 | `feature/target-dataset-scheduling-review` | Target Dataset 생성에 Scheduling과 Review를 추가한다 | D-4 완료 또는 사람 확인 | schedule 기본값과 최종 review summary가 보이며 실제 backend 실행은 약속하지 않음 |

범위 원칙:

- 기존 `data-integration-*` 구현은 재사용 가능한 UI 재료로만 취급한다.
- Source Dataset 생성은 connector 등록/metadata draft 시나리오이며 실제 credential 저장, 연결 테스트, backend schema 변경은 제외한다.
- Target Dataset 생성은 output dataset과 ETL job definition을 준비하는 demo 시나리오이며 즉시 실행, run history, lineage, permission은 제외한다.
- 각 Phase는 작게 구현하고, 사람이 화면을 확인한 뒤 다음 Phase로 진행한다.

## Dataset Creation IA Reframe Queue

데이터셋 생성 구조는 `External Connection -> Source Dataset -> Target Dataset` 순서로 재정의한다.
External Connection은 외부 원천에 접속하기 위한 연결 설정이고, Source Dataset은 등록된 연결에서 raw/source table을 만드는 정의이며, Target Dataset은 Source Dataset을 가공해 output dataset과 ETL job definition을 준비하는 흐름이다.

| 순서 | Branch / workspace | 목표 | 선행 조건 | 완료 기준 |
| --- | --- | --- | --- | --- |
| R-1 | `feature/dataset-creation-ia-reframe` | `데이터셋 생성` 선택지를 External Connection / Source Dataset / Target Dataset 3개로 재정의하고 화면 문구를 맞춘다 | 현재 PR 화면 또는 사람 확인 | 세 생성 유형의 역할이 구분되고, 기존 Source/Target 플로우는 아직 깊게 재작성하지 않음 |
| R-2 | `feature/external-connection-create-wizard` | External Connection 생성 wizard를 추가한다: connector type, configure, review | R-1 완료 또는 사람 확인 | CSV/Kafka/PostgreSQL/S3/API 같은 외부 연결 설정 demo flow가 보이며 credential 저장/API 호출은 없음 |
| R-3 | `feature/source-dataset-from-connection-wizard` | Source Dataset 생성 wizard를 등록된 External Connection 기반으로 보정한다: connection 선택, raw dataset configure, review | R-2 완료 또는 사람 확인 | 이미 등록된 Source Dataset 카드가 아니라 External Connection을 선택해 raw/source dataset을 만드는 구조로 보임 |
| R-4 | `feature/target-dataset-job-alignment` | Target Dataset 생성 wizard 문구와 review를 ETL job definition 중심으로 정렬한다 | R-3 완료 또는 사람 확인 | Source Dataset 선택 -> process -> scheduling -> target dataset + ETL job 요약이 일관되게 보임 |

범위 원칙:

- External Connection은 연결 설정 demo이며 실제 secret, credential 저장, 연결 테스트는 제외한다.
- Source Dataset은 데이터 레이크 raw/source 영역에 저장되는 원본 데이터셋 정의로 표현한다.
- Target Dataset은 Source Dataset 기반의 가공 결과와 ETL job definition을 함께 준비하는 demo 시나리오로 표현한다.
- 기존 `D-*` 구현은 R-1 이후 재사용 가능한 UI 재료로만 취급하고, 잘못된 개념 문구는 각 R Phase에서 제거한다.
- 각 Phase는 독립 확인 가능해야 하며, 사람이 화면을 확인한 뒤 다음 Phase로 진행한다.

## Dataset Module Connection Queue

상태: Ready after PR #284 merge or explicit human confirmation to stack on current branch.

`R-*` 큐가 정리한 draft UX를 실제 AskLake module 계약에 연결한다.
연결 순서는 `External Connection/SourceConnection alignment -> Source Dataset persistence -> Target Dataset + ETL Job draft -> M5 Run -> M2/M4 runtime evidence -> M3 CatalogMetadata -> M6 AI Query context`로 둔다.

| 순서 | Branch / workspace | 목표 | 선행 조건 | 완료 기준 |
| --- | --- | --- | --- | --- |
| C-1 | `feature/external-connection-persistence` | External Connection UI를 기존 `SourceConnection` / `SourceConfig.connection_ref` 계약에 맞추고 필요한 최소 persistence/API 범위를 확정한다 | PR #284 merge 또는 사람 확인 | UI의 External Connection이 새 독립 개념이 아니라 Source Connector 계약의 표시명임이 문서화되고, 구현 범위가 secret 저장 없이 정렬됨 |
| C-2 | `feature/source-dataset-persistence` | 등록된 External Connection에서 Source Dataset 생성/목록 API를 연결한다 | C-1 완료 또는 사람 확인 | Source Dataset이 connection id, raw scope, schema preview draft를 가진 metadata로 저장/조회됨 |
| C-2.5 | `feature/target-dataset-multi-source-processing` | Target Dataset 생성 wizard를 Product Health 시나리오에 맞게 multi-source 선택과 processing recipe 중심으로 보정한다 | C-2 완료 또는 사람 확인 | 2개 이상 Source Dataset 선택, primary/enrichment 구분, Join/Aggregate/Enrich/Score/Select recipe, runner handoff 요약이 보임 |
| C-3 | `feature/target-dataset-job-draft` | Target Dataset과 ETL job definition draft 저장을 연결한다 | C-2 완료 또는 사람 확인 | Target Dataset review 결과가 source reference, Silver outputs, process, Handoff/Run, schedule, job definition draft로 저장됨 |
| C-3.5 | `feature/dataset-draft-overview` | 저장된 External Connection / Source Dataset / Target Dataset draft 목록을 데이터셋 화면에서 확인한다 | C-3 완료 또는 사람 확인 | 데이터셋 시작 화면에서 draft count와 최근 저장 항목을 확인하고 새로고침할 수 있음 |
| C-3.6 | `feature/data-navigation-reframe` | 좌측 메뉴를 연결 / 데이터셋 / 작업 / 실행 기록 / 데이터 카탈로그 / AI Query로 재정리하고 데이터셋/작업 하위 메뉴를 분리한다 | C-3.5 완료 또는 사람 확인 | 연결, 실행 기록, 데이터 카탈로그, AI Query는 단일 페이지로 이동하고, 데이터셋은 Source/Silver/Gold, 작업은 Connection Sync/Silver Transform/Gold Build 하위 메뉴로 펼쳐짐 |
| C-4 | `feature/target-dataset-run-handoff` | 저장된 Gold Build Job definition을 Job Run handoff record로 넘긴다 | C-3.6 완료 또는 사람 확인 | Gold Build Job에서 queued run record를 만들고 실행 기록에서 조회할 수 있음 |
| C-4.5 | `feature/local-runner-materialization` | queued Gold Build Job Run을 local runner로 실행해 Silver/Gold 파일 evidence를 만든다 | C-4 완료 또는 사람 확인 | 실행 기록에서 Local 실행 후 succeeded status, output path, row count, bytes, Silver output paths가 확인됨 |
| C-5 | `feature/runtime-evidence-integration` | local materialization run에 source-level/runtime evidence shape를 연결한다 | C-4.5 완료 또는 사람 확인 | Job Run에 row count, bytes, duration, output path, source evidence, runtime evidence가 일관되게 남음 |
| C-6 | `feature/catalog-metadata-integration` | 실행 결과를 M3/M5 CatalogMetadata로 등록하고 데이터 카탈로그 화면에 반영한다 | C-5 완료 또는 사람 확인 | CatalogMetadata가 schema, storage, metrics, lineage, SQL allowlist context를 제공함 |
| C-7 | `feature/ai-query-dataset-context` | M6 AI Query가 CatalogMetadata와 Target Dataset context를 읽어 질문/SQL 결과를 만든다 | C-6 완료 또는 사람 확인 | AI Query가 선택된 dataset context로 read-only SQL/evidence 결과를 표시함 |
| C-7.5 | `feature/ai-query-live-catalog-readiness` | AI Query readiness panel을 live CatalogDataset 기준으로 보정한다 | C-7 완료 또는 사람 확인 | publish된 Gold Dataset이 있으면 readiness가 fixed Product Health catalog가 아니라 live catalog id/path/schema/lineage를 표시함 |
| C-8 | `feature/connection-sync-schedule` | External Connection에 ingestion/sync schedule metadata를 추가해 연결 스케줄과 processing job 스케줄의 경계를 정리한다 | C-7.5 완료 또는 사람 확인 | Connection은 `sync_mode`/`sync_schedule`을 표시하고, 작업 메뉴는 Connection Sync/Silver/Gold Jobs 경계를 구분함 |
| C-9 | `feature/source-dataset-detail-manage` | Source Dataset 목록에서 상세 정보 확인, 수정, 삭제를 가능하게 한다 | C-8 완료 또는 사람 확인 | Source Dataset detail에서 connection, raw scope, schema preview, created/updated metadata를 확인하고 edit/delete flow가 보임 |
| C-10 | `feature/silver-dataset-creation` | Source Dataset에서 Silver Dataset을 독립 생성/저장하는 흐름을 추가한다 | C-9 완료 또는 사람 확인 | Source Dataset을 선택해 standardize/validate rule과 output name을 가진 Silver Dataset metadata를 만들고 Silver 목록에서 확인함 |
| C-11 | `feature/gold-input-silver-alignment` | Gold Dataset 생성 입력을 Source Dataset 직접 선택에서 Silver Dataset 선택으로 보정한다 | C-10 완료 또는 사람 확인 | Gold Dataset wizard가 Silver Dataset을 입력으로 받고, 기존 source 기반 자동 silver_outputs 의존을 제거 또는 호환 처리함 |
| C-12 | `feature/job-schedule-management` | Jobs 화면에서 schedule만 빠르게 수정하고 전체 definition 수정과 분리한다 | C-11 완료 또는 사람 확인 | Connection Sync/Silver Transform/Gold Build Jobs에서 schedule edit action이 보이고, connection/source/recipe/schema 수정은 Connection 또는 Dataset edit flow로 안내됨 |
| C-13 | `feature/dataset-management-actions` | Connection/Silver/Gold 목록 관리 액션과 Jobs -> Dataset 편집 직접 진입을 보강한다 | C-12 완료 또는 사람 확인 | Connection/Silver/Gold 목록에서 상세/수정/삭제가 보이고, Job의 Dataset 편집은 해당 dataset edit flow를 바로 연다 |
| C-14 | `feature/external-connection-local-discovery` | External Connection이 local file/folder를 실제 검사해 schema/sample/bytes를 표시한다 | C-13 완료 또는 사람 확인 | local_file/local_folder 검사 결과가 mock이 아니라 실제 파일 evidence로 표시되고, missing path는 차단됨 |
| C-15 | `feature/product-health-prepared-dataset-link` | Product Health 원천별 External Connection을 Source Dataset 생성 흐름에 연결한다 | C-14 완료 또는 사람 확인 | Amazon/MEP/Behavior/Taxi connection 선택 시 canonical Source Dataset 이름과 raw scope가 추천되고 저장됨 |
| C-16 | `feature/file-backed-dataset-detail` | Source/Silver/Gold 상세에서 metadata-only와 file-backed dataset을 구분한다 | C-15 완료 또는 사람 확인 | 실제 local path, bytes, schema/row evidence가 보이고 missing file은 성공처럼 표시하지 않음 |
| C-17 | `feature/gold-build-local-materialization-alignment` | Gold Build Job의 local demo materialization과 prepared Gold output 참조 경계를 정리한다 | C-16 완료 또는 사람 확인 | prepared Gold parquet/catalog와 local demo output이 구분되고 Catalog/AI Query 연결이 검증됨 |
| C-18 | `feature/kafka-replay-evidence-ui` | Kafka replay evidence 조회 API와 계약을 UI에 표시한다 | C-17 완료 또는 사람 확인 | Kafka replay health/run evidence가 표시되며 실제 consume trigger는 제외됨 |
| C-19 | `feature/airflow-trigger-readiness` | Airflow DAG trigger 가능 상태와 local fallback 경계를 UI에 표시한다 | C-17 완료 또는 사람 확인 | env missing/configured 상태와 fallback 여부가 명확히 보임 |
| C-20 | `feature/spark-runner-readiness` | Spark runner local smoke와 distributed Spark 실행 경계를 UI에 표시한다 | C-17 완료 또는 사람 확인 | `spark_runner`의 local_file 제한과 cluster 미설정 상태가 오해 없이 표시됨 |
| C-21 | `feature/catalog-dataset-management-boundary` | registered CatalogDataset 수정/삭제 범위를 결정하고 후속 구현 경계를 만든다 | C-17 완료 또는 사람 확인 | metadata-only/delete/cascade/file delete 정책이 분리되어 문서화됨 |
| C-22 | `feature/credential-secret-connection-design` | DB/S3 credential 연결을 secret_ref 기반으로 설계한다 | C-14 완료 또는 사람 확인 | 실제 secret 값을 저장하지 않는 UI/API/guardrail 설계가 정리됨 |
| C-23 | `feature/runtime-connection-verification-report` | Kafka/Airflow/Spark/MinIO/PostgreSQL/MongoDB local runtime 검수 결과를 Phase evidence로 고정한다 | C-18~C-22 완료 또는 사람 확인 | 실제 runtime smoke와 AskLake API blocked gap이 `가능/readiness only/blocked`로 정리됨 |
| C-24 | `feature/runtime-status-surface-decision` | `/runs`는 공통 run log로 유지하고 Airflow/Spark/Kafka readiness 위치를 별도 진단/운영 상태 surface로 재결정한다 | C-23 완료 또는 사람 확인 | `runs-runtime-panel-restore`는 superseded로 표시되고, `/runs` compact log와 runtime readiness 분리 원칙이 문서화됨 |
| C-25 | `feature/external-connection-runtime-checks` | PostgreSQL/MongoDB/S3/Kafka External Connection test API를 secret_ref 방식으로 추가한다 | C-24 완료 또는 사람 확인 | raw credential 저장 없이 connector별 connection test가 통과하고 redaction evidence가 남음 |
| C-25A | `feature/external-connection-wizard-runtime-test-ux` | 연결 생성 wizard 안에 connector별 입력 폼과 연결 테스트를 재배치한다 | C-25 완료 또는 사람 확인 | 연결 생성 중 DB/S3/Kafka credential/resource 입력과 connection test가 가능하고 raw credential 저장 없이 review로 이어짐 |
| C-26 | `feature/source-dataset-runtime-discovery` | External Connection 상태와 Source Dataset schema discovery/review 흐름을 연결한다 | C-25A 완료 또는 사람 확인 | local discovery는 실제 schema/sample/bytes를 표시하고 DB/S3/Kafka는 지원 범위가 명확히 보임 |
| C-26B | `feature/runtime-connector-schema-discovery` | PostgreSQL/MongoDB/S3/Kafka에서 지정한 table/collection/object/topic의 lightweight schema discovery를 수행한다 | C-26 완료 또는 사람 확인 | runtime connector도 sample/schema evidence로 Source Dataset metadata를 생성할 수 있음 |
| C-26C | `feature/source-dataset-ingest-snapshot` | Source Dataset에서 실제 row/object/message를 raw snapshot으로 materialize하고 evidence를 남긴다 | C-26B 완료 또는 사람 확인 | Source Dataset 생성과 실제 ingest/snapshot이 분리되고 row count/bytes/output path가 남음 |
| C-27 | `feature/silver-dataset-runtime-materialization` | Source Dataset에서 Silver Dataset local materialization을 실행하고 evidence를 남긴다 | C-26C 완료 또는 사람 확인 | Silver output path, row count, bytes, schema/validation evidence가 detail에 표시됨 |
| C-28 | `feature/gold-dataset-runtime-materialization` | Silver Dataset 입력으로 Gold Dataset을 생성하고 local + MinIO output evidence를 기록한다 | C-27 완료 또는 사람 확인 | Gold output local path와 S3-compatible object URI, metrics, recipe evidence가 run에 남음 |
| C-28A | `feature/data-lake-storage-alignment` | Source/Silver/Gold runtime output을 `data/lake/bronze|silver|gold` 경로로 정렬한다 | C-28 완료 또는 사람 확인 | UI의 Data Lake 표현과 실제 local artifact path가 Bronze/Silver/Gold 레이어로 일치함 |
| C-29 | `feature/jobs-runs-runtime-integration` | local runner/Airflow/Spark executor 결과를 공통 Run record로 정렬한다 | C-28A 완료 또는 사람 확인 | Jobs definition과 Runs execution evidence가 분리되고 executor별 result artifact가 조회됨 |
| C-30 | `feature/catalog-ai-query-runtime-e2e` | runtime Gold output을 CatalogDataset에 등록하고 AI Query가 live catalog를 읽게 한다 | C-29 완료 또는 사람 확인 | Gold CatalogDataset이 schema/storage/lineage/evidence를 제공하고 AI Query가 read-only SQL 결과를 반환함 |
| C-31 | `feature/deep-browser-runtime-e2e` | External Connection부터 AI Query까지 브라우저 deep E2E를 검수한다 | C-30 완료 또는 사람 확인 | 전체 데모 흐름이 console error 없이 진행되고 남은 UI/API mismatch가 Hotfix/후속 Phase로 분류됨 |
| C-32 | `feature/ai-query-result-persistence` | AI Query 결과를 페이지 이동 후에도 유지해 review loop를 끊기지 않게 한다 | C-31 완료 또는 사람 확인 | Query 실행 후 Catalog/Run으로 이동했다가 돌아와도 질문, 답변, evidence가 복원됨 |

범위 원칙:

- PR #284의 화면 구조가 기준선이다. 연결 Phase는 UX를 다시 크게 바꾸지 않는다.
- C-1에서 External Connection은 UI 용어이고 contract boundary는 `SourceConnection` / `SourceConfig.connection_ref`로 둔다. 실제 credential secret 저장, 연결 테스트, production connector 실행은 제외한다.
- C-2에서 ingest/run 실행은 제외하고 Source Dataset metadata 저장까지만 닫는다.
- C-2.5에서 Airflow는 실제 실행 완료가 아니라 handoff 선택지와 경계 설명으로만 표시한다. Airflow 서버 기동, DAG trigger, job draft persistence는 제외한다.
- C-3에서 ETL job은 draft definition까지 저장하고 실행은 C-4 이후로 넘긴다. 저장 payload는 `base_source_ref`, `target_grain`, `source_refs[]`, `silver_outputs[]`, `processing_recipes[]`, `executor_handoff`, `schedule`, `schema_preview`를 포함한다.
- C-3 UI는 `Process -> Handoff/Run -> Scheduling -> Review`로 분리한다. `Handoff/Run`은 `executor_handoff` metadata를 저장하는 단계이며 Airflow DAG trigger, runner 실행, run status polling은 C-4 이후 범위다.
- C-3.5는 저장된 draft의 확인성을 높이는 UI 단계다. 상세 실행, 삭제, 수정, run 생성은 포함하지 않고 C-4의 실행 대상 선택 전 단계로 둔다.
- C-3.6은 C-3.5의 단일 `저장된 Draft 현황`을 최종 IA로 키우지 않고 메뉴/페이지를 분리한다. `연결`, `실행 기록`, `데이터 카탈로그`, `AI Query`는 단일 페이지이고, `데이터셋`과 `작업`만 하위 메뉴를 가진다. 새 backend API, Airflow trigger, Job Run 생성은 제외한다.
- C-4는 Job Run record 생성/조회까지만 포함한다. Airflow trigger, local/spark runner 실행, Silver/Gold materialization, CatalogMetadata publish는 C-4.5 이후 범위다.
- C-4.5는 `local_runner`에 한해 계획된 Silver/Gold JSONL evidence를 남기고 Job Run에 output path, row count, bytes를 기록한다. C-28A 이후 새 runtime artifact는 `data/lake/silver|gold` 아래 저장한다. Airflow/Spark 실행, 대용량 실제 처리, CatalogMetadata publish는 제외한다.
- C-5는 C-4.5 결과에 `duration_ms`, `source_evidence[]`, `runtime_evidence`를 추가한다. M4 Kafka replay와 M2 5GB batch의 실제 통합은 후속 보강으로 남기되, run evidence shape는 이 Phase에서 맞춘다.
- C-6은 `succeeded` Job Run만 CatalogDataset으로 publish하고 `lineage`, `metrics`, `storage`, `runtime_evidence`, `source_evidence`를 연결한다. AI Query context 소비, SQL allowlist 세부 생성, Airflow/Spark 실제 실행은 C-7 이후로 넘긴다.
- C-7은 publish된 Target Dataset CatalogDataset을 M6 AI Query의 CatalogSource 후보로 연결한다. 실제 RAG 추가, 자연어 goal 추천, multi-step 자동 recipe 생성은 포함하지 않는다.
- C-7.5는 AI Query 화면의 readiness 표시를 live CatalogDataset으로 보정한다. Query backend, SQL planner, RAG, 새 API는 추가하지 않는다.
- C-8은 External Connection의 schedule을 ingestion/sync schedule로 표현하고, Target Dataset/Jobs의 schedule은 processing/build schedule로 유지한다. 실제 scheduler 등록, Source Sync Jobs 메뉴 추가, sync run 실행은 포함하지 않는다.
- C-9는 Source Dataset 관리성 보강이다. Source Dataset을 실제 row ingest 대상으로 바꾸거나 Silver/Gold 생성 로직을 수정하지 않는다.
- C-10은 Silver Dataset을 독립 metadata로 저장하는 단계다. Spark/Airflow materialization과 Gold wizard 전환은 포함하지 않는다.
- C-11은 Gold wizard의 입력 경계를 Silver Dataset으로 맞추는 단계다. Silver 생성 자체와 Job schedule 수정은 각각 C-10/C-12 범위로 분리한다.
- C-12는 Jobs 화면에서 schedule만 빠르게 수정하는 관리 Phase다. source/recipe/schema 같은 전체 definition edit는 Dataset edit flow로 남기고, 실제 scheduler 실행은 포함하지 않는다.
- C-13은 Connection/Silver/Gold 목록의 metadata 관리 액션을 Source Dataset 수준으로 맞춘다. 삭제는 metadata-only이고 참조 중인 row는 차단한다. registered CatalogDataset은 상세만 다루고 수정/삭제하지 않는다.
- C-14는 local file/folder discovery만 실제 연결한다. DB/S3/Kafka credential 연결, Kafka consume, Airflow/Spark 실행은 제외한다.
- C-15는 준비된 Product Health dataset inventory와 evidence mismatch를 UI에 연결한다. Kaggle ecommerce evidence가 남아 있어도 현재 raw CSV가 없으면 `mismatch/missing`으로 표시한다.
- C-16은 Dataset detail의 file-backed evidence 표시 단계다. 실제 파일 삭제와 대용량 row preview는 포함하지 않는다.
- C-17은 prepared Product Health Gold output과 local demo materializer의 경계를 맞춘다. 대용량 ETL 신규 실행은 포함하지 않는다.
- C-18은 Kafka replay evidence 조회 전용이다. 실제 Kafka topic consume/produce trigger는 M4 정보와 broker/topic/source file이 확인된 뒤 별도 Phase로 둔다.
- C-19는 Airflow readiness/fallback 표시 전용이다. 실제 DAG 성공은 Airflow URL, DAG id, credential, result artifact path가 제공될 때만 진행한다.
- C-20은 Spark runner readiness 표시 전용이다. distributed Spark cluster 실행은 master/cluster evidence가 제공된 뒤 별도 Phase로 둔다.
- C-21은 registered CatalogDataset 관리 정책 결정 단계다. 실제 output file 삭제나 cascade delete는 사람 확인 전 실행하지 않는다.
- C-22는 secret_ref 설계 단계다. DB/S3 실제 credential 값은 저장/commit/logging하지 않는다.
- C-23은 runtime이 실제로 떠 있고 CLI smoke가 성공했다는 evidence를 고정하는 문서 Phase다. 이 Phase만으로 AskLake connector runtime이 구현됐다고 보지 않는다.
- C-24는 `/runs`를 compact common run log로 유지하기 위해 기존 readiness/evidence panel 복구 계획을 supersede한다. Airflow/Spark/Kafka readiness는 `/runs` 첫 화면에 다시 넣지 않고, 필요하면 별도 진단/운영 상태 surface로 분리한다. trigger 버튼이나 실행 API를 새로 추가하지 않는다.
- C-25는 connection test까지만 다룬다. schema discovery, row read, object ingest, Kafka replay trigger는 각 후속 Phase로 분리한다.
- C-25A는 C-25의 backend runtime test를 실제 연결 생성 UX 안으로 옮기는 frontend 보완 Phase다. 새 secret backend를 만들지 않고 raw credential 저장을 금지한다.
- C-26은 Source Dataset review와 discovery 연결 단계다. DB/S3/Kafka가 connection test만 가능한 경우 schema discovery 완료로 표시하지 않는다.
- C-26B는 runtime connector의 lightweight schema discovery만 다룬다. Postgres는 지정 table, Mongo는 지정 collection, S3는 지정 sample object, Kafka는 지정 topic의 sample message만 읽는다. full ingest, 대용량 scan, continuous consume은 제외한다.
- C-26C는 Source Dataset 생성 이후의 raw ingest/snapshot 실행 단계다. 실제 row/object/message를 local raw zone 또는 MinIO raw zone에 저장하고 evidence를 남기되, Silver/Gold 변환은 C-27 이후로 둔다.
- C-27은 Silver local materialization을 닫는다. Spark distributed execution과 streaming ingest는 기본 경로로 승격하지 않는다.
- C-28은 Gold local materialization과 MinIO/S3-compatible upload evidence를 닫는다. AWS S3 production profile, Spark direct S3A write, Catalog publish는 제외한다.
- C-28A는 C-26C/C-27/C-28에서 생긴 runtime artifact 경로를 `data/lake/bronze`, `data/lake/silver`, `data/lake/gold`로 정렬한다. 실제 object storage upload는 여전히 `not_uploaded` evidence로 분리한다.
- C-29는 Jobs/Runs runtime record 정렬이다. `local_runner`는 실제 execution evidence로 남기고, Airflow/Spark는 trigger 없이 `ready_to_run`/`readiness_only` evidence로 남긴다. Airflow scheduler 운영화, retry/backfill, production orchestration은 제외한다.
- C-30은 Catalog와 AI Query live dataset 소비를 닫는다. external LLM/RAG/vector DB 추가와 write SQL은 제외한다.
- C-31은 구현 Phase가 아니라 deep browser verification Phase다. 문제 발견 시 독립 Hotfix 또는 후속 Phase로 분리한다.
- C-32는 browser session 안의 UX 복원만 다룬다. 서버 저장, query history API, multi-user query log, 영구 audit trail은 포함하지 않는다.
- C-4 이후 M5 실행 화면은 `M5 데모`가 아니라 `Job Runs` 또는 `실행 기록` 같은 사용자 언어로 재도입한다.
- M2/M4/M3/M6는 독립 메뉴가 아니라 Dataset creation 이후의 runtime, evidence, catalog, query 소비자로 연결한다.

## Local Environment Follow-up Queue

로컬 환경 요구사항은 `docs/04-development-guide.md`를 Source of Truth로 둔다.
macOS와 Windows 개발 환경 동등성은 문서 기준, 실제 환경 evidence, tooling 개선을 분리해서 진행한다.

후속 Phase 후보:

| 후보 | 목표 | 포함 범위 | 제외 범위 |
| --- | --- | --- | --- |
| `docs/cross-platform-smoke-audit` | macOS, Windows WSL2, 가능하면 native Windows에서 Docker Compose와 smoke script 실행 evidence를 기록 | OS/shell별 readiness, `docker compose build/up`, `scripts/smoke-container-app.sh`, 실패/skip reason | PowerShell wrapper 구현, 대규모 script rewrite |
| `chore/cross-platform-tooling` | smoke/helper가 필요한 경우 cross-platform 실행성을 개선 | PowerShell wrapper 또는 Python helper, `python3` launcher fallback, `rg` fallback search backend, line ending/path separator 점검, worktree metadata portability, Docker credential/buildx fallback, version pinning 검토 | 제품 기능 변경, cloud resource 생성 |

Windows native PowerShell/CMD 지원은 위 audit evidence 없이 완료로 선언하지 않는다.
Windows 기본 지원 경로는 WSL2 + Docker Desktop integration + bash-compatible shell이다.

Workspace state 값:

- `draft`: newly created or not yet scoped.
- `in-progress`: active implementation or documentation work.
- `ready-for-review`: branch believes implementation/checks are ready for review.
- `complete`: branch is complete.
- `integration-ready`: integration branch is ready for final integration validation.
- `archived`: historical evidence; only minimal validation applies.

## Git Sync 규칙

시작, mid-phase, pre-merge, PR 결정은 `docs/11-git-sync-policy.md`를 따른다.

- `sync.md`는 Start Sync, Mid-Phase Sync, Pre-Merge Sync, Push/PR, conflict, finalize/cleanup evidence를 기록한다.
- PR-ready 조건과 자동 feature branch push/PR 생성 허용 범위는 `docs/11`이 정의한다.
- pull, merge, rebase, PR merge, finalize, issue close, branch cleanup, deploy, external execution 승인 경계는 `docs/11`이 정의한다.
- PR handoff 선택지는 `docs/10-next-action-menu.md`의 `Complete And PR Ready`와 `PR Ready` 메뉴를 사용한다.
- linked issue Project status lifecycle은 `docs/11-git-sync-policy.md`를 따른다.
- 상태 요약은 `scripts/status-workflow.sh <workspace>`, 남은 branch queue는 `scripts/list-active-branches.sh`를 사용한다.

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

- `quality.md`는 TDD 적용 여부, check/CI 결과, skipped check, Source of Truth impact, harness test impact, CD/deploy gate를 기록한다.
- Source of Truth Impact Gate의 판단과 증거 위치는 `docs/12-quality-gates.md`와 이 문서의 완료 gate를 함께 따른다.
- Harness Test Update Gate의 상세 기준과 fixture regression 기대값은 `docs/18-harness-regression-policy.md`를 따른다.
- AI는 필요한 검증을 이유 없이 건너뛰지 않고, missing runtime은 readiness/fallback evidence를 먼저 남긴다.

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

- 기본은 Lite Read다.
- API/schema/data/security/sync/quality/integration/decision/evidence conflict 위험이 보이면 필요한 문서만 Escalate Read로 확장한다.
- whole-project audit, retrospective, migration, harness evaluation은 Audit Read를 사용한다.
- 선택한 mode, 주요 문서, 확장한 문맥, 의도적으로 생략한 문맥은 report에 기록한다.

## Context Assumption Check 규칙

AI는 의미 있는 질문이나 명령에 답하기 전에 `docs/09-collaboration-agreement.md`의 Context Assumption Check를 적용한다.

- 일반론 질문인지, 이 저장소의 Phase/PR/검증 규칙 기준 질문인지, 둘을 비교해야 하는지 먼저 판별한다.
- 실행 요청인지, 개념 설명인지, 정책 결정인지, 고영향 행동 승인인지 구분한다.
- 전제에 따라 답이 달라지면 답변 첫머리에 적용 전제를 밝힌다.
- branch/remote/PR/merge/finalize/cleanup, 검증 생략, scope 변경, 계약 변경, 배포, data/secret 영향으로 이어질 수 있으면 사람 확인 gate를 먼저 통과한다.
- 단순 개념 설명은 불필요하게 되묻지 않고, 필요한 경우 `일반론 기준 / 이 저장소 기준`으로 나누어 답한다.

## Integration Branch Rule / 통합 브랜치 규칙

둘 이상의 feature branch를 함께 검증해야 할 때만 integration branch workspace를 만든다.
독립 milestone은 자기 Phase/branch workspace/PR로 완료할 수 있다.

- Integration workspace는 `sources.md`에 source branch와 base commit을 기록한다.
- Source branch의 `shared-docs.md`, `plan.md`, `report.md`, `quality.md`, `decisions.md`, `confirmations.md`, `sync.md`를 필요한 범위로 읽는다.
- Parallel milestone manifest를 사용하는 경우 `.milestones/M*/manifest.yaml`의 scope, dependency, shared contract, merge order를 따른다.
- 완료 전 `scripts/validate-harness.sh --integration`을 실행하거나 승인된 deferral을 기록한다.
- Shared model/interface/acceptance/regression/manual verification 충돌은 `Integration Conflict Confirm`으로 해결한다.

## 사람 확인 게이트

AI는 gate 사이에서는 자율적으로 작업하되, 범위, 계약, 검증, 완료, 통합 방향을 바꾸는 결정에서는 멈추고 사람 확인을 받는다.

Record confirmation status in the branch workspace `confirmations.md`.

필수 gate:

- Scope Confirm: branch/workspace, included scope, excluded scope, impacted docs.
- Contract Confirm: data model, interface/API/CLI/UI contract, external dependency, shared Source of Truth change.
- Scope Change Confirm: any expansion beyond `plan.md` or split into another branch.
- Verification Confirm: test/build/smoke commands, manual verification path, completion criteria.
- Quality Gate Confirm: TDD evidence, required branch checks, CI gates, skipped checks, and CD/deploy gate.
- Git Sync Confirm: start sync, mid-phase upstream changes, pre-merge sync, and merge/finalize readiness.
- Pre-PR Human Checkpoint: PR was created and merge/finalize/cleanup/handoff is the next natural action.
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
3. Apply Context Assumption Check: identify whether the message is general, repository-specific, comparative, execution, concept, policy, or high-impact action.
4. Classify whether the request needs milestone planning, a provisional milestone, or only a lightweight Phase.
5. Apply Skill Discovery Rule. Use a relevant skill/plugin/tool when clearly useful; otherwise continue with the default workflow.
6. Apply Context Loading Rule.
7. Apply Context Budget Rule: choose Lite Read, Escalate Read, or Audit Read.
8. If a workspace exists, run or summarize `scripts/status-workflow.sh <workspace>` before opening detailed workspace files.
9. Confirm current Phase and branch/work location.
10. Confirm branch workspace exists under `docs/workflows/`.
11. Confirm `confirmations.md` exists and Scope Confirm is ready.
12. Confirm `next-actions.md` exists and has a recommended next action.
13. Confirm `sync.md` exists and Start Sync is recorded or ask for Git Sync Confirm.
14. Confirm `quality.md` exists and TDD/CI expectations are clear or ask for Quality Gate Confirm.
15. Confirm `decisions.md` exists and high-impact choices are recorded or deferred.
16. Confirm no earlier incomplete Phase should be done first.
17. Mark Hotfixes explicitly.
18. Name what is out of scope.
19. Apply Lightweight Execution Rule.
20. Do not invent undocumented requirements.
21. Do not revert unrelated user/previous changes.
22. Check related `docs/06` Regression Guard.
23. Read report context. If `docs/reports/README.md` has a Latest Report Index, read the latest report for the related area first. Otherwise read the previous Phase report and 1-2 relevant reports.

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
14. After PR merge, `scripts/prepare-pr.sh --finalize <workspace>` has verified GitHub PR/issue state and cleanup result, or a reason is recorded. Do not require post-merge `sync.md` final fields to be present in `main`.
15. `quality.md` records TDD status, branch checks, CI status, skipped checks, Source of Truth impact evidence, harness test impact evidence, and CD gate if relevant.
15a. `quality.md` records local tool/runtime readiness evidence when validation depends on Docker, browser runtime, database service, or other local runtime.
16. `decisions.md` records accepted/deferred high-impact decisions and rollback/revisit conditions.
17. For integration branches, `scripts/validate-harness.sh --integration` completed or a human-approved deferral is recorded.
18. Branch workspace `plan.md`, `notes.md`, or `report.md` updated where useful.
19. No scope leak.
20. Final report includes changed files, used skill/plugin/tool, verification, report path, next context, and remaining risks.
21. Final report records Context Budget mode, primary context read, escalated context read, and intentionally omitted context.
22. If local validation passed and the branch workspace is ready for `ready-for-review`/`complete`, AI may auto-create the PR when PR-ready stop conditions are clear. If a PR exists or merge/finalize/cleanup/handoff is the next natural action, AI presents `Pre-PR Human Checkpoint` before those follow-up actions.

ready/complete workspace는 quality, decision, pre-merge sync 상태를 해결해야 한다. draft/in-progress workspace는 필수 섹션을 유지하는 한 계획 placeholder를 둘 수 있다.

## Source of Truth Impact Gate

완료 전에 shared Source of Truth 영향도를 판정한다.
세부 판정값, 기록 위치, strict validation 동작은 `docs/12-quality-gates.md`와 `docs/11-git-sync-policy.md`의 Source of Truth Sync Preflight를 따른다.

아래 변경은 Source of Truth Impact Gate trigger다.

- API, interface, schema, endpoint, data model, module boundary, architecture layer 변경
- milestone, Phase, 완료 기준, acceptance, regression, manual verification 변경
- 구현된 기능 범위가 기존 문서의 예정, 미정, 후보 표현을 바꾸는 경우
- 다음 Phase가 기준으로 삼는 Source of Truth와 실제 코드/문서가 달라질 수 있는 경우

`docs/08`에서는 완료 gate로서 아래만 확인한다.

- `shared-docs.md`에 실제로 바꿀 Source of Truth 파일 또는 영향 없음이 기록되어 있다.
- 적용하지 않는 제안은 `decisions.md`에 deferred reason, revisit trigger, target branch/phase가 있다.
- `quality.md`와 `report.md`가 최종 적용/보류 판단과 검증 결과를 요약한다.

## Harness Test Update Gate

하네스 규칙, workflow 문서, validation/status/prepare/start 스크립트, CI harness job을 수정하는 branch는 완료 전에 하네스 테스트 영향도를 판정한다.
세부 기준, fixture regression 기대값, external E2E boundary는 `docs/18-harness-regression-policy.md`를 따른다.
결과는 `quality.md`, 필요한 deferred decision은 `decisions.md`, 최종 요약은 `report.md`에 기록한다.

## 완료 후 handoff 선택지

완료 후 실제 선택지 문구는 `docs/10-next-action-menu.md`의 `PR Ready`, `Complete And PR Ready`, `Small Change Completion Decision`, `Remaining Branch Queue`를 따른다.
PR/merge/finalize/cleanup 승인 범위와 stop condition은 `docs/11-git-sync-policy.md`가 canonical이다.

`docs/08`에서는 handoff 전에 아래만 확인한다.

- 현재 branch/workspace 상태, linked issue, PR closing keyword, PR link, local validation 결과, 남은 remote 작업, 외부 실행 승인 필요 여부를 요약한다.
- 선택지는 현재 상태에 맞는 2-4개로 줄이고, 진행 절차와 원격/외부 상태 변경 여부를 함께 설명한다.
- PR 생성 뒤 merge/finalize/cleanup/handoff가 자연스러운 다음 행동이면 `Pre-PR Human Checkpoint`를 기록한다.
- 보류를 선택하면 `sync.md`와 `next-actions.md`에 이유와 재개 조건을 기록한다.

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
