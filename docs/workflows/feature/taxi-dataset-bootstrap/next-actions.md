# M2 taxi dataset bootstrap 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: contract assumptions accepted
- Summary: M2는 `yellow_tripdata_2024-01.parquet`, `taxi_trips`, `gold_taxi_daily_metrics`, `demo=10,000 rows`, `fixed=pickup_date 2024-01-01` 기준으로 진행한다.

## Recommended Next Action / 권장 다음 행동

- confirmation gate와 PR 준비 상태를 정리한다.
- Reason: 계약 질문은 blocking gate가 아니라 M2 기본 가정으로 처리하기로 했고, 이제 PR handoff에 필요한 confirmation/pre-merge만 남았다.

## Options / 선택지

1. confirmation gate를 정리하고 현재 branch를 PR 준비 상태로 만든다.
2. pre-merge sync 방식을 사람 확인 후 기록한다.
3. PR 생성 전 최종 검증을 실행한다.
4. 이 workspace를 멈춘다.

## Waiting On Human / 사람 응답 대기

- 다음 작업으로 1번을 권장한다.

## Last User Choice / 마지막 사용자 선택

- `yellow_tripdata_2024-01.parquet`로 로컬에서 작게 시작하되, 전체 Taxi dataset 적재 목표는 별도 scale target으로 분리한다.
- PostgreSQL table은 `taxi_trips`, 첫 Gold dataset은 `gold_taxi_daily_metrics`로 둔다.
- `demo=10,000 rows`, `fixed=pickup_date 2024-01-01`로 둔다.
- M5 계약 질문은 현재 PR을 막지 않고 M2 기본 가정으로 진행한다.

## Next AI Action / 다음 AI 행동

- option 1이면 `confirmations.md`, `report.md`, `quality.md`를 현재 결정에 맞춰 정리한다.
- option 2이면 `sync.md`에 pre-merge sync 결과 또는 보류 사유를 기록한다.
- option 3이면 `scripts/status-workflow.sh`, harness validation, strict validation을 실행하고 Pre-PR checkpoint로 간다.
- option 4이면 pause reason을 `notes.md`에 기록한다.
