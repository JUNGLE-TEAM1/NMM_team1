# AskLake Week2 M1 Live UI Phase Plan

## 문서 목적

이 문서는 M1 UI/API Gateway가 Week2 ver2 기준에서 남긴 live integration 작업을 작은 Phase로 나눈다.

M1 UI shell은 이미 `frontend/src/app/App.jsx`, `frontend/src/app/m1StaticShellData.js`, `frontend/src/app/styles.css`에 있다. 남은 일은 새 schema, runner, catalog store, query engine을 만드는 것이 아니라, M5/M6 API 결과를 화면에 연결하고 발표 클릭 흐름을 끊기지 않게 만드는 것이다.

## 기준

- M1은 UI/API Gateway와 발표 클릭 흐름을 맡는다.
- M1은 M5 run/catalog API와 M6 AI Query API를 소비한다.
- M1은 pending, empty, error, fallback 상태를 숨기지 않고 화면에 표시한다.
- M1은 source/schema/runner/catalog/query 내부 로직의 최종 결정자가 아니다.
- M6 PR #145가 merge되기 전에도 M1은 `AIQueryResult` shape를 소비하는 화면 작업을 준비할 수 있다.
- M5 PR #132는 다른 팀원 PR이므로 이 계획에서 변경 대상으로 삼지 않는다.

## 전체 Phase 순서

| Phase | 이름 | 핵심 목표 | 상태 기준 |
| --- | --- | --- | --- |
| 1 | M1 Week2 API Client 연결 | Week2 M5/M6 API 호출 함수를 frontend에 추가 | API client와 에러 처리 smoke 완료 |
| 2 | M1 Run Status Live UI | `/runs`에서 M5 workflow 실행과 `ExecutionResult`를 표시 | run 실행, logs, task 결과 표시 |
| 3 | M1 Catalog Live UI | `/catalog`와 detail 화면에서 M5 `CatalogMetadata`를 표시 | metrics, schema, lineage, storage 표시 |
| 4 | M1 AI Query Live UI | `/ask`에서 M6 `AIQueryResult`를 표시 | question -> SQL/rows/summary/evidence 표시 |
| 5 | M1 Demo Click Flow Polish | 발표 순서 CTA와 상태 전이를 연결 | run -> catalog -> query 흐름 완주 |

## 후속 Phase Queue - 2026-06-28 기준

아래 Phase들은 M1이 현재 바로 진행할 수 있는 후속 작업이다. M2/M3/M5/M6의 backend 책임을 대신 구현하지 않고, 화면 검증과 방어적 표시를 보강한다.

| Phase | 이름 | Branch workspace | 핵심 목표 | 선행 조건 |
| --- | --- | --- | --- | --- |
| 6 | M1 final browser smoke | `docs/workflows/feature/m1-final-browser-smoke` | 최신 main 기준 `/etl -> /catalog -> /query` browser smoke 증거 기록 | PR #223 merge 완료 |
| 7 | M1 query route trace UI | `docs/workflows/feature/m1-query-route-trace-ui` | M6 `AIQueryResult.route`와 `retrieval_trace` 표시 | M6 response contract trace merge |
| 8 | M1 product health readiness UI | `docs/workflows/feature/m1-product-health-readiness-ui` | `dataset_product_health_gold` 미준비/준비 상태를 fake success 없이 표시 | Product Health 대표 경로 기준 확정 |
| 9 | M1 product health demo CTA | `docs/workflows/feature/m1-product-health-demo-cta` | M6 planner intent에 맞춘 Product Health 질문 버튼 추가 | M6 SQL planner intent merge |
| 10 | M1 demo readiness panel | `docs/workflows/feature/m1-demo-readiness-panel` | M2/M3/M5/M6/M1 readiness를 발표 화면에서 요약 | Phase 6 결과 또는 현재 report 기준 |

후속 Phase 실행 순서는 6 -> 7 -> 8 -> 9 -> 10을 권장한다. Phase 6은 검증 전용이므로 먼저 수행하면 실제 UI 보강의 필요 지점을 더 정확히 알 수 있다.

## 공통 제외 범위

아래 항목은 모든 M1 Phase에서 제외한다.

- schema inference 구현
- `TransformSpec` 또는 ETL job logic 생성
- `SparkRunner` 구현
- M5 runner selection 결정 또는 executor guard 변경
- Catalog 저장소/API 내부 구현 변경
- M6 retrieval/scoring/SQL planning/SQL guardrail 로직 구현
- external vector DB, full document RAG, real LLM provider 연결
- M2/M3/M4/M5/M6 소유 계약을 M1에서 임의 변경

## Phase 1. M1 Week2 API Client 연결

### 목표

frontend가 Week2 M5/M6 API를 직접 호출할 수 있는 작은 client layer를 만든다.

### 포함 범위

- `frontend/src/api/week2Api.js` 추가
- `triggerWeek2Run(pipelineId, options)` 함수 추가
- `getWeek2Run(runId)` 함수 추가
- `getWeek2Catalog(datasetId)` 함수 추가
- `askWeek2AiQuery(question)` 함수 추가
- HTTP error, empty response, validation error를 기존 `request()` error shape로 전달
- API client export를 `frontend/src/api/asklakeClient.js`에 연결

### 제외 범위

- 화면 대규모 개편
- run polling 구현
- chart rendering 구현
- M6 scoring 또는 SQL 로직 변경
- M5 workflow service 변경

### 의존 모듈 또는 API

- M5: `POST /api/week2/workflows/{pipeline_id}/runs`
- M5: `GET /api/week2/runs/{run_id}`
- M5: `GET /api/week2/catalog/{dataset_id}`
- M6: `POST /api/week2/ai/query`

### 변경 예상 파일

- `frontend/src/api/week2Api.js`
- `frontend/src/api/asklakeClient.js`
- 필요 시 `frontend/src/api/httpClient.js`

### 완료 기준

- 네 API 함수가 모두 export된다.
- 기본 pipeline id는 `pipeline_product_health_e2e`를 소비할 수 있다.
- 기본 dataset id는 `dataset_product_health_gold`를 소비할 수 있다.
- backend가 꺼져 있거나 404가 날 때 사용자-facing error message로 전달된다.

### 검증 계획

- frontend build: `cd frontend && npm run build`
- API client symbol scan: `rg -n "triggerWeek2Run|getWeek2Run|getWeek2Catalog|askWeek2AiQuery" frontend/src`
- strict harness validation: `scripts/validate-harness.sh --strict`
- diff whitespace: `git diff --check`

### 위험 요소

- Week2 API response가 아직 TypeScript type으로 고정되지 않아 화면에서 optional field 접근 오류가 날 수 있다.
- `request()`가 JSON 없는 response를 `null`로 처리하므로 화면 Phase에서 null guard가 필요하다.

### 다음 Phase로 넘길 것

- `/runs` 화면에서 `triggerWeek2Run`을 실제 버튼에 연결한다.
- run 결과 표시용 view model은 Phase 2에서 만든다.

## Phase 2. M1 Run Status Live UI

### 목표

`/runs` 화면에서 M5 workflow를 실행하고 `ExecutionResult`를 읽을 수 있게 한다.

### 포함 범위

- `RunStatusPage`에서 `pipeline_product_health_e2e` 실행 버튼 연결
- executor 기본값은 M5가 현재 지원하는 `local_runner`로 둔다.
- `run_id`, `status`, `executor`, `row_count`, `bytes`, `duration_ms` 표시
- `task_results` table 표시
- `logs` 표시
- `outputs[].uri`와 local fallback 관련 정보를 표시할 자리 마련
- loading, empty, error, fallback 상태 표시

### 제외 범위

- polling 또는 background refresh
- executor selection UI
- M5 runner selection rule 변경
- SparkRunner 연결
- Airflow 실제 trigger 구현
- M3 TransformSpec 생성

### 의존 모듈 또는 API

- M5 `Week2WorkflowService`
- `POST /api/week2/workflows/pipeline_product_health_e2e/runs`
- `GET /api/week2/runs/{run_id}`

### 변경 예상 파일

- `frontend/src/app/App.jsx`
- `frontend/src/app/styles.css`
- `frontend/src/api/week2Api.js`
- 필요 시 `frontend/src/app/m1StaticShellData.js`

### 완료 기준

- 사용자가 `/runs`에서 workflow를 실행할 수 있다.
- 실행 성공 후 run summary와 task/log detail이 화면에 남는다.
- 실패하면 error state가 표시되고 fake success로 보이지 않는다.
- local runner 또는 fallback 상태가 그대로 읽힌다.

### 검증 계획

- backend focused test는 기존 M5 tests를 신뢰하되, frontend build를 통과한다.
- local backend가 가능하면 manual smoke로 run 버튼을 눌러 `run_id`를 확인한다.
- `cd frontend && npm run build`
- `scripts/validate-harness.sh --strict`
- `git diff --check`

### 위험 요소

- run 실행이 local metadata file을 생성하므로 manual smoke 결과와 git 추적 파일을 분리해야 한다.
- M5 PR #132가 아직 merge되지 않았으면 unsupported executor guard 상태가 main과 다를 수 있다.

### 다음 Phase로 넘길 것

- 성공 run의 output dataset을 `/catalog/dataset_product_health_gold`로 연결한다.

## Phase 3. M1 Catalog Live UI

### 목표

`/catalog`와 catalog detail 화면에서 M5 `CatalogMetadata`를 표시한다.

### 포함 범위

- `GET /api/week2/catalog/dataset_product_health_gold` 호출
- dataset id, name, layer, status 표시
- schema fields 표시
- metrics `row_count`, `bytes`, quality facts 표시
- lineage `run_id` 표시
- `s3_uri`, storage prefix, local fallback path 표시
- catalog 없음, run 전 상태, API error 상태 표시
- run 화면에서 catalog 화면으로 이동하는 CTA 연결

### 제외 범위

- Catalog store/API backend 변경
- SQLite/Postgres Catalog DB 전환
- schema inference 또는 quality rule 계산
- governance/RBAC 설정 구현
- multi-dataset catalog browser 완성

### 의존 모듈 또는 API

- M5 `Week2CatalogStore`
- M5 `GET /api/week2/catalog/{dataset_id}`
- Phase 2의 latest run 표시

### 변경 예상 파일

- `frontend/src/app/App.jsx`
- `frontend/src/app/styles.css`
- `frontend/src/api/week2Api.js`
- 필요 시 catalog 표시 helper 파일

### 완료 기준

- `dataset_product_health_gold` metadata가 live API에서 표시된다.
- schema, metrics, storage, lineage가 placeholder 대신 실제 payload 기반으로 보인다.
- catalog가 없을 때 run 먼저 실행하라는 상태를 표시한다.

### 검증 계획

- `cd frontend && npm run build`
- local backend 가능 시 run 실행 후 catalog 화면 refresh smoke
- `rg -n "CatalogMetadata|dataset_product_health_gold|lineage|local_fallback_path" frontend/src`
- `scripts/validate-harness.sh --strict`
- `git diff --check`

### 위험 요소

- run 전에는 catalog가 존재하지 않을 수 있으므로 404를 정상 empty state로 처리해야 한다.
- M3가 만드는 최종 schema facts와 현재 M5 catalog template이 다를 수 있다.

### 다음 Phase로 넘길 것

- Catalog detail에서 AI Query 화면으로 이동하고 선택 dataset evidence를 확인한다.

## Phase 4. M1 AI Query Live UI

### 목표

`/ask` 화면에서 M6 `AIQueryResult`를 실제 API 결과로 표시한다.

### 포함 범위

- question 입력 후 `POST /api/week2/ai/query` 호출
- `selected_datasets` 표시
- `evidence` 표시
- `sql` 표시
- `query_result`를 기준으로 `columns`, `rows`, `row_count`, `duration_ms`, `executed_at` 표시
- top-level `sql`/`rows`가 있으면 backward-compatible display field로만 사용
- `summary` 표시
- `chart_spec` 표시
- `guardrail.validation_status`, blocked, failed 상태 표시
- M6 PR #152까지 merge된 evidence grounding 필드를 표시하되, M1에서 retrieval/scoring 또는 summary를 재구현하지 않는다.
- `evidence[]`의 optional `table_name`, `schema_fields`, `metrics`, `lineage`, `retrieval_terms`는 값이 있을 때만 방어적으로 표시한다.

### 제외 범위

- M6 Catalog retrieval/scoring 로직 구현
- SQL planning 또는 SQL guardrail 구현
- real SQL runtime adapter 구현
- chart library 도입
- external vector DB, full document RAG, real LLM provider 연결

### 의존 모듈 또는 API

- M6 `POST /api/week2/ai/query`
- M6 `AIQueryResult`
- M6 `AIQueryResult.query_result`
- M6 `AIQueryResult.evidence[]` grounding fields
- M5 Catalog metadata source
- Phase 3의 catalog display

### 변경 예상 파일

- `frontend/src/app/App.jsx`
- `frontend/src/app/styles.css`
- `frontend/src/api/week2Api.js`
- 필요 시 `frontend/src/features/query/*`

### 완료 기준

- 사용자가 질문을 입력하면 SQL, rows, summary, evidence가 표시된다.
- `query_result`가 있으면 canonical SQL execution result로 표시하고, top-level `sql`/`rows`와 충돌하지 않는다.
- evidence grounding 정보가 있으면 schema, metrics, lineage, retrieval terms를 근거 섹션에 표시한다.
- blocked 또는 failed guardrail 결과가 성공처럼 보이지 않는다.
- 빈 질문 또는 API error를 명확히 표시한다.
- `chart_spec`은 최소 text/summary 형태로라도 표시된다.

### 검증 계획

- `cd frontend && npm run build`
- local backend 가능 시 sample question smoke
- `rg -n "AIQueryResult|selected_datasets|guardrail|chart_spec|evidence" frontend/src`
- `scripts/validate-harness.sh --strict`
- `git diff --check`

### 위험 요소

- M6 evidence grounding field는 additive optional shape이므로 optional guard가 필요하다.
- M1이 SQL/summary를 직접 생성하면 책임 경계가 깨진다.

### 다음 Phase로 넘길 것

- `/runs -> /catalog -> /ask` 순서의 CTA와 발표용 상태 문구를 정리한다.

## Phase 5. M1 Demo Click Flow Polish

### 목표

발표자가 M1 화면에서 Week2 대표 흐름을 끊김 없이 클릭할 수 있게 정리한다.

### 포함 범위

- `/sources -> /runs -> /catalog -> /ask` 흐름 CTA 연결
- run 성공 후 catalog 이동 버튼 추가
- catalog detail에서 AI Query 이동 버튼 추가
- AI Query 결과에서 evidence와 run/catalog로 돌아가는 링크 추가
- loading/empty/error/fallback 상태 문구 정리
- demo question 후보를 화면에 버튼으로 제공하되, 질문 답변은 M6 API가 생성하게 한다.
- mobile/desktop overflow 확인

### 제외 범위

- 새로운 backend API 추가
- 실제 auth/RBAC 구현
- 자유 dashboard 편집
- chart library 기반 시각화 완성
- M2/M3/M4 데이터 처리 로직 보완
- PR #132 또는 다른 팀원 PR 수정

### 의존 모듈 또는 API

- Phase 2 run live UI
- Phase 3 catalog live UI
- Phase 4 AI Query live UI
- M5/M6 API availability

### 변경 예상 파일

- `frontend/src/app/App.jsx`
- `frontend/src/app/styles.css`
- 필요 시 `frontend/src/app/m1StaticShellData.js`

### 완료 기준

아래 흐름을 한 화면 세션에서 따라갈 수 있다.

```text
Workflow 실행
-> Run Status 확인
-> CatalogMetadata 확인
-> AI Query 실행
-> SQL / rows / summary / evidence 확인
```

### 검증 계획

- `cd frontend && npm run build`
- local browser route smoke
- desktop/mobile viewport overflow 확인
- `scripts/validate-harness.sh --strict`
- `git diff --check`

### 위험 요소

- 발표용 polish가 fake success처럼 보이면 M1 shell 원칙과 충돌한다.
- 여러 Phase를 한 PR에 묶으면 PR size hard gate와 review 비용이 커질 수 있다.

### 다음 Phase로 넘길 것

- M2/M3/M4 evidence path가 준비되면 Taxi/Kafka status card를 추가한다.
- real chart rendering 또는 dashboard 편집은 Week2 기본 E2E 이후 별도 Phase로 둔다.

## 추천 시작점

첫 구현 PR은 Phase 1 `M1 Week2 API Client 연결`로 시작한다. 그 다음 Phase 2와 Phase 3을 순서대로 진행하면 M5 local runner와 Catalog를 먼저 화면에 붙일 수 있다. Phase 4는 M6 PR #145 merge 여부를 확인하되, response 소비 구조는 미리 준비할 수 있다.
