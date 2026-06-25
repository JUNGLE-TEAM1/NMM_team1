# Week2 main E2E path 보고서

## Short Report / 짧은 보고

- Type: docs
- Date: 2026-06-25
- Changed: `docs/project-context/asklake-week2-module-plan/ver2/main-e2e-path.md`를 추가하고 ver2 README 읽는 순서에 연결했다.
- Verified: main path keyword check, `git diff --check`, `scripts/validate-harness.sh --strict`
- Remaining: Phase 4 existing implementation anchor, Phase 5 M3 JSON main path decision, Phase 6 runner boundary decision
- Next context: Amazon Reviews JSON -> M3 profile/schema/transform spec -> M5 Workflow/Catalog -> M6 AI Query -> M1 UI가 발표 필수 경로다.
- Risk: 문서 결정 단계라 runtime contract와 code는 아직 바뀌지 않았다.

## Phase / Hotfix

- Type: docs
- Branch/work location: `docs/week2-main-e2e-path`, `docs/workflows/docs/week2-main-e2e-path`
- Date: 2026-06-25
- Workspace state: complete

## Reference Docs / 참고 문서

- `AGENTS.md`
- `docs/project-context/asklake-week2-module-plan/ver2/README.md`
- `docs/project-context/asklake-week2-module-plan/ver2/implementation-transition-plan.md`
- `docs/08-development-workflow.md`
- `docs/12-quality-gates.md`

## Goal / 목표

- Week2 발표와 병렬 구현의 main E2E path를 하나로 고정한다.

## Changed Files / 변경 파일

- `docs/project-context/asklake-week2-module-plan/ver2/main-e2e-path.md`
- `docs/project-context/asklake-week2-module-plan/ver2/README.md`
- `docs/workflows/docs/week2-main-e2e-path/*`
- `docs/reports/week2-main-e2e-path.md`
- `docs/reports/README.md`

## Implementation Summary / 구현 요약

- Amazon Reviews JSON 기반 main path를 발표 필수 경로로 확정했다.
- Taxi, Kafka, SparkRunner는 supporting evidence 또는 후속 runtime implementation으로 두고 main path 선행 조건에서 제외했다.
- M1/M3/M5/M6의 main path 책임과 완료 기준을 분리했다.

## Verification Commands / 검증 명령

```bash
rg -n "Amazon Reviews JSON|M5 Workflow|M5 Catalog|M6 AI Query|M1 UI|Taxi|Kafka|supporting evidence|not blocking|선행 조건" docs/project-context/asklake-week2-module-plan/ver2/main-e2e-path.md
git diff --check
scripts/validate-harness.sh --strict
```

## Quality Gate Evidence / 품질 게이트 증거

- Workspace file: `docs/workflows/docs/week2-main-e2e-path/quality.md`
- Quality gate status: passed
- TDD status: not applicable, docs-only decision
- CI/check result: local strict harness passed; PR CI는 PR 생성 후 확인
- Skipped checks: runtime unit/build checks skipped because no code changed
- CD/deploy gate: not required

## Decision Evidence / 결정 증거

- Workspace file: `docs/workflows/docs/week2-main-e2e-path/decisions.md`
- Decision status: accepted
- Accepted/deferred decisions: main path accepted; SparkRunner, Kafka streaming, Taxi full ETL are deferred/supporting
- Revisit/rollback condition: Amazon Reviews JSON으로 M3 profile/schema/transform spec 최소 산출물을 만들 수 없으면 Phase 5에서 재검토한다.

## Regression Guard / 회귀 보호

- Checked feature: Week2 ver2 responsibility and implementation transition docs
- Protected behavior: 기존 구현 위 adapter-first 전환 원칙을 유지한다.
- Result: main path는 기존 local runner를 우선 사용하며 rewrite를 요구하지 않는다.

## Manual Verification / 수동 검증

- Document executed: docs-only review
- Environment: local repository
- Result: main path 문서와 workspace evidence가 서로 같은 결정을 가리킨다.
- Failure/limitation: runtime smoke는 후속 code Phase에서 실행한다.
- Evidence: `quality.md`, `report.md`

## docs/05 Acceptance Link / 수용 기준 연결

- Related item: Week2 발표 흐름과 branch workflow completion gate
- Status: docs decision accepted
- Evidence: ver2 main path 문서와 strict harness validation

## Failed / Incomplete / Follow-Up TODO

- Phase 4에서 기존 구현 anchor를 별도 문서로 보호한다.
- Phase 5에서 M3 JSON main path와 PR #105 회수 범위를 결정한다.
- Phase 6에서 runner boundary 호출 계약을 결정한다.

## Secret / Migration / Env Check

- Secret check: no secret added
- Migration/data change: none
- Env change: none

## Final Judgment / 최종 판단

- Done: yes
- Remaining risk: code/runtime contract는 아직 바뀌지 않았으므로 병렬 구현 전 Phase 4~6을 이어서 완료해야 한다.
