# L5 Decision and Approval 상세 설계

## 1. 역할

L5는 사람이 AI 추천을 확인하고 수정하고 승인하는 계층이다. L4 draft는 추천일 뿐이고, L6 compiler는 L5에서 승인된 decision만 입력으로 받아야 한다. 이 분리가 없으면 AI가 만든 초안과 사람이 승인한 정책이 섞인다.

L5는 Silver와 Gold approval을 분리한다. 사용자는 Silver 정제 정책만 승인하고 Gold는 보류할 수 있다. 또는 Silver는 수정 승인하고 Gold는 owner review 필요 상태로 둘 수 있다.

## 2. 선택 방식

선택 방식은 `Approval and Decision Contract`다. L5는 `approval_state.json`으로 현재 승인 상태를 표현하고, 실제 decision body는 `silver_policy_decision.json`, `gold_policy_decision.json`에 둔다.

`approval_state.json`만으로 compile하면 안 된다. approval state는 상태와 권한 판단을 나타내고, decision body는 실제 transform action, target name, exposure, PII handling, caveat를 담는다.

## 3. 선택 이유

AI 추천이 유용하더라도 팀 프로젝트에서 사용자가 조정할 수 있어야 한다. 특히 unknown data는 source마다 팀이 원하는 Silver naming, PII handling, Gold metric 의미가 다를 수 있다. L5는 UI와 audit의 중심이다.

또한 Gold는 항상 필요한 것이 아니다. source 등록 단계에서 사용자가 “일단 Silver까지만” 원하면 Gold는 `not_requested`가 되어야 한다. 이 상태를 공식화하지 않으면 L9/L10에서 Gold가 없는 것을 실패로 오해한다.

## 4. 주요 산출 파일

| 파일 | 설명 |
| --- | --- |
| `l5/approval_state.json` | Silver/Gold 각각의 status, approver, comment, compile 가능 여부를 기록한다. |
| `l5/silver_policy_decision.json` | 승인된 Silver transform decision body다. |
| `l5/gold_policy_decision.json` | 승인 또는 보류된 Gold generation decision body다. |
| `l5/recommendation_diff.json` | L4 draft와 L5 decision의 차이를 기록한다. |
| `l5/decision_audit_log.json` | 사용자가 어떤 field/action을 왜 바꿨는지 남긴다. |

## 5. 장점

첫째, 사용자 통제권이 생긴다. 추천을 그대로 쓰지 않고 field별로 수정할 수 있다.

둘째, Silver-only 흐름이 가능하다. Gold가 없다고 전체 onboarding을 실패시키지 않는다.

셋째, audit이 가능하다. 나중에 “왜 이 field를 hash했는지”, “왜 이 metric을 보류했는지”를 decision log로 설명할 수 있다.

## 6. 단점과 문제

첫째, UI 구현이 복잡해진다. Silver decision과 Gold decision을 각각 보여주고 상태를 따로 관리해야 한다.

둘째, 사용자가 잘못 승인할 수 있다. L6/L7/L10 validator가 이를 다시 막아야 한다.

셋째, approval state와 decision body가 불일치할 수 있다. 예를 들어 approval은 approved인데 decision file이 없으면 compiler가 block해야 한다.

## 7. 가능 범위

Silver status는 `draft`, `edited`, `approved`, `rejected`, `deferred`를 지원한다. Gold status는 여기에 `needs_owner_review`, `not_requested`를 추가로 지원한다.

Decision body는 transform action뿐 아니라 catalog exposure, query context exposure, PII handling을 포함한다. 이를 통해 physical Silver와 catalog-visible schema, M6 query context를 분리할 수 있다.

## 8. 한계

L5는 spec compiler가 아니다. 사용자가 승인했다고 해서 바로 실행 가능한 것은 아니다. L6가 action params, forbidden pattern, preview-only write mode를 검증해야 한다.

L5는 owner review 자체를 대신하지 않는다. Gold semantic이 불확실하면 `needs_owner_review`나 `deferred`로 남겨야 한다.

## 9. 검증 기준

`approval_state.json`이 없으면 L6 compile permission을 계산하면 안 된다. Silver compile은 Silver status가 approved 또는 명시 허용된 edited 상태이고 decision ref가 있을 때만 가능하다. Gold compile은 Gold status가 approved이고 decision ref가 있을 때만 가능하다.

Gold `not_requested`는 실패가 아니다. 이 상태는 L9/L10에서 공식적으로 `not_requested`로 이어져야 한다.

## 10. Handoff

L5는 L4 draft를 받아 L6 compiler로 넘긴다. M5는 L5 approval state와 decision artifact를 저장해야 한다. L6는 M5 상태를 신뢰하되, 실제 decision body와 validator 결과를 다시 확인한다.
