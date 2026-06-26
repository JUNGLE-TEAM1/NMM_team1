# PR 템플릿 제목 drift guard 보강 노트

## 진행 메모

- 2026-06-26: `#121/#123` PR 템플릿 우회와 `#124` closing keyword 오탐을 근거로 Hotfix 시작.
- `prepare-pr.sh`는 English-only/conventional PR 제목을 workspace type 기반 한국어 prefix 제목으로 보정한다.
- `audit-github-records.sh`는 PR 제목에 한국어 prefix 또는 한국어 설명이 없으면 drift로 보고, 단순 `PR #N` 참조는 closing keyword 누락으로 보지 않는다.
- `status-workflow.sh`는 record drift가 있으면 `PR checklist ready: no (record drift)`로 표시한다.

## 결정

- 기존 merged PR 원격 기록은 자동 수정하지 않는다.

## 열린 질문

- 팀원 수동 PR도 merge 전 이 audit을 통과시키는 운영 습관이 필요하다.

## 링크 / 증거

- `scripts/test-harness.sh` -> `Harness regression tests passed: 31`
- `scripts/audit-github-records.sh --pr 123 --pr 124 --pr 126` -> `#123`만 drift 감지
