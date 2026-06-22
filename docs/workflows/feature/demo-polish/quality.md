# Demo polish 품질 게이트

이 파일은 이 branch의 TDD, check, CI/CD 증거를 기록한다.

- Quality gate status: passed-with-skips

## TDD Plan / TDD 계획

- Applies: no
- Reason: M5는 demo UX/default value/proxy/documentation polish 중심이며 backend core contract는 바꾸지 않았다.
- Failing test first: not applicable
- Expected failure command/result: not applicable
- Pass command/result: 기존 backend contract regression으로 `PYTHONPATH=backend pytest backend/tests` 8 passed.
- Refactor notes: API base를 same-origin `/api`로 바꾸고 Docker nginx proxy를 추가해 demo 환경 차이를 줄였다.

## Branch Checks / 브랜치 검증

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| shell syntax | `bash -n scripts/*.sh scripts/aws/*.sh` | pass | shell syntax valid |
| unit/focused test | `PYTHONPATH=backend pytest backend/tests` | pass | 8 passed |
| integration/contract test | `scripts/smoke-container-app.sh` | pass | source 등록, pipeline 생성/run success, result catalog 확인 |
| build/typecheck | `npm --prefix frontend run build` | pass | Vite production build succeeded |
| browser manual smoke | in-app browser at `http://localhost:3000` | pass | health 정상, source 등록, pipeline run success, result dataset 자동 선택 확인 |
| harness validation | `scripts/validate-harness.sh` | pass | strict 실행 전 포함 |
| strict harness validation | `scripts/validate-harness.sh --strict` | pass | harness validation passed |

## CI/CD Gate / CI-CD 게이트

- CI required: yes
- CI result: local equivalent passed; PR CI는 PR 생성 후 확인 필요
- Deploy/publish required: no
- Deployment confirmation: 실제 AWS/EKS deploy, ECR push, publish는 실행하지 않음.
- Rollback/smoke notes: 문제 발생 시 `docker compose down --remove-orphans`로 local demo container를 내리고, frontend nginx proxy/API base 변경을 되돌린다.

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| real release/deploy | M5는 release gate 정리와 demo rehearsal이며 외부 deploy는 별도 승인 필요 | yes, project rule |
