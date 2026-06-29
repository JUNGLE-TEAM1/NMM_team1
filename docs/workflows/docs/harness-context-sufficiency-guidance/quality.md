# Harness context sufficiency guidance 품질 게이트

이 파일은 이 branch의 TDD, check, CI/CD 증거를 기록한다.

- Quality gate status: passed

## TDD Plan / TDD 계획

- Applies: no
- Reason: 문서 보강이며 code behavior를 변경하지 않는다.
- Failing test first: not applicable
- Expected failure command/result: not applicable
- Pass command/result: not applicable
- Refactor notes: not applicable

## Branch Checks / 브랜치 검증

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| 문구 반영 확인 | `rg -n "AI의 도움을 받아 문맥 초안|문맥을 이해하고 충분성을 확인|이 문맥을 내가 이해할 수 있게|AI가 만든 문맥을 이해" docs/reports/collaboration-harness-team-usage-guide.md` | passed | 핵심 문구 확인 |
| 책임 부담 완화 문구 확인 | `rg -n "하네스는 책임을 늘리는 장치가 아니라|하네스를 쓰면 책임이 새로 생기는 것이 아닙니다|AI는 책임을 대신 지지 않습니다|더 낮은 부담으로, 더 높은 품질로" docs/reports/collaboration-harness-team-usage-guide.md` | passed | 핵심 문구 확인 |
| 읽기 흐름/톤 보강 확인 | `rg -n "처음 읽는 방법|AI 답변은 팀 판단을 돕는 참고 자료|바로 팀 근거로 쓰기보다는|상세 기준" docs/reports/collaboration-harness-team-usage-guide.md` | passed | 핵심 문구 확인 |
| Context Assumption Check 문구 확인 | `rg -n "Context Assumption Check|일반론 기준|이 저장소 기준|Context Assumption Needed|질문 전제를 확인하지 않고" docs/09-collaboration-agreement.md docs/13-human-command-flow.md docs/08-development-workflow.md docs/15-context-budget-rule.md docs/10-next-action-menu.md docs/05-acceptance-scenarios-and-checklist.md docs/06-regression-and-failure-scenarios.md docs/07-manual-verification-playbook.md` | passed | 핵심 문구 확인 |
| Context Assumption Check 전체 docs 확인 | `rg -n "Context Assumption Check|Context Assumption Needed|일반론 기준|이 저장소 기준|질문 전제를 확인하지 않고|Check Context Assumptions" docs` | passed | Source of Truth, report, workspace 기록 위치 확인 |
| Markdown diff check | `git diff --check` | passed | 공백 오류 없음 |
| Harness validation | `scripts/validate-harness.sh` | passed | `Harness validation passed.` |
| Harness strict validation | `scripts/validate-harness.sh --strict` in `/tmp/nmm-context-pr` | passed | 분리된 Context Assumption Check PR 범위에서는 strict validation 통과 |
| Harness regression test | `scripts/test-harness.sh` in `/tmp/nmm-context-pr` | passed | `Harness regression tests passed: 31` |
| Workspace status | `scripts/status-workflow.sh docs/workflows/docs/harness-context-sufficiency-guidance` in `/tmp/nmm-context-pr` | passed | Workspace PR checklist ready |
| PR sync check | `scripts/prepare-pr.sh --check-pr-sync docs/workflows/docs/harness-context-sufficiency-guidance` in `/tmp/nmm-context-pr` | passed | PR body branch name resolves to `docs/harness-context-sufficiency-guidance`; PR sync check passed |

## CI/CD Gate / CI-CD 게이트

- CI required: no
- CI result: not run; local docs check only
- Deploy/publish required: no
- Deployment confirmation: not applicable
- Rollback/smoke notes: not applicable

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| original dirty worktree strict/test | 원래 checkout의 무관한 `data-integration-*` 미추적 workspace가 fixture에 섞여 실패했으나, PR용 clean worktree에서 재검증 완료 | n/a |
