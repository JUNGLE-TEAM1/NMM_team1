# Target dataset run handoff 다음 행동 메뉴

1. Recommended: C-4 PR을 review/merge한 뒤 C-5 `feature/runtime-evidence-integration`에서 M2/M4 runtime evidence를 run output evidence로 정렬한다.
2. Alternative: PR review에서 TargetDatasetRun shape 보강이 필요하면 C-4 안에서 `execution_result.target_dataset_handoff` 필드를 보정한다.
3. Stop: Airflow production deployment나 Spark/Kafka 실제 runtime 보강 요구가 생기면 C-5 이후 별도 Phase로 분리한다.
