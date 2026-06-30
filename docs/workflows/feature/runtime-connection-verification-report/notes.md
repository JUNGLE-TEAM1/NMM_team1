# Runtime connection verification report 메모

## Runtime URL

| 대상 | URL |
| --- | --- |
| AskLake frontend | `http://127.0.0.1:5173` |
| AskLake backend | `http://127.0.0.1:18000` |
| Kafka UI | `http://127.0.0.1:8084` |
| Airflow | `http://127.0.0.1:8080` |
| Spark UI | `http://127.0.0.1:18080` |
| MinIO API | `http://127.0.0.1:9000` |
| MinIO Console | `http://127.0.0.1:9001` |
| PostgreSQL | `127.0.0.1:15432` |
| MongoDB | `127.0.0.1:27017` |

## 분류

| 분류 | 현재 상태 |
| --- | --- |
| 가능 | Docker runtime 기동, CLI smoke, local file schema discovery |
| readiness only | AskLake Airflow/Spark/Kafka status 표시 일부 |
| blocked by API/runtime implementation | DB/S3/Kafka External Connection inspect, Kafka replay trigger, Spark distributed API job, CatalogDataset mutation |

## 후속 Phase로 넘길 질문

- `/runs`에서 runtime 상태를 실행 기록과 함께 보여줄 때 readiness와 실제 run evidence를 어떻게 분리할지 확인한다.
- External Connection test는 raw credential 저장 없이 `secret_ref` 또는 local demo env를 참조해야 한다.
- Spark readiness의 `cluster_configured=true`와 `distributed_cluster_available=false` 문구가 사용자에게 혼동되지 않게 UI copy를 조정해야 한다.
