# Manual Run Scheduler Boundary 계획

## Phase

- ID: C-51
- Branch/work location: `feature/manual-run-scheduler-boundary`
- Current integration branch: `feature/data-lake-runtime-stack`

## 목표

수동 실행, schedule metadata, 실제 scheduler 미구현 상태를 UI/API/문서에서 일관되게 분리한다.

## 범위

- Jobs/Run UI 문구에서 `manual`은 사람이 실행 버튼을 누르는 동작임을 명확히 한다.
- `placeholder` schedule은 metadata 의도만 저장하며 자동 실행이 아님을 표시한다.
- schedule 수정이 Run 생성, execute, Airflow/Spark trigger, output path 생성으로 이어지지 않음을 테스트한다.
- 수동 실행은 실제 execute endpoint와 lake output evidence가 생기는 경로로 표시한다.

## 제외 범위

- cron worker, APScheduler, Airflow DAG trigger, Spark job submit 구현.
- retry/backfill/status polling 운영화.
- C-49/C-50의 lake output/Catalog handoff 구현.

## 구현 프롬프트

```text
@AGENTS.md @docs/03-interface-reference.md @docs/05-acceptance-scenarios-and-checklist.md @docs/06-regression-and-failure-scenarios.md @docs/07-manual-verification-playbook.md @docs/08-development-workflow.md

Implement C-51 only.
Clarify UI/API wording and tests so manual run means an explicit execute action, while schedule placeholder is metadata only.
Verify that editing schedule does not create or execute runs, does not trigger Airflow/Spark, and does not create lake output.
Keep the existing execute endpoint as the only manual run path.
Do not implement real scheduler registration, cron worker, Airflow DAG trigger, Spark submit, retry, or backfill in this Phase.
```

## 검증 프롬프트

```text
@AGENTS.md @docs/05-acceptance-scenarios-and-checklist.md @docs/06-regression-and-failure-scenarios.md @docs/07-manual-verification-playbook.md

Verify C-51 only.
Run focused tests proving schedule updates are metadata-only and manual execute is the only path that creates output evidence.
Run frontend build and browser smoke for Jobs/Runs wording if available.
Record remaining runtime orchestration gaps separately.
```

## Acceptance Criteria

- schedule 저장만으로 Run이 생성되거나 실행되지 않는다.
- manual execute 후에만 output evidence가 생긴다.
- UI가 schedule placeholder를 scheduler 성공처럼 표현하지 않는다.
- Airflow/Spark readiness-only 경계가 유지된다.

## Regression / Failure Scenario

- schedule update가 run count/output artifact를 바꾸면 실패다.
- placeholder schedule이 cron 등록 또는 DAG trigger 성공처럼 보이면 실패다.
- manual execute 버튼 없이 자동으로 lake output이 생긴 것처럼 보이면 실패다.
