# Guardrail protocol split 보고서

## Short Report / 짧은 보고

- Type: docs
- Date: 2026-06-26
- Changed: `docs/system-guardrails.md`를 신설하고, 강제 가능한 안전장치와 하네스 협업 프로토콜의 책임 경계를 Source of Truth 문서에 반영했다. `AGENTS.md`, `docs/00-layer-map.md`, `docs/04-development-guide.md`, `docs/09-collaboration-agreement.md`, `docs/11-git-sync-policy.md`, `docs/12-quality-gates.md`, `docs/13-human-command-flow.md`가 새 system guardrails 문서를 참조한다.
- Verified: `scripts/validate-harness.sh`, `scripts/validate-harness.sh --strict`, guardrail keyword `rg` 검색, `scripts/status-workflow.sh docs/workflows/docs/guardrail-protocol-split` 실행.
- Remaining: final validation rerun, branch push, PR 생성이 남아 있다. 실제 GitHub branch protection, required checks, secret scanning, CODEOWNERS, Environment approval, PR linked issue required check, Project automation은 적용하지 않았다. `docs/system-guardrails.md`에 `requires-admin`, `partial`, `planned` 상태로 남겼다.
- Next context: final validation과 PR-ready 검사를 통과하면 PR을 생성한다. 이후 실제 system setting 적용 Phase를 만들 경우 `docs/system-guardrails.md`의 Guardrail Inventory를 시작점으로 삼는다.
- Risk: branch start issue creation은 GitHub가 local branch creation을 직접 감지할 수 없어 hard system gate가 아니라 `scripts/start-workflow.sh` 중심의 script-enforced protocol로 남는다.

---

## Phase / Hotfix

- Type: docs
- Branch/work location: `docs/guardrail-protocol-split`, `docs/workflows/docs/guardrail-protocol-split`
- Date: 2026-06-26
- Workspace state: in-progress

## Reference Docs / 참고 문서

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/04-development-guide.md`
- `docs/09-collaboration-agreement.md`
- `docs/11-git-sync-policy.md`
- `docs/12-quality-gates.md`
- `docs/13-human-command-flow.md`
- `docs/system-guardrails.md`

## Goal / 목표

- 하네스에 섞여 있던 강제 룰과 협업 프로토콜을 분리한다.
- 시스템이 강제해야 하는 항목은 `docs/system-guardrails.md` 인벤토리로 옮긴다.
- 하네스 문서는 작업 상태, 판단 근거, 검증 결과, 복구 경로를 공유하는 프로토콜 중심으로 남긴다.

## Changed Files / 변경 파일

- `docs/system-guardrails.md`
- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/04-development-guide.md`
- `docs/09-collaboration-agreement.md`
- `docs/11-git-sync-policy.md`
- `docs/12-quality-gates.md`
- `docs/13-human-command-flow.md`
- `docs/workflows/docs/guardrail-protocol-split/`

## Implementation Summary / 구현 요약

- `System Guardrails` 문서를 새로 만들어 branch protection, required CI, secret scanning, CODEOWNERS, deploy approval, PR/Issue template shape, PR linked issue, Project status sync, PR size/risk warning 등을 인벤토리로 정리했다.
- branch start issue creation은 local branch creation을 GitHub가 직접 감지할 수 없으므로 `scripts/start-workflow.sh`가 맡는 script-enforced protocol로 분리했다.
- PR linked issue required check, Project status sync, lifecycle drift detection은 GitHub Actions/Project automation/required check 후보로 분리했다.
- `docs/11`과 `docs/12`는 sync/evidence protocol과 system enforcement inventory를 분리해 참조하도록 보강했다.

## Skill / Tool Usage / skill 또는 tool 사용

- Used skill/plugin/tool: none
- Reason: 문서/하네스 정리 작업이며 특수 artifact skill이 필요하지 않았다.
- Impact: n/a
- Not used because: 브라우저, 문서 렌더링, spreadsheet, image generation 범위가 아니다.

## Context Budget Evidence / 컨텍스트 예산 증거

- Context Budget mode: Escalate Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/04-development-guide.md`, `docs/11-git-sync-policy.md`, `docs/12-quality-gates.md`
- Escalated context read: `docs/09-collaboration-agreement.md`, `docs/10-next-action-menu.md`, `docs/13-human-command-flow.md`, `.github` workflow/template summary
- Context omitted intentionally: GitHub repository settings UI, actual branch protection admin settings, secret scanning admin settings

## Verification Commands / 검증 명령

```bash
gh issue reopen 133
gh project item-edit --id PVTI_lADOEVx8xs4BbEjqzgw5zSM --project-id PVT_kwDOEVx8xs4BbEjq --field-id PVTSSF_lADOEVx8xs4BbEjqzhV3sIQ --single-select-option-id 98236657 --format json
gh issue view 133 --json number,title,state,url,closed,projectItems --jq '{number,title,state,url,closed,projectItems}'
git fetch origin main
git merge --no-edit origin/main
scripts/validate-harness.sh
scripts/validate-harness.sh --strict
rg -n "사람 확인 없이|금지|required|CI|secret|deploy|merge|push|branch protection|CODEOWNERS" AGENTS.md docs/system-guardrails.md docs/00-layer-map.md docs/04-development-guide.md docs/09-collaboration-agreement.md docs/11-git-sync-policy.md docs/12-quality-gates.md docs/13-human-command-flow.md
scripts/status-workflow.sh docs/workflows/docs/guardrail-protocol-split
```

## Quality Gate Evidence / 품질 게이트 증거

- Workspace file: `docs/workflows/docs/guardrail-protocol-split/quality.md`
- Quality gate status: passed-with-skips
- TDD status: not applicable; 문서 구조 정리
- CI/check result: local validation passed; remote CI not run because branch was not pushed
- Skipped checks: runtime unit/build checks skipped because no app runtime behavior changed
- CD/deploy gate: not applicable

## Decision Evidence / 결정 증거

- Workspace file: `docs/workflows/docs/guardrail-protocol-split/decisions.md`
- Decision status: accepted
- Accepted/deferred decisions: 강제 가능한 안전장치는 GitHub/CI/platform에 두고 하네스는 협업 프로토콜로 둔다. 실제 repository settings 적용은 follow-up으로 보류.
- Revisit/rollback condition: 하네스 문서가 강제 룰을 반복하거나 협업 프로토콜이 사라지면 `docs/system-guardrails.md`와 Source of Truth 문서를 재정렬한다.

## Regression Guard / 회귀 보호

- Checked feature: branch/workspace/issue/PR lifecycle tracking
- Protected behavior: `scripts/start-workflow.sh` issue 생성과 `sync.md` 기록, PR linked issue/closing keyword 추적
- Result: 새 문서는 branch start script responsibility와 PR 이후 system guardrail 후보를 분리한다.

## Failure Scenario / 실패 시나리오

- Reviewed failure: active workspace의 linked issue가 closed/Done 상태로 drift되는 경우
- Expected behavior: status workflow가 drift를 드러내고, 원격 상태 보정은 evidence로 기록한다.
- Verification: issue `#133`을 reopen하고 Project `In Progress`로 정렬한 뒤 `scripts/status-workflow.sh`로 `OPEN` / `In Progress` 확인
- Result: passed

## Manual Verification / 수동 검증

- Document executed: `docs/system-guardrails.md`와 관련 Source of Truth 수동 검토
- Environment: local repository + GitHub CLI
- Result: system guardrail inventory와 lifecycle responsibility split 확인
- Failure/limitation: 실제 repository admin settings는 확인/변경하지 않았다.
- Evidence: `quality.md`, `sync.md`, 이 report

## docs/05 Acceptance Link / 수용 기준 연결

- Related item: 문서/하네스 운영 정합성
- Status: passed
- Evidence: strict harness validation passed, Source of Truth 문서 참조 정렬

## Document Updates / 문서 업데이트

- Updated: `docs/system-guardrails.md`, `AGENTS.md`, `docs/00-layer-map.md`, `docs/04-development-guide.md`, `docs/09-collaboration-agreement.md`, `docs/11-git-sync-policy.md`, `docs/12-quality-gates.md`, `docs/13-human-command-flow.md`
- Not updated and why: `docs/10-next-action-menu.md`는 이번 변경만으로 메뉴 구조 변경이 필수는 아니어서 보류했다.

## Failed / Incomplete / Follow-Up TODO

- 실제 GitHub branch protection / required checks / secret scanning / CODEOWNERS / environment protection / PR linked issue required check / Project automation 적용 여부 결정.
- PR size/risk warning 기준과 override label 결정.

## Context For Next Phase / 다음 Phase 문맥

- 다음 Phase는 `docs/system-guardrails.md`의 `Current Status`가 `requires-admin`, `partial`, `planned`인 항목 중 하나를 실제 설정 또는 CI check로 승격할지 결정하면 된다.

## Secret / Migration / Env Check

- Secret check: 실제 secret 값 변경 없음
- Migration/data change: 없음
- Env change: 실제 GitHub/repository settings 변경 없음

## Final Judgment / 최종 판단

- Done: system guardrail / harness protocol 책임 분리 문서화와 local validation 완료
- Remaining risk: final validation rerun과 PR 생성이 남아 있고, 실제 시스템 강제력은 아직 설정되지 않은 항목이 있다.
