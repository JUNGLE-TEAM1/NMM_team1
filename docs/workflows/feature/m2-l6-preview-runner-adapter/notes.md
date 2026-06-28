# M2 L6 preview runner adapter 노트

## 진행 메모

- PR #228에서 M2 multi-source pass-through runtime smoke가 먼저 머지됐다.
- 이번 Phase는 그 다음 단계로, M3 L6 preview-only spec을 M2 runner가 소비하는 adapter를 추가한다.
- 기존 `Week2SparkRunner`의 단일 입력 및 `source_inputs[]` 실행은 유지하고, `transform_spec` 또는 `transform_spec_path`가 있을 때만 L6 preview 실행 분기로 들어간다.

## 결정

- M2는 Bronze/Silver/Gold 의미를 새로 정의하지 않는다.
- 이번 adapter는 `select`, `rename`, `cast`, `parse_timestamp`, `normalize_null`, `json_string`, `mask`, `drop`, `aggregate`만 지원한다.
- 지원하지 않는 L6 operation은 성공처럼 넘기지 않고 failed `Week2RunnerResult`로 기록한다.

## 열린 질문

- 실제 Product Health 최종 `gold_product_health` L6 spec은 M3가 확정해야 한다.
- 5GB input evidence는 팀원이 input 묶음을 준비한 뒤 같은 실행 경로로 다시 돌려야 한다.
- Airflow DAG 내부에서 `spark_runner`를 호출하는 wiring은 M5와 별도 integration Phase로 맞춰야 한다.

## 링크 / 증거

- `docs/reports/m3-expanded-layer-contract/layers/l6-spec-compiler.md`
- `docs/reports/m2-product-health-runtime-smoke.md`
- `backend/tests/test_week2_spark_runner.py`
