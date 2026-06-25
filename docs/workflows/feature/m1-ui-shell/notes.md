# M1 UI Shell 노트

## 진행 메모

- `demo3`는 UI reference로만 사용한다. `XFlow` 문자열, 발표용 fake backend, 자동 성공 flow는 M1에 들여오지 않는다.
- 실제 구현은 기존 `frontend/src/app/App.jsx`, `frontend/src/app/styles.css`를 AskLake M1 shell로 교체하는 방식으로 진행했다.
- M1은 “전체 UI를 먼저 가져와서 자리 잡고, 각 담당자가 만든 기능을 이후 Phase에서 하나씩 연결한다”는 사용자 판단을 따른다.
- backend health는 기존 `getHealth()`만 사용한다. backend 미실행 시 error pill을 보여주며, 성공처럼 보이는 fake 상태로 대체하지 않는다.
- 후속 확인에서 demo3의 시각 디자인이 충분히 보존되지 않은 문제가 확인되어, 2026-06-25에 demo3의 흰 sidebar/topbar/card 중심 디자인 언어를 M1 shell에 다시 반영했다.
- 추가 확인에서 여전히 실제 demo page 구조가 부족해, demo3 `/dataset` 화면 기준의 `데이터셋/파이프라인` 테이블, 전체 sidebar nav, 상단 사용자 영역, AI 도우미 패널, AskLake logo asset을 M1 shell에 반영했다.
- demo3에서 기대되는 기본 UI interaction으로 sidebar collapse/expand와 AI 도우미 close/reopen toggle을 M1 shell에 연결했다.
- 통합 보완으로 `/dataset?manage=connections`, `/etl/visual`, `/etl`, `/catalog`, `/catalog/dataset_reviews_gold`, `/query`, `/dashboard`, `/admin` route shell을 추가했다.
- `소스 선택하고 시작`, `연결 관리`, table row detail, catalog tab, query view mode, search/filter/pagination 계열은 local UI state로만 반응한다.
- 사용자 흐름 기준으로 최상위 메뉴를 `데이터 통합 -> 실행/모니터링 -> 데이터 카탈로그 -> AI Query -> Dashboard -> 사용자/권한` 순서로 조정했다.
- `스키마 미리보기`는 최상위 메뉴에서 제거하고 `데이터 통합` 내부 M3 step으로 이동했다.

## 결정

- route shell은 `react-router-dom` 추가 없이 History API로 구현한다.
- contract preview는 inline shell data로 보여주되, 실제 결과처럼 보이지 않도록 `연결 대기`, `실행 결과 없음`, `아직 등록된 실제 source가 없습니다` 상태를 명시한다.
- M1 범위 밖 기능은 버튼/자동 진행으로 시연하지 않고, 후속 모듈 연결 지점으로 남긴다.
- 디자인 복구는 CSS/정적 shell 구조만 수정하고 fake API, fake auth, fake run success는 추가하지 않는다.
- interaction 보강은 local UI state만 사용한다. backend/API 호출이나 fake success state는 추가하지 않는다.
- M1 static shell에서 `연결 대기`, `실행 대기`, `disabled`, `placeholder` 표현을 유지한다.
- static shell data를 `frontend/src/app/m1StaticShellData.js`로 분리했다. 후속 기능 연결 시 이 파일의 placeholder export를 real API state로 교체한다.
- 교체 mapping:
  - M2/M3/M4 source/connection 연결: `m1ConnectionPlaceholders` 제거 또는 API response로 교체
  - M3 schema inference 연결: `m1SchemaPreviewPlaceholder` 제거 또는 schema preview response로 교체
  - M5 workflow/run/catalog 연결: `m1WorkflowPlaceholder`, `m1PipelinePlaceholders`, `m1CatalogPlaceholder` 제거 또는 API state로 교체
  - M6 AI Query 연결: `m1AiQueryPlaceholder` 제거 또는 `AIQueryResult`/`QueryResult` response로 교체
- `활성`, `Gold/Silver/Bronze`, `Trusted`, `succeeded`, `complete`처럼 실제 완료 상태로 오해될 수 있는 shell 표현을 placeholder/연결 대기 문맥으로 정리했다.

## 열린 질문

- M3가 실제 `SourceConfig` 저장/preview API를 붙일 때 source 목록의 표시 필드와 validation error shape를 확정해야 한다.
- M5가 run status를 붙일 때 `ExecutionResult` polling 주기와 retry 표시 정책을 확정해야 한다.
- M6가 AI Query를 붙일 때 dataset allowlist와 evidence 표시 최소 필드를 확정해야 한다.

## 링크 / 증거

- 구현 파일: `frontend/src/app/App.jsx`, `frontend/src/app/styles.css`
- 기준 문서: `docs/project-context/asklake-week2-module-plan/m1-ui-shell-plan.md`
- 계약 기준: `docs/03-interface-reference.md`, `contracts/*.sample.json`
