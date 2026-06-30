# Legacy Reference: M3 Expanded Layer Contract

> 이 문서는 과거 L0-L10 확장 초안이다. 최신 canonical 기준은 [M3 Logical L0-L16 설계 해설서](l0-l16-design.md), [M3 Logical L0-L16 핵심 흐름과 판단 기준](l0-l16-core-flow-judgement.md), [M3 Logical L0-L16 Selected Improvement Contract v2.1.1](selected-improvement-contract-v2.1.1-l0-l16.md)이다.

- 대상: unknown CSV/JSON/JSONL/Parquet source를 L2 profile 이후 AI 추천, Silver/Gold 결정, deterministic spec, catalog handoff까지 넘기는 M3 계약
- 결론: 기존 `L0-L6`은 실행 보고서로는 동작했지만, 실제 제품/팀 역할 계약으로는 `L3`와 `L4`가 과밀하다.
- 과거 기준: 이 문서는 당시 `L0-L10`으로 재분해한 초안이다. 현재 최신 기준은 이 초안을 더 쪼갠 logical `L0-L16`이며, 최신 설계는 `l0-l16-design.md`와 `selected-improvement-contract-v2.1.1-l0-l16.md`를 따른다.
- 중요한 정정: `gpt-5.3-codex-spark`는 Apache Spark 실행 단계가 아니라, `L4 AI Recommendation Draft`에서 쓰는 모델 슬롯으로 둔다.

## 왜 다시 쪼개야 하는가

기존 구조에서 `L3`는 `recommendation_evidence_reducer.json`, `bronze_to_silver_recommendation.json`, `silver_to_gold_recommendation.json`, `approval_decision.json`을 모두 포함했다. 이러면 AI가 실제로 무엇을 받았는지, Silver 추천과 Gold 추천이 각각 어떤 기준으로 나왔는지, 사용자가 어디서 수정하는지, 승인 전후 상태가 어디서 갈리는지 한 단계 안에 섞인다.

기존 `L4`도 너무 크다. `silver_transform_spec.json`, `gold_generation_spec.json`, `layered_transform_graph.json`, `compiler_validation_result.json`, `silver_preview_validation_result.json`, `gold_preview_validation_result.json`이 모두 `L4`에 들어갔다. 이 상태에서는 deterministic spec 생성, Spark preview, Silver 구조 검증, Gold semantic readiness가 한 단계처럼 보인다. 실제로는 서로 다른 실패 원인과 책임자를 가진다.

따라서 새 구조는 `AI가 판단하는 단계`, `사용자가 수정/승인하는 단계`, `M2가 실행 가능한 deterministic spec으로 컴파일하는 단계`, `Silver 검증`, `Gold 검증`, `catalog handoff`를 분리한다.

## 새 계층 요약

| Layer | 이름 | 실제 From | 실제 To | 핵심 역할 |
| --- | --- | --- | --- | --- |
| `L0` | Raw Preservation | `M1 source registration` | `M3 L1 bronze envelope` | 원본 source pointer, checksum, bytes, replay 기준 보존 |
| `L1` | Bronze Envelope | `M3 L0 raw manifest` | `M3 L2 profile snapshot` | parse 실패와 offset을 잃지 않는 bronze envelope/sample lane |
| `L2` | Profile and Schema Snapshot | `M3 L1 bronze samples` | `M3 L3 AI input evidence pack` | unknown 구조를 schema/profile/sketch evidence로 축약 |
| `L3` | AI Input Evidence Pack | `M3 L2 profile/schema/sketch evidence` | `M3 L4 AI recommendation model slot` | L2 evidence를 AI가 볼 수 있는 bounded package로 축약 |
| `L4` | AI Recommendation Draft | `M3 L3 AI input evidence pack` | `M1/M5 L5 recommendation edit and decision` | Codex/AI가 Silver policy와 Gold model 후보를 생성 |
| `L5` | Decision and Edit Contract | `M1 user edits and M5 approval state` | `M3 L6 deterministic spec compiler` | 사용자가 Silver/Gold 추천을 따로 수정/승인 |
| `L6` | Deterministic Spec Compiler | `M3 L5 approved Silver/Gold decisions` | `M2 L7/L8 Spark preview execution` | 승인된 정책을 M2 Spark 실행 spec으로 고정 |
| `L7` | Silver Preview and Structural Validation | `M2 execution of L6 silver_transform_spec` | `M2 L8 Gold preview and M3 L9 quality gate` | Silver preview와 구조/PII/quarantine 검증 |
| `L8` | Gold Preview and Semantic Readiness | `M2 execution of L6 gold_generation_spec over L7 Silver` | `M3 L9 quality/gold readiness gate` | Gold preview와 metric 의미/owner review 판정 |
| `L9` | Quality, Drift, and Quarantine Gate | `M2 L7/L8 preview metrics and M3 gate rules` | `M5/M6 L10 catalog and semantic handoff` | drift, replay, schema compatibility, quality gate 통합 |
| `L10` | Catalog Metadata and Semantic Handoff | `M3 L0-L9 artifact references and gate results` | `M5 catalog API/storage and M6 SQL/AI query context` | M5/M6에 넘길 catalog, lineage, SQL context package |

실제 module 흐름은 `M1 source registration -> M3 profiling/recommendation/spec contract -> M2 Silver/Gold preview execution -> M3 quality/readiness gate -> M5 catalog storage -> M6 SQL/AI query context`다.

`M4`는 현재 실제 handoff path에 넣지 않는다. 팀에서 M4를 구체적인 execution/result producer로 배정할 때만 추가한다.

## L3과 L4의 새 의미

`L3`는 더 이상 "AI 추천 결과"가 아니다. `L3`는 AI가 볼 입력을 만드는 deterministic reduction layer다. 여기서 해야 할 일은 row-level raw data를 AI에게 넘기지 않도록 막고, L2 profile에서 필요한 evidence만 추려 `ai_recommendation_input_pack.json`을 만드는 것이다. 이 파일에는 field name, type, null ratio, capped examples, field class 후보, source format, sketch 요약, drift hint, existing policy hint 정도만 들어간다.

`L4`가 실제 AI 호출 위치다. 여기서 `gpt-5.3-codex-spark` 같은 모델 슬롯을 사용한다. 단, 모델은 raw 전체를 보지 않고 `L3` input pack만 본다. 출력은 바로 실행되는 코드가 아니라 draft다. Silver 추천과 Gold 추천은 반드시 분리한다.

Silver draft는 column별 action을 제안한다. 예를 들어 `keep`, `rename`, `cast`, `flatten_or_json_string`, `hash_for_join_or_hide_from_default_catalog`, `mask_or_hash`, `review_or_drop`, `quarantine_if_invalid` 같은 정책을 만든다.

Gold draft는 metric/table 후보를 만든다. 예를 들어 grain, dimensions, measures, filters, window, watermark, freshness SLA, caveats, owner review 필요 여부를 제안한다. Gold는 business semantic이 들어가므로 fallback row count 같은 후보는 기본적으로 `needs_owner_review`다.

## Silver와 Gold를 분리해야 하는 이유

Silver는 구조 안정성과 안전한 정제 문제다. source field가 존재하는지, type cast가 가능한지, nested JSON을 어떻게 펼칠지, user/session identifier를 hash/hide할지, parse 실패를 quarantine으로 보낼지 같은 판단이 중심이다.

Gold는 의미 있는 분석 모델을 만드는 문제다. 어떤 grain이 비즈니스적으로 맞는지, 어떤 measure가 유효한지, 평균/합계/카운트가 의미 있는지, time window와 freshness가 맞는지, M6가 질의에 써도 되는 metric인지가 중심이다.

이 둘을 같은 단계로 두면 `Silver는 통과했지만 Gold는 의미가 약한 상태`를 표현하기 어렵다. 이전 실행에서 `processing pass:5`인데 `gold needs_owner_review:3`이 나온 이유도 이 분리가 필요하다는 증거다.

## 현재 L0-L6 산출물의 새 위치

| 현재 산출물 | 새 위치 | 이유 |
| --- | --- | --- |
| `l3/recommendation_evidence_reducer.json` | `L3` | AI 입력 evidence 축약이므로 추천 결과가 아니라 input pack이다. |
| `l3/bronze_to_silver_recommendation.json` | `L4-S` | AI/정책 추천 draft다. |
| `l3/silver_to_gold_recommendation.json` | `L4-G` | Gold model 추천 draft다. |
| `l3/approval_decision.json` | `L5` | 사용자가 수정/승인하는 decision layer다. |
| `l4/silver_transform_spec.json` | `L6-S` | approved Silver policy를 deterministic spec으로 컴파일한 결과다. |
| `l4/gold_generation_spec.json` | `L6-G` | approved Gold policy를 deterministic spec으로 컴파일한 결과다. |
| `l4/compiler_validation_result.json` | `L6-C` | spec compiler가 금지 패턴과 실행 가능성을 검증한 결과다. |
| `l4/silver_preview_validation_result.json` | `L7` | Silver 구조 검증이다. |
| `l4/gold_preview_validation_result.json` | `L8` | Gold preview와 semantic readiness 검증이다. |
| `l5/*` | `L9` | quality, drift, quarantine, replay gate다. |
| `l6/*` | `L10` | catalog, lineage, SQL context handoff다. |

## 새 실행 흐름

```text
L0 Raw Preservation
-> L1 Bronze Envelope
-> L2 Profile and Schema Snapshot
-> L3 AI Input Evidence Pack
-> L4 AI Recommendation Draft
   -> L4-S Silver policy draft
   -> L4-G Gold model draft
-> L5 Decision and Edit Contract
   -> L5-S approved Silver decision
   -> L5-G approved Gold decision
-> L6 Deterministic Spec Compiler
   -> L6-S Silver TransformSpec
   -> L6-G Gold GenerationSpec
   -> L6-C compiler validation
-> L7 Silver Preview and Structural Validation
-> L8 Gold Preview and Semantic Readiness
-> L9 Quality, Drift, and Quarantine Gate
-> L10 Catalog Metadata and Semantic Handoff
```

## 모델 슬롯 위치

`gpt-5.3-codex-spark`는 `L4`에서만 쓰인다. 여기서 모델의 책임은 추천 draft를 만드는 것이다. 이 모델이 production data-plane에서 모든 row를 실시간 처리한다고 말하면 안 된다.

모델 입력은 `L3/ai_recommendation_input_pack.json`이고, 모델 출력은 `L4/silver_policy_recommendation_draft.json`, `L4/gold_model_recommendation_draft.json`, `L4/ai_generation_trace.json`이다.

`L6` 이후는 AI가 아니라 deterministic compiler와 M2 Spark 실행 계약이다. 즉, AI가 만드는 것은 추천/초안이고, 실행 가능한 형태로 고정하는 것은 compiler layer다.

## 실제 Handoff 경계

| 구간 | 실제 이동 |
| --- | --- |
| Source -> M3 | `M1`이 source registration/source config를 만들고 `M3 L0`이 raw preservation 계약으로 받는다. |
| M3 internal recommendation | `L0-L3`가 deterministic evidence를 만들고 `L4`에서 AI recommendation draft를 생성한다. |
| Human/edit state | `L4` draft는 `M1/M5 L5`로 가서 사용자가 Silver/Gold를 각각 수정하고 승인한다. |
| M3 -> M2 | `L6` deterministic spec이 `M2`의 Silver/Gold preview 실행 입력으로 넘어간다. |
| M2 -> M3/M5 | `L7-L8` preview 결과와 metrics가 `L9` gate 및 `M5` run evidence로 넘어간다. |
| M3/M5 -> M6 | `L10` catalog/semantic handoff가 `M5` catalog에 저장되고 `M6` query context로 넘어간다. |

## 적용 판단

기존 `L0-L6` 실행 결과는 폐기할 필요가 없다. 다만 발표나 구현 계약에서는 `L0-L6`이라고 부르면 L3/L4가 너무 넓게 보인다. 이 문서가 작성될 당시에는 `L0-L10`으로 보여주는 편이 맞다고 판단했지만, 현재 기준에서는 내부 파일 경로가 당장 `l3/`, `l4/`로 남아 있어도 문서와 UI에서는 logical `L0-L16` 의미로 보여주는 편이 맞다.

특히 사용자가 화면에서 수정해야 하는 지점은 `L5`다. `L4`의 AI draft를 바로 실행하지 않고, `L5`에서 Silver와 Gold를 각각 수정/승인한 뒤 `L6`에서 deterministic spec으로 고정해야 한다.
