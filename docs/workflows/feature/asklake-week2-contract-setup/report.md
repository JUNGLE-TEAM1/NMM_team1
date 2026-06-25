# AskLake week 2 contract setup 보고서

## Short Report / 짧은 보고

- Type: feature
- Branch/work location: `feature/asklake-week2-contract-setup`, `docs/workflows/feature/asklake-week2-contract-setup`
- Date: 2026-06-25
- Workspace state: complete
- Context Budget mode: Escalate Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/15-context-budget-rule.md`, `docs/project-context/asklake-week2-module-plan/README.md`, `docs/project-context/asklake-week2-module-plan/decisions.md`, `docs/project-context/asklake-week2-module-plan/plan.md`, `docs/project-context/asklake-week2-module-plan/contract-setup-prompt.md`
- Escalated context read: `docs/03-interface-reference.md`, `docs/05-acceptance-scenarios-and-checklist.md`, `docs/06-regression-and-failure-scenarios.md`, `docs/07-manual-verification-playbook.md`, `docs/08-development-workflow.md`, `backend/app/domain/target_contracts.py`, `backend/app/ports/query_engine.py`
- Context omitted intentionally: actual Airflow/DuckDB/RAG/UI/Taxi/Kafka implementation, full report history, external cloud resources
- Changed: `contracts/*.sample.json` 6개 추가, `docs/03` Week 2 Contract Package 추가, acceptance/regression/manual verification 기준 보강, workspace/report 작성
- Verified: `jq -e . contracts/*.sample.json >/dev/null`; `PYTHONPATH=backend pytest backend/tests -q` -> 18 passed; `scripts/validate-harness.sh --strict` -> passed
- Remaining: 실제 sample path/row count, final MinIO naming, Airflow fallback threshold, `SqlEngineAdapter` Python 위치는 후속 구현 Phase에서 확정
- Next context: M1~M6 구현은 이 fixture package를 먼저 읽고 변경 필요 시 `docs/03`과 `contracts/`를 함께 갱신한다.
- Risk: fixture는 최종 storage schema가 아니며, TODO 값을 실제 구현 값으로 오해하면 contract drift가 생길 수 있다.
