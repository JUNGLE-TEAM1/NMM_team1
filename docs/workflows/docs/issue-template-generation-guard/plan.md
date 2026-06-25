# 이슈 템플릿 생성 경로 보강 계획

## 브랜치

- Branch: `docs/issue-template-generation-guard`
- Workspace: `docs/workflows/docs/issue-template-generation-guard`
- Created: 2026-06-25

## 목표

- GitHub UI 템플릿을 타지 않는 `scripts/start-workflow.sh` issue 자동 생성 경로도 한국어 협업 산출물 규칙을 따르게 한다.
- 자동 생성 issue의 제목 prefix, body section, label, body-file 전달 방식이 회귀하지 않도록 harness regression과 validation guard를 추가한다.
- PR body 초안도 사람이 diff를 보기 전에 구체 작업, 검증 결과, 남은 일, 위험을 직관적으로 이해할 수 있게 보강한다.

## 범위

- `scripts/start-workflow.sh` issue 생성 title/body/label 보강
- `.github/pull_request_template.md`와 `scripts/prepare-pr.sh` PR body 초안 보강
- `scripts/test-harness.sh` fake `gh issue create` fixture 보강
- `scripts/validate-harness.sh` static guard 추가
- 관련 Source of Truth 문서 최소 반영: `docs/04`, `docs/11`, `docs/13`
- workspace evidence와 report 작성

## 범위 제외

- 기존 remote issue/PR 수정, close, reopen, label 변경
- 실제 GitHub issue/PR 생성
- 제품 기능/API/schema/data 변경
- 라이선스 문구 변경

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/04-development-guide.md`
- `docs/10-next-action-menu.md`
- `docs/11-git-sync-policy.md`
- `docs/12-quality-gates.md`
- `docs/13-human-command-flow.md`
- `docs/15-context-budget-rule.md`
- `docs/18-harness-regression-policy.md`

## 구현 프롬프트

```text
GitHub issue/PR 생성 경로가 한국어 템플릿 규칙을 일관되게 따르도록 하네스를 보강한다.
기존 remote issue/PR은 수정하지 않고, `scripts/start-workflow.sh` 자동 issue 생성 경로와 harness regression/static validation만 수정한다.
```

## 검증 프롬프트

```text
`scripts/start-workflow.sh`, `scripts/test-harness.sh`, `scripts/validate-harness.sh` 변경을 검증하고 `quality.md`, workspace report, `docs/reports/` report에 증거를 기록한다.
```

## 내부 단계별 프롬프트

- not needed

## 완료 기준

- [x] 범위 완료
- [x] TDD 상태 기록
- [x] Acceptance 확인
- [x] Regression/failure scenario 확인
- [x] Manual verification 기록
- [x] CI/check 명령과 결과 기록
- [x] Report 업데이트
