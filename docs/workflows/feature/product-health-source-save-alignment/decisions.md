# Product Health Source Save Alignment 결정 기록

- `SourceDatasetRecord`에 `runtime_source`와 `fallback_evidence`를 추가한다.
- Product Health runtime source 저장 시 `raw_scope`는 외부 시스템 scope로 둔다.
- 기존 UI badge 호환을 위해 `file_evidence`는 유지하되, 상세 UI에서는 runtime source와 demo fallback evidence를 분리해서 보여준다.
