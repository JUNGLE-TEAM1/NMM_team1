# Product Health Runtime Connection Seed 보고서

## Short Report / 짧은 보고

- Type: Phase
- Date: 2026-07-01
- Changed: Product Health용 Kafka/PostgreSQL/MongoDB/S3 External Connection metadata seed API와 연결 화면 seed panel을 추가했다.
- Verified: backend seed/runtime tests, frontend build, diff check.
- Remaining: C-44에서 Source Dataset 저장 payload가 이 runtime connection과 fallback evidence를 유지하도록 정렬한다.
- Next context: `/api/product-health/runtime-connections/seed`는 connection name 기준 idempotent이며 raw secret 값을 저장하지 않는다.
- Risk: 실제 DB/S3 credential secret backend와 schema discovery는 아직 별도 Phase다.

---

## Phase / Hotfix

- Type: Phase
- Branch/work location: `feature/data-lake-runtime-stack`, `docs/workflows/feature/product-health-runtime-connection-seed`
- Date: 2026-07-01
- Workspace state: completed

## Goal / 목표

- 연결 화면에서 Product Health용 Kafka/PostgreSQL/MongoDB/S3 connection 후보와 readiness 경계를 준비한다.

## Changed Files / 변경 파일

- `backend/app/domain/schemas.py`
- `backend/app/api/source_catalog.py`
- `backend/app/services/product_health_runtime_connections.py`
- `backend/tests/test_product_health_runtime_connection_seed.py`
- `frontend/src/api/externalConnectionApi.js`
- `frontend/src/app/App.jsx`
- `docs/03-interface-reference.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`
- `docs/workflows/feature/product-health-runtime-connection-seed/*`

## Implementation Summary / 구현 요약

- `POST /api/product-health/runtime-connections/seed`를 추가했다.
- seed service가 Product Health connection 4개를 생성/업데이트한다.
- Kafka는 `testable`, PostgreSQL/MongoDB/S3는 `secret_ref_required` readiness로 반환한다.
- 연결 화면에 `Product Health runtime connections` panel과 `Product Health 연결 준비` 버튼을 추가했다.
- seed 응답과 metadata에는 raw secret 값이 들어가지 않는다.

## Verification Commands / 검증 명령

```bash
PYTHONPATH=backend ./.venv/bin/pytest backend/tests/test_product_health_runtime_connection_seed.py backend/tests/test_external_connection_runtime_checks.py -q
npm --prefix frontend run build
git diff --check
```

## Quality Gate Evidence / 품질 게이트 증거

- Workspace file: `docs/workflows/feature/product-health-runtime-connection-seed/quality.md`
- Quality gate status: passed
- TDD status: focused backend tests added
- CI/check result: local checks passed
- Skipped checks: browser click smoke

## Regression Guard / 회귀 보호

- Checked feature: Product Health runtime connection seed.
- Protected behavior: seed가 raw secret 값을 저장하거나 같은 connection을 중복 생성하지 않는다.
- Result: passed.

## Failure Scenario / 실패 시나리오

- Reviewed failure: seed 응답에 password/access key/secret key/token/raw credential이 섞이는 경우.
- Expected behavior: response and metadata contain only resource, secret boundary, readiness, fallback status.
- Verification: `backend/tests/test_product_health_runtime_connection_seed.py`
- Result: passed.

## Manual Verification / 수동 검증

- Document executed: `docs/07-manual-verification-playbook.md` C-43 항목 추가.
- Environment: local test/build only.
- Result: browser manual verification not run.
- Failure/limitation: 실제 연결 화면 클릭은 수동 확인 때 수행한다.

## Secret / Migration / Env Check

- Secret check: raw credential 추가 없음.
- Migration/data change: schema migration 없음.
- Env change: 없음.

## Final Judgment / 최종 판단

- Done: yes.
- Remaining risk: C-44 전까지 Source Dataset 저장 payload는 runtime source/fallback lineage 완성 전이다.
