# Product Health External Source Contract 보고서

## Short Report / 짧은 보고

- Type: Phase
- Date: 2026-07-01
- Changed: Product Health source inventory를 Kafka/PostgreSQL/MongoDB/S3 runtime source 기준으로 재정의하고 local/prepared artifact를 fallback evidence로 분리했다.
- Verified: Product Health source inventory backend test, frontend build, diff check.
- Remaining: C-43에서 runtime connection seed/readiness를 연결 화면에 맞춘다.
- Next context: Source 저장 payload는 C-44에서 외부 시스템 connection type과 fallback evidence 기준으로 더 정렬한다.
- Risk: 아직 실제 Kafka consume, PostgreSQL query, MongoDB scan, S3 object scan은 수행하지 않는다.

---

## Phase / Hotfix

- Type: Phase
- Branch/work location: `feature/data-lake-runtime-stack`, `docs/workflows/feature/product-health-external-source-contract`
- Date: 2026-07-01
- Workspace state: completed

## Goal / 목표

- Product Health Source inventory가 `behavior_events=Kafka`, `product_catalog=PostgreSQL`, `reviews=MongoDB`, `delivery_trip_logs=S3/MinIO`로 보이게 한다.

## Changed Files / 변경 파일

- `backend/app/domain/schemas.py`
- `backend/app/services/product_health_source_inventory.py`
- `backend/tests/test_product_health_source_inventory.py`
- `frontend/src/app/App.jsx`
- `docs/03-interface-reference.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`
- `docs/08-development-workflow.md`
- `docs/workflows/feature/product-health-external-source-contract/*`

## Implementation Summary / 구현 요약

- `ProductHealthSourceInventoryItem`에 `runtime_source_type`, `runtime_resource`, `fallback_binding_type`, `fallback_path`, `fallback_status`, `fallback_message`를 추가했다.
- Product Health inventory service가 primary source를 Kafka/PostgreSQL/MongoDB/S3로 반환하고, schema/row evidence는 fallback artifact에서 읽도록 바꿨다.
- Source 생성 화면의 Product Health inventory card가 runtime source와 fallback evidence를 분리해서 표시하게 했다.
- Interface, acceptance, regression, manual verification 문서를 C-42 기준으로 갱신했다.

## Verification Commands / 검증 명령

```bash
PYTHONPATH=backend ./.venv/bin/pytest backend/tests/test_product_health_source_inventory.py -q
npm --prefix frontend run build
git diff --check
```

## Quality Gate Evidence / 품질 게이트 증거

- Workspace file: `docs/workflows/feature/product-health-external-source-contract/quality.md`
- Quality gate status: passed
- TDD status: focused backend contract test updated
- CI/check result: local checks passed
- Skipped checks: browser smoke

## Regression Guard / 회귀 보호

- Checked feature: Product Health runtime source inventory.
- Protected behavior: Product Health primary source가 local/prepared artifact로 되돌아가지 않는다.
- Result: passed.

## Failure Scenario / 실패 시나리오

- Reviewed failure: `reviews=prepared_dataset` 또는 `product_catalog=local_file`처럼 fallback이 primary로 표시되는 경우.
- Expected behavior: `binding_type=runtime_source`, `connection_type=kafka/postgres/mongodb/s3`, fallback은 `fallback_*` 필드에 표시한다.
- Verification: backend contract test and frontend build.
- Result: passed.

## Manual Verification / 수동 검증

- Document executed: `docs/07-manual-verification-playbook.md` C-42 항목 추가.
- Environment: local test/build only.
- Result: browser manual verification not run.
- Failure/limitation: 실제 화면 클릭은 다음 수동 확인 때 수행한다.

## docs/05 Acceptance Link / 수용 기준 연결

- Related item: C-42 Product Health External Source Contract.
- Status: passed for API/build.
- Evidence: backend test asserts Kafka/PostgreSQL/MongoDB/S3 mapping and fallback fields.

## Secret / Migration / Env Check

- Secret check: raw credential 추가 없음.
- Migration/data change: schema migration 없음. Pydantic response fields만 추가.
- Env change: 없음.

## Final Judgment / 최종 판단

- Done: yes.
- Remaining risk: C-43/C-44 전까지 connection seed와 저장 payload 전체 정렬은 완결되지 않았다.
