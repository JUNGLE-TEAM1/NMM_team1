# Week2 existing implementation anchor 보고서

## Short Report / 짧은 보고

- Type: docs
- Date: 2026-06-25
- Changed: 기존 M1/M4/M5/M6 구현과 contract/tests를 ver2 전환의 anchor로 선언했다.
- Verified: anchor keyword/path check, `git diff --check`, `scripts/validate-harness.sh --strict`
- Remaining: Phase 5 M3 JSON main path decision, Phase 6 runner boundary decision
- Next context: 후속 구현은 `Week2WorkflowService`, `Week2LocalRunner`, `Week2CatalogStore`, `Week2AIQueryService`, M1 shell, M4 Kafka demo를 삭제하지 않고 확장한다.
- Risk: docs-only anchor라 실제 code protection은 후속 PR의 tests/check에서 지켜야 한다.

## Phase / Hotfix

- Type: docs
- Branch/work location: `docs/week2-existing-implementation-anchor`, `docs/workflows/docs/week2-existing-implementation-anchor`
- Date: 2026-06-25
- Workspace state: complete

## Goal / 목표

- ver2 분업을 기존 구현 위에 안전하게 올리기 위해 유지/흡수할 구현 anchor를 파일 경로 기준으로 확정한다.

## Changed Files / 변경 파일

- `docs/project-context/asklake-week2-module-plan/ver2/existing-implementation-anchor.md`
- `docs/project-context/asklake-week2-module-plan/ver2/README.md`
- `docs/workflows/docs/week2-existing-implementation-anchor/*`
- `docs/reports/week2-existing-implementation-anchor.md`
- `docs/reports/README.md`

## Implementation Summary / 구현 요약

- M1 UI shell, M4 Kafka replay demo, M5 workflow/local runner/catalog, M6 AI Query skeleton, Week2 contracts/tests를 유지 대상으로 명시했다.
- M2/M3/M5/M6/M1 후속 구현이 기존 anchor에 붙는 방식을 정리했다.
- 삭제 또는 전면 대체 금지 범위를 문서화했다.

## Verification Commands / 검증 명령

```bash
rg -n "Week2WorkflowService|Week2LocalRunner|Week2CatalogStore|Week2AIQueryService|SqlEngineAdapter|kafka_replay_to_parquet_demo.py|M5 Workflow|삭제 또는 대체 금지" docs/project-context/asklake-week2-module-plan/ver2/existing-implementation-anchor.md
git diff --check
scripts/validate-harness.sh --strict
```

## Quality Gate Evidence / 품질 게이트 증거

- Workspace file: `docs/workflows/docs/week2-existing-implementation-anchor/quality.md`
- Quality gate status: passed
- TDD status: not applicable, docs-only decision
- CI/check result: local strict harness passed; PR CI는 PR 생성 후 확인
- Skipped checks: runtime unit/build checks skipped because no code changed
- CD/deploy gate: not required

## Decision Evidence / 결정 증거

- Workspace file: `docs/workflows/docs/week2-existing-implementation-anchor/decisions.md`
- Decision status: accepted
- Accepted/deferred decisions: existing implementation anchor accepted; runner boundary and M3 JSON scope deferred to Phase 5/6
- Revisit/rollback condition: 후속 구현에서 anchor 삭제가 필요해지면 별도 decision brief가 필요하다.

## Regression Guard / 회귀 보호

- Checked feature: Week2 run/catalog/query local path
- Protected behavior: run result contract, catalog lineage, persistence, local runner fallback, AI query result shape
- Result: 보호 대상 테스트와 파일 경로를 문서화했다.

## Secret / Migration / Env Check

- Secret check: no secret added
- Migration/data change: none
- Env change: none

## Final Judgment / 최종 판단

- Done: yes
- Remaining risk: code 변경은 없으므로 후속 implementation PR에서 보호 테스트를 실제로 실행해야 한다.
