# Windows WSL2 smoke audit 노트

## 진행 메모

- 현재 실행 환경은 macOS 26.5.1 arm64이며 Windows 또는 WSL2가 아니다.
- `wsl.exe` command는 현재 환경에서 발견되지 않았다.
- 이 Phase는 Windows 검증을 완료 처리하지 않고, Windows WSL2에서 실행할 handoff 명령과 기대 결과를 기록한다.
- 현재 worktree는 PR #67 merge 전 로컬 branch 상태이며, PR #68 report는 이 worktree에 없다. 네트워크/remote sync 없이 현재 workspace에 evidence gap만 기록했다.
- 기존 unrelated 변경과 `.DS_Store`는 삭제하지 않았다.

## 결정

- Windows WSL2 검증은 실제 Windows 환경에서 실행해야 하며, macOS에서 통과로 간주하지 않는다.
- native Windows PowerShell/CMD 지원은 계속 미보장으로 둔다.
- local cleanup은 별도 `chore/local-branch-cleanup` 후보로만 남긴다.

## 열린 질문

- Windows WSL2 + Docker Desktop integration 환경에서 smoke가 통과하는지.
- native Windows PowerShell/CMD 지원이 팀에 필요한지.
- 실패 시 `chore/cross-platform-tooling`에서 PowerShell wrapper 또는 Python helper를 만들지.

## 링크 / 증거

- `docs/reports/local-environment-requirements.md`
- `docs/reports/windows-wsl2-smoke-audit.md`
