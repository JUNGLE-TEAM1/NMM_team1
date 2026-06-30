# Runtime status surface decision 보고서

## Short Report / 짧은 보고

- Type: feature
- Date: 2026-06-30
- Changed: C-24를 `/runs` runtime panel 복구에서 runtime status surface decision으로 변경했다. `/runs`는 compact common run log로 유지하고, Airflow/Spark/Kafka readiness는 별도 진단/운영 상태 surface 후보로 분리했다. 기존 `runs-runtime-panel-restore` workspace는 삭제하지 않고 superseded로 표시했다.
- Verified: `docs/08-development-workflow.md`의 C-24~C-31 순서와 범위 원칙을 확인했다. `dataset-management-actions`의 browser smoke evidence에서 `/runs` compact UI와 runtime panel 미노출을 확인했다.
- Remaining: 실제 Connection/Silver run persistence와 runtime connector/materialization은 C-25 이후 Phase에서 진행한다.
- Risk: runtime readiness evidence가 필요한 경우 `/runs`가 아니라 별도 surface를 추가해야 한다.
