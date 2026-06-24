# 협업 하네스란 무엇인가 v2

이 문서는 AskLake 협업 하네스를 처음 보는 팀원이나 AI agent가 현재 운영 방식을 이해하고, 실제 작업에 적용할 수 있도록 정리한 설명서다.

기존 `docs/reports/collaboration-harness-beginner-guide.md`는 v1 성격의 초보자용 설명서로 보존한다. 이 v2 문서는 그 흐름을 유지하되, 이후 추가된 `Context Budget Rule`, `Pre-PR Human Checkpoint`, `Source of Truth Impact Gate`, `Harness Test Update Gate`, PR conflict flow, 기존 코드베이스 적용 방식, 병렬 milestone 운영 규칙을 반영한다.

## 한 문장으로 말하면

협업 하네스는 사람과 AI가 같은 프로젝트를 Phase 단위로 안전하게 진행하기 위한 작업 운영 체계다.

코드를 빠르게 만드는 것만 목표로 하지 않는다. 어떤 범위로 작업했는지, 어떤 결정을 사람이 확인했는지, 어떤 검증을 했는지, branch와 PR 상태가 어떤지, 다음 사람이 무엇을 이어받아야 하는지를 함께 남긴다.

AI는 반복 작업과 정리를 빠르게 처리한다. 사람은 범위, 계약, 검증, Git 원격 작업, 배포처럼 영향이 큰 결정을 잡는다. 하네스는 이 둘 사이의 약속이다.

## 하네스가 필요한 이유

팀 작업에서 가장 자주 사라지는 것은 코드가 아니라 맥락이다.

한 사람이 API 응답을 바꿨는데 interface 문서가 그대로일 수 있다. AI가 작업을 완료했다고 말했지만 실제로는 테스트를 돌리지 않았을 수 있다. branch가 시작될 때는 최신이었지만 PR 직전에는 `main`이 바뀌었을 수 있다. 새 팀원은 과거 report와 현재 Source of Truth 중 어느 쪽을 믿어야 할지 모를 수 있다.

협업 하네스는 이런 문제를 줄이기 위해 다음을 남긴다.

- 이번 작업의 범위와 제외 범위
- 사람이 확인한 결정
- 검증 명령과 결과
- Source of Truth 변경 여부
- Git sync, issue, PR, merge 상태
- 남은 위험과 다음 행동

완료는 "코드를 고쳤다"가 아니다. 완료는 다음 사람이 이어받아도 현재 상태를 이해할 수 있는 상태다.

## 가장 중요한 구성 요소

`Source of Truth`는 팀이 기준으로 삼는 공식 문서다. 제품 범위, architecture, interface, acceptance, regression, manual verification, workflow 같은 공통 기준을 담는다. report나 workspace 기록과 충돌하면 Source of Truth가 우선한다.

`branch workspace`는 한 branch 또는 한 Phase의 작업 일지다. 보통 `docs/workflows/<type>/<short-kebab-name>/` 아래에 있고, `plan.md`, `quality.md`, `sync.md`, `confirmations.md`, `decisions.md`, `shared-docs.md`, `next-actions.md`, `report.md` 같은 파일을 가진다.

`confirmation gate`는 사람이 확인해야 하는 지점이다. AI는 gate 사이에서 자율적으로 움직일 수 있지만, 범위 변경, 계약 변경, 검증 기준, Git 원격 작업, PR 진행, 완료 판단 앞에서는 멈춰야 한다.

`quality gate`는 작업을 완료로 볼 만큼 검증했는지 확인하는 단계다. TDD, focused test, build, typecheck, harness validation, CI, manual verification, skipped check reason이 여기에 들어간다.

`next action menu`는 열린 질문 대신 현재 상태에서 선택할 수 있는 다음 행동을 보여주는 방식이다. AI는 "이제 뭐 할까요?"라고만 묻지 않고, current state, recommended next action, 2~4개 options, 선택 후 할 일을 제시한다.

## 문서 지도

하네스는 모든 문서를 매번 읽지 않는다. `docs/00-layer-map.md`가 어떤 변경에 어떤 Source of Truth를 읽어야 하는지 알려주는 지도 역할을 한다.

대표적인 Source of Truth는 다음과 같다.

- `README.md`: 외부 요약과 현재 구현 baseline
- `docs/01-product-planning.md`: 제품 방향, scope, non-goals
- `docs/02-architecture.md`: 시스템 경계와 component 책임
- `docs/03-interface-reference.md`: API, schema, CLI, UI contract
- `docs/04-development-guide.md`: 개발, branch, environment, delivery 규칙
- `docs/05-acceptance-scenarios-and-checklist.md`: 수용 기준
- `docs/06-regression-and-failure-scenarios.md`: 회귀 보호와 실패 시나리오
- `docs/07-manual-verification-playbook.md`: 사람이 실행할 검증 절차
- `docs/08-development-workflow.md`: Phase 흐름과 완료 기준
- `docs/09-collaboration-agreement.md`: 협업 합의
- `docs/10-next-action-menu.md`: 다음 행동 메뉴
- `docs/11-git-sync-policy.md`: Git sync, issue, PR 정책
- `docs/12-quality-gates.md`: TDD, CI, CD, 검증 증거 규칙
- `docs/13-human-command-flow.md`: 사람이 AI에게 줄 수 있는 실제 명령 흐름
- `docs/14-decision-option-brief.md`: 고영향 선택 비교 방식
- `docs/15-context-budget-rule.md`: 문맥 읽기 범위 규칙
- `docs/16-existing-codebase-adoption.md`: 기존 코드베이스에 하네스를 붙이는 방식
- `docs/17-parallel-milestone-protocol.md`: 병렬 milestone 실행 계약
- `docs/18-harness-regression-policy.md`: 하네스 변경 회귀 테스트 규칙

`docs/reports/`는 완료된 Phase나 Hotfix의 evidence 계층이다. 중요한 증거지만 Source of Truth는 아니다. 충돌하면 report만 고치지 말고 가장 이른 Source of Truth layer를 고친다.

## branch workspace가 남기는 것

branch workspace는 코드 변경의 주변 맥락을 보존한다.

- `plan.md`: 목표, 범위, 제외 범위, 구현 프롬프트, 검증 프롬프트, 완료 기준
- `notes.md`: 진행 중 관찰, 중간 steering, 재개 문맥
- `quality.md`: TDD, test/build/typecheck, harness validation, CI, skipped checks, local runtime readiness
- `sync.md`: Start Sync, Mid-Phase Sync, Pre-Merge Sync, PR Conflict Resolution, issue, PR, merge 상태
- `confirmations.md`: 사람이 확인한 gate
- `decisions.md`: 고영향 선택, 보류 이유, revisit trigger, rollback condition
- `shared-docs.md`: Source of Truth 변경 제안
- `sources.md`: integration branch에서 source branch와 base commit 정보
- `next-actions.md`: 현재 상태, 추천 다음 행동, 보류/재개 조건
- `report.md`: 최종 변경 요약, 검증 결과, 남은 위험, 다음 작업 문맥

이 파일들은 "문서를 위한 문서"가 아니다. 다음 작업자가 질문을 덜 하게 만들기 위한 최소 운영 기록이다.

## Context Budget Rule

하네스는 모든 문서를 처음부터 끝까지 읽는 방식을 권장하지 않는다. 대신 `docs/15-context-budget-rule.md`에 따라 필요한 만큼만 읽는다.

`Lite Read`는 기본 모드다. `AGENTS.md`, `docs/00-layer-map.md`, workspace가 있으면 `scripts/status-workflow.sh <workspace>` 출력, 직접 관련된 Source of Truth 1~3개를 읽는다.

`Escalate Read`는 위험 신호가 보일 때 사용한다. API, schema, data, security, Git sync, quality, integration, decision risk가 있으면 필요한 Source of Truth와 evidence를 추가로 읽는다.

`Audit Read`는 전체 구조 점검, risk analysis, retrospective, migration, harness evaluation처럼 넓게 봐야 할 때 쓴다.

토큰을 아끼기 위해 필요한 Source of Truth를 생략하지 않는다. 반대로 작은 문서 변경에 모든 과거 report와 archived workspace를 여는 것도 피한다.

## 기본 작업 흐름

일반적인 작업 흐름은 다음과 같다.

```text
요청 분류
-> Context Budget 선택
-> branch/workspace 확인 또는 생성
-> Scope Confirm
-> 구현 또는 문서 작성
-> 검증
-> Source of Truth Impact Gate
-> Git sync 확인
-> report 작성
-> Next Action Menu
-> Pre-PR Human Checkpoint 또는 local hold
```

중요한 원칙은 작업 하나가 Phase 하나라는 점이다. 사람이 명시적으로 Hotfix를 선택하지 않으면 `docs/08-development-workflow.md`의 Phase 흐름을 따른다.

작은 변경은 lightweight하게 처리한다. 기존 문서로 표현할 수 있으면 새 문서를 늘리지 않고, 필요한 최소 범위만 수정한다.

## 사람 확인 게이트

AI는 영향이 큰 지점에서 멈춰야 한다.

- `Scope Confirm`: branch/workspace, included scope, excluded scope, impacted docs 확인
- `Contract Confirm`: data model, interface/API/CLI/UI contract, external dependency, shared Source of Truth 변경 확인
- `Scope Change Confirm`: `plan.md` 범위를 넘거나 새 branch로 분리해야 할 때
- `Verification Confirm`: test/build/smoke/manual verification 경로 확인
- `Quality Gate Confirm`: TDD, branch checks, CI, skipped checks, CD/deploy gate 확인
- `Git Sync Confirm`: start sync, mid-phase upstream changes, pre-merge sync, PR readiness 확인
- `Pre-PR Human Checkpoint`: local validation 후 push/PR/handoff가 다음 행동일 때
- `PR Conflict Confirm`: PR conflict 또는 Source of Truth proposal conflict 해결 경로 선택
- `Sync Conflict Confirm`: main 변경이나 shared Source of Truth 충돌이 현재 branch에 영향을 줄 때
- `Completion Confirm`: 변경 요약, 검증 결과, 남은 위험, 다음 작업 문맥 확인
- `Integration Conflict Confirm`: 여러 source branch의 contract, acceptance, regression, manual verification이 충돌할 때

이 gate들은 AI를 느리게 만들기 위한 장치가 아니다. 사람이 잡아야 하는 결정을 자동화가 지나치지 않게 하는 안전선이다.

## Pre-PR Human Checkpoint

local validation이 통과했다고 해서 AI가 바로 push, PR 생성, merge, finalize, cleanup을 하면 안 된다.

push, PR creation, PR handoff, integration handoff가 다음 자연스러운 행동이면 AI는 `Pre-PR Human Checkpoint`를 제시한다.

메뉴는 보통 다음 선택지를 가진다.

```text
Current state:
- local validation은 통과했습니다.
- 남은 remote 작업은 push/PR/CI/merge/finalize입니다.

Recommended next action:
- PR 진행
- Reason: 검증 증거가 있고 남은 scope drift가 없습니다.

Options:
1. PR 진행
2. 추가 보강
3. 다음 Phase
4. 보류

Waiting on you:
- 번호나 자연어로 선택해주세요.
```

사람이 `PR만`, `초안 PR`, `PR 생성만`이라고 하면 PR 생성 후 merge, finalize, issue close, cleanup 전 다시 멈춘다.

## Quality Gate

완료는 검증 증거를 포함한다.

core logic, bug fix, regression-prone behavior, integration contract에는 TDD 또는 실패 재현 테스트가 필요하다. 문서 전용 변경, formatting, low-risk mechanical edit은 TDD를 생략할 수 있지만 이유를 기록한다.

기본 검증은 작업 성격에 따라 달라진다.

- unit 또는 focused test
- integration 또는 contract test
- build/typecheck
- manual verification
- `scripts/validate-harness.sh`
- PR/integration readiness 전 `scripts/validate-harness.sh --strict`
- 하네스 behavior 변경 시 `scripts/test-harness.sh`

Docker, browser runtime, database service 같은 local runtime이 필요할 때는 바로 skip하지 않는다. 설치 여부, version, 실행 상태, safe start 가능성, fallback, remaining human action을 먼저 기록한다.

## Source of Truth Impact Gate

구현이나 문서 변경이 공통 기준을 바꾸면 Source of Truth 영향도를 판단한다.

대상 예시는 다음과 같다.

- API, schema, endpoint, data model
- module boundary, architecture layer
- milestone, Phase, completion criteria
- acceptance, regression, manual verification
- 다음 Phase가 기준으로 삼을 문서와 실제 구현이 달라질 수 있는 경우

기록 값은 네 가지다.

- `none`: 영향 없음
- `required`: Source of Truth 변경 필요
- `applied`: 필요한 변경 완료
- `deferred`: 현재 범위 밖이라 보류

`deferred`는 그냥 미룰 수 없다. `decisions.md`에 reason, revisit trigger, target branch/phase를 남겨야 한다.

## Harness Test Update Gate

하네스 자체를 바꾸는 작업은 일반 문서 변경보다 조심해야 한다.

다음이 바뀌면 `docs/18-harness-regression-policy.md`를 따른다.

- workflow rule 또는 completion gate
- branch, PR, sync, cleanup, human command rule
- validation/status/prepare/start/cleanup/list script
- CI harness job
- workspace template 또는 required evidence field

영향도는 `none`, `required`, `updated`, `skipped`, `deferred` 중 하나로 기록한다.

하네스 behavior가 바뀌면 보통 `scripts/test-harness.sh` fixture regression test를 추가하거나 수정한다. 단순 설명 문서처럼 behavior가 바뀌지 않으면 skip reason을 남긴다.

## Git sync와 PR 운영

Git 상태는 `sync.md`에 기록한다.

`Start Sync`는 작업 시작 기준 branch와 base commit을 기록한다. `Mid-Phase Sync`는 작업 중 `main`이나 shared Source of Truth가 바뀌었을 때 기록한다. `Pre-Merge Sync`는 완료 또는 PR readiness 전에 main freshness와 conflict 여부를 확인한다.

원격 상태를 바꾸는 작업은 사람 확인 없이 실행하지 않는다.

- pull
- merge
- rebase
- push
- PR 생성
- PR merge
- PR finalize
- branch cleanup

branch workspace 생성은 GitHub issue 생성을 기본으로 시도한다. GitHub CLI가 없거나 인증이 없으면 local workspace를 만들고 실패 이유를 `sync.md`에 기록한다. 의도적으로 issue를 만들지 않으려면 `--no-issue`와 이유를 남긴다.

PR 준비 전에는 linked issue와 `Closes #123` 형태의 closing keyword를 확인한다. PR handoff 전에는 `scripts/prepare-pr.sh --check-pr-sync <workspace>`를 실행하거나 이유를 기록한다.

## PR Conflict Resolution

PR conflict가 보이면 AI는 임의로 merge, rebase, push, PR merge를 계속하지 않는다.

먼저 conflict를 분류한다.

- Git text conflict
- Source of Truth conflict
- contract/interface/schema conflict
- test/quality gate conflict
- generated artifact/report/workspace evidence conflict
- external dependency/lockfile conflict

그 다음 현재 branch, PR 번호, base branch, 감지 명령, affected files, impacted layer를 보고하고 해결 선택지를 제시한다.

기본 선택지는 다음과 같다.

1. `main 반영 후 현재 branch에서 해결`
2. `Source of Truth 우선 결정`
3. `작업 분리`
4. `PR 보류`
5. `사람 직접 해결`

해결 후에는 `git status --short`, `scripts/validate-harness.sh`, `scripts/validate-harness.sh --strict`, 관련 project checks를 다시 실행한다. 하네스 behavior가 바뀌었으면 `scripts/test-harness.sh`도 실행하거나 skip/deferred reason을 기록한다.

## Existing Codebase Adoption

이미 존재하는 코드베이스에 하네스를 붙일 때는 과거 기능을 억지로 workspace로 만들지 않는다.

먼저 baseline을 남긴다.

- 현재 실행 방법
- build/test 명령
- CI/PR/branch 정책
- key modules
- 기존 문서와 stale docs
- infra gaps
- accepted risk
- 다음 Phase 후보

그 다음 실제 변경부터 일반 Phase Workflow를 적용한다. 이것을 baseline + next-change 방식이라고 부른다.

기존 정책은 함부로 덮어쓰지 않는다. 먼저 기록하고, 바꿔야 할 때 사람 확인을 받는다.

## Parallel Milestone Protocol

병렬 작업이 필요할 때만 `docs/17-parallel-milestone-protocol.md`를 적용한다.

적용 기준은 다음과 같다.

- worktree/thread가 2개 이상 필요하다.
- frontend/backend/test/docs처럼 write scope를 나눌 수 있다.
- API, schema, event, file ownership, integration order가 여러 작업에 걸친다.
- 병렬 refactor에서 충돌 위험을 먼저 고정해야 한다.

병렬 milestone에서는 `.milestones/M*/manifest.yaml`이 실행 계약의 source of truth다. 여기에는 workstream ownership, allowed write scope, dependency, shared contract, done criteria, integration branch, merge order가 들어간다.

하지만 manifest가 모든 것을 대체하지는 않는다. 일반 구현과 검증은 여전히 `docs/workflows/`의 Phase/branch workspace 흐름을 따른다. manifest와 workspace가 충돌하면 구현을 멈추고 어느 쪽을 수정할지 사람 확인을 받는다.

독립 milestone 하나 또는 충돌 위험이 낮은 작은 변경은 `.milestones` manifest 없이 branch workspace로 충분할 수 있다.

## AI agent에게 주는 운영 프롬프트

아래 프롬프트는 새 AI agent에게 AskLake 하네스 운영 방식을 전달할 때 사용할 수 있다.

```text
너는 AskLake 협업 하네스를 따르는 AI agent다.

항상 `AGENTS.md`를 먼저 읽고, `docs/00-layer-map.md`로 변경 시작 layer를 판단한다.
기본은 `Lite Read`다. API/schema/data/security/sync/quality/integration/decision 위험이 보이면 필요한 만큼만 `Escalate Read`한다.
workspace가 있으면 상세 파일을 열기 전에 `scripts/status-workflow.sh <workspace>`를 실행하거나 요약한다.

작업 하나는 Phase 하나다. Hotfix가 명시되지 않으면 `docs/08-development-workflow.md`의 Phase 흐름을 따른다.
branch workspace는 `docs/workflows/` 아래에 있어야 하며, `plan.md`, `quality.md`, `sync.md`, `confirmations.md`, `decisions.md`, `shared-docs.md`, `next-actions.md`, `report.md`를 현재 상태에 맞게 유지한다.

구현 전에 scope와 제외 범위를 확인한다.
interface, schema, API, CLI, UI contract, data model, architecture boundary가 바뀌면 Source of Truth 영향도를 먼저 판단한다.
문서에 없는 요구사항을 invent하지 않는다.
완료되지 않은 기능을 완료된 것처럼 쓰지 않는다.
사용자나 이전 작업자가 만든 unrelated change를 되돌리지 않는다.

core logic, bug fix, regression-prone behavior, integration contract에는 TDD 또는 실패 재현 테스트를 우선한다.
문서 전용 변경이나 low-risk mechanical edit은 TDD를 생략할 수 있지만 reason을 기록한다.
검증 결과는 `quality.md`와 `report.md`에 남긴다.

push, PR 생성, merge, finalize, cleanup 같은 원격 또는 branch 상태 변경은 사람 확인 없이 실행하지 않는다.
local validation이 통과했고 push/PR/handoff가 다음 자연스러운 행동이면 `Pre-PR Human Checkpoint` 메뉴를 제시하고 멈춘다.

하네스 behavior를 바꾸면 `Harness Test Update Gate`를 적용하고 `docs/18-harness-regression-policy.md`를 따른다.
병렬 작업이 명시되거나 shared contract/integration order가 중요하면 `docs/17-parallel-milestone-protocol.md`를 적용한다.

사람과 AI가 함께 읽는 협업 산출물은 한국어로 작성한다.
파일 경로, 명령어, branch명, commit hash, API/schema 이름, 환경 변수, 오류 메시지, test 이름, code identifier, script status label은 번역하지 않는다.
```

## 팀원이 최소로 기억할 것

처음에는 세 가지만 기억하면 된다.

첫째, 작업은 branch workspace로 시작한다. 코드만 바꾸지 말고 범위, 결정, 검증, sync, 다음 행동을 함께 남긴다.

둘째, 중요한 선택은 confirmation gate에서 사람이 잡는다. 특히 범위, 계약, 검증, Git 원격 작업, PR 진행은 자동으로 넘기지 않는다.

셋째, 완료는 handoff까지 포함한다. 다음 사람이 `quality.md`, `sync.md`, `report.md`, `next-actions.md`를 보고 이어받을 수 있어야 한다.

좋은 하네스는 절차를 늘리는 장치가 아니라, 작업 맥락이 사람을 따라오게 만드는 장치다.
