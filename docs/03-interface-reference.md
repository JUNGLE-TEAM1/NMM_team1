# 03. 인터페이스 기준

이 문서는 API, CLI 명령, UI 계약, event schema, background job, 내부 도구, 외부 연동 계약을 기록하는 기준 문서다.

## 1) 공통 규칙

- Base URL / command namespace / entrypoint: local backend `http://localhost:8000/api`
- Request/response format: API는 JSON, 사람 작업 흐름은 browser UI
- Naming conventions: code identifier는 원문을 유지하고, 협업 문서는 한국어로 작성한다.
- Pagination/sorting/filtering: catalog list 검색/filter는 MVP 이후 확장 후보이며 첫 pipeline run에는 필수가 아니다.
- Idempotency: run 요청은 새 `PipelineRun`을 만들고, source/pipeline create endpoint는 중복 이름을 검증하거나 명확한 오류를 반환한다.

## 2) 인증과 접근 제어

- Authentication: 팀이 login을 필수 데모 기능으로 선택하지 않는 한 MVP에서는 보류한다.
- Authorization: MVP에서는 보류한다.
- Public/private boundaries: local demo만 대상으로 하며 실제 secret이나 production data를 사용하지 않는다.

## 3) 상태, 오류, 실패 형식

| 조건 | 기대 결과 |
| --- | --- |
| Invalid source config | API returns validation error and UI shows actionable message. |
| Pipeline run fails | Run status becomes `failed` and stores a short error/log. |
| Result dataset unavailable | Catalog detail shows not ready or failed state instead of pretending success. |

## 4) 인터페이스 목록

| 인터페이스 | 타입 | 목적 |
| --- | --- | --- |
| GitHub PR body closing keyword | PR metadata | Linked issue가 있으면 `Closes #<issue-number>` 또는 동등한 closing keyword를 포함한다. |
| Health API | API | frontend/backend/container/Kubernetes smoke에서 앱 기동 상태를 확인한다. |
| Connection API | API | 데이터 소스를 등록하고 목록을 조회한다. |
| Pipeline API | API | source, transform, target으로 구성된 파이프라인을 생성/조회한다. |
| Pipeline Run API | API/Job | 파이프라인 실행을 요청하고 상태/로그를 조회한다. |
| Catalog UI/API | UI/API | 결과 데이터의 schema, row count, sample 또는 저장 위치를 보여준다. |

### 단계별 인터페이스 family

| 단계 | Interface family | 후보 기능 | MVP 필수 여부 |
| --- | --- | --- | --- |
| M1~M3 | Health / App Shell | `/health`, frontend route, local config 확인 | 필수 |
| M2~M5 | Source / Connection | create/list/test/preview connection, schema/sample preview | 일부 필수 |
| M3~M7 | Pipeline / Run | pipeline create/update, run request, status/log/retry | 필수 |
| M4~M8 | Catalog | dataset list/detail, schema/sample/row count, tags/domain | 일부 필수 |
| M6 | Transform | select/drop/filter/union/sql transform config | 확장 |
| M9 | Quality | quality run, rule result, score summary | 확장 |
| M10 | Lineage / Visual Graph | graph nodes/edges, lineage read model | 확장 |
| M11 | SQL Lab | query execute, query history, result preview | 확장 |
| M12 | AI Assistant | schema context, SQL draft, explanation assist | 승인 gate 후 확장 |
| M13~M15 | Distributed / Cloud | CDC, Airflow, Spark, S3, OpenSearch, Trino, Kubernetes | 별도 승인 필요 |

## 5) 핵심 인터페이스 상세

### GitHub PR Body Closing Keyword

- Type: PR metadata
- Input: linked GitHub issue number
- Output: PR body contains a closing keyword such as `Closes #123`
- Success behavior: merge 후 GitHub issue가 자동 close되고 downstream Project/Notion sync가 정리된다.
- Failure behavior: issue가 열린 상태로 남을 수 있으므로 PR 전에 수정한다.
- Related acceptance criteria: `docs/05`
- Related regression/failure scenarios: `docs/06`

### Health API

- Type: API
- Endpoint: `GET /health`, `GET /api/health`
- Output:

```json
{
  "service": "asklake-backend",
  "status": "ok",
  "app": "AskLake"
}
```

- Success behavior: local backend, frontend app, Docker Compose smoke, Kubernetes readiness probe가 기동 상태를 확인할 수 있다.
- Failure behavior: API가 200을 반환하지 않으면 frontend는 확인 필요 상태를 보여주고 container/cloud deploy smoke는 실패로 처리한다.

### MVP 파이프라인 계약

- Type: API/UI/Job
- Input: registered source, transform config, target config
- Output: `PipelineRun` with `queued`, `running`, `success`, or `failed` status
- Success behavior: 결과 dataset metadata가 catalog에 보인다.
- Failure behavior: run status와 error message가 보이고 partial output은 ready로 표시하지 않는다.
- Related acceptance criteria: `docs/05`
- Related regression/failure scenarios: `docs/06`

## 6) 내부 도구와 외부 연동

### Notion Issue Sync

- Purpose: GitHub Issue / Project 상태와 Notion board 동기화
- Input: GitHub issue/project events, Notion secrets
- Output: Notion database and GitHub Project state updates
- Timeout/retry/fallback: GitHub Actions 로그와 `Sync Error` 필드를 확인한다.

## 7) 열린 이슈

- 정확한 endpoint path, schema, storage 선택은 첫 구현 Phase에서 확정한다.
- 첫 source type은 아직 열려 있다: PostgreSQL 또는 CSV/local file.
- 장기 milestone의 상세 schema는 각 구현 Phase에서 해당 interface family 단위로 확정한다.
