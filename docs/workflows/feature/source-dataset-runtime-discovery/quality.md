# Source dataset runtime discovery 품질 기록

## Context Budget

- Mode: Escalate Read
- 이유: Source Dataset 생성 조건, runtime connector boundary, schema discovery/credential 경계가 함께 걸려 있다.
- 읽은 문서: `AGENTS.md`, `docs/08-development-workflow.md` C-26 구간, `docs/workflows/feature/source-dataset-runtime-discovery/plan.md`, C-25A report, 관련 `frontend/src/app/App.jsx` 구간
- 사용 skill/tool: browser automation, curl smoke

## 검증 명령

```bash
npm --prefix frontend run build
curl -s http://127.0.0.1:18000/api/source-datasets
```

- 결과: frontend build 성공.
- 결과: `source_c26_runtime_discovery_smoke` Source Dataset 저장 확인.

## Browser Smoke

- URL: `http://127.0.0.1:5173/datasets/source`
- Runtime connector:
  - `conn_postgres_runtime_smoke` 선택.
  - `Schema discovery pending` 표시.
  - `다음` 버튼 비활성화 확인.
- Local connector:
  - `conn_mep_product_catalog_json` 선택.
  - `다음` 버튼 활성화 확인.
  - `source_c26_runtime_discovery_smoke` 저장 성공 확인.

## Discovery Matrix

| Connector | UI result | Save allowed | Evidence |
| --- | --- | --- | --- |
| `local_file` | schema preview ready | yes | `file_backed`, bytes 확인 |
| `local_folder` | schema preview ready when saved connection has schema | yes | existing local folder inspect 기준 |
| `postgres` | `Schema discovery pending` | no | connection test only |
| `mongodb` | `Schema discovery pending` | no | connection test only |
| `s3` | `Schema discovery pending` | no | connection test only |
| `kafka` | `Schema discovery pending` | no | broker/topic test only |

## Regression / Failure Scenario

- connection test only인 runtime connector는 Source Dataset schema discovered처럼 표시하지 않는다.
- schema preview가 없는 connection은 Source Dataset 저장 버튼까지 갈 수 없다.
- raw credential은 Source Dataset wizard에 표시하지 않는다.
