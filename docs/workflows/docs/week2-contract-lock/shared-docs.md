# Week2 contract lock 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `contracts/runtime_config.sample.json` | M2 runtime fixture 추가 | Spark/local/MinIO/Parquet/SQL runtime boundary를 병렬 구현 전 공유 | 낮음 |
| `contracts/transform_spec.sample.json` | M3 transform intent fixture 추가 | M3가 transform semantics를 제공하되 runner/catalog를 소유하지 않게 분리 | 낮음 |
| `contracts/kafka_topic_contract.sample.json` | M4 raw event/evidence fixture 추가 | Kafka를 main path blocker가 아닌 evidence handoff로 고정 | 낮음 |
| `contracts/execution_result.sample.json` | `duration_ms` 처리 증거 추가 | runner 결과와 daily smoke evidence의 duration 의미를 계약에 반영 | 낮음 |
| `docs/03-interface-reference.md` | Week 2 계약 잠금안과 route/adapter/metric semantics 정렬 | Source of Truth Interface 계층 업데이트 | 중간 |
| `docs/05-acceptance-scenarios-and-checklist.md` | Week 2 acceptance fixture 목록 갱신 | 수용 기준이 새 fixture 세트를 확인하도록 정렬 | 낮음 |
| `docs/06-regression-and-failure-scenarios.md` | Week 2 fixture guard에 새 계약 추가 | 병렬 구현이 새 계약 없이 시작되는 회귀 방지 | 낮음 |
| `docs/07-manual-verification-playbook.md` | 수동 점검 fixture 목록과 경계 설명 갱신 | 사람이 검증해야 할 계약 파일과 역할을 명확화 | 낮음 |

## Integration Notes / 통합 메모

- `docs/02` 구조 자체는 변경하지 않는다. 이번 작업은 이미 ver2 문서와 runner boundary에 있던 책임을 Interface/contract artifact로 잠근다.
- 실제 구현 branch는 `contracts/*.sample.json`을 먼저 읽고, TODO 값은 담당 모듈의 smoke evidence 뒤에 교체한다.

## Conflicts To Resolve / 해결할 충돌

- 없음.
