# Product Rebaseline: Trusted Data Platform

- Branch/workspace: `docs/product-rebaseline-trusted-platform`
- 실제 branch 전환: 하지 않음. 시작 시 작업트리가 이미 dirty였고 `scripts/start-workflow.sh`는 branch switch checkpoint commit 또는 GitHub issue 생성을 유발할 수 있어 현재 작업 위치에서 진행했다.
- 목표: 기존 CSV/local pipeline MVP를 `Current implementation baseline`으로 보존하고, AskLake 제품 기준을 Trusted Data & AI Platform과 Target MVP 신뢰 루프로 재정렬한다.

## 포함 범위

- `README.md`
- `docs/01-product-planning.md`
- `docs/02-architecture.md`
- `docs/03-interface-reference.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`
- `docs/08-development-workflow.md`
- workspace evidence 문서

## 제외 범위

- 제품 runtime code 변경
- Trino/RAG/Kubernetes 실제 도입
- AWS resource 생성
- PR, push, merge, rebase
- 과거 M0~M5 report 소급 수정

## 완료 기준

- current baseline과 Target MVP가 Source of Truth에서 분리되어 있다.
- Target MVP가 `Trusted Dataset -> Query/Ask -> Evidence -> Recovery`로 정의되어 있다.
- 다음 구현 Phase 하나가 제안되어 있다.
- harness validation 결과가 기록되어 있다.
