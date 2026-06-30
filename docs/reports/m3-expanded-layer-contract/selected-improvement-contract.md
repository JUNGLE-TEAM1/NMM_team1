# Legacy Reference: M3 L0-L10 Selected Improvement Contract

> 이 문서는 과거 L0-L10 선택 계약이다. 최신 canonical 기준은 [M3 Logical L0-L16 Selected Improvement Contract v2.1.1](selected-improvement-contract-v2.1.1-l0-l16.md)이다.

## 0. 문서 목적

이 문서는 `F:\ai\m3-l0-l10-improvement-decisions.json`에서 선택된 L0-L10 개선안을 하나의 실행 계약으로 고정한다. 기존 `expanded-layer-contract.md`가 "왜 L0-L10으로 나눠야 하는가"를 설명한다면, 이 문서는 "각 계층에서 어떤 파일을 만들고, 어떤 필드를 반드시 유지하고, 다음 계층으로 무엇을 넘겨야 하는가"를 정의한다.

이 계약은 unknown CSV, JSON, JSONL, Parquet source를 대상으로 한다. source 구조를 사전에 안다고 가정하지 않는다. 대용량/실시간에 가까운 source도 고려하되, AI가 모든 row를 실시간으로 처리한다는 주장은 금지한다. AI는 `L4 AI Recommendation Draft`에서 bounded evidence pack만 보고 추천 draft를 만드는 control-plane 역할로 제한한다.

## 1. 선택 결과

| Layer | 선택 후보 | 계약상 의미 |
| --- | --- | --- |
| `L0` | `L0-C Object + Stream Hybrid Manifest` | file object와 streaming offset을 같은 manifest model로 표현한다. |
| `L1` | `L1-A Envelope + Rescue Lane Contract` | 정상 record와 parse 실패 record를 같은 source pointer 아래 분리 보존한다. |
| `L2` | `L2-B Format-specialized Profile Pack` | CSV, JSON/JSONL, Parquet profile pack을 형식별로 분리한다. |
| `L3` | `L3-B Redaction-first Evidence Pack` | AI 입력 전에 PII/secret/raw text example을 먼저 redaction한다. |
| `L4` | `L4-A Strict JSON-schema Recommendation` | AI 출력은 strict JSON schema를 따라 Silver draft와 Gold draft를 분리해야 한다. |
| `L5` | `L5-A Split Silver/Gold Approval` | Silver cleaning decision과 Gold semantic decision을 별도 상태로 승인한다. |
| `L6` | `L6-A Whitelist Transform Compiler` | 허용된 action만 deterministic Spark spec으로 변환한다. |
| `L7` | `L7-B PII + Quarantine Structural Validation` | Silver preview에서 PII 노출, masking, quarantine routing을 검증한다. |
| `L8` | `L8-C Metric Definition Draft` | Gold preview와 함께 metric/grain/measure/dimension/caveat/example SQL을 만든다. |
| `L9` | `L9-A Three-axis Gate Status` | processing quality, catalog safety, Gold readiness를 별도 axis로 평가한다. |
| `L10` | `L10-C Catalog Sync Contract Package` | M5 저장 상태, artifact version, schema version, decision version, gate version을 동기화한다. |

## 2. 전체 실행 흐름

```text
M1 source registration
-> M3 L0 Object + Stream Hybrid Manifest
-> M3 L1 Envelope + Rescue Lane
-> M3 L2 Format-specialized Profile Pack
-> M3 L3 Redaction-first AI Evidence Pack
-> M3 L4 Strict JSON-schema AI Recommendation Draft
-> M1/M5 L5 Split Silver/Gold Decision
-> M3 L6 Whitelist Deterministic Spec Compiler
-> M2 L7 Silver Preview + PII/Quarantine Validation
-> M2 L8 Gold Preview + Metric Definition Draft
-> M3 L9 Three-axis Gate
-> M5 L10 Catalog Sync Storage
-> M6 SQL/AI Query Context
```

`M4`는 현재 실제 흐름에 포함하지 않는다. 팀에서 M4를 구체적인 execution/result producer 또는 catalog consumer로 배정하기 전까지는 L0-L10 계약의 필수 handoff 대상이 아니다.

## 3. 전역 불변 조건

### 3.1 Raw data-plane과 AI control-plane 분리

AI는 `L3/ai_recommendation_input_pack.json`만 입력으로 받는다. AI가 raw file 전체, full row stream, unbounded sample, rescue lane full payload를 직접 보지 않는다.

`L4`의 AI 출력은 draft다. `L4` 결과가 바로 Silver 또는 Gold table을 만들면 안 된다. 사용자가 `L5`에서 Silver와 Gold를 각각 승인한 뒤, `L6` compiler가 deterministic spec으로 고정해야 한다.

`L6` 이후는 AI 실행 영역이 아니다. `L6-L10`은 deterministic spec, M2 preview execution, gate, catalog handoff로 처리한다.

### 3.2 Source identity는 L0부터 L10까지 유지

모든 layer artifact는 아래 identity field를 유지해야 한다.

```json
{
  "source_id": "string",
  "run_id": "string",
  "artifact_id": "string",
  "artifact_version": "string",
  "created_at": "ISO-8601 string"
}
```

`source_id`는 M1 source registration의 식별자다. `run_id`는 같은 source에 대해 한 번의 profiling/recommendation/spec cycle을 묶는다. `artifact_id`는 각 파일 또는 package의 고유 ID다. `artifact_version`은 같은 artifact가 재생성될 때 증가한다.

### 3.3 Replay와 trace field는 삭제하지 않는다

아래 field는 가능한 모든 artifact에 reference 형태로 이어져야 한다.

| Field | 의미 |
| --- | --- |
| `source_ref` | M1 source registration pointer. |
| `object_ref` | file/object URI, etag/checksum, byte size, compression, partition 정보. |
| `stream_ref` | topic/stream name, partition, offset, checkpoint, event-time 또는 ingest-time window 정보. |
| `window_id` | batch object, hourly batch, micro-batch window를 같은 방식으로 식별하는 값. |
| `record_locator` | row number, byte offset, line number, JSON path, parquet row group 등 record 위치 정보. |
| `profile_ref` | L2 profile artifact pointer. |
| `evidence_pack_ref` | L3 AI input pack pointer. |
| `decision_ref` | L5 approval decision pointer. |
| `spec_ref` | L6 compiled spec pointer. |
| `preview_ref` | L7/L8 preview artifact pointer. |
| `gate_ref` | L9 gate result pointer. |
| `catalog_ref` | L10 catalog package pointer. |

### 3.4 Version field는 L10에서 반드시 모아야 한다

L10 `catalog_sync_contract_package.json`은 최소 아래 version field를 포함해야 한다.

```json
{
  "artifact_version": "string",
  "schema_version": "string",
  "profile_version": "string",
  "redaction_policy_version": "string",
  "recommendation_schema_version": "string",
  "decision_version": "string",
  "compiler_version": "string",
  "gate_version": "string",
  "catalog_contract_version": "string"
}
```

이 version set이 없으면 M5 catalog와 M6 query context가 서로 다른 시점의 Silver/Gold 의미를 참조할 수 있다. 따라서 L10-C를 선택한 경우에도 단순 저장 상태만 추적하면 부족하고, L3-L9의 핵심 version을 한 package에서 묶어야 한다.

### 3.5 Status는 단일 warn으로 뭉치지 않는다

최종 gate는 `status: warn` 하나로 끝나면 안 된다. 최소 세 axis를 별도로 둔다.

```json
{
  "processing_quality": {
    "status": "pass|warn|block",
    "severity": "info|low|medium|high|critical",
    "owner_action": "string",
    "blocking_reason": "string|null"
  },
  "catalog_safety": {
    "status": "pass|warn|block",
    "severity": "info|low|medium|high|critical",
    "owner_action": "string",
    "blocking_reason": "string|null"
  },
  "gold_readiness": {
    "status": "pass|warn|block",
    "severity": "info|low|medium|high|critical",
    "owner_action": "string",
    "blocking_reason": "string|null"
  }
}
```

이 구조는 "처리 자체는 통과했지만 catalog 공개는 경고" 또는 "Silver는 가능하지만 Gold는 owner review 필요" 같은 상태를 표현하기 위한 필수 계약이다.

## 4. 공통 artifact naming 규칙

파일 경로는 구현 저장소에 따라 달라질 수 있지만, 논리 경로는 아래를 따른다.

```text
m3_runs/{source_id}/{run_id}/
  l0/
  l1/
  l2/
  l3/
  l4/
  l5/
  l6/
  l7/
  l8/
  l9/
  l10/
```

각 layer의 main artifact는 `artifact_reference_manifest.json`에 등록한다. M5가 실제 파일을 저장하든, MinIO/S3 URI만 저장하든, catalog에는 logical artifact name과 physical URI를 같이 남긴다.

```json
{
  "logical_name": "l6/silver_transform_spec.json",
  "physical_uri": "s3://bucket/path/or/local/path",
  "content_type": "application/json",
  "checksum": "sha256:...",
  "byte_size": 12345,
  "producer": "M3",
  "consumer": ["M2", "M5"]
}
```

## 5. L0 계약: Object + Stream Hybrid Manifest

### 5.1 역할

L0는 raw data를 복제하는 단계가 아니다. L0는 raw source를 다시 찾고, 같은 window를 다시 읽고, 같은 source identity로 profile/spec을 재생성할 수 있게 만드는 manifest layer다.

선택된 `L0-C Object + Stream Hybrid Manifest`는 file object와 streaming offset을 하나의 source window model로 표현한다. CSV landing file, JSONL event log, Parquet partition, stream micro-batch가 모두 같은 L0 계약을 사용한다.

### 5.2 From / To

| 구분 | 값 |
| --- | --- |
| From | `M1 source registration` |
| To | `M3 L1 bronze envelope` |
| Producer | `M3` |
| Consumer | `M3 L1`, `M5 artifact store`, later replay by `M2` |

### 5.3 입력

- `M1` source registration payload
- source URI 또는 stream connection reference
- declared source format, compression, owner, retention, privacy class
- batch source라면 object list
- stream source라면 topic/partition/offset/checkpoint reference

### 5.4 출력 파일

| 파일 | 역할 |
| --- | --- |
| `l0/source_manifest.json` | source 등록 정보, owner, format, privacy, retention, SLA를 저장한다. |
| `l0/object_stream_manifest.json` | object URI와 stream offset/window를 같은 model로 저장한다. |
| `l0/raw_replay_pointer.json` | 재실행 가능한 read 범위와 replay 조건을 저장한다. |
| `l0/l0_validation_result.json` | checksum, object existence, offset 범위, required metadata 누락 여부를 저장한다. |

### 5.5 `source_manifest.json` 필수 필드

```json
{
  "source_id": "string",
  "run_id": "string",
  "source_name": "string",
  "source_kind": "object|stream|hybrid",
  "declared_format": "csv|json|jsonl|parquet|unknown",
  "detected_format_hint": "csv|json|jsonl|parquet|mixed|unknown",
  "owner": "string|null",
  "privacy_class": "public|internal|restricted|unknown",
  "retention_policy": {
    "raw_retention_days": 0,
    "manifest_retention_days": 0
  },
  "source_ref": {
    "system": "local|minio|s3|kafka|other",
    "uri": "string",
    "secret_ref": "string|null"
  }
}
```

### 5.6 `object_stream_manifest.json` 필수 필드

```json
{
  "source_id": "string",
  "run_id": "string",
  "ingestion_mode": "object|stream|hybrid",
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

### 5.7 검증 조건

- object source라면 `uri`, `byte_size`, `checksum` 또는 `etag` 중 최소 하나가 있어야 한다.
- stream source라면 `window_id`, `stream_name`, `start_offset`, `end_offset` 또는 `checkpoint_ref`가 있어야 한다.
- `source_kind=hybrid`라면 `objects`와 `stream_windows` 중 최소 하나는 비어 있으면 안 된다.
- `declared_format=unknown`이어도 허용한다. 실제 format 판단은 L2에서 한다.
- raw data를 M3 artifact로 full copy하지 않는다. 원본 이동/적재는 M1/M2/infra 계약이며, L0는 pointer와 replay 조건을 남긴다.

### 5.8 실패 처리

| 실패 | 처리 |
| --- | --- |
| object URI가 없음 | `l0_validation_result.status=block` |
| checksum/etag가 없음 | `status=warn`, replay 가능성 caveat 기록 |
| stream offset이 없음 | `status=block`, stream replay 불가 |
| owner/privacy 미정 | `status=warn`, L3 redaction policy는 보수적으로 적용 |

## 6. L1 계약: Envelope + Rescue Lane Contract

### 6.1 역할

L1는 raw record를 정제하지 않는다. L1는 record를 trace 가능한 bronze envelope로 감싸고, parse 실패를 별도 rescue lane에 남긴다.

CSV row, JSONL line, JSON array element, Parquet row group sample은 모두 `record_locator`를 가진다. parse 실패도 같은 `source_id`, `run_id`, `window_id` 아래 저장한다.

### 6.2 From / To

| 구분 | 값 |
| --- | --- |
| From | `M3 L0 raw manifest` |
| To | `M3 L2 profile snapshot` |
| Producer | `M3` |
| Consumer | `M3 L2`, `M3 L9`, `M5 artifact store` |

### 6.3 출력 파일

| 파일 | 역할 |
| --- | --- |
| `l1/bronze_envelope_samples.jsonl` | 정상 parse record sample envelope. |
| `l1/rescue_lane.jsonl` | malformed, parse failure, encoding failure, schema exception record. |
| `l1/bronze_parse_summary.json` | 성공/실패 count, rescue ratio, format별 parse 상태. |
| `l1/bronze_window_manifest.json` | L0 window와 L1 sample/rescue window 연결. |

### 6.4 `bronze_envelope_samples.jsonl` record schema

```json
{
  "record_id": "string",
  "source_id": "string",
  "run_id": "string",
  "window_id": "string",
  "record_locator": {
    "object_id": "string|null",
    "line_number": 0,
    "byte_start": 0,
    "byte_end": 0,
    "json_path": "string|null",
    "parquet_row_group": "string|number|null"
  },
  "parse_status": "parsed",
  "source_format": "csv|json|jsonl|parquet|unknown",
  "payload": {},
  "raw_snippet_ref": "string|null",
  "ingest_time": "ISO-8601 string",
  "event_time_candidate": "ISO-8601 string|null"
}
```

### 6.5 `rescue_lane.jsonl` record schema

```json
{
  "record_id": "string",
  "source_id": "string",
  "run_id": "string",
  "window_id": "string",
  "record_locator": {},
  "parse_status": "parse_failed|encoding_failed|schema_exception|unsupported_format",
  "rescue_reason": "string",
  "rescue_severity": "info|warn|block",
  "raw_snippet_ref": "string|null",
  "raw_snippet_redacted": true,
  "error_class": "string",
  "error_message_sample": "string"
}
```

### 6.6 L0-L1 연결 필수 조건

L0에서 온 `source_ref`, `object_ref`, `stream_ref`, `window_id`가 L1 record에 이어져야 한다. L1가 `record_locator`를 만들지 못하면 L2 profile은 만들 수 있어도 L9 reconciliation과 L10 lineage가 약해진다.

### 6.7 검증 조건

- 정상 sample과 rescue lane은 같은 `source_id`와 `run_id`를 사용해야 한다.
- `rescue_lane.jsonl`이 비어 있더라도 파일 또는 summary field는 존재해야 한다.
- raw snippet은 full payload가 아니라 reference 또는 redacted snippet만 허용한다.
- rescue ratio가 높으면 L9 `processing_quality.status`가 최소 `warn`이다.

## 7. L2 계약: Format-specialized Profile Pack

### 7.1 역할

L2는 unknown source를 deterministic profile evidence로 바꾼다. 선택된 `L2-B Format-specialized Profile Pack`은 format router 결과를 기준으로 CSV, JSON/JSONL, Parquet profile을 분리한다.

이 선택은 mixed source와 대용량 source에 유리하다. CSV dialect 추론, JSON path trie, Parquet row-group statistics는 서로 다른 evidence이므로 하나의 generic profile로 뭉치면 뒤 단계 추천 품질이 떨어진다.

### 7.2 From / To

| 구분 | 값 |
| --- | --- |
| From | `M3 L1 bronze samples` |
| To | `M3 L3 AI input evidence pack` |
| Producer | `M3` |
| Consumer | `M3 L3`, `M3 L6`, `M5 artifact store` |

### 7.3 출력 파일

| 파일 | 역할 |
| --- | --- |
| `l2/profile_snapshot.json` | 공통 profile summary와 format router 결과. |
| `l2/schema_fingerprint.json` | schema hash, field/path fingerprint, schema version 후보. |
| `l2/csv_dialect_profile.json` | delimiter, quote, escape, header, encoding, multiline, column profile. |
| `l2/json_path_trie.json` | JSON/JSONL path tree, type distribution, array strategy 후보. |
| `l2/parquet_schema_profile.json` | parquet schema, partition, row-group statistics pointer. |
| `l2/large_source_sketch_profile.json` | 대용량 source용 approximate count, null sketch, distinct sketch, top-k sample. |

### 7.4 `profile_snapshot.json` 필수 필드

```json
{
  "source_id": "string",
  "run_id": "string",
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
  "profile_artifacts": {
    "csv_dialect_profile_ref": "string|null",
    "json_path_trie_ref": "string|null",
    "parquet_schema_profile_ref": "string|null",
    "large_source_sketch_profile_ref": "string|null"
  }
}
```

### 7.5 format별 필수 evidence

| Format | 필수 evidence |
| --- | --- |
| CSV | delimiter, header presence, encoding, quote/escape, multiline 여부, column count drift, null ratio, type 후보 |
| JSON | top-level object/array 판단, record path 후보, nested path trie, array field 전략, malformed object 비율 |
| JSONL | line count sample, malformed line 비율, path trie, per-line record boundary, late schema field 후보 |
| Parquet | schema, partition columns, row-group stats pointer, min/max/null count pointer, schema evolution hint |

### 7.6 검증 조건

- `detected_format=unknown`이어도 L3로 넘길 수 있다. 단 `confidence`와 `evidence`를 반드시 포함한다.
- CSV와 JSONL이 섞인 경우 `detected_format=mixed`로 두고, pack을 여러 개 만들 수 있다.
- L2는 AI 판단을 하지 않는다. L2의 결과는 deterministic profile evidence다.
- 대용량에서는 full distinct count 대신 sketch를 사용한다. 모든 row를 AI나 memory로 올리지 않는다.

## 8. L3 계약: Redaction-first AI Evidence Pack

### 8.1 역할

L3는 AI에게 넘길 evidence를 만든다. 선택된 `L3-B Redaction-first Evidence Pack`은 AI 입력 전에 PII 후보, secret 후보, raw text examples를 먼저 redaction한다.

L3의 핵심은 "AI가 무엇을 봤는지"를 설명할 수 있게 하는 것이다. 따라서 L3는 evidence 축약과 redaction 결과를 모두 versioned artifact로 남긴다.

### 8.2 From / To

| 구분 | 값 |
| --- | --- |
| From | `M3 L2 profile/schema/sketch evidence` |
| To | `M3 L4 AI recommendation model slot` |
| Producer | `M3` |
| Consumer | `M3 L4`, `M5 artifact store`, audit/replay |

### 8.3 출력 파일

| 파일 | 역할 |
| --- | --- |
| `l3/ai_recommendation_input_pack.json` | AI가 실제로 보는 bounded evidence. |
| `l3/redaction_map.json` | 어떤 field/example이 왜 redaction됐는지 기록. |
| `l3/field_evidence_reducer.json` | L2 profile에서 L3 input으로 줄인 규칙과 evidence budget. |
| `l3/policy_context_pack.json` | privacy class, default policy, source owner hint, catalog exposure rule. |

### 8.4 `ai_recommendation_input_pack.json` 필수 필드

```json
{
  "source_id": "string",
  "run_id": "string",
  "profile_ref": "string",
  "redaction_policy_version": "string",
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

### 8.5 `redaction_map.json` 필수 필드

```json
{
  "redaction_policy_version": "string",
  "rules": [
    {
      "rule_id": "string",
      "rule_type": "pii|secret|free_text|identifier|custom",
      "action": "mask|hash|drop_example|keep_shape_only",
      "reason": "string"
    }
  ],
  "field_results": [
    {
      "field_id": "string",
      "source_path": "string",
      "redaction_applied": true,
      "rule_ids": ["string"],
      "risk": "low|medium|high|unknown"
    }
  ]
}
```

### 8.6 L3-L4 연결 필수 조건

L4는 `ai_recommendation_input_pack.json` 외의 raw artifact를 직접 참조하면 안 된다. `L4/ai_generation_trace.json`에는 `input_pack_ref`와 `redaction_policy_version`이 반드시 들어가야 한다.

### 8.7 검증 조건

- `forbidden_raw_payload=true`를 기본값으로 둔다.
- redaction 후에도 column 의미가 너무 약하면 `field_evidence[].profile_confidence`를 낮추고 L4에서 `needs_human_review`를 낼 수 있게 한다.
- raw example이 필요한 것처럼 보이는 field라도 L3에서는 redacted/capped example만 허용한다.

## 9. L4 계약: Strict JSON-schema AI Recommendation Draft

### 9.1 역할

L4는 AI 모델 슬롯이다. 선택된 `L4-A Strict JSON-schema Recommendation`은 AI 출력이 고정 schema를 따르도록 강제한다.

이 layer는 Silver policy draft와 Gold model draft를 동시에 만들 수 있지만, 두 결과는 반드시 분리된 object와 file로 저장한다. Silver는 구조 정제 정책이고, Gold는 의미/metric/model 후보이기 때문이다.

### 9.2 From / To

| 구분 | 값 |
| --- | --- |
| From | `M3 L3 AI input pack` |
| To | `M1/M5 L5 edit and decision` |
| Producer | `M3` with configured model slot |
| Consumer | `M1 UI`, `M5 workflow store`, `M3 L5` |

### 9.3 출력 파일

| 파일 | 역할 |
| --- | --- |
| `l4/silver_policy_recommendation_draft.json` | Silver cleaning/normalization draft. |
| `l4/gold_model_recommendation_draft.json` | Gold metric/table/model draft. |
| `l4/ai_generation_trace.json` | model name, prompt/input refs, output schema version, retry/error trace. |
| `l4/recommendation_validation_result.json` | strict schema validation, unsupported action, missing field result. |

### 9.4 AI model slot

```json
{
  "model_slot": "gpt-5.3-codex-spark",
  "meaning": "AI recommendation model slot for L4 only",
  "not_meaning": "Apache Spark execution engine",
  "input": "l3/ai_recommendation_input_pack.json",
  "outputs": [
    "l4/silver_policy_recommendation_draft.json",
    "l4/gold_model_recommendation_draft.json"
  ]
}
```

### 9.5 Silver draft minimum schema

```json
{
  "source_id": "string",
  "run_id": "string",
  "input_pack_ref": "string",
  "recommendation_schema_version": "string",
  "silver_policy": {
    "target_table_name": "string",
    "record_path": "string|null",
    "columns": [
      {
        "source_path": "string",
        "target_name": "string",
        "recommended_action": "keep|rename|cast|flatten|json_string|mask|hash|drop|quarantine_if_invalid|needs_review",
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

### 9.6 Gold draft minimum schema

```json
{
  "source_id": "string",
  "run_id": "string",
  "input_pack_ref": "string",
  "recommendation_schema_version": "string",
  "gold_models": [
    {
      "gold_model_id": "string",
      "gold_model_type": "metric_table|dimension_summary|entity_summary|event_aggregate|needs_review",
      "source_silver_ref": "string|null",
      "grain": ["string"],
      "dimensions": ["string"],
      "measures": [
        {
          "name": "string",
          "function": "count|sum|avg|min|max|count_distinct|custom_review",
          "source_column": "string|*|null",
          "filter": "string|null"
        }
      ],
      "freshness_sla": "string|null",
      "caveats": ["string"],
      "owner_review_required": true,
      "example_questions": ["string"]
    }
  ],
  "unsupported_actions": [],
  "needs_human_review": []
}
```

### 9.7 `unsupported_actions` 필수 이유

L4 strict schema가 너무 보수적이면 모델이 복잡한 추천을 표현하지 못할 수 있다. 이때 추천을 조용히 버리면 안 된다. `unsupported_actions`, `blocked_reason`, `needs_human_review`에 남겨야 L5 사용자가 판단할 수 있다.

### 9.8 검증 조건

- L4 output은 JSON schema validation을 통과해야 한다.
- schema validation 실패 시 retry는 가능하지만, raw data 추가 입력은 금지한다.
- Silver draft와 Gold draft는 별도 status를 가진다.
- `owner_review_required=true`인 Gold는 L5에서 승인되기 전까지 L6 production spec으로 컴파일하지 않는다.

## 10. L5 계약: Split Silver/Gold Approval

### 10.1 역할

L5는 AI draft를 사용자가 수정하고 승인하는 단계다. 선택된 `L5-A Split Silver/Gold Approval`은 Silver와 Gold를 별도 decision으로 관리한다.

Silver는 구조 안정성 중심이고 Gold는 의미/분석 모델 중심이다. 따라서 Silver가 승인돼도 Gold는 `deferred`, `needs_owner_review`, `rejected`일 수 있다.

### 10.2 From / To

| 구분 | 값 |
| --- | --- |
| From | `M1 user edits and M5 approval state` |
| To | `M3 L6 deterministic spec compiler` |
| Producer | `M1 UI`, `M5 workflow state`, `M3 decision contract` |
| Consumer | `M3 L6`, `M5 audit/history` |

### 10.3 출력 파일

| 파일 | 역할 |
| --- | --- |
| `l5/silver_policy_decision.json` | 최종 Silver cleaning decision. |
| `l5/gold_policy_decision.json` | 최종 Gold model/metric decision. |
| `l5/recommendation_diff.json` | AI draft 대비 사용자 수정 diff. |
| `l5/approval_state.json` | Silver/Gold 각각의 승인 상태, 승인자, 시간, comment. |

### 10.4 approval state schema

```json
{
  "source_id": "string",
  "run_id": "string",
  "decision_version": "string",
  "silver_approval": {
    "status": "draft|edited|approved|rejected|deferred",
    "approver": "string|null",
    "approved_at": "ISO-8601 string|null",
    "comment": "string|null"
  },
  "gold_approval": {
    "status": "draft|edited|approved|rejected|deferred|needs_owner_review",
    "approver": "string|null",
    "approved_at": "ISO-8601 string|null",
    "comment": "string|null"
  },
  "can_compile_silver": true,
  "can_compile_gold": false
}
```

### 10.5 L5-L6 연결 규칙

- `can_compile_silver=true`일 때만 `L6/silver_transform_spec.json`을 만든다.
- `can_compile_gold=true`일 때만 `L6/gold_generation_spec.json`을 만든다.
- Gold가 보류돼도 Silver spec은 만들 수 있다.
- Silver가 승인되지 않으면 Gold spec은 만들 수 없다. Gold는 Silver 위에서 실행되기 때문이다.

### 10.6 검증 조건

- Silver decision과 Gold decision은 같은 `decision_version` 또는 명시적 dependency를 가진다.
- 사용자 수정 diff는 삭제하지 않는다. 나중에 AI 추천 품질 평가와 approval audit에 필요하다.
- approval state가 없는 L4 draft는 L6 compiler 입력으로 사용할 수 없다.

## 11. L6 계약: Whitelist Transform Compiler

### 11.1 역할

L6는 approved decision을 M2가 실행 가능한 deterministic spec으로 컴파일한다. 선택된 `L6-A Whitelist Transform Compiler`는 허용된 action만 compile한다.

L6는 AI draft를 실행 코드로 바꾸는 단계가 아니다. L6는 L5에서 승인된 policy를 검증하고, allowlist에 있는 transform만 Spark/DuckDB/engine-agnostic spec으로 표현한다.

### 11.2 From / To

| 구분 | 값 |
| --- | --- |
| From | `M3 L5 approved decisions` |
| To | `M2 L7/L8 preview execution` |
| Producer | `M3` |
| Consumer | `M2`, `M5`, `M6 lineage` |

### 11.3 출력 파일

| 파일 | 역할 |
| --- | --- |
| `l6/silver_transform_spec.json` | Silver 정제 실행 spec. |
| `l6/gold_generation_spec.json` | Gold 생성 실행 spec. |
| `l6/layered_transform_graph.json` | raw -> bronze -> silver -> gold lineage graph. |
| `l6/compiler_validation_result.json` | allowlist/forbidden pattern 검증 결과. |
| `l6/unsupported_action_report.json` | L5 decision 중 compile하지 못한 action과 이유. |

### 11.4 허용 action

| Action | 설명 |
| --- | --- |
| `select` | source field/path 선택 |
| `rename` | target column rename |
| `cast` | allowlisted type으로 변환 |
| `parse_timestamp` | format이 명시된 timestamp parse |
| `normalize_null` | null/empty/missing normalization |
| `flatten_struct` | bounded nested struct flatten |
| `explode_array` | 명시 승인된 bounded array explode |
| `json_string` | nested value를 JSON string column으로 보존 |
| `mask` | policy 기반 masking |
| `hash` | deterministic salted hash, salt는 secret_ref |
| `drop` | 사용자 승인된 field drop |
| `quarantine_if_invalid` | rule 실패 record를 quarantine으로 routing |
| `aggregate` | Gold grain/dimension/measure 기반 aggregation |
| `watermark_filter` | streaming/window freshness 조건 |

### 11.5 금지 pattern

| Pattern | 이유 |
| --- | --- |
| per-row AI call | 실시간/대용량 data-plane 비용과 지연이 비현실적이다. |
| generated code execution | 보안 및 재현성 문제가 크다. |
| unbounded collect | driver memory overflow 위험이 있다. |
| unbounded cross join | 대용량에서 폭발한다. |
| nondeterministic function without seed | replay 결과가 달라진다. |
| raw PII exposure to default catalog | L3/L7/L10 policy와 충돌한다. |
| hidden drop without decision | 데이터 손실 추적이 불가능하다. |

### 11.6 `compiler_validation_result.json` minimum schema

```json
{
  "source_id": "string",
  "run_id": "string",
  "compiler_version": "string",
  "decision_ref": "string",
  "silver_compile_status": "pass|warn|block|not_requested",
  "gold_compile_status": "pass|warn|block|not_requested",
  "allowlist_version": "string",
  "blocked_actions": [
    {
      "action": "string",
      "layer": "silver|gold",
      "reason": "string",
      "owner_action": "string"
    }
  ],
  "warnings": []
}
```

### 11.7 검증 조건

- L6 spec은 같은 input decision에서 같은 output을 생성해야 한다.
- L6 spec은 M2가 실행할 수 있는 JSON contract여야 하며, AI prompt나 free-form text만으로 구성되면 안 된다.
- unsupported action은 삭제하지 않고 report로 남긴다.
- Gold spec은 `silver_transform_spec_ref`를 반드시 가져야 한다.

## 12. L7 계약: PII + Quarantine Structural Validation

### 12.1 역할

L7은 M2가 실행한 Silver preview 결과를 구조적으로 검증한다. 선택된 `L7-B PII + Quarantine Structural Validation`은 PII masking/hash, forbidden column exposure, quarantine routing을 Silver preview 단계에서 확인한다.

L7은 L3와 역할이 다르다. L3는 AI 입력 전 redaction이고, L7은 실제 Silver output preview가 catalog에 공개돼도 되는 구조인지 확인한다.

### 12.2 From / To

| 구분 | 값 |
| --- | --- |
| From | `M2 executes silver spec` |
| To | `M2 L8 Gold preview + M3 L9 gate` |
| Producer | `M2` preview execution, `M3` validation rules |
| Consumer | `M3 L9`, `M5 run evidence`, `M6 caveat` |

### 12.3 출력 파일

| 파일 | 역할 |
| --- | --- |
| `l7/silver_preview_ref.json` | M2 Silver preview output pointer. |
| `l7/silver_preview_validation_result.json` | schema, row count, type conversion, null rule 검증. |
| `l7/pii_exposure_report.json` | masking/hash/hidden catalog exposure 검증. |
| `l7/silver_quarantine_report.json` | quarantine routing count와 sample refs. |
| `l7/silver_quality_axis.json` | L9 processing quality axis의 Silver 입력. |

### 12.4 검증 항목

| 항목 | 설명 |
| --- | --- |
| schema match | L6 target schema와 preview schema가 일치하는지 확인한다. |
| row count reconciliation | L1 parsed count, L6 transform expectation, L7 preview count를 비교한다. |
| type conversion | cast 실패율과 fallback/null 처리 결과를 확인한다. |
| PII exposure | hidden/masked/hash 처리된 field가 default catalog에 노출되지 않는지 확인한다. |
| quarantine routing | invalid record가 drop이 아니라 quarantine으로 갔는지 확인한다. |
| sample safety | preview sample이 redaction policy를 위반하지 않는지 확인한다. |

### 12.5 `pii_exposure_report.json` minimum schema

```json
{
  "source_id": "string",
  "run_id": "string",
  "redaction_policy_version": "string",
  "silver_spec_ref": "string",
  "field_results": [
    {
      "field_name": "string",
      "source_path": "string",
      "expected_handling": "none|mask|hash|hide_from_default_catalog",
      "observed_handling": "none|mask|hash|hidden",
      "status": "pass|warn|block",
      "reason": "string"
    }
  ]
}
```

### 12.6 검증 조건

- L3에서 PII 후보로 표시된 field는 L7에서 masking/hash/hide 여부를 다시 확인한다.
- quarantine rule이 없더라도 `silver_quarantine_report.json`은 존재해야 한다.
- PII block이 있으면 L9 `catalog_safety.status=block`이다.

## 13. L8 계약: Metric Definition Draft

### 13.1 역할

L8은 M2가 실행한 Gold preview 결과를 semantic readiness 관점에서 평가한다. 선택된 `L8-C Metric Definition Draft`는 Gold preview와 함께 metric name, grain, measure, dimension, caveat, example SQL을 만든다.

Gold는 반드시 business semantic이 들어간다. 따라서 Gold preview가 물리적으로 실행됐더라도, grain이나 metric 의미가 약하면 `gold_readiness`는 `warn` 또는 `block`일 수 있다.

### 13.2 From / To

| 구분 | 값 |
| --- | --- |
| From | `M2 executes gold spec over Silver` |
| To | `M3 L9 readiness gate` |
| Producer | `M2` preview execution, `M3` metric readiness rules |
| Consumer | `M3 L9`, `M5 catalog`, `M6 query context` |

### 13.3 출력 파일

| 파일 | 역할 |
| --- | --- |
| `l8/gold_preview_ref.json` | M2 Gold preview output pointer. |
| `l8/gold_preview_validation_result.json` | row count, grain cardinality, freshness, measure sanity 검증. |
| `l8/metric_definition_draft.json` | metric/grain/measure/dimension/caveat/example SQL 정의. |
| `l8/gold_readiness_axis.json` | L9 Gold readiness axis의 입력. |
| `l8/semantic_caveat_report.json` | owner review, caveat, weak semantic warning. |

### 13.4 `metric_definition_draft.json` minimum schema

```json
{
  "source_id": "string",
  "run_id": "string",
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
      "owner_review_required": true
    }
  ]
}
```

### 13.5 non-metric Gold 처리

모든 Gold가 metric table은 아니다. JSONL review/event text처럼 entity summary가 더 자연스러운 경우가 있다. 그래도 L8-C를 선택했으므로 `metric_definition_draft.json`은 다음 방식으로 처리한다.

```json
{
  "gold_model_type": "entity_summary|dimension_summary|needs_review",
  "metric_definitions": [],
  "semantic_definition": {
    "entity": "string",
    "grain": ["string"],
    "summary_fields": ["string"],
    "example_questions": ["string"],
    "owner_review_required": true
  }
}
```

즉, metric이 없으면 빈 metric을 억지로 만들지 않는다. 대신 semantic definition과 owner review requirement를 남긴다.

### 13.6 검증 조건

- Gold preview는 Silver preview ref를 가져야 한다.
- metric definition은 field lineage를 포함해야 한다.
- example SQL은 allowlisted table/column만 사용해야 한다.
- owner review가 필요한 metric은 L9 `gold_readiness.status`를 `warn` 또는 `block`으로 만든다.

## 14. L9 계약: Three-axis Gate Status

### 14.1 역할

L9는 quality, drift, quarantine, catalog safety, Gold readiness를 gate로 평가한다. 선택된 `L9-A Three-axis Gate Status`는 processing quality, catalog safety, Gold readiness를 별도 axis로 저장한다.

이 선택은 기존 "전부 warn처럼 보이는 문제"를 해결한다. 하나의 status로 모든 문제를 표현하면 M2 처리 문제인지, M5 catalog 공개 문제인지, M6 질의 semantic 문제인지 알 수 없다.

### 14.2 From / To

| 구분 | 값 |
| --- | --- |
| From | `M2 preview metrics + M3 gate rules` |
| To | `M5/M6 L10 handoff` |
| Producer | `M3` |
| Consumer | `M5 catalog`, `M6 query context`, `M1 UI` |

### 14.3 출력 파일

| 파일 | 역할 |
| --- | --- |
| `l9/processing_quality_axis.json` | parse, transform, row count, replay, reconciliation status. |
| `l9/catalog_safety_axis.json` | PII exposure, forbidden field, catalog exposure safety status. |
| `l9/gold_readiness_axis.json` | metric semantic readiness, owner review, freshness/caveat status. |
| `l9/drift_snapshot.json` | schema/profile drift 결과. |
| `l9/quarantine_result.json` | quarantine count, reason, severity. |
| `l9/reconciliation_result.json` | L0/L1/L7/L8 count/fingerprint 대조. |
| `l9/gate_summary.json` | 세 axis를 하나로 묶은 UI/API summary. |

### 14.4 axis schema

```json
{
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

### 14.5 gate summary schema

```json
{
  "source_id": "string",
  "run_id": "string",
  "gate_version": "string",
  "processing_quality": {},
  "catalog_safety": {},
  "gold_readiness": {},
  "overall_catalog_publishable": true,
  "overall_query_ready": false,
  "safe_to_run_silver": true,
  "safe_to_run_gold": false
}
```

### 14.6 검증 조건

- PII exposure block은 catalog safety block이다.
- Silver row count mismatch는 processing quality warn 또는 block이다.
- Gold owner review 미완료는 gold readiness warn 또는 block이다.
- `overall_query_ready=true`가 되려면 catalog safety와 gold readiness가 모두 block이 아니어야 한다.

## 15. L10 계약: Catalog Sync Contract Package

### 15.1 역할

L10은 최종 handoff layer다. 선택된 `L10-C Catalog Sync Contract Package`는 M5 저장 상태, artifact version, schema version, decision version, gate version을 한 package로 묶는다.

단, 이 선택을 version sync만으로 구현하면 부족하다. L10은 M6 query context도 책임지므로, 아래 reference를 반드시 포함해야 한다.

- `metric_definition_ref`
- `catalog_metadata_ref`
- `field_lineage_ref`
- `sql_context_ref`
- `quality_axis_ref`

### 15.2 From / To

| 구분 | 값 |
| --- | --- |
| From | `M3 L0-L9 refs and gate results` |
| To | `M5 catalog + M6 query context` |
| Producer | `M3`, stored by `M5` |
| Consumer | `M5`, `M6`, `M1 UI` |

### 15.3 출력 파일

| 파일 | 역할 |
| --- | --- |
| `l10/catalog_sync_contract_package.json` | version, refs, publish/query readiness를 하나로 묶은 package. |
| `l10/artifact_reference_manifest.json` | L0-L10 artifact logical/physical URI와 checksum. |
| `l10/catalog_metadata_draft.json` | M5 catalog 저장용 dataset/table/field metadata. |
| `l10/field_level_lineage.json` | raw path -> Silver column -> Gold metric lineage. |
| `l10/sql_context_pack.json` | M6 SQL/AI query context, allowed table/column/metric/caveat. |
| `l10/handoff_package.json` | M5/M6에 넘기는 최종 package index. |

### 15.4 `catalog_sync_contract_package.json` minimum schema

```json
{
  "source_id": "string",
  "run_id": "string",
  "catalog_contract_version": "string",
  "artifact_version": "string",
  "schema_version": "string",
  "profile_version": "string",
  "decision_version": "string",
  "gate_version": "string",
  "m5_storage_status": "draft|stored|failed|superseded",
  "m6_query_context_status": "not_ready|ready_with_caveat|ready|blocked",
  "refs": {
    "source_manifest_ref": "string",
    "profile_snapshot_ref": "string",
    "redaction_map_ref": "string",
    "silver_decision_ref": "string",
    "gold_decision_ref": "string",
    "silver_spec_ref": "string",
    "gold_spec_ref": "string|null",
    "silver_preview_ref": "string",
    "gold_preview_ref": "string|null",
    "metric_definition_ref": "string|null",
    "catalog_metadata_ref": "string",
    "field_lineage_ref": "string",
    "sql_context_ref": "string",
    "quality_axis_ref": "string",
    "gate_summary_ref": "string"
  }
}
```

### 15.5 `catalog_metadata_draft.json` minimum schema

```json
{
  "dataset_id": "string",
  "source_id": "string",
  "run_id": "string",
  "dataset_name": "string",
  "layers": ["bronze", "silver", "gold"],
  "source_format": "csv|json|jsonl|parquet|mixed|unknown",
  "storage_refs": {},
  "schema": [],
  "quality": {
    "processing_quality": "pass|warn|block",
    "catalog_safety": "pass|warn|block",
    "gold_readiness": "pass|warn|block"
  },
  "caveats": ["string"],
  "lineage_ref": "string",
  "sql_context_ref": "string"
}
```

### 15.6 `sql_context_pack.json` minimum schema

```json
{
  "source_id": "string",
  "run_id": "string",
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
  "query_caveats": ["string"]
}
```

### 15.7 검증 조건

- L10 package가 M5 저장용 catalog metadata만 포함하고 M6 SQL context를 빠뜨리면 계약 불완전이다.
- `m6_query_context_status=ready`가 되려면 `sql_context_ref`, `quality_axis_ref`, `field_lineage_ref`가 모두 있어야 한다.
- `forbidden_fields`는 L3 redaction, L7 PII validation, L9 catalog safety 결과와 일치해야 한다.
- L10은 final package지만 source of truth를 위조하지 않는다. 각 ref는 L0-L9 artifact를 가리켜야 한다.

## 16. L0-L10 연결 필드 matrix

| Field / Ref | L0 | L1 | L2 | L3 | L4 | L5 | L6 | L7 | L8 | L9 | L10 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `source_id` | required | required | required | required | required | required | required | required | required | required | required |
| `run_id` | required | required | required | required | required | required | required | required | required | required | required |
| `window_id` | required for window | required | recommended | summary | trace | optional | optional | preview scope | preview scope | reconciliation | ref |
| `record_locator` | object/stream basis | required | sample basis | evidence basis | no raw record | no raw record | lineage only | validation sample | metric lineage | reconciliation | lineage |
| `profile_ref` | no | no | output | required | trace | optional | optional | optional | optional | optional | required |
| `redaction_policy_version` | no | no | optional | required | required | required | required | required | optional | required | required |
| `decision_version` | no | no | no | no | draft ref | required | required | required | required | required | required |
| `spec_ref` | no | no | no | no | no | no | output | required | required | required | required |
| `gate_version` | no | no | no | no | no | no | no | no | no | required | required |

## 17. 파일 형식별 적용 규칙

### 17.1 CSV

CSV는 L2에서 `csv_dialect_profile.json`을 반드시 만든다. delimiter, quote, escape, header, encoding, multiline 여부가 불명확하면 L4는 aggressive cast를 추천하면 안 된다.

CSV는 row number와 byte offset을 `record_locator`로 남긴다. multiline CSV는 line number만으로 record를 재현하기 어려우므로 `byte_start`, `byte_end`를 우선한다.

CSV Silver는 `rename`, `cast`, `normalize_null`, `mask`, `hash`, `quarantine_if_invalid` 중심으로 compile한다. Gold는 grain/dimension/measure가 비교적 명확하면 L8 metric definition으로 바로 이어질 수 있다.

### 17.2 JSON

top-level JSON array는 full object seek가 어려울 수 있으므로 L0 replay pointer가 특히 중요하다. L2는 record path 후보를 반드시 남긴다.

nested object는 L6에서 `flatten_struct` 또는 `json_string`으로 처리한다. unbounded nested array explode는 L6 allowlist에서 명시 승인되지 않으면 block한다.

Gold는 metric table이 아닐 수 있다. entity summary가 더 적합하면 L8에서 metric을 억지로 만들지 않고 semantic definition과 owner review requirement를 남긴다.

### 17.3 JSONL

JSONL은 stream/micro-batch와 가장 잘 맞는다. L0 `stream_windows` 또는 object line-range replay pointer를 사용한다.

L1 rescue lane은 malformed line을 버리지 않고 line number, byte range, parse error reason을 남긴다. L2는 JSON path trie와 malformed line ratio를 만든다.

PII/free-text가 많을 가능성이 높으므로 L3 redaction-first와 L7 PII validation이 모두 중요하다.

### 17.4 Parquet

Parquet은 row-level rescue보다 file/schema exception lane이 적합하다. L2는 schema와 row-group statistics pointer를 적극 사용한다.

L6 Silver spec은 column projection, rename, cast, partition-aware processing에 유리하다. L7은 column exposure allowlist와 schema compatibility를 우선 확인한다.

L10은 Parquet partition version과 artifact version을 함께 기록해야 한다. partition drift가 있으면 L9 drift snapshot에 남긴다.

## 18. 대용량/실시간 적용 규칙

### 18.1 AI는 모든 row를 보지 않는다

실시간 비정형 빅데이터에서 모든 row를 AI가 본다는 설계는 금지한다. L3 evidence pack은 bounded profile, sketch, capped examples만 포함한다.

### 18.2 profile은 full scan만 가정하지 않는다

L2는 source 규모에 따라 sample, range, stratified window, sketch를 사용할 수 있다. 대용량에서는 `large_source_sketch_profile.json`을 사용하고, exact metric이 필요한 경우 M2 실행 결과를 기다린다.

### 18.3 stream은 window 단위로 계약한다

stream source는 `window_id`, offset range, checkpoint ref를 중심으로 L0-L10을 연결한다. L9 reconciliation도 전체 stream이 아니라 window별로 한다.

### 18.4 preview는 bounded execution이다

L7/L8 preview는 production full materialization이 아니다. preview scope, row limit, time window, sampled partition을 명시해야 한다.

### 18.5 금지되는 대용량 패턴

- raw 전체를 M3 local artifact로 복제
- L3 AI input pack에 raw row dump 포함
- L4 AI가 Spark code를 자유 생성해서 바로 실행
- L6에서 unbounded collect/cross join 허용
- L7/L8 preview를 full production run처럼 표현
- L9 status를 단일 warn/pass로 축약

## 19. M별 책임 경계

| Module | 책임 | 받는 것 | 주는 것 |
| --- | --- | --- | --- |
| `M1` | source registration, user edit UI | L4 draft, L5 decision UI state | source config, user edits, approval |
| `M2` | Spark/engine execution, preview materialization | L6 Silver/Gold spec | L7/L8 preview refs, execution metrics |
| `M3` | profiling, evidence pack, AI recommendation draft, deterministic spec, gate, handoff draft | M1 source, M2 preview metrics, M5 state | L0-L10 artifacts |
| `M5` | workflow state, artifact/catalog storage | L4 draft, L5 approval, L10 package | storage refs, approval state, catalog status |
| `M6` | SQL/AI query context consumer | L10 sql context, quality/caveat/lineage | query behavior, answer caveat consumption |

## 20. 구현 순서 권장

### 20.1 최소 vertical slice

1. L0 `source_manifest.json`, `object_stream_manifest.json`
2. L1 `bronze_envelope_samples.jsonl`, `rescue_lane.jsonl`
3. L2 `profile_snapshot.json`, format-specific profile 하나 이상
4. L3 `ai_recommendation_input_pack.json`, `redaction_map.json`
5. L4 strict schema draft 생성
6. L5 approval state 저장
7. L6 whitelist compiler로 Silver spec 생성
8. L7 Silver preview validation
9. L9 three-axis gate 중 processing/catalog axis
10. L10 catalog sync package와 sql context pack

### 20.2 Gold까지 포함한 slice

1. L4 Gold draft 생성
2. L5 Gold approval 분리
3. L6 Gold spec 생성
4. L8 Gold preview와 metric definition draft 생성
5. L9 gold readiness axis 생성
6. L10 metric definition ref와 M6 SQL context 연결

## 21. Acceptance checklist

### 21.1 구조 계약

- [ ] L0-L10 각각 main artifact가 존재한다.
- [ ] 모든 artifact가 `source_id`, `run_id`, `artifact_id`, `artifact_version`을 가진다.
- [ ] L0 `object_stream_manifest.json`이 object와 stream window를 모두 표현할 수 있다.
- [ ] L1 rescue lane이 비어 있어도 summary와 artifact ref가 존재한다.
- [ ] L2가 detected format별 profile pack을 분리한다.

### 21.2 AI 경계

- [ ] L3 input pack에 raw full row dump가 없다.
- [ ] L3 redaction map이 존재한다.
- [ ] L4 output은 strict JSON schema validation을 통과한다.
- [ ] L4 output은 Silver draft와 Gold draft를 분리한다.
- [ ] L4 output은 L5 approval 없이 L6 compiler에 들어가지 않는다.

### 21.3 Silver/Gold 결정

- [ ] L5 approval state가 Silver와 Gold를 별도 status로 저장한다.
- [ ] Silver 승인 없이 Gold compile이 되지 않는다.
- [ ] Gold 보류 상태에서도 Silver compile은 가능하다.
- [ ] L6 compiler가 unsupported action을 삭제하지 않고 report로 남긴다.

### 21.4 Preview/Gate

- [ ] L7이 PII masking/hash/hidden exposure를 검증한다.
- [ ] L8이 metric definition 또는 semantic definition을 만든다.
- [ ] L9가 processing quality, catalog safety, gold readiness를 별도 axis로 저장한다.
- [ ] PII block은 catalog safety block으로 이어진다.
- [ ] owner review 필요 Gold는 gold readiness warn/block으로 이어진다.

### 21.5 Catalog/M6 handoff

- [ ] L10 `catalog_sync_contract_package.json`이 version set을 포함한다.
- [ ] L10이 `metric_definition_ref`, `catalog_metadata_ref`, `field_lineage_ref`, `sql_context_ref`, `quality_axis_ref`를 포함한다.
- [ ] `sql_context_pack.json`에 allowed tables, allowed columns, forbidden fields, caveats, freshness가 있다.
- [ ] M6는 L10만 보고 query context와 caveat를 구성할 수 있다.

## 22. Regression guard

아래 상태가 발생하면 계약 위반으로 본다.

| 위반 | 영향 |
| --- | --- |
| L4 AI가 raw file path를 직접 읽음 | AI/data-plane 분리 위반 |
| L5 approval 없이 L6 spec 생성 | user decision contract 위반 |
| L6 unsupported action이 조용히 누락됨 | 데이터 손실/의미 손실 위험 |
| L7 PII block인데 L10 catalog ready | catalog safety 위반 |
| L8 owner review required인데 L9 gold readiness pass | semantic readiness 위반 |
| L10에 sql context ref 없음 | M6 handoff 불완전 |
| 단일 `status=warn`만 제공 | three-axis gate 위반 |

## 23. 최종 판단

현재 선택 조합은 유지한다. 억지로 다른 후보를 섞을 필요는 없다. 다만 구현 시 핵심은 후보 이름이 아니라 연결 필드와 version/ref 계약이다.

가장 중요한 보강점은 세 가지다.

1. L0-L2는 `source_ref`, `object_ref`, `stream_ref`, `window_id`, `record_locator`를 끊지 않는다.
2. L3-L7은 `redaction_policy_version`, `redaction_map_ref`, `pii_exposure_report`를 공유한다.
3. L8-L10은 `metric_definition_ref`, `field_lineage_ref`, `sql_context_ref`, `quality_axis_ref`를 반드시 묶는다.

이 세 가지가 지켜지면 선택된 L0-C, L1-A, L2-B, L3-B, L4-A, L5-A, L6-A, L7-B, L8-C, L9-A, L10-C 조합은 unknown CSV/JSON/JSONL/Parquet source와 대용량/실시간 운영 가정에 맞는 현실적인 M3 계약으로 볼 수 있다.
