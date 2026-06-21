# AWS bootstrap readiness 계획

## 브랜치

- Branch: `feature/aws-bootstrap-readiness`
- Workspace: `docs/workflows/feature/aws-bootstrap-readiness`
- Created: 2026-06-22

## 목표

- 실제 AWS resource를 아직 만들지 않고, 승인 직후 바로 AWS 연결/ECR/EKS bootstrap/deploy dry-run을 실행할 수 있는 준비물을 만든다.

## 범위

- AWS bootstrap 환경 변수 예시와 실행 순서를 문서화한다.
- GitHub Actions OIDC trust policy, ECR lifecycle policy, EKS config 후보를 추가한다.
- 로컬 readiness check, OIDC policy render, ECR bootstrap, EKS bootstrap 스크립트를 추가한다.
- dev deploy workflow를 manual dispatch + approval + dry-run 기본값으로 추가한다.
- 실제 AWS 계정 인증, 비용 resource 생성, IAM 변경은 실행하지 않는다.

## 범위 제외

- 실제 AWS resource 생성.
- 실제 IAM role/policy 생성 또는 변경.
- 실제 ECR push, EKS cluster 생성, Kubernetes deploy.
- ECS/Fargate, App Runner, EC2 target 구현.
- 제품 runtime image 교체.

## Source of Truth 문맥

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/08-development-workflow.md`
- `docs/12-quality-gates.md`
- `docs/14-decision-option-brief.md`
- `docs/15-context-budget-rule.md`

## 구현 프롬프트

```text
@AGENTS.md @docs/00-layer-map.md @docs/08-development-workflow.md @docs/12-quality-gates.md @docs/14-decision-option-brief.md @docs/15-context-budget-rule.md

이 branch workspace에 적힌 작업만 구현한다.
기본은 Lite Read로 시작하고, 계약/데이터/보안/sync/quality/integration/decision 위험 신호가 있을 때만 문맥을 확장한다.
core logic, regression 위험, integration contract, bug fix를 바꾸는 경우 TDD 적용 여부를 먼저 기록한다.
고영향 선택은 구현 전에 Decision Option Brief로 정리한다.
이 plan.md를 업데이트하지 않고 범위를 확장하지 않는다.
```

## 검증 프롬프트

```text
@AGENTS.md @docs/05-acceptance-scenarios-and-checklist.md @docs/06-regression-and-failure-scenarios.md @docs/07-manual-verification-playbook.md @docs/12-quality-gates.md

branch 작업을 검증하고 `quality.md`와 workspace report에 증거를 기록한다.
```

## 완료 기준

- [x] AWS bootstrap readiness 문서와 env 예시가 있다.
- [x] GitHub OIDC, ECR, EKS 준비 템플릿이 있다.
- [x] 승인 전에는 AWS resource를 만들지 않는 bootstrap 스크립트가 있다.
- [x] dev deploy workflow가 manual approval/dry-run gate를 가진다.
- [x] TDD 상태 기록
- [x] Acceptance 확인
- [x] Regression/failure scenario 확인
- [x] Manual verification 기록
- [x] CI/check 명령과 결과 기록
- [x] Report 업데이트
