# 협업 하네스 팀 사용 가이드 품질 게이트

이 파일은 이 branch의 TDD, check, CI/CD 증거를 기록한다.

- Quality gate status: passed

## TDD Plan / TDD 계획

- Applies: no
- Reason: docs-only 학습 문서 작성이며 runtime logic, API contract, regression-prone code를 변경하지 않는다.
- Failing test first: not applicable
- Expected failure command/result: not applicable
- Pass command/result: `scripts/validate-harness.sh --strict` passed
- Refactor notes: not applicable

## Branch Checks / 브랜치 검증

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| markdown artifact search | `rg -n "AskLake 협업 하네스 사용 가이드|하네스를 사용할 때 사람의 책임과 AI의 책임|AI는 책임을 대신 지지 않는다|Pre-PR Human Checkpoint|팀원이 기억할 최소 규칙" docs/reports/collaboration-harness-team-usage-guide.md docs/reports/README.md` | passed | 문서 제목, 책임 경계 보강 섹션, 핵심 섹션, index link 확인 |
| whitespace check | `git diff --check` | passed | trailing whitespace 없음 |
| harness validation | `scripts/validate-harness.sh` | passed | workspace/report 기본 검증 통과 |
| strict harness validation | `scripts/validate-harness.sh --strict` | passed | Source of Truth preflight 포함 strict 검증 통과 |

## CI/CD Gate / CI-CD 게이트

- CI required: no runtime code changed
- CI result: local docs/harness validation only
- Deploy/publish required: no
- Deployment confirmation: not required
- Rollback/smoke notes: not required

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| frontend/backend test/build | 문서-only 변경이며 runtime code를 수정하지 않음 | 사용자 요청은 문서 생성/PR |
