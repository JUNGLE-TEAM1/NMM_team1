# Local Tool Runtime Readiness 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/04-development-guide.md` | Local Tool/Runtime Readiness 절차와 Docker 예시 추가 | local/container smoke 전에 agent가 safe start를 먼저 시도하게 함 | Low |
| `docs/07-manual-verification-playbook.md` | manual verification 전 readiness check/safe start 규칙 추가 | 사람이 해야 할 조치와 agent가 먼저 시도할 조치를 분리 | Low |
| `docs/08-development-workflow.md` | 완료 게이트에 readiness evidence 기록 추가 | skipped validation 전에 readiness 시도를 남기게 함 | Low |
| `docs/09-collaboration-agreement.md` | Mid-Phase Steering 협업 원칙 추가 | 작업 중 사람 조향을 Phase 경계 안에서 분류하게 함 | Low |
| `docs/10-next-action-menu.md` | `Mid-Phase Steering Received` 메뉴 추가 | 새 지시를 scope detail, scope change, Hotfix, 다음 Phase 후보, 보류, 고영향 결정으로 분류하게 함 | Low |
| `docs/12-quality-gates.md` | quality evidence에 local runtime readiness 항목 추가 | `quality.md`가 readiness attempt/fallback/manual action을 기록하게 함 | Low |
| `docs/13-human-command-flow.md` | 검증 응답에서 installed/running/stopped/fallback/blocked 상태 구분과 Mid-Phase Steering 예시 추가 | agent 최종 보고와 작업 중 조향 처리를 명확히 함 | Low |
| `docs/reports/README.md` | Mid-Phase Steering report index 추가 | 최신 evidence 탐색을 쉽게 함 | Low |

## Integration Notes / 통합 메모

- 새 CI job이나 script behavior는 추가하지 않았다.
- Host-level install은 여전히 사람 확인 대상이다.
- Mid-Phase Steering은 제품 기능 변경이 아니라 협업 흐름 보강이다.

## Conflicts To Resolve / 해결할 충돌

- none known
