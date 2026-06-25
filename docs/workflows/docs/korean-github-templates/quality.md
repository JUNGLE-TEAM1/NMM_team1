# 한국어 GitHub Issue/PR 템플릿 개선 품질 게이트

이 파일은 이 branch의 TDD, check, CI/CD 증거를 기록한다.

- Quality gate status: passed-with-skips

## TDD Plan / TDD 계획

- Applies: no
- Reason: GitHub Markdown 템플릿 문서 변경이며 런타임 로직이 없다.
- Failing test first: not applicable
- Expected failure command/result: not applicable
- Pass command/result: Markdown/YAML 구조 검증과 하네스 검증으로 대체
- Refactor notes: not applicable

## Branch Checks / 브랜치 검증

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| Git diff whitespace | `git diff --check -- .github docs/workflows/docs/korean-github-templates` | pass | trailing whitespace 없음 |
| Issue template front matter | `ruby -ryaml -e 'Dir[".github/ISSUE_TEMPLATE/*.md"].sort.each { |f| s=File.read(f); y=s.split(/^---\\s*$/,3)[1]; YAML.safe_load(y, permitted_classes: [], aliases: false); puts "OK #{f}" }'` | pass | 4개 Issue 템플릿 YAML 파싱 통과 |
| unit/focused test | not applicable | skipped | 런타임 로직 변경 없음 |
| integration/contract test | not applicable | skipped | API/schema/contract 변경 없음 |
| build/typecheck | not applicable | skipped | 빌드 대상 코드 변경 없음 |
| harness validation | `scripts/validate-harness.sh` | pass | 하네스 기본 검증 통과 |
| strict harness validation | `scripts/validate-harness.sh --strict` | pass | in-progress mode에서 통과. ready-state Source of Truth proposal guard는 템플릿-only 변경과 맞지 않아 적용하지 않음 |

## CI/CD Gate / CI-CD 게이트

- CI required: GitHub PR checks
- CI result: pending until PR creation
- Deploy/publish required: no
- Deployment confirmation: not applicable
- Rollback/smoke notes: 템플릿 문서만 되돌리면 rollback 가능

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| unit/focused test | 런타임 로직 변경 없음 | not required |
| build/typecheck | 빌드 대상 코드 변경 없음 | not required |
| deploy smoke | 배포 변경 없음 | not required |
