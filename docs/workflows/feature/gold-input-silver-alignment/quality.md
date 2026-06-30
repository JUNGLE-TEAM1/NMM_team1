# Gold input silver alignment 품질 게이트

- Quality gate status: passed
- TDD applies: yes
- CI required: yes, when PR opens
- CI result: not run locally
- Deploy/publish required: no
- TDD status: completed via focused regression.
- Required checks: backend focused tests, frontend build, browser smoke.
- Regression focus: 기존 Gold Build Job run handoff와 catalog publish가 깨지지 않는다.

## 완료 검증

| 항목 | 명령/방법 | 기대 결과 |
| --- | --- | --- |
| backend tests | `PYTHONPATH=backend .venv/bin/pytest backend/tests/test_silver_dataset_persistence.py backend/tests/test_target_dataset_draft_persistence.py backend/tests/test_target_dataset_job_run_handoff.py` | `10 passed` |
| frontend build | `cd frontend && npm run build` | passed |
| browser smoke | persisted Silver 2개 준비 -> Gold wizard Silver 선택 -> Review -> draft 저장 | Silver input 기반 payload 저장 확인 |

## Regression 확인

- Target draft backend schema는 유지하고 UI payload만 persisted Silver 기준으로 보정했다.
- Gold Build Job run handoff focused test를 함께 돌려 기존 run path를 확인했다.
- C-11은 Gold input alignment만 담당하며 schedule edit은 C-12로 남긴다.
