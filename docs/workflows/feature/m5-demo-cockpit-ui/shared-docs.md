# M5 demo cockpit UI 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/02-architecture.md` | no change | backend/API/runtime boundary를 변경하지 않고 기존 M5 계약을 소비하는 UI 변경이다. | low |
| `docs/03-interface-reference.md` | no change | 새 endpoint, field, status, schema를 추가하지 않았다. | low |
| `docs/05-acceptance-scenarios-and-checklist.md` | no change | 기존 Week 2 M5 Airflow/Catalog acceptance를 UI에서 더 잘 보여주는 변경이다. | low |
| `docs/06-regression-and-failure-scenarios.md` | no change | local fallback이 Airflow 성공으로 가려지지 않아야 한다는 기존 guard를 UI에서 반영했다. | low |
| `docs/07-manual-verification-playbook.md` | update | `/etl` M5 Demo Cockpit을 학습/실험 가이드로 연결해 사람이 같은 화면을 보며 검증할 수 있게 한다. | low |
| `docs/manual-verification/09-m5-demo-cockpit-learning-guide.md` | add | M5 독립 데모에서 학습할 항목, 구현 범위, KPI/evidence, 코드 추적 순서를 한 문서에 묶는다. | low |
| `docs/project-context/asklake-week2-module-plan/ver2/m5-technical-depth-study-guide.md` | add | M5 담당자가 workflow runtime, idempotency, catalog consistency, adapter boundary, lineage를 깊게 설명할 때 쓰는 보조 학습 문맥이다. | low |

## Integration Notes / 통합 메모

- `/etl`은 이제 M5 독립 학습/시연 화면의 성격이 강하다.
- 새 guide는 결과 확인만이 아니라 `run_id`, `ExecutionResult`, output path, `CatalogMetadata.lineage`를 따라가며 이해하는 방식으로 작성했다.
- M1 live UI Phase 3/5와 통합할 때 `/catalog` live UI와 `/ask` evidence flow가 같은 run_id를 따라가도록 연결하면 된다.

## Conflicts To Resolve / 해결할 충돌

- 현재 작업은 actual branch `feature/m5-airflow-smoke-integration`에서 수행되어 PR 분리 시 기존 M5 Airflow smoke 변경과 섞일 수 있다.
