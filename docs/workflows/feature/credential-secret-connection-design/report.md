# Credential secret connection design 보고서

## Short Report / 짧은 보고

- Type: Phase C-22
- Date: 2026-06-30
- Changed: External Connection credential policy API와 `/connections` Credential Secret Boundary panel을 추가했다.
- Verified: `backend/tests/test_external_connection_persistence.py`, `backend/tests/test_external_connection_discovery.py`, frontend build.
- Remaining: 실제 DB/S3 접속, secret backend, credential rotation/revoke, redaction test suite는 후속 Phase다.
- Next context: C-queue 완료. 다음은 PR 정리/검수 또는 실제 connector/runtime implementation phase 설계.
- Risk: C-22는 design boundary이며 production security hardening 완료 선언이 아니다.

## Phase / Hotfix

- Type: Phase
- Branch/work location: `feature/external-connection-persistence`, `docs/workflows/feature/credential-secret-connection-design/`
- Date: 2026-06-30
- Workspace state: dirty worktree 위에서 C-22 관련 파일만 변경.

## Reference Docs / 참고 문서

- `AGENTS.md`
- `docs/03-interface-reference.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`
- `docs/08-development-workflow.md`

## Goal / 목표

- DB/S3 connector를 실제 credential 값 저장 없이 `secret_ref` 기반 후속 연결로 제한한다.
- UI/API/log/metadata에 raw password/access key/token 값을 남기지 않는 guardrail을 명확히 한다.

## Changed Files / 변경 파일

- `backend/app/api/source_catalog.py`
- `backend/tests/test_external_connection_persistence.py`
- `frontend/src/api/externalConnectionApi.js`
- `frontend/src/app/App.jsx`
- `docs/03-interface-reference.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`

## Verification Commands / 검증 명령

```bash
PYTHONPATH=backend .venv/bin/pytest backend/tests/test_external_connection_persistence.py backend/tests/test_external_connection_discovery.py -q
npm run build
```

## Quality Gate Evidence / 품질 게이트 증거

- Workspace file: `docs/workflows/feature/credential-secret-connection-design/quality.md`
- Quality gate status: focused tests/build 통과.
- TDD status: credential policy route와 blocked design boundary를 backend test로 고정.
- Skipped checks: 실제 DB/S3 connection test는 C-22 범위 밖.

## Regression Guard / 회귀 보호

- Checked feature: DB/S3 credential 값이 metadata 또는 로그에 저장되는 경우.
- Protected behavior: raw secret value 저장/응답/로그 금지, `secret_ref_only` policy 표시.
- Result: API/UI에 read-only credential boundary로 반영.

## Manual Verification / 수동 검증

- Document executed: `docs/07-manual-verification-playbook.md` C-22 항목.
- Environment: focused backend tests와 frontend production build.
- Result: credential policy response와 연결 화면 policy panel 확인 가능.
- Failure/limitation: browser automation과 실제 DB/S3 접속은 수행하지 않음.

## docs/05 Acceptance Link / 수용 기준 연결

- Related item: DB/S3 credential 연결은 `secret_ref_only` design boundary로 표시되고 raw credential 값이 노출되지 않는다.
- Status: 구현/검증 완료.
- Evidence: backend focused tests, frontend build.

## Secret / Migration / Env Check

- Secret check: 실제 secret 값 추가 없음.
- Migration/data change: 없음.
- Env change: 없음. env var name만 future `secret_ref` 후보로 문서화.

## Final Judgment / 최종 판단

- Done: C-22 Credential secret connection design boundary 표시 완료.
- Remaining risk: 실제 connector 구현 전 redaction tests, secret storage backend 선택, rotation/revoke 정책이 필요하다.
