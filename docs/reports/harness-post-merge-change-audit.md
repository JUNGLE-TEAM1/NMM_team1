# Harness 변경사항 병합 후 점검 보고서

## Short Report / 짧은 보고

- Type: audit
- Date: 2026-06-24
- Changed: PR #45, #46, #47 병합 후 AskLake 하네스의 product rebaseline, milestone planning, `Pre-PR Human Checkpoint` 변경사항을 사후 점검했다.
- Verified: `scripts/test-harness.sh`, `scripts/validate-harness.sh`, `scripts/validate-harness.sh --strict`, `scripts/list-active-branches.sh`
- Remaining: `scripts/prepare-pr.sh --auto-pr` 명칭/정책 불일치, 남은 rescue stash, workspace sync metadata stale 가능성
- Next context: 다음 하네스 보강은 `prepare-pr` 명령명/문서 정렬 또는 rescue stash 정리 여부 결정
- Risk: 기능 검증은 통과하지만 사람이 읽는 운영 의미와 script 명령명이 일부 어긋난다.

---

## 1. 점검 범위

점검 대상 병합:

| PR | 상태 | 주요 변경 |
| --- | --- | --- |
| #45 | merged | Milestone planning layer, parallel milestone protocol, branch workspace 규칙 |
| #46 | merged | AskLake product rebaseline, Target MVP, current implementation baseline 분리 |
| #47 | merged | `Pre-PR Human Checkpoint`, status/validation/test harness 변경 |

Context Budget mode: Escalate Read

주요 확인 문서/스크립트:

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/08-development-workflow.md`
- `docs/09-collaboration-agreement.md`
- `docs/10-next-action-menu.md`
- `docs/11-git-sync-policy.md`
- `docs/12-quality-gates.md`
- `docs/13-human-command-flow.md`
- `docs/workflows/README.md`
- `scripts/status-workflow.sh`
- `scripts/validate-harness.sh`
- `scripts/test-harness.sh`
- `scripts/prepare-pr.sh`

## 2. 현재 상태

| 항목 | 상태 |
| --- | --- |
| current branch | `main` |
| remote sync | `main...origin/main`, clean |
| open PR | 없음 |
| remote workspace branch | 없음 |
| local validation | 통과 |
| rescue stash | 남아 있음: `scope-drift-rescue-product-rebaseline-pre-pr-checkpoint` |

## 3. 검증 결과

```bash
scripts/test-harness.sh
scripts/validate-harness.sh
scripts/validate-harness.sh --strict
scripts/list-active-branches.sh
```

결과:

- `scripts/test-harness.sh`: passed, 12 tests
- `scripts/validate-harness.sh`: passed
- `scripts/validate-harness.sh --strict`: passed
- `scripts/list-active-branches.sh`: open PR 없음, remote workspace branch 없음

## 4. 결론

전체 판단: **부분 보강 필요**

하네스는 현재 검증을 통과하고 PR/branch 상태도 깨끗하다. 다만 `Pre-PR Human Checkpoint` 정책 도입 후 `scripts/prepare-pr.sh --auto-pr`라는 명령명과 validation 기대가 남아 있어, 실제 동작보다 운영 의미가 헷갈릴 수 있다. 또한 scope drift 수습용 stash가 남아 있어 다음 작업자가 오해할 수 있다.

## 5. 주요 문제와 충돌사항

| ID | 문제 | 심각도 | 근거 | 영향 | 권장 처리 |
| --- | --- | --- | --- | --- | --- |
| H-1 | `--auto-pr` 명령명이 `Pre-PR Human Checkpoint` 정책과 의미상 충돌 | Medium | `scripts/prepare-pr.sh`는 `--auto-pr`를 “push + PR 생성” helper로 유지하고, `scripts/validate-harness.sh`도 `--auto-pr` 존재를 요구한다. 문서는 사람 승인 뒤 실행한다고 제한한다. | 새 agent/사람이 “자동 PR 생성이 다시 허용된다”고 오해할 수 있다. | 명령명을 `--approved-pr` 또는 `--handoff-pr`로 바꾸거나, 최소한 help text와 validation 메시지를 “human-approved helper”로 수정 |
| H-2 | `PR 진행` 승인 범위가 너무 넓다 | Medium | `docs/08`, `docs/11`, `docs/13`은 `PR 진행`을 push, PR 생성, CI 확인, merge, finalize, issue close, branch cleanup까지 포함한다고 정의한다. | 사람이 “PR만 올려”가 아니라 “PR 진행”이라고 말했을 때 merge까지 승인되는 범위가 예상보다 클 수 있다. | `PR 생성`, `PR merge/finalize`, `cleanup`을 단계별 checkpoint로 나누는 follow-up 검토 |
| H-3 | `Pre-PR Human Checkpoint` 기록 위치가 느슨하다 | Medium | `docs/12`는 `confirmations.md`, `sync.md`, 또는 `next-actions.md` 중 하나에 기록하면 된다고 한다. strict validation은 실제 checkpoint 필드 존재까지 강제하지 않는다. | 보고는 했지만 기록이 빠져도 strict validation이 놓칠 수 있다. | workspace schema에 `Pre-PR Human Checkpoint` 섹션을 추가하고 validation fixture 강화 |
| H-4 | rescue stash가 남아 있다 | Low | `git stash list`에 `scope-drift-rescue-product-rebaseline-pre-pr-checkpoint`가 남아 있다. | 이미 병합된 변경과 `.DS_Store`, local-only 파일이 섞인 백업이 다음 작업자에게 혼란을 줄 수 있다. | 사용자가 확인 후 `git stash drop stash@{0}` 또는 별도 archive 결정 |
| H-5 | Product Rebaseline 이후 workspace `sync.md`의 base metadata는 과거 rescue 맥락을 담고 있다 | Low | `docs/workflows/docs/product-rebaseline-trusted-platform/sync.md`, `docs/workflows/docs/pre-pr-human-checkpoint/sync.md`는 시작 당시 branch 전환을 하지 못한 사유를 기록한다. | 증거로는 사실이지만, 병합 후 읽으면 현재 PR 흐름과 다르게 보일 수 있다. | historical evidence로 유지하되, 필요 시 finalization note를 추가하는 별도 docs cleanup |
| H-6 | Product Rebaseline은 문서 목표를 크게 바꿨지만 구현은 아직 current baseline 상태다 | Medium | `README`, `docs/01~03`, `docs/05~08`은 Target MVP를 정의하지만 runtime code는 바뀌지 않았다. | 다음 작업자가 Target MVP가 이미 구현됐다고 오해할 수 있다. | 다음 Phase를 `feature/trust-state-model`로 시작하고, README/demo 문구에서 baseline demo임을 계속 유지 |

## 6. 충돌 없음으로 판단한 항목

| 항목 | 판단 | 이유 |
| --- | --- | --- |
| Product Rebaseline vs 기존 M0~M5 evidence | 충돌 없음 | 기존 pipeline MVP를 `Current implementation baseline`과 historical evidence로 분리했다. |
| Target MVP vs 장기 플랫폼 기능 | 충돌 없음 | Trino, external LLM, Kubernetes/Helm 등은 Decision 또는 후속 Phase로 남아 있다. |
| Pre-PR Checkpoint vs branch cleanup | 조건부 충돌 없음 | `PR 진행` 승인 후 cleanup은 허용되지만, `git branch -D`와 cloud/deploy/database cleanup은 별도 승인으로 남아 있다. |
| validation/test harness | 현재 통과 | `scripts/test-harness.sh`와 strict validation이 현재 문서 구조를 통과한다. |

## 7. 리스크 매트릭스

| 리스크 | 가능성 | 영향 | 현재 완화 | 추가 완화 |
| --- | --- | --- | --- | --- |
| agent가 `--auto-pr`를 자동 승인으로 오해 | Medium | Medium | 문서에서 `Pre-PR Human Checkpoint` 요구 | 명령명/help/validation wording 변경 |
| `PR 진행`이 merge까지 승인한다는 점을 사람이 놓침 | Medium | High | `PR만`, `초안 PR`, `머지는 보류` 제한 문구 존재 | 단계별 PR command vocabulary 추가 |
| checkpoint 기록 누락 | Medium | Medium | status menu와 docs가 요구 | strict validation에 checkpoint evidence field 추가 |
| Target MVP 구현 착각 | Low-Medium | Medium | README와 acceptance가 baseline과 target 분리 | 다음 Phase 시작 전 status summary에서 current implementation baseline 재확인 |
| rescue stash 방치 | Medium | Low | main clean, active branch 없음 | stash drop 또는 archive decision |

## 8. 권장 후속 작업

우선순위:

1. `scripts/prepare-pr.sh --auto-pr` 명칭/문구 정렬
   - 후보: `--approved-pr`, `--handoff-pr`, 또는 `--push --create-pr`만 사용
   - 같이 수정할 곳: `scripts/validate-harness.sh`, `scripts/test-harness.sh`, `docs/11-git-sync-policy.md`

2. `Pre-PR Human Checkpoint` evidence 강제
   - workspace `confirmations.md` 또는 `sync.md`에 명시 섹션 추가
   - strict validation fixture 추가

3. rescue stash 정리
   - 병합 결과 확인 후 `git stash drop stash@{0}`
   - 단, `.DS_Store`와 `docs/reports/milestone-completion-summary.md`가 필요한지 먼저 확인

4. 다음 제품 Phase 시작
   - 권장: `feature/trust-state-model`
   - 목표: Target MVP의 첫 구현 단위인 trust status / Publish Gate 모델 확정

## 9. 사람 확인 필요 항목

실제 후속 수정 전 확인할 질문:

1. `--auto-pr`를 이름까지 바꿀까, 아니면 help text만 “human-approved helper”로 고칠까?
2. 다음 Phase를 `feature/trust-state-model`로 시작할까?

Update after follow-up:

- `PR 진행` 단계별 분리는 현재 필요하지 않은 것으로 판단했다.
- rescue stash 삭제는 이번 하네스 보강 PR 범위 밖으로 두었다.
