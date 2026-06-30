# Taxi PostgreSQL Source Dataset 등록 계획

- Branch: `feature/taxi-postgres-source-dataset`
- Workspace: `docs/workflows/feature/taxi-postgres-source-dataset`
- Type: Feature Phase

## 목표

로컬 PostgreSQL `taxi_postgre`에 적재한 Taxi table을 AskLake External Connection으로 저장하고, 실제 PostgreSQL schema preview를 읽어 Source Dataset metadata로 등록한다.

## 범위

- 로컬 PostgreSQL 컨테이너 실행
- Taxi Parquet -> PostgreSQL smoke loader 추가
- External Connection metadata API 추가
- PostgreSQL table schema preview API 추가
- Source Dataset wizard가 저장된 External Connection과 실제 schema preview를 사용하도록 연결

## 제외

- 비밀번호 원문 저장
- 연결 테스트 버튼과 인증 상태 관리
- Target Dataset run이 Taxi table을 읽는 기능
- Catalog publish와 AI Query dataset context 연결

## 완료 기준

- `public.yellow_taxi_trips` smoke 적재가 성공한다.
- External Connection 저장/조회 API가 동작한다.
- PostgreSQL schema preview API가 실제 table columns를 반환한다.
- Source Dataset 저장 API가 `connection_type=postgres`, `raw_scope=public.yellow_taxi_trips`, `schema_preview`를 보존한다.
- 관련 backend tests와 frontend build가 통과한다.
