# Target Dataset multi-source processing 계획

## 브랜치

- Branch: `feature/target-dataset-multi-source-processing`
- Workspace: `docs/workflows/feature/target-dataset-multi-source-processing`
- Created: 2026-06-30

## 목표

Product Health 데모의 Target Dataset 생성 흐름을 단일 Source Dataset 선택이 아니라 여러 Source Dataset을 합쳐 Gold dataset을 만드는 흐름으로 보정한다.

## 범위

- Target Dataset `Source 선택` 단계에서 2개 이상 Source Dataset을 선택할 수 있게 한다.
- 선택한 source를 base dataset과 enrichment source로 구분한다.
- `Process` 단계에서 `Join`, `Aggregate`, `Enrich`, `Score`, `Select` processing recipe를 보여준다.
- `Process` 단계에서 선택된 Source Dataset이 어떤 Silver intermediate output으로 표준화되고 Gold Target Dataset으로 합쳐지는지 live preview diagram으로 보여준다.
- `Scheduling`과 `Review`에 `local_runner`, `Airflow handoff`, `spark_runner` 실행 경계 선택지를 표시한다.

## 범위 제외

- Target Dataset / ETL job draft backend persistence.
- Airflow 서버 기동, DAG trigger, DAG success 검증.
- 실제 multi-source transform 실행.
- Silver output 직접 편집 canvas.
- Source Dataset API 목록과 Target wizard의 완전한 backend 연동.

## 완료 기준

- [x] Target Dataset source 단계가 multi-select로 보인다.
- [x] base dataset/enrichment source 구분이 보인다.
- [x] Process 단계가 합치는 방법 중심으로 보인다.
- [x] Silver intermediate outputs와 Gold Target Dataset lineage가 다이어그램으로 보인다.
- [x] Airflow는 실제 성공이 아니라 handoff 선택지로 표시된다.
- [x] frontend build와 browser smoke를 통과한다.
