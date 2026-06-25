# Big dataset manipulation context alignment 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `README.md` | 제품 설명에 대용량/복합 데이터셋 수집·변환·검산·게시 문맥 추가 | 외부 요약에서 핵심 가치가 드러나게 하기 위해 | 낮음 |
| `docs/01-product-planning.md` | 문제 정의, Target MVP 범위, 제외 범위, 성공 기준 보강 | 제품 목표와 MVP 완료 기준 정렬 | 중간 |
| `docs/02-architecture.md` | Data Plane 책임과 Trusted Dataset 게시 흐름 보강 | 아키텍처가 데이터셋 조작·검산 흐름을 드러내도록 하기 위해 | 중간 |
| `docs/03-interface-reference.md` | 기존 처리 증거 필드 의미 설명 보강 | 새 필드 없이 계약 의미만 명확히 하기 위해 | 낮음 |
| `docs/05-acceptance-scenarios-and-checklist.md` | 처리 증거 acceptance 추가 | 완료 기준에 output/evidence를 연결하기 위해 | 중간 |
| `docs/06-regression-and-failure-scenarios.md` | 처리 증거 없는 완료 표시 failure scenario 추가 | 조작/가공 완료 오판 회귀 방지 | 중간 |
| `docs/07-manual-verification-playbook.md` | schema/transform/output/SQL 검산 확인 단계 추가 | 수동 검증 경로와 수용 기준 연결 | 중간 |
| `docs/08-development-workflow.md` | Target MVP 설명에 조작·가공 증거 문맥 추가 | 다음 Phase 진입 시 완료 기준을 명확히 하기 위해 | 낮음 |
| `docs/reports/project-onboarding-summary.md` | 새 팀원 온보딩 요약에 B2B SaaS, local/container MVP, 대용량/복합 데이터셋 조작 증거 흐름 반영 | 사람이 처음 읽는 요약이 현재 프로젝트 맥락과 어긋나지 않게 하기 위해 | 낮음 |
| `docs/reports/README.md` | Latest Report Index에 B2B SaaS 포지셔닝과 대용량 데이터셋 조작 맥락 report 추가 | 관련 evidence를 빠르게 찾게 하기 위해 | 낮음 |
| `docs/project-context/README.md` | project context 진입점에 현재 제품 방향과 Source of Truth 우선 규칙 보강 | 과거 회의 문서와 현재 제품 기준을 혼동하지 않게 하기 위해 | 낮음 |
| `docs/project-context/asklake-week2-module-plan/README.md` | 2주차 project context를 local-friendly MVP 검증 맥락으로 설명하고 처리 증거 우선 원칙 추가 | 온보딩/분업 문서가 현재 B2B SaaS 및 dataset manipulation 맥락을 따라오게 하기 위해 | 낮음 |

## Integration Notes / 통합 메모

- 새 API/schema 필드는 만들지 않고 기존 evidence 필드의 의미를 보강했다.
- production-grade distributed processing, cloud deploy, Spark/Flink/Trino/Athena 강제 도입은 범위 밖으로 유지했다.

## Conflicts To Resolve / 해결할 충돌

- 없음.
