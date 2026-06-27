# Week2 M1 delivery location enrichment 보고서

## Short Report / 짧은 보고

- Type: feature
- Branch/work location: `feature/week2-m1-delivery-location-enrichment`, `docs/workflows/feature/week2-m1-delivery-location-enrichment`
- Date: 2026-06-27
- Workspace state: ready-for-review
- Context Budget mode: Lite Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/08-development-workflow.md`, `docs/15-context-budget-rule.md`, PR #180 delivery seed generator/test/handoff
- Escalated context read: delivery seed generator/test and workspace evidence because this is a data shape follow-up
- Context omitted intentionally: M5/M6 consumer implementation, M3 main raw integration
- Changed: added pickup/dropoff source location IDs and TLC Taxi Zone borough/zone enrichment to `scripts/week2_m1_delivery_seed.py`; updated focused tests; generated local ignored enriched JSONL/Parquet; added follow-up handoff evidence.
- Verified: unit tests passed; Taxi source checksum confirmed; Taxi Zone lookup downloaded and checksummed; JSONL 100,000 rows validated; pickup/dropoff zone present rate 1.0; Parquet copy 100,000 rows read; metadata JSON valid; strict harness passed.
- Remaining: commit/push/PR; generated `data/` remains ignored.
- Next context: M5/M6 can use enriched fields for borough/zone late rate, cost-distance, and route-level aggregation.
- Risk: borough/zone values come from TLC Taxi Zone lookup and should be treated as synthetic auxiliary analysis dimensions, not real delivery operations geography.
