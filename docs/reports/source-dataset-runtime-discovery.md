# Source dataset runtime discovery

## Short Report / 짧은 보고

- Type: Phase C-26
- Date: 2026-06-30
- Changed: Source Dataset wizard가 External Connection schema discovery 가능 여부를 보고 다음/저장을 제어하도록 변경.
- Verified: frontend build, browser smoke, backend `/api/source-datasets` 저장 evidence.
- Remaining: DB/S3/Kafka 실제 schema discovery, Kafka consume/replay, 대용량 read.
- Next context: C-27에서 생성된 Source Dataset을 Silver Dataset local materialization 입력으로 사용한다.
- Risk: runtime connector는 connection test가 통과해도 Source Dataset schema discovery는 아직 pending이다.

## Goal / 목표

- External Connection 상태와 Source Dataset 생성 흐름을 연결하고, local discovery 가능/DB-S3-Kafka pending 상태를 명확히 분리한다.

## Changed Files / 변경 파일

- `frontend/src/app/App.jsx`
- `docs/workflows/feature/source-dataset-runtime-discovery/plan.md`
- `docs/workflows/feature/source-dataset-runtime-discovery/quality.md`
- `docs/workflows/feature/source-dataset-runtime-discovery/report.md`
- `docs/reports/source-dataset-runtime-discovery.md`
- `docs/reports/README.md`

## Verification Commands / 검증 명령

```bash
npm --prefix frontend run build
curl -s http://127.0.0.1:18000/api/source-datasets
```

## Manual Verification / 수동 검증

- `/datasets/source -> Source Dataset 생성`
- `conn_postgres_runtime_smoke` 선택: `Schema discovery pending`, `다음` 비활성화.
- local file connection 선택: `다음` 활성화, Review 이동, 저장 성공.
- 저장 evidence: `source_c26_runtime_discovery_smoke`, `file_evidence.status=file_backed`, schema preview 10 fields.

## Regression Guard / 회귀 보호

- runtime connection test를 schema discovery 완료로 표시하지 않음.
- 빈 schema preview로 Source Dataset 저장을 시도하지 않음.
- raw credential 표시/저장 없음.

## Final Judgment / 최종 판단

- Done: C-26의 UI/API 경계는 닫혔다.
- Remaining risk: connector별 실제 discovery 구현은 후속 Phase로 남아 있다.
