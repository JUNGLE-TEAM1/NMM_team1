# M6 Catalog retrieval scoring 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: complete
- Summary: M6 catalog retrieval scoring을 구현했고 local focused/backend/harness 검증을 통과했다.

## Recommended Next Action / 권장 다음 행동

- PR 준비를 진행한다.
- Reason: local validation이 통과했고, 변경은 M6 내부 retrieval scoring과 workspace evidence로 제한되어 있다.

## Options / 선택지

1. PR 생성까지 진행한다.
2. 로컬 완료로 보류한다.
3. scoring alias/weights를 추가 보강한다.
4. 다음 Phase로 M5 real CatalogSource adapter를 시작한다.

## Waiting On Human / 사람 응답 대기

- PR 진행, 보류, 추가 보강, 후속 adapter 중 하나를 선택한다.

## Last User Choice / 마지막 사용자 선택

- `좋아 다음 단계 개발해`

## Next AI Action / 다음 AI 행동

- option 1이면 final validation 후 `scripts/prepare-pr.sh --auto-pr docs/workflows/feature/m6-catalog-retrieval-scoring`을 실행한다.
- option 2이면 `sync.md`에 deferral reason을 기록한다.
- option 3이면 현재 branch에서 추가 테스트와 alias를 보강한다.
- option 4이면 현재 branch PR/보류 방식을 먼저 정한 뒤 별도 workspace를 시작한다.
