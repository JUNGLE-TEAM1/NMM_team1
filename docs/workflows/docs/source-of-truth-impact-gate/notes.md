# Add Source of Truth Impact Gate 노트

## 진행 메모

- 2026-06-22: Source of Truth 문서가 구현 이후 뒤늦게 정렬된 문제를 재발 방지하기 위해 하네스 규칙 보강 시작.
- `shared-docs.md` 설명 문장 전체 검색은 오탐 위험이 있어 `Proposed Source Of Truth Changes` 표의 `File` 컬럼만 검사 대상으로 제한.
- PR #44 initial CI에서 shallow checkout 때문에 historical workspace base commit을 찾지 못해 false positive가 발생했다. harness CI checkout을 `fetch-depth: 0`으로 보정했다.
- Harness Test Update Gate를 추가하고 `scripts/test-harness.sh` fixture regression test 9개를 추가했다. 테스트는 임시 local Git repo에서 실행되며 원격/GitHub/cloud 상태를 바꾸지 않는다.

## 결정

- strict validation은 unresolved proposal을 실패시키되, 새 evidence 문구를 기존 historical workspace에 소급 강제하지 않는다.

## 열린 질문

- future: deferred decision을 파일별로 더 세밀하게 매칭할지 검토 가능.

## 링크 / 증거

- GitHub issue: https://github.com/JUNGLE-TEAM1/NMM_team1/issues/43
- PR: https://github.com/JUNGLE-TEAM1/NMM_team1/pull/44
