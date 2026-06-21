# 03. Auth Or Access Control

## 목적

authentication, authorization, permission, access boundary를 확인한다.

## 사전 조건

- test identity 또는 role이 있다.
- protected path와 public path가 확인되어 있다.

## 절차

1. public path 또는 public action에 접근한다.
2. 권한 없이 protected path 또는 protected action에 접근한다.
3. 지정 role로 authenticate하거나 전환한다.
4. protected action을 다시 시도한다.
5. applicable하면 unauthorized role 또는 expired session을 시도한다.

## 기대 결과

- public access가 동작한다.
- unauthorized access가 명확히 실패한다.
- authorized access가 성공한다.
- error가 문서화된 failure format과 맞다.

## 실패 시

- token/session/role 상태를 확인한다.
- permission rule을 확인한다.
- error mapping을 확인한다.

## 증거

- 사용한 identity/role
- action별 result
- log/screenshot
