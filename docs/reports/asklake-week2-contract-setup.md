# AskLake 2주차 공통 계약 설정 보고서

## Short Report / 짧은 보고

- Type: feature
- Branch/work location: `codex/asklake-week2-module-plan`, `docs/workflows/feature/asklake-week2-contract-setup`
- Date: 2026-06-25
- Changed: AskLake 2주차 M1~M6 구현 전 공유할 `contracts/*.sample.json` 6개를 추가하고, `docs/03`에 Week 2 Contract Package와 `SqlEngineAdapter` 경계를 연결했다. `docs/05`, `docs/06`, `docs/07`에는 fixture contract 확인 기준을 최소 반영했다.
- Verified: `jq -e . contracts/*.sample.json >/dev/null`; `PYTHONPATH=backend pytest backend/tests -q` -> 18 passed; `scripts/validate-harness.sh --strict` -> passed.
- Remaining: Amazon Reviews sample 실제 path/row count, final MinIO bucket/path naming, Airflow fallback threshold, `SqlEngineAdapter` Python 위치는 후속 구현 Phase에서 확정한다.
- Next context: 다음 구현 Phase는 M1, M3, M5, M6 중 하나를 우선 열고, 반드시 `contracts/*.sample.json`과 `docs/03` Week 2 Contract Package를 먼저 확인한다.
- Risk: fixture의 TODO 값을 실제 구현 값으로 오해하지 않아야 한다. 실제 구현에서 contract shape가 바뀌면 `contracts/`, `docs/03`, 관련 acceptance/regression/manual verification을 함께 갱신한다.

## Context Budget Evidence / 컨텍스트 예산 증거

- Context Budget mode: Escalate Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/15-context-budget-rule.md`, `docs/project-context/asklake-week2-module-plan/README.md`, `docs/project-context/asklake-week2-module-plan/decisions.md`, `docs/project-context/asklake-week2-module-plan/plan.md`, `docs/project-context/asklake-week2-module-plan/contract-setup-prompt.md`
- Escalated context read: `docs/03-interface-reference.md`, `docs/05-acceptance-scenarios-and-checklist.md`, `docs/06-regression-and-failure-scenarios.md`, `docs/07-manual-verification-playbook.md`, `docs/08-development-workflow.md`, `backend/app/domain/target_contracts.py`, `backend/app/ports/query_engine.py`
- Context omitted intentionally: actual Airflow/DuckDB/RAG/UI/Taxi/Kafka implementation, full report history, external cloud resources

## Verification Commands / 검증 명령

```bash
jq -e . contracts/*.sample.json >/dev/null
PYTHONPATH=backend pytest backend/tests -q
scripts/validate-harness.sh --strict
```

## Manual Verification / 수동 검증

- Document executed: `docs/07-manual-verification-playbook.md`의 Modular Contract Baseline 점검 중 Week 2 fixture 확인 항목
- Result: 6개 fixture JSON 존재와 유효성 확인, `docs/03` contract package 연결 확인
- Limitation: 실제 sample file path와 row count는 아직 검증하지 않았고 후속 M3 구현 Phase에서 확정한다.

## Final Judgment / 최종 판단

- Done: yes
- Remaining risk: branch upstream이 gone 상태라 push/PR/handoff 전에 사람 확인과 git sync 결정이 필요하다.
