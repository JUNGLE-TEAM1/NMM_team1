# B2B SaaS positioning alignment 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `README.md` | 제품 한 줄 설명을 `B2B SaaS Trusted Data & AI Platform`으로 정렬하고 MVP 실행 환경 문장 추가 | 외부 요약에서 제품 방향과 MVP 검증 환경을 분리하기 위해 | 중간 |
| `docs/01-product-planning.md` | 한 줄 설명, Deployment, 제외 범위, R7 packaging 문구 정렬 | Product Source of Truth와 README drift 방지 | 중간 |
| `docs/02-architecture.md` | Kubernetes/Helm 목적을 dev-lite packaging 후보로 정리 | 아키텍처 packaging 표현이 Docker/Compose local/container 실행과 겹치지 않게 하기 위해 | 낮음 |
| `docs/08-development-workflow.md` | R7 planning alias 문구 정렬 | Workflow queue와 제품 문맥 정렬 | 낮음 |

## Integration Notes / 통합 메모

- `docs/03-interface-reference.md`, `docs/05`, `docs/06`, `docs/07`은 runtime/interface/acceptance/manual verification 의미 변경이 없어 수정하지 않았다.

## Conflicts To Resolve / 해결할 충돌

- 없음.
