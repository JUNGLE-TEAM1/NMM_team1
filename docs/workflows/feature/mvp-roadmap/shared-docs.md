# XFlow 참고 MVP 로드맵 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| 파일 | 제안 변경 | 이유 | merge 위험 |
| --- | --- | --- | --- |
| `README.md` | MVP 후보 요약 추가 | 외부 요약에서 프로젝트 방향을 바로 알 수 있게 함 | 낮음 |
| `AGENTS.md` | tech stack 후보와 P0 설명 갱신 | 작업자가 현재 MVP 방향을 보게 함 | 낮음 |
| `docs/01-product-planning.md` | MVP, Non-MVP, user flow, milestones 작성 | 제품 범위 Source of Truth | 중간 |
| `docs/02-architecture.md` | infrastructure-first architecture candidate 작성 | 구현 Phase의 구조 기준 제공 | 중간 |
| `docs/03-interface-reference.md` | MVP API/UI/job contract 후보 작성 | 다음 Phase contract 기준 제공 | 중간 |
| `docs/05-acceptance-scenarios-and-checklist.md` | pipeline golden path acceptance 추가 | 데모 완료 기준 연결 | 낮음 |
| `docs/06-regression-and-failure-scenarios.md` | scope boundary와 result integrity guard 추가 | MVP 범위 확장 방지 | 낮음 |
| `docs/07-manual-verification-playbook.md` | MVP 수동 점검 추가 | 구현 후 데모 검증 경로 제공 | 낮음 |
| `docs/08-development-workflow.md` | M0~M5 milestone과 Phase 1 추가 | 다음 작업 순서 제공 | 중간 |
| `docs/01-product-planning.md` | M6~M15 장기 milestone 추가 | XFlow급 볼륨을 구현 가능 단위로 분리 | 중간 |
| `docs/02-architecture.md` | 단계별 architecture evolution과 장기 component 후보 추가 | infrastructure foundation에서 optional distributed/cloud로 가는 경계 제공 | 중간 |
| `docs/03-interface-reference.md` | 단계별 interface family 추가 | 각 milestone의 contract 확정 위치 제공 | 중간 |
| `docs/05-acceptance-scenarios-and-checklist.md` | 장기 milestone acceptance checkpoint 추가 | 장기 기능 완료 기준 제공 | 낮음 |
| `docs/06-regression-and-failure-scenarios.md` | 장기 roadmap scope guard 추가 | MVP 과확장과 고비용 인프라 필수화 방지 | 낮음 |
| `docs/08-development-workflow.md` | M6~M15 장기 구현 milestone 추가 | 다음 Phase 후보를 길게 연결 | 중간 |

## Integration Notes / 통합 메모

- 제품 코드가 아직 없으므로 contract는 후보 수준이다. 첫 구현 Phase에서 endpoint/schema를 확정한다.

## Conflicts To Resolve / 해결할 충돌

- 없음.
