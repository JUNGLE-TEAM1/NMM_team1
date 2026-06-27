# L0 Raw Preservation 상세 설계

## 1. 역할

L0는 원본 데이터를 정제하거나 복사하는 계층이 아니다. L0의 목적은 M1이 등록한 source를 M3가 이후 계층에서 같은 조건으로 다시 읽을 수 있도록 source pointer, object metadata, stream window, checksum, byte size, partition value, ingest range를 보존하는 것이다.

가장 중요한 식별자는 `source_unit_id`다. object-only CSV 파일, JSONL landing object, Parquet partition, stream micro-batch 모두 L1 이후에는 같은 처리 단위로 추적되어야 한다. `source_unit_id`가 없으면 L1 record, L2 profile, L9 reconciliation, L10 lineage가 서로 다른 기준을 보게 된다.

## 2. 선택 방식

선택 방식은 `Object + Stream Hybrid Manifest`다. batch object와 stream window를 완전히 다른 모델로 나누지 않고, 둘 다 `source_unit_id` 아래에 묶는다. object-only source는 `object_batch`, stream-only source는 `stream_window`, 둘이 함께 있으면 `hybrid_window`로 둔다.

이 방식은 현재 M3 core가 full streaming runtime을 처리하지 않으면서도 실시간성 있는 big data를 설명할 수 있게 한다. L0는 stream runtime의 checkpoint semantics나 exactly-once 처리를 책임지지 않는다. 대신 “이 window를 다시 보려면 어떤 object/offset/checkpoint hint가 필요한가”를 manifest로 남긴다.

## 3. 선택 이유

unknown data에서는 처음부터 schema를 믿을 수 없다. 따라서 정제 결과보다 먼저 replay 가능한 source 단위가 필요하다. CSV delimiter가 틀렸거나 JSONL 일부 line이 깨졌거나 Parquet schema가 예상과 달라도, L0가 source unit과 raw pointer를 남기면 이후 계층에서 다시 profile하거나 정책을 바꿔 재실행할 수 있다.

또한 대용량에서는 raw를 M3 artifact로 full copy하는 방식이 비현실적이다. 원본 이동이나 MinIO 적재는 M1/M2/infra 책임이고, M3는 pointer와 checksum 중심으로 raw preservation 계약을 만든다. 이 경계가 있어야 M3가 50GB, 100GB 데이터 전체를 불필요하게 복제하지 않는다.

## 4. 주요 산출 파일

| 파일 | 설명 |
| --- | --- |
| `l0/object_stream_manifest.json` | source kind, source units, object refs, stream window refs를 담는 핵심 manifest다. |
| `l0/source_registration_snapshot.json` | M1이 등록한 source config를 M3 run 시점에 고정한 snapshot이다. |
| `l0/raw_access_policy.json` | raw source 접근 권한, access class, catalog 노출 금지 조건을 기록한다. |

모든 파일은 공통 `artifact_header`를 가진다. 다른 파일을 참조할 때는 URI object를 직접 넣지 않고 string `artifact_id`만 넣는다. 실제 URI와 checksum은 L10의 `artifact_reference_manifest.json`에서 resolve한다.

## 5. 장점

첫째, batch와 stream을 같은 lineage 모델로 설명할 수 있다. source가 처음에는 CSV landing file이었다가 나중에 JSONL stream micro-batch로 바뀌어도 L1 이후 계층의 계약을 크게 바꾸지 않아도 된다.

둘째, 대용량에서 저장 비용을 줄인다. raw 전체를 복제하지 않고 pointer와 checksum을 남기므로 M3 artifact 용량이 통제된다. 필요한 경우에만 M2나 storage layer가 source unit을 다시 읽는다.

셋째, 실패 분석이 쉬워진다. 특정 preview 결과가 이상하면 L9/L10에서 `source_unit_id`를 따라 L0 object나 stream window까지 되돌아갈 수 있다.

## 6. 단점과 문제

첫째, source unit을 어떻게 자를지 규칙이 필요하다. object 1개를 unit 1개로 볼지, partition 여러 개를 unit 1개로 볼지, stream offset range를 몇 분 단위로 볼지는 source type과 운영 목적에 따라 달라진다.

둘째, pointer 기반 설계는 원본 저장소의 lifecycle에 의존한다. raw object가 삭제되거나 version이 바뀌면 L0 manifest만으로 replay할 수 없다. 따라서 raw storage retention policy는 M1/M2/infra와 별도로 맞춰야 한다.

셋째, stream runtime 보장을 제공하지 않는다. L0는 offset hint와 checkpoint ref를 기록할 수 있지만, exactly-once, late event merge, watermark state는 core 범위가 아니다.

## 7. 가능 범위

CSV, JSON, JSONL, Parquet object source를 지원한다. object metadata는 URI, etag, checksum, byte size, compression, partition values, modified time을 포함한다. stream window는 stream name, partition, start/end offset, ingest time range, event time candidate range를 포함할 수 있다.

실시간성은 micro-batch/window 단위로만 다룬다. 즉 “지속 실행되는 streaming job”이 아니라 “특정 window를 L1-L10으로 분석하고 preview할 수 있는 단위”를 정의한다.

## 8. 한계

L0는 source schema를 확정하지 않는다. schema는 L2에서 profile한다. L0는 PII를 판정하지 않는다. PII는 L3/L7/L10 validator가 다룬다. L0는 production checkpoint나 sink commit을 관리하지 않는다. production execution은 core가 아니라 extension hook 또는 M2 계약이다.

## 9. 검증 기준

`source_units[]`는 비어 있으면 안 된다. object-only source도 반드시 `source_unit_id`를 가져야 한다. `source_kind=hybrid`이면 object와 stream window가 모두 존재해야 한다. 모든 `*_ref`는 string artifact id여야 하며, URI object가 직접 들어가면 block이다.

## 10. Handoff

L0는 M1 source registration에서 시작하고 L1 bronze envelope로 넘어간다. L1은 L0의 `source_unit_id`, object id, stream window id를 record locator에 이어 붙인다. 이 연결이 끊기면 L9 reconciliation과 L10 lineage가 약해진다.
