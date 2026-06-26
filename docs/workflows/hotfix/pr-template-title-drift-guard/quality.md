# PR 템플릿 제목 drift guard 보강 품질 게이트

이 파일은 이 branch의 TDD, check, CI/CD 증거를 기록한다.

- Quality gate status: passed

## TDD Plan / TDD 계획

- Applies: yes
- Reason: 하네스 동작 변경이므로 fixture regression으로 정책을 고정한다.
- Failing test first: `scripts/test-harness.sh`에 prefix 없는 PR 제목 drift, PR 번호 단순 참조 오탐 방지, record drift PR-ready 차단 fixture 추가
- Expected failure command/result: 구현 전에는 prefix 없는 제목 통과, `PR #105` 단순 참조 closing keyword 오탐, drift 상태의 `PR checklist ready: yes` 문제가 재현됨
- Pass command/result: `scripts/test-harness.sh` -> `Harness regression tests passed: 31`
- Refactor notes: fake `gh` fixture를 보강해 record drift 상태를 live GitHub 과거 기록에 의존하지 않고 검증한다.

## Branch Checks / 브랜치 검증

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| shell syntax | `bash -n scripts/prepare-pr.sh scripts/audit-github-records.sh scripts/status-workflow.sh scripts/test-harness.sh scripts/validate-harness.sh` | passed | shell script syntax 확인 |
| harness regression | `scripts/test-harness.sh` | passed | `Harness regression tests passed: 31` |
| live read-only audit | `scripts/audit-github-records.sh --pr 127 --pr 126 --pr 125 --pr 124 --pr 123 --pr 122 --pr 121 --pr 120 --pr 119 --pr 118 --pr 117 --pr 116 --pr 115 --pr 114 --pr 113 --pr 110` | passed | 최근 PR 제목 prefix와 7섹션 본문 audit 통과 |
| status smoke | `scripts/status-workflow.sh docs/workflows/docs/main-backup-tag-script`; `scripts/status-workflow.sh docs/workflows/docs/week2-m3-json-main-path-decision` | passed | `#123` workspace는 `PR checklist ready: no (record drift)`, `#124` workspace는 drift audit passed |
| diff whitespace | `git diff --check` | passed | whitespace 오류 없음 |
| harness validation | `scripts/validate-harness.sh` | passed | Harness validation passed |
| strict harness validation | `scripts/validate-harness.sh --strict` | passed | Harness validation passed |

## CI/CD Gate / CI-CD 게이트

- CI required: yes
- CI result: PR #127 `container-smoke`, `harness`, `manifest-smoke` passed
- Deploy/publish required: no
- Deployment confirmation: 
- Rollback/smoke notes: 

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| none | 모든 필수 local harness 검증 수행 | n/a |
