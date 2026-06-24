# WSL2 Known Gaps Guidance 보고서

## Short Report / 짧은 보고

- Type: docs
- Date: 2026-06-24
- Changed: Windows WSL2 Tier 1 경로에서 기존 checkout CRLF 문제, WSL Git / Windows Git worktree metadata 혼용 금지, 새 WSL worktree/clone 권장 지침을 문서화했다.
- Verified: `scripts/validate-harness.sh`, `scripts/validate-harness.sh --strict`, `git diff --check`
- Remaining: native Windows PowerShell/CMD 공식 지원, host frontend direct-run readiness, 기존 clone 자동 복구는 별도 필요 시점까지 보류한다.
- Next context: Windows 개발자는 WSL2 + Docker Desktop integration shell에서 새 WSL worktree/clone 기준으로 하네스 명령을 실행한다.
- Risk: 문서 보강만 수행했으며 runtime behavior나 native Windows 지원 범위를 바꾸지 않았다.
