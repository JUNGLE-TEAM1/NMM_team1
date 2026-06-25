# M6 AI Query 스켈레톤 다음 행동 메뉴

사람이 다음 협업 선택을 쉽게 고를 수 있도록 현재 상태와 선택지를 기록한다.

## Current State / 현재 상태

- State: implementation verified locally
- Summary: M6 AI Query skeleton은 fixture `CatalogMetadata` 기반 retrieval/template SQL/fake `SqlEngineAdapter`/`AIQueryResult` route까지 구현됐고 backend tests가 통과했다.

## Recommended Next Action / 권장 다음 행동

- PR 전 pre-merge sync와 포함 파일 검토를 진행한다.
- Reason: 로컬 구현 검증은 끝났지만 `main` 재동기화와 PR readiness 기록은 아직 남아 있다.

## Options / 선택지

1. PR 준비를 진행한다.
2. M3/M5 실제 Catalog 출력이 나올 때까지 로컬 보류한다.
3. 실제 DuckDB adapter 구현을 같은 branch에 이어서 붙일지 별도 Phase로 분리할지 결정한다.
4. M1 UI 연결을 다음 Phase로 넘긴다.

## Waiting On Human / 사람 응답 대기

- PR 준비 여부 또는 로컬 보류 여부.

## Last User Choice / 마지막 사용자 선택

- 사용자가 정식 Phase 생성 후 개발 진행을 지시함. Issue/PR은 한국어로 작성하기로 확인함.

## Next AI Action / 다음 AI 행동

- option 1이면 pre-merge sync, `scripts/status-workflow.sh`, 포함/제외 파일 검토, PR readiness를 진행한다.
- option 2이면 `sync.md`와 report에 local hold reason을 기록한다.
- option 3이면 `decisions.md`에 scope decision을 기록하고 필요 시 새 Phase를 만든다.
- option 4이면 M1 handoff 문맥을 정리한다.
