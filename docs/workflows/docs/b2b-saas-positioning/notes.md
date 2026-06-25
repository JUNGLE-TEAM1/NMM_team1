# B2B SaaS positioning alignment 노트

## 진행 메모

- README의 `self-hosted` 표현은 제품 정체성으로 읽히므로 `B2B SaaS`로 정렬했다.
- Target MVP가 로컬에서 실행된다는 사실은 SaaS 제품 방향과 충돌하지 않으므로, `local/container` 단일 Demo Tenant 검증으로 별도 표현했다.

## 결정

- production-grade multi-tenant SaaS 운영은 이번 MVP 범위 밖으로 유지한다.
- R7 packaging은 self-hosted가 아니라 local/container 또는 dev-lite packaging 검증으로 표현한다.
- `docs/02`에서는 Docker/Compose가 local/container 실행을 담당하므로 Kubernetes/Helm 목적은 `dev-lite packaging 후보`로 좁혀 표현했다.

## 열린 질문

- 실제 cloud deploy와 상용 SaaS 운영 시점은 별도 승인과 비용 검토가 필요하다.
- 과거 `docs/reports/`와 기존 branch workspace의 self-hosted/Kubernetes 표현은 historical evidence로 남기고, 현재 Source of Truth와 충돌하는 실행 기준이 아닌 한 소급 수정하지 않는다.

## 링크 / 증거

- `rg -n "self-hosted|self hosted|multi-tenant SaaS 운영|B2B SaaS" README.md docs/...`
- `rg -n "self-hosted|self hosted|B2B SaaS|SaaS|multi-tenant|멀티테넌|local/container|dev-lite|cloud deploy|cloud resource|Kubernetes|Helm|Packaging|배포" README.md docs`
