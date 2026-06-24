# 협업 하네스란 무엇인가: 초보자를 위한 팀 작업 운영 가이드

프로젝트를 하다 보면 코드를 잘 짜는 것만큼 어려운 일이 있습니다. 바로 "지금 우리가 어디까지 왔는지"를 모두가 같은 의미로 이해하는 일입니다.

처음에는 채팅방에 남긴 말, 회의 중 나온 결정, 각자 기억하고 있는 작업 범위만으로도 충분해 보입니다. 하지만 기능이 늘고, 브랜치가 많아지고, AI까지 함께 작업하기 시작하면 이야기가 달라집니다.

누군가는 API가 바뀐 줄 모르고 예전 방식으로 개발합니다. 누군가는 테스트가 끝난 줄 알았지만 실제로는 수동 확인만 한 상태입니다. AI는 빠르게 코드를 고치지만, 원래 범위보다 더 넓게 바꿔버릴 수도 있습니다. 다음 작업자는 앞 사람이 어떤 판단을 했는지 몰라 같은 질문을 반복합니다.

협업 하네스는 이런 문제를 줄이기 위한 팀 작업 운영 체계입니다.

쉽게 말하면, 협업 하네스는 팀 작업에서 다음 정보를 잃어버리지 않게 해주는 장치입니다.

- 어떤 작업을 하기로 했는지
- 어디까지 하기로 했고 어디부터는 제외했는지
- 어떤 결정을 누가 확인했는지
- 어떤 테스트와 검증을 했는지
- 현재 Git 브랜치와 PR 상태가 어떤지
- 다음 사람이 무엇을 이어받으면 되는지

협업 하네스는 AI 자동화 도구만을 뜻하지 않습니다. 더 정확히는 사람과 AI가 함께 일하기 위한 협업 안전장치입니다. AI는 반복 작업을 빠르게 처리하고, 사람은 중요한 결정 지점을 확인합니다. 이 둘을 연결하는 규칙과 문서 구조가 협업 하네스입니다.

## 먼저 알아두면 좋은 용어

협업 하네스를 처음 보면 낯선 단어가 많습니다. 아래 용어만 이해해도 전체 흐름을 따라가기 훨씬 쉬워집니다.

`branch`는 Git에서 작업을 나누는 선입니다. 예를 들어 `feature/source-catalog`라는 branch는 source catalog 기능을 작업하기 위한 별도 작업선입니다.

`workspace`는 한 branch의 작업 기록을 모아두는 폴더입니다. 코드만 보는 것이 아니라, 그 branch에서 무엇을 계획했고, 무엇을 검증했고, 어떤 결정을 했는지 확인하는 작업 일지입니다.

`Source of Truth`는 팀이 기준으로 삼는 공식 문서입니다. 제품 기획, 아키텍처, API 계약, 수용 기준처럼 여러 작업자가 공유해야 하는 기준을 뜻합니다. 누군가의 기억이나 채팅보다 Source of Truth가 우선합니다.

`confirmation gate`는 사람이 확인해야 하는 중요한 결정 지점입니다. AI가 모든 것을 자동으로 진행하지 않고, 범위 변경이나 Git 원격 작업처럼 영향이 큰 순간에는 사람에게 확인을 받습니다.

`next action menu`는 현재 상태에서 선택할 수 있는 다음 행동 목록입니다. AI가 막연히 "이제 뭐 할까요?"라고 묻는 대신, PR 진행, 추가 보강, 보류처럼 선택지를 제시합니다.

`sync`는 현재 branch가 main이나 원격 저장소와 얼마나 맞춰져 있는지 확인하는 일입니다. 시작 시점, 작업 중간, PR 전 상태를 기록합니다.

`quality gate`는 완료 전에 검증이 충분한지 확인하는 단계입니다. 테스트, 빌드, 타입체크, CI, 수동 검증, 생략한 검증의 이유를 확인합니다.

`handoff`는 다음 사람이 이어받을 수 있도록 남기는 인계 기록입니다. 무엇이 바뀌었고, 무엇을 검증했고, 무엇이 남았는지 적습니다.

`manifest`는 병렬 작업에서 모두가 따라야 하는 실행 계약서입니다. 누가 어떤 범위를 수정하는지, 어떤 의존성이 있는지, 어떤 기준을 만족해야 완료인지 명시합니다.

`workstream`은 병렬 작업에서 나눈 작업 흐름입니다. 예를 들어 FE, API, QA, Docs처럼 역할이나 수정 범위별로 나눌 수 있습니다.

## 협업 하네스가 해결하려는 문제

협업 하네스가 필요한 이유는 단순합니다. 팀 작업에서 맥락은 너무 쉽게 사라집니다.

예를 들어 이런 상황을 생각해볼 수 있습니다.

한 팀원이 API 응답 구조를 바꿨습니다. 코드는 잘 동작하지만, 인터페이스 문서는 예전 그대로입니다. 다음 팀원은 문서를 보고 예전 응답 구조에 맞춰 frontend를 구현합니다. 결국 통합 시점에 문제가 드러납니다.

또 다른 상황도 있습니다. AI가 "작업 완료"라고 보고했습니다. 하지만 실제로는 테스트가 없고, 수동 검증도 일부 경로만 확인했습니다. 리뷰어는 무엇을 믿고 완료로 판단해야 할지 알기 어렵습니다.

Git에서도 비슷한 일이 생깁니다. 작업을 시작할 때는 main이 최신이었지만, 중간에 main이 바뀌었습니다. 이 사실을 기록하지 않으면 PR 직전에 충돌이 나거나, 이미 바뀐 공통 기준을 놓칠 수 있습니다.

협업 하네스는 이런 문제를 다음 방식으로 다룹니다.

- 작업 범위는 `plan.md`에 남긴다.
- 중요한 결정은 `decisions.md`에 남긴다.
- 검증 결과는 `quality.md`에 남긴다.
- Git과 PR 상태는 `sync.md`에 남긴다.
- 최종 인계는 `report.md`에 남긴다.
- 공통 기준이 바뀌면 Source of Truth 문서를 확인한다.
- 영향이 큰 순간에는 confirmation gate로 사람에게 확인한다.

결국 하네스의 목적은 "빠르게 작업하되, 나중에 이해할 수 있게 남기는 것"입니다.

## 전체 구조: 공통 기준과 branch 작업 기록

협업 하네스의 문서는 크게 두 갈래로 나뉩니다.

첫 번째는 팀 전체가 공유하는 Source of Truth 문서입니다. 이 문서들은 특정 branch에만 속하지 않고, 프로젝트의 공식 기준 역할을 합니다.

대표적으로 다음 문서들이 여기에 해당합니다.

- `docs/01-product-planning.md`: 제품 범위와 사용자 가치
- `docs/02-architecture.md`: 시스템 구조와 책임
- `docs/03-interface-reference.md`: API, schema, UI, CLI 같은 인터페이스 계약
- `docs/04-development-guide.md`: 개발, 환경, branch, delivery 규칙
- `docs/05-acceptance-scenarios-and-checklist.md`: 수용 기준과 완료 조건
- `docs/06-regression-and-failure-scenarios.md`: 회귀 방지와 실패 시나리오
- `docs/07-manual-verification-playbook.md`: 사람이 직접 확인할 검증 절차
- `docs/08-development-workflow.md`: 공통 개발 workflow
- `docs/09-collaboration-agreement.md`: 팀 협업 합의
- `docs/10-next-action-menu.md`: 다음 행동 메뉴 규칙
- `docs/11-git-sync-policy.md`: Git sync와 PR 정책
- `docs/12-quality-gates.md`: 테스트, CI, CD, 검증 규칙
- `docs/13-human-command-flow.md`: 사람이 AI에게 지시하는 실제 명령 흐름
- `docs/14-decision-option-brief.md`: 영향 큰 결정을 비교하는 방식
- `docs/15-context-budget-rule.md`: 필요한 문서만 읽는 context 규칙
- `docs/16-existing-codebase-adoption.md`: 기존 코드베이스에 하네스를 적용하는 방식
- `docs/18-harness-regression-policy.md`: 하네스 자체 변경 시 회귀 테스트 규칙

두 번째는 branch workspace입니다. 특정 branch의 작업 기록을 담는 폴더입니다.

예를 들어 `feature/source-catalog` 작업을 시작하면 다음과 같은 workspace가 생깁니다.

```text
docs/workflows/feature/source-catalog/
```

이 workspace 안에는 보통 다음 문서들이 들어갑니다.

- `plan.md`: 이번 branch에서 할 일과 하지 않을 일
- `notes.md`: 진행 중 메모, 관찰, 작업 중 알게 된 내용
- `quality.md`: 테스트, 빌드, 타입체크, CI, 수동 검증 결과
- `decisions.md`: 중요한 선택, 보류한 선택, 다시 볼 조건
- `shared-docs.md`: Source of Truth 문서에 반영해야 할 변경 제안
- `sources.md`: 통합 branch에서 source branch와 base commit 정보
- `confirmations.md`: 사람이 확인한 gate와 승인 내용
- `next-actions.md`: 현재 상태와 추천 다음 행동
- `sync.md`: branch, main, PR, issue, merge 상태
- `report.md`: 최종 인계, 변경 요약, 남은 리스크

또 하나의 중요한 위치는 `docs/reports/`입니다. 여기에는 Phase나 Hotfix가 끝난 뒤 오래 보존할 보고서가 들어갑니다. branch workspace가 작업 일지라면, `docs/reports/`는 완료된 작업의 durable evidence, 즉 오래 남길 증거에 가깝습니다.

병렬 작업이 필요할 때는 `.milestones/`를 사용합니다. 이 구조는 뒤에서 다시 설명하겠습니다.

## 기본 작업 흐름

협업 하네스의 기본 흐름은 어렵지 않습니다.

```text
작업 시작
-> branch와 workspace 생성
-> 범위 확인
-> 구현
-> 사람 확인 gate
-> 테스트와 검증
-> Source of Truth 영향 확인
-> Git sync 확인
-> report 작성
-> PR, 보류, 다음 Phase 중 선택
```

첫 번째 단계는 작업을 시작하는 것입니다. 보통 사람은 짧게 이렇게 말할 수 있습니다.

```text
feature/source-catalog workspace 만들어서 범위 초안 잡아줘
```

그러면 AI는 해당 branch와 workspace를 준비하고, `plan.md`, `sync.md`, `quality.md` 같은 기본 문서를 채웁니다.

두 번째 단계는 범위 확인입니다. 이번 branch에서 무엇을 할지, 무엇은 하지 않을지, 어떤 Source of Truth 문서가 영향을 받을지 확인합니다.

세 번째 단계는 구현입니다. AI는 합의된 범위 안에서 코드를 수정하거나 문서를 보강합니다.

네 번째 단계는 confirmation gate입니다. 작업 중 범위가 커지거나, API 계약이 바뀌거나, Git 원격 상태를 바꾸는 순간에는 사람이 확인합니다.

다섯 번째 단계는 테스트와 검증입니다. 테스트, 빌드, 타입체크, CI, 수동 검증을 실행하고 결과를 `quality.md`에 남깁니다.

여섯 번째 단계는 Source of Truth 영향 확인입니다. 구현 결과가 공통 기준을 바꿨다면 관련 문서를 업데이트하거나 보류 이유를 남깁니다.

일곱 번째 단계는 Git sync 확인입니다. 현재 branch가 main과 얼마나 맞는지, PR을 준비해도 되는지 `sync.md`에 기록합니다.

마지막으로 `report.md`를 작성하고, PR 진행, 추가 보강, 보류, 다음 Phase 중 하나를 선택합니다.

## 사람 확인 게이트

협업 하네스에서 AI는 게이트 사이에서는 자율적으로 움직일 수 있습니다. 하지만 영향이 큰 결정 앞에서는 멈추고 사람에게 확인을 받습니다.

필수적으로 알아야 할 confirmation gate는 다음과 같습니다.

`Scope Confirm`은 구현을 시작하기 전에 이번 branch의 범위, 제외 범위, 영향을 받는 문서를 확인하는 단계입니다.

`Contract Confirm`은 데이터 모델, API, CLI, UI 계약, 외부 dependency, 공통 Source of Truth 변경이 구현에 사용되기 전에 확인하는 단계입니다.

`Scope Change Confirm`은 작업이 `plan.md` 범위를 넘어갈 때 필요합니다. 현재 branch에서 확장할지, 별도 branch로 나눌지, 나중으로 미룰지 결정합니다.

`Verification Confirm`은 최종 검증을 시작하기 전에 어떤 테스트, 빌드, smoke check, 수동 검증을 할지 확인하는 단계입니다.

`Quality Gate Confirm`은 TDD, branch check, CI, skipped check, CD/deploy gate가 불분명하거나 바뀔 때 확인합니다.

`Git Sync Confirm`은 pull, merge, rebase, push, PR 생성, PR merge처럼 branch나 원격 상태를 바꾸는 작업 전에 필요합니다.

`Sync Conflict Confirm`은 작업 중 main이 바뀌었거나 공통 Source of Truth와 현재 branch가 충돌할 때 필요합니다.

`Completion Confirm`은 branch를 완료로 볼지 확인하는 단계입니다. 변경 요약, 검증 결과, 남은 리스크, 다음 작업 맥락을 함께 봅니다.

`Integration Conflict Confirm`은 여러 branch를 통합할 때 데이터 모델, 인터페이스, 수용 기준, 회귀 검증, 수동 검증 방향이 충돌하면 필요합니다.

이 게이트들은 AI를 느리게 만들기 위한 장치가 아닙니다. 반복 작업은 AI에게 맡기되, 팀 전체에 영향을 주는 선택은 사람이 잡도록 하는 안전선입니다.

## Next Action Menu

작업 중 가장 자주 생기는 질문은 "이제 뭐 하지?"입니다.

협업 하네스는 이 질문을 열린 질문으로 두지 않습니다. 현재 상태를 요약하고, 선택 가능한 다음 행동을 메뉴로 제시합니다.

예를 들어 검증이 끝나고 branch가 PR-ready에 가까워졌다면 이런 메뉴가 나올 수 있습니다.

```text
Current state:
- 구현은 완료됐고 local validation이 통과했습니다.
- sync.md에 pre-merge sync가 기록되어야 합니다.

Recommended next action:
- PR 진행
- Reason: 검증 증거가 있고 남은 범위 변경이 없습니다.

Options:
1. PR 진행
2. 추가 보강
3. 다음 Phase 시작
4. 보류

Waiting on you:
- 번호나 자연어로 선택해주세요.
```

팀원은 길게 설명하지 않아도 됩니다.

```text
1번으로 진행해
```

또는 이렇게 말할 수도 있습니다.

```text
보류하고 이유 남겨
```

그러면 AI는 선택에 맞게 `next-actions.md`, `sync.md`, `report.md` 등을 갱신하고 다음 작업을 진행합니다.

## Git과 PR 운영 규칙

협업에서 Git 상태는 매우 중요하지만 쉽게 놓칩니다. 그래서 하네스는 Git과 PR 상태를 `sync.md`에 기록합니다.

핵심 개념은 다음과 같습니다.

`Start Sync`는 작업 시작 전 기준 main이나 base commit을 확인하고 기록하는 단계입니다.

`Mid-Phase Sync`는 작업 중 main이나 공통 Source of Truth가 바뀌었을 때 지금 반영할지, 위험을 기록하고 계속할지 결정하는 단계입니다.

`Pre-Merge Sync`는 완료나 PR 전, 현재 branch가 main과 얼마나 맞는지 다시 확인하는 단계입니다.

`PR readiness`는 PR을 올릴 준비가 되었는지 확인하는 상태입니다. pending confirmation, quality evidence, sync 상태, Source of Truth 영향, PR checklist를 봅니다.

`linked issue`는 branch와 연결된 GitHub issue입니다. branch workspace를 만들 때 issue도 함께 만들 수 있습니다.

`PR closing keyword`는 PR이 merge될 때 linked issue를 자동으로 닫기 위한 문구입니다. 예를 들어 `Closes #123` 같은 형태입니다.

중요한 원칙은 원격 상태를 바꾸는 작업은 사람 확인이 필요하다는 것입니다. pull, merge, rebase, push, PR 생성, PR merge는 branch나 remote 상태를 바꿀 수 있으므로 confirmation gate를 거칩니다.

다만 팀 규칙상 branch workspace가 complete이고, pending confirmation이 없고, PR checklist가 준비된 경우에는 자동 PR 생성까지 진행할 수 있습니다. 하지만 merge, finalize, issue close 확인, branch cleanup처럼 더 큰 영향이 있는 단계는 상황과 위험에 따라 사람 확인이 필요합니다.

## 품질 게이트

협업 하네스에서 완료는 구현 완료가 아닙니다. 완료는 검증과 증거까지 포함합니다.

품질 게이트에서 확인하는 대표 항목은 다음과 같습니다.

- TDD 또는 실패 재현 테스트가 필요한가
- 테스트가 실행됐는가
- 빌드가 통과했는가
- 타입체크가 필요한가
- CI 상태는 어떤가
- 수동 검증을 했는가
- 생략한 검증이 있다면 이유가 기록됐는가
- CD나 deploy가 필요하다면 승인, smoke test, rollback 기준이 있는가

핵심 로직, 버그 수정, 회귀 위험이 큰 동작, API나 데이터 계약 변경에는 TDD가 특히 중요합니다. 적어도 실패를 재현하는 테스트나 검증 경로가 있어야 합니다.

검증 결과는 `quality.md`와 `report.md`에 남깁니다. 이렇게 해야 리뷰어가 "왜 완료라고 판단했는지"를 확인할 수 있고, 나중에 문제가 생겼을 때 당시의 기준을 되짚을 수 있습니다.

## Source of Truth Impact Gate

작업 중 구현이 공통 기준을 바꿀 때가 있습니다.

예를 들어 API endpoint가 바뀌거나, schema가 바뀌거나, architecture boundary가 바뀌거나, acceptance scenario가 바뀌거나, regression guard와 manual verification이 바뀌는 경우입니다.

이때는 Source of Truth Impact Gate를 확인해야 합니다.

결과 상태는 네 가지입니다.

- `none`: Source of Truth 영향 없음
- `required`: Source of Truth 변경 필요
- `applied`: 필요한 Source of Truth 변경 완료
- `deferred`: 현재 branch 범위 밖이라 보류

`deferred`인 경우에는 그냥 미뤄서는 안 됩니다. `decisions.md`에 보류 이유, 다시 볼 조건, target branch나 phase를 남겨야 합니다.

이 규칙이 있어야 구현과 공식 문서가 계속 같은 방향을 바라볼 수 있습니다.

## Harness Test Update Gate

협업 하네스 자체도 변경될 수 있습니다. 예를 들어 workflow 문서를 바꾸거나, validation script를 바꾸거나, status script, prepare script, start script, CI harness job을 바꾸는 경우입니다.

이런 변경은 일반 기능 변경과 다르게 하네스 자체의 회귀를 만들 수 있습니다. 그래서 Harness Test Update Gate를 확인합니다.

영향 상태는 다음과 같습니다.

- `none`: 하네스 테스트 영향 없음
- `required`: fixture regression test 추가 또는 수정 필요
- `updated`: 필요한 테스트 업데이트 완료
- `skipped`: 테스트가 필요 없어서 생략했고 이유 기록
- `deferred`: 현재 범위 밖이라 보류하고 다시 볼 조건 기록

하네스 규칙이나 스크립트 동작이 바뀌면 보통 fixture regression test를 추가하거나 수정해야 합니다. 단순 문구 수정처럼 테스트가 필요 없는 경우에도 `quality.md`에 생략 이유를 남깁니다.

## 병렬 마일스톤

작업이 커지면 여러 사람이 동시에 작업해야 합니다. 예를 들어 frontend, backend, QA, docs를 나눠서 진행할 수 있습니다.

하지만 병렬 작업을 그냥 TODO 목록으로 나누면 통합 시점에 문제가 생기기 쉽습니다. 같은 파일을 여러 사람이 수정하거나, API 계약이 정해지지 않은 상태에서 frontend와 backend가 서로 다르게 구현할 수 있습니다.

그래서 하네스는 병렬 마일스톤을 `.milestones/` 아래에서 관리합니다.

```text
.milestones/
  M1/
    manifest.yaml
    status.yaml
    decisions.md
    handoffs/
      FE.md
      API.md
      QA.md
```

`manifest.yaml`은 병렬 실행의 source of truth입니다. 여기에 다음 내용을 적습니다.

- milestone 목표
- workstream 목록
- 각 workstream의 수정 허용 scope paths
- 의존성
- API, schema, event contracts
- done criteria
- integration branch
- merge order
- final verification

`status.yaml`은 각 workstream의 진행 상태를 추적합니다. `ready`, `in_progress`, `blocked`, `completed`, `integrated` 같은 상태를 남깁니다.

`decisions.md`는 병렬 작업 중 사람이 읽을 결정 기록입니다. 다만 실행 범위, 소유권, 계약, 완료 기준은 `manifest.yaml`이 우선합니다.

`handoffs/`에는 각 workstream이 완료될 때 인계 문서를 남깁니다. 변경 파일, 구현 내용, 계약 변경 여부, 검증 명령, 남은 리스크, 통합 시 주의점을 적습니다.

핵심은 병렬 작업을 자유형 TODO가 아니라 manifest 기반으로 통제한다는 것입니다.

## 기존 코드베이스에 적용하는 방식

이미 운영 중인 프로젝트에 협업 하네스를 적용할 수도 있습니다. 다만 이때는 조심해야 합니다.

기존 프로젝트의 과거 작업을 억지로 모두 branch workspace로 만들지 않습니다. 그러면 기록은 많아지지만 실제 정확도는 낮을 수 있습니다.

대신 baseline을 먼저 남깁니다.

baseline에는 현재 코드 구조, 실행 방법, 테스트 방법, CI/PR 정책, branch 규칙, 기존 문서 상태, 알려진 gap을 기록합니다.

그 다음 변경부터 일반 branch workspace 흐름을 적용합니다.

중요한 원칙은 기존 정책을 함부로 덮어쓰지 않는 것입니다. 기존 문서, CI, PR, branch convention이 있다면 먼저 기록하고, 바꿀 필요가 있을 때 사람 확인을 거쳐야 합니다.

## Context Budget Rule

협업 하네스는 모든 문서를 매번 다 읽는 방식을 권장하지 않습니다. 그 방식은 느리고, 실제로 필요한 맥락을 찾기도 어렵습니다.

대신 Context Budget Rule을 사용합니다.

`Lite Read`는 일반적인 작업에서 시작하는 기본 모드입니다. `AGENTS.md`, `docs/00-layer-map.md`, workspace status, 직접 관련된 Source of Truth 문서만 읽습니다.

`Escalate Read`는 API, data, security, sync, quality, integration, decision risk가 보일 때 읽기 범위를 확장하는 모드입니다.

`Audit Read`는 전체 프로젝트 구조 점검, 위험 분석, 회고, migration, harness evaluation처럼 넓게 봐야 할 때 사용합니다.

핵심은 필요한 만큼만 읽되, 위험 신호가 보이면 주저하지 않고 확장하는 것입니다. 토큰이나 시간을 아끼겠다고 필요한 Source of Truth를 건너뛰면 안 됩니다.

## 실제 사용 예시

팀원은 긴 절차를 외울 필요가 없습니다. 짧은 자연어 명령으로 흐름을 시작할 수 있습니다.

새 기능을 시작할 때는 이렇게 말할 수 있습니다.

```text
feature/source-catalog workspace 만들어서 범위 초안 잡아줘
```

검증을 요청할 때는 이렇게 말할 수 있습니다.

```text
검증 돌려
```

PR 준비 상태를 보고 싶으면 이렇게 말할 수 있습니다.

```text
PR 준비 상태 확인해
```

AI가 next action menu를 제시한 뒤에는 짧게 답할 수 있습니다.

```text
1번으로 진행해
```

또는 보류를 선택할 수도 있습니다.

```text
보류하고 이유 남겨
```

이런 명령을 받으면 AI는 필요한 문서를 읽고, 상태를 갱신하고, gate가 필요한 지점에서는 사람에게 확인합니다.

## 팀원이 최소로 기억해야 할 것

협업 하네스의 모든 문서를 외울 필요는 없습니다. 처음에는 세 가지만 기억하면 됩니다.

첫째, 작업은 branch workspace로 시작합니다. 코드 변경만 하는 것이 아니라 작업 범위, 결정, 검증, sync 상태를 함께 남깁니다.

둘째, 중요한 결정은 confirmation gate에서 확인합니다. 범위, 계약, 검증, Git 원격 상태, 완료 판단은 사람이 확인해야 합니다.

셋째, 완료는 검증과 handoff까지 포함합니다. 구현이 끝났다는 말만으로는 부족하고, `quality.md`, `sync.md`, `report.md`에 근거가 남아야 합니다.

## 처음 도입할 때 추천 순서

처음부터 모든 규칙을 완벽하게 적용하려고 하면 부담이 큽니다. 작은 기능 하나로 시작하는 것이 좋습니다.

1. 작은 feature branch 하나를 고른다.
2. `scripts/start-workflow.sh` 또는 자연어 명령으로 branch workspace를 만든다.
3. `plan.md`에 범위와 제외 범위를 적는다.
4. 구현을 진행한다.
5. 테스트와 수동 검증 결과를 `quality.md`에 남긴다.
6. Source of Truth 영향이 있는지 확인한다.
7. `sync.md`에 Git과 PR 상태를 남긴다.
8. `report.md`로 handoff를 작성한다.
9. next action menu에서 PR, 보강, 보류, 다음 Phase 중 하나를 선택한다.

한 번 끝까지 통과해보면 팀에 맞는 부분과 무거운 부분이 보입니다. 이후 반복해서 문제가 되는 지점은 문서, 스크립트, validation, status 규칙으로 보강하면 됩니다.

## 정리

협업 하네스는 팀 작업에서 범위, 결정, 검증, Git 상태, 인계를 놓치지 않게 해주는 운영 체계입니다.

AI가 들어오면 작업 속도는 올라갑니다. 하지만 속도가 올라갈수록 잘못된 범위 확장, 검증 누락, 문서와 구현의 불일치, Git sync 문제도 빠르게 커질 수 있습니다. 협업 하네스는 이 위험을 줄이기 위해 branch workspace, Source of Truth, confirmation gate, quality gate, sync 기록, next action menu를 함께 사용합니다.

좋은 하네스는 사람을 절차에 가두지 않습니다. 오히려 작업 맥락이 사람을 따라오게 만듭니다.

최종적으로 만들고 싶은 상태는 단순합니다.

누가 이어받아도 현재 작업의 범위, 결정, 검증, 남은 리스크, 다음 행동을 바로 알 수 있는 팀.

협업 하네스는 그 상태를 만들기 위한 최소한의 운영 체계입니다.
