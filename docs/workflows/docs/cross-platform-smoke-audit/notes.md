# Cross-platform smoke audit 노트

## 진행 메모

- Worktree: `/Users/tail1/Documents/nmm-cross-platform-smoke-audit`
- Base: `origin/main` at PR #67 merge commit `0588f47`
- macOS 26.5.1 arm64에서 Docker Desktop과 smoke script를 확인했다.
- Windows WSL2/native Windows는 현재 환경에서 실행할 수 없어 not executed로 기록한다.
- `scripts/smoke-container-app.sh` 실행 중 frontend readiness 대기에서 `curl: (56) Recv failure: Connection reset by peer`가 한 번 출력됐지만 재시도 후 전체 smoke는 pass로 종료했다.

## 결정

- 이번 Phase는 audit evidence만 남기고 tooling 구현은 하지 않는다.
- Windows 지원 공식화는 Windows WSL2 evidence 확보 뒤 판단한다.

## 열린 질문

- Windows WSL2에서 같은 smoke가 통과하는지.
- native Windows PowerShell/CMD를 계속 미지원으로 둘지, wrapper/helper를 만들지.
- host native Python/Node version pinning이 필요한지.

## 링크 / 증거

- `scripts/smoke-container-app.sh`: passed
- `scripts/validate-harness.sh`: passed
- `scripts/validate-harness.sh --strict`: passed
- `git diff --check`: passed
