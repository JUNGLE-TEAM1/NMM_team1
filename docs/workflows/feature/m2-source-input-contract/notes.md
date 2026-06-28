# M2 source input 계약 확장 노트

- Context Budget mode: Escalate Read.
- Primary context: `AGENTS.md`, `docs/00-layer-map.md`, `docs/15-context-budget-rule.md`, `docs/03-interface-reference.md`, `docs/reports/m2-product-health-runtime-smoke.md`, current M2 runner/tests.
- GitHub issue creation: created #233 after `gh auth login` and project scope refresh.
- GitHub Project: issue #233 added to `JUNGLE-TEAM1` project 3 and Status set to `In Progress`.
- Branch: local `feature/m2-source-input-contract`.
- 핵심 결정: `source_type`은 데이터 위치/통로, `format`은 파일 또는 메시지 생김새로 분리한다.
- 호환 전략: legacy `input_format` / `input_path`는 계속 허용하고, 새 `format` / `path`와 같은 의미로 처리한다.
