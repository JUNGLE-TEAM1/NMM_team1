# 한국어 GitHub Issue/PR 템플릿 개선 보고서

## Short Report / 짧은 보고

- Type: docs
- Branch/work location: `docs/korean-github-templates`, `docs/workflows/docs/korean-github-templates`
- Date: 2026-06-25
- Workspace state: in-progress
- Context Budget mode: Lite Read
- Primary context read: `AGENTS.md`, `docs/00-layer-map.md`, `docs/04-development-guide.md`, `docs/08-development-workflow.md`, `docs/15-context-budget-rule.md`, 기존 `.github/pull_request_template.md`
- Escalated context read: 없음
- Context omitted intentionally: 관련 없는 Source of Truth 전체, 과거 report 전체, 런타임 코드
- Changed: 한국어 Issue 템플릿 4종과 PR 템플릿을 추가/확장하고, branch workspace 증거 문서를 작성했다.
- Verified: `git diff --check`, Issue template YAML front matter 파싱, `scripts/validate-harness.sh`, `scripts/validate-harness.sh --strict` in in-progress mode, `scripts/prepare-pr.sh --check-pr-sync`
- Remaining: PR 생성 후 CI/check 결과 확인 필요. strict ready-state 검증은 Source of Truth 변경 없음 작업과 validation guard 요구가 맞지 않아 in-progress mode로 통과시켰다.
- Next context: PR #89에서 `Closes #88`로 linked issue를 닫도록 연결
- Risk: GitHub label `feature`, `bug`, `documentation`, `ops`, `hotfix`가 없으면 템플릿 선택 시 label 적용이 실패하거나 무시될 수 있다.

## Changed Files / 변경 파일

- `.github/pull_request_template.md`
- `.github/ISSUE_TEMPLATE/feature_request.md`
- `.github/ISSUE_TEMPLATE/bug_report.md`
- `.github/ISSUE_TEMPLATE/docs_ops.md`
- `.github/ISSUE_TEMPLATE/hotfix.md`
- `.github/ISSUE_TEMPLATE/config.yml`
- `docs/workflows/docs/korean-github-templates/`

## Acceptance / Regression / Manual Verification

- Acceptance: GitHub Issue/PR 작성자가 Phase, Source of Truth, acceptance, regression, manual verification, secret/license, sync 상태를 구조적으로 기록할 수 있게 됨.
- Regression: 하네스 운영 규칙과 Source of Truth 문서는 수정하지 않음.
- Manual verification: Markdown 본문을 읽어 각 템플릿이 한국어 작성 안내와 필수 체크 항목을 포함하는지 확인함.

## Secret / Migration / Env Check

- Secret check: 실제 credential 없음.
- Migration/data change: 없음.
- Env change: 없음.
