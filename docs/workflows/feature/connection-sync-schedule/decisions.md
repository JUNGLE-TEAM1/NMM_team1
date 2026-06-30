# Connection sync schedule 결정

- Decision: C-8에서는 연결에 schedule metadata만 추가하고 작업 메뉴에 Source Sync Jobs는 추가하지 않는다.
- Reason: ingestion/sync schedule과 processing/build schedule의 의미를 먼저 구분해야 데모 흐름이 덜 헷갈린다.
- Deferred: 실제 ingestion job/run, Source Sync Jobs 메뉴, scheduler backend, cron 실행.

## 용어

- Connection sync schedule: 외부 원천을 언제 감지/동기화/소비할지에 대한 metadata.
- Processing job schedule: Source/Silver/Gold를 언제 표준화/가공/빌드할지에 대한 job metadata.
