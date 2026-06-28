# M4 Kafka contract smoke fixture 정리 결정 기록

## Accepted Decisions

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| M4 presentation role | supporting evidence, not first-presentation blocker | 첨부 분석과 현재 구현 상태상 product-health E2E 핵심 라인은 M3/M2/M5/M6/M1이 닫아야 하며, Kafka는 Gold 생성 필수 입력으로 말하지 않아야 한다. | user context / 2026-06-28 |
| Fixture source | existing real smoke evidence | Docker daemon이 실행 중이 아니지만 기존 `latest.json`에 성공 evidence가 남아 있어 TODO 확정 근거로 충분하다. | AI implementation / 2026-06-28 |

## Deferred Decisions

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| behavior event replay evidence | 1차 발표 blocker가 아님 | 2차 이후 streaming ingestion evidence를 product-health behavior source로 연결할 때 | future M4/M5 follow-up |
