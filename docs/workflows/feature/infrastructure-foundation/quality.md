# Infrastructure foundation 품질 게이트

이 파일은 이 branch의 TDD, check, CI/CD 증거를 기록한다.

- Quality gate status: passed-with-skips

## TDD Plan / TDD 계획

- Applies: no
- Reason: 제품 runtime logic 변경이 아니라 인프라 foundation artifact 추가 작업이다.
- Failing test first: not applicable
- Expected failure command/result: not applicable
- Pass command/result: shell syntax, Docker build, manifest shape check, harness validation
- Refactor notes: 실제 app code가 생기면 smoke Dockerfile을 app Dockerfile로 교체한다.

## Branch Checks / 브랜치 검증

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| workflow syntax | `bash -n scripts/start-workflow.sh scripts/status-workflow.sh scripts/validate-harness.sh` | passed | shell syntax 확인 |
| Docker backend build | `docker build -f infra/docker/backend.Dockerfile -t asklake-backend:local .` | passed | `asklake-backend:local` image build 성공 |
| Docker frontend build | `docker build -f infra/docker/frontend.Dockerfile -t asklake-frontend:local .` | passed | `asklake-frontend:local` image build 성공 |
| Kubernetes manifest shape | `rg -n "apiVersion:|kind:" infra/k8s/base` | passed | manifest 기본 shape 확인 |
| harness validation | `scripts/validate-harness.sh` | passed | 2026-06-22 실행 |
| strict harness validation | `scripts/validate-harness.sh --strict` | passed | 2026-06-22 실행 |

## CI/CD Gate / CI-CD 게이트

- CI required: yes
- CI result: `.github/workflows/ci.yml` 후보 추가, local equivalent checks 실행
- Deploy/publish required: no
- Deployment confirmation: 실제 AWS deploy는 approval 전이라 실행하지 않음
- Rollback/smoke notes: `infra/aws/approval-checklist.md`에 resource 삭제/rollback/smoke 확인 항목 기록

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| real AWS deploy | 비용/권한/rollback approval 전이라 실행하지 않음 | yes, approval gate로 기록 |
| product runtime tests | 제품 코드가 아직 없고 smoke image만 있음 | yes, infrastructure foundation Phase |
