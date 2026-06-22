# Branch switch and queue guard 계획

## 브랜치

- Branch: `feature/branch-switch-queue-guard`
- Workspace: `docs/workflows/feature/branch-switch-queue-guard`
- Created: 2026-06-22

## 목표

- 브랜치 전환 전 확인 절차와 PR finalize 후 남은 작업 브랜치 큐 확인 규칙을 하네스에 추가한다.

## 범위

- `scripts/list-active-branches.sh` read-only branch queue 요약 스크립트를 추가한다.
- `docs/08-development-workflow.md`에 branch switch confirmation과 remaining branch queue 규칙을 추가한다.
- `docs/11-git-sync-policy.md`에 branch switch/checkpoint 안내와 PR finalize 후 branch queue 확인을 추가한다.
- `docs/13-human-command-flow.md`에 다음 브랜치 전환과 남은 브랜치 확인 응답 흐름을 추가한다.
- `docs/10-next-action-menu.md`에 Remaining Branch Queue 메뉴를 추가한다.
- `scripts/validate-harness.sh`에 문서/스크립트 guard를 추가한다.

## 범위 제외

- 실제 branch 삭제 또는 cleanup 실행.
- 원격 PR 생성, merge, deploy.
- 기존 branch history 수정.

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/08-development-workflow.md`
- `docs/12-quality-gates.md`
- `docs/14-decision-option-brief.md`
- `docs/15-context-budget-rule.md`

## 구현 프롬프트

```text
@AGENTS.md @docs/00-layer-map.md @docs/08-development-workflow.md @docs/12-quality-gates.md @docs/14-decision-option-brief.md @docs/15-context-budget-rule.md

이 branch workspace에 적힌 작업만 구현한다.
기본은 Lite Read로 시작하고, 계약/데이터/보안/sync/quality/integration/decision 위험 신호가 있을 때만 문맥을 확장한다.
core logic, regression 위험, integration contract, bug fix를 바꾸는 경우 TDD 적용 여부를 먼저 기록한다.
고영향 선택은 구현 전에 Decision Option Brief로 정리한다.
이 plan.md를 업데이트하지 않고 범위를 확장하지 않는다.
```

## 검증 프롬프트

```text
@AGENTS.md @docs/05-acceptance-scenarios-and-checklist.md @docs/06-regression-and-failure-scenarios.md @docs/07-manual-verification-playbook.md @docs/12-quality-gates.md

branch 작업을 검증하고 `quality.md`와 workspace report에 증거를 기록한다.
```

## 완료 기준

- [x] 브랜치 전환 전 확인 절차가 문서화되어 있다.
- [x] dirty worktree checkpoint commit이 사람에게 먼저 안내되도록 규칙화되어 있다.
- [x] PR finalize 후 남은 작업 브랜치 큐 확인 절차가 문서화되어 있다.
- [x] `scripts/list-active-branches.sh`가 read-only로 branch queue를 출력한다.
- [x] merged/closed 브랜치는 cleanup 후보로만 표시하고 삭제하지 않는다.
- [x] TDD 상태 기록
- [x] Acceptance 확인
- [x] Regression/failure scenario 확인
- [x] Manual verification 기록
- [x] CI/check 명령과 결과 기록
- [x] Report 업데이트
