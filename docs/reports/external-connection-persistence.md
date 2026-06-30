# External Connection persistence 보고서

## Short Report / 짧은 보고

- Type: feature
- Date: 2026-06-30
- Changed: External Connection metadata 저장/조회 API와 UI 저장 버튼을 추가했다. 기존 `Connection draft 준비 완료` 안내는 실제 저장 상태 표시로 바꿨다.
- Verified: `backend/tests/test_external_connection_persistence.py`와 `backend/tests/test_source_dataset_persistence.py` 6 passed, frontend build 통과, contract JSON validation 통과, local HTTP smoke 통과. `scripts/validate-harness.sh`는 기존 미완성 workspace 필수 파일 누락으로 실패했다.
- Remaining: 실제 파일 ingest, Kafka consume, DB credential/secret_ref test는 후속 Phase다.
- Next context: `/dataset` -> External Connection -> `소스 검사` -> Review -> `External connection 저장` 후 Source Dataset 단계에서 저장된 connection을 선택할 수 있다.
- Risk: 저장되는 것은 metadata와 inspect preview이며 실제 외부 연결 테스트 결과가 아니다.
