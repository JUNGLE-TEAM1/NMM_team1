# 이슈 템플릿 생성 경로 보강 공유 문서 변경 제안

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/04-development-guide.md` | `start-workflow.sh` 생성 issue가 한국어 title/body/label과 `--body-file`을 사용한다는 운영 규칙 추가 | branch workspace 생성과 issue 연결은 Development Operations 소유 | 낮음 |
| `docs/11-git-sync-policy.md` | GitHub UI issue template을 타지 않는 script 생성 issue의 한국어 body/title/label 및 body-file 규칙 추가 | issue/PR lifecycle과 sync 기록 정책 소유 | 낮음 |
| `docs/13-human-command-flow.md` | "브랜치 만들 때 이슈도 같이 생성해" 흐름에 한국어 issue 생성 규칙 추가 | 사람이 쓰는 명령 흐름과 AI 책임 명확화 | 낮음 |
| `scripts/start-workflow.sh` | issue title prefix, type label, Korean body section, body-file 전달, type별 label 생성 | 자동 생성 issue가 template drift를 만들지 않도록 함 | 중간: GitHub issue 생성 helper 동작 변경 |
| `scripts/test-harness.sh` | fake gh issue create body capture와 한국어 issue body/label fixture 추가 | literal newline과 영어 heading 회귀 방지 | 낮음 |
| `scripts/validate-harness.sh` | start-workflow issue body/title/label/body-file static guard 추가 | fixture 밖의 정적 drift 방지 | 낮음 |

## Integration Notes / 통합 메모

- 기존 remote issue/PR은 수정하지 않는다.
- 실제 GitHub issue 생성은 하지 않고 fake `gh` fixture와 dry-run으로 검증한다.

## Conflicts To Resolve / 해결할 충돌

- 없음
