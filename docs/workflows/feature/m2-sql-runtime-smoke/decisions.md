# M2 SQL runtime smoke 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- DuckDB adapter를 기본 API로 즉시 전환할지 opt-in으로 둘지 결정했다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| DuckDB runtime rollout | `Settings.week2_sql_engine="duckdb"` opt-in | fixture/catalog 파일이 없을 때 기존 API가 막히지 않게 하면서 실제 SQL smoke 증거를 확보한다. | user next-action approval / 2026-06-27 |
| SQL file target | `CatalogMetadata.storage.local_fallback_path` | S3/MinIO 직접 query보다 재현성이 높고, M6 SQL MVP가 읽어야 하는 local evidence 경계와 맞다. | user next-action approval / 2026-06-27 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| 기본 API engine을 `duckdb`로 전환 | M6 SQL MVP default switch가 준비된 뒤 판단한다. | M6가 fake/template 결과를 버리고 실제 SQL path를 기본값으로 쓰기로 합의할 때 | follow-up M6/M2 integration |
| MinIO/S3 object direct query | credentials, network, engine profile 결정이 필요하다. | object store direct query가 demo 또는 production acceptance에 필요해질 때 | follow-up storage/query profile |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| DuckDB opt-in | API default를 fake로 유지해 데모에서 실제 SQL이 안 보인다는 피드백이 생긴다. | M6 SQL MVP branch에서 default 전환 여부를 다시 결정한다. |
| DuckDB dependency | CI/container install이 느려지거나 platform wheel 문제가 생긴다. | dependency version pin 조정 또는 optional profile 분리를 검토한다. |
