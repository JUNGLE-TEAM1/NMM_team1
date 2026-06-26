# Week2 M1 synthetic raw demo sample scale 보고서

## Short Report / 짧은 보고

- Type: feature
- Branch/work location: `feature/week2-m1-synthetic-raw-scale`, `docs/workflows/feature/week2-m1-synthetic-raw-scale`
- Date: 2026-06-26
- Workspace state: ready-for-review
- Context Budget mode: Escalate Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/08-development-workflow.md`, PR #154 report/workspace
- Escalated context read: `docs/03-interface-reference.md`, `contracts/schema_definition.sample.json`, `contracts/transform_spec.sample.json`, `contracts/workflow_definition.sample.json`
- Context omitted intentionally: Taxi delivery seed, M3 Bronze implementation internals, M5/M6 integration implementation
- Changed: generator manifest/summary selected option recording was improved; local ignored `data/` was regenerated from `Health_and_Personal_Care` at 100,000 review rows, 10,000 product rows, 30,000 behavior events.
- Verified: focused unittest, JSONL 100,000 row parse/6-field validation, manifest/summary JSON validation, Week2LocalRunner smoke, strict harness validation. During PR finalization, merged latest `origin/main` and reran focused unittest, Week2LocalRunner smoke, and strict harness validation.
- Remaining: M3 handoff and decision whether to use 10k minimum-start sample or 100k demo_sample first; Taxi delivery seed remains follow-up.
- Next context: scale sample is local ignored data; regenerate with the command in `quality.md` if another worktree needs it.
- Risk: `Health_and_Personal_Care` is a pragmatic moderate-size category, not necessarily the final presentation category.

## Verification Commands / 검증 명령

```bash
python3 -m unittest tests/test_week2_m1_synthetic_raw.py
python3 scripts/week2_m1_synthetic_raw.py --category Health_and_Personal_Care --review-rows 100000 --product-rows 10000 --events-per-product 3 --selected-option option_2_recommended_mvp_demo
python3 -m json.tool data/week2/mvp_synthesis/metadata/source_manifest.json
python3 -m json.tool data/week2/mvp_synthesis/metadata/raw_demo_summary.json
PYTHONPATH=backend python3 - <<'PY'
import json
from pathlib import Path
from app.services.week2_local_runner import Week2LocalRunner
source_path = Path('data/week2/mvp_synthesis/raw_demo/reviews_seed.jsonl')
workflow = json.loads(Path('contracts/workflow_definition.sample.json').read_text(encoding='utf-8'))
result = Week2LocalRunner(
    source_config={'connection_ref': {'path': str(source_path)}, 'options': {'encoding': 'utf-8'}},
    output_root=Path('data/results/week2_m1_synthetic_raw_scale_smoke'),
).run(workflow)
print(json.dumps({'status': result.status, 'row_count': result.row_count, 'output_row_count': result.output_row_count, 'output_path': result.output_path}, indent=2))
PY
```

## Generated Local Artifacts / 생성된 로컬 산출물

- `data/week2/mvp_synthesis/raw_demo/reviews_seed.jsonl` - 100,000 rows
- `data/week2/mvp_synthesis/raw_demo/product_master_seed.jsonl` - 10,000 rows
- `data/week2/mvp_synthesis/raw_demo/behavior_events_seed.jsonl` - 30,000 rows
- `data/week2/mvp_synthesis/metadata/source_manifest.json`
- `data/week2/mvp_synthesis/metadata/raw_demo_summary.json`
