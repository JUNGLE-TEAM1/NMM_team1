# Week2 M6 RAG scope 보강 보고서

## Short Report / 짧은 보고

- Type: docs
- Branch/work location: `codex/docs-week2-m6-rag-scope`, `docs/workflows/docs/week2-m6-rag-scope`
- Date: 2026-06-26
- Workspace state: complete
- Context Budget mode: Lite Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/15-context-budget-rule.md`, Week2 module plan `decisions.md`/`plan.md`, ver2 README/main E2E/responsibility docs
- Escalated context read: none
- Context omitted intentionally: runtime code, `contracts/*.sample.json`, external vector DB/LLM implementation details
- Changed: reinforced M6 as Semantic/RAG-lite/AI Query in Week2 ver2 docs, clarified CatalogMetadata-based retrieval/evidence grounding, and kept external vector DB/full document RAG/real LLM outside the base scope.
- Verified: `rg -n "M6|RAG|Semantic|AI Query|CatalogMetadata retrieval|RAG-lite|external vector|full document" docs/project-context/asklake-week2-module-plan/ver2`, `git diff --check`, `scripts/validate-harness.sh --strict`
- Remaining: PR #129 review/CI; merge/finalize/cleanup requires human confirmation.
- Next context: M6 should treat CatalogMetadata semantic retrieval/RAG-lite as basic Week2 responsibility while leaving full external-vector RAG and real LLM provider integration to follow-up.
- Risk: if wording is too broad, readers may think full RAG/vector DB became part of the current Week2 base scope.
