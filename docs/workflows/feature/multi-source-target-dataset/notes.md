# Multi-source Target Dataset 노트

## 진행 메모

- PR 1 Product Health Processing Template 저장 흐름 위에 PR 2를 additive로 구현했다.
- `source_dataset_id`는 legacy/primary source로 유지하고, Product Health 추천 template 경로는 `source_mappings[]`로 4개 role을 저장한다.
- UI fallback demo source에 reviews/behavior/delivery/product_master 후보를 추가했다. 실제 API 저장은 존재하는 Source Dataset id만 허용한다.

## 결정

- M2 runner 실행, Silver/Gold preview, Catalog/AI Query 연결은 사용자 지시대로 이번 PR에서 제외했다.

## 열린 질문

- 실제 팀원이 만드는 합성 Source Dataset id/name이 확정되면 role 자동 추천 heuristic을 더 정확하게 맞출 수 있다.

## 링크 / 증거

- `PYTHONPATH=backend python3 -m pytest ...` -> 17 passed
- `npm run build` in `frontend/` -> passed
