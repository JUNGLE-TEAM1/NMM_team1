# Workflow harness slimdown 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/08-development-workflow.md` | 하위 정책 상세 반복을 줄이고 canonical 문서 참조 중심으로 압축 | workflow 문서가 sync/quality/context/menu/parallel 정책을 중복 소유하지 않도록 역할 경계 정리 | 낮음: 정책 의미 변경 없이 참조 정리 |
| `.github/pull_request_template.md` | 자동 PR body의 기준 템플릿으로 사용 | GitHub 기본 PR 템플릿과 `scripts/prepare-pr.sh` 자동 생성 body가 따로 놀지 않게 함 | 낮음: 템플릿 내용을 직접 변경하지 않고 helper가 읽음 |
| `.github/ISSUE_TEMPLATE/*.md` | 기본 issue title prefix를 한국어로 변경 | 사람이 보는 GitHub issue 제목이 한국어 협업 산출물 규칙과 맞게 시작되도록 함 | 낮음: YAML front matter title/name만 변경 |
| `scripts/prepare-pr.sh` | PR body 생성 시 PR 템플릿을 읽고 workspace, branch, linked issue, quality, sync 값을 자동 채움 | 자동 PR 생성 경로에서도 PR 템플릿 핵심 섹션과 closing keyword를 유지 | 중간: PR handoff helper 동작 변경이므로 harness regression으로 보호 |
| `scripts/test-harness.sh` | prepare-pr fixture가 한국어 PR 템플릿 섹션과 자동 채움 값을 확인 | PR body 생성 회귀 방지 | 낮음: fixture assertion 보강 |

## Integration Notes / 통합 메모

- 제품/architecture/interface/acceptance 문서는 변경하지 않는다.
- PR/issue remote 상태는 변경하지 않는다. 검증은 `--dry-run`과 local harness checks로 제한한다.

## Conflicts To Resolve / 해결할 충돌

- 없음
