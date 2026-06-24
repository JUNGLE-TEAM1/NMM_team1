# Local environment requirements 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- Full Decision Option Brief not used. 이번 선택은 docs-only, reversible 하네스 기준 정리이며 비용/cloud/API/data 계약 변경이 없다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| 로컬 개발 권장 경로 | Docker Compose | host OS 차이를 줄이고 Dockerfile/package/requirements 기준을 재사용한다. | user request / 2026-06-24 |
| Windows 기본 지원 경로 | WSL2 + Docker Desktop integration + bash-compatible shell | 기존 `scripts/*.sh`가 bash/Unix toolchain을 전제로 한다. | user request / 2026-06-24 |
| native Windows PowerShell/CMD | Not yet guaranteed | 실제 evidence와 wrapper/tooling이 없다. | user request / 2026-06-24 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| host Python/Node version pinning | Docker Compose 경로가 우선이고 host native는 보조 경로다. | host native를 Tier 1로 올릴 때 | `chore/cross-platform-tooling` |
| PowerShell wrapper 또는 Python helper | 이번 Phase는 문서 기준 정리이며 tooling 구현은 범위 밖이다. | Windows native 지원을 공식화할 때 | `chore/cross-platform-tooling` |
| Windows actual smoke evidence | 현재 실행 환경이 Windows가 아니다. | Windows machine 또는 WSL2 환경 확보 시 | `docs/cross-platform-smoke-audit` |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| native Windows 미보장 | native PowerShell/CMD에서 팀원이 개발해야 하는 경우 | audit evidence를 먼저 만들고 wrapper/helper 필요성을 결정한다. |
