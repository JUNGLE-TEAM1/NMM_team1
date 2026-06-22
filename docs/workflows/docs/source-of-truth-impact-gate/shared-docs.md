# Add Source of Truth Impact Gate 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/00-layer-map.md` | `docs/18-harness-regression-policy.md`를 Harness Regression Policy Source of Truth로 등록 | 하네스 테스트 정책 책임 위치를 명확히 하기 위함 | 낮음 |
| `docs/08-development-workflow.md` | Phase 완료 게이트와 별도 `Source of Truth Impact Gate` 절 추가 | 구현 변경 후 메인 Source of Truth 문서가 뒤늦게 정렬되는 문제를 PR 전 잡기 위함 | 중간 |
| `docs/11-git-sync-policy.md` | PR 전 Source of Truth sync preflight 추가 | `shared-docs.md` 제안과 실제 diff/deferred decision을 대조하기 위함 | 낮음 |
| `docs/12-quality-gates.md` | quality evidence에 Source of Truth impact 기록 추가 | 완료 증거가 문서 반영/보류 판단을 포함하게 하기 위함 | 낮음 |
| `docs/13-human-command-flow.md` | PR/다음 branch 명령 전 Source of Truth Impact Gate 확인 추가 | 사람이 "마무리/PR/다음"을 말했을 때 누락된 SOT 정렬을 먼저 보게 하기 위함 | 낮음 |
| `docs/18-harness-regression-policy.md` | Harness Test Update Gate와 fixture regression 정책을 별도 Source of Truth로 분리 | `docs/08`과 `docs/12`에 세부 하네스 테스트 규칙이 누적되는 것을 줄이기 위함 | 낮음 |
| `docs/workflows/README.md` | workspace별 Source of Truth impact 기록 방식 추가 | 팀원이 workspace 파일별 역할을 헷갈리지 않게 하기 위함 | 낮음 |

## Integration Notes / 통합 메모

- `scripts/status-workflow.sh`와 `scripts/validate-harness.sh` 변경은 위 문서 규칙을 자동 상태/strict 검사로 연결한다.
- `scripts/list-active-branches.sh`와 `scripts/cleanup-merged-branches.sh`는 allowed workspace branch prefix(`feature`, `fix`, `docs`, `test`, `chore`, `hotfix`)를 같은 기준으로 사용한다.
- Historical report와 과거 workspace 기록은 자동 수정 대상으로 강제하지 않는다.

## Conflicts To Resolve / 해결할 충돌

- 없음.
