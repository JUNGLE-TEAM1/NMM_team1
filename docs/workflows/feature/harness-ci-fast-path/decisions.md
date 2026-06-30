# 하네스 CI Fast Path와 Local Complete Gate 보강 결정 기록

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- not needed: 사용자가 통합 보강 프롬프트 반영을 요청했고, 위험한 원격 설정 변경은 범위 제외로 둠.

## Accepted Decisions / 확정된 결정

| Decision | Selected Option | Reason | Confirmed By / At |
| --- | --- | --- | --- |
| CI 경량화 방식 | required job 이름 유지 + 내부 path filter | branch protection pending 리스크를 줄이고 remote 설정 변경 없이 효과를 냄 | user request / 2026-06-30 |
| 운영 경량화 방식 | Fast Path + Local Complete Gate를 기존 Phase Workflow에 추가 | 기존 안전장치를 폐기하지 않고 작은 변경만 빠르게 처리 | user request / 2026-06-30 |

## Deferred Decisions / 보류한 결정

| Decision | Deferred Reason | Revisit Trigger | Target Branch / Phase |
| --- | --- | --- | --- |
| `ci-status`를 required check로 승격 | GitHub branch protection 변경은 사람 확인이 필요 | repo admin이 required context 재설계를 승인할 때 | follow-up repo-admin phase |

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

| Decision | Condition | Action |
| --- | --- | --- |
| path-filter heavy gate | PR CI에서 필요한 heavy check가 잘못 skip됨 | trigger path를 보수적으로 추가하고 report에 incident 기록 |
| Local Complete Gate | 팀 공유 산출물이 local complete에 오래 머물러 drift 발생 | PR-ready 승격 또는 보류 이유/재개 조건 강화 |
