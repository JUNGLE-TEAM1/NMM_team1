# Source catalog 품질 게이트

이 파일은 이 branch의 TDD, check, CI/CD 증거를 기록한다.

- Quality gate status: passed-with-skips

## TDD Plan / TDD 계획

- Applies: yes
- Reason: M3는 `MetadataStore` 경계, SQLite persistence, CSV source validation, source/catalog API contract를 새로 구현한다.
- Failing test first: `backend/tests/test_source_catalog.py`를 구현 전에 정의했다. 구현 전에는 `create_app`, source/catalog endpoint, store 구현이 없어 실패하는 상태였다.
- Expected failure command/result: `docker run --rm asklake-backend:m3-local python -m pytest`는 source/catalog import 또는 404 failure가 예상됐다.
- Pass command/result: `docker run --rm asklake-backend:m3-local python -m pytest` -> 4 passed.
- Refactor notes: API 응답 필드 `schema`는 유지하되 Pydantic 내부 field는 `columns` alias로 둬 BaseModel shadow warning을 제거했다. 이후 backend를 `api/services/ports/adapters/domain/core`, frontend를 `api/app/components/features`로 분리하고 `SourceConnector`, `PipelineRunner`, `ResultStore`, `core/container.py`를 추가했다.

## Branch Checks / 브랜치 검증

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| shell syntax | `bash -n scripts/*.sh scripts/aws/*.sh` | pass | 모든 shell script syntax 통과 |
| unit/focused test | `docker run --rm asklake-backend:m3-local python -m pytest` | pass | health + source/catalog tests 4 passed |
| integration/contract test | `scripts/smoke-container-app.sh` | pass | modularized backend/frontend image build, compose up, source 등록, catalog 조회 통과 |
| build/typecheck | `scripts/smoke-container-app.sh` | pass | frontend Vite production build 성공 |
| harness validation | `scripts/validate-harness.sh` | pending final run | completion 기록 후 실행 |
| strict harness validation | `scripts/validate-harness.sh --strict` | pending final run | completion 기록 후 실행 |

## CI/CD Gate / CI-CD 게이트

- CI required: yes
- CI result: GitHub Actions PR #34 all pass: harness 15s, manifest-smoke 14s, container-smoke 35s
- Deploy/publish required: no
- Deployment confirmation: AWS/ECR/EKS push/deploy는 이번 branch에서 실행하지 않음
- Rollback/smoke notes: 문제 발생 시 `docker compose down --remove-orphans`로 local container를 내리고 SQLite local data는 `data/` 또는 container 내부 ephemeral file을 삭제한다.

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| Browser screenshot | Playwright browser binary가 설치되어 있지 않아 이전 M2와 동일하게 생략. API/asset/container smoke로 대체했다. | no; limitation recorded |
