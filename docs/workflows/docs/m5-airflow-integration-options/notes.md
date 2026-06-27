# M5 Airflow integration option guide 노트

## 진행 메모

- 2026-06-26: 사용자가 Airflow 연결 전 설계 선택지, 의미, 장단점, 추천 기준을 설명하는 문서 생성을 요청했다.
- 현재 `localhost:8080`은 접속되지 않고, repo 기본 `docker-compose.yml`에는 Airflow service가 없다.
- 새 문서는 `docs/project-context/asklake-week2-module-plan/ver2/m5-airflow-integration-options.md`에 둔다.

## 결정

- 문서 추천 조합: 별도 Airflow compose, repo DAG, shared local volume, result JSON artifact, smoke에서 fallback 숨김 방지.

## 열린 질문

- 사람이 추천 조합을 그대로 채택할지 여부.
- 실제 구현 slice에서 result handoff를 shared result JSON으로 갈지, XCom 중심으로 바꿀지 여부.

## 링크 / 증거

- `docs/project-context/asklake-week2-module-plan/ver2/m5-airflow-integration-options.md`
- `docs/project-context/asklake-week2-module-plan/ver2/README.md`
