# Week2 implementation transition 노트

## 진행 메모

- Phase 1 PR #118이 merge되어 ver2 책임 분리 기준이 main에 들어왔다.
- 이번 Phase는 병렬 구현 전 6-Phase queue 중 Phase 2다.
- 핵심 판단은 "기존 구현을 버리지 않고 M5 workflow/catalog를 anchor로 유지한다"이다.
- M2/M3/M5 runner boundary는 Phase 6에서 결정하므로, 이번 Phase에서는 전환 순서와 금지사항만 고정한다.

## 결정

- `implementation-transition-plan.md`를 ver2 폴더에 추가한다.
- M5 `Week2WorkflowService`, `Week2LocalRunner`, `Week2CatalogStore`는 유지 대상으로 명시한다.
- M4 Kafka replay demo와 M6 AI Query skeleton은 폐기하지 않고 후속 adapter 전환 대상으로 둔다.

## 열린 질문

- Main E2E path는 Phase 3에서 확정한다.
- M3 PR #105 회수 여부는 Phase 5에서 결정한다.
- Runner boundary 호출 계약은 Phase 6에서 결정한다.

## 링크 / 증거

- `docs/project-context/asklake-week2-module-plan/ver2/implementation-transition-plan.md`
- PR #118 merge commit `d145e05`
