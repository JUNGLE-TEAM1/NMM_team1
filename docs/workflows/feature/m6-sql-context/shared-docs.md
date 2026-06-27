# M6 SQL execution context 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/03-interface-reference.md` | 변경 없음 | `local_path_missing`와 SQL context 문구는 PR #182에서 별도 반영했다. | 낮음. PR #182가 먼저 merge되어야 drift가 줄어든다. |
| `docs/05-acceptance-scenarios-and-checklist.md` | 변경 없음 | SQL 또는 `QueryResult` 검산 기준을 그대로 만족시키는 구현이다. | 낮음 |
| `docs/06-regression-and-failure-scenarios.md` | 변경 없음 | 권한/guardrail 전 단계 차단 기준을 코드로 보강한다. | 낮음 |
| `docs/07-manual-verification-playbook.md` | 변경 없음 | Week2 contract/manual 확인 기준을 바꾸지 않는다. | 낮음 |
| `backend/app/domain/ai_query.py` | `SqlEngineContext.local_fallback_path` optional field 추가 | M5 Catalog output path를 SQL adapter boundary로 전달한다. | 낮음 |
| `backend/app/services/ai_query.py` | Catalog `storage.local_fallback_path`를 SQL context에 매핑 | M6가 M5 CatalogMetadata를 read-only로 소비하는 1단계 구현이다. | 낮음 |
| `backend/app/fakes/fake_sql_engine.py` | path 없는 valid SQL을 `local_path_missing`으로 blocked 처리 | path 없는 Catalog로 성공 rows를 만들지 않게 한다. | 낮음 |
| `backend/tests/test_week2_ai_query.py` | context propagation/missing path guardrail 테스트 추가 | M6 Step 1 regression을 막는다. | 낮음 |

## Integration Notes / 통합 메모

- PR #182가 먼저 merge되면 이 branch의 구현 근거 문서와 main이 정렬된다.
- PR #182가 보류되면 이 implementation PR은 `local_path_missing`과 `SqlEngineContext.local_fallback_path` 설명을 별도 문서 변경으로 재검토해야 한다.

## Conflicts To Resolve / 해결할 충돌

- 없음. M5 Catalog 저장/API, M2 runtime, M1 UI는 변경하지 않았다.
