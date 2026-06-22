# M3 metadata store plan 보고서

## Short Report / 짧은 보고

- Type: docs
- Branch/work location: `docs/m3-metadata-store-plan`, `docs/workflows/docs/m3-metadata-store-plan`
- Date: 2026-06-22
- Workspace state: complete
- Context Budget mode: Lite Read
- Primary context read: `docs/01-product-planning.md`, `docs/02-architecture.md`, `docs/03-interface-reference.md`, `docs/05-acceptance-scenarios-and-checklist.md`, `docs/08-development-workflow.md`, XFlow backend metadata files
- Escalated context read: XFlow `backend/database.py`, `backend/models.py`, `backend/routers/catalog.py`, `backend/services/catalog_service.py`
- Context omitted intentionally: XFlow frontend catalog UI and distributed infra details are not needed for this M3 planning decision
- Changed: M3 source/store/API scope, SQLite + `MetadataStore` boundary, XFlow MongoDB reference note, acceptance criteria
- Verified: `scripts/validate-harness.sh`, `scripts/validate-harness.sh --strict`
- Remaining: next M3 implementation branch should create SQLite-backed store, CSV parser, source/catalog API, frontend list/detail
- Next context: `feature/source-catalog`
- Risk: SQLite is MVP-local and not production metadata storage. Store boundary and string UUIDs reduce future PostgreSQL/MongoDB migration risk.
