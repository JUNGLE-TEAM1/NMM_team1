# Cross-platform tooling 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- not needed

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| shell line ending portability | repo-local `.gitattributes`로 `*.sh` LF checkout 강제 | WSL2 direct execution을 repo 차원에서 가장 작게 고칠 수 있는 선택이었다. 기존 clone에 남은 CRLF는 재checkout guidance로 분리한다. | user directive to proceed / 2026-06-24 |
| `rg` dependency handling | Python fallback search backend 추가 | WSL2 shell에서 WindowsApps `rg`가 permission denied라서 harness/status/test script가 noisy failure를 냈다. host install 대신 repo-local fallback이 더 안전했다. | user directive to proceed / 2026-06-24 |
| Docker smoke fallback | classic builder + temporary local `DOCKER_CONFIG` auto retry | buildx plugin과 `docker-credential-desktop.exe`가 없을 때도 public-image smoke는 local-only fallback으로 계속 진행할 수 있었다. | user directive to proceed / 2026-06-24 |
| WSL worktree 생성 방식 | WSL shell에서 사용할 worktree는 WSL git으로 생성 | Windows Git으로 만든 worktree metadata는 WSL git에서, WSL git으로 만든 metadata는 Windows Git에서 깨지는 실측 문제가 있었고, 자동 복구보다 명확한 진단/문서화가 우선이었다. | user directive to proceed / 2026-06-24 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| host `node` install | Docker Compose Tier 1 경로 검증에는 필요하지 않았고, 이번 Phase 범위는 repo-local tooling 보강에 한정된다. | host frontend direct run을 Tier 1 또는 공식 보조 경로로 더 강하게 보장해야 할 때 | `chore/cross-platform-tooling` follow-up 또는 native host readiness Phase |
| mixed Windows Git / WSL git worktree auto-healing | 현재는 clearer error message와 docs guidance까지 보강했다. metadata를 자동 변환하는 로직은 Git implementation 차이를 더 넓게 테스트해야 한다. | 같은 repo를 양쪽 Git 구현으로 자주 오가야 하는 운영 요구가 생길 때 | 별도 worktree portability audit |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| Python `rg` fallback 유지 여부 | WSL2/CI 환경에서 usable `rg`가 항상 보장되는 정책으로 바뀌면 | helper 유지 필요성을 다시 평가하고, script complexity를 줄일 수 있는지 검토한다 |
| Docker smoke auto fallback 유지 여부 | buildx plugin과 credential helper 경로가 모든 Tier 1 환경에서 안정화되면 | smoke script에서 fallback을 optional log path로 낮출 수 있는지 검토한다 |
