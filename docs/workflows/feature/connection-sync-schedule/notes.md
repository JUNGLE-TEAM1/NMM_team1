# Connection sync schedule notes

- 연결 스케줄은 ingestion/sync schedule이다.
- 작업 스케줄은 processing/build schedule이다.
- Source Sync Jobs는 실제 ingestion run persistence가 생긴 뒤 별도 Phase로 판단한다.
- Kafka는 streaming, local file은 manual, local folder/API/S3/DB는 scheduled를 기본 후보로 둔다.
