# Product Health Gold Lake Write-through 계획

## Phase

- ID: C-49
- Branch/work location: `feature/product-health-gold-lake-write-through`
- Current integration branch: `feature/data-lake-runtime-stack`

## 목표

Product Health Gold 수동 실행이 prepared Gold parquet를 재사용하더라도 성공한 Run의 산출물을 반드시 `data/lake/gold/run_id=<run_id>/...parquet`에 실제 파일로 남긴다.

## 범위

- `TargetDatasetLocalRunner`의 Product Health prepared reference 경로를 lake write-through 방식으로 보정한다.
- Run record `output_path`, `row_count`, `output_bytes`, schema evidence는 lake output 기준으로 저장한다.
- prepared `data/local_sources/product_health/gold/gold_product_health.parquet`는 input/reference evidence로만 남긴다.
- `/runs` UI에서 latest output과 prepared reference를 구분해 표시한다.

## 제외 범위

- full 5GB ETL 재실행.
- Airflow/Spark 실제 실행.
- Catalog publish/AI Query handoff 수정. 이 범위는 C-50에서 다룬다.
- 실제 S3/MinIO upload. object URI는 `not_uploaded` 또는 후속 runtime evidence로 둔다.

## 구현 프롬프트

```text
@AGENTS.md @docs/03-interface-reference.md @docs/05-acceptance-scenarios-and-checklist.md @docs/06-regression-and-failure-scenarios.md @docs/07-manual-verification-playbook.md @docs/08-development-workflow.md

Implement C-49 only.
When Product Health Gold local_runner execution uses the prepared gold parquet, copy/write-through the parquet into data/lake/gold/run_id=<run_id>/<gold_output>.parquet.
Make the run output_path, row_count, output_bytes, schema/runtime evidence point to the lake output.
Keep the prepared source path only as input/reference evidence, not as the latest run output.
Do not implement Airflow/Spark execution, scheduler registration, full 5GB ETL rerun, or Catalog/AI Query handoff in this Phase.
Add focused backend tests and minimal UI wording/fact changes needed to make the distinction clear.
```

## 검증 프롬프트

```text
@AGENTS.md @docs/05-acceptance-scenarios-and-checklist.md @docs/06-regression-and-failure-scenarios.md @docs/07-manual-verification-playbook.md

Verify C-49 only.
Run focused tests proving Product Health prepared gold execution creates a real data/lake/gold run output and does not expose data/local_sources as the latest output path.
Run frontend build and diff whitespace check.
Record manual verification steps and remaining scheduler/Catalog handoff gaps.
```

## Acceptance Criteria

- Product Health Gold Run 수동 실행 후 `data/lake/gold/run_id=<run_id>/...parquet` 파일이 존재한다.
- Run `output_path`, `row_count`, `output_bytes`는 lake output 기준이다.
- prepared path는 reference evidence로만 남는다.
- 일반 Gold local materialization 경로는 깨지지 않는다.

## Regression / Failure Scenario

- `data/local_sources/product_health/gold/gold_product_health.parquet`가 최신 run output으로 저장되면 실패다.
- 성공 run인데 output file이 없거나 row/bytes evidence가 없으면 실패다.
- Product Health prepared reference를 full 5GB ETL 재실행처럼 표현하면 실패다.
