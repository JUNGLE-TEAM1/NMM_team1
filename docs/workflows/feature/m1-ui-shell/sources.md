# M1 UI Shell source branch 기록

이 branch가 다른 branch workspace에 의존하거나 여러 branch를 통합할 때 사용한다.

## Source Branch Workspaces / source branch workspace

- `origin/demo3`: UI reference only. source branch workspace는 없고, frontend 구조/화면 흐름만 참고한다.
- `docs/project-context/asklake-week2-module-plan/`: Week 2 모듈 계획과 M1 UI Shell 결정 기준.

## Required Source Files / 읽어야 할 source 파일

각 source branch에서 아래 파일을 읽는다.

- `docs/project-context/asklake-week2-module-plan/README.md`
- `docs/project-context/asklake-week2-module-plan/decisions.md`
- `docs/project-context/asklake-week2-module-plan/plan.md`
- `docs/project-context/asklake-week2-module-plan/m1-ui-shell-plan.md`
- `docs/03-interface-reference.md`
- `contracts/source_config.sample.json`
- `contracts/schema_definition.sample.json`
- `contracts/workflow_definition.sample.json`
- `contracts/execution_result.sample.json`
- `contracts/catalog_metadata.sample.json`
- `contracts/ai_query_result.sample.json`

## Source Branch Base Records / source branch 기준 기록

각 source branch를 읽은 Git 지점을 기록한다.

| Source Branch | Workspace | Base Commit | Read At | Notes |
| --- | --- | --- | --- | --- |
| `origin/demo3` | none | remote reference | 2026-06-25 | `XFlow`/demo fake 동작은 제외하고 UI shell reference로만 사용 |
| `main` | `docs/project-context/asklake-week2-module-plan` | `a1c6493` | 2026-06-25 | M1 범위와 M2~M6 연결 지점 확인 |

## Integration Notes / 통합 메모

- 실제 demo3 파일을 그대로 stage하지 않았다.
- 이후 통합자는 M1 shell route와 `docs/03` Week 2 route mapping을 기준으로 각 모듈 UI를 연결하면 된다.
