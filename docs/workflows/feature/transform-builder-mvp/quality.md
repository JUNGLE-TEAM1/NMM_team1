# Transform Builder MVP 품질 게이트

이 파일은 이 branch의 TDD, check, CI/CD 증거를 기록한다.

- Quality gate status: passed

## TDD Plan / TDD 계획

- Applies: partial
- Reason: backend API/schema는 자유 dict `process_rule` 저장 경계를 유지하고, 이번 변경은 frontend builder UI와 저장 payload 조립이 중심이다. 기존 backend focused tests로 regression을 보호하고 frontend build로 JSX/CSS를 검증했다.
- Failing test first: not applied
- Expected failure command/result: n/a
- Pass command/result: `PYTHONPATH=backend pytest backend/tests/test_target_dataset_job_draft.py backend/tests/test_product_health_processing_template.py` passed, `npm run build` passed, `scripts/validate-harness.sh --strict` passed, local browser 처리 계획/실행 방식 smoke passed
- Refactor notes: M3 template 원본 `steps[]`는 유지하고, Source role mapping과 review/locked 상태는 `builder_config`에 분리 저장한다.

## Branch Checks / 브랜치 검증

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| frontend build | `cd frontend && npm run build` | passed | Vite production build succeeded |
| backend focused test | `PYTHONPATH=backend pytest backend/tests/test_target_dataset_job_draft.py backend/tests/test_product_health_processing_template.py` | passed | 7 passed |
| local frontend smoke | `curl -I -fsS http://127.0.0.1:13000/dataset \| head -n 1` | passed | `HTTP/1.1 200 OK` |
| local browser 처리 계획 smoke | in-app browser `http://127.0.0.1:13000/dataset` Target wizard | passed | one Source Dataset enables next step, recommended template shows auto-configured Gold Target, `고급 설정 보기`, quality rules, final Gold output; per-column mapping editor is hidden by default |
| local browser 실행 방식 smoke | in-app browser `http://127.0.0.1:13000/dataset` Target wizard | passed | Run Mode copy shows `수동 실행`/`예약 실행 준비 중`; no demo/smoke/schedule-note wording in the visible step |
| diff whitespace | `git diff --check` | passed | no output |
| harness validation | `scripts/validate-harness.sh` | passed | Harness validation passed |
| strict harness validation | `scripts/validate-harness.sh --strict` | passed | Harness validation passed |

## CI/CD Gate / CI-CD 게이트

- CI required: yes
- CI result: local pending, GitHub PR checks after push
- Deploy/publish required: no
- Deployment confirmation: n/a
- Rollback/smoke notes: UI/metadata-only change. Revert branch to restore previous M3 step list view.

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| full backend test | focused Target Dataset/Product Health template tests cover impacted backend path; full suite left to CI for speed | no |
| browser click-through save | 처리 계획 screen was verified locally, but save was skipped because local source data uses one temporary taxi source for four Product Health roles | no |
