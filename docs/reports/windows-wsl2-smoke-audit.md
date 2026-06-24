# Windows WSL2 Smoke Audit 보고서

## Short Report / 짧은 보고

- Type: docs
- Date: 2026-06-24
- Changed: Windows WSL2 smoke 검증을 위한 실행 handoff와 현재 환경의 not-executed evidence를 기록했다.
- Verified: `scripts/validate-harness.sh`, `scripts/validate-harness.sh --strict`, `git diff --check`
- Remaining: 실제 Windows WSL2 + Docker Desktop integration 환경에서 smoke 명령을 실행해야 한다.
- Next context: Windows machine에서 아래 명령을 실행하고 결과를 이 report 또는 follow-up report에 추가한다.
- Risk: 이번 Phase는 Windows 지원을 증명하지 않는다. 현재 macOS 환경에서는 Windows WSL2 검증을 실행할 수 없었다.

## Phase

- Type: docs
- Branch/work location: `docs/windows-wsl2-smoke-audit`, `docs/workflows/docs/windows-wsl2-smoke-audit`
- Date: 2026-06-24
- Workspace state: complete

## Current Environment / 현재 환경

- OS: macOS 26.5.1, Darwin 25.5.0, arm64
- Shell: `/bin/zsh`
- Windows/WSL2: not available in this environment
- `wsl.exe`: not found

## Result / 결과

| Target | Result | Notes |
| --- | --- | --- |
| macOS current shell | observed | 현재 실행 환경은 macOS다. |
| Windows WSL2 + Docker Desktop integration | not executed | Windows machine이 필요하다. |
| native Windows PowerShell/CMD | not executed | `docs/04` 기준 아직 미보장 범위다. |

## Windows WSL2 Commands / Windows WSL2 실행 명령

Windows WSL2 + Docker Desktop integration shell에서 repository root로 이동한 뒤 아래를 실행한다.

```bash
git --version
docker --version
docker compose version
bash --version
rg --version
curl --version
python3 --version
node --version
npm --version
docker info
scripts/smoke-container-app.sh
scripts/validate-harness.sh
scripts/validate-harness.sh --strict
git diff --check
```

## Expected Result / 기대 결과

- `docker info`가 Docker Desktop backend에 연결된다.
- `scripts/smoke-container-app.sh`가 backend/frontend build, compose up, source registration, pipeline run, result catalog smoke를 통과한다.
- smoke 종료 후 container가 정리된다.
- `scripts/validate-harness.sh`와 `scripts/validate-harness.sh --strict`가 통과한다.
- 실패가 있으면 OS/shell, Docker Desktop integration, line ending, path separator, `python3`, `curl`, `rg`, `mktemp` 차이를 기록한다.

## Follow-up / 후속

- Windows WSL2 smoke가 통과하면 `docs/04`의 Windows Tier 1 경로에 실제 evidence를 연결한다.
- Windows WSL2 smoke가 실패하면 `chore/cross-platform-tooling`에서 wrapper/helper 또는 script portability 개선을 검토한다.
- native Windows PowerShell/CMD 지원이 필요하면 별도 evidence와 Decision Option Brief가 필요하다.

## Local Cleanup Candidate / 로컬 정리 후보

아래 항목은 이번 Phase에서 삭제하지 않았다. 정리는 별도 사람 확인이 필요하다.

- stale branch: `docs/local-environment-requirements`
- stale branch: `docs/cross-platform-smoke-audit`
- stale branch: `tmp/local-env-pr-sync`
- unrelated files: `.DS_Store`
- unrelated files: beginner guide report 관련 untracked files
- unrelated file: `docs/workflows/docs/small-change-pr-decision/sync.md`
