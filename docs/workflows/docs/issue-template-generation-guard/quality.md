# 이슈 템플릿 생성 경로 보강 품질 게이트

- Quality gate status: passed

## TDD Plan / TDD 계획

- Applies: yes
- Reason: `scripts/start-workflow.sh` issue 생성과 `scripts/prepare-pr.sh` PR body 초안은 하네스 behavior다.
- Failing test first: `scripts/test-harness.sh`의 start-workflow issue fixture와 prepare-pr body fixture가 기존 영어 body/label 또는 설명 부족 상태에서는 새 기대값을 만족하지 못함.
- Expected failure command/result: 초기 실행에서 `start-workflow docs issue uses Korean template labels` fixture가 실패했고, PR body 보강 후에는 prepare-pr fixture에 새 reviewer context assertion을 추가했다.
- Pass command/result: `scripts/test-harness.sh` passed 27; `scripts/validate-harness.sh` passed; `scripts/validate-harness.sh --strict` passed.
- Refactor notes: issue body 생성은 `write_issue_body`, title prefix는 `prefixed_issue_title`, label 매핑은 `issue_labels_for_type`으로 분리했다. PR body는 `report.md`의 `Changed`, `Verified`, `Remaining`, `Risk`를 상단에 반영한다.

## Branch Checks / 브랜치 검증

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| shell syntax | `bash -n scripts/start-workflow.sh scripts/prepare-pr.sh scripts/test-harness.sh scripts/validate-harness.sh` | passed | no syntax output |
| GitHub issue template YAML parse | `ruby -e 'require "yaml"; Dir[".github/ISSUE_TEMPLATE/*.{yml,yaml}"].each { |f| YAML.load_file(f); puts "ok #{f}" }'` | passed | `ok .github/ISSUE_TEMPLATE/config.yml` |
| start-workflow dry-run | `scripts/start-workflow.sh --dry-run feature sample-korean-issue "샘플 한국어 이슈"` | passed | no branch/files/remote issue created |
| prepare-pr dry-run | `scripts/prepare-pr.sh --dry-run docs/workflows/docs/issue-template-generation-guard` | passed | PR body draft includes reviewer-facing work/validation/remaining/risk summary |
| harness regression | `scripts/test-harness.sh` | passed | Harness regression tests passed: 27 |
| harness validation | `scripts/validate-harness.sh` | passed | Harness validation passed. |
| strict harness validation | `scripts/validate-harness.sh --strict` | passed | Harness validation passed. |
| diff whitespace | `git diff --check` | passed | no whitespace output |

## CI/CD Gate / CI-CD 게이트

- CI required: no
- CI result: local harness checks used for this docs/ops harness change
- Deploy/publish required: no
- Deployment confirmation: not applicable
- Rollback/smoke notes: no deployment or migration

## Source of Truth Impact Gate

- Source of Truth impact: applied
- Proposed files: `docs/04-development-guide.md`, `docs/11-git-sync-policy.md`, `docs/13-human-command-flow.md`
- Validation command/result: `scripts/validate-harness.sh --strict` passed
- Product acceptance/manual verification impact: none. GitHub issue 생성 하네스 동작 보강이며 제품 acceptance path는 변경하지 않음.

## Harness Test Update Gate

- Harness test impact: updated
- Reason: `scripts/start-workflow.sh` issue 생성 동작과 `scripts/prepare-pr.sh` PR body draft 변경.
- Updated fixture: `start-workflow adds created issue to project`, `start-workflow docs issue uses Korean template labels`, `prepare-pr check stays local`
- Validation command/result: `scripts/test-harness.sh` passed 27

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| real GitHub issue/PR mutation | 이번 요청은 기존 remote issue/PR 보정 금지와 하네스 보강 우선이므로 fake `gh`와 dry-run으로 제한 | user requested harness first |
| product tests/build | 제품 코드 변경 없음 | docs/ops harness change |
