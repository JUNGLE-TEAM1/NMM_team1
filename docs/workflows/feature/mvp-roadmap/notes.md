# XFlow 참고 MVP 로드맵 노트

## 진행 메모

- XFlow는 설정 기반 시각적 데이터 파이프라인 플랫폼으로, 주요 흐름은 데이터 소스 등록, ETL/ELT pipeline 정의, 실행, catalog/quality/query 확장이다.
- AskLake MVP는 XFlow 전체 복제가 아니라 infrastructure-first 기반 위에서 데모 가능한 핵심 흐름으로 축소한다.
- MVP golden path는 source 등록 -> pipeline 정의 -> run 실행 -> catalog 결과 확인이다.
- XFlow급 기능 볼륨은 M6~M15 장기 마일스톤으로 분리했다.
- 장기 순서는 infrastructure foundation -> container-first MVP -> data platform expansion 순서다.

## 결정

- MVP는 React + FastAPI 후보 구조로 시작한다.
- metadata store와 첫 source type은 다음 구현 Phase에서 확정한다.
- CI/CD, Docker, Kubernetes, AWS foundation은 제품 기능 개발 전에 먼저 세팅한다.
- 실제 AWS 비용이 발생하는 resource 생성은 승인 gate 뒤에 둔다.
- Airflow/Spark/Kafka/OpenSearch/Trino/Bedrock은 Non-MVP 또는 확장 후보로 둔다.

## 열린 질문

- 첫 source type을 PostgreSQL로 할지 CSV/local file로 할지 결정해야 한다.
- metadata store를 PostgreSQL, SQLite, 또는 file 기반으로 시작할지 결정해야 한다.
- React Flow 기반 시각 에디터를 M3 전에 넣을지, form 기반 pipeline builder로 먼저 갈지 결정해야 한다.
- M6 이후 source connector 우선순위는 MVP 구현 결과와 데모 데이터 확보 상태를 보고 조정한다.
- AWS 배포 대상은 EKS로 갈지, ECS/App Runner 같은 더 단순한 대안으로 갈지 infrastructure foundation Phase에서 결정해야 한다.

## 링크 / 증거

- 참고: `/Users/tail1/Documents/데이터 파이프라인/xflow/README.md`
- 참고: `/Users/tail1/Documents/데이터 파이프라인/xflow/backend/main.py`
- 참고: `/Users/tail1/Documents/데이터 파이프라인/xflow/frontend/src/App.jsx`
