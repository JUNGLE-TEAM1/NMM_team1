# Week2 M3 JSON main path decision 보고서

## Short Report / 짧은 보고

- Type: docs
- Date: 2026-06-25
- Changed: M3의 첫 구현 대상을 Amazon Reviews JSON으로 고정하고, PR #105는 그대로 merge하지 않고 source material로만 회수한다고 결정했다.
- Verified: PR #105 read-only inspection, M3 JSON keyword check, `git diff --check`, `scripts/validate-harness.sh --strict`
- Remaining: Phase 6 runner boundary decision
- Next context: M3는 JSON inspection/profile/schema facts/minimal `TransformSpec`/Catalog facts를 만들고, M5 runner boundary로 넘긴다.
- Risk: PR #105의 구현을 아직 code로 회수하지 않았으므로 후속 implementation에서 작은 slice로 재검증해야 한다.

## Phase / Hotfix

- Type: docs
- Branch/work location: `docs/week2-m3-json-main-path-decision`, `docs/workflows/docs/week2-m3-json-main-path-decision`
- Date: 2026-06-25
- Workspace state: complete

## Goal / 목표

- M3 JSON main path와 닫힌 PR #105의 회수/제외 범위를 결정한다.

## Changed Files / 변경 파일

- `docs/project-context/asklake-week2-module-plan/ver2/m3-json-main-path-decision.md`
- `docs/project-context/asklake-week2-module-plan/ver2/README.md`
- `docs/workflows/docs/week2-m3-json-main-path-decision/*`
- `docs/reports/week2-m3-json-main-path-decision.md`
- `docs/reports/README.md`

## Implementation Summary / 구현 요약

- M3 첫 구현 slice를 Amazon Reviews JSON inspection/profile/schema facts/minimal `TransformSpec`/Catalog facts로 제한했다.
- PR #105는 closed/not merged 상태이며, JSON source inspection/profile logic만 source material로 회수한다고 기록했다.
- UI/source catalog/API broad changes와 M5 workflow 직접 결합은 이번 회수에서 제외했다.

## Verification Commands / 검증 명령

```bash
gh pr view 105 --json number,title,state,mergedAt,headRefName,baseRefName,url,author,commits,files
git diff --stat origin/main...origin/codex/m3-json-recommendations
rg -n "Amazon Reviews JSON|PR #105|source material|json_source.py|TransformSpec|Catalog metadata facts|그대로 merge하지 않는다|회수 후보|이번 회수 제외" docs/project-context/asklake-week2-module-plan/ver2/m3-json-main-path-decision.md
git diff --check
scripts/validate-harness.sh --strict
```

## Quality Gate Evidence / 품질 게이트 증거

- Workspace file: `docs/workflows/docs/week2-m3-json-main-path-decision/quality.md`
- Quality gate status: passed
- TDD status: not applicable, docs-only decision
- CI/check result: local strict harness passed; PR CI는 PR 생성 후 확인
- Skipped checks: runtime unit/build checks skipped because no code changed
- CD/deploy gate: not required

## Decision Evidence / 결정 증거

- Workspace file: `docs/workflows/docs/week2-m3-json-main-path-decision/decisions.md`
- Decision status: accepted
- Accepted/deferred decisions: M3 JSON main path accepted; PR #105 selective recovery accepted; runner boundary fields deferred to Phase 6
- Revisit/rollback condition: JSON inspection/profile slice가 Amazon Reviews sample에서 실패하면 PR #105 회수 범위 또는 sample fixture를 재검토한다.

## Secret / Migration / Env Check

- Secret check: no secret added
- Migration/data change: none
- Env change: none

## Final Judgment / 최종 판단

- Done: yes
- Remaining risk: implementation은 아직 없으므로 Phase 6 이후 M3 code PR에서 작은 테스트 단위로 회수해야 한다.
