# Project issue link Hotfix 보고서

## Short Report / 짧은 보고

- Type: hotfix
- Date: 2026-06-25
- Changed: GitHub issue `#78`을 `JUNGLE-TEAM1` Project `3`에 연결하고 `In Progress`로 설정했다. 과거 closed issue 33개는 Project `3`에 추가하고 `Done`으로 설정했다. `scripts/start-workflow.sh`가 앞으로 생성하는 issue도 같은 Project에 자동 추가하고 `In Progress`로 설정하도록 수정했다. `scripts/prepare-pr.sh --close-issue` / `--finalize`는 linked issue가 closed이면 Project Status를 `Done`으로 설정한다. `sync.md`에는 `issue project result`가 기록되고 `scripts/status-workflow.sh`에도 표시된다.
- Verified: `gh project item-list 3 --owner JUNGLE-TEAM1 --limit 200 --format json`에서 `Done` 33개와 `In Progress` `#78` 확인. repo issue 중 Project 누락 0개 확인. `bash -n scripts/start-workflow.sh scripts/status-workflow.sh scripts/test-harness.sh`, `scripts/test-harness.sh`, `scripts/validate-harness.sh --strict` 통과.
- Remaining: current branch PR 범위 정리.
- Next context: future issue project add and status update require `gh` token with `project` scope.
- Risk: 권한 부족 환경에서는 project add/status update가 실패할 수 있으나 이제 `sync.md`에 실패 이유가 남는다.
