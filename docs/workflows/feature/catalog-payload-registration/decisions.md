# Catalog payload 기반 Catalog 등록 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- 이번 변경은 사용자가 필드 목록과 소비 방향을 명시한 producer/consumer contract 반영이다. 별도 고영향 후보 비교는 필요하지 않았다.

## Accepted Decisions / 확정된 결정

| Date | Decision | Reason | Status |
| --- | --- | --- | --- |
| 2026-06-30 | `catalog_payload`가 있으면 Catalog 등록의 canonical source로 사용 | PR 5A가 Manual Run result에 등록용 payload를 제공하므로 PR 6이 gold parquet path를 추측하면 producer/consumer 계약이 깨진다. | accepted |
| 2026-06-30 | `storage_uri`가 없으면 기존 path 추측 fallback을 쓰지 않고 Catalog 등록을 건너뜀 | 잘못된 Catalog URI를 성공처럼 노출하는 것이 더 위험하다. run log에 이유를 남겨 producer contract 문제로 보이게 한다. | accepted |
| 2026-06-30 | legacy runner에는 기존 Catalog 생성 경로를 유지 | local/spark runner와 기존 Airflow tests를 깨지 않고 PR 5A handoff만 additive로 수용한다. | accepted |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| M6 S3-compatible direct SQL read | 이번 변경은 Catalog 등록 계약이며 SQL runtime 확장이 아니다. | M6가 `storage_uri=s3://...`를 직접 조회해야 할 때 | future M6 SQL runtime Phase |
| legacy `s3_uri` removal | 현재 M1/M6 소비자가 남아 있어 호환 필드를 유지한다. | CatalogMetadata v2 migration 결정 시 | future interface cleanup |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| `catalog_payload` field contract | PR 5A 최종 payload 이름이나 최소 필드가 달라질 때 | `docs/03`, fixture, adapter tests를 PR 5A 최종 shape에 맞춘다. |
| `storage_uri` canonical rule | M6 SQL runtime이 `s3://` object URI를 직접 읽는 범위로 확장될 때 | SQL adapter Phase에서 remote object read support를 별도로 검토한다. |
