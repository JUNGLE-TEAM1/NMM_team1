# Week2 M1 synthetic raw demo data 보고서

## Short Report / 짧은 보고

- Type: feature
- Branch/work location: `feature/week2-m1-synthetic-raw`, `docs/workflows/feature/week2-m1-synthetic-raw`
- Date: 2026-06-26
- Workspace state: ready-for-review
- Context Budget mode: Escalate Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/08-development-workflow.md`, `docs/15-context-budget-rule.md`, `docs/17-parallel-milestone-protocol.md`, 사용자 제공 M1 task 문서
- Escalated context read: `docs/project-context/asklake-week2-module-plan/README.md`, `docs/project-context/asklake-week2-module-plan/decisions.md`, `docs/03-interface-reference.md` Week 2 Contract Package, `contracts/source_config.sample.json`, `contracts/schema_definition.sample.json`, `contracts/transform_spec.sample.json`, `contracts/workflow_definition.sample.json`, 관련 `docs/05`, `docs/06`, `docs/07` Week 2 항목
- Context omitted intentionally: 전체 report archive, 실제 M3 Bronze 구현 내부, M5 Airflow/MinIO 구현, M6 AI Query 구현, Taxi delivery seed
- Changed: `scripts/week2_m1_synthetic_raw.py`와 focused `unittest`를 추가하고, local ignored `data/` 아래 M1 최소 synthetic raw seed를 생성했다.
- Verified: `python3 -m unittest tests/test_week2_m1_synthetic_raw.py`; JSONL 10,000행 parse/6필드 검증; manifest/summary JSON validation; `Week2LocalRunner` smoke with existing `contracts/workflow_definition.sample.json`; `scripts/validate-harness.sh`; `scripts/validate-harness.sh --strict`; after merging `origin/main` `de261e5`, reran focused unittest, local runner smoke, and strict harness validation
- Remaining: M3 handoff, Option 2 100,000행 확장 여부, Taxi delivery seed 후속 여부
- Next context: M3에는 `data/week2/mvp_synthesis/raw_demo/reviews_seed.jsonl`, manifest/summary path, sample 3줄, known limitation을 전달한다.
- Risk: generated data is local and ignored by git; 다른 worktree/팀원에게 전달하려면 재생성 명령 또는 별도 파일 전달이 필요하다.

## Verification Commands / 검증 명령

```bash
python3 -m unittest tests/test_week2_m1_synthetic_raw.py
python3 scripts/week2_m1_synthetic_raw.py --category Gift_Cards --review-rows 10000 --product-rows 1000 --events-per-product 3
python3 -m json.tool data/week2/mvp_synthesis/metadata/source_manifest.json
python3 -m json.tool data/week2/mvp_synthesis/metadata/raw_demo_summary.json
PYTHONPATH=backend python3 - <<'PY'
import json
from pathlib import Path
from app.services.week2_local_runner import Week2LocalRunner
source_path = Path('data/week2/mvp_synthesis/raw_demo/reviews_seed.jsonl')
workflow = json.loads(Path('contracts/workflow_definition.sample.json').read_text(encoding='utf-8'))
result = Week2LocalRunner(
    source_config={'connection_ref': {'path': str(source_path)}, 'options': {'encoding': 'utf-8'}},
    output_root=Path('data/results/week2_m1_synthetic_raw_smoke'),
).run(workflow)
print(json.dumps({'status': result.status, 'row_count': result.row_count, 'output_row_count': result.output_row_count, 'output_path': result.output_path}, indent=2))
PY
scripts/validate-harness.sh
scripts/validate-harness.sh --strict
```

## Generated Local Artifacts / 생성된 로컬 산출물

- `data/external/amazon-reviews-2023/raw/review_categories/Gift_Cards.jsonl`
- `data/external/amazon-reviews-2023/raw/meta_categories/meta_Gift_Cards.jsonl`
- `data/week2/mvp_synthesis/raw_demo/reviews_seed.jsonl` - 10,000 rows
- `data/week2/mvp_synthesis/raw_demo/product_master_seed.jsonl` - 1,000 rows
- `data/week2/mvp_synthesis/raw_demo/behavior_events_seed.jsonl` - 3,000 rows
- `data/week2/mvp_synthesis/metadata/source_manifest.json`
- `data/week2/mvp_synthesis/metadata/raw_demo_summary.json`

## M3 Handoff Summary / M3 전달 요약

- Review seed path: `data/week2/mvp_synthesis/raw_demo/reviews_seed.jsonl`
- Required fields: `review_id`, `product_id`, `rating`, `review_text`, `review_time`, `verified_purchase`
- Connector/app type: `json`
- Logical shape/profile: `amazon_reviews_json`
- Data origin: `demo_synthetic_raw`
- Known limitation: behavior events are synthetic, Taxi delivery seed is not included, this must not be presented as production shopping behavior.

Sample 3 rows:

```jsonl
{"review_id":"R000001","product_id":"B00IX1I3G6","rating":5.0,"review_text":"Having Amazon money is always good.","review_time":"2019-02-11T06:22:38Z","verified_purchase":true}
{"review_id":"R000002","product_id":"B005ESMMWW","rating":5.0,"review_text":"Always the perfect gift.  I have never given one and had someone seem or act disappointed.  Just the opposite.  They are thrilled and excited to have a bit of a spree.  Always the perfect size and color!  Arrives in 1 day in most cases.  So it's never too late!  Lots of cards to chose from... thank you... birthday... wedding..baby..  and many that work for many occasions...","review_time":"2020-09-12T01:45:58Z","verified_purchase":false}
{"review_id":"R000003","product_id":"B005S28ZES","rating":5.0,"review_text":"When you have a person who is hard to shop for.. an amazon gift card is P E R F E C T.  Man or woman...  No matter what their hobby... lifestyle.. or age.  All you have to do is pick the $.  Don't forget to mention that it is a GIFT when you check out - you will have some gift card options.  I've ordered many of these over years.  They are always received with glee.  Woo hoo!  If you're looking for a great fit for me - this is just my size!  :)  Best to all!","review_time":"2018-09-03T01:58:49Z","verified_purchase":true}
```
