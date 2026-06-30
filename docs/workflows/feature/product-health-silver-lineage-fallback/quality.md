# Product Health Silver Lineage Fallback 품질 기록

- Quality gate status: pending

## TDD Plan

- Applies: yes
- Target tests: Silver Dataset lineage/fallback evidence test.

## Required Checks

```bash
PYTHONPATH=backend ./.venv/bin/pytest backend/tests/test_silver_dataset_creation.py backend/tests/test_file_backed_dataset_detail.py -q
npm --prefix frontend run build
git diff --check
```
