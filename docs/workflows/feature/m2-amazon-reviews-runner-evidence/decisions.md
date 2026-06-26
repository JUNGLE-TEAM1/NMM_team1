# M2 Amazon Reviews JSONL runner evidence 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- 이번 branch는 선택지가 큰 architecture 변경이 아니라, 이미 확정된 Week 2 main E2E path를 M2 runner evidence로 연결하는 좁은 구현이다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| M2 다음 evidence 대상 | Amazon Reviews JSONL | Week 2 main E2E path가 Amazon Reviews JSON을 발표 필수 경로로 둔다. Taxi는 정형 대용량 evidence지만 main path 선행 조건이 아니다. | 사용자 "그래 그렇게 가자" / 2026-06-26 |
| 실행 방식 | `Week2SparkRunner` local `pyarrow` evidence script | 실제 Spark cluster 이전에 input/output/result boundary와 Parquet output 증거를 닫는다. | M2 runtime smoke PR #155 이후 후속 작업 |
| M1 synthetic raw 처리 | 기본 sample로 재현 가능하게 만들고, M1 generated path는 옵션으로 받는다. | generated `data/`는 git에 commit하지 않으므로 팀원마다 재생성 여부가 다를 수 있다. | 현재 worktree 확인 / 2026-06-26 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| Real Spark cluster 실행 | 이번 PR은 runner boundary evidence가 목적이다. | local evidence가 merge되고 Spark runtime 세팅이 필요해질 때 | M2 Spark runtime follow-up |
| SQL smoke | Parquet output이 먼저 있어야 한다. | M6 또는 M2가 Parquet query 검산을 요구할 때 | M2/M6 SQL smoke follow-up |
| Taxi large-data evidence | Amazon Reviews main path evidence와 목적이 다르다. | 정형 대용량 처리 증거가 발표/리뷰에서 필요할 때 | M2 Taxi evidence follow-up |
| M5 Workflow/Catalog 연결 | M5 runner selection adapter와 연결 위치가 필요하다. | M5가 `spark_runner` 선택 호출을 붙일 때 | M2/M5 integration follow-up |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| Amazon Reviews JSONL evidence | M3/M5가 요구하는 input shape가 `review_id`, `product_id`, `rating`, `review_text`, `review_time`, `verified_purchase`에서 바뀐다. | script required field와 evidence summary를 새 계약에 맞춰 조정한다. |
| local `pyarrow` runner | 실제 Spark cluster가 이번 발표 필수 조건으로 승격된다. | `Week2SparkRunner` 내부 구현만 Spark 호출로 교체하고 CLI input/output contract는 유지한다. |
