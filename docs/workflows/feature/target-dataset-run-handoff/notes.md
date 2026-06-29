# Target dataset run handoff 노트

- 2026-06-29: C-4 Phase로 생성했다.
- M5는 독립 `M5 데모` 메뉴가 아니라 Target Dataset 이후 run handoff로 붙인다.
- 2026-06-29: `/api/target-datasets/{dataset_id}/runs` create/list와 `/api/target-dataset-runs/{run_record_id}` read를 추가했다.
- Target Dataset Review 저장 후 `Job Runs` 패널에서 `Job Run 시작`을 누르면 `run_reviews_demo_001` status가 표시된다.
- C-4는 Week2 local runner handoff만 연결하고 Spark/Kafka runtime evidence 정렬은 C-5로 남긴다.
- 2026-06-29 보완: `execution_result.target_dataset_handoff`에 `process_rule`, `schedule`, `output_schema`, `runtime_output_scope=week2_fixture_output`를 추가해 저장된 Target Dataset context와 fixture runtime output을 분리했다.
- 2026-06-29 보완: frontend는 run 생성 후 `GET /api/target-datasets/{dataset_id}/runs`를 다시 호출해 목록 API 결과를 표시한다.
