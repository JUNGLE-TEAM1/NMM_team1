# PR risk warning 노트

## 진행 메모

- 이전 Phase finalize가 남긴 local `sync.md` 변경은 `git stash push -m "finalize evidence for system guardrail application"`로 보관하고, `origin/main` merge commit `2601dbe`에서 새 Phase를 시작했다.
- 이번 Phase는 `docs/system-guardrails.md`의 follow-up 중 `PR size/risk warning`을 warning-only GitHub Action으로 적용한다.
- PR 크기를 hard gate로 막지 않고, changed files/line count/risky path를 summary와 warning으로 보여주는 advisory check로 둔다.

## 결정

- 기본 threshold는 `20 files`, `600 changed lines`로 시작한다.
- 위험 경로 후보는 `.github/`, `scripts/`, `infra/`, `contracts/`, `docs/03-interface-reference.md`, `docs/12-quality-gates.md`, `docs/system-guardrails.md`로 시작한다.
- 경고 check는 실패하지 않는다. hard gate 승격과 override label은 후속 결정으로 남긴다.

## 열린 질문

- linked issue: https://github.com/JUNGLE-TEAM1/NMM_team1/issues/137
- verification: `node tests/pr-risk-warning.test.js`

## 링크 / 증거

- 
