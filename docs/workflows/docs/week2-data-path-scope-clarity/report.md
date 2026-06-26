# Week2 data path scope clarity 보고서

## Short Report / 짧은 보고

- Type: docs
- Branch/work location: `docs/week2-data-path-scope-clarity`, `docs/workflows/docs/week2-data-path-scope-clarity`
- Date: 2026-06-26
- Workspace state: complete
- Context Budget mode: Lite Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, ver2 README, team handoff summary, responsibility/main path/M3 decision docs
- Escalated context read: related ver2 transition/anchor/flow docs after stale optional wording appeared in `rg`
- Context omitted intentionally: runtime code, `docs/03-interface-reference.md`, `contracts/*.sample.json`, full product rewrite
- Changed: clarified that Week2 has three required data processing/evidence paths; Amazon Reviews JSON remains the AI Query/analysis representative path; Taxi/Kafka are required processing/evidence paths; synthetic companion dataset analysis is deferred to follow-up research
- Verified: scope keyword `rg`, `git diff --check`, `scripts/validate-harness.sh`, `scripts/validate-harness.sh --strict`
- Remaining: PR review/CI; no runtime code or interface/contract updates in this branch
- Next context: implement M2/M3/M4 with Taxi/Amazon/Kafka all required for processing/evidence, but keep M6 analysis first attached to Amazon Reviews
- Risk: team may still want Taxi/Kafka M6 analysis later; that should be a separate synthetic companion dataset research/design Phase after base paths work
