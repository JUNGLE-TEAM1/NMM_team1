# B2B SaaS positioning alignment 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- 사용자가 기존 방향이 B2B SaaS였다고 확인했으므로 별도 후보 비교 없이 Source of Truth 표현 정렬로 처리했다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| 제품 포지셔닝 | B2B SaaS | README의 `self-hosted` 표현이 원래 제품 방향과 다르다는 사용자 확인 | 사용자 요청 / 2026-06-25 |
| MVP 실행 환경 | local/container 단일 Demo Tenant | SaaS 제품 방향과 로컬 MVP 검증 환경을 분리하기 위해 | 사용자 대화 / 2026-06-25 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| 상용 SaaS 운영 구현 | 이번 작업은 문서 포지셔닝 정렬이며 운영 구현 범위가 아니다. | production-grade multi-tenancy, cloud deploy, billing, tenant isolation을 다룰 때 | 별도 Product/Architecture/Packaging Phase |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| 제품 포지셔닝 | 이해관계자가 self-hosted 우선 제품으로 다시 결정하는 경우 | README와 Product Source of Truth를 다시 정렬한다. |
