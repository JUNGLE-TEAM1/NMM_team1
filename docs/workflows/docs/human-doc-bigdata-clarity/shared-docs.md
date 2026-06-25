# Human-facing big dataset clarity 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `README.md` | Target MVP 첫 문장과 핵심 질문에 대용량/복합 데이터셋을 신뢰 가능한 분석 자산으로 만드는 흐름을 명시 | 외부 요약에서 제품 방향이 바로 보이게 하기 위해 | 낮음 |
| `docs/reports/project-onboarding-summary.md` | 온보딩 첫 설명과 Target MVP 해설을 같은 톤으로 보강 | 새 팀원이 big dataset manipulation 맥락을 놓치지 않게 하기 위해 | 낮음 |
| `docs/project-context/README.md` | project context 진입점에 처리 증거와 신뢰 루프 연결을 더 명확히 설명 | 과거 회의 문서와 현재 제품 기준을 혼동하지 않게 하기 위해 | 낮음 |
| `docs/project-context/asklake-week2-module-plan/README.md` | 2주차 분업 문맥을 수집·스키마화·변환·검산·게시 검증 후보로 설명 | MinIO/DuckDB/Airflow 선택을 제품 정체성으로 오해하지 않게 하기 위해 | 낮음 |
| `docs/reports/README.md` | 대용량 데이터셋 조작 report 설명 문구 보강 | evidence index에서도 현재 제품 방향이 보이게 하기 위해 | 낮음 |

## Integration Notes / 통합 메모

- 새 API/schema/fixture contract는 만들지 않았다.
- `local/container` 단일 Demo Tenant 범위를 유지했다.
- production-grade distributed processing, cloud deploy, Trino/Athena/AWS 도입은 범위 밖으로 유지했다.

## Conflicts To Resolve / 해결할 충돌

- 없음.
