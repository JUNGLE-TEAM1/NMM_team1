# AskLake week 2 shared contract hardening 노트

## 진행 메모

- 기존 2주차 contract setup 결과를 기반으로 실제 모듈 착수 전 공통 hardening을 수행했다.
- branch switch는 하지 않고 `--no-checkout --no-issue` workspace로 진행했다. 현재 upstream branch는 gone 상태라 push/PR/merge는 사람 확인 전 보류한다.
- `QueryResult`는 `AIQueryResult.query_result` 내부 객체로 우선 고정했다.

## 결정

- `/api/week2/*` route는 Week 2 draft route이며 final product API가 아니다.
- 기존 baseline API를 재사용하는 구현은 이 draft fixture 경계에 맞춘 adapter를 두거나 `docs/03`을 갱신해야 한다.

## 열린 질문

- final MinIO endpoint와 local fallback path
- Amazon Reviews 실제 sample path와 row count
- M1 API skeleton이 `/api/week2/*`를 새로 둘지 기존 `/api/*` baseline route adapter로 처리할지

## 링크 / 증거

- `contracts/ai_query_result.sample.json`
- `docs/03-interface-reference.md`
- `docs/reports/asklake-week2-shared-contract-hardening.md`
