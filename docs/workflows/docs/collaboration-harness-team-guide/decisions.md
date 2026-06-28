# 협업 하네스 팀 사용 가이드 결정 기록

이 파일은 고영향 선택과 그 결과를 기록한다.
후보 비교가 필요한 선택은 `docs/14-decision-option-brief.md` 형식을 사용한다.

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- 

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| 문서 위치 | `docs/reports/collaboration-harness-team-usage-guide.md` | 기존 협업 하네스 초보자 guide가 `docs/reports/`에 있고, 이번 산출물도 팀 온보딩/학습 evidence 성격이다. Source of Truth 규칙 자체를 바꾸지 않는다. | user request / 2026-06-28 |
| 작업 분리 방식 | 별도 clean worktree + `docs/collaboration-harness-team-guide` branch | 현재 기본 worktree에 다른 Phase 변경이 열려 있어 PR 범위 혼합을 피한다. | AI / 2026-06-28 |
| 검증 범위 | docs/harness validation only | runtime code, API, data, deploy 변경이 없으므로 code build/test는 생략하고 이유를 기록한다. | AI / 2026-06-28 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| Source of Truth 정식 반영 | 이번 문서는 학습/온보딩 guide이며 workflow 규칙 변경이 아니다. | 팀이 이 guide를 공식 운영 규칙으로 승격하기로 결정할 때 | 별도 docs/workflow Phase |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| 문서 위치 | 팀이 `docs/reports/`가 아닌 Source of Truth 또는 onboarding folder를 원할 때 | 새 docs Phase에서 이동/링크 정책을 결정한다. |
