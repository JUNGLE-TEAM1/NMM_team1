# M1 AI Query Live UI 노트

## 진행 메모

- M6 PR #152 merge 이후의 `AIQueryResult.evidence[]` grounding fields를 M1에서 소비한다.
- 8000번 backend container는 최신 route가 없어 `POST /api/week2/ai/query`가 `404 Not Found`를 반환했다.
- 최신 host backend를 `127.0.0.1:18000`, frontend를 CORS 허용 origin인 `127.0.0.1:13000`에서 띄워 browser smoke를 통과했다.

## 결정

- M1은 `query_result`를 canonical SQL 실행 결과로 표시하고, top-level `sql`/`rows`는 fallback으로만 사용한다.
- M1은 SQL, summary, retrieval/scoring, evidence를 직접 생성하지 않는다.
- `evidence[]`의 schema/metrics/lineage/retrieval terms는 optional field로 방어적으로 렌더링한다.

## 열린 질문

- demo 환경의 8000번 container를 언제 rebuild할지 결정이 필요하다.

## 링크 / 증거

- PR #156 M1 Catalog Live UI merge 이후 시작.
- PR #160 M1 AI Query Phase plan merge 이후 시작.
- Browser smoke: `http://127.0.0.1:13000/query` sample question passed.
