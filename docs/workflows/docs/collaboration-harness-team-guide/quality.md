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
| markdown artifact search | `rg -n "AskLake 협업 하네스 사용 가이드|3분 요약|작업 문맥을 저장|문맥을 저장해서 협업 책임|저장된 문맥|스코프 이해 책임|사람은 자기 스코프를 이해|문맥 충분성 확인 책임|작업 문맥 초안|다음 사람이 오해 없이|크게 터질 문제를 앞에서 작게|이 하네스를 쓰면 좋아지는 것|팀이 길을 덜 잃습니다|협업 안전장치|AI 설명이 애매하면 다시 묻는다|공유 문맥 정렬 책임|AI는 판단 재료를 정리한다|모르면 묻는 것도 책임|한 번에 여러 일을 섞지 않고|코드 변경만 보고는 작업 범위|팀의 공식 기준|PR 생성은 공유이고, merge는 별도 승인|하네스를 쓰는 팀원의 5가지 책임|맡은 기능을 구현한다|왜 그렇게 구현했는지 설명할 수 있다|인터페이스를 지킨다|AI는 손과 기록 담당이다|하네스를 사용할 때 사람의 책임과 AI의 책임|AI는 책임을 대신 지지 않는다|Pre-PR Human Checkpoint|팀원이 기억할 최소 규칙" docs/reports/collaboration-harness-team-usage-guide.md docs/reports/README.md` | passed | 문서 제목, 3분 요약, 문맥 저장 핵심 기능, 스코프 이해 책임, 문맥 충분성 확인 책임, 하네스 사용 이점, 공유 문맥 정렬 책임, 관리 항목별 이유 문단, 팀원의 5가지 책임, 책임 경계 보강 섹션, 핵심 섹션, index link 확인 |
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
