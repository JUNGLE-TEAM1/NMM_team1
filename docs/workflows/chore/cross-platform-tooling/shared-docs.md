# Cross-platform tooling 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/04-development-guide.md` | WSL2 Tier 1 운영 기준에 `rg` fallback, host `node` optional 경계, same-shell worktree guidance, smoke auto fallback 설명을 반영 | 실제 WSL2 검증 결과와 Source of Truth를 맞춘다 | low |
| `docs/07-manual-verification-playbook.md` | Current Baseline 수동 검증에서 host `node` optional, smoke auto fallback 설명을 반영 | manual verification 경로를 실제 실행 기준과 맞춘다 | low |
| `docs/08-development-workflow.md` | `chore/cross-platform-tooling` 범위에 `rg` fallback, worktree metadata portability, Docker fallback을 명시 | follow-up Phase 정의를 실측 결과와 맞춘다 | low |
| `docs/manual-verification/00-environment-setup.md` | readiness 단계에서 `python3`/`python`, optional `rg`, optional host `node`, CRLF/worktree 점검을 반영 | 환경 준비 단계가 실제 WSL2 blocker를 포착하게 만든다 | low |

## Integration Notes / 통합 메모

- 제품 architecture/interface/acceptance contract는 바꾸지 않았다. development operations와 manual verification 기준만 WSL2 evidence에 맞춰 조정했다.

## Conflicts To Resolve / 해결할 충돌

- none
