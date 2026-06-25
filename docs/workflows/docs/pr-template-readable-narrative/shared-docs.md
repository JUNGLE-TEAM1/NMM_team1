# PR 템플릿 문단형 설명 보강 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/04-development-guide.md` | PR readiness checklist에 7섹션 문단형 handoff 기준 반영 | 리뷰어가 diff 전에 변경/검증/위험을 이해하게 하기 위함 | 낮음 |
| `docs/11-git-sync-policy.md` | PR body를 checklist가 아닌 readable handoff shape로 설명 | `prepare-pr.sh` 자동 생성 본문과 정책 일치 | 낮음 |
| `docs/13-human-command-flow.md` | PR 준비 명령의 body draft 설명을 새 구조로 갱신 | 사람 명령 흐름에서 기대 출력 명확화 | 낮음 |

## Integration Notes / 통합 메모

- 제품 architecture/interface/acceptance 기준 변경은 없다.

## Conflicts To Resolve / 해결할 충돌

- 
