# Container app skeleton 품질 게이트

이 파일은 이 branch의 TDD, check, CI/CD 증거를 기록한다.

- Quality gate status: passed-with-skips

## TDD Plan / TDD 계획

- Applies: yes
- Reason: M2는 backend/frontend health contract와 container 실행 경로를 새로 만드는 제품 skeleton 작업이다.
- Failing test first: 별도 터미널 실패 실행은 캡처하지 못했다. 구현 전 기준으로는 `backend/tests/test_health.py`와 FastAPI app이 없어 health contract test가 실패하는 상태였다.
- Expected failure command/result: `docker run --rm asklake-backend:m2-local python -m pytest`는 app/test 부재 상태에서는 import 또는 no-test failure가 예상된다.
- Pass command/result: `docker run --rm asklake-backend:m2-local python -m pytest` -> 2 passed.
- Refactor notes: `/health`와 `/api/health`는 같은 `health_payload()`를 사용해 local probe와 API base path를 같이 만족한다.

## Branch Checks / 브랜치 검증

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| shell syntax | `bash -n scripts/*.sh scripts/aws/*.sh` | pass | 모든 shell script syntax 통과 |
| unit/focused test | `docker run --rm asklake-backend:m2-local python -m pytest` | pass | backend health tests 2 passed |
| integration/contract test | `scripts/smoke-container-app.sh` | pass | backend/frontend image build, compose up, health/frontend curl 통과 |
| build/typecheck | `docker build -f infra/docker/backend.Dockerfile -t asklake-backend:m2-local .` | pass | backend image build 성공 |
| build/typecheck | `scripts/smoke-container-app.sh` | pass | frontend Vite production build 성공 |
| harness validation | `scripts/validate-harness.sh` | pass | Harness validation passed |
| strict harness validation | `scripts/validate-harness.sh --strict` | pass | draft 상태 기준 통과, completion 기록 후 재실행 예정 |

## CI/CD Gate / CI-CD 게이트

- CI required: yes
- CI result: GitHub Actions PR #30 all pass: harness 14s, manifest-smoke 14s, container-smoke 37s
- Deploy/publish required: no
- Deployment confirmation: AWS/ECR/EKS push/deploy는 이번 branch에서 실행하지 않음
- Rollback/smoke notes: 문제 발생 시 `docker compose down --remove-orphans`로 local container를 내리고 이전 Dockerfile/compose 변경을 되돌린다. `scripts/smoke-container-app.sh`는 로컬 포트 충돌을 피하려고 기본 18000/13000 포트를 사용한다.

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| Playwright screenshot | Playwright package는 있으나 browser binary가 설치되어 있지 않아 실행 불가. 대신 container HTTP health와 frontend HTML asset 응답을 확인했다. | no; 제한 사항 기록 |
