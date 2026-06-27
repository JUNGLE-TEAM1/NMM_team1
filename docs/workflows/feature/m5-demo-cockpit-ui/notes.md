# M5 demo cockpit UI 노트

## 진행 메모

- 기존 `/etl` 화면은 M5 workflow 실행 결과를 일부 보여줬지만 Catalog evidence와 학습 설명이 부족했다.
- 새 화면은 실행 전에도 `WorkflowDefinition`, `RunnerResult`, `CatalogMetadata`의 역할을 먼저 설명한다.
- local runner smoke에서 `run_reviews_demo_066`이 생성됐고, Catalog lineage가 같은 run_id를 가리켰다.
- backend local runner는 성공 상태를 `fallback_succeeded`로 반환한다. UI는 이를 Airflow 실패로 해석하지 않도록 executor별 설명을 분리했다.
- 사용자가 데모를 보면서 바로 실험할 수 있도록 `docs/manual-verification/09-m5-demo-cockpit-learning-guide.md`를 추가했고, 이후 짧은 사용 가이드로 다시 정리했다.
- 2차 리디자인에서는 필수 질문을 `run_id`, `status`, `output`, `Catalog lineage` 4개로 줄였다.
- in-app browser automation은 `127.0.0.1:5173` URL policy로 차단되어 리디자인 후 실제 눈 검증은 사람 확인이 필요하다.

## 결정

- `/etl` route 유지.
- AI 도우미는 기본 닫힘.
- manual verification 라우터인 `docs/07-manual-verification-playbook.md`에는 새 guide 링크만 추가한다.

## 열린 질문

- PR을 Airflow smoke 변경과 합쳐서 낼지, clean branch로 demo UI만 분리할지 결정 필요.
- 발표 전 Airflow executor 버튼까지 브라우저에서 다시 smoke할지 결정 필요.

## 링크 / 증거

- UI URL: `http://127.0.0.1:5173/etl`
- Backend smoke URL: `http://127.0.0.1:8000`
- Browser smoke result: `local_runner 실행` -> `run_reviews_demo_066`, output rows `3`, Catalog lineage `current run`
- Learning guide: `docs/manual-verification/09-m5-demo-cockpit-learning-guide.md`
- Redesign source check: 핵심 기능 -> 4칸 흐름 -> 실행 -> 판정 -> 설명 문장 -> 증거 -> raw JSON 순서 확인
