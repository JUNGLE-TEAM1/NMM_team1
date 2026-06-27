# L1 Bronze Envelope 상세 설계

## 1. 역할

L1은 raw를 Silver로 정제하는 계층이 아니다. L1은 raw source를 읽어 parse 가능한 record와 parse 실패 record를 모두 보존하는 bronze envelope 계층이다. 성공한 sample만 남기는 방식은 unknown data에서 위험하다. 실패한 row, 깨진 line, encoding 문제, schema exception이 실제 품질 문제의 핵심일 수 있기 때문이다.

L1의 핵심 원칙은 손실 방지다. 정제하지 못한 record를 버리지 않고 `rescue_lane`으로 분리한다. 정상 record도 `source_unit_id`와 `record_locator`를 유지해 원본 위치까지 추적할 수 있게 한다.

## 2. 선택 방식

선택 방식은 `Bronze Envelope + Rescue Lane`이다. 정상 parse record는 `bronze_envelope_samples.jsonl`로, parse failure는 `rescue_lane.jsonl`로 남긴다. 두 파일 모두 sidecar manifest를 가진다.

JSONL record마다 heavy header를 반복하지 않는다. 대신 `.manifest.json` 파일이 artifact header와 file-level metadata를 가진다. record body에는 record id, source ref, source unit, locator, parse status, payload 또는 failure reason만 둔다.

## 3. 선택 이유

CSV/JSON/JSONL unknown source에서는 “못 읽은 것”이 곧 중요한 데이터다. delimiter 추정이 틀린 CSV, top-level array가 너무 큰 JSON, 중간 line이 깨진 JSONL, 일부 row group이 읽히지 않는 Parquet을 단순히 sample에서 제외하면 L2 profile이 실제 품질을 과대평가한다.

또한 rescue lane은 사용자에게 policy 선택 근거를 준다. 예를 들어 “깨진 row를 quarantine할지”, “encoding failure를 block할지”, “부분 parse를 허용할지”는 L4/L5 추천과 승인에 직접 영향을 준다.

## 4. 주요 산출 파일

| 파일 | 설명 |
| --- | --- |
| `l1/bronze_envelope_samples.manifest.json` | 정상 sample JSONL의 artifact metadata와 sampling 범위를 기록한다. |
| `l1/bronze_envelope_samples.jsonl` | parse 성공 record sample을 담는다. |
| `l1/rescue_lane.manifest.json` | parse 실패 JSONL의 artifact metadata와 failure 집계 범위를 기록한다. |
| `l1/rescue_lane.jsonl` | parse 실패, encoding failure, unsupported format record를 담는다. |
| `l1/bronze_window_manifest.json` | L0 source unit과 L1 sample/rescue 범위를 연결한다. |

## 5. 장점

첫째, parse 실패가 사라지지 않는다. quality gate와 catalog caveat에서 “읽지 못한 비율”을 설명할 수 있다.

둘째, 원본 위치 추적이 가능하다. line number, byte range, json path, parquet row group, stream offset 중 가능한 locator를 남기므로 재현성이 높아진다.

셋째, L2 profile이 정상 sample과 failure summary를 함께 볼 수 있다. 정상 record만 본 profile보다 정책 추천이 현실적이다.

## 6. 단점과 문제

첫째, record locator 생성 비용이 있다. 특히 압축 파일이나 nested JSON에서는 byte offset이나 json path를 정확하게 남기기 어렵다.

둘째, raw snippet을 잘못 남기면 PII가 유출될 수 있다. L1은 raw-restricted 성격이므로 catalog나 AI input으로 바로 넘기면 안 된다.

셋째, 너무 큰 rescue lane은 저장 비용과 검토 비용을 키운다. 대용량에서는 failure 전체가 아니라 bounded sample과 집계 summary를 함께 써야 한다.

## 7. 가능 범위

CSV row, JSONL line, JSON array element, Parquet row-group sample, stream offset record를 다룰 수 있다. parse status는 `parsed`, `parse_failed`, `encoding_failed`, `schema_exception`, `unsupported_format` 같은 상태를 가진다.

L1은 source format 확정 전에도 동작해야 한다. declared format과 detected format이 다르면 L2에서 confidence와 evidence로 표현한다.

## 8. 한계

L1은 type cast를 하지 않는다. timestamp parsing, null token normalization, nested flattening, PII masking은 L4-L7 범위다. L1은 semantic rename도 하지 않는다. field 의미 판단은 L2 profile과 L4 recommendation이 맡는다.

## 9. 검증 기준

모든 L1 record는 `source_unit_id`를 가져야 한다. 가능한 locator field가 하나 이상 있어야 한다. rescue record는 failure reason과 severity를 가져야 한다. raw snippet은 있더라도 restricted ref여야 하며 AI-safe artifact로 직접 전달되면 안 된다.

## 10. Handoff

L1은 L0 manifest에서 source unit을 받고 L2 profile snapshot으로 넘긴다. L2는 정상 sample의 field profile뿐 아니라 rescue summary를 함께 사용한다. 이 연결 덕분에 L4가 “정상 field만 보고 좋은 schema처럼 보이는 착시”를 줄일 수 있다.
