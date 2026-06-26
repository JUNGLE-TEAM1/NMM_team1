# Week2 M1 synthetic raw demo data 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: local M1 minimum sample generated
- Summary: `reviews_seed.jsonl` 10,000행, `product_master_seed.jsonl` 1,000행, `behavior_events_seed.jsonl` 3,000행과 manifest/summary가 local ignored `data/` 아래 생성됐고, focused test/JSONL validation/local runner smoke가 통과했다.

## Recommended Next Action / 권장 다음 행동

- M3에게 최소 샘플 handoff를 진행한다.
- Reason: M3 계약 6필드와 `amazon_reviews_json` logical shape가 확인됐고, Bronze 변환 smoke에 필요한 local input path와 sample 3줄이 준비됐다.

## Options / 선택지

1. M3 handoff: local path, sample 3줄, manifest/summary, known limitation을 전달한다.
2. Option 2 확장: 100,000행 review와 10,000개 metadata로 재생성하는 후속 Phase를 연다.
3. 배송 seed 추가: Taxi 기반 `delivery_trips_seed.parquet`를 별도 후속 Phase로 분리한다.
4. PR 준비: 스크립트/테스트/workspace/report만 포함하고 `data/`는 제외해 PR-ready로 정리한다.

## Waiting On Human / 사람 응답 대기

- M3 handoff 또는 Option 2 확장 선택.

## Last User Choice / 마지막 사용자 선택

- 사용자가 별도 workspace 생성과 진행을 지시했다.

## Next AI Action / 다음 AI 행동

- option 1이면 M3 handoff 메시지를 작성한다.
- option 2이면 별도 scale Phase/worktree를 만들고 row count 목표를 올린다.
- option 3이면 M2/M5 경계 확인 후 Taxi seed 전용 Phase를 연다.
- option 4이면 `scripts/validate-harness.sh --strict` 후 PR 포함/제외 파일을 정리한다.
