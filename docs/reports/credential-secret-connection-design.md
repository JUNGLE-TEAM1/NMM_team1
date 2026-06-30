# Credential secret connection design 보고서

## Short Report / 짧은 보고

- Type: Phase C-22
- Date: 2026-06-30
- Changed: `GET /api/external-connections/credential-policy`와 `/connections`의 Credential Secret Boundary panel을 추가했다.
- Verified: backend focused tests `11 passed`, frontend build 통과.
- Remaining: 실제 DB/S3 접속, secret backend, credential rotation/revoke, redaction test suite는 후속 Phase다.
- Next context: C-queue 완료. 다음은 PR 정리/검수 또는 실제 connector/runtime implementation phase 설계.
- Risk: C-22는 design boundary이며 production security hardening 완료 선언이 아니다.

## 변경 요약

- External Connection credential policy API를 추가했다.
- 연결 화면에 DB/S3 credential guardrail panel을 추가했다.
- 정책은 `secret_ref_only`를 허용하고 raw secret value 저장을 `forbidden`으로 둔다.
- Database/Object Storage connector는 실제 접속/inspect/save가 아니라 blocked/design-only 상태로 유지한다.

## 검증

```bash
PYTHONPATH=backend .venv/bin/pytest backend/tests/test_external_connection_persistence.py backend/tests/test_external_connection_discovery.py -q
npm run build
```

결과:

- Backend focused tests: `11 passed`.
- Frontend build: 통과.

## 문서 업데이트

- `docs/03-interface-reference.md`: credential policy route와 `secret_ref_only` boundary 추가.
- `docs/05-acceptance-scenarios-and-checklist.md`: raw credential 미노출 수용 기준 추가.
- `docs/06-regression-and-failure-scenarios.md`: DB/S3 credential 값 저장/로그 노출 회귀 시나리오 추가.
- `docs/07-manual-verification-playbook.md`: C-22 수동 검증 절차 추가.

## 남은 위험

- 실제 connector 구현 전에는 secret storage backend, rotation/revoke, error redaction, request schema hardening을 먼저 확정해야 한다.
- local env var name은 reference로 허용하지만 env value는 Git, API response, log에 남기지 않는다.
