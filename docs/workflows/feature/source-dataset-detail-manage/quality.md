# Source dataset detail/manage 품질 게이트

- Quality gate status: passed
- TDD applies: yes
- CI required: yes, when PR opens
- CI result: not run locally
- Deploy/publish required: no
- TDD status: completed.
- Required checks: backend focused tests, frontend build, browser smoke.
- Regression focus: 기존 Source Dataset 생성/목록과 Target Dataset draft 생성이 깨지지 않는다.

## 완료 검증

| 항목 | 명령/방법 | 기대 결과 |
| --- | --- | --- |
| backend tests | `PYTHONPATH=backend .venv/bin/pytest backend/tests/test_source_dataset_persistence.py` | `8 passed` |
| frontend build | `cd frontend && npm run build` | passed |
| browser smoke | 테스트 Source Dataset row 준비 -> 상세 -> 수정 -> 삭제 | detail metadata 확인, edit 저장, delete 후 API 404 확인 |

## Regression 확인

- Source Dataset 생성/목록 API는 기존 test에서 유지 확인했다.
- Source Dataset delete는 metadata row만 삭제하며 downstream Target draft cascade는 C-9 범위에서 제외했다.
- 테스트용 browser smoke row는 완료 후 로컬 SQLite에서 정리했다.
