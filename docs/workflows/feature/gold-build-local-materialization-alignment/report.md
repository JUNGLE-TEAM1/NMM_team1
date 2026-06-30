# Gold Build local materialization alignment 보고서

## Short Report / 짧은 보고

- Type: Phase C-17
- Date: 2026-06-30
- Changed: Gold Build local execution을 prepared parquet reference mode와 local demo JSONL mode로 분리하고, prepared parquet Catalog publish가 실제 parquet schema를 쓰도록 보정했다.
- Verified: backend focused tests 11개, frontend build, `/runs` browser smoke, Catalog/AI Query HTTP smoke.
- Remaining: 실제 Airflow/Spark 실행, 대용량 ETL 신규 실행은 후속 Phase.
- Next context: C-18 Kafka replay evidence UI 또는 C-19/C-20 readiness phase로 진행 가능.
- Risk: local DB에 smoke용 duplicate run/catalog records가 남아 있으므로 PR/demo 전 seed/cleanup 정책 확인 필요.

## Phase / Hotfix

- Type: Phase
- Branch/work location: `feature/external-connection-persistence`, workspace `docs/workflows/feature/gold-build-local-materialization-alignment/`
- Date: 2026-06-30
- Workspace state: completed, local dirty changes present

## Goal / 목표

- 1-row local demo materializer와 prepared Product Health Gold parquet reference를 혼동하지 않게 하고, prepared output이 Catalog/AI Query로 이어지게 한다.

## Changed Files / 변경 파일

- `backend/app/adapters/sqlite_metadata_store.py`
- `backend/app/services/target_dataset_local_runner.py`
- `backend/app/services/prepared_product_health_outputs.py`
- `backend/app/services/dataset_file_evidence.py`
- `backend/app/services/catalog_retriever.py`
- `backend/app/api/source_catalog.py`
- `backend/tests/test_target_dataset_local_materialization.py`
- `backend/tests/test_target_dataset_catalog_publish.py`
- `backend/tests/test_week2_ai_query_duckdb.py`
- `frontend/src/app/App.jsx`
- `docs/03-interface-reference.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`
- `docs/workflows/feature/gold-build-local-materialization-alignment/plan.md`
- `docs/workflows/feature/gold-build-local-materialization-alignment/quality.md`

## Implementation Summary / 구현 요약

- `gold_output=dataset_product_health`가 `data/local_sources/product_health/gold/gold_product_health.parquet`와 매칭되면 runner가 새 파일을 만들지 않고 prepared parquet를 참조한다.
- 기존 `dataset_product_health_gold` demo path는 `data/dataset_runs/<run_id>/...jsonl`을 생성하는 local demo mode로 유지했다.
- Catalog publish는 parquet output이면 actual parquet schema/sample을 읽고 `storage.format=parquet`를 저장한다.
- AI Query retrieval에서 `internal_product_id`를 상품 키 alias로 인정해 실제 parquet schema 기반 SQL을 만든다.
- 실행 기록 UI에 `prepared parquet reference`와 `local demo JSONL` 문구를 표시한다.

## Verification Commands / 검증 명령

```bash
PYTHONPATH=backend .venv/bin/pytest backend/tests/test_target_dataset_local_materialization.py backend/tests/test_target_dataset_catalog_publish.py backend/tests/test_ai_query_dataset_context.py backend/tests/test_week2_ai_query_duckdb.py -q
npm run build
```

## Quality Gate Evidence / 품질 게이트 증거

- Workspace file: `docs/workflows/feature/gold-build-local-materialization-alignment/quality.md`
- Quality gate status: passed
- TDD status: prepared parquet execute/publish/AI Query regression tests added
- CI/check result: local only
- Skipped checks: full suite, remote CI
- CD/deploy gate: not applicable

## Manual Verification / 수동 검증

- Environment: backend `127.0.0.1:18000`, frontend `127.0.0.1:5173`
- `/runs`: `prepared parquet reference`, `rows 1000`, `gold_product_health.parquet` 표시 확인
- `/api/catalog/datasets`: `parquet`, `prepared_gold_reference`, actual parquet schema 확인
- `/api/week2/ai/query`: succeeded, `SELECT internal_product_id, risk_score ...` 확인

## Regression Guard / 회귀 보호

- Checked feature: local demo JSONL path, prepared parquet path, Catalog publish, AI Query
- Protected behavior: succeeded run만 publish 가능하고, parquet schema와 SQL allowlist가 어긋나지 않는다.
- Result: passed

## Failed / Incomplete / Follow-Up TODO

- Airflow/Spark 실제 실행은 수행하지 않았다.
- smoke 과정에서 local DB에 같은 prepared run/catalog가 여러 개 생겼다. cleanup/seed 정책은 후속에서 정리한다.

## Context For Next Phase / 다음 Phase 문맥

- C-18은 Kafka replay evidence 조회 UI, C-19는 Airflow readiness, C-20은 Spark runner readiness다.
- C-17 이후 Gold output은 demo JSONL과 prepared parquet 두 경로가 명시적으로 구분된다.

## Final Judgment / 최종 판단

- Done: yes
- Remaining risk: duplicate local Catalog row가 있을 때 demo 화면 정렬/cleanup 정책이 아직 없다.
