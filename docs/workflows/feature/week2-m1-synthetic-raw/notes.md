# Week2 M1 synthetic raw demo data 노트

## 진행 메모

- 2026-06-26: 기존 루트가 detached HEAD이고 M1 UI/API workspace가 별도로 있어, `/Users/tail1/Documents/nmm-week2-m1-synthetic-raw` 전용 git worktree와 `feature/week2-m1-synthetic-raw` branch를 생성했다.
- 2026-06-26: `scripts/start-workflow.sh --no-issue feature week2-m1-synthetic-raw "Week2 M1 synthetic raw demo data"`로 branch workspace를 생성했다. GitHub issue는 초기 local data seed scope 확정 전이라 생성하지 않았다.
- 2026-06-26: M3 답변 반영. 입력 파일 shape는 `amazon_reviews_json` 호환, 앱/커넥터 등록 타입은 `json`, manifest/summary 출처는 `data_origin` 또는 `fixture_origin=demo_synthetic_raw`, 별도 logical shape/profile은 `amazon_reviews_json`으로 기록한다.
- 2026-06-26: `Gift_Cards.jsonl`과 `meta_Gift_Cards.jsonl`을 Hugging Face에서 Keychain `asklake-hf-token` 인증으로 다운로드했고, local ignored `data/external/amazon-reviews-2023/` 아래에 저장했다.
- 2026-06-26: 최소 착수 샘플로 `reviews_seed.jsonl` 10,000행, `product_master_seed.jsonl` 1,000행, `behavior_events_seed.jsonl` 3,000행, `source_manifest.json`, `raw_demo_summary.json`을 생성했다.

## 결정

- 이번 Phase는 Option 1 최소 착수안으로 닫는다. 100,000행 demo_sample 확장과 Taxi 기반 delivery seed는 후속 Phase 후보로 둔다.
- `reviews_seed.jsonl`은 M3 `TransformSpec` select 컬럼과 충돌하지 않도록 6개 필드만 쓴다.
- 생성 데이터와 원본 다운로드 파일은 `data/` 아래에 두고 commit하지 않는다. 재현 가능한 스크립트와 검증 증거를 commit 후보로 둔다.

## 열린 질문

- M3가 실제 Bronze 변환 입력 path로 `data/week2/mvp_synthesis/raw_demo/reviews_seed.jsonl`을 그대로 사용할지, M3 worktree 내부로 복사할지 handoff 때 확인한다.
- Option 2 확장 시 category를 `Gift_Cards`만 유지할지, 큰 카테고리 또는 Parquet shard로 확장할지 결정해야 한다.

## 링크 / 증거

- Hugging Face dataset: `https://huggingface.co/datasets/McAuley-Lab/Amazon-Reviews-2023`
- Review source URL: `https://huggingface.co/datasets/McAuley-Lab/Amazon-Reviews-2023/resolve/main/raw/review_categories/Gift_Cards.jsonl`
- Metadata source URL: `https://huggingface.co/datasets/McAuley-Lab/Amazon-Reviews-2023/resolve/main/raw/meta_categories/meta_Gift_Cards.jsonl`
- Local review seed: `data/week2/mvp_synthesis/raw_demo/reviews_seed.jsonl`
- Local manifest: `data/week2/mvp_synthesis/metadata/source_manifest.json`
- Local summary: `data/week2/mvp_synthesis/metadata/raw_demo_summary.json`
