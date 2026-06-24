# Cross-platform tooling 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: tooling fixes and WSL2 revalidation completed
- Summary: WSL2 shell에서 harness validation, strict validation, harness regression, container smoke가 모두 통과했고, host `node` 부재와 mixed Git worktree auto-healing은 별도 follow-up으로 남는다.

## Recommended Next Action / 권장 다음 행동

- 이 변경을 docs + tooling 한 PR 범위로 정리할지 결정한다.
- Reason: 이번 Phase는 실행 evidence와 repo-local portability fix가 강하게 연결되어 있어 한 PR로 review 가능한 상태다.

## Options / 선택지

1. 현재 범위를 한 PR로 진행한다. `docs/reports/windows-wsl2-smoke-execution.md`, `docs/04`, `docs/07`, `docs/manual-verification/00`, `docs/08`, `scripts/*` portability 변경을 함께 리뷰한다.
2. native Windows PowerShell/CMD 지원 audit을 별도 다음 Phase로 연다.
3. host frontend direct run을 위해 `node` readiness를 보강하는 follow-up을 연다.
4. 로컬 완료로 보류하고 PR/merge는 나중에 판단한다.

## Waiting On Human / 사람 응답 대기

- not required in this turn; remote action은 아직 요청되지 않았다.

## Last User Choice / 마지막 사용자 선택

- Windows WSL2 실기 검증 결과 문서화와 tooling 보강을 한 번에 진행

## Next AI Action / 다음 AI 행동

- option 1이면 included/excluded file을 정리하고 PR-ready 요약을 만든다.
- option 2이면 native Windows 전용 acceptance/manual verification 후보를 만든다.
- option 3이면 host direct-run prerequisite를 별도 readiness Phase로 분리한다.
- option 4이면 `sync.md`와 `report.md`에 보류 이유와 재개 조건을 남긴다.
