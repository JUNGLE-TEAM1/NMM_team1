# M5 Runner Selection Catalog Guard 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- 별도 후보 비교는 생략했다. 이번 Phase는 기존 Week2 ver2 runner boundary를 따르고, slice 운영 방식을 가볍게 조정하는 낮은 위험의 guard/hardening 작업이다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| Slice 운영 방식 | 한 Phase workspace 안에서 여러 slice를 focused code/test loop로 처리 | slice마다 branch/workspace/full validation/report를 반복하면 작업 시간과 토큰 사용이 커진다. | 사용자 확인, 2026-06-26 |
| Unknown executor guard | supported executor를 `local_runner`, `airflow`로 제한하고 그 외 값은 run 생성 전 거부 | future `spark`/`spark_runner` 또는 typo 값이 Airflow fallback으로 조용히 흘러가면 실제 실행자를 착각할 수 있다. | Slice 2/5, 2026-06-26 |
| GitHub issue 생성 | 이번 local branch workspace에서는 skipped | `scripts/start-workflow.sh`가 `feature/...` ref 충돌로 실패했고, 현재 main divergence가 있어 원격 운영 변경을 피한다. | Start confirmation, 2026-06-26 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| 실제 Airflow 연결 | 현재는 adapter boundary와 fallback만 있으며 URL/auth/DAG/polling 계약이 준비되지 않음 | Airflow runtime과 trigger/status polling contract가 준비될 때 | M5 external Airflow trigger follow-up |
| 실제 SparkRunner 연결 | M2 SparkRunner smoke가 별도 workstream이며 M5는 guard/defer 기준만 다룸 | M2 `SparkRunner`가 `Week2RunnerResult` 호환 metrics를 반환할 때 | M5/M2 runner integration follow-up |
| M3 TransformSpec adapter 연결 | M3 JSON TransformSpec output이 아직 M5 runner input으로 준비되지 않음 | M3 JSON TransformSpec fixture/test가 준비될 때 | M5/M3 runner adapter follow-up |
| PR-ready sync strategy | local branch가 diverged local `main`에서 시작됨 | 사용자가 pull/merge/rebase 전략을 선택할 때 | Pre-Merge Sync |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| Unknown executor guard | actual SparkRunner가 M5에 연결되어 `spark_runner`가 supported executor가 되는 경우 | `SUPPORTED_EXECUTORS`, API schema, tests, `contracts/runtime_config.sample.json` 소비 경로를 함께 갱신 |
| Local-only focused validation | PR-ready sync 후 upstream 변경이 M5/API/test boundary와 충돌하는 경우 | focused tests 재실행 후 필요 시 broader backend/harness validation 실행 |
