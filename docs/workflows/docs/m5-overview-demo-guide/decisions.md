# M5 Overview Demo Guide 결정 기록

## Status

- Decision status: accepted

## Decision Option Briefs

- no high-impact option brief required; docs-only guide location and link updates are low risk.

## Accepted Decisions / 확정된 결정

| Decision | Selected option | Reason | Date |
| --- | --- | --- | --- |
| 문서 위치 | `docs/project-context/asklake-week2-module-plan/ver2/m5-overview-demo-guide.md` | M5 책임 분리 ver2 문맥과 코드 설명을 함께 다루는 guide라 project-context ver2가 가장 찾기 쉽다. | 2026-06-29 |
| 설명 깊이 | overview + 함수/파일 지도 | 사용자가 직접 책임지고 설명해야 하므로 화면 설명에서 시작하되 code path까지 내려간다. | 2026-06-29 |
| product-health 포함 방식 | 보조 데모 경로로 포함 | `/etl`은 기본 학습용, product-health standalone page는 Airflow/Catalog 발표 보강용으로 분리해 설명한다. | 2026-06-29 |

## Deferred Decisions / 보류한 결정

| Decision | Reason | Revisit trigger | Target branch/phase |
| --- | --- | --- | --- |
| 새 M5 demo page 구현 | 이미 `/etl`과 `product-health-airflow-demo.html`가 있어 이번 요청은 문서화가 목적이다. | 사용자가 새 화면 구현을 명시적으로 요청할 때 | future M5 UI polish |

## Revisit / Rollback Conditions

- 사용자가 실제 리허설에서 특정 함수/화면 설명이 부족하다고 하면 해당 섹션을 보강한다.
- M5 API/status contract가 바뀌면 guide의 status 해석과 code path를 갱신한다.
