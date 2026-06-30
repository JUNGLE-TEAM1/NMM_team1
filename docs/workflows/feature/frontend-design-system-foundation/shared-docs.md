# Frontend design system foundation 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/02-architecture.md` | Frontend layering에 `design-system/`과 route shell boundary를 추가한다. | 현재 architecture가 `api/app/components/features`만 기록하고 있어 실제 foundation 구조와 drift가 생긴다. | 낮음. 문서 구조 설명 변경이며 API/data contract 영향 없음. |

## No Source Of Truth Change / Source of Truth 변경 없음

- `docs/03-interface-reference.md`: API/schema/interface contract 변경 없음.
- `docs/05-acceptance-scenarios-and-checklist.md`: 사용자-facing acceptance 기준은 유지하고 이번 Phase evidence만 연결.
- `docs/06-regression-and-failure-scenarios.md`: 기존 failure scenario를 리팩토링 보호선으로만 사용.
- `docs/07-manual-verification-playbook.md`: 기존 frontend/browser smoke 경로를 사용.

## Integration Notes / 통합 메모

- `docs/02-architecture.md` frontend layering note는 이번 branch에서 적용했다.
- 후속 Phase에서 `SourcesPage`를 도메인 hook/page로 분리할 때 이번 design-system component를 재사용한다.

## Conflicts To Resolve / 해결할 충돌

- 없음.
