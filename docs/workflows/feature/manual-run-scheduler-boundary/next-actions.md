# Manual Run Scheduler Boundary next actions

## Recommended

1. Full Browser Demo Smoke를 진행한다.

Reason: C-49~C-51로 lake output, Catalog/AI Query handoff, manual/schedule boundary가 닫혔다. 다음은 실제 브라우저 클릭 흐름 전체에서 데모가 자연스럽게 이어지는지 확인한다.

## Watch

- schedule placeholder가 자동 실행, cron 등록, Airflow/Spark 성공처럼 보이면 C-51 회귀다.
- full smoke에서는 manual run 버튼을 누르기 전에는 output evidence가 없어야 하고, execute 후에만 lake output evidence가 생기는지 본다.
