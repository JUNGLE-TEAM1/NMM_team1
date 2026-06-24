# WSL2 known gaps guidance 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/04-development-guide.md` | WSL2 새 worktree/clone 권장, CRLF 확인, Git metadata 혼용 금지 보강 | Windows 개발자가 하네스 표준 경로를 일관되게 따르도록 함 | Low |
| `docs/manual-verification/00-environment-setup.md` | WSL2 사전 점검과 실패 시 CRLF/metadata 확인 항목 보강 | manual verification에서 같은 실패를 빠르게 분류 | Low |
| `docs/reports/windows-wsl2-smoke-execution.md` | 과거 evidence를 유지하고 follow-up note만 추가 | evidence rewrite 없이 후속 운영 지침 연결 | Low |

## Integration Notes / 통합 메모

- Applied directly in this branch.

## Conflicts To Resolve / 해결할 충돌

- none
