# Pull Request Checklist

## Branch Workspace

- Workspace path:
- Branch:
- Workspace state:
- Related Source of Truth docs:

## Shared Docs / 공유 문서

- [ ] 공유 Source of Truth 문서가 변경되었는가?
- [ ] 변경되었다면 `shared-docs.md`가 업데이트되었는가? 변경이 없으면 not applicable 기록
- [ ] 고영향 결정이 있다면 `decisions.md`에 accepted/deferred 상태가 기록되었는가?
- Notes:

## Git Sync

- [ ] `sync.md` Start Sync recorded
- [ ] `sync.md` Pre-Merge Sync result 또는 deferral reason recorded
- Linked GitHub issue:
- [ ] linked issue가 있으면 PR body에 `Closes #123` 같은 closing keyword가 포함되어 있는가?
- Notes:

## Quality Gates / 품질 게이트

- Quality gate status:
- [ ] `quality.md`에 TDD 상태가 기록되었는가?
- [ ] CI/check 명령을 실행했거나 skip reason을 기록했는가?
- [ ] `scripts/validate-harness.sh` 통과
- [ ] `scripts/validate-harness.sh --strict` 통과
- [ ] integration branch라면 `scripts/validate-harness.sh --integration` 통과 또는 deferral reason 기록

## Human Confirmations / 사람 확인

- Decision status:
- PR checklist readiness from `scripts/status-workflow.sh`:
- [ ] 필요한 confirmation gate가 해결되었는가?
- [ ] 남은 위험이 기록되었는가?

## Summary / 요약

- Changed:
- Verified:
- Remaining risks:
