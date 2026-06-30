# Source dataset ingest snapshot quality

## 검증 요약

- 상태: 통과
- Context Budget mode: Lite Read
- 범위: C-26C `feature/source-dataset-ingest-snapshot`

## 실행한 검증

```bash
PYTHONPATH=backend ./.venv/bin/pytest backend/tests/test_source_dataset_persistence.py backend/tests/test_external_connection_discovery.py -q
npm --prefix frontend run build
curl -s -o /tmp/source_snapshots_status.txt -w '%{http_code}\n' http://127.0.0.1:18000/api/source-datasets/a0882fab-3f09-45f2-bfff-a4c629692d77/snapshots
```

## 결과

- Backend focused tests: `21 passed`
- Frontend build: 성공
- API smoke: `GET /api/source-datasets/{id}/snapshots`가 `200 []` 반환
- Browser smoke:
  - `/datasets/source`에서 `source_c26_runtime_discovery_smoke` 상세 modal 열림
  - `Raw snapshot evidence` 섹션과 `Raw snapshot 생성` 버튼 표시
  - 버튼 실행 후 `status=succeeded`, `row_count=100`, `output_path=data/source_snapshots/...jsonl`, `status=snapshot_ready` 표시

## 회귀 보호

- Source Dataset metadata 생성/수정/삭제 기존 테스트 유지.
- External Connection discovery 테스트 유지.
- snapshot 실패 시 missing local path는 400이고 snapshot list는 빈 배열이다.

## 남은 위험

- PostgreSQL/MongoDB/S3/Kafka runtime snapshot은 raw secret을 저장하지 않는 정책 때문에 실행 시점에 `secret_refs/options`를 다시 받아야 한다.
- UI는 이번 Phase에서 local/source 상세 실행을 중심으로 검증했다. runtime connector credential 입력 UI는 후속 운영/진단 surface에서 확장한다.
