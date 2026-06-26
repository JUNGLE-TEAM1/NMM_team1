# M5 Airflow Adapter shared docs

## Proposed Source Of Truth Changes

| File | Proposed change | Reason | Priority |
| --- | --- | --- | --- |
| n/a | 현재 없음 | 이번 slice는 기존 Airflow/local runner 책임 경계 안에서 adapter 구현만 보강한다. | 낮음 |

## Deferred Source Of Truth Considerations

| File | Deferred item | Revisit trigger |
| --- | --- | --- |
| `docs/03-interface-reference.md` | Airflow DAG result payload contract | 실제 DAG 또는 runtime smoke를 구현할 때 |
| `contracts/execution_result.sample.json` | Airflow success evidence 예시 보강 | 실제 Airflow result payload가 확정될 때 |

## 읽은 주요 문서

- `AGENTS.md`
- `docs/00-layer-map.md`
- `docs/11-git-sync-policy.md`
- `docs/project-context/asklake-week2-module-plan/ver2/revised-nonoverlap-responsibility.md`
- `docs/project-context/asklake-week2-module-plan/ver2/runner-boundary-decision.md`

## 직접 관련 기준

- M5는 Airflow Adapter와 local runner fallback을 소유한다.
- M5는 실행 상태, log, retry, `ExecutionResult`를 표준화한다.
- Airflow 실패 또는 결과 부족은 local runner fallback으로 이어져야 한다.
