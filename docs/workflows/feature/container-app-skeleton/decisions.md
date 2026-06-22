# Container app skeleton 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- Health API는 `/health`와 `/api/health`를 함께 제공한다. `/health`는 Kubernetes/readiness와 단순 container probe용, `/api/health`는 frontend/API base path 확인용이다.
- Local compose 기본은 backend 8000, frontend 3000을 유지하되 smoke script는 포트 충돌을 피하려고 18000/13000을 기본값으로 사용한다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| Health API path | `/health` + `/api/health` | 기존 K8s probe와 API base path 문서를 동시에 만족한다. | User approved M2 진행 / 2026-06-22 |
| Container local run | Docker Compose with backend/frontend services | 팀원이 같은 명령으로 build/run/smoke를 재현할 수 있다. | User approved M2 진행 / 2026-06-22 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| First source type | M3에서 CSV/local file 또는 PostgreSQL 선택 필요 | M2는 app/container skeleton만 다룬다. | M3 |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| Frontend static API URL | 환경별 API endpoint가 달라져야 하면 runtime env injection 또는 nginx proxy로 변경한다. | Follow-up decision |
| Docker dependency install | build 재현성이 더 중요해지면 package lock과 requirements lock을 별도 branch에서 강화한다. | Follow-up hardening |
