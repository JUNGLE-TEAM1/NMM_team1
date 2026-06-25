# AskLake 2주차 공통 계약 보강 보고서

## Short Report / 짧은 보고

- Type: feature
- Branch/work location: `codex/asklake-week2-module-plan`, `docs/workflows/feature/asklake-week2-shared-contract-hardening`
- Date: 2026-06-25
- Changed: M1~M6 구현 전 공통으로 맞춰야 할 route, ID, storage path, workflow/run status, `QueryResult`, guardrail failure, daily smoke evidence 계약을 `docs/03`과 `contracts/*.sample.json`에 보강했다. `docs/05`, `docs/06`, `docs/07`에는 hardening 확인 기준을 추가했다.
- Verified: `jq -e . contracts/*.sample.json >/dev/null`; `PYTHONPATH=backend pytest backend/tests -q` -> 18 passed; `scripts/validate-harness.sh --strict` -> passed.
- Remaining: actual data path/row count, final MinIO/local fallback, baseline API adapter 방식은 각 구현 Phase에서 확정한다.
- Next context: M1은 `/api/week2/*` draft route 또는 baseline adapter를 결정하고, M3는 JSON schema/source, M5는 workflow/run/catalog, M6는 `AIQueryResult.query_result`를 기준으로 시작한다.
- Risk: `/api/week2/*`는 draft route다. 기존 baseline API를 재사용하면 fixture boundary adapter 또는 `docs/03` 갱신이 필요하다.

## Context Budget Evidence / 컨텍스트 예산 증거

- Context Budget mode: Escalate Read
- Primary context read: `docs/project-context/asklake-week2-module-plan/plan.md`, `docs/project-context/asklake-week2-module-plan/decisions.md`, `docs/project-context/asklake-week2-module-plan/query-result-contract-execution-prompt.md`, `contracts/*.sample.json`
- Escalated context read: `docs/03-interface-reference.md`, `docs/05-acceptance-scenarios-and-checklist.md`, `docs/06-regression-and-failure-scenarios.md`, `docs/07-manual-verification-playbook.md`
- Context omitted intentionally: actual module implementation, SQL engine implementation, Airflow/MinIO/Kafka/PostgreSQL runtime setup

## Verification Commands / 검증 명령

```bash
jq -e . contracts/*.sample.json >/dev/null
PYTHONPATH=backend pytest backend/tests -q
scripts/validate-harness.sh --strict
```

## Final Judgment / 최종 판단

- Done: yes
- Remaining risk: branch upstream이 gone 상태라 push/PR/handoff 전에 사람 확인과 git sync 결정이 필요하다.
