# M5 demo cockpit UI 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- not needed

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| M5 데모 위치 | 기존 `/etl` 화면을 M5 Demo Cockpit으로 승격 | 기존 M1 live UI 계획이 `/runs`에서 M5 workflow 실행을 소비하도록 정했고, 발표/학습 경로를 새 route보다 덜 흔들 수 있다. | user request / 2026-06-27 |
| UI 학습 방식 | 결과값 옆에 의미와 출처를 같이 표시 | 사용자가 결과 확인뿐 아니라 충분한 이해를 원했으므로 KPI, task, output, Catalog, raw JSON을 한 화면에 묶는 방식이 맞다. | user request / 2026-06-27 |
| AI 도우미 기본 상태 | 기본 닫힘 | 데모 학습 화면 오른쪽을 가려 핵심 evidence 확인을 방해한다. 필요 시 topbar에서 열 수 있다. | implementation / 2026-06-27 |
| M5 local/demo PR 범위 | Airflow smoke와 M5 demo cockpit UI를 combined M5 local/demo PR 후보로 함께 정리 | UI는 Airflow/local runner 실행 evidence를 학습/시연하는 표면이고, 현재 branch가 이미 M5 Airflow smoke 변경을 포함하므로 이번 마감에서는 함께 리뷰하는 편이 가장 작다. | user, 2026-06-27 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| Airflow executor full browser smoke | Docker/Airflow runtime은 M5 Airflow smoke branch에서 별도 검증했고, 이번 UI 변경은 frontend learning surface가 주목표다. | Airflow local demo를 발표 전에 다시 시연할 때 | M5 Airflow smoke 또는 demo rehearsal |
| clean branch 분리 | combined M5 local/demo PR 후보로 진행한다. | PR 리뷰에서 분리를 요청하거나 diff size gate가 막을 때 | follow-up branch hygiene |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| `/etl`을 M5 demo cockpit으로 사용 | M1/M6 통합 발표 흐름에서 `/etl`이 다른 의미로 필요해질 때 | `/m5-demo` alias 또는 별도 route로 분리 |
| `fallback_succeeded` 설명 | backend status semantics가 `succeeded`로 바뀌거나 Airflow/local fallback status가 분리될 때 | result interpretation 문구와 badge logic 업데이트 |
