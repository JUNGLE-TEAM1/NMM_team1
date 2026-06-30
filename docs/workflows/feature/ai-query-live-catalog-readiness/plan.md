# AI query live catalog readiness 계획

## 목표

AI Query 화면의 readiness panel이 fixed Product Health catalog만 보지 않고, C-6/C-7로 publish된 live Gold CatalogDataset을 표시하게 한다.

## 범위

- `/api/catalog/datasets` 기반 live catalog readiness 조회
- 선택된 AI Query dataset id가 있으면 해당 CatalogDataset 우선 표시
- published Gold Dataset이 있으면 live catalog id/path/schema/lineage 표시
- 기존 Product Health readiness fallback 유지

## 제외

- backend query logic 변경
- SQL planner 변경
- RAG/goal 추천/자동 recipe 생성
- 새 API 추가
