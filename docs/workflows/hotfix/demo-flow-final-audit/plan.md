# Demo flow final audit Hotfix 계획

## 목표

C-queue 완료 뒤 데모 흐름에서 실제로 어긋난 UI/API 검수 문제를 작게 정리한다.

## 범위

- Vite dev proxy가 stale `8000` backend에 고정되어 최신 backend smoke가 404로 보이는 문제를 줄인다.
- Gold Dataset 화면에서 registered CatalogDataset management boundary와 action 경계를 재검수한다.
- `/connections`, `/datasets/gold`, `/runs` 최소 browser smoke를 수행한다.

## 제외 범위

- 새 connector/runtime 구현.
- 실제 DB/S3/Kafka/Airflow/Spark 실행.
- PR merge/push/cleanup.

## 완료 기준

- `VITE_PROXY_TARGET`으로 dev proxy target을 override할 수 있다.
- registered CatalogDataset은 Gold Dataset 화면에서 상세만 가능하다.
- build, focused tests, browser smoke 결과를 기록한다.
