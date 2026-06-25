# M6 AI Query 스켈레톤 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/02-architecture.md` | 변경 없음 | 현재 Phase는 이미 문서화된 adapter boundary를 코드 skeleton으로 구현한다. | 낮음 |
| `docs/03-interface-reference.md` | `guardrail.failure_code`에 `column_not_allowed` 추가 | `CatalogMetadata.query.allowed_columns`를 검증하려면 column allowlist 위반을 table 위반과 구분해야 한다. | 낮음 |
| `docs/05-acceptance-scenarios-and-checklist.md` | 변경 없음 | Day 4 검증 질문과 실제 SQL 수치 확정 전이라 acceptance를 키우지 않는다. | 낮음 |
| `docs/06-regression-and-failure-scenarios.md` | 변경 없음 | non-SELECT/table/column/limit guardrail은 test evidence로 기록한다. | 낮음 |
| `docs/07-manual-verification-playbook.md` | 변경 없음 | UI와 실제 Parquet 검증 전에는 manual playbook을 확장하지 않는다. | 낮음 |

## Integration Notes / 통합 메모

- M1은 `POST /api/week2/ai/query` 응답의 `AIQueryResult` shape를 화면 표시 계약으로 사용할 수 있다.
- M3/M5가 실제 `CatalogMetadata`를 생산하면 이 Phase의 fixture loader를 실제 store/catalog source로 교체해야 한다.

## Conflicts To Resolve / 해결할 충돌

- 없음.
