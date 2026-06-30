# 하네스 CI Fast Path와 Local Complete Gate 보강 계획

## 브랜치

- Branch: `feature/harness-ci-fast-path`
- Workspace: `docs/workflows/feature/harness-ci-fast-path`
- Created: 2026-06-30

## 목표

- 기존 안전장치를 유지하면서 일반 PR의 CI 기본 경로를 빠르게 만든다.
- 하네스 운영에는 작은 변경용 Fast Path와 `local complete` / `PR-ready` 분리를 추가한다.

## 범위

- `.github/workflows/ci.yml`을 fast default + path-filtered heavy gate 구조로 바꾼다.
- `docs/12`, `docs/08`, `docs/10`, `docs/15`, `docs/18`, `docs/system-guardrails.md`, `docs/04`에 필요한 Source of Truth 변경을 반영한다.
- 기존 required check 이름인 `harness`, `container-smoke`, `manifest-smoke`는 유지한다.
- heavy check가 비대상일 때는 job 내부에서 `skipped by path filter`로 통과하도록 설계한다.

## 범위 제외

- GitHub branch protection 또는 repository ruleset 원격 설정 변경.
- PR 생성, push, merge, finalize, deploy.
- 하네스 전체 rewrite.
- migration/schema/security/deploy 검사 약화.

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/04-development-guide.md`
- `docs/08-development-workflow.md`
- `docs/10-next-action-menu.md`
- `docs/12-quality-gates.md`
- `docs/15-context-budget-rule.md`
- `docs/18-harness-regression-policy.md`
- `docs/system-guardrails.md`

## 구현 프롬프트

```text
CI/CD 경량화와 하네스 운영 Fast Path를 통합 보강한다.
검사를 삭제하지 말고, 항상 존재하는 required job 내부에서 path/risk 기반으로 heavy step을 조건부 실행한다.
작은 변경은 local complete로 보류할 수 있게 하되, PR-ready 승격 시 strict/sync 조건을 다시 확인하게 한다.
```

## 검증 프롬프트

```text
workflow YAML과 관련 문서를 검증한다.
하네스 behavior와 CI job 변경이므로 scripts/test-harness.sh, scripts/validate-harness.sh, strict validation을 실행하거나 실패/skip 이유를 quality.md와 report.md에 기록한다.
```

## 내부 단계별 프롬프트

- not needed

## 완료 기준

- [x] CI workflow가 fast default + conditional heavy gate로 분리됨
- [x] Local Complete Gate와 PR-ready 분리가 문서화됨
- [x] Fast Path 조건과 제외 조건이 문서화됨
- [x] 관련 Source of Truth 문서 업데이트
- [x] 검증 명령 실행 및 결과 기록
- [x] Phase report 업데이트
