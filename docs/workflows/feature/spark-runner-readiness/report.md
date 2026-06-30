# Spark runner readiness 보고서

## Short Report / 짧은 보고

- Type: Phase C-20
- Date: 2026-06-30
- Changed: Week2 Spark runner readiness API와 `/runs` read-only readiness panel을 추가했다.
- Verified: `backend/tests/test_week2_spark_readiness.py`, `backend/tests/test_week2_spark_runner.py`, frontend build.
- Remaining: distributed Spark cluster 실행, S3/DB/Kafka Spark read, Product Health 대용량 ETL 재실행은 후속 Phase다.
- Next context: C-21 CatalogDataset management boundary 또는 C-22 credential/secret connection design.
- Risk: Spark readiness는 실행 가능성 설명이며 cluster job 성공 evidence가 아니다.

## Phase / Hotfix

- Type: Phase
- Branch/work location: `feature/external-connection-persistence`, `docs/workflows/feature/spark-runner-readiness/`
- Date: 2026-06-30
- Workspace state: dirty worktree 위에서 C-20 관련 파일만 변경.

## Reference Docs / 참고 문서

- `AGENTS.md`
- `docs/03-interface-reference.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`
- `docs/08-development-workflow.md`

## Goal / 목표

- `spark_runner`의 현재 구현이 local pyarrow smoke라는 점을 UI/API에서 확인 가능하게 한다.
- distributed Spark cluster 실행과 S3/DB/Kafka source read를 지원하는 것처럼 보이지 않게 한다.

## Changed Files / 변경 파일

- `backend/app/services/week2_spark_runner.py`
- `backend/app/api/week2_workflow.py`
- `backend/tests/test_week2_spark_readiness.py`
- `frontend/src/api/week2Api.js`
- `frontend/src/api/asklakeClient.js`
- `frontend/src/app/App.jsx`
- `docs/03-interface-reference.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`

## Verification Commands / 검증 명령

```bash
PYTHONPATH=backend .venv/bin/pytest backend/tests/test_week2_spark_readiness.py backend/tests/test_week2_spark_runner.py -q
npm run build
```

## Quality Gate Evidence / 품질 게이트 증거

- Workspace file: `docs/workflows/feature/spark-runner-readiness/quality.md`
- Quality gate status: focused tests/build 통과.
- TDD status: readiness shape와 distributed cluster 미지원 경계를 backend test로 고정.
- Skipped checks: 실제 Spark cluster 기동/실행은 C-20 범위 밖.

## Regression Guard / 회귀 보호

- Checked feature: Spark readiness가 distributed Spark 실행 가능처럼 보이는 경우.
- Protected behavior: `local_file` local smoke와 cluster execution을 분리하고, `distributed_cluster_available=false`를 표시한다.
- Result: API/UI에 read-only readiness로 반영.

## Manual Verification / 수동 검증

- Document executed: `docs/07-manual-verification-playbook.md` C-20 항목.
- Environment: focused backend tests와 frontend production build.
- Result: `spark_runner` local smoke 경계 표시 확인.
- Failure/limitation: 실제 `/runs` browser smoke와 cluster execution은 수행하지 않음.

## docs/05 Acceptance Link / 수용 기준 연결

- Related item: Spark readiness read-only 표시와 unsupported source type 경계.
- Status: 구현/검증 완료.
- Evidence: backend focused tests, frontend build.

## Secret / Migration / Env Check

- Secret check: credential/secret 추가 없음.
- Migration/data change: 없음.
- Env change: `ASKLAKE_SPARK_MASTER_URL` 또는 `SPARK_MASTER_URL`이 있으면 configured metadata로만 표시한다.

## Final Judgment / 최종 판단

- Done: C-20 Spark readiness/fallback 경계 표시 완료.
- Remaining risk: 실제 distributed Spark 성공 검증은 cluster endpoint와 evidence contract가 준비된 뒤 수행해야 한다.
