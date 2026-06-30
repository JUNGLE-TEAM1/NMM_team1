# Target Dataset run handoff decisions

- 기존 `pipeline_runs`는 legacy pipeline 전용이므로 C-4는 `target_dataset_job_runs`를 별도 테이블로 둔다.
- run record는 조회 화면을 위해 Target Dataset draft 핵심 요약을 복사 저장한다.
