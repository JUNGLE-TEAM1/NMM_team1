# M3 product-health Gold contract shared docs

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/03-interface-reference.md` | product-health contract가 M3 canonical interface로 확정되면 interface reference에 반영한다. | 이번 PR은 contract fixture와 executable reference를 먼저 고정한다. | medium |

## Integration Notes / 통합 메모

- M2는 `contracts/product_health_transform_spec.sample.json`을 기준으로 5GB+ Spark evidence를 만든다.
- M5는 `contracts/product_health_catalog_metadata.sample.json`의 dataset/table/run evidence 구조를 catalog persistence에 연결한다.
- M6는 `contracts/product_health_vector_index_handoff.sample.json`과 catalog query allowlist를 사용한다.
- M1은 `gold_product_health` 고정 컬럼과 run evidence만 표시하면 된다.

## Conflicts To Resolve / 해결할 충돌

- 기존 `dataset_reviews_gold` 경로와 product-health 경로는 발표 시나리오에서 분리되어야 한다.
