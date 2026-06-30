# Demo flow final audit Hotfix 보고서

## Short Report / 짧은 보고

- Type: Hotfix
- Date: 2026-06-30
- Changed: Vite dev proxy target override를 추가하고 Gold Dataset registered action/UI drift를 정리했다.
- Verified: frontend build, backend focused tests, Vite proxy curl smoke, browser smoke.
- Remaining: full click-through E2E와 PR 정리는 별도 진행.
- Next context: PR 전 전체 변경 범위/dirty worktree 정리.
- Risk: `8000`에 stale backend가 떠 있으면 기본 proxy는 여전히 그 서버를 본다. 최신 backend 검수는 `VITE_PROXY_TARGET`을 명시한다.

## 변경 요약

- `frontend/vite.config.js`에서 `/api` proxy target을 `VITE_PROXY_TARGET`으로 override할 수 있게 했다.
- `docs/04-development-guide.md`에 최신 backend를 `18000`에서 검수하는 Vite dev command를 추가했다.
- `/datasets/gold` 화면에 `CatalogDataset Management Boundary` panel을 실제로 표시했다.
- registered CatalogDataset action을 `상세`만 남기고 `수정`/`삭제`를 제거했다.

## 검증

```bash
npm run build
PYTHONPATH=backend .venv/bin/pytest backend/tests/test_target_dataset_catalog_publish.py backend/tests/test_external_connection_persistence.py backend/tests/test_week2_spark_readiness.py -q
```

결과:

- Frontend build: 통과.
- Backend focused tests: `15 passed`.
- Browser smoke: `/connections`, `/datasets/gold`, `/runs` 렌더링 확인. console error 없음.

## 발견/수정한 문제

- C-21 policy panel이 Gold Dataset 화면에 표시되지 않고 다른 catalog context에만 보이던 문제를 수정했다.
- registered CatalogDataset 카드에 disabled 안내형 `수정`/`삭제` action이 남아 있어 read-only boundary와 불일치하던 문제를 수정했다.
- stale `8000` backend가 최신 route를 모르면 Vite proxy smoke가 404가 되는 문제를 `VITE_PROXY_TARGET` override로 완화했다.

## 남은 위험

- 실제 외부 connector/runtime 실행은 아직 없다.
- PR 전에는 누적 dirty worktree의 포함/제외 범위를 다시 확인해야 한다.
