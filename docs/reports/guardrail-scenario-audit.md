# Guardrail Scenario Audit 보고서

## Short Report / 짧은 보고

- Type: docs
- Date: 2026-06-26
- Changed: `docs/system-guardrails.md`에 Scenario Audit Plan과 Mock Scenario Matrix를 추가하고, `docs/12-quality-gates.md`에 PR CI/read-only audit/admin audit/external E2E tier를 연결했다. GitHub `main` ruleset, secret scanning/push protection, migration/schema/security hard detection workflow를 적용했다.
- Verified: `node tests/migration-schema-security-check.test.js`, `node tests/pr-linked-issue-check.test.js`, `node tests/pr-risk-warning.test.js`, `scripts/test-harness.sh`, `scripts/validate-harness.sh --strict`, `scripts/status-workflow.sh docs/workflows/docs/guardrail-scenario-audit`, `gh api repos/JUNGLE-TEAM1/NMM_team1/rulesets/18157469`, `gh api repos/JUNGLE-TEAM1/NMM_team1 --jq '.security_and_analysis'`.
- Remaining: CODEOWNERS review와 PR size/risk hard gate는 사용자 지시에 따라 보류했다. 새 required check `migration-schema-security`는 PR 생성 후 실제 GitHub check 표시를 확인해야 한다. read-only scenario audit script는 이번 Phase에서 구현하지 않았다.
- Next context: 다음에는 PR-ready 처리, read-only audit automation Phase, repository admin setting audit, 또는 제품 기능 Phase 중 하나를 선택한다.
- Risk: `main` ruleset이 active라 앞으로 required checks가 통과해야 merge할 수 있다. 새 required check workflow는 이 branch가 PR로 올라간 뒤 실제 동작을 확인해야 한다.

---

## Phase / Hotfix

- Type: docs
- Branch/work location: `docs/guardrail-scenario-audit`, `docs/workflows/docs/guardrail-scenario-audit`
- Date: 2026-06-26
- Workspace state: complete

## Reference Docs / 참고 문서

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/07-manual-verification-playbook.md`
- `docs/12-quality-gates.md`
- `docs/system-guardrails.md`
- `docs/18-harness-regression-policy.md`
- `docs/reports/guardrail-protocol-split.md`
- `docs/reports/github-record-drift-audit.md`

## Goal / 목표

- 시스템 레이어와 협업 하네스 레이어가 실제 운영 흐름에서도 잘 분리되어 있는지 검증 계획으로 확인한다.

## Changed Files / 변경 파일

- `docs/system-guardrails.md`
- `docs/12-quality-gates.md`
- `docs/reports/README.md`
- `.github/scripts/check-migration-schema-security.js`
- `.github/workflows/migration-schema-security-check.yml`
- `.github/workflows/ci.yml`
- `tests/migration-schema-security-check.test.js`
- `docs/workflows/docs/guardrail-scenario-audit/*`
- `docs/reports/guardrail-scenario-audit.md`

## Implementation Summary / 구현 요약

- CI 기본 단위, PR 이벤트 check, 읽기 전용 lifecycle audit, admin setting audit, human-approved E2E rehearsal을 tier로 분리했다.
- linked issue 누락, closing keyword 정상, PR risk warning, active workspace drift, merged PR issue/project mismatch, stale workspace evidence, report와 Source of Truth 충돌 시나리오를 정의했다.
- PR size/risk warning은 advisory로 유지했다.
- GitHub ruleset `AskLake main system guardrails`를 생성해 default branch PR required, deletion/non-fast-forward 제한, required status checks를 적용했다.
- GitHub secret scanning과 push protection을 enabled로 바꿨다.
- migration/schema/security-sensitive path 변경 시 PR impact field가 비어 있으면 실패하는 required check를 추가했다.

## Skill / Tool Usage / skill 또는 tool 사용

- Used skill/plugin/tool: none
- Reason: 문서/하네스 계획 정리 작업이며 특수 artifact skill이 필요하지 않았다.
- Impact: n/a
- Not used because: 브라우저, 문서 렌더링, spreadsheet, image generation 범위가 아니다.

## Context Budget Evidence / 컨텍스트 예산 증거

- Context Budget mode: Escalate Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/12-quality-gates.md`, `docs/system-guardrails.md`
- Escalated context read: `docs/18-harness-regression-policy.md`, `docs/reports/guardrail-protocol-split.md`, `docs/reports/github-record-drift-audit.md`, `.github` workflow summary
- Context omitted intentionally: GitHub repository settings UI, branch protection admin settings, secret scanning admin settings

## Verification Commands / 검증 명령

```bash
node tests/pr-linked-issue-check.test.js
node tests/pr-risk-warning.test.js
node tests/migration-schema-security-check.test.js
scripts/test-harness.sh
scripts/validate-harness.sh --strict
scripts/status-workflow.sh docs/workflows/docs/guardrail-scenario-audit
gh api repos/JUNGLE-TEAM1/NMM_team1/rulesets/18157469
gh api repos/JUNGLE-TEAM1/NMM_team1 --jq '.security_and_analysis'
```

## Quality Gate Evidence / 품질 게이트 증거

- Workspace file: `docs/workflows/docs/guardrail-scenario-audit/quality.md`
- Quality gate status: passed-with-skips
- TDD status: not applicable; 문서/운영 테스트 계획 정리
- CI/check result: local equivalent passed; `status-workflow.sh` reports Source of Truth proposal status `applied`; remote ruleset and secret scanning verified
- Skipped checks: app runtime build/container smoke/real GitHub admin audit/remote-changing E2E rehearsal skipped with reasons
- CD/deploy gate: not applicable

## Decision Evidence / 결정 증거

- Workspace file: `docs/workflows/docs/guardrail-scenario-audit/decisions.md`
- Decision status: accepted
- Accepted/deferred decisions: scenario audit은 read-only manual/scheduled 우선, PR risk는 advisory 유지, CODEOWNERS review와 PR size/risk hard gate는 보류, main ruleset/secret scanning/migration-schema-security hard detection은 적용
- Revisit/rollback condition: drift가 반복되거나 대형 PR이 장애를 유발하면 audit automation 또는 hard gate 승격을 별도 Phase에서 재검토

## Regression Guard / 회귀 보호

- Checked feature: system guardrail / harness protocol responsibility split
- Protected behavior: 기계가 검증 가능한 항목은 시스템/CI로, 사람 판단과 복구 맥락은 하네스 evidence로 유지. `main` 직접 push, PR 없는 변경, non-fast-forward, branch deletion, missing required check, secret push, migration/schema/security impact omission을 시스템에서 막는다.
- Result: pass

## Failure Scenario / 실패 시나리오

- Reviewed failure: 새 테스트 계획이 hard rule을 늘려 개발 속도와 edge case 관리 비용을 키우는 경우
- Expected behavior: every-PR CI는 deterministic focused check로 제한하고 remote state나 사람 판단이 필요한 흐름은 read-only/manual audit로 분리
- Verification: `docs/system-guardrails.md` Scenario Audit Plan과 `docs/12-quality-gates.md` Guardrail Scenario Audit tier 수동 검토
- Result: pass

## Manual Verification / 수동 검증

- Document executed: `docs/system-guardrails.md`, `docs/12-quality-gates.md` 수동 검토
- Environment: local repository
- Result: 시스템 레이어/협업 레이어/사람 판단 범위가 테스트 계획에서도 분리됨
- Failure/limitation: 실제 GitHub repository settings는 확인/변경하지 않았다.
- Evidence: `quality.md`, 이 report

## docs/05 Acceptance Link / 수용 기준 연결

- Related item: 문서와 계약 일관성, 운영 기준
- Status: passed
- Evidence: strict harness validation passed, Source of Truth 문서와 report index 업데이트

## Document Updates / 문서 업데이트

- Updated: `docs/system-guardrails.md`, `docs/12-quality-gates.md`, `.github/scripts/check-migration-schema-security.js`, `.github/workflows/migration-schema-security-check.yml`, `.github/workflows/ci.yml`, `tests/migration-schema-security-check.test.js`, `docs/reports/README.md`, branch workspace, Phase report
- Not updated and why: `docs/08-development-workflow.md`는 workflow rule 자체 변경이 아니어서 보류했다. `docs/18-harness-regression-policy.md`는 새 script/fixture rule을 추가하지 않아 보류했다.

## Failed / Incomplete / Follow-Up TODO

- PR 생성 후 `harness`, `container-smoke`, `manifest-smoke`, `linked-issue`, `migration-schema-security` required checks가 실제로 표시되는지 확인.
- CODEOWNERS review와 PR size/risk hard gate는 사용자 지시에 따라 보류.
- read-only scenario audit script 또는 manual `workflow_dispatch` 추가 여부 결정.

## Context For Next Phase / 다음 Phase 문맥

- 자동화를 원하면 `read-only guardrail audit automation` Phase를 연다.
- required check 표시를 확인하려면 PR 생성 후 GitHub checks를 확인한다.
- guardrail 경계가 충분하면 제품 기능 Phase로 돌아간다.

## Secret / Migration / Env Check

- Secret check: 실제 secret 값 변경 없음
- Migration/data change: 없음
- Env change: 실제 GitHub/repository settings 변경 없음

## Final Judgment / 최종 판단

- Done: system guardrail scenario audit plan and quality gate tier documented; local validation passed; branch/workspace naming aligned; requested main ruleset, secret scanning, push protection, and migration/schema/security hard detection applied
- Remaining risk: CODEOWNERS review와 PR size/risk hard gate는 보류 상태다. 새 required check는 PR에서 실제 표시를 확인해야 한다.
