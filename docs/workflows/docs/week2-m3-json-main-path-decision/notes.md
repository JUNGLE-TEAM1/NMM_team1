# Week2 M3 JSON main path decision 노트

## 진행 메모

- Phase 4 PR #122가 merge된 `origin/main` `6b7abd9` 기준으로 workspace를 만들었다.
- PR #105는 `Wish-Upon-A-Star`가 작성한 closed/not merged PR이다.
- PR #105는 14 files, 974 insertions, 39 deletions 규모로 JSON source backend와 source catalog UI/API를 함께 건드린다.
- Phase 5는 PR #105를 merge하지 않고 selective recovery 범위를 결정한다.

## 결정

- M3 첫 구현 대상은 Amazon Reviews JSON 또는 동등한 JSON/JSONL sample이다.
- PR #105의 `backend/app/adapters/json_source.py`는 source material로 회수 후보가 된다.
- UI/source catalog/API broad changes는 이번 회수 범위에서 제외한다.

## 열린 질문

- Phase 6에서 `TransformSpec`와 runner result shape를 결정해야 한다.
- M3 code PR에서 PR #105 로직 중 어떤 함수명을 유지할지 결정해야 한다.

## 링크 / 증거

- PR #105: https://github.com/JUNGLE-TEAM1/NMM_team1/pull/105
- `origin/codex/m3-json-recommendations`
- `docs/project-context/asklake-week2-module-plan/ver2/m3-json-main-path-decision.md`
