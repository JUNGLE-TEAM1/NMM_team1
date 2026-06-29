# Source dataset from connection wizard 보고서

## Short Report / 짧은 보고

- Type: feature
- Branch/work location: `feature/source-dataset-from-connection-wizard`, `docs/workflows/feature/source-dataset-from-connection-wizard`
- Date: 2026-06-29
- Workspace state: implemented
- Context Budget mode: Lite Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/workflows/feature/source-dataset-from-connection-wizard/plan.md`, 관련 `frontend/src/app/App.jsx`/`styles.css`
- Escalated context read: browser skill instruction for local UI smoke
- Context omitted intentionally: 전체 Source of Truth audit는 하지 않음. R-3은 Source Dataset wizard 보정에 한정.
- Changed: Source Dataset 생성 wizard를 `Connection 선택 -> Raw Dataset 설정 -> Review`로 보정. 선택 대상은 External Connection demo card이며, raw/source dataset name, source scope, raw schema preview, no-ingest/no-backend wording을 추가.
- Verified: `npm run build` in `frontend/` 통과; `scripts/validate-harness.sh` 통과; 브라우저에서 Source Dataset -> Order Events Kafka Connection -> Raw Dataset 설정 -> Review 흐름 확인. 기존 source type/dataset card 재등록 copy 없음.
- Remaining: Target Dataset wizard의 ETL job definition 중심 copy/review 정렬은 R-4.
- Next context: `feature/target-dataset-job-alignment`
- Risk: 실제 External Connection persistence와 Source Dataset backend 저장은 아직 없으며 demo draft UI 상태다.
