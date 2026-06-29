# M5 direct spark_runner 제거 Hotfix notes

- 2026-06-29: 사용자 요청으로 M5 API의 direct `spark_runner` executor를 제거한다.
- 혼동 원인: `airflow`, `spark_runner`가 같은 executor 층에 있어 Airflow와 Spark가 경쟁 실행자처럼 보였다.
- 결정: M5 API는 `local_runner`와 `airflow`만 받는다. Spark는 M2 runtime smoke로 남기고, 실제 결합은 Airflow DAG 내부 task 또는 별도 orchestrated integration에서 다룬다.
- 기존 dirty worktree 보호를 위해 `/private/tmp/nmm-fix-287` 별도 worktree에서 작업했다.
