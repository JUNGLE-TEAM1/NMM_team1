# 09. M5 Demo Cockpit 사용 가이드

이 문서는 `/etl` 데모 페이지를 보면서 M5가 만든 기능을 빠르게 이해하고 검증하기 위한 가이드다.

## 한 줄 요약

M5는 `pipeline_reviews_json_e2e` workflow를 실행해서 `ExecutionResult`를 만들고, 그 결과 dataset을 `CatalogMetadata`로 등록하는 모듈이다.

## 꼭 알아야 할 4개

| 질문 | 화면에서 볼 곳 | 통과 기준 |
| --- | --- | --- |
| Run ID가 생겼나? | `실험 결과 판정` | 실행 후 새 `run_id`가 보인다. |
| status를 제대로 해석했나? | `Result interpretation` | `succeeded`, `fallback_succeeded`, 실패 상태를 구분한다. |
| output dataset이 생겼나? | `핵심 증거` | `dataset_reviews_gold`와 output URI가 보인다. |
| Catalog가 같은 run을 가리키나? | `CatalogMetadata` | `CatalogMetadata.lineage.run_id`가 현재 `run_id`와 같다. |

## 5분 실험 순서

1. `http://127.0.0.1:5173/etl`을 연다.
2. 상단의 “M5는 4칸짜리 흐름입니다”를 먼저 본다.
3. executor는 처음에 `local_runner`로 둔다.
4. `local_runner 실행`을 누른다.
5. `실험 결과 판정`의 4개 항목이 어떻게 바뀌는지 본다.
6. `이 세 문장을 말할 수 있으면 데모를 이해한 것입니다` 영역을 읽고, 그대로 설명해본다.
7. `핵심 증거`에서 `run_id`, `status`, `output`, `catalog lineage`를 확인한다.
8. 필요할 때만 raw JSON을 펼쳐 화면 값이 원본 field와 맞는지 검산한다.

## 여기서 얻어가야 하는 것

- M5가 “화면”을 만든 것이 아니라 “실행 증거”를 만든다는 점
- `ExecutionResult`는 runner가 남긴 실행 결과라는 점
- `CatalogMetadata`는 output dataset을 나중에 Query/M6가 읽을 수 있게 등록한 metadata라는 점
- 데모 성공 판단은 “같은 `run_id`가 output과 Catalog까지 이어졌는가”라는 점

## 상태 해석

| status | 의미 |
| --- | --- |
| `succeeded` + `executor=airflow` | Airflow DAG가 fallback 없이 성공한 상태 |
| `fallback_succeeded` + `executor=local_runner` | local runner가 local fallback output 경로로 성공한 상태 |
| `fallback_succeeded` + `executor=airflow` | Airflow는 실패했고 local runner fallback이 대신 성공한 상태 |
| `failed` / `fallback_failed` | 성공으로 보면 안 되고 logs와 task_results를 먼저 봐야 하는 상태 |

## 실험 기록 템플릿

```text
Executor:
Run ID:
Status:
Output dataset:
Output URI:
Catalog lineage run_id:
Catalog lineage matches current run: yes/no
내가 이해한 M5 한 문장:
이상하거나 헷갈린 점:
```

## 코드로 따라갈 때

1. UI: `frontend/src/app/App.jsx`
2. API client: `frontend/src/api/week2Api.js`
3. backend route: `backend/app/api/week2_workflow.py`
4. workflow service: `backend/app/services/week2_workflow.py`
5. local runner: `backend/app/services/week2_local_runner.py`
6. Airflow adapter: `backend/app/services/week2_airflow_adapter.py`
7. catalog store: `backend/app/services/week2_catalog_store.py`
