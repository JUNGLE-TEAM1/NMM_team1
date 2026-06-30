# Product Health Manual Run execution 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- Full `docs/14-decision-option-brief.md` 형식은 쓰지 않았다. 선택지는 PR 4 snapshot 저장소가 아직 없는 상태에서 PR 5B를 어떻게 독립 검증할지에 대한 좁은 integration 계약 결정이었다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| Product Health Manual Run input | `TargetDatasetRunCreate.source_snapshots[]`로 parquet artifact metadata를 받는다 | PR 4 latest snapshot lookup이 아직 없지만 PR 5B 실행 경계를 독립 검증해야 한다. PR 4가 같은 shape를 저장하면 후속 통합에서 요청 입력을 저장소 조회로 대체할 수 있다. | 사용자 지시 "이제 진짜 내꺼 구현하자" 이후 AI 판단 / 2026-06-30 |
| Missing snapshot behavior | run `status=failed`, contract `status=failed_product_health_execution` | snapshot 없이 Gold/Catalog 성공처럼 보이면 PR 6/7/8이 잘못된 데이터를 소비할 수 있다. | AI 판단 / 2026-06-30 |
| Execution boundary | API-local parquet artifact execution | PostgreSQL/MongoDB/Kafka connector 직접 ingest와 Spark/Airflow distributed execution은 다른 팀/후속 PR 범위다. | AI 판단 / 2026-06-30 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| latest successful snapshot 자동 조회 | PR 4 Source Snapshot 저장소가 아직 merge되지 않았다. | PR 4가 snapshot metadata persistence API/store를 merge한 뒤 | 후속 Product Health snapshot lookup integration |
| Product Health Airflow/Spark cluster 실행 | 이번 PR은 계약과 local artifact smoke가 목적이다. | M2/M5가 distributed runner handoff를 Product Health path에 붙일 때 | 후속 M2/M5 execution integration |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| `source_snapshots[]` 요청 계약 | PR 4 저장소 shape가 다른 필드명을 확정하는 경우 | `docs/03`과 `SourceSnapshotRunInput` alias/adapter를 맞춘다 |
| API-local execution | 발표 또는 CI에서 local artifact path 접근이 불가능한 경우 | storage adapter 또는 runner handoff로 output path 계산을 분리한다 |
