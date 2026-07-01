# Manual Run Scheduler Boundary sources

| Source | Why |
| --- | --- |
| `backend/app/api/source_catalog.py` | schedule update and run execute endpoints |
| `backend/app/services/target_dataset_runtime_executor.py` | manual/local execution and readiness-only executor boundary |
| `frontend/src/app/App.jsx` | Jobs/Runs schedule and manual execute UI |
