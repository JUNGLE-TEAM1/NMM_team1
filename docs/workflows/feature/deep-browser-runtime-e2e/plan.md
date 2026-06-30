# Deep browser runtime E2E 계획

## 목표

브라우저에서 External Connection 생성부터 AI Query까지 데모 전체 흐름을 처음부터 끝까지 클릭 검수하고, UI/API mismatch와 남은 gap을 정리한다.

## 상태

- 2026-06-30: 계획 생성. `/connections`는 browser smoke를 통과했으나 전체 흐름 deep E2E는 아직 수행하지 않았다.
- 2026-06-30: persisted 데이터 기준 deep browser E2E 수행. Gold Build 수동 실행, Run 성공, Catalog 등록, AI Query DuckDB 질의, Catalog detail handoff를 확인했다.

## 범위

- External Connection 생성 또는 선택.
- Source Dataset 생성.
- Silver Dataset 생성.
- Gold Dataset 생성.
- Job 실행.
- Run 확인.
- Catalog 등록.
- AI Query 질의.
- 콘솔 에러, 화면 깨짐, 버튼 위치, 저장 후 복귀 흐름 확인.

## 제외 범위

- 새 기능 구현.
- 대용량 운영 ETL.
- cloud resource 생성.
- destructive delete/cascade 검증.

## 선행 조건

- Catalog AI Query runtime E2E.
- Jobs/Runs runtime integration.
- frontend/backend 검수용 실행 방법 확정.

## 구현 대상 파일 예상

- `frontend/src/app/App.jsx`
- `docs/reports/deep-browser-runtime-e2e.md`
- 필요 시 `docs/07-manual-verification-playbook.md`
- 필요 시 Hotfix Phase 문서

## Acceptance Criteria

- 브라우저에서 전체 데모 시나리오가 끊기지 않고 진행된다.
- 각 저장 후 해당 목록 화면으로 복귀한다.
- 실제 지원하지 않는 기능은 disabled/blocked로 명확히 보인다.
- console error가 없다.
- 남은 문제는 Hotfix 또는 후속 Phase로 분류된다.

## Regression / Failure Scenario

- mock/preset 데이터가 실제 연결처럼 보이면 실패다.
- 저장 후 사용자가 현재 위치를 잃으면 실패다.
- UI가 API 상태와 다르게 성공을 표시하면 실패다.

## Manual Verification

1. frontend/backend/runtime을 모두 실행한다.
2. `/connections`에서 시작한다.
3. Source/Silver/Gold/Jobs/Runs/Catalog/AI Query를 순서대로 클릭한다.
4. 화면과 API 상태가 일치하는지 기록한다.

### 2026-06-30 결과

- `/connections`: persisted External Connection 9개 확인.
- `/datasets/source`: persisted Source Dataset과 file-backed/snapshot evidence 확인.
- `/datasets/silver`: materialized/file-backed Silver Dataset 확인.
- `/jobs/gold-build`: `dataset_lake_smoke_1782827819_82db2b` Gold Build Job 수동 실행.
- `/runs`: `a1770602-b400-42c5-82ba-c7f440dfd667` run 실행 후 `succeeded` 확인.
- `/catalog`: succeeded run을 CatalogDataset으로 등록하고 `64a99c83-4fbc-4c84-82b1-863eb4092a15` 선택/상세 확인.
- `/query`: `위험 점수가 높은 상품 알려줘` 질의가 live CatalogDataset을 DuckDB SQL로 소비하는지 확인.
- Hotfix: AI Query `Catalog detail`이 고정 Week2 CatalogMetadata 상세로 이동하던 문제를 live CatalogDataset 선택 동선으로 수정.

## Report 기준

- `docs/reports/deep-browser-runtime-e2e.md`에 시나리오 결과, 실패 지점, screenshot 필요 여부, 다음 Hotfix 후보를 기록한다.
