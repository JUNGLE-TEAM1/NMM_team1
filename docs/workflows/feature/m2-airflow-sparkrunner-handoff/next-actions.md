# M2 Airflow SparkRunner handoff 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: ready-for-review
- Summary: M2 SparkRunner handoff CLI가 추가되어 Airflow DAG task가 M2 runner를 실행하고 M5 `Week2AirflowAdapter`용 `week2_result` artifact를 남길 수 있다.

## Recommended Next Action / 권장 다음 행동

- PR을 생성하고 CI 결과를 확인한다.
- Reason: local focused test, contract validation, CLI smoke가 통과했으므로 remote gate를 확인할 단계다.

## Options / 선택지

1. PR 생성 후 CI를 확인한다.
2. M5 PR에서 Airflow DAG가 이 CLI를 호출하도록 연결한다.
3. 다음 M2 Phase로 Spark direct `s3a://` write 검토를 시작한다.
4. Product Health 5GB 입력과 M3 TransformSpec이 준비되면 같은 handoff shape로 scale evidence를 실행한다.

## Waiting On Human / 사람 응답 대기

- PR merge/finalize/cleanup은 사람 확인이 필요하다.

## Last User Choice / 마지막 사용자 선택

- 사용자는 M5 Airflow 통합 지원과 Spark direct S3 write를 차례로 진행하라고 지시했다. 이 workspace는 첫 번째 작업만 다룬다.

## Next AI Action / 다음 AI 행동

- option 1이면 branch push와 PR 생성을 진행한다.
- option 2이면 M5 PR 상태를 확인하고 필요한 호출 명령만 전달한다.
- option 3이면 새 M2 workspace를 만들어 Spark direct S3 write 검토를 시작한다.
- option 4이면 M1/M3 준비물 확인 후 별도 evidence Phase를 연다.
