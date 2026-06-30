# M5 Overview Demo Guide 보고서

## Short Report / 짧은 보고

- Type: docs
- Branch/work location: `feat-#268`, `docs/workflows/docs/m5-overview-demo-guide`
- Date: 2026-06-29
- Workspace state: ready-for-review
- Context Budget mode: Escalate Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/15-context-budget-rule.md`, Week2 ver2 README, existing M5 learning guide, M5 reports.
- Escalated context read: `docs/03`, `docs/05`, `docs/06`, `docs/07`, `/etl` frontend code, product-health standalone page, M5 backend service/runner/adapter/store files, focused tests.
- Context omitted intentionally: unrelated M1/M2/M3/M4/M6 implementation internals, production deploy/AWS, all historical reports.
- Changed: M5 overview demo guide를 추가했고, ver2 README/manual guide/report index/workspace evidence에 연결했다.
- Verified: M5 guide keyword check, link presence check, `git diff --check`, `scripts/validate-harness.sh --strict` passed.
- Remaining: 사용자가 실제 `/etl` 화면을 보며 말로 리허설한 결과는 아직 기록하지 않았다.
- Next context: 막히는 질문이 생기면 `m5-overview-demo-guide.md`의 코드 질문 표를 출발점으로 함수별 설명을 보강한다.
- Risk: docs-only 변경이다. runtime behavior는 바꾸지 않았다.

## Regression Guard / 회귀 보호

- Checked feature: M5 Airflow fallback/status interpretation, successful-only Catalog update, product-health DAG/Catalog lineage.
- Protected behavior: Airflow fallback을 Airflow 성공으로 설명하지 않고, 실패 run이 latest Catalog를 덮지 않는 기준을 guide에 포함했다.
- Result: documentation aligned with `docs/06` and focused tests.

## Manual Verification / 수동 검증

- Document executed: `docs/07-manual-verification-playbook.md` 관련 M5 섹션 확인, `docs/manual-verification/09-m5-demo-cockpit-learning-guide.md` link update.
- Environment: docs-only review.
- Result: `/etl` 기본 데모와 `frontend/product-health-airflow-demo.html` 보조 데모를 guide에 연결했다.
- Failure/limitation: browser smoke는 실행하지 않았다. UI/runtime code 변경이 없어 기존 M5 UI evidence를 참조했다.

## Final Judgment / 최종 판단

- Done: yes, docs guide scope.
- Remaining risk: 실제 발표 리허설에서 새 질문이 나오면 Q&A 보강이 필요할 수 있다.
