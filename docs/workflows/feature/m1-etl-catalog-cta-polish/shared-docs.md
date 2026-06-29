# M1 ETL Catalog CTA polish 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `frontend/src/app/App.jsx` | `/etl` Catalog detail CTA와 route helper를 live catalog detail URL 보존 방식으로 보강 | `m1-final-browser-smoke`에서 남긴 `/etl` CTA placeholder 회귀를 닫는다. | 낮음. M1 UI navigation 변경이며 backend/API/schema/data 변경 없음 |
| `docs/reports/m1-etl-catalog-cta-polish.md` | Phase 실행 증거 report 추가 | UI polish와 browser smoke evidence를 durable report로 남긴다. | 낮음. 증거 계층 추가 |

## Integration Notes / 통합 메모

- backend API, schema, data lineage, Product Health 최종 evidence에는 영향이 없다.

## Conflicts To Resolve / 해결할 충돌

- 없음
