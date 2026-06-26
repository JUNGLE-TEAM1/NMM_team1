# PR 템플릿 제목 drift guard 보강 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- 

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| PR 제목 정책 | 한국어 prefix 또는 한국어 설명을 요구하고 conventional/English-only 제목은 drift로 처리 | 사용자가 PR 제목을 한글로 보고 싶다고 명시했고, 팀원/수동 PR의 template bypass를 merge 전 감지해야 함 | user request / 2026-06-26 |
| closing keyword 판정 | 단순 `PR #N` 참조는 closing keyword 누락으로 보지 않고, linked issue가 명확한 경우에만 검사 | `#124`처럼 PR 번호 참고가 false positive가 되는 edge case 제거 | local audit / 2026-06-26 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| 기존 merged PR 원격 보정 | 이미 병합된 기록은 이 Hotfix에서 자동 수정하지 않음 | 하네스 guard 보강이 목적이고 remote record rewrite는 별도 사람 지시 필요 | user follow-up |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| PR 제목 정책 | 팀이 영어-only 제목 허용으로 되돌리기로 명시 결정 | `audit-github-records.sh` PR title rule과 docs/11 정책 수정 |
