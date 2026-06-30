# 결정 기록

- Decision status: accepted

## Decision Option Briefs / 결정 옵션 브리프

- not needed

## Accepted Decisions / 확정된 결정

- 앱 UI에 API key 입력칸을 만들지 않고, `.env.local`을 local-only secret entry point로 사용한다.
- `.env.local`은 Git ignored 상태로 유지하고 `.env.example`에는 빈 예시 값만 둔다.
- Docker Compose backend는 optional `.env.local` env_file과 repo-local `data/` mount를 사용한다.

## Deferred Decisions / 보류된 결정

- 실제 OpenAI API key 생성/교체/저장 대행은 이 PR 범위에서 제외한다.

## Revisit / Rollback Conditions / 재검토 또는 롤백 조건

- `.env.local`이 Git tracked 상태로 잡히면 즉시 revert 또는 ignore rule을 수정한다.
- backend container에서 OpenAI env가 의도치 않게 출력되면 로그/문서를 수정한다.
