# M2 source input 계약 확장 보고서

## Short Report / 짧은 보고

- Type: feature
- Date: 2026-06-28
- Changed: `RuntimeSourceInput`이 기존 `input_format` / `input_path`와 새 `source_type` / `format` / `path`를 함께 받을 수 있게 했다. `Week2SparkRunner`는 `source_type=local_file`만 실제 실행하고, `postgres` 등 미지원 source type은 failed result로 반환한다. RuntimeConfig fixture와 `docs/03`, regression guard를 갱신했다.
- Verified: TDD 실패 확인 후 `backend/tests/test_week2_spark_runner.py` 7 passed, Product Health runtime smoke succeeded, `contracts/runtime_config.sample.json` JSON validation passed.
- Remaining: 실제 S3/PostgreSQL/MongoDB/Kafka connector, UI source connection, credential 저장, M5 workflow source config 변환은 후속 작업이다.
- Next context: M1 UI 또는 M5 workflow가 source connection을 붙일 때 `source_type`은 위치/통로, `format`은 payload 모양으로 나눠 `RuntimeConfig.source_inputs[]`를 만들면 된다.
- Risk: 새 필드는 contract shape만 여는 additive 변경이다. DB/Kafka 연결 자체를 증명하지 않는다.

## Phase / Hotfix

- Type: feature
- Branch/work location: `feature/m2-source-input-contract`, `docs/workflows/feature/m2-source-input-contract`
- Date: 2026-06-28
- Workspace state: PR open; linked issue #233 created and PR #234 opened.

## Reference Docs / 참고 문서

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/03-interface-reference.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/15-context-budget-rule.md`
- `docs/reports/m2-product-health-runtime-smoke.md`

## Goal / 목표

- M2 runtime input 계약에서 데이터 위치/통로(`source_type`)와 데이터 형식(`format`)을 분리하되, 기존 `input_format` / `input_path` 호출을 깨지 않게 한다.

## Changed Files / 변경 파일

- `backend/app/domain/runtime_config.py`
- `backend/app/services/week2_spark_runner.py`
- `backend/tests/test_week2_spark_runner.py`
- `scripts/week2_m2_product_health_runtime_smoke.py`
- `contracts/runtime_config.sample.json`
- `docs/03-interface-reference.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/workflows/feature/m2-source-input-contract/*`

## Implementation Summary / 구현 요약

- `RuntimeSourceInput`에 `source_type`, `format`, `path`, `connection_ref`, `table`, `topic`, `query`, `message_format`를 추가했다.
- legacy `input_format` / `input_path`와 새 `format` / `path`가 같이 들어오면 값이 같은지 검증한다.
- `Week2SparkRunner`는 새 필드와 legacy 필드 중 실제 reader가 사용할 값을 계산해 기존 read/write 흐름에 넣는다.
- `source_type=local_file` 외 source type은 아직 connector가 없으므로 성공시키지 않고 failed result로 반환한다.

## Context Budget Evidence / 컨텍스트 예산 증거

- Context Budget mode: Escalate Read.
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/15-context-budget-rule.md`, M2 runner/tests.
- Escalated context read: `docs/03-interface-reference.md`, `docs/06-regression-and-failure-scenarios.md`, `docs/reports/m2-product-health-runtime-smoke.md`.
- Context omitted intentionally: 전체 `docs/08`, unrelated reports, unrelated workspaces.

## Verification Commands / 검증 명령

```bash
PYTHONPATH=backend .venv/bin/python -m pytest backend/tests/test_week2_spark_runner.py -q
PYTHONPATH=backend .venv/bin/python scripts/week2_m2_product_health_runtime_smoke.py --summary-path data/results/m2_product_health_runtime_smoke/source_input_contract_summary.json
python3 -m json.tool contracts/runtime_config.sample.json
```

## Quality Gate Evidence / 품질 게이트 증거

- Workspace file: `docs/workflows/feature/m2-source-input-contract/quality.md`
- Quality gate status: focused checks passed.
- TDD status: applied. 새 `source_type` / `format` / `path` 테스트 2개가 기존 코드에서 실패한 뒤 구현으로 통과했다.
- CI/check result: local focused checks passed.
- Skipped checks: full backend suite, remote CI, GitHub PR checks.
- CD/deploy gate: not required.

## Regression Guard / 회귀 보호

- Checked feature: 기존 single input runner, 기존 `source_inputs[]` legacy 입력, Product Health smoke.
- Protected behavior: 기존 `input_format` / `input_path`는 유지된다.
- Result: passed.

## Manual Verification / 수동 검증

- Environment: local `.venv`, repository sample JSONL fixtures.
- Result: Product Health runtime smoke succeeded.
- Evidence: 4 logical sources, 11 input rows, 1412 input bytes, 6719 output bytes.
- Failure/limitation: initial GitHub issue/remote branch creation was blocked by invalid `gh` token and GitHub App 403. `gh` auth was restored, issue #233 was created, and PR #234 was opened.

## docs/05 Acceptance Link / 수용 기준 연결

- Related item: Week 2 Product Health representative path records source별 row count, bytes, duration, output path evidence.
- Status: unchanged behavior, contract compatibility improved.
- Evidence: Product Health smoke still returns source-level read/write task results.

## Secret / Migration / Env Check

- Secret check: no secret added.
- Migration/data change: no migration. Generated `data/results` output is not tracked.
- Env change: no new env required.

## Final Judgment / 최종 판단

- Done: yes for local M2 source input contract compatibility slice.
- Remaining risk: actual external connectors and UI source connection are still future work.
