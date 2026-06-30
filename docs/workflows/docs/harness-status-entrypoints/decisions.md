# Harness status entrypoints 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- 

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| 하네스 개선 범위 | 상태 확인 entrypoint와 evidence reading ladder만 추가 | 구조화 메타데이터 분리나 script 모듈화는 별도 Phase가 필요한 큰 변경이기 때문 | AI scope interpretation / 2026-06-28 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| workspace 상태 YAML/JSON 분리 | 이번 요청에서 문서 안내 보강을 먼저 완료하기 위해 보류 | Markdown 문자열 검증 취약성을 실제로 줄이는 Phase를 열 때 | 별도 docs 또는 chore Phase |
| harness script 모듈화 | shell script 책임 분리는 테스트 변경을 동반하는 큰 작업이라 보류 | `validate-harness.sh` 또는 `test-harness.sh` 변경 요청 시 | 별도 chore Phase |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| 상태 확인 entrypoint 안내 | 실제 status script 출력과 문서 안내가 어긋나면 | `docs/workflows/README.md`와 관련 status script를 함께 재검토 |
