# Auto PR creation policy 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/04-development-guide.md` | PR-ready feature branch push/PR 생성은 자동화 범위로 허용하고 merge/finalize 계열은 확인 gate로 유지 | 운영 규칙 시작점 정렬 | medium |
| `docs/08-development-workflow.md` | Auto PR Creation과 PR 생성 후 `Pre-PR Human Checkpoint` 흐름으로 재정의 | Phase 완료/PR handoff 기본 동작 변경 | medium |
| `docs/09-collaboration-agreement.md` | 자동 PR 생성과 merge/finalize 확인 gate의 협업 합의 정렬 | 팀 공통 행동 규칙 정합성 | medium |
| `docs/10-next-action-menu.md` | PR Ready/Complete And PR Ready 메뉴를 자동 PR 생성 후 merge 선택 흐름으로 수정 | 상태 요약과 다음 행동 메뉴 정합성 | medium |
| `docs/11-git-sync-policy.md` | `--auto-pr` 기본 helper와 자동 PR 생성 stop condition 명시 | Git/remote 상태 변경 경계 명확화 | medium |
| `docs/12-quality-gates.md` | quality gate 통과가 자동 PR 생성까지 허용하고 merge/finalize는 checkpoint가 필요함을 명시 | 검증 완료와 원격 동작 경계 정렬 | medium |
| `docs/13-human-command-flow.md` | 사람이 쓰는 명령별 PR 생성/merge/finalize 해석 수정 | 실제 협업 프롬프트 동작 정렬 | medium |
| `docs/workflows/README.md` | workspace 운영 요약을 자동 PR 생성 정책에 맞춤 | 새/기존 workspace 작성자 안내 정합성 | medium |

## Integration Notes / 통합 메모

- `AGENTS.md`와 scripts도 함께 변경됐다. 특히 `scripts/lib/portable-tools.sh`는 harness fixture가 강제하는 portable `rg` fallback의 `set -u` 호환성을 고쳤다.
- Historical reports와 과거 workspace evidence는 소급 수정 대상이 아니다.

## Conflicts To Resolve / 해결할 충돌

- 없음.
