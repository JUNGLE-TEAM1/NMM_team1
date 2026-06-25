# GitHub record drift audit 보강 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/11-git-sync-policy.md` | GitHub record drift audit read-only guard와 status-workflow PR-ready blocker 규칙 추가 | #112처럼 template 생성 경로를 우회한 issue/PR을 PR 전 감지 | low |
| `docs/12-quality-gates.md` | GitHub issue/PR template/lifecycle guard 변경 시 drift audit evidence 기록 규칙 추가 | 하네스 변경 검증 증거를 quality gate에 남기기 위함 | low |
| `docs/13-human-command-flow.md` | 사람이 "템플릿 뚫림"을 의심할 때 read-only audit 먼저 실행하는 흐름 추가 | 기존 record 보정 전에 하네스 gap과 drift reason을 분리 | low |

## Integration Notes / 통합 메모

- `scripts/audit-github-records.sh`는 읽기 전용 감사이며 기존 issue/PR 수정은 별도 사람 지시 후 수행한다.

## Conflicts To Resolve / 해결할 충돌

- 없음.
