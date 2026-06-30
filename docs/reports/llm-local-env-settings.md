# LLM local env 설정 파일 연결 보고서

## Short Report / 짧은 보고

- Type: feature
- Date: 2026-06-30
- Changed: VS Code에서 직접 편집하는 `.env.local` local-only LLM 설정 파일을 만들고, `.gitignore`, `.env.example`, `docker-compose.yml`, `docs/03`, `docs/04`를 연결했다. 이후 local demo CatalogMetadata가 container에서 보이도록 `./data:/app/data` mount를 추가했다.
- Verified: `.env.local` ignored 상태, Docker Compose config, backend/frontend container 재생성, backend env 적용, backend/frontend HTTP smoke, Product Health catalog 로드, AI Query OpenAI adapter 경로 성공을 확인했다.
- Remaining: 없음. UI에 이전 `blocked` 결과가 남아 있으면 같은 질문을 다시 실행한다.
- Next context: key 값은 채팅, 문서, 테스트 출력, Git diff에 남기지 않는다. AI Query 응답에서 `answer_metadata.provider=openai`, `fallback_used=false`를 확인했다.
- Risk: `.env.local`과 `data/`는 ignored local convenience 경로라 새 clone에서는 `.env.example`과 demo data/catalog를 참고해 다시 준비해야 한다.

## Verification Commands / 검증 명령

```bash
git status --short --ignored .env.local .gitignore .env.example docker-compose.yml
docker compose config --services
docker compose up -d --force-recreate backend frontend
docker compose exec -T backend sh -c 'test "${WEEK2_LLM_PROVIDER:-}" = openai && test -n "${OPENAI_API_KEY:-}" && test "${OPENAI_MODEL:-}" = gpt-4.1-mini'
curl -fsS http://127.0.0.1:8000/health
curl -fsS http://127.0.0.1:3000/
curl -fsS http://127.0.0.1:8000/api/week2/catalog/dataset_product_health_gold
curl -fsS -H 'Content-Type: application/json' -d '{"question":"위험 점수가 높은 상품 알려줘"}' http://127.0.0.1:8000/api/week2/ai/query
```

## Regression Guard / 회귀 보호

- Checked feature: M6 LLM adapter env-gated provider selection.
- Protected behavior: API key 부재 시 외부 LLM 호출을 활성화하지 않고 template fallback 경로를 유지한다.
- Result: `.env.local`은 `WEEK2_LLM_PROVIDER=openai`, non-empty `OPENAI_API_KEY`, model 값을 backend에 전달한다. 실제 key 값은 출력하지 않았다.

## Manual Verification / 수동 검증

- Document executed: `docs/07-manual-verification-playbook.md` Current Baseline local/container health 일부와 LLM env local setup 점검.
- Environment: macOS Docker Desktop / Docker Compose.
- Result: backend/frontend container가 재생성되고 `http://127.0.0.1:8000/health`, `http://127.0.0.1:3000/` 응답 정상. `위험 점수가 높은 상품 알려줘` AI Query는 `status=succeeded`, `route=sql`, `selected_dataset_ids=["dataset_product_health_gold"]`, `answer_metadata.provider=openai`, `fallback_used=false`, `row_count=10`으로 성공했다.

## Secret / Migration / Env Check

- Secret check: 실제 API key 값은 출력, 문서화, commit하지 않았다. `.env.local`은 ignored 상태다.
- Migration/data change: local demo CatalogMetadata 파일을 ignored `data/` 아래에 추가했다.
- Env change: backend service가 optional `.env.local` env_file을 읽고, local demo `data/`를 `/app/data`로 mount한다.
