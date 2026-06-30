# Demo flow final audit Hotfix 보고서

## Short Report / 짧은 보고

- Type: Hotfix
- Date: 2026-06-30
- Changed: Vite dev proxy target override와 Gold Dataset registered CatalogDataset UI 경계를 정리했다.
- Verified: frontend build 통과, backend focused tests `15 passed`, Vite proxy curl smoke, browser smoke.
- Remaining: full click-through E2E와 PR 정리는 별도 진행.
- Next context: PR 전 전체 변경 범위/dirty worktree 정리.
- Risk: 기본 Vite proxy는 여전히 `127.0.0.1:8000`을 본다. stale 8000 backend가 있으면 `VITE_PROXY_TARGET=http://127.0.0.1:18000`을 명시한다.

## 변경 요약

- `frontend/vite.config.js`에 `VITE_PROXY_TARGET` override를 추가했다.
- `docs/04-development-guide.md`에 host Vite dev proxy override 명령을 추가했다.
- `/datasets/gold`에 `CatalogDataset Management Boundary` panel을 표시했다.
- registered CatalogDataset action에서 `수정`/`삭제`를 제거하고 `상세`만 남겼다.

## 검증

```bash
npm run build
PYTHONPATH=backend .venv/bin/pytest backend/tests/test_target_dataset_catalog_publish.py backend/tests/test_external_connection_persistence.py backend/tests/test_week2_spark_readiness.py -q
```

추가 smoke:

- `curl http://127.0.0.1:5173/api/week2/spark/readiness` -> `200`
- `curl http://127.0.0.1:5173/api/external-connections/credential-policy` -> `200`
- Browser `/connections` -> `Credential Secret Boundary`, 404/조회 실패 없음.
- Browser `/datasets/gold` -> `CatalogDataset Management Boundary`, registered card `상세`만 표시.
- Browser `/runs` -> `Spark Runner Readiness`, 404/조회 실패 없음.

## 남은 위험

- 실제 외부 runtime 실행은 아직 각 C-phase 범위 밖이다.
- PR 전에는 누적 변경사항을 정리해 포함 범위를 다시 확인해야 한다.
