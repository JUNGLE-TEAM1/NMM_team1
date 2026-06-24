# WSL2 known gaps guidance 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- no high-impact option brief required; docs-only guidance preserves existing WSL2 Tier 1 policy

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| WSL2 remains Tier 1 | accepted | Windows 하네스 경로는 WSL2 + Docker Desktop integration으로 충분히 검증됨 | user prompt / 2026-06-24 |
| native Windows remains out of scope | accepted | PowerShell/CMD wrapper와 동등 실행 지원은 비용 대비 필요성이 낮음 | user prompt / 2026-06-24 |
| known gaps as docs guidance | accepted | CRLF와 Git metadata 혼용은 자동 복구보다 명확한 운영 지침이 안전함 | user prompt / 2026-06-24 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| native Windows PowerShell/CMD support | WSL2 Tier 1 경로가 충분함 | WSL2 없이 native shell만 허용되는 요구가 생길 때 | future audit/tooling Phase |
| host frontend direct-run readiness | Docker Compose Tier 1에는 host Node가 blocker가 아님 | host frontend 직접 실행을 공식 개발 경로로 올릴 때 | future host runtime Phase |
| existing clone automatic repair | 대량 renormalize나 metadata repair는 위험함 | 반복 실패 evidence가 생길 때 | future tooling Phase |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| WSL2 guidance | Windows WSL2 validation fails again due to unclear docs | add focused troubleshooting note |
