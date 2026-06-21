# Sync PR finalization guard 계획

## 브랜치

- Branch: `feature/sync-pr-finalization-guard`
- Workspace: `docs/workflows/feature/sync-pr-finalization-guard`
- Created: 2026-06-22

## 목표

- PR 전 `sync.md` 상태를 정적으로 검사하는 하네스 규칙을 추가한다.
- PR merge 후 `sync.md`를 최종화하는 `prepare-pr.sh --finalize` 흐름을 추가한다.
- 이전 phase의 실제 PR/issue 상태와 `sync.md` 기록 불일치를 보정한다.

## 범위

- `scripts/prepare-pr.sh`에 `--check-pr-sync`, `--finalize` 추가
- `scripts/validate-harness.sh --strict`에 `sync.md` Push / PR 정적 일관성 검사 추가
- `docs/11-git-sync-policy.md`, `docs/13-human-command-flow.md` 업데이트
- MVP/infra workspace의 merge/issue close 기록 보정
- 현재 workspace 검증 기록 업데이트

## 범위 제외

- GitHub 원격 상태를 `validate-harness.sh --strict`에서 직접 조회
- PR merge 자동화
- deploy/AWS 변경

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

- [x] 범위 완료
- [x] TDD 상태 기록
- [x] Acceptance 확인
- [x] Regression/failure scenario 확인
- [x] Manual verification 기록
- [x] CI/check 명령과 결과 기록
- [x] Report 업데이트
