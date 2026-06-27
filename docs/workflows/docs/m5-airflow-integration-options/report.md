# M5 Airflow integration option guide 보고서

## Short Report / 짧은 보고

- Type: docs
- Branch/work location: `docs/m5-airflow-integration-options`, `docs/workflows/docs/m5-airflow-integration-options`
- Date: 2026-06-26
- Workspace state: complete
- Context Budget mode: Lite Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/14-decision-option-brief.md`, `docs/project-context/asklake-week2-module-plan/ver2/README.md`, `revised-nonoverlap-responsibility.md`, `runner-boundary-decision.md`, M5 Airflow adapter report/search results
- Escalated context read: not needed
- Context omitted intentionally: full Source of Truth audit, actual Airflow runtime implementation, M2 SparkRunner implementation
- Changed: `m5-airflow-integration-options.md`를 추가하고 `ver2/README.md` 읽는 순서에 연결했다.
- Verified: 문서가 당시 repo 상태와 맞는지 확인했다. `localhost:8080`은 접속 실패, `docker-compose.yml`은 backend/frontend만 포함했다. `git diff --check`와 `scripts/validate-harness.sh --strict`가 통과했다. 이후 사용자가 추천안을 채택했고 `feature/m5-airflow-smoke-integration` 구현 workspace가 이 결정을 소비했다.
- Remaining: 이 option-guide 자체의 남은 작업은 없다. 실제 Airflow compose/DAG/result artifact/adapter smoke 구현은 `feature/m5-airflow-smoke-integration`에서 진행했다.
- Next context: 추천 조합은 별도 Airflow compose, repo DAG, shared local volume, result JSON artifact, smoke에서 fallback 숨김 방지이며, 현재 M5 local/demo 마감 PR 후보에 포함된다.
- Risk: production Airflow, MinIO/S3, SparkRunner/M2 runtime은 이 문서와 구현 slice의 범위 밖이다.
