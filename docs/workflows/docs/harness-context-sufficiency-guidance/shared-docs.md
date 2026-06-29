# Harness context sufficiency guidance 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/05-acceptance-scenarios-and-checklist.md` | Context Assumption Check 수용 기준 추가 | 협업 질문/명령 처리 규칙 변경 검증 | Low |
| `docs/06-regression-and-failure-scenarios.md` | 전제 확인 없이 답변/실행하는 실패 시나리오 추가 | 일반론과 저장소 규칙 혼동, 실행 승인 오해 방지 | Low |
| `docs/07-manual-verification-playbook.md` | 협업 전제 확인 수동 점검 추가 | 문서 간 적용 흐름 확인 | Low |
| `docs/08-development-workflow.md` | Phase 시작 gate와 workflow 규칙에 Context Assumption Check 추가 | 작업 시작 전 질문/명령 렌즈 판별 | Low |
| `docs/09-collaboration-agreement.md` | Context Assumption Check Agreement 추가 | 사람-AI 협업 기본 합의로 고정 | Low |
| `docs/10-next-action-menu.md` | Context Assumption Needed 메뉴 추가 | 전제가 불명확한 질문/명령 처리 선택지 제공 | Low |
| `docs/13-human-command-flow.md` | 개념 질문/실행 요청/축 적용 확인 예시 추가 | 사람이 짧은 명령으로 하네스를 운용할 때의 AI 책임 명확화 | Low |
| `docs/15-context-budget-rule.md` | Context Budget과 Context Assumption Check의 책임 분리 추가 | 문서를 많이 읽는 것과 답변 전제 판별을 혼동하지 않도록 함 | Low |

## Integration Notes / 통합 메모

-

## Conflicts To Resolve / 해결할 충돌

-
