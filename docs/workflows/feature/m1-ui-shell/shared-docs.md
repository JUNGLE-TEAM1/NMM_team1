# M1 UI Shell 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/03-interface-reference.md` | 변경 없음. 기존 Week 2 route/contract package가 M1 UI Shell에 충분함을 확인했다. | Source of Truth Impact Gate 증거를 남기기 위한 확인 기록이다. | low |

## Integration Notes / 통합 메모

- M2 Batch: `/sources` 또는 `/runs`에 batch source 등록 결과와 run metrics를 연결한다.
- M3 JSON/Schema: `/sources`, `/schema-preview`에 source config, sample read, schema inference, override 결과를 연결한다.
- M4 Kafka: `/sources`, `/runs`에 streaming source 상태, lag, throughput, failure 상태를 연결한다.
- M5 Workflow/Catalog: `/runs`, `/catalog`에 workflow definition, execution result, logs, retry, catalog metadata를 연결한다.
- M6 RAG/AI Query: `/ask`, `/catalog`에 dataset allowlist, evidence, SQL/result/chart spec을 연결한다.
- Static placeholder cleanup:
  - M2/M3/M4는 `frontend/src/app/m1StaticShellData.js`의 `m1ConnectionPlaceholders`를 실제 source/connection state로 교체한다.
  - M3는 `m1SchemaPreviewPlaceholder`를 schema inference response로 교체한다.
  - M5는 `m1WorkflowPlaceholder`, `m1PipelinePlaceholders`, `m1CatalogPlaceholder`를 workflow/run/catalog API state로 교체한다.
  - M6는 `m1AiQueryPlaceholder`를 AI query/evidence/query result state로 교체한다.

## Conflicts To Resolve / 해결할 충돌

- 없음. M1은 공유 contract를 바꾸지 않는다.
