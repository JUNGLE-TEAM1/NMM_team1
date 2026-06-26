# Guardrail protocol split 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/system-guardrails.md` | 시스템이 강제해야 하는 안전장치 인벤토리 신설 | 하네스 문서의 강제 룰과 실제 GitHub/CI/platform 책임을 분리하기 위해 | 중간 |
| `AGENTS.md` | 작업 규칙 중 시스템 강제 항목과 협업 프로토콜 표현 정리 | 에이전트 진입점에서 하네스 책임 경계를 명확히 하기 위해 | 중간 |
| `docs/00-layer-map.md` | System Guardrails 문서 위치와 변경 전파 경로 반영 | 새 Source of Truth 문서의 계층 위치가 필요함 | 중간 |
| `docs/04-development-guide.md` | 운영 규칙에서 시스템 가드레일 참조와 하네스 프로토콜 분리 | Development Operations layer의 역할 정리 | 중간 |
| `docs/11-git-sync-policy.md` | Git/PR 강제 룰은 시스템 가드레일 참조로 이동하고 sync 기록/복구 중심으로 정리 | GitHub branch protection/required checks와 하네스 기록 책임을 분리 | 높음 |
| `docs/12-quality-gates.md` | CI/CD 강제 항목과 workspace quality evidence 프로토콜 분리 | CI가 막을 일과 하네스가 기록할 일을 구분 | 높음 |
| `docs/09-collaboration-agreement.md` | 책임/확인 표현 정렬 | 사람 통제 규칙처럼 읽히는 표현을 협업 합의로 정리 | 낮음 |
| `docs/13-human-command-flow.md` | 사용자 명령 흐름 표현 정렬 | 실제 시스템 설정 변경과 하네스 문서 작업을 구분 | 낮음 |

## Integration Notes / 통합 메모

- 실제 GitHub branch protection, repository settings, secret scanning, environment reviewer, CODEOWNERS enforcement는 이 Phase에서 변경하지 않는다.
- 시스템 설정이 필요한 항목은 `docs/system-guardrails.md`의 status로 남긴다.
- `branch start -> issue + Project In Progress`는 `scripts/start-workflow.sh`와 optional branch-push automation 후보로 기록한다.
- `PR open -> linked issue required + Project Review`, `PR merge -> issue close + Project Done`은 GitHub Actions/Project automation/required check 후보로 기록한다.

## Deferred / Not Changed In This Phase

| File or Area | Reason | Follow-up Trigger |
| --- | --- | --- |
| `.github/workflows/` | 새 GitHub Action 또는 bot 구현은 이번 Phase 제외 범위다. | PR linked issue required check 또는 Project status sync를 실제 시스템 가드레일로 승격할 때 |
| `scripts/start-workflow.sh` | branch start issue 생성은 현행 script-enforced protocol로 기록만 했다. | branch push issue automation 또는 start script behavior 변경이 필요할 때 |
| `docs/10-next-action-menu.md` | 메뉴 구조 변경 없이 현행 next action으로 표현 가능했다. | system guardrail 설정 전용 메뉴가 필요해질 때 |

## Conflicts To Resolve / 해결할 충돌

- 하네스 문서에 남길 최소 프로토콜과 시스템으로 이동할 강제 룰의 경계.
- local branch 시작 시점은 GitHub가 알 수 없으므로, branch start issue creation은 hard system gate가 아니라 script-enforced protocol로 기록했다.
