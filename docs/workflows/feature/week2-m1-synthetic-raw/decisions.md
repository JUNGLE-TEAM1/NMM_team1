# Week2 M1 synthetic raw demo data 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- not needed. 고영향 architecture/interface 변경 없이 M3가 확인한 기존 계약 shape에 맞춰 local seed를 생성하는 범위다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| connector/source 표기 분리 | `connector_type=json`, `logical_shape=amazon_reviews_json`, `data_origin=demo_synthetic_raw` | M3가 source_type 하나에 둘을 섞지 말고 app connector 타입과 logical profile/origin을 분리하라고 답변 | M3 답변, 2026-06-26 |
| review seed field set | M3 계약 6개 필드 only | `TransformSpec`가 6개 컬럼을 select하고 extra field 무시 여부가 불필요한 리스크가 될 수 있음 | M1 Phase 결정, 2026-06-26 |
| 첫 샘플 규모 | Option 1 최소 착수안 | 빠른 M3 handoff와 local runner smoke를 우선함 | M1 Phase 결정, 2026-06-26 |
| 데이터 commit 여부 | `data/` ignored 유지 | 원본/생성 데이터는 커질 수 있고 재현 스크립트가 있으므로 저장소에는 넣지 않음 | `.gitignore`, 2026-06-26 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| Option 2 100,000행 확장 | 최소 샘플 handoff를 먼저 닫기 위해 보류 | M3가 10,000행 sample로 Bronze 변환 smoke를 통과하거나 발표용 규모가 필요할 때 | 후속 `feature/week2-m1-synthetic-raw-scale` 후보 |
| Taxi 기반 delivery seed | M1 최소 raw seed와 독립이고 M2 scale evidence와 경계가 있음 | M3/M5/M6 경로가 붙은 뒤 배송 지연 신호가 발표에 필요할 때 | 후속 Phase 후보 |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| M3 shape 분리 | M3가 connector/source profile naming을 다시 바꿈 | `source_manifest.json` key만 조정하고 review JSONL 6필드는 유지한다 |
| sample category | `Gift_Cards`가 발표 시나리오에 약함 | 후속 Phase에서 더 큰/적합한 Amazon category로 재생성한다 |
