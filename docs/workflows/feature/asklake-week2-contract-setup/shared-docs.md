# AskLake week 2 contract setup 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/02-architecture.md` | 변경 없음 | 이번 Phase는 기존 R0.5/R0.6 architecture boundary 안에서 fixture contract만 추가 | 낮음 |
| `docs/03-interface-reference.md` | AskLake Week 2 Contract Package 섹션 추가 | M1~M6 구현 전 `contracts/*.sample.json`과 `SqlEngineAdapter` 경계를 Source of Truth에 연결 | 중간 |
| `docs/05-acceptance-scenarios-and-checklist.md` | Week 2 fixture contract acceptance 항목 추가 | 구현 전 계약 fixture 존재와 producer/consumer 경계를 완료 기준에 연결 | 낮음 |
| `docs/06-regression-and-failure-scenarios.md` | fixture contract 없이 모듈 구현이 시작되는 실패 시나리오 추가 | 모듈별 contract drift 방지 | 낮음 |
| `docs/07-manual-verification-playbook.md` | fixture JSON 존재/유효성 및 adapter/fallback 경계 확인 절차 추가 | 수동 검증 경로에 이번 Phase 산출물 반영 | 낮음 |

## Integration Notes / 통합 메모

- `contracts/*.sample.json`은 Source of Truth 최종 schema가 아니라 Week 2 구현 전 fixture package다.
- 실제 구현 중 필드가 바뀌면 `docs/03`과 fixture를 함께 갱신한다.

## Conflicts To Resolve / 해결할 충돌

- 없음. 기존 R0.5/R0.6 contract baseline과 충돌하지 않고 Week 2 project context를 구현 전 fixture로 연결한다.
