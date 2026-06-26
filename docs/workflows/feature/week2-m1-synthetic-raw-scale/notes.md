# Week2 M1 synthetic raw demo sample scale 노트

## 진행 메모

- 2026-06-26: PR #154 merge commit `5dd413c` 위에서 `/Users/tail1/Documents/nmm-week2-m1-synthetic-raw-scale` 전용 worktree를 만들고 `feature/week2-m1-synthetic-raw-scale` branch를 시작했다.
- 2026-06-26: Hugging Face API tree size 확인 결과 `Health_and_Personal_Care`가 review 약 227MB, metadata 약 118MB로 100k/10k 확장에 적절하다고 판단했다.
- 2026-06-26: `scripts/week2_m1_synthetic_raw.py`에 `selected_option` 기록을 보강하고, `option_2_recommended_mvp_demo` scale sample을 생성했다.
- 2026-06-26: local ignored `data/` 아래 `reviews_seed.jsonl` 100,000행, `product_master_seed.jsonl` 10,000행, `behavior_events_seed.jsonl` 30,000행을 생성했다.

## 결정

- scale category는 `Health_and_Personal_Care`로 둔다. `Electronics`/`Cell_Phones_and_Accessories`는 발표 시나리오에는 더 직관적일 수 있지만 원본 파일이 수 GB~수십 GB라 이번 Option 2 확장 Phase에는 과하다.
- Taxi delivery seed는 이번 Phase에 포함하지 않는다. M2/M5 경계가 있고, Amazon Reviews demo_sample 확장이 먼저다.

## 열린 질문

- M3가 100,000행 파일 전체를 바로 Bronze 변환기에 태울지, 먼저 10,000행 PR #154 샘플로 smoke 후 교체할지 확인이 필요하다.
- 발표 질문에 배송 지연 신호가 꼭 필요하면 Taxi seed 전용 Phase를 열어야 한다.

## 링크 / 증거

- Review source URL: `https://huggingface.co/datasets/McAuley-Lab/Amazon-Reviews-2023/resolve/main/raw/review_categories/Health_and_Personal_Care.jsonl`
- Metadata source URL: `https://huggingface.co/datasets/McAuley-Lab/Amazon-Reviews-2023/resolve/main/raw/meta_categories/meta_Health_and_Personal_Care.jsonl`
- Local review seed: `data/week2/mvp_synthesis/raw_demo/reviews_seed.jsonl`
- Local manifest: `data/week2/mvp_synthesis/metadata/source_manifest.json`
- Local summary: `data/week2/mvp_synthesis/metadata/raw_demo_summary.json`
