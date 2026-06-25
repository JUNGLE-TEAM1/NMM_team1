# Auto PR Creation Policy 보고서

## Short Report / 짧은 보고

- Type: docs / harness policy
- Date: 2026-06-25
- Changed: PR-ready 조건이 충족되면 feature branch push와 PR 생성을 사람 추가 승인 없이 자동 진행하도록 `AGENTS.md`, workflow/Git sync/collaboration/menu/quality/human command 문서와 PR helper/status/validation/test harness를 정렬했다. `--auto-pr`를 기본 helper로 복원하고 `--approved-pr`는 호환 alias로 남겼다. 검수 후 workspace branch mismatch와 dirty worktree를 자동 PR blocker로 추가했다.
- Verified: `bash -n` for changed shell scripts passed; `scripts/test-harness.sh` passed 18 fixture tests; `scripts/validate-harness.sh --strict` complete-state rerun passed; `prepare-pr --auto-pr` wrong-branch smoke stopped before push as expected.
- Remaining: 실제 push/PR 생성/merge/finalize/cleanup은 report 작성 시점에는 실행하지 않았다. 현재 worktree에 unrelated dirty/untracked 파일이 있으므로 실제 PR 생성 전 included/excluded file list를 다시 확인해야 한다.
- Next context: 자동 PR 생성은 PR-ready stop condition이 clear일 때만 가능하다. PR 생성 뒤 merge/finalize/issue close/branch cleanup은 `Pre-PR Human Checkpoint`에서 사람이 `PR 진행`, `merge 진행`, 또는 동등한 승인을 선택한 뒤 진행한다.
- Risk: 원치 않는 자동 PR을 막기 위해 opt-out 문구(`PR 올리지 마`, `로컬에만 둬`, `보류`, `PR은 나중에`, `draft만`)와 conflict/scope drift/deploy/cloud/data migration stop condition을 유지했다.
