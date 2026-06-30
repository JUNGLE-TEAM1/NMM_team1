# 공유 문서 변경

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/03-interface-reference.md` | external LLM env contract의 `.env.local` local compose 경계를 기록한다. | local-only secret boundary를 interface contract에 남긴다. | low |
| `docs/04-development-guide.md` | local OpenAI LLM 설정과 backend container 재생성 절차를 기록한다. | 사람이 VS Code에서 `.env.local`을 직접 편집하는 운영 흐름을 명확히 한다. | low |
| `docs/reports/README.md` | Local LLM env 설정 보고서를 latest report index에 추가한다. | 증거 문서 discoverability를 유지한다. | low |

## Status / 상태

- proposal status: applied
