# L6 Deterministic Spec Compiler 상세 설계

## 1. 역할

L6는 승인된 L5 decision을 M2가 실행할 수 있는 deterministic preview spec으로 compile하는 계층이다. AI draft가 직접 실행되면 안 된다. L6는 사람이 승인한 정책만 받아 action allowlist, params schema, forbidden pattern, preview-only mode를 검증한다.

L6의 산출물은 production 실행 spec이 아니다. L7/L8 preview를 위한 spec이다. 따라서 `write_mode=preview_only`만 허용한다.

## 2. 선택 방식

선택 방식은 `Preview-only Deterministic Spec Compiler`다. L6는 Silver transform spec과 Gold generation spec을 만들고, 동시에 `compiler_validation_result.json`과 `unsupported_action_report.json`을 만든다.

모든 operation은 params schema를 가져야 한다. `action=cast`이면 target type과 error policy가 필요하고, `hash`이면 HMAC policy와 secret ref가 필요하다. params 없는 action string만으로는 M2가 안전하게 실행할 수 없다.

## 3. 선택 이유

L4는 AI 추천이고 L5는 사용자 결정이다. 그러나 둘 다 그대로 M2 실행 입력으로 쓰기에는 위험하다. L6 compiler가 있어야 unsupported action, unbounded collect, generated code execution, per-row AI call, hidden drop, production write 같은 금지 패턴을 차단할 수 있다.

M3의 책임은 “M2가 실행 가능한 계약”을 만드는 것이지, 직접 Spark job을 운영하는 것이 아니다. 그래서 L6는 deterministic spec과 validation report를 만들고, 실제 preview execution은 M2가 담당한다.

## 4. 주요 산출 파일

| 파일 | 설명 |
| --- | --- |
| `l6/silver_transform_spec.json` | M2가 Silver preview를 실행할 deterministic spec이다. |
| `l6/gold_generation_spec.json` | M2가 Gold preview를 실행할 deterministic spec이다. Gold 미요청이면 null/ref 없음이 가능하다. |
| `l6/layered_transform_graph.json` | Silver/Gold operation dependency graph를 표현한다. |
| `l6/compiler_validation_result.json` | allowlist, forbidden pattern, compile status, warnings를 담는다. |
| `l6/unsupported_action_report.json` | compile 불가능하거나 owner action이 필요한 항목을 담는다. |

## 5. 장점

첫째, 실행 안정성이 높아진다. free-form recommendation이 아니라 제한된 spec만 M2로 넘어간다.

둘째, 실패 원인이 명확하다. compile block이면 unsupported action인지 params 누락인지 forbidden pattern인지 보고서로 알 수 있다.

셋째, 운영 경계가 분명해진다. L6는 preview spec만 만들고 production write를 하지 않는다.

## 6. 단점과 문제

첫째, compiler 구현 비용이 있다. action별 params schema, validator, graph builder, unsupported action reporter가 필요하다.

둘째, 허용 action이 좁으면 사용자의 정제 의도를 표현하지 못할 수 있다. 이런 경우 safe alternative를 제안하고 L5로 되돌려야 한다.

셋째, M2 실행 엔진과 spec 해석이 맞아야 한다. spec vocabulary와 M2 operator mapping이 어긋나면 preview가 실패한다.

## 7. 가능 범위

Silver spec은 select, rename, cast, parse timestamp, normalize null, flatten struct, bounded explode, preserve as JSON string, mask, hash, drop, quarantine 같은 deterministic operation을 표현할 수 있다.

Gold spec은 approved Gold decision이 있을 때 aggregate, dimension summary, entity summary, event aggregate를 preview 범위에서 표현할 수 있다. Gold가 `not_requested`나 `deferred`이면 Gold spec은 만들지 않거나 compile status를 `not_requested`로 둔다.

## 8. 한계

L6는 production write, append, overwrite, external sink commit을 허용하지 않는다. stream runtime semantics, watermark state, retry/rollback은 core가 아니다. L6는 generated code execution도 허용하지 않는다.

## 9. 검증 기준

`write_mode`는 반드시 `preview_only`여야 한다. 모든 `*_ref`는 string artifact id여야 한다. 모든 operation은 action별 required params를 만족해야 한다. forbidden pattern이 block이면 M2로 spec을 넘기면 안 된다.

PII hash는 plain sha256이 아니라 HMAC-SHA256과 salt secret ref를 요구한다. catalog/query exposure가 forbidden인 field가 output context에 포함되면 block이다.

## 10. Handoff

L6는 L5 decision을 받아 M2 L7/L8 preview execution으로 넘긴다. M2는 spec을 실행하고 preview output, row counts, error metrics, validation metrics를 다시 M3 L7/L8로 넘긴다.
