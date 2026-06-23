# Decisions

- Decision status: accepted

## Decision Option Briefs

- 별도 full brief는 작성하지 않았다. 사용자가 아래 3가지 Product Rebaseline 방향을 명시 승인했다.

## Accepted Decisions

1. 기존 CSV/local pipeline MVP는 앞으로의 제품 목표가 아니라 `Current implementation baseline`으로 남긴다.
2. `reference/AskLake_프로젝트_기획서.md`를 AskLake의 새 제품 기준으로 올린다.
3. 다음 Target MVP는 `Trusted Dataset -> Query/Ask -> Evidence -> Recovery` 신뢰 루프를 증명하는 방향으로 잡는다.

## Deferred Decisions

- R1에서 quality/PII/policy를 실제 엔진으로 구현할지 placeholder gate로 시작할지.
- 첫 source 확장을 PostgreSQL로 할지 REST API로 할지.
- Query engine을 local-first로 시작할지 Trino를 포함할지.
- Ask/Evidence에서 외부 LLM을 사용할지 mock/local rule 기반으로 시작할지.
- Kubernetes/Helm dev-lite를 Target MVP 필수 검증으로 둘지 packaging hardening으로 분리할지.

## Revisit / Rollback Conditions

- current baseline과 Target MVP가 다시 섞이면 `docs/01`, `docs/05`, `docs/06`을 우선 재검토한다.
- Trust Gate 없이 Query/Ask 구현이 진행되려 하면 R1 또는 별도 Decision Phase로 되돌린다.
