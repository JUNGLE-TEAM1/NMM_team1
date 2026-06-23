# Shared Source of Truth Impact

## Proposed Source Of Truth Changes

| File | Applied change | Evidence |
| --- | --- | --- |
| `docs/01-product-planning.md` | Target MVP와 current implementation baseline 분리 | 적용됨 |
| `docs/02-architecture.md` | target architecture plane과 trust/query/ask/recovery 흐름 정렬 | 적용됨 |
| `docs/03-interface-reference.md` | baseline contract와 Target MVP interface family 분리 | 적용됨 |
| `docs/05-acceptance-scenarios-and-checklist.md` | Target MVP acceptance 추가 | 적용됨 |
| `docs/06-regression-and-failure-scenarios.md` | Target MVP regression guard 추가 | 적용됨 |
| `docs/07-manual-verification-playbook.md` | Target MVP manual verification 후보 추가 | 적용됨 |
| `docs/08-development-workflow.md` | Product Rebaseline Mode와 R0~R7 queue 추가 | 적용됨 |

## Applied

- `README.md`: 제품 방향과 current baseline 분리.
- `docs/01-product-planning.md`: Target MVP와 milestone 재정렬.
- `docs/02-architecture.md`: current baseline과 target architecture 분리.
- `docs/03-interface-reference.md`: baseline contract와 Target MVP interface family 분리.
- `docs/05-acceptance-scenarios-and-checklist.md`: Target MVP acceptance 추가.
- `docs/06-regression-and-failure-scenarios.md`: Target MVP 회귀 guard 추가.
- `docs/07-manual-verification-playbook.md`: Target MVP 수동 점검 후보 추가.
- `docs/08-development-workflow.md`: Product Rebaseline Mode와 Target MVP queue 추가.

## Not Applied

- 과거 M0~M5 report는 historical evidence라 소급 수정하지 않았다.
- 제품 runtime code는 이번 Phase 범위가 아니라 수정하지 않았다.
