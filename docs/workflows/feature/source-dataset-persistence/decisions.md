# Source dataset persistence 결정 기록

| Decision | Status | Rationale |
| --- | --- | --- |
| ingest 실행 | deferred | C-2는 metadata 저장만 담당하고 runtime 실행은 C-4/C-5로 넘긴다. |
| schema preview | planned | M3가 확장 가능한 structured shape로 둔다. |
