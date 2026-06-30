# 결정 기록

- Decision status: accepted

## Accepted Decisions / 확정된 결정

- 앱 UI에 API key 입력칸을 만들지 않고, `.env.local`을 local-only secret entry point로 사용한다.
- `.env.local`은 Git ignored 상태로 유지하고 `.env.example`에는 빈 예시 값만 둔다.
- Docker Compose backend는 optional `.env.local` env_file과 repo-local `data/` mount를 사용한다.

## Deferred Decisions / 보류된 결정

- 실제 OpenAI API key 생성/교체/저장 대행은 이 PR 범위에서 제외한다.
