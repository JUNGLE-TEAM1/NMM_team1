# Target MVP 병렬 Workstream 재정렬 분석

## Short Report / 짧은 보고

- Type: analysis
- Date: 2026-06-24
- Changed: 없음. 이 문서는 R0 이후 Target MVP 계획을 선형 R1~R7 queue에서 `Contract Baseline -> Workstream Pool -> Integration Spine` 구조로 재정렬할 때의 충돌과 하네스 영향만 분석한다.
- Verified: `AGENTS.md`, `docs/00-layer-map.md`, `docs/08-development-workflow.md`, `docs/17-parallel-milestone-protocol.md`, `docs/03`, `docs/05~07` 문맥 검토
- Remaining: 실제 Source of Truth 재정렬은 별도 R0.5 Phase에서 사람 승인 뒤 진행해야 한다.
- Next context: `docs/modular-contract-baseline` 또는 동등한 R0.5 Phase를 만들지 결정한다.
- Risk: R1~R7을 완전히 삭제하면 CI guard와 acceptance checkpoint가 깨질 수 있으므로, 먼저 mapping/alias를 둔 뒤 workstream 구조로 전환해야 한다.

## 1. 결론

전체 판단: **부분 재정렬 권장**

`Contract-first modular architecture` 방식은 현재 하네스와 충돌하지 않는다. 다만 기존 `Product Rebaseline Queue`와 `Target MVP 마일스톤 수용 체크포인트`가 R1~R7 선형 이름을 사용하고 있으므로, 바로 제거하지 말고 R0.5에서 병렬 workstream 구조로 재해석해야 한다.

## 2. 현재 구조 요약

| 항목 | 현재 상태 | 의미 |
| --- | --- | --- |
| R0 | 완료 | Product Rebaseline과 문맥 guard 완료 |
| R1~R7 | `docs/01`, `docs/05`, `docs/08`에 후보로 존재 | 순서형 Phase queue처럼 보임 |
| 병렬 프로토콜 | `docs/17-parallel-milestone-protocol.md`에 이미 존재 | 새 하네스 규칙을 크게 만들 필요 없음 |
| CI guard | `scripts/validate-harness.sh --strict`가 `feature/trust-state-model` 앵커를 검사 | R1 이름을 바로 없애면 validation 실패 가능 |

## 3. 재정렬 방식

권장 구조:

```text
R0 Product Rebaseline
-> R0.5 Modular Contract Baseline
-> Target MVP Workstream Pool
-> Integration Spine Checkpoints
```

R0.5는 구현 milestone이 아니라 병렬 실행을 가능하게 하는 공통 계약 Phase다.

R0.5에서 확정할 최소 항목:

- `Dataset`, `DatasetStatus`, `TrustGateResult`
- `SourceConnection`, `SchemaSnapshot`
- `JobRun`, `TaskRun`, `AuditEvent`
- `PolicyDecision`
- `EvidenceItem`, `RetrievalTrace`
- `AssetImpact`, `RecoveryAction`
- module ownership
- allowed write scope
- mock/fake adapter 허용 범위
- integration checkpoint와 demo spine

## 4. 기존 구조와 충돌 분석

| 영역 | 충돌 여부 | 내용 | 권장 처리 |
| --- | --- | --- | --- |
| `docs/08` Product Rebaseline Queue | 조건부 충돌 | 현재 R1~R7이 선형 Phase 후보로 표현됨 | R0.5에서 `Target MVP Workstream Pool`로 재작성하거나 R1~R7 alias를 남김 |
| `docs/05` Target MVP 체크포인트 | 조건부 충돌 | R1~R7 이름으로 acceptance checkpoint가 있음 | Workstream checkpoint로 바꾸되 기존 R번호 mapping 유지 |
| `docs/17` Parallel Milestone Protocol | 충돌 없음 | 이미 manifest, scope, dependency, contract, integration order를 다룸 | 새 규칙보다 이 문서를 적용 |
| `AGENTS.md` 작업 하나 = Phase 하나 | 충돌 없음 | R0.5도 하나의 Phase로 수행 가능 | 한 요청에서 R0.5와 여러 구현 workstream을 동시에 시작하지 않음 |
| `docs/03` Interface | 보강 필요 | Target interface family는 있으나 병렬 구현용 최소 schema는 아직 얇음 | R0.5에서 shared contract baseline으로 구체화 |
| `docs/06` Regression | 충돌 없음 | Trust Gate 없이 Query/Ask 진행 금지 guard가 있음 | 병렬 Query/Ask는 mock policy로만 허용 |
| CI guard | 충돌 가능 | `feature/trust-state-model` 앵커를 strict validation이 요구 | R0.5에서 guard를 `contract baseline 또는 trust workstream` 앵커로 갱신 |

## 5. 하네스 규칙 추가 필요 여부

판단: **새 규칙 대량 추가는 불필요**

이미 있는 규칙으로 충분한 것:

- `docs/17-parallel-milestone-protocol.md`
- `.milestones/M*/manifest.yaml`
- workstream `scope.paths`
- `contracts`
- `integration.merge_order`
- `handoffs/{WORKSTREAM_ID}.md`
- `docs/workflows/` Phase workspace
- `shared-docs.md`, `decisions.md`, `quality.md`, `sync.md`

필요한 것은 새 규칙이 아니라 **AskLake Target MVP에 맞춘 적용 문서와 manifest 초안**이다.

다만 R0.5에서 최소 보강이 필요한 항목:

| 후보 | 필요성 | 이유 |
| --- | --- | --- |
| `docs/08` queue 재정렬 | 필요 | 선형 R1~R7이 병렬 계획과 혼동될 수 있음 |
| `docs/03` shared contract baseline | 필요 | 병렬 구현의 계약 의존성을 줄이기 위함 |
| `.milestones/target-mvp/manifest.yaml` | 권장 | workstream ownership, contract, integration spine을 기계 판독 가능하게 고정 |
| `scripts/validate-harness.sh` product context guard 갱신 | 조건부 필요 | `feature/trust-state-model` 앵커 변경 시 필요 |
| `docs/17` 새 규칙 추가 | 불필요 | 현재 프로토콜이 이미 충분함 |

## 6. 권장 Workstream Pool

| Workstream | 병렬 가능성 | 필요한 공통 contract | 통합 checkpoint |
| --- | --- | --- | --- |
| Catalog / Trust | 높음 | `Dataset`, `DatasetStatus`, `TrustGateResult` | Spine 1 |
| Source Connector | 높음 | `SourceConnection`, `SchemaSnapshot` | Spine 1 |
| Job / Orchestrator | 높음 | `JobRun`, `TaskRun`, `AuditEvent` | Spine 2 |
| Query / Policy | mock 기반으로 가능 | `DatasetRef`, `PolicyDecision`, `QueryExecution` | Spine 2 |
| Ask / Evidence | mock 기반으로 가능 | `EvidenceItem`, `RetrievalTrace`, `PolicyDecision` | Spine 3 |
| Recovery / Operate | fixture 기반으로 가능 | `AssetImpact`, `RecoveryAction`, `JobRun` | Spine 3 |
| Packaging | 병렬 가능 | `ModuleHealth`, config/secret contract | Release checkpoint |

## 7. Integration Spine 제안

| Checkpoint | 목표 | 포함 workstream |
| --- | --- | --- |
| Spine 0. Contract Baseline | shared schema/state/event와 mock boundary 확정 | R0.5 |
| Spine 1. Trusted Dataset Draft | source에서 dataset draft가 생성되고 trust gate reason을 가진다 | Catalog/Trust, Source Connector |
| Spine 2. Governed Query | Trusted 또는 Blocked 상태와 policy decision으로 query 허용/차단을 검증한다 | Job, Query/Policy |
| Spine 3. Evidence & Recovery | Ask/Evidence와 Recovery가 같은 dataset/policy/audit contract를 공유한다 | Ask/Evidence, Recovery |
| Release Checkpoint | local/container/dev-lite smoke와 secret/config 검증 | Packaging |

## 8. R1~R7을 어떻게 다룰지

권장: R1~R7을 즉시 삭제하지 않고, R0.5에서 아래처럼 의미를 바꾼다.

| 기존 R번호 | 새 해석 |
| --- | --- |
| R1 Trust State Model | Catalog / Trust workstream |
| R2 Control Plane Job State | Job / Orchestrator workstream |
| R3 Source 확장 | Source Connector workstream |
| R4 Query와 권한 Preflight | Query / Policy workstream |
| R5 Ask와 Evidence | Ask / Evidence workstream |
| R6 Operate와 Recovery | Recovery / Operate workstream |
| R7 Packaging 안정화 | Packaging workstream |

즉 R번호는 historical planning alias로 남기고, 실행은 workstream과 integration checkpoint 중심으로 바꾸는 것이 안전하다.

## 9. R0.5 Phase 제안

- Phase name: `docs/modular-contract-baseline`
- 목표: Target MVP를 병렬 workstream으로 실행할 수 있게 shared contract, module ownership, mock boundary, integration spine을 확정한다.
- 포함 범위:
  - `docs/03-interface-reference.md` shared contract baseline 보강
  - `docs/08-development-workflow.md`의 R1~R7 queue를 Workstream Pool + Integration Spine로 재정렬
  - `docs/05~07`의 milestone checkpoint를 workstream/integration checkpoint 기준으로 연결
  - 필요 시 `.milestones/target-mvp/manifest.yaml` 초안 생성
  - product context strict guard 갱신
- 제외 범위:
  - runtime code 구현
  - 실제 병렬 worktree/thread 생성
  - 모든 schema의 상세 endpoint 확정
  - Trino, 외부 LLM, Kubernetes cloud deploy 필수화
- 완료 기준:
  - 병렬 가능한 workstream 목록과 allowed write scope가 있다.
  - shared contracts가 최소 schema/state/event 수준으로 정의되어 있다.
  - mock/fake adapter 허용 범위가 명확하다.
  - integration checkpoint가 최소 2~3개로 정의되어 있다.
  - strict harness validation이 통과한다.

## 10. 사람 확인 질문

R0.5 전에 답하면 좋은 질문:

1. R1~R7 이름을 완전히 바꿀까, 아니면 workstream alias로 남길까?
2. `.milestones/target-mvp/manifest.yaml`을 R0.5에서 바로 만들까?
3. 첫 병렬 wave를 `Catalog/Trust + Source Connector + Job/Orchestrator + Query/Policy mock`으로 잡아도 되는가?
4. Query/Ask workstream은 실제 Trust 구현 전까지 mock/fake policy로 개발해도 되는가?
5. R0.5에서 `docs/03`의 shared contract를 어느 정도까지 구체화할 것인가?
