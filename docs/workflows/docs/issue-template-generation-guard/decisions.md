# 이슈 템플릿 생성 경로 보강 결정 기록

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- not needed

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| 자동 생성 issue 제목 처리 | type별 한국어 prefix만 붙이고 사람이 넘긴 제목 내용은 번역하지 않음 | branch/workspace 제목은 고유명사와 code identifier를 포함할 수 있으므로 강제 번역은 위험함 | user request / 2026-06-25 |
| test type label | label을 붙이지 않고 `[검증]` prefix만 사용 | 기존 label 정책에 적절한 test label이 없으며 새 remote label 생성은 이번 범위 밖 | Codex / 2026-06-25 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| 기존 remote issue/PR 보정 | 하네스 보강 이후 별도 작업으로 진행 | 사용자 지시: "지금 올라온 것들 수정은 하네스 보강끝내고 하자" | follow-up remote cleanup |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| issue title/body/label 생성 규칙 | 실제 팀 운영에서 불편하거나 labels가 없어서 issue creation이 실패하면 | label 매핑 또는 prefix 정책 재검토 |
