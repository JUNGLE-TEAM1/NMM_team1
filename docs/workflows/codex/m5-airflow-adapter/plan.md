# M5 Airflow Adapter 계획

## 브랜치

- Branch: `codex/m5-airflow-adapter`
- Workspace: `docs/workflows/codex/m5-airflow-adapter`
- Created: 2026-06-26

## 목표

M5 `Week2AirflowAdapter`가 더 이상 무조건 "not configured"만 반환하지 않고, 설정이 있을 때 Airflow REST API의 DAG trigger/status polling 경계를 사용할 수 있게 한다.

이번 slice는 실제 Airflow 서버를 띄우는 작업이 아니다. fake HTTP client로 trigger/poll/result 변환을 검증하고, 실제 Airflow 환경값이 없으면 기존처럼 local runner fallback이 유지되게 한다.

## 범위

- Airflow adapter 설정 객체 추가
- Airflow DAG run trigger 요청 생성
- DAG run status polling
- Airflow 결과 payload를 `Week2RunnerResult`로 변환
- 결과 payload가 없거나 DAG가 실패하면 M5 fallback이 가능하도록 `failed` result 반환
- focused backend tests와 workspace/report 기록

## 범위 제외

- 실제 Airflow webserver/scheduler/DAG 파일 실행
- Docker Compose Airflow 구성
- SparkRunner 연결
- M3 `TransformSpec` adapter 연결
- M1 UI 변경
- M6 query 변경

## Slice Plan

### Slice 1 - Adapter Boundary

- 목표: Airflow trigger/poll/result 변환 경계를 test double로 고정한다.
- 완료 기준:
  - [x] configured adapter가 DAG run trigger 요청을 만든다.
  - [x] success poll response의 `week2_result`를 `Week2RunnerResult`로 바꾼다.
  - [x] success인데 result payload가 없으면 성공처럼 Catalog에 반영하지 않는다.
  - [x] Airflow 미설정 시 기존 local fallback 테스트가 유지된다.

## 완료 기준

- [x] focused backend tests 통과
- [x] strict harness validation 통과
- [x] 실제 Airflow 서버 연결은 후속 작업으로 분리
