# Catalog metadata integration 품질 게이트

- TDD status: 구현 Phase 시작 시 CatalogMetadata persistence 테스트부터 판단한다.
- Required checks: backend focused tests, frontend build, browser smoke, `scripts/validate-harness.sh`.
- Manual verification: Catalog list/detail에서 schema, storage, metrics, lineage 확인.
- Regression focus: stale/fake metadata를 성공처럼 표시하지 않는다.
