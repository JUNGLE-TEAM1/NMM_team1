# Silver dataset creation 계획

## 목표

Source Dataset에서 Silver Dataset을 독립 생성/저장하는 흐름을 추가해 Medallion 구조를 명확히 한다.

## 문제 정의

- 현재 Silver Dataset은 Target Dataset draft의 `silver_outputs`에서 planned 상태로 파생된다.
- 사용자가 Silver Dataset을 직접 만들거나 확인하는 생성 흐름이 없다.
- Gold Dataset을 Silver Dataset에서 선택하려면 먼저 persisted Silver Dataset이 필요하다.

## 범위

- Silver Dataset create wizard
- Source Dataset 선택
- standardize/validate rule 선택
- Silver Dataset name, purpose, schema preview 저장
- Silver Dataset 목록에서 persisted item 표시

## 제외

- Spark/Airflow materialization
- 실제 row 변환
- Gold wizard Silver 입력 전환
- Job schedule edit

## 완료 기준

- Source Dataset을 입력으로 Silver Dataset metadata를 생성한다.
- Silver Dataset 목록이 planned 파생 항목이 아니라 저장된 Silver Dataset을 표시한다.
- Silver Transform Job 후보가 persisted Silver Dataset 기준으로 보인다.
