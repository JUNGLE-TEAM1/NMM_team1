# M5 direct spark_runner 제거 Hotfix 보고서

## Short Report / 짧은 보고

- Type: hotfix
- Branch/work location: `fix-#287`, `docs/workflows/hotfix/m5-direct-spark-runner-removal`
- Date: 2026-06-29
- Workspace state: ready-for-review
- Context Budget mode: Escalate Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, current M5 service/schema/tests/contracts, `docs/03`, `docs/05`, `docs/07`
- Escalated context read: existing M5 runner guard workspace and report, GitHub issue #287
- Context omitted intentionally: frontend UI, full product-health follow-up branch, production Airflow/Spark deployment docs
- Changed: M5 workflow API/service에서 direct `spark_runner` executor를 제거하고, 관련 fixture/docs/test를 `local_runner`/`airflow` 기준으로 맞췄다.
- Verified: TDD 실패 확인 후 workflow/catalog + M2 spark runner focused test 21 passed, 관련 JSON fixture validation passed, `git diff --check` passed, strict harness validation passed.
- Remaining: Airflow DAG 내부 Spark 호출은 별도 Phase에서 다룬다.
- Next context: Issue #287 / branch `fix-#287`. M2 `Week2SparkRunner` 자체는 유지되어 독립 smoke evidence로 남는다.
- Risk: full backend suite와 remote CI는 PR #288에서 확인한다.

## Phase / Hotfix

- Type: Hotfix
- Branch/work location: `fix-#287`, `docs/workflows/hotfix/m5-direct-spark-runner-removal`
- Date: 2026-06-29
- Workspace state: ready-for-review

## Changed Files / 변경 파일

- `backend/app/domain/schemas.py`
- `backend/app/services/week2_workflow.py`
- `backend/tests/test_week2_workflow_catalog.py`
- `contracts/execution_result.sample.json`
- `contracts/workflow_definition.sample.json`
- `contracts/runtime_config.sample.json`
- `docs/03-interface-reference.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/07-manual-verification-playbook.md`
- `docs/workflows/hotfix/m5-direct-spark-runner-removal/*`
- `docs/reports/m5-direct-spark-runner-removal.md`

## Verification Commands / 검증 명령

```bash
PYTHONPATH=backend /Users/sisu/Projects/jungle/nmm/NMM_team1/.venv/bin/python -m pytest backend/tests/test_week2_workflow_catalog.py -q
python3 -m json.tool contracts/execution_result.sample.json
python3 -m json.tool contracts/workflow_definition.sample.json
python3 -m json.tool contracts/runtime_config.sample.json
```

## Regression Guard / 회귀 보호

- Checked feature: M5 workflow executor guard.
- Protected behavior: `executor=spark_runner`가 run을 만들거나 Catalog를 갱신하지 않는다.
- Result: service/API rejection test로 확인.

## Manual Verification / 수동 검증

- Document executed: `docs/07-manual-verification-playbook.md` 관련 fixture 문구 갱신.
- Environment: local test.
- Result: direct `spark_runner` verification 문구 제거.
- Failure/limitation: Airflow/Spark 실제 통합 smoke는 이번 hotfix 범위가 아니다.

## Final Judgment / 최종 판단

- Done: yes.
- Remaining risk: remote CI 결과 확인 필요.
