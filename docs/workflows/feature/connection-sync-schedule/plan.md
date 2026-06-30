# Connection sync schedule 계획

## 목표

External Connection의 스케줄 의미를 ingestion/sync schedule로 정리하고, 기존 작업 영역의 Silver/Gold processing schedule과 섞이지 않게 표현한다.

## 문제 정의

- 연결에도 스케줄이 필요할 수 있다.
- 작업에도 스케줄이 필요하다.
- 두 스케줄은 같은 것이 아니다.
- 지금 작업 메뉴에 Source Sync Jobs까지 추가하면 데모 IA가 다시 복잡해질 수 있다.

## 구현 방향

- External Connection 생성/목록/요약에 `sync_mode`를 추가한다.
- `sync_mode`는 `manual`, `scheduled`, `streaming` 중 하나로 표현한다.
- `sync_schedule` 또는 동등한 schedule note를 표시한다.
- connector type별 기본값을 둔다.
  - Local File: `manual`
  - Local Folder: `scheduled`
  - Prepared Dataset: `manual`
  - Kafka Topic: `streaming`
  - API/S3/DB 계열: `scheduled`
- 실제 스케줄러 등록은 하지 않는다.
- 작업 메뉴에는 아직 Source Sync Jobs를 만들지 않는다.

## 완료 기준

- 연결 화면에서 각 External Connection의 sync mode와 schedule hint가 보인다.
- 연결 생성 review에서 sync 설정이 확인된다.
- Gold/Silver Job schedule과 Connection sync schedule의 의미가 문구상 구분된다.
- 작업 메뉴는 Silver Transform Jobs / Gold Build Jobs 구조를 유지한다.

## 제외

- cron 실행
- scheduler backend
- Source Sync Jobs 메뉴 추가
- Sync Run persistence
- connector credential 저장 또는 실제 연결 테스트
