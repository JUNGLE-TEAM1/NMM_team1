# M1 post-merge readiness smoke 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: phase created, scope proposed
- Summary: 최신 `main`에는 M1 readiness/CTA/trace UI와 M2 Product Health preview evidence, M6 DuckDB/SQL/route trace가 들어왔다. 로컬/main 기준 `dataset_product_health_gold` 최종 Catalog/Gold output은 아직 없어 M1은 ready가 아니라 blocked/not-ready 표시를 검증해야 한다.

## Recommended Next Action / 권장 다음 행동

- 이 Phase를 실행해 최신 main 기준 M1 `/query` browser smoke와 stale M1 report 정리를 진행한다.
- Reason: 다른 모듈 기능 일부가 들어온 뒤 M1이 할 수 있는 가장 안전한 작업은 fake success 없이 readiness/CTA/trace 표시가 맞는지 재검증하는 것이다.

## Options / 선택지

1. 이 Phase를 바로 수행한다.
2. smoke만 수행하고 문서 정리는 제외한다.
3. M3 #245 또는 M6 #241 merge 후로 보류한다.
4. 이 workspace를 멈춘다.

## Waiting On Human / 사람 응답 대기

- 번호를 고르거나 "다음 페이즈 수행"처럼 자연어로 지시한다.

## Last User Choice / 마지막 사용자 선택

- 2026-06-29: 사용자가 "다시 페이즈를 생성해줘"라고 요청했다.

## Next AI Action / 다음 AI 행동

- option 1이면 browser skill을 사용해 `/query` smoke를 수행하고 결과를 `quality.md`/`report.md`에 기록한다.
- option 2이면 `plan.md` 범위에서 report stale 정리를 제외하고 smoke만 수행한다.
- option 3이면 `sync.md`와 `notes.md`에 보류 이유와 재개 trigger를 기록한다.
- option 4이면 pause reason을 `notes.md`에 기록한다.
