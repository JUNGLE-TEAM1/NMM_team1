# Big dataset manipulation context alignment 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- 사용자가 프로젝트 목표인 “빅데이터셋의 조작” 문맥 반영을 요청했으므로 별도 후보 비교 없이 Source of Truth 보강으로 처리했다.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| 제품 문맥 | 대용량/복합 데이터셋 조작·가공을 핵심 가치로 명시 | 기존 기술 계획에는 있었지만 제품 서사에서 약했기 때문 | 사용자 요청 / 2026-06-25 |
| 구현 범위 | 문서 의미 보강만 수행 | 코드/API/schema 변경 없이 Source of Truth drift만 줄이기 위해 | 이번 Phase / 2026-06-25 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| production-grade distributed processing | 이번 작업은 문서 문맥 보강이며 runtime 구현 범위가 아니다. | Spark/Flink/Trino/Athena 또는 cloud scale benchmark를 실제 도입할 때 | 별도 Architecture/Implementation Phase |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| 대용량/복합 데이터셋 문맥 | 후속 구현이 처리 증거 없이 완료로 표시되는 경우 | acceptance/regression/manual verification을 먼저 갱신한다. |
