# M5 Local Runner Representative Path notes

## 확인한 현재 동작

- `Week2WorkflowService.trigger_run(..., executor="local_runner")`는 `run_reviews_demo_001` 같은 `run_id`를 생성한다.
- `Week2LocalRunner`는 `backend/samples/amazon_reviews_demo.jsonl`을 읽고 `dataset_reviews_gold.jsonl`을 쓴다.
- output path pattern은 `reviews/gold/run_id=<run_id>/dataset_reviews_gold.jsonl`이다.
- `Week2CatalogStore`는 run metadata와 catalog metadata를 `output_root/_metadata` 아래 JSON으로 저장한다.
- successful status인 `fallback_succeeded`에서는 latest Catalog가 갱신된다.

## 이번 slice에서 고정한 기준

- run output URI와 Catalog `s3_uri`는 같은 `run_id`를 가진다.
- Catalog `storage.local_fallback_path`는 실제 생성된 output JSONL을 가리킨다.
- Catalog output metrics는 실제 output row count/bytes와 일치한다.
- persisted run JSON과 persisted catalog JSON이 같은 run lineage를 가진다.

## 남은 gap

- 실제 Airflow trigger는 아직 local fallback boundary 바깥으로 연결되지 않았다.
- SparkRunner는 아직 M5 runner selection에 붙지 않았다.
- M3 `TransformSpec` adapter는 아직 local runner/SparkRunner 입력으로 연결되지 않았다.
