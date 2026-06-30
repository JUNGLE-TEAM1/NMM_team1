# PH-DATA-4 다음 행동

1. PH-DATA-5에서 `dataset_product_health_gold` CatalogMetadata를 M6 SQL grounding 입력으로 사용한다.
2. M6가 `storage.local_fallback_path`, `query.table_name`, `query.allowed_columns`, `query.default_limit`를 읽는지 확인한다.
3. AI Query evidence에 `metrics.processed_input_total_bytes`와 Gold output bytes 의미가 같이 노출되는지 확인한다.
4. M1 화면 연결 시 `/api/week2/catalog/dataset_product_health_gold` 응답을 dataset detail/evidence 카드에 사용한다.
