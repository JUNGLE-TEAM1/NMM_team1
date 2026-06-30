# Job schedule management 보고서

## Short Report / 짧은 보고

- Type: feature
- Date: 2026-06-30
- Changed: Silver Transform Job과 Gold Build Job에서 `Schedule 수정`으로 `schedule.mode/note`만 저장하도록 API/store/UI를 추가했다. Dataset definition edit는 Dataset 화면으로 분리 안내하고, 생성 wizard 저장 성공 후 각 항목 첫 화면으로 복귀하게 했다.
- Verified: backend focused tests 14개, frontend build, browser smoke에서 Silver/Gold schedule 저장, Gold `Run 준비` queued run 생성, External Connection 저장 후 첫 화면 복귀를 확인했다.
- Remaining: 실제 scheduler, cron backend, Source Sync Jobs, full definition edit는 제외 범위로 남겼다.
- Next context: Jobs는 schedule/run 관리로 제한하고 full definition edit는 Dataset edit flow에서 다룬다.
- Risk: schedule placeholder는 metadata-only이며 실제 Airflow/Spark/local runner trigger가 아니다.
