# Project status lifecycle 노트

## 진행 메모

- `scripts/start-workflow.sh`의 branch start -> Project `In Progress` 동작은 유지했다.
- `scripts/prepare-pr.sh` PR 생성/감지 경로에 Project `Review` 전환을 추가했다.
- `scripts/prepare-pr.sh --close-issue` / `--finalize`의 Project `Done` 전환은 PR merge 이후 close/finalize 경로에만 남겼다.
- `scripts/status-workflow.sh`가 open PR + closed issue mismatch를 별도 warning/recommendation으로 표시하도록 했다.
- Remote operations reconciliation: linked issue `#87`이 PR reference 없이 `CLOSED`였으므로 `gh issue reopen 87`로 active branch issue 상태를 복구했다.

## 결정

- 상세 lifecycle은 `docs/11-git-sync-policy.md`에 두고, 다른 workflow 문서는 얇게 참조한다.

## 열린 질문

- 없음.

## 링크 / 증거

- Linked issue: https://github.com/JUNGLE-TEAM1/NMM_team1/issues/87
- `scripts/test-harness.sh` -> Harness regression tests passed: 24
- `scripts/validate-harness.sh` -> Harness validation passed.
- `scripts/validate-harness.sh --strict` -> Harness validation passed.
