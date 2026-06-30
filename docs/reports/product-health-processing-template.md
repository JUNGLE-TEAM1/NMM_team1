# Product Health Processing Template 보고서

## Short Report / 짧은 보고

- Type: Feature
- Date: 2026-06-30
- Changed: M3 Product Health 계약을 Target Dataset Processing 추천 template로 조회/표시/저장하는 첫 조각을 추가했다.
- Verified: `PYTHONPATH=. pytest tests/test_product_health_processing_template.py tests/test_target_dataset_job_draft.py` passed, `npm run build` passed.
- Remaining: multi-source Source Dataset role mapping, editable Transform Builder, Silver/Gold preview, M2 execution, Catalog/AI Query 연결.
- Next context: PR 2는 `reviews`, `behavior`, `delivery`, `product_master` source role mapping을 Target Dataset metadata에 붙이는 작업이다.
- Risk: backend 전체 테스트는 로컬 `pyarrow` 부재와 unrelated `scripts` import path 문제로 collection 단계에서 중단됐다.

## Goal / 목표

- 사용자가 Target Dataset Processing 화면에서 Product Health 추천 template을 선택하고, M3 `TransformSpec` 기반 step list와 quality rules를 검토한 뒤 `process_rule` metadata로 저장할 수 있게 한다.

## M3 Contract Summary

- Gold Dataset: `dataset_product_health_gold`
- Query table: `gold_product_health`
- Output schema: `product_id`, `product_name`, `category_l1`, `review_count`, `average_rating`, `negative_review_rate`, `view_count`, `purchase_count`, `conversion_rate`, `delivery_count`, `late_delivery_rate`, `risk_score`
- Quality rules: `schema_match`, `row_count_nonzero`, `risk_score_range`, `zero_denominator_policy`
- Processing flow: `bronze -> silver -> aggregate -> join -> derive -> load`

## Implementation Summary / 구현 요약

- Backend:
  - `ProcessingTemplateRecord` schema 추가
  - `ProductHealthProcessingTemplateService` 추가
  - `GET /api/processing-templates/product-health` 추가
  - template 조회와 recommended `process_rule` 저장 테스트 추가
- Frontend:
  - Product Health template API client 추가
  - Target Dataset Process 단계에 `추천 템플릿 사용` / `직접 설정` mode 추가
  - recommended mode에서 M3 step list, quality rules, Gold schema 표시
  - 저장 payload `process_rule`에 template metadata, `steps[]`, `quality_rules[]` 포함
- Docs:
  - `docs/03-interface-reference.md`
  - `docs/05-acceptance-scenarios-and-checklist.md`
  - `docs/06-regression-and-failure-scenarios.md`
  - `docs/07-manual-verification-playbook.md`

## Verification Commands / 검증 명령

```bash
PYTHONPATH=. pytest tests/test_product_health_processing_template.py tests/test_target_dataset_job_draft.py
npm run build
PYTHONPATH=. pytest
```

## Quality Gate Evidence / 품질 게이트 증거

- Related backend tests: passed, 5 tests.
- Frontend build: passed.
- Backend full test: local collection blocked by missing `pyarrow` and unrelated `scripts` import path in this invocation.
- PR size hard gate: expected to require `Large PR Exception: approved` because the first Product Health processing slice crosses backend API, frontend wizard, interface docs, and tests.

## Regression Guard / 회귀 보호

- Existing External Connection / Source Dataset / Target Dataset draft flow remains intact.
- Manual `select_fields` mode remains available.
- Recommended Product Health `process_rule` is stored as draft metadata only.
- M2 execution, multi-source mapping, Silver/Gold preview, Catalog registration, AI Query are intentionally deferred.

## Secret / Migration / Env Check

- Secret check: no secret added.
- Migration/data change: none.
- Env change: none.

## Final Judgment / 최종 판단

- Done: PR 1 completion criteria satisfied for UI review and metadata storage of M3 recommended processing rules.
- Remaining risk: backend full-test local environment needs optional runtime deps or CI environment to confirm unrelated Week2 runtime tests.
