# Product Health Gold Lineage Preset 품질 기록

- Quality gate status: pending

## TDD Plan

- Applies: yes
- Target tests: Product Health preset synthesis lineage and Catalog/AI Query handoff tests.

## Required Checks

```bash
PYTHONPATH=backend ./.venv/bin/pytest backend/tests/test_product_health_preset_synthesis.py backend/tests/test_target_dataset_catalog_publish.py backend/tests/test_ai_query_dataset_context.py -q
npm --prefix frontend run build
git diff --check
```
