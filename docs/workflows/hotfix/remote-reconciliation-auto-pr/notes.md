# Remote reconciliation auto PR 노트

## 진행 메모

- 원격 운영 상태 보정 + 하네스 재현 변경은 complete + PR-ready 조건 통과 시 자동 PR 대상으로 정책화한다.
- `scripts/status-workflow.sh`는 workspace evidence에서 `Remote operations reconciliation`, `remote operations reconciliation`, `원격 운영 상태`, `원격 상태 보정`을 감지한다.

## 결정

- PR 생성까지만 자동 범위로 둔다.
- merge/finalize/cleanup/deploy/cloud/resource 변경은 기존처럼 사람 명시 지시가 필요하다.

## 열린 질문

- 없음.

## 링크 / 증거

- PR #82 handoff에서 발견된 운영 gap을 재발 방지 규칙으로 반영.
