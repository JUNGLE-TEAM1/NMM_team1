# Source dataset persistence 노트

- 2026-06-29: C-2 Phase로 생성했다.
- 2026-06-29: PR #290 merge 후 `origin/main` 기준 clean worktree에서 구현했다.
- C-1 External Connection은 UI/demo fixture를 `SourceConnection` 표시명으로 사용하고, C-2는 Source Dataset metadata 저장만 담당한다.
- Source Dataset은 raw/source metadata 정의이며 ingest 실행이 아니다.
- `/api/sources`는 CSV ingest + catalog dataset 생성 흐름이므로 C-2 API는 `/api/source-datasets`로 분리했다.
