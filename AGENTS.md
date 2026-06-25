# AGENTS.md

이 저장소에서 작업하는 AI agent는 아래 최소 규칙을 따른다.
구현 순서, 프롬프트, 완료 기준은 [`docs/08-development-workflow.md`](docs/08-development-workflow.md)에 둔다.

## 프로젝트

Target repository: `JUNGLE-TEAM1/NMM_team1`.

**AskLake 협업 하네스** — 이 프로젝트에서 AI와 사람이 Phase 단위로 협업하도록 돕는 운영 문서와 검증 규칙.

## 라이선스

프로젝트 라이선스는 아직 TBD다. 사람 확인 없이 라이선스 조항을 추가하거나 바꾸지 않는다.

| 우선순위 | 범위 | 인프라 |
| --- | --- | --- |
| P0 | XFlow 참고 MVP 범위와 검증 기준을 최소 초안으로 정리 | Markdown 문서 |
| P1 | 첫 실제 기능 Phase를 branch workspace로 진행 | 로컬 Git 저장소 |
| P2 | 프로젝트별 CI, 실행 명령, 배포/운영 규칙 보강 | 선택 사항 |

## Source of Truth

0. Layer Map: `docs/00-layer-map.md`
1. Requirements: `README.md`
2. Product: `docs/01-product-planning.md`
3. Architecture: `docs/02-architecture.md`
4. Interface: `docs/03-interface-reference.md`
5. Development Operations: `docs/04-development-guide.md`
6. Acceptance: `docs/05-acceptance-scenarios-and-checklist.md`
7. Regression: `docs/06-regression-and-failure-scenarios.md`
8. Manual Verification: `docs/07-manual-verification-playbook.md`
9. Workflow: `docs/08-development-workflow.md`
10. Collaboration Agreement: `docs/09-collaboration-agreement.md`
11. Next Action Menu: `docs/10-next-action-menu.md`
12. Git Sync Policy: `docs/11-git-sync-policy.md`
13. Quality Gates: `docs/12-quality-gates.md`
14. Human Command Flow: `docs/13-human-command-flow.md`
15. Decision Option Brief: `docs/14-decision-option-brief.md`
16. Context Budget Rule: `docs/15-context-budget-rule.md`
17. Existing Codebase Adoption: `docs/16-existing-codebase-adoption.md`
18. Parallel Milestone Protocol: `docs/17-parallel-milestone-protocol.md`
19. Branch Workspaces: `docs/workflows/`
20. Evidence: `docs/reports/`
21. External Summary: `README.md`

## 기술 스택

- Primary stack: React + FastAPI 후보
- Runtime/platform: local web app 우선
- Data layer: metadata는 PostgreSQL 또는 SQLite 후보, demo output은 local file storage 후보
- External services: GitHub Issues / PRs / Project, 설정 시 Notion sync
- Infra: GitHub repository와 local Git

## 작업 규칙

1. **작업 하나 = Phase 하나.** 한 요청에서 여러 Phase를 구현하지 않는다.
2. 사람이 명시적으로 Hotfix를 선택하지 않으면 `docs/08-development-workflow.md`의 Phase 순서를 따른다.
3. Hotfix는 `Hotfix`로 표시하고 현재 Phase 또는 Hotfix 항목에 기록한 뒤 원래 Phase 순서로 돌아온다.
4. 각 Phase는 `docs/04`와 `docs/08`에 정의된 branch 또는 작업 위치를 사용한다.
5. branch 생성/전환이 불가능하면 작업은 계속하되 이유를 보고한다.
6. 구현 branch는 `docs/workflows/` 아래에 대응 workspace folder가 있어야 한다.
7. 구현에 영향을 주는 변경은 구현 전에 관련 Phase에 먼저 반영한다.
8. interface 또는 schema 변경은 `docs/02`와/또는 `docs/03`을 업데이트한다.
9. Phase가 명시적으로 묶지 않는 한 독립 domain/feature는 분리한다.
10. MVP/core path가 안정되기 전에는 post-MVP 배포, 대규모 rewrite, 무관한 refactor를 하지 않는다.
11. README는 간결한 외부 요약으로 유지하고 자세한 내용은 `docs/`에 둔다.
12. 완료 전 관련 `docs/06` regression/failure 기준과 `docs/07` manual verification을 확인한다.
13. 완료 후 `docs/reports/_template.md`를 사용해 report를 만든다.
14. `docs/reports/`는 증거 계층이지 Source of Truth가 아니다. 충돌하면 Change Propagation Rule에 따라 Source of Truth를 고친다.
15. Phase 시작 전, upstream 변경 중, merge/PR 전에는 `docs/11-git-sync-policy.md`를 따른다.
16. branch 상태나 remote 상태를 바꾸는 pull, merge, rebase, push, PR 생성, PR merge는 사람 확인 없이 실행하지 않는다.
17. Phase가 local validation을 통과하고 PR/push/handoff가 다음 자연스러운 행동이면 `Pre-PR Human Checkpoint`를 제시하고, 사람이 선택하기 전에는 push/PR/merge를 실행하지 않는다.
18. branch sync 상태는 workspace `sync.md`에 기록한다.
19. TDD, branch check, CI, CD/deploy gate는 `docs/12-quality-gates.md`를 따른다.
20. TDD와 CI/CD 증거는 workspace `quality.md`에 기록한다.
21. PR/integration handoff 전 상태 요약이 필요하면 `scripts/status-workflow.sh`를 사용한다.
22. 고영향 선택은 `docs/14-decision-option-brief.md`를 사용하고 결과를 workspace `decisions.md`에 기록한다.
23. `docs/15-context-budget-rule.md`에 따라 Lite Read로 시작하고, 위험 신호가 있으면 Escalate Read, 전체 검토에는 Audit Read를 사용한다.
24. 토큰을 아끼기 위해 필요한 Source of Truth 문맥을 생략하지 않는다.
25. 사용자가 `병렬`, `병렬 마일스톤`, `병렬 리팩토링`, `parallel milestone`, `parallel worktree`를 명시하면 `docs/17-parallel-milestone-protocol.md`를 적용한다.
26. 병렬 프로토콜은 기존 Phase Workflow를 대체하지 않는다. 병렬 worktree/thread가 2개 이상 필요하거나 scope ownership, shared contract, integration order가 중요한 작업에만 얇은 실행 계약 레이어로 추가한다.

## 한국어 협업 산출물 규칙

사람과 AI가 함께 읽는 협업 산출물은 한국어로 작성한다.

적용 대상:

- branch workspace 문서: `plan.md`, `notes.md`, `quality.md`, `sync.md`, `confirmations.md`, `decisions.md`, `shared-docs.md`, `sources.md`, `next-actions.md`, `report.md`
- `docs/reports/`의 Phase / Hotfix report
- confirmation summary
- Next Action Menu
- project acceptance, regression, manual verification 항목

파일 경로, 명령어, 브랜치명, commit hash, API/schema 이름, 환경 변수, 오류 메시지, 테스트 이름, code identifier, script가 파싱하는 상태 label은 번역하지 않는다.

## 변경 전파 규칙

문서는 재사용 가능한 계층으로 구성되어 있다. 변경이 생기면 `docs/00-layer-map.md`에서 가장 이른 영향 계층을 찾고, 실제 영향을 받는 뒤쪽 문서만 검토/수정한다.

- Requirements change: Requirements -> Product -> Architecture -> Interface -> Development Operations -> Acceptance -> Regression -> Manual Verification -> Workflow
- Product scope or user-flow change: Product -> Architecture -> Interface -> Acceptance -> Regression -> Manual Verification -> Workflow
- Architecture change: Architecture -> Interface -> Acceptance -> Regression -> Manual Verification -> Workflow
- Interface or schema change: Interface -> Acceptance -> Regression -> Manual Verification -> Workflow
- Development operations change: Development Operations -> Manual Verification -> Workflow
- Git sync policy change: Development Operations -> Workflow -> Collaboration Agreement -> Next Action Menu
- Quality gate change: Development Operations -> Acceptance -> Regression -> Manual Verification -> Workflow -> Collaboration Agreement -> Next Action Menu
- Human command flow change: Workflow -> Collaboration Agreement -> Next Action Menu
- Decision option brief change: Workflow -> Collaboration Agreement -> Next Action Menu
- Parallel milestone protocol change: Workflow -> Collaboration Agreement -> Next Action Menu
- Acceptance scenario change: Acceptance -> Regression -> Manual Verification -> Workflow
- Regression/failure criteria change: Regression -> Manual Verification -> Workflow
- Manual verification change: Manual Verification -> Workflow
- Implementation bug/Hotfix: update the current Workflow Phase first; update Interface, Acceptance, Regression, or Manual Verification if impacted.
- Evidence conflict: Source of Truth layers win; update the earliest impacted Source of Truth layer instead of patching `docs/reports/` alone.

## 문맥 로딩 규칙

모든 작업에서 모든 문서를 읽지 않는다. 항상 `AGENTS.md`를 먼저 읽고, `docs/00-layer-map.md`로 변경 시작점에 필요한 계층과 섹션만 불러온다.

- `docs/08-development-workflow.md`는 현재 Phase 섹션만 읽는다.
- report는 Latest Report Index, 직전 Phase report, 관련 영역 최신 report, 필요 시 관련 report 1개만 읽는다.
- 문서 일관성 확인에는 먼저 `rg`를 사용하고 관련 섹션만 읽는다.
- `docs/15-context-budget-rule.md`를 적용한다. 기본은 Lite Read, contract/data/security/sync/quality/integration 위험에는 Escalate Read, 전체 점검이나 명시적 audit에는 Audit Read를 쓴다.
- 요청, branch workspace, 또는 PR 주제가 `docs/project-context/`의 하위 묶음과 명확히 관련 있으면 해당 묶음의 `README.md`와 canonical 결정 로그를 작업 컨텍스트에 포함한다.
- workspace가 있으면 상세 파일을 열기 전에 `scripts/status-workflow.sh <workspace>`를 summary entry point로 사용한다.
- Context Budget mode와 읽은 주요 문서를 Phase report에 기록한다.

## Skill Discovery 규칙

실행 전 작업 유형을 분류하고, 관련 Codex skill/plugin/tool 또는 동등한 agent capability가 있는지 가볍게 확인한다.

- Prefer specialized capabilities for browser/local web verification, document authoring/editing, presentations/slides, spreadsheets/CSV analysis, image generation/editing, OpenAI API/model/SDK work, automation/reminders/repeated tasks, and other obvious specialized tasks.
- If a relevant skill/plugin/tool exists, follow its workflow.
- If no relevant capability exists, or the task is simple, continue with the default Phase Workflow.
- If skill/plugin/tool usage materially affects the result, record it in the Phase report.

## 가벼운 실행 규칙

문서는 실행을 돕는 도구다. 문서를 맞추기 위해 작업 범위를 불필요하게 키우지 않는다.

- 기존 문서로 표현할 수 없을 때만 새 문서를 추가한다.
- 문서 수정은 작업과 직접 관련된 최소 범위로 제한한다.
- 일관성은 유지하되 구현 범위를 키우는 추가 문서 작업은 만들지 않는다.
- 작은 변경은 보통 관련 Phase/Hotfix 항목과 report만 업데이트한다.
- Phase report는 실행 증거이지 다듬어진 에세이가 아니다.

## 완료 정의

- code 또는 artifact가 구현되어 있다.
- test, build, smoke test, 또는 manual verification을 완료했다.
- 관련 `docs/05` acceptance criteria를 확인했다.
- 관련 `docs/06` Regression Guard / Failure Scenario를 검토했다.
- 관련 `docs/07` Manual Verification 결과를 기록했다.
- `docs/reports/_template.md`로 Phase/Hotfix report를 작성했다.
- 문서 drift가 없다.
- data 변경/migration이 있으면 검증했다.
- secret을 commit하지 않았다.
- deployment/CI 작업에는 필요한 경우 smoke, image/tag, rollback note가 포함된다.

## 피해야 할 것

- 문서에 없는 요구사항을 invent하지 않는다.
- 완료되지 않은 핵심 요구사항을 done으로 표시하지 않는다.
- API key, token, private key, 실제 credential을 commit하지 않는다.
- 명시적인 throwaway spike가 아니라면 한 요청에서 전체 프로젝트를 만들지 않는다.

## 명령 예시

```bash
rg -n "\\[[A-Z0-9_]+\\]" .
scripts/start-workflow.sh feature project-bootstrap "Project bootstrap"
git status --short
```
