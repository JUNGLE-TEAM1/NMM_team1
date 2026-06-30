# Transform Builder MVP

## Short Report / 짧은 보고

- Type: feature
- Date: 2026-06-30
- Changed: Target Dataset의 Product Health Pipeline Plan 화면을 Transform Builder MVP로 확장했다. 추천 템플릿은 Raw sources -> internal transform -> Gold Target 자동 설정 완료 요약으로 보이고, role별 column mapping, internal cast type, null/quarantine policy 편집기는 `고급 설정 보기`로 접는다. aggregate metric, join key, `risk_score`, Gold schema는 review-only/locked로 표시한다. 저장되는 `process_rule`에는 `type=product_health_gold_pipeline`, `final_output`, `internal_artifacts_visible=false`, 수정 반영 `steps[]`, `builder_config`가 포함된다.
- Verified: `cd frontend && npm run build` passed, `PYTHONPATH=backend pytest backend/tests/test_target_dataset_job_draft.py backend/tests/test_product_health_processing_template.py` passed 7 tests, local `/dataset` dev-server smoke returned `HTTP/1.1 200 OK`, in-app browser Pipeline Plan screen shows 자동 설정 완료 and hides `Source column mapping` by default.
- Remaining: M2 Spark execution, Silver/Gold sample preview, Catalog registration, AI Query connection은 후속 PR 범위다.
- Next context: PR 4 Silver/Gold Preview는 `process_rule.builder_config.column_mappings`, `cast_overrides`, `null_policy_overrides`를 preview input으로 사용하면 된다.
- Risk: 실제 합성 raw source가 준비되기 전이라 field mapping validation은 UI 확인 수준이다. 이번 데모는 Bronze/Silver를 사용자-facing dataset으로 만들지 않고 Gold Target의 내부 처리 단계로 표현한다. 실행 연결 PR에서 source schema validation과 실제 Gold output 생성 여부를 다시 검증한다.
