# M6 SQL-first 2주차 빌드업 계획 보강 공유 문서

| 문서 | 변경 | 이유 | 영향도 |
| --- | --- | --- | --- |
| `docs/project-context/asklake-week2-module-plan/ver2/README.md` | M6 SQL-first 빌드업과 M5 Catalog read-only 경계 추가 | ver2 첫 문서에서 M6 다음 우선순위를 바로 알 수 있게 함 | 낮음 |
| `docs/project-context/asklake-week2-module-plan/ver2/team-handoff-summary.md` | 팀 요약, M6 행, 병렬 순서에 SQL MVP 우선순위 반영 | 팀원이 RAG/LLM을 2주차 구현 범위로 오해하지 않게 함 | 중간 |
| `docs/project-context/asklake-week2-module-plan/ver2/main-e2e-path.md` | 발표 성공 조건에 SQL MVP 실행 기준 추가 | 대표 E2E의 M6 완료 기준을 실제 SQL 조회로 구체화 | 중간 |
| `docs/project-context/asklake-week2-module-plan/ver2/revised-nonoverlap-responsibility.md` | M6 하는 것/하지 않는 것/빌드업 순서 보강 | M1~M5 소유권 충돌 방지 | 중간 |
| `docs/project-context/asklake-week2-module-plan/ver2/implementation-transition-plan.md` | 전환 순서의 M6 단계명을 SQL-first로 정렬 | 기존 skeleton 위 adapter-first 전환과 맞춤 | 낮음 |

## Integration Notes / 통합 메모

- 이번 변경은 project-context ver2 계획 문서 보강이다.
- `docs/03-interface-reference.md`에는 이미 Week2 SQL adapter 경계와 `CatalogMetadata.s3_uri or local path`가 있으므로 변경하지 않았다.
- `contracts/*.sample.json`과 backend/frontend code는 변경하지 않았다.

## Conflicts To Resolve / 해결할 충돌

- 없음.
