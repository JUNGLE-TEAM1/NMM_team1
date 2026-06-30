# External connection persistence 보고서

## Short Report / 짧은 보고

- Type: feature
- Date: 2026-06-30
- Changed: External Connection metadata 저장/조회 API(`/api/external-connections`)와 UI `External connection 저장` 버튼을 추가했다. 저장된 connection은 Source Dataset connection 선택 후보에 즉시 포함된다.
- Verified: backend focused test 6 passed, frontend build 통과, contract JSON validation 통과, local HTTP smoke 통과. `scripts/validate-harness.sh`는 기존 미완성 workspace 필수 파일 누락으로 실패했다.
- Remaining: 실제 file ingest, Kafka consume, DB credential test는 후속 Phase다.
- Next context: Source Dataset은 저장된 External Connection의 id/name/type/resource를 참조해 metadata를 저장할 수 있다.
- Risk: metadata 저장만 완료됐으므로 실제 외부 시스템 연결 성공으로 말하면 안 된다.
