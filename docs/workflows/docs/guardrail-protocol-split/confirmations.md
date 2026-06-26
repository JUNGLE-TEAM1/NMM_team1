# Guardrail protocol split 사람 확인 게이트

AI가 멈추고 사람 확인을 받아야 하는 지점을 기록한다.

## Scope Confirm / 범위 확인

- Status: confirmed
- Ask human to confirm:
  - branch/workspace
  - 포함 범위
  - 제외 범위
  - 영향받는 Source of Truth 문서
- Human response: 사용자가 guardrail/protocol split Phase 생성을 요청했고, 실제 GitHub/repository settings 변경은 제외하는 문서 정리 Phase로 범위를 확정함.

## Contract Confirm / 계약 확인

- Status: not needed
- Ask human to confirm:
  - data model 변경
  - interface/API/CLI/UI contract 변경
  - external dependency
  - 공유 Source of Truth 변경
- Human response: runtime data model, API/CLI/UI contract 변경 없음. 공유 Source of Truth 문서 구조만 변경 대상.

## Scope Change Confirm / 범위 변경 확인

- Status: not needed
- Ask human when:
  - 작업이 `plan.md` 범위를 넘을 때
  - 기능을 다른 branch로 분리해야 할 때
  - 구현 중 새 제품 결정이 드러날 때
- Human response: 

## Verification Confirm / 검증 확인

- Status: confirmed
- Ask human to confirm:
  - test/build/smoke 명령
  - TDD 증거 또는 skip reason
  - CI/check 명령
  - manual verification 경로
  - completion criteria
- Human response: `scripts/validate-harness.sh`, `scripts/validate-harness.sh --strict`, guardrail keyword `rg` 검색, `scripts/status-workflow.sh docs/workflows/docs/guardrail-protocol-split` 실행으로 확인.

## Quality Gate Confirm / 품질 게이트 확인

- Status: confirmed
- Ask human to confirm:
  - TDD 적용 또는 의도적 생략
  - 필요한 branch check와 CI gate
  - 생략한 검증과 이유
  - 관련 있는 deploy/publish gate
- Human response: 문서 구조 정리이므로 TDD 미적용. local equivalent checks passed. remote CI는 branch push/PR 전이라 실행하지 않음.

## Git Sync Confirm / Git sync 확인

- Status: recorded
- Ask human to confirm:
  - 구현 전 start sync command/result
  - mid-phase upstream change action
  - 완료 전 pre-merge sync command/result
- Human response: `scripts/start-workflow.sh docs guardrail-protocol-split "Guardrail protocol split"` 실행으로 branch/workspace 생성. 자동 pull/merge/rebase는 실행하지 않음.

## Sync Conflict Confirm / sync 충돌 확인

- Status: not needed
- Ask human when:
  - Phase 중 main이 바뀐 경우
  - 공유 Source of Truth 문서가 이 branch와 충돌하는 경우
  - merge/rebase/pull/PR merge/finalize/cleanup action이 필요한 경우
- Human response: 

## PR Conflict Confirm / PR 충돌 확인

- Status: not needed
- Ask human when:
  - GitHub PR이 conflict 상태를 보고하는 경우
  - `gh pr view` 또는 PR status에서 conflict가 의심되는 경우
  - 승인된 merge/rebase/pull 중 conflict가 발생한 경우
  - `git status`에 unmerged path가 있는 경우
  - Source of Truth proposal이 base/main 변경과 충돌하는 경우
- Confirm:
  - conflict type
  - affected files
  - resolution path
  - revalidation commands/result
- Relationship: `Sync Conflict Confirm`은 main/upstream sync 선택이고, `Integration Conflict Confirm`은 여러 source branch 계약 충돌 선택이다. `PR Conflict Confirm`은 open PR 또는 PR-ready branch의 conflict 해결 경로 선택이다.
- Human response:

## Completion Confirm / 완료 확인

- Status: confirmed
- Ask human to confirm:
  - 변경 요약
  - 검증 결과
  - 남은 위험
  - 다음 작업 문맥
- Human response: 사용자가 `pr 마무리해`라고 지시하여 변경 요약, 검증 결과, 남은 위험, 다음 작업 문맥을 확인한 것으로 기록하고 PR-ready 정리로 진행.
- AI summary for human confirmation:
  - 변경 요약: `docs/system-guardrails.md` 신설, Source of Truth 문서에 system guardrail / harness protocol 책임 분리 반영, issue/PR/Project lifecycle 책임 분리 반영.
  - 검증 결과: local harness validation과 strict validation 통과, guardrail keyword 검색 검토, workspace status 확인.
  - 남은 위험: 실제 GitHub branch protection, required checks, secret scanning, CODEOWNERS, environment protection, PR linked issue required check, Project automation은 아직 적용하지 않음.
  - 다음 작업 문맥: Pre-Merge Sync를 기록하고 PR-ready 여부를 결정한다.

## Integration Conflict Confirm / 통합 충돌 확인

- Status: not needed
- Ask human when:
  - 이 branch가 여러 source branch를 통합하는 경우
  - 공유 data model 또는 interface 충돌이 있는 경우
  - acceptance/regression/manual verification 경로가 충돌하는 경우
- Human response: 
