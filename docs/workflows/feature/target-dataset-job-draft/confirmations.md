# Target dataset job draft 사람 확인 게이트

- Scope Confirm: C-3은 Target Dataset metadata와 ETL job definition draft 저장만 담당한다.
- Contract Confirm: `TargetDataset.job_definition`은 C-4 handoff 입력으로 사용 가능하게 source/process/schedule/schema를 포함한다.
- Sync Confirm: `75ba2b23` C-2 merge commit 이후 `origin/main` 기준 branch에서 진행했다.
- Human Checkpoint: PR 생성 뒤 merge/finalize/cleanup은 사람 확인 전에는 실행하지 않는다.
