# L8 Gold Preview Input Report 상세 설계

## 1. 역할

L8은 Gold 생성 방식의 preview evidence를 만드는 계층이다. L8은 최종 Gold readiness 판정을 직접 확정하지 않는다. L8은 metric definition, semantic caveat, owner review 필요성, Gold preview 가능 여부를 L9가 판단할 수 있게 input report로 정리한다.

Gold는 Silver보다 의미 의존성이 크다. 같은 source라도 어떤 grain, dimension, measure를 쓸지는 domain 목적에 따라 달라진다. L8은 이 불확실성을 숨기지 않고 caveat와 review status로 드러낸다.

## 2. 선택 방식

선택 방식은 `Gold Preview Input Report`다. L6 Gold spec이 있고 L5에서 Gold가 approved 상태이면 M2가 bounded Gold preview를 실행할 수 있다. L8은 그 결과를 `gold_readiness_input_report.json`과 `metric_definition_draft.json`으로 정리한다.

Gold가 `not_requested`이면 L8은 실행하지 않아도 된다. Gold가 `deferred`나 `needs_owner_review`이면 L8은 caveat 중심 report만 만들 수 있다.

## 3. 선택 이유

Gold를 Silver처럼 단순 실행 성공/실패로 판단하면 안 된다. aggregate가 실행됐다고 metric 의미가 맞는 것은 아니다. 예를 들어 review 데이터에서 평균 rating은 만들 수 있지만, 어떤 filter와 grain이 의미 있는지는 owner 판단이 필요할 수 있다.

따라서 L8은 “Gold가 생성되었다”보다 “Gold를 생성하려면 어떤 의미 가정과 caveat가 있는가”를 명확히 한다. 최종 판정은 L9의 gold readiness axis가 담당한다.

## 4. 주요 산출 파일

| 파일 | 설명 |
| --- | --- |
| `l8/gold_preview_ref.json` | Gold preview output ref와 fingerprint를 담는다. |
| `l8/gold_preview_validation_result.json` | aggregate 실행 결과, row count, null metric, warning을 기록한다. |
| `l8/metric_definition_draft.json` | metric name, grain, dimensions, measures, filters, caveats를 담는다. |
| `l8/gold_readiness_input_report.json` | L9 gold readiness 판단에 필요한 summary를 담는다. |
| `l8/semantic_caveat_report.json` | owner review 필요, meaning ambiguity, freshness caveat를 기록한다. |

## 5. 장점

첫째, Gold의 의미 불확실성을 명시한다. 단순히 table이 만들어졌다고 ready로 표시하지 않는다.

둘째, Silver-only 흐름과 Gold-ready 흐름을 분리한다. Gold가 없더라도 Silver onboarding은 완료될 수 있다.

셋째, M6 query context에 들어갈 metric caveat를 미리 만든다. 사용자가 질의할 때 “이 metric은 owner review 전” 같은 경고를 붙일 수 있다.

## 6. 단점과 문제

첫째, Gold 검증은 자동화 한계가 크다. metric 의미가 맞는지는 데이터 구조만으로 완전히 판단하기 어렵다.

둘째, Gold preview는 Silver preview보다 비용이 클 수 있다. aggregate, group by, join-like operation이 들어가면 preview 범위를 조심해야 한다.

셋째, owner review workflow가 없으면 `needs_owner_review` 상태가 오래 남을 수 있다.

## 7. 가능 범위

L8은 approved Gold spec에 대해 bounded aggregate preview, metric null ratio, dimension cardinality, measure distribution, freshness hint, caveat summary를 만들 수 있다.

Gold 미요청 상태도 공식적으로 표현한다. `not_requested`는 실패가 아니라 사용자가 Gold를 요구하지 않은 상태다. `deferred`는 나중에 Gold를 만들 수 있지만 현재는 handoff하지 않는 상태다.

## 8. 한계

L8은 final gate가 아니다. L8 report가 좋아 보여도 L9 processing quality나 catalog safety가 block이면 L10 ready가 될 수 없다. 또한 L8은 production metric table을 만들지 않는다.

## 9. 검증 기준

Gold가 approved인데 L8 input report가 없으면 L9 gold readiness는 pass가 될 수 없다. Gold가 not_requested이면 L9/L10은 이를 실패로 보지 않고 `not_requested`로 공식 처리해야 한다.

## 10. Handoff

L8은 M2 Gold preview 결과와 L7 Silver preview 결과를 받아 L9 three-axis gate로 넘긴다. L9는 L8 input을 참고하지만 최종 gold readiness axis는 L9에서 만든다.
