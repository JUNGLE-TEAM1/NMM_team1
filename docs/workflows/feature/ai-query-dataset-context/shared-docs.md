# AI query dataset context 공유 문서 영향

| 문서 | 변경 | 이유 | 위험 |
| --- | --- | --- | --- |
| `docs/03-interface-reference.md` | M6가 nested CatalogMetadata shape와 Product Health Catalog 등록 PR의 top-level alias를 모두 읽을 수 있음을 명시 | PR 5/6과 PR 7 contract mismatch를 줄이기 위해 | 낮음 |
| `docs/06-regression-and-failure-scenarios.md` | DuckDB SQL runtime guard에 local `storage_uri`와 output path 추측 금지 추가 | M6가 CatalogMetadata 경계 밖에서 path를 추측하지 않게 하기 위해 | 낮음 |

## 검토했지만 수정하지 않은 문서

- `docs/05-acceptance-scenarios-and-checklist.md`: 이미 `gold_product_health` output을 M6가 SQL로 조회한다는 acceptance가 있어 추가 수정하지 않았다.
- `docs/07-manual-verification-playbook.md`: 이미 Product Health E2E manual verification에 M6 SQL/DuckDB/evidence 확인 단계가 있어 추가 수정하지 않았다.
