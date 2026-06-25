# M2 taxi dataset bootstrap 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: ready for PR handoff
- Summary: M2 Taxi dataset bootstrap 문서/계약 기준 정리가 끝났고, 최신 `origin/main` merge와 검증까지 완료했다.

## Recommended Next Action / 권장 다음 행동

- Pre-PR Human Checkpoint에서 PR 생성 여부를 선택한다.
- Reason: 이 branch는 구현이 아니라 bootstrap 문서 PR이며, push/PR 생성은 사람 승인 후에만 실행한다.

## Options / 선택지

1. PR 생성: branch push 후 draft PR을 만든다.
2. 로컬 보류: PR을 만들지 않고 재개 조건만 남긴다.
3. 추가 보강: PR 전에 문서 문구나 계약 naming을 더 다듬는다.
4. 후속 구현 branch 준비: 현재 PR을 먼저 올릴지 보류할지 결정한 뒤 진행한다.

## Waiting On Human / 사람 응답 대기

- 다음 작업으로 1번을 권장한다.

## Last User Choice / 마지막 사용자 선택

- `yellow_tripdata_2024-01.parquet`로 로컬에서 작게 시작하되, 전체 Taxi dataset 적재 목표는 별도 scale target으로 분리한다.
- PostgreSQL table은 `taxi_trips`, 첫 Gold dataset은 `gold_taxi_daily_metrics`로 둔다.
- `demo=10,000 rows`, `fixed=pickup_date 2024-01-01`로 둔다.
- M5 계약 질문은 현재 PR을 막지 않고 M2 기본 가정으로 진행한다.
- 최신 `origin/main`을 merge했고 충돌은 없었다.

## Next AI Action / 다음 AI 행동

- option 1이면 `scripts/prepare-pr.sh --check-pr-sync` 후 승인된 push/PR 절차로 간다.
- option 2이면 `sync.md`와 `next-actions.md`에 보류 사유와 재개 조건을 기록한다.
- option 3이면 보강 범위가 현재 branch 안인지 확인하고 필요한 문서만 수정한다.
- option 4이면 현재 branch PR 생성 여부를 먼저 정한 뒤 새 구현 workspace를 만든다.
