# PH-DATA-3 다음 행동

1. PH-DATA-4에서 `product_health_5gb_run_summary.json`을 M5 Catalog ingest 입력으로 사용한다.
2. M5 Catalog ingest 시 `processed_input_total_bytes`, `input_total_bytes_semantics`, Gold output bytes 의미를 보존한다.
3. M1 evidence label에서 "processed input bytes"와 "Gold output bytes"를 분리해 표시한다.
4. 후속 runtime hardening에서 review/delivery source도 byte-level processed measurement로 확장할지 결정한다.
