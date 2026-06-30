# Silver dataset runtime materialization quality

## 검증 요약

- 상태: 통과
- Context Budget mode: Lite Read
- 범위: C-27 `feature/silver-dataset-runtime-materialization`

## 실행한 검증

```bash
PYTHONPATH=backend ./.venv/bin/pytest backend/tests/test_silver_dataset_persistence.py backend/tests/test_source_dataset_persistence.py -q
npm --prefix frontend run build
curl -s -o /tmp/silver_mat_status.txt -w '%{http_code}\n' http://127.0.0.1:18000/api/silver-datasets/not-found/materializations
```

## 결과

- Backend focused tests: `25 passed`
- Frontend build: 성공
- API smoke: `GET /api/silver-datasets/not-found/materializations`가 새 route에서 `404 Silver dataset not found` 반환
- Browser smoke:
  - `/datasets/silver`에서 `silver_c26_runtime_discovery_smoke` 상세 modal 열림
  - `Silver materialization evidence` 섹션과 `Silver output 생성` 버튼 표시
  - 버튼 실행 후 `status=succeeded`, `row_count=100`, `failed_row_count=0`, parquet output path 표시
  - Silver Dataset status가 `materialized`, file evidence가 `file-backed`로 표시

## 회귀 보호

- Source Dataset 없이 Silver Dataset 생성 불가 테스트 유지.
- missing source path materialization은 400이고 materialization list는 빈 배열이다.
- metadata-only Silver가 materialized/file-backed로 보이지 않도록 실행 API와 metadata 생성 API를 분리했다.

## 남은 위험

- 변환 rule은 demo-safe 표준화 수준으로 schema preview field projection과 string trim 중심이다.
- DB/S3/Kafka는 Source Snapshot 선행을 요구하며, distributed Spark execution은 이번 Phase 범위 밖이다.
