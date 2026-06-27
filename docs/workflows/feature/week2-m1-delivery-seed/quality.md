# Week2 M1 delivery synthetic auxiliary seed 품질 게이트

이 파일은 이 branch의 TDD, check, CI/CD 증거를 기록한다.

- Quality gate status: passed

## TDD Plan / TDD 계획

- Applies: yes, focused unit coverage for deterministic mapping and invalid-row filtering
- Reason: Taxi row 변환, source month 필터, required field summary가 생성 결과의 핵심 로직이다.
- Failing test first: not recorded separately; focused tests were added with implementation in this small local data phase.
- Expected failure command/result: not recorded separately.
- Pass command/result: `python3 -m unittest tests/test_week2_m1_delivery_seed.py` passed, 5 tests.
- Refactor notes: generated data creation is isolated in `scripts/week2_m1_delivery_seed.py`.

## Branch Checks / 브랜치 검증

| Check | Command | Result | Evidence |
| --- | --- | --- | --- |
| lint | not applicable | skipped | no project lint target for scripts |
| unit/focused test | `python3 -m unittest tests/test_week2_m1_delivery_seed.py` | passed | 5 tests |
| download HEAD check | `curl -L -I --max-time 30 https://d37ci6vzurychx.cloudfront.net/trip-data/yellow_tripdata_2024-01.parquet` | passed | `HTTP/2 200`, `content-length: 49961641` |
| download | `curl -L --fail --continue-at - --output data/external/nyc-taxi/yellow_tripdata_2024-01.parquet ...` | passed | local file `48M` |
| checksum | `shasum -a 256 data/external/nyc-taxi/yellow_tripdata_2024-01.parquet` | passed | `c4d59da7bbc8abaeeeb1727947ee93d9891a71acb42854bd80db1571b2030510` |
| parquet magic | Python first/last 4 bytes check | passed | `PAR1` / `PAR1` |
| generation prompt reflected | workspace document review | passed | `plan.md`에 delivery seed 생성 목표/shape/검증 기준 반영 |
| local dependency discovery | Python import checks and `backend/requirements.txt` review | passed | repo already has `pyarrow==18.1.0`; default desktop Python lacks local `pyarrow`; temporary target used only for this run |
| temporary parquet engine | bundled Python pip target install | passed | installed `pyarrow 24.0.0` to `/tmp/asklake_pyarrow_runtime`; repo dependency unchanged because backend requirement already exists |
| delivery generation | `PYTHONPATH=/tmp/asklake_pyarrow_runtime ... scripts/week2_m1_delivery_seed.py --limit 100000` | passed | JSONL and Parquet copy generated |
| JSONL validation | Python validation script | passed | 100,000 rows, required fields present, synthetic flag true, `late_minutes` present, late flags boolean, source hash present |
| metadata JSON validation | `python3 -m json.tool ...` | passed | `source_manifest.json` and `raw_demo_summary.json` valid |
| parquet copy read validation | bundled Python + temp `pyarrow` `pd.read_parquet(...)` | passed | 100,000 rows |
| build/typecheck | not applicable | skipped | frontend/backend runtime 변경 없음 |
| harness validation | `scripts/validate-harness.sh --strict` | passed | Harness validation passed |
| strict harness validation | `scripts/validate-harness.sh --strict` | passed | Harness validation passed |

## CI/CD Gate / CI-CD 게이트

- CI required: no for local generated data task
- CI result: not applicable
- Deploy/publish required: no
- Deployment confirmation: not applicable
- Rollback/smoke notes: local ignored generated files can be removed and regenerated with `scripts/week2_m1_delivery_seed.py`.

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| permanent dependency install | Phase rule avoids adding large parquet dependency to repo/env for generated local data | not required |
