# Plan

## Phase

- Type: docs
- Workspace: `docs/workflows/docs/pre-pr-handoff-helper-alignment/`
- Goal: `Pre-PR Human Checkpoint` 도입 뒤 남은 `--auto-pr` 명칭/정책 불일치를 줄이고 checkpoint evidence 기록을 더 명확하게 만든다.

## Prompt

```text
@AGENTS.md
@docs/00-layer-map.md
@docs/08-development-workflow.md
@docs/10-next-action-menu.md
@docs/11-git-sync-policy.md
@docs/12-quality-gates.md
@docs/13-human-command-flow.md
@docs/18-harness-regression-policy.md
@docs/reports/harness-post-merge-change-audit.md

Harness 변경사항 병합 후 점검 보고서의 H-1, H-3을 첫 보강 Phase로 처리한다.

목표:
1. `scripts/prepare-pr.sh --auto-pr`가 자동 승인처럼 보이는 문제를 줄인다.
2. 사람 승인 뒤 실행하는 helper 의미를 문서와 validation/test에 반영한다.
3. `Pre-PR Human Checkpoint` evidence 기록 위치를 명확히 한다.

범위:
- `--approved-pr` 또는 동등한 승인형 helper alias 추가.
- `--auto-pr`는 compatibility/deprecated alias로 유지하거나 문구를 안전하게 바꾼다.
- `docs/11`, `docs/10`, `docs/13`, `docs/workflows/README.md`, `scripts/validate-harness.sh`, `scripts/test-harness.sh`를 최소 수정한다.
- post-merge audit report를 evidence로 포함한다.

범위 제외:
- `PR 진행`을 단계별 승인으로 쪼개는 큰 정책 변경.
- rescue stash 삭제.
- push/PR 생성/merge.
```

## Scope

- `scripts/prepare-pr.sh`에 `--approved-pr` alias를 추가한다.
- `--auto-pr`는 deprecated compatibility alias로 남기고 help text를 사람 승인 뒤 사용으로 제한한다.
- validation/test/docs가 `--approved-pr`를 우선 확인하게 한다.
- `Pre-PR Human Checkpoint` evidence 기록을 `confirmations.md` 권장 섹션으로 명확히 한다.

## Out Of Scope

- `PR 진행` 승인 범위 재설계.
- rescue stash 삭제.
- remote push, PR creation, merge.

## Completion Criteria

- `scripts/test-harness.sh` 통과.
- `scripts/validate-harness.sh` 통과.
- `scripts/validate-harness.sh --strict` 통과.
- `scripts/harness-flow-check.sh docs/workflows/docs/pre-pr-handoff-helper-alignment` 통과.
