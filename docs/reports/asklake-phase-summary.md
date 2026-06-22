# AskLake 진행 Phase 요약

작성일: 2026-06-22

이 문서는 팀원이 현재 AskLake가 어디까지 진행됐는지 빠르게 파악하기 위한 요약이다.
상세 증거는 각 branch workspace와 Phase report를 확인한다.

## 한 줄 상태

AskLake는 XFlow를 참고한 MVP/장기 로드맵을 정리했고, 제품 기능 개발 전에 필요한 CI/CD, Docker, Kubernetes, AWS 준비 기반과 하네스 자동화 규칙을 먼저 구축했다.
현재 실제 AWS 리소스는 만들지 않았고, `feature/aws-bootstrap-readiness` 브랜치는 PR 생성 전 상태다.

## 진행된 Phase

| Phase | Branch / Workspace | 상태 | 핵심 결과 |
| --- | --- | --- | --- |
| MVP 로드맵 | `feature/mvp-roadmap` | merged / issue closed | XFlow를 read-only 참고로 분석해 AskLake MVP, M0~M5 MVP milestone, M6~M15 장기 milestone 정리 |
| 인프라 foundation | `feature/infrastructure-foundation` | merged / issue closed | CI workflow, Docker smoke image, Kubernetes base manifest, AWS approval checklist 추가 |
| PR/Issue 자동화 | `feature/pr-issue-automation` | merged / issue closed | branch 생성 시 issue 기본 생성, PR closing keyword, branch switch checkpoint, 재발 방지 규칙 승인 절차 추가 |
| PR 최종화 guard | `feature/sync-pr-finalization-guard` | merged / issue closed | PR 전 `sync.md` 검사, merge 후 PR/issue close 최종화, 완료 Phase 체크 표시와 status 추천 보강 |
| AWS bootstrap readiness | `feature/aws-bootstrap-readiness` | complete / pushed / PR not created | AWS profile 확인, OIDC/ECR/EKS bootstrap 준비물, manual dev deploy workflow, 완료 후 선택지 handoff 규칙 추가 |

## 무엇이 정해졌나

- 프로젝트 이름은 AskLake다.
- XFlow는 구현 복사 대상이 아니라 read-only 참고 자료다.
- MVP는 인프라 선행 방식으로 진행한다.
- 제품 기능 개발 전 CI/CD, Docker, Kubernetes, AWS approval gate를 먼저 마련한다.
- 실제 AWS 비용 리소스 생성, deploy, merge, PR 생성, push는 사람의 명시 승인 없이는 실행하지 않는다.
- branch workspace 생성 시 GitHub issue 생성은 팀 기본 규칙이다.
- 예외적으로 issue를 만들지 않을 때만 `--no-issue`를 명시하고 이유를 기록한다.
- branch 이동 중 dirty worktree가 있으면 현재 branch에 checkpoint commit을 만든다.
- workspace가 `complete`이고 PR checklist가 ready이면 AI는 PR만 묻지 않고 다음 선택지를 제시한다:
  1. PR 진행
  2. 추가 보강
  3. 다음 Phase
  4. 보류
  5. 외부 실행 승인

## 인프라 상태

현재 repo에 준비된 인프라 산출물:

- `.github/workflows/ci.yml`: harness, container smoke, manifest smoke 검증
- `.github/workflows/deploy-dev.yml`: manual approval + dry-run 기본 dev deploy workflow
- `infra/docker/backend.Dockerfile`: backend smoke image
- `infra/docker/frontend.Dockerfile`: frontend smoke image
- `infra/k8s/base/`: namespace, deployment, service, kustomization
- `infra/aws/approval-checklist.md`: 실제 AWS 리소스 생성 전 승인 체크리스트
- `infra/aws/readiness.md`: AWS bootstrap 실행 순서
- `scripts/aws/check-readiness.sh`: AWS CLI/profile/tool readiness 확인
- `scripts/aws/bootstrap-ecr.sh`: ECR repository 생성 plan/execute 스크립트
- `scripts/aws/bootstrap-eks.sh`: EKS 생성 plan/execute 스크립트
- `scripts/aws/render-github-oidc-trust-policy.sh`: GitHub OIDC trust policy 렌더링

현재 AWS 상태:

- AWS CLI는 설치되어 있다.
- `AWS_PROFILE=asklake` 기준 identity 확인이 통과했다.
- 실제 ECR/EKS/AWS 리소스는 아직 만들지 않았다.
- ECR/EKS 생성 스크립트는 기본 plan mode이며, 실제 생성에는 `--execute`와 `ASKLAKE_AWS_APPROVED=APPROVED`가 필요하다.

## 하네스와 협업 규칙 상태

추가된 핵심 자동화:

- `scripts/start-workflow.sh`: branch workspace 생성, issue 기본 생성, dirty branch switch checkpoint
- `scripts/status-workflow.sh`: workspace 상태, PR readiness, 다음 선택지 안내
- `scripts/prepare-pr.sh`: PR body/closing keyword, push/PR 생성, PR sync check, issue close/finalize 지원
- `scripts/harness-flow-check.sh`: shell syntax, validation, strict validation, workspace status 일괄 검사
- `scripts/validate-harness.sh`: 문서/스크립트/워크스페이스 consistency 검증

중요한 팀 규칙:

- 사람이 승인하지 않으면 push, PR 생성, merge, deploy, AWS resource 생성은 실행하지 않는다.
- 하네스 규칙을 새로 추가할 때는 문제 해결 후 바로 적용하지 않고, 먼저 사람에게 규칙 추가 여부를 묻는다.
- PR 전에는 `scripts/prepare-pr.sh --check-pr-sync <workspace>`를 실행한다.
- PR merge 후에는 `scripts/prepare-pr.sh --finalize <workspace>`로 merge 상태와 issue close 상태를 기록한다.

## 검증된 것

최근 Phase들에서 확인한 주요 검증:

- `scripts/validate-harness.sh`
- `scripts/validate-harness.sh --strict`
- `bash -n scripts/*.sh scripts/aws/*.sh`
- Docker backend/frontend smoke image build
- Kubernetes manifest shape/YAML parse
- AWS OIDC JSON render/parse
- AWS readiness check with `AWS_PROFILE=asklake`
- PR sync preflight
- GitHub Actions CI for merged PRs

## 아직 남은 일

바로 다음 선택지는 아래 중 하나다.

1. `feature/aws-bootstrap-readiness` PR 생성 후 main에 반영
2. 실제 AWS resource 생성 승인 checklist 진행
3. 비용을 줄이기 위해 EKS 대신 ECS/Fargate 또는 App Runner target 비교 Phase 진행
4. 제품 기능 첫 Phase 시작: container app skeleton 또는 source catalog 쪽

현재 비용 관점에서는 EKS를 24시간 켜두면 월 약 95~105달러 수준으로 예상된다.
MVP 비용을 줄이려면 EKS를 바로 상시 운영하기보다 App Runner/ECS/Fargate 대안을 검토하는 것이 좋다.

## 참고 위치

- MVP 로드맵 report: `docs/reports/phase-1-mvp-roadmap.md`
- 인프라 foundation report: `docs/reports/phase-2-infrastructure-foundation.md`
- AWS 비용 추정: `docs/reports/aws-cost-estimate.md`
- AWS readiness workspace: `docs/workflows/feature/aws-bootstrap-readiness/`
- 하네스 workflow: `docs/08-development-workflow.md`
- Git sync 정책: `docs/11-git-sync-policy.md`
- 사람 명령 흐름: `docs/13-human-command-flow.md`
