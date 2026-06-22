# Demo polish 보고서

## Short Report / 짧은 보고

- Type: feature
- Branch/work location: `feature/demo-polish`, `docs/workflows/feature/demo-polish`
- Date: 2026-06-22
- Workspace state: complete
- Context Budget mode: Lite Read
- Primary context read: `docs/01-product-planning.md`, `docs/05-acceptance-scenarios-and-checklist.md`, `docs/07-manual-verification-playbook.md`, `docs/08-development-workflow.md`, current frontend demo flow
- Escalated context read: `docker-compose.yml`, `infra/docker/frontend.Dockerfile`, browser manual verification
- Context omitted intentionally: long-term M6+ connector/transform/job management implementation, real AWS/EKS deploy
- Changed: demo-safe source/pipeline default names, source-to-pipeline selection sync, result dataset auto-selection after run, same-origin frontend `/api` proxy, MVP demo script, README demo status
- Verified: `bash -n scripts/*.sh scripts/aws/*.sh`; `PYTHONPATH=backend pytest backend/tests` 8 passed; `npm --prefix frontend run build` pass; `scripts/smoke-container-app.sh` pass; browser manual smoke pass; `scripts/validate-harness.sh --strict` pass
- Remaining: PR 생성 후 GitHub Actions CI 확인, merge/finalize/issue close
- Next context: M5 PR을 닫은 뒤 M6 source connector, M7 transform library, M8 run management 중 우선순위를 결정한다.
- Risk: local CSV result store와 Docker Compose demo는 MVP 시연에는 충분하지만 production deploy/release는 아직 별도 approval gate가 필요하다.
