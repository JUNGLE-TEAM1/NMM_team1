# L9 Three-axis Quality Gate 상세 설계

## 1. 역할

L9는 L0-L8까지의 evidence를 종합해 최종 gate 상태를 만드는 계층이다. L9의 핵심은 하나의 quality score로 뭉개지 않는 것이다. processing quality, catalog safety, gold readiness를 세 축으로 분리해야 무엇이 문제인지 알 수 있다.

L9 결과는 L10 catalog/query context status의 직접 근거가 된다. M6가 Silver 질의는 허용해도 되는지, Gold metric 질의는 막아야 하는지, caveat를 붙이면 되는지 L9가 결정한다.

## 2. 선택 방식

선택 방식은 `Three-axis Gate`다. 세 축은 다음과 같다.

| Axis | 의미 |
| --- | --- |
| `processing_quality` | parse, transform, row count, conversion, quarantine, replay 품질이다. |
| `catalog_safety` | PII exposure, forbidden field, query context 노출 안전성이다. |
| `gold_readiness` | Gold metric/model의 semantic readiness와 owner review 상태다. |

L9는 precedence rule을 가진다. processing quality가 block이면 catalog나 gold가 좋아도 ready가 될 수 없다. catalog safety가 block이면 M6 context는 blocked다. Gold가 not_requested이면 gold_context_status는 ready가 아니라 `not_requested`다.

## 3. 선택 이유

이전 방식처럼 quality를 하나로 합치면 해석이 흐려진다. 예를 들어 Silver processing은 pass지만 Gold owner review가 안 끝난 경우 전체를 warn으로 두면 사용자가 “Silver는 써도 되는지” 알기 어렵다. 반대로 PII가 노출된 경우 단순 warn으로 두면 위험하다.

Three-axis gate는 각 문제의 성격을 분리한다. processing 문제는 M2/L6 spec으로 돌아가고, catalog safety 문제는 L5 exposure나 L7 PII 검증으로 돌아가며, Gold readiness 문제는 owner review나 L8 metric definition으로 돌아간다.

## 4. 주요 산출 파일

| 파일 | 설명 |
| --- | --- |
| `l9/processing_quality_axis.json` | row count, parse failure, conversion error, quarantine, replay status를 평가한다. |
| `l9/catalog_safety_axis.json` | PII exposure, forbidden fields, catalog/query exposure rule을 평가한다. |
| `l9/gold_readiness_axis.json` | Gold not_requested/deferred/ready/blocked 상태를 평가한다. |
| `l9/gate_summary.json` | 세 axis를 종합해 M6 context status와 required caveat를 만든다. |
| `l9/reconciliation_result.json` | L0/L1/L7/L8 count/fingerprint를 대조한다. |

## 5. 장점

첫째, 상태 해석이 분명하다. Silver ready, Gold not requested, catalog blocked 같은 조합을 정확히 표현한다.

둘째, 문제 해결 경로가 명확하다. 어떤 axis가 block인지 보면 L5로 돌아갈지 L6 spec을 고칠지 L8 owner review를 해야 할지 알 수 있다.

셋째, M6 query behavior를 안전하게 제어한다. Gold가 준비되지 않았는데 Gold metric을 질의하도록 허용하는 오류를 막는다.

## 6. 단점과 문제

첫째, gate rule을 잘못 설계하면 상태가 복잡해진다. 특히 warn과 block, deferred와 not_requested를 혼동하면 UI가 불명확해진다.

둘째, axis 간 precedence를 문서와 코드에서 동일하게 유지해야 한다. 문서와 validator가 다르면 catalog handoff가 흔들린다.

셋째, 너무 많은 caveat가 나오면 사용자가 읽지 않는다. caveat는 query behavior에 필요한 핵심만 남겨야 한다.

## 7. 가능 범위

L9는 preview 기반 quality gate를 만든다. processing quality는 L1 rescue, L6 compiler, L7/L8 preview metrics를 본다. catalog safety는 L3 redaction, L5 exposure decision, L7 PII report, L10 query context draft를 본다. gold readiness는 L5 Gold status와 L8 input report를 본다.

Gold `not_requested`와 `deferred`를 공식 상태로 지원한다. 이는 Gold가 없다는 이유로 Silver onboarding이 실패 처리되는 문제를 막는다.

## 8. 한계

L9는 production monitoring이 아니다. 장기 drift, SLA, runtime failure, late event handling은 core L9가 아니라 extension hook 또는 운영 계층에서 다룬다.

L9는 domain owner의 의미 판단을 대체하지 않는다. owner review가 필요한 Gold metric은 자동 pass가 아니라 warn/block으로 남길 수 있다.

## 9. 검증 기준

processing quality가 block이면 Silver context는 blocked여야 한다. catalog safety가 block이면 Silver/Gold query context는 ready가 될 수 없다. Gold status가 not_requested이면 gold_context_status는 `not_requested`여야 한다. forbidden field가 query context에 있으면 block이다.

## 10. Handoff

L9는 L10으로 gate summary와 axis refs를 넘긴다. L10은 L9 결과를 그대로 사용해 catalog layer status, M6 context status, caveat, allowed table/column을 만든다.
