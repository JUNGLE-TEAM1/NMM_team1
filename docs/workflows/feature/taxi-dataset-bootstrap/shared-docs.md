# M2 taxi dataset bootstrap 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/03-interface-reference.md` | M2 Taxi `SourceConfig`, `WorkflowDefinition`, `ExecutionResult`, `CatalogMetadata` 정식 예시 또는 interface reference 반영은 후속 구현 branch로 보류한다. | M5 공통 계약 구조는 `docs/03`과 `contracts/*.sample.json`에 있으므로 Taxi는 그 구조를 따른다. 다만 Taxi 전용 값은 실제 구현 코드가 생성하는 필드만 다음 branch에서 승격하는 편이 안전하다. | Medium |
- 공유 `contracts/*.sample.json`은 덮어쓰지 않고, M2 Taxi mapping은 `notes.md`에 초안으로 기록했다.
- `docs/03-interface-reference.md` 정식 반영은 M2 구현 branch 또는 M5 integration branch에서 다시 판단한다.
## Integration Notes / 통합 메모

- 현재 branch는 공유 계약 파일을 직접 바꾸지 않으므로 즉시 충돌 후보는 없다.
- M2 구현 branch는 `public.taxi_trips`를 우선 입력으로 두고, File source는 후속 확장으로 남긴다.
- Gold output은 local Parquet path 우선으로 만들되, `CatalogMetadata.s3_uri`, `storage.bucket`, `storage.prefix`, `storage.local_fallback_path`를 유지해 MinIO/S3 전환을 막지 않는다.
- M5 확인 결과와 공통 계약 기준에 따라 `ExecutionResult.row_count`는 input trip rows, `ExecutionResult.bytes`는 input bytes로 둔다. Gold output row/bytes는 `CatalogMetadata.metrics`와 Load node `task_results`에 둔다.

## Conflicts To Resolve / 해결할 충돌

- 
