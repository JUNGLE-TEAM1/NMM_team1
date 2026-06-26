# M1 Demo Click Flow Polish 노트

## 진행 메모

- Phase 5는 presentation click flow polish다. 새로운 backend/API contract를 만들지 않는다.
- 13000 frontend dev server와 18000 backend compose를 사용해 route/API smoke를 확인했다.
- in-app browser automation은 navigation 중 timeout이 반복되어 route/CTA/API smoke로 대체했다.

## 결정

- demo question 버튼은 질문 문자열만 채우고, 답변/SQL/evidence 생성은 M6 API에 맡긴다.
- run/catalog/query 사이 CTA는 route navigation만 담당한다.

## 열린 질문

- 실제 발표 직전에는 사람이 13000 화면에서 한 번 직접 클릭 흐름을 보는 것이 좋다.

## 링크 / 증거

- PR #162 merge 후 최신 `origin/main` 기준 시작.
- Route smoke: `/dataset`, `/etl`, `/catalog/dataset_reviews_gold`, `/query` all 200.
- AI Query smoke: `succeeded passed dataset_reviews_gold 1 1`.
