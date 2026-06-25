# Workflow harness slimdown 노트

## 진행 메모

- 2026-06-25: 현재 worktree가 `hotfix/remote-reconciliation-auto-pr`이고 원격 branch가 gone 상태이며, 기존 `docs/workflows/hotfix/remote-reconciliation-auto-pr/sync.md` 수정이 있었다. 해당 변경을 보호하기 위해 branch 전환 없이 `--no-checkout --no-issue`로 workspace만 생성했다.
- 2026-06-25: `docs/08-development-workflow.md`에서 하위 정책 문서의 상세 반복을 줄이고 canonical 문서 참조로 정리했다.
- 2026-06-25: 사용자 추가 요청으로 PR 템플릿과 자동 PR body 불일치를 보강했다. `scripts/prepare-pr.sh`는 `.github/pull_request_template.md`를 읽고 알고 있는 값만 채운다.
- 2026-06-25: GitHub Issue template title prefix와 prepare-pr fallback PR 제목을 한국어 기본값으로 바꿨다.

## 결정

- 새 규칙은 추가하지 않고 역할 경계와 참조만 정리했다.
- PR/merge/issue close 같은 원격 상태 변경은 하지 않고 로컬 dry-run/validation으로만 확인했다.

## 열린 질문

- 이 변경을 별도 PR로 올리려면 dirty hotfix workspace 변경과 분리된 branch 전환/commit 정리가 필요하다.

## 링크 / 증거

- `scripts/status-workflow.sh docs/workflows/docs/workflow-harness-slimdown`
