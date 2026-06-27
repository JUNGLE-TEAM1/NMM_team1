# Week2 M1 delivery synthetic auxiliary seed 보고서

## Short Report / 짧은 보고

- Type: feature
- Branch/work location: `feature/week2-m1-delivery-seed`, `docs/workflows/feature/week2-m1-delivery-seed`
- Date: 2026-06-27
- Workspace state: ready-for-review
- Context Budget mode: Lite Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/08-development-workflow.md`, TLC Trip Record Data page
- Escalated context read: delivery seed plan/decisions/quality/report, existing Week2 M1 synthetic raw generator/tests
- Context omitted intentionally: M3 main raw integration, M5/M6 runtime integration
- Changed: added `scripts/week2_m1_delivery_seed.py`, added focused tests, generated local ignored `delivery_trips_seed.jsonl` and optional `delivery_trips_seed.parquet`, updated generated manifest/summary lineage/caveat, wrote M5/M6 handoff notes, and aligned the generator to use direct `pyarrow` instead of `pandas`.
- Verified: URL HEAD `HTTP/2 200`, local size `49,961,641 bytes`, SHA-256, Parquet magic bytes `PAR1`; unit tests passed; JSONL 100,000 rows validated; Parquet copy 100,000 rows read; metadata JSON valid; strict harness passed.
- Remaining: wait for PR review/CI, then merge/finalize only after human confirmation. Generated `data/` remains ignored.
- Next context: M3 guidance says delivery seed should stay an auxiliary synthetic dataset by default; JSONL is safest if M3 ever processes it.
- Risk: generating from Parquet requires `pyarrow`; repo already has `pyarrow==18.1.0` in `backend/requirements.txt`, while this desktop run used temporary `/tmp/asklake_pyarrow_runtime`.
