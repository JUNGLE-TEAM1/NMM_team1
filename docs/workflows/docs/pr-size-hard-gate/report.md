# PR Size Hard Gate 보고서

## Short Report / 짧은 보고

- Type: docs
- Date: 2026-06-26
- Context Budget mode: Escalate Read
- Primary context read: `AGENTS.md`, `docs/system-guardrails.md`, `docs/12-quality-gates.md`
- Escalated context read: existing PR risk scripts/tests, GitHub ruleset state
- Context omitted intentionally: app runtime implementation, deploy/AWS flows
- Changed: `pr-size-hard-gate` script/workflow/test를 추가하고, `docs/system-guardrails.md`, `docs/12-quality-gates.md`에 시스템 hard gate로 문서화했다. GitHub ruleset `AskLake main system guardrails` required checks에 `pr-size-hard-gate`를 추가했다.
- Verified: `node tests/pr-size-hard-gate.test.js`, `node tests/pr-risk-warning.test.js`, `node tests/migration-schema-security-check.test.js`, `scripts/validate-harness.sh --strict`, `gh api repos/JUNGLE-TEAM1/NMM_team1/rulesets/18157469`.
- Remaining: PR 생성 후 `pr-size-hard-gate` check가 실제로 표시되고 통과하는지 확인한다.
- Next context: PR body에 `Large PR Exception: approved`가 없으면 non-evidence files > 10 또는 non-evidence changed lines > 600에서 실패한다.
- Risk: threshold가 너무 강하면 정상 PR도 쪼개야 하므로 운영 후 완화할 수 있다.

## Phase / Hotfix

- Type: docs
- Branch/work location: `docs/pr-size-hard-gate`, `docs/workflows/docs/pr-size-hard-gate`
- Date: 2026-06-26
- Workspace state: complete

## Verification Commands / 검증 명령

```bash
node tests/pr-size-hard-gate.test.js
node tests/pr-risk-warning.test.js
node tests/migration-schema-security-check.test.js
scripts/validate-harness.sh --strict
gh api repos/JUNGLE-TEAM1/NMM_team1/rulesets/18157469
```

## Final Judgment / 최종 판단

- Done: PR size hard gate local implementation and remote ruleset update complete
- Remaining risk: first PR run must confirm required check wiring
