# Legacy Reference: M3 L0-L10 Selected Improvement Contract v2.1

> 이 문서는 과거 L0-L10 v2.1 계약이다. 최신 canonical 기준은 [M3 Logical L0-L16 Selected Improvement Contract v2.1.1](selected-improvement-contract-v2.1.1-l0-l16.md)이다.

## 0. 판정

v2.1은 선택 후보를 다시 고르는 문서가 아니다. `L0-C`, `L1-A`, `L2-B`, `L3-B`, `L4-A`, `L5-A`, `L6-A`, `L7-B`, `L8-C`, `L9-A`, `L10-C` 조합은 유지한다.

이번 문서의 목적은 세 리뷰에서 공통으로 나온 P0급 실행 충돌만 core 계약에 반영하는 것이다. v2에서 이미 잘 잡은 구조, AI 경계, Silver/Gold 분리, L6 deterministic compiler, L9 three-axis gate, L10 M5/M6 handoff는 유지한다.

v2.1 core에 반영하는 것은 아래 10개다.

1. `source_unit_id` 또는 object window id 도입
2. 모든 `*_ref`는 string `artifact_id`로 통일하고 `artifact_reference_manifest`에서 resolve
3. `L4/gold_model_recommendation_draft.json` schema 추가
4. `L5/approval_state.json` schema 추가
5. `L6/compiler_validation_result.json`과 `L6/unsupported_action_report.json` schema 추가
6. L6 preview spec은 `write_mode=preview_only`만 허용
7. L9 three-axis precedence rule 확정
8. Gold `not_requested`/`deferred` 상태의 L9/L10 공식 추가
9. operation별 `params` schema 추가
10. PII/query context validator rule 추가

stream runtime, watermark, schema drift, production execution, unstructured/retrieval은 core에 억지로 넣지 않는다. 이 항목들은 확장 hook으로만 둔다.

## 1. Core Scope

### 1.1 Core에 포함되는 범위

Core는 unknown CSV, JSON, JSONL, Parquet source를 안전하게 onboarding하고, AI-assisted recommendation을 draft로 만들고, 사람이 승인한 뒤, M2 preview 실행용 deterministic spec과 M5/M6 handoff package를 만드는 범위다.

```text
M1 source registration
-> M3 L0 source unit manifest
-> M3 L1 bronze envelope + rescue lane
-> M3 L2 format-specialized profile
-> M3 L3 redacted AI evidence pack
-> M3 L4 Silver/Gold recommendation draft
-> M1/M5 L5 approval state + decision body
-> M3 L6 preview executable spec + compiler validation
-> M2 L7 Silver preview validation
-> M2 L8 Gold preview input report
-> M3 L9 final three-axis gate
-> M5/M6 L10 catalog/query context package
```

### 1.2 Core에 넣지 않는 범위

아래 항목은 중요하지만 v2.1 core schema에 넣지 않는다. 이유는 M3가 preview onboarding과 recommendation/spec handoff를 맡고, full streaming runtime이나 production sink commit까지 맡으면 역할 경계가 흐려지기 때문이다.

| Extension hook | Core에 넣지 않는 이유 |
| --- | --- |
| Stream runtime contract | offset/checkpoint 이상의 runtime semantics는 M2/infra 책임과 결합된다. |
| Watermark/late event policy | Gold streaming 운영에는 필요하지만 core CSV/JSON onboarding의 필수 조건은 아니다. |
| Schema drift/evolution report | 반복 운영 품질에는 필요하나 첫 schema/spec contract freeze에는 hook만 있으면 된다. |
| Production execution report | L7/L8은 preview다. production run은 별도 M2 report contract로 분리한다. |
| Unstructured/retrieval contract | PDF/image/audio/RAG는 SQL/Silver/Gold core보다 큰 별도 feature family다. |

## 2. Common Artifact Contract

### 2.1 Artifact header

모든 JSON artifact는 `artifact_header`를 가진다. JSONL은 record마다 header를 반복하지 않고 sidecar manifest에 둔다.

```json
{
  "artifact_header": {
    "source_id": "string",
    "run_id": "string",
    "artifact_id": "string",
    "artifact_name": "string",
    "artifact_version": "string",
    "schema_version": "string",
    "created_at": "ISO-8601 string",
    "producer": "M1|M2|M3|M5|M6",
    "access_class": "raw_restricted|profile_internal|ai_safe|catalog_internal|catalog_public|query_context_safe"
  }
}
```

### 2.2 Ref rule

v2.1에서 모든 `*_ref` field는 string `artifact_id`다. Full URI, checksum, byte size, logical path는 `artifact_reference_manifest.json`에서 resolve한다.

좋은 예:

```json
{
  "silver_spec_ref": "artifact_l6_silver_transform_spec_001",
  "gate_summary_ref": "artifact_l9_gate_summary_001",
  "artifact_reference_manifest_ref": "artifact_l10_reference_manifest_001"
}
```

나쁜 예:

```json
{
  "silver_spec_ref": {
    "physical_uri": "s3://bucket/path/file.json",
    "checksum": "sha256:..."
  }
}
```

### 2.3 `artifact_reference_manifest.json`

```json
{
  "artifact_header": {
    "source_id": "string",
    "run_id": "string",
    "artifact_id": "string",
    "artifact_name": "artifact_reference_manifest",
    "artifact_version": "string",
    "schema_version": "m3.common.artifact_reference_manifest.v2_1",
    "created_at": "ISO-8601 string",
    "producer": "M3",
    "access_class": "catalog_internal"
  },
  "artifacts": [
    {
      "artifact_id": "string",
      "artifact_name": "string",
      "artifact_version": "string",
      "logical_path": "m3_runs/{source_id}/{run_id}/lX/file.json",
      "physical_uri": "string",
      "content_type": "application/json|application/jsonl|text/plain|application/octet-stream",
      "checksum": "sha256:...",
      "byte_size": 0,
      "producer": "M1|M2|M3|M5|M6",
      "access_class": "raw_restricted|profile_internal|ai_safe|catalog_internal|catalog_public|query_context_safe"
    }
  ]
}
```

## 3. L0 Source Unit Contract

### 3.1 선택 이유

L0-C는 object file과 stream window를 같은 manifest model로 표현하려는 선택이다. v2의 문제는 stream에는 `window_id`가 있지만 object-only source에는 L1이 받을 공통 window id가 없다는 점이었다.

v2.1은 `source_unit_id`를 도입한다. `source_unit_id`는 object batch, stream window, hybrid window를 모두 대표하는 공통 processing unit이다.

### 3.2 장점

- object-only CSV/JSONL도 L1에서 공통 unit으로 추적할 수 있다.
- stream micro-batch와 file landing batch를 같은 reconciliation 구조로 처리할 수 있다.
- L9/L10 lineage가 object id와 stream offset 중 어느 쪽이든 같은 unit id를 기준으로 이어진다.

### 3.3 단점과 한계

- source unit 생성 규칙을 정해야 한다. 예를 들어 object 1개를 unit 1개로 볼지, partition 묶음을 unit 1개로 볼지 결정해야 한다.
- 실시간 runtime의 delivery semantics까지 보장하지 않는다.
- full production checkpoint나 commit 상태는 core L0이 아니라 extension hook에서 다룬다.

### 3.4 `object_stream_manifest.json`

```json
{
  "artifact_header": {
    "source_id": "string",
    "run_id": "string",
    "artifact_id": "string",
    "artifact_name": "object_stream_manifest",
    "artifact_version": "string",
    "schema_version": "m3.l0.object_stream_manifest.v2_1",
    "created_at": "ISO-8601 string",
    "producer": "M3",
    "access_class": "catalog_internal"
  },
  "source_kind": "object|stream|hybrid",
  "declared_format": "csv|json|jsonl|parquet|unknown",
  "source_units": [
    {
      "source_unit_id": "string",
      "source_unit_type": "object_batch|stream_window|hybrid_window",
      "object_ids": ["string"],
      "stream_window_ids": ["string"],
      "ingest_time_range": {
        "start": "ISO-8601 string|null",
        "end": "ISO-8601 string|null"
      }
    }
  ],
  "objects": [
    {
      "object_id": "string",
      "source_unit_id": "string",
      "uri": "string",
      "etag": "string|null",
      "checksum": "sha256:...|null",
      "byte_size": 0,
      "compression": "none|gzip|zstd|unknown",
      "partition_values": {},
      "modified_at": "ISO-8601 string|null"
    }
  ],
  "stream_windows": [
    {
      "stream_window_id": "string",
      "source_unit_id": "string",
      "stream_name": "string",
      "partition": "string|number|null",
      "start_offset": "string|number|null",
      "end_offset": "string|number|null",
      "checkpoint_ref": "string|null",
      "event_time_min": "ISO-8601 string|null",
      "event_time_max": "ISO-8601 string|null",
      "ingest_time_min": "ISO-8601 string|null",
      "ingest_time_max": "ISO-8601 string|null"
    }
  ]
}
```

### 3.5 L0 validation

| 조건 | 판정 |
| --- | --- |
| `source_kind=object` and `source_units[]` non-empty and `objects[]` non-empty | pass 가능 |
| `source_kind=stream` and `source_units[]` non-empty and `stream_windows[]` non-empty | pass 가능 |
| `source_kind=hybrid` and `source_units[]`, `objects[]`, `stream_windows[]` all non-empty | pass 가능 |
| object-only source에 `source_unit_id` 없음 | block |
| `source_unit_id`가 object/stream_window 어디에서도 참조되지 않음 | block |

## 4. L1 Bronze Envelope and Rescue Lane

### 4.1 선택 이유

L1-A는 parse 성공 record와 parse 실패 record를 둘 다 보존한다. unknown CSV/JSON/JSONL에서는 malformed row나 encoding error를 버리면 profile과 quality 판단이 왜곡된다.

### 4.2 가능 범위

- CSV row, JSONL line, JSON array element, Parquet row-group sample을 record 단위로 추적한다.
- Parse failure는 `rescue_lane.jsonl`로 분리하되 같은 `source_unit_id`를 유지한다.
- L2 profile은 정상 sample만 볼 수도 있고 rescue summary를 함께 볼 수도 있다.

### 4.3 한계

- L1은 정제 단계가 아니다. type cast, semantic rename, PII masking 결정은 뒤 단계에서 한다.
- Raw payload 전체를 catalog에 공개하면 안 된다.
- JSONL record가 많아질 수 있으므로 artifact header를 record마다 반복하지 않는다.

### 4.4 JSONL sidecar rule

```text
l1/bronze_envelope_samples.manifest.json
l1/bronze_envelope_samples.jsonl
l1/rescue_lane.manifest.json
l1/rescue_lane.jsonl
```

`*.manifest.json`은 `artifact_header`를 가진다. `.jsonl` record는 record-level 필드만 가진다.

### 4.5 record locator

```json
{
  "record_locator": {
    "object_id": "string|null",
    "line_number": "number|null",
    "byte_start": "number|null",
    "byte_end": "number|null",
    "json_path": "string|null",
    "parquet_row_group": "string|number|null",
    "stream_partition": "string|number|null",
    "stream_offset": "string|number|null"
  }
}
```

Validation rule:

```text
record_locator는 모든 field를 채울 필요가 없다.
하지만 source_unit을 replay할 수 있는 locator 하나 이상은 반드시 있어야 한다.
```

### 4.6 bronze record

```json
{
  "record_id": "string",
  "source_ref": "string",
  "source_unit_id": "string",
  "object_ref": "string|null",
  "stream_ref": "string|null",
  "stream_window_id": "string|null",
  "record_locator": {
    "object_id": "string|null",
    "line_number": "number|null",
    "byte_start": "number|null",
    "byte_end": "number|null",
    "json_path": "string|null",
    "parquet_row_group": "string|number|null",
    "stream_partition": "string|number|null",
    "stream_offset": "string|number|null"
  },
  "parse_status": "parsed",
  "source_format": "csv|json|jsonl|parquet|unknown",
  "payload": {},
  "raw_snippet_ref": "string|null",
  "ingest_time": "ISO-8601 string",
  "event_time_candidate": "ISO-8601 string|null"
}
```

### 4.7 rescue record

```json
{
  "record_id": "string",
  "source_ref": "string",
  "source_unit_id": "string",
  "object_ref": "string|null",
  "stream_ref": "string|null",
  "stream_window_id": "string|null",
  "record_locator": {
    "object_id": "string|null",
    "line_number": "number|null",
    "byte_start": "number|null",
    "byte_end": "number|null",
    "json_path": "string|null",
    "parquet_row_group": "string|number|null",
    "stream_partition": "string|number|null",
    "stream_offset": "string|number|null"
  },
  "parse_status": "parse_failed|encoding_failed|schema_exception|unsupported_format",
  "rescue_reason": "string",
  "rescue_severity": "info|warn|block",
  "raw_snippet_ref": "string|null",
  "raw_snippet_redacted": true,
  "error_class": "string",
  "error_message_sample": "string"
}
```

## 5. L2 Format-specialized Profile Pack

### 5.1 선택 이유

L2-B는 CSV, JSON/JSONL, Parquet evidence를 같은 generic profile로 뭉치지 않는다. format마다 추론해야 할 구조가 다르기 때문이다.

### 5.2 장점

- CSV dialect, JSON path trie, Parquet statistics를 각각 최적화할 수 있다.
- mixed source에서도 여러 `profile_artifacts[]`를 만들 수 있다.
- L3 AI input pack이 format별 핵심 evidence만 받을 수 있다.

### 5.3 단점과 한계

- profiler가 format별로 늘어난다.
- detected format confidence가 낮으면 L4 추천 confidence도 낮춰야 한다.
- schema drift 상세 report는 core에 넣지 않고 extension hook으로 둔다.

### 5.4 `profile_snapshot.json`

```json
{
  "artifact_header": {
    "source_id": "string",
    "run_id": "string",
    "artifact_id": "string",
    "artifact_name": "profile_snapshot",
    "artifact_version": "string",
    "schema_version": "m3.l2.profile_snapshot.v2_1",
    "created_at": "ISO-8601 string",
    "producer": "M3",
    "access_class": "profile_internal"
  },
  "format_router": {
    "detected_format": "csv|json|jsonl|parquet|mixed|unknown",
    "confidence": 0.0,
    "evidence": ["string"]
  },
  "profile_artifacts": [
    {
      "format": "csv|json|jsonl|parquet|unknown",
      "scope": {
        "source_unit_ids": ["string"],
        "object_ids": ["string"],
        "stream_window_ids": ["string"],
        "record_path": "string|null"
      },
      "profile_ref": "string",
      "confidence": 0.0
    }
  ]
}
```

## 6. L3 Redaction-first Evidence Pack

### 6.1 선택 이유

L3-B는 AI 입력 전에 PII, secret, raw text examples를 줄이고 가린다. AI가 raw file, full stream, full rescue lane을 보지 않게 하는 핵심 경계다.

### 6.2 장점

- AI control-plane과 raw data-plane이 분리된다.
- model prompt나 generation trace에 민감 데이터가 섞일 위험이 줄어든다.
- L4 추천이 어떤 evidence를 보고 나왔는지 추적할 수 있다.

### 6.3 단점과 한계

- redaction이 과하면 AI가 field 의미를 놓칠 수 있다.
- free-text가 많은 source는 redaction confidence가 낮을 수 있다.
- unstructured chunk evidence는 core가 아니라 extension hook이다.

### 6.4 `ai_recommendation_input_pack.json`

```json
{
  "artifact_header": {
    "source_id": "string",
    "run_id": "string",
    "artifact_id": "string",
    "artifact_name": "ai_recommendation_input_pack",
    "artifact_version": "string",
    "schema_version": "m3.l3.ai_input_pack.v2_1",
    "created_at": "ISO-8601 string",
    "producer": "M3",
    "access_class": "ai_safe"
  },
  "profile_ref": "string",
  "redaction_policy_version": "string",
  "redaction_map_ref": "string",
  "evidence_budget": {
    "max_fields": 0,
    "max_examples_per_field": 0,
    "max_total_chars": 0
  },
  "field_evidence": [
    {
      "field_id": "string",
      "source_path": "string",
      "inferred_type": "string",
      "nullable_ratio": 0.0,
      "example_values_redacted": [],
      "pii_candidate": true,
      "secret_candidate": false,
      "semantic_hints": ["string"],
      "profile_confidence": 0.0
    }
  ],
  "forbidden_raw_payload": true
}
```

## 7. L4 Strict Recommendation Draft

### 7.1 선택 이유

L4-A는 AI 출력이 자유 텍스트가 아니라 strict draft schema를 따르도록 한다. Silver recommendation과 Gold recommendation은 반드시 분리한다.

### 7.2 장점

- L5 UI가 draft를 안정적으로 편집할 수 있다.
- L6 compiler가 action vocabulary를 검증할 수 있다.
- Silver 구조 정제와 Gold semantic 모델이 섞이지 않는다.

### 7.3 단점과 한계

- schema가 엄격하면 AI output retry가 필요할 수 있다.
- `needs_review`는 compile 가능한 action이 아니므로 L5에서 사람이 처리해야 한다.
- Gold semantic 품질은 AI draft만으로 확정할 수 없다.

### 7.4 Action vocabulary

```json
{
  "allowed_recommendation_actions": [
    "select",
    "rename",
    "cast",
    "parse_timestamp",
    "normalize_null",
    "flatten_struct",
    "explode_array",
    "json_string",
    "mask",
    "hash",
    "drop",
    "quarantine_if_invalid",
    "aggregate",
    "needs_review"
  ]
}
```

`keep`은 쓰지 않는다. `select`를 쓴다.
`flatten`은 쓰지 않는다. `flatten_struct`를 쓴다.

### 7.5 `gold_model_recommendation_draft.json`

```json
{
  "artifact_header": {
    "source_id": "string",
    "run_id": "string",
    "artifact_id": "string",
    "artifact_name": "gold_model_recommendation_draft",
    "artifact_version": "string",
    "schema_version": "m3.l4.gold_draft.v2_1",
    "created_at": "ISO-8601 string",
    "producer": "M3",
    "access_class": "catalog_internal"
  },
  "input_pack_ref": "string",
  "recommendation_schema_version": "string",
  "gold_models": [
    {
      "gold_model_id": "string",
      "gold_model_type": "metric_table|dimension_summary|entity_summary|event_aggregate|needs_review",
      "recommended_action": "aggregate|select|rename|needs_review",
      "source_silver_ref": "string|null",
      "grain": ["string"],
      "dimensions": ["string"],
      "measures": [],
      "semantic_definition": {},
      "freshness_sla": "string|null",
      "caveats": ["string"],
      "owner_review": {
        "required": true,
        "status": "not_requested|required|approved|waived|rejected",
        "review_ref": "string|null"
      },
      "confidence": 0.0
    }
  ],
  "unsupported_actions": [],
  "needs_human_review": []
}
```

## 8. L5 Approval and Decision Contract

### 8.1 선택 이유

L5-A는 Silver approval과 Gold approval을 분리한다. Silver가 승인돼도 Gold는 `not_requested`, `deferred`, `needs_owner_review`, `rejected`일 수 있다.

### 8.2 장점

- Silver-only onboarding이 가능하다.
- Gold semantic 검토가 끝나지 않아도 Silver spec을 만들 수 있다.
- AI draft와 user decision의 차이를 audit할 수 있다.

### 8.3 단점과 한계

- UI에서 approval state가 늘어난다.
- L6 compiler는 approval state와 decision body를 모두 확인해야 한다.
- Gold가 없는 상태의 M6 context를 명확히 표시해야 한다.

### 8.4 `approval_state.json`

```json
{
  "artifact_header": {
    "source_id": "string",
    "run_id": "string",
    "artifact_id": "string",
    "artifact_name": "approval_state",
    "artifact_version": "string",
    "schema_version": "m3.l5.approval_state.v2_1",
    "created_at": "ISO-8601 string",
    "producer": "M1|M5|M3",
    "access_class": "catalog_internal"
  },
  "decision_version": "string",
  "silver": {
    "status": "draft|edited|approved|rejected|deferred",
    "decision_ref": "string|null",
    "approver": "string|null",
    "approved_at": "ISO-8601 string|null",
    "comment": "string|null"
  },
  "gold": {
    "status": "draft|edited|approved|rejected|deferred|needs_owner_review|not_requested",
    "decision_ref": "string|null",
    "approver": "string|null",
    "approved_at": "ISO-8601 string|null",
    "comment": "string|null"
  },
  "can_compile_silver": true,
  "can_compile_gold": false,
  "compile_blocking_reasons": ["string"]
}
```

### 8.5 Decision body rule

`approval_state.json`만으로 L6 compile을 하면 안 된다. L6는 반드시 `silver_policy_decision.json` 또는 `gold_policy_decision.json`의 decision body를 입력으로 받아야 한다.

PII/catalog exposure는 transform action과 분리한다.

```json
{
  "column_decision": {
    "source_path": "string",
    "target_name": "string",
    "transform_action": "select|rename|cast|parse_timestamp|normalize_null|flatten_struct|explode_array|json_string|mask|hash|drop|quarantine_if_invalid",
    "catalog_exposure": "default_visible|hidden|restricted|forbidden",
    "query_context_exposure": "allowed|masked|forbidden",
    "pii_handling": "none|mask|hash|hide_from_default_catalog|needs_review"
  }
}
```

## 9. L6 Preview Spec Compiler

### 9.1 선택 이유

L6-A는 승인된 decision만 M2 preview 실행용 deterministic spec으로 compile한다. AI draft가 바로 실행되면 안 된다.

### 9.2 장점

- M2가 실행할 입력이 free-form text가 아니라 spec이 된다.
- 금지 패턴을 compiler에서 차단할 수 있다.
- unsupported action을 조용히 누락하지 않고 report로 남긴다.

### 9.3 단점과 한계

- allowlist 밖 변환은 바로 처리할 수 없다.
- production write는 core L6 preview spec에 포함하지 않는다.
- 복잡한 stream runtime semantics는 extension hook이다.

### 9.4 Preview write mode

L6 spec이 L7/L8 preview 실행 입력으로 쓰일 때는 `write_mode=preview_only`만 허용한다.

```json
{
  "target": {
    "layer": "silver|gold",
    "table_name": "string",
    "execution_intent": "preview",
    "write_mode": "preview_only"
  }
}
```

### 9.5 Operation params schema

모든 operation은 action별 params schema를 따른다. `params: {}`로만 두면 validator가 실제 실행 가능성을 판단할 수 없다.

```json
{
  "operation_param_schemas": {
    "select": {
      "required": ["source_path", "target_column"],
      "params": {}
    },
    "rename": {
      "required": ["source_path", "target_column"],
      "params": {
        "source_column": "string",
        "target_column": "string"
      }
    },
    "cast": {
      "required": ["source_path", "target_column", "target_type"],
      "params": {
        "target_type": "string",
        "on_error": "null|quarantine|keep_original",
        "format": "string|null"
      }
    },
    "parse_timestamp": {
      "required": ["source_path", "target_column", "format"],
      "params": {
        "format": "string",
        "timezone": "string|null",
        "on_error": "null|quarantine"
      }
    },
    "normalize_null": {
      "required": ["source_path", "target_column"],
      "params": {
        "null_tokens": ["string"],
        "empty_string_as_null": true
      }
    },
    "flatten_struct": {
      "required": ["source_path"],
      "params": {
        "max_depth": 0,
        "name_strategy": "path_join|leaf_name|custom"
      }
    },
    "explode_array": {
      "required": ["source_path"],
      "params": {
        "max_expansion_ratio": 0.0,
        "if_unbounded": "block|needs_review"
      }
    },
    "json_string": {
      "required": ["source_path", "target_column"],
      "params": {
        "preserve_null": true
      }
    },
    "mask": {
      "required": ["source_path", "target_column"],
      "params": {
        "mask_type": "fixed|partial|token",
        "mask_value": "string"
      }
    },
    "hash": {
      "required": ["source_path", "target_column", "hash_policy"],
      "params": {
        "hash_policy": {
          "algorithm": "hmac_sha256",
          "salt_secret_ref": "string",
          "salt_version": "string",
          "rotation_policy_ref": "string"
        }
      }
    },
    "drop": {
      "required": ["source_path", "decision_trace_ref"],
      "params": {
        "drop_reason": "string"
      }
    },
    "quarantine_if_invalid": {
      "required": ["source_path", "rule"],
      "params": {
        "rule": "string",
        "reason": "string",
        "severity": "warn|block"
      }
    },
    "aggregate": {
      "required": ["grain", "measures"],
      "params": {
        "grain": ["string"],
        "dimensions": ["string"],
        "measures": []
      }
    }
  }
}
```

### 9.6 `compiler_validation_result.json`

```json
{
  "artifact_header": {
    "source_id": "string",
    "run_id": "string",
    "artifact_id": "string",
    "artifact_name": "compiler_validation_result",
    "artifact_version": "string",
    "schema_version": "m3.l6.compiler_validation.v2_1",
    "created_at": "ISO-8601 string",
    "producer": "M3",
    "access_class": "catalog_internal"
  },
  "compiler_version": "string",
  "allowlist_version": "string",
  "decision_ref": "string",
  "silver_spec_ref": "string|null",
  "gold_spec_ref": "string|null",
  "silver_compile_status": "pass|warn|block|not_requested",
  "gold_compile_status": "pass|warn|block|not_requested",
  "forbidden_pattern_results": [
    {
      "pattern": "per_row_ai_call|generated_code_execution|unbounded_collect|unbounded_cross_join|nondeterministic_function_without_seed|hidden_drop_without_l5_decision",
      "status": "pass|warn|block",
      "evidence": "string|null",
      "blocking_reason": "string|null"
    }
  ],
  "unsupported_action_report_ref": "string",
  "warnings": ["string"]
}
```

### 9.7 `unsupported_action_report.json`

```json
{
  "artifact_header": {
    "source_id": "string",
    "run_id": "string",
    "artifact_id": "string",
    "artifact_name": "unsupported_action_report",
    "artifact_version": "string",
    "schema_version": "m3.l6.unsupported_action_report.v2_1",
    "created_at": "ISO-8601 string",
    "producer": "M3",
    "access_class": "catalog_internal"
  },
  "unsupported_actions": [
    {
      "action": "string",
      "layer": "silver|gold",
      "source_path": "string|null",
      "target_name": "string|null",
      "reason": "string",
      "blocked_reason": "string",
      "recommended_owner_action": "string",
      "safe_alternative": "string|null"
    }
  ]
}
```

## 10. L7 Silver Preview Validation

### 10.1 선택 이유

L7-B는 Silver preview에서 PII 노출과 quarantine routing을 검증한다. L3가 AI 입력 redaction을 담당한다면, L7은 실제 Silver preview output이 catalog/query context에 공개될 수 있는지 확인한다.

### 10.2 가능 범위

- bounded preview scope 안에서 schema, row count, type conversion, masking/hash, quarantine count를 검증한다.
- `pii_exposure_report`와 `silver_quarantine_report`를 L9 catalog safety와 processing quality로 넘긴다.

### 10.3 한계

- full production run 검증이 아니다.
- runtime drift나 late event 처리는 extension hook이다.
- PII detection의 오탐/미탐은 완전히 제거할 수 없다.

## 11. L8 Gold Preview Input Report

### 11.1 선택 이유

L8-C는 Gold preview와 metric/semantic definition을 만든다. v2.1에서는 L8이 final `gold_readiness_axis`를 만들지 않는다. L8은 input report를 만들고, L9가 final axis를 만든다.

### 11.2 L8 outputs

```text
l8/gold_preview_ref.json
l8/gold_preview_validation_result.json
l8/metric_definition_draft.json
l8/gold_readiness_input_report.json
l8/semantic_caveat_report.json
```

### 11.3 장점

- L8과 L9의 ownership이 분리된다.
- metric definition은 만들되 최종 gate 판정은 L9로 모인다.
- Gold가 `not_requested`인 경우에도 L9/L10에서 명확히 표현할 수 있다.

### 11.4 한계

- Gold semantic quality는 자동으로 완전히 확정하기 어렵다.
- owner review가 필요한 metric은 L9에서 `warn` 또는 `block`으로 이어질 수 있다.

## 12. L9 Three-axis Gate

### 12.1 선택 이유

L9-A는 processing quality, catalog safety, gold readiness를 분리한다. v2.1에서는 precedence rule을 명확히 한다.

### 12.2 Final axis ownership

L9만 final axis를 만든다.

```text
l9/processing_quality_axis.json
l9/catalog_safety_axis.json
l9/gold_readiness_axis.json
l9/gate_summary.json
```

L8의 `gold_readiness_input_report.json`은 L9 `gold_readiness_axis.json`의 입력이다.

### 12.3 Precedence rule

```text
1. if processing_quality == block:
     silver_context_status = blocked
     gold_context_status = blocked if gold_requested else not_requested
2. else if catalog_safety == block:
     silver_context_status = blocked
     gold_context_status = blocked if gold_requested else not_requested
3. else if gold_requested == false:
     silver_context_status = ready or ready_with_caveat depending on processing/catalog warning
     gold_context_status = not_requested
4. else if gold_readiness == block:
     silver_context_status = ready_with_caveat unless processing/catalog are pass
     gold_context_status = not_ready
5. else if any axis == warn:
     silver_context_status = ready_with_caveat
     gold_context_status = ready_with_caveat
6. else:
     silver_context_status = ready
     gold_context_status = ready
```

### 12.4 Gold not requested/deferred formula

| Gold L5 status | L8 input | L9 gold_readiness | L10 gold layer status | M6 gold context |
| --- | --- | --- | --- | --- |
| `not_requested` | none | `not_requested` | `not_requested` | `not_requested` |
| `deferred` | optional caveat | `not_requested` or `warn` | `deferred` | `not_requested` or `not_ready` |
| `needs_owner_review` | input report exists | `warn` or `block` | `needs_owner_review` | `not_ready` |
| `approved` | preview input exists | `pass|warn|block` | `available|blocked` | `ready|ready_with_caveat|not_ready` |
| `rejected` | none | `block` | `blocked` | `not_ready` |

### 12.5 `gate_summary.json`

```json
{
  "artifact_header": {
    "source_id": "string",
    "run_id": "string",
    "artifact_id": "string",
    "artifact_name": "gate_summary",
    "artifact_version": "string",
    "schema_version": "m3.l9.gate_summary.v2_1",
    "created_at": "ISO-8601 string",
    "producer": "M3",
    "access_class": "catalog_internal"
  },
  "gate_version": "string",
  "processing_quality_axis_ref": "string",
  "catalog_safety_axis_ref": "string",
  "gold_readiness_axis_ref": "string|null",
  "preview_scope_ref": "string|null",
  "m6_context_status": {
    "silver_context_status": "not_ready|ready_with_caveat|ready|blocked",
    "gold_context_status": "not_requested|not_ready|ready_with_caveat|ready|blocked"
  },
  "safe_to_run_silver": true,
  "safe_to_run_gold": false,
  "required_caveats": ["string"]
}
```

## 13. L10 Catalog and Query Context Package

### 13.1 선택 이유

L10-C는 M5 저장 상태, artifact version, schema version, decision version, gate version을 묶는다. v2.1에서는 L9의 context-specific status를 그대로 받아 M6가 Silver-only와 Gold-ready를 구분할 수 있게 한다.

### 13.2 장점

- M5 catalog와 M6 query context가 같은 artifact version을 본다.
- Gold가 없어도 Silver-only query context를 안전하게 표현할 수 있다.
- PII/query exposure rule을 L10에서 최종 검증할 수 있다.

### 13.3 단점과 한계

- L10이 ref package를 많이 갖게 된다.
- `artifact_reference_manifest`가 정확하지 않으면 downstream이 잘못된 artifact를 볼 수 있다.
- retrieval/RAG context는 core가 아니라 extension hook이다.

### 13.4 `catalog_sync_contract_package.json`

```json
{
  "artifact_header": {
    "source_id": "string",
    "run_id": "string",
    "artifact_id": "string",
    "artifact_name": "catalog_sync_contract_package",
    "artifact_version": "string",
    "schema_version": "m3.l10.catalog_sync_contract.v2_1",
    "created_at": "ISO-8601 string",
    "producer": "M3",
    "access_class": "catalog_internal"
  },
  "artifact_reference_manifest_ref": "string",
  "version_set": {
    "artifact_version": "string",
    "schema_version": "string",
    "profile_version": "string",
    "redaction_policy_version": "string",
    "recommendation_schema_version": "string",
    "decision_version": "string",
    "compiler_version": "string",
    "allowlist_version": "string",
    "gate_version": "string",
    "catalog_contract_version": "string"
  },
  "refs": {
    "source_manifest_ref": "string",
    "object_stream_manifest_ref": "string",
    "bronze_envelope_ref": "string",
    "rescue_lane_ref": "string",
    "profile_snapshot_ref": "string",
    "redaction_map_ref": "string",
    "gold_draft_ref": "string|null",
    "approval_state_ref": "string",
    "silver_decision_ref": "string",
    "gold_decision_ref": "string|null",
    "silver_spec_ref": "string",
    "gold_spec_ref": "string|null",
    "compiler_validation_ref": "string",
    "silver_preview_ref": "string",
    "gold_preview_ref": "string|null",
    "metric_definition_ref": "string|null",
    "gate_summary_ref": "string",
    "catalog_metadata_ref": "string",
    "sql_context_ref": "string",
    "quality_axis_refs": {
      "processing_quality_axis_ref": "string",
      "catalog_safety_axis_ref": "string",
      "gold_readiness_axis_ref": "string|null"
    }
  }
}
```

### 13.5 `catalog_metadata_draft.json`

```json
{
  "artifact_header": {
    "source_id": "string",
    "run_id": "string",
    "artifact_id": "string",
    "artifact_name": "catalog_metadata_draft",
    "artifact_version": "string",
    "schema_version": "m3.l10.catalog_metadata.v2_1",
    "created_at": "ISO-8601 string",
    "producer": "M3",
    "access_class": "catalog_internal|catalog_public"
  },
  "publish_decision": {
    "catalog_public_allowed": true,
    "reason": "string",
    "decided_by_axis_ref": "string"
  },
  "dataset_id": "string",
  "dataset_name": "string",
  "source_format": "csv|json|jsonl|parquet|mixed|unknown",
  "layers": [
    {
      "name": "bronze",
      "status": "available|blocked|not_requested"
    },
    {
      "name": "silver",
      "status": "available|blocked|not_requested"
    },
    {
      "name": "gold",
      "status": "available|deferred|needs_owner_review|blocked|not_requested"
    }
  ],
  "quality": {
    "processing_quality": "pass|warn|block",
    "catalog_safety": "pass|warn|block",
    "gold_readiness": "pass|warn|block|not_requested"
  },
  "caveats": ["string"],
  "lineage_ref": "string",
  "sql_context_ref": "string"
}
```

### 13.6 `sql_context_pack.json`

```json
{
  "artifact_header": {
    "source_id": "string",
    "run_id": "string",
    "artifact_id": "string",
    "artifact_name": "sql_context_pack",
    "artifact_version": "string",
    "schema_version": "m3.l10.sql_context_pack.v2_1",
    "created_at": "ISO-8601 string",
    "producer": "M3",
    "access_class": "query_context_safe"
  },
  "m6_context_status": {
    "silver_context_status": "not_ready|ready_with_caveat|ready|blocked",
    "gold_context_status": "not_requested|not_ready|ready_with_caveat|ready|blocked"
  },
  "allowed_tables": ["string"],
  "allowed_columns": [
    {
      "table": "string",
      "column": "string",
      "data_type": "string",
      "semantic_description": "string",
      "pii_handling": "none|mask|hash|hidden",
      "catalog_exposure": "default_visible|hidden|restricted|forbidden",
      "query_context_exposure": "allowed|masked|forbidden"
    }
  ],
  "metrics": [],
  "forbidden_fields": ["string"],
  "freshness": {
    "latest_processed_at": "ISO-8601 string|null",
    "freshness_sla": "string|null",
    "stale_warning": "string|null"
  },
  "query_caveats": ["string"],
  "quality_axis_refs": {
    "processing_quality_axis_ref": "string",
    "catalog_safety_axis_ref": "string",
    "gold_readiness_axis_ref": "string|null"
  }
}
```

## 14. PII and Query Context Validator Rules

### 14.1 PII hash rule

```text
if pii_handling == hash:
  hash_policy.algorithm must be hmac_sha256
  hash_policy.salt_secret_ref must not be null
  hash_policy.salt_version must not be null
```

Plain `sha256`은 PII 식별자에는 허용하지 않는다. Dictionary attack에 취약하기 때문이다.

### 14.2 Catalog exposure rule

```text
if catalog_exposure == forbidden:
  field must not appear in catalog_metadata_draft.schema

if catalog_exposure == hidden:
  field may exist physically in Silver but must not be default visible

if query_context_exposure == forbidden:
  field must not appear in sql_context_pack.allowed_columns
```

### 14.3 Query context readiness rule

```text
if catalog_safety == block:
  silver_context_status = blocked
  gold_context_status = blocked or not_requested

if processing_quality == block:
  silver_context_status = blocked

if gold layer is not_requested:
  sql_context_pack.metrics = []
  gold_context_status = not_requested
  query_caveats must include "Gold layer not requested or not ready"
```

### 14.4 Ref resolver rule

```text
every *_ref must resolve to exactly one artifact_id in artifact_reference_manifest
resolved artifact checksum must match stored checksum when the artifact is read
access_class must be compatible with the consumer
```

## 15. Extension Hooks

이 섹션은 core schema가 아니다. 나중에 범위가 확장될 때 붙이는 위치만 정의한다.

| Hook | 붙는 위치 | 설명 |
| --- | --- | --- |
| Stream runtime hook | L0/L6/L10 | delivery semantics, consumer group, offset semantics, checkpoint |
| Watermark hook | L2/L4/L5/L6 | event time field, allowed lateness, late event action |
| Schema drift hook | L2/L9/L10 | previous/current profile 비교, compatibility 판정 |
| Production execution hook | M2 after L6 | production commit, retry, rollback, row count report |
| Unstructured/retrieval hook | L2/L3/L10 | extraction, chunk evidence, retrieval context, citation policy |

Extension hook은 core acceptance를 막지 않는다. 다만 해당 기능을 제품 범위에 넣는 순간 별도 schema와 validator가 필요하다.

## 16. v2.1 Regression Guard

| 위반 | 판정 |
| --- | --- |
| object-only source인데 `source_unit_id`가 없음 | block |
| `*_ref`가 string artifact_id가 아니라 full object/URI로 섞임 | block |
| `artifact_reference_manifest`에서 ref를 resolve할 수 없음 | block |
| L4 Gold draft 없이 L5 Gold decision 생성 | block |
| `approval_state.json` 없이 L6 compile permission 계산 | block |
| `compiler_validation_result.json` 없이 spec을 M2로 전달 | block |
| `unsupported_action_report.json` 없이 unsupported action이 누락됨 | block |
| L6 preview spec에서 `write_mode`가 `overwrite|append` | block |
| operation별 required params가 누락됨 | block |
| `processing_quality=block`인데 M6 context가 ready | block |
| Gold `not_requested`인데 `gold_context_status=ready` | block |
| forbidden field가 `sql_context_pack.allowed_columns`에 포함됨 | block |
| PII hash가 `hmac_sha256`이 아니거나 salt secret이 없음 | block |

## 17. v2.1 Acceptance Checklist

- [ ] L0 has `source_units[]`.
- [ ] Object-only source gets `source_unit_id`.
- [ ] All `*_ref` fields are string artifact ids.
- [ ] `artifact_reference_manifest.json` resolves physical URI, checksum, byte size.
- [ ] L4 has `gold_model_recommendation_draft.json`.
- [ ] L5 has `approval_state.json`.
- [ ] L6 has `compiler_validation_result.json`.
- [ ] L6 has `unsupported_action_report.json`.
- [ ] L6 preview spec allows only `write_mode=preview_only`.
- [ ] Each operation action has required params.
- [ ] L9 precedence rule includes processing quality first.
- [ ] L9/L10 handle Gold `not_requested` and `deferred`.
- [ ] L10 SQL context separates Silver context and Gold context.
- [ ] PII/query context validator rules are explicit.
- [ ] Stream/runtime, watermark, drift, production, unstructured/retrieval remain extension hooks only.

## 18. 최종 판단

v2.1은 v2보다 좁고 실행 가능성에 집중한 계약이다. 세 리뷰에서 공통으로 나온 P0를 core에 반영했고, 범위를 키우는 항목은 extension hook으로만 남겼다.

이 문서를 기준으로 다음 단계에서 만들 것은 세 가지다.

1. JSON Schema validator
2. DTO / API contract
3. UI decision state와 validation error display

M3 core는 계속 `AI-assisted data onboarding and contract handoff`다. Streaming runtime, production commit, unstructured retrieval은 M3 core를 흔들지 않도록 별도 extension으로 다룬다.
