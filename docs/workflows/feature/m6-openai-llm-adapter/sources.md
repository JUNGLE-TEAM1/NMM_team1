# M6 OpenAI LLM Adapter source branch 기록

이 branch가 다른 branch workspace에 의존하거나 여러 branch를 통합할 때 사용한다.

## Source Branch Workspaces / source branch workspace

- direct source branch 없음. `main` 최신 상태에서 시작.

## Required Source Files / 읽어야 할 source 파일

각 source branch에서 아래 파일을 읽는다.

- `plan.md`
- `shared-docs.md`
- `report.md`
- `quality.md`
- `decisions.md`
- `confirmations.md`
- `sync.md`

이번 Phase에서 직접 읽은 Source of Truth:

- `AGENTS.md`
- `docs/03-interface-reference.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`
- `docs/08-development-workflow.md`
- `docs/12-quality-gates.md`

외부/skill source:

- Codex `openai-platform-api-key` skill: key presence checked only, no plaintext secret read or printed.
- Codex `openai-docs` skill: OpenAI Responses API contract 확인에 사용.
- OpenAI Responses API reference: `POST /v1/responses` request shape and `output_text` response field.

## Source Branch Base Records / source branch 기준 기록

각 source branch를 읽은 Git 지점을 기록한다.

| Source Branch | Workspace | Base Commit | Read At | Notes |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |

## Integration Notes / 통합 메모

- 
