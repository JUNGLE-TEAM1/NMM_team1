# M6 SQL planner intent rules 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/02-architecture.md` | 변경 없음 | Adapter boundary와 deterministic planner는 기존 M6 ownership 범위 안이다. | 낮음 |
| `docs/03-interface-reference.md` | `unsupported_question` guardrail failure code 추가 | 지원하지 않는 질문을 SQL 실행 없이 보류하는 public failure reason을 문서화한다. | 낮음. 단 최신 main의 product risk 문맥과 함께 sync해야 한다. |
| `docs/05-acceptance-scenarios-and-checklist.md` | 변경 없음 | 기존 Ask/Evidence acceptance를 코드와 API smoke로 충족한다. | 낮음 |
| `docs/06-regression-and-failure-scenarios.md` | 변경 없음 | evidence 없는 confident answer regression을 코드로 막는다. | 낮음 |
| `docs/07-manual-verification-playbook.md` | 변경 없음 | Ask/Evidence 점검 절차를 그대로 사용했다. | 낮음 |
| `backend/app/services/catalog_retriever.py` | product health 지표 alias 추가 | `risk_score`, `negative_review_rate`, `conversion_rate`, `late_delivery_rate` 질문이 product health CatalogMetadata를 선택하게 한다. | 낮음 |
| `backend/app/services/sql_planner.py` | 새 internal planner 추가 및 product health intent 추가 | 질문 intent와 SQL 생성을 service 밖으로 분리하고 최신 대표 path를 지원한다. | 낮음 |
| `backend/app/services/ai_query.py` | `SqlPlanner` 주입/사용 및 product health summary 추가 | SQL engine 호출 전 unsupported 질문을 차단하고 planner intent별 summary를 만든다. | 낮음. latest main rebase 완료 |
| `backend/tests/test_sql_planner.py`, `backend/tests/test_week2_ai_query.py` | planner/unsupported/product health regression tests 추가 | Step 4 회귀를 막는다. | 낮음 |

## Integration Notes / 통합 메모

- PR #204 and PR #228 are merged, and this branch has been rebased onto `origin/main` `e1ddef2`.
- Product health runtime smoke seed inputs exist on main. Final product health Gold CatalogMetadata/output fixture is not added here; this branch only makes M6 planner/retriever handle those columns when M5/M3 provide them.

## Conflicts To Resolve / 해결할 충돌

- 없음. `origin/main` `e1ddef2`의 product risk/runtime smoke Source of Truth와 `docs/03` guardrail failure code diff는 rebase 후 함께 보존했다.
