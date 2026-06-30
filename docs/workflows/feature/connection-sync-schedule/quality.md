# Connection sync schedule 품질 게이트

- TDD status: External Connection persistence test를 sync metadata 기준으로 보강했다.
- Required checks: frontend build, backend focused tests, browser smoke.
- Regression focus: 기존 External Connection 저장/조회와 Source Dataset 생성 흐름을 깨지 않는다.

## 검증 기록

| 항목 | 명령/방법 | 결과 | 증거 |
| --- | --- | --- | --- |
| backend focused tests | `PYTHONPATH=backend .venv/bin/pytest backend/tests/test_external_connection_persistence.py backend/tests/test_source_dataset_persistence.py` | passed | 6 passed |
| frontend build | `cd frontend && npm run build` | passed | Vite build 완료 |
| contract JSON | `jq -e . contracts/external_connection.sample.json` | passed | JSON valid |
| diff check | `git diff --check -- ...` | passed | whitespace issue 없음 |
| browser smoke | 연결 생성 -> review -> 목록 확인 | passed | sync mode/schedule 표시 확인 후 smoke data cleanup |
| IA regression | 작업 메뉴 확인 | passed | Source Sync Jobs 미추가 확인 |
