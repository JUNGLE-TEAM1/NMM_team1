# M3 L0-L10 Selected Improvement Contract v2

## 0. 목적과 판정

이 문서는 `selected-improvement-contract.md`에 대한 리뷰를 반영한 v2 설계 문서다. 기존 선택 조합은 유지한다. 바꾸는 것은 후보 자체가 아니라, 구현 중 충돌이 날 수 있는 schema, ref, version, status 계약이다.

최종 판정은 다음과 같다.

- 선택 조합: 유지
- AI 경계: 유지
- L0-L10 계층 분리: 유지
- M4 제외: 유지
- 보강 방식: P0/P1 문제와 실제 구현에 바로 도움이 되는 일부 P2만 반영

이 문서는 unknown CSV, JSON, JSONL, Parquet source를 대상으로 한다. batch object, hourly landing file, stream micro-batch를 모두 같은 흐름에서 다룬다. 단, AI는 raw data-plane에 들어가지 않는다. AI는 `L4`에서 redacted bounded evidence만 보고 draft를 만든다.

## 1. v2에서 실제로 반영한 리뷰 항목

| Priority | 반영 항목 | 이유 |
| --- | --- | --- |
| P0 | L10 version set 정합성 수정 | 전역 version 요구사항과 L10 schema가 달라 구현 충돌이 발생한다. |
| P0 | 모든 artifact 공통 header 명시 | 각 schema 예시마다 identity field가 빠져 혼란이 생긴다. |
| P0 | L5 decision artifact schema 추가 | L6 compiler 입력이 불명확하면 L4 draft가 그대로 실행될 위험이 있다. |
| P0 | L6 Silver/Gold executable spec schema 추가 | L6는 M2 실행 계약의 핵심이므로 느슨하게 둘 수 없다. |
| P0 | L4 action과 L6 allowlist 명칭 정렬 | compile mapping이 없으면 추천 draft가 spec으로 바뀌지 않는다. |
| P0 | L10 quality axis ref를 3-axis refs로 분리 | L9는 3-axis인데 L10이 단수 ref면 의미가 모호해진다. |
| P1 | L0 hybrid 조건 강화 | `hybrid`는 object와 stream window가 모두 있어야 한다. |
| P1 | L1 source/object/stream ref를 record schema에 포함 | L9 reconciliation과 L10 lineage가 약해지는 문제를 막는다. |
| P1 | L2 mixed profile artifacts를 array로 변경 | mixed source에서 여러 profile pack을 표현해야 한다. |
| P1 | L7/L8 preview scope 필수화 | preview가 full production run처럼 오해되는 것을 막는다. |
| P1 | L8 owner review 상태 분리 | L5 승인 후 L8에서 다시 review가 필요한 경우를 표현한다. |
| P1 | L9 readiness truth table 추가 | `ready`, `ready_with_caveat`, `blocked` 판단을 명확히 한다. |
| P1 | L10 layers를 status object로 변경 | Gold deferred/not requested 상태를 표현한다. |
| P2 | `access_class` 추가 | L1/L2/L3 artifact 노출 범위를 구분해야 한다. |
| P2 | `unsupported_actions` object schema 추가 | compile 불가 action을 삭제하지 않고 사람이 볼 수 있어야 한다. |
| P2 | `hash_policy` 추가 | hash 재현성과 secret rotation을 계약에 남긴다. |

이번 v2에서 별도 JSON Schema 파일은 만들지 않는다. 이 문서의 JSON block은 구현 계약의 logical shape다. 실제 validator를 만들 때는 `type: ["string", "null"]`, `enum`, `required`, `additionalProperties` 같은 JSON Schema 파일로 분리한다.

## 2. 유지하는 선택 조합

| Layer | 선택 후보 | v2 계약상 고정 의미 |
| --- | --- | --- |
| `L0` | `L0-C Object + Stream Hybrid Manifest` | object와 stream window를 같은 source-window model로 표현한다. |
| `L1` | `L1-A Envelope + Rescue Lane Contract` | 정상 record와 parse failure record를 같은 trace model로 보존한다. |
| `L2` | `L2-B Format-specialized Profile Pack` | format별 profile pack을 분리하고 mixed source를 array로 표현한다. |
| `L3` | `L3-B Redaction-first Evidence Pack` | AI 입력 전에 PII/secret/raw example을 줄이고 가린다. |
| `L4` | `L4-A Strict JSON-schema Recommendation` | AI output은 strict schema를 따르며 L6 action vocabulary와 정렬한다. |
| `L5` | `L5-A Split Silver/Gold Approval` | Silver decision과 Gold decision을 독립 approval artifact로 만든다. |
| `L6` | `L6-A Whitelist Transform Compiler` | approved decision만 allowlist operation spec으로 compile한다. |
| `L7` | `L7-B PII + Quarantine Structural Validation` | bounded Silver preview scope 안에서 PII/quarantine을 검증한다. |
| `L8` | `L8-C Metric Definition Draft` | bounded Gold preview 위에서 metric/semantic definition을 만든다. |
| `L9` | `L9-A Three-axis Gate Status` | processing, catalog safety, gold readiness를 별도 axis로 평가한다. |
| `L10` | `L10-C Catalog Sync Contract Package` | version/ref/status를 묶고 M5 catalog와 M6 query context로 넘긴다. |

## 3. 전체 흐름

```text
M1 source registration
-> M3 L0 object/stream manifest
-> M3 L1 bronze envelope + rescue lane
-> M3 L2 format-specialized profile pack
-> M3 L3 redaction-first AI evidence pack
-> M3 L4 strict AI recommendation draft
-> M1/M5 L5 split Silver/Gold decision
-> M3 L6 whitelist executable spec compiler
-> M2 L7 bounded Silver preview validation
-> M2 L8 bounded Gold preview validation
-> M3 L9 three-axis gate
-> M5 L10 catalog sync storage
-> M6 SQL/AI query context
```

`M4`는 현재 실제 흐름에 넣지 않는다. M4가 구체적인 execution producer, review owner, or catalog consumer로 확정되기 전까지는 계약에 포함하지 않는다.

## 4. 전역 artifact envelope

### 4.1 모든 artifact의 공통 header

v2부터 모든 JSON artifact는 `artifact_header`를 가진다. 각 layer schema 예시는 이 header를 포함한 full schema 또는 payload schema로 작성한다. 구현 파일에는 반드시 header가 있어야 한다.

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

`access_class`는 보안 기능 전체를 대신하지 않는다. 다만 M5 artifact store와 M6 query context가 어떤 artifact를 일반 catalog/query context에 노출해도 되는지 판단할 최소 신호다.

### 4.2 access class 기준

| access_class | 적용 대상 | 기본 공개 범위 |
| --- | --- | --- |
| `raw_restricted` | raw pointer, rescue raw snippet ref, raw-like payload | M3/M2 내부, 제한적 audit |
| `profile_internal` | L2 profile, sketch, path trie | M3/M5 내부 |
| `ai_safe` | L3 redacted AI input pack | L4 model slot, audit |
| `catalog_internal` | L5/L6/L7/L8/L9 intermediate results | M3/M5/M2 내부 |
| `catalog_public` | publish 가능한 catalog metadata | M1/M5 UI, M6 context source |
| `query_context_safe` | M6가 query generation에 써도 되는 context | M6 |

### 4.3 공통 reference shape

```json
{
  "artifact_ref": {
    "artifact_id": "string",
    "artifact_name": "string",
    "artifact_version": "string",
    "logical_path": "m3_runs/{source_id}/{run_id}/lX/file.json",
    "physical_uri": "string",
    "checksum": "sha256:...",
    "byte_size": 0
  }
}
```

Artifact ref는 file copy 자체를 의미하지 않는다. MinIO/S3/local file 등 실제 저장 위치를 가리키는 pointer다.

## 5. 전역 version set

L10은 아래 version set을 빠짐없이 모아야 한다. 이는 L3-L9의 의미가 M5 catalog와 M6 query context에서 엇갈리지 않게 하기 위한 최소 조건이다.

```json
{
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
  }
}
```

## 6. 전역 preview scope

L7과 L8의 preview 결과는 full production run으로 오해되면 안 된다. 모든 preview, validation, readiness artifact는 `preview_scope`를 가진다.

```json
{
  "preview_scope": {
    "scope_type": "sample|window|partition|bounded_full",
    "row_limit": 0,
    "window_id": "string|null",
    "time_range": {
      "start": "ISO-8601 string|null",
      "end": "ISO-8601 string|null"
    },
    "partition_filter": {},
    "sample_strategy": "head|range|stratified|sketch|none",
    "is_full_production_run": false
  }
}
```

`is_full_production_run=true`는 preview artifact에서 기본적으로 금지한다. production run은 별도 execution/report contract에서 다룬다.

## 7. 전역 unsupported action schema

L4/L5/L6에서 compile할 수 없는 추천 또는 decision은 삭제하지 않는다. 모두 같은 shape로 남긴다.

```json
{
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

## 8. L0 Object + Stream Hybrid Manifest

### 8.1 역할

L0는 raw data를 복제하지 않는다. L0는 object source와 stream source를 같은 replay model로 표현한다. object-only, stream-only, hybrid를 모두 지원하되, `hybrid`라고 선언하려면 object와 stream window가 모두 있어야 한다.

### 8.2 출력 artifact

| Artifact | access_class | 역할 |
| --- | --- | --- |
| `l0/source_manifest.json` | `catalog_internal` | source 등록 정보와 owner/privacy/retention 정보 |
| `l0/object_stream_manifest.json` | `catalog_internal` | object refs와 stream window refs |
| `l0/raw_replay_pointer.json` | `raw_restricted` | 재실행 가능한 raw replay 기준 |
| `l0/l0_validation_result.json` | `catalog_internal` | object/window/checksum 검증 결과 |

### 8.3 `object_stream_manifest.json`

```json
{
  "artifact_header": {
    "source_id": "string",
    "run_id": "string",
    "artifact_id": "string",
    "artifact_name": "object_stream_manifest",
    "artifact_version": "string",
    "schema_version": "m3.l0.object_stream_manifest.v2",
    "created_at": "ISO-8601 string",
    "producer": "M3",
    "access_class": "catalog_internal"
  },
  "source_kind": "object|stream|hybrid",
  "declared_format": "csv|json|jsonl|parquet|unknown",
  "objects": [
    {
      "object_id": "string",
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
      "window_id": "string",
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

### 8.4 L0 validation rule

| source_kind | objects | stream_windows | 판정 |
| --- | --- | --- | --- |
| `object` | non-empty | may be empty | pass 가능 |
| `stream` | may be empty | non-empty | pass 가능 |
| `hybrid` | non-empty | non-empty | pass 가능 |
| `hybrid` | empty | non-empty | block |
| `hybrid` | non-empty | empty | block |

## 9. L1 Bronze Envelope + Rescue Lane

### 9.1 역할

L1는 record를 정제하지 않는다. L1는 정상 parse record와 parse failure record를 같은 trace model로 남긴다. L0에서 온 `source_ref`, `object_ref`, `stream_ref`, `window_id`는 L1 record에 직접 들어간다.

### 9.2 출력 artifact

| Artifact | access_class | 역할 |
| --- | --- | --- |
| `l1/bronze_envelope_samples.jsonl` | `raw_restricted` | 정상 parse sample envelope |
| `l1/rescue_lane.jsonl` | `raw_restricted` | malformed/parse failure/encoding failure record |
| `l1/bronze_parse_summary.json` | `profile_internal` | parse 성공/실패 요약 |
| `l1/bronze_window_manifest.json` | `catalog_internal` | L0 window와 L1 sample/rescue 연결 |

### 9.3 common record locator

```json
{
  "record_locator": {
    "object_id": "string|null",
    "line_number": 0,
    "byte_start": 0,
    "byte_end": 0,
    "json_path": "string|null",
    "parquet_row_group": "string|number|null",
    "stream_partition": "string|number|null",
    "stream_offset": "string|number|null"
  }
}
```

### 9.4 `bronze_envelope_samples.jsonl` record

```json
{
  "artifact_header": {
    "source_id": "string",
    "run_id": "string",
    "artifact_id": "string",
    "artifact_name": "bronze_envelope_samples",
    "artifact_version": "string",
    "schema_version": "m3.l1.bronze_envelope_record.v2",
    "created_at": "ISO-8601 string",
    "producer": "M3",
    "access_class": "raw_restricted"
  },
  "record_id": "string",
  "source_ref": "string",
  "object_ref": "string|null",
  "stream_ref": "string|null",
  "window_id": "string",
  "record_locator": {
    "object_id": "string|null",
    "line_number": 0,
    "byte_start": 0,
    "byte_end": 0,
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

### 9.5 `rescue_lane.jsonl` record

```json
{
  "artifact_header": {
    "source_id": "string",
    "run_id": "string",
    "artifact_id": "string",
    "artifact_name": "rescue_lane",
    "artifact_version": "string",
    "schema_version": "m3.l1.rescue_lane_record.v2",
    "created_at": "ISO-8601 string",
    "producer": "M3",
    "access_class": "raw_restricted"
  },
  "record_id": "string",
  "source_ref": "string",
  "object_ref": "string|null",
  "stream_ref": "string|null",
  "window_id": "string",
  "record_locator": {
    "object_id": "string|null",
    "line_number": 0,
    "byte_start": 0,
    "byte_end": 0,
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

## 10. L2 Format-specialized Profile Pack

### 10.1 역할

L2는 unknown source를 deterministic profile evidence로 바꾼다. v2에서는 mixed source를 제대로 표현하기 위해 `profile_artifacts`를 array로 둔다.

### 10.2 출력 artifact

| Artifact | access_class | 역할 |
| --- | --- | --- |
| `l2/profile_snapshot.json` | `profile_internal` | format router와 profile artifact index |
| `l2/schema_fingerprint.json` | `profile_internal` | schema/hash/fingerprint |
| `l2/csv_dialect_profile.json` | `profile_internal` | CSV dialect/column profile |
| `l2/json_path_trie.json` | `profile_internal` | JSON/JSONL path profile |
| `l2/parquet_schema_profile.json` | `profile_internal` | Parquet schema/statistics pointer |
| `l2/large_source_sketch_profile.json` | `profile_internal` | 대용량 sketch profile |

### 10.3 `profile_snapshot.json`

```json
{
  "artifact_header": {
    "source_id": "string",
    "run_id": "string",
    "artifact_id": "string",
    "artifact_name": "profile_snapshot",
    "artifact_version": "string",
    "schema_version": "m3.l2.profile_snapshot.v2",
    "created_at": "ISO-8601 string",
    "producer": "M3",
    "access_class": "profile_internal"
  },
  "format_router": {
    "detected_format": "csv|json|jsonl|parquet|mixed|unknown",
    "confidence": 0.0,
    "evidence": ["string"]
  },
  "sample_scope": {
    "sampled_records": 0,
    "sampled_bytes": 0,
    "sample_strategy": "head|range|stratified_window|sketch",
    "sample_limited": true
  },
  "record_counts": {
    "parsed_sample_count": 0,
    "rescue_sample_count": 0,
    "estimated_total_count": 0
  },
  "profile_artifacts": [
    {
      "format": "csv|json|jsonl|parquet|unknown",
      "scope": {
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

## 11. L3 Redaction-first AI Evidence Pack

### 11.1 역할

L3는 AI가 볼 수 있는 bounded evidence만 만든다. raw payload 전체, full rescue lane, unbounded examples는 금지한다.

### 11.2 출력 artifact

| Artifact | access_class | 역할 |
| --- | --- | --- |
| `l3/ai_recommendation_input_pack.json` | `ai_safe` | AI가 실제로 보는 입력 |
| `l3/redaction_map.json` | `profile_internal` | redaction rule과 field result |
| `l3/field_evidence_reducer.json` | `profile_internal` | L2 -> L3 evidence 축약 규칙 |
| `l3/policy_context_pack.json` | `ai_safe` | privacy/source policy context |

### 11.3 `ai_recommendation_input_pack.json`

```json
{
  "artifact_header": {
    "source_id": "string",
    "run_id": "string",
    "artifact_id": "string",
    "artifact_name": "ai_recommendation_input_pack",
    "artifact_version": "string",
    "schema_version": "m3.l3.ai_input_pack.v2",
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
  "format_summary": {},
  "field_evidence": [
    {
      "field_id": "string",
      "source_path": "string",
      "inferred_type": "string",
      "nullable_ratio": 0.0,
      "distinct_sketch": "string|null",
      "example_values_redacted": [],
      "pii_candidate": true,
      "secret_candidate": false,
      "semantic_hints": ["string"],
      "profile_confidence": 0.0
    }
  ],
  "rescue_summary": {},
  "large_source_sketch_summary": {},
  "forbidden_raw_payload": true
}
```

## 12. L4 Strict AI Recommendation Draft

### 12.1 역할

L4는 AI model slot이다. AI는 L3 input pack만 본다. v2에서는 L4 action vocabulary를 L6 allowlist와 맞춘다. 즉 `keep` 대신 `select`, `flatten` 대신 `flatten_struct`를 사용한다.

### 12.2 L4 allowed draft actions

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
    "watermark_filter",
    "needs_review"
  ]
}
```

`needs_review`는 L6에서 compile 가능한 operation이 아니다. L5 decision에서 사람이 수정하거나, L6 `unsupported_action_report.json`에 남겨야 한다.

### 12.3 출력 artifact

| Artifact | access_class | 역할 |
| --- | --- | --- |
| `l4/silver_policy_recommendation_draft.json` | `catalog_internal` | Silver cleaning draft |
| `l4/gold_model_recommendation_draft.json` | `catalog_internal` | Gold model/metric draft |
| `l4/ai_generation_trace.json` | `catalog_internal` | model/input/output schema trace |
| `l4/recommendation_validation_result.json` | `catalog_internal` | strict schema validation result |

### 12.4 `silver_policy_recommendation_draft.json`

```json
{
  "artifact_header": {
    "source_id": "string",
    "run_id": "string",
    "artifact_id": "string",
    "artifact_name": "silver_policy_recommendation_draft",
    "artifact_version": "string",
    "schema_version": "m3.l4.silver_draft.v2",
    "created_at": "ISO-8601 string",
    "producer": "M3",
    "access_class": "catalog_internal"
  },
  "input_pack_ref": "string",
  "recommendation_schema_version": "string",
  "silver_policy": {
    "target_table_name": "string",
    "record_path": "string|null",
    "columns": [
      {
        "source_path": "string",
        "target_name": "string",
        "recommended_action": "select|rename|cast|parse_timestamp|normalize_null|flatten_struct|explode_array|json_string|mask|hash|drop|quarantine_if_invalid|needs_review",
        "target_type": "string|null",
        "nullable": true,
        "pii_handling": "none|mask|hash|hide_from_default_catalog|needs_review",
        "reason": "string",
        "confidence": 0.0
      }
    ],
    "quarantine_policy": [],
    "unsupported_actions": [],
    "needs_human_review": []
  }
}
```

## 13. L5 Split Silver/Gold Decision

### 13.1 역할

L5는 L4 AI draft를 사람이 수정하고 승인하는 단계다. v2는 approval state와 decision body를 분리한다. L6는 approval state만 보고 compile하면 안 된다. 반드시 `silver_policy_decision.json` 또는 `gold_policy_decision.json`을 입력으로 받아야 한다.

### 13.2 출력 artifact

| Artifact | access_class | 역할 |
| --- | --- | --- |
| `l5/silver_policy_decision.json` | `catalog_internal` | 승인된 Silver decision 본문 |
| `l5/gold_policy_decision.json` | `catalog_internal` | 승인/보류된 Gold decision 본문 |
| `l5/recommendation_diff.json` | `catalog_internal` | L4 draft 대비 사용자 수정 diff |
| `l5/approval_state.json` | `catalog_internal` | Silver/Gold approval status |

### 13.3 `silver_policy_decision.json`

```json
{
  "artifact_header": {
    "source_id": "string",
    "run_id": "string",
    "artifact_id": "string",
    "artifact_name": "silver_policy_decision",
    "artifact_version": "string",
    "schema_version": "m3.l5.silver_decision.v2",
    "created_at": "ISO-8601 string",
    "producer": "M1|M5|M3",
    "access_class": "catalog_internal"
  },
  "decision_version": "string",
  "based_on_draft_ref": "string",
  "approval_ref": "string",
  "columns": [
    {
      "source_path": "string",
      "target_name": "string",
      "action": "select|rename|cast|parse_timestamp|normalize_null|flatten_struct|explode_array|json_string|mask|hash|drop|quarantine_if_invalid",
      "target_type": "string|null",
      "params": {},
      "decision_reason": "string",
      "approved": true
    }
  ],
  "quarantine_policy": [],
  "pii_policy": {
    "redaction_policy_version": "string",
    "forbidden_fields": ["string"],
    "hash_policy": {
      "algorithm": "sha256|hmac_sha256",
      "salt_secret_ref": "string|null",
      "salt_version": "string|null",
      "rotation_policy_ref": "string|null"
    }
  },
  "approved_by": "string",
  "approved_at": "ISO-8601 string"
}
```

### 13.4 `gold_policy_decision.json`

```json
{
  "artifact_header": {
    "source_id": "string",
    "run_id": "string",
    "artifact_id": "string",
    "artifact_name": "gold_policy_decision",
    "artifact_version": "string",
    "schema_version": "m3.l5.gold_decision.v2",
    "created_at": "ISO-8601 string",
    "producer": "M1|M5|M3",
    "access_class": "catalog_internal"
  },
  "decision_version": "string",
  "based_on_draft_ref": "string",
  "depends_on_silver_decision_version": "string",
  "approval_ref": "string",
  "gold_models": [
    {
      "gold_model_id": "string",
      "gold_model_type": "metric_table|dimension_summary|entity_summary|event_aggregate|needs_review",
      "status": "approved|deferred|needs_owner_review|rejected",
      "grain": ["string"],
      "dimensions": ["string"],
      "measures": [],
      "semantic_definition": {},
      "owner_review": {
        "required": true,
        "status": "not_requested|required|approved|waived|rejected",
        "review_ref": "string|null"
      }
    }
  ],
  "approved_by": "string|null",
  "approved_at": "ISO-8601 string|null"
}
```

### 13.5 `recommendation_diff.json`

```json
{
  "artifact_header": {
    "source_id": "string",
    "run_id": "string",
    "artifact_id": "string",
    "artifact_name": "recommendation_diff",
    "artifact_version": "string",
    "schema_version": "m3.l5.recommendation_diff.v2",
    "created_at": "ISO-8601 string",
    "producer": "M1|M5|M3",
    "access_class": "catalog_internal"
  },
  "draft_ref": "string",
  "decision_ref": "string",
  "changes": [
    {
      "path": "string",
      "change_type": "add|remove|replace",
      "before": {},
      "after": {},
      "reason": "string",
      "changed_by": "string"
    }
  ]
}
```

### 13.6 compile permission

| 조건 | can_compile_silver | can_compile_gold |
| --- | --- | --- |
| Silver approved | true | depends on Gold |
| Silver rejected/deferred | false | false |
| Gold approved and Silver approved | true | true |
| Gold deferred but Silver approved | true | false |
| Gold needs_owner_review | true | false |

## 14. L6 Whitelist Executable Spec Compiler

### 14.1 역할

L6는 L5 decision을 M2가 실행 가능한 deterministic spec으로 바꾼다. v2에서는 `silver_transform_spec.json`과 `gold_generation_spec.json`의 minimum schema를 계약에 포함한다.

### 14.2 출력 artifact

| Artifact | access_class | 역할 |
| --- | --- | --- |
| `l6/silver_transform_spec.json` | `catalog_internal` | M2 Silver preview 실행 입력 |
| `l6/gold_generation_spec.json` | `catalog_internal` | M2 Gold preview 실행 입력 |
| `l6/layered_transform_graph.json` | `catalog_internal` | raw -> bronze -> silver -> gold lineage |
| `l6/compiler_validation_result.json` | `catalog_internal` | allowlist/forbidden pattern 검증 |
| `l6/unsupported_action_report.json` | `catalog_internal` | compile 불가 action report |

### 14.3 `silver_transform_spec.json`

```json
{
  "artifact_header": {
    "source_id": "string",
    "run_id": "string",
    "artifact_id": "string",
    "artifact_name": "silver_transform_spec",
    "artifact_version": "string",
    "schema_version": "m3.l6.silver_transform_spec.v2",
    "created_at": "ISO-8601 string",
    "producer": "M3",
    "access_class": "catalog_internal"
  },
  "spec_id": "string",
  "spec_version": "string",
  "compiler_version": "string",
  "allowlist_version": "string",
  "decision_ref": "string",
  "input_refs": {
    "bronze_envelope_ref": "string",
    "rescue_lane_ref": "string",
    "profile_ref": "string",
    "redaction_map_ref": "string"
  },
  "target": {
    "layer": "silver",
    "table_name": "string",
    "write_mode": "preview_only|overwrite|append"
  },
  "operations": [
    {
      "op_id": "string",
      "action": "select|rename|cast|parse_timestamp|normalize_null|flatten_struct|explode_array|json_string|mask|hash|drop|quarantine_if_invalid",
      "source_path": "string|null",
      "target_column": "string|null",
      "params": {},
      "decision_trace_ref": "string"
    }
  ],
  "quarantine_policy": [],
  "pii_policy": {
    "redaction_policy_version": "string",
    "forbidden_fields": ["string"],
    "hash_policy": {
      "algorithm": "sha256|hmac_sha256",
      "salt_secret_ref": "string|null",
      "salt_version": "string|null",
      "rotation_policy_ref": "string|null"
    }
  },
  "forbidden_patterns_checked": [
    "per_row_ai_call",
    "generated_code_execution",
    "unbounded_collect",
    "unbounded_cross_join"
  ]
}
```

### 14.4 `gold_generation_spec.json`

```json
{
  "artifact_header": {
    "source_id": "string",
    "run_id": "string",
    "artifact_id": "string",
    "artifact_name": "gold_generation_spec",
    "artifact_version": "string",
    "schema_version": "m3.l6.gold_generation_spec.v2",
    "created_at": "ISO-8601 string",
    "producer": "M3",
    "access_class": "catalog_internal"
  },
  "spec_id": "string",
  "spec_version": "string",
  "compiler_version": "string",
  "allowlist_version": "string",
  "decision_ref": "string",
  "silver_transform_spec_ref": "string",
  "target": {
    "layer": "gold",
    "table_name": "string",
    "write_mode": "preview_only|overwrite|append"
  },
  "gold_models": [
    {
      "gold_model_id": "string",
      "gold_model_type": "metric_table|dimension_summary|entity_summary|event_aggregate",
      "grain": ["string"],
      "dimensions": ["string"],
      "measures": [
        {
          "name": "string",
          "aggregation": "count|sum|avg|min|max|count_distinct|custom_review",
          "source_column": "string|*|null",
          "filter": "string|null"
        }
      ],
      "operations": [
        {
          "op_id": "string",
          "action": "aggregate|watermark_filter|select|rename",
          "params": {},
          "decision_trace_ref": "string"
        }
      ],
      "owner_review": {
        "required": true,
        "status": "not_requested|required|approved|waived|rejected",
        "review_ref": "string|null"
      }
    }
  ],
  "forbidden_patterns_checked": [
    "per_row_ai_call",
    "generated_code_execution",
    "unbounded_collect",
    "unbounded_cross_join"
  ]
}
```

### 14.5 forbidden patterns

| Pattern | 처리 |
| --- | --- |
| `per_row_ai_call` | block |
| `generated_code_execution` | block |
| `unbounded_collect` | block |
| `unbounded_cross_join` | block |
| nondeterministic function without seed | block |
| hidden drop without L5 decision | block |

## 15. L7 Silver Preview + PII/Quarantine Validation

### 15.1 역할

L7은 M2가 실행한 bounded Silver preview를 검증한다. preview 결과는 production full materialization이 아니다.

### 15.2 출력 artifact

| Artifact | access_class | 역할 |
| --- | --- | --- |
| `l7/silver_preview_ref.json` | `catalog_internal` | M2 preview output pointer |
| `l7/silver_preview_validation_result.json` | `catalog_internal` | schema/row/type/null validation |
| `l7/pii_exposure_report.json` | `catalog_internal` | masking/hash/hide 검증 |
| `l7/silver_quarantine_report.json` | `catalog_internal` | quarantine routing 검증 |
| `l7/silver_quality_axis.json` | `catalog_internal` | L9 processing input |

### 15.3 `silver_preview_validation_result.json`

```json
{
  "artifact_header": {
    "source_id": "string",
    "run_id": "string",
    "artifact_id": "string",
    "artifact_name": "silver_preview_validation_result",
    "artifact_version": "string",
    "schema_version": "m3.l7.silver_preview_validation.v2",
    "created_at": "ISO-8601 string",
    "producer": "M3",
    "access_class": "catalog_internal"
  },
  "preview_scope": {
    "scope_type": "sample|window|partition|bounded_full",
    "row_limit": 0,
    "window_id": "string|null",
    "time_range": {
      "start": "ISO-8601 string|null",
      "end": "ISO-8601 string|null"
    },
    "partition_filter": {},
    "sample_strategy": "head|range|stratified|sketch|none",
    "is_full_production_run": false
  },
  "silver_spec_ref": "string",
  "schema_validation": {
    "status": "pass|warn|block",
    "messages": ["string"]
  },
  "row_count_reconciliation": {
    "status": "pass|warn|block",
    "expected_count": 0,
    "observed_count": 0,
    "explanation": "string"
  },
  "pii_exposure_report_ref": "string",
  "quarantine_report_ref": "string"
}
```

## 16. L8 Gold Preview + Metric Definition

### 16.1 역할

L8은 bounded Gold preview와 semantic readiness를 평가한다. L5에서 승인된 Gold도 L8에서 실제 preview 결과를 보고 다시 caveat 또는 owner review 상태가 생길 수 있다. 따라서 v2는 `owner_review.required`와 `owner_review.status`를 분리한다.

### 16.2 출력 artifact

| Artifact | access_class | 역할 |
| --- | --- | --- |
| `l8/gold_preview_ref.json` | `catalog_internal` | M2 Gold preview pointer |
| `l8/gold_preview_validation_result.json` | `catalog_internal` | grain/cardinality/freshness validation |
| `l8/metric_definition_draft.json` | `catalog_internal` | metric/semantic definition |
| `l8/gold_readiness_axis.json` | `catalog_internal` | L9 gold readiness input |
| `l8/semantic_caveat_report.json` | `catalog_internal` | semantic caveat와 review 상태 |

### 16.3 `metric_definition_draft.json`

```json
{
  "artifact_header": {
    "source_id": "string",
    "run_id": "string",
    "artifact_id": "string",
    "artifact_name": "metric_definition_draft",
    "artifact_version": "string",
    "schema_version": "m3.l8.metric_definition.v2",
    "created_at": "ISO-8601 string",
    "producer": "M3",
    "access_class": "catalog_internal"
  },
  "preview_scope": {
    "scope_type": "sample|window|partition|bounded_full",
    "row_limit": 0,
    "window_id": "string|null",
    "time_range": {
      "start": "ISO-8601 string|null",
      "end": "ISO-8601 string|null"
    },
    "partition_filter": {},
    "sample_strategy": "head|range|stratified|sketch|none",
    "is_full_production_run": false
  },
  "gold_spec_ref": "string",
  "silver_spec_ref": "string",
  "metric_definitions": [
    {
      "metric_id": "string",
      "metric_name": "string",
      "gold_table": "string",
      "grain": ["string"],
      "dimensions": ["string"],
      "measures": [
        {
          "name": "string",
          "expression": "string",
          "aggregation": "count|sum|avg|min|max|count_distinct|custom_review",
          "source_field_lineage": ["string"]
        }
      ],
      "filters": ["string"],
      "freshness_sla": "string|null",
      "watermark_field": "string|null",
      "example_sql": "string",
      "example_questions": ["string"],
      "caveats": ["string"],
      "owner_review": {
        "required": true,
        "status": "not_requested|required|approved|waived|rejected",
        "review_ref": "string|null"
      }
    }
  ],
  "semantic_definition": {
    "gold_model_type": "metric_table|entity_summary|dimension_summary|needs_review",
    "entity": "string|null",
    "summary_fields": ["string"],
    "caveats": ["string"]
  }
}
```

### 16.4 owner review rule

| owner_review.required | owner_review.status | L9 gold_readiness |
| --- | --- | --- |
| false | any | pass 가능 |
| true | `approved` | pass 가능 |
| true | `waived` | warn 가능 |
| true | `not_requested` | warn 또는 block |
| true | `required` | warn 또는 block |
| true | `rejected` | block |

## 17. L9 Three-axis Gate

### 17.1 역할

L9는 processing quality, catalog safety, gold readiness를 분리한다. v2는 L10 `m6_query_context_status`와 연결되는 truth table을 추가한다.

### 17.2 출력 artifact

| Artifact | access_class | 역할 |
| --- | --- | --- |
| `l9/processing_quality_axis.json` | `catalog_internal` | parse/transform/reconciliation 품질 |
| `l9/catalog_safety_axis.json` | `catalog_internal` | PII/catalog exposure 안전성 |
| `l9/gold_readiness_axis.json` | `catalog_internal` | Gold semantic readiness |
| `l9/gate_summary.json` | `catalog_internal` | 3-axis summary와 M6 readiness |

### 17.3 axis schema

```json
{
  "artifact_header": {
    "source_id": "string",
    "run_id": "string",
    "artifact_id": "string",
    "artifact_name": "gate_axis",
    "artifact_version": "string",
    "schema_version": "m3.l9.axis.v2",
    "created_at": "ISO-8601 string",
    "producer": "M3",
    "access_class": "catalog_internal"
  },
  "axis": "processing_quality|catalog_safety|gold_readiness",
  "status": "pass|warn|block",
  "severity": "info|low|medium|high|critical",
  "checked_at": "ISO-8601 string",
  "inputs": ["artifact_ref"],
  "findings": [
    {
      "finding_id": "string",
      "status": "pass|warn|block",
      "severity": "info|low|medium|high|critical",
      "message": "string",
      "owner": "M2|M3|M5|M6|user",
      "owner_action": "string",
      "blocking_reason": "string|null",
      "artifact_ref": "string|null"
    }
  ]
}
```

### 17.4 M6 readiness truth table

| catalog_safety | gold_readiness | m6_query_context_status | 설명 |
| --- | --- | --- | --- |
| `block` | any | `blocked` | catalog 안전성이 막히면 query context도 막는다. |
| any | `block` | `not_ready` | Gold 의미가 막히면 M6 Gold query는 준비 안 됨이다. |
| `warn` | `pass` | `ready_with_caveat` | query 가능하되 caveat 필수다. |
| `pass` | `warn` | `ready_with_caveat` | query 가능하되 semantic caveat 필수다. |
| `warn` | `warn` | `ready_with_caveat` | catalog/semantic caveat 둘 다 표시한다. |
| `pass` | `pass` | `ready` | caveat 없이 query ready 가능하다. |

`processing_quality=block`이면 catalog publish와 M6 query 모두 기본적으로 `blocked` 또는 `not_ready`가 된다. 단, Gold 없이 Silver catalog만 내부 검토용으로 보여주는 별도 UI는 가능하다.

### 17.5 `gate_summary.json`

```json
{
  "artifact_header": {
    "source_id": "string",
    "run_id": "string",
    "artifact_id": "string",
    "artifact_name": "gate_summary",
    "artifact_version": "string",
    "schema_version": "m3.l9.gate_summary.v2",
    "created_at": "ISO-8601 string",
    "producer": "M3",
    "access_class": "catalog_internal"
  },
  "gate_version": "string",
  "processing_quality_axis_ref": "string",
  "catalog_safety_axis_ref": "string",
  "gold_readiness_axis_ref": "string|null",
  "overall_catalog_publishable": true,
  "m6_query_context_status": "not_ready|ready_with_caveat|ready|blocked",
  "safe_to_run_silver": true,
  "safe_to_run_gold": false,
  "required_caveats": ["string"]
}
```

## 18. L10 Catalog Sync Contract Package

### 18.1 역할

L10은 M5와 M6로 넘기는 최종 package다. v2는 version set, 3-axis refs, layer status, SQL context를 모두 포함한다.

### 18.2 출력 artifact

| Artifact | access_class | 역할 |
| --- | --- | --- |
| `l10/catalog_sync_contract_package.json` | `catalog_internal` | version/ref/status 최종 package |
| `l10/artifact_reference_manifest.json` | `catalog_internal` | L0-L10 artifact refs |
| `l10/catalog_metadata_draft.json` | `catalog_public` 또는 `catalog_internal` | M5 catalog 저장 draft |
| `l10/field_level_lineage.json` | `catalog_internal` | raw -> Silver -> Gold lineage |
| `l10/sql_context_pack.json` | `query_context_safe` | M6 query generation context |
| `l10/handoff_package.json` | `catalog_internal` | M5/M6 handoff index |

### 18.3 `catalog_sync_contract_package.json`

```json
{
  "artifact_header": {
    "source_id": "string",
    "run_id": "string",
    "artifact_id": "string",
    "artifact_name": "catalog_sync_contract_package",
    "artifact_version": "string",
    "schema_version": "m3.l10.catalog_sync_contract.v2",
    "created_at": "ISO-8601 string",
    "producer": "M3",
    "access_class": "catalog_internal"
  },
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
  "m5_storage_status": "draft|stored|failed|superseded",
  "m6_query_context_status": "not_ready|ready_with_caveat|ready|blocked",
  "refs": {
    "source_manifest_ref": "string",
    "object_stream_manifest_ref": "string",
    "bronze_envelope_ref": "string",
    "rescue_lane_ref": "string",
    "profile_snapshot_ref": "string",
    "redaction_map_ref": "string",
    "silver_decision_ref": "string",
    "gold_decision_ref": "string|null",
    "silver_spec_ref": "string",
    "gold_spec_ref": "string|null",
    "silver_preview_ref": "string",
    "gold_preview_ref": "string|null",
    "metric_definition_ref": "string|null",
    "catalog_metadata_ref": "string",
    "field_lineage_ref": "string",
    "sql_context_ref": "string",
    "gate_summary_ref": "string",
    "quality_axis_refs": {
      "processing_quality_axis_ref": "string",
      "catalog_safety_axis_ref": "string",
      "gold_readiness_axis_ref": "string|null"
    }
  }
}
```

### 18.4 `catalog_metadata_draft.json`

```json
{
  "artifact_header": {
    "source_id": "string",
    "run_id": "string",
    "artifact_id": "string",
    "artifact_name": "catalog_metadata_draft",
    "artifact_version": "string",
    "schema_version": "m3.l10.catalog_metadata.v2",
    "created_at": "ISO-8601 string",
    "producer": "M3",
    "access_class": "catalog_internal"
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
  "storage_refs": {},
  "schema": [],
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

### 18.5 `sql_context_pack.json`

```json
{
  "artifact_header": {
    "source_id": "string",
    "run_id": "string",
    "artifact_id": "string",
    "artifact_name": "sql_context_pack",
    "artifact_version": "string",
    "schema_version": "m3.l10.sql_context_pack.v2",
    "created_at": "ISO-8601 string",
    "producer": "M3",
    "access_class": "query_context_safe"
  },
  "m6_query_context_status": "not_ready|ready_with_caveat|ready|blocked",
  "allowed_tables": ["string"],
  "allowed_columns": [
    {
      "table": "string",
      "column": "string",
      "data_type": "string",
      "semantic_description": "string",
      "pii_handling": "none|mask|hash|hidden"
    }
  ],
  "metrics": [
    {
      "metric_id": "string",
      "metric_name": "string",
      "grain": ["string"],
      "allowed_dimensions": ["string"],
      "example_sql": "string",
      "caveats": ["string"]
    }
  ],
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

## 19. 파일 형식별 적용 규칙

### 19.1 CSV

CSV는 L2에서 dialect와 encoding을 먼저 확인한다. delimiter/header/multiline 확신이 낮으면 L4는 aggressive cast를 추천하지 않는다. multiline CSV는 line number보다 byte range를 우선 `record_locator`로 쓴다.

### 19.2 JSON

top-level JSON array는 full object seek가 어려우므로 L0 replay pointer가 중요하다. L6에서는 bounded `flatten_struct` 또는 `json_string`을 우선하고, unbounded array explode는 L5 decision과 L6 allowlist 없이는 block한다.

### 19.3 JSONL

JSONL은 object landing과 stream window 양쪽에 잘 맞는다. malformed line은 L1 rescue lane에 line/byte/offset과 함께 남긴다. free-text/PII 가능성이 높으므로 L3 redaction과 L7 PII validation을 모두 통과해야 한다.

### 19.4 Parquet

Parquet은 row-level rescue보다 file/schema exception lane이 적합하다. L2는 schema와 row-group statistics pointer를 활용하고, L10은 partition version과 schema version drift를 명확히 남긴다.

## 20. 대용량/실시간 적용 규칙

- AI는 모든 row를 보지 않는다.
- L2는 full scan만 가정하지 않고 sample/sketch/window profile을 허용한다.
- stream은 `window_id`와 offset/checkpoint 기준으로 재현한다.
- L7/L8 preview는 bounded execution이며 full production materialization이 아니다.
- L6는 per-row AI call, generated code execution, unbounded collect, unbounded cross join을 금지한다.

## 21. Regression guard

| 위반 | 판정 |
| --- | --- |
| L4가 raw file/full row stream을 직접 봄 | block |
| L5 approval 없이 L6 spec 생성 | block |
| L6 executable spec이 없고 free-form text만 존재 | block |
| L6 unsupported action이 조용히 삭제됨 | block |
| L7 PII block인데 L10 catalog ready | block |
| L8 owner review rejected인데 L9 gold readiness pass | block |
| L9 axis가 하나의 `warn`으로 합쳐짐 | block |
| L10에 3-axis refs 또는 sql context ref 없음 | block |
| Gold deferred인데 catalog metadata가 gold available로 표시됨 | block |

## 22. Acceptance checklist

### 22.1 구조

- [ ] 모든 artifact가 `artifact_header`를 가진다.
- [ ] L0 `hybrid`는 object와 stream window를 모두 가진다.
- [ ] L1 record와 rescue record가 같은 locator shape를 가진다.
- [ ] L2 mixed profile은 array `profile_artifacts`로 표현된다.

### 22.2 AI/decision/compiler

- [ ] L3 input pack은 `ai_safe`이고 raw full payload를 포함하지 않는다.
- [ ] L4 action vocabulary가 L6 allowlist와 정렬되어 있다.
- [ ] L5 decision body와 approval state가 분리되어 있다.
- [ ] L6 Silver/Gold executable spec이 존재한다.
- [ ] L6 compiler validation이 forbidden pattern을 검사한다.

### 22.3 preview/gate/catalog

- [ ] L7/L8 artifact가 `preview_scope`를 가진다.
- [ ] L8 owner review가 `required/status/review_ref`로 표현된다.
- [ ] L9 truth table로 `m6_query_context_status`를 계산한다.
- [ ] L10 `version_set`이 전역 version을 모두 포함한다.
- [ ] L10 `quality_axis_refs`가 3-axis를 분리 참조한다.
- [ ] L10 catalog layers가 Gold deferred/not requested를 표현한다.

## 23. 최종 설계 판단

v2에서 선택 후보 자체는 바꾸지 않는다. L0-C, L1-A, L2-B, L3-B, L4-A, L5-A, L6-A, L7-B, L8-C, L9-A, L10-C 조합은 유지한다.

다만 v1은 좋은 방향의 설계 문서였고, v2는 구현자가 바로 schema와 handoff를 만들 수 있는 계약에 가깝게 수정했다. 특히 아래 네 가지는 v2의 핵심이다.

1. L5 decision body를 명확히 만들어 L4 draft가 바로 실행되지 않게 한다.
2. L6 Silver/Gold executable spec을 정의해 M2 실행 입력을 고정한다.
3. L7/L8 preview scope와 L9 readiness truth table로 preview와 production을 분리한다.
4. L10 version set, 3-axis refs, SQL context pack으로 M5/M6 handoff를 명확히 한다.

이 문서를 기준으로 다음 단계에서 실제 schema 파일, DTO, validation script, UI decision state를 만들면 된다.
