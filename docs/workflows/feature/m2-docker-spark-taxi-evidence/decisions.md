# M2 Docker Spark Taxi evidence 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- User supplied the implementation decisions directly in chat.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| Docker Spark runtime | Driver in Docker, public `apache/spark:4.0.1`, master + 2 workers | M3 compose already uses the Apache Spark public image and this keeps the path close to final distributed Spark without building a custom image first. | user / 2026-06-29 |
| Input/output mount | host Taxi data -> `/data/taxi`, repo results -> `/app/data/results` | Workers and driver need the same visible paths for Spark standalone local filesystem reads/writes. | user / 2026-06-29 |
| Smoke order | small Taxi file first, then 5GB Taxi directory | Fail fast on Docker/network/runtime issues before spending time on the full data bundle. | user / 2026-06-29 |
| Schema drift handling | Treat as runner correction target | Taxi monthly Parquet files have known type drift; M2 runner should normalize execution input without changing M3 metric ownership. | user / 2026-06-29 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| Custom Spark image | public image path is enough for this PR | dependency setup becomes too slow or brittle | Docker Spark hardening follow-up |
| Airflow invocation | outside this PR | Docker Spark evidence branch lands | M5 integration phase |
| Product Health 5GB | outside this PR | M1/M3 final input/spec readiness | Product Health 5GB evidence phase |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| Runtime pip install becomes too slow or CI-hostile | repeated smoke/runtime instability | move to a small custom image or prebuilt CI cache in a separate infra PR |
