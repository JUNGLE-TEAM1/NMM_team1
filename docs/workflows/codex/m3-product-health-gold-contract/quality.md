# M3 product-health Gold contract quality

- Quality gate status: passed

## TDD Plan / TDD 계획

- Applies: yes
- Reason: product-health 계약과 reference transform의 schema, metric, edge case를 고정해야 한다.
- Failing test first: not applicable in this recovery pass; tests were added with implementation.
- Expected failure command/result: not applicable
- Pass command/result: `python -m pytest tests\test_product_health_reference_transform.py tests\test_product_health_contracts.py -q` -> 8 passed
- Refactor notes: output cap과 identity guard를 찾은 뒤 runner/test/contract를 함께 보강했다.

## 검증 결과

| 검증 | 명령/대상 | 결과 |
| --- | --- | --- |
| focused product-health tests | `python -m pytest tests\test_product_health_reference_transform.py tests\test_product_health_contracts.py -q` | 8 passed |
| M3 expanded contract regression | `python -m pytest tests\test_product_health_reference_transform.py tests\test_product_health_contracts.py tests\test_m3_expanded_contract.py -q` | 14 passed |
| Python syntax | `python -m py_compile tools\product_health_reference_transform.py tools\product_health_spark_validation.py` | passed |
| JSON fixtures | `python -m json.tool contracts\product_health_*.sample.json` | passed |
| whitespace | `git diff --check` | passed, line-ending warnings only |
| 실제 F 데이터 smoke | `tools\product_health_reference_transform.py` with Amazon reviews, Amazon metadata, Taobao behavior bounded windows | passed |

## 실제 F 데이터 smoke 핵심 수치

- input_total_bytes: 955,514,539
- input_total_rows_scanned: 150,000
- full_product_universe_count: 133,646
- row_count: 133,646
- output_truncated: false
- truncated_product_count: 0
- risk_score non-null: 79,762

## 발견 후 수정한 문제

- Debug output cap 때문에 product universe 일부가 잘릴 수 있었는데 summary에 명확히 드러나지 않았다. 기본 cap을 no cap으로 바꾸고 `output_truncated`, `truncated_product_count`를 추가했다.
- 서로 다른 source domain을 한 번에 넣은 reference smoke가 catalog-ready Gold처럼 과장될 수 있었다. `cross_source_identity_guard`와 `catalog_ready_claim=false`를 summary와 계약에 추가했다.

## CI/CD Gate / CI-CD 게이트

- CI required: yes
- CI result: PR checks pending at creation; local required M3 checks passed.
- Deploy/publish required: no
- Deployment confirmation: not required
- Rollback/smoke notes: contract-only PR라 production deploy rollback은 없다.

## Skipped Checks / 생략한 검증

| Check | Reason | Human Confirmed |
| --- | --- | --- |
| Full `python -m pytest -q` | Local default Python environment has existing backend import/optional dependency gaps outside this M3 PR. | no |
