# M6 answer evidence grounding 품질 게이트

이 파일은 이 branch의 TDD, check, CI/CD 증거를 기록한다.

- Quality gate status: passed

## TDD Plan / TDD 계획

- Applies: yes
- Reason: M6 응답 contract와 evidence grounding core logic을 바꾸는 regression 위험 변경이다.
- Failing test first: `AIQueryResult.evidence`가 schema/metric/lineage/retrieval terms를 포함하고 summary가 catalog evidence를 언급하는지 먼저 테스트한다.
- Expected failure command/result: `PYTHONPATH=backend /private/tmp/nmm_team1_m6_adapter_py314_venv/bin/python -m pytest backend/tests/test_week2_ai_query.py -q` -> expected failure, `KeyError: 'schema_fields'`
- Pass command/result: `PYTHONPATH=backend /private/tmp/nmm_team1_m6_adapter_py314_venv/bin/python -m pytest backend/tests/test_week2_ai_query.py -q` -> `8 passed`
- Refactor notes: `QueryEvidence` optional grounding fields를 추가하고 `Week2AIQueryService`의 summary assembly를 evidence 기반 helper로 분리했다.

## Branch Checks / 브랜치 검증

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| lint | `git diff --check` | passed | whitespace diff 문제 없음 |
| unit/focused test | `PYTHONPATH=backend /private/tmp/nmm_team1_m6_adapter_py314_venv/bin/python -m pytest backend/tests/test_week2_ai_query.py -q` | passed | `8 passed` |
| integration/contract test | `PYTHONPATH=backend /private/tmp/nmm_team1_m6_adapter_py314_venv/bin/python -m pytest backend/tests -q`; `jq -e . contracts/*.sample.json >/dev/null` | passed | `45 passed` after latest `origin/main` merge; sample JSON parse passed |
| build/typecheck | `/private/tmp/nmm_team1_m6_adapter_py314_venv/bin/python -m compileall backend/app` | passed | backend app compileall passed |
| harness validation | `scripts/validate-harness.sh` | passed | Harness validation passed |
| strict harness validation | `scripts/validate-harness.sh --strict` | passed | Harness validation passed |

## CI/CD Gate / CI-CD 게이트

- CI required: yes, PR 생성 후 GitHub checks 확인
- CI result: local equivalent passed; remote CI reruns after latest-main merge push
- Deploy/publish required: no
- Deployment confirmation: n/a
- Rollback/smoke notes: n/a

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| frontend build | 이번 Phase는 backend M6 response contract와 fixture 문서만 변경했고 frontend files는 수정하지 않았다. | n/a |
