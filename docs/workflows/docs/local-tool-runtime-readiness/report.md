# Local Tool Runtime Readiness 보고서

## Short Report / 짧은 보고

- Type: docs
- Branch/work location: `docs/local-tool-runtime-readiness`, `docs/workflows/docs/local-tool-runtime-readiness`
- Date: 2026-06-24
- Workspace state: complete
- Context Budget mode: Escalate Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/04`, `docs/07`, `docs/08`, `docs/12`, `docs/13`
- Escalated context read: `docs/15-context-budget-rule.md`, workspace status templates, relevant `rg` results
- Context omitted intentionally: product runtime code, unrelated historical reports, cloud/deploy docs outside this rule
- Changed: Local Tool/Runtime Readiness rule added to development guide, quality gates, manual verification, workflow, and human command flow. Mid-Phase Steering rule added to workflow, collaboration agreement, next action menu, and human command flow.
- Verified: `scripts/validate-harness.sh`, `scripts/validate-harness.sh --strict`, `scripts/test-harness.sh`, `git diff --check`
- Remaining: remote PR/CI/finalization still needs to complete; no script automation added.
- Next context: future script hardening can add tool-specific helpers if repeated readiness failures occur.
- Risk: host-level install remains intentionally manual-confirmed; this rule does not grant permission for cloud/deploy/resource creation.

## 변경 시작 계층

- Start layer: Development Operations
- Propagation: Development Operations -> Manual Verification -> Workflow -> Quality Gates -> Human Command Flow
- Scope: docs-only harness rule clarification

## 구현 요약

| 문서 | 변경 |
| --- | --- |
| `docs/04-development-guide.md` | Local Tool/Runtime Readiness 절차와 Docker safe start/fallback 예시 추가 |
| `docs/07-manual-verification-playbook.md` | manual verification 전 readiness check/safe start 규칙 추가 |
| `docs/08-development-workflow.md` | 완료 게이트에 readiness evidence 기록 추가 |
| `docs/09-collaboration-agreement.md` | Mid-Phase Steering 협업 원칙 추가 |
| `docs/10-next-action-menu.md` | `Mid-Phase Steering Received` 메뉴 추가 |
| `docs/12-quality-gates.md` | `quality.md`에 readiness/fallback/manual action evidence 기록 요구 추가 |
| `docs/13-human-command-flow.md` | 검증 응답 상태 구분과 Mid-Phase Steering 사람 명령 예시 추가 |
| `docs/reports/README.md` | Mid-Phase Steering report index 추가 |

## Docker 사건 적용 예시

이 규칙 이후 같은 상황이면 AI는 바로 "사용자가 Docker를 켜야 함"으로 멈추지 않는다.

1. `command -v docker`, `docker --version`, `docker info`를 확인한다.
2. `/Applications/Docker.app`이 있으면 `open -a Docker`로 safe start를 시도한다.
3. readiness loop 후 `scripts/smoke-container-app.sh`를 재실행한다.
4. BuildKit local variant 문제가 있으면 `DOCKER_BUILDKIT=0 COMPOSE_DOCKER_CLI_BUILD=0 scripts/smoke-container-app.sh` 같은 local-only fallback을 시도한다.
5. 그래도 막히면 시도한 명령과 사람이 해야 할 조치를 `quality.md`, report, final response에 구분해서 쓴다.

## 제한

- host-level install, license, admin elevation, system service setup, secret, paid cloud/external resource, deploy/publish는 여전히 사람 확인 대상이다.
- 이번 Phase는 smoke script 또는 CI job을 변경하지 않았다.
- Mid-Phase Steering 보강은 같은 docs harness branch의 문서 범위 안에서 반영했다.
