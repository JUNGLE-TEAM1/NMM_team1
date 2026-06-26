# M1 Week2 API Client 연결 공유 문서 변경

| File | Change | Reason | Risk |
| --- | --- | --- | --- |
| `frontend/src/api/week2Api.js` | Week2 M5/M6 API client 추가 | M1 live UI가 run/catalog/query API를 소비하기 위한 기반 | low |
| `frontend/src/api/asklakeClient.js` | Week2 API client export 추가 | 기존 frontend API import 진입점 유지 | low |
| `docs/workflows/feature/m1-week2-api-client/*` | Phase evidence 추가 | 하네스 완료 기준 충족 | low |

## Source of Truth 영향

- runtime API contract는 변경하지 않는다.
- existing Week2 API를 소비하는 frontend client만 추가한다.
