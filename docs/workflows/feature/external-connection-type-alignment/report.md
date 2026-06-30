# External connection type alignment 보고서

## Short Report / 짧은 보고

- Type: feature
- Branch/work location: `feature/external-connection-persistence`, `docs/workflows/feature/external-connection-type-alignment`
- Date: 2026-06-30
- Workspace state: complete
- Context Budget mode: Lite Read
- Primary context read: `AGENTS.md`, External Connection 관련 workspace 문서, `frontend/src/app/App.jsx`, `frontend/src/app/styles.css`
- Escalated context read: browser local UI smoke
- Context omitted intentionally: 전체 Source of Truth audit, backend persistence/API 구현, 실제 Kafka broker 기동
- Changed: External Connection connector type을 Local File/Local Folder/Prepared Dataset/Kafka Topic 중심으로 재정렬하고, Database/Object Storage는 후속 Phase로 disabled 표시했다. Source Dataset connection 후보도 Product Health file, Taxi folder, prepared bundle, Kafka topic으로 정리했다. `Configure`는 `Configure & Inspect`로 바꾸고 `소스 검사` 버튼을 추가해 connector type과 detected dataset preview를 사용자 트리거로 분리했다.
- Verified: `npm run build`, `git diff --check`, browser smoke, Kafka configure smoke, browser console error check 통과.
- Remaining: 실제 저장/API 연결, Source Dataset persistence, Kafka replay endpoint 연결, backend auto-detect는 후속 Phase.
- Next context: Local File은 기존 `/api/sources` CSV 등록 경로와 연결 가능하고, Kafka는 `KafkaTopicContract + RuntimeConfig.source_inputs[].topic` 기준으로 replay evidence를 붙이면 된다.
- Risk: UI 정렬만 완료됐으므로 아직 “connection 저장 완료”나 “실제 auto-detect 완료”로 말하면 안 된다. 현재 inspect 결과는 mock preview다.
