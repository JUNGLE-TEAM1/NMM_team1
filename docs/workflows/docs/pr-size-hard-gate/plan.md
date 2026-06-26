# PR Size Hard Gate 계획

## 브랜치

- Branch: `docs/pr-size-hard-gate`
- Workspace: `docs/workflows/docs/pr-size-hard-gate`
- Created: 2026-06-26

## 목표

- PR size/risk 중 size 기준을 시스템 hard gate로 적용한다.
- 하네스 evidence 파일 때문에 불필요하게 막히지 않도록 `docs/workflows/**`, `docs/reports/**`는 size 계산에서 제외한다.
- 위험 경로 감지는 warning으로 유지한다.

## 범위

- `pr-size-hard-gate` GitHub Action 추가.
- `pr-size-hard-gate` required check를 `AskLake main system guardrails` ruleset에 추가.
- PR body override `Large PR Exception: approved` 지원.
- 가드레일 문서와 품질 게이트 문서 업데이트.

## 범위 제외

- CODEOWNERS review.
- 위험 경로 자체 hard gate.
- remote-changing E2E rehearsal.

## 완료 기준

- [x] non-evidence files > 10 또는 non-evidence changed lines > 600이면 check가 실패한다.
- [x] `Large PR Exception: approved`가 PR body에 있으면 통과한다.
- [x] evidence 파일은 size 계산에서 제외된다.
- [x] focused test와 strict harness validation이 통과한다.
- [x] GitHub ruleset required check에 `pr-size-hard-gate`가 포함된다.
