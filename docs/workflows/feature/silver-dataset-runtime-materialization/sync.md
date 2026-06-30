# Silver dataset runtime materialization sync

## 상태

- 2026-06-30: C-27 구현 및 검증 완료.
- 기존 dirty worktree가 크므로 PR/commit 전 C-27 포함 파일 선별이 필요하다.

## 실행/검증 환경

- Frontend: `http://127.0.0.1:13011`
- Backend: `http://127.0.0.1:18000`
- 18000 backend는 새 코드 반영을 위해 재시작했다.

## 다음 동기화 지점

- C-28 시작 전 C-27 output parquet와 materialization evidence를 Gold 입력으로 연결한다.
- merge/finalize/cleanup은 사람 확인 후 진행한다.
