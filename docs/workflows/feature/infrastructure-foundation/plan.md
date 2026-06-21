# Infrastructure foundation 계획

## 브랜치

- Branch: `feature/infrastructure-foundation`
- Workspace: `docs/workflows/feature/infrastructure-foundation`
- Created: 2026-06-22

## 목표

- 제품 기능 구현 전에 CI/CD, Docker, Kubernetes, AWS foundation과 approval gate를 확정한다.

## 범위

- GitHub Actions CI workflow 후보를 만든다.
- 실제 AWS deploy 전 approval gate를 포함한 deploy example workflow를 만든다.
- backend/frontend smoke image Dockerfile을 만든다.
- Kubernetes base manifest 후보를 만든다.
- AWS resource 생성 전 비용/권한/rollback 승인 체크리스트를 만든다.
- `.env.example`로 secret이 아닌 환경 변수 이름만 기록한다.

## 범위 제외

- 실제 제품 기능 구현.
- 실제 AWS resource 생성.
- 실제 secret 값 추가.
- production-grade autoscaling, full observability, multi-AZ 구성.

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/08-development-workflow.md`
- `docs/12-quality-gates.md`
- `docs/14-decision-option-brief.md`
- `docs/15-context-budget-rule.md`
- `docs/02-architecture.md`
- `docs/04-development-guide.md`
- `docs/05-acceptance-scenarios-and-checklist.md`
- `docs/06-regression-and-failure-scenarios.md`
- `docs/08-development-workflow.md`

## 구현 프롬프트

```text
@AGENTS.md @docs/00-layer-map.md @docs/08-development-workflow.md @docs/12-quality-gates.md @docs/14-decision-option-brief.md @docs/15-context-budget-rule.md

제품 기능 구현 전에 CI/CD, Docker, Kubernetes, AWS foundation을 준비한다.
실제 AWS resource 생성, 비용 발생, 권한 변경은 하지 않는다.
secret 값은 commit하지 않는다.
smoke image, manifest 후보, approval checklist, 검증 workflow를 만든다.
```

## 검증 프롬프트

```text
@AGENTS.md @docs/05-acceptance-scenarios-and-checklist.md @docs/06-regression-and-failure-scenarios.md @docs/07-manual-verification-playbook.md @docs/12-quality-gates.md

Docker smoke image build, Kubernetes manifest shape check, shell syntax, harness validation을 실행한다.
실제 AWS action은 approval 전이므로 생략하고 그 이유를 `quality.md`와 report에 기록한다.
```

## 완료 기준

- [x] 범위 완료
- [x] TDD 상태 기록
- [x] Acceptance 확인
- [x] Regression/failure scenario 확인
- [x] Manual verification 기록
- [x] CI/check 명령과 결과 기록
- [x] Report 업데이트
