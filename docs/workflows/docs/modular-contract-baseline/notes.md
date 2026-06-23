# Modular Contract Baseline 노트

## 진행 메모

- `start-workflow.sh --allow-dirty`가 기존 분석 report 변경을 보호하기 위해 `main`에 checkpoint commit `b4a0fff`를 만든 뒤 branch를 생성했다.
- R0.5는 runtime code를 건드리지 않고 Source of Truth와 `.milestones/target-mvp` manifest/handoff template만 정렬했다.
- `docs/17-parallel-milestone-protocol.md`는 새 규칙 없이 재사용했다.

## 결정

- R1~R7은 삭제하지 않고 workstream alias로 보존한다.
- Query/Ask/Recovery는 실제 구현 전까지 mock/fake boundary 안에서 병렬 개발 가능하게 둔다.
- 첫 병렬 wave 후보는 Catalog / Trust, Source Connector, Job / Orchestrator, Query / Policy mock이다.
- 첫 병렬 wave 후보는 실행 승인이 아니며, 실제 worktree/thread/branch 생성은 R0.5 처리 후 별도 사람 확인이 필요하다.

## 열린 질문

- 첫 Source Connector는 PostgreSQL과 REST API 중 무엇으로 할지 결정해야 한다.
- Query engine은 local-first와 Trino 중 언제 무엇을 선택할지 후속 Decision이 필요하다.
- Ask / Evidence가 deterministic route를 넘을 때 외부 LLM 사용 여부를 결정해야 한다.
- mock/fake boundary를 해제할지 여부는 실제 provider, secret, 권한, 외부 서비스 위험 때문에 별도 결정해야 한다.

## 링크 / 증거

- `.milestones/target-mvp/manifest.yaml`
- `.milestones/target-mvp/handoffs/*.md`
- `docs/reports/modular-contract-baseline.md`
- `scripts/validate-harness.sh --strict`
