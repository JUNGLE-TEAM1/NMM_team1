# Parallel Milestone Protocol

이 문서는 사용자가 `병렬`, `병렬 마일스톤`, `병렬 리팩토링`, `parallel milestone`, `parallel worktree`를 명시했을 때 적용하는 병렬 실행 규칙이다.

## 목적

병렬 작업은 자유형 TODO나 임시 회의록으로 운영하지 않는다. 병렬 worktree/thread/agent가 같은 의미를 공유하도록 기계 판독 가능한 실행 매니페스트를 만든다.

이 프로토콜은 Git, 브랜치 전략, Phase Workflow, 이슈 관리, 기존 문서 체계를 대체하지 않는다. 병렬 실행을 위한 얇고 엄격한 계약 레이어로만 사용한다.

Milestone은 상위 계획 단위이고, Phase는 실제 실행 단위다.
이 문서의 milestone protocol은 여러 workstream, thread, worktree, 또는 milestone 간 실행 계약이 필요할 때 사용하는 선택적 레이어다.
일반 구현과 검증은 여전히 `docs/workflows/`의 Phase/branch workspace 흐름을 따른다.
Independent milestone 하나 또는 충돌 위험이 낮은 independent milestone 여러 개는 `.milestones` manifest 없이 각자의 Phase/branch workspace만으로 진행할 수 있다.

## 적용 기준

적용한다:

- 병렬 worktree/thread가 2개 이상 필요하다.
- frontend/backend/test/documentation 등 write scope를 분리할 수 있다.
- API, schema, event, file ownership, integration order가 여러 작업에 걸친다.
- 병렬 리팩토링에서 충돌 위험을 먼저 고정해야 한다.
- 서로 다른 사람이 독립 milestone을 병렬로 진행하되 scope, dependency, shared contract를 기계 판독 가능하게 고정해야 한다.

적용하지 않는다:

- 단일 버그 수정
- 한 파일 변경
- 짧은 리팩터
- 오타, 작은 문서 문장, UI copy, 테스트 이름, README 또는 설정값의 작은 업데이트
- scope 분리가 불가능한 작업

적용하지 않는 경우에도 기존 Phase Workflow는 유지한다.
작은 변경은 lightweight Phase로 처리하고, milestone protocol이 과한 이유를 `notes.md` 또는 `report.md`에 짧게 남긴다.

## Milestone 유형

- Independent milestone: 다른 milestone 완료를 기다리지 않고 자기 Phase, branch workspace, PR로 완료 가능하다.
- Dependent milestone: API, schema, data model, runtime, shared docs 등 다른 milestone 결과에 의존한다.
- Integration milestone 또는 integration Phase: 둘 이상의 완료 branch를 함께 합쳐 검증해야 할 때만 생성한다.

integration branch/workspace는 항상 필수가 아니다.
늦는 milestone은 명시적 의존성이 없는 한 전체 진행을 자동으로 막지 않는다.

공유 API, schema, data model, shared Source of Truth 변경이 필요하면 manifest의 `contracts`, 관련 Phase의 `shared-docs.md`, 또는 `decisions.md`에 기록한다.
공유 계약이 불명확하면 바로 구현하지 말고 선행 contract milestone 또는 shared Source of Truth Phase로 분리하는 것을 권장한다.

## 함께 쓰는 방식

이 protocol은 independent milestone 운영과 충돌하지 않는다.
필요한 조정 강도에 따라 아래처럼 선택한다.

- 독립 milestone 하나만 있음: `.milestones` manifest 없이 Phase/branch workspace로 진행 가능.
- 독립 milestone 여러 개가 동시에 진행되지만 scope가 명확함: 각 milestone의 Phase/branch workspace와 PR로 진행 가능.
- 동시에 진행되는 milestone들이 shared API, schema, data model, shared docs, file ownership, integration order를 공유함: `.milestones/M*/manifest.yaml` 사용 권장.
- 둘 이상의 완료 branch를 함께 합쳐 검증해야 함: integration Phase 또는 integration milestone 생성.

## Manifest와 Phase Workspace 책임

`.milestones/M*/manifest.yaml`이 담당하는 것:

- milestone/workstream 소유 범위
- milestone 간 의존성
- shared contract
- allowed write scope
- integration 필요 여부
- merge order
- milestone-level done criteria

`docs/workflows/...` branch workspace가 담당하는 것:

- 해당 Phase의 실제 구현 계획
- 실행한 검증과 품질 증거
- Git sync 상태
- Phase 단위 decisions/confirmations
- Source of Truth impact 기록
- Phase report와 handoff context

manifest를 사용하는 병렬 milestone에서는 실행 범위, 소유권, 의존성, shared contract, 완료 기준은 manifest가 우선한다.
Phase workspace 문서가 manifest와 충돌하면 구현을 계속하지 말고, manifest 또는 workspace 중 어느 쪽을 수정할지 사람 확인을 받는다.
제품 요구사항이나 장기 architecture 자체를 바꾸는 경우 manifest가 임의로 덮어쓰지 않는다. 기존 Source of Truth와 사람 확인이 필요하다.

## Rolling Milestone Planning

모든 milestone을 처음부터 한 번에 정할 필요는 없다.
전체 그림이 불명확하면 현재 요청을 provisional milestone로 잡고, 당장 필요한 첫 Phase만 얇게 계획한다.

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

## 디렉터리 구조

병렬 마일스톤을 시작할 때 다음 구조를 생성하거나 갱신한다.

```text
.milestones/
  M{number-or-slug}/
    manifest.yaml
    status.yaml
    decisions.md
    handoffs/
      {WORKSTREAM_ID}.md
```

## Manifest

`.milestones/M*/manifest.yaml`은 병렬 실행의 source of truth다.

최소 필드:

```yaml
schema_version: 1

milestone:
  id: M1
  title: "..."
  status: active
  execution_mode: parallel_worktree
  integration_owner: main_thread

objective: "사용자 기준 완료 목표"

context_documents:
  required: []
  optional: []
  authority_rules:
    execution: manifest
    product_requirements: product_docs
    architecture: adr_or_architecture_docs
    api_contract: manifest.contracts

workstreams:
  - id: FE
    type: frontend
    owner: unassigned
    status: ready
    scope:
      paths: []
    depends_on: []
    deliverables: []
    conflict_policy: owns_scope_only

contracts:
  api: []
  schemas: []
  events: []

done_criteria:
  - id: DC1
    description: "..."
    verification: []

integration:
  branch_prefix: codex/M1-
  integration_branch: codex/M1-integration
  merge_order: []
  conflict_policy: main_thread_resolves
  final_verification: []
```

독립 milestone만 운영하고 함께 합쳐 검증할 branch가 없으면 `integration.integration_branch`는 빈 값 또는 `not required`로 기록할 수 있다.
`merge_order`는 명시적 의존성이 있거나 함께 통합할 branch가 있을 때만 채운다.

## Status

`.milestones/M*/status.yaml`은 실행 상태를 추적한다.

포함 항목:

- workstream id
- assigned thread/worktree/branch
- status: `ready`, `in_progress`, `blocked`, `completed`, `integrated`
- last_update
- blockers
- handoff path

## Decisions

`.milestones/M*/decisions.md`는 사람이 읽는 결정 기록이다. source of truth는 아니다.

기록 항목:

- 날짜
- 결정
- 이유
- 영향받는 workstream
- manifest 변경 여부

실행 범위, 소유권, 계약, 완료 기준은 `manifest.yaml`이 우선한다.

## Context Documents

병렬 작업 전 모든 문서를 읽히지 않는다. 필요한 문서만 큐레이션한다.

문서 포함 기준:

```text
이 문서를 읽지 않으면 해당 workstream이 잘못 구현할 가능성이 10% 이상인가?
```

그렇다면 `required`에 넣는다. 아니면 `optional`로 둔다.

각 문서는 다음 정보를 가진다.

- id
- path
- purpose
- applies_to
- required/optional
- authority

문서 충돌 시 기본 우선순위:

1. `manifest.yaml`: 실행 범위, 소유권, 의존성, 완료 기준
2. `manifest.contracts`: API/schema/event 계약
3. ADR 또는 architecture docs: 장기 구조 결정
4. PRD 또는 product docs: 제품 요구사항
5. `decisions.md`: 마일스톤 중 보조 결정 기록

제품 요구사항 자체를 바꾸는 경우 manifest가 임의로 덮어쓰지 않는다. 사용자 확인 또는 명시적 결정 기록이 필요하다.

## 실행 절차

사용자가 `병렬 마일스톤 만들어줘`라고 하면:

1. 프로젝트 구조와 기존 문서, 테스트, 브랜치 규칙을 파악한다.
2. milestone이 필요한지, lightweight Phase로 충분한지 먼저 분류한다.
3. `manifest.yaml`, `status.yaml`, `decisions.md` 초안을 만든다.
4. workstream을 나누고 각 scope path를 지정한다.
5. 의존성, 계약, 완료 기준, 통합 순서를 명시한다.
6. scope 충돌, 순환 의존성, 누락된 required 문서, 빈 완료 기준을 점검한다.
7. 아직 실행 요청이 명확하지 않으면 worktree/thread 생성은 계획까지만 제시한다.

사용자가 `병렬로 진행해줘`, `병렬 실행해줘`, `worktree까지 만들어줘`라고 하면:

1. manifest 검증 후 각 workstream을 별도 thread/worktree/branch로 분리한다.
2. 각 작업자에게 담당 scope, 참조 문서, 완료 기준, handoff 위치를 전달한다.
3. 각 작업자는 자기 scope만 수정한다.
4. 계약 변경이 필요하면 코드만 바꾸지 말고 `manifest.contracts` 또는 `decisions.md` 변경을 포함한다.
5. main thread는 `status.yaml`을 갱신하고 통합을 담당한다.
6. `integration.merge_order`에 따라 병합한다.
7. `integration.final_verification` 명령을 실행한다.
8. 완료되면 milestone status를 `completed`로 바꾸고 archive한다.

## Workstream 분리 규칙

workstream은 가능한 한 disjoint write scope를 가져야 한다.

좋은 분리:

- FE: `frontend/**`
- API: `backend/**`
- DB: `backend/app/db/**` 또는 migration 경로
- QA: `backend/tests/**`, frontend test 경로
- Docs: `docs/**`

나쁜 분리:

- Worker A와 Worker B가 같은 component 또는 service 파일을 동시에 수정한다.
- API 계약이 정해지지 않았는데 FE/API를 독립 구현한다.
- 공통 유틸 파일을 여러 작업자가 동시에 리팩토링한다.

scope가 겹치면 병렬 실행 전에 다음 중 하나를 선택한다.

- scope를 다시 나눈다.
- shared owner를 지정한다.
- 선행 작업으로 공통 계약 또는 리팩토링을 먼저 수행한다.
- 병렬이 부적절하다고 판단하고 순차 실행을 제안한다.

## Handoff

각 workstream 완료 시 `.milestones/M*/handoffs/{WORKSTREAM_ID}.md`를 남긴다.

포함 항목:

- 담당 workstream
- 변경 파일
- 구현 내용
- 계약 변경 여부
- 실행한 검증 명령
- 실패한 검증 또는 미실행 검증
- 남은 리스크
- 통합 시 주의점

## 팀원 전달 형식

다른 팀원이 이 프로토콜 전체를 알 필요는 없다. 각 팀원에게는 다음만 전달한다.

- 브랜치/worktree
- 담당 workstream
- 수정 허용 scope
- 참조해야 할 required 문서
- deliverables
- done criteria
- handoff 위치

## 최종 응답

병렬 프로토콜을 적용했다면 최종 응답에 다음을 간단히 포함한다.

- 생성/수정한 milestone 경로
- workstream 목록
- 병렬 실행 가능 여부
- 실제 생성한 thread/worktree/branch 목록
- 다음 통합 단계
- 실행한 검증
