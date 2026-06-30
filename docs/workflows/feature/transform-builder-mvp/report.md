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
- Changed: Product Health Processing 화면을 Transform Builder MVP로 확장했다. Role별 column mapping, silver cast type, null/quarantine policy는 편집 가능하고 aggregate/join/risk_score/Gold schema는 review-only/locked로 표시한다. 저장되는 `process_rule`에 수정 반영 `steps[]`와 `builder_config`를 포함한다.
- Verified: `npm run build` passed, focused backend tests 7 passed, local `/dataset` dev-server smoke returned `HTTP/1.1 200 OK`.
- Remaining: 실제 M2 Spark 실행, Silver/Gold preview, Catalog/AI Query 연결은 후속 PR 4~6 범위다. full backend test와 CI checks는 PR에서 확인한다.
- Next context: PR 4 Silver/Gold Preview는 `builder_config.column_mappings`, `cast_overrides`, `null_policy_overrides`를 읽어 예상 schema/sample preview를 만들면 된다.
- Risk: 실제 합성 raw source가 아직 준비되지 않아 column mapping 기본값은 demo/source schema에 의존한다. Source별 validation 강도는 실행 연결 PR에서 다시 조정해야 한다.
