# XFlow 참고 MVP 로드맵 보고서

## Short Report / 짧은 보고

- Type: feature
- Branch/work location: `feature/mvp-roadmap`, `docs/workflows/feature/mvp-roadmap`
- Date: 2026-06-21
- Workspace state: complete
- Context Budget mode: Escalate Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/01`, `docs/02`, `docs/03`, `docs/05`, `docs/06`, `docs/07`, `docs/08`
- Escalated context read: XFlow README, backend entrypoint, dataset schema, frontend route map
- Context omitted intentionally: XFlow `.env`, secrets, node_modules, deployment manifests beyond high-level scope
- Changed: infrastructure-first foundation, MVP scope, M0~M5 milestone, M6~M15 장기 milestone, architecture/interface 후보, acceptance/regression/manual verification, workflow Phase 1
- Verified: `scripts/validate-harness.sh`, `scripts/validate-harness.sh --strict`
- Remaining: AWS deployment target, 첫 source type과 metadata store 결정, M6 이후 우선순위는 MVP 구현 결과에 따라 조정
- Next context: `feature/infrastructure-foundation` 시작
- Risk: product contract와 infra target은 첫 구현 Phase 전까지 후보 수준. AWS 비용 resource는 approval 없이 만들지 않아야 함
