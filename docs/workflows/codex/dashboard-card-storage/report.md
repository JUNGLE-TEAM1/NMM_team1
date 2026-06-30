# Dashboard card storage report

## Short Report / 짧은 보고

- Type: Phase
- Branch/work location: `codex/dashboard-card-storage`, `docs/workflows/codex/dashboard-card-storage`
- Date: 2026-07-01
- Workspace state: ready-for-review
- Changed: `DashboardCardCreate`/`DashboardCardRecord`, SQLite `dashboard_cards` table, `/api/week2/dashboard/cards` 저장/list/detail API, API tests, interface/acceptance docs를 추가했다.
- Verified: dashboard API tests 4 passed, Python syntax passed, dashboard + AI Query focused regression 29 passed, `git diff --check` passed, `scripts/validate-harness.sh --strict` passed.
- Remaining: UI 저장 버튼과 dashboard 화면 렌더링은 후속 PR 범위다.
- Next context: AI Query result에서 `title`, `question`, `sql`, `chart_spec`, `dataset_id`를 `POST /api/week2/dashboard/cards`로 저장하면 card id와 `created_at`이 반환된다.
- Risk: unrelated local UI changes exist and must stay excluded from commits/PR.

## Changed Files / 변경 파일

- `backend/app/domain/schemas.py`
- `backend/app/ports/metadata_store.py`
- `backend/app/adapters/sqlite_metadata_store.py`
- `backend/app/api/dashboard_cards.py`
- `backend/app/core/app_factory.py`
- `backend/tests/test_dashboard_cards.py`
- `docs/03-interface-reference.md`
- `docs/05-acceptance-scenarios-and-checklist.md`

## Verification Commands / 검증 명령

```bash
PYTHONPATH=backend ./.venv/bin/python -m pytest backend/tests/test_dashboard_cards.py -q
PYTHONPATH=backend ./.venv/bin/python -m py_compile backend/app/domain/schemas.py backend/app/ports/metadata_store.py backend/app/adapters/sqlite_metadata_store.py backend/app/api/dashboard_cards.py backend/app/core/app_factory.py
PYTHONPATH=backend ./.venv/bin/python -m pytest backend/tests/test_dashboard_cards.py backend/tests/test_week2_ai_query.py backend/tests/test_app_container.py -q
git diff --check
scripts/validate-harness.sh --strict
```

## Regression Guard / 회귀 보호

- Checked feature: AI Query result consumer contract
- Protected behavior: 기존 `/api/week2/ai/query` 응답 shape와 app container 초기화가 Dashboard card router 추가로 깨지지 않는다.
- Result: `backend/tests/test_week2_ai_query.py`, `backend/tests/test_app_container.py`, `backend/tests/test_dashboard_cards.py` focused regression passed.

## Manual Verification / 수동 검증

- Document executed: `docs/07-manual-verification-playbook.md` 관련 API smoke 기준 확인
- Environment: local FastAPI TestClient + SQLite temp DB
- Result: 저장/list/detail/404/422 경로가 tests로 확인됨
- Limitation: 실제 browser UI 저장 버튼은 이번 PR 범위 아님

## docs/05 Acceptance Link / 수용 기준 연결

- Related item: M1/M6 Dashboard card storage는 AI Query 결과의 `question`, `sql`, `chart_spec`, `dataset_id`를 저장/조회한다.
- Status: focused backend tests passed.
- Evidence: `backend/tests/test_dashboard_cards.py`

## Context Budget Evidence / 컨텍스트 예산 증거

- Context Budget mode: Escalate Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/03-interface-reference.md`, existing AI Query and SQLite metadata store code
- Escalated context read: `docs/05-acceptance-scenarios-and-checklist.md`, `docs/reports/README.md`
- Context omitted intentionally: unrelated frontend implementation details
