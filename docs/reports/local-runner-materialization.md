# Local runner materialization 보고서

## Short Report / 짧은 보고

- Type: feature
- Date: 2026-06-30
- Changed: queued Gold Build Job Run을 local runner로 실행해 planned Silver/Gold JSONL evidence를 만들고 run record에 output path, row count, bytes, logs를 저장했다.
- Verified: backend focused tests 8 passed, frontend build 통과, contract JSON validation 통과, HTTP smoke와 browser smoke에서 local materialization 성공을 확인했고 smoke data/output을 정리했다.
- Remaining: C-5에서 M2/M4 runtime evidence와 source-level metrics를 연결한다.
- Next context: `/api/target-dataset-job-runs/{run_id}/execute` 결과의 `output_path`, `silver_output_paths`, `row_count`, `output_bytes`, `logs`가 C-5 evidence 입력이다.
- Risk: C-4.5는 계획된 Silver/Gold JSONL evidence를 만드는 local smoke이며 5GB 실제 처리나 Catalog publish가 아니다.
