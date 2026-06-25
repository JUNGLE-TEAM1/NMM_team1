# Week2 responsibility ver2 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- 이번 작업은 사용자가 이미 ver2 방향을 선택한 뒤 문서화하는 docs Phase다. 별도 후보 비교 대신 accepted decisions에 기록한다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| Week2 responsibility ver2 | 기존 루트 문서 보존 + `ver2/` 새 기준 문서 생성 | 초기 회의안과 수정 분업안을 섞지 않고, 현재 작업 기준을 명확히 분리하기 위해 | user request / 2026-06-25 |
| Iceberg 발표 범위 | 제외 | Spark/MinIO/Parquet/SQL smoke만으로도 발표 전 대용량 runtime 증거를 만들 수 있고 Iceberg는 설정 리스크가 크다. | user confirmation / 2026-06-25 |
| Spark 책임 | M2 common runtime, M3 transformation spec/job logic, M5 workflow runner call | M2/M3/M4가 각자 Spark session/config/output convention을 만들지 않도록 하기 위해 | user confirmation / 2026-06-25 |
| SourceConfig 책임 | M1 shell + M3/M4 source-specific provider | M1이 화면 입력과 demo tenant는 맡되 source type별 option/validation은 데이터/ingestion 담당자가 제공하는 편이 정확하다. | user confirmation / 2026-06-25 |
| Catalog 책임 | M3 facts + M5 storage/API/lineage | CatalogMetadata에 들어갈 데이터 사실과 저장/API 책임을 분리해 중복 소유를 피한다. | user confirmation / 2026-06-25 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| `RuntimeConfig` / `SparkRunner` interface | 실제 구현 branch에서 code boundary를 보고 결정해야 한다. | M2 Runtime Platform 구현 시작 | M2 runtime implementation |
| `docs/03-interface-reference.md` / `contracts/*.sample.json` 반영 | ver2 문서 합의 후 실제 계약 변경이 확정되어야 한다. | 첫 ver2 구현 PR 또는 integration branch | follow-up docs/interface PR |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| Week2 responsibility ver2 | 팀이 원래 데이터 유형별 분업으로 되돌리기로 결정 | `ver2/` README에 superseded 표시 후 새 버전 문서 생성 |
| M3 ETL scope | M3 병목으로 발표 E2E가 막힘 | Amazon Reviews JSON main path만 남기고 Taxi/Kafka는 contract/evidence로 축소 |
