# Transform Builder MVP

## Short Report / 짧은 보고

- Type: feature
- Date: 2026-06-30
- Changed: Target Dataset Processing의 Product Health 추천 템플릿 화면을 Transform Builder MVP로 확장했다. Role별 column mapping, silver cast type, null/quarantine policy는 편집 가능하고 aggregate metric, join key, `risk_score`, Gold schema는 review-only/locked로 표시한다. 저장되는 `process_rule`에는 수정 반영 `steps[]`와 `builder_config`가 포함된다.
- Verified: `cd frontend && npm run build` passed, `PYTHONPATH=backend pytest backend/tests/test_target_dataset_job_draft.py backend/tests/test_product_health_processing_template.py` passed 7 tests, local `/dataset` dev-server smoke returned `HTTP/1.1 200 OK`.
- Remaining: M2 Spark execution, Silver/Gold sample preview, Catalog registration, AI Query connection은 후속 PR 범위다.
- Next context: PR 4 Silver/Gold Preview는 `process_rule.builder_config.column_mappings`, `cast_overrides`, `null_policy_overrides`를 preview input으로 사용하면 된다.
- Risk: 실제 합성 raw source가 준비되기 전이라 field mapping validation은 UI 확인 수준이다. 실행 연결 PR에서 source schema validation 강도를 재조정해야 한다.
