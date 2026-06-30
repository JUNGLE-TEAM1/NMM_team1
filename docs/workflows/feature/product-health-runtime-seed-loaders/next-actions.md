# Product Health runtime seed loaders 다음 행동

1. 11GB 합성 데이터셋 split 경로를 manifest에 반영한다.
2. Kafka/PostgreSQL/MongoDB/MinIO 컨테이너 이름과 endpoint/env ref를 실제 환경에 맞춘다.
3. `--execute --limit <N>`으로 작은 smoke를 먼저 실행한다.
4. smoke 통과 후 `--execute` 전체 적재를 실행하고 evidence를 보관한다.
