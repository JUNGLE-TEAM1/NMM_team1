# M2 taxi dataset bootstrap 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/03-interface-reference.md` | M2 Taxi `SourceConfig`, `WorkflowDefinition`, `ExecutionResult`, `CatalogMetadata` 정식 예시 또는 interface reference 반영은 후속 구현/통합 branch로 보류한다. | 현재 branch는 `docs/workflows/feature/taxi-dataset-bootstrap/notes.md`에 bootstrap 계약 초안을 남기는 범위이며, 공유 interface 문서를 지금 바꾸면 M5 표준 확정 전 과도하게 고정될 수 있다. | Medium |
- 공유 `contracts/*.sample.json`은 덮어쓰지 않고, M2 Taxi mapping은 `notes.md`에 초안으로 기록했다.
- `docs/03-interface-reference.md` 정식 반영은 M2 구현 branch 또는 M5 integration branch에서 다시 판단한다.
## Integration Notes / 통합 메모

- 현재 branch는 공유 계약 파일을 직접 바꾸지 않으므로 즉시 충돌 후보는 없다.
- 후속 구현 branch에서 M5 Workflow/Status/Catalog 표준이 다르면 `ExecutionResult.row_count`, `bytes`, MinIO prefix mapping을 조정해야 한다.

## Conflicts To Resolve / 해결할 충돌

- 
