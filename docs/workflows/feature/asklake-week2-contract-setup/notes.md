# AskLake week 2 contract setup 노트

## 진행 메모

- 현재 worktree에 2주차 project context 반영 변경이 남아 있고 upstream branch가 gone 상태라 branch switch는 하지 않았다.
- `scripts/start-workflow.sh --no-checkout --no-issue feature asklake-week2-contract-setup "AskLake week 2 contract setup"`로 workspace scaffold만 생성했다.
- `contracts/*.sample.json`은 실행 데이터가 아니라 M1~M6가 공유할 fixture shape다.
- sample file path, row count, final MinIO path, Airflow fallback threshold는 실제 구현 전 확인이 필요해 TODO/decision으로 남겼다.

## 결정

- Week 2 계약 fixture는 Source of Truth 최종 schema가 아니라 구현 전 소비 계약으로 둔다.
- MVP SQL 실행은 `SqlEngineAdapter` 경계를 먼저 고정하고, DuckDB는 adapter 뒤 첫 구현체로만 둔다.

## 열린 질문

- Amazon Reviews demo/fixed/extended sample의 실제 파일 경로와 row 수
- final MinIO bucket/path naming
- Airflow 실패 시 local runner 전환 조건
- `SqlEngineAdapter`의 실제 Python interface 위치

## 링크 / 증거

- `contracts/source_config.sample.json`
- `contracts/schema_definition.sample.json`
- `contracts/workflow_definition.sample.json`
- `contracts/execution_result.sample.json`
- `contracts/catalog_metadata.sample.json`
- `contracts/ai_query_result.sample.json`
