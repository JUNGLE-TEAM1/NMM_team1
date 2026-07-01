# Product Health Lake Catalog Handoff next actions

## Recommended

1. C-51 또는 full browser demo smoke를 진행한다.

Reason: C-49 lake output과 C-50 Catalog/AI Query handoff는 backend/browser smoke 기준으로 닫혔다. 다음은 실제 클릭 흐름 전체에서 연결, 실행, 등록, 질문이 이어지는지 확인한다.

## Watch

- full browser smoke에서는 `/runs`에서 Catalog 등록 후 `/catalog`와 `/query`가 같은 run/path를 보여주는지 본다.
- prepared reference path는 `runtime_evidence.reference_evidence.path`에만 남고 최신 output처럼 표시되면 안 된다.
