# PH-DATA-2B External Connection handoff alignment 계획

## 목적

Product Health 합성데이터 산출물이 사이트의 `External Connection -> Source Dataset -> Target Dataset` 흐름과 같은 id 체계를 사용하도록 정렬한다.

## 배경

현재 smoke generator는 local raw path를 직접 읽고 evidence에 path 중심으로 남긴다. 데모 UI에서는 사용자가 local path를 직접 고르는 것처럼 보이면 흐름이 어색하므로, local path는 fallback/evidence로 유지하고 화면 기준은 External Connection과 Source Dataset으로 전환한다.

## 범위

- `catalog/product_health_source_handoff.json` 생성
- source별 `connection_id`, `source_dataset_id` 고정
- `dataset_product_health_gold.json` lineage에 source handoff 참조 추가
- `product_health_run_summary.json` sources에 source dataset id 추가
- PR #297/#298 방향과 충돌하지 않도록 Taxi PostgreSQL은 pending 상태와 local parquet fallback을 함께 기록

## 제외 범위

- 실제 External Connection DB persistence 구현
- M1 Dataset Inventory PR 머지
- PostgreSQL Taxi 적재 실행
- 5GB evidence run 확장

## 완료 기준

- source handoff JSON이 생성된다.
- handoff JSON에 2개 External Connection과 5개 Source Dataset이 있다.
- run summary의 모든 source에 `connection_id`, `source_dataset_id`가 있다.
- catalog lineage가 `source_handoff_path`를 가진다.
- smoke generator가 기존 Gold output을 계속 생성한다.

## 수동 검증

1. 합성데이터 smoke script를 실행한다.
2. `catalog/product_health_source_handoff.json`을 열어 source dataset 5개를 확인한다.
3. `evidence/product_health_run_summary.json`의 source id를 확인한다.
4. `catalog/dataset_product_health_gold.json`의 lineage handoff path를 확인한다.
