# Week2 responsibility ver2 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/project-context/asklake-week2-module-plan/README.md` | 상단에 ver2 안내 추가 | 기존 루트 문서를 historical context로 보존하면서 현재 기준 위치를 명확히 하기 위해 | 낮음 |
| `docs/project-context/asklake-week2-module-plan/ver2/` | 새 책임 분리 기준 문서 추가 | M2/M3/M4 Spark/Parquet/Catalog 중복 책임을 줄이는 현재 작업 기준을 분리 보관하기 위해 | 낮음 |
| `docs/03-interface-reference.md` | 후속 PR에서 `RuntimeConfig`, `SparkRunner`, source-specific options, Catalog facts/storage split 반영 여부 검토 | 실제 구현 계약에 영향을 줄 수 있음 | 중간: 실제 code boundary 확정 전 반영하면 drift 위험 |
| `contracts/*.sample.json` | 후속 PR에서 ver2 책임에 맞춘 sample fixture 조정 여부 검토 | M2/M3/M5/M6 consumer contract와 연결됨 | 중간 |
| `docs/05-acceptance-scenarios-and-checklist.md` | 후속 PR에서 ver2 E2E acceptance 추가 여부 검토 | 발표 E2E 완료 기준이 달라질 수 있음 | 중간 |
| `docs/06-regression-and-failure-scenarios.md` | 후속 PR에서 모듈별 Spark 중복 구현 회귀 guard 추가 여부 검토 | M2/M3/M4 중복 구현 방지 | 낮음 |
| `docs/07-manual-verification-playbook.md` | 후속 PR에서 Runtime/Spark smoke와 Catalog handoff 검증 절차 추가 여부 검토 | 실제 수동 검증 흐름과 연결 | 중간 |

## Integration Notes / 통합 메모

- 이 PR에서는 Project Context와 workspace evidence만 바꾼다.
- Source of Truth 레이어와 `contracts/*.sample.json` 변경은 실제 implementation boundary가 확정된 후 별도 PR에서 처리한다.

## Conflicts To Resolve / 해결할 충돌

- 기존 `plan.md`, `decisions.md`, `meeting-summary.md`는 초기 회의 맥락으로 보존한다. ver2와 표현이 다르면 `ver2/README.md`의 현재 기준 안내를 따른다.
