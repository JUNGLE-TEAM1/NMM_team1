# M6 M5 CatalogSource adapter source branch 기록

이 branch가 다른 branch workspace에 의존하거나 여러 branch를 통합할 때 사용한다.

## Source Branch Workspaces / source branch workspace

- `docs/workflows/feature/m6-catalog-source-boundary`
- `docs/workflows/feature/m6-catalog-retrieval-scoring`

## Required Source Files / 읽어야 할 source 파일

각 source branch에서 아래 파일을 읽는다.

- `plan.md`
- `shared-docs.md`
- `report.md`
- `quality.md`
- `decisions.md`
- `confirmations.md`
- `sync.md`

## Source Branch Base Records / source branch 기준 기록

각 source branch를 읽은 Git 지점을 기록한다.

| Source Branch | Workspace | Base Commit | Read At | Notes |
| --- | --- | --- | --- | --- |
| `feature/m6-catalog-source-boundary` | `docs/workflows/feature/m6-catalog-source-boundary` | `8809880` 기준 main에 병합된 report/plan | 2026-06-26 | `CatalogSource` protocol과 fixture fallback 경계 확인 |
| `feature/m6-catalog-retrieval-scoring` | `docs/workflows/feature/m6-catalog-retrieval-scoring` | `8809880` 기준 main에 병합된 report/plan | 2026-06-26 | `CatalogRetriever`가 `CatalogSource` 결과만 소비하는 구조 확인 |

## Integration Notes / 통합 메모

- 이 branch는 독립 feature slice이며 source branch를 직접 통합하지 않는다. 이미 main에 병합된 M6 경계/검색 구조 위에 M5 store adapter만 추가한다.
