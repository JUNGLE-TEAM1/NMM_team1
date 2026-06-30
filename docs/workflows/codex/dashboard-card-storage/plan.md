# Dashboard card storage plan

## 목표

- M6 `AIQueryResult`의 `question`, `sql`, `chart_spec`, `dataset_id`를 Dashboard card로 저장하고 조회하는 최소 backend API를 추가한다.
- UI 저장 버튼, 카드 편집/삭제, refresh 실행은 이번 PR 범위에서 제외한다.

## 범위

- SQLite metadata store에 `dashboard_cards` 테이블 추가
- `POST /api/week2/dashboard/cards`
- `GET /api/week2/dashboard/cards`
- `GET /api/week2/dashboard/cards/{dashboard_card_id}`
- `chart_spec` 최소 필드 검증: `type`, `x`, `y`, `title`
- API/metadata store 테스트와 최소 Source of Truth 문서 업데이트

## 범위 제외

- Dashboard 화면 구현
- AI Query UI의 저장 버튼 연결
- 카드 수정/삭제
- SQL 재실행/refresh
- user/tenant 권한

## 완료 기준

- 저장된 card가 SQLite에서 재조회된다.
- list는 `created_at DESC`로 정렬된다.
- 없는 card id는 `404`를 반환한다.
- invalid `chart_spec`은 `422`로 차단된다.
- 기존 AI Query focused tests가 계속 통과한다.
