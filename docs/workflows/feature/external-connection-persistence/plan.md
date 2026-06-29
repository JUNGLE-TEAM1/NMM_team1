# External connection persistence 계획

## 브랜치

- Branch: `feature/external-connection-persistence`
- Workspace: `docs/workflows/feature/external-connection-persistence`
- Created: 2026-06-29

## 목표

- `데이터셋 생성 > External Connection` wizard의 Review 결과를 backend metadata로 저장한다.
- 현재 UI의 demo connection cards를 실제 External Connection 목록 API 응답으로 교체한다.

## 범위

- External Connection create/list/read API.
- connector type: CSV, Kafka, PostgreSQL, REST API, S3, MongoDB.
- 저장 필드: `connection_id`, `name`, `connector_type`, `resource`, `auth_mode`, `credential_ref`, `created_at`, `updated_at`.
- `credential_ref`는 참조 문자열만 저장하고 실제 secret value는 저장하지 않는다.
- UI는 저장 성공 후 Source Dataset 생성에서 방금 만든 connection을 선택할 수 있어야 한다.

## 범위 제외

- 실제 credential 저장.
- 실제 connection test.
- 외부 시스템 ingest.
- Source Dataset 생성 API.
- Target Dataset/job 실행.

## 구현 프롬프트

```text
@AGENTS.md @docs/08-development-workflow.md @docs/03-interface-reference.md @docs/12-quality-gates.md

`feature/external-connection-persistence` Phase만 구현한다.
External Connection create/list/read API와 UI 연결을 추가하고, 기존 demo connection card를 API 응답으로 교체한다.
secret value 저장과 실제 connection test는 제외하고, credential은 `credential_ref`/`auth_mode` metadata로만 표현한다.
완료 전 frontend build, backend focused tests, harness validation, browser smoke를 기록한다.
```

## 완료 기준

- [ ] External Connection draft를 저장할 수 있다.
- [ ] External Connection 목록을 조회할 수 있다.
- [ ] Source Dataset wizard가 API 기반 connection 목록을 사용한다.
- [ ] secret value가 repo, local storage, API response에 남지 않는다.
- [ ] report와 quality evidence를 남긴다.
