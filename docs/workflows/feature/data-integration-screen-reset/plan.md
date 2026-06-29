# 데이터 통합 화면 비우기 계획

## 브랜치

- Branch: `feature/data-integration-screen-reset`
- Workspace: `docs/workflows/feature/data-integration-screen-reset`
- Created: 2026-06-29

## 목표

- 데이터 통합 화면을 데모 중심으로 다시 만들기 위해 현재 화면의 보조 컨테이너, 내부 milestone placeholder, contract/debug 성격의 카드를 제거하거나 숨긴다.
- 화면의 첫 인상이 "파이프라인을 만드는 곳"으로 읽히도록 최소 구조만 남긴다.

## 범위

- 데이터 통합 화면(`/dataset`, 현재 app route의 `/sources` view) 안에서만 수정한다.
- 남길 요소는 화면 제목, 짧은 설명, `새 파이프라인 만들기` 진입점, 비어 있는 pipeline flow 자리 정도로 제한한다.
- 기존 route와 backend/API/schema contract는 변경하지 않는다.
- 기존 placeholder를 삭제할 때 후속 Phase에서 필요한 값은 코드 상수 또는 TODO로 보존할 수 있지만, 데모 화면에는 과다 노출하지 않는다.

## 범위 제외

- XFlow식 `Source / Transform / Target / Run` 카드 구현.
- 실제 pipeline 생성 API 연결 변경.
- 새 connector, schedule, permission, lineage, canvas 구현.
- Catalog, AI Query, Dashboard, Admin 등 다른 nav 화면 수정.
- 대규모 스타일 리팩터링.

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/01-product-planning.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`
- `docs/08-development-workflow.md`
- `docs/12-quality-gates.md`
- `docs/15-context-budget-rule.md`

## 구현 프롬프트

```text
@AGENTS.md @docs/00-layer-map.md @docs/01-product-planning.md @docs/05-acceptance-scenarios-and-checklist.md @docs/06-regression-and-failure-scenarios.md @docs/07-manual-verification-playbook.md @docs/08-development-workflow.md @docs/12-quality-gates.md @docs/15-context-budget-rule.md

`feature/data-integration-screen-reset` branch workspace 범위만 구현한다.
데이터 통합 화면에서 데모를 흐리는 보조 컨테이너, 내부 milestone placeholder, contract/debug 성격의 카드를 제거하거나 숨긴다.
남기는 것은 화면 제목, 짧은 설명, `새 파이프라인 만들기` 진입점, 이후 flow skeleton이 들어갈 빈 자리 정도로 제한한다.
backend/API/schema와 다른 nav 화면은 변경하지 않는다.
XFlow식 4단계 flow 구현은 후속 Phase로 남긴다.
구현 전 TDD 적용 여부를 `quality.md`에 기록하고, 범위를 넓히려면 먼저 `plan.md`를 업데이트한다.
```

## 검증 프롬프트

```text
@AGENTS.md @docs/05-acceptance-scenarios-and-checklist.md @docs/06-regression-and-failure-scenarios.md @docs/07-manual-verification-playbook.md @docs/12-quality-gates.md

데이터 통합 화면이 과거 placeholder/내부 milestone 용어 없이 표시되는지 확인한다.
가능한 frontend build/test/smoke를 실행하고 `quality.md`에 기록한다.
데모 화면에서 "파이프라인을 만드는 곳"이라는 목적이 5초 안에 보이는지 manual verification으로 기록한다.
Phase report를 작성한다.
```

## 내부 단계별 프롬프트

- not needed

## 완료 기준

- [x] 데이터 통합 화면의 방해 요소가 제거되거나 숨겨졌다.
- [x] `새 파이프라인 만들기` 진입점과 후속 flow 자리만 명확히 남았다.
- [x] 다른 nav 화면, backend/API/schema 변경이 없다.
- [x] TDD 상태 기록
- [x] Acceptance 확인
- [x] Regression/failure scenario 확인
- [x] Manual verification 기록
- [x] CI/check 명령과 결과 기록
- [x] Report 업데이트
