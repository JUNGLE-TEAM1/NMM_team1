# Structure refactor 보고서

## Short Report / 짧은 보고

- Type: feature
- Branch/work location: `feature/structure-refactor`, `docs/workflows/feature/structure-refactor`
- Date: 2026-06-22
- Workspace state: complete
- Context Budget mode: Lite Read
- Primary context read: current frontend feature/API files, `backend/app/services/pipeline.py`, `docs/02-architecture.md`
- Escalated context read: smoke script and workspace status
- Context omitted intentionally: external demo frontend source because it has not been provided yet; M6+ implementation details
- Changed: frontend API client split, catalog hook/form/list split, pipeline run hook split, shared demo name helper, backend select transform domain module, architecture frontend layering note
- Verified: `bash -n scripts/*.sh scripts/aws/*.sh`; `PYTHONPATH=backend pytest backend/tests` 8 passed; `npm --prefix frontend run build` pass; `scripts/smoke-container-app.sh` pass; `scripts/validate-harness.sh --strict` pass
- Remaining: PR 생성 후 GitHub Actions CI 확인, merge/finalize/issue close
- Next context: external frontend demo integration can map UI components onto `useCatalog`, `usePipelineRun`, and resource API clients.
- Risk: SQLiteMetadataStore remains large; defer repository split until M6/M8 pressure makes the boundary clearer.
