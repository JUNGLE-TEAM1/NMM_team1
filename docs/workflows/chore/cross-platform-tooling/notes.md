# Cross-platform tooling 노트

## 진행 메모

- Windows Git으로 만든 worktree는 WSL Git에서, WSL Git으로 만든 worktree는 Windows Git에서 metadata path mismatch로 unusable했다.
- main root의 대규모 dirty 상태는 `--ignore-cr-at-eol` 기준 대부분 line ending noise였고, 실제 docs/scripts content diff는 이번 Phase 범위에 한정됐다.
- `rg` fallback은 directory input도 재귀 탐색하도록 보강했다.

## 결정

- repo-local fallback을 우선하고 host global install은 보류했다.
- WSL2 smoke script는 first failure output을 유지한 채 local-only fallback으로 재시도하게 했다.

## 열린 질문

- host `node`를 Tier 1 prerequisite로 올릴지, native/direct run 전용 prerequisite로 둘지
- mixed Git implementation worktree portability를 더 적극적으로 자동화할지

## 링크 / 증거

- `./scripts/validate-harness.sh`
- `./scripts/validate-harness.sh --strict`
- `./scripts/test-harness.sh`
- `./scripts/smoke-container-app.sh`
- `docs/reports/windows-wsl2-smoke-execution.md`
