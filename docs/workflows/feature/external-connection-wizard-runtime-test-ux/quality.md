# External connection wizard runtime test UX 품질 기록

## Context Budget

- Mode: Escalate Read
- 이유: connector runtime test, credential/secret boundary, frontend wizard 저장 조건이 함께 바뀐다.
- 읽은 문서: `AGENTS.md`, `docs/workflows/feature/external-connection-wizard-runtime-test-ux/plan.md`, `docs/reports/external-connection-runtime-checks.md`, 관련 `frontend/src/app/App.jsx` 구간
- 사용 skill/tool: browser automation, curl smoke

## 검증 명령

```bash
npm --prefix frontend run build
curl -s -X POST http://127.0.0.1:18000/api/external-connections/test \
  -H 'Content-Type: application/json' \
  -d '{"connector_type":"postgres","resource":"127.0.0.1:15432/asklake","resource_label":"postgres_database","secret_refs":{"username":"ASKLAKE_DEMO_POSTGRES_USER","password":"ASKLAKE_DEMO_POSTGRES_PASSWORD"}}'
```

- 결과: frontend build 성공.
- 결과: PostgreSQL runtime test `passed`, `secret_values_exposed=false`, `schema_discovery_completed=false`.

## Browser Smoke

- URL: `http://127.0.0.1:5173/connections`
- 확인:
  - `연결 생성` wizard에서 PostgreSQL 선택 가능.
  - Configure 단계에서 env ref 입력과 `실제 연결 테스트` 버튼 표시.
  - PostgreSQL connection test 성공 후 `다음` 버튼 활성화.
  - Review 단계에 `Runtime check passed`, `schema discovery pending` 표시.
  - `External connection 저장` 후 `conn_postgres_runtime_smoke`가 backend 목록에 저장됨.
- Console: Brave headless 기준 404 1건이 있었으나 기능 실패와 무관한 정적 리소스 404로 보이며 wizard/API 실패는 없음.

## Regression / Failure Scenario

- raw credential 값은 저장 payload나 runtime test response에 남기지 않았다.
- DB/S3/Kafka runtime test 성공을 schema discovery 완료로 표시하지 않았다.
- runtime connector 저장 시 `schema_preview=[]`로 남긴다.
- `/connections` 첫 화면의 별도 runtime diagnostic card를 제거했다.
