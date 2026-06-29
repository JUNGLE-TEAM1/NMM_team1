# M2 Docker Spark MinIO output smoke 노트

## 진행 메모

- 2026-06-29: issue #263, branch `feature/m2-docker-spark-minio-output-smoke`, workspace를 생성했다.
- 현재 `main`에는 generic MinIO upload smoke와 Taxi Spark local `--minio-upload` 옵션이 이미 있다. 이번 branch는 중복 구현이 아니라 Docker Spark cluster 경로에서도 같은 upload smoke를 재현 가능하게 만드는 작업이다.
- Docker Spark에서 직접 `s3a://`로 쓰는 방식은 Hadoop AWS jar/version과 endpoint 설정이 필요하므로 이번 범위에서 제외한다. 이번에는 Spark가 local fallback Parquet을 만들고 `Week2StorageAdapter`가 그 파일을 MinIO object로 올리는 경로를 증명한다.

## 결정

- MinIO는 기본 `docker-compose.yml`이 아니라 M2 Taxi Spark evidence 전용 compose에만 추가한다. 기본 앱 실행 경로를 무겁게 만들지 않기 위해서다.
- 작은 Taxi 입력 `minio-small`을 이번 PR의 필수 smoke로 둔다. 5GB + MinIO는 같은 mode 구조에서 `minio-5gb`로 열어두되, 시간 비용 때문에 필수 검증은 작은 입력으로 제한한다.

## 열린 질문

- Product Health 5GB 입력이 준비되면 Taxi가 아니라 `gold_product_health` 대표 경로로 같은 storage evidence를 다시 실행해야 한다.
- 최종 발표에서 “Spark가 S3에 직접 쓴다”까지 주장하려면 `s3a://` 직접 write를 별도 Phase로 검증해야 한다.

## 링크 / 증거

- 
