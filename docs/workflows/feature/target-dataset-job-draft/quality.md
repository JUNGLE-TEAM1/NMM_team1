# Target Dataset job draft 품질 게이트

- TDD status: backend API focused test 추가.
- Required checks: backend focused tests, frontend build, contract JSON validation, HTTP smoke, browser smoke, diff check.
- Regression focus: External Connection / Source Dataset 저장 흐름을 깨지 않는다.
- Execution guard: draft 저장을 Airflow 또는 runner 실행 성공으로 표현하지 않는다.
- UI guard: `executor_handoff` 선택은 Process 다음 `Handoff/Run` 단계에서 표시하고, Scheduling은 실행 주기/수동 실행 정책만 표시한다.

## 검증 기록

| 항목 | 명령/방법 | 결과 | 증거 |
| --- | --- | --- | --- |
| backend focused tests | `PYTHONPATH=backend .venv/bin/pytest backend/tests/test_target_dataset_draft_persistence.py backend/tests/test_source_dataset_persistence.py backend/tests/test_external_connection_persistence.py` | passed | 9 passed |
| frontend build | `cd frontend && npm run build` | passed | Vite build 완료 |
| contract JSON | `jq -e . contracts/target_dataset_draft.sample.json contracts/source_dataset.sample.json contracts/external_connection.sample.json` | passed | JSON valid |
| HTTP smoke | local backend `POST /api/target-dataset-drafts`, `GET /api/target-dataset-drafts` | passed | `201`, `200`, `draft_ready`, list contains created record |
| browser smoke | `http://127.0.0.1:13011/dataset` Target Dataset Review 저장 | passed | `Target dataset draft 저장` 후 `저장됨:<id>` 표시, API 조회에서 browser draft 확인 |
| Handoff/Run UI smoke | browser Target Dataset wizard 단계 이동 | passed | `Overview -> Source 선택 -> Process -> Handoff/Run -> Scheduling -> Review`, `1/6`~`6/6` 표시, 저장 후 smoke draft 정리 |
