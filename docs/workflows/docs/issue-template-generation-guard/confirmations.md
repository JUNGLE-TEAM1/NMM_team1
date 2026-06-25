# 이슈 템플릿 생성 경로 보강 사람 확인 게이트

## Scope Confirm / 범위 확인

- Status: accepted
- Human response: 사용자가 하네스 보완 프롬프트 적용을 요청. 기존 remote issue/PR 수정은 하네스 보강 이후로 보류.

## Contract Confirm / 계약 확인

- Status: not needed
- Human response: 제품/API/schema/interface contract 변경 없음.

## Scope Change Confirm / 범위 변경 확인

- Status: not needed
- Human response: 추가 범위 없음.

## Verification Confirm / 검증 확인

- Status: accepted
- Human response: `scripts/test-harness.sh`, `scripts/validate-harness.sh`, `scripts/validate-harness.sh --strict`, `git diff --check`로 검증.

## Quality Gate Confirm / 품질 게이트 확인

- Status: accepted
- Human response: Harness behavior 변경이므로 TDD 적용, fake `gh` fixture와 static guard 추가.

## Git Sync Confirm / Git sync 확인

- Status: deferred
- Human response: branch는 `origin/main` detached 지점에서 새로 생성했고 pull/merge/rebase는 실행하지 않음. PR 전 필요 시 최신 main 확인.

## Sync Conflict Confirm / sync 충돌 확인

- Status: not needed
- Human response: 충돌 없음.

## PR Conflict Confirm / PR 충돌 확인

- Status: not needed
- Human response: PR conflict 없음.

## Completion Confirm / 완료 확인

- Status: ready-for-review
- Human response: 변경/검증 결과는 workspace report와 `docs/reports/issue-template-generation-guard.md`에 기록.

## Integration Conflict Confirm / 통합 충돌 확인

- Status: not needed
- Human response: integration branch가 아님.
