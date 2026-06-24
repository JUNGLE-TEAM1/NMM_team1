# Local Environment Requirements 보고서

## Short Report / 짧은 보고

- Type: docs
- Date: 2026-06-24
- Changed: macOS/Windows 로컬 개발 지원 기준을 `docs/04`에 Source of Truth로 정리하고, WSL2 권장 경로, native Windows 미검증 범위, Docker Compose 권장 경로, 후속 cross-platform audit/tooling 후보를 문서화했다.
- Verified: `scripts/validate-harness.sh`, `scripts/validate-harness.sh --strict`, `git diff --check`
- Remaining: 실제 Windows WSL2/native Windows smoke evidence와 PowerShell/Python helper 같은 tooling 개선은 별도 Phase 후보로 남았다.
- Next context: `PR 진행`, `로컬 완료로 보류`, `추가 수정`, 또는 `docs/cross-platform-smoke-audit` 중 선택.
- Risk: 문서 기준 보강만 수행했으며 native Windows PowerShell/CMD 지원은 아직 보장하지 않는다.

## Phase

- Type: docs
- Branch/work location: `docs/local-environment-requirements`, `docs/workflows/docs/local-environment-requirements`
- Date: 2026-06-24
- Workspace state: complete

## 변경 시작 계층

- Start layer: Development Operations
- Propagation: Development Operations -> Acceptance -> Regression -> Manual Verification -> Workflow

## Changed Files / 변경 파일

- `README.md`
- `docs/04-development-guide.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`
- `docs/manual-verification/00-environment-setup.md`
- `docs/manual-verification/07-mvp-demo-script.md`
- `docs/08-development-workflow.md`
- `docs/reports/local-environment-requirements.md`
- `docs/workflows/docs/local-environment-requirements/`

## Implementation Summary / 구현 요약

- `docs/04`에 로컬 개발 환경 요구사항, 지원 등급, 최소 도구, Docker Compose 권장 실행, 하네스 bash 전제, macOS/Windows readiness 경계를 추가했다.
- README는 상세 기준을 `docs/04`로 연결하는 짧은 안내만 추가했다.
- acceptance/regression/manual verification에 OS/shell 지원 범위와 미검증 범위가 drift되지 않도록 확인 항목을 추가했다.
- 실제 Windows 검증과 cross-platform tooling 구현은 `docs/08` 후속 Phase 후보로 분리했다.

## Context Budget Evidence / 컨텍스트 예산 증거

- Context Budget mode: Lite Read에서 시작, OS/runtime evidence 확인을 위해 제한적 Escalate Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/04`, `docs/05`, `docs/06`, `docs/07`, `docs/08`, `README.md`
- Escalated context read: `docker-compose.yml`, `infra/docker/backend.Dockerfile`, `infra/docker/frontend.Dockerfile`, `backend/requirements.txt`, `frontend/package.json`, `.env.example`, `scripts/*.sh` search results
- Context omitted intentionally: product architecture/interface full review, runtime source review

## Verification Commands / 검증 명령

```bash
rg -n "Local Environment|local development|WSL2|PowerShell|bash-compatible|Docker Compose|지원 등급|cross-platform|native Windows|로컬 개발 환경" README.md docs/04-development-guide.md docs/05-acceptance-scenarios-and-checklist.md docs/06-regression-and-failure-scenarios.md docs/07-manual-verification-playbook.md docs/manual-verification docs/08-development-workflow.md
scripts/validate-harness.sh
scripts/validate-harness.sh --strict
git diff --check
```

## Quality Gate Evidence / 품질 게이트 증거

- Workspace file: `docs/workflows/docs/local-environment-requirements/quality.md`
- Quality gate status: passed
- TDD status: not applicable, docs-only change
- CI/check result: local harness validation passed
- Skipped checks: product runtime smoke, Windows WSL2 smoke, native Windows smoke
- CD/deploy gate: not required

## Decision Evidence / 결정 증거

- Workspace file: `docs/workflows/docs/local-environment-requirements/decisions.md`
- Decision status: accepted
- Accepted/deferred decisions: Docker Compose 권장 경로, Windows WSL2 기본 지원 경로, native Windows 미검증 범위, tooling/audit follow-up
- Revisit/rollback condition: native Windows를 공식 지원하려면 smoke audit evidence와 helper/tooling 결정을 먼저 수행한다.

## Regression Guard / 회귀 보호

- Checked feature: 로컬 환경 지원 범위가 불명확해지는 경우
- Protected behavior: WSL2 권장 경로와 native Windows 미검증 범위를 구분한다.
- Result: passed

## Failure Scenario / 실패 시나리오

- Reviewed failure: 프로젝트별 명령이 없거나 OS별 실행 가능 범위가 모호한 경우
- Expected behavior: `docs/04`에 권장 경로와 미검증 범위를 기록하고, 실제 Windows evidence는 후속 Phase로 남긴다.
- Verification: 문서 검색과 harness validation
- Result: passed

## Manual Verification / 수동 검증

- Document executed: `docs/manual-verification/00-environment-setup.md` rule review
- Environment: docs/static validation on current local machine
- Result: passed for documentation criteria
- Failure/limitation: Windows WSL2/native Windows smoke는 현재 환경에서 실행하지 않음
- Evidence: validation commands above

## docs/05 Acceptance Link / 수용 기준 연결

- Related item: `local development support tier와 미검증 OS/shell 범위가 docs/04에 기록되어 있다.`
- Result: satisfied
