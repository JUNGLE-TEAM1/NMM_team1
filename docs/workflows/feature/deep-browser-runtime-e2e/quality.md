# Deep browser runtime E2E 품질 기록

## 2026-06-30

- Context Budget mode: Lite Read. `AGENTS.md`, C31 `plan.md`, 관련 frontend route/query/catalog 코드만 읽었다.
- Build:

```bash
cd frontend
npm run build
```

- Result: pass. Vite production build 성공.

## Browser verification

- Tool: Browser plugin in-app browser.
- URL: `http://127.0.0.1:13011`
- Backend: `http://127.0.0.1:18000`

검증 결과:

- `/connections`: persisted External Connection 목록 확인.
- `/datasets/source`: Source Dataset metadata와 file-backed/snapshot evidence 확인.
- `/datasets/silver`: materialized Silver Dataset 확인.
- `/jobs/gold-build`: `dataset_lake_smoke_1782827819_82db2b` 수동 실행 클릭.
- `/runs`: run `a1770602-b400-42c5-82ba-c7f440dfd667`을 `succeeded`로 실행 완료.
- `/runs`: rows `6`, output `dataset_lake_smoke_1782827819_82db2b.parquet`, artifact `not_uploaded` 확인.
- `/catalog`: Catalog 등록 후 id `64a99c83-4fbc-4c84-82b1-863eb4092a15`, rows `6`, schema `7 fields`, local path 확인.
- `/query`: `위험 점수가 높은 상품 알려줘` 실행.
- `/query`: DuckDB SQL route, rows `6`, selected dataset `64a99c83-4fbc-4c84-82b1-863eb4092a15` 확인.
- `/query -> Catalog detail`: `/catalog`로 이동하고 live CatalogDataset `dataset_lake_smoke_1782827819_82db2b`가 선택되는지 확인.
- Console error: `[]`.

## Residual risk

- Browser back으로 `/query`에 돌아오면 이전 query result는 local component state라 유지되지 않는다. 데모 차단은 아니며, 필요하면 후속 Phase에서 query result persistence 또는 URL state로 분리한다.
