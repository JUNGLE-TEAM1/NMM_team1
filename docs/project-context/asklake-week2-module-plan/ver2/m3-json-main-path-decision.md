# AskLake Week2 ver2 M3 JSON Main Path Decision

## 목적

이 문서는 M3가 먼저 맡을 JSON main path와 닫힌 PR #105의 회수 범위를 결정한다.

Phase 3에서 발표 필수 경로는 Amazon Reviews JSON -> M3 profile/schema/transform spec -> M5 Workflow/Catalog -> M6 AI Query -> M1 UI로 확정했다. Phase 5는 M3가 이 경로에서 만들 최소 산출물과 PR #105를 어떻게 다룰지 정한다.

## 결정

M3의 첫 구현 대상은 Amazon Reviews JSON 또는 동등한 JSON/JSONL sample이다.

PR #105는 그대로 merge하지 않는다. 대신 source material로 읽고, JSON inspection/profile/schema inference에 해당하는 작은 조각만 Phase 6 runner boundary 이후 후속 구현에서 회수한다.

## PR #105 관찰

PR #105 정보:

- PR: https://github.com/JUNGLE-TEAM1/NMM_team1/pull/105
- 작성자: `Wish-Upon-A-Star`
- 상태: closed, not merged
- Head branch: `origin/codex/m3-json-recommendations`
- 주요 커밋: `feat: add json source recommendations backend`, `feat: allow json source registration in catalog UI`
- diff 규모: 14 files, 974 insertions, 39 deletions

주요 변경 후보:

| 파일 | 판단 | 이유 |
| --- | --- | --- |
| `backend/app/adapters/json_source.py` | 회수 후보 | JSON/JSONL/gzip read, flatten, field profile, schema inference 로직이 M3 main path와 직접 관련 있다. |
| `backend/app/domain/schemas.py` | 부분 회수 후보 | `JsonProfile`, `JsonFieldProfile`, recommendation bundle류가 있으나 현재 shared schema에 바로 섞기에는 범위가 크다. |
| `backend/tests/test_source_catalog.py` | 부분 회수 후보 | JSON inspect/profile 기대 동작을 테스트로 재구성할 수 있다. |
| `backend/app/api/source_catalog.py`, `backend/app/services/source_catalog.py` | 보류 | source catalog registration과 API 확장은 M1/M3/M5 boundary가 정리된 뒤 다룬다. |
| `frontend/src/features/catalog/*`, `frontend/src/api/*`, `frontend/src/app/styles.css` | 이번 회수 제외 | UI/source registration polish는 main E2E path 최소 구현 뒤 연결한다. |
| `backend/app/services/week2_workflow.py` | 이번 회수 제외 | M5 runner boundary 전 code 변경으로 섞지 않는다. |

## M3 최소 산출물

M3의 첫 구현 slice는 아래 네 가지를 만든다.

1. JSON/JSONL sample inspection
2. schema/profile facts
3. 최소 `TransformSpec` shape
4. M5 Catalog에 넘길 metadata facts

각 산출물의 의미:

| 산출물 | 내용 | 넘기는 대상 |
| --- | --- | --- |
| JSON inspection | file format, record path, sampled row count, sample rows | M3 내부 test와 M5 runner input |
| schema/profile facts | field path, target column name, inferred type, nullable, nested/array flag, sample values | M5 Catalog metadata와 M6 query evidence |
| `TransformSpec` minimal shape | select/flatten/normalize 대상과 output dataset hint | Phase 6 runner boundary |
| Catalog metadata facts | dataset id, source id/path/type, profile summary, output convention hint | M5 Catalog store/API |

## 회수할 수 있는 로직

PR #105에서 회수 가능한 구현 아이디어:

- `.json`, `.jsonl`, `.ndjson`, gzip JSONL 처리
- top-level array와 JSONL sampled read
- nested object flatten
- field type inference
- nullable/missing count 계산
- target column name 충돌 해소
- sample value 제한

회수 시 조건:

- M3 module 또는 adapter로 작게 가져온다.
- M5 `Week2WorkflowService`를 직접 수정하지 않는다.
- M1 source catalog UI를 동시에 바꾸지 않는다.
- shared schema는 Phase 6 boundary와 맞는 최소 타입만 추가한다.
- tests는 JSON inspection/profile/TransformSpec 최소 shape에 집중한다.

## 이번 main path에서 제외

- broad source catalog registration UI
- recommendation bundle UI polish
- source catalog API 전면 확장
- M5 workflow code와 직접 결합한 JSON runner 변경
- Taxi/Kafka까지 포함하는 범용 ETL framework
- Spark session 생성 또는 Spark runtime config 소유

## Phase 6으로 넘길 질문

- M3의 `TransformSpec`를 M5 runner boundary에 어떤 필드로 넘길지
- `SchemaDefinition`과 `TransformSpec` 중 어느 쪽이 Catalog metadata의 canonical source가 될지
- M2 SparkRunner가 local runner와 같은 result shape를 반환할 때 M3 profile facts를 어디에 담을지

## Phase 5 완료 기준

- M3 main path가 Amazon Reviews JSON으로 고정되어 있다.
- PR #105를 그대로 merge하지 않고 source material로만 다루는 이유가 명시되어 있다.
- 회수 후보와 제외 범위가 파일/기능 기준으로 분리되어 있다.
- Phase 6 runner boundary가 이어받을 M3 최소 산출물이 명시되어 있다.
