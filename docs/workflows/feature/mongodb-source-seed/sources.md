# MongoDB Source Dataset seed source branch 기록

이 branch가 다른 branch workspace에 의존하거나 여러 branch를 통합할 때 사용한다.

## Source Branch Workspaces / source branch workspace

- 없음. 다만 현재 checkout branch `feature/llm-runtime-settings-ui`의 dirty 변경은 unrelated로 유지한다.

## Required Source Files / 읽어야 할 source 파일

각 source branch에서 아래 파일을 읽는다.

- `plan.md`
- `shared-docs.md`
- `report.md`
- `quality.md`
- `decisions.md`
- `confirmations.md`
- `sync.md`

## Source Branch Base Records / source branch 기준 기록

각 source branch를 읽은 Git 지점을 기록한다.

| Source Branch | Workspace | Base Commit | Read At | Notes |
| --- | --- | --- | --- | --- |
| current | `docs/workflows/feature/mongodb-source-seed` | `62a57830` | 2026-06-30 | checkout 없이 workspace 생성 |

## Integration Notes / 통합 메모

- Relevant Source of Truth: `docs/03`, `docs/04`, `docs/05`, `docs/06`, `docs/07`, `docs/08`.
- Relevant code: `backend/app/services/external_connections.py`, `backend/app/api/source_catalog.py`, `frontend/src/app/App.jsx`, `scripts/load_jsonl_to_mongodb.py`, `docker-compose.mongodb.yml`.
