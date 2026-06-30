# External connection wizard runtime test UX

## Short Report / 짧은 보고

- Type: Phase C-25A
- Date: 2026-06-30
- Changed: External Connection 생성 wizard에 PostgreSQL/MongoDB/MinIO/S3/Kafka runtime test 흐름을 붙이고 `/connections` 첫 화면의 진단 패널을 제거했다.
- Verified: frontend build, PostgreSQL API smoke, browser smoke, 저장된 `conn_postgres_runtime_smoke` 확인.
- Remaining: schema discovery, ingest, Kafka replay trigger, connection test audit persistence.
- Next context: C-26에서 Source Dataset schema discovery/review와 runtime connection 상태를 연결한다.
- Risk: runtime connector는 실제 접속만 확인하며 `schema_preview=[]`로 저장된다. 이것을 schema discovery 완료로 해석하면 안 된다.

## Phase / Hotfix

- Type: Phase
- Branch/work location: `feature/external-connection-wizard-runtime-test-ux`
- Date: 2026-06-30
- Workspace state: 구현 및 로컬 검증 완료, PR/merge는 수행하지 않음.

## Goal / 목표

- 연결 생성 중 connector별 입력과 실제 connection test를 수행하고, raw credential 저장 없이 Review/저장으로 이어지게 한다.

## Changed Files / 변경 파일

- `frontend/src/app/App.jsx`
- `frontend/src/app/styles.css`
- `docs/workflows/feature/external-connection-wizard-runtime-test-ux/plan.md`
- `docs/workflows/feature/external-connection-wizard-runtime-test-ux/quality.md`
- `docs/workflows/feature/external-connection-wizard-runtime-test-ux/report.md`
- `docs/reports/external-connection-wizard-runtime-test-ux.md`
- `docs/reports/README.md`

## Verification Commands / 검증 명령

```bash
npm --prefix frontend run build
curl -s -X POST http://127.0.0.1:18000/api/external-connections/test \
  -H 'Content-Type: application/json' \
  -d '{"connector_type":"postgres","resource":"127.0.0.1:15432/asklake","resource_label":"postgres_database","secret_refs":{"username":"ASKLAKE_DEMO_POSTGRES_USER","password":"ASKLAKE_DEMO_POSTGRES_PASSWORD"}}'
```

## Manual Verification / 수동 검증

- Browser: `http://127.0.0.1:5173/connections`
- 확인:
  - `연결 생성 -> PostgreSQL -> Configure` 이동.
  - env ref 입력이 보이고 raw password 입력/저장은 없음.
  - `실제 연결 테스트` 성공.
  - Review에서 `Runtime check passed`, `schema discovery pending` 확인.
  - `External connection 저장` 후 backend 목록에서 `conn_postgres_runtime_smoke` 확인.

## Regression Guard / 회귀 보호

- raw credential value 저장 금지: 통과.
- runtime test 성공을 schema discovery 완료로 표시 금지: 통과.
- local file/folder credential 입력창 노출 금지: 기존 흐름 유지.
- `/connections` 첫 화면 diagnostic clutter 제거: 통과.

## Failed / Incomplete / Follow-Up TODO

- Brave headless console에서 정적 리소스 404 1건이 감지됐으나 wizard/API 실패는 없었다.
- DB/S3/Kafka schema discovery와 ingest는 후속 Phase로 남김.

## Final Judgment / 최종 판단

- Done: C-25 backend connection test가 실제 연결 생성 wizard 안으로 이동했다.
- Remaining risk: 저장된 runtime connection은 schema가 비어 있으므로 C-26에서 Source Dataset review 경계를 보완해야 한다.
