# AI Query result persistence 계획

## 목표

C31 deep browser E2E에서 확인된 잔여 UX risk를 닫는다. AI Query 결과에서 Catalog 또는 Run으로 이동한 뒤 다시 AI Query로 돌아와도 질문, 답변, evidence가 유지되어 demo review loop가 끊기지 않게 한다.

## 범위

- `/query` 성공 결과를 browser session 안에 저장한다.
- `/query` 재진입 시 마지막 질문, 결과, table/chart mode를 복원한다.
- 저장 실패는 query 실행 실패로 번지지 않게 한다.
- `Catalog detail` handoff와 함께 검증한다.

## 제외 범위

- backend query history API.
- 영구 query audit log.
- 사용자별 저장소/권한.
- external LLM/RAG/vector DB.
- 대용량 result pagination.

## Acceptance Criteria

- 새 browser session에서는 AI Query가 빈 결과 상태로 시작한다.
- 질문 실행 후 결과가 표시된다.
- Catalog detail로 이동한 뒤 `/query`로 돌아오면 같은 질문/답변/evidence가 보인다.
- console error가 없다.

## Regression / Failure Scenario

- session storage가 없거나 깨져도 AI Query 화면이 빈 상태로 정상 표시되어야 한다.
- storage quota/error 때문에 query 실행 자체가 실패하면 안 된다.
- Catalog detail handoff가 C31처럼 stale 기본 detail로 돌아가면 실패다.

## Manual Verification

1. `/query`를 새 tab/session에서 연다.
2. `위험 점수가 높은 상품 알려줘`를 실행한다.
3. `Catalog detail`을 클릭해 `/catalog` 선택 상태를 확인한다.
4. `/query`로 다시 이동한다.
5. 질문, 답변, Dataset info, table/chart mode가 복원되는지 확인한다.
