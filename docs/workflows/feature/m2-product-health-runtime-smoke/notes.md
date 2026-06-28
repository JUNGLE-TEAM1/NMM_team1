# M2 product health runtime smoke 노트

## 진행 메모

- 2026-06-28: main `e15300a` 기준에서 시작했다. 직전 main pull로 M3 v2.1.1 L0-L10 계약과 M4 Kafka replay evidence가 들어온 상태다.
- 이번 작업은 M3 L1 Bronze Envelope 구현이 아니다. M2는 여러 source input을 읽고 source별 Parquet output과 evidence를 남기는 pass-through runtime smoke만 제공한다.
- `Week2SparkRunner`는 기존 단일 입력 모드를 유지하고, `RuntimeConfig.source_inputs[]`가 있을 때만 multi-source 모드로 동작한다.
- CLI smoke 결과: 4개 sample source, 총 11행, 1412 input bytes, 6719 output bytes, duration 120ms, status `succeeded`.

## 결정

- `source_inputs[]`는 `source_id`, `input_format`, `input_path`, 선택 `output_file_name`, 선택 `options`만 담는다. source 의미와 변환 규칙은 M3 `TransformSpec`에 둔다.
- multi-source output path는 `output_root/spark_smoke/run_id=<run_id>/<source_id>.parquet` 규칙으로 둔다.
- `Week2RunnerResult.output_path`는 multi-source output directory를 가리키고, 개별 파일 경로는 `task_results[].output_path`에 source별로 남긴다.

## 열린 질문

- M3 L6 `silver_transform_spec.json` 또는 `gold_generation_spec.json`이 code로 들어오면 M2 runner가 어떤 adapter 이름으로 실행할지는 후속 M2/M3/M5 integration에서 정한다.
- Docker Spark cluster와 5GB input run은 후속 M2 scale/integration Phase로 남긴다.

## 링크 / 증거

- Issue: https://github.com/JUNGLE-TEAM1/NMM_team1/issues/227
- Smoke command: `PYTHONPATH=backend .venv/bin/python scripts/week2_m2_product_health_runtime_smoke.py --summary-path data/results/m2_product_health_runtime_smoke/summary.json`
