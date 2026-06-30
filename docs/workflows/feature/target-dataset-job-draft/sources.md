# Target Dataset job draft source 기록

## 읽은 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/08-development-workflow.md`
- `docs/03-interface-reference.md`
- `backend/app/domain/schemas.py`
- `backend/app/adapters/sqlite_metadata_store.py`
- `backend/app/api/source_catalog.py`
- `frontend/src/app/App.jsx`

## Handoff

- 이전 Phase: `target-dataset-multi-source-processing`
- 다음 Phase: `target-dataset-run-handoff`
- decisions.md handoff: 저장은 metadata draft이며 Airflow/Spark/local runner 실행이 아니다.
