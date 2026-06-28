# M1 post-merge readiness smoke 품질 게이트

이 파일은 이 branch의 TDD, check, CI/CD 증거를 기록한다.

- Quality gate status: draft

## TDD Plan / TDD 계획

- Applies: no, unless the smoke exposes a functional regression that requires code changes
- Reason: 이번 Phase의 기본 목적은 최신 main 기준 M1 browser/manual verification과 문서 상태 정리다. UI 또는 backend logic을 바꾸지 않는다면 TDD를 적용하지 않는다.
- Failing test first: not applicable at Phase creation
- Expected failure command/result: not applicable at Phase creation
- Pass command/result: pending
- Refactor notes: pending

## Branch Checks / 브랜치 검증

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| lint | not planned | pending | smoke/document Phase라 필요 시에만 실행한다. |
| unit/focused test | not planned | pending | smoke 결과가 code fix로 이어질 때 focused test를 선택한다. |
| integration/contract test | browser smoke `/query` | pending | Product Health readiness/CTA/route trace 확인 예정. |
| build/typecheck | `cd frontend && npm run build` | pending | M1 화면 회귀 확인용. |
| harness validation | `scripts/validate-harness.sh` |  |  |
| strict harness validation | `scripts/validate-harness.sh --strict` |  |  |

## CI/CD Gate / CI-CD 게이트

- CI required: yes if this Phase creates a PR
- CI result: 
- Deploy/publish required: no
- Deployment confirmation: 
- Rollback/smoke notes: 

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| TDD | 기본 범위가 최신 main browser smoke와 문서 정리이므로 code behavior 변경 전까지 TDD 대상이 아니다. | AI 기록 |
