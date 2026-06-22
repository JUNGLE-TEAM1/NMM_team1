# Source of truth alignment 보고서

## Short Report / 짧은 보고

- Type: docs
- Branch/work location: `docs/source-of-truth-alignment`, `docs/workflows/docs/source-of-truth-alignment`
- Date: 2026-06-22
- Workspace state: complete
- Context Budget mode: Lite Read
- Primary context read: `docs/01-product-planning.md`, `docs/02-architecture.md`, `docs/03-interface-reference.md`, `docs/07-manual-verification-playbook.md`, current backend/frontend contracts
- Escalated context read: `backend/app/services/pipeline.py`, `backend/app/domain/transforms.py`, API routers, smoke script
- Context omitted intentionally: runtime implementation changes because this branch is docs-only
- Changed: stale open decisions moved to confirmed decisions, `PipelineService` vs future `PipelineRunner` clarified, pipeline endpoints documented, milestone numbering aligned, manual verification wording matched to `select_fields`
- Verified: documentation search; `PYTHONPATH=backend pytest backend/tests` 8 passed; `npm --prefix frontend run build` pass; `scripts/validate-harness.sh --strict` pass
- Remaining: PR 생성 후 GitHub Actions CI 확인, merge/finalize/issue close
- Next context: 기능 분업 시작 전 이 문서를 기준으로 M6/M7/M8 branch 범위를 잡는다.
- Risk: future feature branches must keep Source of Truth documents updated when decisions move from candidate to implemented.
