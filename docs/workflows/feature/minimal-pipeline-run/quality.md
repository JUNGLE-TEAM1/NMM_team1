# Minimal pipeline run 품질 게이트

이 파일은 이 branch의 TDD, check, CI/CD 증거를 기록한다.

- Quality gate status: passed-with-skips

## TDD Plan / TDD 계획

- Applies: yes
- Reason: pipeline/run 상태 전이와 result dataset 생성은 core contract라 회귀 테스트가 필요하다.
- Failing test first: `backend/tests/test_pipeline_run.py`를 먼저 추가한 뒤 구현을 연결했다.
- Expected failure command/result: `PYTHONPATH=backend pytest backend/tests`에서 pipeline endpoint/metadata 구현 전 실패 예상.
- Pass command/result: `PYTHONPATH=backend pytest backend/tests` pass, 8 passed.
- Refactor notes: M3의 `MetadataStore`, `SourceConnector`, `ResultStore` 포트 구조를 유지하고 `PipelineService`가 포트를 조합하게 했다.

## Branch Checks / 브랜치 검증

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| shell syntax | `bash -n scripts/*.sh scripts/aws/*.sh` | pass | shell script syntax valid |
| unit/focused test | `PYTHONPATH=backend pytest backend/tests` | pass | 8 passed; pipeline success, validation, failed run 포함 |
| integration/contract test | `scripts/smoke-container-app.sh` | pass | compose build/up, source 등록, pipeline 생성/run success, result catalog 확인 |
| build/typecheck | `npm --prefix frontend run build` | pass | Vite production build succeeded |
| Kubernetes manifest smoke | `test -f ... && rg -n "apiVersion:|kind:" infra/k8s/base` | pass | namespace/deployment/service/kustomization shape 확인 |
| harness validation | `scripts/validate-harness.sh` | pass | strict 실행 전 포함 |
| strict harness validation | `scripts/validate-harness.sh --strict` | pass | draft 상태 기준 semantic checks skip, harness validation passed |

## CI/CD Gate / CI-CD 게이트

- CI required: yes
- CI result: local equivalent passed; PR CI는 PR 생성 후 확인 필요
- Deploy/publish required: no
- Deployment confirmation: 실제 AWS/EKS deploy, ECR push, cloud resource 생성은 실행하지 않음.
- Rollback/smoke notes: 문제 발생 시 `docker compose -p asklake_container_smoke down --remove-orphans`로 local smoke container를 내린다. result CSV는 local `data/results` 또는 smoke container 내부 ephemeral storage에만 생성된다.

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| real AWS/EKS deploy | M4는 배포 가능 smoke까지이며 비용 resource 생성/외부 상태 변경은 별도 승인 필요 | yes, project rule |
| browser screenshot E2E | Playwright browser binary 검증 환경을 별도로 열지 않았고 API/frontend build/container smoke로 대체 | no; limitation recorded |
