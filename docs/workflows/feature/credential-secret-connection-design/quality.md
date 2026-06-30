# Credential secret connection design 품질 기록

## 검증 일자

- 2026-06-30

## 실행한 검증

```bash
PYTHONPATH=backend .venv/bin/pytest backend/tests/test_external_connection_persistence.py backend/tests/test_external_connection_discovery.py -q
npm run build
```

## 결과

- Backend focused tests: `11 passed`.
- Frontend build: 통과.
- `/api/external-connections/credential-policy`가 `secret_ref_design_only`, `secret_ref_only`, `forbidden` raw secret boundary를 반환하도록 테스트로 고정했다.

## 제한

- 실제 DB/S3 접속, schema discovery, credential 저장, secret manager/Vault 도입은 구현하지 않았다.
- local env var name은 reference로만 다루며 env value는 commit/log/metadata에 남기지 않는다.
