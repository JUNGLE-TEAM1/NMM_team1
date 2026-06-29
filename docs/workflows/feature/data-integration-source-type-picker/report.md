# Data integration source type picker 보고서

## Short Report / 짧은 보고

- Type: feature
- Branch/work location: `feature/data-integration-source-type-picker`, `docs/workflows/feature/data-integration-source-type-picker`
- Date: 2026-06-29
- Workspace state: archived
- Context Budget mode: Lite Read
- Primary context read: `AGENTS.md`, `docs/workflows/feature/data-integration-source-type-picker/plan.md`, `frontend/src/app/App.jsx`, `frontend/src/app/styles.css`
- Escalated context read: browser skill instructions for local web verification
- Context omitted intentionally: full Source of Truth audit; scope is limited to the current data integration Source modal correction
- Changed: `새 파이프라인 만들기` 모달을 source type picker + dataset card selector로 보정했다. `전체`, `CSV`, `Kafka`, `PostgreSQL`, `MongoDB`, `API`, `S3` type과 검색/정렬/type 메뉴를 추가했다. 선택 결과는 Source 카드와 schema preview에 반영된다.
- Verified: `npm run build`, `scripts/validate-harness.sh`, browser smoke at `http://127.0.0.1:5173/dataset`
- Remaining: 실제 connector/API/credential/file upload는 다음 연결 Phase 범위다.
- Next context: Transform step 또는 실제 source connector 연결 여부 결정
- Risk: dataset 목록은 demo fixture이므로 실제 backend source registry와 아직 연결되지 않았다.
