# Source dataset persistence 결정 기록

| Decision | Status | Rationale |
| --- | --- | --- |
| ingest 실행 | deferred | C-2는 metadata 저장만 담당하고 runtime 실행은 C-4/C-5로 넘긴다. |
| schema preview | accepted | M3가 확장 가능한 `[{name,type}]` structured shape로 저장한다. |
| connection type | accepted | 기존 `csv/kafka/...`와 현재 UI의 `local_file/local_folder/prepared_dataset/...`를 함께 허용해 PR merge 전 type mismatch를 피한다. |
