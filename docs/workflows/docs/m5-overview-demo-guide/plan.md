# M5 Overview Demo Guide 계획

## 목표

M5 담당자가 `/etl` 데모 화면과 product-health Airflow demo page를 보면서 M5의 진행 내용, 코드 흐름, 책임 경계를 설명할 수 있게 overview 문서를 만든다.

## 범위

- `docs/project-context/asklake-week2-module-plan/ver2/m5-overview-demo-guide.md` 추가
- ver2 README에서 overview guide를 읽는 순서에 연결
- 기존 M5 demo cockpit manual guide에서 overview guide로 연결
- docs-only report/workspace evidence 작성

## 제외

- backend/frontend runtime code 변경
- API/schema contract 변경
- Airflow/Spark/product-health 계산 로직 변경
- 새 demo page 구현

## 완료 기준

- [x] M5 역할을 한 줄로 설명한다.
- [x] `/etl` 화면과 product-health demo page를 설명 흐름에 연결한다.
- [x] frontend -> API -> service -> runner -> Catalog 흐름을 함수/파일 단위로 정리한다.
- [x] status/fallback 해석과 M5 책임 경계를 정리한다.
- [x] 관련 regression/manual verification 기준을 확인하고 report에 기록한다.
