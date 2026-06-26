# M2 Amazon Reviews JSONL runner evidence 공유 문서 변경 제안

branch 작업이 공유 Source of Truth 문서를 바꿔야 할 때 이 파일에 제안한다.
integration branch는 branch 작업을 합치기 전에 이 파일을 읽는다.

## Proposed Source Of Truth Changes / Source of Truth 변경 제안

| File | Proposed Change | Reason | Merge Risk |
| --- | --- | --- | --- |
| `docs/02-architecture.md` | 변경 없음 | 이번 작업은 새 architecture가 아니라 기존 M2 runner boundary의 evidence script다. | 낮음 |
| `docs/03-interface-reference.md` | 변경 없음 | `RuntimeConfig`와 `Week2RunnerResult`의 기존 shape를 그대로 사용한다. | 낮음 |
| `docs/05-acceptance-scenarios-and-checklist.md` | 변경 없음 | row count, bytes, duration, output path evidence 기준은 이미 존재한다. | 낮음 |
| `docs/06-regression-and-failure-scenarios.md` | 변경 없음 | 처리 증거 없는 완료 금지 기준을 그대로 만족시키는 작업이다. | 낮음 |
| `docs/07-manual-verification-playbook.md` | 변경 없음 | output path, row count, bytes, duration 확인 기준을 그대로 사용한다. | 낮음 |

## Integration Notes / 통합 메모

- 후속 M5 integration은 이 script를 직접 호출하기보다 `Week2SparkRunner().run(RuntimeConfig(...))` 경계를 재사용하는 편이 맞다.
- 후속 SQL smoke는 이 script가 만든 Parquet output path를 입력으로 삼을 수 있다.

## Conflicts To Resolve / 해결할 충돌

- 없음. 이번 branch는 공유 계약 파일을 바꾸지 않는다.
