# Job schedule management 보고서

## Short Report / 짧은 보고

- Type: feature
- Date: 2026-06-30
- Changed: Jobs 화면에 schedule-only edit를 추가했다. Silver Dataset과 Target Dataset draft에 `schedule.mode/note` metadata를 저장하고, Silver/Gold Job 카드에서 `Schedule 수정`을 제공한다. 생성 wizard 저장 성공 후 각 항목 첫 화면으로 복귀한다.
- Verified: backend focused tests 14개, frontend build, browser smoke에서 Silver/Gold schedule 저장, Gold `Run 준비` queued run 생성, External Connection 저장 후 첫 화면 복귀를 확인했다.
- Remaining: 실제 scheduler, cron backend, Source Sync Jobs, run backfill/retry는 제외 범위다.
- Next context: Jobs는 schedule/run 관리, Dataset edit flow는 source/recipe/schema definition 관리를 맡는다.
- Risk: `placeholder` schedule은 운영 의도 metadata이며 실제 Airflow/Spark/local runner trigger가 아니다.
