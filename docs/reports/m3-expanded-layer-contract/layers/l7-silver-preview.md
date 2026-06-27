# L7 Silver Preview and Structural Validation 상세 설계

## 1. 역할

L7은 M2가 L6 Silver spec을 실행한 결과를 검증하는 계층이다. L7의 관심사는 Silver가 구조적으로 쓸 수 있는지, type conversion이 과도하게 실패하지 않았는지, quarantine routing이 동작했는지, PII exposure가 안전한지 확인하는 것이다.

L7은 production run 검증이 아니다. L7은 bounded preview 결과를 기반으로 L9 gate에 넘길 evidence를 만든다.

## 2. 선택 방식

선택 방식은 `Silver Preview + PII/Quarantine Validation`이다. M2가 preview를 수행하고, L7은 output schema, row count, null/type conversion error, quarantine count, PII exposure report, sample output fingerprint를 만든다.

L7은 Silver가 “실행 가능함”과 “catalog/query context에 노출 가능함”을 분리해서 본다. 실행은 됐지만 PII가 default visible이면 catalog safety는 block될 수 있다.

## 3. 선택 이유

AI 추천과 compiler validation만으로는 실제 output 품질을 알 수 없다. cast가 대부분 null을 만들 수도 있고, explode가 row 수를 과도하게 늘릴 수도 있고, hash/mask가 적용되지 않았을 수도 있다. L7은 실제 preview evidence를 통해 이를 확인한다.

또한 L7은 L3의 redaction과 다른 문제를 본다. L3는 AI input 안전성이고, L7은 Silver output 안전성이다. AI에게 안 보였더라도 Silver catalog에 노출되면 안 되는 field가 있을 수 있다.

## 4. 주요 산출 파일

| 파일 | 설명 |
| --- | --- |
| `l7/silver_preview_ref.json` | M2 preview output 위치와 fingerprint를 담는다. |
| `l7/silver_preview_validation_result.json` | schema, row count, conversion error, warning/block status를 담는다. |
| `l7/pii_exposure_report.json` | Silver output과 catalog/query exposure의 PII 위험을 평가한다. |
| `l7/silver_quarantine_report.json` | quarantine된 record 수, 이유, severity를 기록한다. |
| `l7/silver_preview_metrics.json` | M2 실행 시간, input/output count, sample coverage를 기록한다. |

## 5. 장점

첫째, 실제 실행 결과를 본다. spec이 이론상 맞아도 data에 적용했을 때 문제가 생기는 경우를 잡는다.

둘째, PII와 catalog exposure를 검증한다. physical output과 catalog-visible context를 분리해 안전성을 높인다.

셋째, L9 processing quality 판단의 근거가 된다. row count mismatch, conversion error, quarantine ratio가 L9 axis로 이어진다.

## 6. 단점과 문제

첫째, preview 범위가 너무 작으면 rare error를 놓칠 수 있다. 반대로 너무 크면 비용과 시간이 늘어난다.

둘째, preview output storage가 필요하다. M2가 output ref와 metrics를 안정적으로 남겨야 한다.

셋째, PII detection은 여전히 불완전하다. L7 validator는 rule 기반과 profile 기반을 조합해야 하지만 완전한 보장은 어렵다.

## 7. 가능 범위

L7은 Silver output schema, row counts, null/cast error, invalid row quarantine, masking/hash 적용 여부, forbidden field 노출 여부를 검증할 수 있다.

대용량에서는 full data가 아니라 bounded preview, stratified sample, partition sample을 사용한다. 다만 preview scope와 sample method를 artifact로 남겨야 결과 해석이 가능하다.

## 8. 한계

L7은 Gold semantic readiness를 최종 판정하지 않는다. Gold 관련 판단은 L8 input report와 L9 gold readiness axis로 넘어간다. L7은 production SLA나 runtime retry를 검증하지 않는다.

## 9. 검증 기준

Silver preview validation은 schema mismatch, row count anomaly, excessive null conversion, quarantine overflow, PII exposure, forbidden catalog field를 평가해야 한다. catalog safety block이면 L10 query context ready가 될 수 없다.

## 10. Handoff

L7은 M2 Silver preview 결과를 받아 L8 Gold preview input 또는 L9 gate로 넘긴다. Gold가 요청되었다면 L8은 L7 Silver preview를 기반으로 metric/aggregate 가능성을 검토한다.
