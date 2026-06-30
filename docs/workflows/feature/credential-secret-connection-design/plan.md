# Credential secret connection design 계획

## 목표

DB/S3 credential을 실제 값으로 저장하지 않고 `secret_ref` 기반으로 연결하는 설계와 guardrail을 정리한다.

## 상태

- 2026-06-30: 구현 완료. `/api/external-connections/credential-policy`와 `/connections` read-only policy panel을 추가했다.

## 범위

- DB/S3 connector UI 필드 설계.
- `secret_ref` 기반 backend contract 설계.
- 로컬 env 기반 secret reference와 future secret store 경계 정의.
- credential 값 노출/commit 방지 규칙 정리.

## 제외 범위

- 실제 DB/S3 접속.
- secret manager/Vault 도입.
- credential 값 저장.
- production security hardening 완료 선언.

## 선행 조건

- External Connection persistence.
- `contracts/source_config.sample.json`, `contracts/runtime_config.sample.json`의 secret_ref 확인.

## 구현 대상 파일 예상

- `docs/03-interface-reference.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`
- `frontend/src/app/App.jsx`
- 후속 구현 시 backend schemas/API

## API/contract 영향

- `ExternalConnection.auth_mode`, `secret_ref`, `credential_status` 같은 optional field가 필요할 수 있다.
- 실제 secret value는 request/response/log에 포함하지 않는다.

## UI 영향

- DB/S3 connection type에서 `secret_ref` 입력 또는 env reference 입력을 표시한다.
- credential missing이면 inspect가 blocked로 표시된다.

## Acceptance Criteria

- credential value를 저장하지 않는 설계가 문서화된다.
- UI/API/log에 password/access key 원문이 노출되지 않는다.
- 실제 접속 구현 전 필요한 사람 확인 항목이 명확하다.

## Regression / Failure Scenario

- placeholder credential이 실제 secret처럼 commit되지 않는다.
- error message가 secret 값을 echo하지 않는다.

## Manual Verification

1. DB/S3 connector design 문구 확인.
2. secret_ref만 남고 raw secret 값이 없는지 확인.
3. blocked state가 명확한지 확인.

## Data / Evidence 확인 항목

- `.env.example` 또는 local env policy.
- `contracts/source_config.sample.json`
- `contracts/runtime_config.sample.json`

## Blocked Condition

- secret storage 방식을 사람이 결정하지 않았다.
- 실제 DB/S3 endpoint와 credential 정책이 없다.

## Report 기준

- `docs/reports/credential-secret-connection-design.md`에 accepted/deferred decision과 보안 위험을 기록한다.
