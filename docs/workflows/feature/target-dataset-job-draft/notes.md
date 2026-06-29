# Target dataset job draft 노트

- 2026-06-29: C-3 Phase로 생성했다.
- Target Dataset과 ETL job definition draft 저장까지만 담당한다.
- run 생성은 C-4로 넘긴다.
- 2026-06-29: `/api/target-datasets` create/list/read와 SQLite `target_datasets` metadata 저장을 추가했다.
- Review 저장 버튼은 Target Dataset draft 저장만 호출하며 저장된 draft id를 화면에 표시한다.
- 브라우저 스모크에서 `source_product_health_reviews_c3_smoke`를 선택해 `dataset_product_health_gold` draft 저장을 확인했다.
