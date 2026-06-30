# Product Health Manual Run contract 노트

## 진행 메모

- 사용자는 PR 4/6/7/8을 팀원에게 분배했고, PR 5A contract 구현을 현재 branch에서 진행하기로 지시했다.
- PR 4 팀원에게는 Source Dataset을 source별로 읽어 parquet snapshot artifact와 metadata를 남기도록 공유했다.
- PR 5A는 Product Health Target Dataset run 응답에 pending contract block을 추가해 PR 5B/6/7/8이 내부 구현 추측 없이 같은 metadata를 읽게 한다.

## 결정

- 실제 Gold 생성은 하지 않는다.
- `schema_version`, Gold contract version, output schema, allowed columns는 `contracts/product_health_*.sample.json`에서 읽어 #310 Gold v2 merge 이후에도 같은 code path가 contract file을 따른다.

## 열린 질문

- PR 4의 latest snapshot lookup API/metadata 저장 위치는 PR 4 merge 후 PR 5B에서 확인해야 한다.
- #310 Gold v2 merge 후 focused test 재실행 필요.

## 링크 / 증거

- Linked issue: https://github.com/JUNGLE-TEAM1/NMM_team1/issues/311
- Focused failing test evidence: `KeyError: 'product_health_manual_run_contract'`
- Focused pass evidence: `PYTHONPATH=backend pytest backend/tests/test_target_dataset_run_handoff.py backend/tests/test_target_dataset_job_draft.py backend/tests/test_product_health_processing_template.py -q` -> `11 passed`
