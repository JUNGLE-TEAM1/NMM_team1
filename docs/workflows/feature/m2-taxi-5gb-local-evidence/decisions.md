# M2 Taxi 5GB local Spark evidence 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- Full option brief was discussed in chat before this branch: run PySpark local 5GB first, keep Docker Spark cluster as follow-up.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| Taxi 5GB evidence 실행 순서 | PySpark local mode first | Docker Spark cluster를 기다리면 팀 통합이 늦어지므로, 먼저 같은 runner path가 5GB급 Parquet을 읽고 Gold Parquet을 쓰는지 증명한다. | user / 2026-06-29 |
| Docker Spark cluster | defer | 최종 완료 기준에는 필요하지만 이번 PR은 local Spark 5GB evidence를 닫는 작은 단위다. | user / 2026-06-29 |
| Product Health 5GB | defer until input/spec ready | Week 2 대표 경로는 Product Health지만 M1/M3 입력과 최종 spec 준비 뒤 같은 Spark 경로로 실행한다. | user / 2026-06-29 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| MinIO/S3-compatible write | local 5GB evidence를 먼저 닫고, Docker Spark 또는 storage branch에서 재검토 | M2 storage evidence follow-up |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| PySpark local mode만으로 최종 완료 처리 | 최종 M2 완료 전 | Docker Spark cluster, storage, M5 invocation 증거를 추가한다. |
