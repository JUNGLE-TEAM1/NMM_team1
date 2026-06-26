# Week2 data path scope clarity 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/project-context/asklake-week2-module-plan/ver2/README.md` | 세 데이터 경로와 분석 대표 경로 기준 추가 | 팀원이 `ver2/` 첫 문서에서 Taxi/Kafka를 선택 사항으로 오해하지 않도록 | low |
| `docs/project-context/asklake-week2-module-plan/ver2/team-handoff-summary.md` | 팀 공유 요약에 필수 처리/evidence 경로 기준 반영 | 팀원이 가장 먼저 읽는 문서의 기준 정렬 | low |
| `docs/project-context/asklake-week2-module-plan/ver2/revised-nonoverlap-responsibility.md` | 데이터 경로별 완료 기준과 synthetic 후속 리서치 추가 | M2/M3/M4 책임과 과부하 guardrail을 동시에 명확화 | low |
| `docs/project-context/asklake-week2-module-plan/ver2/main-e2e-path.md` | 분석 대표 path 표현 정리 | Amazon Reviews 분석 대표 경로와 Taxi/Kafka 필수 evidence의 관계를 명확화 | low |
| `docs/project-context/asklake-week2-module-plan/ver2/runner-boundary-decision.md` | runner boundary 표현 정리 | 선택형 adapter와 데이터 경로 필수 여부가 섞여 읽히지 않도록 | low |
| `docs/project-context/asklake-week2-module-plan/ver2/m3-json-main-path-decision.md` | M3의 우선 범위와 synthetic 후속 리서치 분리 | M3가 Taxi/Kafka 범용 ETL까지 떠안지 않도록 | low |
| `docs/project-context/asklake-week2-module-plan/ver2/implementation-transition-plan.md` | Taxi/Kafka 필수 처리/evidence 표현 보강 | 전환 계획의 문구를 최신 기준과 정렬 | low |
| `docs/project-context/asklake-week2-module-plan/ver2/original-vs-revised-flow.md` | 발표 일정 반영 결정 문구 보강 | 원래 분업 대비 ver2 역할 변화가 선택 범위 축소로 읽히지 않도록 | low |
| `docs/project-context/asklake-week2-module-plan/ver2/existing-implementation-anchor.md` | Kafka evidence 보존 의미 보강 | 기존 Kafka demo가 필수 streaming evidence임을 유지 | low |

## Integration Notes / 통합 메모

- Source of Truth interface/contracts는 바꾸지 않는다.
- 이번 변경은 project-context 기준 문서의 scope clarity다.
- Synthetic companion dataset은 후속 리서치이며 이번 PR에서 생성하지 않는다.

## Conflicts To Resolve / 해결할 충돌

- 없음
