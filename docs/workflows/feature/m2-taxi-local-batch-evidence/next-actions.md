# M2 Taxi local batch evidence 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: ready-for-review
- Summary: Taxi local batch runner와 CLI가 구현되었고, local full-month evidence가 통과했다.

## Recommended Next Action / 권장 다음 행동

- Pre-Merge Sync 후 PR 준비를 진행한다.
- Reason: local validation은 통과했고, 남은 것은 최신 main 재확인과 PR readiness 점검이다.

## Options / 선택지

1. PR 준비를 진행한다.
2. PostgreSQL loader를 이 branch에 추가하지 않고 후속 issue로 분리한다.
3. MinIO/S3 또는 PySpark follow-up issue를 별도로 연다.
4. local evidence만 보류하고 PR을 만들지 않는다.

## Waiting On Human / 사람 응답 대기

- PR 전 최신 main sync와 strict validation.

## Last User Choice / 마지막 사용자 선택

- 사용자가 "그래 그렇게 하자"라고 지시해 Taxi local batch evidence Phase를 시작했다.

## Next AI Action / 다음 AI 행동

- option 1이면 pre-merge sync, strict validation, commit, push, PR 생성으로 진행한다.
- option 2 또는 3이면 새 follow-up issue/workspace를 만든다.
- option 4이면 `sync.md`에 PR deferral reason을 기록한다.
