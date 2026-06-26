# System guardrail application 노트

## 진행 메모

- 다음 Phase는 `docs/system-guardrails.md`의 follow-up 중 repository admin 권한 없이 적용 가능한 `PR linked issue required`를 우선 적용한다.
- PR template의 `Closes #123` 예시는 HTML 주석 안에 있으므로 검사 로직에서 주석을 제거한 뒤 실제 본문만 판정해야 한다.
- `#135`가 생성 직후 PR 없이 closed/Done 상태가 된 drift를 발견했고, PR lifecycle을 위해 issue reopen 및 Project `In Progress` 보정을 수행했다.

## 결정

- 이번 Phase는 hard branch protection 설정이 아니라 GitHub Action check 파일과 repo-local 검사 script를 추가하는 범위로 제한한다.

## 열린 질문

- 이 check를 repository setting에서 required check로 지정할지는 repo admin 후속 작업으로 남긴다.

## 링크 / 증거

- Linked issue: https://github.com/JUNGLE-TEAM1/NMM_team1/issues/135
- Drift timeline: `gh api repos/JUNGLE-TEAM1/NMM_team1/issues/135/timeline --paginate`
- Verification: `node tests/pr-linked-issue-check.test.js`, `scripts/validate-harness.sh`, `scripts/validate-harness.sh --strict`
