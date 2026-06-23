# Milestone planning layer harness clarification 노트

## 진행 메모

- 2026-06-23: 사용자와 논의하며 milestone-first planning, phase-based execution, independent milestone, parallel milestone protocol 관계를 정리했다.
- 2026-06-23: `docs/08-development-workflow.md`, `docs/10-next-action-menu.md`, `docs/17-parallel-milestone-protocol.md`를 먼저 수정하고 검증까지 실행했으나, 대응 branch workspace 기록을 만들지 않았다.
- 2026-06-23: 사용자가 "하네스 규칙 변경은 무조건 기록되어야 한다"고 지적했다. 이 지적이 맞으며, 본 workspace는 그 누락을 보정하기 위해 생성했다.
- 2026-06-23: 이번 기록은 사후 기록이다. 다음 하네스 규칙 변경부터는 문서 수정 전에 workspace를 먼저 만들고 `plan.md`/`sync.md`/`quality.md` 기준으로 진행해야 한다.
- 2026-06-23: `docs/reports/README.md`와 `docs/reports/milestone-completion-summary.md`는 현재 worktree에 있지만, 이번 milestone planning layer scope와 직접 관련이 낮은 별도 report 정리 변경으로 분리 후보다.
- 2026-06-23: `AGENTS.md`의 Parallel Milestone Protocol 추가는 이번 하네스 보완과 같은 방향이지만, 작업 시작 전부터 modified 상태였으므로 PR 포장 전 포함 여부를 확인해야 한다.

## 결정

- Milestone planning layer는 기존 Phase Workflow를 대체하지 않고 상위 planning layer로만 둔다.
- 작은 변경은 정식 milestone 없이 lightweight Phase로 처리할 수 있다.
- Independent milestone은 자기 Phase/branch workspace/PR로 완료 가능하다.
- Parallel Milestone Protocol은 scope, dependency, shared contract, merge order를 기계적으로 고정해야 할 때만 얹는 선택적 실행 계약 레이어로 둔다.
- Integration branch/workspace는 항상 필수가 아니며, 둘 이상의 완료 branch를 함께 합쳐 검증해야 할 때만 만든다.

## 열린 질문

- `status-workflow.sh`가 milestone classification과 manifest/workspace responsibility split을 직접 출력하도록 보강할지 여부.
- `.milestones/M*/manifest.yaml`과 `docs/workflows/.../plan.md`의 allowed scope 의미 충돌을 자동 검사할지 여부.
- `sources.md`에 source workspace 경로를 쓸 때 trailing slash를 강제하는 validation을 추가할지 여부.
- `docs/reports/README.md`와 `docs/reports/milestone-completion-summary.md`를 별도 report cleanup branch/PR로 분리할지 여부.

## 링크 / 증거

- `scripts/validate-harness.sh`
- `scripts/validate-harness.sh --strict`
- `scripts/harness-flow-check.sh`
- `scripts/test-harness.sh`
- 임시 mock 목적: independent milestone 2개, parallel manifest, integration workspace가 같은 하네스 규칙 레이어에서 충돌하지 않는지 확인.
- 임시 mock 구성: 임시 복사본에서 `feature/independent-a`, `feature/independent-b`, `feature/integrate-independent-ready`, `.milestones/M-independent-parallel/manifest.yaml`을 생성했다.
- 임시 mock 교훈: `sources.md` source workspace path는 `docs/workflows/feature/independent-a/`처럼 trailing slash가 있어야 validator가 workspace를 정확히 인식한다.
- 임시 mock 최종 검증: `scripts/validate-harness.sh --strict`, `scripts/validate-harness.sh --integration`, `scripts/harness-flow-check.sh docs/workflows/feature/integrate-independent-ready` 통과.
- 임시 directory 절대 경로는 장기 증거로 의존하지 않는다.
