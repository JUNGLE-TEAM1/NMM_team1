# 품질 기록

## Context Budget

- Mode: Lite Read
- Primary context: `AGENTS.md`, `docs/00-layer-map.md`, `.gitignore`, `.env.example`, `.env.local`, `docker-compose.yml`, `docs/03-interface-reference.md`, `docs/04-development-guide.md`

## 검증

- `git status --short --ignored .env.local .gitignore .env.example docker-compose.yml`
  - `.env.local`이 `!! .env.local`로 ignored 처리됨을 확인했다.
- `docker compose config --services`
  - Compose 설정 파싱 성공.
- `docker compose up -d --force-recreate backend frontend`
  - backend/frontend container 재생성 성공.
- `docker compose exec -T backend sh -c 'test "${WEEK2_LLM_PROVIDER:-}" = openai && test -n "${OPENAI_API_KEY:-}" && test "${OPENAI_MODEL:-}" = gpt-4.1-mini'`
  - 사용자가 `.env.local`에 직접 입력한 key가 backend container에 non-empty 값으로 적용됨을 확인했다. key 값은 출력하지 않았다.
- `curl -fsS http://127.0.0.1:8000/health`
  - backend health 응답 정상.
- `curl -fsS http://127.0.0.1:3000/`
  - frontend HTML 응답 정상.
- `docker compose exec -T backend sh -c 'test -f data/chimera/product_health/raw_demo/gold_preview/gold_product_health.jsonl'`
  - `./data:/app/data` mount 후 Product Health preview file이 backend container에 보이는지 확인한다.
- `curl -fsS http://127.0.0.1:8000/api/week2/catalog/dataset_product_health_gold`
  - Product Health catalog가 backend에서 로드되고 `allowed_columns`에 `product_id`, `risk_score`가 포함됨을 확인했다.
- `curl -fsS -H 'Content-Type: application/json' -d '{"question":"위험 점수가 높은 상품 알려줘"}' http://127.0.0.1:8000/api/week2/ai/query`
  - `status=succeeded`, `route=sql`, `selected_dataset_ids=["dataset_product_health_gold"]`, `answer_metadata.provider=openai`, `fallback_used=false`, `row_count=10`을 확인했다.

## Secret Check

- 실제 API key 값은 출력, 문서화, commit하지 않았다.
- `.env.local`은 ignored 상태다.
