# Job schedule management 계획

## 목표

Jobs 화면에서 schedule만 빠르게 수정 가능하게 하고, source/recipe/schema 같은 전체 definition 수정과 분리한다.

## 문제 정의

- Job 화면에서 무엇을 수정할 수 있는지 불명확하다.
- 전체 Gold/Silver definition 수정과 운영용 schedule 수정이 섞이면 화면이 복잡해진다.
- 데모에서는 Jobs가 실행/스케줄 관리 영역처럼 보여야 한다.

## 범위

- Silver Transform Job / Gold Build Job 카드에 schedule edit action 추가
- schedule mode/note 수정 UI
- 수정 후 목록 반영
- 생성 wizard 저장 성공 후 각 항목 첫 화면으로 복귀
- 전체 definition 수정은 Dataset edit flow로 안내

## 제외

- source/recipe/schema 수정
- 실제 scheduler 실행
- cron backend
- run backfill/retry
- Source Sync Jobs 추가

## 완료 기준

- Job card에서 schedule만 수정할 수 있다.
- Run 준비 action은 유지된다.
- source/recipe/schema 수정은 별도 dataset edit flow로 안내된다.
- schedule 수정이 processing/build schedule 의미로 표시된다.
- External Connection, Source Dataset, Silver Dataset, Target Dataset draft 저장 후 해당 목록/첫 화면으로 돌아간다.
