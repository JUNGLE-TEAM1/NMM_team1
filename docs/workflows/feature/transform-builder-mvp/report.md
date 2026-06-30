# Transform Builder MVP

## Short Report / 짧은 보고

- Type: feature
- Branch/work location: `feature/transform-builder-mvp`, `docs/workflows/feature/transform-builder-mvp`
- Date: 2026-06-30
- Workspace state: ready-for-review
- Context Budget mode: Escalate Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/08-development-workflow.md`, `docs/11-git-sync-policy.md`, prior Product Health/Target Dataset UI files.
- Escalated context read: `contracts/product_health_transform_spec.sample.json`, `contracts/product_health_gold_contract.sample.json`, `backend/app/services/product_health_processing_template.py`, `frontend/src/app/App.jsx`, `frontend/src/app/styles.css`, `docs/03`, `docs/05`, `docs/07`.
- Context omitted intentionally: M2 runner internals, Catalog/AI Query code, Kafka/PostgreSQL ingestion implementations because PR 3 is UI/metadata-only.
- Changed: Product Health 처리 계획 화면을 Transform Builder MVP로 확장했다. 추천 템플릿은 Source Dataset을 하나 이상 입력으로 받아 Gold Target 자동 설정 완료로 보이고, role별 column mapping은 metadata에 자동 저장한다. 고급 설정은 내부 처리 단계 검토 요약으로 단순화했고 normalize/aggregate/join/risk_score/Gold schema는 review-only/locked로 표시한다. 저장되는 `process_rule`에는 `type=product_health_gold_pipeline`, `final_output`, `internal_artifacts_visible=false`, `steps[]`, `builder_config`를 포함한다.
- Verified: `npm run build` passed, focused backend tests 7 passed, `scripts/validate-harness.sh --strict` passed, local `/dataset` dev-server smoke returned `HTTP/1.1 200 OK`, in-app browser confirms one Source Dataset can advance to 처리 계획, per-column mapping editor is hidden, and 실행 방식 copy has no demo/smoke wording.
- Remaining: 실제 M2 Spark 실행, Silver/Gold preview, Catalog/AI Query 연결은 후속 PR 4~6 범위다. full backend test와 CI checks는 PR에서 확인한다.
- Next context: PR 4 Silver/Gold Preview는 `steps[]`, `builder_config.column_mappings`, 기본 `cast_overrides={}`, `null_policy_overrides={}`를 읽어 예상 schema/sample preview를 만들면 된다.
- Risk: 실제 합성 raw source가 아직 준비되지 않아 column mapping 기본값은 demo/source schema에 의존한다. 이번 데모는 Bronze/Silver를 사용자-facing dataset으로 만들지 않고 Gold Target의 내부 처리 단계로 표현한다. Source별 validation 강도와 실제 Gold output 생성은 후속 실행/preview PR에서 다시 조정해야 한다.
