# 06. Regression Guard & Failure Scenarios

This document defines what must not break and how failures should behave.

## Purpose

- Protect already implemented behavior.
- Define expected failure and fallback behavior.
- Connect regression/failure checks to manual verification and Phase reports.

## How To Use

1. Before a Phase, read the relevant Regression Guard.
2. Before completion, review at least one relevant Failure Scenario.
3. If tests are missing, run related manual verification.
4. Record results in the Phase report.

## Feature Regression Guards

### Project Harness Identity

| Item | Content |
| --- | --- |
| Must not break | 이 저장소는 NMM_team1 프로젝트 운영 문서와 검증 하네스를 포함한다. |
| Failure condition | 핵심 문서가 다시 “다른 프로젝트에 복사하는 패키지”로 설명된다. |
| Expected behavior | README, AGENTS, product planning, workflow docs가 현재 프로젝트 운영 기준을 설명한다. |
| Verification method | README, AGENTS, `docs/01`, `docs/08`을 수동 검토하고 프로젝트 외부 적용 안내나 예시 프로젝트 설명이 핵심 문서에 남아 있지 않은지 확인한다. |
| Related docs/interface/Phase | `README.md`, `AGENTS.md`, `docs/01`, `docs/08` |

### Branch Workspace Clean Start

| Item | Content |
| --- | --- |
| Must not break | `docs/workflows/`는 실제 작업 workspace만 담고, 초기 적용 상태에서는 예시 workspace 없이 시작할 수 있다. |
| Failure condition | 시뮬레이션 workspace가 실제 프로젝트 작업처럼 남아 혼동을 만든다. |
| Expected behavior | `docs/workflows/README.md`만 기본으로 남고, 실제 작업 시 `scripts/start-workflow.sh`로 workspace를 만든다. |
| Verification method | `find docs/workflows -mindepth 2 -maxdepth 2 -type d` |
| Related docs/interface/Phase | `docs/workflows/README.md`, `scripts/start-workflow.sh` |

### Linked Issue PR Closure

| Item | Content |
| --- | --- |
| Must not break | linked GitHub issue가 있는 PR은 merge 후 issue가 자동 close될 수 있어야 한다. |
| Failure condition | `sync.md`나 PR body에 `Closes #<issue-number>` 또는 동등한 closing keyword가 없다. |
| Expected behavior | PR 준비 전 linked issue와 closing keyword를 확인한다. |
| Verification method | `scripts/status-workflow.sh <workspace>`와 PR template 확인 |
| Related docs/interface/Phase | `docs/03`, `docs/04`, `.github/pull_request_template.md` |

## Feature Failure Scenarios

### Example Artifacts Reintroduced

| Item | Content |
| --- | --- |
| Must not break | 운영 문서가 초기 예시 산출물로 다시 오염되지 않는다. |
| Failure condition | 과거 시뮬레이션 report나 example workspace가 기본 운영 경로에 추가된다. |
| Expected behavior | 예시는 필요할 때 별도 Phase에서 명시적으로 추가하고, 기본 `docs/workflows/`와 `docs/reports/`는 실제 작업만 담는다. |
| Verification method | `find docs/workflows -mindepth 2 -maxdepth 2 -type d` and `find docs/reports -maxdepth 1 -name "phase-*.md"` |
| Related docs/interface/Phase | `docs/workflows/`, `docs/reports/` |

### Missing Project-Specific Commands

| Item | Content |
| --- | --- |
| Must not break | 실제 기능 Phase 전에 실행/test/build 명령이 확인된다. |
| Failure condition | 기능 구현 완료를 선언했지만 `quality.md`에 실행한 검증 명령이나 skip reason이 없다. |
| Expected behavior | 프로젝트별 명령을 확정하거나, 미확정이면 deferral reason을 기록한다. |
| Verification method | workspace `quality.md`, `scripts/status-workflow.sh <workspace>` |
| Related docs/interface/Phase | `docs/04`, `docs/12`, workspace `quality.md` |

## Common Infrastructure Failure Scenarios

- Missing required environment variable
- Data store unavailable
- Migration/data change failure
- External provider timeout/error
- Background job failure
- Auth/access-control failure
- File or input validation failure

## Phase Report Minimum Format

```text
Regression Guard:
- Checked feature:
- Protected behavior:
- Result:

Failure Scenario:
- Reviewed failure:
- Expected behavior:
- Verification:
- Result:
```
