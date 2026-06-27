# M6 DuckDB SQL engine 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- 해당 없음. SQL engine choice는 existing Week 2 decision에서 이미 Adapter + `DuckDBSqlEngine`으로 확정되어 있다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| DuckDB dependency | `duckdb==1.5.4` | Python 3.13 wheel이 설치 가능하고, repo requirements가 pinning을 사용한다. | `python -m pip index versions duckdb`, 2026-06-27 |
| default app wiring | keep `FakeSqlEngine` as default | 이번 Phase는 adapter 추가가 목표이고, 기본 실행 전환은 별도 Phase에서 env-gated로 다루는 편이 안전하다. | user step 2 scope / 2026-06-27 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| container default DuckDB switch | 기본 wiring 전환은 API behavior와 CI/runtime dependency surface를 더 크게 바꾼다. | SQL planner/env-gated engine selection phase | M6 later step |
| remote S3/MinIO read | 이번 Phase는 local fallback path만 다룬다. | MinIO E2E 또는 remote storage adapter phase | M2/M5/M6 integration |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| `duckdb==1.5.4` | CI 또는 target runtime에서 wheel 설치가 반복 실패 | version pin 재검토 또는 adapter optional dependency 처리 강화 |
| keep fake default | 실제 SQL 검산이 API 기본 경로에 필요해지는 경우 | env-gated `SQL_ENGINE=duckdb` wiring phase로 전환 |
