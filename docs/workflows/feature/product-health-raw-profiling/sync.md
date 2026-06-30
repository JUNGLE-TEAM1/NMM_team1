# PH-DATA-0 Git Sync

## Branch

- Expected branch: `codex/product-health-raw-profiling` 또는 동등한 feature branch

## Upstream 확인

- 시작 전 `git fetch origin --prune`
- 시작 전 `git status --short --branch`
- PR 생성 전 main 최신 상태와 충돌 여부 확인

## 주의

`data/`는 gitignored local evidence다. 원본 데이터와 profile output은 commit하지 않는다. 필요한 경우 summary만 문서 또는 report에 기록한다.
