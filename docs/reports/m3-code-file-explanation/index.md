# M3 Logical L0-L16 코드 파일 정성 해설 인덱스

이 문서는 사용자가 요청한 “M3 전체 코드 파일을 파일별로 한 줄씩에 가깝게 설명”하기 위한 해설 묶음이다. 실제 물리적 빈 줄과 닫는 괄호까지 별도 항목으로 늘리면 의미가 흐려지므로, 코드 의미가 바뀌는 line range 단위로 쪼갰다. 함수, 상수, 분기, artifact 이름, downstream handoff는 생략하지 않는 것을 기준으로 했다.

시각화 HTML 버전:

- [M3 Logical L0-L16 Code Atlas](D:/NMM_team1/docs/reports/m3-code-file-explanation/index.html)

## 용어 기준

M3는 두 가지 번호 체계를 동시에 쓴다.

- **논리 단계는 L0-L16이 맞다.** 우리가 최종 설계에서 확장한 단계는 `tools/m3_contract/layer_map.py`의 `LOGICAL_LAYERS` 기준이다.
- **물리 폴더와 일부 함수명은 l0-l10으로 남아 있다.** 기존 artifact id, report, runner와 호환하려고 `l0/`부터 `l10/` 폴더와 `build_l0()`부터 `build_l10()` 함수를 유지한다.
- 따라서 `l10_handoff.py`, `build_l10()`, `l10/catalog_sync_contract_package.json`은 “논리 L10”이 아니라 **물리 l10에 저장되는 논리 L16 handoff 단계**다.
- 파일명이나 과거 문구에 `l0_l10`이 붙은 runner는 정확히는 **legacy physical l0-l10 Spark 검증 하네스**이며, 그 안의 의미 단계는 확장된 L0-L16 계약을 따라간다.

서브 에이전트 분담:

- Agent 1: `tools/m3_contract/__init__.py`, `cli.py`, `common.py`, `l0_raw.py`, `l1_bronze.py`, `l2_profile.py`, `l3_recommend.py`, `l4_recommendation.py`
- Agent 2: `tools/m3_contract/l5_decision.py`, `l6_compiler.py`, `l7_silver_preview.py`, `l8_gold_preview.py`, `l9_gate.py`, `l10_handoff.py`, `layer_map.py`
- Agent 3: M3 wrapper runner, Spark validation runner, product health runner, tests, product health contract fixtures

작성 기준:

- 자동 생성 스크립트로 문서를 만들지 않았다.
- 각 파일을 실제 코드 흐름 기준으로 읽고, 주요 line range별 역할을 직접 설명했다.
- “M3가 직접 실행하는 것”과 “M3가 M2/M5/M6에 넘기는 계약”을 구분했다.
- product health Gold, risk score, vector handoff는 실제 발표/계약에서 혼동되기 쉬우므로 별도 설명을 붙였다.

## Logical L0-L16 코드 책임 지도

| Logical Layer | 코드 책임 | 주 대상 파일 |
| --- | --- | --- |
| `L0` | raw source unit/object/window identity, checksum, replay pointer 생성 | `tools/m3_contract/l0_raw.py` |
| `L1` | Bronze envelope sample, rescue lane, parse failure 보존 계약 생성 | `tools/m3_contract/l1_bronze.py` |
| `L2` | CSV/JSON/JSONL/Parquet/text profile, schema fingerprint, data shape snapshot 생성 | `tools/m3_contract/l2_profile.py` |
| `L3` | AI-safe evidence reduction, PII redaction, bounded input pack 생성 | `tools/m3_contract/l3_recommend.py` |
| `L4` | metadata/template/vector retrieval 후보 생성 | `tools/m3_contract/l3_recommend.py` |
| `L5` | Gold/Product-health 후보 grounding gate 생성 | `tools/m3_contract/l3_recommend.py` |
| `L6` | Bronze -> Silver cleaning policy recommendation draft 생성 | `tools/m3_contract/l4_recommendation.py` |
| `L7` | Silver -> Gold model/product-health/risk score recommendation draft 생성 | `tools/m3_contract/l4_recommendation.py` |
| `L8` | vector/semantic handoff draft와 AI generation trace 생성 | `tools/m3_contract/l4_recommendation.py` |
| `L9` | 사용자 Silver/Gold/Gold-to-Gold/risk/vector decision과 approval state 생성 | `tools/m3_contract/l5_decision.py` |
| `L10` | Silver deterministic preview-only transform spec 생성 | `tools/m3_contract/l6_compiler.py` |
| `L11` | Gold deterministic preview-only generation spec 생성 | `tools/m3_contract/l6_compiler.py` |
| `L12` | compiler validation, unsupported action report, transform graph 생성 | `tools/m3_contract/l6_compiler.py` |
| `L13` | Silver preview evidence/PII/query exposure validation artifact 생성 | `tools/m3_contract/l7_silver_preview.py` |
| `L14` | Gold preview/readiness/metric definition/caveat artifact 생성 | `tools/m3_contract/l8_gold_preview.py` |
| `L15` | processing quality, catalog safety, Gold readiness 3-axis gate 생성 | `tools/m3_contract/l9_gate.py` |
| `L16` | M5 catalog sync, M6 SQL/query/vector context handoff package 생성 | `tools/m3_contract/l10_handoff.py` |

문서 목록:

1. [M3 Core Logical L0-L8 코드 해설](D:/NMM_team1/docs/reports/m3-code-file-explanation/01-core-l0-l4.md)
2. [M3 Core Logical L9-L16 및 Layer Map 코드 해설](D:/NMM_team1/docs/reports/m3-code-file-explanation/02-core-physical-l5-l10-logical-l9-l16-layer-map.md)
3. [M3 Logical L0-L16 Runner, Product Health, Tests, Contracts 해설](D:/NMM_team1/docs/reports/m3-code-file-explanation/03-runners-product-health-tests-contracts.md)

핵심 흐름:

```text
CLI
  -> Logical L0  raw source unit manifest
  -> Logical L1  bronze envelope / rescue lane
  -> Logical L2  profile / data shape snapshot
  -> Logical L3  AI-safe evidence reduction
  -> Logical L4  metadata and template retrieval
  -> Logical L5  candidate grounding gate
  -> Logical L6  Silver recommendation draft
  -> Logical L7  Gold recommendation draft
  -> Logical L8  vector and semantic handoff draft
  -> Logical L9  user decision / approval state
  -> Logical L10 Silver deterministic spec compiler
  -> Logical L11 Gold deterministic spec compiler
  -> Logical L12 compiler validation / unsupported action gate
  -> Logical L13 Silver preview evidence gate
  -> Logical L14 Gold preview readiness gate
  -> Logical L15 three-axis readiness gate
  -> Logical L16 catalog / SQL / vector handoff package
```

중요한 주의점:

- `tools/m3_contract/*`는 M3 core 계약 생성 코드다.
- `tools/m3_l0_l6_spark_contract_pipeline.py`와 `tools/m3_weighted_window_parallel_runner.py`는 로컬 Spark/MinIO 검증 하네스다. 실제 M3 production core라고 말하면 안 된다.
- `tools/product_health_reference_transform.py`와 `tools/product_health_spark_validation.py`는 product-health Gold 의미가 실행 가능한지 검증하는 reference/harness다.
- `contracts/product_health_*.sample.json`은 코드가 아니지만, product-health Gold 계약의 고정 기준이라 같이 설명했다.
- `tests/*m3*`, `tests/*product_health*`는 지금 M3가 주장하는 계약을 깨지 않게 막는 보증 코드다.
