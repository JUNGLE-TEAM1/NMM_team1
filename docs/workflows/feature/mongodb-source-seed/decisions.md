# MongoDB Source Dataset seed 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

-

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| MongoDB compose 방식 | 별도 `docker-compose.mongodb.yml` override | 기존 `docker-compose.yml`에는 LLM env 관련 dirty 변경이 있어 충돌을 줄이고 MongoDB runtime만 얇게 추가하기 위해 | AI implementation / 2026-06-30 |
| Seed 범위 | `data/asklakemart_chimera_raw_test/events.jsonl` 500 rows | 실제 연결 smoke에는 작은 기존 demo 데이터가 충분하고 반복 실행 시간을 줄일 수 있음 | User request + AI implementation / 2026-06-30 |
| 완료 범위 | External Connection + Source Dataset metadata까지만 | Source Dataset registration guard에 맞춰 ingest/run/catalog publish로 오해하지 않기 위해 | docs/06 regression guard / 2026-06-30 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| Target run/Catalog/AI Query 연결 | 이번 Phase는 실제 MongoDB source registration smoke가 목표 | 사람이 MongoDB source를 target 처리 경로에 연결하라고 요청할 때 | 후속 Dataset integration Phase |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| MongoDB connector scope | Target run 또는 Catalog publish를 포함해야 하는 요구가 생김 | 별도 Phase로 분리하고 Source of Truth를 먼저 갱신 |
