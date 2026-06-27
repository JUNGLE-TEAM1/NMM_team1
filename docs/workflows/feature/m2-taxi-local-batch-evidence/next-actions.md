# M2 Taxi local batch evidence 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: ready-for-review
- Summary: Taxi local batch runner와 CLI가 구현되었고, local full-month evidence와 PR CI가 통과했다.

## Recommended Next Action / 권장 다음 행동

- PR #169를 merge한 뒤, 후속 PR에서 Taxi Gold 기간 필터와 품질 증거를 추가한다.
- Reason: local validation과 CI는 통과했다. 다만 `yellow_tripdata_2024-01.parquet` 안에 1월 밖 pickup 날짜 18행이 있어, 다음 단계에서는 Gold 결과를 2024년 1월 31행으로 만들고 제외 row를 품질 지표로 남기는 것이 설명하기 쉽다.

## Options / 선택지

1. PR #169를 merge하고 Taxi 품질 필터 follow-up issue/workspace를 연다.
2. PostgreSQL loader를 이 branch에 추가하지 않고 후속 issue로 분리한다.
3. MinIO/S3 또는 PySpark follow-up issue를 별도로 연다.
4. local evidence만 보류하고 PR을 merge하지 않는다.

## Waiting On Human / 사람 응답 대기

- PR #169 merge 여부.

## Last User Choice / 마지막 사용자 선택

- 사용자가 "그래 그렇게 하자"라고 지시해 Taxi local batch evidence Phase를 시작했다.

## Next AI Action / 다음 AI 행동

- option 1이면 PR #169 merge 후 main sync를 하고, Taxi Gold 기간 필터와 품질 증거를 별도 follow-up으로 시작한다.
- option 2 또는 3이면 새 follow-up issue/workspace를 만든다.
- option 4이면 `sync.md`에 merge deferral reason을 기록한다.

## Follow-up Context / 후속 구현 맥락

- Raw/Bronze 성격의 원본 Taxi Parquet은 받은 그대로 보존한다.
- Gold daily metrics에는 `expected_month=2024-01` 같은 기간 기준을 적용해 2024-01-01부터 2024-01-31까지 31행만 만든다.
- Gold에서 제외된 1월 밖 row는 삭제하지 않고 `out_of_period_rows=18` 같은 품질 지표로 남긴다.
- 이 처리는 데이터 품질 검사와 Gold 정제 경계에 속한다. Spark/S3/PostgreSQL 전환 전에 로컬 runner에서 먼저 계약을 고정하는 것이 좋다.
