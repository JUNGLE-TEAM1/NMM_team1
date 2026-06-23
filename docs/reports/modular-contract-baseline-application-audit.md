# Modular Contract Baseline 적용 점검 보고서

## Short Report / 짧은 보고

- Type: audit
- Date: 2026-06-24
- Branch/work location: `docs/modular-contract-baseline`, `docs/workflows/docs/modular-contract-baseline`
- Changed: R0.5 보완으로 first parallel wave 후보, handoff template, mock/fake boundary guard가 추가됐다. 이 문서는 R0.5 변경사항이 Source of Truth, 하네스 규칙, validation, 병렬 실행 계약에 문제없이 적용됐는지 사후 점검한 evidence다.
- Verified: `scripts/validate-harness.sh`, `scripts/validate-harness.sh --strict`, YAML parse check, `git diff --check`
- Remaining: PR/push/handoff는 `Pre-PR Human Checkpoint` 선택 전까지 보류. 실제 병렬 workstream은 아직 시작하지 않았다.
- Next context: PR 처리 후 `.milestones/target-mvp/manifest.yaml` 기준으로 첫 병렬 wave를 열지 결정한다.
- Risk: R0.5는 planning/contract baseline이며 runtime implementation evidence는 아니다.

## 1. 결론

전체 판단: **문제없이 적용됨**

R0.5 변경은 기존 하네스의 `작업 하나 = Phase 하나`, Source of Truth 전파 규칙, `docs/17-parallel-milestone-protocol.md`, strict harness validation과 충돌하지 않는다. 기존 R1~R7도 삭제하지 않고 workstream alias로 보존되어 문맥 단절이 없다.

## 2. 변경 적용 상태

| 영역 | 적용 결과 | 판단 |
| --- | --- | --- |
| Product | R0.5와 R1~R7 workstream alias 구조가 `docs/01`에 반영됨 | 정상 |
| Interface | `docs/03`에 shared contract, owner workstream, mock/fake boundary 추가 | 정상 |
| Acceptance | `docs/05`에 R0.5와 Integration Spine checkpoint 추가 | 정상 |
| Regression | `docs/06`에 contract baseline 없이 병렬 workstream 시작 금지 guard 추가 | 정상 |
| Manual Verification | `docs/07`에 R0.5 수동 점검 절차 추가 | 정상 |
| Workflow | `docs/08`이 Workstream Pool + Integration Spine 중심으로 재정렬됨 | 정상 |
| Parallel Manifest | `.milestones/target-mvp/manifest.yaml`, `status.yaml`, `decisions.md` 추가 | 정상 |
| Handoff Template | `.milestones/target-mvp/handoffs/*.md` 추가 | 정상 |
| Evidence | R0.5 report와 이 audit report가 `docs/reports/README.md`에 연결됨 | 정상 |

## 3. 기존 구조와 충돌 여부

| 기존 구조/규칙 | 충돌 여부 | 근거 |
| --- | --- | --- |
| `AGENTS.md` 작업 하나 = Phase 하나 | 충돌 없음 | R0.5는 단일 docs Phase로 처리됨 |
| R1~R7 planning names | 충돌 없음 | 이름을 삭제하지 않고 workstream alias로 보존 |
| `feature/trust-state-model` strict anchor | 충돌 없음 | `docs/08`, manifest, status에 anchor 유지 |
| `docs/17-parallel-milestone-protocol.md` | 충돌 없음 | 새 규칙을 만들지 않고 기존 manifest 구조를 사용 |
| Current baseline vs Target MVP 분리 | 충돌 없음 | current baseline 문맥은 유지되고 R0.5는 Target MVP 실행 구조만 조정 |
| Historical reports | 충돌 없음 | 과거 report는 소급 수정하지 않음 |

## 4. Validation / CI 관점

| Check | Result | 비고 |
| --- | --- | --- |
| `scripts/validate-harness.sh` | passed | Source of Truth와 workspace 기본 구조 통과 |
| `scripts/validate-harness.sh --strict` | passed | complete workspace semantic checks 통과 |
| YAML parse check | passed | `.milestones/target-mvp/manifest.yaml`, `status.yaml` parse 가능 |
| `git diff --check` | passed | trailing whitespace나 patch format 문제 없음 |

CI에 새 job을 추가할 필요는 없다. 현재 변경은 docs/manifest-only이며 기존 harness validation과 strict validation으로 충분히 보호된다.

## 5. 수용 가능성

| 항목 | 판단 | 이유 |
| --- | --- | --- |
| R0.5 contract baseline | 즉시 수용 | 병렬 구현 전 공통 언어를 먼저 고정함 |
| Workstream Pool | 즉시 수용 | R1~R7을 보존하면서 병렬 실행 가능성을 열어줌 |
| Integration Spine | 즉시 수용 | 병렬 작업 후 합쳐 검증할 순서를 제공함 |
| `.milestones/target-mvp` manifest | 즉시 수용 | `docs/17` 프로토콜의 기존 형식을 따른다 |
| workstream handoff template | 즉시 수용 | 실제 병렬 실행 전 시작 조건과 mock/fake boundary를 반복 가능하게 만든다 |
| 첫 병렬 wave 후보 | 즉시 수용 | 후보 기록일 뿐 실행 승인이 아니므로 현재 Phase 범위를 넘지 않는다 |
| 실제 병렬 worktree 생성 | 보류 | 아직 PR/handoff 전이고 owner 배정이 없다 |
| runtime contract 구현 | 보류 | 이번 Phase 범위 밖 |

## 6. 남은 주의점

| 주의점 | 영향 | 완화 |
| --- | --- | --- |
| manifest scope가 실제 코드 구조와 100% 맞지 않을 수 있음 | 첫 병렬 branch에서 write scope overlap 가능 | workstream 시작 전 `scope.paths` 재확인 |
| Query/Ask/Recovery가 mock/fake boundary를 넘어갈 수 있음 | Trust/Policy 우회 위험 | branch `decisions.md`와 manifest contract 변경 gate 사용 |
| R0.5가 구현 완료처럼 오해될 수 있음 | Target MVP 진행 상태 착각 | report와 next action에서 runtime 구현 미시작을 명시 |
| local `main` checkpoint commit `b4a0fff`가 origin보다 앞섬 | PR 흐름에서 base가 특이해 보일 수 있음 | PR handoff 전 status와 sync.md에 이유 기록 |

## 7. 다음 권장 선택

1. `PR 진행`: R0.5 branch를 PR로 올리고 CI/merge/finalize를 진행한다.
2. `로컬 완료로 보류`: R0.5를 로컬에 두고 첫 병렬 wave 전에 재개한다.
3. `추가 수정`: manifest scope나 shared contract를 더 좁힌다.
4. `다음 Phase`: R0.5 PR 처리 후 첫 병렬 wave planning으로 넘어간다.

현재 권장은 **PR 진행**이다. 이 변경은 여러 Source of Truth와 `.milestones`를 건드리므로 main에 합쳐 팀 기준으로 고정한 뒤 병렬 workstream을 시작하는 편이 안전하다.
