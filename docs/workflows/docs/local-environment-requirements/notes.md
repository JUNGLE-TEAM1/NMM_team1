# Local environment requirements 노트

## 진행 메모

- Context Budget mode는 Lite Read로 시작했다.
- 현재 worktree에는 기존 변경(`docs/reports/README.md`, `docs/workflows/docs/small-change-pr-decision/sync.md`, 신규 beginner guide reports, `.DS_Store`)이 있어 branch 전환 없이 `--no-checkout --no-issue`로 workspace만 생성했다.
- 로컬 환경 변경은 Development Operations에서 시작하며, 실제 영향이 있는 Acceptance, Regression, Manual Verification, Workflow만 최소 수정했다.
- Windows 실제 검증은 현재 환경에서 실행하지 않았고 후속 `docs/cross-platform-smoke-audit` 후보로 분리했다.

## 결정

- Docker Compose 경로를 권장 로컬 개발 경로로 둔다.
- Windows 기본 지원 경로는 WSL2 + Docker Desktop integration + bash-compatible shell로 둔다.
- native Windows PowerShell/CMD 동일 실행은 미검증으로 남긴다.
- host native backend/frontend 실행은 보조 경로로 둔다.

## 열린 질문

- host native Python/Node 최소 버전을 언제 pinning할지.
- native Windows PowerShell/CMD를 공식 지원할지, WSL2-only로 유지할지.
- smoke helper를 shell script 유지, PowerShell wrapper 추가, Python helper 전환 중 무엇으로 개선할지.

## 링크 / 증거

- `docs/04-development-guide.md`
- `docs/08-development-workflow.md`
- `scripts/validate-harness.sh`: passed
- `scripts/validate-harness.sh --strict`: passed
- `git diff --check`: passed
