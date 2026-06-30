# PH-DATA-1 Git Sync

## Branch

- Expected branch: `codex/product-health-synthetic-smoke` 또는 동등한 feature branch

## Upstream 확인

- PH-DATA-0 변경이 main 또는 현재 작업 기준에 반영됐는지 확인한다.
- PR #269의 Product Health path convention과 충돌하지 않는지 확인한다.

## 주의

생성된 Parquet/JSON evidence 중 대용량 파일은 commit하지 않는다. 스크립트와 작은 fixture만 commit 후보로 둔다.
