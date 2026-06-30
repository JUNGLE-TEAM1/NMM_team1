# Product Health Processing Template Report

## Short Report / 짧은 보고

- Type: Feature
- Date: 2026-06-30
- Branch/work location: `feature/product-health-processing-template`, `docs/workflows/feature/product-health-processing-template/`
- Changed: Product Health Processing Template 조회 API, Target Dataset Processing 추천/직접 설정 mode, `process_rule` 저장 구조, 관련 문서/테스트
- Verified: related backend tests passed, frontend build passed
- Remaining: PR 2 multi-source role mapping, PR 3 builder edit, PR 4 preview, PR 5 M2 execution, PR 6 Catalog/AI Query
- Risk: backend 전체 테스트는 로컬 `pyarrow` 부재와 unrelated `scripts` import path 문제로 collection 단계에서 중단됨

## M3 기준 역산

- Gold Dataset: `dataset_product_health_gold`
- Query table: `gold_product_health`
- Output schema: `product_id`, `product_name`, `category_l1`, `review_count`, `average_rating`, `negative_review_rate`, `view_count`, `purchase_count`, `conversion_rate`, `delivery_count`, `late_delivery_rate`, `risk_score`
- Metric definitions: review count/rating/negative rate, behavior view/purchase/conversion rate, delivery count/late rate, risk score policy reference
- Quality rules: `schema_match`, `row_count_nonzero`, `risk_score_range`, `zero_denominator_policy`
- Silver/intermediate flow: source bronze read, source별 silver normalize/cast/null quarantine, source별 aggregate, product_id full outer union join, risk_score derive, gold load
- Current M1/M2 gap: Target Dataset UI는 기존 `select_fields` 중심이었고, M2 runner는 Product Health Gold full execution이 아니라 L6 preview/source input smoke 경계가 중심이다.

## Changed

- `GET /api/processing-templates/product-health`를 추가해 M3 contracts를 UI-oriented template으로 반환한다.
- Target Dataset Processing 화면에 `추천 템플릿 사용`과 `직접 설정` mode를 추가했다.
- 추천 template 선택 시 `bronze -> silver -> aggregate -> join -> derive -> load` step list, quality rules, Gold schema를 표시한다.
- Target Dataset 저장 payload의 `process_rule`에 Product Health template metadata, `steps[]`, `quality_rules[]`, `output_schema[]`, metric/claim metadata를 포함한다.
- Manual mode는 기존 `select_fields` 저장 흐름을 유지한다.
- `docs/03`, `docs/05`, `docs/06`, `docs/07`에 API/schema와 no-execution guard를 최소 반영했다.

## Verification

```bash
PYTHONPATH=. pytest tests/test_product_health_processing_template.py tests/test_target_dataset_job_draft.py
npm run build
PYTHONPATH=. pytest
```

- Related backend tests: passed, 5 tests.
- Frontend build: passed.
- Backend full test: not completed in local environment. Collection stopped because unrelated Week2 tests require `pyarrow`, and one Airflow handoff test imports `scripts` without the repo-root path in this invocation.
- PR size: expected to require `Large PR Exception: approved` because this first slice must update backend API, frontend wizard, interface docs, and tests together.

## Regression Guard

- Target Dataset Review 저장은 여전히 `status=draft` metadata 저장이다.
- 이번 PR은 M2 execution, multi-source role mapping, Silver/Gold preview, Catalog registration, AI Query 연결을 구현하지 않는다.

## Final Judgment

- Done: PR 1 목표인 M3 추천 변환 규칙의 UI review 및 metadata 저장 경계 구현 완료.
- Remaining risk: 실제 multi-source mapping과 execution은 후속 PR에서 닫아야 한다.
